import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './invoiceregistrationdetailwizlist.component.html'
})

export class InvoiceRegistrationDetailWizListComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');

  // variable
  public invoiceRegisterDetailList: any = [];
  public tampHiddenStatus: Boolean
  public tampHidden: Boolean = false;
  private dataTamp: any = [];
  public status_header: any;
  public lookupreceipt: any = [];
  private checkedLookup: any = [];
  public selectedAllLookup: any = [];
  private dataTampPush: any = [];
  private dataTampProceed: any = [];

  private APIController: String = 'InvoiceRegistrationDetail';
  private APIControllerHeader: String = 'InvoiceRegistration';
  private APIControllerGoodReceipt: String = 'GoodReceiptNote';

  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForLookup: String = 'GetRowsForLookupInvoice';
  private APIRouteForGetDelete: String = 'Delete';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForInsert: String = 'ExecSpForInsert';
  private RoleAccessCode = 'R00021610000000A';

  // checklist
  public selectedAll: any;
  public checkedList: any = [];
  public checkedListAdd: any = [];

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = false;
  // end

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  is_latest: any;

  constructor(private dalservice: DALService,
    private _location: Location,
    public route: Router,
    public getRouteparam: ActivatedRoute,
    private _elementRef: ElementRef) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.Delimiter(this._elementRef);
    this.compoSide('', this._elementRef, this.route);
    this.loadData();
    this.callGetrowHeader();
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
          'p_invoice_register_code': this.param,
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.invoiceRegisterDetailList = parse.data;

          if (parse.data != null) {
            this.invoiceRegisterDetailList.numberIndex = dtParameters.start;
            this.showSpinner = false;
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

  //#region button add
  btnAdd() {
    this.route.navigate(['/accountpayable/subinvoiceregisterlist/invoiceregisterdetail/' + this.param + '/invoiceregisterdetailwizdetail', this.param], { skipLocationChange: true });
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/accountpayable/subinvoiceregisterlist/invoiceregisterdetail/' + this.param + '/invoiceregisterdetailwizdetail', this.param, codeEdit]);
  }
  //#endregion button edit

  //#region button delete
  btnDeleteAll() {
    this.dataTampProceed = [];
    this.checkedList = [];
    for (let i = 0; i < this.invoiceRegisterDetailList.length; i++) {
      if (this.invoiceRegisterDetailList[i].selected) {
        this.checkedList.push({
          'ID': this.invoiceRegisterDetailList[i].id,
        })
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

        let th = this;
        var i = 0;
        (function loopPoProceesProceed() {
          if (i < th.checkedList.length) {
            th.dataTampPush = [{
              'p_id': th.checkedList[i].ID,
              'action': '',
            }];
            th.dalservice.ExecSp(th.dataTampPush, th.APIController, th.APIRouteForGetDelete)
              .subscribe(
                res => {
                  const parse = JSON.parse(res);
                  if (parse.result === 1) {
                    if (th.checkedList.length == i + 1) {
                      th.showNotification('bottom', 'right', 'success');
                      $('#datatablesWizItem').DataTable().ajax.reload();
                      $('#btnInvoiceRegisration').click();
                      th.showSpinner = false;
                    } else {
                      i++;
                      loopPoProceesProceed();
                    }
                  } else {
                    th.swalPopUpMsg(parse.data);
                    th.showSpinner = false;
                  }
                },
                error => {
                  const parse = JSON.parse(error);
                  th.swalPopUpMsg(parse.data);
                  th.showSpinner = false;
                });
          }

        })();

        // for (let J = 0; J < this.checkedList.length; J++) {
        //   // param tambahan untuk getrow dynamic
        //   this.dataTampPush = [{
        //     'p_id': this.checkedList[J]
        //   }];
        //   // end param tambahan untuk getrow dynamic
        //   this.dalservice.Delete(this.dataTampPush, this.APIController, this.APIRouteForGetDelete)
        //     .subscribe(
        //       res => {
        //         this.showSpinner = false;
        //         const parse = JSON.parse(res);
        //         if (parse.result === 1) {
        //           if (this.checkedList.length == J + 1) {
        //             this.showNotification('bottom', 'right', 'success');
        //             $('#datatablesWizItem').DataTable().ajax.reload();
        //             $('#btnInvoiceRegisration').click();
        //           }
        //         } else {
        //           this.showSpinner = false;
        //           this.swalPopUpMsg(parse.data)
        //         }
        //       },
        //       error => {
        //         this.showSpinner = false;
        //         const parse = JSON.parse(error);
        //         this.swalPopUpMsg(parse.data);
        //       });
        // }
      } else {
        this.showSpinner = false;
      }
    });
  }
  //#endregion button delete

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
          this.status_header = parsedata.status

          if (parsedata.status != 'HOLD') {
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
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion getrow data

  //#region btn lookup receipt
  btnLookupReceipt() {
    $('#datatableLookupReceipt').DataTable().clear().destroy();
    $('#datatableLookupReceipt').DataTable({
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
          // 'p_purchase_order_code': this.model.purchase_order_code
          'p_supplier_code': this.model.supplier_code
          , 'p_invoice_register_code': this.param
        })
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerGoodReceipt, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupreceipt = parse.data;

          if (parse.data != null) {
            this.lookupreceipt.numberIndex = dtParameters.start;
          }
          // if use checkAll use this
          $('#checkallLookup').prop('checked', false);
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
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }
  //#endregion btn lookup receipt

  //#region checkbox all lookup
  btnSelectAllLookup() {
    this.dataTampProceed = [];
    this.checkedListAdd = [];
    for (let i = 0; i < this.lookupreceipt.length; i++) {
      if (this.lookupreceipt[i].selectedLookup) {
        this.checkedListAdd.push({
          // 'ID': this.lookupreceipt[i].id,
          'codeData': this.lookupreceipt[i].code,
          'GrnId': this.lookupreceipt[i].grn_id,
          'ObjectID': this.lookupreceipt[i].po_object_id,
        })
      }
    }
    
    // jika tidak di checklist
    if (this.checkedListAdd.length === 0) {
      swal({
        title: this._listdialogconf,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger'
      }).catch(swal.noop)
      return
    }
    this.dataTamp = [];
    // swal({
    //   title: 'Are you sure?',
    //   type: 'warning',
    //   showCancelButton: true,
    //   confirmButtonClass: 'btn btn-success',
    //   cancelButtonClass: 'btn btn-danger',
    //   confirmButtonText: 'Yes',
    //   buttonsStyling: false
    // }).then((result) => {
    this.showSpinner = true;
    // if (result.value) {

    let th = this;
    var i = 0;

    (function loopPoProceesProceed() {
      if (i < th.checkedListAdd.length) {
        th.dataTampProceed = [{
          'p_grn_code': th.checkedListAdd[i].codeData,
          'p_invoice_register_code': th.param,
          'p_grn_detail_id': th.checkedListAdd[i].GrnId,
          'p_po_object_info_id': th.checkedListAdd[i].ObjectID,
          'action': ''
        }];
        th.dalservice.ExecSp(th.dataTampProceed, th.APIController, th.APIRouteForInsert)
          .subscribe(
            res => {
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                if (th.checkedListAdd.length == i + 1) {
                  th.callGetrowHeader()
                  $('#datatableLookupReceipt').DataTable().ajax.reload();
                  $('#datatablesWizItem').DataTable().ajax.reload();
                  $('#btnInvoiceRegisration').click();
                  th.showNotification('bottom', 'right', 'success');
                  th.showSpinner = false;
                } else {
                  i++;
                  loopPoProceesProceed();
                }
              } else {
                th.swalPopUpMsg(parse.data);
                th.showSpinner = false;
              }
            },
            error => {
              const parse = JSON.parse(error);
              th.swalPopUpMsg(parse.data);
              th.showSpinner = false;
            });
      }
    })();
    // } else {
    //   this.showSpinner = false;
    // }
    // }
    // );
  }
  //#endregion btn reject

  // btnSelectAllLookup() {
  //   this.checkedLookup = [];
  //   for (let i = 0; i < this.lookupreceipt.length; i++) {
  //     if (this.lookupreceipt[i].selectedLookup) {
  //       // this.checkedLookup.push(this.lookupreceipt[i].code);
  //       this.checkedLookup.push({
  //         codeData: this.lookupreceipt[i].code,
  //         GrnId: this.lookupreceipt[i].grn_id,
  //       });
  //     }
  //   }

  //   // jika tidak di checklist
  //   if (this.checkedLookup.length === 0) {
  //     swal({
  //       title: this._listdialogconf,
  //       buttonsStyling: false,
  //       confirmButtonClass: 'btn btn-danger'
  //     }).catch(swal.noop)
  //     return
  //   }

  //   this.showSpinner = true;
  //   // if (result.value) {
  //   for (let J = 0; J < this.checkedLookup.length; J++) {
  //     const codeData = this.checkedLookup[J];
  //     this.dataTamp = [{
  //       'p_grn_code': this.checkedLookup[J].codeData,
  //       'p_invoice_register_code': this.param,
  //       'p_id': this.checkedLookup[J].GrnId,
  //     }];
  //     // end param tambahan untuk getrow dynamic
  //     this.dalservice.ExecSp(this.dataTamp, this.APIController, this.APIRouteForInsert)
  //       .subscribe(
  //         res => {
  //           this.showSpinner = false;
  //           const parse = JSON.parse(res);

  //           if (parse.result === 1) {
  //             if (this.checkedLookup.length == J + 1) {
  //               this.callGetrowHeader()
  //               $('#datatableLookupReceipt').DataTable().ajax.reload();
  //               $('#datatablesWizItem').DataTable().ajax.reload();
  //               $('#btnInvoiceRegisration').click();
  //               this.showNotification('bottom', 'right', 'success');
  //             }
  //           } else {
  //             this.swalPopUpMsg(parse.data);
  //           }
  //         },
  //         error => {
  //           const parse = JSON.parse(error);
  //           this.swalPopUpMsg(parse.data);
  //         })
  //   }
  // }

  selectAllLookup() {
    for (let i = 0; i < this.lookupreceipt.length; i++) {
      this.lookupreceipt[i].selectedLookup = this.selectedAllLookup;
    }
  }

  checkIfAllLookupSelected() {
    this.selectedAllLookup = this.lookupreceipt.every(function (item: any) {
      return item.selectedLookup === true;
    })
  }
  //#endregion checkbox all table

  //#region selectAll
  selectAll() {
    for (let i = 0; i < this.invoiceRegisterDetailList.length; i++) {
      this.invoiceRegisterDetailList[i].selected = this.selectedAll;
    }
  }
  //#endregion selectAll

  //#region  checkIfAllTableSelected
  checkIfAllTableSelected() {
    this.selectedAll = this.invoiceRegisterDetailList.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkIfAllTableSelected
}
