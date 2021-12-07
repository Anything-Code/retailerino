import { ruleType, or } from 'nexus-shield';
import { verify } from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server-errors';
import { JWTPayload } from './types';
import { withoutBearer } from './util';

export const isUserRuleType = ruleType<'Mutation', string>({
    async resolve(_root, _args, { req, pc }) {
        const rawToken = req.headers.authorization;
        if (!rawToken) throw AuthenticationError;

        const authToken = withoutBearer(rawToken);

        try {
            const payload: JWTPayload = verify(authToken, process.env.AUTH_SECRET!) as JWTPayload;
            const user = await pc.user.findUnique({ where: { cuid: payload.user.cuid }, include: { role: true } });

            if (user == null) {
                throw 'No user exists like that!';
            }

            return user.role.name === 'customer' ? true : false;
        } catch (error) {
            throw AuthenticationError;
        }
    },
});

export const isAdminRuleType = ruleType<'Mutation', string>({
    async resolve(_root, _args, { req, pc }) {
        const rawToken = req.headers.authorization;
        if (!rawToken) throw AuthenticationError;

        const authToken = withoutBearer(rawToken);

        try {
            const payload: JWTPayload = verify(authToken, process.env.AUTH_SECRET!) as JWTPayload;
            const user = await pc.user.findUnique({ where: { cuid: payload.user.cuid }, include: { role: true } });

            if (user == null) {
                throw 'No user exists like that!';
            }
            return user.role.name === 'admin' ? true : false;
        } catch (error) {
            throw AuthenticationError;
        }
    },
});

export const isAuthenticatedRuleType = or(isUserRuleType, isAdminRuleType);

export const isUser = {
    shield: isUserRuleType,
};

export const isAdmin = {
    shield: isAdminRuleType,
};

export const isAuthenticated = {
    shield: or(isUserRuleType, isAdminRuleType),
};
