import { signupSchema } from "@auth/schemes/signup";
import { createAuthUser, getUserByUsernameOrEmail, signToken } from "@auth/services/auth.service";
import { BadRequestError, IAuthDocument, IEmailMessageDetails, firstLetterUppercase, uploads } from "@walidhousni/jobseeker-shared";
import { UploadApiResponse } from "cloudinary";
import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto'
import { lowerCase } from "lodash";
import { config } from "@auth/config";
import { publishDirectMessage } from "@auth/queues/auth.producer";
import { authChannel } from "@auth/server";
import { StatusCodes } from "http-status-codes";

export async function create(req: Request, res: Response): Promise<void> {
    const { error } = await Promise.resolve(signupSchema.validate(req.body));
    if (error?.details) {
        throw new BadRequestError(error.details[0].message, 'Signup create() method error');
    }

    const { username, email, password, country, profilePicture } = req.body;
    const checkIfUserExist: IAuthDocument | undefined = await getUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
        throw new BadRequestError('Invalid credentials. Email or Username', 'Signup create() method error');
    }

    const profilePublicId = uuidv4();
    const uploadResult: UploadApiResponse = await uploads(profilePicture, `${profilePicture}`, true, true) as UploadApiResponse;
    if (!uploadResult.public_id) {
        throw new BadRequestError('File upload error. Try again', 'Signup create() method error' );
    }
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    const authData: IAuthDocument = {
        username: firstLetterUppercase(username),
        email: lowerCase(email),
        profilePublicId,
        password,
        country,
        profilePicture: uploadResult?.secure_url,
        emailVerificationToken: randomCharacters
} as IAuthDocument;

const result: IAuthDocument = await createAuthUser(authData) as IAuthDocument;
const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=${authData.emailVerificationToken}`;
const messageDetails: IEmailMessageDetails = {
    receiverEmail: result.email,
    verifyLink:  verificationLink,
    template: 'verifyEmail'
};
await publishDirectMessage(
    authChannel,
    'jobber-email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Verify email message has been sent to notification service.'
  );
  const userJWT: string = signToken(result.id!, result.email!, result.username!);
  res.status(StatusCodes.CREATED).json({ message: 'User created successfully', user: result, token: userJWT })

}