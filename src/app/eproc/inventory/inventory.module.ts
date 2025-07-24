import { NgModule, ErrorHandler } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../DALservice.service';
import { Inventory } from './inventory.routing';
import { AuthInterceptor } from '../../../auth-interceptor';
import { AuthGuard } from '../../../auth.guard';
import { SpinnerModule } from '../../spinner-ui/spinner/spinner.module';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { AdjustmentlistComponent } from './adjustment/adjustmentlist/adjustmentlist.component';
import { AdjustmentdetailComponent } from './adjustment/adjustmentdetail/adjustmentdetail.component';
import { AdjustmentDetaildetailComponent } from './adjustment/adjustmentdetail/adjustmentdetaildetail/adjustmentdetaildetail.component';
import { InventoryOpnameListComponent } from './inventoryopname/inventoryopnamelist/inventoryopnamelist.component';
import { InventoryCardlistComponent } from './inventorycard/inventorycardlist/inventorycardlist.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(Inventory),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule
    ],
    declarations: [
        AdjustmentlistComponent,
        AdjustmentdetailComponent,
        AdjustmentDetaildetailComponent,
        InventoryOpnameListComponent,
        InventoryCardlistComponent

    ],
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
