-- DropForeignKey
ALTER TABLE `ApplicationAcceptance` DROP FOREIGN KEY `applicationacceptance_ibfk_2`;

-- DropForeignKey
ALTER TABLE `ApplicationAcceptance` DROP FOREIGN KEY `applicationacceptance_ibfk_1`;

-- DropForeignKey
ALTER TABLE `ApplicationFormAdditionalAnswer` DROP FOREIGN KEY `applicationformadditionalanswer_ibfk_2`;

-- DropForeignKey
ALTER TABLE `ApplicationFormAdditionalAnswer` DROP FOREIGN KEY `applicationformadditionalanswer_ibfk_1`;

-- DropForeignKey
ALTER TABLE `GraphQlSession` DROP FOREIGN KEY `graphqlsession_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Member` DROP FOREIGN KEY `member_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Member` DROP FOREIGN KEY `member_ibfk_2`;

-- DropForeignKey
ALTER TABLE `MemberRecordHistory` DROP FOREIGN KEY `memberrecordhistory_ibfk_1`;

-- DropForeignKey
ALTER TABLE `MemberRecordHistory` DROP FOREIGN KEY `memberrecordhistory_ibfk_2`;

-- DropForeignKey
ALTER TABLE `MemberRecordHistory` DROP FOREIGN KEY `memberrecordhistory_ibfk_3`;

-- DropForeignKey
ALTER TABLE `oauth2AuthorizationCode` DROP FOREIGN KEY `oauth2authorizationcode_ibfk_1`;

-- DropForeignKey
ALTER TABLE `oauth2AuthorizationCode` DROP FOREIGN KEY `oauth2authorizationcode_ibfk_3`;

-- DropForeignKey
ALTER TABLE `oauth2AuthorizationCode` DROP FOREIGN KEY `oauth2authorizationcode_ibfk_2`;

-- DropForeignKey
ALTER TABLE `OidcSession` DROP FOREIGN KEY `oidcsession_ibfk_2`;

-- DropForeignKey
ALTER TABLE `OidcSession` DROP FOREIGN KEY `oidcsession_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Permission` DROP FOREIGN KEY `permission_ibfk_1`;

-- DropForeignKey
ALTER TABLE `SSOUser` DROP FOREIGN KEY `ssouser_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Subscription` DROP FOREIGN KEY `subscription_ibfk_1`;

-- AlterTable
ALTER TABLE `Member` ADD COLUMN     `memo` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `MemberRecordHistory` ADD COLUMN     `memo` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `ActivityParticiptation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `actorId` INTEGER NOT NULL,
    `creatorId` INTEGER NOT NULL,
    `activity` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `participatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DisciplinaryAction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `actorId` INTEGER NOT NULL,
    `subjectId` INTEGER NOT NULL,
    `creatorId` INTEGER NOT NULL,
    `type` ENUM('Caution', 'Warning', 'Probation', 'Impeachment', 'Explusion', 'Other') NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `actedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ActivityParticiptation` ADD FOREIGN KEY (`actorId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityParticiptation` ADD FOREIGN KEY (`creatorId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DisciplinaryAction` ADD FOREIGN KEY (`actorId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DisciplinaryAction` ADD FOREIGN KEY (`subjectId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DisciplinaryAction` ADD FOREIGN KEY (`creatorId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationAcceptance` ADD FOREIGN KEY (`applicationId`) REFERENCES `ApplicationForm`(`applicationId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationAcceptance` ADD FOREIGN KEY (`accepterId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationFormAdditionalAnswer` ADD FOREIGN KEY (`questionId`) REFERENCES `ApplicationFormAdditionalQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationFormAdditionalAnswer` ADD FOREIGN KEY (`applicationId`) REFERENCES `ApplicationForm`(`applicationId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GraphQlSession` ADD FOREIGN KEY (`ssoUserId`) REFERENCES `SSOUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Member` ADD FOREIGN KEY (`creatorId`) REFERENCES `Member`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Member` ADD FOREIGN KEY (`executiveTypeName`) REFERENCES `ExecutiveType`(`name`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MemberRecordHistory` ADD FOREIGN KEY (`creatorId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MemberRecordHistory` ADD FOREIGN KEY (`executiveTypeName`) REFERENCES `ExecutiveType`(`name`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MemberRecordHistory` ADD FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oauth2AuthorizationCode` ADD FOREIGN KEY (`clientId`) REFERENCES `oauth2Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oauth2AuthorizationCode` ADD FOREIGN KEY (`userId`) REFERENCES `SSOUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oauth2AuthorizationCode` ADD FOREIGN KEY (`graphQlSessionId`) REFERENCES `GraphQlSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OidcSession` ADD FOREIGN KEY (`graphQlSessionId`) REFERENCES `GraphQlSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OidcSession` ADD FOREIGN KEY (`clientId`) REFERENCES `oauth2Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Permission` ADD FOREIGN KEY (`executiveTypeName`) REFERENCES `ExecutiveType`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SSOUser` ADD FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD FOREIGN KEY (`subscriptorId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
