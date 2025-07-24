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
    templateUrl: './masterbudgetinggroupquantitywizlist.component.html'
})

export class MasterbudgetinggroupquantitywizListComponent extends BaseComponent implements OnInit {

    param = this.getRouteparam.snapshot.paramMap.get('id');

    // variable
    public listbudgetingqty: any = [];
    public listsalesdetail: any = [];
    public lookupItemGroup: any = [];
    public item_group_name: String;
    public item_group_code: String = '';
    public dataTamp: any = [];
    public dataTampPush: any = [];
    public AssetMaintenanceData: any = [];
    public group_level: number = 0;
    public budgeting_by: String;

    public lookupAsset: any = [];
    public lookupItem: any = [];
    public listbudgetingqtydetailData: any = [];
    private setStyle: any = [];
    private tamps = new Array();
    public tempFile: any;
    public templatename: any = [];
    public tempFile_upload: any;
    private base64textString: string;
    private char_upload: any = [];

    private idDetailForReason: any;
    //controller
    private APIController: String = 'MasterBudgetingGroupQuantity';
    private APIControllerHeader: String = 'MasterBudgetingGroup';
    private APIControllerMasterItemGroup: String = 'MasterItemGroup';
    //routing
    private APIRouteForGetRows: String = 'GetRows';
    private APIRouteForGetRow: String = 'GetRow';
    private APIRouteForGetDelete: String = 'Delete';
    private APIRouteForInsert: String = 'Insert';
    private APIRouteForUpdate: String = 'Update';
    private APIRouteForUploadDataFile: String = 'UploadDataExcel';
    private APIRouteForDownloadFileWithData: string = 'DownloadFileWithData';
    private APIRouteUpdateItemGroupBasedOnMaster: String = 'UpdateItemGroupBasedOnMaster';
    private APIRouteDeleteBudgetingQtyForUpload: String = 'DeleteBudgetingQtyForUpload';
    private APIRouteLookup: String = 'GetRowsForLookupBudgetingGroupQty';
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
                    this.listbudgetingqty = parse.data;

