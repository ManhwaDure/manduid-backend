import { gql } from 'graphql-request';

export const forgotPasswordMutation = gql`
  mutation forgotPasswordMutation($emailAddress: String!) {
    forgotPassword(emailAddress: $emailAddress)
  }
`;
