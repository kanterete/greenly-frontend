import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function AddMicroclimate() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const fromPlant = state?.fromPlant === true;
  const plantFormPath = state?.draft?.externalSpeciesId
    ? `/plants/add?species=${encodeURIComponent(state.draft.externalSpeciesId)}`
    : "/plants/add";
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
      const data = await api.createMicroclimate({
        name: form.name,
        environmentType: form.environmentType,
        weatherSource: form.environmentType === "Outdoor" ? "open-meteo" : null,
        location: form.location || null,
        temperature: form.environmentType === "Indoor" && form.temperature ? Number(form.temperature) : null,
        humidity: form.environmentType === "Indoor" && form.humidity ? Number(form.humidity) : null,
        lightLevel: form.lightLevel || null,
      });
      if (fromPlant) {
        navigate(plantFormPath, {
          replace: true,
          state: {
            selectedPlant: state.selectedPlant,
            draft: { ...state.draft, microclimateId: String(data.microclimate.id) },
          },
        });
      } else {
        navigate("/microclimates");
      }
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
        {fromPlant && <p>Po zapisaniu wrócisz do dodawania rośliny. Nowy mikroklimat zostanie wybrany automatycznie.</p>}
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
            <input value={form.environmentType === "Outdoor" ? "Open-Meteo" : "Warunki ręczne"} readOnly />
          </label>
          <label>Lokalizacja
            <input name="location" value={form.location} onChange={update} placeholder="np. Warszawa lub 52.23, 21.01" required={form.environmentType === "Outdoor"} />
          </label>
          {form.environmentType === "Indoor" && <><label>Temperatura
            <input name="temperature" type="number" step="0.1" value={form.temperature} onChange={update} />
          </label>
          <label>Wilgotność
            <input name="humidity" type="number" step="0.1" value={form.humidity} onChange={update} />
          </label>
          </>}
          <label className="full-field">Poziom światła
            <select name="lightLevel" value={form.lightLevel} onChange={update}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="bright_indirect">bright_indirect</option>
              <option value="direct_sun">direct_sun</option>
            </select>
          </label>
          {error && <div className="error-box full-field">{error}</div>}
          <button className="primary full-field" disabled={loading}>{loading ? "Zapisywanie..." : fromPlant ? "Zapisz i wróć do rośliny" : "Zapisz mikroklimat"}</button>
          {fromPlant && !loading && <Link className="secondary full-field" to={plantFormPath} state={{ draft: state.draft, selectedPlant: state.selectedPlant }}>Wróć bez zapisywania</Link>}
        </form>
      </div>
    </section>
  );
}
