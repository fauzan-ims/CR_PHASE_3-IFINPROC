import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
    selector: 'app-expenseassetlist',
    templateUrl: './expenseassetlist.component.html'
})
export class InterfaceExpenseAssetListlistComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');

    // variable
    public listinterfaceexpenseasset: any = [];
    public lookupSource: any = [];
    public lookupBatch: any = [];
    public lookupbranch: any = [];
    public is_active: String;
    public branch_code: String = '';
    public branch_name: String = '';
    public tampStatus: String;
    //controller
    private APIController: String = 'IfinprocInterfaceAssetExpenseLedger';

    //router
    private APIRouteForGetRows: String = 'GetRows';
    private RoleAccessCode = 'R00024110000001A';

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
        this.tampStatus = 'HOLD';
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
                });

                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.listinterfaceexpenseasset = parse.data;
                    if (parse.data != null) {
                        this.showSpinner = false;
                        this.listinterfaceexpenseasset.numberIndex = dtParameters.start;
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

}
