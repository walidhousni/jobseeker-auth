import { changePassword, createForgotPassword, resetPassword } from "@auth/controllers/password";
import { read } from "@auth/controllers/signin";
import { create } from "@auth/controllers/signup";
import { update } from "@auth/controllers/verify-email";
import express,  { Router } from "express";

const router: Router = express.Router();

export function authRoutes(): Router {
    router.post('/signup', create);
    router.post('/signin', read);
    router.put('/verify-email', update);
    router.put('/forgot-password', createForgotPassword);
    router.put('/reset-password', resetPassword);
    router.put('/change-password', changePassword);
    return router;
}