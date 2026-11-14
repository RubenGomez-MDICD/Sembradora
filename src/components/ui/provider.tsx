"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/theme";
import { Toaster } from "@/components/ds/feedback";
import { GlosarioProvider } from "@/components/glosario";
import { RespaldoAutomatico } from "@/components/respaldo-automatico";
import { SitioInstalable } from "@/components/sitio-instalable";
import { EmotionRegistry } from "./emotion-registry";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRegistry>
      <ChakraProvider value={system}>
        <GlosarioProvider>{children}</GlosarioProvider>
        <Toaster />
        <RespaldoAutomatico />
        <SitioInstalable />
      </ChakraProvider>
    </EmotionRegistry>
  );
}
