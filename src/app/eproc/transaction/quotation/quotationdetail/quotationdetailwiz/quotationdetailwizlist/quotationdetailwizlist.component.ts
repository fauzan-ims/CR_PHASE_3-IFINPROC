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
  templateUrl: './quotationdetailwizlist.component.html'
})

export class QuotationDetailWizListComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');
  // variable
  public quotationDetailList: any = [];
  public tampHiddenStatus: Boolean;
  private dataTamp: any = [];
  public datatamplist: any = [];
  private dataRoleTamp: any = [];
  private dataTampPush: any = [];
  public lookupAssetDetail: any = [];
  public listdataDetail: any = [];
  public listdataCurrency: any = [];
  public listdataSupplier: any = [];
  public lookupcurrencycode: any = [];
  public lookupvendor: any = [];
  private idDetailForReason: any;
  private idCurrencyForReason: any;
  private idSupplierForReason: any;

  private APIController: String = 'QuotationDetail';
  private APIControllerHeader: String = 'Quotation';
  private APIRouteForUpdateItem: String = 'ExecSpForUpdateItem';
  private APIControllerVendor: String = 'MasterVendor';
  private APIControllerSysCurrencyCode: String = 'SysCurrency';
  private APIControllerMasterModel: String = 'MasterModelDetail';
  private APIControllerDetail: String = 'MaintenanceDetail';

  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForUpdateSupplier: String = 'UpdateForSupplier';
  private APIRouteForUpdateCurrency: String = 'UpdateForCurrency';
  private APIRouteForGetDelete: String = 'Delete';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';
  private RoleAccessCode = 'R00021560000000A';

  // checklist
  public selectedAll: any;
  private checkedList: any = [];

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
    this.compoSide('', this._elementRef, this.route);
    this.loadData();
    this.callGetrowHeader();
  }

  //#region load all data
  loadData() {
    this.dtOptions = {
      'pagingType': 'first_last_numbers',
      'pageLength': 10,
      'processing': true,
      'serverSide': true,
      responsive: true,
      lengthChange: false, // hide lengthmenu
      searching: true, // jika ingin hilangin search box nya maka false
      ajax: (dtParameters: any, callback) => {
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_quotation_code': this.param,
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.quotationDetailList = parse.data;

          if (parse.data != null) {
            this.quotationDetailList.numberIndex = dtParameters.start;
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 9] }], // for disabled coloumn
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
    this.route.navigate(['/transaction/subquotationlist/quotationdetail/' + this.param + '/quotationdetailwizdetail', this.param], { skipLocationChange: true });
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/transaction/subquotationlist/quotationdetail/' + this.param + '/quotationdetailwizdetail', this.param, codeEdit], { skipLocationChange: true });
  }
  //#endregion button edit

  //#region button delete
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.quotationDetailList.length; i++) {
      if (this.quotationDetailList[i].selected) {
        this.checkedList.push(this.quotationDetailList[i].id);
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

        for (let J = 0; J < this.checkedList.length; J++) {
          // param tambahan untuk getrow dynamic
          this.dataTampPush = [{
            'p_id': this.checkedList[J]
          }];
          // end param tambahan untuk getrow dynamic
          this.dalservice.Delete(this.dataTampPush, this.APIController, this.APIRouteForGetDelete)
            .subscribe(
              res => {
                this.showSpinner = false;
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  this.showNotification('bottom', 'right', 'success');
                  $('#datatables').DataTable().ajax.reload();
                } else {
                  this.showSpinner = false;
                  this.swalPopUpMsg(parse.data)
                }
              },
              error => {
                this.showSpinner = false;
                const parse = JSON.parse(error);
                this.swalPopUpMsg(parse.data);
              });
        }
      } else {
        this.showSpinner = false;
      }
    });
  }

  //#region selectAll
  selectAll() {
    for (let i = 0; i < this.quotationDetailList.length; i++) {
      this.quotationDetailList[i].selected = this.selectedAll;
    }
  }
  //#endregion selectAll

  //#region  checkIfAllTableSelected
  checkIfAllTableSelected() {
    this.selectedAll = this.quotationDetailList.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkIfAllTableSelected
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

  //#region Vendor Lookup
  btnLookupVendor(id: any) {
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
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_company_code': this.company_code,
        });
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
          })
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

    this.idDetailForReason = id;

  }

  btnSelectRowVendor(code: String) {

    this.listdataDetail = [];

    var i = 0;

    var getID = $('[name="p_id_doc"]')
      .map(function () { return $(this).val(); }).get();

    while (i < getID.length) {

      if (getID[i] == this.idDetailForReason) {

        this.listdataDetail.push({
          p_id: getID[i],
          p_quotation_code: this.param,
          p_supplier_code: code
        });
      }
      i++;
    }

    //#region web service
    this.dalservice.Update(this.listdataDetail, this.APIController, this.APIRouteForUpdateSupplier)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            $('#datatables').DataTable().ajax.reload();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
    //#endregion web service
    $('#lookupModalVendor').modal('hide');
  }
  //#endregion Vendor Lookup

  //#region Asset Detail Lookup
  btnLookupAssetDetail(id: any) {
    $('#datatableLookupAssetDetail').DataTable().clear().destroy();
    $('#datatableLookupAssetDetail').DataTable({
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
          'default': '',
        });
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerMasterModel, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupAssetDetail = parse.data;
          if (parse.data != null) {
            this.lookupAssetDetail.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          })
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 3] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });

    this.idDetailForReason = id;

  }
  btnSelectRowAssetDetail(service_code: String, description: String) {

    this.listdataDetail = [];

    var i = 0;

    var getID = $('[name="p_id_doc"]')
      .map(function () { return $(this).val(); }).get();

    while (i < getID.length) {

      if (getID[i] == this.idDetailForReason) {

        this.listdataDetail.push({
          p_id: getID[i],
          p_asset_code: service_code
        });
      }

      i++;
    }
    //#region web service
    this.dalservice.Update(this.listdataDetail, this.APIControllerDetail, this.APIRouteForUpdate)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            $('#datatableDocument').DataTable().ajax.reload();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
    //#endregion web service
    $('#lookupModalAssetDetail').modal('hide');
  }
  //#endregion Asset Detail Lookup

  //#region Currency Lookup
  btnLookupCurrencyCode(id: any) {
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
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_company_code': this.company_code,
        });
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
          })
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

    this.idDetailForReason = id;

  }

  btnSelectRowCurrencyCode(code: String, description: String) {

    this.listdataDetail = [];

    var i = 0;

    var getID = $('[name="p_id_doc"]')
      .map(function () { return $(this).val(); }).get();

    while (i < getID.length) {

      if (getID[i] == this.idDetailForReason) {

        this.listdataDetail.push({
          p_id: getID[i],
          p_quotation_code: this.param,
          p_currency_code: code,
          p_currency_name: description,
        });
      }
      i++;
    }

    //#region web service
    this.dalservice.Update(this.listdataDetail, this.APIController, this.APIRouteForUpdateCurrency)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            $('#datatables').DataTable().ajax.reload();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
    //#endregion web service
    $('#lookupModalCurrencyCode').modal('hide');
  }
  //#endregion Currency Lookup

  //#region onBlur
  onBlur(event, i, type) {
    if (type === 'amount') {
      if (event.target.value.match('[0-9]+(,[0-9]+)')) {
        if (event.target.value.match('(\.\d+)')) {

          event = '' + event.target.value;
          event = event.trim();
          event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        } else {
          event = '' + event.target.value;
          event = event.trim();
          event = parseFloat(event.replace(/,/g, '')).toFixed(2); // ganti jadi 6 kalo mau pct
          event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        }
      } else {
        event = '' + event.target.value;
        event = event.trim();
        event = parseFloat(event).toFixed(2); // ganti jadi 6 kalo mau pct
        event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
      }
    } else {
      event = '' + event.target.value;
      event = event.trim();
      event = parseFloat(event).toFixed(6);
    }

    if (event === 'NaN') {
      event = 0;
      event = parseFloat(event).toFixed(2);
    }

    if (type === 'amount') {
      $('#price_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#price_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onBlur

  //#region onFocus
  onFocus(event, i, type) {
    event = '' + event.target.value;

    if (event != null) {
      event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
    }

    if (type === 'amount') {
      $('#price_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#price_amount' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onFocus

  //#region button save in list
  btnSaveList() {

    this.showSpinner = true;
    this.datatamplist = [];
    let j = 0;

    const getID = $('[name="p_id_doc"]')
      .map(function () { return $(this).val(); }).get();
    const getPriceAmount = $('[name="p_price_amount"]')
      .map(function () { return $(this).val(); }).get();
    const getRemark = $('[name="p_remark_list"]')
      .map(function () { return $(this).val(); }).get();

    while (j < getID.length) {
      while (j < getPriceAmount.length) {
        while (j < getRemark.length) {
          this.datatamplist.push(
            this.JSToNumberFloats({
              p_id: getID[j],
              p_price_amount: getPriceAmount[j],
              p_remark: getRemark[j],
              action: 'default'
            }));
          j++;
        }
        j++;
      }
      j++;
    }

    //#region web service
    this.dalservice.Update(this.datatamplist, this.APIController, this.APIRouteForUpdateItem)
      .subscribe(
        res => {
          this.showSpinner = false;
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            this.showSpinner = false;
            this.showNotification('bottom', 'right', 'success');
            $('#datatableitem').DataTable().ajax.reload();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
    //#endregion web service

  }
  //#endregion button save in list
}
