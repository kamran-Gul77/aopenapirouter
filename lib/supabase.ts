import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client-side Supabase client for components
export const createSupabaseClient = () => createClientComponentClient();

export type Chat = {
  id: string;
  user_id: string;
  model: "openai/gpt-4o" | "deepseek/deepseek-chat";
  title: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  chat_id: string;
  role: "user" | "assistant" | "system";
  content: {
    text?: string;
    files?: Array<{
      name: string;
      url: string;
      type: string;
    }>;
  };
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  created_at: string;
};
