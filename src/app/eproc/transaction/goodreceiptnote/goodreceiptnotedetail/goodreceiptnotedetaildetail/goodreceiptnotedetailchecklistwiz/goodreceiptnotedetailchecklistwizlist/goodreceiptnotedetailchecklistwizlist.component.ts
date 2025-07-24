import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../../base.component';
import { DALService } from '../../../../../../../../DALservice.service';
import { Location } from '@angular/common';
import swal from 'sweetalert2';
import { NgForm } from '@angular/forms';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './goodreceiptnotedetailchecklistwizlist.component.html'
})

export class GoodReceiptNotechecklistwizlistComponent extends BaseComponent implements OnInit {

    param = this.getRouteparam.snapshot.paramMap.get('id');
    params = this.getRouteparam.snapshot.paramMap.get('id2');

    // variable
    public listgrnchecklist: any = [];
    public dataTamp: any = [];
    public listdataDetail: any = [];
    public AssetMaintenanceData: any = [];
    public lookupAsset: any = [];
    public lookupDisposalAsset: any = [];
    public listlegalprocessdetailData: any = [];
    private idDetailMutation: any;
    public lookupCostCenter: any = [];
    public tempFile: any;
    public isReadOnly: any;

    //controller
    private APIController: String = 'GoodReceiptNoteDetailChecklist';
    private APIControllerHeader: String = 'GoodReceiptNoteDetail';
    private APIControllerAsset: String = 'Asset';
    private APIControllerCostCenter: String = 'CostCenter';

    //routing
    private APIRouteForUpdateCostCenter: String = 'UpdateCostCenter';
    private APIRouteForGetRows: String = 'GetRows';
    private APIRouteLookup: String = 'GetRowsForLookup';
    private APIRouteForGetDelete: String = 'Delete';
    private APIRouteForInsert: String = 'Insert';
    private APIRouteForUpdate: String = 'Update';
    private APIRouteForGetRow: String = 'GetRow';
    private APIRouteLookupForDisposal: String = 'GetRowsForLookupDisposal';


