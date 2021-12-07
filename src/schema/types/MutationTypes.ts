import { nonNull } from 'nexus';
import { extendType, inputObjectType, list, nullable } from 'nexus/dist/core';
import { salt, withoutBearer } from '../../util';
import bcrypt from 'bcrypt';
import { isAdminRuleType, isUserRuleType } from '../../rules';
import { decode, JwtPayload } from 'jsonwebtoken';

export const userMutationType = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('createUser', {
            type: 'User',
            shield: isAdminRuleType,
            args: {
                firstname: nonNull('String'),
                lastname: nonNull('String'),
                phoneNumber: nonNull('String'),
                email: nonNull('String'),
                password: nonNull('String'),
                roleId: nonNull('Int'),
            },
            resolve: async (_parent, { firstname, lastname, phoneNumber, email, password, roleId }: any, { pc }) =>
                await pc.user.create({
                    data: {
                        firstname,
                        lastname,
                        phoneNumber,
                        email,
                        password: await bcrypt.hash(password, await salt()),
                        roleId,
                    },
                }),
        });
        t.field('updateUser', {
            type: 'User',
            shield: isAdminRuleType,
            args: {
                cuid: nonNull('String'),
                firstname: nullable('String'),
                lastname: nullable('String'),
                phoneNumber: nullable('String'),
                email: nullable('String'),
                password: nullable('String'),
                roleId: nullable('Int'),
            },
            async resolve(_parent, { cuid, firstname, lastname, phoneNumber, email, password, roleId }: any, { pc }) {
                const user = await pc.user.findFirst({ where: { cuid } });
                return await pc.user.update({
                    where: { cuid },
                    data: {
                        firstname: firstname ?? user!.firstname,
                        lastname: lastname ?? user!.lastname,
                        phoneNumber: phoneNumber ?? user!.phoneNumber,
                        email: email ?? user!.email,
                        password: password ?? user!.password,
                        roleId: roleId ?? user!.roleId,
                    },
                });
            },
        });
        t.field('deleteUser', {
            type: 'User',
            shield: isAdminRuleType,
            args: { cuid: nonNull('String') },
            resolve: async (_parent, { cuid }: { cuid: string }, { pc }) => await pc.user.delete({ where: { cuid } }),
        });
    },
});

export const roleMutationType = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('createRole', {
            type: 'Role',
            shield: isAdminRuleType,
            args: { name: nonNull('String') },
            resolve: async (_parent, { name }: any, { pc }) => await pc.role.create({ data: { name } }),
        });
        t.field('updateRole', {
            type: 'Role',
            shield: isAdminRuleType,
            args: { id: nonNull('Int'), name: nonNull('String') },
            resolve: async (_parent, { id, name }: any, { pc }) =>
                await pc.role.update({ data: { name }, where: { id } }),
        });
        t.field('deleteRole', {
            type: 'Role',
            shield: isAdminRuleType,
            args: { id: nonNull('Int') },
            resolve: async (_parent, { id }: any, { pc }) => await pc.role.delete({ where: { id } }),
        });
    },
});

export const addressMutationType = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('createAddress', {
            type: 'Address',
            shield: isAdminRuleType,
            args: {
                street: nonNull('String'),
                city: nonNull('String'),
                zip: nonNull('String'),
                country: nonNull('String'),
                userUId: nonNull('String'),
            },
            resolve: async (_parent, { street, city, zip, country, userUId }: any, { pc }) =>
                await pc.address.create({ data: { street, city, zip, country, userUId } }),
        });
        t.field('updateAddress', {
            type: 'Address',
            shield: isAdminRuleType,
            args: {
                id: nonNull('Int'),
                street: nullable('String'),
                city: nullable('String'),
                zip: nullable('String'),
                country: nullable('String'),
            },
            async resolve(_parent, { id, street, city, zip, country }: any, { pc }) {
                const address = await pc.address.findUnique({ where: { id } });
                if (address == null) throw 'There is no address with that id';

                return await pc.address.update({
                    where: { id },
                    data: {
                        street: street ?? address.street,
                        city: city ?? address.city,
                        zip: zip ?? address.zip,
                        country: country ?? address.country,
                    },
                });
            },
        });
        t.field('deleteAddress', {
            type: 'Address',
            shield: isAdminRuleType,
            args: { id: nonNull('Int') },
            resolve: async (_parent, { id }: any, { pc }) => await pc.address.delete({ where: { id } }),
        });
    },
});

