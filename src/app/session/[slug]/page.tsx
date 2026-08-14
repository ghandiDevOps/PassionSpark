/**
 * /session/[slug] — Route alias vers /s/[slug]
 *
 * Manus utilise /session/[slug] comme convention de nommage.
 * Cette route assure la compatibilité avec les liens Manus publiés.
 *
 * URL Manus : /session/trail-lever-jour → redirect /s/trail-lever-jour
 */

import { redirect } from "next/navigation";

interface Props {
  params: { slug: string };
}

export default function SessionAliasPage({ params }: Props) {
  redirect(`/s/${params.slug}`);
}
