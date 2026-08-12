import { redirect } from "next/navigation";

// Profile editor page — not yet implemented.
// Redirect to onboarding which covers the same ground (bio, domain, photo)
// until a dedicated profile editing UI is built.
export default function ProfilePage() {
  redirect("/onboarding");
}
