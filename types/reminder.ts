export interface Reminder {
  id: string;
  pet_id: string;
  title: string;
  description?: string;
  due_date: string;
  repeat_interval?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  is_completed: boolean;
  created_at: string;
}