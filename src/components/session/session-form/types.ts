export type SessionFormData = {
  // Étape 0 — Type
  sessionType: "discovery" | "progression";

  // Étape 1 — Infos
  title:       string;
  description: string;
  skillFocus:  string;
  domain:      "sport" | "music" | "cooking" | "language" | "business" | "art" | "other";
  category:    string;
  coverImageUrl: string;

  // Étape 2 — Date & heure
  dateStr:     string; // YYYY-MM-DD
  timeStr:     string; // HH:MM
  durationMin: 60 | 120;

  // Étape 3 — Lieu
  locationAddress: string;
  locationLat:     number;
  locationLng:     number;

  // Étape 4 — Tarif & places
  priceCents: number;
  maxSpots:   number;
};

export const INITIAL_FORM: SessionFormData = {
  sessionType:     "discovery",
  title:           "",
  description:     "",
  skillFocus:      "",
  domain:          "sport",
  category:        "",
  coverImageUrl:   "",
  dateStr:         "",
  timeStr:         "10:00",
  durationMin:     60,
  locationAddress: "",
  locationLat:     0,
  locationLng:     0,
  priceCents:      1500,
  maxSpots:        15,
};
