"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { LanguageProvider } from "@/lib/language";
import * as React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Weather moves; NDVI does not. Per-query staleTime overrides this.
            staleTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // The page is read in direct sun; a colour-transition flash on load is worse
      // than an instant switch.
      disableTransitionOnChange
    >
      <QueryClientProvider client={client}>
        <LanguageProvider>{children}</LanguageProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
