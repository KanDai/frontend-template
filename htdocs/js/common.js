jQuery(function($){

//ヘッダーのメニュー
var $gnav_menu	 = $('#gnav > li'),
		$header_menu = $('#header-menu > a');

$gnav_menu.on('mouseenter', function(){
	$(this).find('a , span').next('ul').css('display', 'block').stop().animate({
		opacity : 1,
		top : '40px'
	} , 200);
});

$gnav_menu.on('mouseleave', function(){
	$(this).find('ul').css({
		display : 'none',
		opacity : 0,
		top : '60px'
	});
});

$header_menu.on('click', function(){
	$(this).next('ul').slideToggle(300);
});

//スクロールでヘッダー固定
var
$main = $('#main'),
$header = $('#header'),
gnav_fixed = false;

$(window).scroll(function() {
var
$this = $(this),
st = $this.scrollTop();

	if(st > 85 && gnav_fixed == false){
		$header.css({
			position: 'fixed',
			top : '-85px'
		});
		$main.css({
			marginTop : '143px'
		});
		gnav_fixed = true;
	} else if (st < 85 && gnav_fixed == true){
		$header.css({
			position: 'relative',
			top : '0'
		});
		$main.css({
			marginTop : '0'
		});
		gnav_fixed = false;
	}
});

// スムーススクロール

$(document).on('click', 'a[href^=#]', function(){
	var speed = 500;
	var plus_pos = 50;
	var href= $(this).attr("href");
	if(href== "#"){ plus_pos == 0 };
	var target = $(href == "#" || href == "" ? 'html' : href);
	var position = target.offset().top - plus_pos;
	$("html, body").animate({scrollTop:position}, speed, "swing");
	return false;
});

//スクロールでヘッダー固定
var $pagetop		 = $('#pagetop'),
		pagetop_hide = true;

$(window).scroll(function() {
var $this = $(this),
	st = $this.scrollTop();

	if(st > 400 && pagetop_hide == true){
		$pagetop.fadeIn();
		pagetop_hide = false;
	} else if (st < 400 && pagetop_hide == false){
		$pagetop.fadeOut();
		pagetop_hide = true;
	}
});


})