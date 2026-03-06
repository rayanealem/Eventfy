import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/v1'

/**
 * API call helper — attaches JWT from current Supabase session.
 * @param {'GET'|'POST'|'PATCH'|'PUT'|'DELETE'} method
 * @param {string} path - API path (e.g. '/events/feed')
 * @param {object|null} body - Request body (auto-serialized to JSON)
 * @returns {Promise<any>} Parsed JSON response
 */
export async function api(method, path, body = null) {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...(body && { body: JSON.stringify(body) }),
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Request failed' }))
        throw new Error(error.detail || `HTTP ${res.status}`)
    }

    // Handle 204 No Content
    if (res.status === 204) return null

    return res.json()
}

/**
 * Upload a file to the API.
 * @param {string} path - API path
 * @param {File} file - File object
 * @param {string} fieldName - Form field name (default: 'file')
 */
export async function apiUpload(path, file, fieldName = 'file') {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const formData = new FormData()
    formData.append(fieldName, file)

    const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Upload failed' }))
        throw new Error(error.detail || `HTTP ${res.status}`)
    }

    return res.json()
}
