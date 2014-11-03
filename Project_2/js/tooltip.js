(function ( $ ) {

  $.fn.tooltip = function(options) {
    var defaults= {
      text:this.data().text,
      css:{
        "position":"absolute",
        "color": "black",
        "background": "#fff",
        "border-color":'#000',
        "border-width":'1px',
        "border-style":'solid',
        "padding": "10px",
        "z-index":"100"
      }
    };
    var settings = $.extend(true, {}, defaults, options);
    var id = 'tooltip-'+Math.floor(100 * (Math.random() % 1));
    var tip = $('<span id="'+id+'">'+settings.text+'</span>');
    $(tip).css(settings.css)
    this.mouseenter(function(){
      $(this).append(tip)
    });
    this.mousemove(function(event){

      tip.offset({
        top:event.pageY-$(tip).outerHeight(),
        left:event.pageX
      })
    })
    this.mouseleave(function(){
      $(tip).remove();
    });
      return this;
  };
}( jQuery ));
