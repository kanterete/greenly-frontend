import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import Loading from "../components/Loading";

export default function AddPlant() {
  const [params] = useSearchParams();
  const selectedSpecies = params.get("species") || "";
  const { state } = useLocation();
  const selectedPlant = state?.selectedPlant?.id === selectedSpecies ? state.selectedPlant : null;
  const draft = state?.draft;
  const [catalogPlant, setCatalogPlant] = useState(selectedPlant);
  const [speciesLoading, setSpeciesLoading] = useState(!!selectedSpecies && !selectedPlant);
  const navigate = useNavigate();
  const [microclimates, setMicroclimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => ({
    microclimateId: "",
    nickname: selectedPlant?.commonName || "",
    locationDescription: "",
    frequencyDays: "7",
    imageUrl: selectedPlant?.imageUrl || "",
    ...draft,
    externalSpeciesId: selectedSpecies,
    ...(selectedPlant && draft?.externalSpeciesId !== selectedSpecies ? {
      nickname: selectedPlant.commonName, imageUrl: selectedPlant.imageUrl || "",
    } : {}),
  }));

  useEffect(() => {
    api.getMicroclimates()
      .then((data) => {
        const list = data.microclimates || [];
        setMicroclimates(list);
        if (list[0]) setForm((prev) => ({ ...prev, microclimateId: list.some((item) => String(item.id) === prev.microclimateId) ? prev.microclimateId : String(list[0].id) }));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSpecies) { setCatalogPlant(null); setSpeciesLoading(false); return; }
    if (selectedPlant) {
      setCatalogPlant(selectedPlant);
      setSpeciesLoading(false);
      setForm((prev) => prev.externalSpeciesId === selectedSpecies ? prev : ({ ...prev, externalSpeciesId: selectedSpecies, nickname: selectedPlant.commonName, imageUrl: selectedPlant.imageUrl || "" }));
      return;
    }
    setSpeciesLoading(true);
    const controller = new AbortController();
    api.getCatalogPlant(selectedSpecies, controller.signal)
      .then(({ plant }) => {
        if (controller.signal.aborted) return;
        setCatalogPlant(plant);
        setForm((prev) => ({ ...prev, externalSpeciesId: plant.id, nickname: plant.commonName, imageUrl: plant.imageUrl || "" }));
      })
      .catch((err) => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setSpeciesLoading(false); });
    return () => controller.abort();
  }, [selectedSpecies, selectedPlant]);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
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

  if (loading || speciesLoading) return <Loading />;

  return (
    <section className="form-page split-form-page">
      <div className="panel form-panel">
        <h2>Dodaj roślinę</h2>
        <p>Wybierz gatunek, mikroklimat i częstotliwość podlewania.</p>
        {microclimates.length === 0 && (
          <div className="warning-box">Najpierw dodaj mikroklimat, aby można było przypisać roślinę.</div>
        )}
        <form className="form" onSubmit={submit}>
          <div>
            <span>Gatunek z katalogu</span>
            <p>{catalogPlant ? `${catalogPlant.commonName} (${catalogPlant.name})` : "Nie wybrano jeszcze rośliny."}</p>
            <Link className="secondary" to="/catalog?select=1" state={{ draft: form, previousPlant: catalogPlant }}>
              {catalogPlant ? "Zmień roślinę" : "Wybierz roślinę"}
            </Link>
          </div>
          <label>Własna nazwa
            <input name="nickname" value={form.nickname} onChange={update} required />
          </label>
          <label>Mikroklimat
            <select name="microclimateId" value={form.microclimateId} onChange={update} required>
              <option value="">Wybierz mikroklimat</option>
              {microclimates.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
            </select>
          </label>
          <Link className="secondary" to="/microclimates/add" state={{ fromPlant: true, draft: form, selectedPlant: catalogPlant }}>
            {microclimates.length === 0 ? "Utwórz mikroklimat" : "Dodaj nowy mikroklimat"}
          </Link>
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
          <button className="primary full" disabled={saving || !catalogPlant || microclimates.length === 0}>{saving ? "Dodawanie..." : "Dodaj roślinę"}</button>
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
