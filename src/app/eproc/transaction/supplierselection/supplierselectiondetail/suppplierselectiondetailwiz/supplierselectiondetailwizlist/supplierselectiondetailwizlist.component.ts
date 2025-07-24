import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './supplierselectiondetailwizlist.component.html'
})

export class SupplierSelectiondetailWizListComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');
    params = this.getRouteparam.snapshot.paramMap.get('id2');
    // variable
    public quotationReviewDetailList: any = [];
    public tampHiddenStatus: Boolean;
    public isReadonly: Boolean;
    private dataTamp: any = [];
    private dataRoleTamp: any = [];
    private dataTampPush: any = [];
    private dataTampDelete: any = [];
    public supplierColDetailList: any = [];
    public isDisabled: Boolean;
    public isDisabled2: Boolean;
    public QuotationCode: any = [];
    public lookupTax: any = [];
    private idDetailForReason: any;
    public lookupapproval: any = [];
    public lookupvendor: any = [];
    public listdataDetail: any = [];
    public lookupvendorwithquotation: any = [];
    private dataTempThirdParty: any = [];
    private VendorSupplierSelection: any;

    private APIController: String = 'QuotationReviewDetail';
    private APIControllerHeader: String = 'SupplierSelection';
    private APIControllerSupplierSelectionDetail: String = 'SupplierSelectionDetail';
    private APIControllerTaxCode: String = 'MasterTaxScheme';
    private APIControllerApprovalSchedule: String = 'ApprovalSchedule';
    private APIControllerVendor: String = 'MasterVendor';
    private APIControllerQuotationReviewDetail: String = 'QuotationReviewDetail';
    private APIControllerSysGlobalParam: String = 'SysGlobalParam';
    private APIControllerVendorExt: String = 'Intergration';

    private APIRouteForGetRows: String = 'GetRows';
    private APIRouteForGetDelete: String = 'Delete';
    private APIRouteForGetRow: String = 'GETROW';
    private APIRouteForGetRole: String = 'ExecSpForGetRole';
    private APIRouteGetRows: String = 'GetRows';
    private APIRouteForLookup: String = 'GetRowsForLookup';
    private APIRouteForTaxUpdateWithQuotation: String = 'UpdateForTax';
    private APIRouteForSupplierUpdate: String = 'UpdateForSupplier';
    private APIRouteForLookupSupplier: String = 'GetRowsForLookupSupplier';
    private APIRouteForSupplierUpdateWithQuotation: String = 'UpdateForSupplierWithQuotation';
    private APIRouteForUpdateAmount: String = 'UpdateForAmount';
    private APIRouteForGetThirddParty: String = 'ExecSpForThidrParty';
    private APIRouteForLookupForSupplierExt: String = 'GetListVendorForLookup';

    private RoleAccessCode = 'R00021570000000A';

    // checklist
    public selectedAll: any;
    private checkedList: any = [];

    // form 2 way binding
    model: any = {};

    // spinner
    showSpinner: Boolean = false;
    // end

    // ini buat datatables
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};
    is_latest: any;

    constructor(private dalservice: DALService,
        private _location: Location,
        public route: Router,
        public getRouteparam: ActivatedRoute,
        private _elementRef: ElementRef) { super(); }

    ngOnInit() {
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        this.compoSide('', this._elementRef, this.route);
        this.loadData();
        this.callGetrowHeader();
        this.callGlobalParamForThirdPartyVendor();
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
                    'p_selection_code': this.param
                });
                // end param tambahan untuk getrows dynamic

                // tslint:disable-next-line:max-line-length
                this.dalservice.Getrows(dtParameters, this.APIControllerSupplierSelectionDetail, this.APIRouteGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.supplierColDetailList = parse.data;

                    if (parse.data != null) {
                        this.supplierColDetailList.numberIndex = dtParameters.start;
                    }

                    // if use checkAll use this
                    $('#checkalltable').prop('checked', false);
                    // end checkall

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 11] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        }
    }
    //#endregion load all data

    //#region button add
    btnAdd() {
        this.route.navigate(['/transaction/subquotationreviewlist/quotationreviewdetail/' + this.param + '/quotationreviewdetailwizdetail', this.param], { skipLocationChange: true });
    }
    //#endregion button add

    //#region button edit
    btnEdit(codeEdit: string) {
        this.route.navigate(['/transaction/subsupplierselectionlist/supplierselectiondetail/' + this.param + '/supplierselectiondetailwizdetail', this.param, codeEdit], { skipLocationChange: true });
    }
    //#endregion button edit

    //#region button delete
    btnDeleteAll() {
        this.dataTampDelete = [];
        this.checkedList = [];
        for (let i = 0; i < this.quotationReviewDetailList.length; i++) {
            if (this.quotationReviewDetailList[i].selected) {
                this.checkedList.push(this.quotationReviewDetailList[i].id);
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
                (function loopDeliveryRequestProceed() {
                    if (i < th.checkedList.length) {
                        th.dataTampDelete = [{
                            'p_id': th.checkedList[i],
                            'action': ''
                        }];
                        th.dalservice.ExecSp(th.dataTampDelete, th.APIController, th.APIRouteForGetDelete)
                            .subscribe(
                                res => {
                                    const parse = JSON.parse(res);
                                    if (parse.result === 1) {
                                        if (th.checkedList.length == i + 1) {
                                            th.showNotification('bottom', 'right', 'success');
                                            $('#datatablesquotationreview').DataTable().ajax.reload();
                                            $('#btnBelanjaBahanDetail').click();
                                            th.showSpinner = false;
                                        } else {
                                            i++;
                                            loopDeliveryRequestProceed();
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
    //#endregion btn delete

    //#region selectAll
    selectAll() {
        for (let i = 0; i < this.quotationReviewDetailList.length; i++) {
            this.quotationReviewDetailList[i].selected = this.selectedAll;
        }
    }
    //#endregion selectAll

    //#region  checkIfAllTableSelected
    checkIfAllTableSelected() {
        this.selectedAll = this.quotationReviewDetailList.every(function (item: any) {
            return item.selected === true;
        })
    }
    //#endregion checkIfAllTableSelected

    //#region getrow data
    callGetrowHeader() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_code': this.param
        }];
        // end param tambahan untuk getrow dynamic
        this.dalservice.Getrow(this.dataTamp, this.APIControllerHeader, this.APIRouteForGetRow)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    const parsedata = this.getrowNgb(parse.data[0]);

                    if (parsedata.status != 'HOLD') {
                        this.tampHiddenStatus = true;
                    } else {
                        this.tampHiddenStatus = false;
                    }

                    if (parsedata.quotation_code != '') {
                        this.isDisabled = true;
                    } else {
                        this.isDisabled = false;
                    }

                    if (parsedata.quotation_code == '') {
                        this.isDisabled2 = true;
                    } else {
                        this.isDisabled2 = false;
                    }

                    this.QuotationCode = parsedata.quotation_code;
                    this.showSpinner = false;
                },
                error => {
                    this.showSpinner = false;
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);
                });
    }
    //#endregion getrow data

    //#region tax Lookup
    btnLookupTaxCode(id: any) {
        $('#datatableLookupTax').DataTable().clear().destroy();
        $('#datatableLookupTax').DataTable({
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
                    'action': 'getResponse'
                });
                // end param tambahan untuk getrows dynamic
                this.dalservice.GetrowsSys(dtParameters, this.APIControllerTaxCode, this.APIRouteForLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupTax = parse.data;
                    if (parse.data != null) {
                        this.lookupTax.numberIndex = dtParameters.start;
                    }
                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API)' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 5] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '

            },
            searchDelay: 800 // pake ini supaya gak bug search
        });

        this.idDetailForReason = id;
    }

    btnSelectRowTax(code: string, description: string, ppn_pct: string, pph_pct: string) {

        this.model.tax_code = code;
        this.model.tax_name = description;
        this.model.ppn_pct = ppn_pct;
        this.model.pph_pct = pph_pct;

        const listdataDetailWithQuotaion = [];

        listdataDetailWithQuotaion.push({
            p_id: this.idDetailForReason,
            p_tax_code: code,
            p_tax_name: description,
            p_ppn_pct: ppn_pct,
            p_pph_pct: pph_pct,
        });

        //#region web service
        this.dalservice.Update(listdataDetailWithQuotaion, this.APIControllerSupplierSelectionDetail, this.APIRouteForTaxUpdateWithQuotation)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                        $('#datatablesuppliercoldetail').DataTable().ajax.reload();
                    } else {
                        this.swalPopUpMsg(parse.data);
                    }
                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);
                });
        //#endregion web service
        $('#lookupModalTax').modal('hide');
    }
    //#endregion tax lookup

    //#region GlobalParam for Thirdparty
    callGlobalParamForThirdPartyVendor() {
        this.dataTempThirdParty = [{
            'p_type': "VENDOR",
            'action': "getResponse"
        }];
        this.dalservice.ExecSp(this.dataTempThirdParty, this.APIControllerSysGlobalParam, this.APIRouteForGetThirddParty)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    const parsedata = this.getrowNgb(parse.data);

                    for (let i = 0; i < parsedata.length; i++) {
                        if (parsedata[i].code === 'URLVDR') {
                            this.VendorSupplierSelection = parsedata[i].value
                        }
                    }

                    this.showSpinner = false;
                },
                error => {
                    this.showSpinner = false;
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);
                });
    }
    //#endregion GlobalParam for Thirdparty

    //#region Vendor Lookup
    // btnLookupVendor(id: any) {
    //     $('#datatableLookupVendor').DataTable().clear().destroy();
    //     $('#datatableLookupVendor').DataTable({
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
    //                 'p_company_code': this.company_code,
    //                 'action': 'getResponse'
    //             });
    //             // end param tambahan untuk getrows dynamic

    //             // dtParameters.paramTamp = [];
    //             // let paramTamps = {}
    //             // paramTamps = {
    //             //   'draw': 1,
    //             //   'RowPage': 10,
    //             //   'PageNumber': 1,
    //             //   'SortBy': dtParameters.order[0].dir,
    //             //   'OrderBy': dtParameters.order[0].column,
    //             //   'Keywords': dtParameters.search.value,
    //             //   // 'URL': 'https://mocki.io/v1/12c64609-9593-4da7-847b-34db047da23d',
    //             //   'URL': 'http://172.31.233.24:8888/v1/VendorX/GetListVendorForLookup', // belum digunakan karena masih not ready
    //             //   'DataObj': 'ListVendorObj'
    //             // }
    //             // dtParameters.paramTamp.push(paramTamps)

    //             this.dalservice.GetrowsBam(dtParameters, this.APIControllerVendor, this.APIRouteForLookup).subscribe(resp => {
    //                 const parse = JSON.parse(resp);
    //                 this.lookupvendor = parse.data;
    //                 if (parse.data != null) {
    //                     this.lookupvendor.numberIndex = dtParameters.start;
    //                 }
    //                 callback({
    //                     draw: parse.draw,
    //                     recordsTotal: parse.recordsTotal,
    //                     recordsFiltered: parse.recordsFiltered,
    //                     data: []
    //                 });
    //             }, err => console.log('There was an error while retrieving Data(API)' + err));
    //         },
    //         columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
    //         language: {
    //             search: '_INPUT_',
    //             searchPlaceholder: 'Search records',
    //             infoEmpty: '<p style="color:red;" > No Data Available !</p> '

    //         },
    //         searchDelay: 800 // pake ini supaya gak bug search
    //     });

    //     this.idDetailForReason = id;
    // }

    btnLookupVendor(id: any) {
        $('#datatableLookupVendor').DataTable().clear().destroy();
        $('#datatableLookupVendor').DataTable({
            'pagingType': 'first_last_numbers',
            'pageLength': 10,
            'processing': true,
            'serverSide': true,
            responsive: true,
            lengthChange: false, // hide lengthmenu
            searching: true, // jika ingin hilangin search box nya maka false

            ajax: (dtParameters: any, callback) => {
                dtParameters.paramTamp = [];
                let paramTamps = {}
                paramTamps = {
                    'draw': 1,
                    'RowPage': 10,
                    'PageNumber': (dtParameters.start + 10) / 10,
                    'SortBy': dtParameters.order[0].dir,
                    'OrderBy': dtParameters.order[0].column,
                    'Keyword': dtParameters.search.value,
                    'URL': this.VendorSupplierSelection,
                    'DataObj': 'ListVendorObj'
                }
                dtParameters.paramTamp.push(paramTamps)

                this.dalservice.Getrows(dtParameters, this.APIControllerVendorExt, this.APIRouteForLookupForSupplierExt).subscribe(resp => {
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

    btnSelectRowVendor(code: String, name: string, address: String, npwp: String) {

        this.model.supplier_code = code;
        this.model.supplier_name = name;
        this.model.supplier_address = address;
        this.model.supplier_npwp = npwp;

        this.listdataDetail = [];

        var i = 0;

        var getID = $('[name="p_id"]')
            .map(function () { return $(this).val(); }).get();

        while (i < getID.length) {
            if (getID[i] == this.idDetailForReason) {
                this.listdataDetail.push({
                    p_id: getID[i],
                    p_supplier_code: code,
                    p_supplier_name: name,
                    p_supplier_address: address,
                    p_supplier_npwp: npwp
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
                        $('#datatablesuppliercoldetail').DataTable().ajax.reload();
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
    //#endregion Vendor lookup

    //#region Vendor 2 Lookup
    btnLookupVendorQuotation(id: any, procurement_code: any) {
        $('#datatableLookupVendorWithQuotation').DataTable().clear().destroy();
        $('#datatableLookupVendorWithQuotation').DataTable({
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
                    'p_reff_no': this.QuotationCode,
                    'p_procurement_code': procurement_code,
                    'action': 'getResponse'
                });
                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIControllerQuotationReviewDetail, this.APIRouteForLookupSupplier).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    this.lookupvendorwithquotation = parse.data;
                    if (parse.data != null) {
                        this.lookupvendorwithquotation.numberIndex = dtParameters.start;
                    }
                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API)' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 7] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '

            },
            searchDelay: 800 // pake ini supaya gak bug search
        });

        this.idDetailForReason = id;
    }

    btnSelectRowVendorQuotation(supplier_code: string, name: string, address: string, npwp: string, price_amount: string, quantity: string, tax_code: string, tax_name: string, discount_amount: string
        , ppn_pct: string, pph_pct: string, unit_available_status: string, indent_days: string, offering: string) {

        this.model.supplier_code = supplier_code;
        this.model.supplier_name = name;
        this.model.supplier_address = address;

        const listdataDetailWithQuotaion = [];

        listdataDetailWithQuotaion.push({
            p_id: this.idDetailForReason,
            p_supplier_code: supplier_code,
            p_supplier_name: name,
            p_supplier_address: address,
            p_supplier_npwp: npwp,
            p_amount: price_amount,
            p_quantity: quantity,
            p_tax_code: tax_code,
            p_tax_name: tax_name,
            p_discount_amount: discount_amount,
            p_ppn_pct: ppn_pct,
            p_pph_pct: pph_pct,
            p_unit_available_status: unit_available_status,
            p_indent_days: indent_days,
            p_offering: offering,
        });

        //#region web service
        this.dalservice.Update(listdataDetailWithQuotaion, this.APIControllerSupplierSelectionDetail, this.APIRouteForSupplierUpdateWithQuotation)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                        $('#datatablesuppliercoldetail').DataTable().ajax.reload();
                    } else {
                        this.swalPopUpMsg(parse.data);
                    }
                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);
                });
        //#endregion web service
        $('#lookupModalVendorWithQuotation').modal('hide');
    }
    //#endregion Vendor 2 lookup

    //#region amount
    amount(event, id, quotation_quantity, discount_amount) {
        // param tambahan untuk update dynamic
        this.dataTamp = [{
            'p_id': id,
            'p_amount': event.target.value,
            'p_quotation_quantity': quotation_quantity,
            'p_discount_amount': discount_amount
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

    //#region discountamount
    discountamount(event, id, amount, quotation_quantity) {
        // param tambahan untuk update dynamic
        this.dataTamp = [{
            'p_id': id,
            'p_amount': amount,
            'p_quotation_quantity': quotation_quantity,
            'p_discount_amount': event.target.value
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
    //#endregion discountamount
}
