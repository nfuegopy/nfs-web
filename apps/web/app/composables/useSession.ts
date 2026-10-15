export interface Account {
  username: string
  persona: string
}

export function useSession() {
  const account = useState<Account | null>('account', () => null)
  const ready = useState('session-ready', () => false)
  const api = useApi()

  async function refresh() {
    try {
      account.value = (await api<{ account: Account }>('/auth/me')).account
    } catch {
      account.value = null
    } finally {
      ready.value = true
    }
  }

  async function login(username: string, password: string) {
    account.value = (await api<{ account: Account }>('/auth/login', { method: 'POST', body: { username, password } })).account
    ready.value = true
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' }).catch(() => {})
    account.value = null
  }

  function set(value: Account) {
    account.value = value
    ready.value = true
  }

  return { account, ready, refresh, login, logout, set }
}
