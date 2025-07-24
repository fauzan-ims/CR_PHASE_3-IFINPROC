import { Routes } from '@angular/router';
// tslint:disable-next-line:max-line-length
import { AuthGuard } from '../../../auth.guard';
import { ProcurementdetailComponent } from './procurement/procurementdetail/procurementdetail.component';
import { VendorwizComponent } from './procurement/procurementdetail/vendorwiz/vendorwizlist/vendorwizlist.component';
import { ProcurementlistComponent } from './procurement/procurementlist/procurementlist.component';
import { ProcurementrequestdetailComponent } from './procurementrequest/procurementrequestdetail/procurementrequestdetail.component';
import { RequestdocumentwizdetailComponent } from './procurementrequest/procurementrequestdetail/requestdocumentwiz/requestdocumentwizdetail/requestdocumentwizdetail.component';
import { RequestdocumentwizComponent } from './procurementrequest/procurementrequestdetail/requestdocumentwiz/requestdocumentwizlist/requestdocumentwizlist.component';
import { RequestitemwizdetailComponent } from './procurementrequest/procurementrequestdetail/requestitemwiz/requestitemwizdetail/requestitemwizdetail.component';
import { RequestitemwizComponent } from './procurementrequest/procurementrequestdetail/requestitemwiz/requestitemwizlist/requestitemwizlist.component';
import { ProcurementrequestlistComponent } from './procurementrequest/procurementrequestlist/procurementrequestlist.component';
import { QuotationdetailComponent } from './quotation/quotationdetail/quotationdetail.component';
import { QuotationDetailWizDetailComponent } from './quotation/quotationdetail/quotationdetailwiz/quotationdetailwizdetail/quotationdetailwizdetail.component';
import { QuotationDetailWizListComponent } from './quotation/quotationdetail/quotationdetailwiz/quotationdetailwizlist/quotationdetailwizlist.component';
import { QuotationDocumentWizListComponent } from './quotation/quotationdetail/quotationdocumentwiz/quotationdocumentwizlist/quotationdocumentwizlist.component';
import { QuotationlistComponent } from './quotation/quotationlist/quotationlist.component';
import { QuotationReviewdetailComponent } from './quotationreview/quotationreviewdetail/quotationreviewdetail.component';
import { QuotationReviewDetailWizDetailComponent } from './quotationreview/quotationreviewdetail/quotationreviewdetailwiz/quotationreviewdetailwizdetail/quotationreviewdetailwizdetail.component';
import { QuotationReviewDetailWizListComponent } from './quotationreview/quotationreviewdetail/quotationreviewdetailwiz/quotationreviewdetailwizlist/quotationreviewdetailwizlist.component';
import { QuotationReviewDocumentWizDetailComponent } from './quotationreview/quotationreviewdetail/quotationreviewdocumentwiz/quotationreviewdocumentwizdetail/quotationreviewdocumentwizdetail.component';
import { QuotationReviewDocumentWizListComponent } from './quotationreview/quotationreviewdetail/quotationreviewdocumentwiz/quotationreviewdocumentwizlist/quotationreviewdocumentwizlist.component';
import { QuotationReviewlistComponent } from './quotationreview/quotationreviewlist/quotationreviewlist.component';
import { SupplierSelectiondetailComponent } from './supplierselection/supplierselectiondetail/supplierselectiondetail.component';
import { SupplierSelectionDetaildetailComponent } from './supplierselection/supplierselectiondetail/supplierselectiondetaildetail/supplierselectiondetaildetail.component';
import { SupplierSelectionlistComponent } from './supplierselection/supplierselectionlist/supplierselectionlist.component';
import { VerificationdetailComponent } from './verification/verificationdetail/verificationdetail.component';
import { VerificationdocumentwizdetailComponent } from './verification/verificationdetail/verificationdocumentwiz/verificationdocumentwizdetail/verificationdocumentwizdetail.component';
import { VerificationdocumentwizComponent } from './verification/verificationdetail/verificationdocumentwiz/verificationdocumentwizlist/verificationdocumentwizlist.component';
import { VerificationitemwizdetailComponent } from './verification/verificationdetail/verificationitemwiz/verificationitemwizdetail/verificationitemwizdetail.component';
import { VerificationitemwizComponent } from './verification/verificationdetail/verificationitemwiz/verificationitemwizlist/verificationitemwizlist.component';
import { verificationlistComponent } from './verification/verificationlist/verificationlist.component';
import { GoodReceiptNotelistComponent } from './goodreceiptnote/goodreceiptnotelist/goodreceiptnotelist.component';
import { GoodReceiptNotedetailComponent } from './goodreceiptnote/goodreceiptnotedetail/goodreceiptnotedetail.component';
import { GoodReceiptNoteDetaildetailComponent } from './goodreceiptnote/goodreceiptnotedetail/goodreceiptnotedetaildetail/goodreceiptnotedetaildetail.component';
import { OrderRequestListComponent } from './orderrequest/orderrequestlist/orderrequestlist.component';
import { PurchaseOrderListComponent } from './purchaseorder/purchaseorderlist/purchaseorderlist.component';
import { PurchaseOrderDetailComponent } from './purchaseorder/purchaseorderdetail/purchaserorderdetail.component';
import { PurchaseOrderWizDetailListComponent } from './purchaseorder/purchaseorderdetail/purchaseorderwizdetail/purchaseorderwizdetaillist/purchaserorderwizdetaillist.component';
import { PurchaseOrderWizDetailDetailComponent } from './purchaseorder/purchaseorderdetail/purchaseorderwizdetail/purchaseorderwizdetaildetail/purchaseorderwizdetaildetail.component';
import { TermofPatmentWizListComponent } from './purchaseorder/purchaseorderdetail/termofpaymentwiz/termofpaymentwizlist/termofpaymentwizlist.component';
import { TermofPaymentWizDetailComponent } from './purchaseorder/purchaseorderdetail/termofpaymentwiz/termofpaymentwizdetail/termofpaymentwizdetail.component';
import { GoodReceiptNotechecklistwizlistComponent } from './goodreceiptnote/goodreceiptnotedetail/goodreceiptnotedetaildetail/goodreceiptnotedetailchecklistwiz/goodreceiptnotedetailchecklistwizlist/goodreceiptnotedetailchecklistwizlist.component';
import { GoodReceiptNoteDetailwizdetailComponent } from './goodreceiptnote/goodreceiptnotedetail/goodreceiptnotedetaildetail/goodreceiptnoteobjectinfodetailwiz/goodreceiptnoteobjectinfodetailwizlist/goodreceiptnoteobjectinfodetailwizlist.component';
import { GoodReceiptNotedocumentwizlistComponent } from './goodreceiptnote/goodreceiptnotedetail/goodreceiptnotedetaildetail/goodreceiptnotedetaildocumentwiz/goodreceiptnotedetaildocumentwizlist/goodreceiptnotedetaildocumentwizlist.component';
import { GoodReceiptNoteObjectInfoWizDetailComponent } from './goodreceiptnote/goodreceiptnotedetail/goodreceiptnotedetaildetail/goodreceiptnoteobjectinfodetailwiz/goodreceiptnoteobjectinfodetailwizdetail/goodreceiptnoteobjectinfodetailwizdetail.componnent';
import { PurchaseOrderApprovalComponent } from './purchaseorder/purchaseorderapproval/purchaseorderapproval.component';
import { VerificationApprovalComponent } from './verification/verificationapproval/verificationapproval.component';
import { ProcurementrequestApprovalComponent } from './procurementrequest/procumenetrequestapproval/procurementrequestapproval.component';
import { FinalGoodReceiptNotelistComponent } from './finalgoodreceiptnote/finalgoodreceiptnotelist/finalgoodreceiptnotelist.component';
import { FinalGoodReceiptNotedetailComponent } from './finalgoodreceiptnote/finalgoodreceiptnotedetail/finalgoodreceiptnotedetail.component';
import { CoverNoteReceivedetailComponent } from './covernotereceive/goodreceiptnotedetail/goodreceiptnotedetail.component';
import { CoverNoteReceivelistComponent } from './covernotereceive/goodreceiptnotelist/goodreceiptnotelist.component';
import { CoverNoteReceiveDetaildetailComponent } from './covernotereceive/goodreceiptnotedetail/goodreceiptnotedetaildetail/goodreceiptnotedetaildetail.component';
import { CoverNotechecklistwizlistComponent } from './covernotereceive/goodreceiptnotedetail/goodreceiptnotedetaildetail/goodreceiptnotedetailchecklistwiz/goodreceiptnotedetailchecklistwizlist/goodreceiptnotedetailchecklistwizlist.component';
import { CoverNotedocumentwizlistComponent } from './covernotereceive/goodreceiptnotedetail/goodreceiptnotedetaildetail/goodreceiptnotedetaildocumentwiz/goodreceiptnotedetaildocumentwizlist/goodreceiptnotedetaildocumentwizlist.component';
import { CoverNoteDetailwizdetailComponent } from './covernotereceive/goodreceiptnotedetail/goodreceiptnotedetaildetail/goodreceiptnoteobjectinfodetailwiz/goodreceiptnoteobjectinfodetailwizlist/goodreceiptnoteobjectinfodetailwizlist.component';
import { CoverNoteObjectInfoWizDetailComponent } from './covernotereceive/goodreceiptnotedetail/goodreceiptnotedetaildetail/goodreceiptnoteobjectinfodetailwiz/goodreceiptnoteobjectinfodetailwizdetail/goodreceiptnoteobjectinfodetailwizdetail.componnent';
import { SupplierSelectionApprovalComponent } from './supplierselection/supplierapproval/supplierselectionapproval/supplierselectionapproval.component';
import { QuotationApprovalComponent } from './supplierselection/supplierapproval/quotationapproval/quotationapproval.component';
import { QuotationVendorWizListComponent } from './quotationreview/quotationreviewdetail/quotationvendorwiz/quotationvendorwizlist/quotationvendorwizlist.component';
import { QuotationReviewVendorWizDetailComponent } from './quotationreview/quotationreviewdetail/quotationvendorwiz/quotationvendorwizdetail/quotationvendorwizdetail.component';
import { QuotationVendorApprovalDetailComponent } from './supplierselection/supplierapproval/quotationvendor/quotationvendor.component';
import { SupplierSelectiondetailWizListComponent } from './supplierselection/supplierselectiondetail/suppplierselectiondetailwiz/supplierselectiondetailwizlist/supplierselectiondetailwizlist.component';
import { SupplierSelectionDetaiwizdetailComponent } from './supplierselection/supplierselectiondetail/suppplierselectiondetailwiz/supplierselectiondetailwizdetail/supplierselectiondetailwizdetail.component';
import { SupplierSelectionDocumentWizListComponent } from './supplierselection/supplierselectiondetail/suppplierselectiondetailwiz/supplierselectiondocumentwiz/supplierselectiondocumentwizlist/supplierselectiondocumentwizlist.component';
import { GoodReceiptNoteApprovalComponent } from './goodreceiptnote/goodreceiptnoteapproval/goodreceiptnoteapproval.component';
import { GRNApprovaldetailComponent } from './goodreceiptnote/goodreceiptnoteapproval/grnapprovaldetail/grnapprovaldetail.component';
import { FinalGoodReceiptNoteRequestlistComponent } from './finalgoodreceiptnoterequest/finalgoodreceiptnoterequestlist/finalgoodreceiptnoterequestlist.component';
import { FinalGoodReceiptNoteRequestdetailComponent } from './finalgoodreceiptnoterequest/finalgoodreceiptnoterequestdetail/finalgoodreceiptnoterequestdetail.component';


