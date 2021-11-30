import { List, Set } from 'immutable';
import { pc } from '../../src/context';
import { salt } from '../../src/schema/types/User';
import { User, Role } from '@prisma/client';
import { asPercent } from '../../src/helpers';
import faker from 'faker';
import bcrypt from 'bcrypt';

export const createRoles = async (names: List<string>, res: Set<Role> = Set()): Promise<any> => {
    console.info('Creating roles:', `${asPercent(res.size, names.size)}%`);

    if (res.size === names.size) {
        console.log();
        return res;
    }

    return await createRoles(
        names,
        Set([
            ...res,
            await pc.role.create({
                data: { name: names.get(res.size)! },
            }),
        ])
    );
};

export const createUsers = async (amount: number, res: Set<User> = Set()): Promise<any> => {
    console.info('Creating users:', `${asPercent(res.size, amount)}%`);

    if (res.size === amount) {
        console.log();
        return res;
    }

    return await createUsers(
        amount,
        Set([
            ...res,
            await pc.user.create({
                data: {
                    email: faker.internet.email(),
                    password: await bcrypt.hash('secret', await salt()),
                    firstname: faker.name.firstName(),
                    lastname: faker.name.lastName(),
                    lastUserAgent: faker.internet.userAgent(),
                    phoneNumber: faker.phone.phoneNumber(),
                    role: {
                        connect: {
                            id: 2,
                        },
                    },
                },
            }),
        ])
    );
};
