import { enumType } from 'nexus';

export const MemberType = enumType({
  name: 'MemberType',
  description: '회원유형',
  members: [
    {
      name: 'AssociateMember',
      value: 'AssociateMember',
      description: '준회원',
    },
    {
      name: 'RegularMember',
      value: 'RegularMember',
      description: '정회원',
    },
    {
      name: 'HonoraryMember',
      value: 'HonoraryMember',
      description: '명예회원',
    },
    {
      name: 'Removed',
      value: 'Removed',
      description: '제적(탈퇴)',
    },
    {
      name: 'Explusion',
      value: 'Explusion',
      description: '제명',
    },
  ],
});

export const SchoolRegisterationStatus = enumType({
  name: 'SchoolRegisterationStatus',
  description: '학적',
  members: [
    {
      name: 'Enrolled',
      value: 'Enrolled',
      description: '재학',
    },
    {
      name: 'LeaveOfAbsence',
      value: 'LeaveOfAbsence',
      description: '휴학',
    },
    {
      name: 'MilitaryLeaveOfAbsence',
      value: 'MilitaryLeaveOfAbsence',
      description: '군휴학',
    },
    {
      name: 'Graduated',
      value: 'Graduated',
      description: '졸업',
    },
    {
      name: 'Expelled',
      value: 'Expelled',
      description: '제적/자퇴',
    },
  ],
});
