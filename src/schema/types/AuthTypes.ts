import { mutationField, nonNull } from 'nexus';
import { Context } from '../../context';
import { AuthenticationError } from 'apollo-server-errors';
import { isAdminRuleType, isAuthenticatedRuleType } from '../../rules';
import bcrypt from 'bcrypt';
import { salt, usePromise, withoutBearer } from '../../util';
import { sign, decode, JwtPayload } from 'jsonwebtoken';
import { User as UserModel } from '@prisma/client';
import { User } from 'nexus-prisma';
import { JWTPayload } from '../../types';

const allUserIncludes = { addresses: true, cartItems: true, orders: true, reviews: true, role: true };

export const register = mutationField('register', {
    type: 'Json',
    args: {
        email: nonNull('String'),
        password: nonNull('String'),
        firstname: nonNull('String'),
        lastname: nonNull('String'),
        phoneNumber: nonNull('String'),
    },
    description: 'Registers a new user.',
    async resolve(_root, { email, password, firstname, lastname, phoneNumber }, { req, pc }: Context) {
        const hashedPassword = await bcrypt.hash(password, await salt());

        const user = await pc.user.create({
            data: {
                email,
                password: hashedPassword,
                firstname,
                lastname,
                phoneNumber,
                lastUserAgent: req.useragent?.source,
                role: { connect: { id: 2 } },
            },
            include: allUserIncludes,
        });

        const authToken = sign({ user: { cuid: user.cuid } }, process.env.AUTH_SECRET!, {
            expiresIn: '1d',
        });

        return { user, authToken };
    },
});

export const login = mutationField('login', {
    type: 'Json',
    args: { email: nonNull('String'), password: nonNull('String') },
    description: 'Logs a user in.',
    async resolve(_root, { email, password }, { pc }: Context) {
        const [user, err] = await usePromise<UserModel>(
            pc.user.findUnique({
                where: { email },
                include: allUserIncludes,
            })
        );
        if (user == null) throw AuthenticationError;

        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) throw AuthenticationError;

        const authToken = sign({ user: { cuid: user.cuid } }, process.env.AUTH_SECRET!, {
            expiresIn: '1d',
        });

        return { user, authToken };
    },
});

export const logout = mutationField('logout', {
    type: 'Boolean',
    shield: isAuthenticatedRuleType,
    resolve(_root, _args, _ctx) {
        return true;
    },
});

export const me = mutationField('me', {
    type: User.$name,
    shield: isAuthenticatedRuleType,
    resolve(_root, _args, { req, pc }): any {
        const authToken = withoutBearer(req.headers.authorization!);
        const payload: JwtPayload = decode(authToken!) as JwtPayload;

        return pc.user.findUnique({ where: { cuid: payload.user.cuid } });
    },
});

export const updateMyself = mutationField('updateMyself', {
    type: User.$name,
    args: {
        email: nonNull('String'),
        password: nonNull('String'),
        firstname: nonNull('String'),
        lastname: nonNull('String'),
        phonenumber: nonNull('String'),
    },
    shield: isAuthenticatedRuleType,
    async resolve(_root, { email, password, firstname, lastname, phoneNumber }, { req, pc }: Context) {
        const authToken = withoutBearer(req.headers.authorization!);
        const payload: JwtPayload = decode(authToken!) as JwtPayload;

        const user = await pc.user.findUnique({ where: { cuid: payload.user.cuid } });
        const updatedUser = await pc.user.update({
            where: {
                cuid: payload.user.cuid,
            },
            data: {
                email: email ?? user!.email,
                password: password ?? user!.password,
                firstname: firstname ?? user!.firstname,
                lastname: lastname ?? user!.lastname,
                phoneNumber: phoneNumber ?? user!.phoneNumber,
            },
        });

        return updatedUser;
    },
});

export const deleteMyself = mutationField('deleteMyself', {
    type: 'Boolean',
    args: { confirm: nonNull('Boolean') },
    shield: isAuthenticatedRuleType,
    async resolve(_root, { confirm }, { req, res, pc }: Context) {
        const authToken = withoutBearer(req.headers.authorization!);
        const payload: JwtPayload = decode(authToken!) as JwtPayload;

        const deletedUser = await pc.user.delete({
            where: {
                cuid: payload.user.cuid,
            },
        });

        return true;
    },
});

export const changeRole = mutationField('changeRole', {
    type: User.$name,
    args: { userCuid: nonNull('String'), role: nonNull('Int') },
    shield: isAdminRuleType,
    async resolve(_root, { userCuid, role }: { userCuid: string; role: number }, { pc, req }: Context) {
        const authToken = withoutBearer(req.headers.authorization!);
        const payload: JWTPayload = decode(authToken!) as JWTPayload;

        if (payload.user.cuid === userCuid) {
            throw `Don't go back to moke!`;
        }

        const updatedUser = await pc.user.update({
            where: {
                cuid: userCuid,
            },
            data: {
                role: { connect: { id: role } },
            },
        });

        return updatedUser;
    },
});