    private RoleAccessCode = 'R00021590000000A';

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
                    'p_good_receipt_note_detail_id': this.params,
                })
                // end param tambahan untuk getrows dynamic

                this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    // if use checkAll use this
                    $('#checkall').prop('checked', false);
                    // end checkall

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
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        }
    }
    //#endregion load all data

    //#region Delete
    btnDeleteAll() {
        this.checkedList = [];
        for (let i = 0; i < this.listgrnchecklist.length; i++) {
            if (this.listgrnchecklist[i].selected) {
                this.checkedList.push(this.listgrnchecklist[i].id);
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
                    const code = this.checkedList[J];
                    // param tambahan untuk getrow dynamic
                    this.dataTamp = [{
                        'p_id': code
                    }];
                    // end param tambahan untuk getrow dynamic

                    this.dalservice.Delete(this.dataTamp, this.APIController, this.APIRouteForGetDelete)
                        .subscribe(
                            res => {
                                this.showSpinner = false;
                                const parse = JSON.parse(res);
                                if (parse.result === 1) {
                                    this.callGetrowHeader();
                                    this.showNotification('bottom', 'right', 'success');
                                    $('#datatableDisposalDetail').DataTable().ajax.reload();
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
        for (let i = 0; i < this.listgrnchecklist.length; i++) {
            this.listgrnchecklist[i].selected = this.selectedAll;
        }
    }

    checkIfAllTableSelected() {
        this.selectedAll = this.listgrnchecklist.every(function (item: any) {
            return item.selected === true;
        })
    }
    //#endregion Delete

    //#region Header getrow data
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
                    const parsedata = this.getrowNgb(parse.data[0]);
                    
                    if(parsedata.status != 'HOLD')
                    {
                        this.isReadOnly = true;
                    }
                    else
                    {
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

    //#region button reload
    btnReloadOutstanding() {
        this.callGetrowHeader();
        $('#datatableDisposalAsset').DataTable().ajax.reload();
    }
    //#endregion button reload

    //#region checkbox all lookup
    btnSelectAllLookup() {
        this.checkedLookup = [];
        for (let i = 0; i < this.lookupDisposalAsset.length; i++) {
            if (this.lookupDisposalAsset[i].selectedLookup) {
                // this.checkedLookup.push(this.lookupDisposalAsset[i].code);
                this.checkedLookup.push({
                    assetCode: this.lookupDisposalAsset[i].code,
                    netbookvalue: this.lookupDisposalAsset[i].net_book_value_comm
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
            // const codeData = this.checkedLookup[J];
            this.dataTamp = [{
                'p_disposal_code': this.param,
                'p_asset_code': this.checkedLookup[J].assetCode,
                'p_net_book_value': this.checkedLookup[J].netbookvalue
            }];

            // end param tambahan untuk getrow dynamic
            this.dalservice.Insert(this.dataTamp, this.APIController, this.APIRouteForInsert)
                .subscribe(
                    res => {
                        this.showSpinner = false;
                        const parse = JSON.parse(res);
                        if (parse.result === 1) {
                            if (this.checkedLookup.length == J + 1) {
                                this.callGetrowHeader();
                                this.showNotification('bottom', 'right', 'success');
                                $('#datatableDisposalAsset').DataTable().ajax.reload();
                                $('#datatableDisposalDetail').DataTable().ajax.reload();
                            }
                            // })
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
        for (let i = 0; i < this.lookupDisposalAsset.length; i++) {
            this.lookupDisposalAsset[i].selectedLookup = this.selectedAllLookup;
        }
    }

    checkIfAllLookupSelected() {
        this.selectedAllLookup = this.lookupDisposalAsset.every(function (item: any) {
            return item.selectedLookup === true;
        })
    }
    //#endregion checkbox all table

    //#region Cost Center Lookup
    btnLookupCostCenter(id: any) {
        $('#datatableLookupCostCenter').DataTable().clear().destroy();
        $('#datatableLookupCostCenter').DataTable({
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
                this.dalservice.GetrowsBam(dtParameters, this.APIControllerCostCenter, this.APIRouteLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupCostCenter = parse.data;
                    if (parse.data != null) {
                        this.lookupCostCenter.numberIndex = dtParameters.start;
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
        this.idDetailMutation = id;
    }

    btnSelectRowCostCenter(cost_center_code: String, cost_center_name: String) {
        this.listdataDetail = [];
        var i = 0;

        var getID = $('[name="p_id"]')
            .map(function () { return $(this).val(); }).get();

        while (i < getID.length) {

            if (getID[i] == this.idDetailMutation) {

                this.listdataDetail.push({
                    p_id: getID[i],
                    p_mutation_code: this.param,
                    p_cost_center_code: cost_center_code,
                    p_cost_center_name: cost_center_name
                });
            }
            i++;
        }

        //#region web service
        this.dalservice.Update(this.listdataDetail, this.APIController, this.APIRouteForUpdateCostCenter)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                        $('#datatableDisposalDetail').DataTable().ajax.reload();
                    } else {
                        this.swalPopUpMsg(parse.data);
                    }
                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);
                });
        //#endregion web service
        $('#lookupModalCostCenter').modal('hide');
    }
    //#endregion Cost Center Lookup

    //#region lookup Asset
    btnLookupDisposalAsset() {
        $('#datatableDisposalAsset').DataTable().clear().destroy();
        $('#datatableDisposalAsset').DataTable({
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
                    'p_branch_code': this.model.branch_code,
                    'p_location_code': this.model.location_code,
                });
                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIControllerAsset, this.APIRouteLookupForDisposal).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    this.lookupDisposalAsset = parse.data;
                    if (parse.data != null) {
                        this.lookupDisposalAsset.numberIndex = dtParameters.start;
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

    //#region lookup close
    btnLookupClose() {
        this.loadData();
    }
    //#endregion lookup close

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
        this.dalservice.Update(this.listdataDetail, this.APIController, this.APIRouteForUpdate)
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
}


