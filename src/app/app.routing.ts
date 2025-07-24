import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { IframelayoutComponent } from './layouts/iframe/iframe-layout.component';

export const AppRoutes: Routes = [
{
    path: '',
    redirectTo: 'main',
    // redirectTo: '/pages/login',
    pathMatch: 'full',
}, {
    path: '',
    component: AdminLayoutComponent,
    children: [{
        path: '',
        loadChildren: './dashboard/dashboard.module#DashboardModule',
        canActivate: []
    },
    {
        path: '',
        loadChildren: './unauthorized/unauthorized.module#UnauthorizedModule'
    },
    
    {
        path: '',
        loadChildren: './userpage/user.module#UserModule'
    },  
    {
        path: 'companyinformation',
        loadChildren: './eproc/companyinformation/companyinformation.module#SettingModule'
    },  
    {
        path: 'interface',
        loadChildren: './eproc/interface/interface.module#SettingModule'
    }, 
    {
        path: 'systemsecurity',
        loadChildren: './eproc/systemsecurity/systemsecurity.module#SettingModule'
    },  
    {
        path: 'systemsetting',
        loadChildren: './eproc/systemsetting/systemsetting.module#SettingModule'
    },    
    {
        path: 'transaction',
        loadChildren: './eproc/transaction/transaction.module#SettingModule'
    }, 
    {
        path: 'report',
        loadChildren: './eproc/report/report.module#SettingModule'
    },  
    {
        path: 'help',
        loadChildren: './eproc/help/help.module#SettingModule'
    },
    {
        path: 'controlpanel',
        loadChildren: './eproc/controlpanel/controlpanel.module#SettingModule'
    },
    {
        path: 'inventory',
        loadChildren: './eproc/inventory/inventory.module#SettingModule'
    },
    {
        path: 'accountpayable',
        loadChildren: './eproc/accountpayment/accountpayable.module#SettingModule'
    }
    ]
}, {
    path: '',
    component: AuthLayoutComponent,
    children: [
        {
            path: 'main',
            loadChildren: './mainframe/mainframe.module#MainFrameModule'
        },
        {
            path: 'pages',
            loadChildren: './pages/pages.module#PagesModule'
        }
    ]
},
{
    path: '',
    component: IframelayoutComponent,
    children: [
        {
            path: 'objectinfopurchaseorder',
            loadChildren: './eproc/transaction/transaction.module#SettingModule'
        },
        {
            path: 'objectinfopaymentrequest',
            loadChildren: './eproc/accountpayment/accountpayable.module#SettingModule'
        },
        {
            path: 'objectinfosupplierselection',
            loadChildren: './eproc/transaction/transaction.module#SettingModule'
        },
        {
            path: 'objectinfoverification',
            loadChildren: './eproc/transaction/transaction.module#SettingModule'
        },
        {
            path: 'objectinfoprocurement',
            loadChildren: './eproc/transaction/transaction.module#SettingModule'
        },
        {
            path: 'objectinfogoodreceiptnote',
            loadChildren: './eproc/transaction/transaction.module#SettingModule'
        },
        {
            path: 'objectinfoinvoiceregistration',
            loadChildren: './eproc/accountpayment/accountpayable.module#SettingModule'
        }
        // {
        //     path: '',
        //     loadChildren: './linkapproval/linkapproval.module#LinkApprovalModule'
        // }
    ]
}


];
