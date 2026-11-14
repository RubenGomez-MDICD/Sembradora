"use client";

import { Button } from "@chakra-ui/react";
import { RefreshCw } from "lucide-react";

export function Reintentar() {
  return (
    <Button size="lg" onClick={() => location.reload()}>
      <RefreshCw aria-hidden /> Intentar otra vez
    </Button>
  );
}
