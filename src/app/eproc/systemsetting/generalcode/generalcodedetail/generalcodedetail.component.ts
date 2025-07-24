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
  templateUrl: './generalcodedetail.component.html'
})

export class GeneralcodedetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public generalcodeData: any = [];
  public generalsubcodelist: any = [];
  public isReadOnly: Boolean = false;
  private dataTamp: any = [];
  private dataRoleTamp: any = [];
  private APIController: String = 'SysGeneralCode';
  private APIControllerSysGeneralSubCode: String = 'SysGeneralSubCode';
  private APIRouteGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForEditable: String = 'ExecSpForEditable';
  private RoleAccessCode = 'R00021460000000A';

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
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
    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
      this.loadData();
    } else {
      this.model.is_editable = true;
      this.showSpinner = false;
      this.model.company_code = this.company_code;
    }
  }

  //#region btnEditable
  btnEditable() {
    // param tambahan untuk getrole dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForEditable)
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
  //#endregion btnEditable

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
          'p_general_code': this.param
        });
        // end param tambahan untuk getrows dynamic

        // tslint:disable-next-line:max-line-length
        this.dalservice.Getrows(dtParameters, this.APIControllerSysGeneralSubCode, this.APIRouteGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.generalsubcodelist = parse.data;

          if (parse.data != null) {
            this.generalsubcodelist.numberIndex = dtParameters.start;
          }
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      order: [['4', 'asc']],
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
          if (parsedata.is_editable === '1') {
            parsedata.is_editable = true;
          } else {
            parsedata.is_editable = false;
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
  onFormSubmit(generalcodeForm: NgForm, isValid: boolean) {
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

    this.generalcodeData = generalcodeForm;
    if (this.generalcodeData.p_is_editable == null) {
      this.generalcodeData.p_is_editable = false
    }
    this.generalcodeData.p_company_code = this.company_code;
    const usersJson: any[] = Array.of(this.generalcodeData);
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
              this.route.navigate(['/systemsetting/subgeneralcodelistsetting/generalcodedetail', this.generalcodeData.p_code]);
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
    this.route.navigate(['/systemsetting/subgeneralcodelistsetting']);
  }
  //#endregion button back

  //#region button add
  btnAdd() {
    this.route.navigate(['/systemsetting/subgeneralcodelistsetting/generalsubcodedetail', this.param]);
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/systemsetting/subgeneralcodelistsetting/generalsubcodedetail', this.param, codeEdit]);
  }
  //#endregion button edit
}
