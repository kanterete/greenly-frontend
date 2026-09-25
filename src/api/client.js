const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const TOKEN_KEY = "greenly_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const message = data?.message || "Wystąpił błąd podczas komunikacji z API";
    throw new Error(message);
  }

  return data;
}

export const api = {
  getWeather: (location, signal) => apiFetch(`/weather?${new URLSearchParams({ location })}`, { signal }),
  getCatalog: (query = "", page = 1, signal) =>
    apiFetch(
      `/catalog?${new URLSearchParams({ q: query, page: String(page) })}`,
      { signal },
    ),
  getCatalogPlant: (id, signal) =>
    apiFetch(`/catalog/${encodeURIComponent(id)}`, { signal }),
  health: () => apiFetch("/health"),
  register: (email, password) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => apiFetch("/auth/me"),
  getMicroclimates: () => apiFetch("/microclimates"),
  getMicroclimate: (id) => apiFetch(`/microclimates/${id}`),
  createMicroclimate: (payload) =>
    apiFetch("/microclimates", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateMicroclimate: (id, payload) =>
    apiFetch(`/microclimates/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteMicroclimate: (id) =>
    apiFetch(`/microclimates/${id}`, {
      method: "DELETE",
    }),
  getPlants: () => apiFetch("/plants"),
  getPlant: (id) => apiFetch(`/plants/${id}`),
  createPlant: (payload) =>
    apiFetch("/plants", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updatePlant: (id, payload) =>
    apiFetch(`/plants/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deletePlant: (id) =>
    apiFetch(`/plants/${id}`, {
      method: "DELETE",
    }),
  getTaskTypes: () => apiFetch("/care/task-types"),
  logCareAction: (plantId, payload) =>
    apiFetch(`/plants/${plantId}/care-actions`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getCareHistory: (plantId) => apiFetch(`/plants/${plantId}/care-history`),
  triggerWeatherCron: () =>
    apiFetch("/cron/trigger-weather", {
      method: "POST",
    }),
};
