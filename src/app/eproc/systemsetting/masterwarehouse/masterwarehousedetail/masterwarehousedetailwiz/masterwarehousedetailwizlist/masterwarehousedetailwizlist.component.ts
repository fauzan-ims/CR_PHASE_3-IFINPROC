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
  templateUrl: './masterwarehousedetailwizlist.component.html'
})

export class MasterWarehousedetailwizlistComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');
  // variable
  public listrequestitem: any = [];
  public tampHiddenStatus: Boolean;
  private dataTamp: any = [];
  public checkedLookup: any = [];
  public selectedAllLookup: any;
  public lookupitemcode: any = [];
  public datatamplist: any = [];
  public lookupvendor: any = [];
  private dataTampPush: any = [];
  private masterWarehouseDetailAllData: any = [];

  private APIController: String = 'MasterWarehouseDetail';
  private APIControllerHeader: String = 'MasterWarehouse';
  private APIControllerBaseItemCode: String = 'MasterItem';

  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForGetDelete: String = 'Delete';
  private APIRouteForLookup: String = 'GetRowsForLookupMasterWarehouse';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForGetAllData: String = 'ExecSpForGetAllData';

  private RoleAccessCode = 'R00021320000000A';

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
    this.getAllData();
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
          'p_warehouse_code': this.param,
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.listrequestitem = parse.data;

          if (parse.data != null) {
            this.listrequestitem.numberIndex = dtParameters.start;
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
    }
  }
  //#endregion load all data

  //#region button add
  btnAdd() {
    this.route.navigate(['/systemsetting/submasterwarehouselist/masterwarehousedetail/' + this.param + '/masterwarehousedetailwizdetail', this.param], { skipLocationChange: true });
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/systemsetting/submasterwarehouselist/masterwarehousedetail/' + this.param + '/masterwarehousedetailwizdetail', this.param, codeEdit], { skipLocationChange: true });
  }
  //#endregion button edit

  //#region Delet and checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.listrequestitem.length; i++) {
      if (this.listrequestitem[i].selected) {
        this.checkedList.push(this.listrequestitem[i].id);
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

    this.dataTampPush = [];
    swal({
      allowOutsideClick: false,
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'Yes',
      buttonsStyling: false
    }).then((result) => {
      this.showSpinner = true;
      if (result.value) {
        for (let J = 0; J < this.checkedList.length; J++) {
          
          this.dataTampPush.push({
            'p_id': this.checkedList[J]
          });
          
          this.dalservice.Delete(this.dataTampPush, this.APIController, this.APIRouteForGetDelete)
            .subscribe(
              res => {
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  $('#clientDetail', parent.document).click();
                  this.showNotification('top', 'right', 'success');
                  $('#datatableitem').DataTable().ajax.reload();
                  this.showSpinner = false;
                } else {
                  this.swalPopUpMsg(parse.data);
                  this.showSpinner = false;
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

  selectAllTable() {
    for (let i = 0; i < this.listrequestitem.length; i++) {
      this.listrequestitem[i].selected = this.selectedAll;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAll = this.listrequestitem.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion Delet and checkbox all table

    //#region Delet and checkbox all table
    // btnDeleteAll() {
    //   this.checkedList = [];
    //   for (let i = 0; i < this.listrequestitem.length; i++) {
    //     if (this.listrequestitem[i].selected) {
    //       this.checkedList.push(this.listrequestitem[i].id);
    //     }
    //   }
  
    //   // jika tidak di checklist
    //   if (this.checkedList.length === 0) {
    //     swal({
    //       title: this._listdialogconf,
    //       buttonsStyling: false,
    //       confirmButtonClass: 'btn btn-danger'
    //     }).catch(swal.noop)
    //     return
    //   }
  
    //   this.dataTampPush = [];
    //   swal({
    //     allowOutsideClick: false,
    //     title: 'Are you sure?',
    //     type: 'warning',
    //     showCancelButton: true,
    //     confirmButtonClass: 'btn btn-success',
    //     cancelButtonClass: 'btn btn-danger',
    //     confirmButtonText: 'Yes',
    //     buttonsStyling: false
    //   }).then((result) => {
    //     this.showSpinner = true;
    //     if (result.value) {
    //       for (let J = 0; J < this.checkedList.length; J++) {
            
    //         this.dataTampPush.push({
    //           'p_id': this.checkedList[J]
    //         });
            
    //         this.dalservice.Delete(this.dataTampPush, this.APIController, this.APIRouteForGetDelete)
    //           .subscribe(
    //             res => {
    //               const parse = JSON.parse(res);
    //               if (parse.result === 1) {
    //                 $('#clientDetail', parent.document).click();
    //                 this.showNotification('top', 'right', 'success');
    //                 $('#datatableitem').DataTable().ajax.reload();
    //                 this.showSpinner = false;
    //               } else {
    //                 this.swalPopUpMsg(parse.data);
    //                 this.showSpinner = false;
    //               }
    //             },
    //             error => {
    //               const parse = JSON.parse(error);
    //               this.swalPopUpMsg(parse.data);
    //             });
    //       }
    //     } else {
    //       this.showSpinner = false;
    //     }
    //   });
    // }
  
    // selectAllTable() {
    //   for (let i = 0; i < this.listrequestitem.length; i++) {
    //     this.listrequestitem[i].selected = this.selectedAll;
    //   }
    // }
  
    // checkIfAllTableSelected() {
    //   this.selectedAll = this.listrequestitem.every(function (item: any) {
    //     return item.selected === true;
    //   })
    // }
    //#endregion Delet and checkbox all table

  //#region getrow data
  callGetrowHeader() {
    
    this.dataTamp = [{
      'p_code': this.param,
      'p_company_code': this.company_code
    }];
    
    this.dalservice.Getrow(this.dataTamp, this.APIControllerHeader, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);

          if (parsedata.status != 'NEW') {
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

  //#region getAllData
  getAllData() {
    
    this.dataTamp = [{
      'p_warehouse_code': this.param,
      'action': 'getResponse'
    }];
  
    this.dalservice.ExecSp(this.dataTamp, this.APIController, this.APIRouteForGetAllData)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          this.masterWarehouseDetailAllData = parse.data
          $('#datatableLookupItemCode').DataTable().ajax.reload();
          this.showSpinner = false;
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion getAllData

  //#region Vendor Lookup
  btnLookupItem() {
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
          'p_array_data': JSON.stringify(this.masterWarehouseDetailAllData),
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsBam(dtParameters, this.APIControllerBaseItemCode, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupvendor = parse.data;

          if (parse.data != null) {
            this.lookupvendor.numberIndex = dtParameters.start;
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

  //#endregion Vendor lookup

  //#region checkbox all lookup
  btnSelectAllLookup() {
    this.checkedLookup = [];

    for (let i = 0; i < this.lookupvendor.length; i++) {
      if (this.lookupvendor[i].selectedLookup) {
        this.checkedLookup
          .push({
            'item_code': this.lookupvendor[i].code,
            'item_name': this.lookupvendor[i].description,
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
      const codeData = this.checkedLookup[J].item_code;
      const nameData = this.checkedLookup[J].item_name;

      this.dataTamp = [{
        'p_item_code': codeData,
        'p_item_name': nameData,
        'p_warehouse_code': this.param,
        'p_minimum_quantity_detail': 0,
        'p_maximum_quantity_detail': 0
      }];
      
      this.dalservice.Insert(this.dataTamp, this.APIController, this.APIRouteForInsert)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              if (this.checkedLookup.length == J + 1) {
                this.showNotification('bottom', 'right', 'success');
                this.getAllData();
                $('#datatableitem').DataTable().ajax.reload();
                $('#datatableLookupItemCode').DataTable().ajax.reload();
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

  //#region button save in list
  btnSaveList() {

    this.showSpinner = true;
    this.datatamplist = [];
    let j = 0;

    const getID = $('[name="p_id_doc"]')
      .map(function () { return $(this).val(); }).get();

    const getMaxQty = $('[name="p_maximum_quantity_detail"]')
      .map(function () { return $(this).val(); }).get();
    const getMinQty = $('[name="p_minimum_quantity_detail"]')
      .map(function () { return $(this).val(); }).get();
    const getReorQty = $('[name="p_reorder_quantity"]')
      .map(function () { return $(this).val(); }).get();
    const getItemCode = $('[name="p_item_code"]')
      .map(function () { return $(this).val(); }).get();
    const getItemName = $('[name="p_item_name"]')
      .map(function () { return $(this).val(); }).get();
    while (j < getID.length) {

      if (getMaxQty[j] == null) {
        swal({
          title: 'Warning',
          text: 'Please Fill Maximum Quantity first',
          buttonsStyling: false,
          confirmButtonClass: 'btn btn-danger',
          type: 'warning'
        }).catch(swal.noop)
        return;
      }

      if (getMinQty[j] == null) {
        swal({
          title: 'Warning',
          text: 'Please Fill Minimum Quantity first',
          buttonsStyling: false,
          confirmButtonClass: 'btn btn-danger',
          type: 'warning'
        }).catch(swal.noop)
        return;
      }

      this.datatamplist.push(
        this.JSToNumberFloats({
          p_item_code: getItemCode[j],
          p_item_name: getItemName[j],
          p_warehouse_code: this.param,
          p_minimum_quantity_detail: getMinQty[j],
          p_maximum_quantity_detail: getMaxQty[j],
          p_reorder_quantity: getReorQty[j],
          p_id: getID[j],
          action: 'default'
        }));


      j++;
    }

    //#region web service
    this.dalservice.Update(this.datatamplist, this.APIController, this.APIRouteForUpdate)
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

  //#region onBlur
  onBlurMin(event, i, type) {
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
      $('#minimum_quantity_detail' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#minimum_quantity_detail' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onBlur

  //#region onFocus
  onFocusMin(event, i, type) {
    event = '' + event.target.value;

    if (event != null) {
      event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
    }

    if (type === 'amount') {
      $('#minimum_quantity_detail' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#minimum_quantity_detail' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onFocus

  //#region onBlur
  onBlurMax(event, i, type) {
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
      $('#maximum_quantity_detail' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#maximum_quantity_detail' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onBlur

  //#region onFocus
  onFocusMax(event, i, type) {
    event = '' + event.target.value;

    if (event != null) {
      event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
    }

    if (type === 'amount') {
      $('#maximum_quantity_detail' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#maximum_quantity_detail' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onFocus

  //#region onBlur
  onBlurReor(event, i, type) {
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
      $('#reorder_quantity' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#reorder_quantity' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onBlur

  //#region onFocus
  onFocusReor(event, i, type) {
    event = '' + event.target.value;

    if (event != null) {
      event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
    }

    if (type === 'amount') {
      $('#reorder_quantity' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#reorder_quantity' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onFocus
}
