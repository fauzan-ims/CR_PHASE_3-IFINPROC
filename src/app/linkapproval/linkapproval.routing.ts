import { Routes } from '@angular/router';

import { LinkapprovalComponent } from './linkapproval.component';

export const LinkApprovalRoutes: Routes = [{

    path: '',
    children: [ {
      path: 'linkapproval/:id',
      component: LinkapprovalComponent
  }]
}];
