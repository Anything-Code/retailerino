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
import { extendType, NexusNonNullableTypes, ObjectDefinitionBlock } from 'nexus/dist/core';
import { Context, pc } from '../../context';

const jsLcfirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const allReadQueries = (model: any, client: any, pk: string, pkType: NexusNonNullableTypes): any => ({
    type: 'Query',
    definition(t: ObjectDefinitionBlock<'Query'>) {
        t.field(jsLcfirst(model.$name) + 's', {
            type: model.$name,
            async resolve(_root, _args, _ctx: Context) {
                return await client.findMany();
            },
        });
        t.field(jsLcfirst(model.$name), {
            type: model.$name,
            args: { [pk]: nonNull(pkType) },
            async resolve(_root, { pk }, _ctx: Context) {
                return await client.findFirst({ where: { [pk]: [pk] } });
            },
        });
    },
});

export const userQueryType = extendType(allReadQueries(User, pc.user, 'cuid', 'String'));
export const roleQueryType = extendType(allReadQueries(Role, pc.role, 'id', 'Int'));
export const addressQueryType = extendType(allReadQueries(Address, pc.address, 'id', 'Int'));
export const cartItemQueryType = extendType(allReadQueries(CartItem, pc.cartItem, 'id', 'Int'));
export const orderIQueryType = extendType(allReadQueries(OrderI, pc.orderI, 'id', 'Int'));
export const reviewQueryType = extendType(allReadQueries(Review, pc.review, 'id', 'Int'));
export const inventoryGroupQueryType = extendType(allReadQueries(InventoryGroup, pc.inventoryGroup, 'id', 'Int'));
export const inventoryItemQueryType = extendType(allReadQueries(InventoryItem, pc.inventoryItem, 'id', 'Int'));
export const inventoryGroupRelationshipQueryType = extendType(
    allReadQueries(InventoryGroupRelationship, pc.inventoryGroupRelationship, 'id', 'Int')
);
export const inventoryGroupImageQueryType = extendType(
    allReadQueries(InventoryGroupImage, pc.inventoryGroupImage, 'id', 'Int')
);
export const deliveryServiceProviderQueryType = extendType(
    allReadQueries(DeliveryServiceProvider, pc.deliveryServiceProvider, 'id', 'Int')
);
export const inventoryGroupCategoryQueryType = extendType(
    allReadQueries(InventoryGroupCategory, pc.inventoryGroupCategory, 'id', 'Int')
);
export const imageQueryType = extendType(allReadQueries(Image, pc.image, 'id', 'Int'));
export const categoryQueryType = extendType(allReadQueries(Category, pc.category, 'id', 'Int'));
export const orderItemQueryType = extendType(allReadQueries(OrderItem, pc.orderItem, 'id', 'Int'));
