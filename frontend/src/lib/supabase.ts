import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wxpghingwycvwvgfjyya.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cGdoaW5nd3ljdnd2Z2ZqeXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjIwMDQsImV4cCI6MjA5NjM5ODAwNH0.sTkzGn5AfU6O_c76BPs68QRnnWp4RRakroRDtWxnKus";

export function createSupabaseBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
