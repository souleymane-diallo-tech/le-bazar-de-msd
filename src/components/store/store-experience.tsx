"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowUp, WifiOff } from "lucide-react";

function subscribeNetwork(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function StoreExperience() {
  const online = useSyncExternalStore(
    subscribeNetwork,
    () => navigator.onLine,
    () => true,
  );
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 700);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <>
      {!online && (
        <div
          role="status"
          className="mx-auto flex max-w-7xl items-start gap-2 border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          <WifiOff size={20} className="shrink-0" aria-hidden="true" />
          Connexion interrompue. Votre saisie reste affichée ; réessayez une
          fois reconnecté.
        </div>
      )}
      {scrolled && (
        <button
          type="button"
          aria-label="Revenir en haut de la page"
          className="fixed bottom-32 right-4 z-20 flex size-11 items-center justify-center rounded-full border border-primary/25 bg-white text-primary shadow-md lg:bottom-6"
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
            });
            document
              .querySelector<HTMLElement>(".skip-link")
              ?.focus({ preventScroll: true });
          }}
        >
          <ArrowUp size={20} aria-hidden="true" />
        </button>
      )}
    </>
  );
}
