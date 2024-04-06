import { IAuthDocument, IAuthPayload } from "@walidhousni/jobseeker-shared";
import { Response } from "express";

export const authMockRequest = (sessionData: IJWT, body: IAuthMock, currentUser?: IAuthPayload | null, params?: unknown) => ({
    session: sessionData,
    body,
    params,
    currentUser
});

export const authMockResponse = (): Response => {
    const res: Response = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

export interface IJWT {
    jwt?: string;
}

export interface IAuthMock {
    id?: number;
    username?: string;
    email?: string;
    password?: string;
    createdAt?: Date | string;
}

export const authUserPayload: IAuthPayload = {
    id: 1,
    username: 'Walid',
    email: 'walid@test.com',
    iat: 12255185852
};

export const authMock: IAuthDocument = {
    id: 1,
    profilePublicId: '124121545152452151',
    username: 'Walid',
    email: 'walid@test.com',
    country: 'Brazil',
    profilePicture: '',
    emailVerified: 1,
    createdAt: '2023-12-19T07:42:24.431Z',
    comparePassword: () => {},
    hashPassword: () => false,
} as unknown as IAuthDocument;