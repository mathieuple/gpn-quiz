// Configuration publique du classement. Remplacer uniquement ces deux valeurs.
export const SUPABASE_URL='https://aubvlpgitmayoglaiiyb.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY='sb_publishable_AOK4lclROp-1atyIFJe3wA_-VUV5_OU';

export const isSupabaseConfigured=()=>/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL)&&!SUPABASE_URL.includes('YOUR_PROJECT_REF')&&SUPABASE_PUBLISHABLE_KEY.length>30&&!SUPABASE_PUBLISHABLE_KEY.includes('YOUR_KEY');
