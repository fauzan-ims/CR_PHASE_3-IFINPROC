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
  templateUrl: './quotationdetailwizdetail.component.html'
})

export class QuotationDetailWizDetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2'); 

  // variable
  public NumberOnlyPattern: string = this._numberonlyformat;
  public CurrencyFormat = this._currencyformat; 
  public isReadOnly: Boolean = false;
  public lookupasset: any = [];
  public quotationDetailData: any = [];
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
  private tamps = new Array();
  private base64textString: string;
  public tempFile: any;
  public tampdHidden: Boolean;
  public isButton: Boolean = false;
  private APIController: String = 'QuotationDetail';
  private APIControllerQuoReview: String = 'Quotation';
  private APIControllerBaseItemCode: String = 'MasterItem';
  private APIControllerBranch: String = 'SysCompanyUserMainBranch';
  private APIControllerSysUomCode: String = 'MasterUom';
  private APIControllerVendor: String = 'MasterVendor';
  private APIControllerRequestor: String = 'SysCompanyUserMain';
  private APIControllerSysCurrencyCode: String = 'SysCurrency';
  private APIControllerPurchaseType: String = 'SysGeneralSubCode';
  private APIRouteForPriviewFile: String = 'Priview';
  private APIRouteForUploadFile: String = 'Upload';
  private APIRouteForDeleteFile: String = 'Deletefile';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForInsert: String = 'INSERT';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';
  private RoleAccessCode = 'R00021560000000A';

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
    if (this.params != null) {
      this.isReadOnly = true;
      // call web service
      this.callGetrow();
      this.getStatusHeader();
    } else {
      this.showSpinner = false;
    }
  }

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
  onFormSubmit(quotationDetailForm: NgForm, isValid: boolean) {
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
  
      // this.quotationDetailData = quoReviewDetail;
      this.quotationDetailData = quotationDetailForm;
      this.quotationDetailData = this.JSToNumberFloats(quotationDetailForm)
  
      // if (this.quotationDetailData.p_is_active == null) {
      //   this.quotationDetailData.p_is_active = false
      // }
      const usersJson: any[] = Array.of(this.quotationDetailData);
      if (this.param != null && this.params != null) {
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
                this.route.navigate(['/transaction/subquotationlist/quotationdetail/' + this.param + '/quotationdetailwizdetail', this.param]);
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
    this.route.navigate(['/transaction/subquotationlist/quotationdetail/' + this.param + '/quotationdetailwizlist', this.param]);
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
        this.dalservice.ExecSpSys(dtParameters, this.APIControllerBaseItemCode, this.APIRouteForLookup).subscribe(resp => {
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
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysUomCode, this.APIRouteForLookup).subscribe(resp => {
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
    this.model.uom_description_detail = description;
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
        this.dalservice.ExecSp(dtParameters, this.APIControllerRequestor, this.APIRouteForLookup).subscribe(resp => {
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
    this.model.requestor_name_detail = name;
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
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerPurchaseType, this.APIRouteForLookup).subscribe(resp => {
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
        this.dalservice.GetrowsBam(dtParameters, this.APIControllerVendor, this.APIRouteForLookup).subscribe(resp => {
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
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


}
