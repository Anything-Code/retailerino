import { rolePromises, userPromises } from './seeding/user';
import { exit } from 'process';
import { pc } from '../src/context';

async function main() {
    Promise.all(rolePromises.toArray());
    Promise.all(userPromises.toArray());

    console.info('\nSeeding was successfull!');
}

main()
    .catch((error) => {
        console.error(error);
        exit(1);
    })
    .finally(async () => {
        await pc.$disconnect();
    });
