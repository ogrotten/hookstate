var ValidationSeverity;
(function (ValidationSeverity) {
    ValidationSeverity[ValidationSeverity["WARNING"] = 1] = "WARNING";
    ValidationSeverity[ValidationSeverity["ERROR"] = 2] = "ERROR";
})(ValidationSeverity || (ValidationSeverity = {}));
var PluginID = Symbol('Validate');
var emptyErrors = [];
var ValidationPluginInstance = /** @class */ (function () {
    function ValidationPluginInstance(attachRule, message, severity) {
        this.attachRule = attachRule;
        this.message = message;
        this.severity = severity;
        this.storeRules = {};
    }
    ValidationPluginInstance.prototype.getRulesAndNested = function (path) {
        var result = this.storeRules;
        path.forEach(function (p) {
            if (typeof p === 'number') {
                p = '*'; // limitation: support only validation for each element of array
            }
            result = result && (result[p]);
        });
        return [result && result[PluginID] ? Array.from(result[PluginID].values()) : [],
            result ? Object.keys(result) : []];
    };
    ValidationPluginInstance.prototype.addRule = function (path, r) {
        var result = this.storeRules;
        path.forEach(function (p, i) {
            if (typeof p === 'number') {
                p = '*'; // limitation: support only validation for each element of array
            }
            result[p] = result[p] || {};
            result = result[p];
        });
        var existingRules = result[PluginID];
        var newRuleFunction = r.rule.toString();
        if (existingRules) {
            if (existingRules.has(newRuleFunction)) {
                return;
            }
            existingRules.set(newRuleFunction, r);
            return;
        }
        var newMap = new Map();
        newMap.set(newRuleFunction, r);
        result[PluginID] = newMap;
    };
    ValidationPluginInstance.prototype.getErrors = function (l, depth, filter, first) {
        var result = [];
        var consistentResult = function () { return result.length === 0 ? emptyErrors : result; };
        if (depth === 0) {
            return consistentResult();
        }
        var _a = this.getRulesAndNested(l.path), existingRules = _a[0], nestedRulesKeys = _a[1];
        for (var i = 0; i < existingRules.length; i += 1) {
            var r = existingRules[i];
            if (!r.rule(l.value)) {
                var err = {
                    path: l.path,
                    message: typeof r.message === 'function' ? r.message(l.value) : r.message,
                    severity: r.severity
                };
                if (!filter || filter(err)) {
                    result.push(err);
                    if (first) {
                        return result;
                    }
                }
            }
        }
        if (depth === 1) {
            return consistentResult();
        }
        if (nestedRulesKeys.length === 0) {
            // console.log('getResults nested rules 0 length', result)
            return consistentResult();
        }
        var nestedInst = l.nested;
        if (nestedInst === undefined) {
            // console.log('getResults no nested inst', result)
            return consistentResult();
        }
        if (Array.isArray(nestedInst)) {
            if (nestedRulesKeys.includes('*')) {
                for (var i = 0; i < nestedInst.length; i += 1) {
                    var n = nestedInst[i];
                    result = result.concat(Validation(n)
                        .errors(filter, depth - 1, first));
                    if (first && result.length > 0) {
                        return result;
                    }
                }
            }
            // validation for individual array elements is not supported, it is covered by foreach above
            // for (let i = 0; i < nestedRulesKeys.length; i += 1) {
            //     const k = nestedRulesKeys[i];
            //     // Validation rule exists,
            //     // but the corresponding nested link may not be created,
            //     // (because it may not be inferred automatically)
            //     // because the original array value cas miss the corresponding index
            //     // The design choice is to skip validation in this case.
            //     // A client can define per array level validation rule,
            //     // where existance of the index can be cheched.
            //     if (nestedInst[k] !== undefined) {
            //         result = result.concat((nestedInst[k] as StateLink<StateValueAtPath, ValidationExtensions>)
            //             .extended.errors(filter, depth - 1, first));
            //         if (first && result.length > 0) {
            //             return result;
            //         }
            //     }
            // }
        }
        else {
            for (var i = 0; i < nestedRulesKeys.length; i += 1) {
                var k = nestedRulesKeys[i];
                // Validation rule exists,
                // but the corresponding nested link may not be created,
                // (because it may not be inferred automatically)
                // because the original array value cas miss the corresponding index
                // The design choice is to skip validation in this case.
                // A client can define per array level validation rule,
                // where existance of the index can be cheched.
                if (nestedInst[k] !== undefined) {
                    result = result.concat(Validation(nestedInst[k])
                        .errors(filter, depth - 1, first));
                    if (first && result.length > 0) {
                        return result;
                    }
                }
            }
        }
        return consistentResult();
    };
    Object.defineProperty(ValidationPluginInstance.prototype, "config", {
        get: function () {
            if (this.attachRule !== undefined && this.message !== undefined) {
                return {
                    rule: this.attachRule,
                    message: this.message,
                    severity: this.severity || ValidationSeverity.ERROR
                };
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    ValidationPluginInstance.prototype.onAttach = function (path, withArgument) {
        var config = withArgument.config;
        if (config) {
            this.addRule(path, config);
        }
    };
    return ValidationPluginInstance;
}());
function Validation(attachRuleOrSelf, message, severity) {
    if (attachRuleOrSelf && typeof attachRuleOrSelf !== 'function') {
        var self_1 = attachRuleOrSelf;
        var _a = self_1.with(PluginID), l_1 = _a[0], instance = _a[1];
        var inst_1 = instance;
        return {
            validShallow: function () {
                return inst_1.getErrors(l_1, 1, undefined, true).length === 0;
            },
            valid: function () {
                return inst_1.getErrors(l_1, Number.MAX_SAFE_INTEGER, undefined, true).length === 0;
            },
            invalidShallow: function () {
                return inst_1.getErrors(l_1, 1, undefined, true).length !== 0;
            },
            invalid: function () {
                return inst_1.getErrors(l_1, Number.MAX_SAFE_INTEGER, undefined, true).length !== 0;
            },
            errors: function (filter, depth, first) {
                return inst_1.getErrors(l_1, depth === undefined ? Number.MAX_SAFE_INTEGER : depth, filter, first);
            },
            firstError: function (filter, depth) {
                var r = inst_1.getErrors(l_1, depth === undefined ? Number.MAX_SAFE_INTEGER : depth, filter, true);
                if (r.length === 0) {
                    return {};
                }
                return r[0];
            },
        };
    }
    return function () {
        return {
            id: PluginID,
            instanceFactory: function () { return new ValidationPluginInstance(attachRuleOrSelf, message, severity); }
        };
    };
}

export { Validation, ValidationSeverity };
//# sourceMappingURL=index.es.js.map
