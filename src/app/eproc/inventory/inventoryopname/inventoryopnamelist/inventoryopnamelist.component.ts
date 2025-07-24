import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './inventoryopnamelist.component.html'
})

export class InventoryOpnameListComponent extends BaseComponent implements OnInit {
    // variable
    public NumberOnlyPattern = this._numberonlyformat;
    public listpoprocess: any = [];
    public dataTampproceed: any = [];
    public datatamplist: any = [];
    public tampStatus: any[];
    private dataTampPush: any[];
    private dataRoleTamp: any = [];
    public lookupbranch: any = [];
    public lookupcurrencycode: any = [];
    public lookupvendor: any = [];
    public lookupwarehousecode: any = [];
    public listdataDetail: any = [];
    public idDetailList: string;
    public readOnlyListDetail: string;
    public tampStatusType: String;

    //controller
    private APIControllerpo: String = 'InventoryOpname';
    private APIController: String = 'SupplierSelection';
    private APIControllerSysWarehouseCode: String = 'MasterWarehouse';
    private APIControllerBranch: String = 'SysBranch';
    private APIControllerSysCurrencyCode: String = 'SysCurrency';
    private APIControllerVendor: String = 'MasterVendor';

    //routing
    private APIRouteForGetRows: String = 'GetRows';
    private APIRouteForProceed: String = 'ExecSpForProceed';
    private APIRouteForPost: String = 'ExecSpForPostAll';
    private APIRouteForLookup: String = 'GetRowsForLookup';
    private APIRouteForUpdateItem: String = 'Update';
    private APIRouteForGenerate: String = 'ExecSpForGenerate';
    private RoleAccessCode = 'R00021670000000A';

    // checklist
    public selectedAll: any;
    private checkedList: any = [];
    public selectedAllTable: any;

    // form 2 way binding
    model: any = {};


    // spinner
    showSpinner: Boolean = false;
    // end

