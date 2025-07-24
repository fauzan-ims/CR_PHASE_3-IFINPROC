import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { BaseService } from './base.service';
import { DALService } from './DALservice.service';
import { isNull } from 'util';
import swal from 'sweetalert2';
import { AnimationGroupPlayer } from '@angular/animations/src/players/animation_group_player';
import { NavigationStart, NavigationEnd } from '@angular/router';
import { IAngularMyDpOptions } from 'angular-mydatepicker';
import { from } from 'rxjs';

// call function from js shared
declare function hideAllButtonAndLock(username): any;

declare var $: any;


export abstract class BaseComponent extends BaseService {
    //#region wizard
    protected wizard() {
        //#region wizard init
        setTimeout(function () {
            $('.card.card-wizard').addClass('active');
        }, 600);

        $('.card-wizard').bootstrapWizard({
            'tabClass': 'nav nav-pills',
            'nextSelector': '.btn-next',
            'previousSelector': '.btn-previous',

            onInit: function (tab: any, navigation: any, index: any) {

                // check number of tabs and fill the entire row
                let $total = navigation.find('li').length;
                const $wizard = navigation.closest('.card-wizard');

                const $first_li = navigation.find('li:first-child a').html();
                const $moving_div = $('<div class="moving-tab">' + $first_li + '</div>');
                $('.card-wizard .wizard-navigation').append($moving_div);

                $total = $wizard.find('.nav li').length;
                let $li_width = 100 / $total;

                const total_steps = $wizard.find('.nav li').length;
                let move_distance = $wizard.width() / total_steps;
                let index_temp = index;
                let vertical_level = 0;

                const mobile_device = $(document).width() < 600 && $total > 3;

                if (mobile_device) {
                    move_distance = $wizard.width() / 2;
                    index_temp = index % 2;
                    $li_width = 50;
                }

                $wizard.find('.nav li').css('width', $li_width + '%');

                const step_width = move_distance;
                move_distance = move_distance * index_temp;

                const $current = index + 1;

                if ($current === 1 || (mobile_device === true && (index % 2 === 0))) {
                    move_distance -= 8;
                } else if ($current === total_steps || (mobile_device === true && (index % 2 === 1))) {
                    move_distance += 8;
                }

                if (mobile_device) {
                    const x: any = index / 2;
                    // tslint:disable-next-line:radix
                    vertical_level = parseInt(x);
                    vertical_level = vertical_level * 38;
                }

                $wizard.find('.moving-tab').css('width', step_width);
                $('.moving-tab').css({
                    'transform': 'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
                    'transition': 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'

                });
                $('.moving-tab').css('transition', 'transform 0s');
            },

            onTabClick: function () {

                const $valid = $('.card-wizard form').valid();

                if (!$valid) {
                    return false;
                } else {
                    return true;
                }
            },

            onTabShow: function (tab: any, navigation: any, index: any) {
                let $total = navigation.find('li').length;
                let $current = index + 1;

                const $wizard = navigation.closest('.card-wizard');

                // If it's the last tab then hide the last button and show the finish instead
                if ($current >= $total) {
                    $($wizard).find('.btn-next').hide();
                    $($wizard).find('.btn-finish').show();
                } else {
                    $($wizard).find('.btn-next').show();
                    $($wizard).find('.btn-finish').hide();
                }

                const button_text = navigation.find('li:nth-child(' + $current + ') a').html();

                setTimeout(function () {
                    $('.moving-tab').html(button_text);
                }, 150);

                const checkbox = $('.footer-checkbox');

                if (index === 0) {
                    $(checkbox).css({
                        'opacity': '0',
                        'visibility': 'hidden',
                        'position': 'absolute'
                    });
                } else {
                    $(checkbox).css({
                        'opacity': '1',
                        'visibility': 'visible'
                    });
                }

                $total = $wizard.find('.nav li').length;
                let $li_width = 100 / $total;

                const total_steps = $wizard.find('.nav li').length;
                let move_distance = $wizard.width() / total_steps;
                let index_temp = index;
                let vertical_level = 0;

                const mobile_device = $(document).width() < 600 && $total > 3;

                if (mobile_device) {
                    move_distance = $wizard.width() / 2;
                    index_temp = index % 2;
                    $li_width = 50;
                }

                $wizard.find('.nav li').css('width', $li_width + '%');

                const step_width = move_distance;
                move_distance = move_distance * index_temp;

                $current = index + 1;

                if (mobile_device) {
                    const x: any = index / 2;
                    // tslint:disable-next-line:radix
                    vertical_level = parseInt(x);
                    vertical_level = vertical_level * 38;
                }

                $wizard.find('.moving-tab').css('width', step_width);
                $('.moving-tab').css({
                    'transform': 'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
                    'transition': 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'

                });
            }
        });
        //#endregion wizard init
    }

