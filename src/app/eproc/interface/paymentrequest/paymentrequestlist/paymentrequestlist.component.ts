import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
  selector: 'app-paymentrequestlist',
  templateUrl: './paymentrequestlist.component.html'
})

export class InterfacePaymentRequestlistComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = false;
  // end

  // variable
  public listPaymentRequest: any = [];
  public lookupbranch: any = [];
  private dataRoleTamp: any = [];
  public payment_status: String;
  public job_status: String;
  private RoleAccessCode = 'R00022560000010A';

  // API Controller
  private APIController: String = 'IfinprocInterfacePaymentRequest';
  private APIControllerSysBranch: String = 'SysBranch';

  // API Function
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForPost: String = 'ExecSpForGetPost';

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _location: Location,
    private _elementRef: ElementRef
  ) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);

    this.job_status = 'ALL';
    this.payment_status = 'HOLD';
    this.loadData();
    this.compoSide(this._location, this._elementRef, this.route);
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

        // param tambahan untuk getrole dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp = [{
          'p_status': 'ALL',
          'p_branch_code': this.model.branch_code,
          'p_payment_status': this.payment_status,
          'p_job_status': this.job_status
        }];
        // param tambahan untuk getrole dynamic

        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.listPaymentRequest = parse.data;
          if (parse.data != null) {
            this.listPaymentRequest.numberIndex = dtParameters.start;
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

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/interface/subpaymentrequestlist/paymentrequestdetail', codeEdit]);
  }
  //#endregion button edit

  //#region button Post
  btnPost(codeData: string) {
    // param tambahan untuk button Post dynamic
    this.dataRoleTamp = [{
      'p_code': codeData,
      'action': ''
    }];
    // param tambahan untuk button Post dynamic

    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: this._deleteconf,

      buttonsStyling: false
    }).then((result) => {
      this.showSpinner = true;
      if (result.value) {
        // call web service
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForPost)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showNotification('bottom', 'right', 'success');
              } else {
                this.swalPopUpMsg(parse.data);
              }
            },
            error => {
              this.showSpinner = false;
              const parse = JSON.parse(error);
              this.swalPopUpMsg(parse.data);
            });
      } else {
        this.showSpinner = false;
      }
    });
  }
  //#endregion button Post

  //#region ddl Status
  PageStatus(event: any) {
    this.payment_status = event.target.value;
    $('#datatablePaymentRequestList').DataTable().ajax.reload();
  }
  //#endregion ddl Status

  //#region job Status
  PageJobStatus(event: any) {
    this.job_status = event.target.value;
    $('#datatablePaymentRequestList').DataTable().ajax.reload();
  }
  //#endregion job Status

  //#region Lookup Branch
  btnLookupbranch() {
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
          'default': ''
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysBranch, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupbranch = parse.data;
          this.lookupbranch.numberIndex = dtParameters.start;
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [1, 4] }],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowLookupBranch(branch_code: String, branch_name: String) {
    this.model.branch_code = branch_code;
    this.model.branch_name = branch_name;
    $('#lookupModalBranch').modal('hide');
    $('#datatablePaymentRequestList').DataTable().ajax.reload();
  }

  btnClearBranch() {
    this.model.branch_code = '';
    this.model.branch_name = '';
    $('#datatablePaymentRequestList').DataTable().ajax.reload();
  }
  //#endregion Lookup Branch
}
