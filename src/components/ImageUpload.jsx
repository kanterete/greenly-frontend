import { useState } from "react";
import { api } from "../api/client";

export default function ImageUpload({ value, onChange, onBusyChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Wybierz JPG, PNG lub WebP o rozmiarze do 5 MB."); return;
    }
    setBusy(true); onBusyChange?.(true);
    try { const result = await api.uploadImage(file); onChange(result.imageUrl); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); onBusyChange?.(false); }
  };
  return <div className="image-upload">
    <label>Prześlij własne zdjęcie (opcjonalnie)
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={busy} />
    </label>
    <small>JPG, PNG lub WebP, maks. 5 MB.</small>
    {busy && <p role="status">Przesyłanie zdjęcia...</p>}
    {error && <p className="error-box" role="alert">{error}</p>}
    {value && <img className="upload-preview" src={value} alt="Podgląd wybranego zdjęcia" />}
  </div>;
}