    protected smartWizard() {
        // smartwizard install dulu npm install smartwizard dan jquery-steps

        setTimeout(function () {
            $('#smartwizard').smartWizard();
        }, 600);

        // setTimeout(function() {
        //     $('#smartwizard').data('smartWizard')._showStep(1); // go to step 3....
        //  }, 50);

        $('#smartwizard').smartWizard({
            selected: 0, // Initial selected step, 0 = first step
            theme: 'dots', // theme for the wizard, related css need to include for other than default theme
            justified: true, // Nav menu justification. true/false
            autoAdjustHeight: true, // Automatically adjust content height
            cycleSteps: false, // Allows to cycle the navigation of steps
            backButtonSupport: true, // Enable the back button support
            enableURLhash: false, // Enable selection of the step based on url hash
            transition: {
                animation: 'none', // Effect on navigation, none/fade/slide-horizontal/slide-vertical/slide-swing
                speed: '400', // Transion animation speed
                easing: '' // Transition animation easing. Not supported without a jQuery easing plugin
            },
            toolbarSettings: {
                toolbarPosition: 'top', // none, top, bottom, both
                toolbarButtonPosition: 'right', // left, right, center
                showNextButton: false, // show/hide a Next button
                showPreviousButton: false, // show/hide a Previous button
                toolbarExtraButtons: [] // Extra buttons to show on toolbar, array of jQuery input/buttons elements
                //   toolbarExtraButtons: [
                //     $('<button></button>').text('Finish')
                //                 .addClass('btn btn-info')
                //                 .on('click', function() {
                //                     alert('Finish button click');
                //                 }),
                //     $('<button></button>').text('Cancel')
                //                 .addClass('btn btn-danger')
                //                 .on('click', function() {
                //                     alert('Cancel button click');
                //                 })
                // ]
            },
            anchorSettings: {
                anchorClickable: true, // Enable/Disable anchor navigation
                enableAllAnchors: false, // Activates all anchors clickable all times
                markDoneStep: true, // Add done css
                markAllPreviousStepsAsDone: true, // When a step selected by url hash, all previous steps are marked done
                removeDoneStepOnNavigateBack: false, // While navigate back done step after active step will be cleared
                enableAnchorOnDoneStep: true // Enable/Disable the done steps navigation
            },
            keyboardSettings: {
                keyNavigation: true, // Enable/Disable keyboard navigation(left and right keys are used if enabled)
                keyLeft: [37], // Left key code
                keyRight: [39] // Right key code
            },
            lang: { // Language variables for button
                next: 'Next',
                previous: 'Previous'
            },
            disabledSteps: [], // Array Steps disabled
            errorSteps: [], // Highlight step with errors
            hiddenSteps: [] // Hidden steps
        });

        // untuk custom button
        // $('#prev').on('click', function () {
        //     // Navigate previous
        //     $('#smartwizard').smartWizard('prev');
        //     const stepIndex = $('#smartwizard').smartWizard('getStepIndex');
        //     console.log(stepIndex);
        //     return true;
        // });

        // $('#next').on('click', function () {
        //     // Navigate next
        //     $('#smartwizard').smartWizard('next');
        //     const stepIndex = $('#smartwizard').smartWizard('getStepIndex');
        //     (stepIndex);
        //     return true;
        // });
        // untuk custom button
    }
    //#endregion wizard

    // spinner
    showSpinner: Boolean = false;
    // end

    protected userId = this.AllModUrl('username');
    public userName = this.AllModUrl('name');
    protected mainMenuPath = this.AllModUrl('urlMainMenu');

