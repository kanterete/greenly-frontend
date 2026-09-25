import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Droplet, Plus, Sun, Waves } from "lucide-react";
import { useCatalogPlant } from "../hooks/useCatalog";
import Loading from "../components/Loading";

export default function CatalogDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const [params] = useSearchParams();
  const selecting = params.get("select") === "1";
  const { plant, loading, error, retry } = useCatalogPlant(id);
  if (loading) return <Loading />;
  if (error || !plant) return <div className="error-box" role="alert">{error || "Nie znaleziono rośliny."} <button className="secondary" onClick={retry}>Spróbuj ponownie</button> <Link className="secondary" to={selecting ? "/catalog?select=1" : "/catalog"} state={state}><ArrowLeft size={18} /> Wróć do katalogu</Link></div>;

  return (
    <section className="details-page">
      <div className="details-image">{plant.imageUrl ? <img src={plant.imageUrl} alt={plant.commonName} /> : <div className="image-placeholder">Brak zdjęcia</div>}</div>
      <div className="details-content">
        <p className="eyebrow">Katalog roślin</p>
        <Link className="secondary catalog-back-button" to={selecting ? "/catalog?select=1" : "/catalog"} state={state}><ArrowLeft size={18} /> Wróć do katalogu</Link>
        <h2>{plant.commonName}</h2>
        <p className="latin">{plant.name}</p>
        <p>{plant.description}</p>
        <div className="info-grid">
          <div><Droplet /><span>Podlewanie</span><strong>{plant.watering}</strong></div>
          <div><Waves /><span>Wilgotność</span><strong>{plant.humidity}</strong></div>
          <div><Sun /><span>Światło</span><strong>{plant.light}</strong></div>
        </div>
        <Link className="primary" to={`/plants/add?species=${plant.id}`} state={{ selectedPlant: plant, draft: state?.draft }}><Plus size={18} /> {selecting ? "Wybierz tę roślinę" : "Dodaj do ogrodu"}</Link>
      </div>
    </section>
  );
}
