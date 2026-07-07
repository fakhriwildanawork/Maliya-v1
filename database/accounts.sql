-- Accounts (Wallets & Credit Cards) Module Schema
-- Diperbarui untuk menggunakan Supabase (PostgreSQL)

-- Temporary alter for existing dev DBs that have the flagicon or flagIcon column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'wallets' AND column_name = 'flagicon'
    ) THEN
        ALTER TABLE wallets DROP COLUMN flagicon;
    END IF;
    
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'wallets' AND column_name = 'flagIcon'
    ) THEN
        ALTER TABLE wallets DROP COLUMN "flagIcon";
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    balance REAL NOT NULL DEFAULT 0,
    "limit" REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Active',
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    created_timezone TEXT,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    updated_timezone TEXT
);

-- Function untuk update audit trail (PostgreSQL)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk table wallets
DROP TRIGGER IF EXISTS wallets_update_audit ON wallets;
CREATE TRIGGER wallets_update_audit
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS credit_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT NOT NULL,
    exp TEXT NOT NULL,
    cvv TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    theme TEXT NOT NULL,
    balance REAL NOT NULL DEFAULT 0,
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    created_timezone TEXT,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    updated_timezone TEXT
);

-- Trigger untuk table credit_cards
DROP TRIGGER IF EXISTS credit_cards_update_audit ON credit_cards;
CREATE TRIGGER credit_cards_update_audit
    BEFORE UPDATE ON credit_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

