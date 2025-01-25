import jwt from 'jsonwebtoken';
import { userModel } from '../models/User';

export const authenticateToken = async (token: string) => {
    try {
        if (!token) {
            throw Error('Invalid or expired token');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        const user = await userModel.findById((decoded as any).id);
        if (!user) {
            throw Error('User not found');
        }
        return user;

    } catch (error: any) {
        throw Error('Error in socket Authenticator');
    }
}