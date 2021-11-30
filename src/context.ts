import { PrismaClient } from '@prisma/client';
import { ExpressContext } from 'apollo-server-express';
import express from 'express';

export const pc = new PrismaClient();

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
