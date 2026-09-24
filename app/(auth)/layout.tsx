import Header from "@/components/Header";

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <Header />
      <main className="flex justify-center pt-40">{children}</main>
    </>
  );
};

export default AuthLayout;
