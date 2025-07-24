function hideAllButtonAndLock(username) {

    var elemBtn = document.getElementsByTagName('button');
    var elemBtnBack = document.getElementById('btnBack');

    for (let p = 0; p < elemBtn.length; p++) {
        elemBtn[p].style.display = 'none';
    }
    
    elemBtnBack.style.display = 'block';

    var img = document.createElement("img");
    img.src = "./assets/img/page_lock.png";
    img.width = "25";
    img.height = "25";
    var src = document.getElementById("locking");
    src.style.position = 'Absolute'
    src.style.right = '3em'
    src.style.top = '6em'
    src.title = username
    src.appendChild(img);

}

function hideButtonLink(idButton) {


    var countDownDate = new Date().setSeconds(new Date().getSeconds() + 10);
    document.getElementById(idButton).style.visibility = "visible";

    var x = setInterval(function () {
        // Get today's date and time
        var now = new Date().getTime();

         // Find the distance between now and the count down date
         var distance = countDownDate - now;

        //  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

         if (distance < 0) {
            clearInterval(x);
            // document.getElementById("demo").innerHTML = "Click DOWNLOAD button";
            document.getElementById(idButton).style.visibility = "hidden";
          }

    }, 1000);

}

function hideTabWizard () {
    document.getElementById('hiddenTabWiz').remove();
}

function headerPage(controller, route) {
    return controller;
}

function reloadHeader() {


    // console.log(window.parent.document.getElementById('headerId').value);
    // console.log($('#headerId',parent.document).val());
    // $('#codeRefer').empty().load(window.location.href + '#codeRefer');

    // window.parent.document.getElementById('headerId').load(window.parent.location.href + '#headerId');
    // var x = window.parent.document.getElementById('headerId').innerHTML;

    // window.parent.document.getElementById('headerId').innerHTML = x;
    // window.parent.document.getElementById('headerId').submit();
    // window.parent.tesaka();
    // window.parent.location.reload(); 
//    parent.document.getElementById("headerId").reload();
    // top.frames.location.reload(false);

    // window.opener.location.reload(false);

    // load('branchdetail.component.html');

    // window.parent.document.getElementById('headerId').contentWindow.tesaka();

//    window.parent.document.tesaka();
    // $(".card-body").load(window.location.href + " .card-body" );
    // var elemBtnBack = document.getElementById('btnBack');
    // alert(elemBtnBack);
    // elemBtnBack.style.display = 'none';
    // $('.card-body').load(document.URL +  ' .card-body');
}


function jsFormatCurrency(ctrl) {
    // $get(ctrl).value = jsToCurrencywocent($get(ctrl).value);
}


function jsToCurrencywocent(num) {
    num = num.toString().replace(/\$|\,/g, '');
    if (isNaN(num))
        num = "0";

    sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000001);

    cents = num.toString().substr(-2, 2);
        
    num = Math.floor(num / 100).toString();

    if (cents.length < 2)
        cents = "0" + cents;

    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
        num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));

    return (((sign) ? '' : '-') + num);
}



// Number.prototype.format = function(n, x) {
//     var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
//     return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '1,');
// };