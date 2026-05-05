"use client";

import { useEffect, useState } from "react";

export type BanFeature = {
  label: string;
  city: string;
  postcode: string;
  lat: number;
  lng: number;
  score: number;
};

type BanApiFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    label: string;
    city: string;
    postcode: string;
    score: number;
  };
};

const ENDPOINT = "https://api-adresse.data.gouv.fr/search/";
const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

export function useBanAutocomplete(query: string, limit = 5) {
  const [results, setResults] = useState<BanFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setError(null);
      return;
    }

    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${ENDPOINT}?q=${encodeURIComponent(trimmed)}&limit=${limit}&autocomplete=1`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error("BAN_HTTP_ERROR");
        const data = await res.json();
        const features: BanFeature[] = (data.features as BanApiFeature[]).map((f) => ({
          label:    f.properties.label,
          city:     f.properties.city,
          postcode: f.properties.postcode,
          lat:      f.geometry.coordinates[1],
          lng:      f.geometry.coordinates[0],
          score:    f.properties.score,
        }));
        setResults(features);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError("Recherche d'adresse indisponible");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query, limit]);

  return { results, loading, error };
}
