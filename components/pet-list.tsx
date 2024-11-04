"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Activity, BookOpen } from "lucide-react";
import Link from "next/link";
import { Pet } from "@/types/pet";

export function PetList() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const { data: pets, error } = await supabase
          .from("pets")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPets(pets || []);
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (pets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          まだペットが登録されていません。「ペットを登録」ボタンから登録してください。
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pets.map((pet) => (
        <Card key={pet.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">{pet.name}</CardTitle>
            <div className="flex space-x-2">
              <Button asChild variant="ghost" size="icon">
                <Link href={`/dashboard/pets/${pet.id}/diary`}>
                  <BookOpen className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon">
                <Link href={`/dashboard/pets/${pet.id}/health`}>
                  <Activity className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon">
                <Link href={`/dashboard/pets/${pet.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">種類:</span> {pet.species}
              </p>
              <p>
                <span className="font-medium">品種:</span> {pet.breed}
              </p>
              <p>
                <span className="font-medium">性別:</span> {pet.gender}
              </p>
              <p>
                <span className="font-medium">誕生日:</span>{" "}
                {new Date(pet.birthdate).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}