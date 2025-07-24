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
import { BackuplistComponent } from './backup/backuplist/backuplist.component';
import { LockinglistComponent } from './locking/lockinglist/lockinglist.component';
import { EodlistComponent } from './eod/eodlist/eodlist.component';
import { AuditlistComponent } from './audit/auditlist/auditlist.component';
import { ItparamlistComponent } from './itparam/itparamlist/itparamlist.component';
import { ControlPanel } from './controlpanel.routing';
import { GlobalParamlistComponent } from './globalparam/globalparamlist/globalparamlist.component';
import { GlobalParamdetailComponent } from './globalparam/globalparamdetail/globalparamdetail.component';
import { MasterjoblistComponent } from './masterjob/masterjoblist/masterjoblist.component';
import { MasterjobdetailComponent } from './masterjob/masterjobdetail/masterjobdetail.component';
import { MasterfaqlistComponent } from './masterfaq/masterfaqlist/masterfaqlist.component';
import { MasterfaqdetailComponent } from './masterfaq/masterfaqdetail/masterfaqdetail.component';
import { LockingdetailComponent } from './locking/lockingdetail/lockingdetail.component';
import { ReportLogComponent } from './sysreportlog/reportlog/reportlog.component';
import { SysErrorLoglistComponent } from './syserrorlog/syserrorloglist/syserrorloglist.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ControlPanel),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule
    ],
    declarations: [
        BackuplistComponent,
        LockinglistComponent,
        LockingdetailComponent,
        EodlistComponent,
        AuditlistComponent,
        ItparamlistComponent,
        GlobalParamlistComponent,
        GlobalParamdetailComponent,
        MasterjoblistComponent,
        MasterjobdetailComponent,
        MasterfaqlistComponent,
        MasterfaqdetailComponent,
        ReportLogComponent,
        SysErrorLoglistComponent,
    ],
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
