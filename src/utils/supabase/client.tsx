import { createClient } from 'npm:@supabase/supabase-js@2';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

export type { User } from 'npm:@supabase/supabase-js@2';