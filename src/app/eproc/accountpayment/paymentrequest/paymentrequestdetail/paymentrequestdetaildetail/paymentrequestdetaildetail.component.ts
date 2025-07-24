import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../base.component';
import { DALService } from '../../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './paymentrequestdetaildetail.component.html'
})

export class PaymentRequestDetaildetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');

  // variable
  public NumberOnlyPattern: string = this._numberonlyformat;
  public isReadOnly: Boolean = false;
  public listdetail: any = [];
  private rolecode: any = [];
  private setStyle: any = [];
  private dataRoleTamp: any = [];
  public payRegDetailData: any = [];
  public lookupitemcode: any = [];
  public lookupbranchcode: any = [];
  public lookupuomcode: any = [];
  public lookupvendor: any = [];
  public lookuprequestorcode: any = [];
  public lookupcurrencycode: any = [];
  private dataTamp: any = [];
  public tampdHidden: Boolean;

  private APIController: String = 'PaymentRequestDetail';
  private APIControllerPaymentRequest: String = 'PaymentRequest';
  private APIControllerBaseItemCode: String = 'MasterItem';
  private APIControllerBranch: String = 'MasterBranch';
  private APIControllerVendor: String = 'MasterVendor';
  private APIControllerSysUomCode: String = 'MasterUom';
  private APIControllerRequestor: String = 'SysCompanyUserMain';
  private APIControllerSysCurrencyCode: String = 'SysCurrency';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';

  private RoleAccessCode = 'R00021640000000A';

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
    this.Delimiter(this._elementRef);
    if (this.params !== null) {
      this.isReadOnly = true;
      // call web service
      this.callGetrow();
      this.getStatusHeader();
    } else {
      this.tampdHidden = false;
      this.showSpinner = false;
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

          // checkbox is active
          if (parsedata.is_paid === '1') {
            parsedata.is_paid = true;
          } else {
            parsedata.is_paid = false;
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

  //#region getStatusHeader
  getStatusHeader() {
    this.dataTamp = [{
      'p_code': this.param
    }];
    this.dalservice.Getrow(this.dataTamp, this.APIControllerPaymentRequest, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = parse.data[0];

          if (parsedata.status !== 'HOLD') {
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
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion getStatusHeader

  //#region  form submit
  onFormSubmit(payRegDetailForm: NgForm, isValid: boolean) {
    // validation form submit
    if (!isValid) {
      swal({
        allowOutsideClick: false,
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

    this.payRegDetailData = payRegDetailForm;
    this.payRegDetailData = this.JSToNumberFloats(payRegDetailForm)
    if (this.payRegDetailData.p_is_active == null) {
      this.payRegDetailData.p_is_active = false;
    }
    const usersJson: any[] = Array.of(this.payRegDetailData);
    if (this.param != null && this.params != null) {
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
              this.route.navigate(['/accountpayable/subpaymentrequestlist/paymentrequestdetaildetail', this.param, parse.id]);
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
    $('#datatablePaymentRequestdetail').DataTable().ajax.reload();
    this.route.navigate(['/accountpayable/subpaymentrequestlist/paymentrequestdetail', this.param]);
  }
  //#endregion button back

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


}
