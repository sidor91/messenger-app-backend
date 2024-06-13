import { User } from 'src/services/user/entity/user.entity';

type UserKeys = keyof User;

export const userFieldsToRemove: { [key: string]: UserKeys[] } = {
  PASSWORD: ['password_hash'],
  PASSWORD_AND_TOKENS: ['password_hash', 'access_token', 'refresh_token'],
};

export const objectFieldRemoval = <T extends object>(
  object: T,
  fields: (keyof T)[],
): T => {
  for (const field of fields) {
    delete object[field];
  }
  return object;
};
