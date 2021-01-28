import { gql } from 'graphql-request';

export const membersQueryWithPrevRecords = gql`
  query membersQuery {
    members {
      memberType
      studentId
      name
      department
      previousRecords {
        memberType
        studentId
        name
        department
        creationReason
        createdAt
      }
    }
  }
`;
