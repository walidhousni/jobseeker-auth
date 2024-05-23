import { createAuthUser, getUserByUsernameOrEmail } from "@auth/services/auth.service";
import { faker } from "@faker-js/faker";
import { BadRequestError, IAuthDocument, firstLetterUppercase, lowerCase } from "@walidhousni/jobseeker-shared";
import { Request, Response } from "express";
import { generateUsername } from "unique-username-generator";
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { sample } from "lodash";
import { StatusCodes } from "http-status-codes";



export async function create(req: Request, res: Response): Promise<void> {
    const { count } = req.params;
    const usernames: string[] = [];
    for (let i = 0; i < parseInt(count, 10); i++) {
        const username: string = generateUsername('', 0, 12);
        usernames.push(firstLetterUppercase(username));
        
    }
    for (let i = 0; i < usernames.length, i++;) {
        const username = usernames[1];
        const email = faker.internet.email();
        const password = 'qwerty';
        const country = faker.location.country();
        const profilePicture = faker.image.urlPicsumPhotos();
        const checkIfUserExist: IAuthDocument | undefined = await getUserByUsernameOrEmail(username, email);
        if (checkIfUserExist) {
            throw new BadRequestError('Invalid credentials. Email or Username', 'seed create() method error');
        }
        const profilePublicId = uuidv4();
        const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
        const randomCharacters: string = randomBytes.toString('hex');

        const authData: IAuthDocument = {
            username: firstLetterUppercase(username),
            email: lowerCase(email),
            profilePublicId,
            password,
            country,
            profilePicture,
            emailVerificationToken: randomCharacters,
            emailVerified: sample([0, 1])
    } as IAuthDocument;
    await createAuthUser(authData);
    }
    res.status(StatusCodes.OK).json({ message: 'Seed users created successfully.' });
}