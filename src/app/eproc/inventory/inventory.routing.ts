import { Routes } from '@angular/router';

import { AuthGuard } from '../../../auth.guard';
import { AdjustmentdetailComponent } from './adjustment/adjustmentdetail/adjustmentdetail.component';
import { AdjustmentDetaildetailComponent } from './adjustment/adjustmentdetail/adjustmentdetaildetail/adjustmentdetaildetail.component';
import { AdjustmentlistComponent } from './adjustment/adjustmentlist/adjustmentlist.component';
import { InventoryCardlistComponent } from './inventorycard/inventorycardlist/inventorycardlist.component';
import { InventoryOpnameListComponent } from './inventoryopname/inventoryopnamelist/inventoryopnamelist.component';

export const Inventory: Routes = [{
    path: '',
    children: [
        /* INVENTORY_ADJUSTMENT */
        {
            path: 'subadjustmentlist',
            component: AdjustmentlistComponent,
            // canActivate: [AuthGuard],
            children: [
                {
                    path: 'adjustmentdetail', /*add*/
                    component: AdjustmentdetailComponent
                },
                {
                    path: 'adjustmentdetail/:id', /*update*/
                    component: AdjustmentdetailComponent,
                },
                {
                    path: 'adjustmentdetaildetail/:id', /*add*/
                    component: AdjustmentDetaildetailComponent,

                },
                {
                    path: 'adjustmentdetaildetail/:id/:id2', /*update*/
                    component: AdjustmentDetaildetailComponent,

                },
            ]
        },
        /* INVENTORY_ADJUSTMENT */
        
        
         /* INVENTORY_CARD */
         {
            path: 'substockcardlist',
            component: InventoryCardlistComponent,
            // canActivate: [AuthGuard],
            // children: [
            //     {
            //         path: 'invoiceregisterdetail', /*add*/
            //         component: InvoiceRegistrationdetailComponent
            //     },
            // ]
        },
        /* INVENTORY_CARD */

         /* INVENTORY_OPNAME */
         {
            path: 'subinventoryopnamelist',
            component: InventoryOpnameListComponent,
            // canActivate: [AuthGuard],
            // children: [
            //     {
            //         path: 'paymentrequestdetail', /*add*/
            //         component: PaymentRequestdetailComponent
            //     },
            //     {
            //         path: 'paymentrequestdetail/:id', /*update*/
            //         component: PaymentRequestdetailComponent,
            //     },
            // ]
        },
        /* INVENTORY_OPNAME */
       
    ]

}];
