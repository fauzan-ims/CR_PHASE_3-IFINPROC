import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/operator/map'
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';
import { Location } from '@angular/common';
import swal from 'sweetalert2';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './quotationdocumentwizlist.component.html'
})

export class QuotationDocumentWizListComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public photolist: any = [];
  public dataphotolist: any = [];
  public dataTamp: any = [];
  public tampHiddenStatus: Boolean;
  public tempFile: any;
  public id: any;
  public row1: any[];
  public row2: any[];
  public uploadFile: any = [];
  public isDisplay: any = [];
  public image: any[];
  public imageUrl: string;
  public remark: any;
  private tamps = new Array();
  private dataTampPush: any = [];
  private dataRoleTamp: any = [];
  private base64textString: string;
  private tampDocumentCode: String;
  private APIController: String = 'QuotationDocument';
  private APIControllerHeader: String = 'Quotation';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForUpdateStatus: String = 'ExecSpForUpdateStatus';
  private APIRouteForDelete: String = 'DELETE';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForUploadFile: String = 'Upload';
  private APIRouteForDeleteFile: String = 'Deletefile';
  private APIRouteForPriviewFile: String = 'Priview';
  private RoleAccessCode = 'R00021560000000A';

  // ini buat datatables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  // checklist
  public selectedAll: any;
  private checkedList: any = [];

  // spinner
  showSpinner: Boolean = false;
  // end

  // form 2 way binding
  model: any = {};

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _location: Location,
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
          'p_quotation_code': this.param,
        })
        // end param tambahan untuk getrows dynamic

        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);

          for (let i = 0; i < parse.data.length; i++) {
            // checkbox
            if (parse.data[i].is_display === '1') {
              parse.data[i].is_display = true;
            } else {
              parse.data[i].is_display = false;
            }
            // end checkbox

            // this.previewFileList(parse.data[i].file_name, parse.data[i].path);
            this.photolist = parse.data;
          }

          this.photolist = parse.data;

          if (parse.data != null) {
            this.photolist.numberIndex = dtParameters.start;
          }

          callback({
            draw: parse.draw,
            recordsTotal: parse.recordsTotal,
            recordsFiltered: parse.recordsFiltered,
            data: []
          });
        }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
      },
      columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 2, 4, 5] }], // for disabled coloumn
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
    // param tambahan untuk getrole dynamic
    this.dataRoleTamp = [this.JSToNumberFloats({
      'p_quotation_review_code': this.param,
      'p_file_name': '',
      'p_file_paths': '',
      'p_document_code': '',
      'p_remark_detail': ''
    })];

    // param tambahan untuk getrole dynamic
    this.dalservice.Insert(this.dataRoleTamp, this.APIController, this.APIRouteForInsert)
      .subscribe(
        res => {
          this.showSpinner = false;
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            // this.showNotification('bottom', 'right', 'success');
            this.route.navigate(['/transaction/subquotationlist/quotationdetail/' + this.param + '/quotationdokumentwizlist', this.param], { skipLocationChange: true });
            $('#datatablerequestdoc').DataTable().ajax.reload();
          } else {
            this.swalPopUpMsg(parse.data);
          }
        },
        error => {
          const parse = JSON.parse(error);
          this.swalPopUpMsg(parse.data);
        });
  }
  //#endregion button add

  //#region button save in list
  btnSaveList() {

    this.showSpinner = true;
    this.dataphotolist = [];
    let j = 0;

    const getID = $('[name="p_id"]')
      .map(function () { return $(this).val(); }).get();

    const getRemark = $('[name="p_remark_detail"]')
      .map(function () { return $(this).val(); }).get();
    const getDocumnetCode = $('[name="p_document_code"]')
      .map(function () { return $(this).val(); }).get();

    while (j < getID.length) {

      while (j < getRemark.length) {

        if (getRemark[j] == null) {
          swal({
            title: 'Warning',
            text: 'Please Fill Remark first',
            buttonsStyling: false,
            confirmButtonClass: 'btn btn-danger',
            type: 'warning'
          }).catch(swal.noop)
          return;
        }

        this.dataphotolist.push(
          this.JSToNumberFloats({
            p_id: getID[j],
            p_document_code: getDocumnetCode[j],
            p_remark_detail: getRemark[j],
            p_quotation_review_code: this.param
          }));
        j++;
      }

      j++;
    }

    this.dataphotolist.p_file = []

    // tslint:disable-next-line: no-shadowed-variable
    for (let i = 0; i < this.tamps.length; i++) {
      this.dataphotolist.p_file.push({
        p_module: 'IFIN_PROC',
        p_header: 'PROCUREMENT_QUOTATION_REVIEW_DOCUMENT',
        p_child: this.param,
        p_id: this.tamps[i].p_id,
        p_file_paths: this.tamps[i].p_file_paths,
        p_file_name: this.tamps[i].p_file_name,
        p_base64: this.tamps[i].p_base64
      });
    }

    //#region web service
    this.dalservice.Update(this.dataphotolist, this.APIController, this.APIRouteForUpdate)
      .subscribe(
        res => {
          this.showSpinner = false;
          const parse = JSON.parse(res);
          if (parse.result === 1) {
            if (this.dataphotolist.p_file.length <= 0) {
              this.showSpinner = false;
              this.showNotification('bottom', 'right', 'success');
              $('#datatablerequestdoc').DataTable().ajax.reload();
            } else {

              this.dalservice.UploadFile(this.uploadFile, this.APIController, this.APIRouteForUploadFile)
                .subscribe(
                  res => {
                    const parse = JSON.parse(res);

                    if (parse.result === 1) {
                      this.showSpinner = false;
                      this.showNotification('bottom', 'right', 'success');
                      $('#datatablerequestdoc').DataTable().ajax.reload();
                    } else {
                      this.swalPopUpMsg(parse.data);
                    }
                  },
                  error => {
                    this.showSpinner = false;
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);
                  });
            }
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

  //#region button select image
  onUpload(event, code: String) {
    const files = event.target.files;
    const file = files[0];

    if (this.CheckFileSize(files[0].size, this.model.value)) {
      this.swalPopUpMsg('V;File size must be less or equal to ' + this.model.value + ' MB');
      $('#datatablerequestdoc').DataTable().ajax.reload(); //ganti dengan nama datatable jika ini di list
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


  //#region button previewFileList
  previewFileList(row1, row2) {
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
              // const newTab = window.open();
              // newTab.document.body.innerHTML = this.pngFileList(parse.value.data);
              this.pngFileList(parse.value.data);
            }
            if (fileType === 'JPEG' || fileType === 'JPG') {
              // const newTab = window.open();
              // newTab.document.body.innerHTML = this.jpgFileList(parse.value.data);
              this.jpgFileList(parse.value.data);
            }
          }
        }
      );
  }
  //#endregion button previewFileList

  //#region button delete image
  deleteImage(code: String, paths: any) {
    const usersJson: any[] = Array.of();
    usersJson.push({
      'p_id': code,
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
      if (result.value) {

        this.dalservice.DeleteFile(usersJson, this.APIController, this.APIRouteForDeleteFile)
          .subscribe(
            res => {
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showSpinner = false;
                this.showNotification('bottom', 'right', 'success');
              } else {
                this.swalPopUpMsg(parse.data);
              }
              $('#datatablerequestdoc').DataTable().ajax.reload();
            },
            error => {
              this.showSpinner = false;
              const parse = JSON.parse(error);
              this.swalPopUpMsg(parse.data);
            });
      }
    });
  }
  //#endregion button delete image

  //#region convert to base64
  handleFile(event) {
    this.showSpinner = true;
    const binaryString = event.target.result;
    this.base64textString = btoa(binaryString);

    this.tamps.push({
      p_header: 'PROCUREMENT_QUOTATION_REVIEW_DOCUMENT',
      p_module: 'IFINPROC',
      p_child: this.param,
      p_id: this.tampDocumentCode,
      p_file_paths: this.tampDocumentCode,
      p_file_name: this.tempFile,
      p_base64: this.base64textString
    });

    // this.dalservice.UploadFile(this.tamps, this.APIController, this.APIRouteForUploadFile)
    //   .subscribe(
    //     // tslint:disable-next-line:no-shadowed-variable
    //     res => {
    //       this.tamps = new Array();
    //       // tslint:disable-next-line:no-shadowed-variable
    //       const parses = JSON.parse(res);
    //       if (parses.result === 1) {
    //         this.showSpinner = false;
    //       } else {
    //         this.showSpinner = false;
    //         this.swalPopUpMsg(parses.message);
    //       }
    //       $('#datatablerequestdoc').DataTable().ajax.reload();
    //     },
    //     error => {
    //       this.showSpinner = false;
    //       this.tamps = new Array();
    //       // tslint:disable-next-line:no-shadowed-variable
    //       const parses = JSON.parse(error);
    //       this.swalPopUpMsg(parses.message);
    //       $('#datatablerequestdoc').DataTable().ajax.reload();
    //     });
  }
  //#endregion convert to base64

  //#region checkbox all table
  btnDeleteAll() {
    this.checkedList = [];
    for (let i = 0; i < this.photolist.length; i++) {
      if (this.photolist[i].selected) {
        this.checkedList.push(this.photolist[i].id);
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
      if (result.value) {
        this.dataTampPush = [];
        for (let J = 0; J < this.checkedList.length; J++) {
          const id = this.checkedList[J];
          // param tambahan untuk getrow dynamic
          this.dataTampPush = [{
            'p_id': id
          }];
          // end param tambahan untuk getrow dynamic
          this.dalservice.Delete(this.dataTampPush, this.APIController, this.APIRouteForDelete)
            .subscribe(
              res => {
                this.showSpinner = false;
                const parse = JSON.parse(res);
                if (parse.result === 1) {
                  if (this.checkedList.length == J + 1) {
                    this.showNotification('bottom', 'right', 'success');
                    $('#datatablerequestdoc').DataTable().ajax.reload();
                  }
                } else {
                  this.swalPopUpMsg(parse.data);
                }
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

  selectAll() {
    for (let i = 0; i < this.photolist.length; i++) {
      this.photolist[i].selected = this.selectedAll;
    }
  }

  checkIfAllTableSelected() {
    this.selectedAll = this.photolist.every(function (item: any) {
      return item.selected === true;
    })
  }
  //#endregion checkbox all table

  //#region getrow data
  callGetrowHeader() {
    // param tambahan untuk getrow dynamic
    this.dataTamp = [{
      'p_code': this.param,
    }];
    // end param tambahan untuk getrow dynamic
    this.dalservice.Getrow(this.dataTamp, this.APIControllerHeader, this.APIRouteForGetRow)
      .subscribe(
        res => {
          const parse = JSON.parse(res);
          const parsedata = this.getrowNgb(parse.data[0]);

          if (parsedata.status != 'HOLD') {
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
}


