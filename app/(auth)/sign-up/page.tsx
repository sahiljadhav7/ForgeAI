import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const SignUpPage = async () => {
  const { userId } = await auth();

  // Clerk cannot display a signup flow for an authenticated user in
  // single-session mode. Send them to the app instead of rendering it.
  if (userId) redirect("/");

  return <SignUp />;
};
export default SignUpPage;
