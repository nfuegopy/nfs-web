#!/usr/bin/env python3
"""Puente entre la API web y NFS-Online-Server.

Lee un objeto JSON por stdin y responde un objeto JSON por stdout.
Las escrituras (crear cuenta) y la verificación de contraseñas usan la lógica
del propio servidor; las estadísticas se leen con una conexión de solo lectura.
Nunca registra contraseñas ni hashes.
"""
import hashlib
import hmac
import json
import os
import re
import sqlite3
import sys
import time
from pathlib import Path

NFS_ROOT = Path(os.environ.get("NFS_SERVER_PATH", "/opt/NFS-Online-Server"))
CONFIG_FILE = NFS_ROOT / "config" / "server.toml"
sys.path.insert(0, str(NFS_ROOT / "server"))

from common.accounts import SQLiteAccountDatabase  # noqa: E402
from classic.accounts.sqlite_backend import SQLiteCredentialStore  # noqa: E402
from classic.core.config import ServerSettings  # noqa: E402

MAX_INPUT = 16_384

GAMES = {"underground2": "Underground 2", "mostwanted": "Most Wanted", "carbon": "Carbon"}
CATEGORIES = {
    "underground2": {0: "Circuito", 1: "Sprint", 2: "Drag", 3: "Drift", 4: "Street X", 5: "URL"},
}


class BridgeError(Exception):
    def __init__(self, code: str, message: str, **extra):
        super().__init__(message)
        self.code = code
        self.message = message
        self.extra = extra


def settings() -> ServerSettings:
    loaded = ServerSettings.load(str(CONFIG_FILE))
    if loaded.account_db_path is None or loaded.account_files_path is None:
        raise BridgeError("NFS_SERVER_ERROR", "La configuración de cuentas del servidor está incompleta")
    return loaded


def store() -> SQLiteCredentialStore:
    s = settings()
    database = SQLiteAccountDatabase(
        s.account_db_path,
        s.account_files_path,
        failure_limit=s.auth_failure_limit,
        lockout_seconds=s.auth_lockout_seconds,
        busy_timeout_ms=s.account_sqlite_busy_timeout_ms,
    )
    return SQLiteCredentialStore(database)


def readonly() -> sqlite3.Connection:
    path = Path(settings().account_db_path).resolve()
    conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True, timeout=5)
    conn.row_factory = sqlite3.Row
    return conn


# ---------------------------------------------------------------- validación
# Todas las consultas SQL usan parámetros (?): los datos nunca se concatenan en el SQL.
# Además se valida cada campo aquí, aunque la API ya lo haya hecho.

USERNAME_RE = re.compile(r"[A-Za-z0-9_-]{3,20}")
LOGIN_RE = re.compile(r"[A-Za-z0-9_.@+-]{1,64}")
PERSONA_RE = re.compile(r"\w[\w .-]{1,18}\w")
EMAIL_RE = re.compile(r"[^@\s]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,24}")
CONTROL_RE = re.compile(r"[\x00-\x1f\x7f]")


