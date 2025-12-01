"use client";

import { ReactNode } from "react";
import { SessionProvider } from "./SessionProvider";
import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { useServiceWorker } from "@/hooks/useServiceWorker";

interface Props {
  children: ReactNode;
}

function ServiceWorkerProvider({ children }: Props) {
  useServiceWorker();
  return <>{children}</>;
}

export function Providers({ children }: Props) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ServiceWorkerProvider>
          {children}
        </ServiceWorkerProvider>
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
}
