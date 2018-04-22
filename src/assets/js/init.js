$(document).ready(function () {
    $(".sidebar-box").click(function () {
        totalHeight = 0;
        totalHeight = $(this)[0].scrollHeight;
        $(this)
            .css({
                "max-height": totalHeight
            })
            .animate({
                "height": totalHeight
            });
        $('.readmore').fadeOut();
        return false;
    });
});