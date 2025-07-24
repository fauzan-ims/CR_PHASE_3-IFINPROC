import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
// tslint:disable-next-line:max-line-length
import { DALService } from '../../../DALservice.service';
import { AuthInterceptor } from '../../../auth-interceptor';
import { AuthGuard } from '../../../auth.guard';
import { SpinnerModule } from '../../spinner-ui/spinner/spinner.module';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { Transaction } from './transaction.routing';
import { ProcurementrequestdetailComponent } from './procurementrequest/procurementrequestdetail/procurementrequestdetail.component';
import { ProcurementrequestlistComponent } from './procurementrequest/procurementrequestlist/procurementrequestlist.component';
import { RequestDocumentWizModule } from './procurementrequest/procurementrequestdetail/requestdocumentwiz/requestdocumentwiz.module';
import { RequestItemWizModule } from './procurementrequest/procurementrequestdetail/requestitemwiz/requestitemwiz.module';
import { VerificationdetailComponent } from './verification/verificationdetail/verificationdetail.component';
import { verificationlistComponent } from './verification/verificationlist/verificationlist.component';
import { VerificationItemWizModule } from './verification/verificationdetail/verificationitemwiz/verificationitemwiz.module';
import { VerificationDocumentWizModule } from './verification/verificationdetail/verificationdocumentwiz/verificationdocumentwiz.module';
import { ProcurementdetailComponent } from './procurement/procurementdetail/procurementdetail.component';
import { ProcurementlistComponent } from './procurement/procurementlist/procurementlist.component';
import { VendorWizModule } from './procurement/procurementdetail/vendorwiz/vendorwiz.module';
import { SupplierSelectionlistComponent } from './supplierselection/supplierselectionlist/supplierselectionlist.component';
import { SupplierSelectiondetailComponent } from './supplierselection/supplierselectiondetail/supplierselectiondetail.component';
import { SupplierSelectionDetaildetailComponent } from './supplierselection/supplierselectiondetail/supplierselectiondetaildetail/supplierselectiondetaildetail.component';
import { QuotationlistComponent } from './quotation/quotationlist/quotationlist.component';
import { QuotationdetailComponent } from './quotation/quotationdetail/quotationdetail.component';
import { QuotationDetailWizListComponent } from './quotation/quotationdetail/quotationdetailwiz/quotationdetailwizlist/quotationdetailwizlist.component';
import { QuotationDetailWizDetailComponent } from './quotation/quotationdetail/quotationdetailwiz/quotationdetailwizdetail/quotationdetailwizdetail.component';
import { QuotationDocumentWizListComponent } from './quotation/quotationdetail/quotationdocumentwiz/quotationdocumentwizlist/quotationdocumentwizlist.component';
import { QuotationReviewlistComponent } from './quotationreview/quotationreviewlist/quotationreviewlist.component';
import { QuotationReviewdetailComponent } from './quotationreview/quotationreviewdetail/quotationreviewdetail.component';
import { QuotationReviewDetailWizListComponent } from './quotationreview/quotationreviewdetail/quotationreviewdetailwiz/quotationreviewdetailwizlist/quotationreviewdetailwizlist.component';
import { QuotationReviewDetailWizDetailComponent } from './quotationreview/quotationreviewdetail/quotationreviewdetailwiz/quotationreviewdetailwizdetail/quotationreviewdetailwizdetail.component';
import { QuotationReviewDocumentWizListComponent } from './quotationreview/quotationreviewdetail/quotationreviewdocumentwiz/quotationreviewdocumentwizlist/quotationreviewdocumentwizlist.component';
import { QuotationReviewDocumentWizDetailComponent } from './quotationreview/quotationreviewdetail/quotationreviewdocumentwiz/quotationreviewdocumentwizdetail/quotationreviewdocumentwizdetail.component';
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

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(Transaction),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule,
        RequestDocumentWizModule,
        RequestItemWizModule,
        VerificationItemWizModule,
        VerificationDocumentWizModule,
        VendorWizModule,
    ],
    declarations: [
        ProcurementrequestlistComponent,
        ProcurementrequestdetailComponent,
        VerificationdetailComponent,
        verificationlistComponent,
        ProcurementdetailComponent,
        ProcurementlistComponent,
        QuotationlistComponent,
        QuotationdetailComponent,
        QuotationDetailWizListComponent,
        QuotationDetailWizDetailComponent,
        QuotationDocumentWizListComponent,
        QuotationReviewlistComponent,
        QuotationReviewdetailComponent,
        QuotationReviewDetailWizListComponent,
        QuotationReviewDetailWizDetailComponent,
        QuotationReviewDocumentWizListComponent,
        QuotationReviewDocumentWizDetailComponent,
        SupplierSelectionlistComponent,
        SupplierSelectiondetailComponent,
        SupplierSelectionDetaildetailComponent,
        GoodReceiptNotelistComponent,
        GoodReceiptNotedetailComponent,
        GoodReceiptNoteDetaildetailComponent,
        OrderRequestListComponent,
        PurchaseOrderListComponent,
        PurchaseOrderDetailComponent,
        PurchaseOrderWizDetailListComponent,
        PurchaseOrderWizDetailDetailComponent,
        TermofPatmentWizListComponent,
        TermofPaymentWizDetailComponent,
        GoodReceiptNotechecklistwizlistComponent,
        GoodReceiptNoteDetailwizdetailComponent,
        GoodReceiptNotedocumentwizlistComponent,
        GoodReceiptNoteObjectInfoWizDetailComponent,
        PurchaseOrderApprovalComponent,
        SupplierSelectionApprovalComponent,
        VerificationApprovalComponent,
        ProcurementrequestApprovalComponent,
        FinalGoodReceiptNotelistComponent,
        FinalGoodReceiptNotedetailComponent,
        CoverNoteReceivelistComponent,
        CoverNoteReceivedetailComponent,
        CoverNoteReceiveDetaildetailComponent,
        CoverNotechecklistwizlistComponent,
        CoverNotedocumentwizlistComponent,
        CoverNoteDetailwizdetailComponent,
        CoverNoteObjectInfoWizDetailComponent,
        QuotationApprovalComponent,
        QuotationVendorWizListComponent,
        QuotationReviewVendorWizDetailComponent,
        QuotationVendorApprovalDetailComponent,
        SupplierSelectiondetailWizListComponent,
        SupplierSelectionDetaiwizdetailComponent,
        SupplierSelectionDocumentWizListComponent,
        GoodReceiptNoteApprovalComponent,
        GRNApprovaldetailComponent,
        FinalGoodReceiptNoteRequestlistComponent,
        FinalGoodReceiptNoteRequestdetailComponent
    ],
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
