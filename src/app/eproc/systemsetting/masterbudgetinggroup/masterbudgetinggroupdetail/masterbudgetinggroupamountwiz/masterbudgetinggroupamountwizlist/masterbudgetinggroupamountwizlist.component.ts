import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';
import { Location } from '@angular/common';
import swal from 'sweetalert2';
import { NgForm } from '@angular/forms';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './masterbudgetinggroupamountwizlist.component.html'
})

export class MasterbudgetinggroupamountwizListComponent extends BaseComponent implements OnInit {

    param = this.getRouteparam.snapshot.paramMap.get('id');

    // variable
    public listbudgetingamount: any = [];
    public listsalesdetail: any = [];
    public lookupItemGroup: any = [];
    public item_group_name: String;
    public item_group_code: String = '';
    public group_level: number = 0;
    public budgeting_by: String;

    public dataTamp: any = [];
    public dataTampPush: any = [];
    public AssetMaintenanceData: any = [];
    public lookupAsset: any = [];
    public lookupItem: any = [];
    public listbudgetingamountdetailData: any = [];
    private setStyle: any = [];
    private tamps = new Array();
    public tempFile: any;
    public templatename: any = [];
    public tempFile_upload: any;
    private base64textString: string;
    private char_upload: any = [];
    private idDetailForReason: any;

    //controller
    private APIController: String = 'MasterBudgetingGroupAmount';
    private APIControllerHeader: String = 'MasterBudgetingGroup';
    private APIControllerMasterItemGroup: String = 'MasterItemGroup';
    private APIControllerMasterItem: String = 'MasterItem';
    //routing
    private APIRouteForGetRows: String = 'GetRows';
    private APIRouteForGetDelete: String = 'Delete';
    private APIRouteUpdateItemGroupBasedOnMaster: String = 'UpdateItemGroupBasedOnMaster';
    private APIRouteDeleteBudgetingAmountForUpload: String = 'DeleteBudgetingAmountForUpload';
    private APIRouteForInsert: String = 'Insert';
    private APIRouteForUpdate: String = 'Update';
    private APIRouteForUpdateItemGroup = 'UpdateItemGroup';
    private APIRouteForDownload: String = 'DownloadFile';
    private APIRouteForDownloadFileWithData: string = 'DownloadFileWithData';
    private APIRouteForUploadDataFile: String = 'UploadDataExcel';
    private APIRouteForGetRow: String = 'GetRow';
    private APIRouteLookup: String = 'GetRowsForLookupBudgetingGroupAmount';
    private RoleAccessCode = 'R00021490000000A';

