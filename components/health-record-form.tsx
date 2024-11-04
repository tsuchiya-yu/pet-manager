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
import { HealthRecord } from "@/types/health-record";

const formSchema = z.object({
  date: z.string().min(1, "日付を入力してください"),
  weight: z.string().min(1, "体重を入力してください"),
  notes: z.string().optional(),
});

interface HealthRecordFormProps {
  petId: string;
  initialData?: HealthRecord;
  onSuccess?: () => void;
}

export function HealthRecordForm({ petId, initialData, onSuccess }: HealthRecordFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: initialData?.date || new Date().toISOString().split("T")[0],
      weight: initialData?.weight.toString() || "",
      notes: initialData?.notes || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (initialData) {
        // 編集の場合
        const { error } = await supabase
          .from("health_records")
          .update({
            date: values.date,
            weight: parseFloat(values.weight),
            notes: values.notes,
          })
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        // 新規作成の場合
        const { error } = await supabase.from("health_records").insert([
          {
            pet_id: petId,
            date: values.date,
            weight: parseFloat<boltAction type="file" filePath="components/health-record-form.tsx">(values.weight),
            notes: values.notes,
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
      setError("記録の保存に失敗しました。もう一度お試しください。");
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
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>体重 (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メモ</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit">
              {initialData ? "更新する" : "記録を追加"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}