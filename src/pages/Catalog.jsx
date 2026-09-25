import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useState } from "react";
import { useCatalog } from "../hooks/useCatalog";
import Loading from "../components/Loading";

export default function Catalog() {
  const [params] = useSearchParams();
  const selecting = params.get("select") === "1";
  const { state } = useLocation();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { plants, lastPage, loading, error, retry } = useCatalog(query, page);

  return (
    <section className="panel full-page-panel">
      <div className="section-title">
        <div><h2>Katalog roślin domowych</h2><p>Rośliny domowe z Perenual. Wyszukuj po nazwie naukowej lub angielskiej.</p></div>
        {selecting && <Link className="secondary" to={state?.previousPlant ? `/plants/add?species=${state.previousPlant.id}` : "/plants/add"} state={{ draft: state?.draft, selectedPlant: state?.previousPlant }}>Wróć do formularza</Link>}
      </div>
      <div className="search-box">
        <Search size={18} />
        <input aria-label="Szukaj gatunku" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Szukaj gatunku lub nazwy rośliny" />
      </div>
      {loading && <Loading />}
      {error && <div className="error-box" role="alert">{error} <button onClick={retry}>Spróbuj ponownie</button></div>}
      {!loading && !error && plants.length === 0 && <p>Nie znaleziono roślin.</p>}
      <div className="catalog-grid">
        {plants.map((plant) => (
          <article className="catalog-card" key={plant.id}>
            <Link to={`/catalog/${plant.id}${selecting ? "?select=1" : ""}`} state={state}>
            {plant.imageUrl ? <img src={plant.imageUrl} alt={plant.commonName} loading="lazy" /> : <div className="image-placeholder">Brak zdjęcia</div>}
            <div>
              <h3>{plant.commonName}</h3>
              <p>{plant.name}</p>
            </div>
            </Link>
            {selecting && <div><Link className="primary" to={`/plants/add?species=${plant.id}`} state={{ selectedPlant: plant, draft: state?.draft }}>Wybierz tę roślinę</Link></div>}
          </article>
        ))}
      </div>
      <div className="catalog-pagination">
        <button className="secondary" disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>Poprzednia</button>
        <span>Strona {page}{!loading && !error ? ` z ${lastPage}` : ""}</span>
        <button className="secondary" disabled={loading || !!error || page >= lastPage} onClick={() => setPage(page + 1)}>Następna</button>
      </div>
    </section>
  );
}
