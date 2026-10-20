import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

const date = (value, withTime = false) => new Intl.DateTimeFormat("pl-PL", {
  timeZone: "Europe/Warsaw", day: "numeric", month: "long", year: "numeric",
  ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
}).format(new Date(value));

export default function OptimizationHistory({ revision }) {
  const [history, setHistory] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [before, setBefore] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError("");
    api.getOptimizationHistory(before, controller.signal).then((data) => {
      if (controller.signal.aborted) return;
      setHistory(data.history);
      setNextCursor(data.nextCursor);
    }).catch((err) => {
      if (!controller.signal.aborted) setError(err.message);
    }).finally(() => {
      if (!controller.signal.aborted) setBusy(false);
    });
    return () => controller.abort();
  }, [before, attempt, revision]);

  return <section className="watering-recalculation" aria-label="Historia optymalizacji">
    <div className="section-title">
      <h3>Historia optymalizacji</h3>
      <button className="secondary" disabled={busy} onClick={() => { setBefore(null); setAttempt((value) => value + 1); }}>Odśwież historię</button>
    </div>
    <p className="muted">Zapisane zmiany terminów, od najnowszych. Historia obejmuje przeliczenia ręczne i automatyczne. Demonstracje i przeliczenia bez zmiany terminu nie tworzą wpisów.</p>
    <div aria-live="polite" aria-busy={busy}>
      {busy ? <p>Ładowanie historii…</p> : error ? <p className="error-box" role="alert">{error}</p> : <>
        {history.length === 0 && <p>Brak zapisanych zmian. Wpis pojawi się, gdy optymalizacja zmieni termin podlewania.</p>}
        <div className="recalculation-list">{history.map((item) => <article className="recalculation-card" key={item.id}>
          <h4>{item.plantId ? <Link to={`/plants/${item.plantId}`}>{item.plantName}</Link> : item.plantName}</h4>
          <p className="muted">{item.microclimateName} · {date(item.createdAt, true)}</p>
          <span className="status-pill neutral">{item.source === "automatic" ? "Automatycznie" : "Ręcznie"}</span>
          <dl className="recalculation-dates">
            <div><dt>Poprzedni termin</dt><dd>{date(item.previousDate)}</dd></div>
            <div><dt>Nowy termin</dt><dd><strong>{date(item.newDate)}</strong></dd></div>
          </dl>
          <p>{item.reason}</p>
        </article>)}</div>
      </>}
    </div>
    <div className="schedule-filters">
      {before && <button className="secondary" disabled={busy} onClick={() => setBefore(null)}>Najnowsze zmiany</button>}
      {!error && nextCursor && <button className="secondary" disabled={busy} onClick={() => setBefore(nextCursor)}>Starsze zmiany</button>}
    </div>
  </section>;
}
