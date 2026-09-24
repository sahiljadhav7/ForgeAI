import Header from "@/components/Header";
import { Glow } from "@/components/reusable";

// The landing CTA's dawn: lavender falling from the top, peach rising from
// the bottom. The Clerk card itself is themed by the provider's appearance
// (lib/clerk-appearance.ts). Vertical padding clears the 64px header and
// centres the card in the viewport, a touch above the space under the header.
const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <Header />
      <main className="relative isolate flex min-h-dvh items-center justify-center px-4 py-20">
        <Glow tone="lavender" className="h-[60%]" />
        <Glow tone="peach" className="h-[60%]" />
        {children}
      </main>
    </>
  );
};

export default AuthLayout;
