import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { PetList } from "@/components/pet-list";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
        <Button asChild>
          <Link href="/dashboard/pets/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            ペットを登録
          </Link>
        </Button>
      </div>
      <PetList />
    </div>
  );
}