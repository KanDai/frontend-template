//スクロールでヘッダー固定
$(function() {
    var $pagetop = $('#pagetop'),
        pagetop_hide = true;

    $(window).scroll(function() {
        var $this = $(this),
            st = $this.scrollTop();

        if (st > 400 && pagetop_hide == true) {
            $pagetop.fadeIn();
            pagetop_hide = false;
        } else if (st < 400 && pagetop_hide == false) {
            $pagetop.fadeOut();
            pagetop_hide = true;
        }
    });
});
/*! スムーススクロール */
$(function() {
    $(document).on('click', 'a[href^=#]', function() {
        var speed = 500;
        var href = $(this).attr("href");
        var target = $(href == "#" || href == "" ? 'html' : href);
        var position = target.offset().top;
        $("html, body").animate({
            scrollTop: position
        }, speed, "swing");
        return false;
    });
});
