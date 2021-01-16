import { gql } from 'graphql-request';

export const membersQuery = gql`
query membersQuery {
    members {
        memberType
        studentId
        name
        department
    }
}
`;