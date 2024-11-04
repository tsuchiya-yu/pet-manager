import { Button } from "@/components/ui/button";
import { PawPrint } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="flex items-center space-x-2">
            <PawPrint className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
              ペット管理アプリ
            </h1>
          </div>
          <p className="max-w-[600px] text-muted-foreground">
            あなたの大切なペットの健康記録と思い出を簡単に管理できます。
            毎日の記録をつけて、大切な家族の成長を見守りましょう。
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/login">ログイン</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">新規登録</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}