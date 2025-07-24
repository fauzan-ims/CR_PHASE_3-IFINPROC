import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { BaseComponent } from '../../../../../../base.component';
import { DataTableDirective } from 'angular-datatables';
import { DALService } from '../../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './parametertransactiondetaildetail.component.html'
})

export class ParametertransactiondetaildetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');

  // variable
  public NumberOnlyPattern: string = this._numberonlyformat;
  public isReadOnly: Boolean = false;
  public lookupTransaction: any = [];
  public bysystem: any = [];
  public lookupGlLink: any = [];
  public lookupDiscountGlLink: any = [];
  public lookupPsakGlLink: any = [];
  public parametertransactionData: any = [];
  private dataTamp: any = [];

  private APIController: String = 'MasterTransactionParameter';
  private APIControllerMasterTransaction: String = 'MasterTransaction';
  private APIControllerJournalGlLink: String = 'JournalGlLink';

  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForLookupMasterTransaction: String = 'GetRowsLookupForTransactionParameter';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private RoleAccessCode = 'R00021830000000A'; // role access 

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
  // end

  //ini buat datatables
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

    if (this.params !== null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
    } else {
      this.model.is_calculate_by_system = true;
      this.model.debet_or_credit = 'DEBIT';
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

          // checkbox
          if (parsedata.is_calculate_by_system === '1') {
            parsedata.is_calculate_by_system = true;
          } else {
            parsedata.is_calculate_by_system = false;
          }

          if (parsedata.is_transaction === '1') {
            parsedata.is_transaction = true;
          } else {
            parsedata.is_transaction = false;
          }

          if (parsedata.is_amount_editable === '1') {
            parsedata.is_amount_editable = true;
          } else {
            parsedata.is_amount_editable = false;
          }

          if (parsedata.is_discount_editable === '1') {
            parsedata.is_discount_editable = true;
          } else {
            parsedata.is_discount_editable = false;
          }

          if (parsedata.is_journal === '1') {
            parsedata.is_journal = true;
          } else {
            parsedata.is_journal = false;
          }

          if (parsedata.is_discount_jurnal === '1') {
            parsedata.is_discount_jurnal = true;
          } else {
            parsedata.is_discount_jurnal = false;
          }

          if (parsedata.is_reduce_transaction === '1') {
            parsedata.is_reduce_transaction = true;
          } else {
            parsedata.is_reduce_transaction = false;
          }

          if (parsedata.is_fee_refinancing === '1') {
            parsedata.is_fee_refinancing = true;
          } else {
            parsedata.is_fee_refinancing = false;
          }

          if (parsedata.is_psak === '1') {
            parsedata.is_psak = true;
          } else {
            parsedata.is_psak = false;
          }
          // end checkbox

          // mapper dbtoui
          Object.assign(this.model, parsedata);
          // end mapper dbtoui

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API)' + error);
        });
  }
  //#endregion getrow data

  //#region ddl master module
  BySystem(event) {
    this.model.is_calculate_by_system = event.target.checked;

    if (this.model.is_calculate_by_system === true) {
      this.model.parameter_amount = 0;
    } else {
      $('#isAmountEditable').prop('checked', true);
    }
  }
  //#endregion ddl master module

  //#region  form submit
  onFormSubmit(parametertransactionForm: NgForm, isValid: boolean) {
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

    this.parametertransactionData = parametertransactionForm;

    if (this.parametertransactionData.p_is_calculate_by_system == null) {
      this.parametertransactionData.p_is_calculate_by_system = false
    }

    if (this.parametertransactionData.p_is_transaction == null) {
      this.parametertransactionData.p_is_transaction = false
    }

    if (this.parametertransactionData.p_is_discount_editable == null) {
      this.parametertransactionData.p_is_discount_editable = false
    }

    if (this.parametertransactionData.p_is_journal == null) {
      this.parametertransactionData.p_is_journal = false
    }

    if (this.parametertransactionData.p_is_discount_jurnal == null) {
      this.parametertransactionData.p_is_discount_jurnal = false
    }

    if (this.parametertransactionData.p_is_reduce_transaction == null) {
      this.parametertransactionData.p_is_reduce_transaction = false
    }

    if (this.parametertransactionData.p_is_fee_refinancing == null) {
      this.parametertransactionData.p_is_fee_refinancing = false
    }

    if (this.parametertransactionData.p_is_psak == null) {
      this.parametertransactionData.p_is_psak = false
    }
    this.model.p_company_code = this.company_code;
    this.parametertransactionData = this.JSToNumberFloats(parametertransactionForm);
    const usersJson: any[] = Array.of(this.parametertransactionData);

    if (this.params != null) {
      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showNotification('bottom', 'right', 'success')
              this.callGetrow();
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
              this.route.navigate(['/systemsetting/parametertransactionlist/parametertransactiondetaildetail', this.param, parse.id]);
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
    $('#datatables').DataTable().ajax.reload();
    this.route.navigate(['/systemsetting/parametertransactionlist/parametertransactiondetail', this.param]);
  }
  //#endregion button back

  //#region btnLookupTransaction
  btnLookupTransaction() {
    $('#datatableLookupTransaction').DataTable().clear().destroy();
    $('#datatableLookupTransaction').DataTable({
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
          'p_process_code': this.param
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerMasterTransaction, this.APIRouteForLookupMasterTransaction).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupTransaction = parse.data;
          if (parse.data != null) {
            this.lookupTransaction.numberIndex = dtParameters.start;
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

  btnSelectRowTransaction(code: String, transaction_name: string) {
    this.model.transaction_code = code;
    this.model.transaction_name = transaction_name;
    $('#lookupModalTransaction').modal('hide');
  }
  //#endregion process name lookup

  //#region gl link lookup
  btnLookupGlLink() {
    $('#datatableLookupGlLink').DataTable().clear().destroy();
    $('#datatableLookupGlLink').DataTable({
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
          //'p_general_code': 'LMPRO'
          'p_company_code': this.company_code
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerJournalGlLink, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupGlLink = parse.data;
          if (parse.data != null) {
            this.lookupGlLink.numberIndex = dtParameters.start;
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

  btnSelectRowGlLink(code: String, description: string) {
    this.model.gl_link_code = code;
    this.model.gl_link_name = description;
    $('#lookupModalGlLink').modal('hide');
  }
  //#endregion gl link lookup

  //#region btnLookupDiscountGlLink
  btnLookupDiscountGlLink() {
    $('#datatableLookupDiscountGlLink').DataTable().clear().destroy();
    $('#datatableLookupDiscountGlLink').DataTable({
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
          //'p_general_code': 'LMPRO'
          'p_company_code': this.company_code
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerJournalGlLink, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupDiscountGlLink = parse.data;
          if (parse.data != null) {
            this.lookupDiscountGlLink.numberIndex = dtParameters.start;
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

  btnSelectRowDiscountGlLink(code: String, description: string) {
    this.model.discount_gl_link_code = code;
    this.model.discount_gl_link_name = description;
    $('#lookupModalDiscountGlLink').modal('hide');
  }
  //#endregion discount gl link lookup

  //#region btnLookupPsakGlLink
  btnLookupPsakGlLink() {
    $('#datatableLookupPsakGlLink').DataTable().clear().destroy();
    $('#datatableLookupPsakGlLink').DataTable({
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
          //'p_general_code': 'LMPRO'
          'p_company_code': this.company_code
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerJournalGlLink, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupPsakGlLink = parse.data;
          if (parse.data != null) {
            this.lookupPsakGlLink.numberIndex = dtParameters.start;
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

  btnSelectRowPsakGlLink(code: String, description: string) {
    this.model.psak_gl_link_code = code;
    this.model.psak_gl_link_name = description;
    $('#lookupModalPsakGlLink').modal('hide');
  }
  //#endregion psak gl link lookup
}
