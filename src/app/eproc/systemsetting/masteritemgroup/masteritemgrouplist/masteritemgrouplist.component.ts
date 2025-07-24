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
  templateUrl: './masteritemgrouplist.component.html',
})

export class MasteritemgrouplistComponent extends BaseComponent implements OnInit {
  // get param from url

  // variable
  public listmasteritemgroup: any = [];
  private dataRoleTamp: any = [];

  //controller
  private APIController: String = 'MasterItemGroup';

  //routing
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForDelete: String = 'Delete';
  private APIRouteForSync: String = 'ExecSpForSync';
  
  private RoleAccessCode = 'R00022700000001A'; // role access 

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

          this.listmasteritemgroup = parse.data;
          if (parse.data != null) {
            this.listmasteritemgroup.numberIndex = dtParameters.start;
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 6] }], // for disabled coloumn
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
    this.route.navigate(['/systemsetting/submasteritemgroup/masteritemgroupdetail']);
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/systemsetting/submasteritemgroup/masteritemgroupdetail', codeEdit]);
  }
  //#endregion button edit

      //#region btnSync
      btnSync() {
        // param tambahan untuk getrole dynamic
        this.dataRoleTamp = [{
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
                this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForSync)
                    .subscribe(
                        res => {
                            const parse = JSON.parse(res);

                            if (parse.result === 1) {
                                this.showSpinner = false;
                                this.showNotification('bottom', 'right', 'success');
                                $('#datatable').DataTable().ajax.reload();
                            } else {
                                this.showSpinner = false;
                                this.swalPopUpMsg(parse.data);
                                $('#datatable').DataTable().ajax.reload();
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
    //#endregion btnSync
}
