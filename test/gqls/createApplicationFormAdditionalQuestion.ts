import { gql } from 'graphql-request';

export const createApplicationFormAdditionalQuestionMutation = gql`
  mutation createApplicationFormAdditionalQuestionMutation(
    $question: String!
    $required: Boolean!
  ) {
    createApplicationFormAdditionalQuestion(
      question: $question
      required: $required
    ) {
      id
      question
      required
    }
  }
`;
