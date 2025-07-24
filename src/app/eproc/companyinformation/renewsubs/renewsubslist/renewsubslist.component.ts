import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { DatePipe } from '@angular/common';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './renewsubslist.component.html'
})

export class RenewsubslistComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');

    // variable
    public renewsubsData: any = [];
    public listrenewsubs: any = [];
    public isReadOnly: Boolean = false;
    private dataTamp: any = [];
    public lookupgroup: any = [];
    public lookupMainTask: any = [];
    public lookupSubscriptionType: any = [];
    public setStyle: any = [];
    public idDetailList: string;
    public tempFile: any;
    public tampHidden: Boolean = false;
    private checkedLookup: any = [];
    public selectedAllLookup: any;
    public subscription_valid_till: any;
    private APIController: String = 'SysCompanySubscriptionHistory';
    private APIControllerCompany: String = 'SysCompany'
    private APIRouteForGetRow: String = 'GETROW';
    private APIRouteForGetRows: String = 'GetRows';
    private APIRouteForInsert: String = 'INSERT';
    private APIRouteForUpdate: String = 'UPDATE';
    private APIRouteLookup: String = 'GetRowsForLookup';
    private APIControllerSubscription: String = 'SysSubscriptionType';
    private RoleAccessCode = 'R00010720000000A';

    // checklist
    public selectedAll: any;
    public checkedList: any = [];

    // form 2 way binding
    model: any = {};

    // spinner
    showSpinner: Boolean = true;
    // end

    // datatable
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};
    dataTampPush: any[];

    constructor(private dalservice: DALService,
        public getRouteparam: ActivatedRoute,
        public route: Router,
        private _elementRef: ElementRef, private datePipe: DatePipe
    ) { super(); }

    ngOnInit() {
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        if (this.param != null) {
            this.Delimiter(this._elementRef);
            this.isReadOnly = true;

            // call web service
            this.callGetrow();
            this.loadData();
            this.model.last_fail_count = 0;
        } else {
            this.showSpinner = false;
            this.loadData();
        }

    }

    //#region getrow data
    callGetrow() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_code': this.param,
            'p_company_code': this.company_code
        }]
        // end param tambahan untuk getrow dynamic

        this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    // const parsedata = parse.data[0];
                    const parsedata = this.getrowNgb(parse.data[0]);

                    // checkbox
                    if (parsedata.is_active === '1') {
                        parsedata.is_active = true;
                    } else {
                        parsedata.is_active = false;
                    }
                    // end checkbox

                    if (parsedata.file_name === '' || parsedata.file_name == null) {
                        this.tampHidden = false;
                    } else {
                        this.tampHidden = true;
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
    //#endregion getrow data

    //#region form submit
    onFormSubmit(renewsubsForm: NgForm, isValid: boolean) {
        // validation form submit
        if (!isValid) {
            swal({
                title: 'Warning',
                text: 'Please Fill a Mandatory Field OR Format Is Invalid',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-danger',
                type: 'warning'
            }).catch(swal.noop)
            return;
        } else {
            this.showSpinner = true;
        }

        this.renewsubsData = this.JSToNumberFloats(renewsubsForm);
        const usersJson: any[] = Array.of(this.renewsubsData);
        if (this.param != null) {
            // call web service 
            this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
                .subscribe(
                    res => {
                        this.showSpinner = false;
                        const parse = JSON.parse(res);
                        if (parse.result === 1) {
                            this.showNotification('bottom', 'right', 'success');
                            this.callGetrow()
                        } else {
                            this.swalPopUpMsg(parse.data);
                        }
                    },
                    error => {
                        const parse = JSON.parse(error);
                        this.swalPopUpMsg(parse.data);
                    });
        } else {
            // call web service
            this.dalservice.InsertSys(usersJson, this.APIController, this.APIRouteForInsert)
                .subscribe(
                    res => {
                        this.showSpinner = false;
                        const parse = JSON.parse(res);
                        if (parse.result === 1) {
                            this.showNotification('bottom', 'right', 'success');
                            this.route.navigate(['/companyinformation/subrenewsubscription/renewsubslist']);
                        } else {
                            this.swalPopUpMsg(parse.data);
                        }
                    },
                    error => {
                        const parse = JSON.parse(error);
                        this.swalPopUpMsg(parse.data);
                    });
        }
    }
    //#endregion form submit

    //#region btnLookupSubscriptionType
    btnLookupSubscriptionType() {
        $('#datatableLookupSubscriptionType').DataTable().clear().destroy();
        $('#datatableLookupSubscriptionType').DataTable({
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
                    'p_company_code': this.company_code
                });
                // end param tambahan untuk getrows dynamic
                this.dalservice.GetrowsSys(dtParameters, this.APIController, this.APIRouteLookup).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupSubscriptionType = parse.data;

                    this.model.subscription_valid_till = parse.data[0].subscription_valid_till;

                    if (parse.data != null) {
                        this.lookupSubscriptionType.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    })
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            'lengthMenu': [
                [5, 25, 50, 100],
                [5, 25, 50, 100]
            ],
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;">No Data Available !</p>'
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }

    btnSelectRowSubscriptionType(code: String, description: String, subscription_valid_till: string) {
        this.model.subscription_type_code = code;
        this.model.subscription_type_name = description;
        this.model.subscription_valid_till = subscription_valid_till;
        $('#lookupModalSubscriptionType').modal('hide');
    }
    //#endregion btnLookupSubscriptionType

    //#region checkbox all lookup
    btnSelectAllLookup() {
        this.checkedLookup = [];
        for (let i = 0; i < this.lookupSubscriptionType.length; i++) {
            if (this.lookupSubscriptionType[i].selectedLookup) {
                this.checkedLookup.push({
                    code: this.lookupSubscriptionType[i].code,
                    subscription_type_code: this.lookupSubscriptionType[i].code,
                    subscription_start_date: this.lookupSubscriptionType[i].subscription_start_date,
                    subscription_valid_till: this.lookupSubscriptionType[i].subscription_valid_till,
                    price_amount: this.lookupSubscriptionType[i].price_amount
                });
            }
        }

        // jika tidak di checklist
        if (this.checkedLookup.length <= 0) {
            swal({
              title: this._listdialogconf,
              buttonsStyling: false,
              confirmButtonClass: 'btn btn-danger'
            }).catch(swal.noop)
            return
        } else if (this.checkedLookup.length > 1) {
            swal({
              title: 'Just select one data',
              buttonsStyling: false,
              confirmButtonClass: 'btn btn-danger'
            }).catch(swal.noop)
            return
          } else {

            for (let J = 0; J < this.checkedLookup.length; J++) {
                this.dataTamp = [{
                    'p_company_code': this.company_code,
                    'p_subscription_type_code': this.checkedLookup[J].subscription_type_code,
                    'p_subscription_start_date': this.checkedLookup[J].subscription_start_date,
                    'p_subscription_end_date': this.checkedLookup[J].subscription_valid_till,
                    'p_payment_date': undefined,
                    'p_amount': this.checkedLookup[J].price_amount,
                    'p_file_name': '',
                    'p_paths': '',
                    'p_status': 'UNPAID',
                    'p_remark': ''
                }];
                // end param tambahan untuk getrow dynamic

                this.dalservice.InsertSys(this.dataTamp, this.APIController, this.APIRouteForInsert)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.showNotification('bottom', 'right', 'success');
                                $('#datatableLookupSubscriptionType').DataTable().ajax.reload();
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
    }

    selectAllLookup() {
        for (let i = 0; i < this.lookupSubscriptionType.length; i++) {
            this.lookupSubscriptionType[i].selectedLookup = this.selectedAllLookup;
        }
    }

    checkIfAllLookupSelected() {
        this.selectedAllLookup = this.lookupSubscriptionType.every(function (item: any) {
            return item.selectedLookup === true;
        })
    }
    //#endregion checkbox all table

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
                    'p_company_code': this.company_code
                })
                // end param tambahan untuk getrows dynamic

                this.dalservice.GetrowsSys(dtParameters, this.APIControllerCompany, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    // console.log(parse);
                    // if use checkAll use this
                    $('#checkall').prop('checked', false);
                    // end checkall

                    this.listrenewsubs = parse.data;

                    if (parse.data != null) {
                        this.listrenewsubs.numberIndex = dtParameters.start;
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

}
