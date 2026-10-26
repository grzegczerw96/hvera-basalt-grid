# HVERA — Basalt Grid

Koncepcyjna strona fikcyjnej islandzkiej firmy geotermalnej HVERA (poszukiwania, odwierty do 5 km, elektrownie, ciepłownictwo).
Wersja V1: szwajcarska siatka, Inter + Geist Mono, akcent siarkowy; Depth jako tarcza z podziałką.

Strona: https://grzegczerw96.github.io/hvera-basalt-grid/

- HTML + CSS + GSAP 3.13 (ScrollTrigger, SplitText, CustomEase) + Lenis, bez frameworka i bez buildu.
- Jednostki względne: `1u = clamp(min, min(100vw / dw, 100svh / dh), max)`, wszystko w em od u.
  Desktop 1440×900, tablet 834×1080, telefon 390×660 (Safari 100svh). Breakpointy to container queries.
- Każda sekcja to dokładnie jeden ekran albo zaplanowana wielokrotność (piny, sekcje na 2 ekrany).
- `prefers-reduced-motion` wyłącza smooth scroll, loader i animacje odsłaniania.

Pozostałe wersje: [Magma Core](https://grzegczerw96.github.io/hvera-magma-core/) · [Steam Editorial](https://grzegczerw96.github.io/hvera-steam-editorial/)

Zdjęcia: Pexels (licencja Pexels), ID: 5469873, 464390, 31896523, 11968565, 18199392, 37066100, 15391048,
21047659, 29411310, 32845660, 15202606, 4338175, 6731385. Fonty: Google Fonts (OFL).
Marka, teksty i liczby są fikcyjne.
