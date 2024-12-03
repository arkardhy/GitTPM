import { supabase } from '../lib/supabase';

export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('verify_admin_password', {
      password_attempt: password
    });
    
    if (error) {
      console.error('Error verifying password:', error);
      return false;
    }

    return data || false;
  } catch (err) {
    console.error('Failed to verify password:', err);
    return false;
  }
}