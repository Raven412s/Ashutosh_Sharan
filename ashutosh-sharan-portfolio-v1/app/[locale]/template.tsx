// import { PageTransition } from "@/components/transitions/PageTransition";

export default function Template({ children }: { children: React.ReactNode }) {
  // PageTransition detached for now - uncomment to re-enable
  // return <PageTransition>{children}</PageTransition>;
  return <>{children}</>;
}
