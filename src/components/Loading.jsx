export default function Loading({ label = "Ładowanie danych..." }) {
  return (
    <div className="loading-card">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}
