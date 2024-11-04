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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Reminder } from "@/types/reminder";

const formSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  description: z.string().optional(),
  due_date: z.string().min(1, "日付を入力してください"),
  repeat_interval: z.enum(["none", "daily", "weekly", "monthly", "yearly"]),
});

interface ReminderFormProps {
  petId: string;
  initialData?: Reminder;
  onSuccess?: () => void;
}

export function ReminderForm({ petId, initialData, onSuccess }: ReminderFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      due_date: initialData?.due_date || new Date().toISOString().split("T")[0],
      repeat_interval: initialData?.repeat_interval || "none",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (initialData) {
        const { error } = await supabase
          .from("reminders")
          .update({
            ...values,
            is_completed: initialData.is_completed,
          })
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("reminders").insert([
          {
            pet_id: petId,
            ...values,
            is_completed: false,
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
      setError("リマインダーの保存に失敗しました。もう一度お試しください。");
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>タイトル</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="予防接種の予定など" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>詳細</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="メモや詳細な情報を入力" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>期日</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="repeat_interval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>繰り返し</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="繰り返し間隔を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">繰り返しなし</SelectItem>
                    <SelectItem value="daily">毎日</SelectItem>
                    <SelectItem value="weekly">毎週</SelectItem>
                    <SelectItem value="monthly">毎月</SelectItem>
                    <SelectItem value="yearly">毎年</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit">
              {initialData ? "更新する" : "追加する"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}