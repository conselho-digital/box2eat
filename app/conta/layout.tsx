import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/domain/current-user";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentUser();

  if (!user) redirect("/login");

  // Account tabs now live in the top navbar (SiteHeader) instead of here.
  return <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">{children}</div>;
}
