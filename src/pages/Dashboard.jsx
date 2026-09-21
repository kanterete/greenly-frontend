import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, CloudSun, Droplet, Leaf, Plus, Sprout } from "lucide-react";
import { api } from "../api/client";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import PlantCard from "../components/PlantCard";
import { daysUntil, getNextWatering } from "../utils/format";

export default function Dashboard() {
  const [plants, setPlants] = useState([]);
  const [microclimates, setMicroclimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cronMessage, setCronMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [plantsData, microData] = await Promise.all([api.getPlants(), api.getMicroclimates()]);
      setPlants(plantsData.plants || []);
      setMicroclimates(microData.microclimates || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const dueToday = useMemo(
    () => plants.filter((plant) => daysUntil(getNextWatering(plant)) !== null && daysUntil(getNextWatering(plant)) <= 0),
    [plants]
  );

  const nextPlants = useMemo(() => [...plants].sort((a, b) => new Date(getNextWatering(a) || 0) - new Date(getNextWatering(b) || 0)).slice(0, 3), [plants]);

  const triggerCron = async () => {
    setCronMessage("");
    try {
      const data = await api.triggerWeatherCron();
      setCronMessage(data.message || "Zadanie pogodowe wykonane");
      await load();
    } catch (err) {
      setCronMessage(err.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="page-grid">
      {error && <div className="error-box full-row">{error}</div>}

      <section className="hero-card full-row">
        <div>
          <span className="eyebrow">Dzisiejszy stan ogrodu</span>
          <h2>{dueToday.length > 0 ? `${dueToday.length} roślin wymaga opieki` : "Wszystko pod kontrolą"}</h2>
          <p>Sprawdzaj harmonogram, mikroklimaty i historię zabiegów pielęgnacyjnych w jednym miejscu.</p>
        </div>
        <Link className="primary" to="/plants/add"><Plus size={18} /> Dodaj roślinę</Link>
      </section>

      <section className="stats-grid full-row">
        <div className="stat-card"><Leaf /><span>Rośliny</span><strong>{plants.length}</strong></div>
        <div className="stat-card"><Sprout /><span>Mikroklimaty</span><strong>{microclimates.length}</strong></div>
        <div className="stat-card"><Droplet /><span>Do podlania</span><strong>{dueToday.length}</strong></div>
        <div className="stat-card"><CalendarCheck /><span>Harmonogramy</span><strong>{plants.reduce((sum, plant) => sum + (plant.schedules?.length || 0), 0)}</strong></div>
      </section>

      <section className="panel wide">
        <div className="section-title">
          <div><h2>Najbliższe czynności</h2><p>Rośliny uporządkowane według terminu podlewania.</p></div>
          <Link to="/garden">Zobacz ogród</Link>
        </div>
        {plants.length === 0 ? (
          <EmptyState
            title="Brak roślin"
            description="Dodaj pierwszą roślinę do wirtualnego ogrodu, aby utworzyć harmonogram."
            action={<Link className="primary" to="/plants/add">Dodaj roślinę</Link>}
          />
        ) : (
          <div className="cards-grid three">{nextPlants.map((plant) => <PlantCard key={plant.id} plant={plant} />)}</div>
        )}
      </section>

      <aside className="panel side-panel">
        <div className="weather-box">
          <CloudSun size={34} />
          <h3>Automatyzacja pogodowa</h3>
          <p>Ręcznie uruchom zadanie pogodowe i przelicz harmonogram roślin zewnętrznych.</p>
          <button className="secondary full" onClick={triggerCron}>Uruchom CRON</button>
          {cronMessage && <small>{cronMessage}</small>}
        </div>
      </aside>
    </div>
  );
}
