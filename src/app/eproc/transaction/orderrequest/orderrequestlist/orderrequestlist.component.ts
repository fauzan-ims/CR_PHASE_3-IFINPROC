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
    templateUrl: './orderrequestlist.component.html'
})

export class OrderRequestListComponent extends BaseComponent implements OnInit {
    // variable
    public NumberOnlyPattern = this._numberonlyformat;
    public listpoprocess: any = [];
    public dataTampproceed: any = [];
    public datatamplist: any = [];
    public tampStatus: any[];
    private idDetailForReason: any;
    private dataTamp: any = [];
    public lookupbranch: any = [];
    public lookupcurrencycode: any = [];
    public lookupvendor: any = [];
    public listdataDetail: any = [];
    public idDetailList: string;
    public readOnlyListDetail: string;
    private dataTampProceed: any = [];
    public tampStatusType: String;

    //controller
    private APIController: String = 'SupplierSelection';
    private APIControllerSupplierSelectionDetail: String = 'SupplierSelectionDetail';
    private APIControllerBranch: String = 'SysBranch';
    private APIControllerSysCurrencyCode: String = 'SysCurrency';
    private APIControllerVendor: String = 'MasterVendor';

    //routing
    private APIRouteForGetRowsProcess: String = 'GetRowsProcess';
    private APIRouteForProceed: String = 'ExecSpForProceed';
    private APIRouteForReject: String = 'ExecSpForRejected';
    private APIRouteForLookup: String = 'GetRowsForLookup';
    private APIRouteForUpdateItem: String = 'ExecSpForUpdateItem';
    private APIRouteForSupplierUpdate: String = 'UpdateForSupplier';
    private APIRouteForUpdateAmount: String = 'UpdateForAmount';
    private APIRouteForReturn: String = 'ExecSpForReturn';

