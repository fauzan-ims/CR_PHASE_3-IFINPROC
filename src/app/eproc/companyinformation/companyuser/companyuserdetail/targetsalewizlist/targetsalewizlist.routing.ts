import { Routes } from '@angular/router';
import { TargetsalewizdetailComponent } from './targetsalewizdetail/targetsalewizdetail.component';
import { TargetsalewizlistComponent } from './targetsalewizlist/targetsalewizlist.component';

export const TargetSaleWizRoutes: Routes = [{
    path: '',
    children: [
        {
            path: 'targetsalewizlist/:id',
            component: TargetsalewizlistComponent,
            children: [
                {
                    path: 'targetsalewizdetail/:id', /*add*/
                    component: TargetsalewizdetailComponent
                },
                {
                    path: 'targetsalewizdetail/:id/:id2', /*update*/
                    component: TargetsalewizdetailComponent
                }
            ]
        }
    ]
}];
