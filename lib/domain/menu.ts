import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type {
  CategoryInput,
  MenuItemInput,
  MenuOptionInput,
  OptionGroupInput,
} from "@/lib/validations/menu";

type Client = SupabaseClient<Database>;

export type MenuOption = Database["public"]["Tables"]["menu_item_options"]["Row"];
export type MenuOptionGroup =
  Database["public"]["Tables"]["menu_item_option_groups"]["Row"] & {
    menu_item_options: MenuOption[];
  };
export type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"] & {
  menu_item_option_groups: MenuOptionGroup[];
};
export type MenuCategory = Database["public"]["Tables"]["menu_categories"]["Row"];

const ITEM_WITH_OPTIONS_SELECT =
  "*, menu_item_option_groups(*, menu_item_options(*))";

export async function listCategories(supabase: Client, companyId: string) {
  return supabase
    .from("menu_categories")
    .select("*")
    .eq("company_id", companyId)
    .order("sort_order", { ascending: true });
}

export async function createCategory(
  supabase: Client,
  companyId: string,
  input: CategoryInput,
) {
  return supabase
    .from("menu_categories")
    .insert({ company_id: companyId, name: input.name })
    .select()
    .single();
}

export async function deleteCategory(supabase: Client, categoryId: string) {
  return supabase.from("menu_categories").delete().eq("id", categoryId);
}

export async function listItems(supabase: Client, companyId: string) {
  return supabase
    .from("menu_items")
    .select(ITEM_WITH_OPTIONS_SELECT)
    .eq("company_id", companyId)
    .order("sort_order", { ascending: true })
    .returns<MenuItem[]>();
}

export async function getItem(supabase: Client, itemId: string) {
  return supabase
    .from("menu_items")
    .select(ITEM_WITH_OPTIONS_SELECT)
    .eq("id", itemId)
    .single<MenuItem>();
}

export async function createItem(
  supabase: Client,
  companyId: string,
  input: MenuItemInput,
) {
  return supabase
    .from("menu_items")
    .insert({
      company_id: companyId,
      category_id: input.categoryId || null,
      name: input.name,
      description: input.description || null,
      price: input.price,
    })
    .select()
    .single();
}

export async function updateItem(
  supabase: Client,
  itemId: string,
  input: Partial<MenuItemInput> & { imageUrl?: string | null },
) {
  return supabase
    .from("menu_items")
    .update({
      ...(input.categoryId !== undefined && { category_id: input.categoryId || null }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description || null }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.imageUrl !== undefined && { image_url: input.imageUrl }),
    })
    .eq("id", itemId)
    .select()
    .single();
}

export async function setItemAvailability(
  supabase: Client,
  itemId: string,
  isAvailable: boolean,
) {
  return supabase
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", itemId);
}

export async function deleteItem(supabase: Client, itemId: string) {
  return supabase.from("menu_items").delete().eq("id", itemId);
}

export async function createOptionGroup(
  supabase: Client,
  menuItemId: string,
  input: OptionGroupInput,
) {
  return supabase
    .from("menu_item_option_groups")
    .insert({
      menu_item_id: menuItemId,
      name: input.name,
      min_select: input.minSelect,
      max_select: input.maxSelect,
      is_required: input.isRequired,
    })
    .select()
    .single();
}

export async function deleteOptionGroup(supabase: Client, groupId: string) {
  return supabase.from("menu_item_option_groups").delete().eq("id", groupId);
}

export async function createOption(
  supabase: Client,
  optionGroupId: string,
  input: MenuOptionInput,
) {
  return supabase
    .from("menu_item_options")
    .insert({
      option_group_id: optionGroupId,
      name: input.name,
      price_delta: input.priceDelta,
    })
    .select()
    .single();
}

export async function deleteOption(supabase: Client, optionId: string) {
  return supabase.from("menu_item_options").delete().eq("id", optionId);
}

export async function uploadMenuImage(
  supabase: Client,
  companyId: string,
  file: File,
) {
  const ext = file.name.split(".").pop();
  const path = `${companyId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("menu-images")
    .upload(path, file, { upsert: false });
  if (error) return { data: null, error };
  const { data } = supabase.storage.from("menu-images").getPublicUrl(path);
  return { data: data.publicUrl, error: null };
}

/** Public storefront: only available items, grouped by category. */
export async function listPublicMenu(supabase: Client, companyId: string) {
  const [{ data: categories, error: categoriesError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase
        .from("menu_categories")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("menu_items")
        .select(ITEM_WITH_OPTIONS_SELECT)
        .eq("company_id", companyId)
        .eq("is_available", true)
        .order("sort_order", { ascending: true })
        .returns<MenuItem[]>(),
    ]);

  if (categoriesError) throw categoriesError;
  if (itemsError) throw itemsError;

  return { categories: categories ?? [], items: items ?? [] };
}
