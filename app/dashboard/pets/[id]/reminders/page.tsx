"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ReminderList } from "@/components/reminder-list";
import { ReminderForm } from "@/components/reminder-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pet } from "@/types/pet";

export default function PetRemindersPage({ params }: { params: { id: string } }) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error("Error fetching pet:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [params.id]);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!pet) {
    return <div>ペットが見つかりません</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {pet.name}のリマインダー
          </h1>
          <p className="text-muted-foreground">
            予防接種や健康診断の予定を管理しましょう
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              リマインダーを追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>リマインダーの追加</DialogTitle>
            </DialogHeader>
            <ReminderForm petId={pet.id} />
          </DialogContent>
        </Dialog>
      </div>
      <ReminderList petId={pet.id} />
    </div>
  );
}