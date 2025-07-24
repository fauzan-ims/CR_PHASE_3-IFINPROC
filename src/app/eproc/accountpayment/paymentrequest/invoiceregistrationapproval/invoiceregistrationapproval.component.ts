import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { DataTableDirective } from 'angular-datatables';

declare var $: any;

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './invoiceregistrationapproval.component.html'
})

export class InvoiceRegistrationApprovalComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  codeSource = this.getRouteparam.snapshot.paramMap.get('id2')

  // variable
  public NumberOnlyPattern = this._numberonlyformat;
  public tempFile: any;
  public invoiceRegistrationList: any = [];
  public isReadOnly: Boolean = false;
  private dataTamp: any = [];
  public tampHidden: Boolean;
  private setStyle: any = [];
  private dataRoleTamp: any = [];
  private tampDocumentCode: String;
  public lookupdivisioncode: any = [];
  public lookupsubdepartmentcode: any = [];
  public lookupdepartmentcode: any = [];
  public lookupunitcode: any = [];
  public lookupvendor: any = [];
  public lookupbranchcode: any = [];
  public lookupPOCode: any = [];
  public lookupcurrencycode: any = [];
  public lookuprequestorcode: any = [];
  public branchName: String;
  public lookupbank: any = [];
  private tamps = new Array();
  public status_header: any;
  private base64textString: string;
  private dataTempThirdParty: any = [];
  private VendorInvoice: any;
  private VendorInvoiceBank: any;
  public tampdHidden: Boolean;
  public invoiceRegisterDetailList: any = [];
  public tampHiddenStatus: Boolean
  public lookupreceipt: any = [];
  private checkedLookup: any = [];
  public selectedAllLookup: any = [];
  private dataTampPush: any = [];
  private dataTampProceed: any = [];

  private APIController: String = 'InvoiceRegistration';
  private APIControllerSysDivisionCode: String = 'MasterDivision';
  private APIControllerSysDepartmentCode: String = 'MasterDepartment';
  private APIControllerSubDepartmentCode: String = 'MasterSubDepartment';
  private APIControllerSysCurrencyCode: String = 'SysCurrency';
  private APIControllerVendor: String = 'MasterVendor';
  private APIControllerUnitCode: String = 'MasterUnit';
  private APIControllerBranch: String = 'SysCompanyUserMainBranch';
  private APIControllerPO: String = 'PurchaseOrder';
  private APIControllerSysBranchBank: String = 'MasterVendorBank';
  private APIControllerVendorExt: String = 'Intergration';
  private APIControllerSysGlobalParam: String = 'SysGlobalParam';
  private APIControllerDetail: String = 'InvoiceRegistrationDetail';
  private APIControllerGoodReceipt: String = 'GoodReceiptNote';

  private APIRouteForReturn: String = 'ExecSpForReturn';
  private APIRouteForReject: String = 'ExecSpForReject';
  private APIRouteForProceed: String = 'ExecSpForProceed';
  private APIRouteForPost: String = 'ExecSpForPost';
  private APIRouteGetRows: String = 'GetRows';
  private APIRouteForGetRow: String = 'GetRow';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForDelete: String = 'Delete';
  private APIRouteForCancel: String = 'ExecSpForCancel';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteLookup: String = 'GetRowsForLookup';
  private APIRouteForUploadFile: String = 'Upload';
  private APIRouteForDeleteFile: String = 'Deletefile';
  private APIRouteForPriviewFile: String = 'Priview';
  private APIRouteForLookupPO: String = 'GetRowsForLookupInvoice';
  private APIRouteForLookupForInvoiceExt: String = 'GetListVendorForLookup';
  private APIRouteForGetThirddParty: String = 'ExecSpForThidrParty';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForLookupInvoice: String = 'GetRowsForLookupInvoice';
  private APIRouteForGetDelete: String = 'Delete';

  private RoleAccessCode = 'R00021610000000A';

  // form 2 way binding
  model: any = {};

  // checklist
  public selectedAll: any;
  private checkedList: any = [];

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
      this.callGetrowHeader();
      // this.showSpinner = false;
    } else {
      this.showSpinner = false;
      this.tampdHidden = false;
      this.model.company_code = this.company_code;
      this.model.status = "HOLD";
    }
  }

  //#region button select image
  onUpload(event, code: String) {
    const files = event.target.files;
    const file = files[0];

    if (this.CheckFileSize(files[0].size, this.model.value)) {
      this.swalPopUpMsg('V;File size must be less or equal to ' + this.model.value + ' MB');
      // $('#datatableReceiveDetail').DataTable().ajax.reload();
    } else {
      if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();

        reader.readAsDataURL(event.target.files[0]); // read file as data url

        // tslint:disable-next-line:no-shadowed-variable
        reader.onload = (event) => {
          reader.onload = this.handleFile.bind(this);
          reader.readAsBinaryString(file);
        }
      }
      this.tempFile = files[0].name;
      this.tampDocumentCode = code;
    }
  }
  //#endregion button select image

  //#region convert to base64
  handleFile(event) {
    this.showSpinner = true;
    const binaryString = event.target.result;
    this.base64textString = btoa(binaryString);

    this.tamps.push({
      p_header: 'INVOICE_REGISTER',
      p_module: 'IFINPROC',
      p_child: this.param,
      // p_id: this.tampDocumentCode,
      p_code: this.tampDocumentCode,
      p_file_paths: this.param,
      p_file_name: this.tempFile,
      p_base64: this.base64textString
    });


    this.dalservice.UploadFile(this.tamps, this.APIController, this.APIRouteForUploadFile)
      .subscribe(
        // tslint:disable-next-line:no-shadowed-variable
        res => {
          this.tamps = new Array();
          // tslint:disable-next-line:no-shadowed-variable
          const parses = JSON.parse(res);
          if (parses.result === 1) {
            this.showSpinner = false;
          } else {
            this.showSpinner = false;
            this.swalPopUpMsg(parses.message);
          }
          // $('#datatableReceiveDetail').DataTable().ajax.reload();
          this.callGetrow()
        },
        error => {
          this.showSpinner = false;
          this.tamps = new Array();
          // tslint:disable-next-line:no-shadowed-variable
          const parses = JSON.parse(error);
          this.swalPopUpMsg(parses.message);
          // $('#datatableReceiveDetail').DataTable().ajax.reload();
        });
  }
  //#endregion convert to base64

  //#region button delete image
  deleteImage(file_name: any, paths: any) {
    this.showSpinner = true;
    const usersJson: any[] = Array.of();
    usersJson.push({
      'p_code': this.param,
      'p_file_name': file_name,
      'p_file_paths': paths
    });

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
        this.dalservice.DeleteFile(usersJson, this.APIController, this.APIRouteForDeleteFile)
          .subscribe(
            res => {
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showSpinner = false;
                this.showNotification('bottom', 'right', 'success');
                $('#fileControl').val(undefined);
                this.tempFile = undefined;
              } else {
                this.showSpinner = false;
                this.swalPopUpMsg(parse.message);
              }
              this.callGetrow()
            },
            error => {
              this.showSpinner = false;
              const parse = JSON.parse(error);
              this.swalPopUpMsg(parse.message);
            });
      } else {
        this.showSpinner = false;
      }
    });
  }
  //#endregion button delete image

  //#region button priview image
  previewFile(row1, row2) {
    this.showSpinner = true;
    const usersJson: any[] = Array.of();

    usersJson.push({
      p_file_name: row1,
      p_file_paths: row2
    });
    this.dalservice.PriviewFile(usersJson, this.APIController, this.APIRouteForPriviewFile)
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
          this.status_header = parsedata.status

          if (parsedata.status != 'HOLD') {
            this.tampHidden = true;
          } else {
            this.tampHidden = false;
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

  //#region  form submit
  onFormSubmit(invoiceRegistrationForm: NgForm, isValid: boolean) {
    // validation form submit
    if (!isValid) {
      swal({
        title: 'Warning!',
        text: 'Please Fill a Mandatory Field OR Format Is Invalid!!',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-warning',
        type: 'warning'
      }).catch(swal.noop)
      return;
    } else {
      this.showSpinner = true;
    }

    // this.invoiceRegistrationList = invoiceRegistrationForm;
    this.invoiceRegistrationList = this.JSToNumberFloats(invoiceRegistrationForm);
    if (this.invoiceRegistrationList.p_is_another_invoice == null) {
      this.invoiceRegistrationList.p_is_another_invoice = false;
    }
    if (this.invoiceRegistrationList.p_bill_type == null) {
      swal({
        title: 'Warning',
        text: 'Please Choose Bill Type',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger',
        type: 'warning'
      }).catch(swal.noop)
      return;
    }
    const usersJson: any[] = Array.of(this.invoiceRegistrationList);
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
              // $('#reloadWiz').click()
              $('#datatablesWizItem').DataTable().ajax.reload();
              //this.invoiceregistrationwiz();
              this.showSpinner = false;

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
              this.callGetrow()
              this.route.navigate(['/accountpayable/subinvoiceregisterlist/invoiceregisterdetail', parse.code]);
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
    this.route.navigate(['/objectinfopaymentrequest/paymentrequestapproval/', this.codeSource]);
  }
  //#endregion button back

  //#region button Proceed
  btnProceed(code: string) {
    // param tambahan untuk button Post dynamic

    this.dataRoleTamp = [{
      'p_code': code,
      'action': 'default'
    }];

    // param tambahan untuk button Post dynamic
    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: this._deleteconf,

      buttonsStyling: false
    }).then((result) => {
      this.showSpinner = true;
      if (result.value) {
        // call web service
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForProceed)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                // this.callGetrow();
                this.callGetrow();
                $('#reloadWiz').click();
                this.showNotification('bottom', 'right', 'success');
                //window.location.reload();
                // this.route.navigate(['/mutation/returndetail', this.param]);
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
    });
  }
  //#endregion button Proceed

  //#region button Reject
  btnReject(code: string) {
    // param tambahan untuk button Post dynamic

    this.dataRoleTamp = [{
      'p_code': code,
      'action': 'default'
    }];

    // param tambahan untuk button Post dynamic
    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: this._deleteconf,

      buttonsStyling: false
    }).then((result) => {
      this.showSpinner = true;
      if (result.value) {
        // call web service
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReject)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.callGetrow();
                $('#itemwiz').click();
                this.callGetrow();
                $('#itemwiz').click();
                this.showNotification('bottom', 'right', 'success');
                // this.route.navigate(['/mutation/returndetail', this.param]);
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
    });
  }
  //#endregion button Reject

  //#region btnCancel
  btnCancel() {
    // param tambahan untuk button Done dynamic
    this.dataRoleTamp = [{
      'p_code': this.param,
      'action': 'default'
    }];
    // param tambahan untuk button Done dynamic

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
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForCancel)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                // this.callGetrow();
                this.callGetrow();
                $('#reloadWiz').click();
                $('#itemwiz').click();
                this.showNotification('bottom', 'right', 'success');
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
  //#endregion btnCancel

  //#region button Return
  btnReturn(code: string) {
    // param tambahan untuk button Post dynamic

    this.dataRoleTamp = [{
      'p_code': code,
      'action': 'default'
    }];

    // param tambahan untuk button Post dynamic
    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: this._deleteconf,

      buttonsStyling: false
    }).then((result) => {
      this.showSpinner = true;
      if (result.value) {
        // call web service
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForReturn)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.callGetrow();
                $('#reloadWiz').click();
                this.showNotification('bottom', 'right', 'success');
                // this.route.navigate(['/mutation/returndetail', this.param]);
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
    });
  }
  //#endregion button Return

  //#region button Post
  btnPost(code: string) {
    // param tambahan untuk button Post dynamic


    this.dataRoleTamp = [{
      'p_code': code,
      'p_company_code': this.company_code,
      'action': 'default'
    }];

    // param tambahan untuk button Post dynamic
    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: this._deleteconf,

      buttonsStyling: false


    }).then((result) => {
      this.showSpinner = true;
      if (result.value) {
        // call web service
        this.dalservice.ExecSp(this.dataRoleTamp, this.APIController, this.APIRouteForPost)
          .subscribe(
            res => {
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showNotification('bottom', 'right', 'success');
                this.callGetrow()
                $('#reloadWiz').click()
                $('#datatablesWizItem').DataTable().ajax.reload();
                //this.invoiceregistrationwiz();
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
    });
  }
  //#endregion button Post


  //#region load all data
  loadData() {
    this.dtOptions = {
      'pagingType': 'first_last_numbers',
      'pageLength': 10,
      'processing': true,
      'serverSide': true,
      responsive: true,
      lengthChange: false, // hide lengthmenu
      searching: true, // jika ingin hilangin search box nya maka false
      ajax: (dtParameters: any, callback) => {
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_invoice_register_code': this.param,
        });
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerDetail, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.invoiceRegisterDetailList = parse.data;

          if (parse.data != null) {
            this.invoiceRegisterDetailList.numberIndex = dtParameters.start;
            this.showSpinner = false;
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
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 9] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    }
  }
  //#endregion load all data

  //#region button add
  btnAdd() {
    this.route.navigate(['/accountpayable/subinvoiceregisterlist/invoiceregisterdetail/' + this.param + '/invoiceregisterdetailwizdetail', this.param], { skipLocationChange: true });
  }
  //#endregion button add

  //#region button edit
  // btnEdit(codeEdit: string) {
  //   this.route.navigate(['/accountpayable/subinvoiceregisterlist/invoiceregisterdetail/' + this.param + '/invoiceregisterdetailwizdetail', this.param, codeEdit]);
  // }

  btnEdit(codeEdit: string) {
    // this.route.navigate(['/objectinfopaymentrequest/subinvoiceregister/' + this.param + '/' + this.codeSource + '/subitemlist', this.param, codeEdit, this.codeSource]);
    this.route.navigate(['/objectinfopaymentrequest/subitemlist', codeEdit]);

  }
  //#endregion button edit

  //#region button delete
  btnDeleteAll() {
    this.dataTampProceed = [];
    this.checkedList = [];
    for (let i = 0; i < this.invoiceRegisterDetailList.length; i++) {
      if (this.invoiceRegisterDetailList[i].selected) {
        this.checkedList.push({
          'ID': this.invoiceRegisterDetailList[i].id,
        })
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

    swal({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: this._deleteconf,
      buttonsStyling: false
    }).then((result) => {
      this.showSpinner = true;
      if (result.value) {
        this.dataTampPush = [];

        let th = this;
        var i = 0;
        (function loopPoProceesProceed() {
          if (i < th.checkedList.length) {
            th.dataTampPush = [{
              'p_id': th.checkedList[i].ID,
              'action': '',
            }];
            th.dalservice.ExecSp(th.dataTampPush, th.APIController, th.APIRouteForGetDelete)
              .subscribe(
                res => {
                  const parse = JSON.parse(res);
                  if (parse.result === 1) {
                    if (th.checkedList.length == i + 1) {
                      th.showNotification('bottom', 'right', 'success');
                      $('#datatablesWizItem').DataTable().ajax.reload();
                      $('#btnInvoiceRegisration').click();
                      th.showSpinner = false;
                    } else {
                      i++;
                      loopPoProceesProceed();
                    }
                  } else {
                    th.swalPopUpMsg(parse.data);
                    th.showSpinner = false;
                  }
                },
                error => {
                  const parse = JSON.parse(error);
                  th.swalPopUpMsg(parse.data);
                  th.showSpinner = false;
                });
          }

        })();

        // for (let J = 0; J < this.checkedList.length; J++) {
        //   // param tambahan untuk getrow dynamic
        //   this.dataTampPush = [{
        //     'p_id': this.checkedList[J]
        //   }];
        //   // end param tambahan untuk getrow dynamic
        //   this.dalservice.Delete(this.dataTampPush, this.APIController, this.APIRouteForGetDelete)
        //     .subscribe(
        //       res => {
        //         this.showSpinner = false;
        //         const parse = JSON.parse(res);
        //         if (parse.result === 1) {
        //           if (this.checkedList.length == J + 1) {
        //             this.showNotification('bottom', 'right', 'success');
        //             $('#datatablesWizItem').DataTable().ajax.reload();
        //             $('#btnInvoiceRegisration').click();
        //           }
        //         } else {
        //           this.showSpinner = false;
        //           this.swalPopUpMsg(parse.data)
        //         }
        //       },
        //       error => {
        //         this.showSpinner = false;
        //         const parse = JSON.parse(error);
        //         this.swalPopUpMsg(parse.data);
        //       });
        // }
      } else {
        this.showSpinner = false;
      }
    });
  }
  //#endregion button delete

  //#region getrow data
  callGetrowHeader() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);
          this.status_header = parsedata.status

          if (parsedata.status != 'HOLD') {
            this.tampHidden = true;
          } else {
            this.tampHidden = false;
          }


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

  //#region btn lookup receipt
  btnLookupReceipt() {
    $('#datatableLookupReceipt').DataTable().clear().destroy();
    $('#datatableLookupReceipt').DataTable({
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
          // 'p_purchase_order_code': this.model.purchase_order_code
          'p_supplier_code': this.model.supplier_code
          , 'p_invoice_register_code': this.param
        })
        // end param tambahan untuk getrows dynamic
        this.dalservice.Getrows(dtParameters, this.APIControllerGoodReceipt, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupreceipt = parse.data;

          if (parse.data != null) {
            this.lookupreceipt.numberIndex = dtParameters.start;
          }
          // if use checkAll use this
          $('#checkallLookup').prop('checked', false);
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
    });
  }
  //#endregion btn lookup receipt

  //#region checkbox all lookup
  btnSelectAllLookup() {
    this.checkedLookup = [];
    for (let i = 0; i < this.lookupreceipt.length; i++) {
      if (this.lookupreceipt[i].selectedLookup) {
        // this.checkedLookup.push(this.lookupreceipt[i].code);
        this.checkedLookup.push({
          codeData: this.lookupreceipt[i].code,
          GrnId: this.lookupreceipt[i].grn_id,
        });
      }
    }

    // jika tidak di checklist
    if (this.checkedLookup.length === 0) {
      swal({
        title: this._listdialogconf,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger'
      }).catch(swal.noop)
      return
    }

    this.showSpinner = true;
    // if (result.value) {
    for (let J = 0; J < this.checkedLookup.length; J++) {
      const codeData = this.checkedLookup[J];
      this.dataTamp = [{
        'p_grn_code': this.checkedLookup[J].codeData,
        'p_invoice_register_code': this.param,
        'p_id': this.checkedLookup[J].GrnId,
      }];
      // end param tambahan untuk getrow dynamic
      this.dalservice.ExecSp(this.dataTamp, this.APIController, this.APIRouteForInsert)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);

            if (parse.result === 1) {
              if (this.checkedLookup.length == J + 1) {
                this.callGetrowHeader()
                $('#datatableLookupReceipt').DataTable().ajax.reload();
                $('#datatablesWizItem').DataTable().ajax.reload();
                $('#btnInvoiceRegisration').click();
                this.showNotification('bottom', 'right', 'success');
              }
            } else {
              this.swalPopUpMsg(parse.data);
            }
          },
          error => {
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data);
          })
    }
  }

  selectAllLookup() {
    for (let i = 0; i < this.lookupreceipt.length; i++) {
      this.lookupreceipt[i].selectedLookup = this.selectedAllLookup;
    }
  }

  checkIfAllLookupSelected() {
    this.selectedAllLookup = this.lookupreceipt.every(function (item: any) {
      return item.selectedLookup === true;
    })
  }
  //#endregion checkbox all table

  //#region selectAll
  selectAll() {
    for (let i = 0; i < this.invoiceRegisterDetailList.length; i++) {
      this.invoiceRegisterDetailList[i].selected = this.selectedAll;
    }
  }
  //#endregion selectAll

  //#region  checkIfAllTableSelected
  checkIfAllTableSelected() {
    this.selectedAll = this.invoiceRegisterDetailList.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkIfAllTableSelected

  //#region List tabs 
  invoiceregistrationwiz() {
    this.route.navigate(['/accountpayable/subinvoiceregisterlist/invoiceregisterdetail/' + this.param + '/invoiceregisterdetailwizlist', this.param], { skipLocationChange: false });
  }
  //#endregion List tabs

  //#region set datepicker
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
  //#endregion set datepicker

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
        this.dalservice.ExecSpSys(dtParameters, this.APIControllerSysDivisionCode, this.APIRouteForLookup).subscribe(resp => {
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

  btnSelectRowDivisionCode(code: String, name: String) {
    this.model.division_code = code;
    this.model.division_name = name;
    this.model.department_code = undefined;
    this.model.department_name = undefined;
    this.model.sub_department_code = undefined;
    this.model.sub_department_name = undefined;
    this.model.unit_code = undefined;
    this.model.unit_name = undefined;
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
        this.dalservice.ExecSpSys(dtParameters, this.APIControllerSysDepartmentCode, this.APIRouteForLookup).subscribe(resp => {
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

  btnSelectRowDepartmentCode(code: String, name: String) {
    this.model.department_code = code;
    this.model.department_name = name;
    this.model.sub_department_code = undefined;
    this.model.sub_department_name = undefined;
    this.model.unit_code = undefined;
    this.model.unit_name = undefined;
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
        this.dalservice.ExecSpSys(dtParameters, this.APIControllerSubDepartmentCode, this.APIRouteForLookup).subscribe(resp => {
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

  btnSelectRowSubDepartmentCode(code: String, name: String) {
    this.model.sub_department_code = code;
    this.model.sub_department_name = name;
    this.model.unit_code = undefined;
    this.model.unit_name = undefined;
    $('#lookupModalSubDepartmentCode').modal('hide');
  }
  //#endregion Sub DepartmentCode lookup

  //#region UnitCode Lookup
  btnLookupUnitCode(divisionCode: String, departmentCode: String, subdepartmentCode: String) {
    $('#datatableLookupUnitCode').DataTable().clear().destroy();
    $('#datatableLookupUnitCode').DataTable({
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
          'p_sub_department_code': subdepartmentCode,
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.ExecSpSys(dtParameters, this.APIControllerUnitCode, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);

          this.lookupunitcode = parse.data;

          if (parse.data != null) {
            this.lookupunitcode.numberIndex = dtParameters.start;
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

  btnSelectRowUnitCode(code: String, name: String) {
    this.model.unit_code = code;
    this.model.unit_name = name;
    $('#lookupModalUnitCode').modal('hide');
  }
  //#endregion UnitCode lookup

  //#region BranchCode Lookup
  btnLookupBranchCode() {
    $('#datatableLookupBranchCode').DataTable().clear().destroy();
    $('#datatableLookupBranchCode').DataTable({
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
          'p_user_code': this.userId,
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.ExecSpSys(dtParameters, this.APIControllerBranch, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupbranchcode = parse.data;

          if (parse.data != null) {
            this.lookupbranchcode.numberIndex = dtParameters.start;
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

  btnSelectRowBranchCode(code: String, name: String) {
    this.model.branch_code = code;
    this.model.branch_name = name;
    $('#lookupModalBranchCode').modal('hide');
  }
  //#endregion BranchCode lookup

  //#region CurrencyCode Lookup
  btnLookupCurrencyCode() {
    $('#datatableLookupCurrencyCode').DataTable().clear().destroy();
    $('#datatableLookupCurrencyCode').DataTable({
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
        this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysCurrencyCode, this.APIRouteForLookup).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupcurrencycode = parse.data;

          if (parse.data != null) {
            this.lookupcurrencycode.numberIndex = dtParameters.start;
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

  btnSelectRowCurrencyCode(code: String, description: String) {
    this.model.currency_code = code;
    this.model.currency_name = description;
    $('#lookupModalCurrencyCode').modal('hide');
  }
  //#endregion CurrencyCode lookup

  //#region Vendor Lookup
  // btnLookupVendor() {
  //   $('#datatableLookupVendor').DataTable().clear().destroy();
  //   $('#datatableLookupVendor').DataTable({
  //     'pagingType': 'first_last_numbers',
  //     'pageLength': 5,
  //     'processing': true,
  //     'serverSide': true,
  //     responsive: true,
  //     lengthChange: false, // hide lengthmenu
  //     searching: true, // jika ingin hilangin search box nya maka false
  //     ajax: (dtParameters: any, callback) => {
  //       // param tambahan untuk getrows dynamic
  //       dtParameters.paramTamp = [];
  //       dtParameters.paramTamp.push({
  //         'p_company_code': this.company_code,
  //         'p_code': '',
  //         'action': 'getResponse'
  //       });
  //       // end param tambahan untuk getrows dynamic
  //       this.dalservice.GetrowsBam(dtParameters, this.APIControllerVendor, this.APIRouteForLookup).subscribe(resp => {
  //         const parse = JSON.parse(resp);
  //         this.lookupvendor = parse.data;

  //         if (parse.data != null) {
  //           this.lookupvendor.numberIndex = dtParameters.start;
  //         }

  //         callback({
  //           draw: parse.draw,
  //           recordsTotal: parse.recordsTotal,
  //           recordsFiltered: parse.recordsFiltered,
  //           data: []
  //         });
  //       }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
  //     },
  //     columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
  //     language: {
  //       search: '_INPUT_',
  //       searchPlaceholder: 'Search records',
  //       infoEmpty: '<p style="color:red;" > No Data Available !</p> '
  //     },
  //     searchDelay: 800 // pake ini supaya gak bug search
  //   });
  // }

  // btnSelectRowVendor(code: String, description: String) {
  //   this.model.supplier_code = code;
  //   this.model.supplier_name = description;
  //   $('#lookupModalVendor').modal('hide');
  // }
  //#endregion Vendor lookup

  //#region GlobalParam for Thirdparty
  callGlobalParamForThirdPartyVendor() {
    this.dataTempThirdParty = [{
      'p_type': "VENDOR",
      'action': "getResponse"
    }];
    this.dalservice.ExecSp(this.dataTempThirdParty, this.APIControllerSysGlobalParam, this.APIRouteForGetThirddParty)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data);

          for (let i = 0; i < parsedata.length; i++) {
            if (parsedata[i].code === 'URLVDR') {
              this.VendorInvoice = parsedata[i].value
            }
          }

          this.showSpinner = false;
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion GlobalParam for Thirdparty

  //#region GlobalParam for Thirdparty
  callGlobalParamForThirdPartyVendorBank() {
    this.dataTempThirdParty = [{
      'p_type': "VENDORBANK",
      'action': "getResponse"
    }];

    this.dalservice.ExecSp(this.dataTempThirdParty, this.APIControllerSysGlobalParam, this.APIRouteForGetThirddParty)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data);

          for (let i = 0; i < parsedata.length; i++) {
            if (parsedata[i].code === 'URLVBK') {
              this.VendorInvoiceBank = parsedata[i].value
            }
          }

          this.showSpinner = false;
        },
        error => {
          this.showSpinner = false;
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion GlobalParam for Thirdparty

  //#region Vendor Lookup
  btnLookupVendor() {
    $('#datatableLookupVendor').DataTable().clear().destroy();
    $('#datatableLookupVendor').DataTable({
      'pagingType': 'first_last_numbers',
      'pageLength': 10,
      'processing': true,
      'serverSide': true,
      responsive: true,
      lengthChange: false, // hide lengthmenu
      searching: true, // jika ingin hilangin search box nya maka false
      ajax: (dtParameters: any, callback) => {
        dtParameters.paramTamp = [];


        let paramTamps = {}
        paramTamps = {
          'draw': 1,
          'RowPage': 10,
          // 'PageNumber': dtParameters.start / dtParameters.length + 1,
          'PageNumber': (dtParameters.start + 10) / 10,
          'SortBy': dtParameters.order[0].dir,
          'OrderBy': dtParameters.order[0].column,
          'Keyword': dtParameters.search.value,
          // 'URL': 'http://172.31.233.24:8888/v1/VendorX/GetListVendorForLookup', // belum digunakan karena masih not ready
          'URL': this.VendorInvoice,
          'DataObj': 'ListVendorObj'
        }
        dtParameters.paramTamp.push(paramTamps)

        this.dalservice.Getrows(dtParameters, this.APIControllerVendorExt, this.APIRouteForLookupForInvoiceExt).subscribe(resp => {
          const parse = JSON.parse(resp);

          this.lookupvendor = parse.data;
          if (parse.data != null) {
            this.lookupvendor.numberIndex = dtParameters.start;
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

  btnSelectRowVendor(code: String, description: String) {
    this.model.supplier_code = code;
    this.model.supplier_name = description;
    this.model.to_bank_code = '';
    this.model.to_bank_name = '';
    this.model.bank_name = '';
    this.model.to_bank_account_no = '';
    $('#lookupModalVendor').modal('hide');
  }
  //#endregion Vendor lookup

  //#region PO Lookup
  btnLookupPO() {
    $('#datatableLookupPO').DataTable().clear().destroy();
    $('#datatableLookupPO').DataTable({
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
          // 'p_company_code': this.company_code,
          'action': 'getResponse'
        });

        // end param tambahan untuk getrows dynamic
        this.dalservice.ExecSp(dtParameters, this.APIControllerPO, this.APIRouteForLookupPO).subscribe(resp => {
          const parse = JSON.parse(resp);
          this.lookupPOCode = parse.data;

          if (parse.data != null) {
            this.lookupPOCode.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [6] }], // for disabled coloumn
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  btnSelectRowPO(code: String, branch_code: String,
    branch_name: String, division_code: String, division_name: String, department_code: String, department_name: String,
    sub_departmet_code: String, sub_department_name: String, unit_code: String, unit_name: String, to_bank_code: String,
    to_bank_account_no: String, to_bank_account_name: String, payment_by: String, invoice_amount: String,
    ppn_amount: String, pph_amount: String, deposit_amount: String, currency_code: String, currency_name: String, supplier_code: String, supplier_name: String, price_amount: String) {
    this.model.purchase_order_code = code;
    this.model.branch_code = branch_code;
    this.model.branch_name = branch_name;
    this.model.division_code = division_code;
    this.model.division_name = division_name;
    this.model.department_code = department_code;
    this.model.department_name = department_name;
    // this.model.to_bank_code = to_bank_code;
    // this.model.to_bank_account_no = to_bank_account_no;
    // this.model.to_bank_account_name = to_bank_account_name;
    // this.model.payment_by = payment_by;
    this.model.invoice_amount = invoice_amount;
    this.model.ppn = '';
    this.model.pph = '';
    this.model.deposit_amount = '';
    // this.model.currency_code = currency_code;
    // this.model.currency_name = currency_name;
    this.model.supplier_code = supplier_code;
    this.model.supplier_name = supplier_name;
    this.model.to_bank_code = '';
    this.model.to_bank_name = '';
    this.model.bank_name = '';
    this.model.to_bank_account_no = '';
    this.model.currency_code = '';
    this.model.to_bank_account_name = '';
    $('#lookupModalPO').modal('hide');
    // $('#reloadWiz').click();
  }
  //#endregion PO lookup

  // btnLookupBank() {
  //   $('#datatableLookupBank').DataTable().clear().destroy();
  //   $('#datatableLookupBank').DataTable({
  //     'pagingType': 'first_last_numbers',
  //     'pageLength': 5,
  //     'processing': true,
  //     'serverSide': true,
  //     responsive: true,
  //     lengthChange: false, // hide lengthmenu
  //     searching: true, // jika ingin hilangin search box nya maka false
  //     ajax: (dtParameters: any, callback) => {
  //       // param tambahan untuk getrows dynamic
  //       dtParameters.paramTamp = [];
  //       dtParameters.paramTamp.push({
  //         'p_vendor_code': this.model.supplier_code,
  //       });
  //       // end param tambahan untuk getrows dynamic
  //       this.dalservice.GetrowsBam(dtParameters, this.APIControllerSysBranchBank, this.APIRouteLookup).subscribe(resp => {
  //         const parse = JSON.parse(resp);
  //         this.lookupbank = parse.data;
  //         if (parse.data != null) {
  //           this.lookupbank.numberIndex = dtParameters.start;
  //         }

  //         callback({
  //           draw: parse.draw,
  //           recordsTotal: parse.recordsTotal,
  //           recordsFiltered: parse.recordsFiltered,
  //           data: []
  //         });
  //       }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
  //     },
  //     columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 6] }],
  //     language: {
  //       search: '_INPUT_',
  //       searchPlaceholder: 'Search records',
  //       infoEmpty: '<p style="color:red;" > No Data Available !</p> '
  //     },
  //     searchDelay: 800 // pake ini supaya gak bug search
  //   });
  // }

  //#region Lookup Bank
  btnLookupBank() {
    $('#datatableLookupBank').DataTable().clear().destroy();
    $('#datatableLookupBank').DataTable({
      'pagingType': 'first_last_numbers',
      'pageLength': 10,
      'processing': true,
      'serverSide': true,
      responsive: true,
      lengthChange: false, // hide lengthmenu
      searching: true, // jika ingin hilangin search box nya maka false
      ajax: (dtParameters: any, callback) => {

        dtParameters.paramTamp = [];
        let paramTamps = {}
        paramTamps = {
          'draw': 1,
          'RowPage': 10,
          'PageNumber': (dtParameters.start + 10) / 10,
          'SortBy': dtParameters.order[0].dir,
          'OrderBy': dtParameters.order[0].column + 1,
          'Keyword': dtParameters.search.value,
          'VendorId': this.model.supplier_code,
          // 'URL': 'http://172.31.233.24:8888/v1/VendorX/GetListVendorBankAccForLookup', // belum digunakan karena masih not ready
          'URL': this.VendorInvoiceBank,
          'DataObj': 'ListVendorBankAccObj'
        }
        dtParameters.paramTamp.push(paramTamps)

        this.dalservice.Getrows(dtParameters, this.APIControllerVendorExt, this.APIRouteForLookupForInvoiceExt).subscribe(resp => {
          const parse = JSON.parse(resp);

          this.lookupbank = parse.data;
          if (parse.data != null) {
            this.lookupbank.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 5] }],
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
        infoEmpty: '<p style="color:red;" > No Data Available !</p> '
      },
      searchDelay: 800 // pake ini supaya gak bug search
    });
  }

  // btnSelectRowBank(bank_code: String, bank_acc_no: string, bank_acc_name: string, currency: String, bank_name: String) {
  //   this.model.to_bank_code = bank_code;
  //   this.model.to_bank_name = bank_name;
  //   this.model.to_bank_account_name = bank_acc_name;
  //   this.model.to_bank_account_no = bank_acc_no;
  //   this.model.currency_code = currency;
  //   $('#lookupModalBank').modal('hide');
  // }

  // btnClearBank() {
  //   this.model.to_bank_code = '';
  //   this.model.to_bank_name = '';
  //   this.model.bank_name = '';
  //   this.model.to_bank_account_no = '';
  //   this.model.currency_code = '';
  //   $('#datatable').DataTable().ajax.reload();
  // }
  btnSelectRowBank(bank_code: String, bank_acc_no: string, bank_acc_name: string, bank_name: String) {
    this.model.to_bank_code = bank_code;
    this.model.to_bank_name = bank_name;
    this.model.to_bank_account_name = bank_acc_name;
    this.model.to_bank_account_no = bank_acc_no;
    $('#lookupModalBank').modal('hide');
  }

  btnClearBank() {
    this.model.to_bank_code = '';
    this.model.to_bank_name = '';
    this.model.bank_name = '';
    this.model.to_bank_account_no = '';
    $('#datatable').DataTable().ajax.reload();
  }
  //#endregion Lookup Bank
}



