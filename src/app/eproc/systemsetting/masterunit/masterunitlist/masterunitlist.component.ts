import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { Location } from '@angular/common';
import swal from 'sweetalert2';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './masterunitlist.component.html',
})

export class MasterunitlistComponent extends BaseComponent implements OnInit {
  // get param from url

  // variable
  public listmasterunit: any = [];

  private APIController: String = 'MasterUnit';

  private APIRouteForGetRows: String = 'GetRows';

  private APIRouteForDelete: String = 'Delete';
  private RoleAccessCode = 'R00011530000000A'; // role access 

  // checklist
  public selectedAllTable: any;
  public checkedList: any = [];
  public companyCode: String;
  private dataTamp: any = [];

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
    private _elementRef: ElementRef
  ) { super(); }

  ngOnInit() {
    this.compoSide(this._location, this._elementRef, this.route);

    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
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
          const parse = JSON.parse(resp)

          this.listmasterunit = parse.data;
          if (parse.data != null) {
            this.listmasterunit.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 9] }], // for disabled coloumn
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
    this.route.navigate(['/systemsetting/submasterunit/masterunitdetail']);
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/systemsetting/submasterunit/masterunitdetail', codeEdit]);
  }
  //#endregion button edit

  //#region checkall table delete
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.listmasterunit.length; i++) {
      if (this.listmasterunit[i].selected) {
        this.checkedList.push({ 'code': this.listmasterunit[i].code, 'company_code': this.listmasterunit[i].company_code });
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
            'p_code': this.checkedList[J].code,
            'p_company_code': this.checkedList[J].company_code
          }];
          // end param tambahan untuk getrow dynamic

          this.dalservice.Delete(this.dataTamp, this.APIController, this.APIRouteForDelete)
            .subscribe(
              res => {
                this.showSpinner = false;
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  $('#datatable').DataTable().ajax.reload();
                  this.showNotification('bottom', 'right', 'success');
                } else {
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
    for (let i = 0; i < this.listmasterunit.length; i++) {
      this.listmasterunit[i].selected = this.selectedAllTable;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAllTable = this.listmasterunit.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkall table delete
}