                    if (parse.data != null) {
                        this.listbudgetingqty.numberIndex = dtParameters.start;
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
    deleteBudgetingGroupQtyForUpload() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_budgeting_group_code': this.param,
            'p_budgeting_by': this.budgeting_by,
            'action': 'default'
        }]
        // end param tambahan untuk getrow dynamic
        this.dalservice.ExecSp(this.dataTamp, this.APIController, this.APIRouteDeleteBudgetingQtyForUpload)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                        this.showSpinner = false;
                        $('#datatableBudgetingQtyDetail').DataTable().ajax.reload();
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
                        $('#datatableBudgetingQtyDetail').DataTable().ajax.reload();
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
    onFocusBudgetJanQty(event, i, type) {

        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_jan_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_jan_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetFebQty(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_feb_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_feb_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetMarQty(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_mar_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_mar_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetAprQty(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_apr_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_apr_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetMeiQty(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_mei_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_mei_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetJunQty(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_jun_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_jun_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetJulQty(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_jul_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_jul_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetAgtQty(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_agt_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_agt_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetSepQty(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_sep_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_sep_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetOktQty(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_nov_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_nov_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetNovQty(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_nov_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_nov_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onFocusBudgetDesQty(event, i, type) {
        event = '' + event.target.value;

        if (event != null) {
            event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
        }

        if (type === 'amount') {
            $('#budget_des_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_des_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }
    //#endregion onFocus

    //#region onBlur
    onBlurBudgetJanQty(event, i, type) {
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
                event = parseFloat(event).toFixed(0); // ganti jadi 6 kalo mau pct
                event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
            }
        } else {
            event = '' + event.target.value;
            event = event.trim();
            event = parseFloat(event).toFixed(6);
        }

        if (event === 'NaN') {
            event = 0;
            event = parseFloat(event).toFixed(0);
        }

        if (type === 'amount') {
            $('#budget_jan_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_jan_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetFebQty(event, i, type) {
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
                event = parseFloat(event).toFixed(0); // ganti jadi 6 kalo mau pct
                event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
            }
        } else {
            event = '' + event.target.value;
            event = event.trim();
            event = parseFloat(event).toFixed(6);
        }

        if (event === 'NaN') {
            event = 0;
            event = parseFloat(event).toFixed(0);
        }

        if (type === 'amount') {
            $('#budget_feb_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_feb_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetMarQty(event, i, type) {
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
                event = parseFloat(event).toFixed(0); // ganti jadi 6 kalo mau pct
                event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
            }
        } else {
            event = '' + event.target.value;
            event = event.trim();
            event = parseFloat(event).toFixed(6);
        }

        if (event === 'NaN') {
            event = 0;
            event = parseFloat(event).toFixed(0);
        }

        if (type === 'amount') {
            $('#budget_mar_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_mar_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetAprQty(event, i, type) {
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
                event = parseFloat(event).toFixed(0); // ganti jadi 6 kalo mau pct
                event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
            }
        } else {
            event = '' + event.target.value;
            event = event.trim();
            event = parseFloat(event).toFixed(6);
        }

        if (event === 'NaN') {
            event = 0;
            event = parseFloat(event).toFixed(0);
        }

        if (type === 'amount') {
            $('#budget_apr_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_apr_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetMeiQty(event, i, type) {
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
                event = parseFloat(event).toFixed(0); // ganti jadi 6 kalo mau pct
                event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
            }
        } else {
            event = '' + event.target.value;
            event = event.trim();
            event = parseFloat(event).toFixed(6);
        }

        if (event === 'NaN') {
            event = 0;
            event = parseFloat(event).toFixed(0);
        }

        if (type === 'amount') {
            $('#budget_mei_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_mei_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetJunQty(event, i, type) {
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
                event = parseFloat(event).toFixed(0); // ganti jadi 6 kalo mau pct
                event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
            }
        } else {
            event = '' + event.target.value;
            event = event.trim();
            event = parseFloat(event).toFixed(6);
        }

        if (event === 'NaN') {
            event = 0;
            event = parseFloat(event).toFixed(0);
        }

        if (type === 'amount') {
            $('#budget_jun_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_jun_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetJulQty(event, i, type) {
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
                event = parseFloat(event).toFixed(0); // ganti jadi 6 kalo mau pct
                event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
            }
        } else {
            event = '' + event.target.value;
            event = event.trim();
            event = parseFloat(event).toFixed(6);
        }

        if (event === 'NaN') {
            event = 0;
            event = parseFloat(event).toFixed(0);
        }

        if (type === 'amount') {
            $('#budget_jul_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_jul_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetAgtQty(event, i, type) {
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
                event = parseFloat(event).toFixed(0); // ganti jadi 6 kalo mau pct
                event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
            }
        } else {
            event = '' + event.target.value;
            event = event.trim();
            event = parseFloat(event).toFixed(6);
        }

        if (event === 'NaN') {
            event = 0;
            event = parseFloat(event).toFixed(0);
        }

        if (type === 'amount') {
            $('#budget_agt_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_agt_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetSepQty(event, i, type) {
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
                event = parseFloat(event).toFixed(0); // ganti jadi 6 kalo mau pct
                event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
            }
        } else {
            event = '' + event.target.value;
            event = event.trim();
            event = parseFloat(event).toFixed(6);
        }

        if (event === 'NaN') {
            event = 0;
            event = parseFloat(event).toFixed(0);
        }

        if (type === 'amount') {
            $('#budget_sep_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_sep_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetOktQty(event, i, type) {
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
                event = parseFloat(event).toFixed(0); // ganti jadi 6 kalo mau pct
                event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
            }
        } else {
            event = '' + event.target.value;
            event = event.trim();
            event = parseFloat(event).toFixed(6);
        }

        if (event === 'NaN') {
            event = 0;
            event = parseFloat(event).toFixed(0);
        }

        if (type === 'amount') {
            $('#budget_okt_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_okt_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetNovQty(event, i, type) {
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
                event = parseFloat(event).toFixed(0); // ganti jadi 6 kalo mau pct
                event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
            }
        } else {
            event = '' + event.target.value;
            event = event.trim();
            event = parseFloat(event).toFixed(6);
        }

        if (event === 'NaN') {
            event = 0;
            event = parseFloat(event).toFixed(0);
        }

        if (type === 'amount') {
            $('#budget_nov_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_nov_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }

    onBlurBudgetDesQty(event, i, type) {
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
                event = parseFloat(event).toFixed(0); // ganti jadi 6 kalo mau pct
                event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
            }
        } else {
            event = '' + event.target.value;
            event = event.trim();
            event = parseFloat(event).toFixed(6);
        }

        if (event === 'NaN') {
            event = 0;
            event = parseFloat(event).toFixed(0);
        }

        if (type === 'amount') {
            $('#budget_des_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        } else {
            $('#budget_des_qty' + i)
                .map(function () { return $(this).val(event); }).get();
        }
    }
    //#endregion onBlur

    //#region Delete
    btnDeleteAll() {
        this.checkedList = [];
        for (let i = 0; i < this.listbudgetingqty.length; i++) {
            if (this.listbudgetingqty[i].selected) {
                this.checkedList.push(this.listbudgetingqty[i].id);
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
                                        $('#datatableBudgetingQtyDetail').DataTable().ajax.reload();
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
        for (let i = 0; i < this.listbudgetingqty.length; i++) {
            this.listbudgetingqty[i].selected = this.selectedAll;
        }
    }

    checkIfAllTableSelected() {
        this.selectedAll = this.listbudgetingqty.every(function (item: any) {
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
                                $('#datatableBudgetingQtyDetail').DataTable().ajax.reload();
                            }
                        } else {
                            this.swalPopUpMsg(parse.data);
                        }
                    },
                    error => {
                        this.showSpinner = false;
                        const parse = JSON.parse(error);
                        this.swalPopUpMsg(parse.data);
                    })
        }
        this.showSpinner = true;


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
    //     this.listbudgetingqtydetailData = [];

    //     var i = 0;

    //     var getID = $('[name="p_id_qty"]')
    //         .map(function () { return $(this).val(); }).get();

    //     while (i < getID.length) {

    //         if (getID[i] == this.idDetailForReason) {

    //             this.listbudgetingqtydetailData.push({
    //                 p_id: getID[i],
    //                 p_item_group_code: code,
    //                 p_item_group_name: name
    //             });
    //         }
    //         i++;
    //     }

    //     //#region web service
    //     this.dalservice.Update(this.listbudgetingqtydetailData, this.APIController, this.APIRouteForUpdateItemGroup)
    //         .subscribe(
    //             res => {
    //                 const parse = JSON.parse(res);
    //                 if (parse.result === 1) {
    //                     $('#datatableBudgetingQtyDetail').DataTable().ajax.reload();
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
        this.listbudgetingqtydetailData = [];

        var i = 0;

        var getID = $('[name="p_id_qty"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetJanQty = $('[name="p_budget_jan_qty"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetFebQty = $('[name="p_budget_feb_qty"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetMarQty = $('[name="p_budget_mar_qty"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetAprQty = $('[name="p_budget_apr_qty"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetMeiQty = $('[name="p_budget_mei_qty"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetJunQty = $('[name="p_budget_jun_qty"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetJulQty = $('[name="p_budget_jul_qty"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetAgtQty = $('[name="p_budget_agt_qty"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetSepQty = $('[name="p_budget_sep_qty"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetOktQty = $('[name="p_budget_okt_qty"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetNovQty = $('[name="p_budget_nov_qty"]')
            .map(function () { return $(this).val(); }).get();

        var getBudgetDesQty = $('[name="p_budget_des_qty"]')
            .map(function () { return $(this).val(); }).get();

        while (i < getID.length) {

            while (i < getBudgetJanQty.length) {

                while (i < getBudgetFebQty.length) {

                    while (i < getBudgetMarQty.length) {

                        while (i < getBudgetAprQty.length) {

                            while (i < getBudgetMeiQty.length) {

                                while (i < getBudgetJunQty.length) {

                                    while (i < getBudgetJulQty.length) {

                                        while (i < getBudgetAgtQty.length) {

                                            while (i < getBudgetSepQty.length) {

                                                while (i < getBudgetOktQty.length) {

                                                    while (i < getBudgetNovQty.length) {

                                                        while (i < getBudgetDesQty.length) {
                                                            this.listbudgetingqtydetailData.push(
                                                                this.JSToNumberFloats({
                                                                    p_id: getID[i],
                                                                    p_budgeting_group_code: this.param,
                                                                    p_budget_jan_qty: getBudgetJanQty[i],
                                                                    p_budget_feb_qty: getBudgetFebQty[i],
                                                                    p_budget_mar_qty: getBudgetMarQty[i],
                                                                    p_budget_apr_qty: getBudgetAprQty[i],
                                                                    p_budget_mei_qty: getBudgetMeiQty[i],
                                                                    p_budget_jun_qty: getBudgetJunQty[i],
                                                                    p_budget_jul_qty: getBudgetJulQty[i],
                                                                    p_budget_agt_qty: getBudgetAgtQty[i],
                                                                    p_budget_sep_qty: getBudgetSepQty[i],
                                                                    p_budget_okt_qty: getBudgetOktQty[i],
                                                                    p_budget_nov_qty: getBudgetNovQty[i],
                                                                    p_budget_des_qty: getBudgetDesQty[i]
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
        this.dalservice.Update(this.listbudgetingqtydetailData, this.APIController, this.APIRouteForUpdate)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);

                    if (parse.result === 1) {
                        this.showNotification('bottom', 'right', 'success');
                        $('#datatableBudgetingQtyDetail').DataTable().ajax.reload();
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
    getBudgetItemGroupName(getBudgetItemGroupName: any) {
        throw new Error('Method not implemented.');
    }
    //#endregion button save list

    //#region upload excel reader
    handleFile(event) {
        const binaryString = event.target.result;
        this.base64textString = btoa(binaryString);

        this.tamps.push({
            p_header: 'BUDGETING_GROUP_QUANTITY',
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

        this.templatename = 'BUDGETINGGROUPQUANTITYUPLOAD.XLSX';
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
            this.deleteBudgetingGroupQtyForUpload();
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
                                $('#datatableBudgetingQtyDetail').DataTable().ajax.reload();
                                this.tempFile = undefined;
                            } else {
                                this.showSpinner = false;
                                this.swalPopUpMsg(parse.data);
                                $('#fileControl').val('');
                                $('#datatableBudgetingQtyDetail').DataTable().ajax.reload();
                                this.tempFile = undefined;
                                this.tamps = [];
                            }
                        }, error => {
                            this.showSpinner = false;
                            const parse = JSON.parse(error);
                            this.swalPopUpMsg(parse.data);
                            $('#fileControl').val('');
                            $('#datatableBudgetingQtyDetail').DataTable().ajax.reload();
                            this.tempFile = undefined;
                            this.tamps = [];
                        });
            } else {
                this.showSpinner = false;
                $('#fileControl').val('');
                $('#datatableBudgetingQtyDetail').DataTable().ajax.reload();
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


