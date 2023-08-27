import { $object, $string, $boolean, type Infer } from "lizod";

export const user = $object({
  sub: $string,
  name: $string,
  email: $string,
  email_verified: $boolean,
});

export type User = Infer<typeof user>;
