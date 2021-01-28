import { gql } from 'graphql-request';

export const applicationFormAdditionalQuestionsQuery = gql`
  query applicationFormAdditionalQuestionsQuery {
    applicationFormAdditionalQuestions {
      id
      question
      required
    }
  }
`;
