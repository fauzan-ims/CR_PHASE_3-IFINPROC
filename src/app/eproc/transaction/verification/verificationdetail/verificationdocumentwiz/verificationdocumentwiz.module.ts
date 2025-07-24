import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../../../../DALservice.service';
import { SpinnerModule } from '../../../../../spinner-ui/spinner/spinner.module';
import { VerificationdocumentwizdetailComponent } from './verificationdocumentwizdetail/verificationdocumentwizdetail.component';
import { VerificationdocumentwizComponent } from './verificationdocumentwizlist/verificationdocumentwizlist.component';
import { VerificationDocumentWiz } from './verificationdocumentwiz.routing';
   
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(VerificationDocumentWiz),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule
    ],
    declarations: [
        VerificationdocumentwizdetailComponent,
        VerificationdocumentwizComponent
    ],
    providers: [
        DALService
    ]
})

export class VerificationDocumentWizModule { }
