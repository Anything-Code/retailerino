import { List } from 'immutable';
import faker from 'faker';
import { pc } from '../../src/context';
import { randomInt } from 'crypto';
import { User } from '@prisma/client';
import { InventoryGroup } from '@prisma/client';
import { salt } from '../../src/util';
import bcrypt from 'bcrypt';

const amountOfCategories = 35;

export function composeADate() {
    return new Date(String(String(randomInt(28))) + faker.date.month()); //'20-JUN-1990 08:03:00');
}

export const rolePromises = List([
    pc.role.create({
        data: { name: 'admin' },
    }),
    pc.role.create({
        data: { name: 'customer' },
    }),
]);

export async function createStandaloneTables(i: number) {
    if (i < 100) {
        await pc.inventoryGroup.create({
            data: {
                itemName: faker.commerce.product(),
                price: Number(faker.commerce.price()),
                amount: Number(2), //faker.finance.amount()
                displayAmount: Number(2), //some ensurance needs to be made here to ensure quantity
                //updatedAt: '', //String(faker.time.recent())
            },
        });

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
        });
    }

    if (i < amountOfCategories) {
        await pc.category.create({
            data: {
                name: faker.commerce.department(),
            },
        });
    }

    if (i < 5) {
        await pc.deliveryServiceProvider.create({
            data: {
                name: faker.company.companyName(),
                pickupTime: composeADate(),
            },
        });
    }

    if (i < 500) {
        await pc.image.create({
            data: {
                url: faker.image.imageUrl() + i,
            },
        });

        await createStandaloneTables(++i);
    } else {
        await createAllUserAssociations();
        await createAllInventoryGroupAssociations();
        //await createAlloderAssociations();
        console.info('\nSeeding was successfull!');
        return;
    }
}

//==========================================================================
//======**               Change this stuff prob                     **======

export function makeABarCode() {
    return randomInt(999999);
    // if we want to make it a real barcode we can ik this is not most essential funk
}

export function getAInventoryGroupId() {
    return randomInt(99) + 1;
}

export function getAAdressId() {
    return randomInt(49) + 1;
}

export function getDeliveryServiceProvicerId() {
    return randomInt(5) + 1;
}

export function getCategoryId() {
    return randomInt(amountOfCategories) + 1;
}

//==================================================================================
//==========**         This is taking care of user and friends          **==========

export async function createAllUserAssociations() {
    const users: User[] = await pc.$queryRaw`SELECT * FROM User`;
    users.forEach(async (user) => {
        await reviewGenerator(user.cuid);
        await addressGenerator(user.cuid);
        await orderGenerator(user.cuid);
        await cartItemGenerator(user.cuid);
    });
    console.info('user setup was successful');
}

async function cartItemGenerator(userCuid: string) {
    await pc.cartItem.create({
        data: {
            inventoryGroupId: await getAInventoryGroupId(),
            userUId: userCuid,
            amount: 1,
        },
    });
}

async function reviewGenerator(userCuid: string) {
    await pc.review.create({
        data: {
            inventoryGroupId: await getAInventoryGroupId(),
            userUId: userCuid,
            description: faker.commerce.productDescription(),
            rating: randomInt(5),
        },
    });
}

async function addressGenerator(userCuid: string) {
    await pc.address.create({
        data: {
            street: faker.address.streetName(),
            city: faker.address.city(),
            zip: faker.address.zipCode(),
            country: faker.address.country(),
            userUId: userCuid,
        },
    });
}

async function orderGenerator(userCuid: string) {
    const orderIdl = await pc.orderI.create({
        data: {
            cofirmed: true,
            userUId: userCuid,
            addressId: 2, // getAAdressId(),
            deliveryServiceProvicerId: getDeliveryServiceProvicerId(),
        },
    });

    //for (let i = randomInt(3) + 1; i > 0; i--) { We have unqie here but why i dont get
    await pc.orderItem.create({
        data: {
            inventoryGroupId: await getAInventoryGroupId(),
            orderId: Number(orderIdl.id),
        },
    });
    //}
}

//==================================================================================
//==========**    This is taking care of inventory group and friends    **==========

export async function createAllInventoryGroupAssociations() {
    const inventoryGroupS: InventoryGroup[] = await pc.$queryRaw`SELECT * FROM InventoryGroup`;
    let i = 0;
    inventoryGroupS.forEach(async (inventoryGroupS) => {
        i++;
        await inventoryGroupCategoryGenerator(inventoryGroupS.id);
        await inventoryGroupImageGenerator(inventoryGroupS.id, i);
        await inventoryGroupRelationshipGenerator(inventoryGroupS.id);
        await inventoryItemGenerator(inventoryGroupS.id, i);
    });
    console.info('inventory setup was successful');
}

async function inventoryGroupCategoryGenerator(inventoryGroupIdl: number) {
    await pc.inventoryGroupCategory.create({
        data: {
            inventoryGroupId: inventoryGroupIdl,
            categoryId: getCategoryId(),
        },
    });
}

async function inventoryGroupImageGenerator(inventoryGroupIdl: number, i: number) {
    await pc.inventoryGroupImage.create({
        data: {
            inventoryGroupId: inventoryGroupIdl,
            imageId: randomInt(99) + 1,
        },
    });
}

async function inventoryGroupRelationshipGenerator(inventoryGroupIdl: number) {
    await pc.inventoryGroupRelationship.create({
        data: {
            inventoryGroupIdFrom: inventoryGroupIdl,
            inventoryGroupIdTo: await getAInventoryGroupId(),
        },
    });
}

async function inventoryItemGenerator(inventoryGroupIdl: number, i: number) {
    await pc.inventoryItem.create({
        data: {
            uBarcode: makeABarCode(),
            note: faker.commerce.productDescription(),
            inventoryGroupId: inventoryGroupIdl,
            arrivedAt: composeADate(),
        },
    });
}
