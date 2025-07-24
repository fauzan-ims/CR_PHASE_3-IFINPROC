import { Routes } from '@angular/router';
// tslint:disable-next-line:max-line-length
import { AuthGuard } from '../../../auth.guard';
import { BackuplistComponent } from './backup/backuplist/backuplist.component';
import { LockinglistComponent } from './locking/lockinglist/lockinglist.component';
import { EodlistComponent } from './eod/eodlist/eodlist.component';
import { AuditlistComponent } from './audit/auditlist/auditlist.component';
import { ItparamlistComponent } from './itparam/itparamlist/itparamlist.component';
import { GlobalParamlistComponent } from './globalparam/globalparamlist/globalparamlist.component';
import { GlobalParamdetailComponent } from './globalparam/globalparamdetail/globalparamdetail.component';
import { MasterjoblistComponent } from './masterjob/masterjoblist/masterjoblist.component';
import { MasterjobdetailComponent } from './masterjob/masterjobdetail/masterjobdetail.component';
import { MasterfaqlistComponent } from './masterfaq/masterfaqlist/masterfaqlist.component';
import { MasterfaqdetailComponent } from './masterfaq/masterfaqdetail/masterfaqdetail.component';
import { ReportLogComponent } from './sysreportlog/reportlog/reportlog.component';
import { SysErrorLoglistComponent } from './syserrorlog/syserrorloglist/syserrorloglist.component';
import { LockingdetailComponent } from './locking/lockingdetail/lockingdetail.component';


export const ControlPanel: Routes = [{
    path: '',
    children: [

        {
            path: 'subbackuplist',
            component: BackuplistComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'sublockinglist',
            component: LockinglistComponent,
            canActivate: [AuthGuard],
            children : [
                {
                    path: 'lockingdetail',
                    component: LockingdetailComponent
                },
                {
                    path: 'lockingdetail/:id',
                    component: LockingdetailComponent

                }
            ]
        },
        {
            path: 'subeodlist',
            component: EodlistComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'subauditlist',
            component: AuditlistComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'subitparamlist',
            component: ItparamlistComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'subreportloglist',
            component: ReportLogComponent,
        },
        {
            path: 'subsyserrorloglist',
            component: SysErrorLoglistComponent,
        },
        //global param
        {
            path: 'subglobalparamlist',
            component: GlobalParamlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'globalparamdetail', /*add*/
                    component: GlobalParamdetailComponent
                },
                {
                    path: 'globalparamdetail/:id', /*update*/
                    component: GlobalParamdetailComponent
                },
            ]
        },

        //job taasklist
        {
            path: 'subjobtasklist',
            component: MasterjoblistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'masterjobdetail', /*add*/
                    component: MasterjobdetailComponent
                },
                {
                    path: 'masterjobdetail/:id', /*update*/
                    component: MasterjobdetailComponent
                },
            ]
        },
        {
            path: 'submasterfaqlist',
            component: MasterfaqlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'masterfaqdetail', /*add */
                    component: MasterfaqdetailComponent
                },
                {
                    path: 'masterfaqdetail/:id', /*update */
                    component: MasterfaqdetailComponent
                }, 
            ]
        },
    ]

}];
