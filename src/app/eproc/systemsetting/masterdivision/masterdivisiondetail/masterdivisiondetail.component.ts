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
  templateUrl: './masterdivisiondetail.component.html'
})
export class MasterdivisiondetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id'); 

  // variable
  public masterdivisionData: any = [];
  public listdimension: any = [];
  public isReadOnly: Boolean = false;
  public lookupapproval: any = [];
  public approval_category_name: String;
  public idIndex: any;
  public isStatus: Boolean;
  public lookupSysDimension: any = [];
  public code: String;
  private dataTamp: any = [];
  private dataTampPush: any = [];
  private idDetailForColumn: any;

  private APIController: String = 'MasterDivision';
  private APIControllerDimension: String = 'MasterApprovalDimension';
  private APIControllerApproval: String = 'MasterApprovalCategory';
  private APIControllerLookupDimension: String = 'SysDimension';

  private APIRouteLookupDimension: String = 'GetRowsForLookup';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForDelete: String = 'DELETE';
  private APIRouteForSync: String = 'ExecSpForSync';

  private RoleAccessCode = 'R00011500000000A'; // role access 

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
    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
     } else {
      this.model.type = 'TABLE';
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
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion getrow data
 
  //#region form submit
  onFormSubmit(masterdivisionForm: NgForm, isValid: boolean) {
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

    this.masterdivisionData = masterdivisionForm;
    if (this.masterdivisionData.p_is_active == null) {
      this.masterdivisionData.p_is_active = false;
    }
    const usersJson: any[] = Array.of(this.masterdivisionData);
    
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
              this.route.navigate(['/systemsetting/submasterdivision/masterdivisiondetail', parse.code]);
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
     this.route.navigate(['/systemsetting/submasterdivision']);
    $('#datatable').DataTable().ajax.reload();
  }
  //#endregion button back

}