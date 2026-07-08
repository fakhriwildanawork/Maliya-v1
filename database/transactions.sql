-- Transactions Module Schema
-- Diperbarui untuk menggunakan Supabase (PostgreSQL)

DO $$
BEGIN
    -- Menghapus tabel lama jika masih menggunakan format schema_v1 lama 
    -- (di mana kolom order_id tidak ada, tapi ada user_id atau amount)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'user_id'
    ) THEN
        DROP TABLE transactions CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Completed',
    date TEXT NOT NULL,
    datetime TEXT,
    description TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    type TEXT,
    source_account_id UUID,
    destination_account_id UUID,
    linked_debt_id UUID,
    expense_plan_id UUID,
    income_plan_id UUID,
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    created_timezone TEXT,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    updated_timezone TEXT
);

-- Pastikan tabel referensi ada atau biarkan foreign key longgar jika module lain belum lengkap.
-- Mengingat ini adalah proses transisi dari schema lama ke modular.
-- Jika diperlukan Foreign Keys, dapat ditambahkan kemudian dengan ALTER TABLE.

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

DROP TRIGGER IF EXISTS transactions_update_audit ON transactions;
CREATE TRIGGER transactions_update_audit
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
