$(function() {

// メニューを開くボタンの動作
  var text = $('.open-text');
  $('#open').click(function() {
    $('#leftcolumn-wrap').toggleClass('open');
    $('#side-bg').fadeToggle();
    $('#open').toggleClass('buttonclose');
    $('#open-icon').toggleClass('close');
    if ($('#open-icon').hasClass('close')) {
      text.text('Close');
    }
    else {
      text.text('Menu');
    }
    return false;
  });

// 小画面時に範囲外を押した場合、一度閉じる
  $('#side-bg').click(function() {
    $(this).fadeOut();
    $('#leftcolumn-wrap').removeClass('open');
    $('#open').removeClass('buttonclose');
    $('#open-icon').removeClass('close');
    $('.open-text').text('Menu');
  });

// 小画面時にメニュー内リンクを押した場合、一度閉じる
// ページ内リンク用
  $('#leftcolumn-wrap a').on('click', function() {
    if (window.innerWidth <= 600) {
      $('#open').click();
    }
  });

// 画像リンクには装飾しない
  $('img').parent('a').addClass('bg-none');
});
