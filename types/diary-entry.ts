export interface DiaryEntry {
  id: string;
  pet_id: string;
  date: string;
  content: string;
  photo_urls?: string[];
  created_at: string;
}