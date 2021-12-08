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
import { isAdminRuleType } from '../../rules';

const lcFirstChar = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const allQueries = (
    model: any,
    client: any,
    pk: string = 'id',
    pkType: NexusNonNullableTypes = 'Int',
    shield?: any
): any => ({
    type: 'Query',
    shield,
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

export const inventoryGroupQueryType = extendType(allQueries(InventoryGroup, pc.inventoryGroup));

export const userQueryType = extendType(allQueries(User, pc.user, 'cuid', 'String', isAdminRuleType));
export const roleQueryType = extendType(allQueries(Role, pc.role, 'id', 'Int', isAdminRuleType));
export const addressQueryType = extendType(allQueries(Address, pc.address, 'id', 'Int', isAdminRuleType));
export const cartItemQueryType = extendType(allQueries(CartItem, pc.cartItem, 'id', 'Int', isAdminRuleType));
export const orderIQueryType = extendType(allQueries(OrderI, pc.orderI, 'id', 'Int', isAdminRuleType));
export const reviewQueryType = extendType(allQueries(Review, pc.review, 'id', 'Int', isAdminRuleType));
export const inventoryItemQueryType = extendType(
    allQueries(InventoryItem, pc.inventoryItem, 'id', 'Int', isAdminRuleType)
);
export const inventoryGroupRelationshipQueryType = extendType(
    allQueries(InventoryGroupRelationship, pc.inventoryGroupRelationship, 'id', 'Int', isAdminRuleType)
);
export const inventoryGroupImageQueryType = extendType(
    allQueries(InventoryGroupImage, pc.inventoryGroupImage, 'id', 'Int', isAdminRuleType)
);
export const deliveryServiceProviderQueryType = extendType(
    allQueries(DeliveryServiceProvider, pc.deliveryServiceProvider, 'id', 'Int', isAdminRuleType)
);
export const inventoryGroupCategoryQueryType = extendType(
    allQueries(InventoryGroupCategory, pc.inventoryGroupCategory, 'id', 'Int', isAdminRuleType)
);
export const imageQueryType = extendType(allQueries(Image, pc.image, 'id', 'Int', isAdminRuleType));
export const categoryQueryType = extendType(allQueries(Category, pc.category, 'id', 'Int', isAdminRuleType));
export const orderItemQueryType = extendType(allQueries(OrderItem, pc.orderItem, 'id', 'Int', isAdminRuleType));
