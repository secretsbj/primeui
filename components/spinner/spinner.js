/**
 * PrimeUI spinner widget
 */
 (function (factory) {
     if (typeof define === 'function' && define.amd) {
         // AMD. Register as an anonymous module.
         define(['jquery'], factory);
     } else if (typeof module === 'object' && module.exports) {
         // Node/CommonJS
         module.exports = function( root, jQuery ) {
             factory(jQuery);
             return jQuery;
         };
     } else {
         // Browser globals
         factory(jQuery);
     }
 }(function ($) {

    $.widget("primeui.puispinner", {
       
        options: {
            step: 1.0,
            min: undefined,
            max: undefined,
            prefix: null,
            suffix: null
        },
        
        _create: function() {
            var input = this.element,
            disabled = input.prop('disabled');
            
            input.puiinputtext().addClass('ui-spinner-input').wrap('<span class="ui-spinner ui-widget ui-corner-all" />');
            this.wrapper = input.parent();
            this.wrapper.append('<a class="ui-spinner-button ui-spinner-up ui-corner-tr ui-button ui-widget ui-state-default ui-button-text-only"><span class="ui-button-text"><span class="fa fa-fw fa-caret-up"></span></span></a><a class="ui-spinner-button ui-spinner-down ui-corner-br ui-button ui-widget ui-state-default ui-button-text-only"><span class="ui-button-text"><span class="fa fa-fw fa-caret-down"></span></span></a>');
            this.upButton = this.wrapper.children('a.ui-spinner-up');
            this.downButton = this.wrapper.children('a.ui-spinner-down');
            this.options.step = this.options.step||1;
            
            if(parseInt(this.options.step, 10) === 0) {
                this.options.precision = this.options.step.toString().split(/[,]|[.]/)[1].length;
            }
            
            this._initValue();
    
            if(!disabled&&!input.prop('readonly')) {
                this._bindEvents();
            }
            
            if(disabled) {
                this.wrapper.addClass('ui-state-disabled');
            }
            
            if(this.options.min !== undefined) {
                input.attr('aria-valuemin', this.options.min);
            }
            if(this.options.max !== undefined){
                input.attr('aria-valuemax', this.options.max);
            }
        },

        _destroy: function() {
            this.element.puiinputtext('destroy').removeClass('ui-spinner-input').off('keydown.puispinner keyup.puispinner blur.puispinner focus.puispinner mousewheel.puispinner');
            this.wrapper.children('.ui-spinner-button').off().remove();
            this.element.unwrap();
        },

        _bindEvents: function() {
            var $this = this;
            
            //visuals for spinner buttons
            this.wrapper.children('.ui-spinner-button')
                .mouseover(function() {
                    $(this).addClass('ui-state-hover');
                }).mouseout(function() {
                    $(this).removeClass('ui-state-hover ui-state-active');

                    if($this.timer) {
                        window.clearInterval($this.timer);
                    }
                }).mouseup(function() {
                    window.clearInterval($this.timer);
                    $(this).removeClass('ui-state-active').addClass('ui-state-hover');
                }).mousedown(function(e) {
                    var element = $(this),
                    dir = element.hasClass('ui-spinner-up') ? 1 : -1;

                    element.removeClass('ui-state-hover').addClass('ui-state-active');

                    if($this.element.is(':not(:focus)')) {
                        $this.element.focus();
                    }

                    $this._repeat(null, dir);

                    //keep focused
                    e.preventDefault();
            });

            this.element.on('keydown.puispinner', function (e) {        
                var keyCode = $.ui.keyCode;

                switch(e.which) {            
                    case keyCode.UP:
                        $this._spin($this.options.step);
                    break;

                    case keyCode.DOWN:
                        $this._spin(-1 * $this.options.step);
                    break;

                    default:
                        //do nothing
                    break;
                }
            })
            .on('keyup.puispinner', function () { 
                $this._updateValue();
            })
            .on('blur.puispinner', function () { 
                $this._format();
            })
            .on('focus.puispinner', function () {
                //remove formatting
                $this.element.val($this.value);
            });

            //mousewheel
            this.element.on('mousewheel.puispinner', function(event, delta) {
                if($this.element.is(':focus')) {
                    if(delta > 0) {
                        $this._spin($this.options.step);
                    }
                    else {
                        $this._spin(-1 * $this.options.step);
                    }
                    return false;
                }
            });
        },

        _repeat: function(interval, dir) {
            var $this = this,
            i = interval || 500;

            window.clearTimeout(this.timer);
            this.timer = window.setTimeout(function() {
                $this._repeat(40, dir);
            }, i);

            this._spin(this.options.step * dir);
        },
                
        _toFixed: function (value, precision) {
            var power = Math.pow(10, precision||0);
            return String(Math.round(value * power) / power);
        },
                
        _spin: function(step) {
            var newValue,
                currentValue = this.value ? this.value : 0;
        
            if(this.options.precision) {
                newValue = parseFloat(this._toFixed(currentValue + step, this.options.precision));
            }
            else {
                newValue = parseInt(currentValue + step, 10);
            }

            if(this.options.min !== undefined && newValue < this.options.min) {
                newValue = this.options.min;
            }

            if(this.options.max !== undefined && newValue > this.options.max) {
                newValue = this.options.max;
            }

            this.element.val(newValue).attr('aria-valuenow', newValue);
            this.value = newValue;

            this.element.trigger('change');
        },

        _updateValue: function() {
            var value = this.element.val();

            if(value === '') {
                if(this.options.min !== undefined) {
                    this.value = this.options.min;
                }
                else {
                    this.value = 0;
                }
            }
            else {
                if(this.options.step) {
                    value = parseFloat(value);
                }
                else {
                    value = parseInt(value, 10);
                }

                if(!isNaN(value)) {
                    this.value = value;
                }
            }
        },

        _initValue: function() {
            var value = this.element.val();

            if(value === '') {
                if(this.options.min !== undefined) {
                    this.value = this.options.min;
                }
                else {
                    this.value = 0;
                }
            }
            else {
                if(this.options.prefix) {
                    value = value.split(this.options.prefix)[1];
                }

                if(this.options.suffix) {
                    value = value.split(this.options.suffix)[0];
                }

                if(this.options.step) {
                    this.value = parseFloat(value);
                }
                else {
                    this.value = parseInt(value, 10);
                }
            }
        },

        _format: function() {
            var value = this.value;

            if(this.options.prefix) {
                value = this.options.prefix + value;
            }

            if(this.options.suffix) {
                value = value + this.options.suffix;
            }

            this.element.val(value);
        },

        _unbindEvents: function() {
            //visuals for spinner buttons
            this.wrapper.children('.ui-spinner-button').off();

            this.element.off();
        },

        enable: function() {
            this.wrapper.removeClass('ui-state-disabled');
            this.element.puiinputtext('enable');
            this._bindEvents();
        },

        disable: function() {
            this.wrapper.addClass('ui-state-disabled');
            this.element.puiinputtext('disable');
            this._unbindEvents();
        },

        _setOption: function(key, value) {
            if(key === 'disabled') {
                if(value)
                    this.disable();
                else
                    this.enable();
            }
            else {
                $.Widget.prototype._setOption.apply(this, arguments);
            }
        }
    });
    
}));