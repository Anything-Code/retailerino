import {
    rolePromises,
    createStandaloneTables,
    createAllUserAssociations,
    createAllInventoryGroupAssociations,
} from './seeding/tables';
import { exit } from 'process';
import { pc } from '../src/context';

async function main() {
    await Promise.all(rolePromises.toArray());
    await createStandaloneTables(0);

    //console.info('\nSeeding was successfull!');
}

main()
    .catch((error) => {
        console.error(error);
        exit(1);
    })
    .finally(async () => {
        await pc.$disconnect();
    });
