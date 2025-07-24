// $(window).on('load', function() {
//     console.log('All assets are loaded')
// })

// window.addEventListener('load', function(){
//     console.log('location changed!');
// })

$(window).bind('hashchange', function() {
    //code
    console.log('location changed!');
});