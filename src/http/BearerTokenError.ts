export class BearerTokenError extends Error {
  constructor(
    type:
      | 'invalid_token'
      | 'invalid_request'
      | 'insufficient_scope'
  ) {
    super();
    this.message = type;
    this.name = 'BearerTokenError';
  }
}
