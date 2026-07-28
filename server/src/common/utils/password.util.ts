import * as argon2 from 'argon2';

/**
 * argon2's shipped type declarations resolve hash() as `Promise<any>` in some
 * toolchains (broken JSDoc @overload conversion upstream). This wrapper pins
 * the real signature in one place instead of casting at every call site.
 */
export async function hashPassword(password: string): Promise<string> {
  const hash: unknown = await argon2.hash(password, { type: argon2.argon2id });
  return hash as string;
}

export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  return argon2.verify(hash, password);
}
