import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { CompanyInformationSetting } from './companyinformation.routing';
// tslint:disable-next-line:max-line-length
import { DALService } from '../../../DALservice.service';
import { AuthInterceptor } from '../../../auth-interceptor';
import { AuthGuard } from '../../../auth.guard';
import { SpinnerModule } from '../../spinner-ui/spinner/spinner.module';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { CompanyuserdetailComponent } from './companyuser/companyuserdetail/companyuserdetail.component';
import { GrouproleWizModule } from './companyuser/companyuserdetail/grouprolewizlist/grouprolewiz.module';
import { LoginlogWizModule } from './companyuser/companyuserdetail/loginlogwiz/loginlogwiz.module';
import { CompanyuserlistComponent } from './companyuser/companyuserlist/companyuserlist.component';
import { RenewsubslistComponent } from './renewsubs/renewsubslist/renewsubslist.component';
import { TargetSalesWizModule } from './companyuser/companyuserdetail/targetsalewizlist/targetsalewizlist.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(CompanyInformationSetting),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule,
        GrouproleWizModule,
        LoginlogWizModule,
        TargetSalesWizModule
    ],
    declarations: [
        RenewsubslistComponent,

        CompanyuserlistComponent,
        CompanyuserdetailComponent

    ],
    providers: [
       DALService,
       { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
       , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
