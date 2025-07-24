import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../../../../base.component';
import { DALService } from '../../../../../../../../DALservice.service';
import { Location } from '@angular/common';
import swal from 'sweetalert2';
import { NgForm } from '@angular/forms';
import { log } from 'console';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './goodreceiptnoteobjectinfodetailwizlist.component.html'
})

export class CoverNoteDetailwizdetailComponent extends BaseComponent implements OnInit {

    param = this.getRouteparam.snapshot.paramMap.get('id');
    params = this.getRouteparam.snapshot.paramMap.get('id2');

    // variable
    public listobjectinfolist: any = [];
    public dataTamp: any = [];
    public listdataDetail: any = [];
    public AssetMaintenanceData: any = [];
    public lookupAsset: any = [];
    public lookupDisposalAsset: any = [];
    public listlegalprocessdetailData: any = [];
    public lookupCostCenter: any = [];
    public tempFile: any;
    private tamps = new Array();
    public isReadOnly: any;
    public item_code: any;
    public po_code: any;
    public purchase_order_detail_id: String = '';
    private dataTampPush: any = [];
    private dataRoleTamp: any = [];
    public lookupPoObjectInfoVHCL: any = [];
    private base64textString: string;
    private tampDocumentCode: String;
    private setStyle: any = [];
    public datauploadlist: any = [];

    //controller
    private APIController: String = 'GoodReceiptNoteDetailObjectInfo';
    private APIControllerHeader: String = 'GoodReceiptNoteDetail';
    private APIControllerPO: String = 'PurchaseOrder';
    private APIControllerPOObjectInfo: String = 'PurchaseOrderDetailObjectInfo';

    //routing
    private APIRouteForGetRows: String = 'GetRowsForCoverNote';
    private APIRouteForGetRowsForLookupVHCL: String = 'GetRowsForLookupPOVHCL';
    private APIRouteForDelete: String = 'ExecSpForDeleteObjectInfo';
    private APIRouteForGetRow: String = 'GetRow';
    private APIRouteForInsert: String = 'Insert';
    private APIRouteForUploadFile: String = 'Upload';
    private APIRouteForDeleteFile: String = 'Deletefile';
    private APIRouteForPriviewFile: String = 'Priview';
    private APIRouteForAddObjectInfoVhcl: String = 'ExecSpForUpdateObjectInfoVhcl';
    private APIRouteForupdateObjectInfoVhcl: String = 'UpdateForCoverNote';

    private RoleAccessCode = 'R00024430000001A';

