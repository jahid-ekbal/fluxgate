import SignInForm from "@/components/Auth/SignInForm";

export const metadata = { title: "Sign in" };

const SignInPage = () => {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <SignInForm />
    </div>
  );
};

export default SignInPage;
