import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import OptimizationHistory from "./OptimizationHistory";

const date = (value) => new Intl.DateTimeFormat("pl-PL", {
  timeZone: "Europe/Warsaw", day: "numeric", month: "long", year: "numeric",
}).format(new Date(value));

export default function WateringRecalculation({ onUpdated }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const [historyRevision, setHistoryRevision] = useState(0);
  const run = async (demo = false) => {
    setBusy(true); setError(""); setRefreshError(""); setResult(null);
    try {
      const data = demo ? await api.getWateringDemo() : await api.triggerWeatherCron();
      setResult(data);
      if (!demo) setHistoryRevision((value) => value + 1);
      try { if (!demo) await onUpdated?.(); }
      catch { setRefreshError("Terminy zapisano, ale nie udało się odświeżyć listy. Odśwież stronę."); }
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <section className="watering-recalculation" aria-label="Przeliczanie podlewania">
    <h3>Optymalizacja podlewania</h3>
    <p>W domu uwzględniamy temperaturę, wilgotność i światło. Na zewnątrz: deszcz od 2 mm przesuwa dzisiejsze podlewanie o 2 dni, a upał od 28°C bez deszczu przyspiesza jutrzejsze podlewanie na dziś.</p>
    <p>To proste reguły korekty terminów. Bazowa częstotliwość pozostaje punktem odniesienia, a zaległe podlewania pozostają widoczne.</p>
    <div className="schedule-filters">
      <button className="primary" onClick={() => run()} disabled={busy}>{busy ? "Przeliczanie…" : "Przelicz i zapisz moje terminy"}</button>
      <button className="secondary" onClick={() => run(true)} disabled={busy}>Pokaż demonstrację na stałych danych</button>
    </div>
    <p className="muted">Demonstracja pokazuje pięć przykładowych roślin i nie zapisuje zmian w Twoim ogrodzie.</p>
    <div aria-live="polite" aria-busy={busy}>
      {error && <p className="error-box" role="alert">{error}</p>}
      {refreshError && <p className="error-box">{refreshError}</p>}
      {result && <div className="recalculation-result">
        <h3>{result.demo ? "Demonstracja — porównanie przed i po" : "Wynik ostatniego przeliczenia"}</h3>
        {result.demo && <p><strong>Dane demonstracyjne. Przyjęte „dzisiaj”: {date(result.referenceDate)}.</strong> Wyniki oblicza ten sam algorytm, który przelicza Twoje harmonogramy. Stała data pozwala powtórzyć pokaz z identycznym wynikiem.</p>}
        <p>Sprawdzono: <strong>{result.checked}</strong> · Zmieniono: <strong>{result.updated}</strong> · Bez zmian: <strong>{result.checked - result.updated - result.skipped}</strong> · Pominięto: <strong>{result.skipped}</strong></p>
        {result.checked === 0 ? <p>Brak aktywnych harmonogramów podlewania do przeliczenia.</p>
          : result.updated === 0 && <p>{result.skipped === result.checked ? "Nie udało się przeliczyć żadnego harmonogramu. Sprawdź błędy poniżej." : "W sprawdzonych harmonogramach terminy pozostają bez zmian. Zaległe podlewania nie są przesuwane."}</p>}
        <div className="recalculation-list">{(result.changes || []).map((change) => <article className="recalculation-card" key={change.scheduleId}>
          <h4>{result.demo ? change.plantName : <Link to={`/plants/${change.plantId}`}>{change.plantName}</Link>}</h4>
          {change.conditions && <p>{change.conditions}</p>}
          {result.demo && <span className={`status-pill ${change.changed ? "success" : "neutral"}`}>{change.changed ? "Termin zmieniony" : "Bez zmian"}</span>}
          <p className="muted">{change.microclimateName}</p>
          <dl className="recalculation-dates">
            <div><dt>Poprzedni termin</dt><dd>{date(change.previousDate)}</dd></div>
            <div><dt>Nowy termin</dt><dd><strong>{date(change.newDate)}</strong></dd></div>
          </dl>
          <p>{change.reason}</p>
        </article>)}</div>
        {(result.errors || []).map((item) => <p className="error-box" key={item.scheduleId || item.plantId}><strong>{item.plantName || `Roślina ${item.plantId}`}:</strong> {item.message}</p>)}
        <small>{result.demo ? "Symulacja na przykładowych danych. Aby zmienić rzeczywiste terminy, wybierz „Przelicz i zapisz moje terminy”." : "Zmiany zapisano w harmonogramach i historii optymalizacji poniżej."}</small>
      </div>}
    </div>
    <OptimizationHistory key={historyRevision} revision={historyRevision} />
  </section>;
}
