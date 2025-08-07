// Utility function to make API requests with origin validation
export async function fetchWithValidation<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  // Ensure we have a proper URL object
  const url = typeof input === 'string' 
    ? new URL(input, window.location.origin) 
    : input instanceof URL 
      ? input 
      : new URL((input as Request).url, window.location.origin);
  
  // Only modify relative URLs or same-origin absolute URLs
  const isSameOrigin = url.origin === window.location.origin;
  
  // Prepare headers
  const headers = new Headers(init?.headers);
  
  // For same-origin requests, add security headers
  if (isSameOrigin) {
    headers.set('X-Requested-With', 'XMLHttpRequest');
    headers.set('X-Request-Origin', window.location.origin);
  }
  
  // Update the request init with our headers
  const updatedInit: RequestInit = {
    ...init,
    headers,
    credentials: 'same-origin' as const
  };
  
  const response = await fetch(url.toString(), updatedInit);
  
  // Handle non-OK responses
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText || 'API request failed' };
    }
    throw new Error(errorData.message || 'API request failed');
  }
  
  // Handle empty responses (like for 204 No Content)
  if (response.status === 204) {
    return undefined as unknown as T;
  }
  
  // Parse and return JSON response
  try {
    return await response.json();
  } catch (e) {
    throw new Error('Failed to parse JSON response');
  }
}
