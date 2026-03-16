import { supabase } from './supabase'

// Dynamically determine the backend URL based on how the frontend is accessed
const isCapacitor = window.Capacitor !== undefined;
const hostname = window.location.hostname;

// If accessed via Android emulator (Capacitor), fallback to 10.0.2.2.
// Otherwise, if localhost, use 127.0.0.1 to avoid Windows IPv6 DNS resolution bugs.
const fallbackApiUrl = isCapacitor
  ? 'http://10.0.2.2:8005/v1'
  : (hostname === 'localhost' ? 'http://127.0.0.1:8005/v1' : `http://${hostname}:8005/v1`);

const API_URL = import.meta.env.VITE_API_URL || fallbackApiUrl;

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
        if (res.status === 401) {
            await supabase.auth.signOut();
            window.location.href = '/auth'; // Redirect to login
            throw new Error('Session expired. Please log in again.');
        }
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
        if (res.status === 401) {
            await supabase.auth.signOut();
            window.location.href = '/auth';
            throw new Error('Session expired. Please log in again.');
        }
        const error = await res.json().catch(() => ({ detail: 'Upload failed' }))
        throw new Error(error.detail || `HTTP ${res.status}`)
    }

    return res.json()
}
