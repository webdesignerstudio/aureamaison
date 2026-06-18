-- Aurea Maison Floors — Task & Reminder Management (TRM)
-- Taakbeheer met prioriteiten en status tracking

CREATE TABLE taken (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titel TEXT NOT NULL,
  type TEXT DEFAULT 'taak' CHECK (type IN ('taak','reminder','follow-up','goedkeuring','urgent')),
  prioriteit TEXT DEFAULT 'Medium' CHECK (prioriteit IN ('Critical','High','Medium','Low')),
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending','In Progress','Escalated','Overdue','Waiting','Completed')),
  due_date DATE,
  toegewezen_aan UUID REFERENCES profiles(id),
  toegewezen_naam TEXT,
  entity_type TEXT,
  entity_id UUID,
  notities TEXT,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  aangemaakt_door UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE taken ENABLE ROW LEVEL SECURITY;

CREATE POLICY "taken_company" ON taken FOR ALL USING (
  company_id IN (
    SELECT company_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('owner','superadmin','keyuser','office')
  )
);

-- Index
CREATE INDEX idx_taken_company_id ON taken(company_id);
CREATE INDEX idx_taken_status ON taken(status);
CREATE INDEX idx_taken_due_date ON taken(due_date);
CREATE INDEX idx_taken_toegewezen ON taken(toegewezen_aan);