    // ini buat datatables
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};

    // form 2 way binding
    model: any = {};

    // checklist
    public selectedAll: any;
    private checkedList: any = [];
    private checkedLookup: any = [];
    public selectedAllLookup: any;

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
        this.callGetrowHeader();
        this.loadData();
        const forTabInfo = setInterval(() => {
            if (this.purchase_order_detail_id != '') {
                clearInterval(forTabInfo);
                $('#datatableObjectInfo').DataTable().ajax.reload();

            }
        }, 200);
    }

    //#region Header getrow data
    callGetrowHeader() {
        // param tambahan untuk getrow dynamic
        this.dataTamp = [{
            'p_id': this.params,
        }]
        // end param tambahan untuk getrow dynamic

        this.dalservice.Getrow(this.dataTamp, this.APIControllerHeader, this.APIRouteForGetRow)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    const parsedata = this.getrowNgb(parse.data[0]);

                    if (parsedata.cover_note_status != 'HOLD') {
                        this.isReadOnly = true;
                    }
                    else {
                        this.isReadOnly = false;
                    }

                    this.item_code = parsedata.item_code;
                    this.po_code = parsedata.purchase_order_code;
                    this.purchase_order_detail_id = parsedata.purchase_order_detail_id;

                    // mapper dbtoui
                    Object.assign(this.model, parsedata);
                    // end mapper dbtoui
                    this.showSpinner = false;
                },
                error => {
                    console.log('There was an error while Retrieving Data(API) !!!' + error);
                });
    }
    //#endregion BatchDetail getrow data

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
                    'p_id': this.params,
                    'p_purchase_order_detail_id': this.purchase_order_detail_id
                })
                // end param tambahan untuk getrows dynamic                
                this.dalservice.Getrows(dtParameters, this.APIControllerPOObjectInfo, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    // if use checkAll use this
                    $('#checkall').prop('checked', false);
                    // end checkall

                    this.listobjectinfolist = parse.data;

                    if (parse.data != null) {
                        this.listobjectinfolist.numberIndex = dtParameters.start;
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
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 13] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        }
    }
    //#endregion load all data

    //#region button reload
    btnReloadOnjectInfo() {
        this.callGetrowHeader();
        $('#datatableObjectInfo').DataTable().ajax.reload();
    }
    //#endregion button reload

    //#region button save list
    btnSaveList() {
        this.showSpinner = true
        this.listdataDetail = [];

        var i = 0;

        var getID = $('[name="p_id_object_info"]')
            .map(function () { return $(this).val(); }).get();

        var getBPKB = $('[name="p_bpkb_no"]')
            .map(function () { return $(this).val(); }).get();

        var getCoverNote = $('[name="p_cover_note"]')
            .map(function () { return $(this).val(); }).get();

        var getCoverNoteDate = $('[name="p_cover_note_date"]')
            .map(function () { return $(this).val(); }).get();

        var getExpDate = $('[name="p_exp_date"]')
            .map(function () { return $(this).val(); }).get();

        while (i < getID.length) {
            while (i < getBPKB.length) {
                while (i < getCoverNote.length) {
                    while (i < getCoverNoteDate.length) {
                        while (i < getExpDate.length) {

                            let CoverNoteDate = null
                            if (getCoverNoteDate[i] !== "") {
                                CoverNoteDate = this.dateFormatList(getCoverNoteDate[i]);
                            }
                            let ExpDate = null
                            if (getExpDate[i] !== "") {
                                ExpDate = this.dateFormatList(getExpDate[i]);
                            }
                            this.listdataDetail.push(
                                this.JSToNumberFloats({
                                    p_id: getID[i],
                                    p_bpkb_no: getBPKB[i],
                                    p_cover_note: getCoverNote[i],
                                    p_cover_note_date: CoverNoteDate,
                                    p_exp_date: ExpDate
                                })
                            );
                            i++;
                        } i++;
                    } i++
                } i++;
            }
            i++;
        }

        this.datauploadlist.p_file = []

        // tslint:disable-next-line: no-shadowed-variable
        for (let i = 0; i < this.tamps.length; i++) {
            this.datauploadlist.p_file.push({
                p_module: 'IFIN_PROC',
                p_header: 'PROCUREMENT_DOCUMENT',
                p_child: this.param,
                p_id: this.tamps[i].p_id,
                p_surveyor_code: this.param,
                p_file_paths: this.tamps[i].p_file_paths,
                p_file_name: this.tamps[i].p_file_name,
                p_base64: this.tamps[i].p_base64
            });
        }

        //#region web service
        this.dalservice.Update(this.listdataDetail, this.APIControllerPOObjectInfo, this.APIRouteForupdateObjectInfoVhcl)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    if (this.datauploadlist.p_file.length <= 0) {
                        if (parse.result === 1) {
                            this.showSpinner = false;
                            $('#datatableObjectInfo').DataTable().ajax.reload();
                            this.showNotification('bottom', 'right', 'success');
                        } else {
                            this.showSpinner = false;
                            this.swalPopUpMsg(parse.data);
                        }
                    } else {
                        this.dalservice.UploadFile(this.datauploadlist.p_file, this.APIControllerPOObjectInfo, this.APIRouteForUploadFile)
                            .subscribe(
                                res => {
                                    const parse = JSON.parse(res);
                                    if (parse.result === 1) {
                                        this.showSpinner = false;
                                        this.showNotification('bottom', 'right', 'success');
                                        $('#datatableObjectInfo').DataTable().ajax.reload();
                                        this.tamps = [];
                                    } else {
                                        this.swalPopUpMsg(parse.data);
                                    }
                                },
                                error => {
                                    this.showSpinner = false;
                                    const parse = JSON.parse(error);
                                    this.swalPopUpMsg(parse.data);
                                    $('#datatableObjectInfo').DataTable().ajax.reload();

                                });
                    }
                },
                error => {
                    this.showSpinner = false
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);
                });
        //#endregion web service

    }
    //#endregion button save list

    //#region checkbox all table
    btnDeleteAll() {
        this.checkedList = [];
        for (let i = 0; i < this.listobjectinfolist.length; i++) {
            if (this.listobjectinfolist[i].selected) {
                this.checkedList.push(this.listobjectinfolist[i].id);
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
                    this.dalservice.ExecSp(this.dataTampPush, this.APIControllerPOObjectInfo, this.APIRouteForDelete)
                        .subscribe(
                            res => {
                                this.showSpinner = false;
                                const parse = JSON.parse(res);
                                if (parse.result === 1) {
                                    if (this.checkedList.length == J + 1) {
                                        this.showNotification('bottom', 'right', 'success');
                                        $('#datatableObjectInfo').DataTable().ajax.reload();
                                        // if use checkAll use this
                                        $('#checkall').prop('checked', false);
                                        // end checkall
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
        for (let i = 0; i < this.listobjectinfolist.length; i++) {
            this.listobjectinfolist[i].selected = this.selectedAll;
        }
    }

    checkIfAllTableSelected() {
        this.selectedAll = this.listobjectinfolist.every(function (item: any) {
            return item.selected === true;
        })
    }
    //#endregion checkbox all table

    //#region button add
    btnAdd() {
        // param tambahan untuk getrole dynamic
        this.dataRoleTamp = [this.JSToNumberFloats({
            'p_good_receipt_note_detail_id': this.params,
            'p_plat_no': '',
            'p_chassis_no': '',
            'p_engine_no': '',
            'p_file_name': '',
            'p_file_path': ''
        })];
        // param tambahan untuk getrole dynamic
        this.dalservice.Insert(this.dataRoleTamp, this.APIController, this.APIRouteForInsert)
            .subscribe(
                res => {
                    this.showSpinner = false;
                    const parse = JSON.parse(res);

                    if (parse.result === 1) {
                        $('#datatableObjectInfo').DataTable().ajax.reload();
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

    //#region button edit
    btnEdit(codeEdit: string) {
        this.route.navigate(['/transaction/subgoodreceiptnotelist/goodreceiptnotedetaildetail/' + this.param + '/' + this.params + '/goodreceiptnotedetailobjectinfodetail', this.param, this.params, codeEdit], { skipLocationChange: true });
    }
    //#endregion button edit

    //#region lookup Po Object VHCL
    btnLookupPoObjectInfoVHCL() {
        $('#datatablePoObjectVHCL').DataTable().clear().destroy();
        $('#datatablePoObjectVHCL').DataTable({
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
                    'p_po_code': this.po_code,
                    'p_item_code': this.item_code,
                    'p_id': this.params
                });
                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIControllerPO, this.APIRouteForGetRowsForLookupVHCL).subscribe(resp => {
                    const parse = JSON.parse(resp);

                    this.lookupPoObjectInfoVHCL = parse.data;
                    if (parse.data != null) {
                        this.lookupPoObjectInfoVHCL.numberIndex = dtParameters.start;
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
    //#endregion lookup Po Object VHCL

    //#region checkbox all lookup
    btnSelectAllLookup() {
        this.checkedLookup = [];
        for (let i = 0; i < this.lookupPoObjectInfoVHCL.length; i++) {
            if (this.lookupPoObjectInfoVHCL[i].selectedLookup) {
                // this.checkedLookup.push(this.lookupDisposalAsset[i].code);
                this.checkedLookup.push({
                    ObjectID: this.lookupPoObjectInfoVHCL[i].id,
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
        for (let J = 0; J < this.checkedLookup.length; J++) {
            // const codeData = this.checkedLookup[J];
            this.dataTamp = [{
                'p_id': this.checkedLookup[J].ObjectID,
                'p_good_receipt_note_detail_id': this.params
            }];

            // end param tambahan untuk getrow dynamic
            this.dalservice.ExecSp(this.dataTamp, this.APIControllerPO, this.APIRouteForAddObjectInfoVhcl)
                .subscribe(
                    res => {
                        this.showSpinner = false;
                        const parse = JSON.parse(res);
                        if (parse.result === 1) {
                            if (this.checkedLookup.length == J + 1) {
                                if (this.checkedLookup.length == J + 1) {
                                    this.callGetrowHeader();
                                    $('#datatablePoObjectVHCL').DataTable().ajax.reload();
                                    $('#datatableObjectInfo').DataTable().ajax.reload();
                                    $('#reloadHeader').click();
                                    this.showNotification('bottom', 'right', 'success');
                                }
                            }
                        } else {
                            this.swalPopUpMsg(parse.data);
                            this.showSpinner = false;
                        }
                    },
                    error => {
                        const parse = JSON.parse(error);
                        this.swalPopUpMsg(parse.data);
                        this.showSpinner = false;
                    }
                );

        }
    }

    selectAllLookup() {
        for (let i = 0; i < this.lookupPoObjectInfoVHCL.length; i++) {
            this.lookupPoObjectInfoVHCL[i].selectedLookup = this.selectedAllLookup;
        }
    }

    checkIfAllLookupSelected() {
        this.selectedAllLookup = this.lookupPoObjectInfoVHCL.every(function (item: any) {
            return item.selectedLookup === true;
        })
    }
    //#endregion checkbox all table

    //#region lookup close
    btnLookupClose() {
        $('#datatableObjectInfo').DataTable().ajax.reload();
    }
    //#endregion lookup close

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

    //#region convert to base64
    handleFile(event) {
        const binaryString = event.target.result;
        this.base64textString = btoa(binaryString);

        this.tamps.push({
            p_module: 'IFIN_PROC',
            p_header: 'PROCUREMENT_DOCUMENT',
            p_child: this.param,
            p_id: this.tampDocumentCode,
            p_file_paths: this.tampDocumentCode,
            p_file_name: this.tempFile,
            p_base64: this.base64textString
        });
        // this.dalservice.UploadFile(this.tamps, this.APIController, this.APIRouteForUploadFile)
        //     .subscribe(
        //         // tslint:disable-next-line:no-shadowed-variable
        //         res => {
        //             this.tamps = new Array();
        //             // tslint:disable-next-line:no-shadowed-variable
        //             const parses = JSON.parse(res);
        //             if (parses.result === 1) {
        //                 this.showSpinner = false;
        //             } else {
        //                 this.showSpinner = false;
        //                 this.swalPopUpMsg(parses.message);
        //             }
        //             $('#datatableObjectInfo').DataTable().ajax.reload();
        //             this.showNotification('bottom', 'right', 'success');
        //         },
        //         error => {
        //             this.showSpinner = false;
        //             this.tamps = new Array();
        //             // tslint:disable-next-line:no-shadowed-variable
        //             const parses = JSON.parse(error);
        //             this.swalPopUpMsg(parses.message);
        //             $('#datatableObjectInfo').DataTable().ajax.reload();
        //         });
    }
    //#endregion convert to base64

    //#region button priview image
    previewFile(row1, row2) {
        this.showSpinner = true;
        const usersJson: any[] = Array.of();

        usersJson.push({
            p_file_name: row1,
            p_file_paths: row2
        });

        this.dalservice.PriviewFile(usersJson, this.APIControllerPOObjectInfo, this.APIRouteForPriviewFile)
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

        this.dalservice.PriviewFile(usersJson, this.APIControllerPOObjectInfo, this.APIRouteForPriviewFile)
            .subscribe(
                (res) => {
                    const parse = JSON.parse(res);

                    if (parse.value.filename !== '') {
                        const fileType = parse.value.filename.split('.').pop();
                        if (fileType === 'PNG') {
                            this.pngFileList(parse.value.data);
                        }
                        if (fileType === 'JPEG' || fileType === 'JPG') {
                            this.jpgFileList(parse.value.data);
                        }
                    }
                }
            );
    }
    //#endregion button previewFileList

    //#region button delete image
    deleteImage(code: String, file_name: any, paths: any) {
        const usersJson: any[] = Array.of();
        usersJson.push({
            'p_id': code,
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
            if (result.value) {

                this.dalservice.DeleteFile(usersJson, this.APIControllerPOObjectInfo, this.APIRouteForDeleteFile)
                    .subscribe(
                        res => {
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.showNotification('bottom', 'right', 'success');
                                $('#datatableObjectInfo').DataTable().ajax.reload();
                                this.tamps = [];
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


