import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { BaseComponent } from '../../../base.component';
import { DALService } from '../../../DALservice.service';
import swal from 'sweetalert2';


declare var $: any;

@Component({
    moduleId: module.id,
    selector: 'register-cmp',
    templateUrl: './register.component.html'
})

export class RegisterComponent extends BaseComponent implements OnInit {
    focus;
    focus1;
    focus2;
    username;
    test: Date = new Date();
    private toggleButton;
    private sidebarVisible: boolean;
    private nativeElement: Node;
    private dataTamp: any = [];

    private APIController: String = 'PasswordManagement';
    private APIRouteForResetPass: String = 'ExecSpResetPass';

    // spinner
    showSpinner: Boolean = false;
    // end

    constructor(private element: ElementRef, public route: Router, private dalservice: DALService) {
        super();
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
    }
    checkFullPageBackgroundImage() {
        var $page = $('.full-page');
        var image_src = $page.data('image');
        var body = document.getElementsByTagName('body')[0];
        body.classList.add('register-page');
        if (image_src !== undefined) {
            var image_container = '<div class="full-page-background" style="background-image: url(' + image_src + ') "/>'
            $page.append(image_container);
        }
    };

    ngOnInit() {
        this.checkFullPageBackgroundImage();

        var navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];

        setTimeout(function () {
            // after 1000 ms we add the class animated to the login/register card
            $('.card').removeClass('card-hidden');
        }, 700)

    }

    // sendForgotEmail(username: string) {

    //     this.showSpinner = true;

    //     if (!username) {
    //         username = ' ';
    //     }

    //     this.dataTamp = [];
    //     // param tambahan untuk getrow dynamic
    //     this.dataTamp = [{
    //         'p_uid_or_email': username,
    //         'action': 'default'
    //     }];
    //     // end param tambahan untuk getrow dynamic
        
    //     swal({
    //         title: 'Are you sure?',
    //         type: 'warning',
    //         showCancelButton: true,
    //         confirmButtonClass: 'btn btn-success',
    //         cancelButtonClass: 'btn btn-danger',
    //         confirmButtonText: this._deleteconf,
    //         buttonsStyling: false
    //     }).then((result) => {
    //         this.showSpinner = true;
    //         if (result.value) {
    //             this.dalservice.ExecSpForgotPassword(this.dataTamp, this.APIController, this.APIRouteForResetPass)
    //                 .subscribe(
    //                     res => {                            
    //                         const parse = JSON.parse(res);

    //                         if (parse.result === 1) {
    //                             swal({
    //                                 // title: "Good job!",
    //                                 text: "Success. Please check your Email In Inbox or Spam",
    //                                 buttonsStyling: false,
    //                                 confirmButtonClass: "btn btn-success",
    //                                 type: "success"
    //                             }).catch(swal.noop)
    //                         }
    //                         else {
    //                             this.swalPopUpMsg(parse.data);
    //                         }

    //                         this.showSpinner = false;
    //                     },
    //                     error => {
    //                         this.showSpinner = false;
    //                         const parse = JSON.parse(error);
    //                         this.swalPopUpMsg(parse.data);
    //                         // console.log('There was an error while Retrieving Data(API) !!!' + error);
    //                     });

    //         } else {
    //             this.showSpinner = false;
    //         }
    //     });

    // }

    backToLogin() {
        this.route.navigate(['/pages/login']);
    }

    ngOnDestroy() {
        var body = document.getElementsByTagName('body')[0];
        body.classList.remove('register-page');
    }
    sidebarToggle() {
        var toggleButton = this.toggleButton;
        var body = document.getElementsByTagName('body')[0];
        var sidebar = document.getElementsByClassName('navbar-collapse')[0];
        if (this.sidebarVisible == false) {
            setTimeout(function () {
                toggleButton.classList.add('toggled');
            }, 500);
            body.classList.add('nav-open');
            this.sidebarVisible = true;
        } else {
            this.toggleButton.classList.remove('toggled');
            this.sidebarVisible = false;
            body.classList.remove('nav-open');
        }
    }
}
