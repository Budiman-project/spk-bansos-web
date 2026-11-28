export class ApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

// Fired when an authenticated call gets 401 (session expired, account deactivated or password reset).
// AuthProvider listens and switches to guest, which sends the user back to /login.
export const AUTH_EXPIRED_EVENT = 'spk:auth-expired'

// Errors that don't come from our API as JSON: the hosting platform (Vercel) answers these itself,
// e.g. a request body over its 4.5 MB limit or a function that timed out.
function platformErrorMessage(status) {
  if (status === 413) return 'Berkas terlalu besar untuk dikirim ke server. Gunakan foto yang lebih kecil.'
  if (status === 404) return 'Layanan tidak ditemukan di server (HTTP 404).'
  if (status >= 500) return `Server sedang bermasalah (HTTP ${status}). Coba lagi beberapa saat lagi.`
  return `Permintaan gagal (HTTP ${status}).`
}

export async function api(path, { method = 'GET', body, headers } = {}) {
  const isForm = body instanceof FormData
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'include',
      headers: isForm || body === undefined ? headers : { 'Content-Type': 'application/json', ...headers },
      body: isForm || body === undefined ? body : JSON.stringify(body),
    })
  } catch {
    // Offline, weak mobile signal, or the request was cut off
    throw new ApiError(0, 'Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.')
  }

  let data = null
  if (res.headers.get('content-type')?.includes('application/json')) {
    try {
      data = await res.json()
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/')) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
    throw new ApiError(
      res.status,
      data?.error?.message ?? platformErrorMessage(res.status),
      data?.error?.details,
    )
  }
  return data
}

// withQuery('/users', { q: '', role: 'rt', page: 2 }) → '/users?role=rt&page=2' (empty values dropped)
export function withQuery(path, params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, value)
  }
  const query = search.toString()
  return query ? `${path}?${query}` : path
}
