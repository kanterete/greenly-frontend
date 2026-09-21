import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import Loading from "../components/Loading";
import { plantCatalog } from "../data/catalog";

export default function EditPlant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [microclimates, setMicroclimates] = useState([]);
  const [form, setForm] = useState({ microclimateId: "", externalSpeciesId: "", nickname: "", locationDescription: "", imageUrl: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.getPlant(id), api.getMicroclimates()])
      .then(([plantData, microData]) => {
        const plant = plantData.plant;
        setForm({
          microclimateId: String(plant.microclimateId || ""),
          externalSpeciesId: plant.externalSpeciesId || "",
          nickname: plant.nickname || "",
          locationDescription: plant.locationDescription || "",
          imageUrl: plant.images?.[0]?.imageUrl || "",
        });
        setMicroclimates(microData.microclimates || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const update = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.updatePlant(id, {
        microclimateId: Number(form.microclimateId),
        externalSpeciesId: form.externalSpeciesId || null,
        nickname: form.nickname,
        locationDescription: form.locationDescription || null,
        imageUrl: form.imageUrl || null,
      });
      navigate(`/plants/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <section className="form-page">
      <div className="panel form-panel">
        <h2>Edytuj roślinę</h2>
        <form className="form" onSubmit={submit}>
          <label>Nazwa
            <input name="nickname" value={form.nickname} onChange={update} required />
          </label>
          <label>Gatunek
            <select name="externalSpeciesId" value={form.externalSpeciesId} onChange={update}>
              <option value="">Brak</option>
              {plantCatalog.map((plant) => <option key={plant.id} value={plant.id}>{plant.commonName}</option>)}
            </select>
          </label>
          <label>Mikroklimat
            <select name="microclimateId" value={form.microclimateId} onChange={update} required>
              {microclimates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label>Opis lokalizacji
            <input name="locationDescription" value={form.locationDescription} onChange={update} />
          </label>
          <label>Nowe zdjęcie URL
            <input name="imageUrl" value={form.imageUrl} onChange={update} />
          </label>
          {error && <div className="error-box">{error}</div>}
          <button className="primary full" disabled={saving}>{saving ? "Zapisywanie..." : "Zapisz zmiany"}</button>
        </form>
      </div>
    </section>
  );
}
