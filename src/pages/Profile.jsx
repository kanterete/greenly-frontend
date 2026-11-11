import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BellRing,
  Check,
  CheckCircle,
  Clock,
  Download,
  KeyRound,
  Leaf,
  Mail,
  Radio,
  Send,
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
  const {
    isInstallable,
    isInstalled,
    isIos,
    installApp,
    isPushSupported,
    isSubscribed,
    isPushLoading,
    pushPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestPushNotification,
  } = usePwa();
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

  // Push Notifications state
  const [pushMessage, setPushMessage] = useState("");
  const [pushError, setPushError] = useState("");
  const [isTriggeringCron, setIsTriggeringCron] = useState(false);
  const [cronFeedback, setCronFeedback] = useState("");

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
            plantsCount: (Array.isArray(plants) ? plants : plants?.plants || []).length,
            microclimatesCount: (Array.isArray(microclimates) ? microclimates : microclimates?.microclimates || []).length,
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

  const handleTogglePush = async () => {
    setPushMessage("");
    setPushError("");
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
        setPushMessage("Powiadomienia Push zostały pomyślnie wyłączone na tym urządzeniu.");
      } else {
        await subscribeToPush();
        setPushMessage("Powiadomienia Push zostały pomyślnie włączone! Otrzymasz przypomnienia o podlewaniu.");
      }
    } catch (err) {
      setPushError(err.message || "Błąd podczas zarządzania powiadomieniami");
    }
  };

  const handleSendTestPush = async () => {
    setPushMessage("");
    setPushError("");
    try {
      const res = await sendTestPushNotification();
      setPushMessage(res.message || "Wysłano powiadomienie testowe! Powinno pojawić się na Twoim ekranie.");
    } catch (err) {
      setPushError(err.message || "Nie udało się wysłać testowego powiadomienia");
    }
  };

  const handleTriggerCron = async () => {
    setIsTriggeringCron(true);
    setCronFeedback("");
    try {
      const res = await api.triggerNotificationsCron();
      setCronFeedback(res.message || "Pomyślnie sprawdzono zadania i wysłano powiadomienia.");
    } catch (err) {
      setCronFeedback(err.message || "Błąd podczas wyzwalania harmonogramu CRON");
    } finally {
      setIsTriggeringCron(false);
    }
  };

  const initial = user?.email?.[0]?.toUpperCase() || "?";
  const pushStatus = !isPushSupported
    ? { label: "Niedostępne", tone: "neutral" }
    : isSubscribed
    ? { label: "Włączone", tone: "success" }
    : pushPermission === "denied"
    ? { label: "Zablokowane", tone: "danger" }
    : { label: "Wyłączone", tone: "neutral" };

  return (
    <div className="profile-page">
      {/* Account summary */}
      <section className="profile-summary">
        <div className="profile-identity">
          <span className="profile-avatar" aria-hidden="true">{initial}</span>
          <div className="profile-meta">
            <h2>{user?.email}</h2>
            <p className="profile-sub">Konto od {formatDate(user?.createdAt)}</p>
          </div>
        </div>
        <dl className="profile-stats">
          <div>
            <dt>Rośliny</dt>
            <dd>{isLoadingStats ? "–" : stats.plantsCount}</dd>
          </div>
          <div>
            <dt>Mikroklimaty</dt>
            <dd>{isLoadingStats ? "–" : stats.microclimatesCount}</dd>
          </div>
        </dl>
      </section>

      {/* App & notifications */}
      <section className="settings-section">
        <header className="settings-section-header">
          <h3>Aplikacja</h3>
          <p>Instalacja na urządzeniu i przypomnienia o pielęgnacji.</p>
        </header>

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-title">
              <Smartphone size={18} />
              <strong>Zainstaluj Greenly</strong>
              {isInstalled && <span className="status-pill success">Zainstalowana</span>}
            </div>
            <p>
              Uruchamiaj Greenly z ekranu głównego jak zwykłą aplikację — bez paska przeglądarki i z szybszym startem.
            </p>
            {!isInstalled && isIos && (
              <ol className="inline-steps">
                <li>W Safari dotknij <strong>Udostępnij</strong>.</li>
                <li>Wybierz <strong>Do ekranu początkowego</strong>.</li>
                <li>Potwierdź przyciskiem <strong>Dodaj</strong>.</li>
              </ol>
            )}
            {installFeedback && <p className="settings-feedback">{installFeedback}</p>}
          </div>
          <div className="settings-row-action">
            {isInstalled ? (
              <span className="settings-state"><CheckCircle size={16} /> Na tym urządzeniu</span>
            ) : (
              !isIos && (
                <button type="button" className="primary" onClick={handleInstallClick}>
                  <Download size={16} /> Zainstaluj
                </button>
              )
            )}
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-title">
              <Bell size={18} />
              <strong>Powiadomienia push</strong>
              <span className={`status-pill ${pushStatus.tone}`}>{pushStatus.label}</span>
            </div>
            <p>
              Codziennie o 8:00 dostaniesz przypomnienie, jeśli któraś roślina wymaga podlewania lub innej czynności.
            </p>
            {pushPermission === "denied" && (
              <p className="settings-feedback">Powiadomienia są zablokowane w ustawieniach przeglądarki dla tej strony.</p>
            )}
            {pushMessage && <p className="settings-feedback success">{pushMessage}</p>}
            {pushError && <p className="settings-feedback error">{pushError}</p>}
          </div>
          <div className="settings-row-action">
            {isPushSupported && (
              <>
                {isSubscribed && (
                  <button type="button" className="secondary" onClick={handleSendTestPush}>
                    <Send size={16} /> Test
                  </button>
                )}
                <button
                  type="button"
                  className={isSubscribed ? "secondary" : "primary"}
                  onClick={handleTogglePush}
                  disabled={isPushLoading || pushPermission === "denied"}
                >
                  {isPushLoading ? "Chwila…" : isSubscribed ? "Wyłącz" : "Włącz"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-title">
              <Clock size={18} />
              <strong>Sprawdź zadania teraz</strong>
            </div>
            <p>
              Ręcznie uruchamia poranne sprawdzanie harmonogramu i wysyła powiadomienia o dzisiejszych zadaniach.
            </p>
            {cronFeedback && <p className="settings-feedback">{cronFeedback}</p>}
          </div>
          <div className="settings-row-action">
            <button type="button" className="secondary" onClick={handleTriggerCron} disabled={isTriggeringCron}>
              <Radio size={16} /> {isTriggeringCron ? "Sprawdzanie…" : "Uruchom"}
            </button>
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="settings-section">
        <header className="settings-section-header">
          <h3>Konto</h3>
          <p>Adres e-mail i hasło używane do logowania.</p>
        </header>

        <form onSubmit={handleUpdateEmail} className="settings-row settings-form-row">
          <div className="settings-row-info">
            <div className="settings-row-title">
              <Mail size={18} />
              <strong>Adres e-mail</strong>
            </div>
            {emailSuccess && <p className="settings-feedback success">{emailSuccess}</p>}
            {emailError && <p className="settings-feedback error">{emailError}</p>}
          </div>
          <div className="settings-row-fields">
            <label>
              <span className="sr-only">Adres e-mail</span>
              <input
                type="email"
                required
                autoComplete="email"
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
              {isUpdatingEmail ? "Zapisywanie…" : "Zapisz"}
            </button>
          </div>
        </form>

        <form onSubmit={handleUpdatePassword} className="settings-row settings-form-row">
          <div className="settings-row-info">
            <div className="settings-row-title">
              <KeyRound size={18} />
              <strong>Hasło</strong>
            </div>
            <p>Minimum 6 znaków.</p>
            {passwordSuccess && <p className="settings-feedback success">{passwordSuccess}</p>}
            {passwordError && <p className="settings-feedback error">{passwordError}</p>}
          </div>
          <div className="settings-row-fields stacked">
            <label>
              Obecne hasło
              <input
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </label>
            <label>
              Nowe hasło
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>
            <label>
              Powtórz nowe hasło
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
            <button type="submit" className="primary" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? "Aktualizacja…" : "Zmień hasło"}
            </button>
          </div>
        </form>
      </section>

      {/* Danger zone */}
      <section className="settings-section danger">
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-title">
              <ShieldAlert size={18} />
              <strong>Usuń konto</strong>
            </div>
            <p>
              Trwale usuwa konto razem z mikroklimatami, roślinami, harmonogramami i zdjęciami. Tej operacji nie można
              cofnąć.
            </p>
          </div>
          <div className="settings-row-action">
            <button
              type="button"
              className="danger-button"
              onClick={() => {
                setDeleteError("");
                setDeleteConfirmPassword("");
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash2 size={16} /> Usuń konto
            </button>
          </div>
        </div>
      </section>

      {isDeleteModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsDeleteModalOpen(false)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <AlertTriangle size={20} className="danger-text" />
              <h3 id="delete-account-title">Usunąć konto?</h3>
            </div>
            <p className="modal-description">
              Zostanie usuniętych {stats.microclimatesCount} mikroklimatów i {stats.plantsCount} roślin. Wpisz hasło, aby
              potwierdzić.
            </p>

            <form onSubmit={handleDeleteAccount} className="form">
              {deleteError && <div className="error-box">{deleteError}</div>}
              <label>
                Hasło
                <input
                  type="password"
                  required
                  autoComplete="current-password"
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
                  {isDeletingAccount ? "Usuwanie…" : "Usuń na zawsze"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
