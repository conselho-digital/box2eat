import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { MenuItemInput, MenuOptionInput, OptionGroupInput } from "@/lib/validations/menu";

type Client = SupabaseClient<Database>;

export type MenuOption = Database["public"]["Tables"]["menu_item_options"]["Row"];
export type MenuOptionGroup =
  Database["public"]["Tables"]["menu_item_option_groups"]["Row"] & {
    menu_item_options: MenuOption[];
  };
export type MenuCategory = Database["public"]["Tables"]["menu_categories"]["Row"];
/** "Opcional": another real, separately-sellable menu item offered
 *  alongside this one (e.g. a burger's opcional pointing at a soda in
 *  Bebidas) — not a named choice like menu_item_option_groups. */
export type MenuItemAddonEntry = {
  addon_item_id: string;
  menu_items: Pick<
    Database["public"]["Tables"]["menu_items"]["Row"],
    "id" | "name" | "price" | "image_url" | "is_available" | "category_id"
  > & { menu_categories: Pick<MenuCategory, "id" | "name"> | null };
};
export type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"] & {
  menu_item_option_groups: MenuOptionGroup[];
  menu_categories: Pick<MenuCategory, "id" | "name"> | null;
  menu_item_addons: MenuItemAddonEntry[];
};

export const ITEM_WITH_OPTIONS_SELECT =
  "*, menu_categories(id, name), menu_item_option_groups(*, menu_item_options(*)), menu_item_addons!menu_item_addons_menu_item_id_fkey(addon_item_id, menu_items!menu_item_addons_addon_item_id_fkey(id, name, price, image_url, is_available, category_id, menu_categories(id, name)))";

export async function listCategories(supabase: Client, companyId: string) {
  return supabase
    .from("menu_categories")
    .select("*")
    .eq("company_id", companyId)
    .order("sort_order", { ascending: true });
}

/** Reuses an existing category with the same name (case-insensitive) for
 *  this company, or creates a new one — backs the item form's category
 *  field, which is a free-text combobox rather than a fixed picker. */
export async function findOrCreateCategory(supabase: Client, companyId: string, name: string) {
  const trimmed = name.trim();
  const escaped = trimmed.replace(/[%_]/g, (match) => `\\${match}`);

  const { data: existing, error: findError } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("company_id", companyId)
    .ilike("name", escaped)
    .maybeSingle();
  if (findError) return { data: null, error: findError };
  if (existing) return { data: existing, error: null };

  return supabase
    .from("menu_categories")
    .insert({ company_id: companyId, name: trimmed })
    .select()
    .single();
}

async function resolveCategoryId(supabase: Client, companyId: string, categoryName: string | undefined) {
  const trimmed = categoryName?.trim();
  if (!trimmed) return { data: null as string | null, error: null };

  const { data, error } = await findOrCreateCategory(supabase, companyId, trimmed);
  if (error) return { data: null as string | null, error };
  return { data: data.id as string | null, error: null };
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
  const { data: categoryId, error: categoryError } = await resolveCategoryId(
    supabase,
    companyId,
    input.categoryName,
  );
  if (categoryError) return { data: null, error: categoryError };

  return supabase
    .from("menu_items")
    .insert({
      company_id: companyId,
      category_id: categoryId,
      name: input.name,
      description: input.description || null,
      price: input.price,
    })
    .select(ITEM_WITH_OPTIONS_SELECT)
    .single<MenuItem>();
}

export async function updateItem(
  supabase: Client,
  companyId: string,
  itemId: string,
  input: Partial<MenuItemInput> & { imageUrl?: string | null; isAvailable?: boolean },
) {
  let categoryId: string | null | undefined;
  if (input.categoryName !== undefined) {
    const resolved = await resolveCategoryId(supabase, companyId, input.categoryName);
    if (resolved.error) return { data: null, error: resolved.error };
    categoryId = resolved.data;
  }

  return supabase
    .from("menu_items")
    .update({
      ...(categoryId !== undefined && { category_id: categoryId }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description || null }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.imageUrl !== undefined && { image_url: input.imageUrl }),
      ...(input.isAvailable !== undefined && { is_available: input.isAvailable }),
    })
    .eq("id", itemId)
    .select(ITEM_WITH_OPTIONS_SELECT)
    .single<MenuItem>();
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

/** Replaces the full set of "opcional" items attached to menuItemId — the
 *  picker always submits the whole desired selection, so a clear-then-
 *  insert is simpler and just as correct as diffing it. */
export async function setItemAddons(supabase: Client, menuItemId: string, addonItemIds: string[]) {
  const { error: deleteError } = await supabase
    .from("menu_item_addons")
    .delete()
    .eq("menu_item_id", menuItemId);
  if (deleteError) return { error: deleteError };
  if (addonItemIds.length === 0) return { error: null };

  const { error: insertError } = await supabase
    .from("menu_item_addons")
    .insert(addonItemIds.map((addonItemId) => ({ menu_item_id: menuItemId, addon_item_id: addonItemId })));
  return { error: insertError };
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
      is_required: input.minSelect > 0,
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

/** Top-selling items (by total quantity across real orders) for each of the
 *  given companies in one batch, for the category-feed carousels — lets a
 *  customer browse and add a restaurant's popular items without opening its
 *  page. Ranking already excludes unavailable items server-side; the
 *  availability filter here just guards against one going unavailable in
 *  the moment between the ranking call and this follow-up select. */
export async function listBestSellingItems(
  supabase: Client,
  companyIds: string[],
  limitPerCompany = 8,
) {
  const empty = new Map<string, MenuItem[]>();
  if (companyIds.length === 0) return { data: empty, error: null };

  const { data: ranked, error: rankError } = await supabase.rpc(
    "get_best_selling_items_for_companies",
    { p_company_ids: companyIds, p_limit_per_company: limitPerCompany },
  );
  if (rankError) return { data: null, error: rankError };
  if (!ranked || ranked.length === 0) return { data: empty, error: null };

  const ids = [...new Set(ranked.map((r) => r.menu_item_id))];
  const { data: items, error } = await supabase
    .from("menu_items")
    .select(ITEM_WITH_OPTIONS_SELECT)
    .in("id", ids)
    .eq("is_available", true)
    .returns<MenuItem[]>();
  if (error) return { data: null, error };

  const byId = new Map(items.map((item) => [item.id, item]));
  const byCompany = new Map<string, MenuItem[]>();
  for (const row of ranked) {
    const item = byId.get(row.menu_item_id);
    if (!item) continue;
    const list = byCompany.get(row.company_id) ?? [];
    list.push(item);
    byCompany.set(row.company_id, list);
  }
  return { data: byCompany, error: null };
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
