export function expireSession(): void {
  window.localStorage.removeItem('access_token')

  if (window.location.pathname !== '/login') {
    window.location.replace('/login')
  }
}
