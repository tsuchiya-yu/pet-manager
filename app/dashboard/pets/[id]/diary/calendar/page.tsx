"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarDays, List } from "lucide-react";
import Link from "next/link";
import { DiaryEntry } from "@/types/diary-entry";
import { Pet } from "@/types/pet";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function DiaryCalendarPage({ params }: { params: { id: string } }) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ペット情報の取得
        const { data: pet, error: petError } = await supabase
          .from("pets")
          .select("*")
          .eq("id", params.id)
          .single();

        if (petError) throw petError;
        setPet(pet);

        // 日記エントリーの取得
        const { data: entries, error: entriesError } = await supabase
          .from("diary_entries")
          .select("*")
          .eq("pet_id", params.id)
          .order("date", { ascending: false });

        if (entriesError) throw entriesError;
        setEntries(entries || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!pet) {
    return <div>ペットが見つかりません</div>;
  }

  // 日付ごとの日記エントリーをマップ化
  const entriesByDate = entries.reduce((acc, entry) => {
    const date = entry.date.split("T")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, DiaryEntry[]>);

  // カレンダーの日付装飾用関数
  const getDayContent = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayEntries = entriesByDate[dateStr];

    if (!dayEntries) return null;

    return (
      <HoverCard>
        <HoverCardTrigger>
          <Badge variant="secondary" className="absolute bottom-0 right-0">
            {dayEntries.length}
          </Badge>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-2">
            {dayEntries.map((entry) => (
              <div key={entry.id} className="space-y-2">
                <p className="text-sm line-clamp-2">{entry.content}</p>
                {entry.photo_urls && entry.photo_urls.length > 0 && (
                  <div className="grid grid-cols-3 gap-1">
                    {entry.photo_urls.slice(0, 3).map((url, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={url}
                          alt={`写真 ${index + 1}`}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pet.name}の日記カレンダー</h1>
          <p className="text-muted-foreground">
            カレンダーで日記を振り返りましょう
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/pets/${params.id}/diary`}>
              <List className="mr-2 h-4 w-4" />
              リスト表示
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/pets/${params.id}/diary`}>
              <CalendarDays className="mr-2 h-4 w-4" />
              日記を書く
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={ja}
          className="rounded-md border"
          components={{
            DayContent: ({ date }) => (
              <div className="relative w-full h-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  {date.getDate()}
                </div>
                {getDayContent(date)}
              </div>
            ),
          }}
        />
      </div>

      {selectedDate && entriesByDate[format(selectedDate, "yyyy-MM-dd")] && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {format(selectedDate, "yyyy年M月d日(E)", { locale: ja })}の日記
          </h2>
          {entriesByDate[format(selectedDate, "yyyy-MM-dd")].map((entry) => (
            <div key={entry.id} className="bg-card rounded-lg p-4 space-y-4">
              <p className="whitespace-pre-wrap">{entry.content}</p>
              {entry.photo_urls && entry.photo_urls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
          ))}
        </div>
      )}
    </div>
  );
}