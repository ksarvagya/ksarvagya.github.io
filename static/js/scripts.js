'use strict';

/* global $ */

let App = {
    components: {},
    utils: {
        getArgs: function($el) {
            try {
                return eval("(" + $el.attr("data-component-options") + ")") || {};
            } catch (ex) {
                return {};
            }
        }
    }
};

let bindComponents = function() {
    $("[data-component]").each(function() {
        let $el = $(this);
        let names = $el.attr('data-component').split(',');
        names.forEach((name) => {
            if (!(name in App.components)) {
                console.error(`Component "${name}" is not defined`);
                return false;
            } else {
                let existing = $el.data('data-loaded-components');
                if (!existing) {
                    existing = [];
                    $el.data('data-loaded-components', existing);
                }
                if (!(name in $el.data('data-loaded-components'))) {
                    let options = App.utils.getArgs($el);
                    let Constructor = App.components[name];
                    let obj = new Constructor($el, options);
                    existing.push(name);
                    $el.data('data-component', obj);
                    console.log(`Component "${name}" loaded.`);
                } else {
                    console.log(`Component "${name}" already loaded`);
                }
            }
        });
    });
};


// Body
App.components.body = function($element, options) {
    var api = {};

    // $(window).on('load', function(){
    //     $element.addClass('loaded');
    // });

    // // We fade the container out when navigation away from the page. We need to
    // // allow for mailto and rel links though so we hack around those
    // var unloadCallback = function(event) {
    //     $element.addClass('unloading');
    // }
    // $('a[href^="mailto:"],a[href^="tel:"]').hover(
    //     function(event){
    //         $(window).off('beforeunload');
    //     },
    //     function(event) {
    //         $(window).on('beforeunload', unloadCallback);
    //     });
    // $(window).on('beforeunload', unloadCallback);

    return api;
}


// Sidebar
App.components.sidebar = function($el, options) {
    let dropdown = $el.find('[data-project-sidebar-dropdown]');
    let toggle = $el.find('[data-project-sidebar-toggle]');

    $(window).on('resize load', function() {
        let width = $(window).width();
        if (width < 1000) { // -md
            dropdown.slideUp();
        } else {
            dropdown.slideDown();
        }
    });

    toggle.on('click', function() {
        if (dropdown.is(":visible")) {
            dropdown.slideUp();
        } else {
            dropdown.slideDown();
        }
    })
}


// Skills list
App.components.skillsList = function($el, options) {
    let settings = $.extend({}, {}, options);
    let extra = $el.find('[data-skills-list-extra]');
    let toggle = $el.find('[data-skills-list-toggle]');

    toggle.find('.close').hide();
    extra.hide();

    toggle.on('click', function() {
        extra.slideDown();
        toggle.hide();
        return false;
    })
}


// Filter menu
App.components.filters = function($el, options) {
    let settings = $.extend({}, {
        parentSelector: '[data-filter-parent]',
        triggerSelector: '[data-filter-trigger]',
        parentActiveClass: 'filters--open',
    }, options);

    let api = {};

    let $triggers = $el.find(settings.triggerSelector);

    $triggers.click(function(e) {
        e.preventDefault();
        $el.toggleClass(settings.parentActiveClass);
        return false;
    });

    return api;
};

// Images
App.components.image = function($el, options) {
    let settings = $.extend({}, {
        fullscreenActiveClass: 'image--show-fullscreen'
    }, options);
    let api = {};

    let $fullscreen = $el.find('[data-image-fullscreen]');
    let $closeFullscreen = $el.find('[data-image-close-fullscreen]');

    if ($fullscreen.length > 0) {
        $el.on('click', function() {
            $el.addClass(settings.fullscreenActiveClass);
            return false;
        });

        $closeFullscreen.on('click', function() {
            $el.removeClass(settings.fullscreenActiveClass);
            return false;
        });

        $(document).keyup(function(e) {
            if (e.keyCode === 27) {
                $el.removeClass(settings.fullscreenActiveClass);
                return false;
            }
        });
    }

    return api;
};

// Header
App.components.header = function($el, options) {
    var settings = $.extend({}, {
        overlayActiveClass: 'header-wrapper--show-overlay',
    }, options);
    var api = {};

    var $hamburger = $el.find('[data-header-hamburger]');
    var $overlay = $el.find('[data-header-overlay]');
    var $overlayClose = $el.find('[data-header-overlay-close]');

    // Overlay

    $hamburger.on('click', function() {
        $el.addClass(settings.overlayActiveClass);
        return false;
    });

    $overlayClose.on('click', function() {
        $el.removeClass(settings.overlayActiveClass);
        return false;
    });

    $(document).keyup(function(e) {
        if (e.keyCode === 27) {
            $el.removeClass(settings.overlayActiveClass);
            return false;
        }
    });

    return api;
};


