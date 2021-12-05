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

const lcFirstChar = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const allQueries = (model: any, client: any, pk: string = 'id', pkType: NexusNonNullableTypes = 'Int'): any => ({
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

export const userQueryType = extendType(allQueries(User, pc.user, 'cuid', 'String'));
export const roleQueryType = extendType(allQueries(Role, pc.role));
export const addressQueryType = extendType(allQueries(Address, pc.address));
export const cartItemQueryType = extendType(allQueries(CartItem, pc.cartItem));
export const orderIQueryType = extendType(allQueries(OrderI, pc.orderI));
export const reviewQueryType = extendType(allQueries(Review, pc.review));
export const inventoryGroupQueryType = extendType(allQueries(InventoryGroup, pc.inventoryGroup));
export const inventoryItemQueryType = extendType(allQueries(InventoryItem, pc.inventoryItem));
export const inventoryGroupRelationshipQueryType = extendType(
    allQueries(InventoryGroupRelationship, pc.inventoryGroupRelationship)
);
export const inventoryGroupImageQueryType = extendType(allQueries(InventoryGroupImage, pc.inventoryGroupImage));
export const deliveryServiceProviderQueryType = extendType(
    allQueries(DeliveryServiceProvider, pc.deliveryServiceProvider)
);
export const inventoryGroupCategoryQueryType = extendType(
    allQueries(InventoryGroupCategory, pc.inventoryGroupCategory)
);
export const imageQueryType = extendType(allQueries(Image, pc.image));
export const categoryQueryType = extendType(allQueries(Category, pc.category));
export const orderItemQueryType = extendType(allQueries(OrderItem, pc.orderItem));
