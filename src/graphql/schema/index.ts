import { makeSchema } from 'nexus';
import { join } from 'path';
import * as types from './types';

export const schema = makeSchema({
  types,
  outputs: {
    typegen: join(
      __dirname,
      '../../../src/nexus-typegen.ts'
    ),
    schema: join(__dirname, '../../../schema.graphql'),
  },
  contextType: {
    module: join(
      __dirname,
      '../../../src/graphql/context/types.d.ts'
    ),
    export: 'Context',
  },
});
