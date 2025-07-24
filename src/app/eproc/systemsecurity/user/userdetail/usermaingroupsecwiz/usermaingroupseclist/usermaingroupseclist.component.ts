import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';
import swal from 'sweetalert2';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './usermaingroupseclist.component.html'
})

export class UsermaingroupseclistComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public listmenugroupsec: any = [];
  public dataTamp: any = [];
  public lookupgroup: any = [];
  private rolecode: any = [];
  private dataRoleTamp: any = [];
  private dataTampPush: any = [];

  //controller
  private APIController: String = 'SysUserMainGroupSec';
  private APIControllerRoleGroup: String = 'SysRoleGroup';

  //route
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForInsert: String = 'INSERT';
  private APIRouteForDelete: String = 'DELETE';

  private APIRouteForLookupByUid: String = 'GetRowsForLookupByUid'; //multiple
  private RoleAccessCode = 'R00010420001043A';


  // checklist
  public selectedAllTable: any;
  public selectedAllLookup: any;
  private checkedList: any = [];
  private checkedLookup: any = [];

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
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _elementRef: ElementRef
  ) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.loadData();
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
          'p_ucode': this.param,
        })
        // end param tambahan untuk getrows dynamic

        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.listmenugroupsec = parse.data;

          if (parse.data != null) {
            this.listmenugroupsec.numberIndex = dtParameters.start;
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

  //#region checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.listmenugroupsec.length; i++) {
      if (this.listmenugroupsec[i].selected) {
        this.checkedList.push(this.listmenugroupsec[i].role_group_code);
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
            'p_ucode': this.param,
            'p_role_group_code': codeData
          }];
          // end param tambahan untuk getrow dynamic
          this.dalservice.Delete(this.dataTampPush, this.APIController, this.APIRouteForDelete)
            .subscribe(
              res => {
                this.showSpinner = false;
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  if (this.checkedList.length == J+1){
                    this.showNotification('bottom', 'right', 'success');
                    $('#datatabless').DataTable().ajax.reload();
                  }
                } else {
                  this.swalPopUpMsg(parse.data)
                }
              },
              error => {
                const parse = JSON.parse(error);
                this.showSpinner = false;
                this.swalPopUpMsg(parse.data)
              });
        }
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllTable() {
    for (let i = 0; i < this.listmenugroupsec.length; i++) {
      this.listmenugroupsec[i].selected = this.selectedAllTable;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAllTable = this.listmenugroupsec.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkbox all table

  //#region lookup Group
  btnLookupGroup() {
    $('#datatableLookupGroup').DataTable().clear().destroy();
    $('#datatableLookupGroup').DataTable({
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
          'p_ucode': this.param
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerRoleGroup, this.APIRouteForLookupByUid).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupgroup = parse.data;

          if (parse.data != null) {
            this.lookupgroup.numberIndex = dtParameters.start;
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
    for (let i = 0; i < this.lookupgroup.length; i++) {
      if (this.lookupgroup[i].selectedLookup) {
        this.checkedLookup.push(this.lookupgroup[i].code);
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
        'p_ucode': this.param,
        'p_role_group_code': this.checkedLookup[J]
      }];
      // end param tambahan untuk getrow dynamic

      this.dalservice.Insert(this.dataTamp, this.APIController, this.APIRouteForInsert)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              this.showNotification('bottom', 'right', 'success');
              $('#datatabless').DataTable().ajax.reload();
              $('#datatableLookupGroup').DataTable().ajax.reload();
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
    for (let i = 0; i < this.lookupgroup.length; i++) {
      this.lookupgroup[i].selectedLookup = this.selectedAllLookup;
    }
  }

  checkIfAllLookupSelected() {
    this.selectedAllLookup = this.lookupgroup.every(function (item: any) {
      return item.selectedLookup === true;
    })
  }
  //#endregion checkbox all table
}
