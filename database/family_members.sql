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
-- (Data seed dihapus agar database murni dari input pengguna)

