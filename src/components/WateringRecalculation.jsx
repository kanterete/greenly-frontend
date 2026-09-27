import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

const date = (value) => new Intl.DateTimeFormat("pl-PL", {
  timeZone: "Europe/Warsaw", day: "numeric", month: "long", year: "numeric",
}).format(new Date(value));

export default function WateringRecalculation({ onUpdated }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const run = async () => {
    setBusy(true); setError(""); setRefreshError(""); setResult(null);
    try {
      const data = await api.triggerWeatherCron();
      setResult(data);
      try { await onUpdated?.(); }
      catch { setRefreshError("Terminy zapisano, ale nie udało się odświeżyć listy. Odśwież stronę."); }
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <section className="watering-recalculation" aria-label="Przeliczanie podlewania">
    <h3>Przeliczanie podlewania</h3>
    <p>Indoor: temperatura, wilgotność i światło mikroklimatu. Outdoor: prognoza pogody dla jego lokalizacji.</p>
    <button className="secondary" onClick={run} disabled={busy}>{busy ? "Przeliczanie…" : "Przelicz podlewanie"}</button>
    <div aria-live="polite" aria-busy={busy}>
      {error && <p className="error-box" role="alert">{error}</p>}
      {refreshError && <p className="error-box">{refreshError}</p>}
      {result && <div className="recalculation-result">
        <h3>Wynik ostatniego przeliczenia</h3>
        <p>Sprawdzono: <strong>{result.checked}</strong> · Zmieniono: <strong>{result.updated}</strong> · Bez zmian: <strong>{result.checked - result.updated - result.skipped}</strong> · Pominięto: <strong>{result.skipped}</strong></p>
        {result.checked === 0 ? <p>Brak aktywnych harmonogramów podlewania do przeliczenia.</p>
          : result.updated === 0 && <p>{result.skipped === result.checked ? "Nie udało się przeliczyć żadnego harmonogramu. Sprawdź błędy poniżej." : "W sprawdzonych harmonogramach terminy pozostają bez zmian. Zaległe podlewania nie są przesuwane."}</p>}
        <div className="recalculation-list">{(result.changes || []).map((change) => <article className="recalculation-card" key={change.scheduleId}>
          <h4><Link to={`/plants/${change.plantId}`}>{change.plantName}</Link></h4>
          <p className="muted">{change.microclimateName}</p>
          <dl className="recalculation-dates">
            <div><dt>Poprzedni termin</dt><dd>{date(change.previousDate)}</dd></div>
            <div><dt>Nowy termin</dt><dd><strong>{date(change.newDate)}</strong></dd></div>
          </dl>
          <p>{change.reason}</p>
        </article>)}</div>
        {(result.errors || []).map((item) => <p className="error-box" key={item.scheduleId || item.plantId}><strong>{item.plantName || `Roślina ${item.plantId}`}:</strong> {item.message}</p>)}
        <small>Zmiany terminów zapisano w harmonogramach. To podsumowanie dotyczy tego uruchomienia i nie jest przechowywane po opuszczeniu strony.</small>
      </div>}
    </div>
  </section>;
}
