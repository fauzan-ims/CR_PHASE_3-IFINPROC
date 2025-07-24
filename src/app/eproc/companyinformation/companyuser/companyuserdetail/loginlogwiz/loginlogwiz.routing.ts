import { Routes } from '@angular/router';
import { LoginlogwizlistComponent } from './loginlogwizlist/loginlogwizlist.component';

export const LoginlogWizRoutes: Routes = [{
    path: '',
    children: [
        {
            path: 'loginloglist/:id',
            component: LoginlogwizlistComponent
        }
    ]
}];
