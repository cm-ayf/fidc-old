import { $object, $string, $boolean } from "lizod";

export const user = $object({
  sub: $string,
  name: $string,
  email: $string,
  email_verified: $boolean,
});
