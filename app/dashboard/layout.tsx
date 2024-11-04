"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { PawPrint, Menu } from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>メニュー</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-4">
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium hover:text-primary"
                  >
                    ダッシュボード
                  </Link>
                  <Link
                    href="/dashboard/pets"
                    className="text-sm font-medium hover:text-primary"
                  >
                    ペット一覧
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/dashboard" className="flex items-center space-x-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="font-bold hidden sm:inline-block">ペット管理アプリ</span>
            </Link>
          </div>
          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary"
            >
              ダッシュボード
            </Link>
            <Link
              href="/dashboard/pets"
              className="text-sm font-medium hover:text-primary"
            >
              ペット一覧
            </Link>
          </nav>
          <Button onClick={handleSignOut} variant="ghost">
            ログアウト
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}