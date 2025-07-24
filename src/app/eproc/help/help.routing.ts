import { Routes } from '@angular/router';
import { HelplistComponent } from './help/helplist/helplist.component';

import { AuthGuard } from '../../../auth.guard';

export const Report: Routes = [{
    path: '',
    children: [

        {
            path: 'subhelplist',
            component: HelplistComponent,         
            canActivate: [AuthGuard],
        },
    ]

}];
