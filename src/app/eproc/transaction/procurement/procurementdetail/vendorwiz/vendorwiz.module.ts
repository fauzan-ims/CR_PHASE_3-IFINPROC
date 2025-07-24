import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../../../../DALservice.service';
import { SpinnerModule } from '../../../../../spinner-ui/spinner/spinner.module';
import { VendorWiz} from './vendorwiz.routing'; 
import { VendorwizComponent } from './vendorwizlist/vendorwizlist.component';
  
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(VendorWiz),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule
    ],
    declarations: [ 
        VendorwizComponent
    ],
    providers: [
        DALService
    ]
})

export class VendorWizModule { }
