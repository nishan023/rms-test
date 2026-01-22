export type Department = "KITCHEN" | "DRINKS" | "BEER" | "SMOKES" | "OTHERS";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  department: Department;
  category: string;
  quantity?: number;
  image?: string;
  description?: string;
  isVeg?: boolean;
  isAvailable: boolean;
  isSpecial: boolean;
  prepTime?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
