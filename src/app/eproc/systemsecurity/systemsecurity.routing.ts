import { Routes } from '@angular/router';
import { AuthGuard } from '../../../auth.guard';
import { GrouproledetailComponent } from './grouprole/grouproledetail/grouproledetail.component';
import { GrouprolelistComponent } from './grouprole/grouprolelist/grouprolelist.component';
import { UserdetailComponent } from './user/userdetail/userdetail.component';
import { UserloginloglistComponent } from './user/userdetail/userloginlogwiz/userloginloglist/userloginloglist.component';
import { UsermaingroupseclistComponent } from './user/userdetail/usermaingroupsecwiz/usermaingroupseclist/usermaingroupseclist.component';
import { UsermainroleseclistComponent } from './user/userdetail/usermainrolesecwiz/usermainroleseclist/usermainroleseclist.component';
import { UserreportlistComponent } from './user/userdetail/userreportwiz/userreportlist/userreportlist.component';
import { UserlistComponent } from './user/userlist/userlist.component';


export const SystemSecurity: Routes = [{
    path: '',
    children: [
        /* user */
        {
            path: 'subuserlistsetting',
            component: UserlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'userdetail', /*add*/
                    component: UserdetailComponent
                },
                {
                    path: 'userdetail/:id', /*update*/
                    component: UserdetailComponent,
                    children: [
                        {
                            path: 'userreportlist/:id',
                            component: UserreportlistComponent
                        },
                        {
                            path: 'usermainroleseclist/:id',
                            component: UsermainroleseclistComponent
                        },
                        {
                            path: 'usermaingroupseclist/:id',
                            component: UsermaingroupseclistComponent
                        },
                        {
                            path: 'userloginloglist/:id',
                            component: UserloginloglistComponent
                        },
                    ]
                }
            ]
        },
        /* user */

        /* grouprole */
        {
            path: 'subgrouprolelistsetting',
            component: GrouprolelistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'grouproledetail', /*add*/
                    component: GrouproledetailComponent
                },
                {
                    path: 'grouproledetail/:id', /*update*/
                    component: GrouproledetailComponent
                },
            ]
        },
        /* grouprole */
    ]
}];
