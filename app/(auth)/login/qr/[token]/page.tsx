import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QrLoginConfirm } from "@/components/auth/qr-login-confirm";

export default async function QrLoginConfirmPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/login/qr/${token}`)}`);
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <QrLoginConfirm token={token} />
    </div>
  );
}
