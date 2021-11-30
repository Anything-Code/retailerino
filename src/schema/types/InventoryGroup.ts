import { queryField } from 'nexus';
import { InventoryGroup } from 'nexus-prisma';
import { Context } from '../../context';

// export const getInventoryGroups = queryField('getInventoryGroups', {
//     type: InventoryGroup.$name,
//     async resolve(_root, _, { pc }: Context) {
//         return pc.inventoryGroup.findMany();
//     },
// });