    //#region WARNING!!! hanya untuk publish 
    protected iframePublishPath = this.AllModUrl('publishPathIFINPROC');
    //#endregion

    //#region file
    protected pngFile(file: String) {
        return '<img src=data:image/png;base64,' + file + ' width="100%" height="100%">';
    }
    protected pngFileList(file: String) {
        return '<img src=data:image/png;base64,' + file + ' width="50%" height="50%">';
    }

    protected jpgFile(file: String) {
        return '<img src=data:image/jpg;base64,' + file + ' width="100%" height="100%">';
    }
    protected jpgFileList(file: String) {
        return '<img src=data:image/jpg;base64,' + file + ' width="50%" height="50%">';
    }

    protected pdfFile(file: String) {
        return '<object data=data:application/pdf;base64,' + file + ' width="100%" height="100%">';
    }

    protected docFile(file: String) {
        return '<object data=data:application/docx;base64,' + file + ' width="100%" height="100%">';
    }
    //#endregion file

    //#region regexValidationFrom
    // tslint:disable-next-line:member-ordering
    protected _emailformat = '[A-Za-z0-9._%+-]{1,}@[a-zA-Z+-]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})';
    // tslint:disable-next-line:member-ordering
    protected _timeformat = '^([0-1][0-9]|[2][0-3]):([0-5][0-9])$';
    protected _numberonlyformat = '^[0-9]*$';
    protected _amountformat = '(?:\+|\-|\$)?\d{1,}(?:\,?\d{3})*(?:\.\d+)?%?';
    protected _currencyformat = '^(?!0,?\d)([0-9]{2}[0-9]{0,}(\.[0-9]{2}))$';
    protected _npwpformat = '(([0-9 ]{2}\.[0-9 ]{3}\.[0-9 ]{3}\.[0-9 ]{1}\.[0-9 ]{3}\.[0-9]{3})|([0-9 ]{1}\.[0-9 ]{3}\.[0-9 ]{3}\.[0-9 ]{1}\-[0-9 ]{3}))';
    protected _websiteformat = '^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$';
    //#endregion regexValidationFrom

    //#region
    protected _listdialogconf = 'No data selected, select at least one data.';
    protected _deleteconf = 'Yes';
    //#endregion

    //#region getrole
    callGetRole(uidParam: String, element: any, service: DALService, menuCode: any, route: any) {
        setInterval(() =>{
            const currentDate = new Date();
            this.currentTime = currentDate.toLocaleTimeString();
        },1000);

        // param tambahan untuk getrole dynamic

        let dataRoleTamp: any = [];
        const rolecodeHeader: any = [];

        const ApiController = 'SysMenuRole';
        const APIRouteForGetRole = 'ExecSpForGetRole';

        dataRoleTamp = [{
            'p_uid': uidParam,
            'action': 'getResponse'
        }];
        // param tambahan untuk getrole dynamic

        service.ExecSpSys(dataRoleTamp, ApiController, APIRouteForGetRole)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);
                    const rolecode = parse.data;

                    // get role code from server and push into array
                    for (let i = 0; i < rolecode.length; i++) {
                        rolecodeHeader.push(rolecode[i].role_code);
                    }

                    // if (rolecodeHeader.indexOf(menuCode) === -1) {
                    //     route.navigate(['/unauthorized']);
                    // }

                    // hide element when not a role code match with data-role in screen
                    // const domElement = document.querySelectorAll('[data-role]');
                    // for (let j = 0; j < domElement.length; j++) {
                    //     // tslint:disable-next-line:no-shadowed-variable
                    //     const elementAttr = domElement[j].getAttribute('data-role');

