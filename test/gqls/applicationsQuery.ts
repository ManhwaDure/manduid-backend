import { gql } from 'graphql-request';

export const applicationsQuery = gql`
query applicationsQuery {
    applications {
        applicationId
        reApplication
        name
        department
        studentId
        phoneNumber
        birthday
        applicationDate
    }
}
`;