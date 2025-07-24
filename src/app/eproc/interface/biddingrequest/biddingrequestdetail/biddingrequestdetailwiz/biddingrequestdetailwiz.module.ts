import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../../../../DALservice.service';
import { SpinnerModule } from '../../../../../spinner-ui/spinner/spinner.module';
import { BiddingRequestDetailWiz } from './biddingrequestdetailwiz.routing';
import { BiddingrequestdetailwizComponent } from './biddingrequestdetailwizlist/biddingrequestdetailwizlist.component';
 
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(BiddingRequestDetailWiz),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule
    ],
    declarations: [
        BiddingrequestdetailwizComponent,
     ],
    providers: [
        DALService
    ]
})

export class BiddingRequestDetailWizModule { }
