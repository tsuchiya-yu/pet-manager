"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageUpload } from "./image-upload";
import { DiaryEntry } from "@/types/diary-entry";

const formSchema = z.object({
  date: z.string().min(1, "日付を入力してください"),
  content: z.string().min(1, "内容を入力してください"),
  photos: z.array(z.string()).optional(),
});

interface DiaryEntryFormProps {
  petId: string;
  initialData?: DiaryEntry;
  onSuccess?: () => void;
}

export function DiaryEntryForm({ petId, initialData, onSuccess }: DiaryEntryFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: initialData?.date || new Date().toISOString().split("T")[0],
      content: initialData?.content || "",
      photos: initialData?.photo_urls || [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (initialData) {
        // 編集の場合
        const { error } = await supabase
          .from("diary_entries")
          .update({
            date: values.date,
            content: values.content,
            photo_urls: values.photos,
          })
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        // 新規作成の場合
        const { error } = await supabase.from("diary_entries").insert([
          {
            pet_id: petId,
            date: values.date,
            content: values.content,
            photo_urls: values.photos,
          },
        ]);

        if (error) throw error;
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
        window.location.reload();
      }
    } catch (error: any) {
      setError("日記の保存に失敗しました。もう一度お試しください。");
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>日付</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>内容</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder="今日の出来事を記録しましょう..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="photos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>写真</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value || []}
                    disabled={uploading}
                    onChange={(urls) => field.onChange(urls)}
                    onUploadStart={() => setUploading(true)}
                    onUploadEnd={() => setUploading(false)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={uploading}>
              {initialData ? "更新する" : "保存する"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}