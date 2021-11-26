import { ruleType } from 'nexus-shield';

export const isAuthenticatedRuleType = ruleType<'Mutation', string>({
    resolve: (_root, _args, { req }) => (req.session.authenticated ? true : false),
});

export const isAuthenticated = {
    shield: isAuthenticatedRuleType,
};