export const cartItemMutationType = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('createCartItem', {
            type: 'CartItem',
            shield: isAdminRuleType,
            args: {
                userUId: nonNull('String'),
                inventoryGroupId: nonNull('Int'),
                amount: nonNull('Int'),
            },
            resolve: async (_parent, { userUId, inventoryGroupId, amount }: any, { pc }) =>
                await pc.cartItem.create({ data: { userUId, inventoryGroupId, amount } }),
        });
        t.field('decrementCartItem', {
            type: 'CartItem',
            shield: isAdminRuleType,
            args: { inventoryGroupId: nonNull('Int'), userUId: nonNull('Int') },
            resolve: async (_parent, { inventoryGroupId, userUId }: any, { pc }) => {
                const cartItem = await pc.cartItem.findUnique({
                    where: { inventoryGroupId_userUId: { inventoryGroupId, userUId } },
                });

                if (cartItem == null) throw 'There is no such thing...';

                if (cartItem.amount === 1)
                    return await pc.cartItem.delete({
                        where: { inventoryGroupId_userUId: { inventoryGroupId, userUId } },
                    });

                return await pc.cartItem.update({
                    data: { amount: --cartItem.amount },
                    where: { inventoryGroupId_userUId: { inventoryGroupId, userUId } },
                });
            },
        });
    },
});

export const inventoryGroupMutationType = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('createInventoryGroup', {
            type: 'InventoryGroup',
            shield: isAdminRuleType,
            args: {
                itemName: nonNull('String'),
                price: nonNull('Float'),
                amount: nonNull('Int'),
                featured: nonNull('Boolean'),
                displayAmount: nonNull('Int'),
            },
            resolve: async (_parent, { itemName, price, amount, featured, displayAmount }: any, { pc }) =>
                await pc.inventoryGroup.create({ data: { itemName, price, amount, featured, displayAmount } }),
        });
        t.field('updateInventoryGroup', {
            type: 'InventoryGroup',
            shield: isAdminRuleType,
            args: {
                id: nonNull('Int'),
                itemName: nullable('String'),
                price: nullable('Float'),
                amount: nullable('Int'),
                featured: nullable('Boolean'),
                displayAmount: nullable('Int'),
            },
            async resolve(_parent, { id, itemName, price, amount, featured, displayAmount }: any, { pc }) {
                const inventoryGroup = await pc.inventoryGroup.findUnique({ where: { id } });
                if (inventoryGroup == null) throw 'There is no such thing...';

                return await pc.inventoryGroup.update({
                    where: { id },
                    data: {
                        itemName: itemName ?? inventoryGroup.itemName,
                        price: price ?? inventoryGroup.price,
                        amount: amount ?? inventoryGroup.amount,
                        featured: featured ?? inventoryGroup.featured,
                        displayAmount: displayAmount ?? inventoryGroup.displayAmount,
                    },
                });
            },
        });
        t.field('deleteAddress', {
            type: 'InventoryGroup',
            shield: isAdminRuleType,
            args: { id: nonNull('Int') },
            resolve: async (_parent, { id }: any, { pc }) => await pc.inventoryGroup.delete({ where: { id } }),
        });
    },
});

export const inventoryItemMutationType = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('createInventoryItem', {
            type: 'InventoryItem',
            shield: isAdminRuleType,
            args: {
                uBarcode: nonNull('String'),
                note: nonNull('String'),
                inventoryGroupId: nonNull('Int'),
                arrivedAt: nonNull('DateTime'),
            },
            resolve: async (_parent, { uBarcode, note, inventoryGroupId, arrivedAt }: any, { pc }) =>
                await pc.inventoryItem.create({ data: { uBarcode, note, inventoryGroupId, arrivedAt } }),
        });
        t.field('updateInventoryItem', {
            type: 'InventoryItem',
            shield: isAdminRuleType,
            args: {
                uBarcode: nullable('String'),
                note: nullable('String'),
                inventoryGroupId: nullable('Int'),
                arrivedAt: nullable('DateTime'),
            },
            async resolve(_parent, { uBarcode, note, inventoryGroupId, arrivedAt }: any, { pc }) {
                const inventoryItem = await pc.inventoryItem.findUnique({ where: { uBarcode } });
                if (inventoryItem == null) throw 'There is no such thing...';

                return await pc.inventoryItem.update({
                    where: { uBarcode },
                    data: {
                        uBarcode: uBarcode ?? inventoryItem.uBarcode,
                        note: note ?? inventoryItem.note,
                        inventoryGroupId: inventoryGroupId ?? inventoryItem.inventoryGroupId,
                        arrivedAt: arrivedAt ?? inventoryItem.arrivedAt,
                    },
                });
            },
        });
        t.field('deleteInventoryItem', {
            type: 'InventoryItem',
            shield: isAdminRuleType,
            args: { uBarcode: nonNull('Int') },
            resolve: async (_parent, { uBarcode }: any, { pc }) =>
                await pc.inventoryItem.delete({ where: { uBarcode } }),
        });
    },
});

