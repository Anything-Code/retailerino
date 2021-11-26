import { makeSchema } from 'nexus';
import { allow, nexusShield } from 'nexus-shield';
import { ForbiddenError } from 'apollo-server-errors';
import NexusPrismaScalars from 'nexus-prisma/scalars';
import * as types from './types';
import { mutationField, nonNull, objectType } from 'nexus';

export const schema = makeSchema({
    plugins: [
        nexusShield({
            defaultError: new ForbiddenError('Not allowed'),
            defaultRule: allow,
        }),
    ],
    contextType: {
        module: require.resolve('../context'),
        export: 'Context',
    },
    sourceTypes: {
        modules: [
            {
                module: require.resolve('.prisma/client/index.d.ts'),
                alias: 'prisma',
            },
        ],
    },
    types: { ...NexusPrismaScalars, ...types },
});
