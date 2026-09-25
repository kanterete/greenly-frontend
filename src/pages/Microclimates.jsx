import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, Plus, Trash2 } from "lucide-react";
import { api } from "../api/client";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import WeatherSummary from "../components/WeatherSummary";

export default function Microclimates() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api.getMicroclimates()
      .then((data) => setItems(data.microclimates || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!confirm("Usunąć mikroklimat?")) return;
    try {
      await api.deleteMicroclimate(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <section className="panel full-page-panel">
      <div className="section-title">
        <div><h2>Mikroklimaty</h2><p>Strefy, do których przypisywane są rośliny w ogrodzie.</p></div>
        <Link className="primary" to="/microclimates/add"><Plus size={18} /> Dodaj</Link>
      </div>
      {error && <div className="error-box">{error}</div>}
      {items.length === 0 ? (
        <EmptyState title="Brak mikroklimatów" description="Dodaj miejsce, w którym znajdują się Twoje rośliny." action={<Link className="primary" to="/microclimates/add">Dodaj mikroklimat</Link>} />
      ) : (
        <div className="micro-grid">
          {items.map((item) => (
            <article className="micro-card" key={item.id}>
              <div className="micro-icon"><Home size={22} /></div>
              <h3>{item.name}</h3>
              <p>{item.environmentType} • {item.location || "Brak lokalizacji"}</p>
              {item.environmentType?.toLowerCase() === "outdoor" ? <WeatherSummary location={item.location} /> : <div className="micro-data">
                <span>Temp. {item.temperature ?? "-"}°C</span>
                <span>Wilg. {item.humidity ?? "-"}%</span>
                <span>Światło: {item.lightLevel || "-"}</span>
              </div>}
              <button className="ghost danger-text" onClick={() => remove(item.id)}><Trash2 size={16} /> Usuń</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
