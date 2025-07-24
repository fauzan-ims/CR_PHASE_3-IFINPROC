import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './verificationitemwizlist.component.html'
})

export class VerificationitemwizComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2');
  // variable
  public listrequestitem: any = [];
  private rolecode: any = [];
  public tampHiddenStatus: Boolean;
  private dataRoleTamp: any = [];
  public datatamplist: any = [];
  private dataTamp: any = [];
  private dataTampPush: any = [];
  private APIController: String = 'ProcurementRequestItem';
  private APIRouteForUpdateApprove: String = 'ExecSpForUpdateApproved';
  private APIControllerHeader: String = 'ProcurementRequest';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForGetDelete: String = 'Delete';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';
  private RoleAccessCode = 'R00021530000000A';

  // checklist
  public selectedAll: any;
  private checkedList: any = [];

  // spinner
  showSpinner: Boolean = false;
  // end

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  is_latest: any;

  constructor(private dalservice: DALService,
    private _location: Location,
    public route: Router,
    public getRouteparam: ActivatedRoute,
    private _elementRef: ElementRef) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.compoSide('', this._elementRef, this.route);
    this.loadData();
    this.callGetrowHeader();
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
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_code': this.param,
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.listrequestitem = parse.data;

          if (parse.data != null) {
            this.listrequestitem.numberIndex = dtParameters.start;
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
    }
  }
  //#endregion load all data

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

          if (parsedata.status != 'ON VERIFIED') {
            this.tampHiddenStatus = true;
          } else {
            this.tampHiddenStatus = false;
          }
          this.showSpinner = false;
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion getrow data

  //#region button add
  btnAdd() {
    this.route.navigate(['/transaction/subverification/verificationitemwizdetail/' + this.param + '/verificationitemwizdetail', this.param], { skipLocationChange: true });
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/transaction/subverification/verificationitemwizdetail/' + this.param + '/verificationitemwizdetail', this.param, codeEdit], { skipLocationChange: true });
  }
  //#endregion button edit

  //#region checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.listrequestitem.length; i++) {
      if (this.listrequestitem[i].selected) {
        this.checkedList.push(this.listrequestitem[i].id);
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
    this.dataTampPush = [];
    swal({
      allowOutsideClick: false,
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'Yes',
      buttonsStyling: false
    }).then((result) => {
      this.showSpinner = true;
      if (result.value) {
        for (let J = 0; J < this.checkedList.length; J++) {
          // param tambahan untuk getrow dynamic
          this.dataTampPush.push({
            'p_id': this.checkedList[J]
          });
          // end param tambahan untuk getrow dynamic
          this.dalservice.Delete(this.dataTampPush, this.APIController, this.APIRouteForGetDelete)
            .subscribe(
              res => {
                $('#clientDetail', parent.document).click();
                this.showSpinner = false;
                this.showNotification('top', 'right', 'success');
                $('#datatableitem').DataTable().ajax.reload();
              },
              error => {
                const parse = JSON.parse(error);
                this.swalPopUpMsg(parse.data);
              });
        }
      } else {
        this.showSpinner = false;
      }
    });
  }

  selectAllTable() {
    for (let i = 0; i < this.listrequestitem.length; i++) {
      this.listrequestitem[i].selected = this.selectedAll;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAll = this.listrequestitem.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkbox all table

  //#region onBlur
  onBlur(event, i, type) {
    if (type === 'amount') {
      if (event.target.value.match('[0-9]+(,[0-9]+)')) {
        if (event.target.value.match('(\.\d+)')) {

          event = '' + event.target.value;
          event = event.trim();
          event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        } else {
          event = '' + event.target.value;
          event = event.trim();
          event = parseFloat(event.replace(/,/g, '')).toFixed(2); // ganti jadi 6 kalo mau pct
          event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        }
      } else {
        event = '' + event.target.value;
        event = event.trim();
        event = parseFloat(event).toFixed(2); // ganti jadi 6 kalo mau pct
        event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
      }
    } else {
      event = '' + event.target.value;
      event = event.trim();
      event = parseFloat(event).toFixed(6);
    }

    if (event === 'NaN') {
      event = 0;
      event = parseFloat(event).toFixed(2);
    }

    if (type === 'amount') {
      $('#approved_quantity' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#approved_quantity' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onBlur

  //#region onFocus
  onFocus(event, i, type) {
    event = '' + event.target.value;

    if (event != null) {
      event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
    }

    if (type === 'amount') {
      $('#approved_quantity' + i)
        .map(function () { return $(this).val(event); }).get();
    } else {
      $('#approved_quantity' + i)
        .map(function () { return $(this).val(event); }).get();
    }
  }
  //#endregion onFocus

  //#region button save in list
  btnSaveList() {

    this.showSpinner = true;
    this.datatamplist = [];
    let j = 0;

    const getID = $('[name="p_id"]')
      .map(function () { return $(this).val(); }).get();

    const getApproveQuantity = $('[name="p_approved_quantity"]')
      .map(function () { return $(this).val(); }).get();

    while (j < getID.length) {

      while (j < getApproveQuantity.length) {

        this.datatamplist.push(
          this.JSToNumberFloats({
            p_id: getID[j],
            p_approved_quantity: getApproveQuantity[j],
          }));
        j++;
      }

      j++;
    }

    //#region web service
    this.dalservice.Update(this.datatamplist, this.APIController, this.APIRouteForUpdateApprove)
      .subscribe(
        res => {
          this.showSpinner = false;
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            this.showSpinner = false;
            this.showNotification('bottom', 'right', 'success');
            $('#datatableitem').DataTable().ajax.reload();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
    //#endregion web service

  }
  //#endregion button save in list
}
