import SignUpForm from "@/components/Auth/SignUpForm";

export const metadata = { title: "Sign up" };

const SignUpPage = () => {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;
