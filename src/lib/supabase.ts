import { createClient } from "@supabase/supabase-js";

// Client Supabase côté client (anon key — accès limité par RLS)
// ⚠️ Ce fichier est importé par des Client Components — ne jamais y mettre de clé secrète
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/**
 * Abonnement Realtime sur les changements de spots_taken d'une session
 * Usage côté client dans use-spots-realtime.ts
 */
export function subscribeToSessionSpots(
  sessionId: string,
  onUpdate: (spotsTaken: number) => void,
) {
  return supabaseClient
    .channel(`session-spots-${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "sessions",
        filter: `id=eq.${sessionId}`,
      },
      (payload) => {
        const spotsTaken = (payload.new as { spots_taken: number }).spots_taken;
        onUpdate(spotsTaken);
      },
    )
    .subscribe();
}

/**
 * Abonnement Realtime sur les changements de réservations d'une session
 */
export function subscribeToSessionBookings(sessionId: string, onUpdate: (payload: any) => void) {
  return supabaseClient.channel('session-bookings-' + sessionId).on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: 'sessionId=eq.' + sessionId }, onUpdate).subscribe();
}
