"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { SearchModal } from "@/components/layout/SearchModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Strona Główna" },
  { href: "/sprzet-wedkarski", label: "Sprzęt Wędkarski" },
  { href: "/poradniki", label: "Poradniki" },
  { href: "/miejsca", label: "Miejsca" },
];

export function Navbar() {
  const pathname = usePathname();
  const scrolled = useScrollPosition(12);
  const [mobileOpen, setMobileOpen] = useState(false);

  const active = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-transparent bg-forest-900/95 text-white backdrop-blur-md transition-shadow",
        scrolled && "shadow-lg shadow-black/20"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:h-16">
        <Link href="/" className="text-lg font-bold tracking-tight md:text-xl">
          🎣 PanRybka.pl
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Główna nawigacja">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-forest-100",
                active(l.href) && "underline decoration-forest-400 decoration-2 underline-offset-8"
              )}
            >
              {l.label}
            </Link>
          ))}
          <SearchModal />
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <SearchModal />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Zamknij menu" : "Otwórz menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      <div
        className={cn(
          "overflow-hidden border-t border-white/10 transition-all duration-300 md:hidden",
          mobileOpen ? "max-h-64" : "max-h-0 border-transparent"
        )}
      >
        <nav className="flex flex-col px-4 py-3" aria-label="Menu mobilne">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-3 text-sm font-medium hover:bg-white/10",
                active(l.href) && "bg-white/10 text-forest-200"
              )}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
