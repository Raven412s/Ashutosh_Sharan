import {
  Space_Mono,
  Stalinist_One,
  Quicksand,
} from "next/font/google";

// Mono font
export const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Heading & Display font
export const stalinistOne = Stalinist_One({
  variable: "--font-stalinist-one",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Body font - variable font covering weights 300 to 700 without loading discrete font files
export const quickSand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
});
