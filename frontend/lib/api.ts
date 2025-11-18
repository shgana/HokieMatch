const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json() as Promise<T>
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(path, baseUrl)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    })
  }
  return handleResponse<T>(await fetch(url.toString(), { cache: "no-store" }))
}

export async function apiPost<T>(path: string, body?: any) {
  const url = `${baseUrl}${path}`
  return handleResponse<T>(
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    })
  )
}

export { baseUrl as backendUrl }