    // ini buat datatables
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};

    constructor(private dalservice: DALService,
        public route: Router,
        private _location: Location,
        private _elementRef: ElementRef) { super(); }

    ngOnInit() {
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        this.compoSide(this._location, this._elementRef, this.route);
        this.loadData();
        this.tampStatusType = 'NEW';

    }

    //#region load all data
    loadData() {
        this.dtOptions = {
            pagingType: 'full_numbers',
            responsive: true,
            serverSide: true,
            processing: true,
            paging: true,
            'lengthMenu': [
                [10, 25, 50, 100],
                [10, 25, 50, 100]
            ],
            ajax: (dtParameters: any, callback) => {
                // param tambahan untuk getrows dynamic
                dtParameters.paramTamp = [];
                dtParameters.paramTamp.push({
                    'p_company_code': this.company_code,
                    'p_branch_code': this.model.branch_code,
                    'p_warehouse_code': this.model.warehouse_code,
                    'p_status': this.tampStatusType,
                });
                // end param tambahan untuk getrows dynamic

                this.dalservice.Getrows(dtParameters, this.APIControllerpo, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp)

                    this.listpoprocess = parse.data;

                    if (parse.data != null) {
                        this.listpoprocess.numberIndex = dtParameters.start;
                    }
                    // if use checkAll use this
                    $('#checkall').prop('checked', false);
                    // end checkall

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });

                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        }
    }
    //#endregion load all data

    //#region button edit
    btnEdit(codeEdit: string) {
        this.route.navigate(['/inventory/subinventoryopnamelist/inventoryopnamedetail', codeEdit]);
    }
    //#endregion button edit

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
                    'p_user_code': this.userId,
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.GetrowsSys(dtParameters, this.APIControllerBranch, this.APIRouteForLookup).subscribe(resp => {
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
        $('#datatables').DataTable().ajax.reload();
    }

    btnClearGroup() {
        this.model.branch_code = '';
        this.model.branch_name = '';
        $('#datatables').DataTable().ajax.reload();
    }
    //#endregion Branch Lookup

    //#region supplier Lookup
    btnLookupVendor(id: any) {
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
                this.dalservice.GetrowsSys(dtParameters, this.APIControllerVendor, this.APIRouteForLookup).subscribe(resp => {
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
            order: [['4', 'asc']],
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
        // this.idDetailForReason = id;
    }

    btnSelectRowVendor(code: String, description: String) {
        // this.listdataDetail = [];

        // var i = 0;

        // var getID = $('[name="p_id_doc"]')
        //   .map(function () { return $(this).val(); }).get();

        // while (i < getID.length) {

        //   if (getID[i] == this.idDetailForReason) {

        //     this.listdataDetail.push({
        //       p_id: getID[i],
        //       p_supplier_code: code,
        //     });
        //   }

        //   i++;
        // }
        this.model.supplier_code = code;
        this.model.supplier_name_detail = description;
        $('#lookupModalVendor').modal('hide');
    }
    //#endregion supplier lookup

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

    //#region btnProceed
    // btnProceed() {
    //     this.checkedList = [];
    //     for (let i = 0; i < this.listpoprocess.length; i++) {
    //         if (this.listpoprocess[i].selected) {
    //             this.checkedList.push(
    //                 this.listpoprocess[i].code,
    //             );
    //         }
    //     }

    //     // jika tidak di checklist
    //     if (this.checkedList.length === 0) {
    //         swal({
    //             title: this._listdialogconf,
    //             buttonsStyling: false,
    //             confirmButtonClass: 'btn btn-danger'
    //         }).catch(swal.noop)
    //         return
    //     }

    //     for (let J = 0; J < this.checkedList.length; J++) {
    //         const code = this.checkedList[J];
    //         this.dataTampproceed = [{
    //             'p_code': code,
    //         }];
    //         // call web service

    //         console.log('this.dataTampproceed', this.dataTampproceed);
    //         swal({
    //             title: 'Are you sure?',
    //             type: 'warning',
    //             showCancelButton: true,
    //             confirmButtonClass: 'btn btn-success',
    //             cancelButtonClass: 'btn btn-danger',
    //             confirmButtonText: 'Yes',
    //             buttonsStyling: false
    //         }).then((result) => {
    //             console.log("masuk then");

    //             if (result.value) {
    //                 console.log("masuk result", result.value);

    //                 this.dalservice.ExecSp(this.dataTampproceed, this.APIController, this.APIRouteForProceed)
    //                     .subscribe(
    //                         res => {
    //                             const parse = JSON.parse(res);
    //                             console.log("parse", parse);
    //                             console.log("res", res);

    //                             if (parse.result === 1) {
    //                                 console.log("masuk result 1");

    //                                 $('#datatables').DataTable().ajax.reload();
    //                                 this.showNotification('bottom', 'right', 'success');
    //                                 window.location.reload()
    //                             } else {

    //                                 console.log("masuk result 0");
    //                                 this.swalPopUpMsg(parse.data);
    //                             }
    //                         },
    //                         error => {
    //                             console.log("masuk errror");

    //                             this.showSpinner = false;
    //                             const parse = JSON.parse(error);
    //                             this.swalPopUpMsg(parse.data);
    //                         });
    //             } else {
    //                 console.log("masuk else");

    //                 this.showSpinner = false;
    //             }
    //         });
    //     }
    // }

    // selectAll() {
    //     for (let i = 0; i < this.listpoprocess.length; i++) {
    //         this.listpoprocess[i].selected = this.selectedAll;
    //     }
    // }

    // checkIfAllTableSelected() {
    //     this.selectedAll = this.listpoprocess.every(function (item: any) {
    //         return item.selected === true;
    //     })
    // }
    //#endregion btnProceed

    //#region button Proceed
    btnProceed() {
        // param tambahan untuk button Proceed dynamic

        this.dataRoleTamp = [{
            'p_company_code': this.company_code,
            'action': 'default'
        }];
        // param tambahan untuk button Proceed dynamic

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
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIControllerpo, this.APIRouteForProceed)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.showNotification('bottom', 'right', 'success');
                                $('#datatables').DataTable().ajax.reload();
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

    //#region button Proceed
    btnPost() {
        // param tambahan untuk button Proceed dynamic

        this.dataRoleTamp = [{
            'p_company_code': this.company_code,
            'action': 'default'
        }];
        // param tambahan untuk button Proceed dynamic

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
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIControllerpo, this.APIRouteForPost)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.showNotification('bottom', 'right', 'success');
                                $('#datatables').DataTable().ajax.reload();
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

    //#region button Post
    // btnPost(code: string) {
    //     // param tambahan untuk button Post dynamic

    //     this.dataRoleTamp = [{
    //         'p_code': code,
    //         'p_company_code': this.company_code,
    //         'action': 'default'
    //     }];
    //     // param tambahan untuk button Post dynamic

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
    //             // call web service
    //             this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForPost)
    //                 .subscribe(
    //                     res => {
    //                         this.showSpinner = false;
    //                         const parse = JSON.parse(res);
    //                         if (parse.result === 1) {
    //                             // this.callGetrow();
    //                             this.showNotification('bottom', 'right', 'success');
    //                             window.location.reload();
    //                             // this.route.navigate(['/mutation/returndetail', this.param]);
    //                         } else {
    //                             this.swalPopUpMsg(parse.data);
    //                         }
    //                     },
    //                     error => {
    //                         this.showSpinner = false;
    //                         const parse = JSON.parse(error);
    //                         this.swalPopUpMsg(parse.data);
    //                     });
    //         } else {
    //             this.showSpinner = false;
    //         }
    //     });
    // }
    //#endregion button Post

    //#region button Approve
    btnApprove() {

        this.checkedList = [];
        for (let i = 0; i < this.listpoprocess.length; i++) {
            if (this.listpoprocess[i].selected) {
                this.checkedList.push({
                    Code: this.listpoprocess[i].code,
                });
            }
        }

        // jika tidak di checklist
        if (this.checkedList.length === 0) {
            swal({
                title: this._listdialogconf,
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-danger'
            }).catch(swal.noop)
            return
        }

        const getID = $('[name="p_id_doc"]')
            .map(function () { return $(this).val(); }).get();
        const getPriceAmount = $('[name="p_price_amount_list"]')
            .map(function () { return $(this).val(); }).get();
        const getSupplierCode = $('[name="p_supplier_code"]')
            .map(function () { return $(this).val(); }).get();
        const getCurrencyCode = $('[name="p_currency_code"]')
            .map(function () { return $(this).val(); }).get();
        const getCurrencyName = $('[name="p_currency_name"]')
            .map(function () { return $(this).val(); }).get();
        const getTermin = $('[name="p_is_termin"]')
            .map(function () { return $(this).val(); }).get();

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
                this.dataRoleTamp = [];
                for (let J = 0; J < this.checkedList.length; J++) {

                    if (getPriceAmount[J] == null) {
                        swal({
                            title: 'Warning',
                            text: 'Please Fill Price Amount first',
                            buttonsStyling: false,
                            confirmButtonClass: 'btn btn-danger',
                            type: 'warning'
                        }).catch(swal.noop)
                        return;
                    }

                    if (getSupplierCode[J] == null || getSupplierCode[J] == '') {
                        swal({
                            title: 'Warning',
                            text: 'Please Fill Supplier first',
                            buttonsStyling: false,
                            confirmButtonClass: 'btn btn-danger',
                            type: 'warning'
                        }).catch(swal.noop)
                        return;
                    }

                    if (getCurrencyCode[J] == null || getCurrencyCode[J] == '') {
                        swal({
                            title: 'Warning',
                            text: 'Please Fill Currency Code first',
                            buttonsStyling: false,
                            confirmButtonClass: 'btn btn-danger',
                            type: 'warning'
                        }).catch(swal.noop)
                        return;
                    }

                    if (getCurrencyName[J] == null || getCurrencyName[J] == '') {
                        swal({
                            title: 'Warning',
                            text: 'Please Fill Currency Name first',
                            buttonsStyling: false,
                            confirmButtonClass: 'btn btn-danger',
                            type: 'warning'
                        }).catch(swal.noop)
                        return;
                    }

                    // param tambahan untuk getrow dynamic
                    this.dataRoleTamp = [{
                        'p_code': this.checkedList[J].Code,
                        'p_company_code': this.company_code,
                        'p_supplier_code': getSupplierCode[J],
                        'p_currency_code': getCurrencyCode[J],
                        'p_currency_name': getCurrencyName[J],
                        'p_is_termin': getTermin[J],
                        'action': 'default',
                    }];

                    // end param tambahan untuk getrow dynamic
                    this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForProceed)
                        .subscribe(
                            ress => {
                                const parses = JSON.parse(ress);
                                if (parses.result === 1) {
                                    if (J + 1 === this.checkedList.length) {
                                        this.showSpinner = false;
                                        window.location.reload();
                                        $('#datatables').DataTable().ajax.reload();
                                        this.showNotification('bottom', 'right', 'success');
                                    }
                                } else {
                                    this.showSpinner = false;
                                    $('#datatables').DataTable().ajax.reload();
                                    this.swalPopUpMsg(parses.data);
                                }
                            },
                            error => {
                                this.showSpinner = false;
                                const parses = JSON.parse(error);
                                this.swalPopUpMsg(parses.data);
                            });
                }
            } else {
                this.showSpinner = false;
            }
        });
    }
    //#endregion button Approve

    //#region button Generate
    btnGenerate() {
        // param tambahan untuk button Post dynamic

        this.dataRoleTamp = [{
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
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIControllerpo, this.APIRouteForGenerate)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.showNotification('bottom', 'right', 'success');
                                $('#datatables').DataTable().ajax.reload();
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
    //#endregion button Generate

    //#region button save in list
    btnSaveList() {

        this.showSpinner = true;
        this.datatamplist = [];
        let j = 0;

        const getCode = $('[name="p_code"]')
            .map(function () { return $(this).val(); }).get();
        const getPriceAmount = $('[name="p_quantity_opname"]')
            .map(function () { return $(this).val(); }).get();
        while (j < getCode.length) {

            this.datatamplist.push(
                this.JSToNumberFloats({
                    p_code: getCode[j],
                    p_quantity_opname: getPriceAmount[j],
                    p_company_code: this.company_code,
                    action: 'default'
                }));
            j++;
        }
        //#region web service
        this.dalservice.Update(this.datatamplist, this.APIControllerpo, this.APIRouteForUpdateItem)
            .subscribe(
                res => {
                    this.showSpinner = false;
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                        this.showSpinner = false;
                        this.showNotification('bottom', 'right', 'success');
                        $('#datatables').DataTable().ajax.reload();
                    } else {
                        this.swalPopUpMsg(parse.data);
                    }
                },
                error => {
                    this.showSpinner = false;
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);
                });
        //#endregion web service

    }
    //#endregion button save in list

    //#region onBlur
    onBlur(event, i, type) {
        if (type === 'amount') {
            if (event.target.value.match('[0-9]+(,[0-9]+)')) {
                if (event.target.value.match('(\.\d+)')) {

                    event = '' + event.target.value;
                    event = event.trim();
                    event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
                } else {
                    event = '' + event.target.value;
                    event = event.trim();
                    event = parseFloat(event.replace(/,/g, '')).toFixed(2); // ganti jadi 6 kalo mau pct
                    event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
                }
            } else {
                event = '' + event.target.value;
                event = event.trim();
                event = parseFloat(event).toFixed(2); // ganti jadi 6 kalo mau pct
                event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
            }
        } else {
            event = '' + event.target.value;
            event = event.trim();
            event = parseFloat(event).toFixed(6);
        }

        if (event === 'NaN') {
            event = 0;
            event = parseFloat(event).toFixed(2);
        }

        if (type === 'amount') {
            $('#quantity_opname' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#quantity_opname' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }
    //#endregion onBlur

    //#region onFocus
    onFocus(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#quantity_opname' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#quantity_opname' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }
    //#endregion onFocus

    //#region warehouse Lookup
    btnLookupWarehouseCode() {
        $('#datatableLookupWarehouseCode').DataTable().clear().destroy();
        $('#datatableLookupWarehouseCode').DataTable({
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
                this.dalservice.Getrows(dtParameters, this.APIControllerSysWarehouseCode, this.APIRouteForLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupwarehousecode = parse.data;

                    if (parse.data != null) {
                        this.lookupwarehousecode.numberIndex = dtParameters.start;
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

    btnSelectRowWarehouseCode(code: String, description: String) {
        this.model.warehouse_code = code;
        this.model.warehouse_name = description;
        $('#lookupModalWarehouseCode').modal('hide');
        $('#datatables').DataTable().ajax.reload();

    }

    btnClearWarehouseGroup() {
        this.model.warehouse_code = '';
        this.model.warehouse_name = '';
        $('#datatables').DataTable().ajax.reload();
    }
    //#endregion warehouse lookup

    //#region ddl PageStatusType
    PageStatusType(event: any) {
        this.tampStatusType = event.target.value;
        $('#datatables').DataTable().ajax.reload();
    }
    //#endregion ddl PageStatusType
}
