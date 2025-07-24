import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-dimensiondetail',
  templateUrl: './dimensiondetail.component.html'
})
export class DimensiondetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');

  // variable
  public DimensionData: any = [];
  public listdimension: any = [];
  public isReadOnly: Boolean = false;
  public isBreak: Boolean = false;
  private rolecode: any = [];
  private dataRoleTamp: any = [];
  private dataTamp: any = [];
  public dataTampPush: any = [];
  private APIController: String = 'SysDimension';
  private APIControllerValue: String = 'SysDimensionValue';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForInsert: String = 'INSERT';
  private APIRouteForDelete: String = 'DELETE';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';
  private RoleAccessCode = 'R00023890000001A';

  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAll: any;
  private checkedList: any = [];

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
    // this.callGetRole('');
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
      this.loadData();
    } else {
      this.model.type = 'TABLE';
      this.showSpinner = false;
    }
  }

  //#region Type
  PageType(event: any) {
    this.model.type = event.target.value;
    if (this.model.type === 'PROCEDURE') {
      this.model.table_name = '';
      this.model.column_name = '';
      this.model.primary_column = '';
    } else {
      this.model.function_name = '';
    }
  }
  //#endregion Type

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/systemsetting/subdimensionlist/dimensiondetaildetail', this.param, codeEdit]);
  }
  //#endregion button edit

  //#region button add
  btnAdd() {
    this.route.navigate(['/systemsetting/subdimensionlist/dimensiondetaildetail', this.param]);
  }
  //#endregion button add

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
          'p_dimension_code': this.param,
        });
        // end param tambahan untuk getrows dynamic        
        this.dalservice.Getrows(dtParameters, this.APIControllerValue, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.listdimension = parse.data;

          if (parse.data != null) {
            this.listdimension.numberIndex = dtParameters.start;
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

  //#region getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param,
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);          
          const parsedata = parse.data[0];

          // checkbox is active
          if (parsedata.is_active === '1') {
            parsedata.is_active = true;
          } else {
            parsedata.is_active = false;
          }
          // end checkbox is active

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

  //#region checkbox all table
  btnDeleteAll() {
    this.isBreak = false;
    this.checkedList = [];
    for (let i = 0; i < this.listdimension.length; i++) {
      if (this.listdimension[i].selected) {
        this.checkedList.push(this.listdimension[i].code);
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
      allowOutsideClick: false,
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
        this.dataTampPush = [];
        for (let J = 0; J < this.checkedList.length; J++) {
          // param tambahan untuk getrow dynamic
          this.dataTampPush = [{
            p_code: this.checkedList[J]
          }];
          // end param tambahan untuk getrow dynamic
          this.dalservice.Delete(this.dataTampPush, this.APIControllerValue, this.APIRouteForDelete)
            .subscribe(
              res => {
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  if (J + 1 === this.checkedList.length) {
                    this.showSpinner = false;
                    this.showNotification('bottom', 'right', 'success');
                    $('#datatableDimensionDetail').DataTable().ajax.reload();
                  }
                } else {
                  this.isBreak = true;
                  this.showSpinner = false;
                  $('#datatableDimensionDetail').DataTable().ajax.reload();
                  this.swalPopUpMsg(parse.data)
                }
              },
              error => {
                this.isBreak = true;
                const parse = JSON.parse(error);
                this.swalPopUpMsg(parse.data)
                this.showSpinner = false;
              });
          if (this.isBreak) {
            break;
          }
        }
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllTable() {
    for (let i = 0; i < this.listdimension.length; i++) {
      this.listdimension[i].selected = this.selectedAll;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAll = this.listdimension.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkbox all table

  //#region form submit
  onFormSubmit(dimensionForm: NgForm, isValid: boolean) {
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

    this.DimensionData = dimensionForm;
    if (this.DimensionData.p_is_active == null) {
      this.DimensionData.p_is_active = false;
    }
    const usersJson: any[] = Array.of(this.DimensionData);

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
            this.swalPopUpMsg(parse.data)
            // console.log('There was an error while Updating Data(API) !!!' + error);
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
              this.route.navigate(['/systemsetting/subdimensionlist/dimensiondetail', parse.code]);
            } else {
              this.showSpinner = false;
              this.swalPopUpMsg(parse.data)
            }
          },
          error => {
            this.showSpinner = false; 
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data)
            // console.log('There was an error while Updating Data(API) !!!' + error);
          });
    }
  }
  //#endregion form submit

  //#region button back
  btnBack() {
    this.route.navigate(['/systemsetting/subdimensionlist']);
    $('#datatableDimension').DataTable().ajax.reload();
  }
  //#endregion button back
}
