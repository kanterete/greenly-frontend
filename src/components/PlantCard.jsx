import { Link } from "react-router-dom";
import { CalendarDays, Droplet, MapPin } from "lucide-react";
import { formatDate, getNextWatering, wateringStatus } from "../utils/format";

export default function PlantCard({ plant }) {
  const image = plant.images?.[0]?.imageUrl;
  const status = wateringStatus(plant);

  return (
    <Link to={`/plants/${plant.id}`} className="plant-card">
      <div className="plant-image-wrap">
        {image ? <img src={image} alt={plant.nickname} /> : <div className="image-placeholder"><Droplet /></div>}
        <span className={`status-pill ${status.className}`}>{status.label}</span>
      </div>
      <div className="plant-card-body">
        <h3>{plant.nickname}</h3>
        <p className="muted">{plant.externalSpeciesId ? `Gatunek: ${plant.externalSpeciesId}` : "Roślina użytkownika"}</p>
        <div className="plant-meta">
          <span><MapPin size={15} />{plant.microclimate?.name || "Brak mikroklimatu"}</span>
          <span><CalendarDays size={15} />{formatDate(getNextWatering(plant))}</span>
        </div>
      </div>
    </Link>
  );
}
