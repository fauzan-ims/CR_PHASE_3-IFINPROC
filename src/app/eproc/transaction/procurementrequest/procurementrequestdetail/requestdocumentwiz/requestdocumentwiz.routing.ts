import { Routes } from '@angular/router'; 
import { RequestdocumentwizdetailComponent } from './requestdocumentwizdetail/requestdocumentwizdetail.component';
 import { RequestdocumentwizComponent } from './requestdocumentwizlist/requestdocumentwizlist.component';
 
export const RequestDocumentWiz: Routes = [{
    path: '',
    children: [
        {
            path: 'requestdocumentwizlist/:id',
            component: RequestdocumentwizComponent
        },
        {
            path: 'requestdocumentwizdetail/:id', // add
            component: RequestdocumentwizdetailComponent
        },
        {
            path: 'requestdocumentwizdetail/:id/:id2', // update
            component: RequestdocumentwizdetailComponent
        }
    ]

}];
