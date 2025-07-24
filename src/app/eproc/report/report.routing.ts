import { Routes } from '@angular/router';
import { ReportlistComponent } from './reports/reportlist/reportlist.component';

import { AuthGuard } from '../../../auth.guard';
import { ReportmonitoringpolistComponent } from './reports/reportmonitoringpolist/reportmonitoringpolist.component';
import { ReportsettinglistComponent } from './reportsettinglist/reportsettinglist.component';

export const Report: Routes = [{
    path: '',
    children: [

        {
            path: 'subreportmanagementlist',
            component: ReportlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'reportmonitoringpolist/:id/:page',
                    component: ReportmonitoringpolistComponent
                },
            ]
        },

        {
            path: 'subreporttransactionlist',
            component: ReportlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'reportmonitoringpolist/:id/:page',
                    component: ReportmonitoringpolistComponent
                },
            ]
        },

        {
            path: 'subreportsetting',
            component: ReportsettinglistComponent,
            canActivate: [AuthGuard],
        },
        
    ]

}];
