import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {DataTablesModule} from 'angular-datatables';
import { DALService } from '../../../../../../DALservice.service';
import { SpinnerModule } from '../../../../../spinner-ui/spinner/spinner.module';
import { AuthInterceptor } from '../../../../../../auth-interceptor';
import { AuthGuard } from '../../../../../../auth.guard';
import { LoginlogWizRoutes } from './loginlogwiz.routing';
import { LoginlogwizlistComponent } from './loginlogwizlist/loginlogwizlist.component';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(LoginlogWizRoutes),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule
    ],
    declarations: [
        LoginlogwizlistComponent,
    ]
    ,
    providers: [
        DALService,
        //{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        //, AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class LoginlogWizModule { }
