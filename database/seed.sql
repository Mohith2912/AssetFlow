USE assetflow_db;

INSERT INTO roles (role_name) VALUES
('Admin'),
('Asset Manager'),
('Department Head'),
('Employee');

INSERT INTO departments (department_name, parent_department_id, status) VALUES
('Administration', NULL, 'Active'),
('IT', NULL, 'Active'),
('Operations', NULL, 'Active');

INSERT INTO asset_categories (category_name, description, status) VALUES
('Electronics', 'Laptops, desktops, tablets and accessories', 'Active'),
('Furniture', 'Office furniture and fixtures', 'Active'),
('Vehicles', 'Cars, vans and transport vehicles', 'Active'),
('Rooms', 'Meeting rooms and shared office spaces', 'Active');

INSERT INTO users (full_name, email, password_hash, department_id, role_id, status) VALUES
('Asha Admin', 'admin@assetflow.com', 'hashed_admin_pw', 1, 1, 'Active'),
('Manoj Manager', 'manager@assetflow.com', 'hashed_manager_pw', 2, 2, 'Active'),
('Deepa Head', 'head@assetflow.com', 'hashed_head_pw', 2, 3, 'Active'),
('Ravi Employee', 'ravi@assetflow.com', 'hashed_ravi_pw', 2, 4, 'Active'),
('Priya Employee', 'priya@assetflow.com', 'hashed_priya_pw', 3, 4, 'Active'),
('Kiran Auditor', 'auditor@assetflow.com', 'hashed_auditor_pw', 1, 4, 'Active');

INSERT INTO assets (
    asset_tag, asset_name, category_id, serial_number, acquisition_date,
    acquisition_cost, condition_status, location, department_id, is_bookable,
    lifecycle_status, created_by
) VALUES
('AF-0001', 'Dell Latitude Laptop', 1, 'SN-LAP-001', '2025-01-10', 65000.00, 'Good', 'IT Room 1', 2, FALSE, 'Allocated', 2),
('AF-0002', 'HP Laptop', 1, 'SN-LAP-002', '2025-02-15', 62000.00, 'Good', 'IT Room 2', 2, FALSE, 'Available', 2),
('AF-0003', 'Projector Epson', 1, 'SN-PRO-003', '2025-03-01', 40000.00, 'Good', 'Conference Hall', 1, TRUE, 'Available', 2),
('AF-0004', 'Meeting Room B2', 4, 'ROOM-B2', '2024-12-01', 0.00, 'Excellent', 'Floor 2', 1, TRUE, 'Reserved', 1),
('AF-0005', 'Office Chair Set', 2, 'SN-CHR-005', '2025-01-20', 12000.00, 'Good', 'Operations Bay', 3, FALSE, 'Available', 2),
('AF-0006', 'Company Van', 3, 'SN-VAN-006', '2024-11-11', 800000.00, 'Under Service', 'Parking Lot', 3, TRUE, 'Under Maintenance', 2);

INSERT INTO asset_allocations (
    asset_id, allocated_to_user_id, allocated_to_department_id, allocated_by,
    allocation_date, expected_return_date, actual_return_date, return_notes, allocation_status
) VALUES
(1, 5, NULL, 2, '2026-07-01 10:00:00', '2026-07-20 18:00:00', NULL, NULL, 'Active');

INSERT INTO transfer_requests (
    asset_id, current_holder_user_id, requested_by_user_id, target_user_id,
    target_department_id, reason, request_status, approved_by, requested_at
) VALUES
(1, 5, 4, 4, NULL, 'Laptop needed for urgent client work', 'Requested', NULL, CURRENT_TIMESTAMP);

INSERT INTO resource_bookings (
    asset_id, booked_by_user_id, department_id, booking_purpose,
    start_time, end_time, booking_status
) VALUES
(4, 4, 2, 'Team meeting', '2026-07-13 09:00:00', '2026-07-13 10:00:00', 'Upcoming'),
(3, 5, 3, 'Project presentation', '2026-07-13 11:00:00', '2026-07-13 12:00:00', 'Upcoming');

INSERT INTO maintenance_requests (
    asset_id, raised_by, issue_description, priority, photo_url,
    maintenance_status, approved_by, technician_name, approved_at, resolved_at, resolution_notes
) VALUES
(6, 5, 'Engine noise during trip', 'High', NULL, 'In Progress', 2, 'Suresh Technician', CURRENT_TIMESTAMP, NULL, NULL),
(2, 4, 'Battery drains quickly', 'Medium', NULL, 'Pending', NULL, NULL, NULL, NULL, NULL);

INSERT INTO audit_cycles (
    audit_name, department_id, location, start_date, end_date, audit_status, created_by
) VALUES
('July IT Audit', 2, 'IT Block', '2026-07-15', '2026-07-18', 'Planned', 1);

INSERT INTO audit_cycle_auditors (audit_cycle_id, auditor_user_id) VALUES
(1, 6);

INSERT INTO audit_items (
    audit_cycle_id, asset_id, checked_by, verification_status, remarks
) VALUES
(1, 1, 6, 'Verified', 'Laptop present and in use'),
(1, 2, 6, 'Damaged', 'Battery issue noticed');

INSERT INTO notifications (user_id, title, message, notification_type, is_read) VALUES
(5, 'Asset Assigned', 'Laptop AF-0001 has been assigned to you.', 'Asset Assigned', FALSE),
(4, 'Transfer Request Submitted', 'Your transfer request for AF-0001 is pending approval.', 'Transfer Update', FALSE),
(2, 'Maintenance Alert', 'Company Van AF-0006 is under maintenance.', 'Maintenance Update', FALSE),
(6, 'Audit Assigned', 'You have been assigned to July IT Audit.', 'Audit Alert', FALSE);

INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, description) VALUES
(1, 'CREATE', 'Department', 1, 'Created Administration department'),
(2, 'CREATE', 'Asset', 1, 'Registered Dell Latitude Laptop'),
(2, 'ALLOCATE', 'Asset Allocation', 1, 'Allocated AF-0001 to Priya Employee'),
(4, 'REQUEST', 'Transfer Request', 1, 'Requested transfer of AF-0001'),
(5, 'RAISE', 'Maintenance Request', 1, 'Raised maintenance for Company Van');