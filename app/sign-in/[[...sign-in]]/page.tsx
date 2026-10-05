import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="w-full flex justify-center py-8">
      <SignIn routing="path" path="/sign-in" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
