import { List, Range } from 'immutable';
import faker from 'faker';
import { pc } from '../../src/context';

export const rolePromises = List([
    pc.role.create({
        data: { name: 'admin' },
    }),
    pc.role.create({
        data: { name: 'customer' },
    }),
]);

export const userPromises = Range(1, 100).map((i) =>
    pc.user.create({
        data: {
            email: faker.internet.email(),
            password: faker.internet.password(),
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
    })
);
