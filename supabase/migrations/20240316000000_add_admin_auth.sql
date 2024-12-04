-- Create a secure function to verify admin password
CREATE OR REPLACE FUNCTION verify_admin_password(password_attempt TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For development purposes, using a simple password check
  RETURN password_attempt = '@T24n5_Kk';
END;
$$;