(function ($) {
    $.widget("ui.adriana", {
        
        _post: function (code, output) {
            var content = '<div class="well"><pre class="prettyprint lang-js">{code}</pre> <i class="icon-large icon-chevron-left"></i><span class="output">{output}</span></div></div>'
                .replace('{code}', code)
                .replace('{output}', output);
            
            $('.container').append(content);
            setTimeout(prettyPrint, 100);
        },

        _loader: function (id, message, percentage) {
            if (percentage === undefined) {
                percentage = 0;
            }
            
            var content = '<div {id} class="well well-small"><div class="progress progress-striped active"><div class="bar" style="width: {percentage}%;"></div></div></div><span class="message"></span>'
                .replace('{percentage}', percentage)
                .replace('{id}', id)
                .replace('{message}', message);
            
            $('.container').append(content);
        },

        _output: function (response) {
            switch (response.type) {
            
                case 'execution':
                    this._post(response.code, response.output);
                    break;
                    
                case 'loading':
                    self._loader(response.message, response.percentage); // create loader
                    var loaderHandler = function (message, percentage) {
                        $('#' + response.id).find('.bar').css({ 'style': percentage });
                        $('#' + response.id).find('.message').text(message);
                        
                        if (percentage >= 100) {
                            amplify.unsubscribe(response.id, loaderHandler);
                        }
                    };
                    
                    amplify.subscribe(response.id, loaderHandler);
                    
                    break;
            }
        },

        _create: function () {
            var self = this;
            
            // Create all the helpers
            this.options.sandboxframe = document.createElement('iframe');
            document.body.appendChild(this.options.sandboxframe);
            $(this.options.sandboxframe).hide();
            this.options.sandboxframe.setAttribute('id', 'sandbox');
            var doc = this.options.sandboxframe.contentDocument || this.options.sandboxframe.contentWindow.document;

            doc.open();
            doc.write('<script>(function(){  })();</script>');
            doc.close();
            
            this.options.sandbox = {
                state: 'new',
                sandbox: this.options.sandboxframe,
                eval: function (code) {
                    var result;
                    try {
                        result = this.sandbox.contentWindow.eval(code);
                    } catch (e) {
                        $.pnotify({ title: 'Exception', text:e, type: 'error' });
                        result = e;
                    }
                    
                    return '' + result; // convert to string
                }
            };

            // Bind all the events
            amplify.subscribe("output", $.proxy(self._output, self));

            this.element.keyup(function (event) {
                var key = event.keyCode || event.which;

                if (key === 13) // Enter
                {
                    adriana.run( $(this).val() ); // Execute input
                    
                    $(this).val(''); // cleanup the input command
                    
                    event.preventDefault();
                }
            });
            
            // initialize the component
            amplify.publish('adriana.init', this.options.sandbox);
        }
    });
})(jQuery);