import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './requestitemwizdetail.component.html'
})

export class RequestitemwizdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');
  paramHidden = this.getRouteparam.snapshot.paramMap.get('id3');

  // variable
  public CurrencyFormat = this._currencyformat;
  public NumberOnlyPattern = this._numberonlyformat;
  public itemgroupData: any = [];
  public isReadOnly: Boolean = false;
  public tampHiddenStatus: Boolean = false;
  public lookupitemcode: any = [];
  public lookuptransactiontype: any = [];
  private dataTamp: any = [];
  public lookupfacode: any = [];
  public procurement_type: String;
  public is_reimburse: String;
  private dataRoleTamp: any = [];
  public tampStatusType: Boolean = false;
  public tampStatusRecomm: Boolean = false;
  public branchcode: String;

  //controller
  private APIController: String = 'ProcurementRequestItem';
  private APIControllerHeader: String = 'ProcurementRequest';
  private APIControllerBaseItemCode: String = 'MasterItem';
  private APIControllerFACode: String = 'Asset';

  //route
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForInsert: String = 'INSERT';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForLookup: String = 'GetRowsForLookupProcurementRequest';
  private APIRouteForLookupFACode: String = 'GetRowsForLookup';
  private APIRouteForLookupAssetMobilization: String = 'GetRowsForLookupAssetMobilization';
  private APIRouteForValidateAssetMobilization: String = 'ExecSpForValidateAssetMobilization';
  private RoleAccessCode = 'R00021520000000A';

  // form 2 way binding
  model: any = {};

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
    private _elementRef: ElementRef
  ) { super(); }

  ngOnInit() {
    this.Delimiter(this._elementRef);
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    if (this.params != null) {
      this.isReadOnly = true;
      // call web service
      this.callGetrow();
      this.callGetrowHeader();
    } else {
      this.callGetrowHeader();
      this.showSpinner = false;
      this.model.subvention_amount = 0;
      this.model.condition = 'NEW';
    }
  }

  //#region getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_id': this.params
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];

          // checkbox
          if (parsedata.is_bbn === '1') {
            parsedata.is_bbn = true;
            this.tampStatusType = true;
          } else {
            parsedata.is_bbn = false;
            this.tampStatusType = false;
          }

          if (parsedata.is_recom === '1') {
            parsedata.is_recom = true;
            this.tampStatusRecomm = true;
          } else {
            parsedata.is_recom = false;
            this.tampStatusRecomm = false;
          }


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

  //#region getrow data
  callGetrowHeader() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param,
      'p_company_code': this.company_code
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIControllerHeader, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);

          if (parsedata.status !== 'HOLD') {
            this.tampHiddenStatus = true;
          } else {
            this.tampHiddenStatus = false;
          }

          this.procurement_type = parsedata.procurement_type
          this.is_reimburse = parsedata.is_reimburse
          this.branchcode = parsedata.branch_code;

          this.showSpinner = false;

        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion getrow data

  //#region  form submit
  onFormSubmit(masteritemgroupForm: NgForm, isValid: boolean) {
    // validation form submit
    if (!isValid) {
      swal({
        allowOutsideClick: false,
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

    this.itemgroupData = this.JSToNumberFloats(masteritemgroupForm);
    this.itemgroupData.p_procurement_request_code = this.param;

    if (this.itemgroupData.p_is_bbn == null || this.itemgroupData.p_is_bbn === '') {
      this.itemgroupData.p_is_bbn = false;
    }

    const usersJson: any[] = Array.of(this.itemgroupData);

    this.dataRoleTamp = [{
      'p_is_reimburse': this.is_reimburse,
      'p_fa_code': this.itemgroupData.p_fa_code,
      'action': 'default'
    }];

    this.dalservice.ExecSpAms(this.dataRoleTamp, this.APIControllerFACode, this.APIRouteForValidateAssetMobilization)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          if (parse.result === 1) {

            if (this.params != null) {
              // call web service
              this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
                .subscribe(
                  res => {
                    this.showSpinner = false;
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                      this.callGetrow();
                      this.showNotification('bottom', 'right', 'success');
                    } else {
                      this.swalPopUpMsg(parse.data);
                    }
                  },
                  error => {
                    this.showSpinner = false;
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data)
                  });
            } else {
              // call web service
              this.dalservice.Insert(usersJson, this.APIController, this.APIRouteForInsert)
                .subscribe(
                  res => {
                    this.showSpinner = false;
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                      $('#clientDetail', parent.document).click();
                      this.showNotification('bottom', 'right', 'success');
                      this.route.navigate(['/transaction/subprocurementrequest/procurementrequestdetail/' + this.param + '/requestitemwizdetail', this.param, parse.id], { skipLocationChange: true });
                    } else {
                      this.swalPopUpMsg(parse.data);
                    }
                  },
                  error => {
                    this.showSpinner = false;
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data)
                  });
            }

          } else {
            this.swalPopUpMsg(parse.data);
            this.showSpinner = false;
          }
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion form submit

  //#region button back
  btnBack() {
    this.route.navigate(['/transaction/subprocurementrequest/procurementrequestdetail/' + this.param + '/requestitemwizlist', this.param], { skipLocationChange: true });
    $('#datatableitem').DataTable().ajax.reload();
  }
  //#endregion button back

  //#region ItemCode Lookup
  btnLookupItemCode() {
    $('#datatableLookupItemCode').DataTable().clear().destroy();
    $('#datatableLookupItemCode').DataTable({
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
          'p_procurement_request_code': this.param,
          'p_procurement_type': this.procurement_type,
          'action': 'getResponse'
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.ExecSpBam(dtParameters, this.APIControllerBaseItemCode, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);

          this.lookupitemcode = parse.data;

          if (parse.data != null) {
            this.lookupitemcode.numberIndex = dtParameters.start;
          }

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
    });
  }

  btnSelectRowItemCode(code: String, name: String, uom_code: String, uom_name: String, type_asset_code: String, item_category_code: String, item_category_name: String
    , item_merk_code: String, item_merk_name: String, item_model_code: String, item_model_name: String, item_type_code: String, item_type_name: String, category_type: String) {
    this.model.item_code = code;
    this.model.item_name = name;
    this.model.uom_code = uom_code;
    this.model.uom_name = uom_name;
    this.model.category_type = category_type;
    // this.model.type_asset_code = type_asset_code;
    // this.model.item_category_code = item_category_code;
    // this.model.item_category_name = item_category_name;
    // this.model.item_merk_code = item_merk_code;
    // this.model.item_merk_name = item_merk_name;
    // this.model.item_model_code = item_model_code;
    // this.model.item_model_name = item_model_name;
    // this.model.item_type_code = item_type_code;
    this.model.item_type_name = item_type_name;
    $('#lookupModalItemCode').modal('hide');
  }
  //#endregion ItemCode lookup

  //#region FACode Lookup
  btnLookupFixedAsset() {
    $('#datatableLookupFACode').DataTable().clear().destroy();
    $('#datatableLookupFACode').DataTable({
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
          'p_branch_code': this.branchcode,
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.GetrowsAms(dtParameters, this.APIControllerFACode, this.APIRouteForLookupAssetMobilization).subscribe(resp => {
          const parse = JSON.parse(resp);

          this.lookupfacode = parse.data;

          if (parse.data != null) {
            this.lookupfacode.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 5] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowFACode(code: String, item_name: String, engine_no: String, chassis_no: String, plat_no: String) {
    this.model.fa_code = code;
    this.model.fa_name = item_name;
    this.model.engine_no = engine_no;
    this.model.chassis_no = chassis_no;
    this.model.plat_no = plat_no;
    $('#lookupModalFixedAsset').modal('hide');
  }
  //#endregion FACode lookup

  //#region Spesific Address
  SpesificAddress(event: any) {
    this.tampStatusType = event.target.checked;
  }
  //#endregion Spesific Address

  //#region Spesific Address
  Recomm(event: any) {
    this.tampStatusRecomm = event.target.checked;
  }
  //#endregion Spesific Address
}
