import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle,
  Download,
  KeyRound,
  Leaf,
  Mail,
  ShieldAlert,
  Smartphone,
  Sprout,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { usePwa } from "../context/PwaContext";
import { formatDate } from "../utils/format";

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { isInstallable, isInstalled, isStandalone, isIos, installApp } = usePwa();
  const navigate = useNavigate();

  // Stats
  const [stats, setStats] = useState({ plantsCount: 0, microclimatesCount: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Email update state
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailError, setEmailError] = useState("");

  // Password update state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Delete account state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // PWA install trigger feedback
  const [installFeedback, setInstallFeedback] = useState("");

  useEffect(() => {
    if (user?.email) {
      setEmailInput(user.email);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.getPlants().catch(() => []), api.getMicroclimates().catch(() => [])])
      .then(([plants, microclimates]) => {
        if (isMounted) {
          setStats({
            plantsCount: Array.isArray(plants) ? plants.length : 0,
            microclimatesCount: Array.isArray(microclimates) ? microclimates.length : 0,
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingStats(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");

    if (!emailInput.trim()) {
      setEmailError("Adres e-mail nie może być pusty.");
      return;
    }

    if (emailInput.trim().toLowerCase() === user?.email?.toLowerCase()) {
      setEmailError("Wprowadzony adres e-mail jest identyczny z obecnym.");
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const response = await api.updateProfile({ email: emailInput.trim() });
      updateUser(response.user, response.token);
      setEmailSuccess(response.message || "Adres e-mail został pomyślnie zaktualizowany!");
    } catch (err) {
      setEmailError(err.message || "Nie udało się zaktualizować adresu e-mail.");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Podaj obecne hasło.");
      return;
    }

    if (!newPassword) {
      setPasswordError("Podaj nowe hasło.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Nowe hasło musi zawierać co najmniej 6 znaków.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Nowe hasła nie są identyczne.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await api.updateProfile({
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(response.message || "Hasło zostało pomyślnie zmienione!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message || "Nie udało się zmienić hasła.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError("");
    setIsDeletingAccount(true);

    try {
      await api.deleteAccount({ password: deleteConfirmPassword });
      logout();
      navigate("/login", {
        replace: true,
        state: { message: "Twoje konto zostało bezpowrotnie usunięte." },
      });
    } catch (err) {
      setDeleteError(err.message || "Nie udało się usunąć konta. Sprawdź poprawność hasła.");
      setIsDeletingAccount(false);
    }
  };

  const handleInstallClick = async () => {
    setInstallFeedback("");
    if (isInstallable) {
      const installed = await installApp();
      if (installed) {
        setInstallFeedback("Dziękujemy za zainstalowanie aplikacji Greenly!");
      }
    } else {
      setInstallFeedback(
        "Instalacja jest gotowa! Jeśli przycisk nie wywołał monitu, użyj menu przeglądarki (ikona instalacji w pasku adresu na komputerze lub 'Dodaj do ekranu głównego' w menu mobilnym)."
      );
    }
  };

  return (
    <div className="profile-page">
      {/* 1. Header Profile Hero */}
      <section className="profile-hero panel">
        <div className="profile-hero-content">
          <div className="profile-avatar">
            <User size={38} />
          </div>
          <div className="profile-meta">
            <span className="profile-badge">Aktywny ogrodnik</span>
            <h2>{user?.email}</h2>
            <p className="profile-sub">
              Konto zarejestrowane: <strong>{formatDate(user?.createdAt)}</strong>
            </p>
          </div>
        </div>

        <div className="profile-stats-chips">
          <div className="profile-stat-box">
            <Leaf size={20} />
            <div>
              <span className="stat-label">Rośliny</span>
              <strong>{isLoadingStats ? "..." : stats.plantsCount}</strong>
            </div>
          </div>
          <div className="profile-stat-box">
            <Sprout size={20} />
            <div>
              <span className="stat-label">Mikroklimaty</span>
              <strong>{isLoadingStats ? "..." : stats.microclimatesCount}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PWA Installation Section */}
      <section className="pwa-card panel">
        <div className="pwa-header">
          <div className="pwa-icon-badge">
            <Smartphone size={28} />
          </div>
          <div>
            <div className="pwa-title-row">
              <h2>Zainstaluj aplikację Greenly (PWA)</h2>
              {isInstalled ? (
                <span className="status-pill success">
                  <CheckCircle size={14} /> Zainstalowana
                </span>
              ) : (
                <span className="status-pill warning">Dostępna instalacja</span>
              )}
            </div>
            <p className="pwa-description">
              Pobierz Greenly jako natywną aplikację na swój telefon lub komputer. Działa bez paska adresu przeglądarki,
              uruchamia się błyskawicznie i ma dostęp do trybu offline.
            </p>
          </div>
        </div>

        <div className="pwa-benefits-grid">
          <div className="pwa-benefit-item">
            <div className="pwa-benefit-icon">
              <Zap size={20} />
            </div>
            <div>
              <strong>Błyskawiczne ładowanie</strong>
              <p>Zapisane zasoby w Service Workerze gwarantują natychmiastowy start.</p>
            </div>
          </div>
          <div className="pwa-benefit-item">
            <div className="pwa-benefit-icon">
              <Smartphone size={20} />
            </div>
            <div>
              <strong>Ekran bez przeglądarki</strong>
              <p>Działa w osobnym, pełnym oknie dokładnie jak aplikacja z App Store / Google Play.</p>
            </div>
          </div>
          <div className="pwa-benefit-item">
            <div className="pwa-benefit-icon">
              <Sprout size={20} />
            </div>
            <div>
              <strong>Zawsze pod ręką</strong>
              <p>Własna ikona aplikacji bezpośrednio na pulpicie telefonu lub komputera.</p>
            </div>
          </div>
        </div>

        <div className="pwa-action-bar">
          {isInstalled ? (
            <div className="pwa-installed-message">
              <CheckCircle size={20} className="check-icon" />
              <div>
                <strong>Aplikacja Greenly jest już zainstalowana na tym urządzeniu!</strong>
                <p>Możesz uruchamiać ją bezpośrednio ze swojego ekranu początkowego lub menu aplikacji.</p>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="primary pwa-download-btn"
                onClick={handleInstallClick}
              >
                <Download size={20} />
                Pobierz i zainstaluj Greenly
              </button>

              {isIos && (
                <div className="ios-instructions">
                  <p>
                    <strong>Instrukcja dla iOS (Safari):</strong>
                  </p>
                  <ol>
                    <li>
                      Dotknij ikony <strong>Udostępnij</strong> (kwadrat ze strzałką w górę na dolnym pasku).
                    </li>
                    <li>
                      Wybierz opcję <strong>Do początku ekranu</strong> (Add to Home Screen).
                    </li>
                    <li>
                      Kliknij <strong>Dodaj</strong> w prawym górnym rogu.
                    </li>
                  </ol>
                </div>
              )}

              {!isIos && (
                <p className="pwa-hint">
                  Wskazówka: Możesz również kliknąć ikonkę instalacji w pasku adresu przeglądarki (obok gwiazdki/kłódki)
                  lub wybrać opcję <em>„Zainstaluj aplikację Greenly”</em> w menu przeglądarki.
                </p>
              )}
            </>
          )}

          {installFeedback && (
            <div className="warning-box" style={{ marginTop: "14px" }}>
              {installFeedback}
            </div>
          )}
        </div>
      </section>

      {/* 3. Account Settings: Email & Password */}
      <div className="profile-grid">
        {/* Email form */}
        <section className="panel">
          <div className="section-title">
            <div>
              <h2>Adres e-mail</h2>
              <p>Zarządzaj swoim adresem powiązanym z kontem</p>
            </div>
            <Mail size={22} className="muted" />
          </div>

          <form onSubmit={handleUpdateEmail} className="form">
            {emailSuccess && <div className="pwa-success-box">{emailSuccess}</div>}
            {emailError && <div className="error-box">{emailError}</div>}

            <label>
              Twój adres e-mail
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="twoj@email.com"
              />
            </label>

            <button
              type="submit"
              className="primary"
              disabled={isUpdatingEmail || emailInput.trim().toLowerCase() === user?.email?.toLowerCase()}
            >
              {isUpdatingEmail ? "Zapisywanie..." : "Zapisz nowy e-mail"}
            </button>
          </form>
        </section>

        {/* Password form */}
        <section className="panel">
          <div className="section-title">
            <div>
              <h2>Zmiana hasła</h2>
              <p>Zabezpiecz swoje konto nowym silnym hasłem</p>
            </div>
            <KeyRound size={22} className="muted" />
          </div>

          <form onSubmit={handleUpdatePassword} className="form">
            {passwordSuccess && <div className="pwa-success-box">{passwordSuccess}</div>}
            {passwordError && <div className="error-box">{passwordError}</div>}

            <label>
              Obecne hasło
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Wpisz obecne hasło"
              />
            </label>

            <label>
              Nowe hasło (min. 6 znaków)
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Wpisz nowe hasło"
              />
            </label>

            <label>
              Powtórz nowe hasło
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Powtórz nowe hasło"
              />
            </label>

            <button type="submit" className="primary" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? "Aktualizacja..." : "Zmień hasło"}
            </button>
          </form>
        </section>
      </div>

      {/* 4. Danger Zone: Delete Account */}
      <section className="danger-zone-panel panel">
        <div className="danger-zone-header">
          <div className="danger-zone-icon">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2>Usuwanie konta</h2>
            <p>
              Po usunięciu konta wszystkie Twoje dane (strefy mikroklimatyczne, rośliny, harmonogramy i zdjęcia)
              zostaną bezpowrotnie skasowane z bazy danych. Ta operacja jest nieodwracalna.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="danger-button"
          onClick={() => {
            setDeleteError("");
            setDeleteConfirmPassword("");
            setIsDeleteModalOpen(true);
          }}
        >
          <Trash2 size={18} />
          Usuń konto trwale
        </button>
      </section>

      {/* Confirmation Modal for account deletion */}
      {isDeleteModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon danger">
              <AlertTriangle size={32} />
            </div>
            <h3>Czy na pewno chcesz usunąć konto?</h3>
            <p className="modal-description">
              Wszystkie Twoje strefy ({stats.microclimatesCount}) oraz rośliny ({stats.plantsCount}) zostaną natychmiast
              skasowane. Tej operacji nie można cofnąć.
            </p>

            <form onSubmit={handleDeleteAccount} className="form">
              {deleteError && <div className="error-box">{deleteError}</div>}

              <label>
                Potwierdź wpisując swoje hasło:
                <input
                  type="password"
                  required
                  placeholder="Twoje obecne hasło"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  autoFocus
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeletingAccount}
                >
                  Anuluj
                </button>
                <button type="submit" className="danger-button solid" disabled={isDeletingAccount}>
                  {isDeletingAccount ? "Usuwanie..." : "Tak, usuń bezpowrotnie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
