-- ==============================================================================
-- Seed Data for Borewell Drilling Application
-- 4 Vehicles, 6 Admins, 4 Managers, and Sample Reports
-- ==============================================================================

-- 1. Insert 4 Vehicles
INSERT INTO vehicles (id, vehicle_number, rig_name, chassis_number, compressor_model, status)
VALUES
    (1, 'TN-28-AA-1001', 'Rig 1 (Ashok Leyland 6x4)', 'AL-CH-98124', 'ELGI 1100 CFM / 300 PSI', 'ACTIVE'),
    (2, 'TN-28-AA-1002', 'Rig 2 (Tata Prima 2528)', 'TP-CH-77431', 'Atlas Copco XRVS 1250', 'ACTIVE'),
    (3, 'TN-28-AA-1003', 'Rig 3 (BharatBenz 2828C)', 'BB-CH-55102', 'Doosan HP 1050', 'ACTIVE'),
    (4, 'TN-28-AA-1004', 'Rig 4 (Eicher Pro 6028)', 'EP-CH-33299', 'ELGI 1200 CFM / 330 PSI', 'ACTIVE')
ON CONFLICT (id) DO UPDATE 
SET vehicle_number = EXCLUDED.vehicle_number;

-- Reset sequence to 5
SELECT setval('vehicles_id_seq', (SELECT MAX(id) FROM vehicles));

-- 2. Insert 6 Admins & 4 Managers
-- Fixed UUIDs for predictable testing/seeding
INSERT INTO users (id, name, phone, email, role)
VALUES
    -- 6 Admins (Owners / Head Office Operations)
    ('a0000000-0000-0000-0000-000000000001', 'K. Rajesh (Managing Partner)', '9842100001', 'rajesh.admin@borewell.com', 'ADMIN'),
    ('a0000000-0000-0000-0000-000000000002', 'S. Kumar (Fleet Director)', '9842100002', 'kumar.admin@borewell.com', 'ADMIN'),
    ('a0000000-0000-0000-0000-000000000003', 'M. Anitha (Finance Controller)', '9842100003', 'anitha.finance@borewell.com', 'ADMIN'),
    ('a0000000-0000-0000-0000-000000000004', 'V. Senthil (Operations Head)', '9842100004', 'senthil.ops@borewell.com', 'ADMIN'),
    ('a0000000-0000-0000-0000-000000000005', 'P. Karthik (Audit & Inventory)', '9842100005', 'karthik.audit@borewell.com', 'ADMIN'),
    ('a0000000-0000-0000-0000-000000000006', 'D. Ramesh (Admin Coordinator)', '9842100006', 'ramesh.admin@borewell.com', 'ADMIN'),

    -- 4 Rig Managers (Field Officers for Rigs 1 to 4)
    ('b0000000-0000-0000-0000-000000000001', 'Saravanan (Manager Rig-1)', '9842100011', 'saravanan.rig1@borewell.com', 'MANAGER'),
    ('b0000000-0000-0000-0000-000000000002', 'Murugan (Manager Rig-2)', '9842100012', 'murugan.rig2@borewell.com', 'MANAGER'),
    ('b0000000-0000-0000-0000-000000000003', 'Selvam (Manager Rig-3)', '9842100013', 'selvam.rig3@borewell.com', 'MANAGER'),
    ('b0000000-0000-0000-0000-000000000004', 'Ganesan (Manager Rig-4)', '9842100014', 'ganesan.rig4@borewell.com', 'MANAGER')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Sample Drilling Reports for Demo Data
INSERT INTO drilling_reports (
    vehicle_id, manager_id, report_date, agent_name, party_no, party_name,
    village, bore_rate, depth, rod_count, ms_casing, pvc_casing, welding_details,
    recut, rebore, flushing, rpm_start, rpm_end, rpm_total, avg_rpm,
    bit_number, bit_size, hammer_type, driller_name, diesel_liters, cash_advance, remarks
) VALUES 
(
    1,
    'b0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '1 day',
    'Thirumoorthy',
    'PT-2024-88',
    'Velusamy Farmer',
    'Perundurai',
    85.00,
    750.00,
    37,
    45.00,
    120.00,
    '3 joints electric welded',
    'No',
    'No',
    '45 mins high pressure',
    1450.50,
    1462.20,
    11.70,
    1456.00,
    'BIT-6.5-901',
    '6.5 inch',
    'DHD 360',
    'Palanisamy',
    240.00,
    'Rs. 25,000 cash',
    'Good water yield at 520ft and 680ft (approx 2.5 inches). Completed smoothly.'
),
(
    2,
    'b0000000-0000-0000-0000-000000000002',
    CURRENT_DATE,
    'Nagaraj Agent',
    'PT-2024-89',
    'Sundaram Poultry Farm',
    'Kangeyam',
    90.00,
    920.00,
    46,
    60.00,
    140.00,
    '4 joints welded with reinforcement rings',
    '15 ft recut',
    'No',
    '1 hour flushing',
    2100.00,
    2114.50,
    14.50,
    1500.00,
    'BIT-6.5-904',
    '6.5 inch',
    'SD 6',
    'Mani Driller',
    310.00,
    'Rs. 30,000 GPay',
    'Boulders encountered up to 70ft. Heavy clay layer. Yield around 1.5 inches.'
),
(
    3,
    'b0000000-0000-0000-0000-000000000003',
    CURRENT_DATE,
    'Chinnasamy',
    'PT-2024-90',
    'Ramasamy Gounder',
    'Kodumudi',
    80.00,
    600.00,
    30,
    30.00,
    80.00,
    '2 joints welded',
    'No',
    'No',
    '30 mins flushing',
    1880.00,
    1889.00,
    9.00,
    1420.00,
    'BIT-6.5-880',
    '6.5 inch',
    'Copco QLX',
    'Arumugam',
    195.00,
    'Rs. 15,000 cash',
    'Soft rock formation. Fast drilling. Good spring water struck at 410ft.'
);
