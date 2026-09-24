import React from "react";
import Header from "@/components/Header";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <Header />
      <main className="mt-16">{children}</main>
    </>
  );
};

export default layout;
