import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function WeatherSummary({ location }) {
  const [state, setState] = useState({ loading: true });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!location?.trim()) { setState({ error: "Brak lokalizacji do pobrania pogody." }); return; }
    const controller = new AbortController();
    setState({ loading: true });
    api.getWeather(location, controller.signal)
      .then(({ weather }) => { if (!controller.signal.aborted) setState({ weather }); })
      .catch((error) => { if (!controller.signal.aborted) setState({ error: error.message }); });
    return () => controller.abort();
  }, [location, attempt]);
  if (state.loading) return <p role="status">Pobieranie pogody...</p>;
  if (state.error) return <div role="alert"><p>{state.error}</p><button type="button" className="secondary" onClick={() => setAttempt(attempt + 1)}>Spróbuj ponownie</button></div>;
  const { weather } = state;
  return <div className="weather-summary">
    <p><strong>{weather.condition}</strong> · {weather.location}</p>
    <div className="micro-data"><span>Temp. {weather.temperature}°C</span><span>Wilg. {weather.humidity}%</span></div>
    <p>Prognoza na {weather.forecastDate}: deszcz {weather.precipitationMm} mm, maks. {weather.maxTemperature}°C.</p>
    <small>Dane: {weather.observedAt.replace("T", " ")} ({weather.timezone}). Źródło: <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a></small>
  </div>;
}
