import { gql } from 'graphql-request';

export const verifyMembershipMutation = gql`
  mutation verfiyMembershipMutation(
    $name: String!
    $phoneNumber: TelephoneNumber!
    $studentId: Int
  ) {
    signUp_verifyMembership(
      name: $name
      phoneNumber: $phoneNumber
      studentId: $studentId
    )
  }
`;
