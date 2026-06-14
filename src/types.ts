export interface BundleAnimal {
  name: string;
  age: string;
  weight: string;
  gender: string;
  castrated: boolean;
  dewormed: boolean;
  chipped: boolean;
  vaccinated: boolean;
}

export interface Animal {
  id: string;
  name: string;
  description: string;
  age: string;
  status: string;
  imageUrl: string | null;
  imageUrls?: string[];
  createdAt: number;
  weight?: string;
  gender?: string;
  castrated?: boolean;
  dewormed?: boolean;
  chipped?: boolean;
  vaccinated?: boolean;
  isDeleted?: boolean;
  bundleSize?: number;
  bundleAnimals?: BundleAnimal[];
}

export interface Inquiry {
  id: string;
  animalId: string;
  animalName: string;
  userId: string;
  name: string;
  email?: string;
  phone: string;
  motivation: string;
  createdAt: number;
}
