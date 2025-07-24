import { Routes } from '@angular/router';
// tslint:disable-next-line:max-line-length
import { AuthGuard } from '../../../auth.guard';
import { CompanyuserdetailComponent } from './companyuser/companyuserdetail/companyuserdetail.component';
import { GrouprolewizlistComponent } from './companyuser/companyuserdetail/grouprolewizlist/grouprolewizlist/grouprolewizlist.component';
import { LoginlogwizlistComponent } from './companyuser/companyuserdetail/loginlogwiz/loginlogwizlist/loginlogwizlist.component';
import { TargetsalewizdetailComponent } from './companyuser/companyuserdetail/targetsalewizlist/targetsalewizdetail/targetsalewizdetail.component';
import { TargetsalewizlistComponent } from './companyuser/companyuserdetail/targetsalewizlist/targetsalewizlist/targetsalewizlist.component';
import { CompanyuserlistComponent } from './companyuser/companyuserlist/companyuserlist.component';
import { RenewsubslistComponent } from './renewsubs/renewsubslist/renewsubslist.component';

export const CompanyInformationSetting: Routes = [{
    path: '',
    children: [
       
        /* Renew Subscription */
        {
            path: 'subrenewsubscription',
            component: RenewsubslistComponent,
            canActivate: [AuthGuard]
        },
        /* Renew Subscription */

        /* Company User */
        {
            path: 'subcompanyuserlist',
            component: CompanyuserlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'companyuserdetail', /*add*/
                    component: CompanyuserdetailComponent
                },
                {
                    path: 'companyuserdetail/:id', /*update*/
                    component: CompanyuserdetailComponent,
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
                                },
                            ]
                        },
                        {
                            path: 'grouprolewizlist/:id',
                            component: GrouprolewizlistComponent
                        },
                        {
                            path: 'loginlogwizlist/:id',
                            component: LoginlogwizlistComponent
                        }
                    ]
                }
            ]
        },
        /* Company User */

    ]
}];
