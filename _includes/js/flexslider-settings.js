 $(window).load(function() {
              $('.flexslider').flexslider({
                animation: "slide",
                                animationLoop: true,
                                controlNav: false,
                                directionNav: true,                             
                      start: function (slider) {
                       // lazy load
                       $(slider).find("img.lazy").slice(0,5).each(function () {
                       var src = $(this).attr("data-src");
                          $(this).attr("src", src).removeAttr("data-src").removeClass("lazy");
                       });
                     },
                    before: function (slider) {
                        // lazy load
                       var slide = $(slider).find('.slides').children().eq(slider.animatingTo+1).find('img');
                       var src = slide.attr("data-src");
                       slide.attr("src", src).removeAttr("data-src").removeClass("lazy");
                    }
                 });
                             
       
              $('.flexslider-rooms').flexslider({
                touch: true,
                slideshow: false,
                controlNav: "thumbnails",
                slideshowSpeed: 7000,
                animationSpeed: 600,
                 start: function (slider) {
                       // lazy load
                       $(slider).find("img.lazy").slice(0,5).each(function () {
                       var src = $(this).attr("data-src");
                          $(this).attr("src", src).removeAttr("data-src").removeClass("lazy");
                       });
                     },
                    before: function (slider) {
                        // lazy load
                       var slide = $(slider).find('.slides').children().eq(slider.animatingTo+1).find('img');
                       var src = slide.attr("data-src");
                       slide.attr("src", src).removeAttr("data-src").removeClass("lazy");
                    }
                 });
            });