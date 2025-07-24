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
  templateUrl: './masterwarehousedetail.component.html'
})
export class MasterWarehousedetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern: string = this._numberonlyformat;
  public warehouseData: any = [];
  public isReadOnly: Boolean = false;
  public isStatus: Boolean;
  public tampdHidden: Boolean;
  public code: String;
  public lookupCity: any = [];
  public lookupbranchcode: any = [];
  private dataTamp: any = [];
  private dataRoleTamp: any = [];
  private setStyle: any = [];

  private APIController: String = 'MasterWarehouse';
  private APIControllerBranch: String = 'SysBranch';
  private APIControllerCity: String = 'SysCity';
  private APIRouteLookupCity: String = 'GetRowsLookupForMasterRegionCity';

  private APIRouteForUpdateSatus: String = 'ExecSpForEditable';
  private APIRouteForReturnProceed: String = 'ExecSpForProceed';
  private APIRouteForReturnCancel: String = 'ExecSpForCancel';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForLookup: String = 'GetRowsForLookup';

  private RoleAccessCode = 'R00021320000000A'; // role access 

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
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.Delimiter(this._elementRef);
    this.wizard();
    if (this.param != null) {
      this.isReadOnly = true;
      // call web service
      this.callGetrow();
      // this.requestitemwiz();
    } else {
      this.tampdHidden = false;
      this.model.company_code = this.company_code;
      this.showSpinner = false;
    }
  }

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
          const parsedata = this.getrowNgb(parse.data[0]);

          // checkbox is active
          if (parsedata.is_active === '1') {
            parsedata.is_active = true;
          } else {
            parsedata.is_active = false;
          }
          // end checkbox is active

          if (parsedata.status != 'NEW') {
            this.tampdHidden = true;
          } else {
            this.tampdHidden = false;
          }
          // mapper dbtoui
          Object.assign(this.model, parsedata);
          // end mapper dbtoui

          this.showSpinner = false;
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion getrow data

  //#region form submit
  onFormSubmit(masterwarehouseForm: NgForm, isValid: boolean) {
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

    this.warehouseData = this.JSToNumberFloats(masterwarehouseForm);
    if (this.warehouseData.p_is_active == null) {
      this.warehouseData.p_is_active = true;
    }
    const usersJson: any[] = Array.of(this.warehouseData);

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
              this.route.navigate(['/systemsetting/submasterwarehouselist/masterwarehousedetail', parse.code]);
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
    this.route.navigate(['/systemsetting/submasterwarehouselist']);
    $('#datatablewarehouse').DataTable().ajax.reload();
  }
  //#endregion button back

  //#region List tabs 
  requestitemwiz() {
    this.route.navigate(['/systemsetting/submasterwarehouselist/masterwarehousedetail/' + this.param + '/masterwarehousedetailwizlist', this.param], { skipLocationChange: true });
  }
  //#endregion List tabs

  //#region btnLookupCity
  btnLookupCity() {
    $('#datatableLookupCity').DataTable().clear().destroy();
    $('#datatableLookupCity').DataTable({
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
          'p_array_data': ''
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerCity, this.APIRouteLookupCity).subscribe(resp => {
          const parse = JSON.parse(resp);

          this.lookupCity = parse.data;
          this.lookupCity.numberIndex = dtParameters.start;

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          })
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      'lengthMenu': [
        [5, 25, 50, 100],
        [5, 25, 50, 100]
      ],
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 3] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;">No Data Available !</p>'
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowCity(code: String, description: String) {
    this.model.city_code = code;
    this.model.city_name = description;
    $('#lookupModalCity').modal('hide');
  }
  //#endregion btnLookupCity

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
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerBranch, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupbranchcode = parse.data;

          if (parse.data != null) {
            this.lookupbranchcode.numberIndex = dtParameters.start;
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
    this.model.branch_code = code;
    this.model.branch_name = name;
    $('#lookupModalBranchCode').modal('hide');
  }
  //#endregion BranchCode lookup

  //#region button Proceed
  btnProceed(code: string) {
    // param tambahan untuk button Proceed dynamic

    this.dataRoleTamp = [{
      'p_code': code,
      'p_company_code': this.company_code,
      'action': 'default'
    }];
    // param tambahan untuk button Proceed dynamic

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
        // call web service
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReturnProceed)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.callGetrow();
                window.location.reload();
                this.showNotification('bottom', 'right', 'success');
                // this.route.navigate(['/mutation/returndetail', this.param]);
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
    });
  }
  //#endregion button Proceed

  //#region button Cancel
  btnCancel(code: string) {
    // param tambahan untuk button Cancel dynamic
    this.dataRoleTamp = [{
      'p_code': code,
      'p_company_code': this.company_code,
      'action': 'default'
    }];
    // param tambahan untuk button Cancel dynamic

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
        // call web service
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReturnCancel)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.callGetrow();
                window.location.reload();
                this.showNotification('bottom', 'right', 'success');
                // this.route.navigate(['/mutation/returndetail', this.param]);
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
    });
  }
  //#endregion button Cancel

  //#region  set datepicker
  getStyles(isTrue: Boolean) {
    if (isTrue) {
      this.setStyle = {
        'pointer-events': 'none',
      }
    } else {
      this.setStyle = {
        'pointer-events': 'auto',
      }
    }

    return this.setStyle;
  }
  //#endregion  set datepicker

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
}