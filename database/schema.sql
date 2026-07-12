CREATE DATABASE IF NOT EXISTS assetflow_db;
USE assetflow_db;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    parent_department_id INT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_parent_department
        FOREIGN KEY (parent_department_id) REFERENCES departments(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE asset_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    department_id INT,
    role_id INT,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_user_role
        FOREIGN KEY (role_id) REFERENCES roles(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_tag VARCHAR(50) NOT NULL UNIQUE,
    asset_name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    acquisition_date DATE,
    acquisition_cost DECIMAL(12,2),
    condition_status VARCHAR(50),
    location VARCHAR(100),
    department_id INT,
    is_bookable BOOLEAN DEFAULT FALSE,
    lifecycle_status ENUM('Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed') DEFAULT 'Available',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_asset_category
        FOREIGN KEY (category_id) REFERENCES asset_categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_asset_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_asset_creator
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;
CREATE TABLE asset_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    allocated_to_user_id INT NULL,
    allocated_to_department_id INT NULL,
    allocated_by INT NOT NULL,
    allocation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expected_return_date DATETIME NULL,
    actual_return_date DATETIME NULL,
    return_notes TEXT,
    allocation_status ENUM('Active', 'Returned', 'Overdue', 'Transferred') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_allocation_asset
        FOREIGN KEY (asset_id) REFERENCES assets(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_allocation_user
        FOREIGN KEY (allocated_to_user_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_allocation_department
        FOREIGN KEY (allocated_to_department_id) REFERENCES departments(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_allocation_by
        FOREIGN KEY (allocated_by) REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE transfer_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    current_holder_user_id INT NULL,
    requested_by_user_id INT NOT NULL,
    target_user_id INT NULL,
    target_department_id INT NULL,
    reason TEXT,
    request_status ENUM('Requested', 'Approved', 'Rejected', 'Completed') DEFAULT 'Requested',
    approved_by INT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    CONSTRAINT fk_transfer_asset
        FOREIGN KEY (asset_id) REFERENCES assets(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_transfer_current_holder
        FOREIGN KEY (current_holder_user_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_transfer_requested_by
        FOREIGN KEY (requested_by_user_id) REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_transfer_target_user
        FOREIGN KEY (target_user_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_transfer_target_department
        FOREIGN KEY (target_department_id) REFERENCES departments(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_transfer_approved_by
        FOREIGN KEY (approved_by) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE resource_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    booked_by_user_id INT NOT NULL,
    department_id INT NULL,
    booking_purpose VARCHAR(255),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    booking_status ENUM('Upcoming', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_asset
        FOREIGN KEY (asset_id) REFERENCES assets(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_booking_user
        FOREIGN KEY (booked_by_user_id) REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_booking_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT chk_booking_time CHECK (end_time > start_time)
) ENGINE=InnoDB;

CREATE TABLE maintenance_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    raised_by INT NOT NULL,
    issue_description TEXT NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    photo_url VARCHAR(255),
    maintenance_status ENUM('Pending', 'Approved', 'Rejected', 'Technician Assigned', 'In Progress', 'Resolved') DEFAULT 'Pending',
    approved_by INT NULL,
    technician_name VARCHAR(100),
    approved_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_maintenance_asset
        FOREIGN KEY (asset_id) REFERENCES assets(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_maintenance_raised_by
        FOREIGN KEY (raised_by) REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_maintenance_approved_by
        FOREIGN KEY (approved_by) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;
CREATE TABLE audit_cycles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    audit_name VARCHAR(100) NOT NULL,
    department_id INT NULL,
    location VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    audit_status ENUM('Planned', 'In Progress', 'Closed') DEFAULT 'Planned',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_audit_creator
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE audit_cycle_auditors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    audit_cycle_id INT NOT NULL,
    auditor_user_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_cycle
        FOREIGN KEY (audit_cycle_id) REFERENCES audit_cycles(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_auditor_user
        FOREIGN KEY (auditor_user_id) REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE audit_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    audit_cycle_id INT NOT NULL,
    asset_id INT NOT NULL,
    checked_by INT NOT NULL,
    verification_status ENUM('Verified', 'Missing', 'Damaged') NOT NULL,
    remarks TEXT,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_item_cycle
        FOREIGN KEY (audit_cycle_id) REFERENCES audit_cycles(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_audit_item_asset
        FOREIGN KEY (asset_id) REFERENCES assets(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_audit_item_user
        FOREIGN KEY (checked_by) REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('Asset Assigned', 'Maintenance Update', 'Booking Update', 'Transfer Update', 'Overdue Alert', 'Audit Alert') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_department ON assets(department_id);
CREATE INDEX idx_assets_status ON assets(lifecycle_status);
CREATE INDEX idx_allocations_asset ON asset_allocations(asset_id);
CREATE INDEX idx_allocations_user ON asset_allocations(allocated_to_user_id);
CREATE INDEX idx_bookings_asset ON resource_bookings(asset_id);
CREATE INDEX idx_bookings_time ON resource_bookings(start_time, end_time);
CREATE INDEX idx_maintenance_asset ON maintenance_requests(asset_id);
CREATE INDEX idx_audit_items_asset ON audit_items(asset_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_logs_user ON activity_logs(user_id);