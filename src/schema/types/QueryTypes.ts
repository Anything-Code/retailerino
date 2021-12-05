import { nonNull, queryType } from 'nexus';
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
import { extendType, list, NexusNonNullableTypes, ObjectDefinitionBlock } from 'nexus/dist/core';
import { Context, pc } from '../../context';

const lcFirstChar = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const allReadQueries = (model: any, client: any, pk: string, pkType: NexusNonNullableTypes = 'Int'): any => ({
    type: 'Query',
    definition(t: ObjectDefinitionBlock<'Query'>) {
        t.list.field(lcFirstChar(model.$name) + 's', {
            type: model.$name,
            async resolve(_parent, _args, _ctx: Context) {
                return await client.findMany();
            },
        });
        t.field(lcFirstChar(model.$name), {
            type: model.$name,
            args: { [pk]: nonNull(pkType) },
            resolve: async (_parent, args, _ctx: Context) => await client.findFirst({ where: { [pk]: args[pk] } }),
        });
    },
});

export const userQueryType = extendType(allReadQueries(User, pc.user, 'cuid', 'String'));
export const roleQueryType = extendType(allReadQueries(Role, pc.role, 'id'));
export const addressQueryType = extendType(allReadQueries(Address, pc.address, 'id'));
export const cartItemQueryType = extendType(allReadQueries(CartItem, pc.cartItem, 'id'));
export const orderIQueryType = extendType(allReadQueries(OrderI, pc.orderI, 'id'));
export const reviewQueryType = extendType(allReadQueries(Review, pc.review, 'id'));
export const inventoryGroupQueryType = extendType(allReadQueries(InventoryGroup, pc.inventoryGroup, 'id'));
export const inventoryItemQueryType = extendType(allReadQueries(InventoryItem, pc.inventoryItem, 'id'));
export const inventoryGroupRelationshipQueryType = extendType(
    allReadQueries(InventoryGroupRelationship, pc.inventoryGroupRelationship, 'id')
);
export const inventoryGroupImageQueryType = extendType(
    allReadQueries(InventoryGroupImage, pc.inventoryGroupImage, 'id')
);
export const deliveryServiceProviderQueryType = extendType(
    allReadQueries(DeliveryServiceProvider, pc.deliveryServiceProvider, 'id')
);
export const inventoryGroupCategoryQueryType = extendType(
    allReadQueries(InventoryGroupCategory, pc.inventoryGroupCategory, 'id')
);
export const imageQueryType = extendType(allReadQueries(Image, pc.image, 'id'));
export const categoryQueryType = extendType(allReadQueries(Category, pc.category, 'id'));
export const orderItemQueryType = extendType(allReadQueries(OrderItem, pc.orderItem, 'id'));
