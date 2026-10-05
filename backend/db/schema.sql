-- ==============================================================================
-- Borewell Daily Drilling Management Application
-- Database Schema (PostgreSQL 14+)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. DROP EXISTING TABLES (Reverse Dependency Order)
DROP TABLE IF EXISTS drilling_reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_status AS ENUM ('ACTIVE', 'MAINTENANCE', 'IDLE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. VEHICLES / RIGS TABLE (4 Drilling Vehicles)
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_number VARCHAR(30) UNIQUE NOT NULL,
    rig_name VARCHAR(100) NOT NULL,
    chassis_number VARCHAR(100),
    compressor_model VARCHAR(100),
    status vehicle_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. USERS TABLE (6 Admins, 4 Rig Managers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'MANAGER',
    assigned_vehicle_id INT REFERENCES vehicles(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. DRILLING DAILY REPORTS TABLE
CREATE TABLE drilling_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    manager_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Site & Customer Details
    agent_name VARCHAR(100),
    party_no VARCHAR(50),
    party_name VARCHAR(150) NOT NULL,
    village VARCHAR(100) NOT NULL,
    bore_rate NUMERIC(10, 2) DEFAULT 0.00,
    
    -- Drilling Metrics
    depth NUMERIC(10, 2) NOT NULL CHECK (depth >= 0),
    rod_count INT NOT NULL DEFAULT 0 CHECK (rod_count >= 0),
    ms_casing NUMERIC(10, 2) DEFAULT 0.00 CHECK (ms_casing >= 0),
    pvc_casing NUMERIC(10, 2) DEFAULT 0.00 CHECK (pvc_casing >= 0),
    welding_details VARCHAR(255),
    recut VARCHAR(100),
    rebore VARCHAR(100),
    flushing VARCHAR(100),
    
    -- Machine & RPM Stats
    rpm_start NUMERIC(10, 2) NOT NULL CHECK (rpm_start >= 0),
    rpm_end NUMERIC(10, 2) NOT NULL CHECK (rpm_end >= 0),
    rpm_total NUMERIC(10, 2) NOT NULL CHECK (rpm_total >= 0),
    avg_rpm NUMERIC(10, 2) DEFAULT 0.00,
    
    -- Equipment & Operations
    bit_number VARCHAR(50),
    bit_size VARCHAR(50),
    hammer_type VARCHAR(50),
    driller_name VARCHAR(100),
    diesel_liters NUMERIC(10, 2) DEFAULT 0.00 CHECK (diesel_liters >= 0),
    
    -- Financials & Notes
    cash_advance VARCHAR(100),
    remarks TEXT,
    
    -- Audit Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Business Logic Constraint
    CONSTRAINT check_rpm_validity CHECK (rpm_end >= rpm_start)
);

-- 6. INDEXES FOR HIGH-PERFORMANCE QUERIES
CREATE INDEX idx_drilling_reports_vehicle_id ON drilling_reports(vehicle_id);
CREATE INDEX idx_drilling_reports_report_date ON drilling_reports(report_date DESC);
CREATE INDEX idx_drilling_reports_created_at ON drilling_reports(created_at DESC);
CREATE INDEX idx_drilling_reports_village ON drilling_reports(village);
CREATE INDEX idx_drilling_reports_manager_id ON drilling_reports(manager_id);
CREATE INDEX idx_drilling_reports_party_name ON drilling_reports(party_name);

-- 7. AUTO UPDATE TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_drilling_reports_updated_at
    BEFORE UPDATE ON drilling_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
