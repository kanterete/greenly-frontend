import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Search, Droplet, Sun } from "lucide-react";
import { useCatalog } from "../hooks/useCatalog";
import Loading from "../components/Loading";

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const selecting = params.get("select") === "1";
  const { state } = useLocation();
  const query = params.get("q") || "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const watering = params.get("watering") || "";
  const order = params.get("order") || "asc";
  const changeFilter = (name, value) => {
    const next = new URLSearchParams(params);
    next.set(name, value);
    if (name !== "page") next.delete("page");
    setParams(next, { replace: true, state });
  };
  const catalogState = { ...state, catalogSearch: `/catalog?${params.toString()}` };
  const { plants, lastPage, loading, error, retry } = useCatalog(query, page, watering, order);

  return (
    <section className="panel full-page-panel">
      <div className="section-title">
        <div><h2>Katalog roślin domowych</h2><p>Rośliny domowe z Perenual. Wyszukuj po nazwie naukowej lub angielskiej.</p></div>
        {selecting && <Link className="secondary" to={state?.previousPlant ? `/plants/add?species=${state.previousPlant.id}` : "/plants/add"} state={{ draft: state?.draft, selectedPlant: state?.previousPlant }}>Wróć do formularza</Link>}
      </div>
      <div className="search-box">
        <Search size={18} />
        <input aria-label="Szukaj gatunku" value={query} onChange={(e) => changeFilter("q", e.target.value)} placeholder="Szukaj gatunku lub nazwy rośliny" />
      </div>
      <div className="catalog-controls">
        <fieldset className="catalog-watering-filter">
          <legend>Podlewanie</legend>
          <div className="schedule-filters">
            {[["", "Wszystkie"], ["frequent", "Częste"], ["average", "Umiarkowane"], ["minimum", "Niewielkie"], ["none", "Niewymagane"]].map(([value, label]) => (
              <button type="button" key={value} className={watering === value ? "primary" : "secondary"} aria-pressed={watering === value} onClick={() => changeFilter("watering", value)}>{label}</button>
            ))}
          </div>
        </fieldset>
        <label className="catalog-order">Sortowanie
          <select value={order} onChange={(e) => changeFilter("order", e.target.value)}>
            <option value="asc">Nazwa: A–Z</option>
            <option value="desc">Nazwa: Z–A</option>
          </select>
        </label>
      </div>
      {loading && <Loading />}
      {error && <div className="error-box" role="alert">{error} <button onClick={retry}>Spróbuj ponownie</button></div>}
      {!loading && !error && plants.length === 0 && <p>Nie znaleziono roślin.</p>}
      <div className="catalog-grid">
        {plants.map((plant) => (
          <article className="catalog-card" key={plant.id}>
            <Link to={`/catalog/${plant.id}${selecting ? "?select=1" : ""}`} state={catalogState}>
            {plant.imageUrl ? <img src={plant.imageUrl} alt={plant.commonName} loading="lazy" /> : <div className="image-placeholder">Brak zdjęcia</div>}
            <div>
              <h3>{plant.commonName}</h3>
              <p>{plant.name}</p>
              <div className="tag-row"><span className="care-tag care-tag-water"><Droplet size={15} aria-hidden="true" /> Podlewanie: {plant.watering}</span><span className="care-tag care-tag-light"><Sun size={15} aria-hidden="true" /> Światło: {plant.light}</span></div>
            </div>
            </Link>
            {selecting && <div><Link className="primary" to={`/plants/add?species=${plant.id}`} state={{ selectedPlant: plant, draft: state?.draft }}>Wybierz tę roślinę</Link></div>}
          </article>
        ))}
      </div>
      <div className="catalog-pagination">
        <button className="secondary" disabled={loading || page <= 1} onClick={() => changeFilter("page", String(page - 1))}>Poprzednia</button>
        <span>Strona {page}{!loading && !error ? ` z ${lastPage}` : ""}</span>
        <button className="secondary" disabled={loading || !!error || page >= lastPage} onClick={() => changeFilter("page", String(page + 1))}>Następna</button>
      </div>
    </section>
  );
}
