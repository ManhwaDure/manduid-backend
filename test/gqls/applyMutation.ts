import { gql } from 'graphql-request';

export const applyMutation = gql`
mutation applyMutation($form: ApplicationFormInput!) {
    apply(form: $form)
}
`;