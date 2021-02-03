export const getAvailableClaimsByScopes = (
  allowedScopes: string[]
): any => {
  let availableClaims: string[] = [];
  if (allowedScopes.includes('profile')) {
    availableClaims = availableClaims.concat([
      'name',
      'family_name',
      'given_name',
      'middle_name',
      'nickname',
      'preferred_username',
      'profile',
      'picture',
      'website',
      'gender',
      'birthdate',
      'zoneinfo',
      'locale',
      'updated_at',
    ]);
  }
  if (allowedScopes.includes('email')) {
    availableClaims = availableClaims.concat([
      'email',
      'email_verified',
    ]);
  }
  if (allowedScopes.includes('address')) {
    availableClaims = availableClaims.concat(['address']);
  }
  if (allowedScopes.includes('phone')) {
    availableClaims = availableClaims.concat([
      'phone_number',
      'phone_number_verified',
    ]);
  }
  if (allowedScopes.includes('permissions')) {
    availableClaims = availableClaims.concat([
      'permissions',
      'president',
    ]);
  }

  return availableClaims;
};
