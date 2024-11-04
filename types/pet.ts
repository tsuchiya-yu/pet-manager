export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: string;
  breed: string;
  birthdate: string;
  gender: string;
  photo_url?: string;
  created_at: string;
}