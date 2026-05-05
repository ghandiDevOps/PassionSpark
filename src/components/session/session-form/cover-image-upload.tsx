"use client";

import { useState, useRef } from "react";
import { supabaseClient } from "@/lib/supabase";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function CoverImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      setError(null);

      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("sessions")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabaseClient.storage
        .from("sessions")
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="font-display-md text-xs text-[#888] tracking-widest block uppercase">
        Image de couverture
      </label>
      
      <div 
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative aspect-video w-full border-2 border-dashed border-[#2a2a2a] bg-[#1e1e1e] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors hover:border-[#FF7A00]/50 ${value ? 'border-none' : ''}`}
      >
        {value ? (
          <>
            <Image 
              src={value} 
              alt="Cover" 
              fill 
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-white text-xs font-display-md">CHANGER L'IMAGE</span>
            </div>
          </>
        ) : (
          <div className="text-center p-6">
            {uploading ? (
              <Spinner className="w-8 h-8 text-[#FF7A00]" />
            ) : (
              <>
                <p className="text-[#FF7A00] text-2xl mb-1">+</p>
                <p className="text-[#666] text-xs font-sans">
                  Format 16:9 recommandé<br />(JPG, PNG, WebP)
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-[#FF3D00] text-xs font-sans mt-1">{error}</p>}

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
