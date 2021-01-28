import { gql } from 'graphql-request';

export const deleteApplicationFormAdditionalQuestionMutation = gql`
  mutation deleteApplicationFormAdditionalQuestionMutation(
    $id: ID!
  ) {
    deleteApplicationFormAdditionalQuestion(id: $id) {
      id
      question
      required
    }
  }
`;
