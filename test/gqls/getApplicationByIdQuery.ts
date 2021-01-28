import { gql } from 'graphql-request';

export const getApplicationByIdQuery = gql`
  query getApplicationByIdQuery($applicationId: String!) {
    getApplicationById(applicationId: $applicationId) {
      applicationId
      reApplication
      name
      department
      studentId
      phoneNumber
      birthday
      applicationDate
      additionalAnswers {
        answer
        applicationId
        question {
          id
          question
          required
        }
      }
    }
  }
`;
