import { Routes } from '@angular/router';
import { UsermainroleseclistComponent } from './usermainroleseclist/usermainroleseclist.component';

export const UsermainrolesecWizRoutes: Routes = [{
    path: '',
    children: [
        {
            path: 'usermainroleseclist/:id',
            component: UsermainroleseclistComponent
        }
    ]
}];
