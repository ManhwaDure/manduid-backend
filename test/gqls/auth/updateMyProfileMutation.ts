import { gql } from 'graphql-request';

export const updateMyProfileMutation = gql`
  mutation updateMyProfileMutation(
    $profile: UserProfileInput!
  ) {
    updateMyProfile(profile: $profile) {
      introduction
      nickname
      website
    }
  }
`;
