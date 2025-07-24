import { Routes } from '@angular/router'; 
import { VendorwizComponent } from './vendorwizlist/vendorwizlist.component';
   
export const VendorWiz: Routes = [{
    path: '',
    children: [
        {
            path: 'vendorwizlist/:id',
            component: VendorwizComponent
        }, 
    ]

}];
