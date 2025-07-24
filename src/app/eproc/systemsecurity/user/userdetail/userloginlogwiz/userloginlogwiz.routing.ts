import { Routes } from '@angular/router';
import { UserloginloglistComponent } from './userloginloglist/userloginloglist.component';

export const UserloginlogWizRoutes: Routes = [{
    path: '',
    children: [
        {
            path: 'userloginloglist/:id',
            component: UserloginloglistComponent
        }, {
            path: 'userloginloglist/:fromDate/:toDate',
            component: UserloginloglistComponent
        }, {
            path: 'userloginlogdetail/:id',
            component: UserloginloglistComponent
        }
    ]
}];
