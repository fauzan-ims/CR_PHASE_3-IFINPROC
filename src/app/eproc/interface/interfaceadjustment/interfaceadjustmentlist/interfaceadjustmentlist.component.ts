import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
    selector: 'app-interfaceadjustmentlist',
    templateUrl: './interfaceadjustmentlist.component.html'
})
export class InterfaceAdjustmentlistComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');

    // variable
    public listinterfaceadjustmentlist: any = [];
    public lookupSource: any = [];
    public lookupBatch: any = [];
    public lookupbranch: any = [];
    public is_active: String;
    public branch_code: String = '';
    public branch_name: String = '';
    public tampStatus: String;
    //controller
    private APIController: String = 'IfinprocInterfaceAdjsutment';
    private APIControllerBranch: String = 'SysBranch';

    //router
    private APIRouteForGetRows: String = 'GetRows';
    private APIRouteLookup: String = 'GetRowsForLookup';
    private RoleAccessCode = 'R00024140000001A';

    // checklist
    public selectedAll: any;
    public checkedList: any = [];

    // spinner
    showSpinner: Boolean = false;
    // end

    // form 2 way binding
    model: any = {};

    // ini buat datatables
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};
    lookupPlafond: any;

    constructor(private dalservice: DALService,
        public getRouteparam: ActivatedRoute,
        public route: Router,
        private _location: Location,
        private _elementRef: ElementRef) { super(); }

    ngOnInit() {
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        this.compoSide(this._location, this._elementRef, this.route);
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
                    'p_branch': this.branch_code,
                });                
                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.listinterfaceadjustmentlist = parse.data;
                    if (parse.data != null) {
                        this.showSpinner = false;
                        this.listinterfaceadjustmentlist.numberIndex = dtParameters.start;
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
            columnDefs: [{ orderable: false, searchable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;">No Data Available !</p>'
            },
            searchDelay: 800 // pake ini supaya gak bug search
        }
    }
    //#endregion load all data

    //#region Branch Lookup
    btnLookupBranch() {
        $('#datatableLookupBranch').DataTable().clear().destroy();
        $('#datatableLookupBranch').DataTable({
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
                    'p_branch_code': this.model.branch_code,
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.GetrowsSys(dtParameters, this.APIControllerBranch, this.APIRouteLookup).subscribe(resp => {
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
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }

    btnSelectRowBranch(code: string, name: string) {

        this.branch_code = code;
        this.branch_name = name;
        $('#lookupModalBranch').modal('hide');
        $('#datatableinterfaceadjustment').DataTable().ajax.reload();
    }

    btnClearBranch() {
        this.branch_code = '';
        this.branch_name = '';
        $('#datatableinterfaceadjustment').DataTable().ajax.reload();
    }
    //#endregion Branch lookup

    //#region ddl master module
    PageStatus(event: any) {
        this.tampStatus = event.target.value;
        $('#datatablelistinterfaceadditionalinvoicerequest').DataTable().ajax.reload();
    }
    //#endregion ddl master module



    selectAllTable() {
        for (let i = 0; i < this.listinterfaceadjustmentlist.length; i++) {
            this.listinterfaceadjustmentlist[i].selected = this.selectedAll;
        }
    }

    checkIfAllTableSelected() {
        this.selectedAll = this.listinterfaceadjustmentlist.every(function (item: any) {
            return item.selected === true;
        })
    }

}
