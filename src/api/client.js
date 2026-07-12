const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

function getStoredToken() {
  return typeof window !== 'undefined' ? window.localStorage.getItem('assetflow_token') : null;
}

function buildHeaders(body) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...buildHeaders(body),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return {
    ok: true,
    data: payload.data ?? payload,
    message: payload.message,
  };
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
};

export function setAuthToken(token) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('assetflow_token', token);
  }
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('assetflow_token');
  }
}
