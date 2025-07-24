import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../base.component';
import { DALService } from '../../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './invoiceregistrationapprovalitemlist.component.html'
})

export class InvoiceRegistrationApprovalItemComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public CurrencyFormat = this._currencyformat;
  public isReadOnly: Boolean = false;
  public lookupasset: any = [];
  public invoiceRegDetailData: any = [];
  public lookupitemcode: any = [];
  public tampdHidden: Boolean;
  public lookupbranchcode: any = [];
  public lookupuomcode: any = [];
  public lookupcurrencycode: any = [];
  public lookupvendor: any = [];
  public lookupdivisioncode: any = [];
  public lookupsubdepartmentcode: any = [];
  public lookupdepartmentcode: any = [];
  public lookupunitcode: any = [];
  private setStyle: any = [];
  private dataTamp: any = [];
  public parameterData: any = [];
  public tempFile: any;
  public tampHidden: Boolean;
  public tampNotRent: Boolean;
  public lookupTax: any = [];
  private idDetailForReason: any;
  public listinvoicefaktur: any = [];
  public codeInvoice: any;
  public codePayment: any;


  private APIController: String = 'InvoiceRegistrationDetail';
  private APIControllerInvoiceRegister: String = 'InvoiceRegistration';
  private APIControllerBaseItemCode: String = 'MasterItem';
  private APIControllerBranch: String = 'SysCompanyUserMainBranch';
  private APIControllerVendor: String = 'MasterVendor';
  private APIControllerSysCurrencyCode: String = 'SysCurrency';
  private APIControllerUnitCode: String = 'MasterUnit';
  private APIControllerSysDivisionCode: String = 'MasterDivision';
  private APIControllerSysDepartmentCode: String = 'MasterDepartment';
  private APIControllerSubDepartmentCode: String = 'MasterSubDepartment';
  private APIControllerTaxCode: String = 'MasterTax';
  private APIControllerFaktur: String = 'InvoiceRegistrationDetailFaktur';

  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForInsert: String = 'INSERT';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';
  private APIRouteForGetRows: String = 'GetRowsForFaktur';
  private RoleAccessCode = 'R00021610000000A';

  // form 2 way binding
  model: any = {};
  modeldetail: any = {};

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
    private _elementRef: ElementRef
  ) { super(); }

  ngOnInit() {
    this.Delimiter(this._elementRef);
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);

    if (this.param != null) {
      this.isReadOnly = true;
      // call web service
      this.callGetrow();
      this.getStatusHeader();
      this.loadData();
    } else {
      this.tampHidden = true;
      this.showSpinner = false;
    }
  }

  //#region getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_id': this.param
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);

          this.codeInvoice = parsedata.invoice_register_code;
          this.codePayment = parsedata.code_payment;

          // mapper dbtoui
          Object.assign(this.modeldetail, parsedata);
          // end mapper dbtoui

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion getrow data

  //#region getStatusHeader
  getStatusHeader() {
    this.dataTamp = [{
      'p_code': this.param
    }];

    this.dalservice.Getrow(this.dataTamp, this.APIControllerInvoiceRegister, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];

          // mapper dbtoui
          Object.assign(this.model, parsedata);
          // end mapper dbtoui

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion getStatusHeader

  //#region  form submit
  onFormSubmit(InvoiceRegDetailForm: NgForm, isValid: boolean) {
    // validation form submit
    if (!isValid) {
      swal({
        allowOutsideClick: false,
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

    // this.invoiceRegDetailData = quoReviewDetail;
    this.invoiceRegDetailData = InvoiceRegDetailForm;
    this.invoiceRegDetailData = this.JSToNumberFloats(InvoiceRegDetailForm)

    // if (this.invoiceRegDetailData.p_is_active == null) {
    //   this.invoiceRegDetailData.p_is_active = false
    // }
    const usersJson: any[] = Array.of(this.invoiceRegDetailData);
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
              $('#btnInvoiceRegisration').click();
            } else {
              this.swalPopUpMsg(parse.data);
            }
          },
          error => {
            this.showSpinner = false;
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data)
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
              this.route.navigate(['/accountpayable/subinvoiceregisterlist/invoiceregisterdetail/' + this.param + '/invoiceregisterdetailwizdetail', this.param]);
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
  }
  //#endregion form submit

  //#region button back
  btnBack() {
    // this.route.navigate(['/accountpayable/subinvoiceregisterlist/invoiceregisterdetail/' + this.param + '/invoiceregisterdetailwizlist', this.param]);
    this.route.navigate(['/objectinfoinvoiceregistration/invoiceregistrationapproval', this.codeInvoice]);
  }
  //#endregion button back

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

  //#region ItemCode Lookup
  btnLookupItemCode() {
    $('#datatableLookupItemCode').DataTable().clear().destroy();
    $('#datatableLookupItemCode').DataTable({
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
        this.dalservice.ExecSpBam(dtParameters, this.APIControllerBaseItemCode, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupitemcode = parse.data;

          if (parse.data != null) {
            this.lookupitemcode.numberIndex = dtParameters.start;
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

  btnSelectRowItemCode(code: String, name: String) {
    this.model.item_code = code;
    this.model.item_name = name;
    $('#lookupModalItemCode').modal('hide');
  }
  //#endregion ItemCode lookup

  //#region CurrencyCode Lookup
  btnLookupCurrencyCode() {
    $('#datatableLookupCurrencyCode').DataTable().clear().destroy();
    $('#datatableLookupCurrencyCode').DataTable({
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
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysCurrencyCode, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupcurrencycode = parse.data;

          if (parse.data != null) {
            this.lookupcurrencycode.numberIndex = dtParameters.start;
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

  btnSelectRowCurrencyCode(code: String, description: String) {
    this.model.currency_code = code;
    this.model.currency_name = description;
    $('#lookupModalCurrencyCode').modal('hide');
  }
  //#endregion CurrencyCode lookup

  //#region Vendor Lookup
  btnLookupVendor() {
    $('#datatableLookupVendor').DataTable().clear().destroy();
    $('#datatableLookupVendor').DataTable({
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
          'p_code': ' ',
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerVendor, this.APIRouteForLookup).subscribe(resp => {
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
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      order: [['4', 'asc']],
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowVendor(code: String, description: String) {
    this.model.supplier_code = code;
    this.model.supplier_name = description;
    $('#lookupModalVendor').modal('hide');
  }
  //#endregion Vendor lookup

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

  //#region tax Lookup
  btnLookupTaxCode() {
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
          'p_company_code': this.company_code,
          'action': 'getResponse'
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsBam(dtParameters, this.APIControllerTaxCode, this.APIRouteForLookup).subscribe(resp => {
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '

      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowTax(code: string, description: string, ppn_pct: string, pph_pct: string) {

    this.model.master_tax_code = code;
    this.model.master_tax_description = description;
    this.model.ppn_amount = ppn_pct;
    this.model.pph_amount = pph_pct;

    this.model.ppn = ppn_pct
    this.model.pph = pph_pct
    // const listdataDetailWithQuotaion = [];

    // listdataDetailWithQuotaion.push({
    //   p_id: this.idDetailForReason,
    //   p_tax_code: code,
    //   p_tax_name: description,
    //   p_ppn_pct: ppn_pct,
    //   p_pph_pct: pph_pct,
    // });

    //#region web service
    // this.dalservice.Update(listdataDetailWithQuotaion, this.APIController, this.APIRouteForUpdate)
    //   .subscribe(
    //     res => {
    //       const parse = JSON.parse(res);
    //       if (parse.result === 1) {
    //         $('#datatablesuppliercoldetail').DataTable().ajax.reload();
    //       } else {
    //         this.swalPopUpMsg(parse.data);
    //       }
    //     },
    //     error => {
    //       const parse = JSON.parse(error);
    //       this.swalPopUpMsg(parse.data);
    //     });
    //#endregion web service
    $('#lookupModalTax').modal('hide');
  }
  //#endregion tax lookup

  //#region total_amount
  TotalAmount(event: any) {
    this.model.purchase_amount = event.target.value;
    this.model.total_amount = ((this.model.purchase_amount - this.model.discount_detail) * this.model.quantity) - (this.model.pph + this.model.ppn)
  }
  //#endregion total_amount

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
          'p_id': this.param
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerFaktur, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.listinvoicefaktur = parse.data;

          if (parse.data != null) {
            this.listinvoicefaktur.numberIndex = dtParameters.start;
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
      order: [[1, 'desc']],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
    }
  }
  //#endregion load all data
}
