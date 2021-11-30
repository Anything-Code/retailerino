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
import { ObjectDefinitionBlock } from 'nexus/dist/definitions/objectType';
import { List } from 'immutable';
import { objectType } from 'nexus';

interface modelBaseType {
    $name: string;
    $description?: string;
}

interface baseObjectType {
    name: string;
    description?: string;
    definition: (t: ObjectDefinitionBlock<string>) => void;
}

function getBaseObjectType(model: modelBaseType, hidden?: List<string>): baseObjectType {
    const base = {
        name: model.$name,
        definition(t: ObjectDefinitionBlock<any>) {
            allFields(t, model, hidden);
        },
    };

    return model.$description
        ? {
              ...base,
              description: model.$description,
          }
        : base;
}

function allFields(t: ObjectDefinitionBlock<any>, model: any, hidden?: List<string>): void {
    Object.keys(model)
        .filter((item) => !item.includes('$'))
        .filter((item) => !hidden?.includes(item))
        .forEach((key) => {
            t.field(model[key]);
        });
}

export const userObjectType = objectType(getBaseObjectType(User, List(['password'])));
export const roleObjectType = objectType(getBaseObjectType(Role));
export const cartObjectType = objectType(getBaseObjectType(CartItem));
export const addressObjectType = objectType(getBaseObjectType(Address));
export const orderObjectType = objectType(getBaseObjectType(OrderI));
export const reviewObjectType = objectType(getBaseObjectType(Review));
export const inventoryGroupObjectType = objectType(getBaseObjectType(InventoryGroup));
export const inventoryItemObjectType = objectType(getBaseObjectType(InventoryItem));
export const inventoryGroupRealtionshipObjectType = objectType(getBaseObjectType(InventoryGroupRelationship));
export const inventoryGroupImageObjectType = objectType(getBaseObjectType(InventoryGroupImage));
export const inventoryGroupCategoryObjectType = objectType(getBaseObjectType(InventoryGroupCategory));
export const deliveryServiceProviderObjectType = objectType(getBaseObjectType(DeliveryServiceProvider));
export const imageObjectType = objectType(getBaseObjectType(Image));
export const categoryObjectType = objectType(getBaseObjectType(Category));
export const orderItemObjectType = objectType(getBaseObjectType(OrderItem));
