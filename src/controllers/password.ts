import { changePasswordSchema, emailSchema, passwordSchema } from "@auth/schemes/password";
import { getAuthUserByPasswordToken, getUserByEmail, getUserByUsername, updatePassword, updatePasswordToken } from "@auth/services/auth.service";
import { BadRequestError, IAuthDocument, IEmailMessageDetails } from "@walidhousni/jobseeker-shared";
import { Request, Response } from "express";
import crypto from 'crypto';
import { config } from "@auth/config";
import { publishDirectMessage } from "@auth/queues/auth.producer";
import { authChannel } from "@auth/server";
import { StatusCodes } from "http-status-codes";
import { AuthModel } from "@auth/models/auth.schema";

export async function createForgotPassword(req: Request, res: Response): Promise<void> {
    const { error  } = await Promise.resolve(emailSchema.validate(req.body));
    if (error?.details) {
     throw new BadRequestError(error.details[0].message, 'Password  create() method error ');
    }

    const { email } = req.body;
    const existingUser: IAuthDocument | undefined = await getUserByEmail(email);
    if (!existingUser) {
        throw new BadRequestError('Invalid Credentials', 'Password  createForgotPassword() method error ');
    }
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    const date: Date = new Date();
    date.setHours(date.getHours() + 1);
    await updatePasswordToken(existingUser.id!, randomCharacters, date);
    const resetLink = `${config.CLIENT_URL}/reset_password?=${randomCharacters}`;
    const messageDetails: IEmailMessageDetails = {
        receiverEmail: existingUser.email,
        resetLink,
        username: existingUser.username,
        template: 'forgotPassword'
    };
    await publishDirectMessage(
        authChannel,
        'jobber-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        'Forgot password message sent to notification service'
    );
    res.status(StatusCodes.OK).json({ message: 'Password reset email sent ' });

}

export async function resetPassword(req: Request, res: Response): Promise<void> {
    const { error  } = await Promise.resolve(passwordSchema.validate(req.body));
    if (error?.details) {
     throw new BadRequestError(error.details[0].message, 'Password  resetPassword() method error ');
    }

    const { password, confirmPassword } = req.body;
    const { token } = req.params;
    if (password !== confirmPassword) {
        throw new BadRequestError('Password do not match', 'Password  resetPassword() method error ');
    }

    const existingUser: IAuthDocument | undefined = await getAuthUserByPasswordToken(token);
    if (!existingUser) {
        throw new BadRequestError('Reset token has expired', 'Password  resetPassword() method error ');

    }

    const hashedPassword: string = await AuthModel.prototype.hashPassword(password);
    await updatePassword(existingUser.id!, hashedPassword);
    const messageDetails: IEmailMessageDetails = {
        username: existingUser.username,
        template: 'resetPasswordSuccess'
    };
    await publishDirectMessage(
        authChannel,
        'jobber-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        'Reset password success message sent to notification service'
    );
    res.status(StatusCodes.OK).json({ message: 'Password successfull updated ' });


}

export async function changePassword(req: Request, res: Response): Promise<void> {
    const { error  } = await Promise.resolve(changePasswordSchema.validate(req.body));
    if (error?.details) {
     throw new BadRequestError(error.details[0].message, 'Password  changePassword() method error ');
    }

    const { currentPassword, newPassword } = req.body;
    if (currentPassword !== newPassword) {
        throw new BadRequestError('Invalid password', 'Password  changePassword() method error ');
    }

    const existingUser: IAuthDocument | undefined = await getUserByUsername(`${req.currentUser?.username}`);
    if (!existingUser) {
        throw new BadRequestError('Invalid password', 'Password  changePassword() method error ');

    }

    const hashedPassword: string = await AuthModel.prototype.hashPassword(newPassword);
    await updatePassword(existingUser.id!, hashedPassword);
    const messageDetails: IEmailMessageDetails = {
        username: existingUser.username,
        template: 'resetPasswordSuccess'
    };
    await publishDirectMessage(
        authChannel,
        'jobber-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        ' password change success message sent to notification service'
    );
    res.status(StatusCodes.OK).json({ message: 'Password successfull updated ' });


}