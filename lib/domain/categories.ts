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
  "Bebidas",
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

/** Bebidas can include alcohol, so it's only browsable once the customer's
 *  identity (age) has been verified. */
export const AGE_RESTRICTED_CATEGORIES: FoodCategory[] = ["Bebidas"];
