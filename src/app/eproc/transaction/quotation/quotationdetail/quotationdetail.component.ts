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
  templateUrl: './quotationdetail.component.html'
})
export class QuotationdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public procurementQuotationData: any = [];
  public isReadOnly: Boolean = false;
  public isStatus: Boolean;
  public tampdHidden: Boolean;
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

  private APIController: String = 'Quotation';
  private APIControllerSysDivisionCode: String = 'MasterDivision';
  private APIControllerSysDepartmentCode: String = 'MasterDepartment';
  private APIControllerSubDepartmentCode: String = 'MasterSubDepartment';
  private APIControllerUnitCode: String = 'MasterUnit';
  private APIControllerBranch: String = 'SysCompanyUserMainBranch';
  private APIRouteForUpdateSatus: String = 'ExecSpForUpdateStatus';
  private APIRouteForReturnProceed: String = 'ExecSpForProceed';
  private APIRouteForReturnCancel: String = 'ExecSpForCancel';
  private APIRouteForPost: String = 'ExecSpForPost';
  private APIRouteForCancel: String = 'ExecSpForCancel';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForLookup: String = 'GetRowsForLookup';

  private RoleAccessCode = 'R00021560000000A'; // role access 

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
    if (this.param != null) {
      this.isReadOnly = true;
      // call web service
      this.callGetrow();
      this.wizard();
      this.quotationdetailwwiz();
    } else {
      this.tampdHidden = false;
      this.model.company_code = this.company_code;
      this.showSpinner = false;
    }
  }

  //#region getrow data
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
          if (parsedata.status != 'HOLD') {
            this.tampdHidden = true;
          } else {
            this.tampdHidden = false;
          }
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
  onFormSubmit(procurementQuotationForm: NgForm, isValid: boolean) {
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

    this.procurementQuotationData = this.JSToNumberFloats(procurementQuotationForm);

    const usersJson: any[] = Array.of(this.procurementQuotationData);

    if (this.param != null) {
      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
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
              this.route.navigate(['/transaction/subquotationlist/quotationdetail', parse.code]);
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
    this.route.navigate(['/transaction/subquotationlist']);
    $('#datatableprocquotation').DataTable().ajax.reload();
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

 //#region button Post
 btnPost(code: string) {
  // param tambahan untuk button Post dynamic

  this.dataRoleTamp = [{
    'p_code': code,
    'p_company_code': this.company_code,
    'action': 'default'
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
              this.callGetrow()
              $('#quotationdetailwiz').click();
              $('#docdetailwiz').click();
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

  //#region btnCancel
  btnCancel() {
    // param tambahan untuk button Done dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': 'default'
    }];
    // param tambahan untuk button Done dynamic

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForCancel)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.callGetrow()
                $('#quotationdetailwiz').click();
                $('#docdetailwiz').click();
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
    })
  }
  //#endregion btnCancel

  //#region List tabs 
  quotationdetailwwiz() {
    this.route.navigate(['/transaction/subquotationlist/quotationdetail/' + this.param + '/quotationdetailwizlist', this.param], { skipLocationChange: true });
  }

  quotationdocumentwwiz() {
    this.route.navigate(['/transaction/subquotationlist/quotationdetail/' + this.param + '/quotationdokumentwizlist', this.param], { skipLocationChange: true });
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
      columnDefs: [{ orderable: false, width: '5%', targets: [1,4] }], // for disabled coloumn
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

}