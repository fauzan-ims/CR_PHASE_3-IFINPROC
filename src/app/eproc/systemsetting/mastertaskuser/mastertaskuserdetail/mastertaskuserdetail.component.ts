import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../../../../../base.component';
import { DataTableDirective } from 'angular-datatables';
import { DALService } from '../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './mastertaskuserdetail.component.html'
})

export class MastertaskuserdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public taskuserData: any = [];
  public listtaskuserdetail: any = [];
  public isReadOnly: Boolean = false;
  private dataTamp: any = [];
  private dataTampPush: any = [];
  private dataRoleTamp: any = [];
  public lookupAddGroupRole: any = [];
  private APIController: String = 'MasterTaskUser';
  private APIControllerMasterTaskUserDetail: String = 'MasterTaskUserDetail';
  private APIControllerGroupRole: String = 'SysRoleGroup';
  private APIRouteGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForDelete: String = 'DELETE';
  private APIRouteLookup: String = 'GetRowsForLookup';
  private APIRouteForUpdateSatus: String = 'ExecSpForUpdateStatus';
  private RoleAccessCode = 'R00021810000000A';

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
  // end

  // checklist
  public selectedAll: any;
  public selectedAllLookup: any;
  private checkedList: any = [];
  private checkedLookup: any = [];

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
    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
      this.loadData();
    } else {
      this.model.is_active = true;
      this.showSpinner = false;
      this.model.company_code = this.company_code;
      this.model.sys_code = '';
    }
  }


  //#region btnActive
  btnActive(code: string) {
    // param tambahan untuk getrole dynamic
    this.dataRoleTamp = [{
      'p_code': code,
      'p_company_code': this.company_code,
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
          'p_main_task_user_code': this.param
        });
        // end param tambahan untuk getrows dynamic

        // tslint:disable-next-line:max-line-length
        this.dalservice.Getrows(dtParameters, this.APIControllerMasterTaskUserDetail, this.APIRouteGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.listtaskuserdetail = parse.data;

          if (parse.data != null) {
            this.listtaskuserdetail.numberIndex = dtParameters.start;
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

  //#region getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param
    }];
    // end param tambahan untuk getrow dynamic

    // this._widgetdetailService.WidgetDetailGetrow(this.dataTamp)
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
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion getrow data

  //#region  form submit
  onFormSubmit(taskuserForm: NgForm, isValid: boolean) {
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

    this.taskuserData = taskuserForm;
    if (this.taskuserData.p_is_active == null) {
      this.taskuserData.p_is_active = this.model.is_active;
    }
    const usersJson: any[] = Array.of(this.taskuserData);
    if (this.param != null) {
      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showNotification('bottom', 'right', 'success');
              this.callGetrow()
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
              this.route.navigate(['/systemsetting/submastertaskuserlist/mastertaskuserdetail', parse.code]);
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
    this.route.navigate(['/systemsetting/submastertaskuserlist']);
  }
  //#endregion button back

  //#region checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.listtaskuserdetail.length; i++) {
      if (this.listtaskuserdetail[i].selected) {
        this.checkedList.push({
          code: this.listtaskuserdetail[i].code,
          role_group_code: this.listtaskuserdetail[i].role_group_code
        });
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
          // param tambahan untuk getrow dynamic
          this.dataTampPush = [this.JSToNumberFloats({
            'p_code': this.checkedList[J].code,
            'p_role_group_code': this.checkedList[J].role_group_code
          })];

          // end param tambahan untuk getrow dynamic
          this.dalservice.Delete(this.dataTampPush, this.APIControllerMasterTaskUserDetail, this.APIRouteForDelete)
            .subscribe(
              res => {
                this.showSpinner = false;
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  if (this.checkedLookup.length == J+1){
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

  selectAll() {
    for (let i = 0; i < this.listtaskuserdetail.length; i++) {
      this.listtaskuserdetail[i].selected = this.selectedAll;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAll = this.listtaskuserdetail.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkbox all table

  //#region lookup Group
  btnLookupAddGroupRole() {
    $('#datatableLookupAddGroupRole').DataTable().clear().destroy();
    $('#datatableLookupAddGroupRole').DataTable({
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
          'p_main_task_user_code': this.param,
          'p_company_code': this.company_code
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerGroupRole, this.APIRouteLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupAddGroupRole = parse.data;

          if (parse.data != null) {
            this.lookupAddGroupRole.numberIndex = dtParameters.start;
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
  //#endregion lookup Group

  //#region checkbox all lookup
  btnSelectAllLookup() {
    this.checkedLookup = [];
    for (let i = 0; i < this.lookupAddGroupRole.length; i++) {
      if (this.lookupAddGroupRole[i].selectedLookup) {
        this.checkedLookup.push(this.lookupAddGroupRole[i].code);
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
        'p_code': '',
        'p_company_code': this.company_code,
        'p_main_task_user_code': this.param,
        'p_sys_code': '',
        'p_role_group_code': this.checkedLookup[J]
      }];
      // end param tambahan untuk getrow dynamic

      this.dalservice.Insert(this.dataTamp, this.APIControllerMasterTaskUserDetail, this.APIRouteForInsert)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              if (this.checkedLookup.length == J+1){
                this.showNotification('bottom', 'right', 'success');
                $('#datatablelookupAddGroupRole').DataTable().ajax.reload();
                $('#datatables').DataTable().ajax.reload();
              }
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
    for (let i = 0; i < this.lookupAddGroupRole.length; i++) {
      this.lookupAddGroupRole[i].selectedLookup = this.selectedAllLookup;
    }
  }

  checkIfAllLookupSelected() {
    this.selectedAllLookup = this.lookupAddGroupRole.every(function (item: any) {
      return item.selectedLookup === true;
    })
  }
  //#endregion checkbox all table

}
