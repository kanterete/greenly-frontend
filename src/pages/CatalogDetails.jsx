import { Link, Navigate, useParams } from "react-router-dom";
import { Droplet, Plus, Sun, Waves } from "lucide-react";
import { findCatalogPlant } from "../data/catalog";

export default function CatalogDetails() {
  const { id } = useParams();
  const plant = findCatalogPlant(id);
  if (!plant) return <Navigate to="/catalog" replace />;

  return (
    <section className="details-page">
      <div className="details-image"><img src={plant.imageUrl} alt={plant.commonName} /></div>
      <div className="details-content">
        <p className="eyebrow">Katalog roślin</p>
        <h2>{plant.commonName}</h2>
        <p className="latin">{plant.name}</p>
        <p>{plant.description}</p>
        <div className="info-grid">
          <div><Droplet /><span>Podlewanie</span><strong>{plant.watering}</strong></div>
          <div><Waves /><span>Wilgotność</span><strong>{plant.humidity}</strong></div>
          <div><Sun /><span>Światło</span><strong>{plant.light}</strong></div>
        </div>
        <Link className="primary" to={`/plants/add?species=${plant.id}`}><Plus size={18} /> Dodaj do ogrodu</Link>
      </div>
    </section>
  );
}
