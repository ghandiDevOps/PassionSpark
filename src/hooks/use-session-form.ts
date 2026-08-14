'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { INITIAL_FORM, type SessionFormData } from '@/components/session/session-form/types';

const TOTAL_STEPS = 6;

function validateStep(step: number, data: SessionFormData): string | null {
  switch (step) {
    case 0: return null;
    case 1:
      if (!data.category)              return 'Sélectionne une catégorie.';
      if (data.title.length < 5)       return 'Le titre doit faire au moins 5 caractères.';
      if (data.skillFocus.length < 3)  return 'Décris la compétence ciblée.';
      if (data.description.length < 20) return 'La description doit faire au moins 20 caractères.';
      return null;
    case 2:
      if (!data.dateStr) return 'Choisis une date.';
      if (!data.timeStr) return 'Choisis une heure.';
      return null;
    case 3:
      if (data.locationAddress.length < 5) return "Renseigne l'adresse du lieu.";
      if (data.locationLat === 0 || data.locationLng === 0) {
        return 'Sélectionne une adresse dans les suggestions pour la géolocaliser.';
      }
      return null;
    default: return null;
  }
}

export function useSessionForm() {
  const router  = useRouter();
  const [step,    setStep]    = useState(0);
  const [data,    setData]    = useState<SessionFormData>(INITIAL_FORM);
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const patch = useCallback((updates: Partial<SessionFormData>) => {
    setData((prev) => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  const goNext = useCallback(() => {
    const err = validateStep(step, data);
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, data]);

  const goPrev = useCallback(() => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goToStep = useCallback((target: number) => {
    setError(null);
    setStep(target);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const submit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dateStart = new Date(`${data.dateStr}T${data.timeStr}:00`).toISOString();
      const payload = {
        sessionType:     data.sessionType,
        title:           data.title,
        description:     data.description,
        skillFocus:      data.skillFocus,
        domain:          data.domain,
        category:        data.category,
        coverImageUrl:   data.coverImageUrl,
        dateStart,
        durationMin:     data.durationMin,
        locationAddress: data.locationAddress,
        locationLat:     data.locationLat,
        locationLng:     data.locationLng,
        priceCents:      data.priceCents,
        maxSpots:        data.maxSpots,
      };

      const res  = await fetch('/api/sessions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) { setError(json.error ?? 'Une erreur est survenue.'); return; }
      router.push(`/sessions/${json.session.id}?created=1`);
    } catch {
      setError('Erreur réseau. Réessaie.');
    } finally {
      setLoading(false);
    }
  }, [data, router]);

  const progress    = Math.round(((step + 1) / TOTAL_STEPS) * 100);
  const isLastStep  = step === TOTAL_STEPS - 1;

  return {
    step, goNext, goPrev, goToStep,
    data, patch,
    error,
    loading, submit,
    progress, isLastStep,
  };
}
