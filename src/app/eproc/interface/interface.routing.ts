import { Routes } from '@angular/router';
import { AuthGuard } from '../../../auth.guard';
import { AssetdetailComponent } from './asset/assetdetail/assetdetail.component';
import { AssetlistComponent } from './asset/assetlist/assetlist.component';
import { BiddingRequestdetailComponent } from './biddingrequest/biddingrequestdetail/biddingrequestdetail.component';
import { BiddingrequestdetailwizComponent } from './biddingrequest/biddingrequestdetail/biddingrequestdetailwiz/biddingrequestdetailwizlist/biddingrequestdetailwizlist.component';
import { BiddingrequestlistComponent } from './biddingrequest/biddingrequestlist/biddingrequestlist.component';
import { JournaltransactiondetailComponent } from './journaltransaction/journaltransactiondetail/journaltransactiondetail.component';
import { JournaltransactionlistComponent } from './journaltransaction/journaltransactionlist/journaltransactionlist.component';
import { InterfacePaymentrequestdetailComponent } from './paymentrequest/paymentrequestdetail/paymentrequestdetail.component';
import { InterfacePaymentRequestlistComponent } from './paymentrequest/paymentrequestlist/paymentrequestlist.component';
import { interfaceapprovallistComponent } from './interfaceapproval/interfaceapprovallist/interfaceapprovallist.component';
import { InterfaceapprovaldetailComponent } from './interfaceapproval/interfaceapprovaldetail/interfaceapprovaldetail.component';
import { InterfaceHandoverRequestlistComponent } from './interfacehandoverrequest/interfacehandoverrequestlist.component';
import { InterfaceAdditionalInvoiceRequestlistComponent } from './interfaceadditionalinvoicerequest/interfaceadditionalinvoicerequest.component';
import { InterfaceExpenseAssetListlistComponent } from './expenseasset/expenseassetlist/expenseassetlist.component';
import { InterfaceDocumentPendinglistComponent } from './interfacedocumentpending/interfacedocumentpendinglist/interfacedocumentpendinglist.component';
import { DocumentPendingdetailComponent } from './interfacedocumentpending/interfacedocumentpendingdetail/interfacedocumentpendingdetail.component';
import { InterfaceAdjustmentlistComponent } from './interfaceadjustment/interfaceadjustmentlist/interfaceadjustmentlist.component';


export const Interface: Routes = [{
    path: '',
    children: [ 
        {
            path: 'subinterfacebiddingrequest',
            component: BiddingrequestlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'biddingrequestdetail', /*add*/
                    component: BiddingRequestdetailComponent
                },
                {
                    path: 'biddingrequestdetail/:id/:id2', /*update*/
                    component: BiddingRequestdetailComponent,
                    children: [
                        {
                            path: 'biddingrequestdetailwizlist/:id:/:id2',
                            component: BiddingrequestdetailwizComponent
                        },
                    ]

                },
            ]
        },

        /*master recivedlist*/
        {
            path: 'assetlist',
            component: AssetlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'assetdetail',
                    component: AssetdetailComponent,
                },
                {
                    path: 'assetdetail/:id',
                    component: AssetdetailComponent
                }
            ]
        },
        /*master recivedlist*/

        {
            path: 'subjournallist',
            component: JournaltransactionlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'journaltransactiondetail/:id/:id2',
                    component: JournaltransactiondetailComponent
                }
            ]
        },

        {
            path: 'subpaymentrequestlist',
            component: InterfacePaymentRequestlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'paymentrequestdetail/:id',
                    component: InterfacePaymentrequestdetailComponent
                }
            ]
        },

        //approval
        {
            path: 'subinterfaceapprovallist',
            component: interfaceapprovallistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'interfaceapprovaldetail/:id',
                    component: InterfaceapprovaldetailComponent,
                },
            ]
        },
        //approval
        {
            path: 'subinterfacehandoverrequestlist',
            component: InterfaceHandoverRequestlistComponent,
            canActivate: [AuthGuard]
        },
        {
            path: 'subinterfaceadditionalinvoicerequestlist',
            component: InterfaceAdditionalInvoiceRequestlistComponent,
            canActivate: [AuthGuard]
        },
        {
            path: 'subexpenseassetlist',
            component: InterfaceExpenseAssetListlistComponent,
            canActivate: [AuthGuard]
        },
        {
            path: 'subdocumentpendinglist',
            component: InterfaceDocumentPendinglistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'documentpendinginterfacedetail/:id',
                    component: DocumentPendingdetailComponent
                }
            ]
        },
        {
            path: 'subinterfaceadjustmentlist',
            component: InterfaceAdjustmentlistComponent,
            canActivate: [AuthGuard]
        }
    ]

}];
