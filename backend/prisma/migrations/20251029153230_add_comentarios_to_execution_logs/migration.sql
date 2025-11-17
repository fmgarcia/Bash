-- CreateTable
CREATE TABLE `roles` (
    `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,

    UNIQUE INDEX `uq_roles_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NULL,
    `password_hash` VARCHAR(255) NULL,
    `role_id` TINYINT UNSIGNED NOT NULL DEFAULT 2,
    `full_name` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,
    `last_login_at` DATETIME(0) NULL,

    UNIQUE INDEX `uq_users_username`(`username`),
    UNIQUE INDEX `uq_users_email`(`email`),
    INDEX `fk_users_role`(`role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scripts` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `body` LONGTEXT NOT NULL,
    `interpreter` VARCHAR(50) NOT NULL DEFAULT 'powershell',
    `entry_point` VARCHAR(255) NULL,
    `parameters_schema` LONGTEXT NULL,
    `tags` VARCHAR(255) NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER UNSIGNED NULL,
    `updated_by` INTEGER UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,
    `version` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `last_executed_at` DATETIME(0) NULL,
    `execution_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    INDEX `idx_scripts_created_by`(`created_by`),
    INDEX `idx_scripts_is_enabled`(`is_enabled`),
    INDEX `fk_scripts_updated_by`(`updated_by`),
    FULLTEXT INDEX `ft_scripts_name_desc_tags`(`name`, `description`, `tags`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `script_versions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `script_id` INTEGER UNSIGNED NOT NULL,
    `version` INTEGER UNSIGNED NOT NULL,
    `body` LONGTEXT NOT NULL,
    `notes` TEXT NULL,
    `created_by` INTEGER UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_sv_script_id`(`script_id`),
    INDEX `fk_sv_created_by`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `execution_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `script_id` INTEGER UNSIGNED NOT NULL,
    `executed_by` INTEGER UNSIGNED NULL,
    `host_name` VARCHAR(255) NULL,
    `host_ip` VARCHAR(45) NULL,
    `started_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `finished_at` DATETIME(0) NULL,
    `duration_seconds` DECIMAL(10, 3) NULL,
    `exit_code` INTEGER NULL,
    `success` BOOLEAN NULL,
    `stdout` LONGTEXT NULL,
    `stderr` LONGTEXT NULL,
    `execution_context` LONGTEXT NULL,
    `comentarios` TEXT NULL,

    INDEX `idx_el_script_id`(`script_id`),
    INDEX `idx_el_executed_by`(`executed_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_trail` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `entity` VARCHAR(100) NOT NULL,
    `entity_id` BIGINT UNSIGNED NULL,
    `action` VARCHAR(50) NOT NULL,
    `performed_by` INTEGER UNSIGNED NULL,
    `performed_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `details` LONGTEXT NULL,

    INDEX `idx_audit_entity`(`entity`, `entity_id`),
    INDEX `fk_audit_performed_by`(`performed_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scripts` ADD CONSTRAINT `fk_scripts_created_by` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scripts` ADD CONSTRAINT `fk_scripts_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `script_versions` ADD CONSTRAINT `fk_sv_created_by` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `script_versions` ADD CONSTRAINT `fk_sv_script` FOREIGN KEY (`script_id`) REFERENCES `scripts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `execution_logs` ADD CONSTRAINT `fk_el_executed_by` FOREIGN KEY (`executed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `execution_logs` ADD CONSTRAINT `fk_el_script` FOREIGN KEY (`script_id`) REFERENCES `scripts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_trail` ADD CONSTRAINT `fk_audit_performed_by` FOREIGN KEY (`performed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
