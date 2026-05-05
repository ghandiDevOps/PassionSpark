import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link href="/" className="font-display text-3xl text-white hover:text-[#FF7A00] transition-colors">
            PASSION SPARK
          </Link>
          <p className="text-[#888] text-sm mt-1">Connecte-toi à ton espace</p>
        </div>
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          forceRedirectUrl="/api/auth/redirect"
          appearance={{
            variables: {
              colorBackground:    "#1e1e1e",
              colorText:          "#ffffff",
              colorTextSecondary: "#888888",
              colorInputBackground: "#2a2a2a",
              colorInputText:     "#ffffff",
              colorPrimary:       "#FF7A00",
              borderRadius:       "2px",
            },
            elements: {
              card:              "shadow-none border border-[#2a2a2a]",
              headerTitle:       "hidden",
              headerSubtitle:    "hidden",
              formButtonPrimary: "btn-passion",
              socialButtonsBlockButton: "border border-[#2a2a2a] bg-[#2a2a2a] text-white hover:bg-[#333]",
              footerAction:      "text-[#555]",
              footerActionLink:  "text-[#FF7A00] hover:text-[#FF3D00]",
            },
          }}
        />
      </div>
    </main>
  );
}
