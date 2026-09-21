import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { plantCatalog } from "../data/catalog";

export default function Catalog() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return plantCatalog;
    return plantCatalog.filter((plant) => `${plant.name} ${plant.commonName}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <section className="panel full-page-panel">
      <div className="section-title">
        <div><h2>Katalog roślin</h2><p>Lokalny katalog gatunków wykorzystywany przy dodawaniu rośliny.</p></div>
      </div>
      <div className="search-box">
        <Search size={18} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj gatunku lub nazwy rośliny" />
      </div>
      <div className="catalog-grid">
        {filtered.map((plant) => (
          <Link to={`/catalog/${plant.id}`} className="catalog-card" key={plant.id}>
            <img src={plant.imageUrl} alt={plant.commonName} />
            <div>
              <h3>{plant.commonName}</h3>
              <p>{plant.name}</p>
              <div className="tag-row"><span>{plant.watering}</span><span>{plant.light}</span></div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
