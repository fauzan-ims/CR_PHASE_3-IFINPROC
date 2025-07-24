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
  templateUrl: './goodreceiptnoteapproval.component.html'
})

export class GoodReceiptNoteApprovalComponent extends BaseComponent implements OnInit {
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 9] }], // for disabled coloumn
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
    // this.route.navigate(['/objectinfogoodreceiptnote/GRNApprovaldetail', this.param, codeEdit]);
    this.route.navigate(['/objectinfogoodreceiptnote/goodreceiptnoteapproval', this.param, codeEdit]);

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



