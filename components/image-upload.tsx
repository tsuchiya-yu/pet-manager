"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface ImageUploadProps {
  value: string[];
  disabled?: boolean;
  onChange: (value: string[]) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
}

export function ImageUpload({
  value,
  disabled,
  onChange,
  onUploadStart,
  onUploadEnd,
}: ImageUploadProps) {
  const [error, setError] = useState<string>("");

  const onUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      try {
        onUploadStart();
        setError("");

        const file = event.target.files?.[0];
        if (!file) return;

        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from("pet-photos")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("pet-photos")
          .getPublicUrl(filePath);

        onChange([...value, publicUrl]);
      } catch (error: any) {
        setError("画像のアップロードに失敗しました。");
      } finally {
        onUploadEnd();
      }
    },
    [value, onChange, onUploadStart, onUploadEnd]
  );

  const onRemove = useCallback(
    (url: string) => {
      onChange(value.filter((current) => current !== url));
    },
    [onChange, value]
  );

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px]">
            <div className="absolute top-2 right-2 z-10">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="icon"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover rounded-lg"
              alt="Upload"
              src={url}
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        disabled={disabled}
        variant="outline"
        onClick={() => document.getElementById("image")?.click()}
      >
        <ImagePlus className="h-4 w-4 mr-2" />
        写真を追加
      </Button>
      <input
        id="image"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onUpload}
      />
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
}