"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name:  z.string().min(2, "Ton prénom doit faire au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  sessionId: string;
}

export function BookingForm({ sessionId }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onChange" });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Une erreur est survenue. Réessaie.");
        return;
      }

      router.push(
        `/book/${sessionId}/payment?client_secret=${json.clientSecret}&booking_id=${json.bookingId}&amount=${json.amountCents}`,
      );
    } catch {
      setError("Problème de connexion. Réessaie dans un instant.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Ton prénom"
        placeholder="Ton prénom"
        autoComplete="given-name"
        autoFocus
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        label="Ton email"
        type="email"
        placeholder="toi@email.com"
        autoComplete="email"
        error={errors.email?.message}
        hint="Tu recevras ton QR code ici"
        {...register("email")}
      />

      {error && (
        <div className="bg-[#FF3D00]/10 border border-[#FF3D00]/30 p-4">
          <p className="text-sm text-[#FF3D00]">{error}</p>
        </div>
      )}

      <div className="pt-4">
        <Button
          type="submit"
          loading={isLoading}
          disabled={!isValid}
          fullWidth
        >
          Continuer vers le paiement →
        </Button>
      </div>
    </form>
  );
}
