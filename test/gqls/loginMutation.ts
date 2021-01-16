import { gql } from 'graphql-request';

export const loginMutation = gql`
mutation loginMutation($id: String!, $password: String!) {
    login(id: $id, password: $password) {
        success
        token
    }
}
`;