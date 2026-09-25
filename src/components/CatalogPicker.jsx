import { useState } from "react";
import { useCatalog } from "../hooks/useCatalog";

export default function CatalogPicker({ value, onSelect }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { plants, lastPage, loading, error, retry } = useCatalog(query, page);
  return (
    <div>
      <label>Szukaj gatunku w Perenual
        <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="np. Monstera" />
      </label>
      <label>Gatunek z katalogu
        <select value={value} onChange={(event) => onSelect(plants.find((plant) => plant.id === event.target.value) || null)}>
          <option value="">Wybierz gatunek</option>
          {value && !plants.some((plant) => plant.id === value) && <option value={value}>Wybrany gatunek: {value}</option>}
          {plants.map((plant) => <option key={plant.id} value={plant.id}>{plant.commonName} ({plant.name})</option>)}
        </select>
      </label>
      {loading && <p role="status">Wczytywanie gatunków...</p>}
      {error && <div className="error-box" role="alert">{error} <button type="button" onClick={retry}>Spróbuj ponownie</button></div>}
      {!loading && !error && plants.length === 0 && <p>Nie znaleziono gatunków.</p>}
      <div className="catalog-pagination">
        <button type="button" className="secondary" disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>Poprzednia</button>
        <span>Strona {page}</span>
        <button type="button" className="secondary" disabled={loading || !!error || page >= lastPage} onClick={() => setPage(page + 1)}>Następna</button>
      </div>
    </div>
  );
}
