import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Droplet, Edit, Trash2 } from "lucide-react";
import { api } from "../api/client";
import Loading from "../components/Loading";
import { findCatalogPlant } from "../data/catalog";
import { formatDate, formatDateTime, getNextWatering, wateringStatus } from "../utils/format";

export default function PlantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [taskTypes, setTaskTypes] = useState([]);
  const [careForm, setCareForm] = useState({ taskTypeKey: "water", notes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [plantData, taskData] = await Promise.all([api.getPlant(id), api.getTaskTypes()]);
      setPlant(plantData.plant);
      setTaskTypes(taskData.taskTypes || []);
      if (taskData.taskTypes?.[0]) setCareForm((prev) => ({ ...prev, taskTypeKey: taskData.taskTypes[0].key }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const logCare = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.logCareAction(id, {
        taskTypeKey: careForm.taskTypeKey,
        notes: careForm.notes || null,
      });
      setCareForm((prev) => ({ ...prev, notes: "" }));
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm("Usunąć tę roślinę z ogrodu?")) return;
    try {
      await api.deletePlant(id);
      navigate("/garden");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loading />;
  if (!plant) return <div className="error-box">{error || "Nie znaleziono rośliny"}</div>;

  const catalog = findCatalogPlant(plant.externalSpeciesId);
  const image = plant.images?.[0]?.imageUrl || catalog?.imageUrl;
  const status = wateringStatus(plant);

  return (
    <section className="plant-details-layout">
      <div className="panel details-main">
        <Link className="back-link" to="/garden"><ArrowLeft size={17} /> Wróć do ogrodu</Link>
        {image && <img className="details-cover" src={image} alt={plant.nickname} />}
        <div className="details-header">
          <div>
            <span className={`status-pill ${status.className}`}>{status.label}</span>
            <h2>{plant.nickname}</h2>
            <p>{catalog?.commonName || plant.externalSpeciesId || "Roślina użytkownika"}</p>
          </div>
          <div className="details-actions">
            <Link className="secondary" to={`/plants/${plant.id}/edit`}><Edit size={17} /> Edytuj</Link>
            <button className="ghost danger-text" onClick={remove}><Trash2 size={17} /> Usuń</button>
          </div>
        </div>
        {error && <div className="error-box">{error}</div>}
        <div className="info-grid">
          <div><Droplet /><span>Następne podlewanie</span><strong>{formatDate(getNextWatering(plant))}</strong></div>
          <div><CalendarDays /><span>Dodano</span><strong>{formatDate(plant.addedAt)}</strong></div>
          <div><Droplet /><span>Mikroklimat</span><strong>{plant.microclimate?.name || "-"}</strong></div>
        </div>
        <p className="description-text">{catalog?.description || plant.locationDescription || "Brak opisu rośliny."}</p>
      </div>

      <aside className="panel care-panel">
        <h3>Zaloguj czynność</h3>
        <form className="form" onSubmit={logCare}>
          <label>Typ czynności
            <select value={careForm.taskTypeKey} onChange={(e) => setCareForm((p) => ({ ...p, taskTypeKey: e.target.value }))}>
              {taskTypes.map((type) => <option key={type.id} value={type.key}>{type.label}</option>)}
              {taskTypes.length === 0 && <option value="water">Podlewanie</option>}
            </select>
          </label>
          <label>Notatka
            <textarea value={careForm.notes} onChange={(e) => setCareForm((p) => ({ ...p, notes: e.target.value }))} placeholder="np. Podlano 400 ml wody" />
          </label>
          <button className="primary full" disabled={saving}>{saving ? "Zapisywanie..." : "Zapisz czynność"}</button>
        </form>
        <div className="history-list">
          <h3>Historia pielęgnacji</h3>
          {(plant.careHistory || []).length === 0 ? <p className="muted">Brak wpisów historii.</p> : plant.careHistory.map((item) => (
            <div className="history-item" key={item.id}>
              <strong>{item.taskType?.label || "Czynność"}</strong>
              <span>{formatDateTime(item.completedAt)}</span>
              {item.notes && <p>{item.notes}</p>}
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
