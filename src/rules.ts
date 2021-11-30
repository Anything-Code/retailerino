import { ruleType, or } from 'nexus-shield';

export const isUserRuleType = ruleType<'Mutation', string>({
    resolve: (_root, _args, { req }) => req.session.user.role.name === 'user',
});

export const isAdminRuleType = ruleType<'Mutation', string>({
    resolve: (_root, _args, { req }) => req.session.user.role.name === 'admin',
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
