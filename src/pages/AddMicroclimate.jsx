import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function AddMicroclimate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    environmentType: "Indoor",
    weatherSource: "",
    location: "",
    temperature: "21",
    humidity: "50",
    lightLevel: "medium",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.createMicroclimate({
        name: form.name,
        environmentType: form.environmentType,
        weatherSource: form.weatherSource || null,
        location: form.location || null,
        temperature: form.temperature ? Number(form.temperature) : null,
        humidity: form.humidity ? Number(form.humidity) : null,
        lightLevel: form.lightLevel || null,
      });
      navigate("/microclimates");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-page">
      <div className="panel form-panel">
        <h2>Dodaj mikroklimat</h2>
        <p>Mikroklimat określa warunki, w których znajduje się roślina.</p>
        <form className="form two-columns" onSubmit={submit}>
          <label>Nazwa
            <input name="name" value={form.name} onChange={update} placeholder="np. Salon - strefa okienna" required />
          </label>
          <label>Typ środowiska
            <select name="environmentType" value={form.environmentType} onChange={update}>
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
            </select>
          </label>
          <label>Źródło pogody
            <input name="weatherSource" value={form.weatherSource} onChange={update} placeholder="np. open-meteo" />
          </label>
          <label>Lokalizacja
            <input name="location" value={form.location} onChange={update} placeholder="np. Warszawa" />
          </label>
          <label>Temperatura
            <input name="temperature" type="number" step="0.1" value={form.temperature} onChange={update} />
          </label>
          <label>Wilgotność
            <input name="humidity" type="number" step="0.1" value={form.humidity} onChange={update} />
          </label>
          <label className="full-field">Poziom światła
            <select name="lightLevel" value={form.lightLevel} onChange={update}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="bright_indirect">bright_indirect</option>
              <option value="direct_sun">direct_sun</option>
            </select>
          </label>
          {error && <div className="error-box full-field">{error}</div>}
          <button className="primary full-field" disabled={loading}>{loading ? "Zapisywanie..." : "Zapisz mikroklimat"}</button>
        </form>
      </div>
    </section>
  );
}
