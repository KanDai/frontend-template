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
})
