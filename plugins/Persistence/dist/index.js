'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var PluginID = Symbol('LocalPersistence');
var emptyInstance = {};
// tslint:disable-next-line: function-name
function Persistence(localStorageKey) {
    return function () {
        return {
            id: PluginID,
            instanceFactory: function (initial) {
                return {
                    onInit: function () {
                        var persisted = localStorage.getItem(localStorageKey);
                        if (persisted !== null) {
                            var result = JSON.parse(persisted);
                            return result;
                        }
                        localStorage.setItem(localStorageKey, JSON.stringify(initial));
                        return initial;
                    },
                    onSet: function (p, v) {
                        localStorage.setItem(localStorageKey, JSON.stringify(v));
                    },
                    extensions: [],
                    extensionsFactory: function (l) { return emptyInstance; }
                };
            }
        };
    };
}

exports.Persistence = Persistence;
//# sourceMappingURL=index.js.map