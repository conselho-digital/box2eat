import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { MenuItemInput } from "@/lib/validations/menu";

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
    "id" | "name" | "price" | "image_url" | "is_available" | "show_as_addon" | "category_id"
  > & { menu_categories: Pick<MenuCategory, "id" | "name"> | null };
};
/** For this item's own "opcional" configuration: how many selections are
 *  required from each category of addons attached to it. */
export type MenuItemAddonCategory = {
  id: string;
  category_id: string;
  min_select: number;
  menu_categories: Pick<MenuCategory, "id" | "name"> | null;
};
/** An extra gallery photo beyond the item's cover photo (menu_items.image_url). */
export type MenuItemImage = Database["public"]["Tables"]["menu_item_images"]["Row"];
export type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"] & {
  menu_item_option_groups: MenuOptionGroup[];
  menu_categories: Pick<MenuCategory, "id" | "name"> | null;
  menu_item_addons: MenuItemAddonEntry[];
  menu_item_addon_categories: MenuItemAddonCategory[];
  menu_item_images: MenuItemImage[];
};

export const ITEM_WITH_OPTIONS_SELECT =
  "*, menu_categories(id, name), menu_item_option_groups(*, menu_item_options(*)), menu_item_addons!menu_item_addons_menu_item_id_fkey(addon_item_id, menu_items!menu_item_addons_addon_item_id_fkey(id, name, price, image_url, is_available, show_as_addon, category_id, menu_categories(id, name))), menu_item_addon_categories(id, category_id, min_select, menu_categories(id, name)), menu_item_images(id, url, sort_order)";

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
  input: Partial<MenuItemInput> & {
    imageUrl?: string | null;
    isAvailable?: boolean;
    showAsAddon?: boolean;
  },
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
      ...(input.showAsAddon !== undefined && { show_as_addon: input.showAsAddon }),
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

export async function setItemShowAsAddon(
  supabase: Client,
  itemId: string,
  showAsAddon: boolean,
) {
  return supabase
    .from("menu_items")
    .update({ show_as_addon: showAsAddon })
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

export type AddonCategoryGroupInput = { categoryId: string; minSelect: number };

/** Replaces the full set of addon-category groups (and their minimum
 *  required selections) configured for menuItemId — same clear-then-insert
 *  approach as setItemAddons, and for the same reason: the picker always
 *  submits the whole desired configuration at once. */
export async function setItemAddonCategories(
  supabase: Client,
  menuItemId: string,
  groups: AddonCategoryGroupInput[],
) {
  const { error: deleteError } = await supabase
    .from("menu_item_addon_categories")
    .delete()
    .eq("menu_item_id", menuItemId);
  if (deleteError) return { error: deleteError };
  if (groups.length === 0) return { error: null };

  const { error: insertError } = await supabase.from("menu_item_addon_categories").insert(
    groups.map((g) => ({
      menu_item_id: menuItemId,
      category_id: g.categoryId,
      min_select: g.minSelect,
    })),
  );
  return { error: insertError };
}

/** Replaces the full set of extra gallery photos for menuItemId, in order —
 *  same clear-then-insert approach as setItemAddons. The item's cover photo
 *  (menu_items.image_url) is managed separately via updateItem. */
export async function setItemImages(supabase: Client, menuItemId: string, urls: string[]) {
  const { error: deleteError } = await supabase
    .from("menu_item_images")
    .delete()
    .eq("menu_item_id", menuItemId);
  if (deleteError) return { error: deleteError };
  if (urls.length === 0) return { error: null };

  const { error: insertError } = await supabase.from("menu_item_images").insert(
    urls.map((url, index) => ({ menu_item_id: menuItemId, url, sort_order: index })),
  );
  return { error: insertError };
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

/** Opcionais attached to any of the given items (e.g. everything currently
 *  in a customer's cart for one restaurant) — used by the pre-checkout
 *  screen that offers add-ons before the customer continues. */
export async function listAddonsForItems(supabase: Client, menuItemIds: string[]) {
  if (menuItemIds.length === 0) return { data: [] as MenuItemAddonEntry[], error: null };
  return supabase
    .from("menu_item_addons")
    .select(
      "addon_item_id, menu_items!menu_item_addons_addon_item_id_fkey(id, name, price, image_url, is_available, show_as_addon, category_id, menu_categories(id, name))",
    )
    .in("menu_item_id", menuItemIds)
    .returns<MenuItemAddonEntry[]>();
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
