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
    templateUrl: './purchaseorderwizdetaillist.component.html'
})

export class PurchaseOrderWizDetailListComponent extends BaseComponent implements OnInit {

    param = this.getRouteparam.snapshot.paramMap.get('id');

    // variable
    public listpodetail: any = [];
    public dataTamp: any = [];
    public dataTamps: any = [];
    public model_code: any = [];
    public merk_code: any = [];
    public AssetMaintenanceData: any = [];
    private dataTampPush: any = [];
    public isBreak: Boolean = false;
    public Flag_Process: any = [];

    //controller
    private APIController: String = 'PurchaseOrderDetail';
    private APIControllerMasterModelDetail: String = 'MasterModelDetail';
    private APIControllerHeader: String = 'PurchaseOrder';
    private APIControllerTemp: String = 'AssetMaintenanceTemp';


    //routing
    private APIRouteForGetRows: String = 'GetRows';
    private APIRouteForDelete: String = 'DELETE';
    private APIRouteForGetRow: String = 'GetRow';
    private APIRouteForInsert: String = 'Insert';
    private APIRouteForGetRowGenerate: String = 'GetRowForGenerate';
    private APIRouteForGenerate: String = 'ExecSpForGenerate';
    private APIRouteForGenerateMaster: String = 'ExecSpForGenerateMaster';
    private APIRouterLookupForGroupRoleDetail = 'GetRowsForLookupAssetMaintenance';
    private APIRouteForDeleteAssetMaintenance: String = 'ExecSpForDelete';
    private RoleAccessCode = 'R00021580000000A';

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
                    'p_po_code': this.param
                })
                // end param tambahan untuk getrows dynamic

                this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    // if use checkAll use this
                    $('#checkall').prop('checked', false);
                    // end checkall

                    this.listpodetail = parse.data;

                    if (parse.data != null) {
                        this.listpodetail.numberIndex = dtParameters.start;
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
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 10] }], // for disabled coloumn
            // order: [['2', 'asc']],
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        }
    }
    //#endregion load all data

    //#region getrow data Header
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
                    const parsedata = this.getrowNgb(parse.data[0]);
                    this.Flag_Process = parsedata.flag_process;

                    // mapper dbtoui
                    Object.assign(this.model, parsedata);
                    // end mapper dbtoui
                    this.showSpinner = false;
                },
                error => {
                    console.log('There was an error while Retrieving Data(API) !!!' + error);
                });
    }
    //#endregion getrow data Header

    //#region button add
    btnAdd() {
        this.route.navigate(['/transaction/suborderlist/purchaseorderlist/' + this.param + '/purchaserorderwizdetail', this.param], { skipLocationChange: true });
    }
    //#endregion button add

    //#region button edit
    btnEdit(codeEdit: string) {
        this.route.navigate(['/transaction/suborderlist/purchaseorderlist/' + this.param + '/purchaserorderwizdetail', this.param, codeEdit], { skipLocationChange: true });
    }
    //#endregion button edit

    //#region button delete
    btnDeleteAll() {
        this.checkedList = [];
        // for (let i = 0; i < this.listpodetail.length; i++) {
        //     if (this.listpodetail[i].selected) {
        //         this.checkedList.push(this.listpodetail[i].id);
        //     }
        // }

        for (let i = 0; i < this.listpodetail.length; i++) {
            if (this.listpodetail[i].selected) {
                this.checkedList.push({
                    'Id': this.listpodetail[i].id,
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
            // if (result.value) {
            //     this.dataTampPush = [];

            //     for (let J = 0; J < this.checkedList.length; J++) {
            //         // param tambahan untuk getrow dynamic
            //         this.dataTampPush = [{
            //             'p_id': this.checkedList[J],
            //             'p_po_code': this.param
            //         }];
            //         // end param tambahan untuk getrow dynamic
            //         this.dalservice.Delete(this.dataTampPush, this.APIController, this.APIRouteForDelete)
            //             .subscribe(
            //                 res => {
            //                     this.showSpinner = false;
            //                     const parse = JSON.parse(res);
            //                     if (parse.result === 1) {
            //                         if (this.checkedList.length == J + 1) {
            //                             this.showNotification('bottom', 'right', 'success');
            //                             $('#datatablepo').DataTable().ajax.reload();
            //                             $('#btnPurchaseOrderDetail').click()
            //                         }
            //                     } else {
            //                         this.showSpinner = false;
            //                         this.swalPopUpMsg(parse.data)
            //                     }
            //                 },
            //                 error => {
            //                     this.showSpinner = false;
            //                     const parse = JSON.parse(error);
            //                     this.swalPopUpMsg(parse.data);
            //                 });
            //     }
            // } else {
            //     this.showSpinner = false;
            // }
            setTimeout(() => {
                if (result.value) {

                    let th = this;
                    var i = 0;
                    (function looppurchaseorder() {
                        if (i < th.checkedList.length) {
                            th.dataTampPush = [{
                                'p_id': th.checkedList[i].Id,
                                'p_po_code': th.param,
                                'action': ''
                            }];
                            //Proceed data dan insert into quotation / supplier selection
                            th.dalservice.ExecSp(th.dataTampPush, th.APIController, th.APIRouteForDelete)
                                .subscribe(
                                    res => {
                                        th.showSpinner = false;
                                        const parse = JSON.parse(res);
                                        if (parse.result === 1) {
                                            if (th.checkedList.length == i + 1) {
                                                th.showNotification('bottom', 'right', 'success');
                                                $('#datatablepo').DataTable().ajax.reload();
                                                $('#btnPurchaseOrderDetail').click()
                                            } else {
                                                i++;
                                                looppurchaseorder();
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
            }, 500);
        });
    }
    //#region selectAll
    selectAll() {
        for (let i = 0; i < this.listpodetail.length; i++) {
            this.listpodetail[i].selected = this.selectedAll;
        }
    }
    //#endregion selectAll

    //#region  checkIfAllTableSelected
    checkIfAllTableSelected() {
        this.selectedAll = this.listpodetail.every(function (item: any) {
            return item.selected === true;
        })
    }
    //#endregion checkIfAllTableSelected


    //#endregion button delete
}


