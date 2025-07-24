import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../base.component';
import { DALService } from '../../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './grnapprovaldetail.component.html'
})

export class GRNApprovaldetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');

  // variable
  public NumberOnlyPattern: string = this._numberonlyformat;
  public listobjectinfolist: any = [];
  public isReadOnly: Boolean = false;
  public listdetail: any = [];
  private setStyle: any = [];
  public goodReceiptNoteDetailData: any = [];
  public lookupitemcode: any = [];
  public lookupuomcode: any = [];
  public lookuplocationcode: any = [];
  public lookupwarehousecode: any = [];
  private dataTamp: any = [];
  public isButton: Boolean = false;
  private dataTampProceed: any = [];
  public lookupPoObjectInfoVHCL: any = [];
  //(+) Ari 2024-01-08
  public lookupTax: any = [];
  private temp_price: any = [];
  public tampUnitFrom: Boolean = false;


  private APIController: String = 'GoodReceiptNoteDetail';
  private APIControllerReceiptNote: String = 'GoodReceiptNote';
  private APIControllerPO: String = 'PurchaseOrder';

  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForGetRows: String = 'GetRowsForGRN';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForLookup: String = 'GetRowsForLookup';

  private RoleAccessCode = '';
  public purchase_order_detail_id: String = '';

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
  // end

 // checklist
 public selectedAll: any;
 private checkedList: any = [];
 private checkedLookup: any = [];
 public selectedAllLookup: any;

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
    this.wizard();
    if (this.params !== null) {
      this.isReadOnly = true;
      // call web service
      this.callGetrow();
      this.loadData();
      this.getStatusHeader();
      // this.grnobjectinfowiz();
      const forTabInfo = setInterval(() => {
        if (this.purchase_order_detail_id != '') {
            clearInterval(forTabInfo);
            $('#datatableObjectInfo').DataTable().ajax.reload();

        }
    }, 200);
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
          const parsedata = parse.data[0];
          this.purchase_order_detail_id = parsedata.purchase_order_detail_id;

          console.log(parsedata)
          console.log(this.purchase_order_detail_id)
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
          console.log('masuk')
          
          dtParameters.paramTamp = [];
          dtParameters.paramTamp.push({
              'p_id': this.params,
              'p_purchase_order_detail_id': this.purchase_order_detail_id
          })
          // end param tambahan untuk getrows dynamic                
          this.dalservice.Getrows(dtParameters, this.APIControllerPO, this.APIRouteForGetRows).subscribe(resp => {
              const parse = JSON.parse(resp);

              // if use checkAll use this
              $('#checkall').prop('checked', false);
              // end checkall

              this.listobjectinfolist = parse.data;

              if (parse.data != null) {
                  this.listobjectinfolist.numberIndex = dtParameters.start;
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 8] }], // for disabled coloumn
      language: {
          search: '_INPUT_',
          searchPlaceholder: 'Search records',
          infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
  }
}
//#endregion load all data
  //#region getStatusHeader
  getStatusHeader() {
    this.dataTamp = [{
      'p_code': this.param
    }];
    this.dalservice.Getrow(this.dataTamp, this.APIControllerReceiptNote, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];
                    
          if (parsedata.unit_from == 'BUY'){
            this.tampUnitFrom = true;           
          }else{
            this.tampUnitFrom = false;
          }

          if (parsedata.status !== 'HOLD') {
            this.isButton = true;
          } else {
            this.isButton = false;
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

  //#region button back
  btnBack() {
    $('#datatablereceiptnote').DataTable().ajax.reload();
    this.route.navigate(['/objectinfogoodreceiptnote/goodreceiptnoteapproval', this.param]);
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


  

  //#region grn list tabs
  // grncheklistwiz() {
  //   this.route.navigate(['/transaction/subgoodreceiptnotelist/goodreceiptnotedetaildetail/' + this.param + '/' + this.params + '/goodreceiptnotedetailchecklist', this.param, this.params], { skipLocationChange: true });
  // }
  // grnobjectinfowiz() {
  //   this.route.navigate(['/transaction/subgoodreceiptnotelist/goodreceiptnotedetaildetail/' + this.param + '/' + this.params + '/goodreceiptnotedetailobjectinfo', this.param, this.params], { skipLocationChange: true });
  // }

  // grndocumentwiz() {
  //   this.route.navigate(['/transaction/subgoodreceiptnotelist/goodreceiptnotedetaildetail/' + this.param + '/' + this.params + '/goodreceiptnotedetaildocument', this.param, this.params], { skipLocationChange: true });
  // }
  //#endregion grn list tabs
}
