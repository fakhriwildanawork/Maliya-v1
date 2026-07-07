-- Family Members Module Schema
-- Diperbarui untuk menggunakan Supabase (PostgreSQL)

CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    relationship TEXT NOT NULL DEFAULT 'Other',
    role TEXT NOT NULL DEFAULT 'Member',
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    joined_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    access_code TEXT,
    password TEXT,
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    created_timezone TEXT,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    updated_timezone TEXT
);

-- Idempotent schema upgrades for existing tables
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS access_code TEXT;
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS password TEXT;

-- Trigger untuk update audit trail
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $func$ language 'plpgsql';
    END IF;
END $$;

DROP TRIGGER IF EXISTS family_members_update_audit ON family_members;
CREATE TRIGGER family_members_update_audit
    BEFORE UPDATE ON family_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed Family Members
INSERT INTO family_members (name, relationship, role, email, phone, avatar_url, joined_date, status)
VALUES
('Oripio Studio', 'Parent', 'Owner', 'oripiostudio@gmail.com', '081234567890', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', '2026-01-01', 'Active'),
('Siti Rahma', 'Spouse', 'Admin', 'sitirahma@family.com', '081298765432', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', '2026-01-05', 'Active'),
('Rian Pratama', 'Child', 'Member', 'rianpratama@family.com', '081344556677', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy', '2026-02-14', 'Active'),
('Aulia Zahra', 'Child', 'Viewer', 'auliazahra@family.com', '081399887766', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna', '2026-03-20', 'Pending')
ON CONFLICT (email) DO NOTHING;

