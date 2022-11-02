/*
  Warnings:

  - Added the required column `reasonSummary` to the `DisciplinaryAction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ActivityParticiptation` DROP FOREIGN KEY `activityparticiptation_ibfk_1`;

-- DropForeignKey
ALTER TABLE `ActivityParticiptation` DROP FOREIGN KEY `activityparticiptation_ibfk_2`;

-- DropForeignKey
ALTER TABLE `ApplicationAcceptance` DROP FOREIGN KEY `applicationacceptance_ibfk_2`;

-- DropForeignKey
ALTER TABLE `ApplicationAcceptance` DROP FOREIGN KEY `applicationacceptance_ibfk_1`;

-- DropForeignKey
ALTER TABLE `ApplicationFormAdditionalAnswer` DROP FOREIGN KEY `applicationformadditionalanswer_ibfk_2`;

-- DropForeignKey
ALTER TABLE `ApplicationFormAdditionalAnswer` DROP FOREIGN KEY `applicationformadditionalanswer_ibfk_1`;

-- DropForeignKey
ALTER TABLE `DisciplinaryAction` DROP FOREIGN KEY `disciplinaryaction_ibfk_1`;

-- DropForeignKey
ALTER TABLE `DisciplinaryAction` DROP FOREIGN KEY `disciplinaryaction_ibfk_3`;

-- DropForeignKey
ALTER TABLE `DisciplinaryAction` DROP FOREIGN KEY `disciplinaryaction_ibfk_2`;

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
ALTER TABLE `DisciplinaryAction` ADD COLUMN     `reasonSummary` VARCHAR(191) NOT NULL,
    MODIFY `type` ENUM('Caution', 'Warning', 'Probation', 'Impeachment', 'Explusion', 'Nullify', 'Other') NOT NULL;

-- AddForeignKey
ALTER TABLE `ActivityParticiptation` ADD FOREIGN KEY (`actorId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityParticiptation` ADD FOREIGN KEY (`creatorId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationAcceptance` ADD FOREIGN KEY (`applicationId`) REFERENCES `ApplicationForm`(`applicationId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationAcceptance` ADD FOREIGN KEY (`accepterId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationFormAdditionalAnswer` ADD FOREIGN KEY (`questionId`) REFERENCES `ApplicationFormAdditionalQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationFormAdditionalAnswer` ADD FOREIGN KEY (`applicationId`) REFERENCES `ApplicationForm`(`applicationId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DisciplinaryAction` ADD FOREIGN KEY (`actorId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DisciplinaryAction` ADD FOREIGN KEY (`subjectId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DisciplinaryAction` ADD FOREIGN KEY (`creatorId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
