import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './purchaseorderwizdetaildetail.component.html'
})

export class PurchaseOrderWizDetailDetailComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');
    params = this.getRouteparam.snapshot.paramMap.get('id2');

    // variable
    public NumberOnlyPattern: string = this._numberonlyformat;
    public CurrencyFormat = this._currencyformat;
    public isReadOnly: Boolean = false;
    public lookupasset: any = [];
    public quoReviewDetailData: any = [];
    public lookupitemcode: any = [];
    public lookupuomcode: any = [];
    public lookupTax: any = [];
    public parameterData: any = [];
    public tempFile: any;
    public tampHidden: Boolean;
    public isButton: Boolean = false;
    public isButtonForETADate: Boolean = false;
    public isButtonSave: Boolean = false;
    public Flag_Process: any = [];
    public EstimateDate: String;
    public EstimateDate2: String;
    public listobjectinfolist: any = [];
    public listdataDetail: any = [];

    private dataRoleTamp: any = [];
    private setStyle: any = [];
    private dataTamp: any = [];
    private dataTampPush: any = [];

    private APIController: String = 'PurchaseOrderDetail';
    private APIControllerHeader: String = 'PurchaseOrder';
    private APIControllerBaseItemCode: String = 'MasterItem';
    private APIControllerSysUomCode: String = 'MasterUom';
    private APIControllerTaxCode: String = 'MasterTaxScheme';
    private APIControllerObjectInfo: String = 'PurchaseOrderDetailObjectInfo';

    private APIRouteForGetRow: String = 'GETROW';
    private APIRouteForInsert: String = 'INSERT';
    private APIRouteForUpdate: String = 'UPDATE';
    private APIRouteForLookup: String = 'GetRowsForLookup';
    private APIRouteForupdate: String = 'ExecSpForUpdateEtaDate';
    private APIRouteForGetRows: String = 'GetRows';
    private APIRouteForDelete: String = 'DELETE';
    private RoleAccessCode = 'R00021580000000A';

    // form 2 way binding
    model: any = {};
    modeldetail: any = {};

    // checklist
    public selectedAll: any;
    private checkedList: any = [];

    // spinner
    showSpinner: Boolean = true;
    // end

    // datatable
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};

    constructor(private dalservice: DALService,
        public getRouteparam: ActivatedRoute,
        public route: Router,
        private _elementRef: ElementRef
    ) { super(); }

    ngOnInit() {
        this.Delimiter(this._elementRef);
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        this.callGetrowHeader();
        if (this.params != null) {
            this.isReadOnly = true;
            // call web service
            this.callGetrow();
            this.loadData();
        } else {
            this.tampHidden = true;
            this.showSpinner = false;
            this.model.price_amount = 0;
            this.model.discount_amount = 0;
            this.model.unit_available_status = 'READY';
        }
    }

    //#region getrow data
    callGetrow() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_id': this.params
        }];
        // end param tambahan untuk getrow dynamic
        this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    const parsedata = this.getrowNgb(parse.data[0]);
                                        
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

    //#region getStatusHeader
    callGetrowHeader() {
        this.dataTamp = [{
            'p_code': this.param
        }];

        this.dalservice.Getrow(this.dataTamp, this.APIControllerHeader, this.APIRouteForGetRow)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    const parsedata = parse.data[0];

                    if (parsedata.status != 'HOLD' || parsedata.flag_process == 'GNR') {
                        this.isButton = true;
                    } else {
                        this.isButton = false;
                    }

                    if (parsedata.status != 'APPROVE') {
                        this.isButtonForETADate = true;
                        this.tampHidden = false;
                    } else {
                        this.isButtonForETADate = false;
                        this.tampHidden = true;
                    }

                    if (parsedata.status == 'CLOSED') {

                        this.isButtonSave = true;
                    } else {

                        this.isButtonSave = false;
                    }

                    // mapper dbtoui
                    Object.assign(this.modeldetail, parsedata);
                    // end mapper dbtoui

                    this.showSpinner = false;
                },
                error => {
                    console.log('There was an error while Retrieving Data(API) !!!' + error);
                });
    }
    //#endregion getStatusHeader

    //#region  form submit
    onFormSubmit(quoReviewDetailForm: NgForm, isValid: boolean) {
        // validation form submit
        if (!isValid) {
            swal({
                allowOutsideClick: false,
                title: 'Warning',
                text: 'Please Fill a Mandatory Field OR Format Is Invalid',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-warning',
                type: 'warning'
            }).catch(swal.noop)
            return;
        } else {
            this.showSpinner = true;
        }

        // this.quoReviewDetailData = quoReviewDetail;
        this.quoReviewDetailData = quoReviewDetailForm;
        this.quoReviewDetailData = this.JSToNumberFloats(quoReviewDetailForm)

        const usersJson: any[] = Array.of(this.quoReviewDetailData);

        if (this.param != null && this.params != null) {
            // call web service
            this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
                .subscribe(
                    res => {
                        const parse = JSON.parse(res);
                        if (parse.result === 1) {
                            this.showNotification('bottom', 'right', 'success');
                            this.callGetrow()
                            $('#btnPurchaseOrderDetail').click()
                            this.showSpinner = false;
                            $('#datatableObjectInfo').DataTable().ajax.reload();
                        } else {
                            this.swalPopUpMsg(parse.data);
                            this.showSpinner = false;
                        }
                    },
                    error => {
                        this.showSpinner = false;
                        const parse = JSON.parse(error);
                        this.swalPopUpMsg(parse.data)
                    });
        } else {
            // call web service
            this.dalservice.Insert(usersJson, this.APIController, this.APIRouteForInsert)
                .subscribe(
                    res => {
                        const parse = JSON.parse(res);
                        if (parse.result === 1) {
                            this.showNotification('bottom', 'right', 'success');
                            this.route.navigate(['/transaction/suborderlist/purchaseorderlist/' + this.param + '/purchaserorderwizdetail', this.param, parse.id], { skipLocationChange: true });
                            $('#btnPurchaseOrderDetail').click()
                            this.showSpinner = false;
                        } else {
                            this.swalPopUpMsg(parse.data);
                            this.showSpinner = false;
                        }
                    },
                    error => {
                        this.showSpinner = false;
                        const parse = JSON.parse(error);
                        this.swalPopUpMsg(parse.data)
                    });
        }
    }
    //#endregion form submit

    //#region button back
    btnBack() {
        this.route.navigate(['/transaction/suborderlist/purchaseorderlist/' + this.param + '/purchaserorderwizlist', this.param], { skipLocationChange: true });
        $('#datatablepo').DataTable().ajax.reload();
    }
    //#endregion button back

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

    //#region ItemCode Lookup
    btnLookupItemCode() {
        $('#datatableLookupItemCode').DataTable().clear().destroy();
        $('#datatableLookupItemCode').DataTable({
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
                this.dalservice.ExecSpBam(dtParameters, this.APIControllerBaseItemCode, this.APIRouteForLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupitemcode = parse.data;

                    if (parse.data != null) {
                        this.lookupitemcode.numberIndex = dtParameters.start;
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

    btnSelectRowItemCode(code: String, name: String, uom_code: String, uom_name: String, type_asset_code: String, fa_category_code: String, fa_category_name: String
        , merk_code: String, merk_name: String, type_code: String, type_name: String, model_code: String, model_name: String) {
        this.model.item_code = code;
        this.model.item_name = name;
        this.model.uom_code = uom_code;
        this.model.uom_name = uom_name;
        this.model.type_asset_code = type_asset_code;
        this.model.item_category_code = fa_category_code;
        this.model.item_category_name = fa_category_name;
        this.model.item_merk_code = merk_code;
        this.model.item_merk_name = merk_name;
        this.model.item_model_code = model_code;
        this.model.item_model_name = model_name;
        this.model.item_type_code = type_code;
        this.model.item_type_name = type_name;
        $('#lookupModalItemCode').modal('hide');
    }
    //#endregion ItemCode lookup

    //#region UomCode Lookup
    btnLookupUomCode() {
        $('#datatableLookupUomCode').DataTable().clear().destroy();
        $('#datatableLookupUomCode').DataTable({
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
                this.dalservice.GetrowsBam(dtParameters, this.APIControllerSysUomCode, this.APIRouteForLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupuomcode = parse.data;

                    if (parse.data != null) {
                        this.lookupuomcode.numberIndex = dtParameters.start;
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

    btnSelectRowUomCode(code: String, description: String) {
        this.model.uom_code = code;
        this.model.uom_name = description;
        $('#lookupModalUomCode').modal('hide');
    }
    //#endregion UomCode lookup

    //#region Tax Lookup
    btnLookupTaxCode() {
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
    }

    btnSelectRowTax(code: String, description: String, ppn_pct: String, pph_pct: String) {
        this.model.tax_code = code;
        this.model.tax_name = description;
        this.model.ppn_pct = ppn_pct;
        this.model.pph_pct = pph_pct;
        $('#lookupModalTax').modal('hide');
    }
    //#endregion Tax lookup

    InitiationDate(event: any) {
        this.EstimateDate = event;
        this.model.eta_date = this.EstimateDate;
    }

    EtaDate(event: any) {
        this.EstimateDate2 = event;
    }

    //#region btnUpdate
    btnUpdate(quoReviewDetailForm: NgForm) {

        // param tambahan untuk button Post dynamic
        this.quoReviewDetailData = quoReviewDetailForm;
        this.quoReviewDetailData = this.JSToNumberFloats(quoReviewDetailForm)
        this.dataRoleTamp = [{
            'p_id': this.params,
            'p_eta_date': this.quoReviewDetailData.p_eta_date_detail,
            'p_eta_date_remark': this.quoReviewDetailData.p_eta_date_remark,
            'action': 'default'

        }];
        // param tambahan untuk button Post dynamic
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForupdate)
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

    }
    //#endregion btnUpdate

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
                    'p_purchase_order_detail_id': this.params,
                })
                // end param tambahan untuk getrows dynamic                
                this.dalservice.Getrows(dtParameters, this.APIControllerObjectInfo, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    // if use checkAll use this
                    $('#checkall').prop('checked', false);
                    // end checkall

                    this.listobjectinfolist = parse.data;

                    if (parse.data != null) {
                        this.listobjectinfolist.numberIndex = dtParameters.start;
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

    //#region checkbox all table
    btnDeleteAll() {
        this.checkedList = [];
        for (let i = 0; i < this.listobjectinfolist.length; i++) {
            if (this.listobjectinfolist[i].selected) {
                this.checkedList.push(this.listobjectinfolist[i].id);
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
            if (result.value) {
                this.dataTampPush = [];
                for (let J = 0; J < this.checkedList.length; J++) {
                    const id = this.checkedList[J];
                    // param tambahan untuk getrow dynamic
                    this.dataTampPush = [{
                        'p_id': id
                    }];
                    // end param tambahan untuk getrow dynamic
                    this.dalservice.Delete(this.dataTampPush, this.APIControllerObjectInfo, this.APIRouteForDelete)
                        .subscribe(
                            res => {
                                this.showSpinner = false;
                                const parse = JSON.parse(res);
                                if (parse.result === 1) {
                                    if (this.checkedList.length == J + 1) {
                                        this.showNotification('bottom', 'right', 'success');
                                        $('#datatableObjectInfo').DataTable().ajax.reload();
                                        // if use checkAll use this
                                        $('#checkall').prop('checked', false);
                                        // end checkall
                                    }
                                } else {
                                    this.swalPopUpMsg(parse.data);
                                }
                            },
                            error => {
                                const parse = JSON.parse(error);
                                this.swalPopUpMsg(parse.data);
                            });
                }
            } else {
                this.showSpinner = false;
            }
        });
    }

    selectAll() {
        for (let i = 0; i < this.listobjectinfolist.length; i++) {
            this.listobjectinfolist[i].selected = this.selectedAll;
        }
    }

    checkIfAllTableSelected() {
        this.selectedAll = this.listobjectinfolist.every(function (item: any) {
            return item.selected === true;
        })
    }
    //#endregion checkbox all table

    //#region button save list
    btnSaveList() {
        this.showSpinner = true
        this.listdataDetail = [];

        var i = 0;

        var getID = $('[name="p_id_object_info"]')
            .map(function () { return $(this).val(); }).get();

        var getPlatNo = $('[name="p_plat_no"]')
            .map(function () { return $(this).val(); }).get();

        var getSerialNo = $('[name="p_serial_no"]')
            .map(function () { return $(this).val(); }).get();

        var getChasisNo = $('[name="p_chassis_no"]')
            .map(function () { return $(this).val(); }).get();

        var getEngineNo = $('[name="p_engine_no"]')
            .map(function () { return $(this).val(); }).get();

        var getInvoiceNo = $('[name="p_invoice_no"]')
            .map(function () { return $(this).val(); }).get();

        var getDomain = $('[name="p_domain"]')
            .map(function () { return $(this).val(); }).get();

        var getImei = $('[name="p_imei"]')
            .map(function () { return $(this).val(); }).get();

        while (i < getID.length) {
            this.listdataDetail.push(
                this.JSToNumberFloats({
                    p_id: getID[i],
                    p_plat_no: getPlatNo[i],
                    p_serial_no: getSerialNo[i],
                    p_chassis_no: getChasisNo[i],
                    p_engine_no: getEngineNo[i],
                    p_invoice_no: getInvoiceNo[i],
                    p_domain: getDomain[i],
                    p_imei: getImei[i]

                })
            );
            i++;
        }
        //#region web service
        this.dalservice.Update(this.listdataDetail, this.APIControllerObjectInfo, this.APIRouteForUpdate)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);

                    if (parse.result === 1) {
                        this.showNotification('bottom', 'right', 'success');
                        $('#datatableObjectInfo').DataTable().ajax.reload();
                        this.showSpinner = false
                    } else {
                        this.swalPopUpMsg(parse.data);
                        this.showSpinner = false
                    }
                },
                error => {
                    this.showSpinner = false
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);

                });
        //#endregion web service

    }
    //#endregion button save list
}
