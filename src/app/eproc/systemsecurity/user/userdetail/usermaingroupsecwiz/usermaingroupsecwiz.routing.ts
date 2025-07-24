import { Routes } from '@angular/router';
import { UsermaingroupseclistComponent } from './usermaingroupseclist/usermaingroupseclist.component';

export const UsermaingroupsecWizRoutes: Routes = [{
    path: '',
    children: [
        {
            path: 'usermaingroupseclist/:id',
            component: UsermaingroupseclistComponent
        }
    ]
}];
