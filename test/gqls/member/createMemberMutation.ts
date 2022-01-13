import { gql } from 'graphql-request';

export const createMemberMutation = gql`
  mutation createMember($data: MemberRecordInput!) {
    createMember(data: $data) {
      birthday
      department
      memberType
      name
      phoneNumber
      schoolRegisterationStatus
      studentId
      id
    }
  }
`;
