import Header from "@/components/Header";

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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60%] bg-(image:--db-glow-lavender)"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[60%] bg-(image:--db-glow-peach)"
        />
        {children}
      </main>
    </>
  );
};

export default AuthLayout;
