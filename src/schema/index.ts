import { makeSchema } from 'nexus';
import { allow, nexusShield } from 'nexus-shield';
import { ForbiddenError } from 'apollo-server-errors';
import NexusPrismaScalars from 'nexus-prisma/scalars';
import { join } from 'path';
import * as types from './types';

export const schema = makeSchema({
    types: { ...NexusPrismaScalars, ...types },
    plugins: [
        nexusShield({
            defaultError: new ForbiddenError('Not allowed'),
            defaultRule: allow,
        }),
    ],
    outputs: {
        typegen: join(process.cwd(), 'node_modules', '@types', 'nexus-typegen', 'index.d.ts'),
        // typegen: join(process.cwd(), 'generated', 'typegen.d.ts'),
        schema: join(process.cwd(), 'generated', 'schema.graphql'),
    },
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
});
