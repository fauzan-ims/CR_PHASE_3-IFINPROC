import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './gllinkdetail.component.html'
})

export class GllinkdetailComponent extends BaseComponent implements OnInit {
  // get param from url
  param = this.getRouteparam.snapshot.paramMap.get('id');

  // variable
  public parameterData: any = [];
  public isReadOnly: Boolean = false;
  private dataTamp: any = [];

  private APIController: String = 'JournalGlLink';

  private APIRouteForGetRow: String = 'GETROW';
  private APIRouteForInsert: String = 'INSERT';
  private APIRouteForUpdate: String = 'UPDATE';

  private RoleAccessCode = 'R00022410000010A'; // role access 

  // form 2 way binding
  model: any = {};

  // spinner
  showSpinner: Boolean = true;
  // end

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
      this.showSpinner = false;
    }
  }

  //#region getrow data
  callGetrow() {
    
    this.dataTamp = [{
      'p_code': this.param
    }]
    

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
  onFormSubmit(gllinkForm: NgForm, isValid: boolean) {
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

    this.parameterData = gllinkForm;
    if (this.parameterData.p_is_active == null) {
      this.parameterData.p_is_active = false;
    }
    const usersJson: any[] = Array.of(this.parameterData);
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
              this.swalPopUpMsg(parse.data)
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
              this.route.navigate(['/systemsetting/subgllinklist/gllinkdetail', this.parameterData.p_code]);
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
    this.route.navigate(['/systemsetting/subgllinklist']);
    $('#datatable').DataTable().ajax.reload();
  }
  //#endregion button back
}