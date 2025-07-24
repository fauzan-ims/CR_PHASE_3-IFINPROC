import { Routes } from '@angular/router';
import { MasterbudgetinggroupquantitywizListComponent } from './masterbudgetinggroupquantitywizlist/masterbudgetinggroupquantitywizlist.component';

export const MasterBudgetingGroupQuantityWiz: Routes = [{
    path: '',
    children: [
        {
            path: 'MasterbudgetinggroupquantitywizList/:id',
            component: MasterbudgetinggroupquantitywizListComponent
        },
    ]

}];
