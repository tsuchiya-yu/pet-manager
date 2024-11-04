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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pet } from "@/types/pet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  name: z.string().min(1, "ペットの名前を入力してください"),
  species: z.string().min(1, "種類を選択してください"),
  breed: z.string().min(1, "品種を入力してください"),
  birthdate: z.string().min(1, "誕生日を入力してください"),
  gender: z.string().min(1, "性別を選択してください"),
});

export default function EditPetPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      birthdate: "",
      gender: "",
    },
  });

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const { data: pet, error } = await supabase
          .from("pets")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) throw error;
        setPet(pet);
        form.reset({
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          birthdate: pet.birthdate,
          gender: pet.gender,
        });
      } catch (error) {
        console.error("Error fetching pet:", error);
        setError("ペット情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [params.id, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { error } = await supabase
        .from("pets")
        .update(values)
        .eq("id", params.id);

      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      setError("ペット情報の更新に失敗しました。もう一度お試しください。");
    }
  }

  async function onDelete() {
    try {
      const { error } = await supabase
        .from("pets")
        .delete()
        .eq("id", params.id);

      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      setError("ペットの削除に失敗しました。もう一度お試しください。");
    }
  }

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!pet) {
    return <div>ペットが見つかりません</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">ペット情報の編集</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">削除</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                この操作は取り消すことができません。ペットの情報、健康記録、日記がすべて削除されます。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                削除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>名前</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="species"
            render={({ field }) => (
              <FormItem>
                <FormLabel>種類</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="種類を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dog">犬</SelectItem>
                    <SelectItem value="cat">猫</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>品種</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthdate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>誕生日</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>性別</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="性別を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">オス</SelectItem>
                    <SelectItem value="female">メス</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              キャンセル
            </Button>
            <Button type="submit">更新</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}