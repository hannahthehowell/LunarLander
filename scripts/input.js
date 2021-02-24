let input = (function () {
    function Keyboard() {
        let that = {
            keys: {},
            handlers: {}
        };

        that.registerCommand = function(key, handler) {
            that.handlers[key] = handler;
        };

        function keyPress(e) {
            that.keys[e.key] = e.timeStamp;
        }
        function keyRelease(e) {
            delete that.keys[e.key];
        }

        window.addEventListener('keydown', keyPress);
        window.addEventListener('keyup', keyRelease);
        return that;
    }

    return {
        Keyboard : Keyboard
    };

}());