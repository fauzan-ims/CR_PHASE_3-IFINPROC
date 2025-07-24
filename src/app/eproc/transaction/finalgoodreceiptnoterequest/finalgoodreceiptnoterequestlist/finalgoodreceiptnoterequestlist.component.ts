import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './finalgoodreceiptnoterequestlist.component.html'
})

export class FinalGoodReceiptNoteRequestlistComponent extends BaseComponent implements OnInit {
    // variable
    public listfinalReceiptNote: any = [];
    public tampStatusType: String;
    public lookupbranch: any = [];
    public isReadOnly: Boolean = false;
    public status: string;
    private APIController: String = 'FinalGrnRequest';
    private APIRouteForGetRows: String = 'GetRows';
    private RoleAccessCode = 'R00024460000001A'; // role access 

    private dataTamp: any = [];

    // form 2 way binding
    model: any = {};

    // checklist
    public selectedAllTable: any;
    private checkedList: any = [];

    // spinner
    showSpinner: Boolean = false;
    // end

    // ini buat datatables
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};

    constructor(private dalservice: DALService,
        public route: Router,
        private _location: Location,
        private _elementRef: ElementRef) { super(); }

    ngOnInit() {
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        this.compoSide(this._location, this._elementRef, this.route);
        this.tampStatusType = 'INCOMPLETE';
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
                    // 'p_branch_code': this.model.branch_code,
                })
                // end param tambahan untuk getrows dynamic

                this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    // if use checkAll use this
                    $('#checkall').prop('checked', false);
                    // end checkall
                    this.listfinalReceiptNote = parse.data;

                    if (parse.data != null) {
                        this.listfinalReceiptNote.numberIndex = dtParameters.start;
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

    //#region button edit
    btnEdit(codeEdit: string) {
        this.route.navigate(['/transaction/subfinalgrnrequest/finalgrnrequestdetail', codeEdit]);
    }
    //#endregion button edit

    //#region ddl Status
    PageStatusType(event: any) {
        this.tampStatusType = event.target.value;
        $('#datatablelistfinalreceiptnote').DataTable().ajax.reload();
    }
    //#endregion ddl Status

}
