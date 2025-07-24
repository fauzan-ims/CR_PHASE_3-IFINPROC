import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';
import { DatePipe } from '@angular/common';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './grouprolewizlist.component.html'
})

export class GrouprolewizlistComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');

    // variable
    public listgrouprole: any = [];
    private dataTamp: any = [];
    public isDefault: Boolean = false;
    public idDetailList: string;
    public tempFile: any;
    public lookupAddGroupRole: any = [];
    private APIController: String = 'SysCompanyUserMainGroupSec';
    private APIControllerGroupRole: String = 'MasterTaskUserDetail';
    private APIControllerCompanyUser: String = 'SysCompanyUserMain';
    private APIRouteForGetRows: String = 'GETROWS';
    private APIRouteForGetRow: String = 'GETROW';
    private APIRouteLookup: String = 'GetRowsForLookup';
    private APIRouteForInsert: String = 'INSERT';
    private APIRouteForDelete: String = 'DELETE';
    private RoleAccessCode = 'R00021510000000A';

    // checklist
    public selectedAllTable: any;
    public selectedAllLookup: any;
    private checkedList: any = [];
    private checkedLookup: any = [];

    // form 2 way binding
    model: any = {};

    // spinner
    showSpinner: Boolean = false;
    // end

    // datatable
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};
    dataTampPush: any[];

    constructor(private dalservice: DALService,
        public getRouteparam: ActivatedRoute,
        public route: Router,
        private _elementRef: ElementRef,
        private datePipe: DatePipe
    ) { super(); }

    ngOnInit() {
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        if (this.param != null) {
            this.Delimiter(this._elementRef);

            // call web service
            this.loadData();
            this.callGetrowHeader();
        } else {
            this.showSpinner = false;
            this.model.user_code = this.param;
        }
    }

    //#region callGetrowHeader
    callGetrowHeader() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_code': this.param,
            'p_company_code': this.company_code
        }]
        // end param tambahan untuk getrow dynamic

        this.dalservice.Getrow(this.dataTamp, this.APIControllerCompanyUser, this.APIRouteForGetRow)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    // const parsedata = parse.data[0];
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
    //#endregion callGetrowHeader

    //#region load all data
    loadData() {
        this.dtOptions = {
            pagingType: 'full_numbers',
            responsive: true,
            serverSide: true,
            processing: true,
            paging: true,
            'lengthMenu': [
                [40, 25, 50, 100],
                [40, 25, 50, 100]
            ],
            ajax: (dtParameters: any, callback) => {
                // param tambahan untuk getrow dynamic
                dtParameters.paramTamp = [];
                dtParameters.paramTamp.push({
                    'p_user_code': this.param
                });
                // end param tambahan untuk getrow dynamic

                this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp)

                    // if use checkAll use this
                    $('#checkall').prop('checked', false);
                    // end checkall
                    this.listgrouprole = parse.data;
                    if (parse.data != null) {
                        this.listgrouprole.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
            //   order: [[1, 'asc']],
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        }
    }
    //#endregion load all data

    //#region lookup Group
    btnLookupAddGroupRole() {
        $('#datatableLookupAddGroupRole').DataTable().clear().destroy();
        $('#datatableLookupAddGroupRole').DataTable({
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
                    'p_main_task_user_code': this.model.main_task_code, //$('#taskuserCode', parent.document).val()
                    'p_user_code': this.param,
                    'p_company_code': this.company_code
                });


                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIControllerGroupRole, this.APIRouteLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupAddGroupRole = parse.data;

                    if (parse.data != null) {
                        this.lookupAddGroupRole.numberIndex = dtParameters.start;
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
    //#endregion lookup Group

    //#region checkbox all table
    btnDeleteAll() {
        this.checkedList = [];
        for (let i = 0; i < this.listgrouprole.length; i++) {
            if (this.listgrouprole[i].selected) {
                this.checkedList.push(this.listgrouprole[i].role_group_code);
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
                    const codeData = this.checkedList[J];
                    // param tambahan untuk getrow dynamic
                    this.dataTampPush = [{
                        'p_user_code': this.param,
                        'p_role_group_code': codeData
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
                                        $('#datatables').DataTable().ajax.reload();
                                    }
                                } else {
                                    this.swalPopUpMsg(parse.data)
                                }
                            },
                            error => {
                                const parse = JSON.parse(error);
                                this.showSpinner = false;
                                this.swalPopUpMsg(parse.data)
                            });
                }
            } else {
                this.showSpinner = false;
            }
        });
    }

    selectAllTable() {
        for (let i = 0; i < this.listgrouprole.length; i++) {
            this.listgrouprole[i].selected = this.selectedAllTable;
        }
    }

    checkIfAllTableSelected() {
        this.selectedAllTable = this.listgrouprole.every(function (item: any) {
            return item.selected === true;
        })
    }
    //#endregion checkbox all table

    //#region checkbox all lookup
    btnSelectAllLookup() {
        this.checkedLookup = [];
        for (let i = 0; i < this.lookupAddGroupRole.length; i++) {
            if (this.lookupAddGroupRole[i].selectedLookup) {
                this.checkedLookup.push(this.lookupAddGroupRole[i].role_group_code);
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
            this.dataTamp = [{
                'p_user_code': this.param,
                'p_role_group_code': this.checkedLookup[J]
            }];
            // end param tambahan untuk getrow dynamic

            this.dalservice.Insert(this.dataTamp, this.APIController, this.APIRouteForInsert)
                .subscribe(
                    res => {
                        this.showSpinner = false;
                        const parse = JSON.parse(res);
                        if (parse.result === 1) {
                            this.showNotification('bottom', 'right', 'success');
                            $('#datatablelookupAddGroupRole').DataTable().ajax.reload();
                            $('#datatables').DataTable().ajax.reload();
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
        for (let i = 0; i < this.lookupAddGroupRole.length; i++) {
            this.lookupAddGroupRole[i].selectedLookup = this.selectedAllLookup;
        }
    }

    checkIfAllLookupSelected() {
        this.selectedAllLookup = this.lookupAddGroupRole.every(function (item: any) {
            return item.selectedLookup === true;
        })
    }
    //#endregion checkbox all table

}
