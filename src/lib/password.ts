import { hash, verify } from "@node-rs/argon2";

// Value 2 selects Argon2id in the node rs API.
const argon2Options = {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
  outputLen: 32,
  algorithm: 2,
};

export const hashPassword = async (password: string) => {
  const result = await hash(password, argon2Options);
  return result;
};

export const verifyPassword = async ({
  password,
  hash: storedHash,
}: {
  password: string;
  hash: string;
}) => {
  const result = await verify(storedHash, password, argon2Options);
  return result;
};