def field(payload: dict, key: str, pattern: re.Pattern, code: str, message: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not pattern.fullmatch(value.strip()):
        raise BridgeError(code, message)
    return value.strip()


def password_field(payload: dict, key: str = "password") -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not 8 <= len(value) <= 64 or CONTROL_RE.search(value):
        raise BridgeError("INVALID_PASSWORD", "La contraseña debe tener entre 8 y 64 caracteres")
    return value


def login_field(payload: dict) -> str:
    return field(payload, "username", LOGIN_RE, "INVALID_CREDENTIALS", "Usuario o contraseña incorrectos")


def category_name(game: str, category) -> str:
    return CATEGORIES.get(game, {}).get(category, f"Categoría {category}")


def fingerprint(password_hash: str) -> str:
    """Huella del hash actual: invalida los enlaces de recuperación una vez usada la contraseña nueva."""
    return hashlib.sha256(password_hash.encode()).hexdigest()[:32]


def check_login(username: str, password: str):
    result = store().authenticate(username, password)
    if result.accepted:
        return result
    if result.retry_after_seconds:
        raise BridgeError(
            "ACCOUNT_LOCKED",
            "Demasiados intentos fallidos. Probá de nuevo en unos minutos",
            retryAfter=result.retry_after_seconds,
        )
    reason = (result.reason or "").lower()
    if "ban" in reason:
        raise BridgeError("ACCOUNT_BANNED", "Esta cuenta está suspendida")
    if "disabled" in reason:
        raise BridgeError("ACCOUNT_DISABLED", "Esta cuenta está deshabilitada")
    raise BridgeError("INVALID_CREDENTIALS", "Usuario o contraseña incorrectos")


# ---------------------------------------------------------------- acciones


def create_account(payload: dict) -> dict:
    username = field(payload, "username", USERNAME_RE, "INVALID_USERNAME",
                     "El usuario debe tener de 3 a 20 letras, números, guiones o guiones bajos")
    persona = field(payload, "persona", PERSONA_RE, "INVALID_PERSONA",
                    "El nombre de piloto debe tener de 3 a 20 letras, números, espacios, puntos o guiones")
    email = field(payload, "email", EMAIL_RE, "INVALID_EMAIL", "El email no es válido").lower()
    password = password_field(payload)

    credentials = store()
    if credentials.is_email_blocked(email):
        raise BridgeError("EMAIL_BLOCKED", "Ese email no puede usarse para registrarse")
    try:
        account = credentials.create_account(username, password, persona=persona, email=email)
    except (ValueError, sqlite3.IntegrityError) as exc:
        message = str(exc).lower()
        if "persona" in message and ("exists" in message or "owned" in message):
            raise BridgeError("PERSONA_EXISTS", "Ese nombre de piloto ya está en uso")
        if "email" in message and ("exists" in message or "unique" in message):
            raise BridgeError("EMAIL_EXISTS", "Ese email ya está registrado")
        if "email" in message:
            raise BridgeError("INVALID_EMAIL", "El email no es válido")
        if "exists" in message or "unique" in message:
            raise BridgeError("ACCOUNT_EXISTS", "Ese nombre de usuario ya está en uso")
        raise BridgeError("VALIDATION_ERROR", "Los datos no son válidos")
    return {"account": {"username": username, "persona": account.persona or persona, "email": email}}


def authenticate(payload: dict) -> dict:
    username = login_field(payload)
    password = payload.get("password")
    if not isinstance(password, str) or not 1 <= len(password) <= 128:
        raise BridgeError("INVALID_CREDENTIALS", "Usuario o contraseña incorrectos")
    result = check_login(username, password)
    return {"account": {"username": result.account_name, "persona": result.persona}}


def change_password(payload: dict) -> dict:
    username = login_field(payload)
    current = payload.get("currentPassword")
    if not isinstance(current, str) or not 1 <= len(current) <= 128:
        raise BridgeError("WRONG_PASSWORD", "La contraseña actual no es correcta")
    new_password = password_field(payload, "newPassword")
    try:
        result = check_login(username, current)
    except BridgeError as exc:
        if exc.code == "INVALID_CREDENTIALS":
            raise BridgeError("WRONG_PASSWORD", "La contraseña actual no es correcta")
        raise
    store().set_password(result.account_name, new_password)
    return {}


def password_reset_target(payload: dict) -> dict:
    """Busca la cuenta de un email para enviarle el enlace de recuperación."""
    email = field(payload, "email", EMAIL_RE, "INVALID_EMAIL", "El email no es válido").lower()
    with readonly() as conn:
        row = conn.execute(
            "SELECT account_name, password_hash FROM accounts "
            "WHERE (email_key = ? OR lower(email) = ?) AND banned = 0 AND enabled = 1 LIMIT 1",
            (email, email),
        ).fetchone()
    if row is None:
        return {"account": None}
    return {"account": {"username": row["account_name"], "fingerprint": fingerprint(row["password_hash"])}}


def reset_password(payload: dict) -> dict:
    username = login_field(payload)
    expected = payload.get("fingerprint")
    new_password = password_field(payload, "newPassword")
    with readonly() as conn:
        row = conn.execute(
            "SELECT account_name, password_hash FROM accounts WHERE account_name = ? AND banned = 0 LIMIT 1",
            (username,),
        ).fetchone()
    if row is None or not isinstance(expected, str) or not hmac.compare_digest(fingerprint(row["password_hash"]), expected):
        raise BridgeError("INVALID_RESET_TOKEN", "El enlace ya se usó o venció. Pedí uno nuevo")
    store().set_password(row["account_name"], new_password)
    return {}


def profile(payload: dict) -> dict:
    username = login_field(payload)
    with readonly() as conn:
        account = conn.execute(
            "SELECT account_id, account_name, email, banned, created_at FROM accounts "
            "WHERE account_name = ? OR account_name_key = lower(?) LIMIT 1",
            (username, username),
        ).fetchone()
        if account is None:
            raise BridgeError("ACCOUNT_NOT_FOUND", "La cuenta no existe")

        personas = conn.execute(
            "SELECT persona_id, display_name, is_primary, created_at FROM personas "
            "WHERE account_id = ? ORDER BY is_primary DESC, created_at",
            (account["account_id"],),
        ).fetchall()
        ids = [p["persona_id"] for p in personas]
        marks = ",".join("?" * len(ids)) or "NULL"

        stats = conn.execute(
            f"SELECT persona_id, game, category, wins, losses, disconnects, skill, opponents_rank "
            f"FROM game_player_stats WHERE persona_id IN ({marks}) ORDER BY game, category",
            ids,
        ).fetchall()
        races = conn.execute(
            f"SELECT r.persona_id, g.game, g.category, g.track, g.laps, g.ranked, r.outcome, r.place, "
            f"r.elapsed_ms, r.best_lap_ms, r.best_drift, r.disconnected, r.reported_at "
            f"FROM game_race_results r JOIN game_races g ON g.race_id = r.race_id "
            f"WHERE r.persona_id IN ({marks}) ORDER BY r.reported_at DESC LIMIT 20",
            ids,
        ).fetchall()
        online = conn.execute(
            "SELECT game, connected_at FROM active_sessions WHERE account_id = ? AND expires_at > ?",
            (account["account_id"], time.time()),
        ).fetchone()

    names = {p["persona_id"]: p["display_name"] for p in personas}
    return {
        "account": {
            "username": account["account_name"],
            "email": account["email"],
            "createdAt": account["created_at"],
            "online": {"game": GAMES.get(online["game"], online["game"])} if online else None,
        },
        "personas": [
            {"name": p["display_name"], "primary": bool(p["is_primary"]), "createdAt": p["created_at"]}
            for p in personas
        ],
        "stats": [
            {
                "persona": names.get(s["persona_id"]),
                "game": GAMES.get(s["game"], s["game"]),
                "category": category_name(s["game"], s["category"]),
                "wins": s["wins"],
                "losses": s["losses"],
                "disconnects": s["disconnects"],
                "skill": s["skill"],
                "rank": s["opponents_rank"],
            }
            for s in stats
        ],
        "races": [
            {
                "persona": names.get(r["persona_id"]),
                "game": GAMES.get(r["game"], r["game"]),
                "category": category_name(r["game"], r["category"]),
                "track": r["track"],
                "laps": r["laps"],
                "ranked": bool(r["ranked"]),
                "outcome": r["outcome"],
                "place": r["place"],
                "timeMs": r["elapsed_ms"],
                "bestLapMs": r["best_lap_ms"],
                "bestDrift": r["best_drift"],
                "disconnected": bool(r["disconnected"]),
                "date": r["reported_at"],
            }
            for r in races
        ],
    }


def leaderboard(payload: dict) -> dict:
    game = payload.get("game") or "underground2"
    category = payload.get("category", 0)
    limit = payload.get("limit", 50)
    if (
        game not in CATEGORIES
        or isinstance(category, bool)
        or category not in CATEGORIES[game]
        or isinstance(limit, bool)
        or not isinstance(limit, int)
    ):
        raise BridgeError("VALIDATION_ERROR", "Parámetros de ranking inválidos")
    limit = max(1, min(limit, 100))
    with readonly() as conn:
        rows = conn.execute(
            "SELECT p.display_name, s.wins, s.losses, s.skill FROM game_player_stats s "
            "JOIN personas p ON p.persona_id = s.persona_id "
            "JOIN accounts a ON a.account_id = p.account_id "
            "LEFT JOIN game_leaderboard_visibility v ON v.persona_id = s.persona_id AND v.game = s.game "
            "WHERE s.game = ? AND s.category = ? AND a.banned = 0 AND COALESCE(v.hidden, 0) = 0 "
            "AND (s.wins + s.losses) > 0 "
            "ORDER BY s.skill DESC, s.wins DESC, s.losses ASC LIMIT ?",
            (game, category, limit),
        ).fetchall()
    return {
        "game": GAMES.get(game, game),
        "category": category_name(game, category),
        "categories": [{"id": k, "name": v} for k, v in CATEGORIES.get(game, {}).items()],
        "rows": [
            {"position": i + 1, "persona": r["display_name"], "wins": r["wins"], "losses": r["losses"], "skill": r["skill"]}
            for i, r in enumerate(rows)
        ],
    }


def summary(_payload: dict) -> dict:
    with readonly() as conn:
        def one(sql: str, *params):
            return conn.execute(sql, params).fetchone()[0]

        return {
            "players": one("SELECT COUNT(*) FROM accounts WHERE banned = 0"),
            "online": one("SELECT COUNT(*) FROM active_sessions WHERE expires_at > ?", time.time()),
            "races": one("SELECT COUNT(*) FROM game_races WHERE status = 'complete'"),
        }


ACTIONS = {
    "createAccount": create_account,
    "authenticate": authenticate,
    "changePassword": change_password,
    "passwordResetTarget": password_reset_target,
    "resetPassword": reset_password,
    "getProfile": profile,
    "leaderboard": leaderboard,
    "summary": summary,
}


def main() -> int:
    try:
        raw = sys.stdin.buffer.read(MAX_INPUT + 1)
        if len(raw) > MAX_INPUT:
            raise BridgeError("INVALID_JSON", "Solicitud demasiado grande")
        if not raw.strip():
            raise BridgeError("EMPTY_REQUEST", "Solicitud vacía")
        try:
            payload = json.loads(raw.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            raise BridgeError("INVALID_JSON", "JSON inválido")
        if not isinstance(payload, dict):
            raise BridgeError("INVALID_JSON", "JSON inválido")
        handler = ACTIONS.get(payload.get("action"))
        if handler is None:
            raise BridgeError("INVALID_ACTION", "Acción no soportada")
        result = handler(payload)
        print(json.dumps({"success": True, **result}))
        return 0
    except BridgeError as exc:
        print(json.dumps({"success": False, "code": exc.code, "message": exc.message, **exc.extra}))
        return 1
    except Exception as exc:  # error inesperado: detalle sólo en stderr
        print(f"bridge error: {type(exc).__name__}: {exc}", file=sys.stderr)
        print(json.dumps({"success": False, "code": "NFS_SERVER_ERROR", "message": "Error interno del servidor"}))
        return 1


if __name__ == "__main__":
    sys.exit(main())
