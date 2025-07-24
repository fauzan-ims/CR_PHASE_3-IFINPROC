import { Routes } from '@angular/router'; 
import { VerificationitemwizdetailComponent } from './verificationitemwizdetail/verificationitemwizdetail.component';
import { VerificationitemwizComponent } from './verificationitemwizlist/verificationitemwizlist.component';
   
export const VerificationItemWiz: Routes = [{
    path: '',
    children: [
        {
            path: 'verificationitemwizlist/:id',
            component: VerificationitemwizComponent
        },
        {
            path: 'verificationitemwizdetail/:id', // add
            component: VerificationitemwizdetailComponent
        },
        {
            path: 'verificationitemwizdetail/:id/:id2', // update
            component: VerificationitemwizdetailComponent
        }
    ]

    ,
    
}];
