import { GraphQLScalarType } from "graphql";

export const PositiveInt = new GraphQLScalarType({
  name: "PositiveInt",
  description: "Liczba całkowita dodatnia",
  parseValue(value) {
    const intValue = parseInt(value, 10);
    if (intValue <= 0) {
      throw new Error("Wartość musi być dodatnią liczbą całkowitą");
    }
    return intValue;
  },
  serialize(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === "IntValue") {
      const intValue = parseInt(ast.value, 10);
      if (intValue <= 0) {
        throw new Error("Wartość musi być dodatnią liczbą całkowitą");
      }
      return intValue;
    }
    throw new Error("Wartość musi być dodatnią liczbą całkowitą");
  },
});
