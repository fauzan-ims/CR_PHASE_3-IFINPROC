import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';
import { DatePipe } from '@angular/common';
import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './loginlogwizlist.component.html'
})

export class LoginlogwizlistComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');

    // variable
    public listuserloginlog: any = [];
    private rolecode: any = [];
    public from_date: any = [];
    public to_date: any = [];
    public currentDate = new Date();
    private dataRoleTamp: any = [];
    public idDetailList: string;
    public tempFile: any;
    private APIController: String = 'SysCompanyUserLoginLog';
    private APIRouteForGetRows: String = 'GETROWS';
    private APIRouteForGetRole: String = 'ExecSpForGetRole';
    private RoleAccessCode = 'R00021510000000A';

    // checklist
    public selectedAll: any;
    public checkedList: any = [];

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
        } else {
            this.showSpinner = false;
        }
    }
    
    //#region currentDate
    Date() {
        let day: any = this.currentDate.getDate();
        let from_month: any = this.currentDate.getMonth() + 1;
        let to_month: any = this.currentDate.getMonth() + 2;
        let year: any = this.currentDate.getFullYear();

        if (day < 10) {
            day = '0' + day.toString();
        }
        if (from_month < 10) {
            from_month = '0' + from_month.toString();
        }
        if (to_month < 10) {
            to_month = '0' + to_month.toString();
        }

        this.from_date = { 'year': ~~year, 'month': ~~from_month, 'day': ~~day.toString() };
        const obj = {
            dateRange: null,
            isRange: false,
            singleDate: {
                date: this.from_date,
                // epoc: 1600102800,
                formatted: day.toString() + '/' + from_month + '/' + year,
                // jsDate: new Date(dob[key])
            }
        }

        // this.from_date = this.getrowNgb('2020-07-02 12:35:27.303');
        // this.to_date = year + '-' + from_month + '-' + day.toString();
        this.model.from_date = obj
        this.model.to_date = obj

    }
    //#endregion currentDate

    //#region ddl from date
    FromDate(event: any) {
        this.model.from_date = event;
        $('#datatables').DataTable().ajax.reload();
    }
    //#endregion ddl from date

    //#region ddl to date
    ToDate(event: any) {
        this.model.to_date = event;
        $('#datatables').DataTable().ajax.reload();
    }
    //#endregion ddl to date

    //#region load all data
    loadData() {
        this.dtOptions = {
            'pagingType': 'first_last_numbers',
            'pageLength': 10,
            'processing': true,
            'serverSide': true,
            responsive: true,
            lengthChange: false, // hide lengthmenu
            searching: true, // jika ingin hilangin search box nya maka false
            ajax: (dtParameters: any, callback) => {
                //  param tambahan untuk getrows dynamic
                let paramTamps = {};
                paramTamps = {
                    'p_user_code': this.param,
                    'p_from_date': this.model.from_date,
                    'p_to_date': this.model.to_date,
                };
                dtParameters.paramTamp = [];
                dtParameters.paramTamp.push(this.JSToNumberFloats(paramTamps))
                // param tambahan untuk getrows dynamic

                this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp)
                    this.listuserloginlog = parse.data;

                    if (parse.data != null) {
                        this.listuserloginlog.numberIndex = dtParameters.start;
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
            order: [[1, 'asc']],
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        }

    }
    //#endregion filter load all data

    //#region getrole
    // callGetRole(uidParam) {
    //     // param tambahan untuk getrole dynamic
    //     this.dataRoleTamp = [{
    //         'p_uid': uidParam,
    //         'action': 'getResponse'
    //     }];
    //     // param tambahan untuk getrole dynamic

    //     this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForGetRole)
    //         .subscribe(
    //             res => {
    //                 const parse = JSON.parse(res);
    //                 const rolecode = parse.data;

    //                 // get role code from server and push into array
    //                 for (let i = 0; i < rolecode.length; i++) {
    //                     this.rolecode.push(rolecode[i].role_code);
    //                 }

    //                 // hide element when not a role code match with data-role in screen
    //                 const domElement = this._elementRef.nativeElement.querySelectorAll('[data-role]');
    //                 for (let j = 0; j < domElement.length; j++) {
    //                     // tslint:disable-next-line:no-shadowed-variable
    //                     const element = domElement[j].getAttribute('data-role');
    //                     if (this.rolecode.indexOf(element) === -1) {
    //                         this._elementRef.nativeElement.querySelector('[data-role = "' + element + '"]').style.display = 'none';
    //                     }
    //                 }
    //                 // end hide element
    //             },
    //             error => {
    //                 const parse = JSON.parse(error);
    //                 swal({
    //                     title: 'ERROR!!!',
    //                     text: parse.message,
    //                     buttonsStyling: false,
    //                     confirmButtonClass: 'btn btn-danger',
    //                     type: 'error'
    //                 }).catch(swal.noop);
    //             });
    // }
    //#endregion getrole

}
