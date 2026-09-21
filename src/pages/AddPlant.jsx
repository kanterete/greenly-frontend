import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import Loading from "../components/Loading";
import { findCatalogPlant, plantCatalog } from "../data/catalog";

export default function AddPlant() {
  const [params] = useSearchParams();
  const selectedSpecies = params.get("species") || plantCatalog[0].id;
  const navigate = useNavigate();
  const [microclimates, setMicroclimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    microclimateId: "",
    externalSpeciesId: selectedSpecies,
    nickname: findCatalogPlant(selectedSpecies)?.commonName || "",
    locationDescription: "",
    frequencyDays: "7",
    imageUrl: findCatalogPlant(selectedSpecies)?.imageUrl || "",
  });

  useEffect(() => {
    api.getMicroclimates()
      .then((data) => {
        const list = data.microclimates || [];
        setMicroclimates(list);
        if (list[0]) setForm((prev) => ({ ...prev, microclimateId: String(list[0].id) }));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const catalogPlant = useMemo(() => findCatalogPlant(form.externalSpeciesId), [form.externalSpeciesId]);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "externalSpeciesId") {
        const plant = findCatalogPlant(value);
        next.nickname = plant?.commonName || prev.nickname;
        next.imageUrl = plant?.imageUrl || prev.imageUrl;
      }
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = await api.createPlant({
        microclimateId: Number(form.microclimateId),
        externalSpeciesId: form.externalSpeciesId || null,
        nickname: form.nickname,
        locationDescription: form.locationDescription || null,
        frequencyDays: Number(form.frequencyDays) || 7,
        imageUrl: form.imageUrl || null,
      });
      navigate(`/plants/${data.plant.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <section className="form-page split-form-page">
      <div className="panel form-panel">
        <h2>Dodaj roślinę</h2>
        <p>Wybierz gatunek, mikroklimat i częstotliwość podlewania.</p>
        {microclimates.length === 0 && (
          <div className="warning-box">Najpierw dodaj mikroklimat, aby można było przypisać roślinę.</div>
        )}
        <form className="form" onSubmit={submit}>
          <label>Gatunek z katalogu
            <select name="externalSpeciesId" value={form.externalSpeciesId} onChange={update}>
              {plantCatalog.map((plant) => <option value={plant.id} key={plant.id}>{plant.commonName}</option>)}
            </select>
          </label>
          <label>Własna nazwa
            <input name="nickname" value={form.nickname} onChange={update} required />
          </label>
          <label>Mikroklimat
            <select name="microclimateId" value={form.microclimateId} onChange={update} required>
              <option value="">Wybierz mikroklimat</option>
              {microclimates.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label>Opis lokalizacji
            <input name="locationDescription" value={form.locationDescription} onChange={update} placeholder="np. przy oknie" />
          </label>
          <label>Częstotliwość podlewania co ile dni
            <input name="frequencyDays" type="number" min="1" value={form.frequencyDays} onChange={update} />
          </label>
          <label>Adres zdjęcia
            <input name="imageUrl" value={form.imageUrl} onChange={update} />
          </label>
          {error && <div className="error-box">{error}</div>}
          <button className="primary full" disabled={saving || microclimates.length === 0}>{saving ? "Dodawanie..." : "Dodaj roślinę"}</button>
        </form>
      </div>
      <aside className="preview-card">
        {catalogPlant?.imageUrl && <img src={catalogPlant.imageUrl} alt={catalogPlant.commonName} />}
        <h3>{catalogPlant?.commonName || "Podgląd rośliny"}</h3>
        <p>{catalogPlant?.description}</p>
        <div className="tag-row"><span>{catalogPlant?.watering}</span><span>{catalogPlant?.light}</span></div>
      </aside>
    </section>
  );
}
