import { Response } from 'express';

export const setCookies = (token: string, response: Response) => {
  response.cookie('refreshToken', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });
};
