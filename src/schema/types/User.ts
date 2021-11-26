import { List } from 'immutable';
import { mutationField, nonNull, objectType } from 'nexus';
import {
    User,
    Role,
    Address,
    CartItem,
    Order,
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
import { Context } from '../../context';
import bcrypt from 'bcrypt';
import { AuthenticationError } from 'apollo-server-errors';
import { isAuthenticatedRuleType } from '../../rules';

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
export const orderObjectType = objectType(getBaseObjectType(Order));
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

// export const Query = queryType({
//     definition(t) {
//         // t.crud.users(isAuthenticated);
//         // t.crud.user(isAuthenticated);
//         t.crud.users();
//         t.crud.user();
//     },
// });

// export const Mutation = mutationType({
//     definition(t) {
//         t.crud.createOneUser();
//         // t.crud.upsertOneUser();
//         // t.crud.updateOneUser();
//         // t.crud.updateManyUser();
//         // t.crud.deleteOneUser();
//         // t.crud.deleteManyUser();
//     },
// });

declare module 'express-session' {
    interface SessionData {
        authenticated: boolean;
        user: any;
    }
}

export const register = mutationField('register', {
    type: 'User',
    args: { name: nonNull('String'), email: nonNull('String'), password: nonNull('String') },
    description: 'Registers a new user.',
    async resolve(_root, { email, password, firstname, lastname, phoneNumber, lastUserAgent }, { req, pc }: Context) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await pc.user.create({
            data: {
                email,
                password: hashedPassword,
                firstname,
                lastname,
                phoneNumber,
                lastUserAgent,
                role: { connect: { id: 2 } },
            },
            include: { addresses: true, cartItems: true, orders: true, reviews: true, role: true },
        });

        req.session.authenticated = true;
        req.session.user = user;

        console.log(req.session);

        return user;
    },
});

export const login = mutationField('login', {
    type: 'User',
    args: { email: nonNull('String'), password: nonNull('String') },
    description: 'Logs a user in',
    async resolve(_root, { email, password }, { req, pc }: Context) {
        const user = await pc.user.findUnique({
            where: { email },
            include: { addresses: true, cartItems: true, orders: true, reviews: true, role: true },
        });
        if (user == null) {
            throw AuthenticationError;
        }
        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
            throw AuthenticationError;
        }

        req.session.authenticated = true;
        req.session.user = user;

        return user;
    },
});

// export const logout = mutationField('logout', {
//     type: 'Boolean',
//     shield: isAuthenticatedRuleType,
//     resolve(_root, _args, { req, res }: Context) {
//         res.clearCookie('qid');

//         return true;
//     },
// });

// export const me = mutationField('me', {
//     type: 'User',
//     shield: isAuthenticatedRuleType,
//     resolve(_root, _args, { req }: Context): any {
//         return req.session.user;
//     },
// });

// export const updateMyself = mutationField('updateMyself', {
//     type: 'User',
//     args: { name: nullable('String'), email: nullable('String'), password: nullable('String') },
//     shield: isAuthenticatedRuleType,
//     async resolve(_root, { name, email, password }, { req, pc }: Context) {
//         const user = await pc.user.findFirst({ where: { id: req.session.user.id } });
//         const updatedUser = await pc.user.update({
//             where: {
//                 id: req.session.user.id,
//             },
//             data: {
//                 name: name ?? user!.name,
//                 email: email ?? user!.email,
//                 password: password ?? user!.password,
//             },
//         });

//         return updatedUser;
//     },
// });

// export const deleteMyself = mutationField('deleteMyself', {
//     type: 'Boolean',
//     args: { confirm: nonNull('Boolean') },
//     shield: isAuthenticatedRuleType,
//     async resolve(_root, { confirm }, { req, res, pc }: Context) {
//         const deletedUser = await pc.user.delete({
//             where: {
//                 id: req.session.user.id,
//             },
//         });

//         res.clearCookie('qid');

//         return true;
//     },
// });
