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
  templateUrl: './goodreceiptnotedetail.component.html'
})

export class GoodReceiptNotedetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern: string = this._numberonlyformat;
  public supplierCollectionList: any = [];
  public supplierColDetailList: any = [];
  public isReadOnly: Boolean = false;
  private dataTamp: any = [];
  private dataTampPush: any[];
  public tampHidden: Boolean;
  public isButton: Boolean = false;
  private setStyle: any = [];
  private dataRoleTamp: any = [];
  public lookupPOCode: any = [];
  public lookupvendor: any = [];
  public lookuprequestorcode: any = [];
  private idDetailForReason: any;
  public listdataDetail: any = [];
  public lookupapproval: any = [];

  private APIController: String = 'GoodReceiptNote';
  private APIControllerReceiptNote: String = 'GoodReceiptNoteDetail';
  private APIControllerVendor: String = 'MasterVendor';
  private APIControllerPO: String = 'PurchaseOrder';
  private APIControllerReport: String = 'Report';
  private APIRouteForDownload: String = 'getReport';
  private APIRouteForReturn: String = 'ExecSpForReturn';
  private APIRouteForReject: String = 'ExecSpForReject';
  private APIRouteForProceed: String = 'ExecSpForProceed';
  private APIRouteForPost: String = 'ExecSpForPost';
  private APIRouteForCancel: String = 'ExecSpForCancel';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForLookupPOGRN: String = 'GetRowsForLookupGRN';
  private APIRouteGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForValidate: String = 'ExecSpForValidate'
  private APIRouteForDelete: String = 'Delete';
  private APIControllerApprovalSchedule: String = 'ApprovalSchedule';
  private RoleAccessCode = 'R00021590000000A';

  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAllTable: any;
  private checkedList: any = [];

  // spinner
  showSpinner: Boolean = true;
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
    this.Delimiter(this._elementRef);
    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
      this.loadData();
      // this.showSpinner = false;
    } else {
      this.showSpinner = false;
      this.tampHidden = false;
      this.model.company_code = this.company_code;
      this.model.status = 'HOLD';
    }
  }

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
          const parsedata = this.getrowNgb(parse.data[0]);

          if (parsedata.status !== 'HOLD') {
            this.tampHidden = true;
          } else {
            this.tampHidden = false;
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
          'p_good_receipt_note_code': this.param
        });
        // end param tambahan untuk getrows dynamic

        // tslint:disable-next-line:max-line-length
        this.dalservice.Getrows(dtParameters, this.APIControllerReceiptNote, this.APIRouteGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.supplierColDetailList = parse.data;

          if (parse.data != null) {
            this.supplierColDetailList.numberIndex = dtParameters.start;
          }
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 10] }], // for disabled coloumn
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
  onFormSubmit(goodReceiptNoteForm: NgForm, isValid: boolean) {
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

    // this.supplierCollectionList = goodReceiptNoteForm;
    this.supplierCollectionList = this.JSToNumberFloats(goodReceiptNoteForm);
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
              this.callGetrow();
              $('#GoodReciptNote').click();

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
              this.route.navigate(['/transaction/subgoodreceiptnotelist/goodreceiptnotedetail', parse.code]);
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
    $('#datatablelistreceiptnote').DataTable().ajax.reload();
    this.route.navigate(['/transaction/subgoodreceiptnotelist']);
  }
  //#endregion button back

  //#region button add
  btnAdd() {
    this.route.navigate(['/transaction/subgoodreceiptnotelist/goodreceiptnotedetaildetail', this.param]);
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/transaction/subgoodreceiptnotelist/goodreceiptnotedetaildetail', this.param, codeEdit]);
  }
  //#endregion button edit

  selectAllTable() {
    for (let i = 0; i < this.supplierColDetailList.length; i++) {
      this.supplierColDetailList[i].selected = this.selectedAllTable;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAllTable = this.supplierColDetailList.every(function (item: any) {
      return item.selected === true;
    })
  }

  //#region button Proceed
  btnProceed(code: string, isValid: boolean) {
    // param tambahan untuk button Post dynamic

    this.dataRoleTamp = [{
      'p_code': code,
      'action': 'default'
    }];

    if (!isValid) {
      swal({
        title: 'Warning',
        text: 'Please Fill a Mandatory Field OR Format Is Invalid',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger',
        type: 'warning'
      }).catch(swal.noop)
      return;
    } else {
      this.showSpinner = false;
    }

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForProceed)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.callGetrow();
                this.loadData()
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

  //#region button Reject
  btnReject(code: string) {
    // param tambahan untuk button Post dynamic

    this.dataRoleTamp = [{
      'p_code': code,
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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReject)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.callGetrow();
                this.loadData();
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
  //#endregion button Reject

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
                this.loadData()
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

  //#region button Return
  btnReturn(code: string) {
    // param tambahan untuk button Post dynamic

    this.dataRoleTamp = [{
      'p_code': code,
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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReturn)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.callGetrow();
                this.loadData()
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
  //#endregion button Return

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
                this.callGetrow();
                this.loadData();
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

  //#region PO Lookup
  btnLookupPO() {
    $('#datatableLookupPO').DataTable().clear().destroy();
    $('#datatableLookupPO').DataTable({
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
        this.dalservice.ExecSp(dtParameters, this.APIControllerPO, this.APIRouteForLookupPOGRN).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupPOCode = parse.data;

          if (parse.data != null) {
            this.lookupPOCode.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [7] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowPO(code: String, branch_code: String,
    branch_name: String, division_code: String, division_name: String, department_code: String, department_name: String,
    sub_departmet_code: String, sub_department_name: String, unit_code: String, unit_name: String, to_bank_code: String,
    to_bank_account_no: String, to_bank_account_name: String, payment_by: String, total_amount: String,
    ppn_amount: String, pph_amount: String, deposit_amount: String, currency_code: String, currency_name: String, supplier_code: String, name: String, unit_from: String) {
    this.model.purchase_order_code = code;
    this.model.branch_code = branch_code;
    this.model.branch_name = branch_name;
    this.model.division_code = division_code;
    this.model.division_name = division_name;
    this.model.department_code = department_code;
    this.model.department_name = department_name;
    this.model.sub_department_code = sub_departmet_code;
    this.model.sub_department_name = sub_department_name;
    this.model.unit_code = unit_code;
    this.model.unit_name = unit_name;
    this.model.to_bank_code = to_bank_code;
    this.model.to_bank_account_no = to_bank_account_no;
    this.model.to_bank_account_name = to_bank_account_name;
    this.model.payment_by = payment_by;
    this.model.total_amount = total_amount;
    this.model.ppn = ppn_amount;
    this.model.pph = pph_amount;
    this.model.deposit_amount = deposit_amount;
    this.model.currency_code = currency_code;
    this.model.currency_name = currency_name;
    this.model.supplier_code = supplier_code;
    this.model.supplier_name = name;
    this.model.unit_from = unit_from;
    $('#lookupModalPO').modal('hide');
  }
  //#endregion PO lookup  

  //#region reload
  btnReload() {
    $('#datatablereceiptnote').DataTable().ajax.reload();
  }
  //#endregion reload

  //#region btn print
  btnPrint() {
    this.showSpinner = true;
    this.dataTamp = [{
      'p_code': this.model.code,
    }];
    const dataParam = {
      TableName: 'rpt_good_receipt_note',
      SpName: 'xsp_rpt_good_receipt_note',
      reportparameters: {
        p_user_id: this.userId,
        p_code: this.model.code,

        p_print_option: 'PDF'
      }
    };

    this.dalservice.ReportFile(dataParam, this.APIControllerReport, this.APIRouteForDownload).subscribe(res => {
      this.printRptNonCore(res);
      this.showSpinner = false;
    }, err => {
      this.showSpinner = false;
      const parse = JSON.parse(err);
      this.swalPopUpMsg(parse.data);
    });

  }
  //#endregion tbn print

  btnValidate() {
    // param tambahan untuk update dynamic
    this.dataTamp = [{
        'p_code': this.param
    }];
    // end param tambahan untuk update dynamic
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
            this.dalservice.ExecSp(this.dataTamp, this.APIController, this.APIRouteForValidate)
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
//#endregion btnEditable

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



