import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../base.component';
import { DALService } from '../../DALservice.service';
import swal from 'sweetalert2';
import { NgForm } from '@angular/forms';

@Component({
    moduleId: module.id,
    selector: 'user-cmp',
    templateUrl: 'user.component.html'
})

export class UserComponent extends BaseComponent implements OnInit {

    private regionData: any = [];
    private APIController: String = 'PasswordManagement';
    private APIRouteForUpdate: String = 'ExecSpChangePass';

    // form 2 way binding
    model: any = {};

    // spinner
    showSpinner: Boolean = true;
    // end

    constructor(
        private dalservice: DALService,
    ) { super(); }

    ngOnInit() {

    }

    //#region  form submit
    onFormSubmit(changepassForm: NgForm, isValid: boolean) {
        // validation form submit
        if (!isValid) {
            swal({
                title: 'Warning',
                text: 'Please Fill a Mandatory Field OR Format Is Invalid',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-danger',
                type: 'warning'
            }).catch(swal.noop)
            return;
        } else {
            this.showSpinner = true;
        }


        this.regionData = changepassForm;

        const uid = this.decryptLogic(sessionStorage.getItem('ZW1hbnJlc3U%3D'));

        this.regionData.p_uid = uid;

        if (this.regionData.p_password_type == null) {
            swal({
                title: 'Warning',
                text: 'Please Choose Password Type',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-danger',
                type: 'warning'
            }).catch(swal.noop)
            return;
        }


        if (this.regionData.p_new_password != this.regionData.p_re_new_password) {
            swal({
                title: 'Warning',
                text: 'New Password Not Match With Re New Password',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-danger',
                type: 'warning'
            }).catch(swal.noop)
            return;
        }

        // const usersJson: any[] = Array.of(this.regionData);

        // param tambahan untuk getrole dynamic
        const usersJson = [{
            'p_uid': this.regionData.p_uid,
            'p_new_password': this.regionData.p_new_password,
            'p_old_password': this.regionData.p_old_password,
            'p_password_type': this.regionData.p_password_type,
            'action': 'default'
        }];
        // param tambahan untuk getrole dynamic
        
        // call web service
        this.dalservice.ExecSp(usersJson, this.APIController, this.APIRouteForUpdate)
            .subscribe(
                res => {
                    this.showSpinner = false;
                    const parse = JSON.parse(res);
                    
                    if (parse.result === 1) {
                        this.showNotification('bottom', 'right', 'success');
                    } else {
                        this.swalPopUpMsg(parse.data);
                    }
                },
                error => {
                  this.showSpinner = false;
                  const parse = JSON.parse(error);
                  this.swalPopUpMsg(parse.data);
                });

    }
    //#endregion form submit
}