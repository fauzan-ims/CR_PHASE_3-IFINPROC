import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';
import { SidebarModule } from './sidebar/sidebar.module';
import { FixedPluginModule } from './shared/fixedplugin/fixedplugin.module';
import { FooterModule } from './shared/footer/footer.module';
import { NavbarModule } from './shared/navbar/navbar.module';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { AppRoutes } from './app.routing';
import { IframelayoutComponent } from './layouts/iframe/iframe-layout.component';
import { SpinnerModule } from './spinner-ui/spinner/spinner.module';
import { NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { DALService } from '../DALservice.service';
import { EventEmitter } from 'protractor';
 
// import { EventEmitterService } from '../EventEmitter.service';

// import { MomentDateFormatter } from '../momentdate';


@NgModule({
    imports: [
        BrowserAnimationsModule,
        FormsModule,
        RouterModule.forRoot(AppRoutes),
        NgbModule.forRoot(),
        HttpModule,
        SidebarModule,
        NavbarModule,
        FooterModule,
        FixedPluginModule,
        SpinnerModule,
    ],
    declarations: [
        AppComponent,
        AdminLayoutComponent,
        AuthLayoutComponent,
        IframelayoutComponent
    ],
    providers: [
        // {provide: NgbDateParserFormatter, useClass: MomentDateFormatter},
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }
