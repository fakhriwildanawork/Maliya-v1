-- Goals Module Schema
-- Diperbarui untuk menggunakan Supabase (PostgreSQL)

DO $$
BEGIN
    -- Menghapus tabel lama jika masih menggunakan format schema_v1 lama (di mana ada user_id)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'goals' AND column_name = 'user_id'
    ) THEN
        DROP TABLE goals CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    target_amount REAL NOT NULL DEFAULT 0,
    current_amount REAL NOT NULL DEFAULT 0,
    deadline TEXT,
    category TEXT,
    icon TEXT,
    status TEXT NOT NULL DEFAULT 'In Progress',
    start_date TEXT,
    monthly_target REAL DEFAULT 0,
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    created_timezone TEXT,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    updated_timezone TEXT
);

-- Trigger untuk update audit trail (Membutuhkan fungsi update_updated_at_column dari accounts.sql atau didefinisikan secara global)
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

DROP TRIGGER IF EXISTS goals_update_audit ON goals;
CREATE TRIGGER goals_update_audit
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
