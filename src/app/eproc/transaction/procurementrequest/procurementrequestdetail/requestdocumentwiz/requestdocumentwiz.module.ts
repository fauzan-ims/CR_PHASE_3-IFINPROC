import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../../../../DALservice.service';
import { SpinnerModule } from '../../../../../spinner-ui/spinner/spinner.module';
import { RequestDocumentWiz} from './requestdocumentwiz.routing'; 
import { RequestdocumentwizdetailComponent } from './requestdocumentwizdetail/requestdocumentwizdetail.component';
import { RequestdocumentwizComponent } from './requestdocumentwizlist/requestdocumentwizlist.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(RequestDocumentWiz),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule
    ],
    declarations: [
        RequestdocumentwizComponent,
        RequestdocumentwizdetailComponent
    ],
    providers: [
        DALService
    ]
})

export class RequestDocumentWizModule { }
