import { Routes } from '@angular/router';
import { GrouprolewizlistComponent } from './grouprolewizlist/grouprolewizlist.component';

export const GrouproleWizRoutes: Routes = [{
    path: '',
    children: [
        {
            path: 'grouprolelist/:id',
            component: GrouprolewizlistComponent
        }
    ]
}];