export const Transaction: Routes = [{



    
    path: '',
    children: [

        
        /* Procurementrequest */
        {
            path: 'subprocurementrequest',
            component: ProcurementrequestlistComponent,
            // canActivate: [AuthGuard],
            children: [
                {
                    path: 'procurementrequestdetail', /*add*/
                    component: ProcurementrequestdetailComponent
                },
                {
                    path: 'procurementrequestdetail/:id', /*update*/
                    component: ProcurementrequestdetailComponent,
                    children: [
                        {
                            path: 'requestdocumentwizlist/:id',
                            component: RequestdocumentwizComponent
                        },
                        {
                            path: 'requestdocumentwizdetail/:id', // add
                            component: RequestdocumentwizdetailComponent
                        },
                        {
                            path: 'requestdocumentwizdetail/:id/:id2', // update
                            component: RequestdocumentwizdetailComponent
                        },
                        {
                            path: 'requestitemwizlist/:id',
                            component: RequestitemwizComponent
                        },
                        {
                            path: 'requestitemwizdetail/:id', // add
                            component: RequestitemwizdetailComponent
                        },
                        {
                            path: 'requestitemwizdetail/:id/:id2', // update
                            component: RequestitemwizdetailComponent
                        }
                    ]
                },
            ]
        },
        /* Procurementrequest */

        /* Verification */
        {
            path: 'subverification',
            component: verificationlistComponent,
            // canActivate: [AuthGuard],
            children: [
                {
                    path: 'verificationdetail', /*add*/
                    component: VerificationdetailComponent
                },
                {
                    path: 'verificationdetail/:id', /*update*/
                    component: VerificationdetailComponent,
                    children: [

                        {
                            path: 'verificationdocumentwizlist/:id',
                            component: VerificationdocumentwizComponent
                        },
                        {
                            path: 'verificationdocumentwizdetail/:id', // add
                            component: VerificationdocumentwizdetailComponent
                        },
                        {
                            path: 'verificationdocumentwizdetail/:id/:id2', // update
                            component: VerificationdocumentwizdetailComponent
                        },
                        {
                            path: 'verificationitemwizlist/:id',
                            component: VerificationitemwizComponent
                        },
                        {
                            path: 'verificationitemwizdetail/:id', // add
                            component: VerificationitemwizdetailComponent
                        },
                        {
                            path: 'verificationitemwizdetail/:id/:id2', // update
                            component: VerificationitemwizdetailComponent
                        }
                    ]
                },
            ]
        },
        /* Verification */

        /* procurement */
        {
            path: 'subprocurement',
            component: ProcurementlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'procurementdetail/:id', /*update*/
                    component: ProcurementdetailComponent,
                    children: [
                        {
                            path: 'vendorwizlist/:id',
                            component: VendorwizComponent
                        },
                    ]
                },
            ]
        },
        /* procurement */

        /* Quotation */
        {
            path: 'subquotationlist',
            component: QuotationlistComponent,
            // canActivate: [AuthGuard],
            children: [
                {
                    path: 'quotationdetail', /*add*/
                    component: QuotationdetailComponent
                },
                {
                    path: 'quotationdetail/:id', /*update*/
                    component: QuotationdetailComponent,
                    children: [

                        {
                            path: 'quotationdetailwizlist/:id',
                            component: QuotationDetailWizListComponent
                        },
                        {
                            path: 'quotationdetailwizdetail/:id', // add
                            component: QuotationDetailWizDetailComponent
                        },
                        {
                            path: 'quotationdetailwizdetail/:id/:id2', // update
                            component: QuotationDetailWizDetailComponent
                        },
                        {
                            path: 'quotationdokumentwizlist/:id',
                            component: QuotationDocumentWizListComponent
                        },
                        // {
                        //     path: 'quotationreviewdokumentwizdetail/:id', // add
                        //     component: QuotationDocumentWizDetailComponent
                        // },
                        // {
                        //     path: 'quotationreviewdokumentwizdetail/:id/:id2', // update
                        //     component: QuotationDocumentWizDetailComponent
                        // }
                    ]
                },
            ]
        },
        /* Quotation */

        /* QuotationReview */
        {
            path: 'subquotationreviewlist',
            component: QuotationReviewlistComponent,
            // canActivate: [AuthGuard],
            children: [
                {
                    path: 'quotationreviewdetail', /*add*/
                    component: QuotationReviewdetailComponent
                },
                {
                    path: 'quotationreviewdetail/:id', /*update*/
                    component: QuotationReviewdetailComponent,
                    children: [

                        {
                            path: 'quotationreviewdetailwizlist/:id',
                            component: QuotationReviewDetailWizListComponent
                        },
                        {
                            path: 'quotationreviewdetailwizdetail/:id', // add
                            component: QuotationReviewDetailWizDetailComponent
                        },
                        {
                            path: 'quotationreviewdetailwizdetail/:id/:id2', // update
                            component: QuotationReviewDetailWizDetailComponent
                        },
                        {
                            path: 'quotationreviewdokumentwizlist/:id',
                            component: QuotationReviewDocumentWizListComponent
                        },
                        {
                            path: 'quotationvendorwizlist/:id',
                            component: QuotationVendorWizListComponent
                        },
                        {
                            path: 'quotationvendorwizdetail/:id',
                            component: QuotationReviewVendorWizDetailComponent
                        },
                        {
                            path: 'quotationvendorwizdetail/:id/:id2',
                            component: QuotationReviewVendorWizDetailComponent
                        }
                        // {
                        //     path: 'quotationreviewdokumentwizdetail/:id', // add
                        //     component: QuotationReviewDocumentWizDetailComponent
                        // },
                        // {
                        //     path: 'quotationreviewdokumentwizdetail/:id/:id2', // update
                        //     component: QuotationReviewDocumentWizDetailComponent
                        // }
                    ]
                },
            ]
        },
        /* QuotationReview */

        /* SupplierSelection */
        {
            path: 'subsupplierselectionlist',
            component: SupplierSelectionlistComponent,
            // canActivate: [AuthGuard],
            children: [
                {
                    path: 'supplierselectiondetail', /*add*/
                    component: SupplierSelectiondetailComponent
                },
                {
                    path: 'supplierselectiondetail/:id', /*update*/
                    component: SupplierSelectiondetailComponent,
                    children: [
                        // {
                        //     path: 'supplierselectiondetaildetail/:id', /*add*/
                        //     component: SupplierSelectionDetaildetailComponent,
        
                        // },
                        // {
                        //     path: 'supplierselectiondetaildetail/:id/:id2', /*update*/
                        //     component: SupplierSelectionDetaildetailComponent,
        
                        // },
                        {
                            path: 'supplierselectiondetailwizlist/:id',
                            component: SupplierSelectiondetailWizListComponent
                        },
                        {
                            path: 'supplierselectiondetailwizdetail/:id/:id2',
                            component: SupplierSelectionDetaiwizdetailComponent
                        },
                        {
                            path: 'SupplierSelectionDocumentWizListComponent/:id',
                            component: SupplierSelectionDocumentWizListComponent
                        }
                    ]
                },
                
            ]
        },
        /* SupplierSelection */

        /* GoodReceiptNote */
        {
            path: 'subgoodreceiptnotelist',
            component: GoodReceiptNotelistComponent,
            // canActivate: [AuthGuard],
            children: [
                {
                    path: 'goodreceiptnotedetail', /*add*/
                    component: GoodReceiptNotedetailComponent
                },
                {
                    path: 'goodreceiptnotedetail/:id', /*update*/
                    component: GoodReceiptNotedetailComponent,
                },
                {
                    path: 'goodreceiptnotedetaildetail/:id', /*add*/
                    component: GoodReceiptNoteDetaildetailComponent,

                },
                {
                    path: 'goodreceiptnotedetaildetail/:id/:id2', /*update*/
                    component: GoodReceiptNoteDetaildetailComponent,
                    children: [
                        {
                            path: 'goodreceiptnotedetailchecklist/:id/:id2',
                            component: GoodReceiptNotechecklistwizlistComponent
                        },
                        {
                            path: 'goodreceiptnotedetailobjectinfo/:id/:id2',
                            component: GoodReceiptNoteDetailwizdetailComponent
                        },
                        {
                            path: 'goodreceiptnotedetailobjectinfodetail/:id/:id2/:id3',
                            component: GoodReceiptNoteObjectInfoWizDetailComponent
                        },
                        {
                            path: 'goodreceiptnotedetaildocument/:id/:id2',
                            component: GoodReceiptNotedocumentwizlistComponent
                        }
                    ]
                },
            ]
        },
        /* GoodReceiptNote */

        /* finalGoodReceiptNote */
        {
            path: 'subfinalgoodreceiptnote',
            component: FinalGoodReceiptNotelistComponent,
            children: [
                {
                    path: 'finalgoodreceiptnotedetail/:id', /*add*/
                    component: FinalGoodReceiptNotedetailComponent
                }
            ]

        },
        /* finalGoodReceiptNote */

        /*order request*/
        {
            path: 'suborderrequestlist',
            component: OrderRequestListComponent,
            canActivate: [AuthGuard]
        },
        /*order requeset*/

        /*purchase order*/
        {
            path: 'suborderlist',
            component: PurchaseOrderListComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'purchaseorderlist',
                    component: PurchaseOrderDetailComponent,

                }
                ,
                {
                    path: 'purchaseorderlist/:id',
                    component: PurchaseOrderDetailComponent,
                    children: [
                        {
                            path: 'purchaserorderwizlist/:id',
                            component: PurchaseOrderWizDetailListComponent
                        },
                        {
                            path: 'purchaserorderwizdetail/:id',
                            component: PurchaseOrderWizDetailDetailComponent
                        },
                        {
                            path: 'purchaserorderwizdetail/:id/:id2',
                            component: PurchaseOrderWizDetailDetailComponent
                        },
                        {
                            path: 'termofpaymentlistwiz/:id',
                            component: TermofPatmentWizListComponent
                        },
                        {
                            path: 'termofpaymentdetailwiz/:id',
                            component: TermofPaymentWizDetailComponent
                        },
                        {
                            path: 'termofpaymentdetailwiz/:id/:id2',
                            component: TermofPaymentWizDetailComponent
                        },
                    ]
                }
            ]
        },
        /*purchase order*/
        {
            path: 'purchaseorderapproval/:id',
            component: PurchaseOrderApprovalComponent
        },
        {
            path: 'supplierselectionapproval/:id',
            component: SupplierSelectionApprovalComponent
        },
        {
            path: 'quotationapproval/:id/:id2',
            component: QuotationApprovalComponent
        },
        {
            path: 'quotationvendorapproval/:id/:id2',
            component: QuotationVendorApprovalDetailComponent
        },
        {
            path: 'verificationapproval/:id',
            component: VerificationApprovalComponent
        },
        {
            path: 'procurementrequestapproval/:id',
            component: ProcurementrequestApprovalComponent
        },
        {
            path: 'goodreceiptnoteapproval/:id',
            component: GoodReceiptNoteApprovalComponent
        },
        {
            path: 'goodreceiptnoteapproval/:id/:id2',
            component: GRNApprovaldetailComponent
        },
        /* Cover Note Receive */
        {
            path: 'subdocumentreceivelist',
            component: CoverNoteReceivelistComponent,
            // canActivate: [AuthGuard],
            children: [
                {
                    path: 'covernotedetail', /*add*/
                    component: CoverNoteReceivedetailComponent
                },
                {
                    path: 'covernotedetail/:id', /*update*/
                    component: CoverNoteReceivedetailComponent,
                },
                {
                    path: 'covernotedetaildetail/:id', /*add*/
                    component: CoverNoteReceiveDetaildetailComponent,

                },
                {
                    path: 'covernotedetaildetail/:id/:id2', /*update*/
                    component: CoverNoteReceiveDetaildetailComponent,
                    children: [
                        {
                            path: 'covernotedetailchecklist/:id/:id2',
                            component: CoverNotechecklistwizlistComponent
                        },
                        {
                            path: 'covernotedetailobjectinfo/:id/:id2',
                            component: CoverNoteDetailwizdetailComponent
                        },
                        {
                            path: 'covernotedetailobjectinfodetail/:id/:id2/:id3',
                            component: CoverNoteObjectInfoWizDetailComponent
                        },
                        {
                            path: 'covernotedetaildocument/:id/:id2',
                            component: CoverNotedocumentwizlistComponent
                        }
                    ]
                },
            ]
        },
        /* Cover Note Receive */
        {
            path: 'subfinalgrnrequest',
            component: FinalGoodReceiptNoteRequestlistComponent,
            children: [
                {
                    path: 'finalgrnrequestdetail/:id',
                    component: FinalGoodReceiptNoteRequestdetailComponent
                }
            ]
        }
    ]
}];
