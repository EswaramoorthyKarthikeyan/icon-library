import type { IconData } from './types';

export const EXTENDED_LIBRARY: Record<string, IconData[]> = {
  Development: [
    { id: "dev-terminal", name: "terminal", category: "Development", svgPath: "M4 17l6-6-6-6M12 19h8" },
    { id: "dev-database", name: "database", category: "Development", svgPath: "M12 21c5.52 0 10-1.79 10-4V7c0-2.21-4.48-4-10-4S2 4.79 2 7v10c0 2.21 4.48 4 10 4z M2 7c0 2.21 4.48 4 10 4s10-1.79 10-4 M2 14c0 2.21 4.48 4 10 4s10-1.79 10-4" },
    { id: "dev-branch", name: "code_branch", category: "Development", svgPath: "M6 3v12M18 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM18 9a9 9 0 01-9 9" },
    { id: "dev-bug", name: "bug", category: "Development", svgPath: "M8 14 A 4 4 0 1 0 16 14 A 4 4 0 1 0 8 14 M12 6 v 4 M12 18 v 4 M4 11 l 4 1 M20 11 l -4 1 M6 18 l 3 -2 M18 18 l -3 -2 M9 6 a 3 3 0 0 1 6 0" },
    { id: "dev-code", name: "code", category: "Development", svgPath: "M16 18l6-6-6-6M8 6l-6 6 6 6" },
    { id: "dev-git-commit", name: "git_commit", category: "Development", svgPath: "M12 16a4 4 0 100-8 4 4 0 000 8z M12 8V2 M12 16v6" },
    { id: "dev-git-merge", name: "git_merge", category: "Development", svgPath: "M12 18a3 3 0 100-6 3 3 0 000 6z M6 21V9a3 3 0 10-6 0 M6 9c0-3.3 2.7-6 6-6v3" },
    { id: "dev-git-pull-req", name: "git_pull_request", category: "Development", svgPath: "M18 21v-6c0-3.3-2.7-6-6-6h-3M9 12l-3-3 3-3 M6 21a3 3 0 100-6 3 3 0 000 6z M18 9a3 3 0 100-6 3 3 0 000 6z" },
    { id: "dev-layout", name: "layout_code", category: "Development", svgPath: "M21 3H3v18h18V3z M21 9H3 M9 21V9" },
    { id: "dev-layers", name: "code_layers", category: "Development", svgPath: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" }
  ],

  Health: [
    { id: "hlt-pulse", name: "heartbeat", category: "Health", svgPath: "M22 12h-4l-3 9L9 3l-3 9H2" },
    { id: "hlt-pill", name: "pill", category: "Health", svgPath: "M10.5 20.5l-6-6a4.95 4.95 0 117-7l6 6a4.95 4.95 0 11-7 7z M8.5 7.5l8 8" },
    { id: "hlt-aid", name: "first_aid", category: "Health", svgPath: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 2H8v5h8V2z M12 11v6 M9 14h6" },
    { id: "hlt-syringe", name: "syringe", category: "Health", svgPath: "M18 2l4 4M21.5 2.5L2 22 M16 4l4 4 M14 6l4 4 M10 10l4 4 M6 14l4 4" },
    { id: "hlt-activity", name: "activity", category: "Health", svgPath: "M22 12h-4l-3 9L9 3l-3 9H2" },
    { id: "hlt-cross", name: "cross", category: "Health", svgPath: "M12 2v20 M2 12h20" },
    { id: "hlt-dna", name: "dna_helix", category: "Health", svgPath: "M2 4s8 6 10 6 10-6 10-6 M2 20s8-6 10-6 10 6 10 6 M7 6.5v11 M17 6.5v11 M12 10v4" },
    { id: "hlt-test-tube", name: "test_tube", category: "Health", svgPath: "M9 2v16a3 3 0 006 0V2 M6 2h12 M9 10h6 M12 16v1" },
    { id: "hlt-thermometer", name: "thermometer_alt", category: "Health", svgPath: "M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z M12 10v5.5" },
    { id: "hlt-microscope", name: "microscope", category: "Health", svgPath: "M14 4h-4M12 4v8M16 12l-4 4-4-4M6 18h12M12 22v-4" }
  ],

  Transport: [
    { id: "trp-car", name: "car", category: "Transport", svgPath: "M4 14a2 2 0 11-4 0 2 2 0 014 0zm18 0a2 2 0 11-4 0 2 2 0 014 0z M2 14h2 M6 14h10 M18 14h2 M4 10l2-4h8z" },
    { id: "trp-bus", name: "bus", category: "Transport", svgPath: "M4 16a2 2 0 11-4 0 2 2 0 014 0zm18 0a2 2 0 11-4 0 2 2 0 014 0z M2 16h2 M6 16h10 M18 16h2 M4 10h16M8 4h8 M2 8v8a4 4 0 004 4h12a4 4 0 004-4V8A4 4 0 0018 4H6a4 4 0 00-4 4z" },
    { id: "trp-truck", name: "truck", category: "Transport", svgPath: "M16 3H1v13h15V3zM16 8h4l3 4v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm13 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },
    { id: "trp-train", name: "train", category: "Transport", svgPath: "M4 15h16 M2 18h20 M6 4h12a2 2 0 012 2v9H4V6a2 2 0 012-2zM8 4v7M16 4v7M12 18v4M8 11h8" },
    { id: "trp-ship", name: "ship", category: "Transport", svgPath: "M2 20h20l-2-6H4l-2 6z M12 14V4 M8 14V8 M16 14v-4 M10 4h4" },
    { id: "trp-airplane", name: "airplane", category: "Transport", svgPath: "M21 12l-7 3-6-5-4 2 2 5-2 3h16z M21 12l-7-3-6 5-4-2 2-5-2-3h16z M14 9v6 M10 7v10" },
    { id: "trp-bicycle", name: "bicycle", category: "Transport", svgPath: "M5 18a4 4 0 11-8 0 4 4 0 018 0zm18 0a4 4 0 11-8 0 4 4 0 018 0z M12 18l3-6l2-2 M6.5 12l2.5-4h4.5 M8 7h-2" },
    { id: "trp-rocket", name: "rocket", category: "Transport", svgPath: "M21 3l-6 6M21 3c-1 4-3 7-5 9l-4-4c2-2 5-4 9-5zM12 16l-3-3M9 13L2 15l4-2M15 9V2l-2 4M9 13L2 15l4-2" },
    { id: "trp-subway", name: "subway", category: "Transport", svgPath: "M6 2h12a2 2 0 012 2v10H4V4a2 2 0 012-2zM4 14l-2 4h20l-2-4 M8 20v2M16 20v2M8 8h8M4 14h16" },
    { id: "trp-anchor", name: "anchor_alt", category: "Transport", svgPath: "M12 22V8M5 12H2a10 10 0 0020 0h-3M12 8a3 3 0 100-6 3 3 0 000 6z" }
  ],

  Food: [
    { id: "fod-coffee", name: "coffee", category: "Food", svgPath: "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z M6 1v3M10 1v3M14 1v3" },
    { id: "fod-pizza", name: "pizza", category: "Food", svgPath: "M12 21L2 3h20L12 21z M12 21a10 10 0 0010-18 M12 11v2M8 7v2M16 7v2" },
    { id: "fod-apple", name: "apple", category: "Food", svgPath: "M14 11A8 8 0 114 11c0-4 4-6 8-6s8 2 8 6z M12 5V1 M12 1C10 2 10 5 12 5" },
    { id: "fod-glass", name: "glass", category: "Food", svgPath: "M5 2h14v7a7 7 0 01-14 0V2z M12 9v13 M8 22h8" },
    { id: "fod-cutlery", name: "cutlery", category: "Food", svgPath: "M6 2v6a3 3 0 003 3v11 M9 2v6 M3 2v6 M18 2v20 M18 2c-3 0-3 8-3 8h3" },
    { id: "fod-chef", name: "chef_hat", category: "Food", svgPath: "M6 13V9a6 6 0 1112 0v4 M4 13h16v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4z" },
    { id: "fod-bottle", name: "bottle", category: "Food", svgPath: "M10 2h4v4h-4z M10 6l-2 4v12h8V10l-2-4 M8 12h8" },
    { id: "fod-bowl", name: "bowl", category: "Food", svgPath: "M2 12a10 10 0 0020 0H2z M12 12V2 M4 12V7M20 12V7" },
    { id: "fod-cake", name: "cake", category: "Food", svgPath: "M2 13h20v9H2v-9z M2 13s2-3 4-3 2 3 4 3 2-3 4-3 2 3 4 3 M12 2v6 M10 2h4" },
    { id: "fod-martini", name: "martini", category: "Food", svgPath: "M2 2l10 10L22 2H2z M12 12v10 M8 22h8 M6 6h12" }
  ],

  Smart_Home: [
    { id: "smt-bulb", name: "lightbulb", category: "Smart_Home", svgPath: "M9 18h6 M10 22h4 M15 11c0 3-3 5-3 7H9c0-2-3-4-3-7a6 6 0 1112 0z" },
    { id: "smt-thermostat", name: "home_thermostat", category: "Smart_Home", svgPath: "M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z M9 9h6 M9 6h4 M12 16a1 1 0 100-2 1 1 0 000 2z" },
    { id: "smt-plug", name: "power_plug", category: "Smart_Home", svgPath: "M12 22v-6 M8 7v4a4 4 0 108 0V7 M10 2v5 M14 2v5" },
    { id: "smt-outlet", name: "power_outlet", category: "Smart_Home", svgPath: "M4 4h16v16H4V4z M9 10h.01 M15 10h.01 M12 14h.01M12 18v-4" },
    { id: "smt-fan", name: "smart_fan", category: "Smart_Home", svgPath: "M12 12 a 2 2 0 1 0 0 -4 a 2 2 0 0 0 0 4 z M12 12 l 4 -4 a 4 4 0 0 1 1 5 l -5 -1 z M12 12 l -4 4 a 4 4 0 0 1 -1 -5 l 5 1 z M12 12 l 4 4 a 4 4 0 0 0 1 -5 l -5 1 z M12 12 l -4 -4 a 4 4 0 0 0 -1 5 l 5 -1 z" },
    { id: "smt-door", name: "door", category: "Smart_Home", svgPath: "M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18 H4h16 M14 12v2" },
    { id: "smt-window", name: "window", category: "Smart_Home", svgPath: "M4 4h16v16H4V4z M12 4v16 M4 12h16" },
    { id: "smt-lock", name: "smart_lock", category: "Smart_Home", svgPath: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zm-7 6v-2M7 11V7a5 5 0 0110 0v4 M2 11h2 M20 11h2" },
    { id: "smt-bell", name: "doorbell", category: "Smart_Home", svgPath: "M12 22A6 6 0 1012 10a6 6 0 000 12z M12 14v4M10 16h4" },
    { id: "smt-camera", name: "cctv", category: "Smart_Home", svgPath: "M9 6H3l2 4v11h14V10l2-4h-6 M12 10v6 M10 16h4" }
  ]
};
