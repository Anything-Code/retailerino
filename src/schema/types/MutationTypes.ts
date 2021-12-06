import { nonNull } from 'nexus';
import { extendType, nullable } from 'nexus/dist/core';
import { salt } from '../../util';
import bcrypt from 'bcrypt';
import { isAdminRuleType } from '../../rules';

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
                    data: {
                        firstname: firstname ?? user!.firstname,
                        lastname: lastname ?? user!.lastname,
                        phoneNumber: phoneNumber ?? user!.phoneNumber,
                        email: email ?? user!.email,
                        password: password ?? user!.password,
                        roleId: roleId ?? user!.roleId,
                    },
                    where: { cuid },
                });
            },
        });
        t.field('deleteUser', {
            type: 'User',
            shield: isAdminRuleType,
            args: { cuid: nonNull('String') },
            resolve: async (_parent, { cuid }: any, { pc }) => await pc.user.delete({ where: { cuid } }),
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
                street: nonNull('String'),
                city: nonNull('String'),
                zip: nonNull('String'),
                country: nonNull('String'),
                userUId: nonNull('String'),
            },
            resolve: async (_parent, { id, street, city, zip, country, userUId }: any, { pc }) =>
                await pc.address.update({ where: { id }, data: { street, city, zip, country, userUId } }),
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
// export const cartItemQueryType = extendType(allMutations(CartItem, pc.cartItem, 'id'));
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
