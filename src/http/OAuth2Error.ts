export class OAuth2Error extends Error {
  constructor(
    type:
      | 'invalid_request'
      | 'invalid_client'
      | 'invalid_grant'
      | 'unauthorized_client'
      | 'unsupported_grant_type'
      | 'invalid_scope'
      | 'server_error'
      | 'temporarily_unavailable'
      | 'invalid_token'
  ) {
    super();
    this.message = type;
    this.name = 'OAuth2Error';
  }

  get querystring(): string {
    return 'error=' + encodeURIComponent(this.message);
  }
}
