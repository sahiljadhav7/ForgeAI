import React from "react";

// Bare wrapper: no global Header and no top offset, so the landing hero owns
// the top of the viewport. The page renders its own <main>.
const LandingLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <>{children}</>;
};

export default LandingLayout;
