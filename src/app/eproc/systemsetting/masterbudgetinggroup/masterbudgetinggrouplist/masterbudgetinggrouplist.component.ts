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
    templateUrl: './masterbudgetinggrouplist.component.html'
})

export class MasterbudgetinggroupListComponent extends BaseComponent implements OnInit {
    // variable
    public listmasterbudgetinggroup: any = [];
    public dataTamp: any = [];
    public status: any;
    public branch_code: any;
    public lookupbranch: any = [];
    public branchName: String;
    public branchCodee: String;
    private base64textString: string;
    private tamps = new Array();
    public tempFile: any;
    private dataTampPush: any[];

    //controller
    private APIController: String = 'MasterBudgetingGroup';
    private APIControllerBranch: String = 'SysBranch';

    //routing
    private APIRouteForGetRows: String = 'GetRows';
    private APIRouteForDelete: String = 'DELETE';
    private APIRouteForLookup: String = 'GetRowsForLookup';
    private APIRouteForDownload: String = 'DownloadFile';
    private RoleAccessCode = 'R00021490000000A';

    // form 2 way binding
    model: any = {};

    // ini buat datatables
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};

    // checklist
    public selectedAll: any;

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
        this.status = 'ALL';
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
                    'p_branch': this.branchCodee,
                    'p_status': this.status,
                })
                // end param tambahan untuk getrows dynamic

                this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    // if use checkAll use this
                    $('#checkall').prop('checked', false);
                    // end checkall
                    this.listmasterbudgetinggroup = parse.data;

                    if (parse.data != null) {
                        this.listmasterbudgetinggroup.numberIndex = dtParameters.start;
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
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 9] }], // for disabled coloumn
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
        this.route.navigate(['/systemsetting/submasterbudgetinggrouplist/masterbudgetinggroupdetail']);
    }
    //#endregion button add

    //#region button edit
    btnEdit(codeEdit: string) {
        this.route.navigate(['/systemsetting/submasterbudgetinggrouplist/masterbudgetinggroupdetail', codeEdit]);
    }
    //#endregion button edit

    //#region BranchCode Lookup
    btnLookupBranchCode() {
        $('#datatableLookupBranchCode').DataTable().clear().destroy();
        $('#datatableLookupBranchCode').DataTable({
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
                this.dalservice.GetrowsSys(dtParameters, this.APIControllerBranch, this.APIRouteForLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupbranch = parse.data;

                    if (parse.data != null) {
                        this.lookupbranch.numberIndex = dtParameters.start;
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

    btnSelectRowBranchCode(code: String, name: String) {
        this.branchCodee = code;
        this.branchName = name;
        $('#lookupModalBranchCode').modal('hide');
        $('#datatable').DataTable().ajax.reload();
    }

    btnClearGroup() {
        this.branchCodee = '';
        this.branchName = '';
        $('#datatable').DataTable().ajax.reload();
    }
    //#endregion BranchCode lookup

    //#region ddl Status
    PageStatus(event: any) {
        this.status = event.target.value;
        $('#datatable').DataTable().ajax.reload();
    }
    //#endregion ddl Status    
}


