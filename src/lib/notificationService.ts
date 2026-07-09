import { supabase } from "./supabase";

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string | null;
  isRead: boolean;
  createdAt: string;
}

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean;
  created_at: string;
};

function mapNotification(row: NotificationRow): AdminNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

export async function fetchAdminNotifications() {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, message, type, is_read, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw error;
  return ((data ?? []) as NotificationRow[]).map(mapNotification);
}

export async function markAdminNotificationsRead() {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  if (error) throw error;
}

export function subscribeAdminNotifications(onChange: () => void) {
  return supabase
    .channel("admin-notifications")
    .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, onChange)
    .subscribe();
}
