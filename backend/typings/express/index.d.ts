import { IUser } from "../../models/User";
import "express-session";

declare global {
    namespace Express {
        interface User extends IUser { }
    }
}

declare module "express-session" {
    interface Session {
        messages?: string[]; // Add the 'messages' property
    }
}
