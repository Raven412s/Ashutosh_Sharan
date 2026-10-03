"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  useEffect,
  ReactNode,
} from "react";
import { PRELOADER_CONFIG } from "@/config/preloader";
import { useSmoothScroll } from "./SmoothScrollProvider";

interface PreloaderContextType {
  isLoading: boolean;
  completePreloader: () => void;
  hasPlayedSession: boolean;
}

const PreloaderContext = createContext<PreloaderContextType>({
  isLoading: false,
  completePreloader: () => {},
  hasPlayedSession: true,
});

export const usePreloader = () => useContext(PreloaderContext);

let inMemoryDevCompleted = false;
const preloaderListeners = new Set<() => void>();

function notifyListeners() {
  preloaderListeners.forEach((listener) => listener());
}

function checkIsPreloaderDone(): boolean {
  if (!PRELOADER_CONFIG.ENABLED) return true;
  if (typeof window === "undefined") return false;

  const isDev = process.env.NODE_ENV === "development";
  const forceInDev = PRELOADER_CONFIG.FORCE_IN_DEV;

  if (isDev && forceInDev) {
    return inMemoryDevCompleted;
  }

  return sessionStorage.getItem(PRELOADER_CONFIG.STORAGE_KEY) === "true";
}

export function PreloaderProvider({ children }: { children: ReactNode }) {
  const { stop, start } = useSmoothScroll();

  const isPreloaderDone = useSyncExternalStore(
    (callback) => {
      preloaderListeners.add(callback);
      return () => {
        preloaderListeners.delete(callback);
      };
    },
    checkIsPreloaderDone,
    () => !PRELOADER_CONFIG.ENABLED
  );

  const isLoading = !isPreloaderDone;

  useEffect(() => {
    if (isLoading) {
      stop();
    } else {
      start();
    }
  }, [isLoading, stop, start]);

  const completePreloader = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(PRELOADER_CONFIG.STORAGE_KEY, "true");
    }
    inMemoryDevCompleted = true;
    notifyListeners();
  }, []);

  return (
    <PreloaderContext.Provider
      value={{
        isLoading,
        completePreloader,
        hasPlayedSession: isPreloaderDone,
      }}
    >
      {children}
    </PreloaderContext.Provider>
  );
}
