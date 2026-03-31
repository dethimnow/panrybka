"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function AdminSignOut() {
  return (
    <Button type="button" variant="ghost" className="h-auto p-0 text-white hover:bg-transparent hover:underline" onClick={() => signOut({ callbackUrl: "/" })}>
      Wyloguj
    </Button>
  );
}
