import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../../../../../../base.component';
import { DALService } from '../../../../../../DALservice.service';
import { DataTableDirective } from 'angular-datatables';

declare var $: any;

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './supplierselectionapproval.component.html'
})

export class SupplierSelectionApprovalComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public supplierCollectionList: any = [];
  public supplierColDetailList: any = [];
  public isReadOnly: Boolean = false;
  private dataTamp: any = [];
  private dataTampPush: any[];
  public tampdHidden: Boolean;
  public isDisabled: Boolean;
  public isDisabled2: Boolean;
  private setStyle: any = [];
  private dataRoleTamp: any = [];
  private datatamplist: any = [];
  public lookupdivisioncode: any = [];
  public lookupsubdepartmentcode: any = [];
  public lookupdepartmentcode: any = [];
  public lookupTax: any = [];
  public lookupunitcode: any = [];
  public lookupbranchcode: any = [];
  public lookupvendor: any = [];
  public lookupvendorwithquotation: any = [];
  public lookuprequestorcode: any = [];
  private idDetailForReason: any;
  public listdataDetail: any = [];
  public QuotationCode: String;
  public QuotationDetailId: any = [];
  public QuotationId1: String;
  public QuotationId2: String;
  public QuotationId3: String;
  public photolist: any = [];
  public QuotationCode1: String;
  public quotationReviewDetailList: any = [];
  public quotationReviewVendorList: any = [];


  private APIController: String = 'SupplierSelection';
  private APIControllerSupplierSelectionDetail: String = 'SupplierSelectionDetail';
  private APIControllerQuota: String = 'QuotationReviewDetail';
  private APIControllerDocumentQuotation: String = 'QuotationReviewDocument';
  private APIControllerQuoVendor: String = 'QuotationReviewVendor';
  private APIControllerDocumentSupplier: String = 'SupplierSelectionDocument';


  private APIRouteGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForGetRowObjectInfo: String = 'GetRowObjectInfo';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForPriviewFile: String = 'Priview';
  private RoleAccessCode = '';

  // form 2 way binding
  model: any = {};
  modelQuotaion1: any = {};
  modelQuotaion2: any = {};
  modelQuotaion3: any = {};

  // checklist
  public selectedAllTable: any;
  private checkedList: any = [];

  // spinner
  showSpinner: Boolean = true;
  // end

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtOptionsDoc: DataTables.Settings = {};
  dtOptionsQuo: DataTables.Settings = {};
  dtOptionsQuoVendor: DataTables.Settings = {};

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
      this.loadDataQuotation();
      this.loadDataQuotationVendor();
      this.loadDataDoc();
      this.callGetrowObjectInfo();

    } else {
      this.showSpinner = false;
      this.tampdHidden = false;
      this.model.company_code = this.company_code;
      this.model.status = "HOLD";
    }
  }

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
          const parsedata = this.getrowNgb(parse.data[0]);

          if (parsedata.status !== 'HOLD') {
            this.tampdHidden = true;
          } else {
            this.tampdHidden = false;
          }

          if (parsedata.quotation_code != '') {
            this.isDisabled = true;
          } else {
            this.isDisabled = false;
          }

          if (parsedata.quotation_code == '') {
            this.isDisabled2 = true;
          } else {
            this.isDisabled2 = false;
          }
          this.QuotationCode = parsedata.quotation_code;

          // mapper dbtoui
          Object.assign(this.model, parsedata);
          // end mapper dbtoui
          // $('#datatablerequestdoc').DataTable().ajax.reload();
          // $('#datatablesuppliercoldetail').DataTable().ajax.reload();

          // this.callGetrowObjectInfo();

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion getrow data

  //#region getrow data
  callGetrowObjectInfo() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRowObjectInfo)
      .subscribe(
        res => {

          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data);

          this.QuotationCode1 = parsedata[0].quotation_review_code;

          // mapper dbtoui
          Object.assign(this.model, parsedata);
          // end mapper dbtoui

          setTimeout(() => {
            $('#datatablesquotationreview').DataTable().ajax.reload();
            $('#datatablesquotationvendor').DataTable().ajax.reload();
            $('#datatablesuppliercoldetail').DataTable().ajax.reload();
            $('#datatablerequestdoc').DataTable().ajax.reload();
          }, 500);

          // $('#datatablesquotationreview').DataTable().ajax.reload();
          // $('#datatablesquotationvendor').DataTable().ajax.reload();
          // $('#datatablesuppliercoldetail').DataTable().ajax.reload();
          // $('#datatablerequestdoc').DataTable().ajax.reload();


          // this.callGetrowQuotation1();
          // this.callGetrowQuotation2();
          // this.callGetrowQuotation3();

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion getrow data

  //#region getrow data
  callGetrowQuotation1() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_id': this.QuotationId1
    }];
    // end param tambahan untuk getrow dynamic

    // this._widgetdetailService.WidgetDetailGetrow(this.dataTamp)
    this.dalservice.Getrow(this.dataTamp, this.APIControllerQuota, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedataquotation1 = this.getrowNgb(parse.data[0]);

          if (parsedataquotation1.status != 'HOLD') {
            this.tampdHidden = true;
          } else {
            this.tampdHidden = false;
          }
          // mapper dbtoui
          Object.assign(this.modelQuotaion1, parsedataquotation1);
          // end mapper dbtoui

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion getrow data

  //#region getrow data
  callGetrowQuotation2() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_id': this.QuotationId2
    }];
    // end param tambahan untuk getrow dynamic

    // this._widgetdetailService.WidgetDetailGetrow(this.dataTamp)
    this.dalservice.Getrow(this.dataTamp, this.APIControllerQuota, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedataquotation2 = this.getrowNgb(parse.data[0]);

          if (parsedataquotation2.status != 'HOLD') {
            this.tampdHidden = true;
          } else {
            this.tampdHidden = false;
          }
          // mapper dbtoui
          Object.assign(this.modelQuotaion2, parsedataquotation2);
          // end mapper dbtoui

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion getrow data

  //#region getrow data
  callGetrowQuotation3() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_id': this.QuotationId3
    }];
    // end param tambahan untuk getrow dynamic

    // this._widgetdetailService.WidgetDetailGetrow(this.dataTamp)
    this.dalservice.Getrow(this.dataTamp, this.APIControllerQuota, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedataquotation3 = this.getrowNgb(parse.data[0]);

          if (parsedataquotation3.status != 'HOLD') {
            this.tampdHidden = true;
          } else {
            this.tampdHidden = false;
          }
          // mapper dbtoui
          Object.assign(this.modelQuotaion3, parsedataquotation3);
          // end mapper dbtoui

          this.showSpinner = false;
        },
        error => {
          console.log('There was an error while Retrieving Data(API) !!!' + error);
        });
  }
  //#endregion getrow data

  //#region load all data
  loadData() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      responsive: true,
      serverSide: true,
      processing: true,
      lengthChange: false, // hide lengthmenu
      paging: true,
      'lengthMenu': [
        [10, 25, 50, 100],
        [10, 25, 50, 100]
      ],
      ajax: (dtParameters: any, callback) => {
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_selection_code': this.param
        });
        // end param tambahan untuk getrows dynamic

        // tslint:disable-next-line:max-line-length
        this.dalservice.Getrows(dtParameters, this.APIControllerSupplierSelectionDetail, this.APIRouteGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.supplierColDetailList = parse.data;

          if (parse.data != null) {
            this.supplierColDetailList.numberIndex = dtParameters.start;
          }

          // if use checkAll use this
          $('#checkalltable').prop('checked', false);
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
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region button back
  btnBack() {
    $('#datatablesuppliercol').DataTable().ajax.reload();
    this.route.navigate(['/transaction/subsupplierselectionlist']);
  }
  //#endregion button back

  //#region button add
  btnAdd() {
    this.route.navigate(['/transaction/subsupplierselectionlist/supplierselectiondetaildetail', this.param]);
  }
  //#endregion button add

  //#region button edit
  btnEdit(codeEdit: string) {
    this.route.navigate(['/objectinfosupplierselection/quotationapproval', this.param, codeEdit]);
  }
  //#endregion button edit

  //#region button edit
  btnEditVendor(codeEdit: string) {
    this.route.navigate(['/objectinfosupplierselection/quotationvendorapproval', this.param, codeEdit]);
  }
  //#endregion button edit

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

  //#region load all data
  loadDataDoc() {
    this.dtOptionsDoc = {
      pagingType: 'full_numbers',
      responsive: true,
      serverSide: true,
      processing: true,
      paging: true,
      'lengthMenu': [
        [10, 25, 50, 100],
        [10, 25, 50, 100]
      ],
      ajax: (dtParameters2: any, callback) => {
        // param tambahan untuk getrows dynamic
        dtParameters2.paramTamp = [];
        dtParameters2.paramTamp.push({
          'p_supplier_selection_code': this.param,
        })
        // end param tambahan untuk getrows dynamic

        this.dalservice.Getrows(dtParameters2, this.APIControllerDocumentSupplier, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);

          // if use checkAll use this
          $('#checkall').prop('checked', false);
          // end checkall
          this.photolist = parse.data;

          if (parse.data != null) {
            this.photolist.numberIndex = dtParameters2.start;
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
    }
  }
  //#endregion load all data

  //#region button priview image
  previewFile(row1, row2) {
    this.showSpinner = true;
    const usersJson: any[] = Array.of();

    usersJson.push({
      p_file_name: row1,
      p_file_paths: row2
    });

    this.dalservice.PriviewFile(usersJson, this.APIControllerDocumentQuotation, this.APIRouteForPriviewFile)
      .subscribe(
        (res) => {
          const parse = JSON.parse(res);
          if (parse.value.filename !== '') {
            const fileType = parse.value.filename.split('.').pop();
            if (fileType === 'PNG') {
              this.downloadFile(parse.value.data, parse.value.filename, fileType);
              // const newTab = window.open();
              // newTab.document.body.innerHTML = this.pngFile(parse.value.data);
              // this.showSpinner = false;
            }
            if (fileType === 'JPEG' || fileType === 'JPG') {
              this.downloadFile(parse.value.data, parse.value.filename, fileType);
              // const newTab = window.open();
              // newTab.document.body.innerHTML = this.jpgFile(parse.value.data);
              // this.showSpinner = false;
            }
            if (fileType === 'PDF') {
              this.downloadFile(parse.value.data, parse.value.filename, 'pdf');
              // const newTab = window.open();
              // newTab.document.body.innerHTML = this.pdfFile(parse.value.data);
              // this.showSpinner = false;
            }
            if (fileType === 'DOCX' || fileType === 'DOC') {
              this.downloadFile(parse.value.data, parse.value.filename, 'msword');
            }
            if (fileType === 'XLSX') {
              this.downloadFile(parse.value.data, parse.value.filename, 'vnd.ms-excel');
            }
            if (fileType === 'PPTX') {
              this.downloadFile(parse.value.data, parse.value.filename, 'vnd.ms-powerpoint');
            }
            if (fileType === 'TXT') {
              this.downloadFile(parse.value.data, parse.value.filename, 'txt');
            }
            if (fileType === 'ODT' || fileType === 'ODS' || fileType === 'ODP') {
              this.downloadFile(parse.value.data, parse.value.filename, 'vnd.oasis.opendocument');
            }
            if (fileType === 'ZIP') {
              this.downloadFile(parse.value.data, parse.value.filename, 'zip');
            }
            if (fileType === '7Z') {
              this.downloadFile(parse.value.data, parse.value.filename, 'x-7z-compressed');
            }
            if (fileType === 'RAR') {
              this.downloadFile(parse.value.data, parse.value.filename, 'vnd.rar');
            }
          }
        }
      );
  }

  downloadFile(base64: string, fileName: string, extention: string) {
    var temp = 'data:application/' + extention + ';base64,'
      + encodeURIComponent(base64);
    var download = document.createElement('a');
    download.href = temp;
    download.download = fileName;
    document.body.appendChild(download);
    download.click();
    document.body.removeChild(download);
    this.showSpinner = false;
  }
  //#endregion button priview image

  //#region load all data
  loadDataQuotation() {
    this.dtOptionsQuo = {
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
          'p_quotation_review_code': this.QuotationCode1
        });
        // end param tambahan untuk getrows dynamic

        this.dalservice.Getrows(dtParameters, this.APIControllerQuota, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.quotationReviewDetailList = parse.data;
          if (parse.data != null) {
            this.quotationReviewDetailList.numberIndex = dtParameters.start;
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 9] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region load all data
  loadDataQuotationVendor() {
    this.dtOptionsQuoVendor = {
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
          'p_quotation_review_code': this.QuotationCode1
        });
        // end param tambahan untuk getrows dynamic

        this.dalservice.Getrows(dtParameters, this.APIControllerQuoVendor, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp)
          this.quotationReviewVendorList = parse.data;
          if (parse.data != null) {
            this.quotationReviewVendorList.numberIndex = dtParameters.start;
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 8] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data
}



