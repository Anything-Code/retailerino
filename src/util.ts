import bcrypt from 'bcrypt';
import { Maybe } from './types';

export const salt = async () => await bcrypt.genSalt(10);
export const asPercent = (step: number, amount: number): number => Math.round((step / amount) * 100);
export async function usePromise<T>(promise: Promise<any>): Promise<[res: Maybe<T>, err: any]> {
    try {
        const res = await promise;
        return [res, null];
    } catch (err: any) {
        return [null, err];
    }
}
export const withoutBearer = (authToken: string) => authToken.replace('Bearer ', '');
