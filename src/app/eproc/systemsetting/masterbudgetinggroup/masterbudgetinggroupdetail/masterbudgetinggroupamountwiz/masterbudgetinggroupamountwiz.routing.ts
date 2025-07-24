import { Routes } from '@angular/router';
import { MasterbudgetinggroupamountwizListComponent } from './masterbudgetinggroupamountwizlist/masterbudgetinggroupamountwizlist.component';

export const MasterBudgetingGroupAmountWiz: Routes = [{
    path: '',
    children: [
        {
            path: 'MasterbudgetinggroupamountwizList/:id',
            component: MasterbudgetinggroupamountwizListComponent
        },
    ]

}];
