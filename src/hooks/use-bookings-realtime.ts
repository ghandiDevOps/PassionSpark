"use client";

import { useEffect } from "react";
import { subscribeToSessionBookings } from "@/lib/supabase";

export function useBookingsRealtime(sessionId: string, onBookingUpdate: (payload: any) => void) {
  useEffect(() => {
    const channel = subscribeToSessionBookings(sessionId, onBookingUpdate);
    return () => { channel.unsubscribe(); };
  }, [sessionId, onBookingUpdate]);
}
