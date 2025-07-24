import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { DataTableDirective } from 'angular-datatables';

declare var $: any;

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './supplierselectiondetail.component.html'
})

export class SupplierSelectiondetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public supplierCollectionList: any = [];
  public supplierColDetailList: any = [];
  public isReadOnly: Boolean = false;
  private dataTamp: any = [];
  private dataTampPush: any[];
  public tampdHidden: Boolean;
  public isDisabled: Boolean;
  public isDisabled2: Boolean;
  private setStyle: any = [];
  private dataRoleTamp: any = [];
  private datatamplist: any = [];
  public lookupdivisioncode: any = [];
  public lookupsubdepartmentcode: any = [];
  public lookupdepartmentcode: any = [];
  public lookupTax: any = [];
  public lookupunitcode: any = [];
  public lookupbranchcode: any = [];
  public lookupapproval: any = [];
  public lookupvendor: any = [];
  public lookupvendorwithquotation: any = [];
  public lookuprequestorcode: any = [];
  private idDetailForReason: any;
  public listdataDetail: any = [];
  public QuotationCode: any = [];
  public QuotationDetailId: any = [];
  private dataTempThirdParty: any = [];
  private VendorSupplierSelection: any;
  public tolevelapproval: String;
  public ProceedToLastLevelData: any = [];

  private APIController: String = 'SupplierSelection';
  private APIControllerSysDivisionCode: String = 'MasterDivision';
  private APIControllerSysDepartmentCode: String = 'MasterDepartment';
  private APIControllerVendor: String = 'MasterVendor';
  private APIControllerSubDepartmentCode: String = 'MasterSubDepartment';
  private APIControllerSupplierSelectionDetail: String = 'SupplierSelectionDetail';
  private APIControllerUnitCode: String = 'MasterUnit';
  private APIControllerBranch: String = 'SysCompanyUserMainBranch';
  private APIControllerQuotationReviewDetail: String = 'QuotationReviewDetail';
  private APIControllerTaxCode: String = 'MasterTaxScheme';
  private APIControllerApprovalSchedule: String = 'ApprovalSchedule';
  private APIControllerVendorExt: String = 'Intergration';
  private APIControllerSysGlobalParam: String = 'SysGlobalParam';
  private APIControllerApvSchd: String = 'ApprovalSchedule';
  private APIControllerApprovalMain: String = 'ApprovalMain';


  private APIRouteForReturn: String = 'ExecSpForReturn';
  private APIRouteForProceed: String = 'ExecSpForProceed';
  private APIRouteForCancel: String = 'ExecSpForCancel';
  private APIRouteForUpdateItem: String = 'ExecSpForUpdateItem';
  private APIRouteForPost: String = 'ExecSpForPost';
  private APIRouteGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForGetRowEntry: String = 'GetRowEntry';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForSupplierUpdate: String = 'UpdateForSupplier';
  private APIRouteForSupplierUpdateWithQuotation: String = 'UpdateForSupplierWithQuotation';
  private APIRouteForTaxUpdateWithQuotation: String = 'UpdateForTax';
  private APIRouteForUpdateAmount: String = 'UpdateForAmount';
  private APIRouteForDelete: String = 'Delete';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForLookupSupplier: String = 'GetRowsForLookupSupplier';
  private APIRouteForLookupForSupplierExt: String = 'GetListVendorForLookup';
  private APIRouteForGetThirddParty: String = 'ExecSpForThidrParty';
  private APIRouteForUpdateCommentReturn: String = 'UpdateCommentReturn';

  private RoleAccessCode = 'R00021570000000A';

  // form 2 way binding
  model: any = {};
  modelproceed: any = {};


  // checklist
  public selectedAllTable: any;
  private checkedList: any = [];

  // spinner
  showSpinner: Boolean = true;
  showSpinnerlookUp: Boolean = false;
  // end

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _elementRef: ElementRef
  ) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.callGlobalParamForThirdPartyVendor();
    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
      this.loadData();
      this.wizard();
      this.supplierselectionitemwiz();
      // this.showSpinner = false;
      this.tolevelapproval = 'NEXT';
      this.modelproceed.to_level_approve = 'NEXT';
      this.callGetrowReturn();
    } else {
      this.showSpinner = false;
      this.tampdHidden = false;
      this.model.company_code = this.company_code;
      this.model.status = "HOLD";
    }
  }

  //#region GlobalParam for Thirdparty
  callGlobalParamForThirdPartyVendor() {
    this.dataTempThirdParty = [{
      'p_type': "VENDOR",
      'action': "getResponse"
    }];
    this.dalservice.ExecSp(this.dataTempThirdParty, this.APIControllerSysGlobalParam, this.APIRouteForGetThirddParty)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data);

          for (let i = 0; i < parsedata.length; i++) {
            if (parsedata[i].code === 'URLVDR') {
              this.VendorSupplierSelection = parsedata[i].value
            }
          }

          this.showSpinner = false;
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion GlobalParam for Thirdparty

  //#region getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param
    }];
    // end param tambahan untuk getrow dynamic

    // this._widgetdetailService.WidgetDetailGetrow(this.dataTamp)
    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);

          if (parsedata.status !== 'HOLD') {
            this.tampdHidden = true;
          } else {
            this.tampdHidden = false;
          }

          if (parsedata.quotation_code != '') {
            this.isDisabled = true;
          } else {
            this.isDisabled = false;
          }

          if (parsedata.quotation_code == '') {
            this.isDisabled2 = true;
          } else {
            this.isDisabled2 = false;
          }
          this.QuotationCode = parsedata.quotation_code;

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
          'p_selection_code': this.param
        });
        // end param tambahan untuk getrows dynamic

        // tslint:disable-next-line:max-line-length
        this.dalservice.Getrows(dtParameters, this.APIControllerSupplierSelectionDetail, this.APIRouteGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.supplierColDetailList = parse.data;

          if (parse.data != null) {
            this.supplierColDetailList.numberIndex = dtParameters.start;
          }

          // if use checkAll use this
          $('#checkalltable').prop('checked', false);
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

  //#region  form submit
  onFormSubmit(quotationReviewForm: NgForm, isValid: boolean) {
    // validation form submit
    if (!isValid) {
      swal({
        title: 'Warning!',
        text: 'Please Fill a Mandatory Field OR Format Is Invalid!!',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-warning',
        type: 'warning'
      }).catch(swal.noop)
      return;
    } else {
      this.showSpinner = true;
    }

    // this.supplierCollectionList = quotationReviewForm;
    this.supplierCollectionList = this.JSToNumberFloats(quotationReviewForm);
    const usersJson: any[] = Array.of(this.supplierCollectionList);
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
      this.dalservice.Insert(usersJson, this.APIController, this.APIRouteForInsert)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showNotification('bottom', 'right', 'success');
              this.callGetrow()
              this.route.navigate(['/transaction/subsupplierselectionlist/supplierselectiondetail', parse.code]);
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

  //#region button back
  btnBack() {
    $('#datatablesuppliercol').DataTable().ajax.reload();
    this.route.navigate(['/transaction/subsupplierselectionlist']);
  }
  //#endregion button back

  //#region button add
  btnAdd() {
    this.route.navigate(['/transaction/subsupplierselectionlist/supplierselectiondetaildetail', this.param]);
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/transaction/subsupplierselectionlist/supplierselectiondetaildetail', this.param, codeEdit]);
  }
  //#endregion button edit

  //#region button delete
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.supplierColDetailList.length; i++) {
      if (this.supplierColDetailList[i].selected) {
        this.checkedList.push(this.supplierColDetailList[i].id);
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
      this.showSpinner = true;
      if (result.value) {
        this.dataTampPush = [];

        for (let J = 0; J < this.checkedList.length; J++) {
          // param tambahan untuk getrow dynamic
          this.dataTampPush = [{
            'p_id': this.checkedList[J]
          }];
          // end param tambahan untuk getrow dynamic
          this.dalservice.Delete(this.dataTampPush, this.APIController, this.APIRouteForDelete)
            .subscribe(
              res => {
                this.showSpinner = false;
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  this.showNotification('bottom', 'right', 'success');
                  $('#datatablesuppliercoldetail').DataTable().ajax.reload();
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
      } else {
        this.showSpinner = false;
      }
    });
  }
  //#region selectAll
  selectAllTable() {
    for (let i = 0; i < this.supplierColDetailList.length; i++) {
      this.supplierColDetailList[i].selected = this.selectedAllTable;
    }
  }
  //#endregion selectAll

  //#region  checkIfAllTableSelected
  checkIfAllTableSelected() {
    this.selectedAllTable = this.supplierColDetailList.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkIfAllTableSelected

  //#endregion button delete

  //#region btnProceed
  btnProceed(code: any) {
    // param tambahan untuk getrole dynamic
    this.dataTamp = [{
      'p_code': code,
      'action': ''
    }];
    // param tambahan untuk getrole dynamic
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
              this.swalPopUpMsg(parse.data);
            });
      } else {
        this.showSpinner = false;
      }
    });
  }
  //#endregion btnProceed

  //#region btnReturn
  btnReturn(code: any) {
    this.showSpinner = true;
    // param tambahan untuk getrole dynamic
    this.dataTamp = [{
      'p_code': code,
      'action': ''
    }];
    // param tambahan untuk getrole dynamic
    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'Yes',
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        this.showSpinner = false;
        this.dalservice.ExecSp(this.dataTamp, this.APIController, this.APIRouteForReturn)
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
        this.showSpinner = false;
      }
    });
  }
  //#endregion btnReturn

  //#region button Post
  btnPost(code: string) {
    // param tambahan untuk button Post dynamic
    this.dataRoleTamp = [{
      'p_code': code,
      'p_company_code': this.company_code,
      'p_last_return': 'NO',
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
                this.callGetrow();
                $('#supplier_item').click();
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
  //#endregion button Post

  //#region button Post
  btnPostLastReturn(code: string) {
    // param tambahan untuk button Post dynamic
    this.dataRoleTamp = [{
      'p_code': code,
      'p_company_code': this.company_code,
      'p_last_return': 'NO',
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
                this.callGetrow();
                $('#supplier_item').click();
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
                this.callGetrow();
                $('#supplier_item').click();
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

  //#region Vendor Lookup
  // btnLookupVendor(id: any) {
  //   $('#datatableLookupVendor').DataTable().clear().destroy();
  //   $('#datatableLookupVendor').DataTable({
  //     'pagingType': 'first_last_numbers',
  //     'pageLength': 5,
  //     'processing': true,
  //     'serverSide': true,
  //     responsive: true,
  //     lengthChange: false, // hide lengthmenu
  //     searching: true, // jika ingin hilangin search box nya maka false

  //     ajax: (dtParameters: any, callback) => {
  //       // param tambahan untuk getrows dynamic
  //       dtParameters.paramTamp = [];
  //       dtParameters.paramTamp.push({
  //         'p_company_code': this.company_code,
  //         'action': 'getResponse'
  //       });
  //       // end param tambahan untuk getrows dynamic

  //       // dtParameters.paramTamp = [];
  //       // let paramTamps = {}
  //       // paramTamps = {
  //       //   'draw': 1,
  //       //   'RowPage': 10,
  //       //   'PageNumber': 1,
  //       //   'SortBy': dtParameters.order[0].dir,
  //       //   'OrderBy': dtParameters.order[0].column,
  //       //   'Keywords': dtParameters.search.value,
  //       //   // 'URL': 'https://mocki.io/v1/12c64609-9593-4da7-847b-34db047da23d',
  //       //   'URL': 'http://172.31.233.24:8888/v1/VendorX/GetListVendorForLookup', // belum digunakan karena masih not ready
  //       //   'DataObj': 'ListVendorObj'
  //       // }
  //       // dtParameters.paramTamp.push(paramTamps)

  //       this.dalservice.GetrowsBam(dtParameters, this.APIControllerVendor, this.APIRouteForLookup).subscribe(resp => {
  //         const parse = JSON.parse(resp);
  //         this.lookupvendor = parse.data;
  //         if (parse.data != null) {
  //           this.lookupvendor.numberIndex = dtParameters.start;
  //         }
  //         callback({
  //           draw: parse.draw,
  //           recordsTotal: parse.recordsTotal,
  //           recordsFiltered: parse.recordsFiltered,
  //           data: []
  //         });
  //       }, err => console.log('There was an error while retrieving Data(API)' + err));
  //     },
  //     columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
  //     language: {
  //       search: '_INPUT_',
  //       searchPlaceholder: 'Search records',
  //       infoEmpty: '<p style="color:red;" > No Data Available !</p> '

  //     },
  //     searchDelay: 800 // pake ini supaya gak bug search
  //   });

  //   this.idDetailForReason = id;
  // }

  btnLookupVendor(id: any) {
    $('#datatableLookupVendor').DataTable().clear().destroy();
    $('#datatableLookupVendor').DataTable({
      'pagingType': 'first_last_numbers',
      'pageLength': 10,
      'processing': true,
      'serverSide': true,
      responsive: true,
      lengthChange: false, // hide lengthmenu
      searching: true, // jika ingin hilangin search box nya maka false

      ajax: (dtParameters: any, callback) => {
        dtParameters.paramTamp = [];
        let paramTamps = {}
        paramTamps = {
          'draw': 1,
          'RowPage': 10,
          'PageNumber': (dtParameters.start + 10) / 10,
          'SortBy': dtParameters.order[0].dir,
          'OrderBy': dtParameters.order[0].column,
          'Keyword': dtParameters.search.value,
          'URL': this.VendorSupplierSelection,
          'DataObj': 'ListVendorObj'
        }
        dtParameters.paramTamp.push(paramTamps)

        this.dalservice.Getrows(dtParameters, this.APIControllerVendorExt, this.APIRouteForLookupForSupplierExt).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupvendor = parse.data;
          if (parse.data != null) {
            this.lookupvendor.numberIndex = dtParameters.start;
          }
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API)' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '

      },
      searchDelay: 800 // pake ini supaya gak bug search
    });

    this.idDetailForReason = id;
  }

  btnSelectRowVendor(code: String, name: string, address: String, npwp: String) {

    this.model.supplier_code = code;
    this.model.supplier_name = name;
    this.model.supplier_address = address;
    this.model.supplier_npwp = npwp;

    this.listdataDetail = [];

    var i = 0;

    var getID = $('[name="p_id"]')
      .map(function () { return $(this).val(); }).get();

    while (i < getID.length) {
      if (getID[i] == this.idDetailForReason) {
        this.listdataDetail.push({
          p_id: getID[i],
          p_supplier_code: code,
          p_supplier_name: name,
          p_supplier_address: address,
          p_supplier_npwp: npwp
        });
      }
      i++;
    }


    //#region web service
    this.dalservice.Update(this.listdataDetail, this.APIControllerSupplierSelectionDetail, this.APIRouteForSupplierUpdate)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            $('#datatablesuppliercoldetail').DataTable().ajax.reload();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
    //#endregion web service
    $('#lookupModalVendor').modal('hide');
  }
  //#endregion Vendor lookup

  //#region button save in list
  btnSaveList() {
    // this.showSpinner = true;
    this.datatamplist = [];
    let j = 0;

    const getID = $('[name="p_id_doc"]')
      .map(function () { return $(this).val(); }).get();

    const getSupplier = $('[name="p_supplier_code"]')
      .map(function () { return $(this).val(); }).get();

    const getPriceAmount = $('[name="p_amount"]')
      .map(function () { return $(this).val(); }).get();
    // const getRemark = $('[name="p_remark_list"]')
    //   .map(function () { return $(this).val(); }).get();
    const getTotalAmount = $('[name="p_total_amount"]')
      .map(function () { return $(this).val(); }).get();

    if (getPriceAmount[j] == null) {
      swal({
        title: 'Warning',
        text: 'Please Fill Price Amount first',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger',
        type: 'warning'
      }).catch(swal.noop)
      return;
    }


    if (getTotalAmount[j] == null) {
      swal({
        title: 'Warning',
        text: 'Please Fill Total Amount first',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger',
        type: 'warning'
      }).catch(swal.noop)
      return;
    }

    while (j < getID.length) {

      while (j < getSupplier.length) {

        while (j < getPriceAmount.length) {

          while (j < getTotalAmount.length) {
            this.datatamplist.push(
              this.JSToNumberFloats({
                p_id: getID[j],
                p_supplier_code: getSupplier[j],
                p_price_amount: getPriceAmount[j],
                p_total_amount: getTotalAmount[j],
                action: 'default'
              }));
            j++;
          }
          j++;
        }
        j++;
      }
      j++;
    }
    //#region web service
    this.dalservice.Update(this.datatamplist, this.APIController, this.APIRouteForUpdateItem)
      .subscribe(
        res => {
          // this.showSpinner = false;
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            this.showSpinner = false;
            this.showNotification('bottom', 'right', 'success');
            $('#datatablesuppliercoldetail').DataTable().ajax.reload();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
    //#endregion web service

  }
  //#endregion button save in list

  //#region onBlur
  onBlurAmount(event, i, type) {
    if (type === 'amount') {
      if (event.target.value.match('[0-9]+(,[0-9]+)')) {
        if (event.target.value.match('(\.\d+)')) {

          event = '' + event.target.value;
          event = event.trim();
          event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        } else {
          event = '' + event.target.value;
          event = event.trim();
          event = parseFloat(event.replace(/,/g, '')).toFixed(2); // ganti jadi 6 kalo mau pct
          event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        }
      } else {
        event = '' + event.target.value;
        event = event.trim();
        event = parseFloat(event).toFixed(2); // ganti jadi 6 kalo mau pct
        event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
      }
    } else if (type === 'discount_amount') {
      if (event.target.value.match('[0-9]+(,[0-9]+)')) {
        if (event.target.value.match('(\.\d+)')) {

          event = '' + event.target.value;
          event = event.trim();
          event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        } else {
          event = '' + event.target.value;
          event = event.trim();
          event = parseFloat(event.replace(/,/g, '')).toFixed(2); // ganti jadi 6 kalo mau pct
          event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        }
      } else {
        event = '' + event.target.value;
        event = event.trim();
        event = parseFloat(event).toFixed(2); // ganti jadi 6 kalo mau pct
        event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
      }
    }
    else {
      event = '' + event.target.value;
      event = event.trim();
      event = parseFloat(event).toFixed(6);
    }

    if (event === 'NaN') {
      event = 0;
      event = parseFloat(event).toFixed(2);
    }

    if (type === 'amount') {
      $('#amount' + i)
        .map(function () { return $(this).val(event); }).get();
    } else if ((type === 'discount_amount')) {
      $('#discount_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    }
    else {
      $('#amount' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onBlur

  //#region onFocus
  onFocusAmount(event, i, type) {
    event = '' + event.target.value;

    if (event != null) {
      event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
    }

    if (type === 'amount') {
      $('#amount' + i)
        .map(function () { return $(this).val(event); }).get();
    } else if (type === 'discount_amount') {
      $('#discount_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#amount' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onFocus

  //#region onBlur
  onBlurTotalAmount(event, i, type) {
    if (type === 'amount') {
      if (event.target.value.match('[0-9]+(,[0-9]+)')) {
        if (event.target.value.match('(\.\d+)')) {

          event = '' + event.target.value;
          event = event.trim();
          event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        } else {
          event = '' + event.target.value;
          event = event.trim();
          event = parseFloat(event.replace(/,/g, '')).toFixed(2); // ganti jadi 6 kalo mau pct
          event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        }
      } else {
        event = '' + event.target.value;
        event = event.trim();
        event = parseFloat(event).toFixed(2); // ganti jadi 6 kalo mau pct
        event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
      }
    } else {
      event = '' + event.target.value;
      event = event.trim();
      event = parseFloat(event).toFixed(6);
    }

    if (event === 'NaN') {
      event = 0;
      event = parseFloat(event).toFixed(2);
    }

    if (type === 'amount') {
      $('#total_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#total_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onBlur

  //#region onFocus
  onFocusTotalAmount(event, i, type) {
    event = '' + event.target.value;

    if (event != null) {
      event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
    }

    if (type === 'amount') {
      $('#total_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#total_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onFocus

  //#region amount
  amount(event, id, quotation_quantity, discount_amount) {
    // param tambahan untuk update dynamic
    this.dataTamp = [{
      'p_id': id,
      'p_amount': event.target.value,
      'p_quotation_quantity': quotation_quantity,
      'p_discount_amount': discount_amount
    }];


    // end param tambahan untuk update dynamic

    // call web service
    this.dalservice.Update(this.dataTamp, this.APIControllerSupplierSelectionDetail, this.APIRouteForUpdateAmount)
      .subscribe(
        res => {
          this.showSpinner = false;
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            this.showNotification('bottom', 'right', 'success');
            $('#datatablesuppliercoldetail').DataTable().ajax.reload();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data)
        });
  }
  //#endregion amount

  //#region discountamount
  discountamount(event, id, amount, quotation_quantity) {
    // param tambahan untuk update dynamic
    this.dataTamp = [{
      'p_id': id,
      'p_amount': amount,
      'p_quotation_quantity': quotation_quantity,
      'p_discount_amount': event.target.value
    }];
    // end param tambahan untuk update dynamic


    // call web service
    this.dalservice.Update(this.dataTamp, this.APIControllerSupplierSelectionDetail, this.APIRouteForUpdateAmount)
      .subscribe(
        res => {
          this.showSpinner = false;
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            this.showNotification('bottom', 'right', 'success');
            $('#datatablesuppliercoldetail').DataTable().ajax.reload();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data)
        });
  }
  //#endregion discountamount

  //#region Vendor 2 Lookup
  btnLookupVendorQuotation(id: any, procurement_code: any) {
    $('#datatableLookupVendorWithQuotation').DataTable().clear().destroy();
    $('#datatableLookupVendorWithQuotation').DataTable({
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
          'p_reff_no': this.QuotationCode,
          'p_procurement_code': procurement_code,
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerQuotationReviewDetail, this.APIRouteForLookupSupplier).subscribe(resp => {
          const parse = JSON.parse(resp);

          this.lookupvendorwithquotation = parse.data;
          if (parse.data != null) {
            this.lookupvendorwithquotation.numberIndex = dtParameters.start;
          }
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API)' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 7] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '

      },
      searchDelay: 800 // pake ini supaya gak bug search
    });

    this.idDetailForReason = id;
  }

  btnSelectRowVendorQuotation(supplier_code: string, name: string, address: string, npwp: string, price_amount: string, quantity: string, tax_code: string, tax_name: string, discount_amount: string
    , ppn_pct: string, pph_pct: string, unit_available_status: string, indent_days: string, offering: string) {

    this.model.supplier_code = supplier_code;
    this.model.supplier_name = name;
    this.model.supplier_address = address;

    const listdataDetailWithQuotaion = [];

    listdataDetailWithQuotaion.push({
      p_id: this.idDetailForReason,
      p_supplier_code: supplier_code,
      p_supplier_name: name,
      p_supplier_address: address,
      p_supplier_npwp: npwp,
      p_amount: price_amount,
      p_quantity: quantity,
      p_tax_code: tax_code,
      p_tax_name: tax_name,
      p_discount_amount: discount_amount,
      p_ppn_pct: ppn_pct,
      p_pph_pct: pph_pct,
      p_unit_available_status: unit_available_status,
      p_indent_days: indent_days,
      p_offering: offering,
    });

    //#region web service
    this.dalservice.Update(listdataDetailWithQuotaion, this.APIControllerSupplierSelectionDetail, this.APIRouteForSupplierUpdateWithQuotation)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            $('#datatablesuppliercoldetail').DataTable().ajax.reload();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
    //#endregion web service
    $('#lookupModalVendorWithQuotation').modal('hide');
  }
  //#endregion Vendor 2 lookup

  //#region tax Lookup
  btnLookupTaxCode(id: any) {
    $('#datatableLookupTax').DataTable().clear().destroy();
    $('#datatableLookupTax').DataTable({
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
          'action': 'getResponse'
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerTaxCode, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupTax = parse.data;
          if (parse.data != null) {
            this.lookupTax.numberIndex = dtParameters.start;
          }
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API)' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 5] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '

      },
      searchDelay: 800 // pake ini supaya gak bug search
    });

    this.idDetailForReason = id;
  }

  btnSelectRowTax(code: string, description: string, ppn_pct: string, pph_pct: string) {

    this.model.tax_code = code;
    this.model.tax_name = description;
    this.model.ppn_pct = ppn_pct;
    this.model.pph_pct = pph_pct;

    const listdataDetailWithQuotaion = [];

    listdataDetailWithQuotaion.push({
      p_id: this.idDetailForReason,
      p_tax_code: code,
      p_tax_name: description,
      p_ppn_pct: ppn_pct,
      p_pph_pct: pph_pct,
    });

    //#region web service
    this.dalservice.Update(listdataDetailWithQuotaion, this.APIControllerSupplierSelectionDetail, this.APIRouteForTaxUpdateWithQuotation)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            $('#datatablesuppliercoldetail').DataTable().ajax.reload();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
    //#endregion web service
    $('#lookupModalTax').modal('hide');
  }
  //#endregion tax lookup

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

  //#region List tabs 
  supplierselectionitemwiz() {
    this.route.navigate(['/transaction/subsupplierselectionlist/supplierselectiondetail/' + this.param + '/supplierselectiondetailwizlist', this.param], { skipLocationChange: true });
  }

  supplierselectiondocumentwizlist() {
    this.route.navigate(['/transaction/subsupplierselectionlist/supplierselectiondetail/' + this.param + '/SupplierSelectionDocumentWizListComponent', this.param], { skipLocationChange: true });
  }
  //#endregion List tabs

  //#region Comment Return
  CommentReturn(event) {
    // param tambahan untuk update dynamic
    this.dataTamp = [{
      'p_id': this.modelproceed.code,
      'p_comment_return_entry': event.target.value,
    }];
    // end param tambahan untuk update dynamic
    this.dalservice.UpdateApv(this.dataTamp, this.APIControllerApvSchd, this.APIRouteForUpdateCommentReturn)
      .subscribe(
        res => {
          this.showSpinner = false;
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            this.showNotification('bottom', 'right', 'success');
            $('#datatableLookupApproval').DataTable().ajax.reload();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data)
        });
  }
  //#endregion Comment Return

  //#region getrow data
  callGetrowReturn() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param
    }];
    // end param tambahan untuk getrow dynamic

    this.dalservice.GetrowApv(this.dataTamp, this.APIControllerApprovalMain, this.APIRouteForGetRowEntry)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);

          // mapper dbtoui
          Object.assign(this.modelproceed, parsedata);
          // end mapper dbtoui

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion getrow data

  //#region ddl master module
  ToLevelApprove(event: any) {
    this.tolevelapproval = event.target.value;
    $('#datatable').DataTable().ajax.reload();
  }
  //#endregion ddl master module

  //#region lookup close
  btnLookupClose() {
    this.model.to_level = 'ENTRY';
    this.model.level = '';
    this.model.comment_return = '';
  }
  //#endregion lookup close

  //#region  form submit
  btnApprovalApprove(ApprovalProcessForm: NgForm, isValid: boolean) {
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
      this.showSpinnerlookUp = true;
    }
    this.ProceedToLastLevelData = ApprovalProcessForm;

    // param tambahan untuk button Proceed dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'p_company_code': this.company_code,
      'p_last_return': 'YES',
      'p_result_remarks': this.ProceedToLastLevelData.p_result_remarks,
      'action': ''
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
      if (result.value) {
        this.showSpinnerlookUp = true;
        // call web service
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForPost)
          .subscribe(
            res => {
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.callGetrow();
                this.showNotification('bottom', 'right', 'success');
                $('#supplier_item').click();
                $('#requesdoctwiz').click();
                $('#lookupModalProceedLastReturn').modal('hide');
                this.showSpinnerlookUp = false;
              } else {
                this.swalPopUpMsg(parse.data);
                this.showSpinnerlookUp = false;
              }
            },
            error => {
              this.showSpinnerlookUp = false;
              const parse = JSON.parse(error);
              this.swalPopUpMsg(parse.data);
            });
      } else {
        this.showSpinnerlookUp = false;
      }
    });

  }
  //#endregion form submit
}



