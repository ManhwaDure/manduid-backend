import { inputObjectType } from 'nexus';

export const MemberRecordInput = inputObjectType({
  name: 'MemberRecordInput',
  description: '회원 기본사항의 입력 타입입니다.',
  definition(t) {
    t.nonNull.field('memberType', {
      type: 'MemberType',
      description: '회원유형',
    });
    t.nonNull.field('schoolRegisterationStatus', {
      type: 'SchoolRegisterationStatus',
      description: '학적',
    });
    t.nonNull.string('name', { description: '이름' });
    t.nonNull.string('department', { description: '학과' });
    t.nonNull.int('studentId', { description: '학번' });
    t.nonNull.tel('phoneNumber', {
      description: '전화번호',
    });
    t.string('memo', {
      description: '비고 및 특이사항',
      default: '',
    });
    t.date('birthday', { description: '생일' });
  },
});
