"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { DiaryEntry } from "@/types/diary-entry";
import { Card } from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DiaryEntryForm } from "./diary-entry-form";

export function DiaryEntryList({ petId }: { petId: string }) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("diary_entries")
        .select("*")
        .eq("pet_id", petId)
        .order("date", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching diary entries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [petId]);

  const handleDelete = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from("diary_entries")
        .delete()
        .eq("id", entryId);

      if (error) throw error;
      await fetchEntries();
    } catch (error) {
      console.error("Error deleting diary entry:", error);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (entries.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        まだ日記がありません。「日記を書く」ボタンから記録を追加してください。
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <Card key={entry.id} className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {format(new Date(entry.date), "yyyy年M月d日(E)", { locale: ja })}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingEntry(entry)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>日記を削除しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        この操作は取り消すことができません。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(entry.id)}
                        className="bg-destructive text-destructive-foreground"
                      >
                        削除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <p className="whitespace-pre-wrap">{entry.content}</p>
            {entry.photo_urls && entry.photo_urls.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {entry.photo_urls.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={url}
                      alt={`写真 ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      ))}

      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>日記を編集</DialogTitle>
          </DialogHeader>
          {editingEntry && (
            <DiaryEntryForm
              petId={petId}
              initialData={editingEntry}
              onSuccess={() => {
                setEditingEntry(null);
                fetchEntries();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}