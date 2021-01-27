import { gql } from 'graphql-request';

export const resetPasswordMutation = gql`
  mutation resetPasswordMutation(
    $newPassword: String!
    $resetToken: String!
  ) {
    resetPassword(
      newPassword: $newPassword
      resetToken: $resetToken
    )
  }
`;
