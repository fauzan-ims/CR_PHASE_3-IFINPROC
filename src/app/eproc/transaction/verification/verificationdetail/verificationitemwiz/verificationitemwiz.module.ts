import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../../../../DALservice.service';
import { SpinnerModule } from '../../../../../spinner-ui/spinner/spinner.module';
 import { VerificationitemwizdetailComponent } from './verificationitemwizdetail/verificationitemwizdetail.component';
import { VerificationitemwizComponent } from './verificationitemwizlist/verificationitemwizlist.component';
import { VerificationItemWiz } from './verificationitemwiz.routing';
  
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(VerificationItemWiz),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule
    ],
    declarations: [
        VerificationitemwizComponent,
        VerificationitemwizdetailComponent
    ],
    providers: [
        DALService
    ]
})

export class VerificationItemWizModule { }