    // ini buat datatables
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};

    // form 2 way binding
    model: any = {};

    // checklist
    public selectedAll: any;
    private checkedList: any = [];
    private checkedLookup: any = [];
    public selectedAllLookup: any;

    // spinner
    showSpinner: Boolean = false;
    // end

    constructor(private dalservice: DALService,
        public getRouteparam: ActivatedRoute,
        public route: Router,
        private _location: Location,
        private _elementRef: ElementRef) { super(); }

    ngOnInit() {
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        this.compoSide('', this._elementRef, this.route);
        this.loadData();
        this.callGetrowHeader();
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
                    'p_budgeting_group_code': this.param
                })
                // end param tambahan untuk getrows dynamic

                this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    // if use checkAll use this
                    $('#checkall').prop('checked', false);
                    // end checkall

                    this.listbudgetingamount = parse.data;

                    if (parse.data != null) {
                        this.listbudgetingamount.numberIndex = dtParameters.start;
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
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 3] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        }
    }
    //#endregion load all data

    //#region Header getrow data
    callGetrowHeader() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_code': this.param,
        }]
        // end param tambahan untuk getrow dynamic

        this.dalservice.Getrow(this.dataTamp, this.APIControllerHeader, this.APIRouteForGetRow)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    // const parsedata = parse.data[0];
                    const parsedata = this.getrowNgb(parse.data[0]);

                    this.group_level = parsedata.group_level;
                    this.budgeting_by = parsedata.budgeting_by;

                    // mapper dbtoui
                    Object.assign(this.model, parsedata);
                    // end mapper dbtoui
                    this.showSpinner = false;
                },
                error => {
                    console.log('There was an error while Retrieving Data(API) !!!' + error);
                });
    }
    //#endregion BatchDetail getrow data

    //#region delete data  
    deleteBudgetingGroupAmountForUpload() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_budgeting_group_code': this.param,
            'p_budgeting_by': this.budgeting_by,
            'action': 'default'
        }]
        // end param tambahan untuk getrow dynamic
        this.dalservice.ExecSp(this.dataTamp, this.APIController, this.APIRouteDeleteBudgetingAmountForUpload)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                        this.showSpinner = false;
                        $('#datatableBudgetingAmountDetail').DataTable().ajax.reload();
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
    //#endregion delete data

    //#region delete data  
    updateItemGroupBasedOnMaster() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_budgeting_group_code': this.param,
            'p_budgeting_by': this.budgeting_by,
            'action': 'default'
        }]
        // end param tambahan untuk getrow dynamic
        this.dalservice.ExecSp(this.dataTamp, this.APIController, this.APIRouteUpdateItemGroupBasedOnMaster)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                        this.showSpinner = false;
                        $('#datatableBudgetingAmountDetail').DataTable().ajax.reload();
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
    //#endregion delete data

    //#region onFocus
    onFocusBudgetJanAmount(event, i, type) {
        event = '' + event.target.value;


        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_jan_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_jan_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetFebAmount(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_feb_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_feb_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetMarAmount(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_mar_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_mar_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetAprAmount(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_apr_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_apr_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetMeiAmount(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_mei_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_mei_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetJunAmount(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_jun_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_jun_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetJulAmount(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_jul_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_jul_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetAgtAmount(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_agt_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_agt_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetSepAmount(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_sep_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_sep_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetOktAmount(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_okt_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_okt_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetNovAmount(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_nov_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_nov_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetDesAmount(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_des_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_des_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }
    //#endregion onFocus

    //#region onBlur
    onBlurBudgetJanAmount(event, i, type) {
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
            $('#budget_jan_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_jan_amount' + i)
                .map(function () { return $(this).val(event); }).get();

        }
    }

    onBlurBudgetFebAmount(event, i, type) {
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
            $('#budget_feb_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_feb_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetMarAmount(event, i, type) {
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
            $('#budget_mar_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_mar_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetAprAmount(event, i, type) {
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
            $('#budget_apr_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_apr_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetMeiAmount(event, i, type) {
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
            $('#budget_mei_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_mei_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetJunAmount(event, i, type) {
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
            $('#budget_jun_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_jun_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetJulAmount(event, i, type) {
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
            $('#budget_jul_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_jul_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetAgtAmount(event, i, type) {
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
            $('#budget_agt_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_agt_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetSepAmount(event, i, type) {
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
            $('#budget_sep_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_sep_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetOktAmount(event, i, type) {
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
            $('#budget_okt_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_okt_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetNovAmount(event, i, type) {
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
            $('#budget_nov_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_nov_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetDesAmount(event, i, type) {
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
            $('#budget_des_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_des_amount' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }
    //#endregion onBlur

    //#region Delete
    btnDeleteAll() {
        this.checkedList = [];
        for (let i = 0; i < this.listbudgetingamount.length; i++) {
            if (this.listbudgetingamount[i].selected) {
                this.checkedList.push(this.listbudgetingamount[i].id);
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
                    const id = this.checkedList[J];
                    // param tambahan untuk getrow dynamic
                    this.dataTamp = [{
                        'p_id': id
                    }];
                    // end param tambahan untuk getrow dynamic

                    this.dalservice.Delete(this.dataTamp, this.APIController, this.APIRouteForGetDelete)
                        .subscribe(
                            res => {
                                this.showSpinner = false;
                                const parse = JSON.parse(res);
                                if (parse.result === 1) {
                                    if (J + 1 === this.checkedList.length) {
                                        this.showNotification('bottom', 'right', 'success');
                                        $('#datatableBudgetingAmountDetail').DataTable().ajax.reload();
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
                }
            } else {
                this.showSpinner = false;
            }
        });
    }

    selectAllTable() {
        for (let i = 0; i < this.listbudgetingamount.length; i++) {
            this.listbudgetingamount[i].selected = this.selectedAll;
        }
    }

    checkIfAllTableSelected() {
        this.selectedAll = this.listbudgetingamount.every(function (item: any) {
            return item.selected === true;
        })
    }
    //#endregion Delete

    //#region lookup Item
    btnLookupItem() {
        this.callGetrowHeader();
        $('#datatableLookupItem').DataTable().clear().destroy();
        $('#datatableLookupItem').DataTable({
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
                    'p_budgeting_group_code': this.param,
                    'p_group_level': this.group_level
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.ExecSp(dtParameters, this.APIControllerMasterItemGroup, this.APIRouteLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    this.lookupItem = parse.data;
                    if (parse.data != null) {
                        this.lookupItem.numberIndex = dtParameters.start;
                    }
                    // if use checkAll use this
                    $('#checkallLookup').prop('checked', false);
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
        });
    }
    //#endregion lookup Asset

    //#region checkbox all lookup
    btnSelectAllLookup() {
        this.checkedLookup = [];
        for (let i = 0; i < this.lookupItem.length; i++) {
            if (this.lookupItem[i].selectedLookup) {
                this.checkedLookup.push({
                    'item_group_code': this.lookupItem[i].code,
                    'item_group_name': this.lookupItem[i].description
                });
            }
        }

        // jika tidak di checklist
        if (this.checkedLookup.length === 0) {
            swal({
                title: this._listdialogconf,
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-danger'
            }).catch(swal.noop)
            return
        }

        // this.dataTamp = [];
        for (let J = 0; J < this.checkedLookup.length; J++) {
            this.dataTamp = [];
            const codeData = this.checkedLookup[J].item_group_code;
            const nameData = this.checkedLookup[J].item_group_name;
            this.dataTamp.push({
                'p_budgeting_group_code': this.param,
                'p_item_group_code': codeData,
                'p_item_group_name': nameData
            });

            // end param tambahan untuk getrow dynamic
            this.dalservice.Insert(this.dataTamp, this.APIController, this.APIRouteForInsert)
                .subscribe(
                    res => {
                        this.showSpinner = false;
                        const parse = JSON.parse(res);
                        if (parse.result === 1) {
                            if (this.checkedLookup.length == J + 1) {
                                this.showNotification('bottom', 'right', 'success');
                                $('#datatableLookupItem').DataTable().ajax.reload();
                                $('#datatableBudgetingAmountDetail').DataTable().ajax.reload();
                            }
                        } else {
                            this.swalPopUpMsg(parse.data);
                        }
                    },
                    error => {
                        const parse = JSON.parse(error);
                        this.swalPopUpMsg(parse.data);
                    })
        }

    }

    selectAllLookup() {
        for (let i = 0; i < this.lookupItem.length; i++) {
            this.lookupItem[i].selectedLookup = this.selectedAllLookup;
        }
    }

    checkIfAllLookupSelected() {
        this.selectedAllLookup = this.lookupItem.every(function (item: any) {
            return item.selectedLookup === true;
        })
    }
    //#endregion checkbox all table

    //#region btnLookupItemGroup
    // btnLookupItemGroup(id: any) {
    //     // this.callGetrow();
    //     $('#datatableLookupItemGroup').DataTable().clear().destroy();
    //     $('#datatableLookupItemGroup').DataTable({
    //         'pagingType': 'first_last_numbers',
    //         'pageLength': 5,
    //         'processing': true,
    //         'serverSide': true,
    //         responsive: true,
    //         lengthChange: false, // hide lengthmenu
    //         searching: true, // jika ingin hilangin search box nya maka false
    //         ajax: (dtParameters: any, callback) => {
    //             dtParameters.paramTamp = [];
    //             dtParameters.paramTamp.push({
    //                 'p_company_code': this.company_code,
    //                 'p_budgeting_group_code': this.param
    //             });
    //             this.dalservice.ExecSpEproc(dtParameters, this.APIControllerMasterItemGroup, this.APIRouteLookup).subscribe(resp => {
    //                 const parse = JSON.parse(resp);
    //                 this.lookupItemGroup = parse.data;
    //                 if (parse.data != null) {
    //                     this.lookupItemGroup.numberIndex = dtParameters.start;
    //                 }
    //                 callback({
    //                     draw: parse.draw,
    //                     recordsTotal: parse.recordsTotal,
    //                     recordsFiltered: parse.recordsFiltered,
    //                     data: []
    //                 })
    //             }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
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

    // btnSelectRowItemGroup(code: String, name: String) {

    //     this.listbudgetingamountdetailData = [];

    //     var i = 0;

    //     var getID = $('[name="p_id_amount"]')
    //         .map(function () { return $(this).val(); }).get();

    //     while (i < getID.length) {

    //         if (getID[i] == this.idDetailForReason) {

    //             this.listbudgetingamountdetailData.push({
    //                 p_id: getID[i],
    //                 p_item_group_code: code,
    //                 p_item_group_name: name
    //             });
    //         }
    //         i++;
    //     }

    //     //#region web service
    //     this.dalservice.Update(this.listbudgetingamountdetailData, this.APIController, this.APIRouteForUpdateItemGroup)
    //         .subscribe(
    //             res => {
    //                 const parse = JSON.parse(res);
    //                 if (parse.result === 1) {
    //                     $('#datatableBudgetingAmountDetail').DataTable().ajax.reload();
    //                 } else {
    //                     this.swalPopUpMsg(parse.data);
    //                 }
    //             },
    //             error => {
    //                 const parse = JSON.parse(error);
    //                 this.swalPopUpMsg(parse.data);
    //             });
    //     //#endregion web service
    //     $('#lookupModalItemGroup').modal('hide');
    // }
    //#endregion btnLookupItemGroup

    //#region lookup close
    btnLookupClose() {
        this.loadData();
    }
    //#endregion lookup close

    //#region button save list
    btnSaveList() {
        // this.showSpinner = true;
        this.listbudgetingamountdetailData = [];

        var i = 0;

        var getID = $('[name="p_id_amount"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetJanAmount = $('[name="p_budget_jan_amount"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetFebAmount = $('[name="p_budget_feb_amount"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetMarAmount = $('[name="p_budget_mar_amount"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetAprAmount = $('[name="p_budget_apr_amount"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetMeiAmount = $('[name="p_budget_mei_amount"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetJunAmount = $('[name="p_budget_jun_amount"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetJulAmount = $('[name="p_budget_jul_amount"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetAgtAmount = $('[name="p_budget_agt_amount"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetSepAmount = $('[name="p_budget_sep_amount"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetOktAmount = $('[name="p_budget_okt_amount"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetNovAmount = $('[name="p_budget_nov_amount"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetDesAmount = $('[name="p_budget_des_amount"]')
            .map(function () { return $(this).val(); }).get();


        while (i < getID.length) {

            while (i < getBudgetJanAmount.length) {

                while (i < getBudgetFebAmount.length) {

                    while (i < getBudgetMarAmount.length) {

                        while (i < getBudgetAprAmount.length) {

                            while (i < getBudgetMeiAmount.length) {

                                while (i < getBudgetJunAmount.length) {

                                    while (i < getBudgetJulAmount.length) {

                                        while (i < getBudgetAgtAmount.length) {

                                            while (i < getBudgetSepAmount.length) {

                                                while (i < getBudgetOktAmount.length) {

                                                    while (i < getBudgetNovAmount.length) {

                                                        while (i < getBudgetDesAmount.length) {
                                                            this.listbudgetingamountdetailData.push(
                                                                this.JSToNumberFloats({
                                                                    p_id: getID[i],
                                                                    p_budgeting_group_code: this.param,
                                                                    p_budget_jan_amount: getBudgetJanAmount[i],
                                                                    p_budget_feb_amount: getBudgetFebAmount[i],
                                                                    p_budget_mar_amount: getBudgetMarAmount[i],
                                                                    p_budget_apr_amount: getBudgetAprAmount[i],
                                                                    p_budget_mei_amount: getBudgetMeiAmount[i],
                                                                    p_budget_jun_amount: getBudgetJunAmount[i],
                                                                    p_budget_jul_amount: getBudgetJulAmount[i],
                                                                    p_budget_agt_amount: getBudgetAgtAmount[i],
                                                                    p_budget_sep_amount: getBudgetSepAmount[i],
                                                                    p_budget_okt_amount: getBudgetOktAmount[i],
                                                                    p_budget_nov_amount: getBudgetNovAmount[i],
                                                                    p_budget_des_amount: getBudgetDesAmount[i]
                                                                })
                                                            );
                                                            i++;
                                                        }
                                                        i++;

                                                    }
                                                    i++;

                                                }
                                                i++;

                                            }
                                            i++;

                                        }
                                        i++;

                                    }
                                    i++;

                                }
                                i++;

                            }
                            i++;

                        }
                        i++;

                    }
                    i++;
                }
                i++;

            }
            i++;
        }



        //#region web service
        this.dalservice.Update(this.listbudgetingamountdetailData, this.APIController, this.APIRouteForUpdate)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);

                    if (parse.result === 1) {
                        this.showNotification('bottom', 'right', 'success');
                        $('#datatableBudgetingAmountDetail').DataTable().ajax.reload();
                    } else {
                        this.swalPopUpMsg(parse.data);
                    }
                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);

                });
        //#endregion web service

    }
    //#endregion button save list

    //#region upload excel reader
    handleFile(event) {
        const binaryString = event.target.result;
        this.base64textString = btoa(binaryString);

        this.tamps.push({
            p_header: 'BUDGETING_GROUP_AMOUNT',
            p_child: this.param,
            p_budgeting_group_code: this.param,
            filename: this.tempFile,
            base64: this.base64textString
        });
    }

    onUploadReader(event) {
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

        this.templatename = 'BUDGETINGGROUPAMOUNTUPLOAD.XLSX';
        this.tempFile = files[0].name.toUpperCase();
        this.char_upload = (this.templatename.length) - 5
        this.tempFile_upload = this.tempFile.substr(0, ~~this.char_upload) + '.XLSX';

        if (this.templatename != this.tempFile_upload) {
            this.tempFile = undefined;
            swal({
                title: 'Warning',
                text: 'Invalid Template Name',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-danger',
                type: 'warning'
            }).catch(swal.noop)
            return;
        } else {
            this.showSpinner = true;
        }
        // this.tampDocumentCode = code;
        swal({
            title: 'Are you sure?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            buttonsStyling: false
        }).then((result) => {
            this.showSpinner = true;
            this.deleteBudgetingGroupAmountForUpload();
            if (result.value) {
                this.dalservice.UploadFile(this.tamps, this.APIController, this.APIRouteForUploadDataFile)
                    .subscribe(
                        res => {

                            const parse = JSON.parse(res);

                            if (parse.result === 1) {
                                this.tamps = [];
                                this.updateItemGroupBasedOnMaster();
                                $('#fileControl').val('');
                                this.showNotification('bottom', 'right', 'success');
                                $('#datatableBudgetingAmountDetail').DataTable().ajax.reload();
                                this.tempFile = undefined;
                            } else {
                                this.showSpinner = false;
                                this.swalPopUpMsg(parse.data);
                                $('#fileControl').val('');
                                $('#datatableBudgetingAmountDetail').DataTable().ajax.reload();
                                this.tempFile = undefined;
                                this.tamps = [];
                            }
                        }, error => {
                            this.showSpinner = false;
                            const parse = JSON.parse(error);
                            this.swalPopUpMsg(parse.data);
                            $('#fileControl').val('');
                            $('#datatableBudgetingAmountDetail').DataTable().ajax.reload();
                            this.tempFile = undefined;
                            this.tamps = [];
                        });
            } else {
                this.showSpinner = false;
                $('#fileControl').val('');
                $('#datatableBudgetingAmountDetail').DataTable().ajax.reload();
                this.tempFile = undefined;
                this.tamps = [];
            }
        })

    }
    //#endregion button select image

    //#region btnDownload
    btnDownload() {
        const dataParam = [
            {
                'p_budgeting_group_code': this.param
            }
        ];
        this.showSpinner = true;
        this.dalservice.DownloadFileWithData(dataParam, this.APIController, this.APIRouteForDownloadFileWithData).subscribe(res => {

            this.showSpinner = false;
            var contentDisposition = res.headers.get('content-disposition');

            var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();

            const blob = new Blob([res.body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            // window.open(url);


        }, err => {
            this.showSpinner = false;
            const parse = JSON.parse(err);
            this.swalPopUpMsg(parse.data);
        });
    }
    // #endregion btnDownload
}


