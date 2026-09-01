"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import {
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
} from "@/lib/domain/notifications";
import { getPushSubscriptionStatus, subscribeToPush } from "@/lib/domain/push";

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

const NOTIFICATION_LINK: Record<string, (data: unknown) => string | null> = {
  new_order: (data) => {
    const orderId = (data as { order_id?: string } | null)?.order_id;
    return orderId ? `/pedidos/${orderId}` : null;
  },
  order_status_changed: (data) => {
    const orderId = (data as { order_id?: string } | null)?.order_id;
    return orderId ? `/pedidos/${orderId}` : null;
  },
};

export function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notificationsKey = ["notifications", userId];
  const unreadKey = ["notifications-unread", userId];

  const { data: notifications } = useQuery({
    queryKey: notificationsKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listNotifications(supabase);
      if (error) throw error;
      return data;
    },
  });

  const { data: unreadCount } = useQuery({
    queryKey: unreadKey,
    queryFn: async () => {
      const supabase = createClient();
      const { count, error } = await countUnreadNotifications(supabase);
      if (error) throw error;
      return count ?? 0;
    },
  });

  useEffect(() => {
    const supabase = createClient();
    return subscribeToNotifications(supabase, userId, () => {
      queryClient.invalidateQueries({ queryKey: notificationsKey });
      queryClient.invalidateQueries({ queryKey: unreadKey });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keys are stable per userId
  }, [userId]);

  const readMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await markNotificationRead(supabase, id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKey });
      queryClient.invalidateQueries({ queryKey: unreadKey });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await markAllNotificationsRead(supabase, userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKey });
      queryClient.invalidateQueries({ queryKey: unreadKey });
    },
  });

  const hasUnread = Boolean(unreadCount && unreadCount > 0);

  async function requestPushPermissionIfNeeded() {
    try {
      const status = await getPushSubscriptionStatus();
      if (status === "unsubscribed") {
        await subscribeToPush(createClient(), userId);
      }
    } catch {
      // The browser prompt may have been dismissed — nothing to recover from here.
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={() => {
          void requestPushPermissionIfNeeded();
        }}
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}
      >
        <Bell />
        {hasUnread && <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 duration-300">
        <div className="flex items-center justify-between px-1.5 py-1">
          <DropdownMenuLabel className="p-0">Notificações</DropdownMenuLabel>
          {hasUnread && (
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => readAllMutation.mutate()}
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {!notifications || notifications.length === 0 ? (
          <p className="p-3 text-center text-sm text-muted-foreground">
            Nenhuma notificação ainda.
          </p>
        ) : (
          notifications.map((notification) => {
            const href = NOTIFICATION_LINK[notification.type]?.(notification.data) ?? null;
            const content = (
              <div className="flex w-full flex-col gap-0.5 py-1">
                <div className="flex items-center gap-1.5">
                  {!notification.read_at && (
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                  <span className="font-medium">{notification.title}</span>
                </div>
                {notification.body && (
                  <span className="text-xs text-muted-foreground">{notification.body}</span>
                )}
                <span className="text-xs text-muted-foreground">
                  {dateFormat.format(new Date(notification.created_at))}
                </span>
              </div>
            );

            return (
              <DropdownMenuItem
                key={notification.id}
                className="items-start"
                onClick={() => {
                  if (!notification.read_at) readMutation.mutate(notification.id);
                  if (href) router.push(href);
                }}
              >
                {content}
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
