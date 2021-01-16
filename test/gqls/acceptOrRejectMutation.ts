import { gql } from 'graphql-request';

export const acceptOrDenyApplicationMutation = gql`
mutation acceptOrRejectMutation($accepts: Boolean!, $applicationId: String!, $reason: String) {
    acceptOrDenyApplication(accepts: $accepts, applicationId: $applicationId, reason: $reason) {
        acceptedAt
        accepted
        accepterId
        applicationId
        reason
    }
}
`;