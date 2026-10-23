import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="w-full flex justify-center py-8">
      <SignIn
        routing="path"
        path="/sign-in"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-dark-900 border border-white/[0.06] shadow-glass rounded-2xl",
            headerTitle: "text-white font-bold",
            headerSubtitle: "text-slate-400",
            socialButtonsBlockButton:
              "bg-dark-800 border border-white/[0.06] text-white hover:bg-dark-700",
            formFieldInput:
              "bg-dark-800 border border-white/[0.06] text-white focus:border-brand-cyan focus:ring-brand-cyan/20 rounded-lg",
            formFieldLabel: "text-slate-400",
            formButtonPrimary:
              "bg-gradient-brand hover:opacity-90 rounded-lg font-bold",
            footerActionLink: "text-brand-cyan hover:text-brand-cyan-light",
            identityPreviewEditButton: "text-brand-cyan",
            formFieldInputShowPasswordButton: "text-slate-400",
          },
        }}
      />
    </div>
  );
}
