export interface HealthRecord {
  id: string;
  pet_id: string;
  date: string;
  weight: number;
  notes?: string;
  created_at: string;
}