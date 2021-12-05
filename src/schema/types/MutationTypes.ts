import { nonNull } from 'nexus';
import {
    User,
    Role,
    Address,
    CartItem,
    OrderI,
    Review,
    InventoryGroup,
    InventoryItem,
    InventoryGroupRelationship,
    InventoryGroupImage,
    DeliveryServiceProvider,
    InventoryGroupCategory,
    Image,
    Category,
    OrderItem,
} from 'nexus-prisma';
import { extendType, NexusNonNullableTypes, ObjectDefinitionBlock } from 'nexus/dist/core';
import { Context, pc } from '../../context';

// const allMutations = (model: any, client: any, pk: string = 'id', pkType: NexusNonNullableTypes = 'Int'): any => ({
//     type: 'Mutation',
//     definition(t: ObjectDefinitionBlock<'Query'>) {
//         t.list.field('create' + model.$name, {
//             type: model.$name,
//             async resolve(_parent, _args, _ctx: Context) {
//                 return await client.findMany();
//             },
//         });
//     },
// });

// export const userQueryType = extendType(allMutations(User, pc.user, 'cuid', 'String'));
// export const roleQueryType = extendType(allMutations(Role, pc.role, 'id'));
// export const addressQueryType = extendType(allMutations(Address, pc.address, 'id'));
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
