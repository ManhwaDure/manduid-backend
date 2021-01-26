import { gql } from 'graphql-request';

export const verifyEmailMutation = gql`
  mutation verifyEmailMutation(
    $verificationToken: String!
  ) {
    signUp_verifyEmail(
      verificationToken: $verificationToken
    )
  }
`;
