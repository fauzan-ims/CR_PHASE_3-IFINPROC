import { NgModule, ErrorHandler } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../DALservice.service';
import { AccountPayable } from './accountpayable.routing';
import { AuthInterceptor } from '../../../auth-interceptor';
import { AuthGuard } from '../../../auth.guard';
import { SpinnerModule } from '../../spinner-ui/spinner/spinner.module';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { InvoiceRegistrationlistComponent } from './invoiceregistration/invoiceregistrationlist/invoiceregistrationlist.component';
import { InvoiceRegistrationdetailComponent } from './invoiceregistration/invoiceregistrationdetail/invoiceregistrationdetail.component';
import { InvoiceRegistrationDetailWizListComponent } from './invoiceregistration/invoiceregistrationdetail/invoiceregistrationdetailwiz/invoiceregistrationdetailwizlist/invoiceregistrationdetailwizlist.component';
import { InvoiceRegistrationDetailWizDetailComponent } from './invoiceregistration/invoiceregistrationdetail/invoiceregistrationdetailwiz/invoiceregistrationdetailwizdetail/invoiceregistrationdetailwizdetail.component';
import { PaymentSelectionlistComponent } from './paymentselection/paymentselectionlist/paymentselectionlist.component';
import { PaymentRequestlistComponent } from './paymentrequest/paymentrequestlist/paymentrequestlist.component';
import { PaymentRequestdetailComponent } from './paymentrequest/paymentrequestdetail/paymentrequestdetail.component';
import { PaymentRequestDetaildetailComponent } from './paymentrequest/paymentrequestdetail/paymentrequestdetaildetail/paymentrequestdetaildetail.component';
import { PaymentRequestApprovalComponent } from './paymentrequest/paymentrequestapproval/paymentrequestapproval.component';
//(+) Ari 2024-03-28
import { InvoiceRegistrationApprovalComponent } from './paymentrequest/invoiceregistrationapproval/invoiceregistrationapproval.component';
import { InvoiceRegistrationApprovalItemComponent } from './paymentrequest/invoiceregistrationapproval/invoiceregistrationapprovalitemlist/invoiceregistrationapprovalitemlist.component';
import { MonitoringAplistComponent } from './monitoringap/monitoringaplist/monitoringaplist.component';
//(+) Ari 2024-03-28

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(AccountPayable),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule
    ],
    declarations: [
        InvoiceRegistrationlistComponent,
        InvoiceRegistrationdetailComponent,
        InvoiceRegistrationDetailWizListComponent,
        InvoiceRegistrationDetailWizDetailComponent,
        PaymentSelectionlistComponent,
        PaymentRequestlistComponent,
        PaymentRequestdetailComponent,
        PaymentRequestDetaildetailComponent,
        PaymentRequestApprovalComponent,
        //(+) Ari 2024-03-28
        InvoiceRegistrationApprovalComponent,
        InvoiceRegistrationApprovalItemComponent,
        //(+) Ari 2024-03-28
        MonitoringAplistComponent
    ],
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
