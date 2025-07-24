import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-root',
  templateUrl: './masteritemgroupdetail.component.html'
})
export class MasteritemgroupdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public masteritemgroupData: any = [];
  public listdimension: any = [];
  public lookupparentcode: any = [];
  public isReadOnly: Boolean = false;
  public lookupapproval: any = [];
  public approval_category_name: String;
  public idIndex: any;
  public isStatus: Boolean;
  public lookupSysDimension: any = [];
  public code: String;
  private dataTamp: any = [];
  public lookuptransactiontype: any = [];
  private dataRoleTamp: any = [];
  private listitemgroupgl: any = [];
  public checkedList: any = [];
  public lookupGlLink: any = [];

  //controller
  private APIController: String = 'MasterItemGroup';
  private APIControllerSysTransactionType: String = 'SysGeneralSubCode';
  private APIControllerMasterItemGroupGl: String = 'MasterItemGroupGl';
  private APIControllerJournalGlLink: String = 'JournalGlLink';

  //routing
  private APIRouteForUpdateSatus: String = 'ExecSpForUpdateStatus';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForGetRows: String = 'GETROWS';
  private APIRouteForDelete: String = 'Delete';


  private RoleAccessCode = 'R00022700000001A'; // role access 

  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAll: any;
  public selectedAllTable: any;

  // spinner
  showSpinner: Boolean = true;
  // end

  // datatable
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _elementRef: ElementRef,
    private parserFormatter: NgbDateParserFormatter
  ) { super(); }

  ngOnInit() {

    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
      this.loadData();
    } else {
      this.model.is_active = true;
      this.model.company_code = this.company_code;
      this.showSpinner = false;
    }
  }

  //#region getrow data
  // callGetrow() {
  //   // param tambahan untuk getrow dynamic
  //   this.dataTamp = [{
  //     'p_code': this.param,
  //     'p_company_code': this.company_code
  //   }];
  //   // end param tambahan untuk getrow dynamic
  //   this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
  //     .subscribe(
  //       res => {
  //         const parse = JSON.parse(res);
  //         const parsedata = parse.data[0];

  //         // checkbox is active
  //         if (parsedata.is_active === '1') {
  //           parsedata.is_active = true;
  //         } else {
  //           parsedata.is_active = false;
  //         }
  //         // end checkbox is active

  //         // mapper dbtoui
  //         Object.assign(this.model, parsedata);
  //         // end mapper dbtoui

  //         this.showSpinner = false;
  //       },
  //       error => {
  //         this.showSpinner = false;
  //         const parse = JSON.parse(error);
  //         this.swalPopUpMsg(parse.data);
  //       });
  // }
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param,
      'p_company_code': this.company_code
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];
          // checkbox
          if (parsedata.is_active === '1') {
            parsedata.is_active = true;
          } else {
            parsedata.is_active = false;
          }
          // end checkbox

          // mapper dbtoui
          Object.assign(this.model, parsedata);
          // end mapper dbtoui

          this.showSpinner = false;
        },
        error => {
          this.showSpinner = false;
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion getrow data

  //#region form submit
  onFormSubmit(masteritemgroupForm: NgForm, isValid: boolean) {
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

    this.masteritemgroupData = masteritemgroupForm;
    if (this.masteritemgroupData.p_is_active == null) {
      this.masteritemgroupData.p_is_active = true;
    }
    const usersJson: any[] = Array.of(this.masteritemgroupData);

    if (this.param != null) {
      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
        .subscribe(
          res => {
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showSpinner = false;
              this.showNotification('bottom', 'right', 'success');
              this.callGetrow();
            } else {
              this.showSpinner = false;
              this.swalPopUpMsg(parse.data);
            }
          },
          error => {
            this.showSpinner = false;
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data);
          });
    } else {
      // call web service
      this.dalservice.Insert(usersJson, this.APIController, this.APIRouteForInsert)
        .subscribe(
          res => {
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showSpinner = false;
              this.showNotification('bottom', 'right', 'success');
              this.route.navigate(['/systemsetting/submasteritemgroup/masteritemgroupdetail', parse.code]);
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
  }
  //#endregion form submit

  //#region button back
  btnBack() {
    this.route.navigate(['/systemsetting/submasteritemgroup']);
    $('#datatable').DataTable().ajax.reload();
  }
  //#endregion button back

  //#region ParentCode Lookup
  btnLookupParentCode() {
    $('#datatableLookupParentCode').DataTable().clear().destroy();
    $('#datatableLookupParentCode').DataTable({
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
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupparentcode = parse.data;

          if (parse.data != null) {
            this.lookupparentcode.numberIndex = dtParameters.start;
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

  btnSelectRowParentCode(code: String, description: String) {
    this.model.parent_code = code;
    this.model.parent_description = description;
    $('#lookupModalParentCode').modal('hide');
  }
  //#endregion MerkCode lookup

  //#region TransactionType Lookup
  btnLookupTransactionType() {
    $('#datatableLookupTransactionType').DataTable().clear().destroy();
    $('#datatableLookupTransactionType').DataTable({
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
          'p_general_code': 'TRANS',
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerSysTransactionType, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookuptransactiontype = parse.data;

          if (parse.data != null) {
            this.lookuptransactiontype.numberIndex = dtParameters.start;
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
      columnDefs: [{ orderable: false, width: '5%', targets: [5] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowTransactionType(code: String, description: String) {
    this.model.transaction_type = code;
    this.model.transaction_description = description;
    $('#lookupModalTransactionType').modal('hide');
  }
  //#endregion TransactionType lookup

  //#region btnActive
  btnActive(code: string) {
    // param tambahan untuk getrole dynamic
    this.dataRoleTamp = [{
      'p_code': code,
      'action': 'default'
    }];
    // param tambahan untuk getrole dynamic

    // call web service
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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForUpdateSatus)
          .subscribe(
            res => {
              const parse = JSON.parse(res);

              if (parse.result === 1) {
                this.showSpinner = false;
                this.showNotification('bottom', 'right', 'success');
                this.callGetrow();
              } else {
                this.showSpinner = false;
                this.swalPopUpMsg(parse.data);
              }
            },
            error => {
              this.showSpinner = false;
              const parse = JSON.parse(error);
              this.swalPopUpMsg(parse.data);
            });
      } else {
        this.showSpinner = false;
      }
    })
  }
  //#endregion btnActive

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
          'p_item_group_code': this.param
        });
        // end param tambahan untuk getrows dynamic
        // tslint:disable-next-line:max-line-length
        this.dalservice.Getrows(dtParameters, this.APIControllerMasterItemGroupGl, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.listitemgroupgl = parse.data;
          if (parse.data != null) {
            this.listitemgroupgl.numberIndex = dtParameters.start;
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
        }, err => console.log('There was an error while retrieving Data(API)' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 5] }], // for disabled coloumn
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
    this.route.navigate(['/systemsetting/submasteritemgroup/masteritemgldetail', this.param]);
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/systemsetting/submasteritemgroup/masteritemgldetail', this.param, codeEdit]);
  }
  //#endregion button edit

  //#region checkall table delete
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.listitemgroupgl.length; i++) {
      if (this.listitemgroupgl[i].selected) {
        this.checkedList.push({ 'id': this.listitemgroupgl[i].id, 'company_code': this.listitemgroupgl[i].company_code });
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
        this.dataTamp = [];
        for (let J = 0; J < this.checkedList.length; J++) {

          // param tambahan untuk getrow dynamic
          this.dataTamp = [{
            'p_id': this.checkedList[J].id,
            'p_company_code': this.checkedList[J].company_code
          }];
          // end param tambahan untuk getrow dynamic

          this.dalservice.Delete(this.dataTamp, this.APIControllerMasterItemGroupGl, this.APIRouteForDelete)
            .subscribe(
              res => {
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  this.showSpinner = false;
                  $('#datatables').DataTable().ajax.reload();
                  this.showNotification('bottom', 'right', 'success');
                } else {
                  this.showSpinner = false;
                  this.swalPopUpMsg(parse.data)
                }
              },
              error => {
                this.showSpinner = false;
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
    for (let i = 0; i < this.listitemgroupgl.length; i++) {
      this.listitemgroupgl[i].selected = this.selectedAll;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAll = this.listitemgroupgl.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkall table delete

  //#region gl link transaction lookup
  btnLookupGlLinkRent() {
    $('#datatableLookupGlLinkrent').DataTable().clear().destroy();
    $('#datatableLookupGlLinkrent').DataTable({
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

  btnSelectRowGlLinkrent(code: String, description: string) {
    this.model.gl_asset_rent_code = code;
    this.model.gl_asset_rent_name = description;
    $('#lookupModalGlLinkrent').modal('hide');
  }
  //#endregion gl link transaction lookup

  //#region gl link transaction lookup
  btnLookupGlLinkBuy() {
    $('#datatableLookupGlLinkbuy').DataTable().clear().destroy();
    $('#datatableLookupGlLinkbuy').DataTable({
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

  btnSelectRowGlLinkbuy(code: String, description: string) {
    this.model.gl_asset_code = code;
    this.model.gl_asset_name = description;
    $('#lookupModalGlLinkbuy').modal('hide');
  }
  //#endregion gl link transaction lookup
}