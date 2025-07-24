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
  templateUrl: './grouprolelist.component.html'
})

export class GrouprolelistComponent extends BaseComponent implements OnInit {
  // variable
  public listgrouprole: any = [];
  public dataTamp: any = [];
  private APIController: String = 'SysRoleGroup';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForDelete: String = 'DELETE';
  private RoleAccessCode = 'R00021500000000A';

  // checklist
  public selectedAll: any;
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
        'p_company_code': this.company_code
      });
      // end param tambahan untuk getrows dynamic

        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.listgrouprole = parse.data;

          if (parse.data != null) {
            this.listgrouprole.numberIndex = dtParameters.start;
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
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
    this.route.navigate(['/systemsecurity/subgrouprolelistsetting/grouproledetail']);
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/systemsecurity/subgrouprolelistsetting/grouproledetail', codeEdit]);
  }
  //#endregion button edit

  //#region checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.listgrouprole.length; i++) {
      if (this.listgrouprole[i].selected) {
        this.checkedList.push(this.listgrouprole[i].code);
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
          const codeProvince = this.checkedList[J];
          // param tambahan untuk getrow dynamic
          this.dataTamp = [{
            'p_code': codeProvince,
            'p_company_code': this.company_code
          }];
          // end param tambahan untuk getrow dynamic

          this.dalservice.Delete(this.dataTamp, this.APIController, this.APIRouteForDelete)
            .subscribe(
              res => {
                this.showSpinner = false;
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  if (this.checkedList.length == J+1){
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
    for (let i = 0; i < this.listgrouprole.length; i++) {
      this.listgrouprole[i].selected = this.selectedAll;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAll = this.listgrouprole.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkbox all table
}
