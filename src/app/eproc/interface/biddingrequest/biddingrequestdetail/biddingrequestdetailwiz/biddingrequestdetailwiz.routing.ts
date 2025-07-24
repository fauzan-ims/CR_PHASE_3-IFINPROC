import { Routes } from '@angular/router'; 
import { BiddingrequestdetailwizComponent } from './biddingrequestdetailwizlist/biddingrequestdetailwizlist.component';
   
export const BiddingRequestDetailWiz: Routes = [{
    path: '',
    children: [
        {
            path: 'biddingrequestdetailwizlist/:id/:id2',
            component: BiddingrequestdetailwizComponent
        }, 
    ]

}];
