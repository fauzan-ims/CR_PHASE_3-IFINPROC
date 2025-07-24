import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './quotationvendorwizlist.component.html'
})

export class QuotationVendorWizListComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');
    params = this.getRouteparam.snapshot.paramMap.get('id2');
    // variable
    public quotationReviewDetailList: any = [];
    public tampHiddenStatus: Boolean;
    public isReadonly: Boolean;
    private dataTamp: any = [];
    private dataRoleTamp: any = [];
    private dataTampPush: any = [];
    private dataTampDelete: any = [];

    private APIController: String = 'QuotationReviewVendor';
    private APIControllerHeader: String = 'QuotationReview';
    private APIRouteForGetRows: String = 'GetRows';
    private APIRouteForGetDelete: String = 'Delete';
    private APIRouteForGetRow: String = 'GETROW';
    private APIRouteForGetRole: String = 'ExecSpForGetRole';
    private RoleAccessCode = 'R00021550000000A';

    // checklist
    public selectedAll: any;
    private checkedList: any = [];

    // form 2 way binding
    model: any = {};

    // spinner
    showSpinner: Boolean = false;
    // end

    // ini buat datatables
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};
    is_latest: any;

    constructor(private dalservice: DALService,
        private _location: Location,
        public route: Router,
        public getRouteparam: ActivatedRoute,
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
                    'p_quotation_review_code': this.param,

                });
                // end param tambahan untuk getrows dynamic

                this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp)
                    this.quotationReviewDetailList = parse.data;
                    if (parse.data != null) {
                        this.quotationReviewDetailList.numberIndex = dtParameters.start;
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
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 8] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        }
    }
    //#endregion load all data

    //#region load all data
    // loadData() {
    //   this.dtOptions = {
    //     'pagingType': 'first_last_numbers',
    //     'pageLength': 10,
    //     'processing': true,
    //     'serverSide': true,
    //     responsive: true,
    //     lengthChange: false, // hide lengthmenu
    //     searching: true, // jika ingin hilangin search box nya maka false
    //     ajax: (dtParameters: any, callback) => {
    //       // param tambahan untuk getrows dynamic
    //       dtParameters.paramTamp = [];
    //       dtParameters.paramTamp.push({
    //         'p_quotation_review_code': this.param,
    //       });
    //       // end param tambahan untuk getrows dynamic
    //       this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
    //         const parse = JSON.parse(resp);
    //         this.quotationReviewDetailList = parse.data;

    //         if (parse.data != null) {
    //           this.quotationReviewDetailList.numberIndex = dtParameters.start;
    //           this.showSpinner = false;
    //         }
    //         // if use checkAll use this
    //         $('#checkall').prop('checked', false);
    //         // end checkall

    //         callback({
    //           draw: parse.draw,
    //           recordsTotal: parse.recordsTotal,
    //           recordsFiltered: parse.recordsFiltered,
    //           data: []
    //         });

    //       }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
    //     },
    //     columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 11] }], // for disabled coloumn
    //     language: {
    //       search: '_INPUT_',
    //       searchPlaceholder: 'Search records',
    //       infoEmpty: '<p style="color:red;" > No Data Available !</p> '
    //     },
    //     searchDelay: 800 // pake ini supaya gak bug search
    //   }
    // }
    //#endregion load all data

    //#region button add
    btnAdd() {
        this.route.navigate(['/transaction/subquotationreviewlist/quotationreviewdetail/' + this.param + '/quotationvendorwizdetail', this.param], { skipLocationChange: true });
    }
    //#endregion button add

    //#region button edit
    btnEdit(codeEdit: string) {
        this.route.navigate(['/transaction/subquotationreviewlist/quotationreviewdetail/' + this.param + '/quotationvendorwizdetail', this.param, codeEdit], { skipLocationChange: true });
    }
    //#endregion button edit

    //#region button delete
    btnDeleteAll() {
        this.dataTampDelete = [];
        this.checkedList = [];
        for (let i = 0; i < this.quotationReviewDetailList.length; i++) {
            if (this.quotationReviewDetailList[i].selected) {
                this.checkedList.push(this.quotationReviewDetailList[i].id);
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
                (function loopDeliveryRequestProceed() {
                    if (i < th.checkedList.length) {
                        th.dataTampDelete = [{
                            'p_id': th.checkedList[i],
                            'action': ''
                        }];
                        th.dalservice.ExecSp(th.dataTampDelete, th.APIController, th.APIRouteForGetDelete)
                            .subscribe(
                                res => {
                                    const parse = JSON.parse(res);
                                    if (parse.result === 1) {
                                        if (th.checkedList.length == i + 1) {
                                            th.showNotification('bottom', 'right', 'success');
                                            $('#datatablesquotationreviewvendor').DataTable().ajax.reload();
                                            th.showSpinner = false;
                                        } else {
                                            i++;
                                            loopDeliveryRequestProceed();
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
    //#endregion btn delete

    //#region selectAll
    selectAll() {
        for (let i = 0; i < this.quotationReviewDetailList.length; i++) {
            this.quotationReviewDetailList[i].selected = this.selectedAll;
        }
    }
    //#endregion selectAll

    //#region  checkIfAllTableSelected
    checkIfAllTableSelected() {
        this.selectedAll = this.quotationReviewDetailList.every(function (item: any) {
            return item.selected === true;
        })
    }
    //#endregion checkIfAllTableSelected

    //#region getrow data
    callGetrowHeader() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_code': this.param
        }];
        // end param tambahan untuk getrow dynamic
        this.dalservice.Getrow(this.dataTamp, this.APIControllerHeader, this.APIRouteForGetRow)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    const parsedata = this.getrowNgb(parse.data[0]);

                    if (parsedata.status != 'HOLD') {
                        this.tampHiddenStatus = true;
                    } else {
                        this.tampHiddenStatus = false;
                    }
                    this.showSpinner = false;
                },
                error => {
                    this.showSpinner = false;
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);
                });
    }
    //#endregion getrow data

}
