-- Create a secure function to verify admin password with rate limiting
CREATE OR REPLACE FUNCTION verify_admin_password(password_attempt TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt_count INTEGER;
  last_attempt TIMESTAMP;
BEGIN
  -- Get recent attempts
  SELECT COUNT(*), MAX(created_at)
  INTO attempt_count, last_attempt
  FROM auth.audit_log_entries
  WHERE created_at > NOW() - INTERVAL '15 minutes'
    AND action = 'login'
    AND ip_address = inet_client_addr();

  -- Rate limiting: 5 attempts per 15 minutes
  IF attempt_count >= 5 AND last_attempt > NOW() - INTERVAL '15 minutes' THEN
    RAISE EXCEPTION 'Too many login attempts. Please try again later.';
  END IF;

  -- Log attempt
  INSERT INTO auth.audit_log_entries (
    instance_id,
    ip_address,
    created_at,
    action
  ) VALUES (
    gen_random_uuid(),
    inet_client_addr(),
    NOW(),
    'login'
  );

  -- Verify password (in production, use proper password hashing)
  RETURN password_attempt = '@T24n5_Kk';
END;
$$;

-- Create audit log for login attempts
CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_id UUID NOT NULL,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action TEXT NOT NULL
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_audit_log_ip_date 
ON auth.audit_log_entries (ip_address, created_at);