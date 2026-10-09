import { frijole, passeroOne, rubikMaze } from "./fonts";

export default function FontsLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${passeroOne.variable} ${rubikMaze.variable} ${frijole.variable}`}>
      {children}
    </div>
  );
}
