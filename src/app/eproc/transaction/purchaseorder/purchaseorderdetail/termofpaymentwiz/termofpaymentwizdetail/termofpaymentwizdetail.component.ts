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
    templateUrl: './termofpaymentwizdetail.component.html'
})

export class TermofPaymentWizDetailComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');
    params = this.getRouteparam.snapshot.paramMap.get('id2');

    // variable
    public NumberOnlyPattern: string = this._numberonlyformat;
    public CurrencyFormat = this._currencyformat;
    public isReadOnly: Boolean = false;
    public lookupasset: any = [];
    public quoReviewDetailData: any = [];
    public lookuptermintype: any = [];
    public lookuptransaction: any = [];
    private setStyle: any = [];
    private dataTamp: any = [];
    public parameterData: any = [];
    public tempFile: any;
    public tampHidden: Boolean;
    public isButton: Boolean = false;
    private APIController: String = 'TermOfPayment';
    private APIControllerHeader: String = 'PurchaseOrder';
    private APIControllerSubcode: String = 'SysGeneralSubcode'
    private APIRouteForGetRow: String = 'GETROW';
    private APIRouteForInsert: String = 'INSERT';
    private APIRouteForUpdate: String = 'UPDATE';
    private APIRouteForLookup: String = 'GetRowsForLookup';
    private APIRouteForGetRole: String = 'ExecSpForGetRole';
    private RoleAccessCode = 'R00021580000000A';

    // form 2 way binding
    model: any = {};

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
        this.getStatusHeader();
        if (this.params != null) {
            this.isReadOnly = true;
            // call web service
            this.callGetrow();
        } else {
            this.tampHidden = true;
            this.showSpinner = false;
            this.model.amount = 0;
            this.model.percentage = 0;
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
    getStatusHeader() {
        this.dataTamp = [{
            'p_code': this.param
        }];        
        this.dalservice.Getrow(this.dataTamp, this.APIControllerHeader, this.APIRouteForGetRow)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    const parsedata = parse.data[0];
                    
                    if (parsedata.status !== 'HOLD') {
                        this.isButton = true;
                    } else {
                        this.isButton = false;
                    }

                    // mapper dbtoui
                    // Object.assign(this.model, parsedata);
                    // end mapper dbtoui

                    this.showSpinner = false;
                },
                error => {
                    console.log('There was an error while Retrieving Data(API) !!!' + error);
                });
    }
    //#endregion getStatusHeader

    //#region  form submit
    onFormSubmit(TerminOfPaymentForm: NgForm, isValid: boolean) {
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
        this.quoReviewDetailData = TerminOfPaymentForm;
        this.quoReviewDetailData = this.JSToNumberFloats(TerminOfPaymentForm)

        if (this.quoReviewDetailData.p_transaction_date == null || this.quoReviewDetailData.p_transaction_date === '') {
            this.quoReviewDetailData.p_transaction_date = undefined;
        }
        if (this.quoReviewDetailData.p_is_paid == null) {
            this.quoReviewDetailData.p_is_paid = false;
        }
        const usersJson: any[] = Array.of(this.quoReviewDetailData);

        if (this.param != null && this.params != null) {
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
                        this.showSpinner = false;
                        const parse = JSON.parse(error);
                        this.swalPopUpMsg(parse.data)
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
                            this.route.navigate(['/transaction/suborderlist/subpurchaseorderwizlist/purchaseorderwizdetail/' + this.param + '/termofpaymentwizdetail', this.param], { skipLocationChange: true });
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
    }
    //#endregion form submit

    //#region button back
    btnBack() {
        this.route.navigate(['/transaction/suborderlist/purchaseorderlist/' + this.param + '/termofpaymentlistwiz', this.param], { skipLocationChange: true });
        $('#datatabltermofpayment').DataTable().ajax.reload();
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

    //#region Termin Type Lookup
    btnLookupTerminType() {
        $('#datatableLookupTerminType').DataTable().clear().destroy();
        $('#datatableLookupTerminType').DataTable({
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
                    'p_general_code': 'TRMN',
                    'action': 'getResponse'
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.ExecSpBam(dtParameters, this.APIControllerSubcode, this.APIRouteForLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookuptermintype = parse.data;

                    if (parse.data != null) {
                        this.lookuptermintype.numberIndex = dtParameters.start;
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

    btnSelectRowTerminType(code: String, general_subcode_desc: String) {
        this.model.termin_type_code = code;
        this.model.termin_type_name = general_subcode_desc;
        $('#lookupModalTerminType').modal('hide');
    }
    //#endregion Termin Type lookup

    //#region Transaction Lookup
    btnLookupTransaction() {
        $('#datatableLookupTransacion').DataTable().clear().destroy();
        $('#datatableLookupTransacion').DataTable({
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
                    'p_general_code': 'TRXTR',
                    'action': 'getResponse'
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIControllerSubcode, this.APIRouteForLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookuptransaction = parse.data;
                    if (parse.data != null) {
                        this.lookuptransaction.numberIndex = dtParameters.start;
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

    btnSelectRowTransaction(code: String, general_subcode_desc: String) {
        this.model.transaction_code = code;
        this.model.transaction_name = general_subcode_desc;
        $('#lookupModalTransaction').modal('hide');
    }
    //#endregion Transaction lookup
}
