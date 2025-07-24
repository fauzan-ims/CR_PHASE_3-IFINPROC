import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import swal from 'sweetalert2';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './interfaceapprovaldetail.component.html'
})

export class InterfaceapprovaldetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public listApprovalDetail: any = [];
  private dataTamp: any = [];

  private APIController: String = 'ProcInterfaceApprovalRequest';
  private APIControllerApprovalRequestDimension: String = 'ProcInterfaceApprovalDimension';

  private APIRouteForProceed: String = 'ExecSpForProceed';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForGetRows: String = 'GetRows';

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
  // end

  // datatable
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
  ) { super(); }

  ngOnInit() {
    // call web service
    this.callGetrow();
    this.loadData();
  }

  //#region  getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param,
    }];
    // end param tambahan untuk getrow dynamic

    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
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
  //#endregion  getrow data

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
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_request_code': this.param
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerApprovalRequestDimension, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.listApprovalDetail = parse.data;

          if (parse.data != null) {
            this.listApprovalDetail.numberIndex = dtParameters.start;
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
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region button back
  btnBack() {
    this.route.navigate(['/interface/subinterfaceapprovallist']);
    $('#datatableInterfaceApproval').DataTable().ajax.reload();
  }
  //#endregion  button back

  //#region btnProceed
  btnProceed(code: any) {
    // param tambahan untuk getrole dynamic
    this.dataTamp = [{
      'p_code': code,
      'action': 'default'
    }];
    // param tambahan untuk getrole dynamic
    swal({
      allowOutsideClick: false,
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
        this.dalservice.ExecSp(this.dataTamp, this.APIController, this.APIRouteForProceed)
          .subscribe(
            res => {
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showSpinner = false;
                this.showNotification('bottom', 'right', 'success');
                this.callGetrow();
              } else {
                this.showSpinner = false;
                this.swalPopUpMsg(parse.data);
              }
            },
            error => {
              this.showSpinner = false;
              const parse = JSON.parse(error);
              this.swalPopUpMsg(parse.data)
            });
      } else {
        this.showSpinner = false;
      }
    });
  }
  //#endregion btnProceed
}


