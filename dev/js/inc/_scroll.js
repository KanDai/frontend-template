/**
 * 指定したIDの位置までスムーススクロールで移動
 * 実行中にbody全体を透過させ、実行完了時に戻す
 */
var smoothScroll = {
    speed  : 500,
    easing : "swing",
    $body  : $('html, body'),
    start　: function(obj){
        // スクロール位置の取得
        var href   = obj.attr("href");
        var target = $(href == "#" || href === "" ? 'html' : href);
        var pos    = target.offset().top;

        // 実行時にBody全体を透過
        this.$body.css('opacity', 0.2);

        // アニメーション処理 callbackで透過解除
        this.$body.animate({
            scrollTop: pos
        }, this.speed, this.easing , function(){
            smoothScroll.$body.animate({
                opacity: 1
            }, 300);
        });
    }
};
$(document).on('click', 'a[href^=#]', function(ev){
    ev.preventDefault();
    smoothScroll.start($(this));
});
