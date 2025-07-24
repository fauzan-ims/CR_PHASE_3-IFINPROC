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
  templateUrl: './biddingrequestdetail.component.html'
})
export class BiddingRequestdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');

  // variable
  public biddingrequestData: any = [];
  public listdimension: any = [];
  public isReadOnly: Boolean = false;
  public lookupapproval: any = [];
  public approval_category_name: String;
  public isStatus: Boolean;
  public lookupSysDimension: any = [];
  public code: String;
  private dataTamp: any = [];
  private dataRoleTamp: any = [];

  private APIController: String = 'InterfaceBiddingRequest';
  private APIRouteForUpdateSatus: String = 'ExecSpForUpdateStatus';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForInsert: String = 'Insert';

  private RoleAccessCode = 'R00021700000000A'; // role access 

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
    if (this.param != null) {
      this.isReadOnly = true;

      // call web service
      this.callGetrow();
      this.wizard();
      this.biddingrequestdetailwiz();
    } else {
      this.model.company_code = this.company_code;
      this.showSpinner = false;
    }
  }

  //#region getrow data
  callGetrow() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_id': this.param
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
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion getrow data

  //#region button back
  btnBack() {
    this.route.navigate(['/interface/subinterfacebiddingrequest']);
    $('#datatable').DataTable().ajax.reload();
  }
  //#endregion button back

  //#region List tabs
  biddingrequestdetailwiz() {
    this.route.navigate(['/interface/subinterfacebiddingrequest/biddingrequestdetail/' + this.param + '/' + this.params + '/biddingrequestdetailwizlist', this.param, this.params], { skipLocationChange: true });
  }
  //#endregion List tabs

}