/**
 * Shared error factories for pipeline scripts.
 */

export function badInput(message) {
  const err = new Error(message);
  err.code = "E_BAD_INPUT";
  return err;
}

export function badTrace(message) {
  const err = new Error(message);
  err.code = "E_BAD_TRACE";
  return err;
}
