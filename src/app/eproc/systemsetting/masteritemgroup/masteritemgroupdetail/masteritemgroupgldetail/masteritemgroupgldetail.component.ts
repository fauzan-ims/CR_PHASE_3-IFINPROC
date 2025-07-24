import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../../../../../../base.component';
import { DALService } from '../../../../../../DALservice.service';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-root',
  templateUrl: './masteritemgroupgldetail.component.html'
})
export class MasteritemgroupgldetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public masteritemgroupData: any = [];
  public listdimension: any = [];
  public lookupparentcode: any = [];
  public isReadOnly: Boolean = false;
  public lookupapproval: any = [];
  public approval_category_name: String;
  public idIndex: any;
  public isStatus: Boolean;
  public lookupSysDimension: any = [];
  public code: String;
  private dataTamp: any = [];
  public lookuptransactiontype: any = [];
  private dataRoleTamp: any = [];
  public lookupGlLink: any = [];
  public lookupCurrency: any = [];
  public lookupGlExpend: any = [];
  public lookupGlInprogress: any = [];

  //controller
  private APIController: String = 'MasterItemGroupGl';
  private APIControllerJournalGlLink: String = 'JournalGlLink';
  private APIControllerCurrency: String = 'SysCurrency';

  //routing
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForInsert: String = 'Insert';

  private RoleAccessCode = 'R00022700000001A'; // role access 

  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAll: any;

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
    if (this.param != null && this.params != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
    } else {
      this.model.company_code = this.company_code;
      this.showSpinner = false;
      this.model.category = 'FXDAST';
    }
  }

  //#region getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_id': this.params,
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
          this.showSpinner = false;
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion getrow data

  //#region form submit
  onFormSubmit(masteritemgroupglForm: NgForm, isValid: boolean) {
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

    this.masteritemgroupData = masteritemgroupglForm;
    if (this.masteritemgroupData.p_is_active == null) {
      this.masteritemgroupData.p_is_active = true;
    }
    const usersJson: any[] = Array.of(this.masteritemgroupData);

    if (this.param != null && this.params != null) {
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
              this.route.navigate(['/systemsetting/submasteritemgroup/masteritemgldetail', this.param, parse.id]);
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
    this.route.navigate(['/systemsetting/submasteritemgroup/masteritemgroupdetail', this.param]);
    $('#datatable').DataTable().ajax.reload();
  }
  //#endregion button back

  //#region ParentCode Lookup
  btnLookupParentCode() {
    $('#datatableLookupParentCode').DataTable().clear().destroy();
    $('#datatableLookupParentCode').DataTable({
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
          'p_company_code': this.company_code,
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupparentcode = parse.data;

          if (parse.data != null) {
            this.lookupparentcode.numberIndex = dtParameters.start;
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

  btnSelectRowParentCode(code: String, description: String) {
    this.model.parent_code = code;
    this.model.parent_description = description;
    $('#lookupModalParentCode').modal('hide');
  }
  //#endregion MerkCode lookup

  //#region currency lookup
  btnLookupCurrency() {
    $('#datatablelookupCurrency').DataTable().clear().destroy();
    $('#datatablelookupCurrency').DataTable({
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
          //'p_general_code': 'LMPRO'
          'p_company_code': this.company_code
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerCurrency, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupCurrency = parse.data;
          if (parse.data != null) {
            this.lookupCurrency.numberIndex = dtParameters.start;
          }
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API)' + err));
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

  btnSelectRowCurrency(code: String, description: string) {
    this.model.currency_code = code;
    this.model.currency_name = description;
    $('#lookupModalCurrency').modal('hide');
  }
  //#endregion currency lookup

  //#region gl link transaction lookup
  btnLookupGlLink() {
    $('#datatableLookupGlLink').DataTable().clear().destroy();
    $('#datatableLookupGlLink').DataTable({
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
          //'p_general_code': 'LMPRO'
          'p_company_code': this.company_code
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerJournalGlLink, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupGlLink = parse.data;
          if (parse.data != null) {
            this.lookupGlLink.numberIndex = dtParameters.start;
          }
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API)' + err));
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

  btnSelectRowGlLink(code: String, description: string) {
    this.model.gl_asset_code = code;
    this.model.gl_asset_name = description;
    $('#lookupModalGlLink').modal('hide');
  }
  //#endregion gl link transaction lookup

  //#region gl Expend lookup
  btnLookupGlExpend() {
    $('#datatableLookupGlExpend').DataTable().clear().destroy();
    $('#datatableLookupGlExpend').DataTable({
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
          //'p_general_code': 'LMPRO'
          'p_company_code': this.company_code
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerJournalGlLink, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupGlExpend = parse.data;
          if (parse.data != null) {
            this.lookupGlExpend.numberIndex = dtParameters.start;
          }
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API)' + err));
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

  btnSelectRowGlExpend(code: String, description: string) {
    this.model.gl_expend_code = code;
    this.model.gl_expend_name = description;
    $('#lookupModalGlExpend').modal('hide');
  }
  //#endregion gl Expend lookup

  //#region gl link lookup
  btnLookupGlInprogress() {
    $('#datatableLookupGlInprogress').DataTable().clear().destroy();
    $('#datatableLookupGlInprogress').DataTable({
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
          //'p_general_code': 'LMPRO'
          'p_company_code': this.company_code
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerJournalGlLink, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupGlInprogress = parse.data;
          if (parse.data != null) {
            this.lookupGlInprogress.numberIndex = dtParameters.start;
          }
          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API)' + err));
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

  btnSelectRowGlInprogress(code: String, description: string) {
    this.model.gl_inprogress_code = code;
    this.model.gl_inprogress_name = description;
    $('#lookupModalGlInprogress').modal('hide');
  }
  //#endregion gl link lookup

  //#region ddl category
  CategoryType(event: any) {
    this.model.category = event.target.value;
    this.model.gl_inprogress_code = '';
    this.model.gl_inprogress_name = '';
    this.model.gl_asset_code = '';
    this.model.gl_asset_name = '';
    this.model.gl_expend_code = '';
    this.model.gl_expend_name = '';
  }
  //#endregion ddl category
}