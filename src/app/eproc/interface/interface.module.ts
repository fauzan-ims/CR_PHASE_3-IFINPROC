import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { Interface } from './interface.routing';
import { DALService } from '../../../DALservice.service';
import { AuthInterceptor } from '../../../auth-interceptor';
import { AuthGuard } from '../../../auth.guard';
import { SpinnerModule } from '../../spinner-ui/spinner/spinner.module';
import { AngularMyDatePickerModule } from 'angular-mydatepicker'; 
import { BiddingrequestlistComponent } from './biddingrequest/biddingrequestlist/biddingrequestlist.component';
import { BiddingRequestdetailComponent } from './biddingrequest/biddingrequestdetail/biddingrequestdetail.component';
import { BiddingRequestDetailWizModule } from './biddingrequest/biddingrequestdetail/biddingrequestdetailwiz/biddingrequestdetailwiz.module';
import { AssetlistComponent } from './asset/assetlist/assetlist.component';
import { AssetdetailComponent } from './asset/assetdetail/assetdetail.component';
import { JournaltransactionlistComponent } from './journaltransaction/journaltransactionlist/journaltransactionlist.component';
import { JournaltransactiondetailComponent } from './journaltransaction/journaltransactiondetail/journaltransactiondetail.component';
import { InterfacePaymentRequestlistComponent } from './paymentrequest/paymentrequestlist/paymentrequestlist.component';
import { InterfacePaymentrequestdetailComponent } from './paymentrequest/paymentrequestdetail/paymentrequestdetail.component';
import { interfaceapprovallistComponent } from './interfaceapproval/interfaceapprovallist/interfaceapprovallist.component';
import { InterfaceapprovaldetailComponent } from './interfaceapproval/interfaceapprovaldetail/interfaceapprovaldetail.component';
import { InterfaceHandoverRequestlistComponent } from './interfacehandoverrequest/interfacehandoverrequestlist.component';
import { InterfaceAdditionalInvoiceRequestlistComponent } from './interfaceadditionalinvoicerequest/interfaceadditionalinvoicerequest.component';
import { InterfaceExpenseAssetListlistComponent } from './expenseasset/expenseassetlist/expenseassetlist.component';
import { InterfaceDocumentPendinglistComponent } from './interfacedocumentpending/interfacedocumentpendinglist/interfacedocumentpendinglist.component';
import { DocumentPendingdetailComponent } from './interfacedocumentpending/interfacedocumentpendingdetail/interfacedocumentpendingdetail.component';
import { InterfaceAdjustmentlistComponent } from './interfaceadjustment/interfaceadjustmentlist/interfaceadjustmentlist.component';
 
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(Interface),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule,
        BiddingRequestDetailWizModule
    ],
    declarations: [ 
        BiddingrequestlistComponent,
        BiddingRequestdetailComponent,
        AssetlistComponent,
        AssetdetailComponent,
        JournaltransactionlistComponent,
        JournaltransactiondetailComponent,
        InterfacePaymentRequestlistComponent,
        InterfacePaymentrequestdetailComponent,
        interfaceapprovallistComponent,
        InterfaceapprovaldetailComponent,
        InterfaceHandoverRequestlistComponent,
        InterfaceAdditionalInvoiceRequestlistComponent,
        InterfaceExpenseAssetListlistComponent,
        InterfaceDocumentPendinglistComponent,
        DocumentPendingdetailComponent,
        InterfaceAdjustmentlistComponent
    ],
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
