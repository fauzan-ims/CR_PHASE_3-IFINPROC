import { Routes } from '@angular/router'; 
import { VerificationdocumentwizdetailComponent } from './verificationdocumentwizdetail/verificationdocumentwizdetail.component';
 import { VerificationdocumentwizComponent } from './verificationdocumentwizlist/verificationdocumentwizlist.component';
  
export const VerificationDocumentWiz: Routes = [{
    path: '',
    children: [
        {
            path: 'verificationdocumentwizlist/:id',
            component: VerificationdocumentwizComponent
        },
        {
            path: 'verificationdocumentwizdetail/:id', // add
            component: VerificationdocumentwizdetailComponent
        },
        {
            path: 'verificationdocumentwizdetail/:id/:id2', // update
            component: VerificationdocumentwizdetailComponent
        }
    ]

}];
