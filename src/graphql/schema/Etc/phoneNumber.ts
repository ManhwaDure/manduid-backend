import { Kind, parseValue } from 'graphql';
import { scalarType } from 'nexus';

const onlyNumerics = (v: string) =>
  v.replace(/[^0-9]+/g, '');

export const telephoneNumberScalar = scalarType({
  name: 'TelephoneNumber',
  asNexusMethod: 'tel',
  description: 'Telephone number scalar type',
  parseValue(value: string) {
    const international = value.startsWith('+');
    if (onlyNumerics(value).length === 0) {
      return '';
    } else if (international) {
      return onlyNumerics(value).replace(
        /^(1|2[07]|2[1-69][0-9]|3[0-4689]|3[57][0-9]|4[0-13-9]|42[0-9]|5[1-8]|5[09][0-9]|6[0-6]|6[7-9][0-9]|7|8[1246]|8[^1246][0-9]|9[0-58]|9[^0-58][0-9])([0-9]+)/,
        '+$1-$2'
      );
    } else {
      return onlyNumerics(value)
        .replace(
          /^(02|[0-9]{3})([0-9]*?)([0-9]{1,4})$/,
          '$1-$2-$3'
        )
        .replace('--', '-');
    }
  },
  serialize(value: string) {
    if (value.startsWith('+'))
      return '+' + onlyNumerics(value);
    else return onlyNumerics(value);
  },
  parseLiteral(ast) {
    if (ast.kind == Kind.STRING) {
      return parseValue(ast.value);
    }
  },
});
