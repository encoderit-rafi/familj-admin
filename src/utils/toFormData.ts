import { serialize } from "object-to-formdata";

type ToFormDataOptions = {
  indices?: boolean;
  allowEmptyArrays?: boolean;
  booleansAsIntegers?: boolean;
  nullsAsUndefineds?: boolean;
};

export const toFormData = (
  data: unknown,
  options?: ToFormDataOptions
): FormData => {
  const {
    indices = true,
    allowEmptyArrays = false,
    booleansAsIntegers = true,
    nullsAsUndefineds = true,
  } = options || {};

  return serialize(data, {
    indices,
    allowEmptyArrays,
    booleansAsIntegers,
    nullsAsUndefineds,
  });
};
