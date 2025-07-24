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
  templateUrl: './procurementdetail.component.html'
})
export class ProcurementdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public CurrencyFormat = this._currencyformat;
  public procurementData: any = [];
  public lookuppurchasetype: any = [];
  public lookupvendor: any = [];
  public lookupWarehouse: any = [];
  public dataRoleTamp: any = [];
  public isReadOnly: Boolean = false;
  public vendorlist: any = [];
  public datavendorlist: any = [];
  public checkedLookup: any = [];
  public selectedAllLookup: any;
  public isDisabled: Boolean;

  public hideWareHouse: Boolean;
  public tampHidden: Boolean;
  public tampStatus: Boolean;
  public purchaseStatus: Boolean;
  public isStatus: Boolean;
  public code: String;
  public tampStatusType: String;
  private dataTamp: any = [];
  public hideVendor: Boolean = false;

  private APIController: String = 'Procurement';
  private APIControllerProcurementVendor: String = 'ProcurementVendor';
  private APIControllerMasterWarehouse: String = 'MasterWarehouse';

  private APIControllerVendor: String = 'MasterVendor';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForGetRowMarketing: String = 'GetRowMarketing';
  private APIRouteForGetRows: String = 'GETROWS';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForDelete: String = 'DELETE';
  private APIRouteForInsert: String = 'INSERT';

  private APIRouteForReturnPost: String = 'ExecSpForPost';
  private APIRouteForReturnUnPost: String = 'ExecSpForUnPost';
  private APIRouteForReturnCancel: String = 'ExecSpForCancel';
  private APIRouteForReturnReturn: String = 'ExecSpForReturn';
  private APIRouteForReturnProceed: String = 'ExecSpForProceed';
  private APIControllerPurchaseType: String = 'SysGeneralSubCode';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForLookupProcurementVendor: String = 'GetRowsForLookupProcurementVendor';
  private APIRouteForLookupMasterWarehouse: String = 'GetRowsForLookup';
  private RoleAccessCode = 'R00021540000000A'; // role access 

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
    this.Delimiter(this._elementRef);
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    if (this.param != null) {
      this.isReadOnly = true;
      this.purchaseStatus = false;
      // call web service
      this.callGetrow();
      // this.model.unit_from = "BUY";
      // this.loadData();
    } else {
      this.model.company_code = this.company_code;
      this.showSpinner = false;
      this.model.new_purchase = 'NO';
      this.model.unit_from = 'BUY';
    }
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
          'p_code': this.param,
        })
        // end param tambahan untuk getrows dynamic

        this.dalservice.Getrows(dtParameters, this.APIControllerProcurementVendor, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.vendorlist = parse.data;

          // for (let i = 0; i < parse.data.length; i++) {
          //   this.vendorlist = parse.data;
          // }

          // if use checkAll use this
          $('#checkall').prop('checked', false);
          // end checkall

          if (parse.data != null) {
            this.vendorlist.numberIndex = dtParameters.start;
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

  //#region getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];
          if (parsedata.new_purchase == '') {
            parsedata.new_purchase = 'YES';
          }

          if (parsedata.status !== 'HOLD') {
            this.tampStatus = true;
          } else {
            this.tampStatus = false;
          }

          if (parsedata.new_purchase != 'NO' && parsedata.status != 'HOLD') {
            this.purchaseStatus = false;
            this.model.quantity_purchase = undefined;
            this.model.quantity_inventory = undefined;
          } else {
            this.purchaseStatus = true;
            this.model.quantity_purchase = undefined;
            this.model.quantity_inventory = undefined;
          }

          if (parsedata.new_purchase === 'YES') {

            if (parsedata.purchase_type_code === 'TNDR') {
              this.hideVendor = false;
              this.purchaseStatus = false;
            }
            else if (parsedata.purchase_type_code === null) {
              this.hideVendor = true;
              this.purchaseStatus = false;
            }
            else {
              this.hideVendor = true;
              this.purchaseStatus = false;
            }
          }
          else {
            this.hideVendor = true;
            this.purchaseStatus = true;
          }

          if (parsedata.status != 'HOLD') {
            this.purchaseStatus = true;
          }

          if (parsedata.reff_no !== null) {
            this.isDisabled = true
          } else {
            this.isDisabled = false
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
  onFormSubmit(procurementForm: NgForm, isValid: boolean) {
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

    this.procurementData = this.JSToNumberFloats(procurementForm);



    if (this.procurementData.p_purchase_type_code !== 'TNDR') {
      this.procurementData.p_budget_amount = 0;
    }

    // if (this.procurementData.p_purchase_type_code == '' || this.procurementData.p_purchase_type_code == null) {
    //   this.procurementData.p_purchase_type_code = undefined;
    // }
    // if (this.procurementData.p_purchase_type_name == '' || this.procurementData.p_purchase_type_name == null) {
    //   this.procurementData.p_purchase_type_name = undefined;
    // }
    if (this.procurementData.p_quantity_purchase == '' || this.procurementData.p_quantity_purchase == null) {
      this.procurementData.p_quantity_purchase = undefined;
    }
    if (this.procurementData.p_quantity_inventory == '' || this.procurementData.p_quantity_inventory == null) {
      this.procurementData.p_quantity_inventory = undefined;
    }
    const usersJson: any[] = Array.of(this.procurementData);

    if (this.param != null) {
      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
        .subscribe(
          res => {
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showSpinner = false;
              this.callGetrow();
              this.showNotification('bottom', 'right', 'success');
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
    }
  }
  //#endregion form submit

  //#region button back
  btnBack() {
    this.route.navigate(['/transaction/subprocurement']);
    $('#datatable').DataTable().ajax.reload();
  }
  //#endregion button back

  //#region ddl PageStatusType
  PageStatusType(event: any, code: String) {
    this.model.new_purchase = event.target.value;

    if (this.model.new_purchase === 'NO' || this.model.purchase_type_code !== 'TNDR' || this.model.purchase_type_code === undefined) {
      this.hideVendor = true;
    } else {
      this.hideVendor = false;
    }

    if (this.model.new_purchase != 'NO') {
      this.purchaseStatus = false;
      // this.model.purchase_type_name = undefined;
      this.model.quantity_purchase = undefined;
      this.model.quantity_inventory = undefined;
    } else {
      this.purchaseStatus = true;
      //  this.model.purchase_type_name = undefined;
      this.model.quantity_purchase = undefined;
      this.model.quantity_inventory = undefined;
    }
  }
  //#endregion ddl PageStatusType

  //#region button Proceed
  btnProceed(code: string) {
    this.dataRoleTamp = [{
      'p_code': code,
      'action': 'default',
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
                $('#tabdetailwiz').click();

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

  //#region button Post
  btnPost(code: string, procurementrequestcode: string) {
    // param tambahan untuk button Post dynamic

    this.dataRoleTamp = [{
      'p_code': code,
      'p_procurement_request_code': procurementrequestcode,
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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReturnPost)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.callGetrow();
                $('#tabdetailwiz').click();
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

  //#region button UnPost
  btnUnPost(code: string, procurementrequestcode: string) {
    // param tambahan untuk button UnPost dynamic

    this.dataRoleTamp = [{
      'p_code': code,
      'p_procurement_request_code': procurementrequestcode,
      'action': 'default'
    }];
    // param tambahan untuk button UnPost dynamic

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReturnUnPost)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.callGetrow();
                $('#tabdetailwiz').click();
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
  //#endregion button UnPost

  //#region button Cancel
  btnCancel(code: string, procurementrequestcode: string) {
    // param tambahan untuk button Cancel dynamic

    this.dataRoleTamp = [{
      'p_code': code,
      'p_procurement_request_code': procurementrequestcode,
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
        this.dalservice.Getrows(dtParameters, this.APIControllerPurchaseType, this.APIRouteForLookup).subscribe(resp => {
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

  btnSelectRowPurchaseType(code: String, description: String, quntity: boolean) {
    this.model.purchase_type_code = code;
    this.model.purchase_type_name = description;
    $('#lookupModalPurchaseType').modal('hide');
  }
  //#endregion PurchaseType lookup

  //#region button Return
  btnReturn(code: string) {
    // param tambahan untuk button Cancel dynamic

    this.dataRoleTamp = [{
      'p_code': code,
      // 'p_procurement_request_code': procurementrequestcode,
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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReturnReturn)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.callGetrow();
                $('#tabdetailwiz').click();
                this.showNotification('bottom', 'right', 'success');
                // window.location.reload();
                // this.route.navigate(['/transaction/subprocurement']);
                $('#datatable').DataTable().ajax.reload();
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
  //#endregion button Return

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
          'p_code': this.param,
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerVendor, this.APIRouteForLookupProcurementVendor).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupvendor = parse.data;

          // if use checkAll use this
          $('#checkallLookup').prop('checked', false);
          // end checkall

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
      // order: [['3', 'asc']],
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }
  //#endregion Vendor Lookup

  //#region btnLookupWarehouse
  btnLookupWarehouse() {
    $('#datatableLookupWarehouse').DataTable().clear().destroy();
    $('#datatableLookupWarehouse').DataTable({
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
          'p_company_code': this.company_code
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerMasterWarehouse, this.APIRouteForLookupMasterWarehouse).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupWarehouse = parse.data;
          if (parse.data != null) {
            this.lookupWarehouse.numberIndex = dtParameters.start;
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

  btnSelectRowWarehouse(code: String, description: string) {
    this.model.warehouse_code = code;
    this.model.warehouse_name = description;
    $('#lookupModalWarehouse').modal('hide');
  }
  //#endregion btnLookupWarehouse

  //#region checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.vendorlist.length; i++) {
      if (this.vendorlist[i].selected) {
        this.checkedList.push(this.vendorlist[i].id);
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
      if (result.value) {
        this.dataTamp = [];
        for (let J = 0; J < this.checkedList.length; J++) {
          const id = this.checkedList[J];
          // param tambahan untuk getrow dynamic
          this.dataTamp = [{
            'p_id': id
          }];
          // end param tambahan untuk getrow dynamic
          this.dalservice.Delete(this.dataTamp, this.APIControllerProcurementVendor, this.APIRouteForDelete)
            .subscribe(
              res => {
                this.showSpinner = false;
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  if (this.checkedList.length == J + 1) {
                    this.showNotification('bottom', 'right', 'success');
                    $('#datatablevendor').DataTable().ajax.reload();
                  }
                } else {
                  this.swalPopUpMsg(parse.data);
                }
              },
              error => {
                const parse = JSON.parse(error);
                this.swalPopUpMsg(parse.data);
              });
        }
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAll() {
    for (let i = 0; i < this.vendorlist.length; i++) {
      this.vendorlist[i].selected = this.selectedAll;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAll = this.vendorlist.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkbox all table

  //#region checkbox all lookup
  btnSelectAllLookup() {
    this.checkedLookup = [];

    for (let i = 0; i < this.lookupvendor.length; i++) {
      if (this.lookupvendor[i].selectedLookup) {
        this.checkedLookup
          .push({
            'code': this.lookupvendor[i].code,
            'name': this.lookupvendor[i].name,
          });
      }
    }

    // jika tidak di checklist
    if (this.checkedLookup.length === 0) {
      swal({
        title: this._listdialogconf,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger'
      }).catch(swal.noop)
      return
    }


    for (let J = 0; J < this.checkedLookup.length; J++) {
      const codeData = this.checkedLookup[J].code;
      const nameData = this.checkedLookup[J].name;

      this.dataTamp = [{
        'p_vendor_code': codeData,
        'p_vendor_name': nameData,
        'p_procurement_code': this.param
      }];
      // end param tambahan untuk getrow dynamic
      this.dalservice.Insert(this.dataTamp, this.APIControllerProcurementVendor, this.APIRouteForInsert)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              if (this.checkedLookup.length == J + 1) {
                this.showNotification('bottom', 'right', 'success');
                $('#datatableLookupVendor').DataTable().ajax.reload();
                $('#datatablevendor').DataTable().ajax.reload();
              }

              // })
            } else {
              this.swalPopUpMsg(parse.data);
            }
          },
          error => {
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data);
          })
    }
  }

  selectAllLookup() {
    for (let i = 0; i < this.lookupvendor.length; i++) {
      this.lookupvendor[i].selectedLookup = this.selectedAllLookup;
    }
  }

  checkIfAllLookupSelected() {
    this.selectedAllLookup = this.lookupvendor.every(function (item: any) {
      return item.selectedLookup === true;
    })

  }
  //#endregion checkbox all table

  //#region getrow data
  btnMarketingInfo() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param
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