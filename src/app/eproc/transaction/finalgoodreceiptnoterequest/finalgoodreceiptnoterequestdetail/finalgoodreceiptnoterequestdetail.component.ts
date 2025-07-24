import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { DataTableDirective } from 'angular-datatables';

declare var $: any;

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './finalgoodreceiptnoterequestdetail.component.html'
})

export class FinalGoodReceiptNoteRequestdetailComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');

    // variable
    public NumberOnlyPattern: string = this._numberonlyformat;
    public supplierCollectionList: any = [];
    public finalGRNlist: any = [];
    public isReadOnly: Boolean = false;
    private dataTamp: any = [];
    private dataTampPush: any[];
    public tampHidden: Boolean;
    public isButton: Boolean = false;
    private setStyle: any = [];
    private dataRoleTamp: any = [];
    private idDetailForReason: any;
    public listdataDetail: any = [];
    public lookupkaroseri: any = [];
    public lookupasset: any = [];
    public lookupaccesories: any = [];
    public item_name_asset: any = [];
    public plat_no: any = [];
    public engine_no: any = [];
    public chasis_no: any = [];
    public application_no: any = [];
    public is_manual: any = [];
    public lookupkaroserilookup: any = [];
    public lookupassetlookup: any = [];
    public lookupaccesorieslookup: any = [];
    private dataTampProceed: any = [];
    public id_accesories: any = [];
    public id_karoseri: any = [];
    public id_asset: any = [];
    public id_detail: any = [];
    public id_detail_accesories: any = [];
    public lookupfacode: any = [];
    public branchcode: String;
    public listassetgrnreq: any = [];
    private idDetailForAssetGRNReq: any;

    private APIController: String = 'FinalGrnRequest';
    private APIControllerFinalReceiptNote: String = 'FinalGrnRequestDetail';
    private APIControllerKaroseriLookup: String = 'FinalGrnRequestDetailKaroseri';
    private APIControllerDetailKaroseriLookup: String = 'FinalGrnRequestDetailKaroseriLookup';
    private APIControllerAccesoriesLookup: String = 'FinalGrnRequestDetailAccesories';
    private APIControllerDetailAccesoriesLookup: String = 'FinalGrnRequestDetailAccesoriesLookup';
    private APIControllerFACode: String = 'Asset';

    private APIRouteGetRows: String = 'GetRows';
    private APIRouteForGetRow: String = 'GetRow';
    private APIRouteForDelete: String = 'Delete';
    private APIRouteForInsert: String = 'Insert';
    private APIRouteForAddAccesories: String = 'ExecSpForAdd';
    private APIRouteForAddKaroseri: String = 'ExecSpForAdd';
    private APIRouteForPost: String = 'ExecSpPost';
    private APIRouteForGetUpdate: String = 'UPDATE';
    private APIRouteForLookupAssetMobilization: String = 'GetRowsForLookupFinalGrnRequest';

    private RoleAccessCode = 'R00024460000001A';

    // form 2 way binding
    model: any = {};

    // checklist
    public selectedAllTable: any;
    private checkedList: any = [];
    public selectedAll: any;
    public selectedAllaccesories: any;
    public selectedAllkaroseri: any;
    public selectedAllasset: any;

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
        private _elementRef: ElementRef
    ) { super(); }

    ngOnInit() {
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        this.Delimiter(this._elementRef);
        if (this.param != null) {
            this.isReadOnly = true;

            // call web service
            this.callGetrow();
            this.loadData();
            // this.showSpinner = false;
        } else {
            this.showSpinner = false;
            this.tampHidden = false;
            this.model.company_code = this.company_code;
            this.model.status = 'HOLD';
        }
    }

    //#region getrow data
    callGetrow() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_final_grn_request_no': this.param
        }];
        // end param tambahan untuk getrow dynamic
        this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    const parsedata = this.getrowNgb(parse.data[0]);

                    this.application_no = parsedata.application_no;
                    this.is_manual = parsedata.is_manual;

                    if (parsedata.status != 'HOLD') {
                        this.tampHidden = true;
                    } else {
                        this.tampHidden = false;
                    }

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
                    'p_final_grn_request_no': this.param
                });
                // end param tambahan untuk getrows dynamic

                // tslint:disable-next-line:max-line-length
                this.dalservice.Getrows(dtParameters, this.APIControllerFinalReceiptNote, this.APIRouteGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.finalGRNlist = parse.data;
                    if (parse.data != null) {
                        this.finalGRNlist.numberIndex = dtParameters.start;
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
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 8, 10] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        }
    }
    //#endregion load all data

    //#region button back
    btnBack() {
        $('#datatablelistfinalreceiptnote').DataTable().ajax.reload();
        this.route.navigate(['/transaction/subfinalgrnrequest']);
    }
    //#endregion button back

    //#region button edit
    btnEdit(codeEdit: string) {
        this.route.navigate(['/transaction/subgoodreceiptnotelist/goodreceiptnotedetaildetail', this.param, codeEdit]);
    }
    //#endregion button edit

    //#region  set datepicker
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
    //#endregion  set datepicker

    btnSelectRowPO(code: String, branch_code: String,
        branch_name: String, division_code: String, division_name: String, department_code: String, department_name: String,
        sub_departmet_code: String, sub_department_name: String, unit_code: String, unit_name: String, to_bank_code: String,
        to_bank_account_no: String, to_bank_account_name: String, payment_by: String, total_amount: String,
        ppn_amount: String, pph_amount: String, deposit_amount: String, currency_code: String, currency_name: String, supplier_code: String, name: String) {
        this.model.purchase_order_code = code;
        this.model.branch_code = branch_code;
        this.model.branch_name = branch_name;
        this.model.division_code = division_code;
        this.model.division_name = division_name;
        this.model.department_code = department_code;
        this.model.department_name = department_name;
        this.model.sub_department_code = sub_departmet_code;
        this.model.sub_department_name = sub_department_name;
        this.model.unit_code = unit_code;
        this.model.unit_name = unit_name;
        this.model.to_bank_code = to_bank_code;
        this.model.to_bank_account_no = to_bank_account_no;
        this.model.to_bank_account_name = to_bank_account_name;
        this.model.payment_by = payment_by;
        this.model.total_amount = total_amount;
        this.model.ppn = ppn_amount;
        this.model.pph = pph_amount;
        this.model.deposit_amount = deposit_amount;
        this.model.currency_code = currency_code;
        this.model.currency_name = currency_name;
        this.model.supplier_code = supplier_code;
        this.model.supplier_name = name;
        $('#lookupModalPO').modal('hide');
    }
    //#endregion PO lookup  

    //#region reload
    btnReload() {
        $('#datatablefinalgrndetaillist').DataTable().ajax.reload();
    }
    //#endregion reload

    //#region karoseri Lookup
    btnLookupKaroseri(id: any) {
        $('#datatableLookupKaroseri').DataTable().clear().destroy();
        $('#datatableLookupKaroseri').DataTable({
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
                    'p_final_grn_request_detail_id': id
                });
                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIControllerKaroseriLookup, this.APIRouteGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupkaroseri = parse.data;
                    this.id_detail = id

                    if (parse.data != null) {
                        if (parse.data.length != 0) {
                            this.item_name_asset = parse.data[0].item_name_asset
                            this.plat_no = parse.data[0].plat_no
                            this.engine_no = parse.data[0].engine_no
                            this.chasis_no = parse.data[0].chassis_no
                            // this.application_no = parse.data[0].application_no
                            this.id_karoseri = parse.data[0].id
                        }
                        this.lookupkaroseri.numberIndex = dtParameters.start;
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
                }, err => console.log('There was an error while retrieving Data(API)' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '

            },
            searchDelay: 800 // pake ini supaya gak bug search
        });

        this.idDetailForReason = id;
    }
    //#endregion tax lookup

    //#region lookup karoseri
    btnKaroseriLookup(application_no: any) {
        $('#datatableLookupKaroseriLookup').DataTable().clear().destroy();
        $('#datatableLookupKaroseriLookup').DataTable({
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
                    'p_application_no': application_no,
                    'p_type': this.is_manual,
                });
                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIControllerDetailKaroseriLookup, this.APIRouteGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupkaroserilookup = parse.data;

                    if (parse.data != null) {
                        this.lookupkaroserilookup.numberIndex = dtParameters.start;
                    }

                    // if use checkAll use this
                    $('#checkallkaroserilookup').prop('checked', false);
                    // end checkall
                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API)' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '

            },
            searchDelay: 800 // pake ini supaya gak bug search
        });

        this.idDetailForReason = application_no;
    }
    //#endregion lookup karoseri

    //#region checkall table delete karoseri
    btnDelete() {
        this.checkedList = [];
        for (let i = 0; i < this.lookupkaroseri.length; i++) {
            if (this.lookupkaroseri[i].selected) {
                this.checkedList.push(
                    {
                        'id': this.lookupkaroseri[i].id,
                    }
                );
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
                this.dataTamp = [];
                for (let J = 0; J < this.checkedList.length; J++) {

                    // param tambahan untuk getrow dynamic
                    this.dataTamp = [{
                        'p_id': this.checkedList[J].id,
                    }];
                    // end param tambahan untuk getrow dynamic

                    this.dalservice.Delete(this.dataTamp, this.APIControllerKaroseriLookup, this.APIRouteForDelete)
                        .subscribe(
                            res => {
                                this.showSpinner = false;
                                const parse = JSON.parse(res);
                                if (parse.result === 1) {
                                    if (this.checkedList.length == J + 1) {
                                        $('#datatableLookupKaroseri').DataTable().ajax.reload();
                                        $('#datatablefinalgrndetaillist').DataTable().ajax.reload();
                                        this.showNotification('bottom', 'right', 'success');
                                    }
                                } else {
                                    this.swalPopUpMsg(parse.data)
                                }
                            },
                            error => {
                                this.showSpinner = false;
                                const parse = JSON.parse(error);
                                this.swalPopUpMsg(parse.data)
                            });
                }
            } else {
                this.showSpinner = false;
            }
        });
    }

    selectAllTable() {
        for (let i = 0; i < this.lookupkaroseri.length; i++) {
            this.lookupkaroseri[i].selected = this.selectedAll;
        }
    }

    checkIfAllTableSelected() {
        this.selectedAll = this.lookupkaroseri.every(function (item: any) {
            return item.selected === true;
        })
    }
    //#endregion checkall table delete karoseri

    //#region accesories Lookup
    btnLookupAccesories(id: any) {
        $('#datatableLookupAccesories').DataTable().clear().destroy();
        $('#datatableLookupAccesories').DataTable({
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
                    'p_final_grn_request_detail_id': id
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIControllerAccesoriesLookup, this.APIRouteGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupaccesories = parse.data;
                    this.id_detail_accesories = id

                    if (parse.data != null) {
                        if (parse.data.length != 0) {
                            this.item_name_asset = parse.data[0].item_name_asset
                            this.plat_no = parse.data[0].plat_no
                            this.engine_no = parse.data[0].engine_no
                            this.chasis_no = parse.data[0].chassis_no
                            // this.application_no = parse.data[0].application_no
                            this.id_accesories = parse.data[0].id
                        }
                        this.lookupaccesories.numberIndex = dtParameters.start;
                    }

                    // if use checkAll use this
                    $('#checkallaccesories').prop('checked', false);
                    // end checkall

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API)' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '

            },
            searchDelay: 800 // pake ini supaya gak bug search
        });

        this.idDetailForReason = id;
    }
    //#endregion accesories lookup

    //#region Add Karoseri Lookup
    btnAddKaroseri() {
        this.dataTampProceed = [];
        this.checkedList = [];
        for (let i = 0; i < this.lookupkaroserilookup.length; i++) {
            if (this.lookupkaroserilookup[i].selectedkaroseri) {
                this.checkedList.push({
                    'id': this.lookupkaroserilookup[i].id,
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
                            'p_final_grn_request_detail_karoseri_id': th.checkedList[i].id,
                            'p_application_no': th.application_no,
                            'p_final_grn_request_detail_id': th.id_detail,
                            'action': '',
                        }];
                        th.dalservice.Insert(th.dataTampProceed, th.APIControllerKaroseriLookup, th.APIRouteForInsert)
                            .subscribe(
                                res => {
                                    const parse = JSON.parse(res);
                                    if (parse.result === 1) {
                                        if (th.checkedList.length == i + 1) {
                                            th.showNotification('bottom', 'right', 'success');
                                            $('#datatableLookupKaroseriLookup').DataTable().ajax.reload();
                                            $('#datatableLookupKaroseri').DataTable().ajax.reload();
                                            $('#datatablefinalgrndetaillist').DataTable().ajax.reload();
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

    selectAllTableAddKaroseri() {
        for (let i = 0; i < this.lookupkaroserilookup.length; i++) {
            this.lookupkaroserilookup[i].selectedkaroseri = this.selectedAllkaroseri;
        }
    }

    checkIfAllTableSelectedAddKaroseri() {
        this.selectedAllkaroseri = this.lookupkaroserilookup.every(function (item: any) {
            return item.selectedkaroseri === true;
        })
    }
    //#endregion Add Karosei Lookup

    //#region lookup accesories
    btnAccesoriesLookup(application_no: any) {
        $('#datatableLookupAccesoriesLookup').DataTable().clear().destroy();
        $('#datatableLookupAccesoriesLookup').DataTable({
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
                    'p_application_no': application_no,
                    'p_type': this.is_manual,
                });
                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIControllerDetailAccesoriesLookup, this.APIRouteGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupaccesorieslookup = parse.data;

                    if (parse.data != null) {
                        this.lookupaccesorieslookup.numberIndex = dtParameters.start;
                    }

                    // if use checkAll use this
                    $('#checkallaccesorieslookup').prop('checked', false);
                    // end checkall

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API)' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '

            },
            searchDelay: 800 // pake ini supaya gak bug search
        });

        this.idDetailForReason = application_no;
    }
    //#endregion lookup accesories

    //#region checkall table delete
    btnDeleteAccesories() {
        this.checkedList = [];
        for (let i = 0; i < this.lookupaccesories.length; i++) {
            if (this.lookupaccesories[i].selected) {
                this.checkedList.push(
                    {
                        'id': this.lookupaccesories[i].id,
                        'id_accesories': this.lookupaccesories[i].id_accesories_lookup
                    }
                );
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
                this.dataTamp = [];
                for (let J = 0; J < this.checkedList.length; J++) {

                    // param tambahan untuk getrow dynamic
                    this.dataTamp = [{
                        'p_id': this.checkedList[J].id,
                        'p_final_grn_request_detail_accesories_id': this.checkedList[J].id_accesories
                    }];
                    // end param tambahan untuk getrow dynamic

                    this.dalservice.Delete(this.dataTamp, this.APIControllerAccesoriesLookup, this.APIRouteForDelete)
                        .subscribe(
                            res => {
                                this.showSpinner = false;
                                const parse = JSON.parse(res);
                                if (parse.result === 1) {
                                    if (this.checkedList.length == J + 1) {
                                        $('#datatableLookupAccesories').DataTable().ajax.reload();
                                        $('#datatableLookupAccesoriesLookup').DataTable().ajax.reload();
                                        $('#datatablefinalgrndetaillist').DataTable().ajax.reload();
                                        this.showNotification('bottom', 'right', 'success');
                                    }
                                } else {
                                    this.swalPopUpMsg(parse.data)
                                }
                            },
                            error => {
                                this.showSpinner = false;
                                const parse = JSON.parse(error);
                                this.swalPopUpMsg(parse.data)
                            });
                }
            } else {
                this.showSpinner = false;
            }
        });
    }

    selectAllTableAccesories() {
        for (let i = 0; i < this.lookupaccesories.length; i++) {
            this.lookupaccesories[i].selected = this.selectedAll;
        }
    }

    checkIfAllTableSelectedAccesories() {
        this.selectedAll = this.lookupaccesories.every(function (item: any) {
            return item.selected === true;
        })
    }
    //#endregion checkall table delete

    //#region Add Accesories Lookup
    btnAddAccesories() {
        this.dataTampProceed = [];
        this.checkedList = [];
        for (let i = 0; i < this.lookupaccesorieslookup.length; i++) {
            if (this.lookupaccesorieslookup[i].selectedaccesories) {
                this.checkedList.push({
                    'id': this.lookupaccesorieslookup[i].id,
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
                            'p_final_grn_request_detail_accesories_id': th.checkedList[i].id,
                            'p_application_no': th.application_no,
                            'p_final_grn_request_detail_id': th.id_detail_accesories,
                            'action': '',
                        }];
                        th.dalservice.Insert(th.dataTampProceed, th.APIControllerAccesoriesLookup, th.APIRouteForInsert)
                            .subscribe(
                                res => {
                                    const parse = JSON.parse(res);
                                    if (parse.result === 1) {
                                        if (th.checkedList.length == i + 1) {
                                            th.showNotification('bottom', 'right', 'success');
                                            $('#datatableLookupAccesories').DataTable().ajax.reload();
                                            $('#datatableLookupAccesoriesLookup').DataTable().ajax.reload();
                                            $('#datatablefinalgrndetaillist').DataTable().ajax.reload();
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

    selectAllTableAddAccesories() {
        for (let i = 0; i < this.lookupaccesorieslookup.length; i++) {
            this.lookupaccesorieslookup[i].selectedaccesories = this.selectedAllaccesories;
        }
    }

    checkIfAllTableSelectedAddAccesories() {
        this.selectedAllaccesories = this.lookupaccesorieslookup.every(function (item: any) {
            return item.selectedaccesories === true;
        })
    }
    //#endregion Add Accesories Lookup

    //#region button Post
    btnPost(code: string) {
        // param tambahan untuk button Post dynamic
        this.dataRoleTamp = [{
            'p_id': code,
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
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIControllerFinalReceiptNote, this.APIRouteForPost)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.callGetrow();
                                $('#datatablefinalgrndetaillist').DataTable().ajax.reload();
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
    //#endregion button Post


// #region FACode Lookup
  btnLookupFixedAsset(id: any, i: any) {
    $('#datatableLookupFACode').DataTable().clear().destroy();
    $('#datatableLookupFACode').DataTable({
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
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsAms(dtParameters, this.APIControllerFACode, this.APIRouteForLookupAssetMobilization).subscribe(resp => {
          const parse = JSON.parse(resp);

          this.lookupfacode = parse.data;

          if (parse.data != null) {
            this.lookupfacode.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 5] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
    this.idDetailForAssetGRNReq = id;
  }

  btnSelectRowFACode(code: String, item_name: String, engine_no: String, chassis_no: String, plat_no: String) {
    // this.model.fa_code = code;
    // this.model.fa_name = item_name;
    // this.model.engine_no = engine_no;
    // this.model.chassis_no = chassis_no;
    // this.model.plat_no = plat_no;
    // $('#lookupModalFixedAsset').modal('hide');
        // console.log(plat_no, this.model.chassis_no = chassis_no, this.model.engine_no = engine_no);

        this.listassetgrnreq = [];
        var i = 0;

        var getID = $('[name="p_id"]')
            .map(function () { return $(this).val(); }).get();
        
        while (i < getID.length) {
            
            if (getID[i] == this.idDetailForAssetGRNReq) {
                this.listassetgrnreq.push({
                    p_id: getID[i],
                    // p_plafond_code: this.param,
                    // p_gl_link_code: code
                    p_final_grn_request_no: this.param,
                    p_item_name: item_name,
                    p_engine_no: engine_no,
                    p_chasis_no: chassis_no,
                    p_plat_no: plat_no,
                });
            }
            i++;
        }
        

        //#region web service
        this.dalservice.Update(this.listassetgrnreq, this.APIControllerFinalReceiptNote, this.APIRouteForGetUpdate)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                        $('#datatableCoa').DataTable().ajax.reload();
                    } else {
                        this.swalPopUpMsg(parse.data);
                    }
                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);
                });
        //#endregion web service

        $('#lookupModalFixedAsset').modal('hide');
        $('#datatablefinalgrndetaillist').DataTable().ajax.reload();
        

  }
//   #endregion FACode lookup

 btnClearAsset(id: any, code: String, item_name: String, engine_no: String, chassis_no: String, plat_no: String) {
    // this.model.fa_code = code;
    // this.model.fa_name = item_name;
    // this.model.engine_no = engine_no;
    // this.model.chassis_no = chassis_no;
    // this.model.plat_no = plat_no;
    // $('#lookupModalFixedAsset').modal('hide');
        // console.log(plat_no, this.model.chassis_no = chassis_no, this.model.engine_no = engine_no);
        this.idDetailForAssetGRNReq = id;
        this.listassetgrnreq = [];
        var i = 0;
        console.log(this.idDetailForAssetGRNReq);
        console.log();
        
        var getID = $('[name="p_id"]')
        .map(function () { return $(this).val(); }).get();
        
        console.log(getID.length);
        while (i < getID.length) {
            
            if (getID[i] == this.idDetailForAssetGRNReq) {
                this.listassetgrnreq.push({
                    p_id: getID[i],
                    // p_plafond_code: this.param,
                    // p_gl_link_code: code
                    p_final_grn_request_no: this.param,
                    p_item_name: null,
                    p_engine_no: null,
                    p_chasis_no: null,
                    p_plat_no: null,
                });
            }
            i++;
        }
        

        //#region web service
        this.dalservice.Update(this.listassetgrnreq, this.APIControllerFinalReceiptNote, this.APIRouteForGetUpdate)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                        $('#datatableCoa').DataTable().ajax.reload();
                    } else {
                        this.swalPopUpMsg(parse.data);
                    }
                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);
                });
        //#endregion web service

        $('#lookupModalFixedAsset').modal('hide');
        $('#datatablefinalgrndetaillist').DataTable().ajax.reload();

      //#region asset Lookup
    // btnLookupFixedAsset(id: any) {
    //     $('#datatableLookupFixedAsset').DataTable().clear().destroy();
    //     $('#datatableLookupFixedAsset').DataTable({
    //         'pagingType': 'first_last_numbers',
    //         'pageLength': 5,
    //         'processing': true,
    //         'serverSide': true,
    //         responsive: true,
    //         lengthChange: false, // hide lengthmenu
    //         searching: true, // jika ingin hilangin search box nya maka false

    //         ajax: (dtParameters: any, callback) => {
    //             // param tambahan untuk getrows dynamic
    //             dtParameters.paramTamp = [];
    //             dtParameters.paramTamp.push({
    //                 'p_final_grn_request_detail_id': id,
    //                 'p_branch_code': this.model.branch_code
    //             });
    //             // end param tambahan untuk getrows dynamic
    //             this.dalservice.GetrowsAms(dtParameters, this.APIControllerFACode, this.APIRouteForLookupAssetMobilization).subscribe(resp => {
    //                 const parse = JSON.parse(resp);
    //                 this.lookupkaroseri = parse.data;
    //                 this.id_detail = id

    //                 if (parse.data != null) {
    //                     if (parse.data.length != 0) {
    //                         this.item_name_asset = parse.data[0].item_name_asset
    //                         this.plat_no = parse.data[0].plat_no
    //                         this.engine_no = parse.data[0].engine_no
    //                         this.chasis_no = parse.data[0].chassis_no
    //                         // this.application_no = parse.data[0].application_no
    //                         this.id_karoseri = parse.data[0].id
    //                     }
    //                     this.lookupkaroseri.numberIndex = dtParameters.start;
    //                 }
    //                 // if use checkAll use this
    //                 $('#checkall').prop('checked', false);
    //                 // end checkall

    //                 callback({
    //                     draw: parse.draw,
    //                     recordsTotal: parse.recordsTotal,
    //                     recordsFiltered: parse.recordsFiltered,
    //                     data: []
    //                 });
    //             }, err => console.log('There was an error while retrieving Data(API)' + err));
    //         },
    //         columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
    //         language: {
    //             search: '_INPUT_',
    //             searchPlaceholder: 'Search records',
    //             infoEmpty: '<p style="color:red;" > No Data Available !</p> '

    //         },
    //         searchDelay: 800 // pake ini supaya gak bug search
    //     });

    //     this.idDetailForReason = id;
    // }
    // //#endregion tax lookup

    // //#region lookup karoseri
    // btnFixedAssetLookup(application_no: any) {
    //     $('#datatableLookupFixedAssetLookup').DataTable().clear().destroy();
    //     $('#datatableLookupFixedAssetLookup').DataTable({
    //         'pagingType': 'first_last_numbers',
    //         'pageLength': 5,
    //         'processing': true,
    //         'serverSide': true,
    //         responsive: true,
    //         lengthChange: false, // hide lengthmenu
    //         searching: true, // jika ingin hilangin search box nya maka false

    //         ajax: (dtParameters: any, callback) => {
    //             // param tambahan untuk getrows dynamic
    //             dtParameters.paramTamp = [];
    //             dtParameters.paramTamp.push({
    //                 // 'p_application_no': application_no,
    //                 // 'p_type': this.is_manual,
    //                 'p_final_grn_request_no': this.param,
    //                 'p_branch_code': this.model.branch_code
    //             });
    //             // end param tambahan untuk getrows dynamic
    //             this.dalservice.Getrows(dtParameters, this.APIControllerFinalReceiptNote, this.APIRouteGetRows).subscribe(resp => {
    //                 const parse = JSON.parse(resp);
    //                 this.lookupkaroserilookup = parse.data;

    //                 if (parse.data != null) {
    //                     this.lookupkaroserilookup.numberIndex = dtParameters.start;
    //                 }

    //                 // if use checkAll use this
    //                 $('#checkallkaroserilookup').prop('checked', false);
    //                 // end checkall
    //                 callback({
    //                     draw: parse.draw,
    //                     recordsTotal: parse.recordsTotal,
    //                     recordsFiltered: parse.recordsFiltered,
    //                     data: []
    //                 });
    //             }, err => console.log('There was an error while retrieving Data(API)' + err));
    //         },
    //         columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
    //         language: {
    //             search: '_INPUT_',
    //             searchPlaceholder: 'Search records',
    //             infoEmpty: '<p style="color:red;" > No Data Available !</p> '

    //         },
    //         searchDelay: 800 // pake ini supaya gak bug search
    //     });

    //     this.idDetailForReason = application_no;
    // }
    // //#endregion lookup karoseri

    // //#region checkall table delete karoseri
    // btnDeleteFixedAsset() {
    //     this.checkedList = [];
    //     for (let i = 0; i < this.lookupkaroseri.length; i++) {
    //         if (this.lookupkaroseri[i].selected) {
    //             this.checkedList.push(
    //                 {
    //                     'id': this.lookupkaroseri[i].id,
    //                 }
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
    //             this.dataTamp = [];
    //             for (let J = 0; J < this.checkedList.length; J++) {

    //                 // param tambahan untuk getrow dynamic
    //                 this.dataTamp = [{
    //                     'p_id': this.checkedList[J].id,
    //                 }];
    //                 // end param tambahan untuk getrow dynamic

    //                 this.dalservice.Delete(this.dataTamp, this.APIControllerKaroseriLookup, this.APIRouteForDelete)
    //                     .subscribe(
    //                         res => {
    //                             this.showSpinner = false;
    //                             const parse = JSON.parse(res);
    //                             if (parse.result === 1) {
    //                                 if (this.checkedList.length == J + 1) {
    //                                     $('#datatableLookupFixedAsset').DataTable().ajax.reload();
    //                                     $('#datatablefinalgrndetaillist').DataTable().ajax.reload();
    //                                     this.showNotification('bottom', 'right', 'success');
    //                                 }
    //                             } else {
    //                                 this.swalPopUpMsg(parse.data)
    //                             }
    //                         },
    //                         error => {
    //                             this.showSpinner = false;
    //                             const parse = JSON.parse(error);
    //                             this.swalPopUpMsg(parse.data)
    //                         });
    //             }
    //         } else {
    //             this.showSpinner = false;
    //         }
    //     });
    // }

    // selectAllTableFixedAsset() {
    //     for (let i = 0; i < this.lookupkaroseri.length; i++) {
    //         this.lookupkaroseri[i].selected = this.selectedAll;
    //     }
    // }

    // checkIfAllTableSelectedFixedAsset() {
    //     this.selectedAll = this.lookupkaroseri.every(function (item: any) {
    //         return item.selected === true;
    //     })
    // }
    // //#endregion checkall table delete karoseri


    //     //#region Add Karoseri Lookup
    // btnAddFixedAsset() {
    //     this.dataTampProceed = [];
    //     this.checkedList = [];
    //     for (let i = 0; i < this.lookupkaroserilookup.length; i++) {
    //         if (this.lookupkaroserilookup[i].selectedkaroseri) {
    //             this.checkedList.push({
    //                 'id': this.lookupkaroserilookup[i].id,
    //             })
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

    //     this.dataTamp = [];
    //     swal({
    //         title: 'Are you sure?',
    //         type: 'warning',
    //         showCancelButton: true,
    //         confirmButtonClass: 'btn btn-success',
    //         cancelButtonClass: 'btn btn-danger',
    //         confirmButtonText: 'Yes',
    //         buttonsStyling: false
    //     }).then((result) => {
    //         this.showSpinner = true;
    //         if (result.value) {

    //             let th = this;
    //             var i = 0;
    //             (function loopPoProceesProceed() {
    //                 if (i < th.checkedList.length) {
    //                     th.dataTampProceed = [{
    //                         'p_final_grn_request_detail_karoseri_id': th.checkedList[i].id,
    //                         'p_application_no': th.application_no,
    //                         'p_final_grn_request_detail_id': th.id_detail,
    //                         'action': '',
    //                     }];
    //                     th.dalservice.Insert(th.dataTampProceed, th.APIControllerKaroseriLookup, th.APIRouteForInsert)
    //                         .subscribe(
    //                             res => {
    //                                 const parse = JSON.parse(res);
    //                                 if (parse.result === 1) {
    //                                     if (th.checkedList.length == i + 1) {
    //                                         th.showNotification('bottom', 'right', 'success');
    //                                         $('#datatableLookupFixedAssetLookup').DataTable().ajax.reload();
    //                                         $('#datatableLookupFixedAsset').DataTable().ajax.reload();
    //                                         $('#datatablefinalgrndetaillist').DataTable().ajax.reload();
    //                                         th.showSpinner = false;
    //                                     } else {
    //                                         i++;
    //                                         loopPoProceesProceed();
    //                                     }
    //                                 } else {
    //                                     th.swalPopUpMsg(parse.data);
    //                                     th.showSpinner = false;
    //                                 }
    //                             },
    //                             error => {
    //                                 const parse = JSON.parse(error);
    //                                 th.swalPopUpMsg(parse.data);
    //                                 th.showSpinner = false;
    //                             });
    //                 }

    //             })();
    //         } else {
    //             this.showSpinner = false;
    //         }
    //     });
    // }

    // selectAllTableAddFixedAsset() {
    //     for (let i = 0; i < this.lookupkaroserilookup.length; i++) {
    //         this.lookupkaroserilookup[i].selectedkaroseri = this.selectedAllkaroseri;
    //     }
    // }

    // checkIfAllTableSelectedAddFixedAsset() {
    //     this.selectedAllkaroseri = this.lookupkaroserilookup.every(function (item: any) {
    //         return item.selectedkaroseri === true;
    //     })
    // }
    // //#endregion Add Karosei Lookup


}



}