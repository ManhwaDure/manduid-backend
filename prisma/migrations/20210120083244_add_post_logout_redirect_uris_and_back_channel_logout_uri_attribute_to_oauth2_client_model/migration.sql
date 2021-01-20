/*
  Warnings:

  - The migration will change the primary key for the `subscription` table. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `postLogoutRedirectUris` to the `oauth2Client` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `applicationacceptance` DROP FOREIGN KEY `applicationacceptance_ibfk_2`;

-- DropForeignKey
ALTER TABLE `applicationacceptance` DROP FOREIGN KEY `applicationacceptance_ibfk_1`;

-- DropForeignKey
ALTER TABLE `applicationformadditionalanswer` DROP FOREIGN KEY `applicationformadditionalanswer_ibfk_2`;

-- DropForeignKey
ALTER TABLE `applicationformadditionalanswer` DROP FOREIGN KEY `applicationformadditionalanswer_ibfk_1`;

-- DropForeignKey
ALTER TABLE `graphqlsession` DROP FOREIGN KEY `graphqlsession_ibfk_1`;

-- DropForeignKey
ALTER TABLE `member` DROP FOREIGN KEY `member_ibfk_1`;

-- DropForeignKey
ALTER TABLE `member` DROP FOREIGN KEY `member_ibfk_2`;

-- DropForeignKey
ALTER TABLE `memberrecordhistory` DROP FOREIGN KEY `memberrecordhistory_ibfk_1`;

-- DropForeignKey
ALTER TABLE `memberrecordhistory` DROP FOREIGN KEY `memberrecordhistory_ibfk_2`;

-- DropForeignKey
ALTER TABLE `memberrecordhistory` DROP FOREIGN KEY `memberrecordhistory_ibfk_3`;

-- DropForeignKey
ALTER TABLE `oauth2authorizationcode` DROP FOREIGN KEY `oauth2authorizationcode_ibfk_1`;

-- DropForeignKey
ALTER TABLE `oauth2authorizationcode` DROP FOREIGN KEY `oauth2authorizationcode_ibfk_3`;

-- DropForeignKey
ALTER TABLE `oauth2authorizationcode` DROP FOREIGN KEY `oauth2authorizationcode_ibfk_2`;

-- DropForeignKey
ALTER TABLE `oidcsession` DROP FOREIGN KEY `oidcsession_ibfk_2`;

-- DropForeignKey
ALTER TABLE `oidcsession` DROP FOREIGN KEY `oidcsession_ibfk_1`;

-- DropForeignKey
ALTER TABLE `permission` DROP FOREIGN KEY `permission_ibfk_1`;

-- DropForeignKey
ALTER TABLE `ssouser` DROP FOREIGN KEY `ssouser_ibfk_1`;

-- DropForeignKey
ALTER TABLE `subscription` DROP FOREIGN KEY `subscription_ibfk_1`;

-- AlterTable
ALTER TABLE `code` MODIFY `usage` ENUM('ResendEmailVerification', 'EmailVerification', 'MembershipVerification', 'PasswordRecovery') NOT NULL;

-- AlterTable
ALTER TABLE `member` MODIFY `memberType` ENUM('AssociateMember', 'RegularMember', 'HonoraryMember', 'Removed', 'Explusion') NOT NULL,
    MODIFY `schoolRegisterationStatus` ENUM('Enrolled', 'LeaveOfAbsence', 'MilitaryLeaveOfAbsence', 'Graduated', 'Expelled') NOT NULL;

-- AlterTable
ALTER TABLE `memberrecordhistory` MODIFY `memberType` ENUM('AssociateMember', 'RegularMember', 'HonoraryMember', 'Removed', 'Explusion') NOT NULL,
    MODIFY `schoolRegisterationStatus` ENUM('Enrolled', 'LeaveOfAbsence', 'MilitaryLeaveOfAbsence', 'Graduated', 'Expelled') NOT NULL;

-- AlterTable
ALTER TABLE `oauth2client` ADD COLUMN     `postLogoutRedirectUris` VARCHAR(191) NOT NULL,
    ADD COLUMN     `BackchannelLogoutUri` VARCHAR(191);

-- AlterTable
ALTER TABLE `ssouser` MODIFY `hashAlgorithm` ENUM('sha256', 'bcrypt') NOT NULL;

-- AlterTable
ALTER TABLE `subscription` DROP PRIMARY KEY,
    MODIFY `target` ENUM('NewApplicationForm') NOT NULL,
    MODIFY `method` ENUM('Email') NOT NULL,
    ADD PRIMARY KEY (`subscriptorId`, `target`, `method`);

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
