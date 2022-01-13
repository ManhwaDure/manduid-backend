import { gql } from 'graphql-request';

export const updateMemberMutation = gql`
  mutation updateMember(
    $data: MemberRecordInput!
    $memberId: Int!
    $reason: String
  ) {
    updateMember(
      data: $data
      memberId: $memberId
      reason: $reason
    ) {
      birthday
      department
      memberType
      name
      phoneNumber
      schoolRegisterationStatus
      studentId
      id
      creatorId
      creator {
        id
      }
      creationReason
      createdAt
    }
  }
`;
