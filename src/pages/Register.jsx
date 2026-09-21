import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Hasła muszą być takie same");
      return;
    }
    setLoading(true);
    try {
      await register({ email: form.email, password: form.password });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><Sprout size={28} /></div>
        <h1>Utwórz konto</h1>
        <p>Dodawaj rośliny, twórz mikroklimaty i pilnuj harmonogramu pielęgnacji.</p>
        <form onSubmit={submit} className="form">
          <label>
            E-mail
            <input name="email" type="email" value={form.email} onChange={update} required />
          </label>
          <label>
            Hasło
            <input name="password" type="password" value={form.password} onChange={update} required />
          </label>
          <label>
            Powtórz hasło
            <input name="confirm" type="password" value={form.confirm} onChange={update} required />
          </label>
          {error && <div className="error-box">{error}</div>}
          <button className="primary full" disabled={loading}>{loading ? "Tworzenie konta..." : "Zarejestruj"}</button>
        </form>
        <p className="auth-switch">Masz konto? <Link to="/login">Zaloguj się</Link></p>
      </div>
      <div className="auth-hero alt">
        <span>Greenly</span>
        <h2>Projekt aplikacji wspomagającej pielęgnację roślin.</h2>
      </div>
    </div>
  );
}
