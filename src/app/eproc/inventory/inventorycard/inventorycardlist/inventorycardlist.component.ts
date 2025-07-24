import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './inventorycardlist.component.html'
})

export class InventoryCardlistComponent extends BaseComponent implements OnInit {
  // variable
  public listPaymentRequest: any = [];
  public isReadOnly: Boolean = false;
  public lookupbranch: any = [];
  public lookupwarehousecode: any = [];
  public dataRoleTamp: any = [];
  public tampStatusType: String;
  public status: string;

  private APIController: String = 'InventoryCard';
  private APIControllerInvoice: String = 'InvoiceRegistration';
  private APIControllerBranch: String = 'SysBranch';

  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForPaymentSelectionGetRows: String = 'GetRowsPaymentSelection';
  private APIRoutePaymentSelectionForProcess: String = 'ExecSpPaymentSelectionForProcess';
  private APIControllerSysWarehouseCode: String = 'MasterWarehouse';
  private APIRouteForDelete: String = 'Delete';
  private APIRouteForProceed: String = 'ExecSpForProceed';
  private APIRouteLookup: String = 'GetRowsForLookup';
  private RoleAccessCode = 'R00021690000000A'; // role access

  private dataTamp: any = [];

  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAllTable: any;
  private checkedList: any = [];

  // spinner
  showSpinner: Boolean = false;
  // end

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public route: Router,
    private _location: Location,
    private _elementRef: ElementRef) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.compoSide(this._location, this._elementRef, this.route);
    this.loadData();
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
          'p_company_code': this.company_code,
          'p_branch_code': this.model.branch_code,
          'p_warehouse_code': this.model.warehouse_code
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.listPaymentRequest = parse.data;
          if (parse.data != null) {
            this.listPaymentRequest.numberIndex = dtParameters.start;
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
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region button add
  // btnAdd() {
  //   this.route.navigate(['/inventory/substockcardlist/stockcarddetail']);
  // }
  //#endregion button add

  //#region button edit
  // btnEdit(codeEdit: string) {
  //   this.route.navigate(['/inventory/substockcardlist/stockcarddetail', codeEdit]);
  // }
  //#endregion button edit

  //#region button process
  btnProceed() {
    this.checkedList = [];
    for (let i = 0; i < this.listPaymentRequest.length; i++) {
      if (this.listPaymentRequest[i].selected) {
        this.checkedList.push(
          this.listPaymentRequest[i].code,
        );
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
        for (let J = 0; J < this.checkedList.length; J++) {
          const code = this.checkedList[J];
          // param tambahan untuk getrow dynamic
          this.dataRoleTamp = [{
            'p_code': code,
            'action': 'default'
          }];
          // end param tambahan untuk getrow dynamic
          this.dalservice.ExecSp(this.dataRoleTamp, this.APIControllerInvoice, this.APIRoutePaymentSelectionForProcess)
            .subscribe(
              res => {
                this.showSpinner = false;
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  this.showNotification('bottom', 'right', 'success');
                  $('#datatablePaymentSelection').DataTable().ajax.reload();
                } else {
                  this.swalPopUpMsg(parse.data)
                }
              },
              error => {
                const parse = JSON.parse(error);
                this.swalPopUpMsg(parse.data)
              });
        }
      } else {
        this.showSpinner = false;
      }
    });
  }
  //#endregion button process

  //#region checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.listPaymentRequest.length; i++) {
      if (this.listPaymentRequest[i].selected) {
        this.checkedList.push(this.listPaymentRequest[i].code);
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
        for (let J = 0; J < this.checkedList.length; J++) {
          const code = this.checkedList[J];
          // param tambahan untuk getrow dynamic
          this.dataTamp.push({
            'p_code': code
          });
          // end param tambahan untuk getrow dynamic

          this.dalservice.Delete(this.dataTamp, this.APIController, this.APIRouteForDelete)
            .subscribe(
              res => {
                this.showSpinner = false;
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  this.showNotification('bottom', 'right', 'success');
                  $('#datatablePaymentSelection').DataTable().ajax.reload();
                } else {
                  this.swalPopUpMsg(parse.data)
                }
              },
              error => {
                const parse = JSON.parse(error);
                this.swalPopUpMsg(parse.data)
              });
        }
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllTable() {
    for (let i = 0; i < this.listPaymentRequest.length; i++) {
      this.listPaymentRequest[i].selected = this.selectedAllTable;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAllTable = this.listPaymentRequest.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkbox all table

  //#region Branch Lookup
  btnLookupBranch() {
    $('#datatableLookupBranch').DataTable().clear().destroy();
    $('#datatableLookupBranch').DataTable({
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
          'p_user_code': this.userId,
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerBranch, this.APIRouteLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupbranch = parse.data;
          if (parse.data != null) {
            this.lookupbranch.numberIndex = dtParameters.start;
          }
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
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

  btnSelectRowBranch(code: string, description: string) {
    this.model.branch_code = code;
    this.model.branch_name = description;
    $('#lookupModalBranch').modal('hide');
    $('#datatablePaymentSelection').DataTable().ajax.reload();
  }

  btnClearGroup() {
    this.model.branch_code = '';
    this.model.branch_name = '';
    $('#datatablePaymentSelection').DataTable().ajax.reload();
  }
  //#endregion Branch Lookup

  //#region ddl Status
  PageStatusType(event: any) {
    this.tampStatusType = event.target.value;
    $('#datatablePaymentSelection').DataTable().ajax.reload();
  }
  //#endregion ddl Status

  //#region warehouse Lookup
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
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerSysWarehouseCode, this.APIRouteLookup).subscribe(resp => {
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
    $('#datatablePaymentSelection').DataTable().ajax.reload();
  }

  btnClearWarehouseGroup() {
    this.model.warehouse_code = '';
    this.model.warehouse_name = '';
    $('#datatablePaymentSelection').DataTable().ajax.reload();
  }
  //#endregion warehouse lookup

}
