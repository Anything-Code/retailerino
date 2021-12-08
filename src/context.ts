import { PrismaClient } from '@prisma/client';
import { ExpressContext } from 'apollo-server-express';
import express from 'express';

export const pc = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
    ],
});

if (process.env.NODE_ENV !== 'production') {
    pc.$on('query', async (e) => {
        console.log(`${e.query} ${e.params}`);
    });
}

export interface Context {
    req: express.Request;
    res: express.Response;
    pc: PrismaClient;
    prisma: PrismaClient;
    playground?: any;
}

export const createContext = ({ req, res }: ExpressContext): Context => ({
    req,
    res,
    pc,
    prisma: pc,
    playground: {
        settings: {
            'request.credentials': 'include',
        },
    },
});
