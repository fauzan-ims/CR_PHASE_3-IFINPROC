import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {DataTablesModule} from 'angular-datatables';
import { DALService } from '../../../../../../DALservice.service';
import { UsermaingroupsecWizRoutes } from './usermaingroupsecwiz.routing';
import { UsermaingroupseclistComponent } from './usermaingroupseclist/usermaingroupseclist.component';
import { SpinnerModule } from '../../../../../spinner-ui/spinner/spinner.module';
import { AuthGuard } from '../../../../../../auth.guard';
import { AuthInterceptor } from '../../../../../../auth-interceptor';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(UsermaingroupsecWizRoutes),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule
    ],
    declarations: [
        UsermaingroupseclistComponent
    ]
    ,
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class UserMainGroupSecWizModule { }
