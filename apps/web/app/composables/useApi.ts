export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message)
  }
}

/** fetch hacia la API con la cookie de sesión y mensajes de error legibles. */
export function useApi() {
  const base = useRuntimeConfig().public.apiUrl as string

  return async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
    let response: Response
    try {
      response = await fetch(base + path, {
        method: options.method ?? 'GET',
        credentials: 'include',
        headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
        body: options.body ? JSON.stringify(options.body) : undefined,
      })
    } catch {
      throw new ApiError('No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.', 0)
    }

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      const message = Array.isArray(data?.message) ? data.message.join('. ') : data?.message
      if (response.status === 429 && !data?.code) {
        throw new ApiError('Hiciste demasiados intentos seguidos. Esperá un minuto y probá de nuevo.', 429)
      }
      throw new ApiError(message || `Algo salió mal (error ${response.status}).`, response.status, data?.code)
    }
    return data as T
  }
}
