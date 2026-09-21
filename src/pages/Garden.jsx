import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { api } from "../api/client";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import PlantCard from "../components/PlantCard";

export default function Garden() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getPlants()
      .then((data) => setPlants(data.plants || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
