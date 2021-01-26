import { gql } from 'graphql-request';

export const resendVerificationEmailMutation = gql`
  mutation resendVerificationEmailMutation(
    $token: String!
  ) {
    resendVerificationEmail(token: $token)
  }
`;
