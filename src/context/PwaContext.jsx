import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
import { urlBase64ToUint8Array } from "../utils/push";

const PwaContext = createContext(null);

function withTimeout(promise, ms, message) {
  let timerId;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timerId);
  });
}

export function PwaProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  // Push Notifications state
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPushLoading, setIsPushLoading] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed PWA)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(Boolean(isStandaloneMode));
      if (isStandaloneMode) {
        setIsInstalled(true);
      }
    };

    checkStandalone();

    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Check Push notification support
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setIsPushSupported(supported);

    if (supported) {
      setPushPermission(Notification.permission);
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(Boolean(sub));
        });
      });
    }

    // Register Service Worker reliably (even if window 'load' event has already fired)
    let onLoadHandler = null;
    if ("serviceWorker" in navigator) {
      const registerSw = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker zarejestrowany pomyślnie:", registration.scope);
          })
          .catch((error) => {
            console.warn("[PWA] Rejestracja Service Workera nie powiodła się:", error);
          });
      };

      if (document.readyState === "complete") {
        registerSw();
      } else {
        onLoadHandler = registerSw;
        window.addEventListener("load", onLoadHandler);
      }
    }

    // Catch the install prompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("[PWA] Złapano zdarzenie beforeinstallprompt");
    };

    // Catch app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log("[PWA] Aplikacja Greenly została zainstalowana");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      if (onLoadHandler) {
        window.removeEventListener("load", onLoadHandler);
      }
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error("[PWA] Błąd podczas instalacji:", err);
      return false;
    }
  };

  const subscribeToPush = async () => {
    if (!isPushSupported) {
      if (isIos && !isStandalone) {
        throw new Error(
          "Na iPhone/iPad powiadomienia Push działają dopiero po dodaniu aplikacji do ekranu głównego (Udostępnij → Do ekranu początkowego) i otwarciu jej z ikony."
        );
      }
      throw new Error("Powiadomienia Push nie są wspierane w Twojej przeglądarce.");
    }

    setIsPushLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === "denied") {
        throw new Error(
          "Powiadomienia zostały zablokowane w ustawieniach przeglądarki. Odblokuj je w ustawieniach witryny (ikona kłódki obok adresu)."
        );
      }

      if (permission !== "granted") {
        throw new Error("Nie wyrażono zgody na odbieranie powiadomień w przeglądarce.");
      }

      const { publicKey } = await withTimeout(
        api.getVapidPublicKey(),
        25000,
        "Serwer nie odpowiedział na czas (może się wybudzać na Renderze). Spróbuj ponownie za chwilę."
      );
      if (!publicKey) {
        throw new Error("Brak klucza publicznego VAPID z serwera.");
      }

      const existingReg = await navigator.serviceWorker.getRegistration();
      if (!existingReg) {
        await navigator.serviceWorker.register("/sw.js");
      }

      const reg = await withTimeout(
        navigator.serviceWorker.ready,
        12000,
        "Service Worker nie uruchomił się na czas. Zamknij i uruchom ponownie aplikację."
      );
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await withTimeout(
          reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey,
          }),
          15000,
          "Przeglądarka nie odpowiedziała podczas rejestracji powiadomień Push (sprawdź ustawienia przeglądarki lub połączenie z usługą Push)."
        );
      }

      await withTimeout(
        api.subscribePush(sub.toJSON()),
        20000,
        "Nie udało się zapisać subskrypcji na serwerze (przekroczono czas oczekiwania)."
      );
      setIsSubscribed(true);
      return true;
    } finally {
      setIsPushLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!isPushSupported) return;

    setIsPushLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.unsubscribePush(sub.endpoint).catch(console.warn);
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
    } finally {
      setIsPushLoading(false);
    }
  };

  const sendTestPushNotification = async () => {
    return await api.sendTestPush();
  };

  const value = {
    isInstallable: Boolean(deferredPrompt),
    isInstalled: isInstalled || isStandalone,
    isStandalone,
    isIos,
    installApp,
    deferredPrompt,

    // Push Notifications
    isPushSupported,
    pushPermission,
    isSubscribed,
    isPushLoading,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestPushNotification,
  };

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export const usePwa = () => {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error("usePwa musi być użyty wewnątrz PwaProvider");
  }
  return context;
};
