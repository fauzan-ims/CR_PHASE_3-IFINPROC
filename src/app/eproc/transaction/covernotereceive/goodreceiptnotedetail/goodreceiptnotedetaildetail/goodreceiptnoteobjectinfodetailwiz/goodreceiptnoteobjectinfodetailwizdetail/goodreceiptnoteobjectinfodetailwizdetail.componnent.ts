import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../../base.component';
import { DALService } from '../../../../../../../../DALservice.service';
import { DatePipe } from '@angular/common';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './goodreceiptnoteobjectinfodetailwizdetail.component.html'
})

export class CoverNoteObjectInfoWizDetailComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');
    params = this.getRouteparam.snapshot.paramMap.get('id2');
    paramss = this.getRouteparam.snapshot.paramMap.get('id3');

    // variable
    public SaleBiddingData: any = [];
    public NumberOnlyPattern = this._numberonlyformat;
    public isReadOnly: Boolean = false;
    private dataTamp: any = [];
    public lookupAsset: any = [];
    public isStatus: Boolean = false;
    public setStyle: any = [];
    public listgrnchecklist: any = [];
    public buy_type: any = [];
    public listdataDetail: any = [];

    // API Controller
    private APIController: String = 'GoodReceiptNoteDetailObjectInfo';
    private APIControllerHeader: String = 'GoodReceiptNoteDetail';
    private APIControllerDetail: String = 'GoodReceiptNoteDetailChecklist';
    private APIControllerPO: String = 'PurchaseOrderDetailObjectInfo';

    // API Function
    private APIRouteForGetRow: String = 'GetRow';
    private APIRouteForUpdate: String = 'Update';
    private APIRouteForInsert: String = 'Insert';
    private APIRouteForGetDelete: String = 'Delete';
    private APIRouteForGetRows: String = 'GetRows';
    private RoleAccessCode = 'R00024430000001A';

    // form 2 way binding
    model: any = {};

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
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        this.Delimiter(this._elementRef);

        if (this.paramss != null) {
            this.isReadOnly = true;
            this.wizard();
            this.callGetrow();
            this.loadData();
            setTimeout(() => this.RemoveList(this.model.buy_type), 1000);
            this.callGetrowHeader();
        } else {
            this.showSpinner = false;
            this.model.is_winner = false;
            this.isStatus = false;
            this.model.sale_amount_detail = 0;
            this.model.buy_type = 'By Batch';
            this.model.sale_amount = 0;
            this.callGetrowHeader();
        }
    }

    RemoveList(buy_type) {
        if (buy_type === 'By Batch') {
            $('#ListBiddingDetail').remove();
        } else {
            $('#ListBiddingDetail').show();
        }
    }

    //#region load all data
    loadData() {
        this.dtOptions = {
            'pagingType': 'first_last_numbers',
            'pageLength': 10,
            'processing': true,
            'serverSide': true,
            responsive: true,
            lengthChange: false, // hide lengthmenu
            searching: true, // jika ingin hilangin search box nya maka false
            ajax: (dtParameters: any, callback) => {
                // param tambahan untuk getrows dynamic
                dtParameters.paramTamp = [];
                dtParameters.paramTamp.push({
                    'p_good_receipt_note_detail_object_info_id': this.paramss
                });
                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIControllerDetail, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.listgrnchecklist = parse.data;

                    if (parse.data != null) {
                        this.listgrnchecklist.numberIndex = dtParameters.start;
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
            order: [[1, 'desc']],
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
        }
    }
    //#endregion load all data

    //#region getrow data
    callGetrow() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_id': this.paramss,
        }];
        // end param tambahan untuk getrow dynamics
        this.dalservice.Getrow(this.dataTamp, this.APIControllerPO, this.APIRouteForGetRow)
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

    //#region button back
    btnBack() {
        $('#datatableObjectInfo').DataTable().ajax.reload();
        this.route.navigate(['/transaction/subgoodreceiptnotelist/goodreceiptnotedetaildetail/' + this.param + '/' + this.params + '/goodreceiptnotedetailobjectinfo', this.param, this.params], { skipLocationChange: true });
    }
    //#endregion button back

    //#region header getrow data
    callGetrowHeader() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_id': this.params,
        }]
        // end param tambahan untuk getrow dynamic

        this.dalservice.Getrow(this.dataTamp, this.APIControllerHeader, this.APIRouteForGetRow)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    // const parsedata = parse.data[0];
                    const parsedata = this.getrowNgb(parse.data[0]);

                    if (parsedata.status != 'HOLD') {
                        this.isReadOnly = true;
                    }
                    else {
                        this.isReadOnly = false;
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
    //#endregion BatchDetail getrow data

    //#region button save list
    btnSaveList() {
        this.showSpinner = true
        this.listdataDetail = [];

        var i = 0;

        var getID = $('[name="p_id_checklist"]')
            .map(function () { return $(this).val(); }).get();

        var getStatus = $('[name="p_checklist_status"]')
            .map(function () { return $(this).val(); }).get();

        var getRemark = $('[name="p_checklist_remark"]')
            .map(function () { return $(this).val(); }).get();

        while (i < getID.length) {
            this.listdataDetail.push(
                this.JSToNumberFloats({
                    p_id: getID[i],
                    p_checklist_status: getStatus[i],
                    p_checklist_remark: getRemark[i],
                })
            );
            i++;
        }
        //#region web service
        this.dalservice.Update(this.listdataDetail, this.APIControllerDetail, this.APIRouteForUpdate)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                        this.showNotification('bottom', 'right', 'success');
                        $('#datatableGrnChecklist').DataTable().ajax.reload();
                        this.showSpinner = false
                    } else {
                        this.swalPopUpMsg(parse.data);
                        this.showSpinner = false
                    }
                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);
                    this.showSpinner = false

                });
        //#endregion web service

    }
    //#endregion button save list

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
}

