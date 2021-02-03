import { nonNull, objectType, stringArg } from 'nexus';
import getAvatarUrl from '../getAvatarUrl';

export const Member = objectType({
  name: 'Member',
  description: '회원을 나타냅니다.',
  definition(t) {
    t.nonNull.int('id', { description: '회원ID' });
    t.nonNull.field('memberType', {
      type: 'MemberType',
      description: '회원 유형',
    });
    t.string('executiveTypeName', {
      description: '집행부 직책 (집행부원이 아닐 시 null)',
    });
    t.nonNull.field('schoolRegisterationStatus', {
      type: 'SchoolRegisterationStatus',
      description: '학적',
    });
    t.nonNull.datetime('createdAt', {
      description:
        '이 회원에 대한 기록이 추가되거나 수정된 일시',
    });
    t.nonNull.string('creationReason', {
      description:
        '이 회원에 대한 기록이 추가되거나 수정된정 사유',
    });
    t.int('creatorId', {
      description:
        '이 회원에 대한 기록을 추가하거나 수정한 사람의 회원ID, 시스템상에서 수정된 경우 null',
    });
    t.nonNull.string('name', { description: '이름' });
    t.nonNull.string('department', { description: '학과' });
    t.int('studentId', { description: '학번' });
    t.nonNull.tel('phoneNumber', {
      description: '전화번호',
    });
    t.date('birthday', { description: '생일' });
    t.nonNull.boolean('isExecutive', {
      description: '집행부원 여부',
    });
    t.nonNull.boolean('isPresident', {
      description: '회장 여부',
    });
    t.field('creator', {
      type: 'Member',
      description:
        '이 회원의 기록을 추가하거나 수정한 회원',
      async resolve({ id }, args, ctx) {
        const member = await ctx.db.member.findUnique({
          where: {
            id,
          },
          include: {
            createdBy: true,
          },
        });

        return member?.createdBy;
      },
    });
    t.string('ssoUserId', {
      description: '로그인 아이디',
      async resolve({ id: memberId }, args, ctx) {
        const ssouser = await ctx.db.sSOUser.findUnique({
          where: {
            memberId,
          },
          select: {
            id: true,
          },
        });

        return ssouser?.id;
      },
    });
    t.string('avatarUrl', {
      description: '아바타 이미지 주소',
      async resolve({ id: memberId }, args, ctx) {
        const ssouser = await ctx.db.sSOUser.findUnique({
          where: {
            memberId,
          },
          select: {
            id: true,
          },
        });

        if (ssouser)
          return await getAvatarUrl(ssouser.id, ctx.db);
        else return null;
      },
    });
    t.field('profile', {
      description: '프로필',
      type: 'UserProfile',
      async resolve({ id: memberId }, args, ctx) {
        const profile = await ctx.db.sSOUser.findUnique({
          where: {
            memberId,
          },
          select: {
            website: true,
            introduction: true,
            nickname: true,
            customAvatarTag: true,
          },
        });
        if (profile === null) return null;

        const {
          website,
          introduction,
          nickname,
          customAvatarTag,
        } = profile;
        return {
          website,
          introduction,
          nickname,
          hasCustomAvatar: customAvatarTag !== null,
        };
      },
    });
    t.nonNull.boolean('hasPermission', {
      description: '권한을 가지고 있는지 확인합니다.',
      args: {
        permission: nonNull(stringArg()),
      },
      async resolve(
        { isPresident, isExecutive, executiveTypeName },
        { permission },
        ctx
      ) {
        if (isPresident) return true;
        else if (isExecutive) {
          const permsToFind = permission.split('.');
          permsToFind.push('root');
          for (let i = 1; i < permsToFind.length; i++) {
            permsToFind[i] =
              permsToFind[i - 1] + '.' + permsToFind[i];
          }
          return (
            (await ctx.db.permission.count({
              where: {
                executiveTypeName,
                permission: {
                  in: permsToFind,
                },
              },
            })) != 0
          );
        } else {
          return false;
        }
      },
    });
    t.nonNull.list.nonNull.field('previousRecords', {
      description: '이전 기록들',
      type: 'MemberRecord',
      async resolve({ id: memberId }, args, ctx) {
        const records = await ctx.db.memberRecordHistory.findMany(
          {
            where: {
              memberId,
            },
          }
        );

        return records;
      },
    });
  },
});
