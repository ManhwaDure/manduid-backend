import { gql } from 'graphql-request';

export const getMemberByIdQuery = gql`
  query getMemberByIdQuery($memberId: Int!) {
    getMemberById(memberId: $memberId) {
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
