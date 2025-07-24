import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../DALservice.service';
import { SystemSecurity } from './systemsecurity.routing';
import { AuthInterceptor } from '../../../auth-interceptor';
import { AuthGuard } from '../../../auth.guard';
import { SpinnerModule } from '../../spinner-ui/spinner/spinner.module';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { UserLoginLogWizModule } from './user/userdetail/userloginlogwiz/userloginlogwiz.module';
import { UserMainGroupSecWizModule } from './user/userdetail/usermaingroupsecwiz/usermaingroupsecwiz.module';
import { UserMainRoleSecWizModule } from './user/userdetail/usermainrolesecwiz/usermainrolesecwiz.module';
import { UserReportWizModule } from './user/userdetail/userreportwiz/userreportwiz.module';
import { GrouproledetailComponent } from './grouprole/grouproledetail/grouproledetail.component';
import { GrouprolelistComponent } from './grouprole/grouprolelist/grouprolelist.component';
import { UserdetailComponent } from './user/userdetail/userdetail.component';
import { UserlistComponent } from './user/userlist/userlist.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(SystemSecurity),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule,
        UserReportWizModule,
        UserMainRoleSecWizModule,
        UserMainGroupSecWizModule,
        UserLoginLogWizModule
        
    ],
    declarations: [
        GrouprolelistComponent,
        GrouproledetailComponent,

        UserlistComponent,
        UserdetailComponent
    ],
    providers: [
       DALService,
       { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
       , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule {}
