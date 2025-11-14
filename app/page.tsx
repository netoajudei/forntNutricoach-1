"use client";

import Home from "@landing/pages/Home";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@landing/lib/queryClient";
import { TooltipProvider } from "@landing/components/ui/tooltip";
import { Toaster } from "@landing/components/ui/toaster";

export default function HomePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Home />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

