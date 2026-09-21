import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
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
        <div className="auth-logo"><Leaf size={28} /></div>
        <h1>Witaj w Greenly</h1>
        <p>Logowanie do wirtualnego ogrodu i harmonogramu pielęgnacji roślin.</p>
        <form onSubmit={submit} className="form">
          <label>
            E-mail
            <input name="email" type="email" value={form.email} onChange={update} placeholder="np. ogrodnik@greenly.pl" required />
          </label>
          <label>
            Hasło
            <input name="password" type="password" value={form.password} onChange={update} placeholder="Minimum 6 znaków" required />
          </label>
          {error && <div className="error-box">{error}</div>}
          <button className="primary full" disabled={loading}>{loading ? "Logowanie..." : "Zaloguj"}</button>
        </form>
        <p className="auth-switch">Nie masz konta? <Link to="/register">Zarejestruj się</Link></p>
      </div>
      <div className="auth-hero">
        <span>Virtual Garden</span>
        <h2>Kontroluj podlewanie, mikroklimaty i historię pielęgnacji.</h2>
      </div>
    </div>
  );
}
