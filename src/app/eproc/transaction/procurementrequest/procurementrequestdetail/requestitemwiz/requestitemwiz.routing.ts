import { Routes } from '@angular/router'; 
import { RequestitemwizdetailComponent } from './requestitemwizdetail/requestitemwizdetail.component';
import { RequestitemwizComponent } from './requestitemwizlist/requestitemwizlist.component';
   
export const RequestItemWiz: Routes = [{
    path: '',
    children: [
        {
            path: 'requestitemwizlist/:id',
            component: RequestitemwizComponent
        },
        {
            path: 'requestitemwizdetail/:id', // add
            component: RequestitemwizdetailComponent
        },
        {
            path: 'requestitemwizdetail/:id/:id2', // update
            component: RequestitemwizdetailComponent
        }
    ]

}];
