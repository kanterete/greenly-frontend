import { createContext, useContext, useEffect, useState } from "react";

const PwaContext = createContext(null);

export function PwaProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

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

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker zarejestrowany pomyślnie:", registration.scope);
          })
          .catch((error) => {
            console.warn("[PWA] Rejestracja Service Workera nie powiodła się:", error);
          });
      });
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

  const value = {
    isInstallable: Boolean(deferredPrompt),
    isInstalled: isInstalled || isStandalone,
    isStandalone,
    isIos,
    installApp,
    deferredPrompt,
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
