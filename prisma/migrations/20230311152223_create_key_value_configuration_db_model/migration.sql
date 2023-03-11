-- DropForeignKey
ALTER TABLE `ActivityParticiptation` DROP FOREIGN KEY `ActivityParticiptation_ibfk_1`;

-- DropForeignKey
ALTER TABLE `ActivityParticiptation` DROP FOREIGN KEY `ActivityParticiptation_ibfk_2`;

-- DropForeignKey
ALTER TABLE `ApplicationAcceptance` DROP FOREIGN KEY `ApplicationAcceptance_ibfk_1`;

-- DropForeignKey
ALTER TABLE `ApplicationAcceptance` DROP FOREIGN KEY `ApplicationAcceptance_ibfk_2`;

-- DropForeignKey
ALTER TABLE `ApplicationFormAdditionalAnswer` DROP FOREIGN KEY `ApplicationFormAdditionalAnswer_ibfk_1`;

-- DropForeignKey
ALTER TABLE `ApplicationFormAdditionalAnswer` DROP FOREIGN KEY `ApplicationFormAdditionalAnswer_ibfk_2`;

-- DropForeignKey
ALTER TABLE `DisciplinaryAction` DROP FOREIGN KEY `DisciplinaryAction_ibfk_1`;

-- DropForeignKey
ALTER TABLE `DisciplinaryAction` DROP FOREIGN KEY `DisciplinaryAction_ibfk_2`;

-- DropForeignKey
ALTER TABLE `DisciplinaryAction` DROP FOREIGN KEY `DisciplinaryAction_ibfk_3`;

-- DropForeignKey
ALTER TABLE `GraphQlSession` DROP FOREIGN KEY `GraphQlSession_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Member` DROP FOREIGN KEY `Member_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Member` DROP FOREIGN KEY `Member_ibfk_2`;

-- DropForeignKey
ALTER TABLE `MemberRecordHistory` DROP FOREIGN KEY `MemberRecordHistory_ibfk_1`;

-- DropForeignKey
ALTER TABLE `MemberRecordHistory` DROP FOREIGN KEY `MemberRecordHistory_ibfk_2`;

-- DropForeignKey
ALTER TABLE `MemberRecordHistory` DROP FOREIGN KEY `MemberRecordHistory_ibfk_3`;

-- DropForeignKey
ALTER TABLE `OidcSession` DROP FOREIGN KEY `OidcSession_ibfk_1`;

-- DropForeignKey
ALTER TABLE `OidcSession` DROP FOREIGN KEY `OidcSession_ibfk_2`;

-- DropForeignKey
ALTER TABLE `Permission` DROP FOREIGN KEY `Permission_ibfk_1`;

-- DropForeignKey
ALTER TABLE `SSOUser` DROP FOREIGN KEY `SSOUser_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Subscription` DROP FOREIGN KEY `Subscription_ibfk_1`;

-- DropForeignKey
ALTER TABLE `oauth2AuthorizationCode` DROP FOREIGN KEY `oauth2AuthorizationCode_ibfk_1`;

-- DropForeignKey
ALTER TABLE `oauth2AuthorizationCode` DROP FOREIGN KEY `oauth2AuthorizationCode_ibfk_2`;

-- DropForeignKey
ALTER TABLE `oauth2AuthorizationCode` DROP FOREIGN KEY `oauth2AuthorizationCode_ibfk_3`;

-- CreateTable
CREATE TABLE `Configuration` (
    `id` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `Member`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_executiveTypeName_fkey` FOREIGN KEY (`executiveTypeName`) REFERENCES `ExecutiveType`(`name`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MemberRecordHistory` ADD CONSTRAINT `MemberRecordHistory_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MemberRecordHistory` ADD CONSTRAINT `MemberRecordHistory_executiveTypeName_fkey` FOREIGN KEY (`executiveTypeName`) REFERENCES `ExecutiveType`(`name`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MemberRecordHistory` ADD CONSTRAINT `MemberRecordHistory_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SSOUser` ADD CONSTRAINT `SSOUser_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GraphQlSession` ADD CONSTRAINT `GraphQlSession_ssoUserId_fkey` FOREIGN KEY (`ssoUserId`) REFERENCES `SSOUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OidcSession` ADD CONSTRAINT `OidcSession_graphQlSessionId_fkey` FOREIGN KEY (`graphQlSessionId`) REFERENCES `GraphQlSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OidcSession` ADD CONSTRAINT `OidcSession_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `oauth2Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Permission` ADD CONSTRAINT `Permission_executiveTypeName_fkey` FOREIGN KEY (`executiveTypeName`) REFERENCES `ExecutiveType`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationFormAdditionalAnswer` ADD CONSTRAINT `ApplicationFormAdditionalAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `ApplicationFormAdditionalQuestion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationFormAdditionalAnswer` ADD CONSTRAINT `ApplicationFormAdditionalAnswer_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `ApplicationForm`(`applicationId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationAcceptance` ADD CONSTRAINT `ApplicationAcceptance_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `ApplicationForm`(`applicationId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationAcceptance` ADD CONSTRAINT `ApplicationAcceptance_accepterId_fkey` FOREIGN KEY (`accepterId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_subscriptorId_fkey` FOREIGN KEY (`subscriptorId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oauth2AuthorizationCode` ADD CONSTRAINT `oauth2AuthorizationCode_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `oauth2Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oauth2AuthorizationCode` ADD CONSTRAINT `oauth2AuthorizationCode_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `SSOUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oauth2AuthorizationCode` ADD CONSTRAINT `oauth2AuthorizationCode_graphQlSessionId_fkey` FOREIGN KEY (`graphQlSessionId`) REFERENCES `GraphQlSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityParticiptation` ADD CONSTRAINT `ActivityParticiptation_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityParticiptation` ADD CONSTRAINT `ActivityParticiptation_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DisciplinaryAction` ADD CONSTRAINT `DisciplinaryAction_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DisciplinaryAction` ADD CONSTRAINT `DisciplinaryAction_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DisciplinaryAction` ADD CONSTRAINT `DisciplinaryAction_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RedefineIndex
CREATE UNIQUE INDEX `SSOUser_emailAddress_key` ON `SSOUser`(`emailAddress`);
DROP INDEX `SSOUser.emailAddress_unique` ON `SSOUser`;

-- RedefineIndex
CREATE UNIQUE INDEX `SSOUser_memberId_key` ON `SSOUser`(`memberId`);
DROP INDEX `SSOUser.memberId_unique` ON `SSOUser`;
