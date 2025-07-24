import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';
import { Location } from '@angular/common';
import swal from 'sweetalert2';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './vendorwizlist.component.html'
})

export class VendorwizComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public vendorlist: any = [];
  public checkedLookup: any = [];
  public datavendorlist: any = [];
  public dataTamp: any = [];
  public tampHiddenStatus: Boolean;
  public tempFile: any;
  public id: any;
  public row1: any[];
  public row2: any[];
  public uploadFile: any = [];
  public isDisplay: any = [];
  public image: any[];
  public imageUrl: string;
  public remark: any;
  public selectedAllLookup: any;
  public lookupvendor: any = [];
  private dataTampPush: any = [];
  private dataRoleTamp: any = [];
  private tamps = new Array();
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIController: String = 'ProcurementVendor';
  private APIControllerVendor: String = 'MasterVendor';
  private APIControllerHeader: String = 'Procurement';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForDelete: String = 'DELETE';
  private APIRouteForGetRows: String = 'GetRows';
  
  private RoleAccessCode = 'R00021540000000A';

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  // checklist
  public selectedAll: any;
  private checkedList: any = [];

  // spinner
  showSpinner: Boolean = false;
  // end

  // form 2 way binding
  model: any = {};

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _location: Location,
    private _elementRef: ElementRef
  ) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
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
          'p_code': this.param,
        })
        // end param tambahan untuk getrows dynamic

        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);

          for (let i = 0; i < parse.data.length; i++) {
            // this.previewFileList(parse.data[i].file_name, parse.data[i].path);
            this.vendorlist = parse.data;
          }

          this.vendorlist = parse.data;

          if (parse.data != null) {
            this.vendorlist.numberIndex = dtParameters.start;
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
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

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
          'p_code': this.param,
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
    this.model.purchase_type_code = code;
    this.model.purchase_type_name = description;
    $('#lookupModalVendor').modal('hide');
  }
  //#endregion Vendor lookup

  //#region checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.vendorlist.length; i++) {
      if (this.vendorlist[i].selected) {
        this.checkedList.push(this.vendorlist[i].id);
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
      if (result.value) {
        this.dataTampPush = [];
        for (let J = 0; J < this.checkedList.length; J++) {
          const id = this.checkedList[J];
          // param tambahan untuk getrow dynamic
          this.dataTampPush = [{
            'p_id': id
          }];
          // end param tambahan untuk getrow dynamic
          this.dalservice.Delete(this.dataTampPush, this.APIController, this.APIRouteForDelete)
            .subscribe(
              res => {
                this.showSpinner = false;
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  if (this.checkedList.length == J + 1) {
                    this.showNotification('bottom', 'right', 'success');
                    $('#datatablevendor').DataTable().ajax.reload();
                  }
                } else {
                  this.swalPopUpMsg(parse.data);
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

  selectAll() {
    for (let i = 0; i < this.vendorlist.length; i++) {
      this.vendorlist[i].selected = this.selectedAll;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAll = this.vendorlist.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkbox all table

  //#region checkbox all lookup
  btnSelectAllLookup() {
    this.checkedLookup = [];

    for (let i = 0; i < this.lookupvendor.length; i++) {
      if (this.lookupvendor[i].selectedLookup) {
        this.checkedLookup
          .push({
            'code': this.lookupvendor[i].code,
            'name': this.lookupvendor[i].name,
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
      const codeData = this.checkedLookup[J].code;
      const nameData = this.checkedLookup[J].name;

      this.dataTamp = [{
        'p_vendor_code': codeData,
        'p_vendor_name': nameData,
        'p_procurement_code': this.param
      }];
      // end param tambahan untuk getrow dynamic
      this.dalservice.Insert(this.dataTamp, this.APIController, this.APIRouteForInsert)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              if (this.checkedLookup.length == J + 1) {
                this.showNotification('bottom', 'right', 'success');
                $('#datatableLookupVendor').DataTable().ajax.reload();
                $('#datatablevendor').DataTable().ajax.reload();
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

  //#region getrow data
  callGetrowHeader() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param,
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
}


