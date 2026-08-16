/**
 * Central API helper for BERKAH USDT.
 * All requests go through REACT_APP_BACKEND_URL (never hardcode hosts).
 */
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const API = `${BACKEND_URL}/api`;

export const TOKEN_KEY = "berkah_admin_token";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch (e) {
    return "";
  }
};

/** Resolve an asset path coming from the API (relative /api/uploads/... or absolute). */
export const assetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  if (path.startsWith("/api/")) return `${BACKEND_URL}${path}`;
  return path;
};

const request = async (method, path, body, token) => {
  const headers = { "Content-Type": "application/json" };
  const authToken = token || getToken();
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const message =
      (data && (data.detail || data.message)) || `Request gagal (${res.status})`;
    const error = new Error(typeof message === "string" ? message : "Request gagal");
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const apiGet = (path, token) => request("GET", path, null, token);
export const apiPost = (path, body, token) => request("POST", path, body, token);
export const apiPut = (path, body, token) => request("PUT", path, body, token);
export const apiPatch = (path, body, token) => request("PATCH", path, body, token);
export const apiDelete = (path, token) => request("DELETE", path, null, token);

export const formatIDR = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default API;
