import { Routes } from '@angular/router';
import { UserreportlistComponent } from './userreportlist/userreportlist.component';

export const UserreportWizRoutes: Routes = [{
    path: '',
    children: [
        {
            path: 'userreportlist/:id',
            component: UserreportlistComponent
        }
    ]
}];
