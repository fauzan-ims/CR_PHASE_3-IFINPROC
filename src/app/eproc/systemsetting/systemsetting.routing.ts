import { Routes } from '@angular/router';
// tslint:disable-next-line:max-line-length
import { AuthGuard } from '../../../auth.guard';
import { GeneralsubcodedetailComponent } from './generalcode/generalcodedetail/generalsubcode/generalsubcodedetail/generalsubcodedetail.component';
import { GeneralcodelistComponent } from './generalcode/generalcodelist/generalcodelist.component';
import { GeneralcodedetailComponent } from './generalcode/generalcodedetail/generalcodedetail.component';
import { MastertaskuserlistComponent } from './mastertaskuser/mastertaskuserlist/mastertaskuserlist.component';
import { MastertaskuserdetailComponent } from './mastertaskuser/mastertaskuserdetail/mastertaskuserdetail.component';
import { MasterWarehouselistComponent } from './masterwarehouse/masterwarehouselist/masterwarehouselist.component';
import { MasterWarehousedetailComponent } from './masterwarehouse/masterwarehousedetail/masterwarehousedetail.component';
import { MasterWarehousedetailwizlistComponent } from './masterwarehouse/masterwarehousedetail/masterwarehousedetailwiz/masterwarehousedetailwizlist/masterwarehousedetailwizlist.component';
import { MasterWarehousedetailwizdetailComponent } from './masterwarehouse/masterwarehousedetail/masterwarehousedetailwiz/masterwarehousedetailwizdetail/masterwarehousedetailwizdetail.component';
import { MasterdepartmentlistComponent } from './masterdepartment/masterdepartmentlist/masterdepartmentlist.component';
import { MasterdepartmentdetailComponent } from './masterdepartment/masterdepartmentdetail/masterdepartmentdetail.component';
import { MasterdivisionlistComponent } from './masterdivision/masterdivisionlist/masterdivisionlist.component';
import { MasterdivisiondetailComponent } from './masterdivision/masterdivisiondetail/masterdivisiondetail.component';
import { MastersubdepartmentlistComponent } from './mastersubdepartment/mastersubdepartment/mastersubdepartmentlist.component';
import { MastersubdepartmentdetailComponent } from './mastersubdepartment/mastersubdepartmentdetail/mastersubdepartmentdetail.component';
import { MasterunitlistComponent } from './masterunit/masterunitlist/masterunitlist.component';
import { MasterunitdetailComponent } from './masterunit/masterunitdetail/masterunitdetail.component';
import { MasterdashboardlistComponent } from './masterdashboard/masterdashboardlist/masterdashboardlist.component';
import { MasterdashboarddetailComponent } from './masterdashboard/masterdashboarddetail/masterdashboarddetail.component';
import { MasterdashboarduserlistComponent } from './masterdashboarduser/masterdashboarduserlist/masterdashboarduserlist.component';
import { MasterdashboarduserdetailComponent } from './masterdashboarduser/masterdashboarduserdatail/masterdashboarduserdetail.component';
import { MasterbudgetinggroupListComponent } from './masterbudgetinggroup/masterbudgetinggrouplist/masterbudgetinggrouplist.component';
import { MasterbudgetinggroupDetailComponent } from './masterbudgetinggroup/masterbudgetinggroupdetail/masterbudgetinggroupdetail.component';
import { MasterbudgetinggroupquantitywizListComponent } from './masterbudgetinggroup/masterbudgetinggroupdetail/masterbudgetinggroupquantitywiz/masterbudgetinggroupquantitywizlist/masterbudgetinggroupquantitywizlist.component';
import { MasterbudgetinggroupamountwizListComponent } from './masterbudgetinggroup/masterbudgetinggroupdetail/masterbudgetinggroupamountwiz/masterbudgetinggroupamountwizlist/masterbudgetinggroupamountwizlist.component';
import { ParameterlistComponent } from './parameter/parameterlist/parameterlist.component';
import { ParameterdetailComponent } from './parameter/parameterdetail/parameterdetail.component';
import { ParametertransactionlistComponent } from './parametertransaction/parametertransactionlist/parametertransactionlist.component';
import { ParametertransactiondetailComponent } from './parametertransaction/parametertransactiondetail/parametertransactiondetail.component';
import { ParametertransactiondetaildetailComponent } from './parametertransaction/parametertransactiondetail/parametertransactiondetaildetail/parametertransactiondetaildetail.component';
import { GllinklistComponent } from './gllink/gllinklist/gllinklist.component';
import { GllinkdetailComponent } from './gllink/gllinkdetail/gllinkdetail.component';
import { ReportlistComponent } from './submasterreport/reportlist/reportlist.component';
import { ReportdetailComponent } from './submasterreport/reportdetail/reportdetail.component';
import { MasteritemgrouplistComponent } from './masteritemgroup/masteritemgrouplist/masteritemgrouplist.component';
import { MasteritemgroupdetailComponent } from './masteritemgroup/masteritemgroupdetail/masteritemgroupdetail.component';
import { MasteritemgroupgldetailComponent } from './masteritemgroup/masteritemgroupdetail/masteritemgroupgldetail/masteritemgroupgldetail.component';
import { DimensionlistComponent } from './dimension/dimensionlist/dimensionlist.component';
import { DimensiondetailComponent } from './dimension/dimensiondetail/dimensiondetail.component';
import { DimensiondetaildetailComponent } from './dimension/dimensiondetail/dimensiondetaildetail/dimensiondetaildetail.component';
import { MasterapprovallistComponent } from './masterapproval/masterapprovallist/masterapprovallist.component';
import { MasterapprovaldetailComponent } from './masterapproval/masterapprovaldetail/masterapprovaldetail.component';

