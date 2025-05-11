// app/public/js/utils/api_utils.js

// api_utils.js - Handles API requests with authentication

import { getAuthHeaders } from "./auth_utils.js";

// Fetch JSON data from API with authentication
export async function fetchJson(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Try to get error details from response
      const error = await response.json().catch(() => ({
        detail: `HTTP error ${response.status}`,
      }));
      throw new Error(error.detail || "API request failed");
    }

    return response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

// Post data to API with authentication
export async function postJson(url, data, options = {}) {
  return fetchJson(url, {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  });
}

// Put data to API with authentication
export async function putJson(url, data, options = {}) {
  return fetchJson(url, {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
  });
}

// Delete data from API with authentication
export async function deleteJson(url, options = {}) {
  return fetchJson(url, {
    method: "DELETE",
    ...options,
  });
}
