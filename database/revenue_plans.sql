-- Revenue Plans Module Schema
-- Diperbarui untuk menggunakan Supabase (PostgreSQL)

CREATE TABLE IF NOT EXISTS revenue_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    target REAL NOT NULL DEFAULT 0,
    achieved REAL NOT NULL DEFAULT 0,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'On Track',
    
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

DROP TRIGGER IF EXISTS revenue_plans_update_audit ON revenue_plans;
CREATE TRIGGER revenue_plans_update_audit
    BEFORE UPDATE ON revenue_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
