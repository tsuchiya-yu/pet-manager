"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { HealthRecord } from "@/types/health-record";
import { Card } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
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
import { HealthRecordForm } from "./health-record-form";

export function HealthRecordList({ petId }: { petId: string }) {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("pet_id", petId)
        .order("date", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching health records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [petId]);

  const handleDelete = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from("health_records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;
      await fetchRecords();
    } catch (error) {
      console.error("Error deleting health record:", error);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (records.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        まだ健康記録がありません。「記録を追加」ボタンから記録を追加してください。
      </Card>
    );
  }

  const chartData = [...records]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((record) => ({
      date: format(new Date(record.date), "M/d"),
      weight: record.weight,
    }));

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">体重の推移</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日付</TableHead>
              <TableHead>体重 (kg)</TableHead>
              <TableHead>メモ</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {format(new Date(record.date), "yyyy年M月d日", { locale: ja })}
                </TableCell>
                <TableCell>{record.weight}</TableCell>
                <TableCell>{record.notes}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingRecord(record)}
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
                          <AlertDialogTitle>記録を削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            この操作は取り消すことができません。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(record.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            削除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>健康記録の編集</DialogTitle>
          </DialogHeader>
          {editingRecord && (
            <HealthRecordForm
              petId={petId}
              initialData={editingRecord}
              onSuccess={() => {
                setEditingRecord(null);
                fetchRecords();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}