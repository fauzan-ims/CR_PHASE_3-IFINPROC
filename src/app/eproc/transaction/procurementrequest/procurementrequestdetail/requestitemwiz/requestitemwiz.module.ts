import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../../../../DALservice.service';
import { SpinnerModule } from '../../../../../spinner-ui/spinner/spinner.module';
import { RequestItemWiz } from './requestitemwiz.routing';
import { RequestitemwizComponent } from './requestitemwizlist/requestitemwizlist.component';
import { RequestitemwizdetailComponent } from './requestitemwizdetail/requestitemwizdetail.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(RequestItemWiz),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule
    ],
    declarations: [
        RequestitemwizComponent,
        RequestitemwizdetailComponent
    ],
    providers: [
        DALService
    ]
})

export class RequestItemWizModule { }
