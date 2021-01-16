import { inputObjectType } from 'nexus';

export const ApplicationFormInput = inputObjectType({
  name: 'ApplicationFormInput',
  description: '입부원서 제출을 위한 입력 타입입니다.',
  definition(t) {
    t.nonNull.string('name', { description: '이름' });
    t.nonNull.string('department', { description: '학과' });
    t.nonNull.int('studentId', {
      description: '학번 (예시 : 19871234) ',
    });
    t.nonNull.tel('phoneNumber', {
      description: '휴대폰 전화번호',
    });
    t.nonNull.date('birthday', { description: '생일' });
  },
});
