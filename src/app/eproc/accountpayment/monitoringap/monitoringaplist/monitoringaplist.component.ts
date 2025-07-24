import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { Location } from '@angular/common';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './monitoringaplist.component.html'
})

export class MonitoringAplistComponent extends BaseComponent implements OnInit {
    // variable
    public listmonitoringap: any = [];
    public isReadOnly: Boolean = false;
    public lookupbranch: any = [];
    public tampStatusType: String;
    public status: string;
    private dataTampProceed: any = [];
    datePipe: DatePipe = new DatePipe('en-US');
    private APIController: String = 'GoodReceiptNote';
    private APIRouteForGetRows: String = 'GetRowsForMonitoringAp';
    private APIRouteForProceed: String = 'ExecSpForMonitoringProceed';

    private RoleAccessCode = 'R00024450000001A'; // role access 

    private dataTamp: any = [];

    // form 2 way binding
    model: any = {};

    // checklist
    private checkedList: any = [];
    public selectedAll: any;

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
        public datepipe: DatePipe,
        private _elementRef: ElementRef) { super(); }

    ngOnInit() {
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        this.compoSide(this._location, this._elementRef, this.route);
        this.tampStatusType = 'PENDING';
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
                    'p_status': this.tampStatusType,
                });
                // end param tambahan untuk getrows dynamic


                this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp)

                    this.listmonitoringap = parse.data;

                    if (parse.data != null) {
                        this.listmonitoringap.numberIndex = dtParameters.start;
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

    //#region button add
    btnAdd() {
        this.route.navigate(['/accountpayable/subinvoiceregisterlist/invoiceregisterdetail']);
    }
    //#endregion button add

    //#region button edit
    btnEdit(codeEdit: string) {
        this.route.navigate(['/accountpayable/subinvoiceregisterlist/invoiceregisterdetail', codeEdit]);
    }
    //#endregion button edit

    //#region btn proceed
    btnProceed() {
        this.dataTampProceed = [];
        this.checkedList = [];
        var FlagDate = new Date();
        let latest_date = this.datepipe.transform(FlagDate, 'yyyy-MM-dd HH:mm:ss');
        for (let i = 0; i < this.listmonitoringap.length; i++) {
            if (this.listmonitoringap[i].selected) {
                this.checkedList.push({
                    'Code': this.listmonitoringap[i].code,
                    'SupplierCode': this.listmonitoringap[i].supplier_code,
                    'GrnDetailID': this.listmonitoringap[i].grn_id,
                    'ObjectID': this.listmonitoringap[i].po_object_id
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
        this.dataTamp = [];
        swal({
            title: 'Are you sure?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: 'Yes',
            buttonsStyling: false
        }).then((result) => {
            this.showSpinner = true;
            if (result.value) {

                let th = this;
                var i = 0;
                (function loopPoProceesProceed() {
                    if (i < th.checkedList.length) {
                        th.dataTampProceed = [{
                            'p_code': th.checkedList[i].Code,
                            'p_supplier_code': th.checkedList[i].SupplierCode,
                            'p_date_flag': latest_date,
                            'p_grn_detail_id': th.checkedList[i].GrnDetailID,
                            'p_po_object_info_id': th.checkedList[i].ObjectID,
                            'action': '',
                        }];
                        th.dalservice.ExecSp(th.dataTampProceed, th.APIController, th.APIRouteForProceed)
                            .subscribe(
                                res => {
                                    const parse = JSON.parse(res);
                                    if (parse.result === 1) {
                                        if (th.checkedList.length == i + 1) {
                                            th.showNotification('bottom', 'right', 'success');
                                            $('#datatableMonitoringAp').DataTable().ajax.reload();
                                            th.showSpinner = false;
                                        } else {
                                            i++;
                                            loopPoProceesProceed();
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
        });
    }
    //#endregion btn proceed


    selectedAllTable() {
        for (let i = 0; i < this.listmonitoringap.length; i++) {
            this.listmonitoringap[i].selected = this.selectedAll;
        }
    }

    checkIfAllTableSelected() {
        this.selectedAll = this.listmonitoringap.every(function (item: any) {
            return item.selected === true;
        })
    }
    //#endregion checkbox all table

    //#region ddl Status
    PageStatusType(event: any) {
        this.tampStatusType = event.target.value;
        $('#datatableMonitoringAp').DataTable().ajax.reload();
    }
    //#endregion ddl Status

}
