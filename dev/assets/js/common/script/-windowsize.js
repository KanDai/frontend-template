/**
 * ウィンドウサイズを取得
 */
var winSize = {
    w : '',
    h : '',
    get : function(){
        this.w = window.innerWidth;
        this.h = window.innerHeight;
    },
    isLg : function(){
        return (this.w >= 768 ) ? true : false;
    },
    isSm : function(){
        return (this.w <= 767 ) ? true : false;
    }
};
