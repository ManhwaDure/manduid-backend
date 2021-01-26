import { gql } from 'graphql-request';

export const createIdMutation = gql`
  mutation createIdMutation(
    $emailAddress: String!
    $id: String!
    $membershipVerificationToken: String!
    $password: String!
  ) {
    signUp_createId(
      emailAddress: $emailAddress
      id: $id
      membershipVerificationToken: $membershipVerificationToken
      password: $password
    )
  }
`;
