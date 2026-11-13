"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/theme";
import { Toaster } from "@/components/ds/feedback";
import { EmotionRegistry } from "./emotion-registry";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRegistry>
      <ChakraProvider value={system}>
        {children}
        <Toaster />
      </ChakraProvider>
    </EmotionRegistry>
  );
}
