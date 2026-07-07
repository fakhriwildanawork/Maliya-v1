-- Assets Module Schema
-- Diperbarui untuk menggunakan Supabase (PostgreSQL)

CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Other',
    purchase_price REAL NOT NULL DEFAULT 0,
    current_value REAL NOT NULL DEFAULT 0,
    purchase_date TEXT,
    last_updated TEXT,
    description TEXT,
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    created_timezone TEXT,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    updated_timezone TEXT
);

CREATE TABLE IF NOT EXISTS asset_history_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    value REAL NOT NULL DEFAULT 0,
    note TEXT,
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    created_timezone TEXT,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    updated_timezone TEXT
);

-- Trigger untuk update audit trail (Membutuhkan fungsi update_updated_at_column)
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

DROP TRIGGER IF EXISTS assets_update_audit ON assets;
CREATE TRIGGER assets_update_audit
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS asset_history_logs_update_audit ON asset_history_logs;
CREATE TRIGGER asset_history_logs_update_audit
    BEFORE UPDATE ON asset_history_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed Assets if they do not exist
INSERT INTO assets (id, name, category, purchase_price, current_value, purchase_date, last_updated, description)
VALUES 
('d1a8e1cb-ffeb-44bd-9cbe-135e8b4e7244', 'Rumah Tinggal Utama', 'Property', 1200000000, 1500000000, '2023-04-15', '2026-06-15', 'Rumah tipe 72 di kawasan perumahan Bintaro.'),
('d1a8e1cb-ffeb-44bd-9cbe-135e8b4e7245', 'Mobil Honda HR-V', 'Vehicle', 380000000, 290000000, '2024-02-10', '2026-05-10', 'Mobil operasional keluarga harian.'),
('d1a8e1cb-ffeb-44bd-9cbe-135e8b4e7246', 'MacBook Pro 16" M3 Max', 'Electronics', 55000000, 38000000, '2024-11-20', '2026-06-01', 'Laptop kerja utama Oripio Studio.')
ON CONFLICT (id) DO NOTHING;

-- Seed Asset History Logs
INSERT INTO asset_history_logs (id, asset_id, date, value, note)
VALUES
('e2a8e1cb-ffeb-44bd-9cbe-135e8b4e7241', 'd1a8e1cb-ffeb-44bd-9cbe-135e8b4e7244', '2023-04-15', 1200000000, 'Harga Pembelian Perdana'),
('e2a8e1cb-ffeb-44bd-9cbe-135e8b4e7242', 'd1a8e1cb-ffeb-44bd-9cbe-135e8b4e7244', '2025-01-15', 1380000000, 'Apresiasi nilai properti sekitar 15%'),
('e2a8e1cb-ffeb-44bd-9cbe-135e8b4e7243', 'd1a8e1cb-ffeb-44bd-9cbe-135e8b4e7244', '2026-06-15', 1500000000, 'Penilaian pasar daerah sekitar naik signifikan'),

('e2a8e1cb-ffeb-44bd-9cbe-135e8b4e7244', 'd1a8e1cb-ffeb-44bd-9cbe-135e8b4e7245', '2024-02-10', 380000000, 'Beli gress baru'),
('e2a8e1cb-ffeb-44bd-9cbe-135e8b4e7245', 'd1a8e1cb-ffeb-44bd-9cbe-135e8b4e7245', '2025-02-10', 320000000, 'Depresiasi tahun pertama 15%'),
('e2a8e1cb-ffeb-44bd-9cbe-135e8b4e7246', 'd1a8e1cb-ffeb-44bd-9cbe-135e8b4e7245', '2026-05-10', 290000000, 'Depresiasi tahun berjalan'),

('e2a8e1cb-ffeb-44bd-9cbe-135e8b4e7247', 'd1a8e1cb-ffeb-44bd-9cbe-135e8b4e7246', '2024-11-20', 55000000, 'Pembelian baru untuk workstation'),
('e2a8e1cb-ffeb-44bd-9cbe-135e8b4e7248', 'd1a8e1cb-ffeb-44bd-9cbe-135e8b4e7246', '2026-06-01', 38000000, 'Penyesuaian nilai pasar barang elektronik bekas')
ON CONFLICT (id) DO NOTHING;
