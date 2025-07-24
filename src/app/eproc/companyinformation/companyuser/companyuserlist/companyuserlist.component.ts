import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { Location } from '@angular/common';
import swal from 'sweetalert2';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './companyuserlist.component.html'
})

export class CompanyuserlistComponent extends BaseComponent implements OnInit {
  // variable
  public listcompanyuser: any = [];
  public dataTamp: any = [];
  private dataTampPush: any = [];
  private APIController: String = 'SysCompanyUserMain';
  private APIRouteForDelete: String = 'DELETE';
  private APIRouteForGetRows: String = 'GetRows';
  private RoleAccessCode = 'R00021510000000A';

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
          'p_company_code': this.company_code
        })
        // end param tambahan untuk getrows dynamic        
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);

          // if use checkAll use this
          $('#checkall').prop('checked', false);
          // end checkall

          this.listcompanyuser = parse.data;

          if (parse.data != null) {
            this.listcompanyuser.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 7] }], // for disabled coloumn
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
    for (let i = 0; i < this.listcompanyuser.length; i++) {
      if (this.listcompanyuser[i].selected) {
        this.checkedList.push(this.listcompanyuser[i].code);
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
          const code = this.checkedList[J];
          // param tambahan untuk getrow dynamic
          this.dataTampPush = [{
            'p_code': code
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
                    $('#datatable').DataTable().ajax.reload();
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
    for (let i = 0; i < this.listcompanyuser.length; i++) {
      this.listcompanyuser[i].selected = this.selectedAll;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAll = this.listcompanyuser.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkbox all table

  //#region button add
  btnAdd() {
    this.route.navigate(['/companyinformation/subcompanyuserlist/companyuserdetail']);
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/companyinformation/subcompanyuserlist/companyuserdetail', codeEdit]);
  }
  //#endregion button edit
}


