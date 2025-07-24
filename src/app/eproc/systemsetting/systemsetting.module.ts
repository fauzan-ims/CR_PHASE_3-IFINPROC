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
import { SystemSetting } from './systemsetting.routing';
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
import { MasterBudgetingGroupQuantityWizModule } from './masterbudgetinggroup/masterbudgetinggroupdetail/masterbudgetinggroupquantitywiz/masterbudgetinggroupquantitywiz.module';
import { MasterBudgetingGroupAmountWizModule } from './masterbudgetinggroup/masterbudgetinggroupdetail/masterbudgetinggroupamountwiz/masterbudgetinggroupamountwiz.module';
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

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(SystemSetting),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule,
        MasterBudgetingGroupQuantityWizModule,
        MasterBudgetingGroupAmountWizModule
    ],
    declarations: [
        GeneralcodelistComponent,
        GeneralcodedetailComponent,
        GeneralsubcodedetailComponent,
        MastertaskuserlistComponent,
        MastertaskuserdetailComponent,
        MasterWarehouselistComponent,
        MasterWarehousedetailComponent,
        MasterWarehousedetailwizlistComponent,
        MasterWarehousedetailwizdetailComponent,
        MasterdepartmentlistComponent,
        MasterdepartmentdetailComponent,
        MasterdivisionlistComponent,
        MasterdivisiondetailComponent,
        MastersubdepartmentlistComponent,
        MastersubdepartmentdetailComponent,
        MasterunitlistComponent,
        MasterunitdetailComponent,
        MasterdashboardlistComponent,
        MasterdashboarddetailComponent,
        MasterdashboarduserlistComponent,
        MasterdashboarduserdetailComponent,
        MasterbudgetinggroupListComponent,
        MasterbudgetinggroupDetailComponent,
        ParameterlistComponent,
        ParameterdetailComponent,
        ParametertransactionlistComponent,
        ParametertransactiondetailComponent,
        ParametertransactiondetaildetailComponent,
        GllinklistComponent,
        GllinkdetailComponent,
        ReportlistComponent,
        ReportdetailComponent,
        MasteritemgrouplistComponent,
        MasteritemgroupdetailComponent,
        MasteritemgroupgldetailComponent,
        DimensionlistComponent,
        DimensiondetailComponent,
        DimensiondetaildetailComponent,
        MasterapprovallistComponent,
        MasterapprovaldetailComponent
    ],
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
