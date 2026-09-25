import { supabase } from "./supabase";

/**
 * POST to one of our /api routes with the signed-in user's token attached.
 * Throws an Error with a readable message on any non-2xx response.
 */
export async function apiPost<T = any>(path: string, body: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("You're signed out. Please sign in again.");

  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON error page */
  }

  if (!res.ok) {
    throw new Error(json?.error || `Request failed (${res.status})`);
  }
  return json as T;
}
