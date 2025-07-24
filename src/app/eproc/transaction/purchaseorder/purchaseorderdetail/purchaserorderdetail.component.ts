import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../../../../../base.component';
import { DataTableDirective } from 'angular-datatables';
import { DALService } from '../../../../../DALservice.service';
import { DatePipe } from '@angular/common';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './purchaseorderdetail.component.html'
})

export class PurchaseOrderDetailComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');

    // variable
    public NumberOnlyPattern = this._numberonlyformat;
    public EmailPattern = this._emailformat;
    public purchaseOrderData: any = [];
    public purchaseOrderDetailList: any = [];
    public isReadOnly: Boolean = false;
    public isHidden: Boolean = false;
    private dataTamp: any = [];
    private dataRoleTamp: any = [];
    public tampHidden: Boolean;
    public setStyle: any = [];
    public lookupquotation: any = [];
    public lookuprequestorcode: any = [];
    public lookupapproval: any = [];
    public lookupcurrencycode: any = [];
    public lookupPaymentMethode: any = [];
    public lookupbranchcode: any = [];
    public lookupvendor: any = [];
    public lookupdivisioncode: any = [];
    public lookupsubdepartmentcode: any = [];
    public lookupdepartmentcode: any = [];
    public lookupunitcode: any = [];
    public lookupbank: any = [];
    public branchCode: String;
    public branchName: String;
    public bankName: String;
    public bankCode: String;
    public printType: String;
    public tampStatusType: Boolean = false;

    //controller
    private APIController: String = 'PurchaseOrder';
    private APIControllerSysDivisionCode: String = 'SysDivision';
    private APIControllerQuotation: String = 'Quotation';
    private APIControllerSysDepartmentCode: String = 'SysDepartment';
    private APIControllerSubDepartmentCode: String = 'MasterSubDepartment';
    private APIControllerUnitCode: String = 'MasterUnit';
    private APIControllerBranch: String = 'SysBranch';
    private APIControllerVendor: String = 'MasterVendor';
    private APIControllerSysCurrencyCode: String = 'SysCurrency';
    private APIControllerPurchaseType: String = 'SysGeneralSubCode';
    private APIControllerSysBranchBank: String = 'MasterBranchBank';
    private APIControllerReport: String = 'Report';
    private APIControllerApprovalSchedule: String = 'ApprovalSchedule';

    //routing
    private APIRouteForGetRow: String = 'GetRow';
    private APIRouteForInsert: String = 'Insert';
    private APIRouteForUpdate: String = 'Update';
    private APIRouteForLookup: String = 'GetRowsForLookup';
    private APIRouteLookup: String = 'GetRowsForLookup';
    private APIRouteForProceed: String = 'ExecSpForProceed';
    private APIRouteForReturn: String = 'ExecSpForReturn';
    private APIRouteForReject: String = 'ExecSpForReject';
    private APIRouteForCancel: String = 'ExecSpForCancel';
    private APIRouteForPost: String = 'ExecSpForPost';
    private APIRouteForClosedPartial: String = 'ExecSpForClosedPartial';
    private APIRouteForClosedFull: String = 'ExecSpForClosedFull';
    private APIRouteForDownload: String = 'getReport';
    private RoleAccessCode = 'R00021580000000A';

    // form 2 way binding
    model: any = {};

    // checklist
    public selectedAll: any;
    private checkedList: any = [];

    // spinner
    showSpinner: Boolean = true;
    // end

    // ini buat datatables
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};

    constructor(private dalservice: DALService,
        public getRouteparam: ActivatedRoute,
        public route: Router,
        private datePipe: DatePipe,
        private _elementRef: ElementRef,
        private parserFormatter: NgbDateParserFormatter
    ) { super(); }

    ngOnInit() {
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        this.Delimiter(this._elementRef);
        this.wizard();
        if (this.param != null) {
            this.isReadOnly = true;
            this.model.payment_methode_code = 'SGS230100003';
            this.model.payment_methode_name = 'PAYMENT TRANSFER';
            this.callGetrow();

            this.podetailitemwiz();
        } else {
            this.showSpinner = false;
            this.model.company_code = this.company_code;
            this.tampHidden = false;
            this.model.status = 'HOLD';
            this.model.payment_by = 'HO';
            this.model.receipt_by = 'HO';
            this.model.deposit_amount = 0;
            this.model.total_amount = 0;
            this.model.ppn_amount = 0;
            this.model.pph_amount = 0;
            this.model.order_type_code = 'PO';
            this.model.flag_process = 'MNL';
            this.model.unit_from = 'BUY';
            this.model.payment_methode_code = 'SGS230100003';
            this.model.payment_methode_name = 'PAYMENT TRANSFER';
        }
    }

    //#region getrow data
    callGetrow() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_code': this.param,
        }];
        // end param tambahan untuk getrow dynamic

        this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    const parsedata = this.getrowNgb(parse.data[0]);

                    if (parsedata.status !== 'HOLD') {
                        this.tampHidden = true;
                    } else {
                        this.tampHidden = false;
                    }

                    if (parsedata.is_termin === '1') {
                        parsedata.is_termin = true;
                    } else {
                        parsedata.is_termin = false;
                    }
                    // end checkbox

                    if (parsedata.flag_process == 'GNR') {
                        this.isReadOnly = true;
                    } else {
                        this.isReadOnly = false;
                    }

                    // checkbox
                    if (parsedata.is_spesific_address === '1') {
                        parsedata.is_spesific_address = true;
                        this.tampStatusType = true;
                    } else {
                        parsedata.is_spesific_address = false;
                        this.tampStatusType = false;
                    }

                    // end checkbox

                    this.printType = parsedata.print_type;

                    // mapper dbtoui
                    Object.assign(this.model, parsedata);
                    // end mapper dbtoui

                    this.showSpinner = false;
                },
                error => {
                    console.log('There was an error while Retrieving Data(API) !!!' + error);
                });
    }
    //#endregion getrow data

    //#region form submit
    onFormSubmit(purchaseOrderForm: NgForm, isValid: boolean) {
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

        this.purchaseOrderData = this.JSToNumberFloats(purchaseOrderForm);
        if (this.purchaseOrderData.p_is_termin == null) {
            this.purchaseOrderData.p_is_termin = false
        }

        if (this.purchaseOrderData.p_is_spesific_address == null || this.purchaseOrderData.p_is_spesific_address === '') {
            this.purchaseOrderData.p_is_spesific_address = false;
        }

        const usersJson: any[] = Array.of(this.purchaseOrderData);

        if (this.param != null) {
            // call web service
            this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
                .subscribe(
                    res => {
                        this.showSpinner = false;
                        const parse = JSON.parse(res);
                        if (parse.result === 1) {
                            this.showNotification('bottom', 'right', 'success');
                            this.callGetrow()
                            $('#termwiz').click();

                        } else {
                            this.swalPopUpMsg(parse.data);
                        }
                    },
                    error => {
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
                            this.showNotification('bottom', 'right', 'success');
                            this.route.navigate(['/transaction/suborderlist/purchaseorderlist', parse.code]);
                        } else {
                            this.swalPopUpMsg(parse.data);
                        }
                    },
                    error => {
                        const parse = JSON.parse(error);
                        this.swalPopUpMsg(parse.data);
                    });
        }
    }
    //#endregion form submit

    redirectTo(uri: string) {
        this.route.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.route.navigate([uri]));
    }

    //#region Spesific Address
    SpesificAddress(event: any) {
        this.tampStatusType = event.target.checked;
    }
    //#endregion Spesific Address

    //#region button back
    btnBack() {
        $('#datatable').DataTable().ajax.reload();
        this.route.navigate(['/transaction/suborderlist']);
    }
    //#endregion button back

    //#region Asset list tabs
    podetailitemwiz() {
        this.route.navigate(['/transaction/suborderlist/purchaseorderlist/' + this.param + '/purchaserorderwizlist', this.param], { skipLocationChange: true });
    }
    termofpymentwiz() {
        this.route.navigate(['/transaction/suborderlist/purchaseorderlist/' + this.param + '/termofpaymentlistwiz', this.param], { skipLocationChange: true });
    }
    //#endregion Asset list tabs

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

    //#region button Proceed
    btnProceed(code: string) {
        // param tambahan untuk button Post dynamic

        this.dataRoleTamp = [{
            'p_code': code,
            'action': 'default'
        }];

        // param tambahan untuk button Post dynamic
        swal({
            title: 'Are you sure?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: this._deleteconf,

            buttonsStyling: false
        }).then((result) => {
            this.showSpinner = true;
            if (result.value) {
                // call web service
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForProceed)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.callGetrow();
                                $('#termwiz').click();
                                $('#itemwiz').click();
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
            } else {
                this.showSpinner = false;
            }
        });
    }
    //#endregion button Proceed

    //#region button Reject
    btnReject(code: string) {
        // param tambahan untuk button Post dynamic

        this.dataRoleTamp = [{
            'p_code': code,
            'action': 'default'
        }];

        // param tambahan untuk button Post dynamic
        swal({
            title: 'Are you sure?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: this._deleteconf,

            buttonsStyling: false
        }).then((result) => {
            this.showSpinner = true;
            if (result.value) {
                // call web service
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReject)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.callGetrow();
                                $('#termwiz').click();
                                $('#itemwiz').click();
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
            } else {
                this.showSpinner = false;
            }
        });
    }
    //#endregion button Reject

    //#region btnCancel
    btnCancel() {
        // param tambahan untuk button Done dynamic
        this.dataRoleTamp = [{
            'p_code': this.param,
            'action': 'default'
        }];
        // param tambahan untuk button Done dynamic

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
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForCancel)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.callGetrow();
                                this.showNotification('bottom', 'right', 'success');
                                $('#termwiz').click();
                                $('#itemwiz').click();
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
    //#endregion btnCancel

    //#region button Return
    btnReturn(code: string) {
        // param tambahan untuk button Post dynamic

        this.dataRoleTamp = [{
            'p_code': code,
            'action': 'default'
        }];

        // param tambahan untuk button Post dynamic
        swal({
            title: 'Are you sure?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: this._deleteconf,

            buttonsStyling: false
        }).then((result) => {
            this.showSpinner = true;
            if (result.value) {
                // call web service
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReturn)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.callGetrow();
                                this.showNotification('bottom', 'right', 'success');
                                $('#termwiz').click();
                                $('#itemwiz').click();
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
        });
    }
    //#endregion button Return

    //#region button Post
    btnPost(code: string) {
        // param tambahan untuk button Post dynamic

        this.dataRoleTamp = [{
            'p_code': code,
            'p_company_code': this.company_code,
            'action': 'default'
        }];

        // param tambahan untuk button Post dynamic
        swal({
            title: 'Are you sure?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: this._deleteconf,

            buttonsStyling: false
        }).then((result) => {
            this.showSpinner = true;
            if (result.value) {
                // call web service
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForPost)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.callGetrow();
                                $('#termwiz').click();
                                $('#itemwiz').click();
                                this.showNotification('bottom', 'right', 'success');
                                //window.location.reload();
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
        });
    }
    //#endregion button Post

    //#region button Closed Partial
    btnClosedPartial(code: string) {
        // param tambahan untuk button Post dynamic

        this.dataRoleTamp = [{
            'p_code': code,
            'p_company_code': this.company_code,
            'action': 'default'
        }];

        // param tambahan untuk button Post dynamic
        swal({
            title: 'Are you sure?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: this._deleteconf,

            buttonsStyling: false
        }).then((result) => {
            this.showSpinner = true;
            if (result.value) {
                // call web service
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForClosedPartial)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.callGetrow();
                                $('#termwiz').click();
                                $('#itemwiz').click();
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
            } else {
                this.showSpinner = false;
            }
        });
    }
    //#endregion button Closed Partial

    //#region button Closed Full
    btnClosedFull(code: string) {
        // param tambahan untuk button Post dynamic

        this.dataRoleTamp = [{
            'p_code': code,
            'p_company_code': this.company_code,
            'action': 'default'
        }];

        // param tambahan untuk button Post dynamic
        swal({
            title: 'Are you sure?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: this._deleteconf,

            buttonsStyling: false
        }).then((result) => {
            this.showSpinner = true;
            if (result.value) {
                // call web service
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForClosedFull)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.callGetrow();
                                $('#termwiz').click();
                                $('#itemwiz').click();
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
            } else {
                this.showSpinner = false;
            }
        });
    }
    //#endregion button Closed Full

    //#region DepartmentCode Lookup
    btnLookupDepartmentCode(divisionCode: String) {
        $('#datatableLookupDepartmentCode').DataTable().clear().destroy();
        $('#datatableLookupDepartmentCode').DataTable({
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
                    'p_company_code': this.company_code,
                    'p_division_code': divisionCode,
                    'action': 'getResponse'
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.ExecSpSys(dtParameters, this.APIControllerSysDepartmentCode, this.APIRouteForLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupdepartmentcode = parse.data;

                    if (parse.data != null) {
                        this.lookupdepartmentcode.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [4] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }

    btnSelectRowDepartmentCode(code: String, name: String) {
        this.model.department_code = code;
        this.model.department_name = name;
        this.model.sub_department_code = undefined;
        this.model.sub_department_name = undefined;
        this.model.unit_code = undefined;
        this.model.unit_name = undefined;
        $('#lookupModalDepartmentCode').modal('hide');
    }

    btnClearDepartment() {
        this.model.department_code = '';
        this.model.department_name = '';
        this.model.sub_department_code = undefined;
        this.model.sub_department_name = undefined;
        this.model.unit_code = undefined;
        this.model.unit_name = undefined;
        $('#datatable').DataTable().ajax.reload();
    }

    //#endregion DepartmentCode lookup

    //#region Sub DepartmentCode Lookup
    btnLookupSubDepartmentCode(divisionCode: String, departmentCode: String) {
        $('#datatableLookupSubDepartmentCode').DataTable().clear().destroy();
        $('#datatableLookupSubDepartmentCode').DataTable({
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
                    'p_company_code': this.company_code,
                    'p_division_code': divisionCode,
                    'p_department_code': departmentCode,
                    'action': 'getResponse'
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.ExecSpSys(dtParameters, this.APIControllerSubDepartmentCode, this.APIRouteForLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    this.lookupsubdepartmentcode = parse.data;

                    if (parse.data != null) {
                        this.lookupsubdepartmentcode.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [4] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }

    btnSelectRowSubDepartmentCode(code: String, name: String) {
        this.model.sub_department_code = code;
        this.model.sub_department_name = name;
        this.model.unit_code = undefined;
        this.model.unit_name = undefined;
        $('#lookupModalSubDepartmentCode').modal('hide');
    }

    btnClearSubDepartment() {
        this.model.sub_department_code = '';
        this.model.sub_department_name = '';
        this.model.unit_code = undefined;
        this.model.unit_name = undefined;
        $('#datatable').DataTable().ajax.reload();
    }
    //#endregion Sub DepartmentCode lookup

    //#region UnitCode Lookup
    btnLookupUnitCode(divisionCode: String, departmentCode: String, subdepartmentCode: String) {
        $('#datatableLookupUnitCode').DataTable().clear().destroy();
        $('#datatableLookupUnitCode').DataTable({
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
                    'p_company_code': this.company_code,
                    'p_division_code': divisionCode,
                    'p_department_code': departmentCode,
                    'p_sub_department_code': subdepartmentCode,
                    'action': 'getResponse'
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.ExecSpSys(dtParameters, this.APIControllerUnitCode, this.APIRouteForLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    this.lookupunitcode = parse.data;

                    if (parse.data != null) {
                        this.lookupunitcode.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [4] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }

    btnSelectRowUnitCode(code: String, name: String) {
        this.model.unit_code = code;
        this.model.unit_name = name;
        $('#lookupModalUnitCode').modal('hide');
    }

    btnClearUnit() {
        this.model.unit_code = '';
        this.model.unit_name = '';
        $('#datatable').DataTable().ajax.reload();
    }
    //#endregion UnitCode lookup

    //#region CurrencyCode Lookup
    btnLookupCurrencyCode() {
        $('#datatableLookupCurrencyCode').DataTable().clear().destroy();
        $('#datatableLookupCurrencyCode').DataTable({
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
                    'p_company_code': this.company_code,
                    'action': 'getResponse'
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysCurrencyCode, this.APIRouteForLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupcurrencycode = parse.data;

                    if (parse.data != null) {
                        this.lookupcurrencycode.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [4] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }

    btnSelectRowCurrencyCode(code: String, description: String) {
        this.model.currency_code = code;
        this.model.currency_name = description;
        $('#lookupModalCurrencyCode').modal('hide');
    }
    //#endregion CurrencyCode lookup

    //#region PaymentMethode Lookup
    btnLookupPaymentMethode() {
        $('#datatableLookupPaymentMethode').DataTable().clear().destroy();
        $('#datatableLookupPaymentMethode').DataTable({
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
                    'p_company_code': this.company_code,
                    'p_general_code': 'PYMTD',
                    'action': 'getResponse'
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIControllerPurchaseType, this.APIRouteForLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupPaymentMethode = parse.data;

                    if (parse.data != null) {
                        this.lookupPaymentMethode.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            order: [['4', 'asc']],
            columnDefs: [{ orderable: false, width: '5%', targets: [5] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }

    btnSelectRowPaymentMethode(code: String, description: String) {
        this.model.payment_methode_code = code;
        this.model.payment_methode_name = description;
        $('#lookupModalPaymentMethode').modal('hide');
    }
    //#endregion PaymentMethode lookup

    //#region Vendor Lookup
    btnLookupVendor() {
        $('#datatableLookupVendor').DataTable().clear().destroy();
        $('#datatableLookupVendor').DataTable({
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
                    'p_company_code': this.company_code,
                    'p_code': ' ',
                    'action': 'getResponse'
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.GetrowsBam(dtParameters, this.APIControllerVendor, this.APIRouteForLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupvendor = parse.data;

                    if (parse.data != null) {
                        this.lookupvendor.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }

    btnSelectRowVendor(code: String, description: String, address: String) {
        this.model.supplier_code = code;
        this.model.supplier_name = description;
        this.model.supplier_address = address;

        $('#lookupModalVendor').modal('hide');
    }
    //#endregion Vendor lookup

    //#region BranchCode Lookup
    btnLookupBranchCode() {
        $('#datatableLookupBranchCode').DataTable().clear().destroy();
        $('#datatableLookupBranchCode').DataTable({
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
                    'p_user_code': this.userId,
                    'action': 'getResponse'
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.ExecSpSys(dtParameters, this.APIControllerBranch, this.APIRouteForLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupbranchcode = parse.data;

                    if (parse.data != null) {
                        this.lookupbranchcode.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [4] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }

    btnSelectRowBranchCode(code: String, name: String) {
        this.model.branch_code = code;
        this.model.branch_name = name;
        this.branchCode = code;
        this.branchName = name;
        $('#lookupModalBranchCode').modal('hide');
    }
    //#endregion BranchCode lookup

    //#region DivisionCode Lookup
    btnLookupDivisionCode() {
        $('#datatableLookupDivisionCode').DataTable().clear().destroy();
        $('#datatableLookupDivisionCode').DataTable({
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
                    'p_company_code': this.company_code,
                    'action': 'getResponse'
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.ExecSpSys(dtParameters, this.APIControllerSysDivisionCode, this.APIRouteForLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupdivisioncode = parse.data;

                    if (parse.data != null) {
                        this.lookupdivisioncode.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [4] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }

    btnSelectRowDivisionCode(code: String, name: String) {
        this.model.division_code = code;
        this.model.division_name = name;
        this.model.department_code = undefined;
        this.model.department_name = undefined;
        this.model.sub_department_code = undefined;
        this.model.sub_department_name = undefined;
        this.model.unit_code = undefined;
        this.model.unit_name = undefined;
        $('#lookupModalDivisionCode').modal('hide');

    }
    btnClearDivision() {
        this.model.division_code = '';
        this.model.division_name = '';
        this.model.department_code = undefined;
        this.model.department_name = undefined;
        this.model.sub_department_code = undefined;
        this.model.sub_department_name = undefined;
        this.model.unit_code = undefined;
        this.model.unit_name = undefined;
        $('#datatable').DataTable().ajax.reload();
    }
    //#endregion DivisionCode lookup

    //#region Lookup Bank
    btnLookupBank() {
        $('#datatableLookupBank').DataTable().clear().destroy();
        $('#datatableLookupBank').DataTable({
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
                    'p_branch_code': this.model.branch_code,
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.GetrowsBam(dtParameters, this.APIControllerSysBranchBank, this.APIRouteLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupbank = parse.data;
                    if (parse.data != null) {
                        this.lookupbank.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 6] }],
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }

    btnSelectRowBank(bank_code: String, bank_name: string, bank_no: string) {
        this.model.to_bank_code = bank_code;
        this.model.to_bank_account_name = bank_name;
        this.model.to_bank_account_no = bank_no;
        $('#lookupModalBank').modal('hide');
    }

    btnClearBank() {
        this.model.to_bank_code = '';
        this.model.bank_name = '';
        this.model.to_bank_account_no = '';
        $('#datatable').DataTable().ajax.reload();
    }
    //#endregion Lookup Bank

    //#region Quotation Lookup
    btnLookupQuotation() {
        $('#datatableLookupQuotation').DataTable().clear().destroy();
        $('#datatableLookupQuotation').DataTable({
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
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIControllerQuotation, this.APIRouteLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupquotation = parse.data;
                    if (parse.data != null) {
                        this.lookupquotation.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 3] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }

    btnSelectRowQuotation(code: string) {
        this.model.supplier_selection_code = code;
        $('#lookupModalQuotation').modal('hide');
        $('#datatable').DataTable().ajax.reload();
    }

    btnClearQuotation() {
        this.model.supplier_selection_code = '';
        $('#datatable').DataTable().ajax.reload();
    }
    //#endregion Quotation lookup

    //#region btn print
    // btnPrint() {
    //     this.showSpinner = true;
    //     const dataParam = {
    //         TableName: 'RPT_PURCHASE_ORDER',
    //         SpName: 'xsp_rpt_purchase_order',
    //         reportparameters: {
    //             p_user_id: this.userId,
    //             p_code: this.param,
    //             p_print_option: 'PDF'
    //         }
    //     };

    //     this.dalservice.ReportFile(dataParam, this.APIControllerReport, this.APIRouteForDownload).subscribe(res => {
    //         this.printRptNonCore(res);
    //         this.showSpinner = false;
    //     }, err => {
    //         this.showSpinner = false;
    //         const parse = JSON.parse(err);
    //         this.swalPopUpMsg(parse.data);
    //     });

    // }

    //#endregion tbn print

    //#region btn print surat kuasa
    btnPrintSuratKuasa() {
        this.showSpinner = true;
        const dataParam = {
            TableName: 'RPT_SURAT_KUASA_PO',
            SpName: 'xsp_rpt_surat_kuasa_po',
            reportparameters: {
                p_user_id: this.userId,
                p_code: this.param,
                p_po_no: this.model.code,
                p_print_option: 'PDF'
            }
        };

        this.dalservice.ReportFile(dataParam, this.APIControllerReport, this.APIRouteForDownload).subscribe(res => {
            this.printRptNonCore(res);
            this.showSpinner = false;
        }, err => {
            this.showSpinner = false;
            const parse = JSON.parse(err);
            this.swalPopUpMsg(parse.data);
        });

    }

    //#endregion tbn print surat kuasa

    //#region btn print surat po faktur
    btnPrintPoFaktur() {
        if (this.printType === 'KAROSERI') {
            this.showSpinner = true;
            const dataParam = {
                TableName: 'RPT_PURCHASE_ORDER_KAROSERI',
                SpName: 'xsp_rpt_purchase_order_karoseri',
                reportparameters: {
                    p_user_id: this.userId,
                    p_code: this.param,
                    p_po_no: this.model.code,
                    p_is_mobilisasi : this.model.print_mobilisasi,
                    p_print_option: 'PDF'
                }
            };
            this.dalservice.ReportFile(dataParam, this.APIControllerReport, this.APIRouteForDownload).subscribe(res => {
                this.printRptNonCore(res);
                this.showSpinner = false;
            }, err => {
                this.showSpinner = false;
                const parse = JSON.parse(err);
                this.swalPopUpMsg(parse.data);
            });
        }
        else {
            this.showSpinner = true;
            const dataParam = {
                TableName: 'RPT_PURCHASE_ORDER_UNIT',
                SpName: 'xsp_rpt_purchase_order_unit',
                reportparameters: {
                    p_user_id: this.userId,
                    p_code: this.param,
                    p_po_no: this.model.code,
                    p_print_option: 'PDF'
                }
            };

            this.dalservice.ReportFile(dataParam, this.APIControllerReport, this.APIRouteForDownload).subscribe(res => {
                this.printRptNonCore(res);
                this.showSpinner = false;
            }, err => {
                this.showSpinner = false;
                const parse = JSON.parse(err);
                this.swalPopUpMsg(parse.data);
            });
        }


    }
    //#endregion tbn print surat po faktur

    //#region approval Lookup
    btnViewApproval() {
        $('#datatableLookupApproval').DataTable().clear().destroy();
        $('#datatableLookupApproval').DataTable({
            'pagingType': 'first_last_numbers',
            'pageLength': 5,
            'processing': true,
            'serverSide': true,
            responsive: true,
            lengthChange: false, // hide lengthmenu
            searching: true, // jika ingin hilangin search box nya maka false

            ajax: (dtParameters: any, callback) => {

                dtParameters.paramTamp = [];
                dtParameters.paramTamp.push({
                    'p_reff_no': this.param
                });


                this.dalservice.GetrowsApv(dtParameters, this.APIControllerApprovalSchedule, this.APIRouteForLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupapproval = parse.data;
                    if (parse.data != null) {
                        this.lookupapproval.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
            order: [[5, 'ASC']],
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }
    //#endregion approval Lookup

}

