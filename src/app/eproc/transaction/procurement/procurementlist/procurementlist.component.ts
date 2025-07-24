import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { DatePipe, Location } from '@angular/common';
import swal from 'sweetalert2';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './procurementlist.component.html',
})

export class ProcurementlistComponent extends BaseComponent implements OnInit {
  // get param from url

  // variable
  public listprocurementlist: any = [];
  public tampStatusType: String;
  private dataTampProceed: any = [];
  private dataTamp: any = [];
  private dataRoleTamp: any = [];
  public lookupbranch: any = [];
  public branchName: String;
  public branchCodee: String;
  private APIController: String = 'Procurement';
  private APIControllerMasterItem: String = 'MasterItem';
  private APIControllerBranch: String = 'SysBranch';
  datePipe: DatePipe = new DatePipe('en-US');

  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForProceed: String = 'ExecSpForProceed';
  private APIRouteForInsertItemGroup: String = 'ExecSpForInsertItemGroup';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private RoleAccessCode = 'R00021540000000A'; // role access 

  // checklist
  public selectedAllTable: any;
  public checkedList: any = [];
  public companyCode: String;
  public selectedAll: any;

  // spinner
  showSpinner: Boolean = false;
  // end

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _location: Location,
    private _elementRef: ElementRef,
    public datepipe: DatePipe
  ) { super(); }

  ngOnInit() {
    this.compoSide(this._location, this._elementRef, this.route);
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.tampStatusType = 'HOLD';
    this.loadData();
  }

  //#region ddl Status
  PageStatusType(event: any) {
    this.tampStatusType = event.target.value;
    $('#datatable').DataTable().ajax.reload();
  }
  //#endregion ddl Status

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
          'p_branch': this.branchCodee,
          'p_status': this.tampStatusType,
        })
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)

          this.listprocurementlist = parse.data;
          if (parse.data != null) {
            this.listprocurementlist.numberIndex = dtParameters.start;

            // if use checkAll use this
            $('#checkall').prop('checked', false);
            // end checkall
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 11] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }

  }
  //#endregion load all data

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/transaction/subprocurement/procurementdetail', codeEdit]);
  }
  //#endregion button edit

  // getFlagDate() {
  //   this.showSpinner = true;

  //   var FlagDate = new Date();
  //   const forTab = setInterval(() => {

  //     let latest_date = this.datePipe.transform(FlagDate, 'yyyy-MM-dd HH:mm:ss');      

  //     if (latest_date != null && latest_date !== '') {
  //       clearInterval(forTab);
  //       this.btnProceed(latest_date);
  //     }
  //   }, 150);
  // }

  //#region btn proceed
  btnProceed() {
    var FlagDate = new Date();
    let latest_date = this.datepipe.transform(FlagDate, 'yyyy-MM-dd HH:mm:ss');

    // this.showSpinner = true;
    this.dataTampProceed = [];
    this.checkedList = [];
    for (let i = 0; i < this.listprocurementlist.length; i++) {
      if (this.listprocurementlist[i].selected) {
        this.checkedList.push({
          'Code': this.listprocurementlist[i].code,
          'ProcurementCode': this.listprocurementlist[i].procurement_request_code,
          'CompanyCode': this.listprocurementlist[i].company_code,
          'ItemCode': this.listprocurementlist[i].item_code,
        })
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
    this.dataTamp = [];
    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'Yes',
      buttonsStyling: false
    }).then((result) => {
      this.showSpinner = true;
      setTimeout(() => {
        // var FlagDate = new Date();
        // let latest_date = this.datepipe.transform(FlagDate, 'yyyy-MM-dd HH:MM:SS');
        if (result.value) {

          let th = this;
          var i = 0;
          (function loopProcurementProceed() {
            if (i < th.checkedList.length) {
              th.dataTampProceed = [{
                'p_code': th.checkedList[i].Code,
                'action': ''
              }];
              //Proceed data dan insert into quotation / supplier selection
              th.dalservice.ExecSp(th.dataTampProceed, th.APIController, th.APIRouteForProceed)
                .subscribe(
                  res => {
                    // th.showSpinner = true;
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                      // if (th.checkedList.length == i + 1) {
                      th.dataTamp = [{
                        'p_code': th.checkedList[i].ItemCode,
                        'p_company_code': 'DSF',
                        'action': ''
                      }];
                      //Get data item group fro IFINBAM
                      th.dalservice.GetrowBam(th.dataTamp, th.APIControllerMasterItem, th.APIRouteForGetRow)
                        .subscribe(
                          res => {
                            const parse = JSON.parse(res);
                            const dataItemGroup = parse.data[0];

                            // th.showSpinner = true;
                            th.dataRoleTamp = [{
                              'p_code': th.checkedList[i].Code,
                              'p_item_group_code': dataItemGroup.item_group_code,
                              'p_type_asset_code': dataItemGroup.type_asset_code,
                              'p_item_category_code': dataItemGroup.category_code,
                              'p_item_category_name': dataItemGroup.category_description,
                              'p_item_merk_code': dataItemGroup.merk_code,
                              'p_item_merk_name': dataItemGroup.merk_description,
                              'p_item_model_code': dataItemGroup.model_code,
                              'p_item_model_name': dataItemGroup.model_description,
                              'p_item_type_code': dataItemGroup.type_code,
                              'p_item_type_name': dataItemGroup.type_description,
                              'p_procurement_request_code': th.checkedList[i].ProcurementCode,
                              'p_company_code': th.checkedList[i].CompanyCode,
                              'p_date_flag': latest_date,
                              'p_type': 'WTQTN',
                              'action': ''
                            }];
                            if (parse.result === 1) {
                              //Update Item group code di table procurement
                              th.dalservice.ExecSp(th.dataRoleTamp, th.APIController, th.APIRouteForInsertItemGroup)
                                .subscribe(
                                  res => {
                                    // this.showSpinner = false;
                                    const parse = JSON.parse(res);
                                    if (parse.result === 1) {
                                      if (th.checkedList.length == i + 1) {
                                        th.showNotification('bottom', 'right', 'success');
                                        $('#datatable').DataTable().ajax.reload();
                                        th.showSpinner = false;
                                      } else {
                                        i++;
                                        loopProcurementProceed();
                                        th.showSpinner = false;

                                      }
                                    } else {
                                      th.swalPopUpMsg(parse.data);
                                    }
                                  },
                                  error => {
                                    th.showSpinner = false;
                                    const parse = JSON.parse(error);
                                    th.swalPopUpMsg(parse.data);
                                  });
                            } else {
                              th.swalPopUpMsg(parse.data);
                              th.showSpinner = false;
                            }
                          },
                          error => {
                            const parse = JSON.parse(error);
                            th.swalPopUpMsg(parse.data);
                            th.showSpinner = false;
                          });
                    } else {
                      th.swalPopUpMsg(parse.data);
                      th.showSpinner = false;
                    }
                  },
                  error => {
                    const parse = JSON.parse(error);
                    th.swalPopUpMsg(parse.data);
                    th.showSpinner = false;
                  });
            }
          })();
        } else {
          this.showSpinner = false;
        }
      }, 500);
    });
  }
  //#endregion btn proceed

  //#region btn proceed
  btnProceedWithout() {
    var FlagDate = new Date();
    let latest_date = this.datepipe.transform(FlagDate, 'yyyy-MM-dd HH:mm:ss');

    // this.showSpinner = true;
    this.dataTampProceed = [];
    this.checkedList = [];
    for (let i = 0; i < this.listprocurementlist.length; i++) {
      if (this.listprocurementlist[i].selected) {
        this.checkedList.push({
          'Code': this.listprocurementlist[i].code,
          'ProcurementCode': this.listprocurementlist[i].procurement_request_code,
          'CompanyCode': this.listprocurementlist[i].company_code,
          'ItemCode': this.listprocurementlist[i].item_code,
        })
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
    this.dataTamp = [];
    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'Yes',
      buttonsStyling: false
    }).then((result) => {
      this.showSpinner = true;
      setTimeout(() => {
        // var FlagDate = new Date();
        // let latest_date = this.datepipe.transform(FlagDate, 'yyyy-MM-dd HH:MM:SS');
        if (result.value) {

          let th = this;
          var i = 0;
          (function loopProcurementProceed() {
            if (i < th.checkedList.length) {
              th.dataTampProceed = [{
                'p_code': th.checkedList[i].Code,
                'action': ''
              }];
              //Proceed data dan insert into quotation / supplier selection
              th.dalservice.ExecSp(th.dataTampProceed, th.APIController, th.APIRouteForProceed)
                .subscribe(
                  res => {
                    // th.showSpinner = true;
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                      // if (th.checkedList.length == i + 1) {
                      th.dataTamp = [{
                        'p_code': th.checkedList[i].ItemCode,
                        'p_company_code': 'DSF',
                        'action': ''
                      }];

                      //Get data item group fro IFINBAM
                      th.dalservice.GetrowBam(th.dataTamp, th.APIControllerMasterItem, th.APIRouteForGetRow)
                        .subscribe(
                          res => {
                            const parse = JSON.parse(res);
                            const dataItemGroup = parse.data[0];
                            // th.showSpinner = true;
                            th.dataRoleTamp = [{
                              'p_code': th.checkedList[i].Code,
                              'p_item_group_code': dataItemGroup.item_group_code,
                              'p_type_asset_code': dataItemGroup.type_asset_code,
                              'p_item_category_code': dataItemGroup.category_code,
                              'p_item_category_name': dataItemGroup.category_description,
                              'p_item_merk_code': dataItemGroup.merk_code,
                              'p_item_merk_name': dataItemGroup.merk_description,
                              'p_item_model_code': dataItemGroup.model_code,
                              'p_item_model_name': dataItemGroup.model_description,
                              'p_item_type_code': dataItemGroup.type_code,
                              'p_item_type_name': dataItemGroup.type_description,
                              'p_procurement_request_code': th.checkedList[i].ProcurementCode,
                              'p_company_code': th.checkedList[i].CompanyCode,
                              'p_date_flag': latest_date,
                              'p_type': 'NONQTN',
                              'action': ''
                            }];
                            if (parse.result === 1) {
                              //Update Item group code di table procurement
                              th.dalservice.ExecSp(th.dataRoleTamp, th.APIController, th.APIRouteForInsertItemGroup)
                                .subscribe(
                                  res => {
                                    // this.showSpinner = false;
                                    const parse = JSON.parse(res);
                                    if (parse.result === 1) {
                                      if (th.checkedList.length == i + 1) {
                                        th.showNotification('bottom', 'right', 'success');
                                        $('#datatable').DataTable().ajax.reload();
                                        th.showSpinner = false;
                                      } else {
                                        i++;
                                        loopProcurementProceed();
                                        th.showSpinner = false;
                                      }
                                    } else {
                                      th.swalPopUpMsg(parse.data);
                                    }
                                  },
                                  error => {
                                    th.showSpinner = false;
                                    const parse = JSON.parse(error);
                                    th.swalPopUpMsg(parse.data);
                                  });
                            } else {
                              th.swalPopUpMsg(parse.data);
                              th.showSpinner = false;
                            }
                          },
                          error => {
                            const parse = JSON.parse(error);
                            th.swalPopUpMsg(parse.data);
                            th.showSpinner = false;
                          });
                    } else {
                      th.swalPopUpMsg(parse.data);
                      th.showSpinner = false;
                    }
                  },
                  error => {
                    const parse = JSON.parse(error);
                    th.swalPopUpMsg(parse.data);
                    th.showSpinner = false;
                  });
            }
          })();
        } else {
          this.showSpinner = false;
        }
      }, 500);
    });
  }
  //#endregion btn proceed

  selectAllTable() {
    for (let i = 0; i < this.listprocurementlist.length; i++) {
      if (this.listprocurementlist[i].is_calculated !== '1') {
        this.listprocurementlist[i].selected = this.selectedAll;
      }
    }
  }

  checkIfAllTableSelected() {
    this.selectedAll = this.listprocurementlist.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion btn proceed


  //#region BranchCode Lookup
  btnLookupBranchCode() {
    $('#datatableLookupBranchCode').DataTable().clear().destroy();
    $('#datatableLookupBranchCode').DataTable({
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
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.ExecSpSys(dtParameters, this.APIControllerBranch, this.APIRouteForLookup).subscribe(resp => {
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
      columnDefs: [{ orderable: false, width: '5%', targets: [4] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowBranchCode(code: String, name: String) {
    this.branchCodee = code;
    this.branchName = name;
    $('#lookupModalBranchCode').modal('hide');
    $('#datatable').DataTable().ajax.reload();
  }

  btnClearGroup() {
    this.branchCodee = '';
    this.branchName = '';
    $('#datatable').DataTable().ajax.reload();
  }
  //#endregion BranchCode lookup
}
