$(function () {
    $('.ham-btn,.sp-menu a').on('click', function () {
        $('.ham-btn,.sp-menu').toggleClass('is-active');
    });
});

$(document).ready(function() {
    $('#close-btn').click(function() {
        $('.banner_box,.banner_box2,.btn').fadeOut();
    });
});
