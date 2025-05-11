// app/public/js/utils/auth_utils.js

// auth_utils.js - Handles authentication token and user management

// Store token in localStorage
export function saveToken(token) {
  localStorage.setItem("auth_token", token);
}

// Retrieve token from localStorage
export function getToken() {
  return localStorage.getItem("auth_token");
}

// Remove token from localStorage
export function removeToken() {
  localStorage.removeItem("auth_token");
}

// Store user data in localStorage
export function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

// Retrieve user data from localStorage
export function getUser() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user data:", error);
    removeUser();
    return null;
  }
}

// Remove user data from localStorage
export function removeUser() {
  localStorage.removeItem("user");
}

// Check if user is signed in
export function isSignedIn() {
  return !!getToken() && !!getUser();
}

// Sign out user by removing token and user data
export function signOut() {
  removeToken();
  removeUser();
  // Redirect to index page which will handle redirection
  window.location.href = "/";
}

// Get user role
export function getUserRole() {
  const user = getUser();
  return user ? user.role : null;
}

// Add token to request headers
export function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
