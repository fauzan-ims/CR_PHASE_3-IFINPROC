import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';

declare var $: any;

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './grouproledetail.component.html'
})

export class GrouproledetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public grouproleData: any = [];
  public listrolegroupdetail: any = [];
  public lookupModule: any = [];
  public lookupMenu: any = [];
  public lookupSubMenu: any = [];
  public lookupAccessType: any = [];
  public lookupGroupRole: any = [];
  public isReadOnly: Boolean = false;
  private isLookup: Boolean = false;
  private tampAccessType: String;
  private rolecode: any = [];
  private dataRoleTamp: any = [];
  private dataTamp: any = [];
  private dataTampPush: any = [];
  private APIController: String = 'SysRoleGroup';
  private APIControllerSysRoleGroupDetail: String = 'SysRoleGroupDetail';
  private APIControllerSysMenu: String = 'SysMenu';
  private APIControllerSysMenuRole: String = 'SysMenuRole';
  private APIRouteForGetRowsForSysRoleGroupDetail = 'GETROWS'
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForInsert: String = 'INSERT';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForDelete: String = 'DELETE';
  private APIRouterLookupForGroupRoleDetail = 'GetRowsLookupForGroupRoleDetail';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';
  private RoleAccessCode = 'R00021500000000A';

  //lookup module
  private APIControllerModule: String = 'SysModule';
  private APIRouteLookupModule: String = 'GetRowsForLookup';

  //lookup menu
  private APIControllerMenu: String = 'SysMenu';
  private APIRouteLookupMenu: String = 'GetRowsForLookupForParent';

  //lookup submenu
  private APIRouteLookupSysMenu: String = 'GetRowsLookupByParentCode';

  // checklist
  public selectedAllTable: any;
  public selectedAllLookup: any;
  private checkedList: any = [];
  private checkedLookup: any = [];

  // form 2 way binding
  model: any = {};

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
    this.loadData();
    this.model.role_access = 'ALL';

    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
    } else {
      this.showSpinner = false;
      this.model.company_code = this.company_code;
    }
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
        'p_role_group_code': this.param,
        'p_module_code': this.model.module_code,
        'p_parent_menu_code': this.model.parent_menu_code,
        'p_code': this.model.sub_menu_code,
        'p_role_access': this.model.role_access,
      });
      
      // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerSysRoleGroupDetail, this.APIRouteForGetRowsForSysRoleGroupDetail).subscribe(resp => {
          const parse = JSON.parse(resp)          
          this.listrolegroupdetail = parse.data;

          if (parse.data != null) {
            this.listrolegroupdetail.numberIndex = dtParameters.start;
          }
          // if use checkAll use this
          $('#checkalltable').prop('checked', false);
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

  //#region getrow data
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

  //#region  form submit
  onFormSubmit(grouproleForm: NgForm, isValid: boolean) {
    // validation form submit
    if (!isValid) {
      swal({
        title: 'Warning',
        text: 'Please Fill a Mandatory Field OR Format Is Invalid',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger',
        type: 'warning'
      }).catch(swal.noop)
      return;
    } else {
      this.showSpinner = true;
    }

    this.grouproleData = grouproleForm;
    const usersJson: any[] = Array.of(this.grouproleData);
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
            } else {
              this.swalPopUpMsg(parse.data);
            }
          },
          error => {
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data);
            // console.log('There was an error while Updating Data(API) !!!' + error);
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
              this.route.navigate(['/systemsecurity/subgrouprolelistsetting/grouproledetail', parse.code]);
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
    $('#datatable').DataTable().ajax.reload();
    this.route.navigate(['/systemsecurity/subgrouprolelistsetting']);
  }
  //#endregion button back

  //#region ddl Type access
  AccessType(event: any) {
    this.tampAccessType = event.target.value;
    this.model.role_access = this.tampAccessType;
    if (!this.isLookup) {
      $('#datatables').DataTable().ajax.reload();
    } else {
      $('#datatableLookupGroupRole').DataTable().ajax.reload();
    }
  }
  //#endregion ddl Type access

  //#region lookup close
  btnLookupClose() {
    this.isLookup = false;
    this.model.module_code = '';
    this.model.module_name = '';
    this.model.menu_name = '';
    this.model.sub_menu_name = '';
    this.model.parent_menu_code = '';
    this.model.sub_menu_code = '';
    this.model.role_access = 'L';
    $('#datatables').DataTable().ajax.reload();
  }
  //#endregion lookup close

  //#region Module lookup
  btnLookupModule() {
    $('#datatableLookupModule').DataTable().clear().destroy();
    $('#datatableLookupModule').DataTable({
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
          'default': ''
        });
        // end param tambahan untuk getrows dynamic

        this.dalservice.Getrows(dtParameters, this.APIControllerModule, this.APIRouteLookupModule).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupModule = parse.data;

          if (parse.data != null) {
            this.lookupModule.numberIndex = dtParameters.start;
          }
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          })
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

  btnSelectRowModule(code: String, module_name: String) {
    this.model.module_code = code;
    this.model.module_name = module_name;
    this.model.menu_name = '';
    this.model.sub_menu_name = '';
    if (!this.isLookup) {
      $('#datatables').DataTable().ajax.reload();
    } else {
      $('#datatableLookupGroupRole').DataTable().ajax.reload();
    }
    $('#lookupModalModule').modal('hide');
  }

  btnClearModule() {
    this.model.module_code = null;
    this.model.module_name = null;
    this.model.menu_name = null;
    this.model.sub_menu_name = null;
  }
  //#endregion Module lookup

  //#region Menu lookup
  btnLookupMenu() {
    $('#datatableLookupMenu').DataTable().clear().destroy();
    $('#datatableLookupMenu').DataTable({
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
          'p_module_code': this.model.module_code
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsBam(dtParameters, this.APIControllerMenu, this.APIRouteLookupMenu).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupMenu = parse.data;
          if (parse.data != null) {
            this.lookupMenu.numberIndex = dtParameters.start;
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

  btnSelectRowMenu(name: String, parent_code: String) {
    this.model.menu_name = name;
    this.model.parent_menu_code = parent_code;
    this.model.sub_menu_name = '';
    if (!this.isLookup) {
      $('#datatables').DataTable().ajax.reload();
    } else {
      $('#datatableLookupGroupRole').DataTable().ajax.reload();
    }
    $('#lookupModalMenu').modal('hide');
  }

  btnClearMenu() {
    this.model.menu_name = null;
    this.model.parent_menu_code = null;
    this.model.sub_menu_name = null;
  }
  //#endregion Menu lookup

  //#region Sub Menu lookup
  btnLookupSubMenu() {
    $('#datatableLookupSubMenu').DataTable().clear().destroy();
    $('#datatableLookupSubMenu').DataTable({
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
          'p_parent_code': this.model.parent_menu_code
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsBam(dtParameters, this.APIControllerSysMenu, this.APIRouteLookupSysMenu).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupSubMenu = parse.data;

          if (parse.data != null) {
            this.lookupSubMenu.numberIndex = dtParameters.start;
          }
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          })
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

  btnSelectRowSubMenu(code: String, name: String) {
    this.model.sub_menu_code = code;
    this.model.sub_menu_name = name;
    if (!this.isLookup) {
      $('#datatables').DataTable().ajax.reload();
    } else {
      $('#datatableLookupGroupRole').DataTable().ajax.reload();
    }
    $('#lookupModalSubMenu').modal('hide');
  }

  btnClearSubMenu() {
    this.model.sub_menu_code = null;
    this.model.sub_menu_name = null;
  }
  //#endregion Sub Menu lookup

  //#region lookup Group Role
  btnLookupGroupRole() {
    this.isLookup = true;
    this.model.module_code = '';
    this.model.module_name = '';
    this.model.menu_name = '';
    this.model.sub_menu_name = '';
    this.model.parent_menu_code = '';
    this.model.sub_menu_code = '';
    this.model.role_access = 'L';
    $('#datatableLookupGroupRole').DataTable().clear().destroy();
    $('#datatableLookupGroupRole').DataTable({
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
          'p_role_group_code': this.param,
          'p_menu_code': this.model.sub_menu_code,
          'p_role_access': this.model.role_access,
          'p_source_module': 'ICAS'
        });           
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsBam(dtParameters, this.APIControllerSysMenuRole, this.APIRouterLookupForGroupRoleDetail).subscribe(resp => {
          const parse = JSON.parse(resp);
          
          this.lookupGroupRole = parse.data;

          if (parse.data != null) {
            this.lookupGroupRole.numberIndex = dtParameters.start;
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }
  //#endregion lookup Group Role

  //#region checkbox all lookup
  btnSelectAllLookup() {
    this.checkedLookup = [];
    for (let i = 0; i < this.lookupGroupRole.length; i++) {
      if (this.lookupGroupRole[i].selectedLookup) {
        this.checkedLookup.push({
          role_code: this.lookupGroupRole[i].role_code,
          role_name: this.lookupGroupRole[i].role_name
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
      this.dataTamp = [{
        'p_role_group_code': this.param,
        'p_role_code': this.checkedLookup[J].role_code,
        'p_role_name': this.checkedLookup[J].role_name,
        'p_menu_code': this.model.parent_menu_code,
        'p_menu_name': this.model.menu_name,
        'p_parent_menu_name': this.model.parent_menu_name,
        'p_submenu_code': this.model.sub_menu_code,
        'p_submenu_name': this.model.sub_menu_name
      }];

      // end param tambahan untuk getrow dynamic
      this.dalservice.Insert(this.dataTamp, this.APIControllerSysRoleGroupDetail, this.APIRouteForInsert)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showNotification('bottom', 'right', 'success');
              $('#datatableLookupGroupRole').DataTable().ajax.reload();
              $('#datatables').DataTable().ajax.reload();

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
    for (let i = 0; i < this.lookupGroupRole.length; i++) {
      this.lookupGroupRole[i].selectedLookup = this.selectedAllLookup;
    }
  }

  checkIfAllLookupSelected() {
    this.selectedAllLookup = this.lookupGroupRole.every(function (item: any) {
      return item.selectedLookup === true;
    })
  }
  //#endregion checkbox all table

  //#region checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.listrolegroupdetail.length; i++) {
      if (this.listrolegroupdetail[i].selected) {
        this.checkedList.push(this.listrolegroupdetail[i].role_code);
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
          const codeData = this.checkedList[J];
          // param tambahan untuk getrow dynamic
          this.dataTampPush = [{
            'p_role_group_code': this.param,
            'p_role_code': codeData
          }];
          // end param tambahan untuk getrow dynamic
          this.dalservice.Delete(this.dataTampPush, this.APIControllerSysRoleGroupDetail, this.APIRouteForDelete)
            .subscribe(
              res => {
                this.showSpinner = false;
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  if (this.checkedList.length == J + 1) {
                    this.showNotification('bottom', 'right', 'success');
                    $('#datatables').DataTable().ajax.reload();
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

  selectAllTable() {
    for (let i = 0; i < this.listrolegroupdetail.length; i++) {
      this.listrolegroupdetail[i].selected = this.selectedAllTable;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAllTable = this.listrolegroupdetail.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkbox all table
}