export const SystemSetting: Routes = [{
    path: '',
    children: [

        /* generalcode */
        {
            path: 'subgeneralcodelistsetting',
            component: GeneralcodelistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'generalcodedetail', /*add*/
                    component: GeneralcodedetailComponent
                },
                {
                    path: 'generalcodedetail/:id', /*update*/
                    component: GeneralcodedetailComponent
                },
                {
                    path: 'generalsubcodedetail/:id', /*add*/
                    component: GeneralsubcodedetailComponent
                },
                {
                    path: 'generalsubcodedetail/:id/:id2', /*update*/
                    component: GeneralsubcodedetailComponent
                },
            ]
        },
        /* generalcode */

         /* master task user */
        {
            path: 'submastertaskuserlist',
            component: MastertaskuserlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'mastertaskuserdetail', /*add*/
                    component: MastertaskuserdetailComponent
                },
                {
                    path: 'mastertaskuserdetail/:id', /*update*/
                    component: MastertaskuserdetailComponent
                }
            ]
        },
        /* master task user */


         /* masterwarehouse */
         {
            path: 'submasterwarehouselist',
            component: MasterWarehouselistComponent,
            // canActivate: [AuthGuard],
            children: [
                {
                    path: 'masterwarehousedetail', /*add*/
                    component: MasterWarehousedetailComponent
                },
                {
                    path: 'masterwarehousedetail/:id', /*update*/
                    component: MasterWarehousedetailComponent,
                    children: [

                        {
                            path: 'masterwarehousedetailwizlist/:id',
                            component: MasterWarehousedetailwizlistComponent
                        },
                        {
                            path: 'masterwarehousedetailwizdetail/:id', // add
                            component: MasterWarehousedetailwizdetailComponent
                        },
                        {
                            path: 'masterwarehousedetailwizdetail/:id/:id2', // update
                            component: MasterWarehousedetailwizdetailComponent
                        },
                    ]
                },
            ]
        },
        /* masterwarehouse */
        {
            path: 'submasterdepartment',
            component: MasterdepartmentlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'masterdepartmentdetail',
                    component: MasterdepartmentdetailComponent
                },
                {
                    path: 'masterdepartmentdetail/:id',
                    component: MasterdepartmentdetailComponent
                }
            ]
        },
        {
            path: 'submasterdivision',
            component: MasterdivisionlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'masterdivisiondetail',
                    component: MasterdivisiondetailComponent
                },
                {
                    path: 'masterdivisiondetail/:id',
                    component: MasterdivisiondetailComponent
                }
            ]
        },
        {
            path: 'submastersubdepartment',
            component: MastersubdepartmentlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'mastersubdepartmentdetail',
                    component: MastersubdepartmentdetailComponent
                },
                {
                    path: 'mastersubdepartmentdetail/:id',
                    component: MastersubdepartmentdetailComponent
                }
            ]
        },
        {
            path: 'submasterunit',
            component: MasterunitlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'masterunitdetail',
                    component: MasterunitdetailComponent
                },
                {
                    path: 'masterunitdetail/:id',
                    component: MasterunitdetailComponent
                }
            ]
        },
        {
            path: 'submasterdashboardlist',
            component: MasterdashboardlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'masterdashboarddetail',
                    component: MasterdashboarddetailComponent
                },
                {
                    path: 'masterdashboarddetail/:id',
                    component: MasterdashboarddetailComponent
                }
            ]
        },
        {
            path: 'submasterdashboarduserlist',
            component: MasterdashboarduserlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'masterdashboarduserdetail',
                    component: MasterdashboarduserdetailComponent
                },
                {
                    path: 'masterdashboarduserdetail/:id',
                    component: MasterdashboarduserdetailComponent
                }
            ]
        },
        /* master budgeting group */
        {
            path: 'submasterbudgetinggrouplist',
            component: MasterbudgetinggroupListComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'masterbudgetinggroupdetail', /*add*/
                    component: MasterbudgetinggroupDetailComponent
                },
                {
                    path: 'masterbudgetinggroupdetail/:id', /*update*/
                    component: MasterbudgetinggroupDetailComponent,
                    children: [
                        {
                            path: 'masterbudgetinggroupquantitywizlist/:id', /*add*/
                            component: MasterbudgetinggroupquantitywizListComponent
                        },
                        {
                            path: 'masterbudgetinggroupamountwizlist/:id', /*add*/
                            component: MasterbudgetinggroupamountwizListComponent
                        }
                    ]
                }
            ]
        },
        /* master budgeting group */
        {
            path: 'parameterlist',
            component: ParameterlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'parameterdetail', /*add*/
                    component: ParameterdetailComponent
                },
                {
                    path: 'parameterdetail/:id', /*update*/
                    component: ParameterdetailComponent
                },
            ]
        },

        {
            path: 'parametertransactionlist',
            component: ParametertransactionlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'parametertransactiondetail', /*add*/
                    component: ParametertransactiondetailComponent
                },
                {
                    path: 'parametertransactiondetail/:id', /*update*/
                    component: ParametertransactiondetailComponent
                },
                {
                    path: 'parametertransactiondetaildetail/:id', /*add*/
                    component: ParametertransactiondetaildetailComponent
                },
                {
                    path: 'parametertransactiondetaildetail/:id/:id2', /*update*/
                    component: ParametertransactiondetaildetailComponent
                },
            ]
        },

        {
            path: 'subgllinklist',
            component: GllinklistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'gllinkdetail',
                    component: GllinkdetailComponent
                },
                {
                    path: 'gllinkdetail/:id',
                    component: GllinkdetailComponent
                }
            ]
        },

        //report
        {
            path: 'subreportlist',
            component: ReportlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'reportsdetail', /*add*/
                    component: ReportdetailComponent
                },
                {
                    path: 'reportsdetail/:id', /*update*/
                    component: ReportdetailComponent
                },
            ]
        },
        //report

        /* master_item_group */
        {
            path: 'submasteritemgroup',
            component: MasteritemgrouplistComponent,
            // canActivate: [AuthGuard],
            children: [
                {
                    path: 'masteritemgroupdetail', /*add*/
                    component: MasteritemgroupdetailComponent
                },
                {
                    path: 'masteritemgroupdetail/:id', /*update*/
                    component: MasteritemgroupdetailComponent
                },
                {
                    path: 'masteritemgldetail/:id', /*add*/
                    component: MasteritemgroupgldetailComponent
                },
                {
                    path: 'masteritemgldetail/:id/:id2', /*update*/
                    component: MasteritemgroupgldetailComponent
                },
            ]
        },
        /* master_item_group */
        {
            path: 'subdimensionlist',
            component: DimensionlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'dimensiondetail',
                    component: DimensiondetailComponent
                },
                {
                    path: 'dimensiondetail/:id',
                    component: DimensiondetailComponent
                },
                {
                    path: 'dimensiondetaildetail/:id', /*add*/
                    component: DimensiondetaildetailComponent
                },
                {
                    path: 'dimensiondetaildetail/:id/:id2', /*update*/
                    component: DimensiondetaildetailComponent
                },
            ]
        },
        {
            path: 'submasterapprovallist',
            component: MasterapprovallistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'masterapprovaldetail',
                    component: MasterapprovaldetailComponent
                },
                {
                    path: 'masterapprovaldetail/:id',
                    component: MasterapprovaldetailComponent
                }
            ]
        }
    ]
}];
