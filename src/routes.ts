import { Application } from "express";
import { authRoutes } from "@auth/routes/auth";
import { verifyGatewayRequest } from "@walidhousni/jobseeker-shared";
import { currentUserRoutes } from "./routes/current-user";
import { healthRoutes } from "@auth/routes/health";

const BASE_PATH = '/api/v1/auth';


export function appRoutes(app: Application): void {
    app.use('', healthRoutes());
    app.use(BASE_PATH, verifyGatewayRequest,  authRoutes());
    app.use(BASE_PATH, verifyGatewayRequest,  currentUserRoutes());
};