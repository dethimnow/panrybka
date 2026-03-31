"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 px-4 text-center text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 25 L55 30 L35 35 L30 55 L25 35 L5 30 L25 25 Z' fill='%23fff'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div className="hero-animate-in relative z-10 max-w-3xl">
        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">Twój Przewodnik po Wędkarstwie</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-forest-100 md:text-xl">
          Testy sprzętu, porównania, poradniki i najlepsze łowiska — wszystko w jednym miejscu
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="min-w-[200px] bg-forest-500 hover:bg-forest-400">
            <Link href="/sprzet-wedkarski">Przeglądaj sprzęt</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="min-w-[200px] bg-water-500 hover:bg-water-400">
            <Link href="/poradniki">Czytaj poradniki</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
