import { z } from "zod";

export const selectableSchema = (required_message: string) => {
  return z
    .object(
      {
        _id: z
          .string({
            required_error: required_message,
          })
          .min(10, required_message),
      },
      { required_error: required_message }
    )
    .passthrough();
};

export const atLeastOneObject = (at_least_one_message: string, object = {}) => {
  return z.array(z.object(object)).min(1, at_least_one_message);
};

export const optionalString = () => z.string().optional();
