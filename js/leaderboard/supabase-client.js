import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,isSupabaseConfigured} from '../config/supabase-config.js';

let clientPromise;

export async function getSupabaseClient() {
  if(!isSupabaseConfigured())return null;
  if(!clientPromise)clientPromise=import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
    .then(({createClient})=>createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}))
    .catch(error=>{clientPromise=null;throw error;});
  return clientPromise;
}
