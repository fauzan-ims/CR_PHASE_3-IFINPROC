import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../../../../DALservice.service';
import { SpinnerModule } from '../../../../../spinner-ui/spinner/spinner.module';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { MasterBudgetingGroupAmountWiz } from './masterbudgetinggroupamountwiz.routing';
import { MasterbudgetinggroupamountwizListComponent } from './masterbudgetinggroupamountwizlist/masterbudgetinggroupamountwizlist.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(MasterBudgetingGroupAmountWiz),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule,
    ],
    declarations: [
        MasterbudgetinggroupamountwizListComponent,
    ],
    providers: [
        DALService
    ]
})

export class MasterBudgetingGroupAmountWizModule { }
