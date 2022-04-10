import { Database, User } from '../../../../lib/types';
import { Google } from '../../../../lib/api';
import { Request, Response } from 'express';

export const cookieOptions = {
  httpOnly: true,
  sameSite: true,
  signed: true,
  secure: process.env.NODE_ENV !== 'development',
};

export const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database,
  res: Response
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);

  if (!user) {
    throw new Error('Google login error');
  }

  //Name / Photo / Email Lists
  const userNameList = user.names && user.names.length ? user.names : null;
  const userPhotoList = user.photos && user.photos.length ? user.photos : null;
  const userEmailsList =
    user.emailAddresses && user.emailAddresses.length ? user.emailAddresses : null;

  // User Display Name
  const userName = userNameList ? userNameList[0].displayName : null;

  // User Id
  const userId =
    userNameList && userNameList[0].metadata && userNameList[0].metadata.source
      ? userNameList[0].metadata.source.id
      : null;

  // User Avatar
  const userAvatar = userPhotoList && userPhotoList[0].url ? userPhotoList[0].url : null;

  // User Email
  const userEmail = userEmailsList && userEmailsList[0].value ? userEmailsList[0].value : null;

  if (!userId || !userName || !userAvatar || !userEmail) {
    throw new Error('Google login error');
  }

  const updateRes = await db.users.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        name: userName,
        avatar: userAvatar,
        contact: userEmail,
        token,
      },
    },
    { upsert: true, returnDocument: 'after' },
  );

  let viewer = updateRes.value as User;

  if (!viewer) {
    await db.users.insertOne({
      _id: userId,
      token,
      name: userName,
      avatar: userAvatar,
      contact: userEmail,
      income: 0,
      bookings: [],
      listings: [],
    });

    viewer = (await db.users.findOne({ _id: userId })) as User;
  }

  res.cookie("viewer", userId, {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60 * 1000
  })

  return viewer;
};

export const logInViaCookie = async (
  token: string,
  db: Database,
  req: Request,
  res: Response,
): Promise<User | undefined> => {
  const updateRes = await db.users.findOneAndUpdate(
    { _id: req.signedCookies.viewer },
    { $set: { token } },
    { upsert: true, returnDocument: 'after' },
  );

  let viewer = updateRes.value as User;

  if (!viewer) {
    res.clearCookie('viewer', cookieOptions);
  }

  return viewer;
};
