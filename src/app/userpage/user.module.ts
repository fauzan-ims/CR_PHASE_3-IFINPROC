import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserComponent } from './user.component';
import { UserRoutes } from './user.routing';
import { SpinnerModule } from '../spinner-ui/spinner/spinner.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(UserRoutes),
        FormsModule,
        SpinnerModule
    ],
    declarations: [UserComponent]
})

export class UserModule {}
