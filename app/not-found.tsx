import Header from "@/components/Header";

// Next's default 404 used to render inside the root layout's Header and
// <main>. The root layout no longer provides them, so this page restores them
// around a copy of the default 404 markup.
const NotFound = () => {
  return (
    <>
      <title>404: This page could not be found.</title>
      <Header />
      <main className="flex h-screen flex-col items-center justify-center text-center">
        <div>
          <h1 className="mr-5 inline-block border-r border-white/30 pr-[23px] align-top text-2xl leading-[49px] font-medium">
            404
          </h1>
          <div className="inline-block">
            <h2 className="m-0 text-sm leading-[49px] font-normal">
              This page could not be found.
            </h2>
          </div>
        </div>
      </main>
    </>
  );
};

export default NotFound;
