import {
  GraphQLDate,
  GraphQLDateTime,
} from 'graphql-iso-date';
import { asNexusMethod } from 'nexus';

export const Date = asNexusMethod(GraphQLDate, 'date');
export const DateTime = asNexusMethod(
  GraphQLDateTime,
  'datetime'
);
