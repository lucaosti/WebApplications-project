/**
 * Generic wrapper around fetch with JSON support and error handling.
 *
 * @param {string} url - The endpoint to fetch.
 * @param {object} options - Fetch options (method, headers, body).
 * @returns {Promise<any>} - The parsed JSON response.
 * @throws {Error} - If the response is not ok.
 */
export async function apiFetch(url, options = {}) {
  const fetchOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Send cookies for session
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  if (response.ok) {
    // Try to parse JSON, but allow empty responses
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return null;
  } else {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || `HTTP error ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = errorData; // Preserve full error data
    throw error;
  }
}
