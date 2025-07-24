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
  templateUrl: './goodreceiptnotedetaildetail.component.html'
})

export class CoverNoteReceiveDetaildetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');

  // variable
  public NumberOnlyPattern: string = this._numberonlyformat;
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

  private APIController: String = 'GoodReceiptNoteDetail';
  private APIControllerReceiptNote: String = 'GoodReceiptNote';
  private APIControllerBaseItemCode: String = 'MasterItem';
  private APIControllerSysUomCode: String = 'MasterUom';
  private APIControllerSysLocationCode: String = 'MasterLocation';
  private APIControllerSysWarehouseCode: String = 'MasterWarehouse';

  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForLookup: String = 'GetRowsForLookup';

  private RoleAccessCode = 'R00024430000001A';

  // form 2 way binding
  model: any = {};

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
    this.wizard();
    if (this.params !== null) {
      this.isReadOnly = true;
      // call web service
      this.callGetrow();
      this.getStatusHeader();
      this.grnobjectinfowiz();
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
    this.dalservice.Getrow(this.dataTamp, this.APIControllerReceiptNote, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];

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

  //#region  form submit
  onFormSubmit(goodReceiptNoteForm: NgForm, isValid: boolean) {
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

    this.goodReceiptNoteDetailData = this.JSToNumberFloats(goodReceiptNoteForm)

    const usersJson: any[] = Array.of(this.goodReceiptNoteDetailData);
    if (this.param != null && this.params != null) {
      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showNotification('bottom', 'right', 'success');
              this.callGetrow();
              $('#tabobjectinfowiz').click();
            } else {
              this.swalPopUpMsg(parse.data);
            }
          },
          error => {
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data);
            this.showSpinner = false;
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
              this.route.navigate(['/transaction/subgoodreceiptnotelist/goodreceiptnotedetaildetail', this.param, parse.id]);
            } else {
              this.swalPopUpMsg(parse.data);
            }
          },
          error => {
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data);
            this.showSpinner = false;

          });
    }
  }
  //#endregion form submit

  //#region button back
  btnBack() {
    $('#datatablereceiptnote').DataTable().ajax.reload();
    this.route.navigate(['/transaction/subdocumentreceivelist/covernotedetail', this.param]);
  }
  //#endregion button back

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
    this.model.uom_name = description;
    $('#lookupModalUomCode').modal('hide');
  }
  //#endregion UomCode lookup

  //#region LocationCode Lookup
  btnLookupLocationCode() {
    $('#datatableLookupLocationCode').DataTable().clear().destroy();
    $('#datatableLookupLocationCode').DataTable({
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
          'p_branch_code': this.model.branch_code,
          'action': 'getResponse'
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsBam(dtParameters, this.APIControllerSysLocationCode, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookuplocationcode = parse.data;

          if (parse.data != null) {
            this.lookuplocationcode.numberIndex = dtParameters.start;
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

  btnSelectRowLocationCode(code: String, description: String) {
    this.model.location_code = code;
    this.model.location_name = description;
    $('#lookupModalLocationCode').modal('hide');
  }
  //#endregion LocationCode lookup

  //#region Warehouse Lookup
  btnLookupWarehouseCode() {
    $('#datatableLookupWarehouseCode').DataTable().clear().destroy();
    $('#datatableLookupWarehouseCode').DataTable({
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
          'p_branch_code': this.model.branch_code,
          'action': 'getResponse'
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerSysWarehouseCode, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupwarehousecode = parse.data;

          if (parse.data != null) {
            this.lookupwarehousecode.numberIndex = dtParameters.start;
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

  btnSelectRowWarehouseCode(code: String, description: String) {
    this.model.warehouse_code = code;
    this.model.warehouse_name = description;
    $('#lookupModalWarehouseCode').modal('hide');
  }
  //#endregion Warehouse lookup

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
  grncheklistwiz() {
    this.route.navigate(['/transaction/subdocumentreceivelist/covernotedetaildetail/' + this.param + '/' + this.params + '/covernotedetailchecklist', this.param, this.params], { skipLocationChange: true });
  }
  grnobjectinfowiz() {
    this.route.navigate(['/transaction/subdocumentreceivelist/covernotedetaildetail/' + this.param + '/' + this.params + '/covernotedetailobjectinfo', this.param, this.params], { skipLocationChange: true });
  }

  grndocumentwiz() {
    this.route.navigate(['/transaction/subdocumentreceivelist/covernotedetaildetail/' + this.param + '/' + this.params + '/covernotedetaildocument', this.param, this.params], { skipLocationChange: true });
  }
  //#endregion grn list tabs
}
