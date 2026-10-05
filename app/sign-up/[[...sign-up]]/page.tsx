import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="w-full flex justify-center py-8">
      <SignUp routing="path" path="/sign-up" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
