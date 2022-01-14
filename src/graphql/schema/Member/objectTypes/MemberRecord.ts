import { objectType } from 'nexus';

export const MemberRecord = objectType({
  name: 'MemberRecord',
  description: '회원에 대한 기본사항 기록을 나타냅니다.',
  definition(t) {
    t.nonNull.int('memberId', { description: '회원ID' });
    t.nonNull.field('memberType', {
      type: 'MemberType',
      description: '회원유형',
    });
    t.field('executiveType', {
      type: 'ExecutiveType',
      description: '집행부 직책 이름',
    });
    t.nonNull.field('schoolRegisterationStatus', {
      type: 'SchoolRegisterationStatus',
      description: '학적',
    });
    t.nonNull.datetime('createdAt', {
      description: '기록이 생성된 일시',
    });
    t.nonNull.string('creationReason', {
      description: '기록 생성사유',
    });
    t.int('creatorId', {
      description:
        '기록을 생성한 회원의 회원ID, 시스템상으로 수정됐을 시 null',
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
      description: '이 기록을 생성한 회원',
      async resolve({ creatorId }, _, ctx) {
        if (creatorId !== null)
          return await ctx.db.member.findUnique({
            where: { id: creatorId },
          });
        else return null;
      },
    });
    t.nonNull.string('memo', {
      description: '비고 및 특이사항',
    });
  },
});
