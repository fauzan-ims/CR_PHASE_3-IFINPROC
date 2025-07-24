import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { DatePipe } from '@angular/common';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './companyuserdetail.component.html'
})

export class CompanyuserdetailComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');

    // variable
    public NumberOnlyPattern = this._numberonlyformat;
    public EmailPattern = this._emailformat;
    public companyuserData: any = [];
    public isReadOnly: Boolean = false;
    public isModule: Boolean;
    public isDefault: Boolean = false;
    private dataTamp: any = [];
    private dataRoleTamp: any = [];
    public lookupPeriod: any = [];
    public lookupProvince: any = [];
    public lookupCity: any = [];
    public lookupMainTask: any = [];
    public lookupSubscriptionType: any = [];
    public setStyle: any = [];
    public idDetailList: string;
    public tempFile: any;
    private base64textString: string;
    public tampHidden: Boolean = false;
    private tamps = new Array();
    private APIController: String = 'SysCompanyUserMain';
    private APIControllerProvince: String = 'SysProvince';
    private APIControllerCompany: String = 'SysCompany';
    private APIControllerSubcode: String = 'SysGeneralSubcode'
    private APIControllerTaskUser: String = 'MasterTaskUser'
    private APIControllerCity: String = 'SysCity';
    private APIControllerPasswordManagement: String = 'PasswordManagement';
    private APIRouteForGetRow: String = 'GETROW';
    private APIRouteForInsert: String = 'INSERT';
    private APIRouteForUpdate: String = 'UPDATE';
    private APIRouteForUploadFile: String = 'Upload';
    private APIRouteForDeleteFile: String = 'Deletefile';
    private APIRouteForPriviewFile: String = 'Priview';
    private APIRouteLookup: String = 'GetRowsForLookup';
    private APIControllerSubscription: String = 'SysSubscriptionType';
    private APIRouteLookupCity: String = 'GetRowsLookupByProvinceCode';
    private APIRouteForUpdateSatus: String = 'ExecSpForUpdateStatus';
    private APIRouteForResetPass: String = 'ExecSpResetPass';
    private APIRouteForResendEmail: String = 'ExecSpForResendEmail';
    private RoleAccessCode = 'R00021510000000A';

    // checklist
    public selectedAll: any;
    public checkedList: any = [];

    // form 2 way binding
    model: any = {};

    // spinner
    showSpinner: Boolean = true;
    // end

    // datatable
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};
    dataTampPush: any[];

    constructor(private dalservice: DALService,
        public getRouteparam: ActivatedRoute,
        public route: Router,
        private _elementRef: ElementRef, private datePipe: DatePipe
    ) { super(); }

    ngOnInit() {
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        if (this.param != null) {
            this.Delimiter(this._elementRef);
            this.isReadOnly = true;

            // call web service
            this.callGetrow();
            $('#reloadWiz').click();
        } else {
            this.showSpinner = false;
            this.model.last_fail_count = 0;
            this.model.company_code = this.company_code;
            this.model.module = 'SALES';
            this.model.is_default = '0';
            this.model.is_active = true;
        }
    }

    //#region redirect without window reload
    redirectTo(uri: string) {
        // this.route.navigateByUrl(uri);
        this.route.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.route.navigate([uri]));
    }
    //#endregion redirect without window reload

    //#region to remove wizzard
    callWizard() {
        setTimeout(() => {
            const module = $('#module').val();

            this.grouprolewiz();
            this.wizard();
        }, 300);
    }
    //#endregion to remove wizzard

    onRouterOutletActivate(event: any) {
    }

    //#region btnActive
    btnActive(code: string) {
        // param tambahan untuk getrole dynamic
        this.dataRoleTamp = [{
            'p_code': code,
            'p_company_code': this.company_code,
            'action': 'default'
        }];
        // param tambahan untuk getrole dynamic

        // call web service
        swal({
            title: 'Are you sure?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: this._deleteconf,
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForUpdateSatus)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);

                            if (parse.result === 1) {
                                this.showNotification('bottom', 'right', 'success');
                                this.callGetrow();
                            } else {
                                this.swalPopUpMsg(parse.data);
                            }
                        },
                        error => {
                            this.showSpinner = false;
                            const parse = JSON.parse(error);
                            this.swalPopUpMsg(parse.data);
                        });
            } else {
                this.showSpinner = false;
            }
        })
    }
    //#endregion btnActive

    //#region getrow data
    callGetrow() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_code': this.param,
            'p_company_code': this.company_code
        }]
        // end param tambahan untuk getrow dynamic

        this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    // const parsedata = parse.data[0];
                    const parsedata = this.getrowNgb(parse.data[0]);

                    // checkbox
                    if (parsedata.is_active === '1') {
                        parsedata.is_active = true;
                    } else {
                        parsedata.is_active = false;
                    }
                    // end checkbox

                    if (parsedata.file_name === '' || parsedata.file_name == null) {
                        this.tampHidden = false;
                    } else {
                        this.tampHidden = true;
                    }

                    if (parsedata.is_default === '1') {
                        this.isDefault = true;
                    } else {
                        this.isDefault = false;
                    }
                    // mapper dbtoui
                    Object.assign(this.model, parsedata);
                    // end mapper dbtoui
                    this.callWizard();
                    this.showSpinner = false;
                },
                error => {
                    console.log('There was an error while Retrieving Data(API) !!!' + error);
                });
    }
    //#endregion getrow data

    //#region form submit
    onFormSubmit(companyuserForm: NgForm, isValid: boolean) {

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

        // this.pp01Data = pp01Form;
        this.companyuserData = this.JSToNumberFloats(companyuserForm);
        this.companyuserData.p_file = [];
        this.companyuserData.p_last_fail_count = 0;

        if (this.companyuserData.p_is_active == null || this.companyuserData.p_is_active === '') {
            this.companyuserData.p_is_active = this.model.is_active;
        } 
        if (this.companyuserData.p_last_login_date == null || this.companyuserData.p_last_login_date === '') {
            this.companyuserData.p_last_login_date = undefined;
        }
        if (this.companyuserData.p_next_change_pass == null || this.companyuserData.p_next_change_pass === '') {
            this.companyuserData.p_next_change_pass = undefined;
        }
        const usersJson: any[] = Array.of(this.companyuserData);
        if (this.param != null) {
            // call web service
            this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
                .subscribe(
                    res => {
                        this.showSpinner = false;
                        const parse = JSON.parse(res);
                        if (parse.result === 1) {
                            if (this.tamps.length > 0) {
                                for (let i = 0; i < this.tamps.length; i++) {
                                    this.companyuserData.p_file.push({
                                        p_code: this.param,
                                        p_file_paths: this.param,
                                        p_company_code: this.company_code,
                                        p_file_name: this.tamps[i].p_file_name,
                                        p_base64: this.tamps[i].p_base64,
                                        p_header: 'PHOTO',
                                        p_child: this.param,
                                    });
                                }

                                this.dalservice.UploadFile(this.companyuserData.p_file, this.APIController, this.APIRouteForUploadFile)
                                    .subscribe(
                                        res => {
                                            const parse = JSON.parse(res);

                                            if (parse.result === 1) {
                                                this.showSpinner = false;
                                                this.showNotification('bottom', 'right', 'success');
                                                this.callGetrow();
                                                this.redirectTo('/companyinformation/subcompanyuserlist/companyuserdetail/' + this.param);
                                            } else {
                                                this.swalPopUpMsg(parse.data);
                                            }
                                        },
                                        error => {
                                            this.showSpinner = false;
                                            const parse = JSON.parse(error);
                                            this.swalPopUpMsg(parse.data);
                                        });
                            } else {
                                this.showNotification('bottom', 'right', 'success');
                                this.callGetrow();
                                this.redirectTo('/companyinformation/subcompanyuserlist/companyuserdetail/' + this.param);
                            }
                        } else {
                            this.swalPopUpMsg(parse.data);
                        }
                    },
                    error => {
                        this.showSpinner = false;
                        const parse = JSON.parse(error);
                        this.swalPopUpMsg(parse.data);
                    });
        } else {
            // call web service
            this.dalservice.Insert(usersJson, this.APIController, this.APIRouteForInsert)
                .subscribe(
                    res => {
                        this.showSpinner = false;
                        const parse = JSON.parse(res);
                        if (parse.result === 1) {
                            if (this.tamps.length > 0) {
                                for (let i = 0; i < this.tamps.length; i++) {
                                    this.companyuserData.p_file.push({
                                        p_code: parse.code,
                                        p_file_paths: parse.code,
                                        p_file_name: this.tamps[i].p_file_name,
                                        p_base64: this.tamps[i].p_base64,
                                        p_header: 'PHOTO',
                                        p_child: parse.code,
                                    });
                                }

                                this.dalservice.UploadFile(this.companyuserData.p_file, this.APIController, this.APIRouteForUploadFile)
                                    .subscribe(
                                        ress => {
                                            this.showSpinner = false;
                                            const parses = JSON.parse(ress);
                                            if (parse.result === 1) {
                                                this.showNotification('bottom', 'right', 'success');
                                                this.route.navigate(['/companyinformation/subcompanyuserlist/companyuserdetail', parse.code]);
                                            } else {
                                                this.swalPopUpMsg(parses.data);
                                            }
                                        },
                                        error => {
                                            this.showSpinner = false;
                                            const parses = JSON.parse(error);
                                            this.swalPopUpMsg(parses.data);
                                        });
                            }
                            this.showNotification('bottom', 'right', 'success');
                            this.route.navigate(['/companyinformation/subcompanyuserlist/companyuserdetail', parse.code]);
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
    }
    //#endregion form submit

    //#region button back
    btnBack() {
        this.route.navigate(['/companyinformation/subcompanyuserlist']);
        $('#datatablecompanyuser').DataTable().ajax.reload();
    }
    //#endregion button back

    //#region btnLookupProvince
    btnLookupProvince() {
        $('#datatableLookupProvince').DataTable().clear().destroy();
        $('#datatableLookupProvince').DataTable({
            'pagingType': 'first_last_numbers',
            'pageLength': 5,
            'processing': true,
            'serverSide': true,
            responsive: true,
            lengthChange: false, // hide lengthmenu
            searching: true, // jika ingin hilangin search box nya maka false
            ajax: (dtParameters: any, callback) => {
                // param tambahan untuk getrows dynamic
                dtParameters.paramTamp = [];
                dtParameters.paramTamp.push({
                    'default': ''
                });
                
                // end param tambahan untuk getrows dynamic
                this.dalservice.GetrowsSys(dtParameters, this.APIControllerProvince, this.APIRouteLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupProvince = parse.data;
                    this.lookupProvince.numberIndex = dtParameters.start;
                
                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    })
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            'lengthMenu': [
                [5, 25, 50, 100],
                [5, 25, 50, 100]
            ],
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 3] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;">No Data Available !</p>'
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }

    btnSelectRowProvince(code: String, description: String) {
        this.model.province_code = code;
        this.model.province_name = description;
        $('#lookupModalProvince').modal('hide');

        this.model.city_code = '';
        this.model.city_name = '';
    }
    //#endregion btnLookupProvince

    //#region btnLookupCity
    btnLookupCity() {
        $('#datatableLookupCity').DataTable().clear().destroy();
        $('#datatableLookupCity').DataTable({
            'pagingType': 'first_last_numbers',
            'pageLength': 5,
            'processing': true,
            'serverSide': true,
            responsive: true,
            lengthChange: false, // hide lengthmenu
            searching: true, // jika ingin hilangin search box nya maka false
            ajax: (dtParameters: any, callback) => {
                // param tambahan untuk getrows dynamic
                dtParameters.paramTamp = [];
                dtParameters.paramTamp.push({
                    'p_province_code': this.model.province_code
                });
                // end param tambahan untuk getrows dynamic
                this.dalservice.GetrowsSys(dtParameters, this.APIControllerCity, this.APIRouteLookupCity).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupCity = parse.data;
                    this.lookupCity.numberIndex = dtParameters.start;

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    })
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            'lengthMenu': [
                [5, 25, 50, 100],
                [5, 25, 50, 100]
            ],
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 3] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;">No Data Available !</p>'
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }

    btnSelectRowCity(code: String, description: String) {
        this.model.city_code = code;
        this.model.city_name = description;
        $('#lookupModalCity').modal('hide');
    }
    //#endregion btnLookupCity

    //#region btnLookupSubscriptionType
    btnLookupSubscriptionType() {
        $('#datatableLookupSubscriptionType').DataTable().clear().destroy();
        $('#datatableLookupSubscriptionType').DataTable({
            'pagingType': 'first_last_numbers',
            'pageLength': 5,
            'processing': true,
            'serverSide': true,
            responsive: true,
            lengthChange: false, // hide lengthmenu
            searching: true, // jika ingin hilangin search box nya maka false
            ajax: (dtParameters: any, callback) => {
                // param tambahan untuk getrows dynamic
                dtParameters.paramTamp = [];
                dtParameters.paramTamp.push({
                    '': ''
                });
                // end param tambahan untuk getrows dynamic
                this.dalservice.GetrowsSys(dtParameters, this.APIControllerSubscription, this.APIRouteLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupSubscriptionType = parse.data;

                    if (parse.data != null) {
                        this.lookupSubscriptionType.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    })
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            'lengthMenu': [
                [5, 25, 50, 100],
                [5, 25, 50, 100]
            ],
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;">No Data Available !</p>'
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }

    btnSelectRowSubscriptionType(code: String, description: String) {
        this.model.subscription_type_code = code;
        this.model.subscription_type_name = description;
        $('#lookupModalSubscriptionType').modal('hide');
    }
    //#endregion btnLookupSubscriptionType

    //#region btnLookupMainTask
    btnLookupMainTask() {
        $('#datatableLookupMainTask').DataTable().clear().destroy();
        $('#datatableLookupMainTask').DataTable({
            'pagingType': 'first_last_numbers',
            'pageLength': 5,
            'processing': true,
            'serverSide': true,
            responsive: true,
            lengthChange: false, // hide lengthmenu
            searching: true, // jika ingin hilangin search box nya maka false
            ajax: (dtParameters: any, callback) => {
                // param tambahan untuk getrows dynamic
                dtParameters.paramTamp = [];
                dtParameters.paramTamp.push({
                    'p_company_code': this.company_code
                });
                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIControllerTaskUser, this.APIRouteLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);                    
                    this.lookupMainTask = parse.data;

                    if (parse.data != null) {
                        this.lookupMainTask.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    })
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            'lengthMenu': [
                [5, 25, 50, 100],
                [5, 25, 50, 100]
            ],
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 3] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;">No Data Available !</p>'
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }

    btnSelectRowMainTask(code: String, description: String) {
        this.model.main_task_code = code;
        this.model.main_task_name = description;
        $('#lookupModalMainTask').modal('hide');
    }
    //#endregion btnLookupMainTask

    //#region button select image
    onUpload(event) {
        const files = event.target.files;
        const file = files[0];
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();

            reader.readAsDataURL(event.target.files[0]); // read file as data url

            // tslint:disable-next-line:no-shadowed-variable
            reader.onload = (event) => {
                reader.onload = this.handleFile.bind(this);
                reader.readAsBinaryString(file);
            }
        }
        this.tempFile = files[0].name;
    }
    //#endregion button select image

    //#region button priview image
    priviewFile(row1, row2) {
        const usersJson: any[] = Array.of();

        usersJson.push({
            p_file_name: row1,
            p_file_paths: row2
        });

        this.dalservice.PriviewFile(usersJson, this.APIController, this.APIRouteForPriviewFile)
            .subscribe(
                (res) => {
                    const parse = JSON.parse(res);

                    if (parse.value.filename !== '') {
                        const fileType = parse.value.filename.split('.').pop();
                        if (fileType === 'PNG') {
                            const newTab = window.open();
                            newTab.document.body.innerHTML = this.pngFile(parse.value.data);
                        }
                        if (fileType === 'JPEG' || fileType === 'JPG') {
                            const newTab = window.open();
                            newTab.document.body.innerHTML = this.jpgFile(parse.value.data);
                        }
                        if (fileType === 'PDF') {
                            const newTab = window.open();
                            newTab.document.body.innerHTML = this.pdfFile(parse.value.data);
                        }
                        if (fileType === 'DOC') {
                            const newTab = window.open();
                            newTab.document.body.innerHTML = this.docFile(parse.value.data);
                        }
                    }
                }
            );
    }
    //#endregion button priview image

    //#region button delete image
    deleteImage(row2) {
        const usersJson: any[] = Array.of();

        usersJson.push({
            p_code: this.param,
            p_file_paths: row2
        });

        swal({
            allowOutsideClick: false,
            title: 'Are you sure?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: 'Yes',
            buttonsStyling: false
        }).then((result) => {
            this.showSpinner = true;
            if (result.value) {
                this.dalservice.DeleteFile(usersJson, this.APIController, this.APIRouteForDeleteFile)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.redirectTo('/companyinformation/subcompanyuserlist/companyuserdetail/' + this.param);
                            } else {
                                this.swalPopUpMsg(parse.data);
                            }
                        },
                        error => {
                            const parse = JSON.parse(error);
                            this.swalPopUpMsg(parse.data);
                        });
            } else {
                this.showSpinner = false;
            }
        });
    }
    //#endregion button delete image

    //#region convert to base64
    handleFile(event) {
        const binaryString = event.target.result;
        this.base64textString = btoa(binaryString);

        this.tamps.push({
            p_header: 'BUKTI_BERHASIL_LAPOR',
            p_child: this.param,
            p_code: this.param,
            p_file_paths: this.param,
            p_file_name: this.tempFile,
            p_base64: this.base64textString
        });
    }
    //#endregion convert to base64

    //#region getStyles
    getStyles(isTrue: Boolean) {
        if (isTrue) {
            this.setStyle = {
                'pointer-events': 'none',
            }
        } else {
            this.setStyle = {
                'pointer-events': 'auto',
            }
        }

        return this.setStyle;
    }
    //#endregion getStyles

    //#region targetsalewiz list tabs
    // targetsalewiz() {
    //     this.route.navigate(['/companyinformation/subcompanyuserlist/companyuserdetail/' + this.param + '/targetsalewizlist', this.param], { skipLocationChange: true });
    // }
    //#endregion targetsalewiz list tabs

    //#region grouprolewiz list tabs
    grouprolewiz() {
        this.route.navigate(['/companyinformation/subcompanyuserlist/companyuserdetail/' + this.param + '/grouprolewizlist', this.param], { skipLocationChange: true });
    }
    //#endregion grouprolewiz list tabs

    //#region loginlogwiz list tabs
    loginlogwiz() {
        this.route.navigate(['/companyinformation/subcompanyuserlist/companyuserdetail/' + this.param + '/loginlogwizlist', this.param], { skipLocationChange: true });
    }
    //#endregion loginlogwiz list tabs

    //#region btnResetPassword
    btnResetPassword() {
        // param tambahan untuk getrole dynamic
        this.dataRoleTamp = [{
            'p_uid_or_email': this.param,
            'action': 'default'
        }];
        // param tambahan untuk getrole dynamic

        // call web service
        swal({
            title: 'Are you sure?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: this._deleteconf,
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIControllerPasswordManagement, this.APIRouteForResetPass)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);

                            if (parse.result === 1) {
                                this.showNotification('bottom', 'right', 'success');
                                this.callGetrow();
                            } else {
                                this.swalPopUpMsg(parse.data);
                            }
                        },
                        error => {
                            this.showSpinner = false;
                            const parse = JSON.parse(error);
                            this.swalPopUpMsg(parse.data);
                        });
            } else {
                this.showSpinner = false;
            }
        })
    }
    //#endregion btnResetPassword

    //#region btnResendEmail
    btnResendEmail() {
        // param tambahan untuk getrole dynamic
        this.dataRoleTamp = [{
            'p_user_code': this.param,
            'action': 'default'
        }];       
        // param tambahan untuk getrole dynamic

        // call web service
        swal({
            title: 'Are you sure?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: this._deleteconf,
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForResendEmail)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);

                            if (parse.result === 1) {
                                this.showNotification('bottom', 'right', 'success');
                                this.callGetrow();
                            } else {
                                this.swalPopUpMsg(parse.data);
                            }
                        },
                        error => {
                            this.showSpinner = false;
                            const parse = JSON.parse(error);
                            this.swalPopUpMsg(parse.data);
                        });
            } else {
                this.showSpinner = false;
            }
        })
    }
    //#endregion btnResendEmail

}
