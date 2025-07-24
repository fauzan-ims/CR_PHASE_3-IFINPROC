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
  templateUrl: './verificationdocumentwizlist.component.html'
})

export class VerificationdocumentwizComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public photolist: any = [];
  public dataphotolist: any = [];
  public dataTamp: any = [];
  private dataRoleTamp: any = [];
  private base64textString: string;
  private tampDocumentCode: String;
  private tamps = new Array();
  public tempFile: any;
  public id: any;
  public row1: any[];
  public row2: any[];
  public uploadFile: any = [];
  private dataTampPush: any = [];
  public isDisplay: any = [];
  public image: any[];
  public imageUrl: string;
  public remark: any;
  private APIController: String = 'ProcurementRequestDocument';
  private APIRouteForInsert: String = 'Insert';
  private APIRouteForUpdate: String = 'Update';
  private APIRouteForUpdateStatus: String = 'ExecSpForUpdateStatus';
  private APIRouteForDelete: String = 'DELETE';
  private APIRouteForGetRows: String = 'GetRows';
  private APIRouteForUploadFile: String = 'Upload';
  private APIRouteForDeleteFile: String = 'Deletefile';
  private APIRouteForPriviewFile: String = 'Priview';
  private RoleAccessCode = 'R00011540000000A';

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

  constructor(private dalservice: DALService,
    public getRouteparam: ActivatedRoute,
    public route: Router,
    private _location: Location,
    private _elementRef: ElementRef) { super(); }

  ngOnInit() {
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    this.compoSide('', this._elementRef, this.route);
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
        // param tambahan untuk getrows dynamic
        dtParameters.paramTamp = [];
        dtParameters.paramTamp.push({
          'p_code': this.param,
        })
        // end param tambahan untuk getrows dynamic

        this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
          const parse = JSON.parse(resp);

          for (let i = 0; i < parse.data.length; i++) {
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

  //#region button add
  btnAdd() {
    // param tambahan untuk getrole dynamic
    this.dataRoleTamp = [this.JSToNumberFloats({
      'p_procurement_request_code': this.param,
      'p_file_name': '',
      'p_file_paths': '',
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
            this.route.navigate(['/transaction/subverification/verificationdetail/' + this.param + '/verificationdocumentwizlist', this.param], { skipLocationChange: true });
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
            p_remark_detail: getRemark[j],
            p_procurement_request_code: this.param
          }));
        j++;
      }

      j++;
    }

    //#region web service
    this.dalservice.Update(this.dataphotolist, this.APIController, this.APIRouteForUpdate)
      .subscribe(
        res => {
          this.showSpinner = false;

          const parse = JSON.parse(res);
          if (parse.result === 1) {
            if (this.tamps.length > 0) {
              for (let i = 0; i < this.tamps.length; i++) {
                this.uploadFile.push({
                  p_header: 'PROCUREMENT_DOCUMENT',
                  p_child: this.param,
                  p_company_code: this.company_code,
                  p_id: this.tampDocumentCode,
                  p_file_paths: this.param,
                  p_file_name: this.tempFile,
                  p_base64: this.base64textString
                });
              }

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
            } else {
              this.showNotification('bottom', 'right', 'success');
              $('#datatablerequestdoc').DataTable().ajax.reload();
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
                this.showNotification('bottom', 'right', 'success');
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
    });
  }
  //#endregion button delete image

  //#region convert to base64
  handleFile(event) {
    const binaryString = event.target.result;
    this.base64textString = btoa(binaryString);

    this.tamps.push({
      p_header: 'PROCUREMENT_DOCUMENT',
      p_child: $('#procurementRequest', parent.document).val(),
      p_id: this.tampDocumentCode,
      p_file_paths: $('#procurementRequest', parent.document).val(),
      p_file_name: this.tempFile,
      p_base64: this.base64textString
    });
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

}


