import {
  Space_Mono,
  Stalinist_One,
  Passero_One,
  Rubik_Maze,
  Frijole,
  Quicksand,
} from "next/font/google";

// Mono font
export const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

// Heading & Display fonts
export const stalinistOne = Stalinist_One({
  variable: "--font-stalinist-one",
  weight: "400",
  subsets: ["latin"],
});

export const passeroOne = Passero_One({
  variable: "--font-passero-one",
  weight: "400",
  subsets: ["latin"],
});

export const rubikMaze = Rubik_Maze({
  variable: "--font-rubik-maze",
  weight: "400",
  subsets: ["latin"],
});

export const frijole = Frijole({
  variable: "--font-frijole",
  weight: "400",
  subsets: ["latin"],
});

// Body font
export const quickSand = Quicksand({
  variable: "--font-quicksand",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});
