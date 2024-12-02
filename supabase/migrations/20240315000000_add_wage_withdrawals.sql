-- Create wage_withdrawals table
CREATE TABLE IF NOT EXISTS wage_withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  month VARCHAR(7) NOT NULL,
  withdrawn_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_employee_month UNIQUE (employee_id, month)
);

-- Enable RLS
ALTER TABLE wage_withdrawals ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for now (in production, you'd want to restrict this)
CREATE POLICY "Allow anonymous access to wage_withdrawals" ON wage_withdrawals FOR ALL USING (true);