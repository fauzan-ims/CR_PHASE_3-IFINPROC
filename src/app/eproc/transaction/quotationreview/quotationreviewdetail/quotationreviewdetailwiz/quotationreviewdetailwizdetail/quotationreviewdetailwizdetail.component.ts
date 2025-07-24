import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './quotationreviewdetailwizdetail.component.html'
})

export class QuotationReviewDetailWizDetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');

  // variable
  public NumberOnlyPattern: string = this._numberonlyformat;
  public CurrencyFormat = this._currencyformat;
  public isReadOnly: Boolean = false;
  public lookupasset: any = [];
  public quoReviewDetailData: any = [];
  public lookupitemcode: any = [];
  public lookupbranchcode: any = [];
  public lookupuomcode: any = [];
  public lookuprequestorcode: any = [];
  public lookupcurrencycode: any = [];
  public lookuppurchasetype: any = [];
  public lookupvendor: any = [];
  private rolecode: any = [];
  private setStyle: any = [];
  private dataRoleTamp: any = [];
  private dataTamp: any = [];
  public parameterData: any = [];
  public lookupTax: any = [];
  private dataTempThirdParty: any = [];
  private VendorInvoice: any;
  private nett_price: any = [];
  private discount_amount: any = [];
  private unit_price: any = [];
  private temp_price: any = [];
  private tax_ppn: any = [];
  private tamps = new Array();
  private base64textString: string;
  public tempFile: any;
  public tampHidden: Boolean;
  public tampdHidden: Boolean;
  public tampHiddenStatus: Boolean;

  private APIController: String = 'QuotationReviewDetail';
  private APIControllerHeader: String = 'QuotationReview';
  private APIControllerQuoReview: String = 'QuotationReview';
  private APIControllerBaseItemCode: String = 'MasterItem';
  private APIControllerBranch: String = 'SysBranch';
  private APIControllerSysUomCode: String = 'MasterUom';
  private APIControllerVendor: String = 'MasterVendor';
  private APIControllerRequestor: String = 'SysEmployeeMain';
  private APIControllerSysCurrencyCode: String = 'SysCurrency';
  private APIControllerPurchaseType: String = 'SysGeneralSubCode';
  private APIControllerVendorExt: String = 'Intergration';
  private APIControllerSysGlobalParam: String = 'SysGlobalParam';

  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForGetRowMarketing: String = 'GetRowMarketing';
  private APIRouteForInsert: String = 'INSERT';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForLookupForQuotation: String = 'GetRowsForLookupProcurementVendor';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';
  private APIControllerTaxCode: String = 'MasterTaxScheme';
  private APIRouteForAdd: String = 'ExecSpForAdd';
  private APIRouteForLookupForQuotationExt: String = 'GetListVendorForLookup';
  private APIRouteForGetThirddParty: String = 'ExecSpForThidrParty';

  private RoleAccessCode = 'R00021550000000A';

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
    private _elementRef: ElementRef
  ) { super(); }

  ngOnInit() {
    this.Delimiter(this._elementRef);
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.callGlobalParamForThirdPartyVendor();
    if (this.params != null) {
      this.isReadOnly = true;
      // call web service
      this.callGetrow();
      this.callGetrowHeader();
      this.getStatusHeader();
    } else {
      this.tampHidden = true;
      this.showSpinner = false;
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
              this.VendorInvoice = parsedata[i].value
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
      'p_id': this.params
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);

          if (parsedata.unit_available_status === null || parsedata.unit_available_status === '') {
            parsedata.unit_available_status = 'READY'
          }

          this.nett_price = parsedata.nett_price;
          this.discount_amount = parsedata.discount_amount;
          this.unit_price = parsedata.unit_price;
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

  //#region getStatusHeader
  getStatusHeader() {
    this.dataTamp = [{
      'p_code': this.param
    }];

    this.dalservice.Getrow(this.dataTamp, this.APIControllerQuoReview, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];

          if (parsedata.status !== 'HOLD') {
            this.tampdHidden = true;
          } else {
            this.tampdHidden = false;
          }

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion getStatusHeader

  //#region  form submit
  onFormSubmit(quoReviewDetailForm: NgForm, isValid: boolean) {
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

    // this.quoReviewDetailData = quoReviewDetail;
    this.quoReviewDetailData = quoReviewDetailForm;

    this.quoReviewDetailData = this.JSToNumberFloats(quoReviewDetailForm)

    const usersJson: any[] = Array.of(this.quoReviewDetailData);
    if (this.params != null) {
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
              this.route.navigate(['/transaction/subquotationreviewlist/quotationreviewdetail/' + this.param + '/quotationreviewdetailwizdetail', this.param, parse.id]);
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
    this.route.navigate(['/transaction/subquotationreviewlist/quotationreviewdetail/' + this.param + '/quotationreviewdetailwizlist', this.param]);
    $('#datatabledoc').DataTable().ajax.reload();
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

  //#region UomCode Lookup
  btnLookupUomCode() {
    $('#datatableLookupUomCode').DataTable().clear().destroy();
    $('#datatableLookupUomCode').DataTable({
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
        this.dalservice.GetrowsBam(dtParameters, this.APIControllerSysUomCode, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupuomcode = parse.data;

          if (parse.data != null) {
            this.lookupuomcode.numberIndex = dtParameters.start;
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

  btnSelectRowUomCode(code: String, description: String) {
    this.model.uom_code = code;
    this.model.uom_description = description;
    $('#lookupModalUomCode').modal('hide');
  }
  //#endregion UomCode lookup

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
          'p_company_code': this.company_code,
          'p_module': 'ALL',
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

  //#region PurchaseType Lookup
  btnLookupPurchaseType() {
    $('#datatableLookupPurchaseType').DataTable().clear().destroy();
    $('#datatableLookupPurchaseType').DataTable({
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
          'p_general_code': 'PRCTY',
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsBam(dtParameters, this.APIControllerPurchaseType, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookuppurchasetype = parse.data;

          if (parse.data != null) {
            this.lookuppurchasetype.numberIndex = dtParameters.start;
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
      columnDefs: [{ orderable: false, width: '5%', targets: [5] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowPurchaseType(code: String, description: String) {
    this.model.payment_methode_code = code;
    this.model.payment_methode_name = description;
    $('#lookupModalPurchaseType').modal('hide');
  }
  //#endregion PurchaseType lookup

  //#region Vendor Lookup
  // btnLookupVendor() {
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
  //         'p_quotation_review_code': this.model.quotation_review_code,
  //         'p_reff_no': this.model.reff_no,
  //         'action': 'getResponse'
  //       });
  //       // end param tambahan untuk getrows dynamic
  //       this.dalservice.GetrowsBam(dtParameters, this.APIControllerVendor, this.APIRouteForLookupForQuotation).subscribe(resp => {
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
  //       }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
  //     },
  //     columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
  //     language: {
  //       search: '_INPUT_',
  //       searchPlaceholder: 'Search records',
  //       infoEmpty: '<p style="color:red;" > No Data Available !</p> '
  //     },
  //     searchDelay: 800 // pake ini supaya gak bug search
  //   });
  // }

  // btnSelectRowVendor(code: String, description: String, address: String) {
  //   this.model.supplier_code = code;
  //   this.model.supplier_name = description;
  //   this.model.supplier_address = address;
  //   $('#lookupModalVendor').modal('hide');
  // }
  //#endregion Vendor lookup

  //#region Vendor Lookup
  btnLookupVendor() {
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
          // 'URL': 'http://172.31.233.24:8888/v1/VendorX/GetListVendorForLookup', // belum digunakan karena masih not ready
          'URL': this.VendorInvoice,
          'DataObj': 'ListVendorObj'
        }
        dtParameters.paramTamp.push(paramTamps)

        this.dalservice.Getrows(dtParameters, this.APIControllerVendorExt, this.APIRouteForLookupForQuotationExt).subscribe(resp => {
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowVendor(code: String, description: String, address: String, npwp: String) {
    this.model.supplier_code = code;
    this.model.supplier_name = description;
    this.model.supplier_address = address;
    this.model.supplier_npwp = npwp;
    $('#lookupModalVendor').modal('hide');
  }
  //#endregion Vendor lookup

  //#region UomCode Lookup
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
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 5] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowTax(code: String, description: String, ppn_pct: String, pph_pct: String) {
    this.temp_price = (((100 / ((this.model.ppn_pct * 1) - (this.model.pph_pct) + 100)) * (this.model.nett_price * 1)) + (this.model.discount_amount * 1))
    this.model.tax_code = code;
    this.model.tax_name = description;
    this.model.pph_pct = pph_pct;
    this.model.ppn_pct = ppn_pct;
    // this.model.price_amount = 0;
    this.unit_price = this.temp_price;
    this.model.nett_price = (this.unit_price * 1) - (this.discount_amount * 1) + (((this.unit_price * 1) - (this.discount_amount * 1)) * (this.model.ppn_pct * 1 / 100)) - (((this.unit_price * 1) - (this.discount_amount * 1)) * (this.model.pph_pct * 1 / 100));
    // this.model.price_amount = (((100 / ((this.model.ppn_pct * 1)-(this.model.pph_pct) + 100)) * (this.model.nett_price * 1)) + (this.model.discount_amount * 1))
    // this.model.nett_price = 0;
    // this.model.nett_price = (this.model.price_amount * 1) - (this.model.discount_amount * 1) + (((this.model.price_amount * 1) - (this.model.discount_amount * 1)) * (this.model.ppn_pct * 1 / 100)) - (((this.model.price_amount * 1) - (this.model.discount_amount * 1)) * (this.model.pph_pct * 1 / 100));
    // this.model..price_amount = 0;
    // this.model. = (((100 / ((this.model.ppn_pct * 1) + 100)) * (this.nett_price * 1)) + (this.discount_amount * 1))   
    // this.model.nett_price = this.model.nett_price - (this.model.nett_price*this.model.pph_pct/100) + (this.model.nett_price*this.model.ppn_pct/100)
    $('#lookupModalTax').modal('hide');
  }
  //#endregion UomCode lookup

  //#region button Add
  btnAdd(id: string) {
    // param tambahan untuk button Post dynamic
    this.dataRoleTamp = [{
      'p_id': id,
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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForAdd)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.callGetrow();
                $('#quotationwiz').click();
                $('#docwiz').click();
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
  //#endregion button Add

  //#region ddl Unit Stock
  UnitStock(event: any) {
    this.model.unit_available_status = event.target.value;
  }
  //#endregion ddl Unit Stock

  //#region unitprice
  UnitPrice(event: any) {
    this.model.price_amount = this.model.price_amount;
    this.unit_price = event.target.value;
    //this.model.nett_price = (this.unit_price * 1) - (this.discount_amount * 1) + (((this.unit_price * 1) - (this.discount_amount * 1)) * (this.model.ppn_pct * 1 / 100)) - (((this.unit_price * 1) - (this.discount_amount * 1)) * (this.model.pph_pct * 1 / 100));
    this.model.nett_price = Math.round(this.unit_price * 1) - (this.discount_amount * 1) + (((this.unit_price * 1) - (this.discount_amount * 1)) * (this.model.ppn_pct * 1 / 100)) - (((this.unit_price * 1) - (this.discount_amount * 1)) * (this.model.pph_pct * 1 / 100));
  }
  //#endregion unitprice

  //#region Discount
  DiscountAmount(event: any) {
    this.model.discount_amount = this.model.discount_amount;
    this.discount_amount = event.target.value;
    // this.model.nett_price = (this.unit_price * 1) - (this.discount_amount * 1) + (((this.unit_price * 1) - (this.discount_amount * 1)) * (this.model.ppn_pct * 1 / 100)) - (((this.unit_price * 1) - (this.discount_amount * 1)) * (this.model.pph_pct * 1 / 100));
    this.model.nett_price = (this.model.price_amount || this.unit_price * 1) - (this.discount_amount * 1) + (((this.model.price_amount || this.unit_price * 1) - (this.discount_amount * 1)) * (this.model.ppn_pct * 1 / 100)) - (((this.model.price_amount || this.unit_price * 1) - (this.discount_amount * 1)) * (this.model.pph_pct * 1 / 100));
  }
  //#endregion Discount

  //#region NettPrice
  NettPrice(event: any) {
    this.model.nett_price = this.model.nett_price;
    this.nett_price = event.target.value * 1;
    //this.model.price_amount = (((100 / ((this.model.ppn_pct * 1) - (this.model.pph_pct) + 100)) * (this.nett_price * 1)) + (this.discount_amount * 1))
    this.model.price_amount = Math.round((((100 / ((this.model.ppn_pct * 1) - (this.model.pph_pct) + 100)) * (this.nett_price * 1)) + (this.discount_amount * 1)))
  }
  //#endregion NettPrice

  //#region getrow data
  btnMarketingInfo() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_id': this.params
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRowMarketing)
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
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion getrow data
}
