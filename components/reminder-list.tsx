"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format, isPast, addDays, addWeeks, addMonths, addYears } from "date-fns";
import { ja } from "date-fns/locale";
import { Reminder } from "@/types/reminder";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Pencil, Trash2, CheckCircle, Circle } from "lucide-react";
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
import { ReminderForm } from "./reminder-form";
import { Badge } from "./ui/badge";

export function ReminderList({ petId }: { petId: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("pet_id", petId)
        .order("due_date", { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [petId]);

  const handleDelete = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .delete()
        .eq("id", reminderId);

      if (error) throw error;
      await fetchReminders();
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const handleToggleComplete = async (reminder: Reminder) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .update({ is_completed: !reminder.is_completed })
        .eq("id", reminder.id);

      if (error) throw error;

      // 繰り返しの場合、新しいリマインダーを作成
      if (reminder.repeat_interval !== "none" && !reminder.is_completed) {
        let nextDueDate = new Date(reminder.due_date);
        switch (reminder.repeat_interval) {
          case "daily":
            nextDueDate = addDays(nextDueDate, 1);
            break;
          case "weekly":
            nextDueDate = addWeeks(nextDueDate, 1);
            break;
          case "monthly":
            nextDueDate = addMonths(nextDueDate, 1);
            break;
          case "yearly":
            nextDueDate = addYears(nextDueDate, 1);
            break;
        }

        const { error: insertError } = await supabase.from("reminders").insert([
          {
            pet_id: petId,
            title: reminder.title,
            description: reminder.description,
            due_date: nextDueDate.toISOString().split("T")[0],
            repeat_interval: reminder.repeat_interval,
            is_completed: false,
          },
        ]);

        if (insertError) throw insertError;
      }

      await fetchReminders();
    } catch (error) {
      console.error("Error updating reminder:", error);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (reminders.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        まだリマインダーがありません。「リマインダーを追加」ボタンから追加してください。
      </Card>
    );
  }

  const getRepeatText = (interval: string) => {
    switch (interval) {
      case "daily":
        return "毎日";
      case "weekly":
        return "毎週";
      case "monthly":
        return "毎月";
      case "yearly":
        return "毎年";
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {reminders.map((reminder) => {
        const isPastDue = isPast(new Date(reminder.due_date)) && !reminder.is_completed;
        return (
          <Card key={reminder.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleComplete(reminder)}
                  >
                    {reminder.is_completed ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </Button>
                  <div>
                    <h3 className="font-semibold">{reminder.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {format(new Date(reminder.due_date), "yyyy年M月d日(E)", {
                          locale: ja,
                        })}
                      </span>
                      {reminder.repeat_interval !== "none" && (
                        <Badge variant="outline">
                          {getRepeatText(reminder.repeat_interval)}
                        </Badge>
                      )}
                      {isPastDue && (
                        <Badge variant="destructive">期限切れ</Badge>
                      )}
                    </div>
                  </div>
                </div>
                {reminder.description && (
                  <p className="text-sm text-muted-foreground ml-9">
                    {reminder.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingReminder(reminder)}
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
                      <AlertDialogTitle>リマインダーを削除しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        この操作は取り消すことができません。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(reminder.id)}
                        className="bg-destructive text-destructive-foreground"
                      >
                        削除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        );
      })}

      <Dialog open={!!editingReminder} onOpenChange={() => setEditingReminder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>リマインダーの編集</DialogTitle>
          </DialogHeader>
          {editingReminder && (
            <ReminderForm
              petId={petId}
              initialData={editingReminder}
              onSuccess={() => {
                setEditingReminder(null);
                fetchReminders();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}