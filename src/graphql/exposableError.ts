export class GraphQLExposableError extends Error {
  readonly exposable = true;

  constructor(message: string) {
    super(message);
    this.name = 'GraphQLExposableError';
  }
}
