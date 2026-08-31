import { redirect } from "next/navigation";

/** Kept so old shared links (`/loja/<slug>`) still work — the canonical URL is now `/<slug>`. */
export default async function LegacyStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/${slug}`);
}
