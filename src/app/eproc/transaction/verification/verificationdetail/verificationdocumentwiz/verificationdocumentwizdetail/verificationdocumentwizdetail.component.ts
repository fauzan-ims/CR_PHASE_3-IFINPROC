import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../base.component';
import { DALService } from '../../../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './verificationdocumentwizdetail.component.html'
})

export class VerificationdocumentwizdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');
  params = this.getRouteparam.snapshot.paramMap.get('id2'); 

  // variable
  public CurrencyFormat = this._currencyformat; 
  public isReadOnly: Boolean = false;
  public lookupasset: any = [];
  private rolecode: any = [];
  private dataRoleTamp: any = [];
  private dataTamp: any = [];
  public parameterData: any = [];
  private tamps = new Array();
  private base64textString: string;
  public tempFile: any;
  public tampHidden: Boolean;
  private tampDocumentCode: String;
  private APIController: String = 'ProcurementRequestDocument';
  private APIRouteForPriviewFile: String = 'Priview';
  private APIRouteForUploadFile: String = 'Upload';
  private APIRouteForDeleteFile: String = 'Deletefile';
  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForInsert: String = 'INSERT';
  private APIRouteForUpdate: String = 'UPDATE';
  private APIRouteForLookup: String = 'GetRowsForLookup';
  private APIRouteForGetRole: String = 'ExecSpForGetRole';
  private RoleAccessCode = 'R00011540000000A';

  // form 2 way binding
  model: any = {};

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
    private _elementRef: ElementRef
  ) { super(); }

  ngOnInit() {
    this.Delimiter(this._elementRef);
    this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
    if (this.params != null) {
      this.isReadOnly = true;
      // call web service
      this.callGetrow();
    } else {
      this.tampHidden = true;
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
          if (parsedata.paths == '' || parsedata.paths == null) {
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
  onFormSubmit(requestdocumentForm: NgForm, isValid: boolean) {
    // validation form submit
    if (!isValid) {
      swal({
        allowOutsideClick: false,
        title: 'Warning',
        text: 'Please Fill a Mandatory Field OR Format Is Invalid',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger',
        type: 'warning'
      }).catch(swal.noop)
      return;
    } else {
      this.showSpinner = true;
    }

    this.parameterData = this.JSToNumberFloats(requestdocumentForm);
    
    this.parameterData.p_file = [];
    const usersJson: any[] = Array.of(this.parameterData);

    if (this.params != null) {
      // call web service
      this.dalservice.Update(usersJson, this.APIController, this.APIRouteForUpdate)
        .subscribe(
          res => {
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              $('#clientDetail', parent.document).click();
              this.callGetrow();
              this.showNotification('top', 'right', 'success');
            } else {
              this.swalPopUpMsg(parse.data);
            }
          },
          error => {
            this.showSpinner = false;
            const parse = JSON.parse(error);
            this.swalPopUpMsg(parse.data)
          });
    } else {
      // call web service
      this.dalservice.Insert(usersJson, this.APIController, this.APIRouteForInsert)
        .subscribe(
          res => { 
            this.showSpinner = false;
            const parse = JSON.parse(res);
            if (parse.result === 1) {
              if (this.tamps.length != 0) {
                this.parameterData.p_file.push({
                  p_header: 'PROCUREMENT_DOCUMENT',
                  p_child: this.param,
                  p_id: parse.id,
                  p_file_paths: this.param,
                  p_file_name: this.tamps[0].p_file_name,
                  p_base64: this.tamps[0].p_base64
                });
              }

              if (this.parameterData.p_file.length === 0) {
                this.showNotification('bottom', 'right', 'success');
                this.route.navigate(['/transaction/subverification/verificationdetail/' + this.param + '/verificationdocumentwizdetail', this.param], { skipLocationChange: true });
              } else {
                this.dalservice.UploadFile(this.parameterData.p_file, this.APIController, this.APIRouteForUploadFile)
                  .subscribe(
                    // tslint:disable-next-line:no-shadowed-variable
                    res => {
                      this.tamps = new Array();
                      // tslint:disable-next-line:no-shadowed-variable
                      const parses = JSON.parse(res);
                      if (parses.result === 1) {
                        this.showNotification('bottom', 'right', 'success');
                        this.route.navigate(['/transaction/subverification/verificationdetail/' + this.param + '/verificationdocumentwizdetail', this.param, parse.id], { skipLocationChange: true });
                      } else {
                        this.swalPopUpMsg(parse.data);
                      }
                    },
                    error => {
                      this.tamps = new Array();
                      // tslint:disable-next-line:no-shadowed-variable
                      const parses = JSON.parse(error);
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
            this.swalPopUpMsg(parse.data)
          });
    }
  }
  //#endregion form submit

  //#region button back
  btnBack() {
    this.route.navigate(['/transaction/subverification/verificationdetail/' + this.param + '/verificationdocumentwizdetail', this.param], { skipLocationChange: true });
    $('#datatabledoc').DataTable().ajax.reload();
  }
  //#endregion button back


   //#region convert to base64
   handleFile(event) {
    this.showSpinner = true;
    const binaryString = event.target.result;
    this.base64textString = btoa(binaryString);

    this.tamps.push({
      p_header: 'PROCUREMENT_DOCUMENT', //ganti dengan nama menu
      p_module: 'IFINPROC', //ganti dengan nama module
      p_child: this.param,
      p_code: this.param,
      p_id: this.tampDocumentCode,
      p_file_paths: this.tampDocumentCode,
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
            $('#fileControl').val('');
            this.tempFile = undefined
            this.callGetrow()
          } else {
            this.showSpinner = false;
            this.swalPopUpMsg(parses.message);
            $('#fileControl').val('');
            this.tempFile = undefined
          }
          // $('#datatablesssss').DataTable().ajax.reload();
        },
        error => {
          this.showSpinner = false;
          this.tamps = new Array();
          // tslint:disable-next-line:no-shadowed-variable
          const parses = JSON.parse(error);
          this.swalPopUpMsg(parses.message);
          // $('#datatablesssss').DataTable().ajax.reload();
        });
  }
  //#endregion convert to base64


   //#region button select image
   onUpload(event, code: String) {
    const files = event.target.files;
    const file = files[0];

    if (this.CheckFileSize(files[0].size, this.model.value)) {
      this.swalPopUpMsg('V;File size must be less or equal to ' + this.model.value + ' MB');
      // $('#datatablePublicServiceDoc').DataTable().ajax.reload();
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
  //#region button delete image
  deleteImage(row2) {
    const usersJson: any[] = Array.of();
    usersJson.push({
      p_code: this.param,
      p_file_paths: row2
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
              this.showSpinner = false;
              const parse = JSON.parse(res);
              if (parse.result === 1) {
                this.showNotification('bottom', 'right', 'success');
                this.callGetrow();
              } else {
                this.swalPopUpMsg(parse.data);
              }
            },
            error => {
              const parse = JSON.parse(error);
              this.swalPopUpMsg(parse.data);
            });
      } else {
        this.showSpinner = false;
      }
    });
  }
  //#endregion button delete image

}
