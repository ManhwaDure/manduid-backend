import { gql } from 'graphql-request';

export const applyMutation = gql`
  mutation applyMutation(
    $form: ApplicationFormInput!
    $additionalAnswers: [ApplicationFormAdditionalAnswerInput!]
  ) {
    apply(
      form: $form
      additionalAnswers: $additionalAnswers
    ) {
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
