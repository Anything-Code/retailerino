import { createRoles, createUsers } from './seeding/models';
import { exit } from 'process';
import { pc } from '../src/context';
import { List, Stack } from 'immutable';

async function main() {
    const roles = await createRoles(List(['user', 'admin']));
    const users = await createUsers(100);

    console.info('Seeding was successfull!');
}

main()
    .catch((error) => {
        console.error(error);
        exit(1);
    })
    .finally(async () => {
        await pc.$disconnect();
    });
