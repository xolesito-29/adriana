﻿String.prototype.toOutput = (function () {
    var sortci = function(a, b) {
        return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
    };
    
    var stringify = function(o, simple, visited) {
        var json = '',
            i, vi, type = '',
            parts = [],
            names = [],
            circular = false;
        visited = visited || [];

        try {
            type = ({ }).toString.call(o);
        } catch(e) { // only happens when typeof is protected (...randomly)
            type = '[object Object]';
        }

        // check for circular references
        for (vi = 0; vi < visited.length; vi++) {
            if (o === visited[vi]) {
                circular = true;
                break;
            }
        }

        if (circular) {
            json = '[circular]';
        } else if (type == '[object String]') {
            json = '"' + o.replace(/"/g, '\\"') + '"';
        } else if (type == '[object Array]') {
            visited.push(o);

            json = '[';
            for (i = 0; i < o.length; i++) {
                parts.push(stringify(o[i], simple, visited));
            }
            json += parts.join(', ') + ']';
            json;
        } else if (type == '[object Object]') {
            visited.push(o);

            json = '{';
            for (i in o) {
                names.push(i);
            }
            names.sort(sortci);
            for (i = 0; i < names.length; i++) {
                parts.push(stringify(names[i], undefined, visited) + ': ' + stringify(o[names[i]], simple, visited));
            }
            json += parts.join(', ') + '}';
        } else if (type == '[object Number]') {
            json = o + '';
        } else if (type == '[object Boolean]') {
            json = o ? 'true' : 'false';
        } else if (type == '[object Function]') {
            json = o.toString();
        } else if (o === null) {
            json = 'null';
        } else if (o === undefined) {
            json = 'undefined';
        } else if (simple == undefined) {
            visited.push(o);

            json = type + '{\n';
            for (i in o) {
                names.push(i);
            }
            names.sort(sortci);
            for (i = 0; i < names.length; i++) {
                try {
                    parts.push(names[i] + ': ' + stringify(o[names[i]], true, visited)); // safety from max stack
                } catch(e) {
                    if (e.name == 'NS_ERROR_NOT_IMPLEMENTED') {
                        // do nothing - not sure it's useful to show this error when the variable is protected
                        // parts.push(names[i] + ': NS_ERROR_NOT_IMPLEMENTED');
                    }
                }
            }
            json += parts.join(',\n') + '\n}';
        } else {
            try {
                json = o + ''; // should look like an object      
            } catch(e) {
            }
        }
        return json;
    };

    return function () {
        return stringify(this);
    };

})();


