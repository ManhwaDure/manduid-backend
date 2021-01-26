import { gql } from 'graphql-request';

export const applyMutation = gql`
  mutation applyMutation($form: ApplicationFormInput!) {
    apply(form: $form) {
      applicationId
      birthday
      department
      name
      phoneNumber
      reApplication
      studentId
    }
  }
`;
