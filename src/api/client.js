function resolveApiUrl() {
  let envUrl = (import.meta.env.VITE_API_URL || "").trim();
  if (!envUrl) {
    return "http://localhost:3000/api";
  }
  // Jeśli użytkownik podał adres bez protokołu (np. greenly-backend.up.railway.app), dodaj https://
  if (!/^https?:\/\//i.test(envUrl)) {
    const protocol =
      envUrl.startsWith("localhost") || envUrl.startsWith("127.0.0.1") ? "http://" : "https://";
    envUrl = `${protocol}${envUrl}`;
  }
  const clean = envUrl.replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
}

const API_URL = resolveApiUrl();
const TOKEN_KEY = "greenly_token";

if (import.meta.env.PROD && API_URL.includes("localhost")) {
  console.warn(
    "[Greenly] Uwaga: VITE_API_URL wskazuje na localhost w środowisku produkcyjnym! Skonfiguruj zmienną środowiskową VITE_API_URL na adres backendu Railway i przebuduj frontend."
  );
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const targetUrl = `${API_URL}${normalizedEndpoint}`;

  let response;
  try {
    response = await fetch(targetUrl, {
      ...options,
      headers,
    });
  } catch (err) {
    console.error(`Błąd sieciowy przy żądaniu do ${targetUrl}:`, err);
    throw new Error(
      `Brak połączenia z API (${targetUrl}). Upewnij się, że backend działa i nie jest blokowany przez CORS.`
    );
  }

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const backendMessage = data?.message || data?.error;
    const isHtml = typeof data?.message === "string" && data.message.trim().startsWith("<");
    const fallbackMessage =
      !isHtml && typeof data?.message === "string" && data.message.trim()
        ? data.message
        : `Błąd serwera (${response.status} ${response.statusText || ""})`.trim();

    const finalMessage =
      backendMessage && !isHtml ? backendMessage : fallbackMessage || "Wystąpił błąd podczas komunikacji z API";
    console.error(`Błąd API [${response.status}] ${targetUrl}:`, { data, status: response.status });
    throw new Error(finalMessage);
  }

  return data;
}

export const api = {
  uploadImage: async (file) => {
    const body = new FormData(); body.append("image", file);
    const result = await apiFetch("/uploads", { method: "POST", body });
    return { imageUrl: new URL(result.imageUrl, new URL(API_URL, window.location.origin)).href };
  },
  getWeather: (location, signal) => apiFetch(`/weather?${new URLSearchParams({ location })}`, { signal }),
  getCatalog: (query = "", page = 1, signal, watering = "", order = "asc") =>
    apiFetch(
      `/catalog?${new URLSearchParams({ q: query, page: String(page), watering, order })}`,
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
