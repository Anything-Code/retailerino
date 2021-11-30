import bcrypt from 'bcrypt';

export const salt = async () => await bcrypt.genSalt(10);
export const asPercent = (step: number, amount: number): number => Math.round((step / amount) * 100);
