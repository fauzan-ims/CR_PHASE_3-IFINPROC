import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './assetdetail.component.html'
})

export class AssetdetailComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');

    // variable
    public isReadOnly: Boolean = false;
    public dataTampPush: any = [];
    public isBreak: Boolean = false;
    private dataTamp: any = [];
    private listpaymentdetail: any = [];
    private setStyle: any = [];

    private APIController: String = 'Asset';
    private APIRouteForGetRow: String = 'GetRow';
    private RoleAccessCode = 'R00021710000000A'; // role access 


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
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_code': this.param,
        }];
        // end param tambahan untuk getrow dynamic

        this.dalservice.Getrow(this.dataTamp, this.APIController, this.APIRouteForGetRow)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    const parsedata = this.getrowNgb(parse.data[0]);

                    // mapper dbtoui
                    Object.assign(this.model, parsedata);
                    // end mapper dbtoui

                    this.showSpinner = false;
                },
                error => {
                    console.log('There was an error while Retrieving Data(API)' + error);
                });
    }
    //#endregion getrow data

    //#region button back
    btnBack() {
        this.route.navigate(['/interface/assetlist']);
        $('#datatablearealist').DataTable().ajax.reload();
    }
    //#endregion button back

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
}
