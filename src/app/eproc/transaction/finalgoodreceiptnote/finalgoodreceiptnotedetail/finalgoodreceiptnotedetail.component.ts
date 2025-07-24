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
  templateUrl: './finalgoodreceiptnotedetail.component.html'
})

export class FinalGoodReceiptNotedetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern: string = this._numberonlyformat;
  public supplierCollectionList: any = [];
  public finalGRNlist: any = [];
  public isReadOnly: Boolean = false;
  private dataTamp: any = [];
  private dataTampPush: any[];
  public tampHidden: Boolean;
  public isButton: Boolean = false;
  private setStyle: any = [];
  private dataRoleTamp: any = [];
  private idDetailForReason: any;
  public listdataDetail: any = [];

  private APIController: String = 'FinalGoodReceiptNote';
  private APIControllerFinalReceiptNote: String = 'FinalGoodReceiptNoteDetail';
  private APIRouteGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForDelete: String = 'Delete';
  private RoleAccessCode = 'R00024020000001A';

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
          'p_final_good_receipt_note_code': this.param
        });
        // end param tambahan untuk getrows dynamic

        // tslint:disable-next-line:max-line-length
        this.dalservice.Getrows(dtParameters, this.APIControllerFinalReceiptNote, this.APIRouteGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.finalGRNlist = parse.data;
          if (parse.data != null) {
            this.finalGRNlist.numberIndex = dtParameters.start;
        }
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0] }], // for disabled coloumn
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

  //#region button back
  btnBack() {
    $('#datatablelistreceiptnote').DataTable().ajax.reload();
    this.route.navigate(['/transaction/subfinalgoodreceiptnote']);
  }
  //#endregion button back

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/transaction/subgoodreceiptnotelist/goodreceiptnotedetaildetail', this.param, codeEdit]);
  }
  //#endregion button edit

  selectAllTable() {
    for (let i = 0; i < this.finalGRNlist.length; i++) {
      this.finalGRNlist[i].selected = this.selectedAllTable;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAllTable = this.finalGRNlist.every(function (item: any) {
      return item.selected === true;
    })
  }

  
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



  btnSelectRowPO(code: String, branch_code: String,
    branch_name: String, division_code: String, division_name: String, department_code: String, department_name: String,
    sub_departmet_code: String, sub_department_name: String, unit_code: String, unit_name: String, to_bank_code: String,
    to_bank_account_no: String, to_bank_account_name: String, payment_by: String, total_amount: String,
    ppn_amount: String, pph_amount: String, deposit_amount: String, currency_code: String, currency_name: String, supplier_code: String, name: String) {
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
    $('#lookupModalPO').modal('hide');
  }
  //#endregion PO lookup  

  //#region reload
  btnReload() {
    $('#datatablereceiptnote').DataTable().ajax.reload();
  }
  //#endregion reload

  
}



