# ペット管理アプリ

ペットの情報を管理し、健康記録や日々の出来事を日記として残すことができるウェブアプリケーションです。

## 機能

- ユーザー認証（サインアップ、ログイン、ログアウト）
- ペットプロフィール管理（追加、編集、削除）
- 健康記録管理（体重記録、グラフ表示）
- 日記機能（写真付きの日記投稿、カレンダー表示）
- リマインダー機能（予防接種や健康診断の通知）

## 技術スタック

- フロントエンド: Next.js, TypeScript
- バックエンド: Supabase (データベース, 認証, ストレージ)
- UIライブラリ: shadcn/ui
- スタイリング: Tailwind CSS

## ローカル環境でのセットアップ手順

### 前提条件

- Git
- Docker と Docker Compose
- Node.js v20以上（Dockerを使用しない場合）

### 1. リポジトリのクローン

```bash
git clone https://github.com/tsuchiya-yu/pet-manager.git
cd pet-manager
```

### 2. 環境変数の設定

1. Supabaseでプロジェクトを作成
2. `.env.local`ファイルを作成し、以下の環境変数を設定:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. データベースのセットアップ

Supabaseのダッシュボードで以下のテーブルを作成:

```sql
-- petsテーブル
create table pets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  name text not null,
  species text not null,
  breed text not null,
  birthdate date not null,
  gender text not null,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- health_recordsテーブル
create table health_records (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references pets(id) on delete cascade,
  date date not null,
  weight numeric not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- diary_entriesテーブル
create table diary_entries (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references pets(id) on delete cascade,
  date date not null,
  content text not null,
  photo_urls text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- remindersテーブル
create table reminders (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references pets(id) on delete cascade,
  title text not null,
  description text,
  due_date date not null,
  repeat_interval text default 'none',
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS (Row Level Security) ポリシーの設定
alter table pets enable row level security;
alter table health_records enable row level security;
alter table diary_entries enable row level security;
alter table reminders enable row level security;

-- ユーザーは自分のペットのみアクセス可能
create policy "Users can only access their own pets"
  on pets for all
  using (auth.uid() = user_id);

-- ペットに紐づく健康記録は、そのペットの所有者のみアクセス可能
create policy "Users can only access their pets' health records"
  on health_records for all
  using (
    exists (
      select 1 from pets
      where pets.id = pet_id
      and pets.user_id = auth.uid()
    )
  );

-- ペットに紐づく日記は、そのペットの所有者のみアクセス可能
create policy "Users can only access their pets' diary entries"
  on diary_entries for all
  using (
    exists (
      select 1 from pets
      where pets.id = pet_id
      and pets.user_id = auth.uid()
    )
  );

-- ペットに紐づくリマインダーは、そのペットの所有者のみアクセス可能
create policy "Users can only access their pets' reminders"
  on reminders for all
  using (
    exists (
      select 1 from pets
      where pets.id = pet_id
      and pets.user_id = auth.uid()
    )
  );
```

### 4. アプリケーションの起動

#### Dockerを使用する場合:

```bash
# コンテナのビルドと起動
docker-compose up --build

# バックグラウンドで実行する場合
docker-compose up -d
```

#### Dockerを使用しない場合:

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

アプリケーションは http://localhost:3000 で利用できます。

## ストレージの設定

1. Supabaseダッシュボードでストレージバケットを作成:
   - `pet-photos`という名前のパブリックバケットを作成
   - 適切なCORSポリシーを設定

2. ストレージポリシーの設定:
```sql
-- 認証済みユーザーのみアップロード可能
create policy "Anyone can upload pet photos"
  on storage.objects for insert
  with check (bucket_id = 'pet-photos');

-- 誰でも閲覧可能
create policy "Anyone can view pet photos"
  on storage.objects for select
  using (bucket_id = 'pet-photos');
```

## 開発の進め方

1. 新しい機能を開発する場合は、新しいブランチを作成:
```bash
git checkout -b feature/new-feature
```

2. コードの変更を行い、コミット:
```bash
git add .
git commit -m "Add new feature"
```

3. プルリクエストを作成してレビューを依頼

## デプロイ

1. Vercelにデプロイする場合:
   - GitHubリポジトリと連携
   - 環境変数を設定
   - デプロイを実行

2. その他のプラットフォームにデプロイする場合:
```bash
# プロダクションビルド
npm run build

# 静的ファイルの生成
npm run export
```