// Smooth scroll
// 
// Works for both elements that have a href with a hash value or non-anchor
// elements with a 'data-scroll-target=#target' attribute
App.components.smoothScroll = function($el, options) {
    let settings = $.extend({}, {
        speed: 500,
        easing: 'swing',
        scrollOffset: 15
    }, options);
    let api = {};

    $el.on('click', function(e) {
        e.preventDefault();

        let hash;
        let attr = $el.attr('href');

        if (typeof attr !== typeof undefined && attr !== false) {
            hash = this.hash;
        } else {
            hash = $el.attr('data-scroll-target');
        }

        if (hash) {
            let $target = $(hash);
            $('html, body').stop().animate({
                'scrollTop': $target.offset().top - settings.scrollOffset
            }, settings.speed, settings.easing, function() {
                history.replaceState(null, null, hash);
            });
        } else {
            console.log("Couldn't find target for smooth scroll:", $el);
        }
    });

    return api;
};


// Accordian
App.components.accordian = function($el, options) {
    let settings = $.extend({}, {
        activeClass: 'accordian__page--active',
        pageSelector: '[data-accordian-page]',
        triggerSelector: '[data-accordian-trigger]',
        contentSelector: '[data-accordian-content]'
    }, options);
    let api = {};

    let $pages = $el.find(settings.pageSelector);
    let $triggers = $el.find(settings.triggerSelector);

    $triggers.on('click', function() {
        let $page = $(this).parent(settings.pageSelector);
        if ($page.hasClass(settings.activeClass)) {
            $page.removeClass(settings.activeClass);
            $el.trigger('closedPage', [$page]);
        } else {
            $page.addClass(settings.activeClass);
            $el.trigger('openedPage', [$page]);
        }
        return false;
    });

    return api;
};

// Hero
App.components.hero = function($el, options) {
    var settings = $.extend({}, {}, options);
    var api = {};

    var resizeCallback = function() {
        $('.hero').css('height', $(window).height());
    }

    $(window).on('resize load', resizeCallback);
    $(window).resize();

    setTimeout(function() {
        $el.find('.all').addClass('strike');
        $el.find('.some').fadeIn(200);

        setTimeout(function() {
            $el.find('.some').addClass('strike');
            $el.find('.one').fadeIn(200);

            setTimeout(function() {
                $el.find('.one').addClass('strike');
                $el.find('.none').addClass('strike');
                $el.find('.ok').show();
            }, 3000);
        }, 3000);
    }, 3000);

    return api;
};

// Error page
App.components.errorPage = function($el, options) {
    var settings = $.extend({}, {}, options);
    var api = {};

    var resizeCallback = function() {
        $('.errorPage').css('height', $(window).height());
    }

    $(window).on('resize load', resizeCallback);
    $(window).resize();

    return api;
};

// Swiper
App.components.swiper = function($el, options) {
    let settings = $.extend({}, {}, options);
    let api = {};
    let activeClass = 'swiper-thumbnail--active';

    let $swiper = $el.find('[data-swiper]');
    let $thumbnails = $el.find('[data-thumbnail]');

    api.swiper = new Swiper($swiper[0], {
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
    });

    if ($thumbnails.length > 0) {
        $thumbnails.removeClass(activeClass);
        $thumbnails.first().addClass(activeClass);

        $thumbnails.on('click', function() {
            $thumbnails.removeClass(activeClass);
            $(this).addClass(activeClass);
            api.swiper.slideTo($(this).index());
            return false;
        });
    }

    return api;
};

// Comments
App.components.comments = function($el, options) {
    $el.on('click', function() {
        var disqus_shortname = 'ksarvagya';
        $.ajax({
            type: "GET",
            url: "https://" + disqus_shortname + ".disqus.com/embed.js",
            dataType: "script",
            cache: true
        });
        $el.fadeOut();
        return false;
    });
};


// Elevator
App.components.elevator = function($element, options) {
    var self = this;
    var api = {};
    var defaults = {
        offset: 50
    };
    var settings = $.extend({}, defaults, options);

    var isVisible = false,
        visibleClass = 'elevator--visible';

    var checkVisible = function() {
        var top = $(window).scrollTop();
        if (top > settings.offset && !isVisible) {
            $element.addClass(visibleClass);
            isVisible = true;
        } else if (top < settings.offset && isVisible) {
            $element.removeClass(visibleClass);
            isVisible = false;
        }
    };

    $(window).on('scroll load', checkVisible);

    $element.on('click', function() {
        $('html, body').animate({ scrollTop: 0 }, 600);
        return false;
    });

    return api;
};

// Masonry
App.components.masonry = function($element, options) {
    let $grid = $element.masonry({
        itemSelector: '.masonry__item',
        percentPosition: true,
        columnWidth: '.masonry__sizer',
        gutter: '.masonry__gutter'
    });
    $grid.imagesLoaded().progress(function() {
        $grid.masonry();
    });
};

(function() {
    bindComponents();
})();