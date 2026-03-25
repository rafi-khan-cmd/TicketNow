CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Agent',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Software', 'Hardware', 'Network', 'Access', 'Other')),
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT NOT NULL CHECK (status IN ('Open', 'In Progress', 'Waiting on User', 'Resolved', 'Closed')) DEFAULT 'Open',
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  department TEXT NOT NULL,
  attachment_url TEXT,
  assigned_to INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  escalation_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP
);

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS impact TEXT CHECK (impact IN ('Low', 'Medium', 'High'));
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('Low', 'Medium', 'High'));
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS response_due_at TIMESTAMP;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolution_due_at TIMESTAMP;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS first_responded_at TIMESTAMP;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_breached BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS asset_id INTEGER;

CREATE TABLE IF NOT EXISTS ticket_notes (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  note_type TEXT NOT NULL CHECK (note_type IN ('Internal', 'Escalation', 'Resolution')),
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_status_history (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  asset_tag TEXT UNIQUE NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('Laptop', 'Desktop', 'Mobile', 'Printer', 'Network Device', 'Other')),
  model TEXT NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  assigned_to_name TEXT,
  department TEXT,
  location TEXT,
  status TEXT NOT NULL CHECK (status IN ('In Use', 'In Stock', 'Repair', 'Retired')) DEFAULT 'In Use',
  last_check_in_at TIMESTAMP,
  warranty_expiry DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Software', 'Hardware', 'Network', 'Access', 'Other')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_tickets_asset_id'
      AND table_name = 'tickets'
  ) THEN
    ALTER TABLE tickets
    ADD CONSTRAINT fk_tickets_asset_id
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_kb_category ON knowledge_base_articles(category);