    private RoleAccessCode = 'R00022390000000A';

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
        this.model.is_termin = '0';
        this.tampStatusType = 'HOLD';
        this.loadData();
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
                    'p_status': this.tampStatusType,
                });
                // end param tambahan untuk getrows dynamic

                this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRowsProcess).subscribe(resp => {
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
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
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
        this.route.navigate(['/transaction/suborderlist/deskcolldetail', codeEdit]);
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
                    'p_code': '',
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
                }, err => console.log('There was an error while retrieving Data(API)' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '

            },
            searchDelay: 800 // pake ini supaya gak bug search
        });

        this.idDetailForReason = id;
    }

    btnSelectRowVendor(code: String, name: string) {

        this.model.supplier_code = code;
        this.model.supplier_name_detail = name;

        this.listdataDetail = [];

        var i = 0;

        var getID = $('[name="p_id"]')
            .map(function () { return $(this).val(); }).get();

        while (i < getID.length) {
            if (getID[i] == this.idDetailForReason) {
                this.listdataDetail.push({
                    p_id: getID[i],
                    p_supplier_code: code,
                });
            }
            i++;
        }

        //#region web service
        this.dalservice.Update(this.listdataDetail, this.APIControllerSupplierSelectionDetail, this.APIRouteForSupplierUpdate)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                        $('#datatables').DataTable().ajax.reload();
                    } else {
                        this.swalPopUpMsg(parse.data);
                    }
                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);
                });
        //#endregion web service
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

    //#region btn proceed
    btnProceed() {
        this.dataTampProceed = [];
        this.checkedList = [];
        for (let i = 0; i < this.listpoprocess.length; i++) {
            if (this.listpoprocess[i].selected) {
                this.checkedList.push({
                    'ID': this.listpoprocess[i].id,
                })
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
        this.dataTamp = [];
        swal({
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

                let th = this;
                var i = 0;
                (function loopPoProceesProceed() {
                    if (i < th.checkedList.length) {
                        th.dataTampProceed = [{
                            'p_id': th.checkedList[i].ID,
                            'action': '',
                        }];
                        th.dalservice.ExecSp(th.dataTampProceed, th.APIController, th.APIRouteForProceed)
                            .subscribe(
                                res => {
                                    const parse = JSON.parse(res);
                                    if (parse.result === 1) {
                                        if (th.checkedList.length == i + 1) {
                                            th.showNotification('bottom', 'right', 'success');
                                            $('#datatables').DataTable().ajax.reload();
                                            th.showSpinner = false;
                                        } else {
                                            i++;
                                            loopPoProceesProceed();
                                        }
                                    } else {
                                        th.swalPopUpMsg(parse.data);
                                        th.showSpinner = false;
                                    }
                                },
                                error => {
                                    const parse = JSON.parse(error);
                                    th.swalPopUpMsg(parse.data);
                                    th.showSpinner = false;
                                });
                    }

                })();
            } else {
                this.showSpinner = false;
            }
        });
    }
    //#endregion btn proceed

    //#region btn reject
    btnReject() {
        this.dataTampProceed = [];
        this.checkedList = [];
        for (let i = 0; i < this.listpoprocess.length; i++) {
            if (this.listpoprocess[i].selected) {
                this.checkedList.push({
                    'ID': this.listpoprocess[i].id,
                })
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
        this.dataTamp = [];
        swal({
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

                let th = this;
                var i = 0;
                (function loopPoProceesProceed() {
                    if (i < th.checkedList.length) {
                        th.dataTampProceed = [{
                            'p_id': th.checkedList[i].ID,
                            'action': ''
                        }];
                        th.dalservice.ExecSp(th.dataTampProceed, th.APIController, th.APIRouteForReject)
                            .subscribe(
                                res => {
                                    const parse = JSON.parse(res);
                                    if (parse.result === 1) {
                                        if (th.checkedList.length == i + 1) {
                                            th.showNotification('bottom', 'right', 'success');
                                            $('#datatables').DataTable().ajax.reload();
                                            th.showSpinner = false;
                                        } else {
                                            i++;
                                            loopPoProceesProceed();
                                        }
                                    } else {
                                        th.swalPopUpMsg(parse.data);
                                        th.showSpinner = false;
                                    }
                                },
                                error => {
                                    const parse = JSON.parse(error);
                                    th.swalPopUpMsg(parse.data);
                                    th.showSpinner = false;
                                });
                    }
                })();
            } else {
                this.showSpinner = false;
            }
        });
    }
    //#endregion btn reject

    //#region btn reject
    btnReturn() {
        this.dataTampProceed = [];
        this.checkedList = [];
        for (let i = 0; i < this.listpoprocess.length; i++) {
            if (this.listpoprocess[i].selected) {
                this.checkedList.push({
                    'ID': this.listpoprocess[i].id,
                })
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
        this.dataTamp = [];
        swal({
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

                let th = this;
                var i = 0;
                (function loopPoProceesProceed() {
                    if (i < th.checkedList.length) {
                        th.dataTampProceed = [{
                            'p_id': th.checkedList[i].ID,
                            'action': ''
                        }];
                        th.dalservice.ExecSp(th.dataTampProceed, th.APIControllerSupplierSelectionDetail, th.APIRouteForReturn)
                            .subscribe(
                                res => {
                                    const parse = JSON.parse(res);
                                    if (parse.result === 1) {
                                        if (th.checkedList.length == i + 1) {
                                            th.showNotification('bottom', 'right', 'success');
                                            $('#datatables').DataTable().ajax.reload();
                                            th.showSpinner = false;
                                        } else {
                                            i++;
                                            loopPoProceesProceed();
                                        }
                                    } else {
                                        th.swalPopUpMsg(parse.data);
                                        th.showSpinner = false;
                                    }
                                },
                                error => {
                                    const parse = JSON.parse(error);
                                    th.swalPopUpMsg(parse.data);
                                    th.showSpinner = false;
                                });
                    }
                })();
            } else {
                this.showSpinner = false;
            }
        });
    }
    //#endregion btn reject

    //#region button save in list
    btnSaveList() {

        this.showSpinner = true;
        this.datatamplist = [];
        let j = 0;

        const getID = $('[name="p_id_doc"]')
            .map(function () { return $(this).val(); }).get();
        const getSupplierCode = $('[name="p_supplier_code"]')
            .map(function () { return $(this).val(); }).get();
        const getPriceAmount = $('[name="p_price_amount_list"]')
            .map(function () { return $(this).val(); }).get();

        while (j < getID.length) {

            if (getPriceAmount[j] == null) {
                swal({
                    title: 'Warning',
                    text: 'Please Fill Price Amount first',
                    buttonsStyling: false,
                    confirmButtonClass: 'btn btn-danger',
                    type: 'warning'
                }).catch(swal.noop)
                return;
            }

            this.datatamplist.push(
                this.JSToNumberFloats({
                    p_id: getID[j],
                    p_supplier_code: getSupplierCode[j],
                    p_price_amount: getPriceAmount[j],
                    action: 'default'
                }));
            j++;
        }
        //#region web service
        this.dalservice.Update(this.datatamplist, this.APIController, this.APIRouteForUpdateItem)
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
            $('#price_amount_list' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#price_amount_list' + i)
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
            $('#price_amount_list' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#price_amount_list' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }
    //#endregion onFocus

    //#region amount
    amount(event, id, quotation_quantity) {
        // param tambahan untuk update dynamic
        this.dataTamp = [{
            'p_id': id,
            'p_amount': event.target.value,
            'p_quotation_quantity': quotation_quantity
        }];
        // end param tambahan untuk update dynamic    

        // call web service
        this.dalservice.Update(this.dataTamp, this.APIControllerSupplierSelectionDetail, this.APIRouteForUpdateAmount)
            .subscribe(
                res => {
                    this.showSpinner = false;
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                        this.showNotification('bottom', 'right', 'success');
                        $('#datatablesuppliercoldetail').DataTable().ajax.reload();
                    } else {
                        this.swalPopUpMsg(parse.data);
                    }
                },
                error => {
                    this.showSpinner = false;
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data)
                });
    }
    //#endregion amount

    selectAllTable() {
        for (let i = 0; i < this.listpoprocess.length; i++) {
            if (this.listpoprocess[i].is_calculated !== '1') {
                this.listpoprocess[i].selected = this.selectedAll;
            }
        }
    }

    checkIfAllTableSelected() {
        this.selectedAll = this.listpoprocess.every(function (item: any) {
            return item.selected === true;
        })
    }

    //#region ddl PageStatusType
    PageStatusType(event: any) {
        this.tampStatusType = event.target.value;
        $('#datatables').DataTable().ajax.reload();
    }
    //#endregion ddl PageStatusType
}
