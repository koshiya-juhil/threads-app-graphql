import { createHmac, randomBytes } from "crypto"
import JWT from 'jsonwebtoken'
import { prismaClient } from "../lib/db"

const JWT_SECRET = "$uperM@nsh%#sbad2627%4d#$d*&shdnfddwsd1325!*";

export interface CreateUserPayload {
    firstName: string
    lastName?: string
    email: string
    password: string
}

export interface GetUserTokenPayload {
    email: string
    password: string
}

class UserService {

    private static generateHash(salt: string, password: string){
        const hashedPassword = createHmac("sha256", salt).update(password).digest("hex");
        return hashedPassword;
    }

    public static createUser(payload: CreateUserPayload){
        const { firstName, lastName, email, password } = payload
        const salt = randomBytes(32).toString("hex");
        const hashedPassword = UserService.generateHash(salt, password);
        return prismaClient.user.create({
            data: {
                firstName,
                lastName : lastName || "",
                email,
                salt,
                password : hashedPassword
            }
        })
    }

    private static getUserByEmail(email: string){
        return prismaClient.user.findUnique({ where: { email } });
    }

    public static async getUserToken(payload: GetUserTokenPayload) {
        const { email, password } = payload;
        const user = await UserService.getUserByEmail(email);
        if(!user) throw new Error('User not found');

        const userHashedPassword = UserService.generateHash(user.salt, password);
        if(userHashedPassword !== user.password){
            throw new Error('Incorrect Password');
        }

        // Generate Token
        const token = JWT.sign({ id: user.id, email: user.email }, JWT_SECRET);
        return token;
    }
}

export default UserService