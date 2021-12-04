import bcrypt from 'bcrypt';

export const salt = async () => await bcrypt.genSalt(10);
export const asPercent = (step: number, amount: number): number => Math.round((step / amount) * 100);
export async function usePromise(promise: Promise<any>): Promise<[res: any, err: any]> {
    try {
        const res = await promise;
        return [res, null];
    } catch (err) {
        return [null, err];
    }
}
