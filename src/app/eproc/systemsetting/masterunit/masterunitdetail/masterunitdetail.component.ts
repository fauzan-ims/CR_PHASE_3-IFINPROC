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
  templateUrl: './masterunitdetail.component.html'
})
export class MasterunitdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public masterdepartmentData: any = [];
  public listdimension: any = [];
  public lookupdivisioncode: any = [];
  public lookupsubdepartmentcode: any = [];
  public isReadOnly: Boolean = false;
  public lookupapproval: any = [];
  public approval_category_name: String;
  public idIndex: any;
  public isStatus: Boolean;
  public lookupSysDimension: any = [];
  public code: String;
  private dataTamp: any = [];
  public lookupdepartmentcode: any = [];
  private idDetailForColumn: any;

  private APIController: String = 'MasterUnit';
  private APIControllerSysDivisionCode: String = 'MasterDivision';
  private APIControllerSysDepartmentCode: String = 'MasterDepartment';
  private APIControllerSubDepartmentCode: String = 'MasterSubDepartment';
  
  private APIRouteLookupDimension: String = 'GetRowsForLookup';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForDelete: String = 'DELETE';
  private APIRouteForSync: String = 'ExecSpForSync';

  private RoleAccessCode = 'R00011530000000A'; // role access 

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
  onFormSubmit(mastersubdepartmentForm: NgForm, isValid: boolean) {
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

    this.masterdepartmentData = mastersubdepartmentForm;
    if (this.masterdepartmentData.p_is_active == null) {
      this.masterdepartmentData.p_is_active = false;
    }
    const usersJson: any[] = Array.of(this.masterdepartmentData);

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
              this.route.navigate(['/systemsetting/submasterunit/masterunitdetail', parse.code]);
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
    this.route.navigate(['/systemsetting/submasterunit']);
    $('#datatable').DataTable().ajax.reload();
  }
  //#endregion button back

  //#region DivisionCode Lookup
  btnLookupDivisionCode() {
    $('#datatableLookupDivisionCode').DataTable().clear().destroy();
    $('#datatableLookupDivisionCode').DataTable({
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
        this.dalservice.Getrows(dtParameters, this.APIControllerSysDivisionCode, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupdivisioncode = parse.data;

          if (parse.data != null) {
            this.lookupdivisioncode.numberIndex = dtParameters.start;
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

  btnSelectRowDivisionCode(code: String) {
    this.model.division_code = code;
     
    this.model.department_code = undefined;
    this.model.sub_department_code = undefined;
    $('#lookupModalDivisionCode').modal('hide');
  }
  //#endregion DivisionCode lookup

  //#region DepartmentCode Lookup
  btnLookupDepartmentCode(divisionCode: String) {
    $('#datatableLookupDepartmentCode').DataTable().clear().destroy();
    $('#datatableLookupDepartmentCode').DataTable({
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
          'p_division_code': divisionCode,
          'action': 'getResponse'
        });
 
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerSysDepartmentCode, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupdepartmentcode = parse.data;

          if (parse.data != null) {
            this.lookupdepartmentcode.numberIndex = dtParameters.start;
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

  btnSelectRowDepartmentCode(code: String) {
    this.model.department_code = code;
    this.model.sub_department_code = undefined;
    $('#lookupModalDepartmentCode').modal('hide');
  }
  //#endregion DepartmentCode lookup

 //#region Sub DepartmentCode Lookup
 btnLookupSubDepartmentCode(divisionCode: String, departmentCode: String) {
  $('#datatableLookupSubDepartmentCode').DataTable().clear().destroy();
  $('#datatableLookupSubDepartmentCode').DataTable({
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
        'p_division_code': divisionCode,
        'p_department_code': departmentCode,
        'action': 'getResponse'
      });
 
      // end param tambahan untuk getrows dynamic
      this.dalservice.Getrows(dtParameters, this.APIControllerSubDepartmentCode, this.APIRouteForLookup).subscribe(resp => {
        const parse = JSON.parse(resp);
        
        this.lookupsubdepartmentcode = parse.data;
 
        if (parse.data != null) {
          this.lookupsubdepartmentcode.numberIndex = dtParameters.start;
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

btnSelectRowSubDepartmentCode(code: String) {
  this.model.sub_department_code = code;
  $('#lookupModalSubDepartmentCode').modal('hide');
}
//#endregion Sub DepartmentCode lookup


}