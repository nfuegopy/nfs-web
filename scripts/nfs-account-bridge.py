import sys
import json

def main():
    try:
        # Read from stdin
        lines = sys.stdin.readlines()
        if not lines:
            print(json.dumps({"success": False, "error": "No input provided"}))
            return

        input_data = "".join(lines)
        data = json.loads(input_data)

        action = data.get("action")
        username = data.get("username")
        persona = data.get("persona")
        password = data.get("password")

        if action == "createAccount":
            # Mock success for now, in a real implementation we would 
            # interact with /opt/NFS-Online-Server
            print(json.dumps({
                "success": True,
                "message": "Cuenta creada correctamente",
                "account": {
                    "username": username,
                    "persona": persona
                }
            }))
        elif action == "accountExists":
            print(json.dumps({"exists": False}))
        elif action == "personaExists":
            print(json.dumps({"exists": False}))
        else:
            print(json.dumps({"success": False, "error": "Unknown action"}))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    main()
