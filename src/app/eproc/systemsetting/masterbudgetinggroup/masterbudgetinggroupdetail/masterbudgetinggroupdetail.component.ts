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
    templateUrl: './masterbudgetinggroupdetail.component.html'
})

export class MasterbudgetinggroupDetailComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');

    // variable
    public NumberOnlyPattern = this._numberonlyformat;
    public EmailPattern = this._emailformat;
    public budgetinggroupData: any = [];
    public orderdetaillist: any = [];
    public isReadOnly: Boolean = false;
    public setStyle: any = [];

    public lookupbranch: any = [];
    public lookupdivision: any = [];
    public lookupdepartment: any = [];
    public lookupsubdepartment: any = [];
    public lookupunits: any = [];
    public lookupgrouplevel: any = [];
    public budgeting_by: any;
    private dataTamp: any = [];
    private dataRoleTamp: any = [];

    private APIController: String = 'MasterBudgetingGroup';
    private APIControllerBranch: String = 'SysBranch';
    private APIControllerDivision: String = 'MasterDivision';
    private APIControllerDepartment: String = 'MasterDepartment';
    private APIControllerSubDepartment: String = 'MasterSubDepartment';
    private APIControllerUnits: String = 'MasterUnit';
    private APIControllerMasterItemGroup: String = 'MasterItemGroup';


    private APIRouteForGetRow: String = 'GetRow';
    private APIRouteForInsert: String = 'Insert';
    private APIRouteForUpdate: String = 'Update';
    private APIRouteLookup: String = 'GetRowsForLookup';
    private APIRouteLookupGroupLevel: String = 'GetRowsForLookupBudgetingGroupLevel';
    private APIRouteForProceed: String = 'ExecSpForProceed';
    private APIRouteForReturn: String = 'ExecSpForReturn';
    private APIRouteForCancel: String = 'ExecSpForCancel';
    private APIRouteForPost: String = 'ExecSpForPost';
    private APIRouteForReject: String = 'ExecSpForReject';
    private RoleAccessCode = 'R00021490000000A';

    // form 2 way binding
    model: any = {};

    // checklist
    public selectedAll: any;

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
        //this.wizard();
        if (this.param != null) {
            this.isReadOnly = true;
            this.callGetrow();
            //this.quantitywiz();
        } else {
            this.showSpinner = false;
            this.model.company_code = this.company_code;
            this.model.status = 'NEW';
            this.model.budgeting_by = 'AMOUNT';
        }
    }

    //#region getrow data
    callGetrow() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_code': this.param
        }];
        // end param tambahan untuk getrow dynamic

        this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    const parsedata = this.getrowNgb(parse.data[0]);
                    setTimeout(() => {
                        if (parsedata.budgeting_by === 'AMOUNT') {
                            $('#tabbudgetinggroupqty').remove();
                            this.amountwiz();
                        }
                        else {
                            $('#tabbudgetinggroupamount').remove();
                            this.quantitywiz();
                        }
                        this.wizard();
                    });

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
    onFormSubmit(MasterBudgetingGroupForm: NgForm, isValid: boolean) {
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

        this.budgetinggroupData = this.JSToNumberFloats(MasterBudgetingGroupForm);

        const usersJson: any[] = Array.of(this.budgetinggroupData);

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
                            this.route.navigate(['/systemsetting/submasterbudgetinggrouplist/masterbudgetinggroupdetail', parse.code]);
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

    //#region button back
    btnBack() {
        this.route.navigate(['/systemsetting/submasterbudgetinggrouplist']);
        $('#datatable').DataTable().ajax.reload();
    }
    //#endregion button back

    //#region quantity wiz, amount wiz tabs
    quantitywiz() {
        this.route.navigate(['/systemsetting/submasterbudgetinggrouplist/masterbudgetinggroupdetail/' + this.param + '/masterbudgetinggroupquantitywizlist', this.param], { skipLocationChange: true });
    }

    amountwiz() {
        this.route.navigate(['/systemsetting/submasterbudgetinggrouplist/masterbudgetinggroupdetail/' + this.param + '/masterbudgetinggroupamountwizlist', this.param], { skipLocationChange: true });
    }
    //#endregion quantity wiz, amount wiz tabs

    //#region btnProceed
    btnProceed() {
        // param tambahan untuk getrole dynamic
        this.dataRoleTamp = [{
            'p_code': this.param,
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
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForProceed)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.callGetrow();
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
        })
    }
    //#endregion btnProceed

    //#region btnReturn
    btnReturn() {
        // param tambahan untuk getrole dynamic
        this.dataRoleTamp = [{
            'p_code': this.param,
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
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReturn)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.showNotification('bottom', 'right', 'success');
                                window.location.reload()
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
    //#endregion btnReturn

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

    //#region btnPost
    btnPost() {
        // param tambahan untuk getrole dynamic
        this.dataRoleTamp = [{
            'p_code': this.param,
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
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForPost)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.callGetrow();
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
        })
    }
    //#endregion btnPost

    //#region btnReject
    btnReject() {
        // param tambahan untuk getrole dynamic
        this.dataRoleTamp = [{
            'p_code': this.param,
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
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReject)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.callGetrow();
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
        })
    }
    //#endregion btnReject

    //#region Branch Lookup
    btnLookupBranch() {
        $('#datatableLookupBranch').DataTable().clear().destroy();
        $('#datatableLookupBranch').DataTable({
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
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.GetrowsSys(dtParameters, this.APIControllerBranch, this.APIRouteLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupbranch = parse.data;
                    if (parse.data != null) {
                        this.lookupbranch.numberIndex = dtParameters.start;
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

    btnSelectRowBranch(code: string, description: string) {
        this.model.branch_code = code;
        this.model.branch_name = description;
        $('#lookupModalBranch').modal('hide');
        $('#datatable').DataTable().ajax.reload();
    }
    //#endregion Branch From lookup

    //#region From Division Lookup
    btnLookupDivision() {
        $('#datatableLookupDivision').DataTable().clear().destroy();
        $('#datatableLookupDivision').DataTable({
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
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.GetrowsBam(dtParameters, this.APIControllerDivision, this.APIRouteLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    this.lookupdivision = parse.data;
                    if (parse.data != null) {
                        this.lookupdivision.numberIndex = dtParameters.start;
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

    btnSelectRowDivision(code: string, description: string) {
        this.model.division_code = code;
        this.model.division_name = description;
        this.model.department_code = '';
        this.model.department_name = '';
        this.model.sub_department_code = '';
        this.model.sub_department_name = '';
        this.model.units_code = '';
        this.model.units_name = '';
        $('#lookupModalDivision').modal('hide');
        $('#datatable').DataTable().ajax.reload();
    }
    //#endregion Division lookup

    //#region From Department Lookup
    btnLookupDepartment() {
        $('#datatableLookupDepartment').DataTable().clear().destroy();
        $('#datatableLookupDepartment').DataTable({
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
                    'p_division_code': this.model.division_code
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.GetrowsBam(dtParameters, this.APIControllerDepartment, this.APIRouteLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    this.lookupdepartment = parse.data;
                    if (parse.data != null) {
                        this.lookupdepartment.numberIndex = dtParameters.start;
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

    btnSelectRowDepartment(code: string, description: string) {
        this.model.department_code = code;
        this.model.department_name = description;
        this.model.sub_department_code = '';
        this.model.sub_department_name = '';
        $('#lookupModalDepartment').modal('hide');
        $('#datatable').DataTable().ajax.reload();
    }
    //#endregion Department lookup

    //#region From SubDepartment Lookup
    btnLookupSubDepartment() {
        $('#datatableLookupSubDepartment').DataTable().clear().destroy();
        $('#datatableLookupSubDepartment').DataTable({
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
                    'p_division_code': this.model.division_code,
                    'p_department_code': this.model.department_code
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.GetrowsBam(dtParameters, this.APIControllerSubDepartment, this.APIRouteLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    this.lookupsubdepartment = parse.data;
                    if (parse.data != null) {
                        this.lookupsubdepartment.numberIndex = dtParameters.start;
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

    btnSelectRowSubDepartment(code: string, description: string) {
        this.model.sub_department_code = code;
        this.model.sub_department_name = description;
        $('#lookupModalSubDepartment').modal('hide');
        $('#datatable').DataTable().ajax.reload();
    }
    //#endregion SubDepartment lookup

    //#region From Units Lookup
    btnLookupUnits() {
        $('#datatableLookupUnits').DataTable().clear().destroy();
        $('#datatableLookupUnits').DataTable({
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
                    'p_division_code': this.model.division_code,
                    'p_department_code': this.model.department_code,
                    'p_sub_department_code': this.model.sub_department_code
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.GetrowsBam(dtParameters, this.APIControllerUnits, this.APIRouteLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    this.lookupunits = parse.data;
                    if (parse.data != null) {
                        this.lookupunits.numberIndex = dtParameters.start;
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

    btnSelectRowUnits(code: string, description: string) {
        this.model.units_code = code;
        this.model.units_name = description;
        $('#lookupModalUnits').modal('hide');
        $('#datatable').DataTable().ajax.reload();
    }
    //#endregion Units lookup

    //#region Group Level Lookup
    btnLookupGroupLevel() {
        $('#datatableLookupGroupLevel').DataTable().clear().destroy();
        $('#datatableLookupGroupLevel').DataTable({
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
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.ExecSp(dtParameters, this.APIControllerMasterItemGroup, this.APIRouteLookupGroupLevel).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    this.lookupgrouplevel = parse.data;
                    if (parse.data != null) {
                        this.lookupgrouplevel.numberIndex = dtParameters.start;
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

    btnSelectRowGroupLevel(grouplevel: string) {
        this.model.group_level = grouplevel;
        $('#lookupModalGroupLevel').modal('hide');
        $('#datatable').DataTable().ajax.reload();
    }
    //#endregion Group Level lookup
}

