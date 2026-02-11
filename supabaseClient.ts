
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzskjlejnizbkxgfcexb.supabase.co';
const supabaseKey = 'sb_publishable_RDrDdlljuBnHLY2RbMfL7A_huTiNThu';

export const supabase = createClient(supabaseUrl, supabaseKey);
