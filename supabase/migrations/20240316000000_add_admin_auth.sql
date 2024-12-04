-- Create secure admin authentication
CREATE TABLE IF NOT EXISTS admin_auth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial admin password (hashed)
INSERT INTO admin_auth (password_hash) 
VALUES ('$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyBAWjR3Uj3yi6');

-- Create a secure function to verify admin password with rate limiting
CREATE OR REPLACE FUNCTION verify_admin_password(password_attempt TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt_count INTEGER;
  last_attempt TIMESTAMP;
  stored_hash TEXT;
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

  -- Get stored password hash
  SELECT password_hash INTO stored_hash
  FROM admin_auth
  ORDER BY created_at DESC
  LIMIT 1;

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

  -- Verify password using pgcrypto's crypt function
  RETURN stored_hash = crypt(password_attempt, stored_hash);
END;
$$;

-- Create audit log for login attempts if not exists
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

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;