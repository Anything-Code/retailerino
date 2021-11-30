import { mutationField, nonNull } from 'nexus';
import { User } from 'nexus-prisma';
import { Context } from '../../context';
import { AuthenticationError } from 'apollo-server-errors';
import { isAdminRuleType, isAuthenticatedRuleType } from '../../rules';
import bcrypt from 'bcrypt';
import { salt } from '../../util';

// export const Query = queryType({
//     definition(t) {
//         // t.crud.users(isAuthenticated);
//         // t.crud.user(isAuthenticated);
//         t.crud.users();
//         t.crud.user();
//     },
// });

// export const Mutation = mutationType({
//     definition(t) {
//         t.crud.createOneUser();
//         // t.crud.upsertOneUser();
//         // t.crud.updateOneUser();
//         // t.crud.updateManyUser();
//         // t.crud.deleteOneUser();
//         // t.crud.deleteManyUser();
//     },
// });

const allUserIncludes = { addresses: true, cartItems: true, orders: true, reviews: true, role: true };

declare module 'express-session' {
    interface SessionData {
        user: any;
    }
}

export const register = mutationField('register', {
    type: User.$name,
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

        req.session.user = user;

        return user;
    },
});

export const login = mutationField('login', {
    type: User.$name,
    args: { email: nonNull('String'), password: nonNull('String') },
    description: 'Logs a user in',
    async resolve(_root, { email, password }, { req, pc }: Context) {
        const user = await pc.user.findUnique({
            where: { email },
            include: allUserIncludes,
        });
        if (user == null) {
            throw AuthenticationError;
        }
        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
            throw AuthenticationError;
        }

        req.session.user = user;

        return user;
    },
});

export const logout = mutationField('logout', {
    type: 'Boolean',
    shield: isAuthenticatedRuleType,
    resolve(_root, _args, { req, res }: Context) {
        res.clearCookie('qid');

        return true;
    },
});

export const me = mutationField('me', {
    type: User.$name,
    shield: isAuthenticatedRuleType,
    resolve(_root, _args, { req }: Context): any {
        return req.session.user;
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
        const user = await pc.user.findFirst({ where: { cuid: req.session.user.cuid } });
        const updatedUser = await pc.user.update({
            where: {
                cuid: req.session.user.cuid,
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
        const deletedUser = await pc.user.delete({
            where: {
                cuid: req.session.user.cuid,
            },
        });

        res.clearCookie('qid');

        return true;
    },
});

export const changeRole = mutationField('changeRole', {
    type: User.$name,
    args: { user: nonNull('String'), role: nonNull('Int') },
    shield: isAdminRuleType,
    async resolve(_root, { user, role }: { user: string; role: number }, { pc, req }: Context) {
        const currentUserIsAdmin = req.session.user.role.name === 'admin';
        if (currentUserIsAdmin) {
            throw `Don't go back to moke!`;
        }

        const updatedUser = await pc.user.update({
            where: {
                cuid: user,
            },
            data: {
                role: { connect: { id: role } },
            },
        });

        return updatedUser;
    },
});
