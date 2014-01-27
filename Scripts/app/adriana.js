
window.adriana = (function () {
    var self = this;
    self.active = false;

    amplify.subscribe('adriana.init', function (sandbox) {
        self.active = sandbox !== undefined && sandbox !== null;
        self.sandbox = sandbox;
    });

    var _isInternal = function (code) {
        return /^\/\/\/\s+<\w+/im.test(code);
    };

    var _run = function (code) {
        if (!self.active) return;
        
        // TODO: Add command into history

        var result = { type: 'error' };
        
        if (_isInternal(code)) {
            result = { type: 'execution' }; // TODO: Implement response
        } else {
            var outputResult = self.sandbox.eval(code);
            result = { type: 'execution', code: code, output: outputResult.toOutput() };
        }

        amplify.publish('output', result); // notify subscribers
    };

    return {
        run: _run
    };
    
})();
