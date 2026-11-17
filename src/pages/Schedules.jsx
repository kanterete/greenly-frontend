import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, RefreshCw, Search } from "lucide-react";
import { api } from "../api/client";
import WateringRecalculation from "../components/WateringRecalculation";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import { useCachedQuery } from "../hooks/useCachedQuery";
import { daysUntil, formatDate } from "../utils/format";

export default function Schedules() {
  const { data, loading, error, refresh } = useCachedQuery("plants", api.getPlants);
  const plants = data?.plants || [];
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const schedules = plants.flatMap((plant) => (plant.schedules || [])
    .filter((schedule) => schedule.active)
    .map((schedule) => ({ ...schedule, plant, days: daysUntil(schedule.nextDueDate) })))
    .sort((a, b) => (a.days ?? Infinity) - (b.days ?? Infinity) || a.plant.nickname.localeCompare(b.plant.nickname, "pl"));
  const counts = {
    all: schedules.length,
    overdue: schedules.filter((item) => item.days !== null && item.days < 0).length,
    today: schedules.filter((item) => item.days === 0).length,
    upcoming: schedules.filter((item) => item.days !== null && item.days > 0).length,
  };
  const visible = schedules.filter((item) => {
    const matchesDate = filter === "all" || (filter === "overdue" && item.days !== null && item.days < 0)
      || (filter === "today" && item.days === 0) || (filter === "upcoming" && item.days !== null && item.days > 0);
    const text = `${item.plant.nickname} ${item.plant.microclimate?.name || ""} ${item.taskType?.label || ""}`.toLocaleLowerCase("pl");
    return matchesDate && text.includes(query.trim().toLocaleLowerCase("pl"));
  });

  return <section className="panel full-page-panel">
    <div className="section-title schedules-heading">
      <div><h2>Harmonogramy</h2><p>Najbliższy termin każdej aktywnej czynności, od najpilniejszych.</p></div>
      <button className="secondary" onClick={() => refresh().catch(() => {})} disabled={loading}><RefreshCw size={18} /> Odśwież</button>
    </div>
    <WateringRecalculation onUpdated={async () => {
      await refresh();
    }} />
    {loading ? <Loading /> : error ? <div className="error-box" role="alert">{error}</div> : schedules.length === 0 ? (
      <EmptyState title="Brak aktywnych harmonogramów" description="Dodaj roślinę i ustaw częstotliwość podlewania, aby zobaczyć tutaj jej terminy." action={<Link className="primary" to="/plants/add">Dodaj roślinę</Link>} />
    ) : <>
      <div className="schedule-filters" aria-label="Filtry harmonogramów">
        {[["all", "Wszystkie"], ["overdue", "Zaległe"], ["today", "Dzisiaj"], ["upcoming", "Nadchodzące"]].map(([key, label]) => (
          <button key={key} className={filter === key ? "primary" : "secondary"} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label} ({counts[key]})</button>
        ))}
      </div>
      <div className="search-box"><Search size={18} /><input aria-label="Szukaj harmonogramu" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj rośliny, mikroklimatu lub czynności" /></div>
      <p className="muted">Terminy uwzględniają zapisane korekty mikroklimatu i pogody. Częstotliwość oznacza bazowy odstęp między czynnościami.</p>
      {visible.length === 0 ? <EmptyState title="Brak pasujących harmonogramów" description="Zmień filtr lub wpisaną nazwę." /> : <div className="schedule-list">
        {visible.map((item) => <article className="schedule-card" key={item.id}>
          <div className="schedule-card-heading">
            <div><h3>{item.plant.nickname}</h3><p>{item.taskType?.label || "Czynność pielęgnacyjna"} · {item.plant.microclimate?.name || "Brak mikroklimatu"}</p></div>
            <span className={`status-pill ${item.days === null ? "neutral" : item.days < 0 ? "danger" : item.days === 0 ? "warning" : "success"}`}>
              {item.days === null ? "Brak daty" : item.days < 0 ? `Zaległe: ${Math.abs(item.days)} dni` : item.days === 0 ? "Dzisiaj" : item.days === 1 ? "Jutro" : `Za ${item.days} dni`}
            </span>
          </div>
          <dl className="schedule-facts">
            <div><dt><CalendarDays size={16} /> Najbliższy termin</dt><dd>{formatDate(item.nextDueDate)}</dd></div>
            <div><dt>Częstotliwość bazowa</dt><dd>{item.frequencyDays === 1 ? "Codziennie" : `Co ${item.frequencyDays} dni`}</dd></div>
            <div><dt>Ostatnio wykonano</dt><dd>{item.lastCompletedAt ? formatDate(item.lastCompletedAt) : "Jeszcze nie zapisano"}</dd></div>
          </dl>
          <Link className="secondary" to={`/plants/${item.plant.id}`}>Szczegóły i zapis czynności</Link>
        </article>)}
      </div>}
    </>}
  </section>;
}
