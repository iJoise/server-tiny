import { Database, User, Viewer } from '../../../lib/types';
import { Google } from '../../../lib/api';
import { LogInArgs } from './types/types';
import crypto from 'crypto';
import { cookieOptions, logInViaCookie, logInViaGoogle } from './utils';
import { Request, Response } from 'express';

export const viewerResolvers = {
  Query: {
    authUrl: (): string => {
      try {
        return Google.authUrl;
      } catch (err) {
        throw new Error(`Failed to query Google Auth Url: ${err}`);
      }
    },
  },
  Mutation: {
    logIn: async (
      _root: undefined,
      { input }: LogInArgs,
      { db, req, res }: { db: Database; req: Request; res: Response },
    ): Promise<Viewer> => {
      try {
        const code = input ? input.code : null;
        const token = crypto.randomBytes(16).toString('hex');

        const viewer: User | undefined = code
          ? await logInViaGoogle(code, token, db, res)
          : await logInViaCookie(token, db, req, res);

        if (!viewer) {
          return { didRequest: true };
        }

        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
        };
      } catch (err) {
        throw new Error(`Failed to log in: ${err}`);
      }
    },
    logOut: (_root: undefined, _args: {}, { res }: { res: Response }): Viewer => {
      try {
        res.clearCookie('viewer', cookieOptions);
        return { didRequest: true };
      } catch (err) {
        throw new Error(`Failed to log out: ${err}`);
      }
    },
  },
  Viewer: {
    id: (viewer: Viewer): string | undefined => viewer._id,
    hasWallet: (viewer: Viewer): boolean | undefined => (viewer.walletId ? true : undefined),
  },
};
