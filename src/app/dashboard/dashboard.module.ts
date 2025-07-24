import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AgmCoreModule
} from '@agm/core';
import { DashboardComponent } from './dashboard.component';

import { DashboardRoutes } from './dashboard.routing';
import { AuthGuard } from '../../auth.guard';
import { DALService } from '../../DALservice.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../../auth-interceptor';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardRoutes),
        FormsModule,
        AgmCoreModule.forRoot({
          apiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
        })
    ],
    declarations: [DashboardComponent],
    providers: [
      DALService,
      { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
      , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class DashboardModule {}