const UserInput = inputObjectType({
    name: 'UserInput',
    definition(t) {
        t.field('email', { type: 'String' });
        t.field('firstname', { type: 'String' });
        t.field('lastname', { type: 'String' });
        t.field('password', { type: 'String' });
        t.field('phoneNumber', { type: 'String' });
    },
});
const AddressInput = inputObjectType({
    name: 'AddressInput',
    definition(t) {
        t.field('city', { type: 'String' });
        t.field('country', { type: 'String' });
        t.field('street', { type: 'String' });
        t.field('zip', { type: 'String' });
    },
});

export const orderMutationType = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('placeOrderUnauthenticated', {
            type: 'OrderI',
            args: {
                user: nonNull(UserInput),
                address: nonNull(AddressInput),
                orderItems: list('Int'),
                deliveryServiceProvicerId: nonNull('Int'),
            },
            async resolve(_parent, { user, address, orderItems, deliveryServiceProvicerId }: any, { pc }) {
                const newOrderItems = orderItems.map(async (id: number) => ({
                    inventoryGroupId: id,
                }));
                const mbyAddress = {
                    city: address.city,
                    country: address.country,
                    street: address.street,
                    zip: address.zip,
                };
                return await pc.orderI.create({
                    data: {
                        deliveryServiceProvicer: { connect: { id: deliveryServiceProvicerId } },
                        address: { create: mbyAddress },
                        confirmed: false,
                        user: {
                            create: {
                                email: user.email,
                                firstname: user.firstname,
                                lastname: user.lastname,
                                password: user.password,
                                phoneNumber: user.phoneNumber,
                                role: { connect: { id: 2 } },
                                addresses: { create: mbyAddress },
                            },
                        },
                        orderItems: { create: newOrderItems },
                    },
                });
            },
        });
        t.field('placeOrderAuthenticated', {
            type: 'OrderI',
            args: {
                address: nonNull(AddressInput),
                orderItems: list('Int'),
                deliveryServiceProvicerId: nonNull('Int'),
            },
            shield: isUserRuleType,
            async resolve(_parent, { address, orderItems, deliveryServiceProvicerId }: any, { req, pc }) {
                const authToken = withoutBearer(req.headers.authorization!);
                const payload: JwtPayload = decode(authToken!) as JwtPayload;
                const user = await pc.user.findUnique({ where: { cuid: payload.user.cuid } });
                if (user == null) throw 'No user exists like that.';

                const newOrderItems = orderItems.map(async (id: number) => ({ inventoryGroup: { connect: { id } } }));
                const mbyAddress = {
                    city: address.city,
                    country: address.country,
                    street: address.street,
                    zip: address.zip,
                };
                return await pc.orderI.create({
                    data: {
                        deliveryServiceProvicer: { connect: { id: deliveryServiceProvicerId } },
                        address: { create: mbyAddress },
                        confirmed: false,
                        user: {
                            connect: { cuid: user.cuid },
                        },
                        orderItems: { create: newOrderItems },
                    },
                });
            },
        });
        t.field('updateOrder', {
            type: 'OrderI',
            shield: isAdminRuleType,
            args: {
                id: nonNull('Int'),
                confirmed: nonNull('Boolean'),
            },
            async resolve(_parent, { id, confirmed }: any, { pc }) {
                const order = await pc.orderI.findUnique({ where: { id } });
                if (order == null) throw 'There is no such thing...';

                return await pc.orderI.update({
                    where: { id },
                    data: {
                        confirmed,
                    },
                });
            },
        });
        t.field('deleteOrder', {
            type: 'InventoryItem',
            shield: isAdminRuleType,
            args: { uBarcode: nonNull('Int') },
            resolve: async (_parent, { uBarcode }: any, { pc }) =>
                await pc.inventoryItem.delete({ where: { uBarcode } }),
        });
    },
});

// export const orderIQueryType = extendType(allMutations(OrderI, pc.orderI, 'id'));
// export const reviewQueryType = extendType(allMutations(Review, pc.review, 'id'));
// export const inventoryGroupQueryType = extendType(allMutations(InventoryGroup, pc.inventoryGroup, 'id'));
// export const inventoryItemQueryType = extendType(allMutations(InventoryItem, pc.inventoryItem, 'id'));
// export const inventoryGroupRelationshipQueryType = extendType(
//     allMutations(InventoryGroupRelationship, pc.inventoryGroupRelationship, 'id')
// );
// export const inventoryGroupImageQueryType = extendType(allMutations(InventoryGroupImage, pc.inventoryGroupImage, 'id'));
// export const deliveryServiceProviderQueryType = extendType(
//     allMutations(DeliveryServiceProvider, pc.deliveryServiceProvider, 'id')
// );
// export const inventoryGroupCategoryQueryType = extendType(
//     allMutations(InventoryGroupCategory, pc.inventoryGroupCategory, 'id')
// );
// export const imageQueryType = extendType(allMutations(Image, pc.image, 'id'));
// export const categoryQueryType = extendType(allMutations(Category, pc.category, 'id'));
// export const orderItemQueryType = extendType(allMutations(OrderItem, pc.orderItem, 'id'));
