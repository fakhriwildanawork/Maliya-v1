-- Budgets and Revenue Plans Module Schema

DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS revenue_plans CASCADE;

CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    "limit" REAL NOT NULL DEFAULT 0,
    spent REAL NOT NULL DEFAULT 0,
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

CREATE TABLE IF NOT EXISTS budget_expenses_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    estimated_amount REAL NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    created_timezone TEXT,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    updated_timezone TEXT
);

-- Audit Trail triggers
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

DROP TRIGGER IF EXISTS budgets_update_audit ON budgets;
CREATE TRIGGER budgets_update_audit
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS revenue_plans_update_audit ON revenue_plans;
CREATE TRIGGER revenue_plans_update_audit
    BEFORE UPDATE ON revenue_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS budget_expenses_plans_update_audit ON budget_expenses_plans;
CREATE TRIGGER budget_expenses_plans_update_audit
    BEFORE UPDATE ON budget_expenses_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
