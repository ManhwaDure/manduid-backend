import { gql } from 'graphql-request';

export const changePasswordMutation = gql`
  mutation changePasswordMutation(
    $newPassword: String!
    $oldPassword: String!
  ) {
    changePassword(
      newPassword: $newPassword
      oldPassword: $oldPassword
    )
  }
`;
