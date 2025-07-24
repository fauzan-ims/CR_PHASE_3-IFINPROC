import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { Location } from '@angular/common';
import swal from 'sweetalert2';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './purchaseorderlist.component.html'
})

export class PurchaseOrderListComponent extends BaseComponent implements OnInit {
    // variable
    public listPurchaseOrder: any = [];
    public dataTamp: any = [];
    public status: any;
    public branch_code: any;
    private dataTampPush: any = [];
    public lookupbranch: any = [];
    public lookuplocation: any = [];
    public lookupvendor: any = [];
    public tampStatusType: String;

    //controller
    private APIController: String = 'PurchaseOrder';
    private APIControllerBranch: String = 'SysBranch';
    private APIControllerVendor: String = 'MasterVendor';

    //routing
    private APIRouteForDelete: String = 'DELETE';
    private APIRouteForGetRows: String = 'GetRows';
    private APIRouteForLookup: String = 'GetRowsForLookup';
    private APIRouteLookup: String = 'GetRowsForLookup';
    private RoleAccessCode = 'R00021580000000A';

    // form 2 way binding
    model: any = {};

    // ini buat datatables
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};

    // checklist
    public selectedAll: any;
    private checkedList: any = [];

    // spinner
    showSpinner: Boolean = false;
    // end

    constructor(private dalservice: DALService,
        public route: Router,
        private _location: Location,
        private _elementRef: ElementRef) { super(); }

    ngOnInit() {
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        this.compoSide(this._location, this._elementRef, this.route);
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
                    'p_status': this.tampStatusType,
                    'p_branch_code': this.model.branch_code,
                })
                // end param tambahan untuk getrows dynamic

                this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.listPurchaseOrder = parse.data;

                    if (parse.data != null) {
                        this.listPurchaseOrder.numberIndex = dtParameters.start;

                        // if use checkAll use this
                        $('#checkall').prop('checked', false);
                        // end checkall
                    }
                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 10] }], // for disabled coloumn
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
        for (let i = 0; i < this.listPurchaseOrder.length; i++) {
            if (this.listPurchaseOrder[i].selected) {
                this.checkedList.push(this.listPurchaseOrder[i].code);
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
                    const asset = this.checkedList[J];
                    // param tambahan untuk getrow dynamic
                    this.dataTampPush = [{
                        'p_code': asset,
                        'p_company_code': this.company_code
                    }];
                    // end param tambahan untuk getrow dynamic
                    this.dalservice.Delete(this.dataTampPush, this.APIController, this.APIRouteForDelete)
                        .subscribe(
                            res => {
                                this.showSpinner = false;
                                const parse = JSON.parse(res);
                                if (parse.result === 1) {
                                    if (this.checkedList.length == J + 1) {
                                        this.showNotification('bottom', 'right', 'success');
                                        $('#datatable').DataTable().ajax.reload();
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
        for (let i = 0; i < this.listPurchaseOrder.length; i++) {
            this.listPurchaseOrder[i].selected = this.selectedAll;
        }
    }

    checkIfAllTableSelected() {
        this.selectedAll = this.listPurchaseOrder.every(function (item: any) {
            return item.selected === true;
        })
    }
    //#endregion checkbox all table

    //#region button add
    btnAdd() {
        this.route.navigate(['/transaction/suborderlist/purchaseorderlist']);
    }
    //#endregion button add

    //#region button edit
    btnEdit(codeEdit: string) {
        this.route.navigate(['/transaction/suborderlist/purchaseorderlist', codeEdit]);
    }
    //#endregion button edit

    //#region ddl Status
    PageStatusType(event: any) {
        this.tampStatusType = event.target.value;
        $('#datatable').DataTable().ajax.reload();
    }
    //#endregion ddl Status

    //#region Vendor Lookup
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
                    'p_code': ' ',
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
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            order: [['4', 'asc']],
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
        // this.idDetailForReason = id;
    }

    btnSelectRowVendor(code: String, description: String) {
        // this.listdataDetail = [];

        // var i = 0;

        // var getID = $('[name="p_id_doc"]')
        //   .map(function () { return $(this).val(); }).get();

        // while (i < getID.length) {

        //   if (getID[i] == this.idDetailForReason) {

        //     this.listdataDetail.push({
        //       p_id: getID[i],
        //       p_supplier_code: code,
        //     });
        //   }

        //   i++;
        // }
        this.model.supplier_code = code;
        this.model.supplier_name_detail = description;
        $('#lookupModalVendor').modal('hide');
    }
    //#endregion Vendor lookup

}