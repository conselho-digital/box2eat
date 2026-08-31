export const FOOD_CATEGORIES = [
  "Burguers",
  "Mexicana",
  "Pizza",
  "Sushi",
  "Fastfood",
  "Vegana",
  "Asiática",
  "Churrasco",
  "Italiana",
  "Doces",
  "Petshop",
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];
