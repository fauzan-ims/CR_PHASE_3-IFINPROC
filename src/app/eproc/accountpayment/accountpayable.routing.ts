import { Routes } from '@angular/router';

import { AuthGuard } from '../../../auth.guard';
import { InvoiceRegistrationdetailComponent } from './invoiceregistration/invoiceregistrationdetail/invoiceregistrationdetail.component';
import { InvoiceRegistrationDetailWizDetailComponent } from './invoiceregistration/invoiceregistrationdetail/invoiceregistrationdetailwiz/invoiceregistrationdetailwizdetail/invoiceregistrationdetailwizdetail.component';
import { InvoiceRegistrationDetailWizListComponent } from './invoiceregistration/invoiceregistrationdetail/invoiceregistrationdetailwiz/invoiceregistrationdetailwizlist/invoiceregistrationdetailwizlist.component';
import { InvoiceRegistrationlistComponent } from './invoiceregistration/invoiceregistrationlist/invoiceregistrationlist.component';
import { PaymentRequestdetailComponent } from './paymentrequest/paymentrequestdetail/paymentrequestdetail.component';
import { PaymentRequestDetaildetailComponent } from './paymentrequest/paymentrequestdetail/paymentrequestdetaildetail/paymentrequestdetaildetail.component';
import { PaymentRequestlistComponent } from './paymentrequest/paymentrequestlist/paymentrequestlist.component';
import { PaymentSelectionlistComponent } from './paymentselection/paymentselectionlist/paymentselectionlist.component';
import { PaymentRequestApprovalComponent } from './paymentrequest/paymentrequestapproval/paymentrequestapproval.component';
import { InvoiceRegistrationApprovalComponent } from './paymentrequest/invoiceregistrationapproval/invoiceregistrationapproval.component';
import { InvoiceRegistrationApprovalItemComponent } from './paymentrequest/invoiceregistrationapproval/invoiceregistrationapprovalitemlist/invoiceregistrationapprovalitemlist.component';
import { MonitoringAplistComponent } from './monitoringap/monitoringaplist/monitoringaplist.component';


export const AccountPayable: Routes = [{
    path: '',
    children: [
        /* Invoice Register */
        {
            path: 'subinvoiceregisterlist',
            component: InvoiceRegistrationlistComponent,
            // canActivate: [AuthGuard],
            children: [
                {
                    path: 'invoiceregisterdetail', /*add*/
                    component: InvoiceRegistrationdetailComponent
                },
                {
                    path: 'invoiceregisterdetail/:id', /*update*/
                    component: InvoiceRegistrationdetailComponent,
                    children: [
                        {
                            path: 'invoiceregisterdetailwizlist/:id',
                            component: InvoiceRegistrationDetailWizListComponent
                        },
                        {
                            path: 'invoiceregisterdetailwizdetail/:id', // add
                            component: InvoiceRegistrationDetailWizDetailComponent
                        },
                        {
                            path: 'invoiceregisterdetailwizdetail/:id/:id2', // update
                            component: InvoiceRegistrationDetailWizDetailComponent
                        },
                    ]
                },
            ]
        },
        /* invoice register */


        /* payment selection */
        {
            path: 'subpaymentselectionlist',
            component: PaymentSelectionlistComponent,
            // canActivate: [AuthGuard],
            // children: [
            //     {
            //         path: 'invoiceregisterdetail', /*add*/
            //         component: InvoiceRegistrationdetailComponent
            //     },
            // ]
        },
        /* payment selection */

        /* payment Request */
        {
            path: 'subpaymentrequestlist',
            component: PaymentRequestlistComponent,
            // canActivate: [AuthGuard],
            children: [
                {
                    path: 'paymentrequestdetail', /*add*/
                    component: PaymentRequestdetailComponent
                },
                {
                    path: 'paymentrequestdetail/:id', /*update*/
                    component: PaymentRequestdetailComponent,
                },
                {
                    path: 'paymentrequestdetaildetail/:id', /*add*/
                    component: PaymentRequestDetaildetailComponent,

                },
                {
                    path: 'paymentrequestdetaildetail/:id/:id2', /*update*/
                    component: PaymentRequestDetaildetailComponent,

                },
                // {
                //     path: 'subinvoiceregister/:id', /*update*/
                //     component: InvoiceRegistrationApprovalComponent,

                // }
            ]
        },
        {
            path: 'paymentrequestapproval/:id',
            component: PaymentRequestApprovalComponent
        },
        /* payment Request */

        //(+) Ari 2024-03-28
        //invoice register
        // {
        //     path: 'subinvoiceregister/:id/:id2',
        //     component: InvoiceRegistrationApprovalComponent,

        // },
        //invoice register

        //invoice register item
        {
            path: 'subitemlist/:id',
            component: InvoiceRegistrationApprovalItemComponent,
            // canActivate: [AuthGuard],
        },
        //invoice register item
        //(+) Ari 2024-03-28
        {
            path: 'submonitoringaplist',
            component : MonitoringAplistComponent
        },
        {
            path: 'invoiceregistrationapproval/:id',
            component: InvoiceRegistrationApprovalComponent
        }

    ]

}];
