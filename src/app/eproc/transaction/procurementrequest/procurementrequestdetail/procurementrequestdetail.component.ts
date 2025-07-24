import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-root',
  templateUrl: './procurementrequestdetail.component.html'
})
export class ProcurementrequestdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern: String = this._numberonlyformat;
  public procurementrequestData: any = [];
  public listdimension: any = [];
  public isReadOnly: Boolean = false;
  public isReadOnly2: Boolean = false;
  public lookupapproval: any = [];
  public approval_category_name: String;
  public isStatus: Boolean;
  public tampdHidden: Boolean;
  public tampdHiddenProcurementType: Boolean;
  public isReadonly: Boolean;
  public lookupSysDimension: any = [];
  public code: String;
  public lookupdivisioncode: any = [];
  public lookupsubdepartmentcode: any = [];
  public lookupdepartmentcode: any = [];
  public lookupunitcode: any = [];
  public lookupbranchcode: any = [];
  public lookuprequestorcode: any = [];
  private dataTamp: any = [];
  private dataRoleTamp: any = [];
  private setStyle: any = [];
  public lookupcity: any = [];
  public lookupfromcity: any = [];
  public lookupprovince: any = [];
  public lookupfromprovince: any = [];
  private APIController: String = 'ProcurementRequest';
  private APIControllerSysDivisionCode: String = 'SysDivision';
  private APIControllerSysDepartmentCode: String = 'SysDepartment';
  private APIControllerSubDepartmentCode: String = 'MasterSubDepartment';
  private APIControllerUnitCode: String = 'MasterUnit';
  private APIControllerBranch: String = 'SysBranch';
  private APIControllerRequestor: String = 'SysEmployeeMain';
  private APIControllerSysProvince: String = 'SysProvince';
  private APIControllerSysCity: String = 'SysCity';
  private APIControllerApprovalSchedule: String = 'ApprovalSchedule';

  private APIRouteForUpdateSatus: String = 'ExecSpForUpdateStatus';
  private APIRouteForReturnProceed: String = 'ExecSpForProceed';
  private APIRouteForReturnCancel: String = 'ExecSpForCancel';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteLookup: String = 'GetRowsForLookup';
  private APIRouteLookupSysCity: String = 'GetRowsLookupByProvinceCode';

  private RoleAccessCode = 'R00021520000000A'; // role access 

  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAll: any;
  private checkedList: any = [];

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
    private _elementRef: ElementRef,
    private parserFormatter: NgbDateParserFormatter
  ) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.wizard();
    if (this.param != null) {
      this.isReadOnly = true;
      // call web service
      this.callGetrow();
      this.requestitemwiz();
    } else {
      this.tampdHiddenProcurementType = false;
      this.tampdHidden = false;
      this.isReadOnly = false;
      this.isReadOnly2 = false;
      this.model.requirement_type = 'NON URGENT';
      this.model.status = 'HOLD';
      this.model.company_code = this.company_code;
      this.model.procurement_type = 'PURCHASE';
      this.showSpinner = false;
      this.model.count_item = 0;
    }
  }

  //#region getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param,
      'p_company_code': this.company_code
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);

          if (parsedata.status != 'HOLD') {
            this.tampdHidden = true;
          } else {
            this.tampdHidden = false;
          }

          if (this.param != null) {
            this.isReadOnly = true;
            this.isReadOnly2 = true;
          } else {
            this.isReadOnly = true;
            this.isReadOnly2 = false;
          }

          // checkbox
          if (parsedata.is_reimburse === '1') {
            parsedata.is_reimburse = true;
          } else {
            parsedata.is_reimburse = false;
          }
          // end checkbox

          // mapper dbtoui
          Object.assign(this.model, parsedata);
          // end mapper dbtoui

          this.showSpinner = false;
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion getrow data

  //#region form submit
  onFormSubmit(procurementrequestForm: NgForm, isValid: boolean) {
    // validation form submit
    if (!isValid) {
      swal({
        title: 'Warning',
        text: 'Please Fill a Mandatory Field OR Format Is Invalid',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-warning',
        type: 'warning'
      }).catch(swal.noop)
      return;
    } else {

      this.showSpinner = true;
    }

    this.procurementrequestData = this.JSToNumberFloats(procurementrequestForm);

    if (this.procurementrequestData.p_is_reimburse == null || this.procurementrequestData.p_is_reimburse == '') {
      this.procurementrequestData.p_is_reimburse = false;
    }
    const usersJson: any[] = Array.of(this.procurementrequestData);

    if (this.param != null) {

      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
        .subscribe(
          res => {

            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showSpinner = false;
              $('#requestwiz').click();
              $('#requesdoctwiz').click();
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
            this.swalPopUpMsg(parse.data);
          });
    } else {
      // call web service
      this.dalservice.Insert(usersJson, this.APIController, this.APIRouteForInsert)
        .subscribe(
          res => {
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showSpinner = false;
              this.showNotification('bottom', 'right', 'success');
              this.route.navigate(['/transaction/subprocurementrequest/procurementrequestdetail', parse.code]);
            } else {
              this.showSpinner = false;
              this.swalPopUpMsg(parse.data)
            }
          },
          error => {
            this.showSpinner = false;
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data);
          });
    }
  }
  //#endregion form submit

  //#region button back
  btnBack() {
    this.route.navigate(['/transaction/subprocurementrequest']);
    $('#datatableprocreq').DataTable().ajax.reload();
  }
  //#endregion button back

  //#region btnActive
  btnActive(code: string) {
    // param tambahan untuk getrole dynamic
    this.dataRoleTamp = [{
      'p_code': code,
      'action': 'default'
    }];
    // param tambahan untuk getrole dynamic

    // call web service
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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForUpdateSatus)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);

              if (parse.result === 1) {
                this.showNotification('bottom', 'right', 'success');
                this.callGetrow();
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
    })
  }
  //#endregion btnActive

  //#region List tabs 
  requestdocumentwiz() {
    this.route.navigate(['/transaction/subprocurementrequest/procurementrequestdetail/' + this.param + '/requestdocumentwizlist', this.param], { skipLocationChange: true });
  }

  requestitemwiz() {
    this.route.navigate(['/transaction/subprocurementrequest/procurementrequestdetail/' + this.param + '/requestitemwizlist', this.param], { skipLocationChange: true });
  }
  //#endregion List tabs

  //#region DivisionCode Lookup
  btnLookupDivisionCode() {
    $('#datatableLookupDivisionCode').DataTable().clear().destroy();
    $('#datatableLookupDivisionCode').DataTable({
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
          'p_company_code': this.company_code,
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.ExecSpSys(dtParameters, this.APIControllerSysDivisionCode, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupdivisioncode = parse.data;

          if (parse.data != null) {
            this.lookupdivisioncode.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [4] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowDivisionCode(code: String, name: String) {
    this.model.division_code = code;
    this.model.division_name = name;
    this.model.department_code = undefined;
    this.model.department_name = undefined;
    this.model.sub_department_code = undefined;
    this.model.sub_department_name = undefined;
    this.model.unit_code = undefined;
    this.model.unit_name = undefined;
    $('#lookupModalDivisionCode').modal('hide');
  }
  //#endregion DivisionCode lookup

  //#region DepartmentCode Lookup
  btnLookupDepartmentCode(divisionCode: String) {
    $('#datatableLookupDepartmentCode').DataTable().clear().destroy();
    $('#datatableLookupDepartmentCode').DataTable({
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
          'p_company_code': this.company_code,
          'p_division_code': divisionCode,
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.ExecSpSys(dtParameters, this.APIControllerSysDepartmentCode, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupdepartmentcode = parse.data;

          if (parse.data != null) {
            this.lookupdepartmentcode.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [4] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowDepartmentCode(code: String, name: String) {
    this.model.department_code = code;
    this.model.department_name = name;
    this.model.sub_department_code = undefined;
    this.model.sub_department_name = undefined;
    this.model.unit_code = undefined;
    this.model.unit_name = undefined;
    $('#lookupModalDepartmentCode').modal('hide');
  }
  //#endregion DepartmentCode lookup

  //#region Sub DepartmentCode Lookup
  btnLookupSubDepartmentCode(divisionCode: String, departmentCode: String) {
    $('#datatableLookupSubDepartmentCode').DataTable().clear().destroy();
    $('#datatableLookupSubDepartmentCode').DataTable({
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
          'p_company_code': this.company_code,
          'p_division_code': divisionCode,
          'p_department_code': departmentCode,
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.ExecSpSys(dtParameters, this.APIControllerSubDepartmentCode, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);

          this.lookupsubdepartmentcode = parse.data;

          if (parse.data != null) {
            this.lookupsubdepartmentcode.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [4] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowSubDepartmentCode(code: String, name: String) {
    this.model.sub_department_code = code;
    this.model.sub_department_name = name;
    this.model.unit_code = undefined;
    this.model.unit_name = undefined;
    $('#lookupModalSubDepartmentCode').modal('hide');
  }
  //#endregion Sub DepartmentCode lookup

  //#region UnitCode Lookup
  btnLookupUnitCode(divisionCode: String, departmentCode: String, subdepartmentCode: String) {
    $('#datatableLookupUnitCode').DataTable().clear().destroy();
    $('#datatableLookupUnitCode').DataTable({
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
          'p_company_code': this.company_code,
          'p_division_code': divisionCode,
          'p_department_code': departmentCode,
          'p_sub_department_code': subdepartmentCode,
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.ExecSpSys(dtParameters, this.APIControllerUnitCode, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);

          this.lookupunitcode = parse.data;

          if (parse.data != null) {
            this.lookupunitcode.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [4] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowUnitCode(code: String, name: String) {
    this.model.unit_code = code;
    this.model.unit_name = name;
    $('#lookupModalUnitCode').modal('hide');
  }
  //#endregion UnitCode lookup

  //#region BranchCode Lookup
  btnLookupBranchCode() {
    $('#datatableLookupBranchCode').DataTable().clear().destroy();
    $('#datatableLookupBranchCode').DataTable({
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
          'p_user_code': this.userId,
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.ExecSpSys(dtParameters, this.APIControllerBranch, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupbranchcode = parse.data;

          if (parse.data != null) {
            this.lookupbranchcode.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [4] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowBranchCode(code: String, name: String) {
    this.model.branch_code = code;
    this.model.branch_name = name;
    $('#lookupModalBranchCode').modal('hide');
  }
  //#endregion BranchCode lookup

  //#region RequestorCode Lookup
  btnLookupRequestorCode() {
    $('#datatableLookupRequestorCode').DataTable().clear().destroy();
    $('#datatableLookupRequestorCode').DataTable({
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
          // 'p_company_code': this.company_code,
          // 'p_module': 'ALL',
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.ExecSpSys(dtParameters, this.APIControllerRequestor, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookuprequestorcode = parse.data;

          if (parse.data != null) {
            this.lookuprequestorcode.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [3] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowRequestorCode(code: String, name: String) {
    this.model.requestor_code = code;
    this.model.requestor_name = name;
    $('#lookupModalRequestorCode').modal('hide');
  }
  //#endregion RequestorCode lookup

  //#region button Proceed
  btnProceed(code: string) {
    // param tambahan untuk button Proceed dynamic
    this.dataRoleTamp = [{
      'p_code': code,
      'p_company_code': this.company_code,
      'action': 'default'
    }];
    // param tambahan untuk button Proceed dynamic

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReturnProceed)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.callGetrow();
                $('#requestwiz').click();
                $('#requesdoctwiz').click();
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
  //#endregion button Proceed

  //#region button Cancel
  btnCancel(code: string) {
    // param tambahan untuk button Cancel dynamic
    this.dataRoleTamp = [{
      'p_code': code,
      'p_company_code': this.company_code,
      'action': 'default'
    }];
    // param tambahan untuk button Cancel dynamic

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReturnCancel)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.callGetrow();
                $('#requestwiz').click();
                $('#requesdoctwiz').click();
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
  //#endregion button Cancel

  //#region  set datepicker
  getStyles(isTrue: Boolean) {
    if (isTrue) {
      this.setStyle = {
        'pointer-events': 'none',
      }
    } else {
      this.setStyle = {
        'pointer-events': 'auto',
      }
    }

    return this.setStyle;
  }
  //#endregion  set datepicker

  //#region from province lookup
  btnLookupFromProvince() {
    $('#datatableLookupFromProvince').DataTable().clear().destroy();
    $('#datatableLookupFromProvince').DataTable({
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

        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysProvince, this.APIRouteLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupfromprovince = parse.data;

          if (parse.data != null) {
            this.lookupfromprovince.numberIndex = dtParameters.start;
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

  btnSelectRowFromProvince(province_code: String, province_desc: String) {
    this.model.from_province_code = province_code;
    this.model.from_province_name = province_desc;
    this.model.from_city_code = '';
    this.model.from_city_name = '';
    $('#lookupModalFromProvince').modal('hide');
  }
  //#endregion from province lookup

  //#region province lookup
  btnLookupProvince() {
    $('#datatableLookupProvince').DataTable().clear().destroy();
    $('#datatableLookupProvince').DataTable({
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

        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysProvince, this.APIRouteLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupprovince = parse.data;

          if (parse.data != null) {
            this.lookupprovince.numberIndex = dtParameters.start;
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

  btnSelectRowProvince(province_code: String, province_desc: String) {
    this.model.to_province_code = province_code;
    this.model.to_province_name = province_desc;
    this.model.to_city_code = '';
    this.model.to_city_name = '';
    $('#lookupModalProvince').modal('hide');
  }
  //#endregion province lookup

  //#region from city lookup
  btnLookupFromCity() {
    $('#datatableLookupFromCity').DataTable().clear().destroy();
    $('#datatableLookupFromCity').DataTable({
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
          'p_province_code': this.model.from_province_code,
        });
        // end param tambahan untuk getrows dynamic        
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysCity, this.APIRouteLookupSysCity).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupfromcity = parse.data;

          if (parse.data != null) {
            this.lookupfromcity.numberIndex = dtParameters.start;
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

  btnSelectRowFromCity(city_code: String, city_desc: String) {
    this.model.from_city_code = city_code;
    this.model.from_city_name = city_desc;
    $('#lookupModalFromCity').modal('hide');
  }
  //#endregion from city lookup

  //#region city lookup
  btnLookupCity() {
    $('#datatableLookupCity').DataTable().clear().destroy();
    $('#datatableLookupCity').DataTable({
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
          'p_province_code': this.model.to_province_code,
        });
        // end param tambahan untuk getrows dynamic        
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysCity, this.APIRouteLookupSysCity).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupcity = parse.data;

          if (parse.data != null) {
            this.lookupcity.numberIndex = dtParameters.start;
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

  btnSelectRowCity(city_code: String, city_desc: String) {
    this.model.to_city_code = city_code;
    this.model.to_city_name = city_desc;
    $('#lookupModalCity').modal('hide');
  }
  //#endregion city lookup

  //#region approval Lookup
  btnViewApproval() {
    $('#datatableLookupApproval').DataTable().clear().destroy();
    $('#datatableLookupApproval').DataTable({
      'pagingType': 'first_last_numbers',
      'pageLength': 5,
      'processing': true,
      'serverSide': true,
      responsive: true,
      lengthChange: false, // hide lengthmenu
      searching: true, // jika ingin hilangin search box nya maka false

      ajax: (dtParameters: any, callback) => {

        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_reff_no': this.param
        });


        this.dalservice.GetrowsApv(dtParameters, this.APIControllerApprovalSchedule, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupapproval = parse.data;
          if (parse.data != null) {
            this.lookupapproval.numberIndex = dtParameters.start;
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
      order: [[5, 'ASC']],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }
  //#endregion approval Lookup
}