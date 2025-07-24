import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import swal from 'sweetalert2';
import { DALService } from '../../../../../DALservice.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-reportlist',
  templateUrl: './reportlist.component.html'
})
export class ReportlistComponent extends BaseComponent implements OnInit {
  // variable
  public listreport: any = [];
  public pageType: String;
  public screenName: String;
  
  private reportType: String;
  private APIController: String = 'SysReport';
  private APIRouteForGetRows: String = 'GetRows';
  // private RoleAccessCode = 'R00003500000000A';
  // private RoleAccessCode = 'R00024250000001A';
  private RoleAccessCodeManagement = 'R00024300000001A';
  private RoleAccessCodeTransaction = 'R00024310000001A';
  

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dalservice: DALService, public route: Router,
    public getRouteparam: ActivatedRoute,
    private _location: Location,
    private _elementRef: ElementRef) { super(); }

  ngOnInit() {
    this.compoSide(this._location, this._elementRef, this.route);
    // this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.getRouteparam.url.subscribe(url => this.pageType = url[0].path);
    if (this.pageType === 'subreportmanagementlist') {
      this.screenName = 'Management List';
      this.reportType = 'MANAGEMENT';
      this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCodeManagement, this.route);
    } else {
      this.screenName = 'Transaction List';
      this.reportType = 'TRANSACTION';
      this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCodeTransaction, this.route);
    }
    // this.callGetRole('');
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
        
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_report_type': this.reportType
        });
        
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.listreport = parse.data;

          if (parse.data != null) {
            this.listreport.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 3] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region button edit
  btnEdit(codeEdit: string, screenName: string) {
    this.route.navigate(['/report/' + this.pageType + '/' + screenName, codeEdit, this.pageType]);
  }
  //#endregion button edit

}

