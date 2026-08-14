/**
 * /devenir-coach — Route alias vers /onboarding
 *
 * Manus a construit une page /devenir-coach (éditoriale, dark "Atelier Minuit").
 * Cette route assure la compatibilité avec les liens Manus.
 *
 * À terme : remplacer le redirect par le contenu Manus intégré.
 */

import { redirect } from "next/navigation";

export const metadata = {
  title: "Devenir coach · Passion Spark",
  description: "Partagez votre passion. Publiez vos sessions. Recevez vos paiements.",
};

export default function DevenirCoachPage() {
  redirect("/onboarding");
}