                    //     if (rolecodeHeader.indexOf(elementAttr) === -1) {
                    //         try {
                    //             element.nativeElement.querySelector('[data-role = "' + elementAttr + '"]').style.display = 'none';
                    //         }
                    //         catch (err) {
                    //             var error = err.message;
                    //         }
                    //     }
                    // }
                    // end hide element
                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data)
                });
    }
    //#endregion getrole

    //#region convert getrow date to ngbdatepicker
    getrowNgb(dob: any) {

        // var matches = null;
        var reg = /^(\d{4})(?:-?W(\d+)(?:-?(\d+)D?)?|(?:-(\d+))?-(\d+))(?:[T ](\d+):(\d+)(?::(\d+)(?:\.(\d+))?)?)?(?:Z(-?\d*))?$/;

        Object.keys(dob).forEach(function (key) {

            // (dob[key]);
            // matches = null;

            var matches = reg.test(dob[key]);

            // matches = dob[key].match(/^(\d{4})(?:-?W(\d+)(?:-?(\d+)D?)?|(?:-(\d+))?-(\d+))(?:[T ](\d+):(\d+)(?::(\d+)(?:\.(\d+))?)?)?(?:Z(-?\d*))?$/);

            // (matches);
            if (matches != false) {


                const [year, month, day] = dob[key].split('-');

                const dateObject = {
                    year: parseInt(year), month: parseInt(month), day:
                        parseInt(day.split(' ')[0].trim())
                }

                const obj = {
                    dateRange: null,
                    isRange: false,
                    singleDate: {
                        date: dateObject
                        // epoc: 1600102800,
                        // formatted: '',
                        // jsDate: new Date(dob[key])
                    }
                };

                dob[key] = obj;

            }

        });

        return dob;

    }
    ////#endregion
    //#region string number format to number decimal
    JSToNumberFloats(value: {}) {
        let values = {}

        Object.keys(value).forEach(function (key) {
            // console.table('Key : ' + key + ', Value : ' + value[key]) 

            if (value[key] === undefined || value[key] === null) {
                value[key] = '';
            }

            //#region ini untuk convertDate
            if (typeof value[key] === 'object') {

                // (value[key]);

                let convertDate = null;

                if (value[key].hasOwnProperty('singleDate')) {
                    convertDate = new Date(value[key].singleDate.date.year, value[key].singleDate.date.month - 1, value[key].singleDate.date.day);
                }
                else {
                    convertDate = new Date(value[key].year, value[key].month - 1, value[key].day);
                }

                var d = new Date(convertDate),
                    month = '' + (d.getMonth() + 1),
                    day = '' + d.getDate(),
                    year = d.getFullYear();

                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;

                values = [year, month, day].join('-');

                value[key] = values;



            }
            //#endregion ini untuk convertDate
            else {

                const ifUndef = '' + value[key].toString();


                if (!ifUndef.match('^[0-9]*$')) {


                    if (!ifUndef.match('^[a-zA-Z0-9_-]*$')) {


                        const repString = ifUndef.replace(/\,/g, '');

                        const minusNumber = parseFloat(repString.toString().replace(/\,/g, ''));

                        if (
                            ifUndef.replace(/\,/g, '').match('^(?!0,?\d)([0-9]{2}[0-9]{0,}(\.[0-9]{2}))$') // amount
                            || ifUndef.replace(/\,/g, '').match('^[0-9]{0,2}(\.[0-9]{1,6})?$|^(100)(\.[0]{1,6})?$') // rate
                            || ifUndef.replace(/\,/g, '').match('^(?!0,?\d)([0-9]{2}[0-9]{0,}(\.[0-9]{6}))$') // rate lebih dari 100
                            || minusNumber < 0
                        ) {

                            values = value[key];
                            values = parseFloat(values.toString().replace(/\,/g, ''));
                            value[key] = values;

                        }

                    }

                }
            }

        });

        return value;
    }
    //#endregion

    //#region amount rate dll
    Delimiter(element: any) {

        const numberAmt = element.nativeElement.querySelectorAll('[amount]');
        const numberRate = element.nativeElement.querySelectorAll('[rate]');

        // --------------------------------------------------------

        if (numberAmt.length > 0) {

            $('[amount]').on('blur focus', function (event: any) {

                const numberVal = jQuery(this).attr('amount');

                if (event.type === 'blur') {

                    if (event.target.value.match('[A-Za-z]')) {
                        event.target.value = 0;
                    }

                    event = '' + event.target.value;
                    event = event.trim();
                    event = parseFloat(event).toFixed(2); // ganti jadi 6 kalo mau pct

                    event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');

                    if (event === 'NaN') {
                        event = '';
                        // event = parseFloat(event).toFixed(2);
                    }

                    $('[amount = "' + numberVal + '"]').val(event);

                } else {

                    event = '' + event.target.value;

                    if (event != null) {
                        event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
                    }

                    $('[amount = "' + numberVal + '"]').val(event);

                }


            });

        }

        if (numberRate.length > 0) {


            $('[rate]').on('blur focus', function (event: any) {

                const numberVal = jQuery(this).attr('rate');

                if (event.type === 'blur') {

                    if (event.target.value.match('[A-Za-z]')) {
                        event.target.value = 0;
                    }

                    event = '' + event.target.value;
                    event = event.trim();
                    event = parseFloat(event).toFixed(6);

                    // event = event.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');


                    if (event === 'NaN') {
                        event = '';
                        // event = parseFloat(event).toFixed(6);
                    }

                    $('[rate = "' + numberVal + '"]').val(event);

                } else {

                    event = '' + event.target.value;

                    if (event != null) {
                        event = event.replace(/[ ]*,[ ]*|[ ]+/g, '');
                    }

                    $('[rate = "' + numberVal + '"]').val(event);

                }


            });
        }


    }
    //#endregion

    //#region myDatePicker
    myDatePickerOptions: IAngularMyDpOptions = {
        dateFormat: 'dd/mm/yyyy',//'yyyy-mm-dd',
        showFooterToday: true,
        // dateRange: true
        // other options here
    }
    //#endregion

    //#region shownotif
    showNotification(from, align, type) {
        // var type = ['','info','success','warning','danger'];

        var color = Math.floor((Math.random() * 4) + 1);


        $.notify({
            icon: "ti-gift",
            message: "Success."
        }, {
            type: type, // type[color],
            timer: 500,
            placement: {
                from: from,
                align: align
            },
            template: '<div style="width: 10rem; background-color: #0000ff; padding-top: 12px; padding-bottom: 12px;" data-notify="container" class="col-11 col-md-4 alert alert-{0} alert-with-icon" role="alert"><button type="button" aria-hidden="true" class="close" data-notify="dismiss"><i class="nc-icon nc-simple-remove"></i></button><span data-notify="icon" class="nc-icon nc-check-2"></span> <span data-notify="title">{1}</span> <span data-notify="message">{2}</span><div class="progress" data-notify="progressbar"><div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div></div><a href="{3}" target="{4}" data-notify="url"></a></div>'
        });
    }
    //#endregion

    //#region  swalPopUpMsg
    swalPopUpMsg(msg) {
        let tampMsg = [];
        tampMsg = msg.split(';', 1);

        if (tampMsg[0] === 'V') {
            swal({
                allowOutsideClick: false,
                title: 'Warning',
                text: msg.substring(2),
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-danger',
                type: 'warning'
            }).catch(swal.noop);
        } else if (tampMsg[0] === 'E') {
            swal({
                allowOutsideClick: false,
                title: 'System Warning',
                showCancelButton: true,
                buttonsStyling: false,
                reverseButtons: true,
                cancelButtonClass: 'btn btn-danger',
                confirmButtonClass: 'btn btn-info',
                cancelButtonText: 'Ok',
                confirmButtonText: 'Info',
                type: 'warning'
            }).then((result) => {
                if (result.value) {
                    swal({
                        allowOutsideClick: false,
                        title: '',
                        text: msg.substring(20),
                        buttonsStyling: false,
                        confirmButtonClass: 'btn btn-info',
                        type: 'info'
                    }).catch(swal.noop);
                }
            })
        } else {
            swal({
                allowOutsideClick: false,
                title: 'System Warning',
                text: msg,
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-danger',
                type: 'warning'
            }).catch(swal.noop);
        }
    }
    //#endregion  swalPopUpMsg
    // }

    //#region lock detail page if another user open detail page
    protected lockPage(trx_code: any, service: DALService) {

        let tempTable: any = [];
        let APIController: any = 'PagesLocking';
        let APIRouteForGetRole: any = 'ExecSpLocking';

        tempTable = [{
            'p_trx_no': trx_code,
            'p_locked_by': this.userId,
            'p_locked_by_name': this.userName,
            'action': 'getResponse'
        }];


        service.ExecSp(tempTable, APIController, APIRouteForGetRole)
            .subscribe(
                res => {

                    const parse = JSON.parse(res);
                    const parseData = parse.data[0];

                    const is_locking = parseData.is_lock;
                    const name_locking = parseData.name;


                    if (is_locking == 'LOCK') {
                        hideAllButtonAndLock(name_locking);
                    }


                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data)
                });



    }
    //#endregion end lock detail page if another user open detail page

    //#region lock detail page if another user open detail page
    protected releasePage(trx_code: any, service: DALService) {

        let tempTable: any = [];
        let APIController: any = 'PagesLocking';
        let APIRouteForGetRole: any = 'ExecSpRelease';

        tempTable = [{
            'p_trx_no': trx_code,
            'p_locked_by': this.userId
            // ,
            // 'action': 'getResponse'
        }];


        service.ExecSp(tempTable, APIController, APIRouteForGetRole)
            .subscribe(
                res => {

                    const parse = JSON.parse(res);
                    const parseData = parse.data[0];

                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data)
                });



    }
    //#endregion end lock detail page if another user open detail page

    protected reloadHeader(idheader: any, controller: any, route: any, service: DALService) {


        // var getStatus = $('[name="p_clearing_result_status"]')
        //   .map(function () { return $(this).val(); }).get();

        // var getValueDate = $('[name="p_clearing_result_value_date"]')
        //   .map(function () { return $(this).val(); }).get();

        // var getReffNo = $('[name="p_clearing_result_reff_no"]')
        //   .map(function () { return $(this).val(); }).get();



        // let tempTable:any = [];

        // tempTable = [{
        //     'p_code': idheader
        // }];

        // service.Getrow(tempTable, controller, route)
        // .subscribe(
        //     res => {
        //         // const parse = JSON.parse(res);
        //         // const parsedata = parse.data[0];

        //         // //  checkbox region
        //         // if (parsedata.is_active === '1') {
        //         //     parsedata.is_active = true;
        //         // } else {
        //         //     parsedata.is_active = false;
        //         // }
        //         // // end checkbox region

        //         // // mapper dbtoui
        //         // Object.assign(this.model, parsedata);
        //         // // end

        //         // this.showSpinner = false;
        //     },
        //     error => {
        //     ('There was an error while Retrieving Data(API) !!!' + error);
        //     });

    }

    //#region  hidepanel
    compoSide(loc: any, element: any, route: any) {

        let urlParent = '';
        let titlee = '';

        if (loc !== '') {

            titlee = loc.prepareExternalUrl(loc.path());

            if (this.iframePublishPath == '') {
                urlParent = '/' + titlee.split('/')[1] + '/' + titlee.split('/')[2]; // local
            }
            else {
                urlParent = this.iframePublishPath + titlee.split('/')[this.iframePublishPath.split('/').length - 1] + '/' + titlee.split('/')[this.iframePublishPath.split('/').length]; //publish
            }

            if (titlee !== urlParent) {
                element.nativeElement.querySelector('#hideMainPanel').style.display = 'none';
            } else {
                element.nativeElement.querySelector('#hideMainPanel').style.display = 'block';
            }

            route.events.subscribe((event: any) => {

                if (event instanceof NavigationStart) {

                    const eventurl = this.iframePublishPath.slice(0, -1) + event.url;

                    if (eventurl !== urlParent) {
                        element.nativeElement.querySelector('#hideMainPanel').style.display = 'none';
                    } else {
                        element.nativeElement.querySelector('#hideMainPanel').style.display = 'block';
                    }


                } else if (event instanceof NavigationEnd) {

                    const eventurl = this.iframePublishPath.slice(0, -1) + event.url;

                    if (eventurl !== urlParent) {
                        element.nativeElement.querySelector('#hideMainPanel').style.display = 'none';
                    } else {
                        element.nativeElement.querySelector('#hideMainPanel').style.display = 'block';
                    }

                }

            });

        } else {
            route.events.subscribe((event: any) => {

                if (event instanceof NavigationStart) {

                } else if (event instanceof NavigationEnd) {

                    // #region wizard
                    const forWizard = this.iframePublishPath + event.url.split('/')[5]; // hideMainPanelWiz

                    if (forWizard !== undefined) {
                        element.nativeElement.querySelector('#hideMainPanelWiz').style.display = 'block';
                    }

                    const detailWiz = event.url.split('/')[7];

                    if (detailWiz !== undefined) {
                        element.nativeElement.querySelector('#hideMainPanelWiz').style.display = 'none';
                    }
                    // #endregion wizard
                }

            });
        }


    }
    //#endregion


    //#region format date in List 
    dateFormatList(convertDate: any) {
        if (convertDate !== undefined) {
            const split = convertDate.split('/');
            return [split[1], split[0], split[2]].join('/');
        }
    }
    //#endregion

    //#region dateFormater
    dateFormater(date: any) {

        if (date === 'dateNow') {

            date = new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear();
        }

        const obj = {
            dateRange: null,
            isRange: false,
            singleDate: {
                date: { 'year': ~~date.split('/')[2], 'month': ~~date.split('/')[1], 'day': ~~date.split('/')[0] },
            }
        }

        return obj;

    }
    //#endregion dateFormater



    //#region print rpt non core
    printRptNonCore(response: any) {

        var contentDisposition = response.headers.get('content-disposition');

        var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();

        var fileNameRpt = filename.split('\\');

        const blob = new Blob([response.body], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = fileNameRpt[fileNameRpt.length - 1].replace('"', '');
        link.click();

    }
    //#endregion print rpt non core

    //#region CheckFileSize
    CheckFileSize(fileSize: any, maxFileSize: any) {
        if (fileSize / 1024 / 1024 > maxFileSize) {
            return true;
        } else {
            return false;
        }
    }
    //#endregion

    //#region TransactionLock
    TransactionLock(uidParam: String, param: any, menu: any, reff_detail: any, service: DALService) {
        // param tambahan untuk getrole dynamic

        let dataRoleTamp: any = [];
        let dataRoleTampsys: any = [];
        let name = this.AllModUrl('name');

        const ApiController = 'TransactionLock';
        const APIRouteForGetRole = 'ExecSpForPost';
        const ApiControllersys = 'SysMenuRole';
        const APIRouteForGetRolesys = 'ExecSpForGetRole';
        const domElement = document.querySelectorAll('[data-role]');

        dataRoleTamp = [{
            'p_user_id': uidParam,
            'p_reff_code': param,
            'p_reff_name': menu,
            'p_user_name': name,
            'p_reff_code_detail': reff_detail,
            'action': 'getResponse'
        }];
        // param tambahan untuk getrole dynamic
        service.ExecSp(dataRoleTamp, ApiController, APIRouteForGetRole)
            .subscribe(
                res => {
                    const parse = JSON.parse(res);

                    if (parse.data[0].username !== '') {
                        // hide element when not a role code match with data-role in screen
                        this.userLog = parse.data[0].username

                        for (let j = 0; j < domElement.length; j++) {
                            // tslint:disable-next-line:no-shadowed-variable
                            const elementAttr = domElement[j].getAttribute('data-role');

                            // if (this.rolecodeHeaderTemp.indexOf(elementAttr) !== -1) {
                            // element.nativeElement.querySelector('[data-role = "' + elementAttr + '"]').style.display = 'none';
                            $('[data-role = "' + elementAttr + '"]').hide();
                            // }
                        }
                    }
                    else {
                        const rolecodeHeader: any = [];
                        dataRoleTampsys = [{
                            'p_uid': uidParam,
                            'action': 'getResponse'
                        }];
                        // param tambahan untuk getrole dynamic
                        service.ExecSpSys(dataRoleTampsys, ApiControllersys, APIRouteForGetRolesys)
                            .subscribe(
                                res => {
                                    const parse = JSON.parse(res);
                                    const rolecode = parse.data;

                                    // get role code from server and push into array
                                    for (let i = 0; i < rolecode.length; i++) {
                                        rolecodeHeader.push(rolecode[i].role_code);
                                    }

                                    for (let j = 0; j < domElement.length; j++) {
                                        // tslint:disable-next-line:no-shadowed-variable
                                        const elementAttr = domElement[j].getAttribute('data-role');

                                        if (rolecodeHeader.indexOf(elementAttr) === -1) {
                                            $('[data-role = "' + elementAttr + '"]').hide();
                                        } else {
                                            $('[data-role = "' + elementAttr + '"]').show();
                                        }
                                    }
                                });


                    }
                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);
                });
    }
    //#endregion TransactionLock

}
