import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { api } from "../api/client";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import PlantCard from "../components/PlantCard";
import { useCachedQuery } from "../hooks/useCachedQuery";

export default function Garden() {
  const { data, loading, error } = useCachedQuery("plants", api.getPlants);
  const plants = data?.plants || [];

  if (loading) return <Loading />;

  return (
    <section className="panel full-page-panel">
      <div className="section-title">
        <div><h2>Wirtualny ogród</h2><p>Lista aktywnych roślin przypisanych do Twoich mikroklimatów.</p></div>
        <Link className="primary" to="/plants/add"><Plus size={18} /> Dodaj</Link>
      </div>
      {error && <div className="error-box">{error}</div>}
      {plants.length === 0 ? (
        <EmptyState
          title="Nie dodano jeszcze roślin"
          description="Wybierz gatunek, mikroklimat i częstotliwość podlewania."
          action={<Link className="primary" to="/plants/add">Dodaj pierwszą roślinę</Link>}
        />
      ) : (
        <div className="cards-grid">{plants.map((plant) => <PlantCard key={plant.id} plant={plant} />)}</div>
      )}
    </section>
  );
}
