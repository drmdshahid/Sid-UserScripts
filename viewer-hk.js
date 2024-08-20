(function compatibilityWrapper() {
    "use strict";
    if (typeof PDFJS === "undefined") {
        (typeof window !== "undefined" ? window : this).PDFJS = {}
    }
    (function checkTypedArrayCompatibility() {
        if (typeof Uint8Array !== "undefined") {
            if (typeof Uint8Array.prototype.subarray === "undefined") {
                Uint8Array.prototype.subarray = function subarray(start, end) {
                    return new Uint8Array(this.slice(start, end))
                }
                ;
                Float32Array.prototype.subarray = function subarray(start, end) {
                    return new Float32Array(this.slice(start, end))
                }
            }
            if (typeof Float64Array === "undefined") {
                window.Float64Array = Float32Array
            }
            return
        }
        function subarray(start, end) {
            return new TypedArray(this.slice(start, end))
        }
        function setArrayOffset(array, offset) {
            if (arguments.length < 2) {
                offset = 0
            }
            for (var i = 0, n = array.length; i < n; ++i,
            ++offset) {
                this[offset] = array[i] & 255
            }
        }
        function TypedArray(arg1) {
            var result, i, n;
            if (typeof arg1 === "number") {
                result = [];
                for (i = 0; i < arg1; ++i) {
                    result[i] = 0
                }
            } else if ("slice"in arg1) {
                result = arg1.slice(0)
            } else {
                result = [];
                for (i = 0,
                n = arg1.length; i < n; ++i) {
                    result[i] = arg1[i]
                }
            }
            result.subarray = subarray;
            result.buffer = result;
            result.byteLength = result.length;
            result.set = setArrayOffset;
            if (typeof arg1 === "object" && arg1.buffer) {
                result.buffer = arg1.buffer
            }
            return result
        }
        window.Uint8Array = TypedArray;
        window.Int8Array = TypedArray;
        window.Uint32Array = TypedArray;
        window.Int32Array = TypedArray;
        window.Uint16Array = TypedArray;
        window.Float32Array = TypedArray;
        window.Float64Array = TypedArray
    }
    )();
    (function normalizeURLObject() {
        if (!window.URL) {
            window.URL = window.webkitURL
        }
    }
    )();
    (function checkObjectDefinePropertyCompatibility() {
        if (typeof Object.defineProperty !== "undefined") {
            var definePropertyPossible = true;
            try {
                Object.defineProperty(new Image, "id", {
                    value: "test"
                });
                var Test = function Test() {};
                Test.prototype = {
                    get id() {}
                };
                Object.defineProperty(new Test, "id", {
                    value: "",
                    configurable: true,
                    enumerable: true,
                    writable: false
                })
            } catch (e) {
                definePropertyPossible = false
            }
            if (definePropertyPossible) {
                return
            }
        }
        Object.defineProperty = function objectDefineProperty(obj, name, def) {
            delete obj[name];
            if ("get"in def) {
                obj.__defineGetter__(name, def["get"])
            }
            if ("set"in def) {
                obj.__defineSetter__(name, def["set"])
            }
            if ("value"in def) {
                obj.__defineSetter__(name, function objectDefinePropertySetter(value) {
                    this.__defineGetter__(name, function objectDefinePropertyGetter() {
                        return value
                    });
                    return value
                });
                obj[name] = def.value
            }
        }
    }
    )();
    (function checkXMLHttpRequestResponseCompatibility() {
        var xhrPrototype = XMLHttpRequest.prototype;
        var xhr = new XMLHttpRequest;
        if (!("overrideMimeType"in xhr)) {
            Object.defineProperty(xhrPrototype, "overrideMimeType", {
                value: function xmlHttpRequestOverrideMimeType(mimeType) {}
            })
        }
        if ("responseType"in xhr) {
            return
        }
        PDFJS.disableWorker = true;
        Object.defineProperty(xhrPrototype, "responseType", {
            get: function xmlHttpRequestGetResponseType() {
                return this._responseType || "text"
            },
            set: function xmlHttpRequestSetResponseType(value) {
                if (value === "text" || value === "arraybuffer") {
                    this._responseType = value;
                    if (value === "arraybuffer" && typeof this.overrideMimeType === "function") {
                        this.overrideMimeType("text/plain; charset=x-user-defined")
                    }
                }
            }
        });
        if (typeof VBArray !== "undefined") {
            Object.defineProperty(xhrPrototype, "response", {
                get: function xmlHttpRequestResponseGet() {
                    if (this.responseType === "arraybuffer") {
                        return new Uint8Array(new VBArray(this.responseBody).toArray())
                    } else {
                        return this.responseText
                    }
                }
            });
            return
        }
        Object.defineProperty(xhrPrototype, "response", {
            get: function xmlHttpRequestResponseGet() {
                if (this.responseType !== "arraybuffer") {
                    return this.responseText
                }
                var text = this.responseText;
                var i, n = text.length;
                var result = new Uint8Array(n);
                for (i = 0; i < n; ++i) {
                    result[i] = text.charCodeAt(i) & 255
                }
                return result.buffer
            }
        })
    }
    )();
    (function checkWindowBtoaCompatibility() {
        if ("btoa"in window) {
            return
        }
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        window.btoa = function windowBtoa(chars) {
            var buffer = "";
            var i, n;
            for (i = 0,
            n = chars.length; i < n; i += 3) {
                var b1 = chars.charCodeAt(i) & 255;
                var b2 = chars.charCodeAt(i + 1) & 255;
                var b3 = chars.charCodeAt(i + 2) & 255;
                var d1 = b1 >> 2
                  , d2 = (b1 & 3) << 4 | b2 >> 4;
                var d3 = i + 1 < n ? (b2 & 15) << 2 | b3 >> 6 : 64;
                var d4 = i + 2 < n ? b3 & 63 : 64;
                buffer += digits.charAt(d1) + digits.charAt(d2) + digits.charAt(d3) + digits.charAt(d4)
            }
            return buffer
        }
    }
    )();
    (function checkWindowAtobCompatibility() {
        if ("atob"in window) {
            return
        }
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        window.atob = function(input) {
            input = input.replace(/=+$/, "");
            if (input.length % 4 === 1) {
                throw new Error("bad atob input")
            }
            for (var bc = 0, bs, buffer, idx = 0, output = ""; buffer = input.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
            bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
                buffer = digits.indexOf(buffer)
            }
            return output
        }
    }
    )();
    (function checkFunctionPrototypeBindCompatibility() {
        if (typeof Function.prototype.bind !== "undefined") {
            return
        }
        Function.prototype.bind = function functionPrototypeBind(obj) {
            var fn = this
              , headArgs = Array.prototype.slice.call(arguments, 1);
            var bound = function functionPrototypeBindBound() {
                var args = headArgs.concat(Array.prototype.slice.call(arguments));
                return fn.apply(obj, args)
            };
            return bound
        }
    }
    )();
    (function checkDatasetProperty() {
        var div = document.createElement("div");
        if ("dataset"in div) {
            return
        }
        Object.defineProperty(HTMLElement.prototype, "dataset", {
            get: function() {
                if (this._dataset) {
                    return this._dataset
                }
                var dataset = {};
                for (var j = 0, jj = this.attributes.length; j < jj; j++) {
                    var attribute = this.attributes[j];
                    if (attribute.name.substring(0, 5) !== "data-") {
                        continue
                    }
                    var key = attribute.name.substring(5).replace(/\-([a-z])/g, function(all, ch) {
                        return ch.toUpperCase()
                    });
                    dataset[key] = attribute.value
                }
                Object.defineProperty(this, "_dataset", {
                    value: dataset,
                    writable: false,
                    enumerable: false
                });
                return dataset
            },
            enumerable: true
        })
    }
    )();
    (function checkClassListProperty() {
        var div = document.createElement("div");
        if ("classList"in div) {
            return
        }
        function changeList(element, itemName, add, remove) {
            var s = element.className || "";
            var list = s.split(/\s+/g);
            if (list[0] === "") {
                list.shift()
            }
            var index = list.indexOf(itemName);
            if (index < 0 && add) {
                list.push(itemName)
            }
            if (index >= 0 && remove) {
                list.splice(index, 1)
            }
            element.className = list.join(" ");
            return index >= 0
        }
        var classListPrototype = {
            add: function(name) {
                changeList(this.element, name, true, false)
            },
            contains: function(name) {
                return changeList(this.element, name, false, false)
            },
            remove: function(name) {
                changeList(this.element, name, false, true)
            },
            toggle: function(name) {
                changeList(this.element, name, true, true)
            }
        };
        Object.defineProperty(HTMLElement.prototype, "classList", {
            get: function() {
                if (this._classList) {
                    return this._classList
                }
                var classList = Object.create(classListPrototype, {
                    element: {
                        value: this,
                        writable: false,
                        enumerable: true
                    }
                });
                Object.defineProperty(this, "_classList", {
                    value: classList,
                    writable: false,
                    enumerable: false
                });
                return classList
            },
            enumerable: true
        })
    }
    )();
    (function checkConsoleCompatibility() {
        if (!("console"in window)) {
            window.console = {
                log: function() {},
                error: function() {},
                warn: function() {}
            }
        } else if (!("bind"in console.log)) {
            console.log = function(fn) {
                return function(msg) {
                    return fn(msg)
                }
            }(console.log);
            console.error = function(fn) {
                return function(msg) {
                    return fn(msg)
                }
            }(console.error);
            console.warn = function(fn) {
                return function(msg) {
                    return fn(msg)
                }
            }(console.warn)
        }
    }
    )();
    (function checkOnClickCompatibility() {
        function ignoreIfTargetDisabled(event) {
            if (isDisabled(event.target)) {
                event.stopPropagation()
            }
        }
        function isDisabled(node) {
            return node.disabled || node.parentNode && isDisabled(node.parentNode)
        }
        if (navigator.userAgent.indexOf("Opera") !== -1) {
            document.addEventListener("click", ignoreIfTargetDisabled, true)
        }
    }
    )();
    (function checkOnBlobSupport() {
        if (navigator.userAgent.indexOf("Trident") >= 0) {
            PDFJS.disableCreateObjectURL = true
        }
    }
    )();
    (function checkNavigatorLanguage() {
        if ("language"in navigator) {
            return
        }
        PDFJS.locale = navigator.userLanguage || "en-US"
    }
    )();
    (function checkRangeRequests() {
        var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor") > 0;
        var regex = /Android\s[0-2][^\d]/;
        var isOldAndroid = regex.test(navigator.userAgent);
        var isChromeWithRangeBug = /Chrome\/(39|40)\./.test(navigator.userAgent);
        if (isSafari || isOldAndroid || isChromeWithRangeBug) {
            PDFJS.disableRange = true;
            PDFJS.disableStream = true
        }
    }
    )();
    (function checkHistoryManipulation() {
        if (!history.pushState || navigator.userAgent.indexOf("Android 2.") >= 0) {
            PDFJS.disableHistory = true
        }
    }
    )();
    (function checkSetPresenceInImageData() {
        if (window.CanvasPixelArray) {
            if (typeof window.CanvasPixelArray.prototype.set !== "function") {
                window.CanvasPixelArray.prototype.set = function(arr) {
                    for (var i = 0, ii = this.length; i < ii; i++) {
                        this[i] = arr[i]
                    }
                }
            }
        } else {
            var polyfill = false, versionMatch;
            if (navigator.userAgent.indexOf("Chrom") >= 0) {
                versionMatch = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
                polyfill = versionMatch && parseInt(versionMatch[2]) < 21
            } else if (navigator.userAgent.indexOf("Android") >= 0) {
                polyfill = /Android\s[0-4][^\d]/g.test(navigator.userAgent)
            } else if (navigator.userAgent.indexOf("Safari") >= 0) {
                versionMatch = navigator.userAgent.match(/Version\/([0-9]+)\.([0-9]+)\.([0-9]+) Safari\//);
                polyfill = versionMatch && parseInt(versionMatch[1]) < 6
            }
            if (polyfill) {
                var contextPrototype = window.CanvasRenderingContext2D.prototype;
                var createImageData = contextPrototype.createImageData;
                contextPrototype.createImageData = function(w, h) {
                    var imageData = createImageData.call(this, w, h);
                    imageData.data.set = function(arr) {
                        for (var i = 0, ii = this.length; i < ii; i++) {
                            this[i] = arr[i]
                        }
                    }
                    ;
                    return imageData
                }
                ;
                contextPrototype = null
            }
        }
    }
    )();
    (function checkRequestAnimationFrame() {
        function fakeRequestAnimationFrame(callback) {
            window.setTimeout(callback, 20)
        }
        var isIOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
        if (isIOS) {
            window.requestAnimationFrame = fakeRequestAnimationFrame;
            return
        }
        if ("requestAnimationFrame"in window) {
            return
        }
        window.requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || fakeRequestAnimationFrame
    }
    )();
    (function checkCanvasSizeLimitation() {
        var isIOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
        var isAndroid = /Android/g.test(navigator.userAgent);
        if (isIOS || isAndroid) {
            PDFJS.maxCanvasPixels = 5242880
        }
    }
    )();
    (function checkFullscreenSupport() {
        var isEmbeddedIE = navigator.userAgent.indexOf("Trident") >= 0 && window.parent !== window;
        if (isEmbeddedIE) {
            PDFJS.disableFullscreen = true
        }
    }
    )();
    (function checkCurrentScript() {
        if ("currentScript"in document) {
            return
        }
        Object.defineProperty(document, "currentScript", {
            get: function() {
                var scripts = document.getElementsByTagName("script");
                return scripts[scripts.length - 1]
            },
            enumerable: true,
            configurable: true
        })
    }
    )()
}
).call(typeof window === "undefined" ? this : window);

!function(t, e) {
    "use strict";
    "function" == typeof define && define.amd ? define("pdfjs-dist/build/pdf", ["exports"], e) : e("undefined" != typeof exports ? exports : t.pdfjsDistBuildPdf = {})
}(this, function(t) {
    "use strict";
    var e = "undefined" != typeof document && document.currentScript ? document.currentScript.src : null
      , n = {};
    (function() {
        !function(t, e) {
            e(t.pdfjsSharedUtil = {})
        }(this, function(t) {
            function e(t) {
                K = t
            }
            function n() {
                return K
            }
            function i(t) {
                K >= J.infos && console.log("Info: " + t)
            }
            function r(t) {
                K >= J.warnings && console.log("Warning: " + t)
            }
            function a(t) {
                console.log("Deprecated API usage: " + t)
            }
            function s(t) {
                throw K >= J.errors && (console.log("Error: " + t),
                console.log(o())),
                new Error(t)
            }
            function o() {
                try {
                    throw new Error
                } catch (t) {
                    return t.stack ? t.stack.split("\n").slice(2).join("\n") : ""
                }
            }
            function c(t, e) {
                t || s(e)
            }
            function l(t, e) {
                try {
                    var n = new URL(t);
                    if (!n.origin || "null" === n.origin)
                        return !1
                } catch (t) {
                    return !1
                }
                var i = new URL(e,n);
                return n.origin === i.origin
            }
            function h(t, e) {
                if (!t || "string" != typeof t)
                    return !1;
                var n = /^[a-z][a-z0-9+\-.]*(?=:)/i.exec(t);
                if (!n)
                    return e;
                switch (n = n[0].toLowerCase()) {
                case "http":
                case "https":
                case "ftp":
                case "mailto":
                case "tel":
                    return !0;
                default:
                    return !1
                }
            }
            function u(t, e, n) {
                return Object.defineProperty(t, e, {
                    value: n,
                    enumerable: !0,
                    configurable: !0,
                    writable: !1
                }),
                n
            }
            function d(t) {
                var e;
                return function() {
                    return t && (e = Object.create(null),
                    t(e),
                    t = null),
                    e
                }
            }
            function p(t) {
                return "string" != typeof t ? (r("The argument for removeNullCharacters must be a string."),
                t) : t.replace(/\x00/g, "")
            }
            function f(t) {
                c(null !== t && "object" == typeof t && void 0 !== t.length, "Invalid argument for bytesToString");
                var e = t.length;
                if (e < 8192)
                    return String.fromCharCode.apply(null, t);
                for (var n = [], i = 0; i < e; i += 8192) {
                    var r = Math.min(i + 8192, e)
                      , a = t.subarray(i, r);
                    n.push(String.fromCharCode.apply(null, a))
                }
                return n.join("")
            }
            function g(t) {
                c("string" == typeof t, "Invalid argument for stringToBytes");
                for (var e = t.length, n = new Uint8Array(e), i = 0; i < e; ++i)
                    n[i] = 255 & t.charCodeAt(i);
                return n
            }
            function m(t) {
                return void 0 !== t.length ? t.length : (c(void 0 !== t.byteLength),
                t.byteLength)
            }
            function A(t) {
                if (1 === t.length && t[0]instanceof Uint8Array)
                    return t[0];
                var e, n, i, r = 0, a = t.length;
                for (e = 0; e < a; e++)
                    n = t[e],
                    i = m(n),
                    r += i;
                var s = 0
                  , o = new Uint8Array(r);
                for (e = 0; e < a; e++)
                    n = t[e],
                    n instanceof Uint8Array || (n = "string" == typeof n ? g(n) : new Uint8Array(n)),
                    i = n.byteLength,
                    o.set(n, s),
                    s += i;
                return o
            }
            function v(t) {
                return String.fromCharCode(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, 255 & t)
            }
            function b(t) {
                for (var e = 1, n = 0; t > e; )
                    e <<= 1,
                    n++;
                return n
            }
            function y(t, e) {
                return t[e] << 24 >> 24
            }
            function x(t, e) {
                return t[e] << 8 | t[e + 1]
            }
            function S(t, e) {
                return (t[e] << 24 | t[e + 1] << 16 | t[e + 2] << 8 | t[e + 3]) >>> 0
            }
            function k() {
                var t = new Uint8Array(2);
                return t[0] = 1,
                1 === new Uint16Array(t.buffer)[0]
            }
            function C() {
                try {
                    return new Function(""),
                    !0
                } catch (t) {
                    return !1
                }
            }
            function _(t) {
                var e, n = t.length, i = [];
                if ("þ" === t[0] && "ÿ" === t[1])
                    for (e = 2; e < n; e += 2)
                        i.push(String.fromCharCode(t.charCodeAt(e) << 8 | t.charCodeAt(e + 1)));
                else
                    for (e = 0; e < n; ++e) {
                        var r = dt[t.charCodeAt(e)];
                        i.push(r ? String.fromCharCode(r) : t.charAt(e))
                    }
                return i.join("")
            }
            function w(t) {
                return decodeURIComponent(escape(t))
            }
            function T(t) {
                return unescape(encodeURIComponent(t))
            }
            function L(t) {
                for (var e in t)
                    return !1;
                return !0
            }
            function P(t) {
                return "boolean" == typeof t
            }
            function E(t) {
                return "number" == typeof t && (0 | t) === t
            }
            function R(t) {
                return "number" == typeof t
            }
            function I(t) {
                return "string" == typeof t
            }
            function D(t) {
                return t instanceof Array
            }
            function j(t) {
                return "object" == typeof t && null !== t && void 0 !== t.byteLength
            }
            function O(t) {
                return 32 === t || 9 === t || 13 === t || 10 === t
            }
            function M() {
                var t = {};
                return t.promise = new Promise(function(e, n) {
                    t.resolve = e,
                    t.reject = n
                }
                ),
                t
            }
            function F(t, e, n) {
                this.sourceName = t,
                this.targetName = e,
                this.comObj = n,
                this.callbackIndex = 1,
                this.postMessageTransfers = !0;
                var i = this.callbacksCapabilities = Object.create(null)
                  , r = this.actionHandler = Object.create(null);
                this._onComObjOnMessage = function(t) {
                    var e = t.data;
                    if (e.targetName === this.sourceName)
                        if (e.isReply) {
                            var a = e.callbackId;
                            if (e.callbackId in i) {
                                var o = i[a];
                                delete i[a],
                                "error"in e ? o.reject(e.error) : o.resolve(e.data)
                            } else
                                s("Cannot resolve callback " + a)
                        } else if (e.action in r) {
                            var c = r[e.action];
                            if (e.callbackId) {
                                var l = this.sourceName
                                  , h = e.sourceName;
                                Promise.resolve().then(function() {
                                    return c[0].call(c[1], e.data)
                                }).then(function(t) {
                                    n.postMessage({
                                        sourceName: l,
                                        targetName: h,
                                        isReply: !0,
                                        callbackId: e.callbackId,
                                        data: t
                                    })
                                }, function(t) {
                                    t instanceof Error && (t += ""),
                                    n.postMessage({
                                        sourceName: l,
                                        targetName: h,
                                        isReply: !0,
                                        callbackId: e.callbackId,
                                        error: t
                                    })
                                })
                            } else
                                c[0].call(c[1], e.data)
                        } else
                            s("Unknown action from worker: " + e.action)
                }
                .bind(this),
                n.addEventListener("message", this._onComObjOnMessage)
            }
            function N(t, e, n) {
                var i = new Image;
                i.onload = function() {
                    n.resolve(t, i)
                }
                ,
                i.onerror = function() {
                    n.resolve(t, null),
                    r("Error during JPEG image loading")
                }
                ,
                i.src = e
            }
            var U = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this
              , B = [.001, 0, 0, .001, 0, 0]
              , W = {
                FILL: 0,
                STROKE: 1,
                FILL_STROKE: 2,
                INVISIBLE: 3,
                FILL_ADD_TO_PATH: 4,
                STROKE_ADD_TO_PATH: 5,
                FILL_STROKE_ADD_TO_PATH: 6,
                ADD_TO_PATH: 7,
                FILL_STROKE_MASK: 3,
                ADD_TO_PATH_FLAG: 4
            }
              , G = {
                GRAYSCALE_1BPP: 1,
                RGB_24BPP: 2,
                RGBA_32BPP: 3
            }
              , X = {
                TEXT: 1,
                LINK: 2,
                FREETEXT: 3,
                LINE: 4,
                SQUARE: 5,
                CIRCLE: 6,
                POLYGON: 7,
                POLYLINE: 8,
                HIGHLIGHT: 9,
                UNDERLINE: 10,
                SQUIGGLY: 11,
                STRIKEOUT: 12,
                STAMP: 13,
                CARET: 14,
                INK: 15,
                POPUP: 16,
                FILEATTACHMENT: 17,
                SOUND: 18,
                MOVIE: 19,
                WIDGET: 20,
                SCREEN: 21,
                PRINTERMARK: 22,
                TRAPNET: 23,
                WATERMARK: 24,
                THREED: 25,
                REDACT: 26
            }
              , z = {
                INVISIBLE: 1,
                HIDDEN: 2,
                PRINT: 4,
                NOZOOM: 8,
                NOROTATE: 16,
                NOVIEW: 32,
                READONLY: 64,
                LOCKED: 128,
                TOGGLENOVIEW: 256,
                LOCKEDCONTENTS: 512
            }
              , H = {
                READONLY: 1,
                REQUIRED: 2,
                NOEXPORT: 4,
                MULTILINE: 4096,
                PASSWORD: 8192,
                NOTOGGLETOOFF: 16384,
                RADIO: 32768,
                PUSHBUTTON: 65536,
                COMBO: 131072,
                EDIT: 262144,
                SORT: 524288,
                FILESELECT: 1048576,
                MULTISELECT: 2097152,
                DONOTSPELLCHECK: 4194304,
                DONOTSCROLL: 8388608,
                COMB: 16777216,
                RICHTEXT: 33554432,
                RADIOSINUNISON: 33554432,
                COMMITONSELCHANGE: 67108864
            }
              , Y = {
                SOLID: 1,
                DASHED: 2,
                BEVELED: 3,
                INSET: 4,
                UNDERLINE: 5
            }
              , q = {
                UNKNOWN: 0,
                FLATE: 1,
                LZW: 2,
                DCT: 3,
                JPX: 4,
                JBIG: 5,
                A85: 6,
                AHX: 7,
                CCF: 8,
                RL: 9
            }
              , V = {
                UNKNOWN: 0,
                TYPE1: 1,
                TYPE1C: 2,
                CIDFONTTYPE0: 3,
                CIDFONTTYPE0C: 4,
                TRUETYPE: 5,
                CIDFONTTYPE2: 6,
                TYPE3: 7,
                OPENTYPE: 8,
                TYPE0: 9,
                MMTYPE1: 10
            }
              , J = {
                errors: 0,
                warnings: 1,
                infos: 5
            }
              , Q = {
                dependency: 1,
                setLineWidth: 2,
                setLineCap: 3,
                setLineJoin: 4,
                setMiterLimit: 5,
                setDash: 6,
                setRenderingIntent: 7,
                setFlatness: 8,
                setGState: 9,
                save: 10,
                restore: 11,
                transform: 12,
                moveTo: 13,
                lineTo: 14,
                curveTo: 15,
                curveTo2: 16,
                curveTo3: 17,
                closePath: 18,
                rectangle: 19,
                stroke: 20,
                closeStroke: 21,
                fill: 22,
                eoFill: 23,
                fillStroke: 24,
                eoFillStroke: 25,
                closeFillStroke: 26,
                closeEOFillStroke: 27,
                endPath: 28,
                clip: 29,
                eoClip: 30,
                beginText: 31,
                endText: 32,
                setCharSpacing: 33,
                setWordSpacing: 34,
                setHScale: 35,
                setLeading: 36,
                setFont: 37,
                setTextRenderingMode: 38,
                setTextRise: 39,
                moveText: 40,
                setLeadingMoveText: 41,
                setTextMatrix: 42,
                nextLine: 43,
                showText: 44,
                showSpacedText: 45,
                nextLineShowText: 46,
                nextLineSetSpacingShowText: 47,
                setCharWidth: 48,
                setCharWidthAndBounds: 49,
                setStrokeColorSpace: 50,
                setFillColorSpace: 51,
                setStrokeColor: 52,
                setStrokeColorN: 53,
                setFillColor: 54,
                setFillColorN: 55,
                setStrokeGray: 56,
                setFillGray: 57,
                setStrokeRGBColor: 58,
                setFillRGBColor: 59,
                setStrokeCMYKColor: 60,
                setFillCMYKColor: 61,
                shadingFill: 62,
                beginInlineImage: 63,
                beginImageData: 64,
                endInlineImage: 65,
                paintXObject: 66,
                markPoint: 67,
                markPointProps: 68,
                beginMarkedContent: 69,
                beginMarkedContentProps: 70,
                endMarkedContent: 71,
                beginCompat: 72,
                endCompat: 73,
                paintFormXObjectBegin: 74,
                paintFormXObjectEnd: 75,
                beginGroup: 76,
                endGroup: 77,
                beginAnnotations: 78,
                endAnnotations: 79,
                beginAnnotation: 80,
                endAnnotation: 81,
                paintJpegXObject: 82,
                paintImageMaskXObject: 83,
                paintImageMaskXObjectGroup: 84,
                paintImageXObject: 85,
                paintInlineImageXObject: 86,
                paintInlineImageXObjectGroup: 87,
                paintImageXObjectRepeat: 88,
                paintImageMaskXObjectRepeat: 89,
                paintSolidColorImageMask: 90,
                constructPath: 91
            }
              , K = J.warnings
              , Z = {
                unknown: "unknown",
                forms: "forms",
                javaScript: "javaScript",
                smask: "smask",
                shadingPattern: "shadingPattern",
                font: "font"
            }
              , $ = {
                NEED_PASSWORD: 1,
                INCORRECT_PASSWORD: 2
            }
              , tt = function() {
                function t(t, e) {
                    this.name = "PasswordException",
                    this.message = t,
                    this.code = e
                }
                return t.prototype = new Error,
                t.constructor = t,
                t
            }()
              , et = function() {
                function t(t, e) {
                    this.name = "UnknownErrorException",
                    this.message = t,
                    this.details = e
                }
                return t.prototype = new Error,
                t.constructor = t,
                t
            }()
              , nt = function() {
                function t(t) {
                    this.name = "InvalidPDFException",
                    this.message = t
                }
                return t.prototype = new Error,
                t.constructor = t,
                t
            }()
              , it = function() {
                function t(t) {
                    this.name = "MissingPDFException",
                    this.message = t
                }
                return t.prototype = new Error,
                t.constructor = t,
                t
            }()
              , rt = function() {
                function t(t, e) {
                    this.name = "UnexpectedResponseException",
                    this.message = t,
                    this.status = e
                }
                return t.prototype = new Error,
                t.constructor = t,
                t
            }()
              , at = function() {
                function t(t) {
                    this.message = t
                }
                return t.prototype = new Error,
                t.prototype.name = "NotImplementedException",
                t.constructor = t,
                t
            }()
              , st = function() {
                function t(t, e) {
                    this.begin = t,
                    this.end = e,
                    this.message = "Missing data [" + t + ", " + e + ")"
                }
                return t.prototype = new Error,
                t.prototype.name = "MissingDataException",
                t.constructor = t,
                t
            }()
              , ot = function() {
                function t(t) {
                    this.message = t
                }
                return t.prototype = new Error,
                t.prototype.name = "XRefParseException",
                t.constructor = t,
                t
            }()
              , ct = function() {
                function t(t, e) {
                    this.buffer = t,
                    this.byteLength = t.length,
                    this.length = void 0 === e ? this.byteLength >> 2 : e,
                    n(this.length)
                }
                function e(t) {
                    return {
                        get: function() {
                            var e = this.buffer
                              , n = t << 2;
                            return (e[n] | e[n + 1] << 8 | e[n + 2] << 16 | e[n + 3] << 24) >>> 0
                        },
                        set: function(e) {
                            var n = this.buffer
                              , i = t << 2;
                            n[i] = 255 & e,
                            n[i + 1] = e >> 8 & 255,
                            n[i + 2] = e >> 16 & 255,
                            n[i + 3] = e >>> 24 & 255
                        }
                    }
                }
                function n(n) {
                    for (; i < n; )
                        Object.defineProperty(t.prototype, i, e(i)),
                        i++
                }
                t.prototype = Object.create(null);
                var i = 0;
                return t
            }();
            t.Uint32ArrayView = ct;
            var lt = [1, 0, 0, 1, 0, 0]
              , ht = function() {
                function t() {}
                var e = ["rgb(", 0, ",", 0, ",", 0, ")"];
                t.makeCssRgb = function(t, n, i) {
                    return e[1] = t,
                    e[3] = n,
                    e[5] = i,
                    e.join("")
                }
                ,
                t.transform = function(t, e) {
                    return [t[0] * e[0] + t[2] * e[1], t[1] * e[0] + t[3] * e[1], t[0] * e[2] + t[2] * e[3], t[1] * e[2] + t[3] * e[3], t[0] * e[4] + t[2] * e[5] + t[4], t[1] * e[4] + t[3] * e[5] + t[5]]
                }
                ,
                t.applyTransform = function(t, e) {
                    return [t[0] * e[0] + t[1] * e[2] + e[4], t[0] * e[1] + t[1] * e[3] + e[5]]
                }
                ,
                t.applyInverseTransform = function(t, e) {
                    var n = e[0] * e[3] - e[1] * e[2];
                    return [(t[0] * e[3] - t[1] * e[2] + e[2] * e[5] - e[4] * e[3]) / n, (-t[0] * e[1] + t[1] * e[0] + e[4] * e[1] - e[5] * e[0]) / n]
                }
                ,
                t.getAxialAlignedBoundingBox = function(e, n) {
                    var i = t.applyTransform(e, n)
                      , r = t.applyTransform(e.slice(2, 4), n)
                      , a = t.applyTransform([e[0], e[3]], n)
                      , s = t.applyTransform([e[2], e[1]], n);
                    return [Math.min(i[0], r[0], a[0], s[0]), Math.min(i[1], r[1], a[1], s[1]), Math.max(i[0], r[0], a[0], s[0]), Math.max(i[1], r[1], a[1], s[1])]
                }
                ,
                t.inverseTransform = function(t) {
                    var e = t[0] * t[3] - t[1] * t[2];
                    return [t[3] / e, -t[1] / e, -t[2] / e, t[0] / e, (t[2] * t[5] - t[4] * t[3]) / e, (t[4] * t[1] - t[5] * t[0]) / e]
                }
                ,
                t.apply3dTransform = function(t, e) {
                    return [t[0] * e[0] + t[1] * e[1] + t[2] * e[2], t[3] * e[0] + t[4] * e[1] + t[5] * e[2], t[6] * e[0] + t[7] * e[1] + t[8] * e[2]]
                }
                ,
                t.singularValueDecompose2dScale = function(t) {
                    var e = [t[0], t[2], t[1], t[3]]
                      , n = t[0] * e[0] + t[1] * e[2]
                      , i = t[0] * e[1] + t[1] * e[3]
                      , r = t[2] * e[0] + t[3] * e[2]
                      , a = t[2] * e[1] + t[3] * e[3]
                      , s = (n + a) / 2
                      , o = Math.sqrt((n + a) * (n + a) - 4 * (n * a - r * i)) / 2
                      , c = s + o || 1
                      , l = s - o || 1;
                    return [Math.sqrt(c), Math.sqrt(l)]
                }
                ,
                t.normalizeRect = function(t) {
                    var e = t.slice(0);
                    return t[0] > t[2] && (e[0] = t[2],
                    e[2] = t[0]),
                    t[1] > t[3] && (e[1] = t[3],
                    e[3] = t[1]),
                    e
                }
                ,
                t.intersect = function(e, n) {
                    function i(t, e) {
                        return t - e
                    }
                    var r = [e[0], e[2], n[0], n[2]].sort(i)
                      , a = [e[1], e[3], n[1], n[3]].sort(i)
                      , s = [];
                    return e = t.normalizeRect(e),
                    n = t.normalizeRect(n),
                    (r[0] === e[0] && r[1] === n[0] || r[0] === n[0] && r[1] === e[0]) && (s[0] = r[1],
                    s[2] = r[2],
                    (a[0] === e[1] && a[1] === n[1] || a[0] === n[1] && a[1] === e[1]) && (s[1] = a[1],
                    s[3] = a[2],
                    s))
                }
                ,
                t.sign = function(t) {
                    return t < 0 ? -1 : 1
                }
                ;
                var n = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM", "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC", "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
                return t.toRoman = function(t, e) {
                    c(E(t) && t > 0, "The number should be a positive integer.");
                    for (var i, r = []; t >= 1e3; )
                        t -= 1e3,
                        r.push("M");
                    i = t / 100 | 0,
                    t %= 100,
                    r.push(n[i]),
                    i = t / 10 | 0,
                    t %= 10,
                    r.push(n[10 + i]),
                    r.push(n[20 + t]);
                    var a = r.join("");
                    return e ? a.toLowerCase() : a
                }
                ,
                t.appendToArray = function(t, e) {
                    Array.prototype.push.apply(t, e)
                }
                ,
                t.prependToArray = function(t, e) {
                    Array.prototype.unshift.apply(t, e)
                }
                ,
                t.extendObj = function(t, e) {
                    for (var n in e)
                        t[n] = e[n]
                }
                ,
                t.getInheritableProperty = function(t, e) {
                    for (; t && !t.has(e); )
                        t = t.get("Parent");
                    return t ? t.get(e) : null
                }
                ,
                t.inherit = function(t, e, n) {
                    t.prototype = Object.create(e.prototype),
                    t.prototype.constructor = t;
                    for (var i in n)
                        t.prototype[i] = n[i]
                }
                ,
                t.loadScript = function(t, e) {
                    var n = document.createElement("script")
                      , i = !1;
                    n.setAttribute("src", t),
                    e && (n.onload = function() {
                        i || e(),
                        i = !0
                    }
                    ),
                    document.getElementsByTagName("head")[0].appendChild(n)
                }
                ,
                t
            }()
              , ut = function() {
                function t(t, e, n, i, r, a) {
                    this.viewBox = t,
                    this.scale = e,
                    this.rotation = n,
                    this.offsetX = i,
                    this.offsetY = r;
                    var s, o, c, l, h = (t[2] + t[0]) / 2, u = (t[3] + t[1]) / 2;
                    switch (n %= 360,
                    n = n < 0 ? n + 360 : n) {
                    case 180:
                        s = -1,
                        o = 0,
                        c = 0,
                        l = 1;
                        break;
                    case 90:
                        s = 0,
                        o = 1,
                        c = 1,
                        l = 0;
                        break;
                    case 270:
                        s = 0,
                        o = -1,
                        c = -1,
                        l = 0;
                        break;
                    default:
                        s = 1,
                        o = 0,
                        c = 0,
                        l = -1
                    }
                    a && (c = -c,
                    l = -l);
                    var d, p, f, g;
                    0 === s ? (d = Math.abs(u - t[1]) * e + i,
                    p = Math.abs(h - t[0]) * e + r,
                    f = Math.abs(t[3] - t[1]) * e,
                    g = Math.abs(t[2] - t[0]) * e) : (d = Math.abs(h - t[0]) * e + i,
                    p = Math.abs(u - t[1]) * e + r,
                    f = Math.abs(t[2] - t[0]) * e,
                    g = Math.abs(t[3] - t[1]) * e),
                    this.transform = [s * e, o * e, c * e, l * e, d - s * e * h - c * e * u, p - o * e * h - l * e * u],
                    this.width = f,
                    this.height = g,
                    this.fontScale = e
                }
                return t.prototype = {
                    clone: function(e) {
                        e = e || {};
                        var n = "scale"in e ? e.scale : this.scale
                          , i = "rotation"in e ? e.rotation : this.rotation;
                        return new t(this.viewBox.slice(),n,i,this.offsetX,this.offsetY,e.dontFlip)
                    },
                    convertToViewportPoint: function(t, e) {
                        return ht.applyTransform([t, e], this.transform)
                    },
                    convertToViewportRectangle: function(t) {
                        var e = ht.applyTransform([t[0], t[1]], this.transform)
                          , n = ht.applyTransform([t[2], t[3]], this.transform);
                        return [e[0], e[1], n[0], n[1]]
                    },
                    convertToPdfPoint: function(t, e) {
                        return ht.applyInverseTransform([t, e], this.transform)
                    }
                },
                t
            }()
              , dt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 728, 711, 710, 729, 733, 731, 730, 732, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8226, 8224, 8225, 8230, 8212, 8211, 402, 8260, 8249, 8250, 8722, 8240, 8222, 8220, 8221, 8216, 8217, 8218, 8482, 64257, 64258, 321, 338, 352, 376, 381, 305, 322, 339, 353, 382, 0, 8364];
            !function() {
                function t(t) {
                    this._status = 0,
                    this._handlers = [];
                    try {
                        t.call(this, this._resolve.bind(this), this._reject.bind(this))
                    } catch (t) {
                        this._reject(t)
                    }
                }
                if (U.Promise)
                    return "function" != typeof U.Promise.all && (U.Promise.all = function(t) {
                        var e, n, i = 0, r = [], a = new U.Promise(function(t, i) {
                            e = t,
                            n = i
                        }
                        );
                        return t.forEach(function(t, a) {
                            i++,
                            t.then(function(t) {
                                r[a] = t,
                                0 === --i && e(r)
                            }, n)
                        }),
                        0 === i && e(r),
                        a
                    }
                    ),
                    "function" != typeof U.Promise.resolve && (U.Promise.resolve = function(t) {
                        return new U.Promise(function(e) {
                            e(t)
                        }
                        )
                    }
                    ),
                    "function" != typeof U.Promise.reject && (U.Promise.reject = function(t) {
                        return new U.Promise(function(e, n) {
                            n(t)
                        }
                        )
                    }
                    ),
                    void ("function" != typeof U.Promise.prototype.catch && (U.Promise.prototype.catch = function(t) {
                        return U.Promise.prototype.then(void 0, t)
                    }
                    ));
                var e = {
                    handlers: [],
                    running: !1,
                    unhandledRejections: [],
                    pendingRejectionCheck: !1,
                    scheduleHandlers: function(t) {
                        0 !== t._status && (this.handlers = this.handlers.concat(t._handlers),
                        t._handlers = [],
                        this.running || (this.running = !0,
                        setTimeout(this.runHandlers.bind(this), 0)))
                    },
                    runHandlers: function() {
                        for (var t = Date.now() + 1; this.handlers.length > 0; ) {
                            var e = this.handlers.shift()
                              , n = e.thisPromise._status
                              , i = e.thisPromise._value;
                            try {
                                1 === n ? "function" == typeof e.onResolve && (i = e.onResolve(i)) : "function" == typeof e.onReject && (i = e.onReject(i),
                                n = 1,
                                e.thisPromise._unhandledRejection && this.removeUnhandeledRejection(e.thisPromise))
                            } catch (t) {
                                n = 2,
                                i = t
                            }
                            if (e.nextPromise._updateStatus(n, i),
                            Date.now() >= t)
                                break
                        }
                        if (this.handlers.length > 0)
                            return void setTimeout(this.runHandlers.bind(this), 0);
                        this.running = !1
                    },
                    addUnhandledRejection: function(t) {
                        this.unhandledRejections.push({
                            promise: t,
                            time: Date.now()
                        }),
                        this.scheduleRejectionCheck()
                    },
                    removeUnhandeledRejection: function(t) {
                        t._unhandledRejection = !1;
                        for (var e = 0; e < this.unhandledRejections.length; e++)
                            this.unhandledRejections[e].promise === t && (this.unhandledRejections.splice(e),
                            e--)
                    },
                    scheduleRejectionCheck: function() {
                        this.pendingRejectionCheck || (this.pendingRejectionCheck = !0,
                        setTimeout(function() {
                            this.pendingRejectionCheck = !1;
                            for (var t = Date.now(), e = 0; e < this.unhandledRejections.length; e++)
                                if (t - this.unhandledRejections[e].time > 500) {
                                    var n = this.unhandledRejections[e].promise._value
                                      , i = "Unhandled rejection: " + n;
                                    n.stack && (i += "\n" + n.stack),
                                    r(i),
                                    this.unhandledRejections.splice(e),
                                    e--
                                }
                            this.unhandledRejections.length && this.scheduleRejectionCheck()
                        }
                        .bind(this), 500))
                    }
                };
                t.all = function(e) {
                    function n(t) {
                        2 !== a._status && (o = [],
                        r(t))
                    }
                    var i, r, a = new t(function(t, e) {
                        i = t,
                        r = e
                    }
                    ), s = e.length, o = [];
                    if (0 === s)
                        return i(o),
                        a;
                    for (var c = 0, l = e.length; c < l; ++c) {
                        var h = e[c]
                          , u = function(t) {
                            return function(e) {
                                2 !== a._status && (o[t] = e,
                                0 === --s && i(o))
                            }
                        }(c);
                        t.isPromise(h) ? h.then(u, n) : u(h)
                    }
                    return a
                }
                ,
                t.isPromise = function(t) {
                    return t && "function" == typeof t.then
                }
                ,
                t.resolve = function(e) {
                    return new t(function(t) {
                        t(e)
                    }
                    )
                }
                ,
                t.reject = function(e) {
                    return new t(function(t, n) {
                        n(e)
                    }
                    )
                }
                ,
                t.prototype = {
                    _status: null,
                    _value: null,
                    _handlers: null,
                    _unhandledRejection: null,
                    _updateStatus: function(n, i) {
                        if (1 !== this._status && 2 !== this._status) {
                            if (1 === n && t.isPromise(i))
                                return void i.then(this._updateStatus.bind(this, 1), this._updateStatus.bind(this, 2));
                            this._status = n,
                            this._value = i,
                            2 === n && 0 === this._handlers.length && (this._unhandledRejection = !0,
                            e.addUnhandledRejection(this)),
                            e.scheduleHandlers(this)
                        }
                    },
                    _resolve: function(t) {
                        this._updateStatus(1, t)
                    },
                    _reject: function(t) {
                        this._updateStatus(2, t)
                    },
                    then: function(n, i) {
                        var r = new t(function(t, e) {
                            this.resolve = t,
                            this.reject = e
                        }
                        );
                        return this._handlers.push({
                            thisPromise: this,
                            onResolve: n,
                            onReject: i,
                            nextPromise: r
                        }),
                        e.scheduleHandlers(this),
                        r
                    },
                    catch: function(t) {
                        return this.then(void 0, t)
                    }
                },
                U.Promise = t
            }(),
            function() {
                function t() {
                    this.id = "$weakmap" + e++
                }
                if (!U.WeakMap) {
                    var e = 0;
                    t.prototype = {
                        has: function(t) {
                            return !!Object.getOwnPropertyDescriptor(t, this.id)
                        },
                        get: function(t, e) {
                            return this.has(t) ? t[this.id] : e
                        },
                        set: function(t, e) {
                            Object.defineProperty(t, this.id, {
                                value: e,
                                enumerable: !1,
                                configurable: !0
                            })
                        },
                        delete: function(t) {
                            delete t[this.id]
                        }
                    },
                    U.WeakMap = t
                }
            }();
            var pt = function() {
                function t(t, e, n) {
                    for (; t.length < n; )
                        t += e;
                    return t
                }
                function e() {
                    this.started = Object.create(null),
                    this.times = [],
                    this.enabled = !0
                }
                return e.prototype = {
                    time: function(t) {
                        this.enabled && (t in this.started && r("Timer is already running for " + t),
                        this.started[t] = Date.now())
                    },
                    timeEnd: function(t) {
                        this.enabled && (t in this.started || r("Timer has not been started for " + t),
                        this.times.push({
                            name: t,
                            start: this.started[t],
                            end: Date.now()
                        }),
                        delete this.started[t])
                    },
                    toString: function() {
                        var e, n, i = this.times, r = "", a = 0;
                        for (e = 0,
                        n = i.length; e < n; ++e) {
                            var s = i[e].name;
                            s.length > a && (a = s.length)
                        }
                        for (e = 0,
                        n = i.length; e < n; ++e) {
                            var o = i[e]
                              , c = o.end - o.start;
                            r += t(o.name, " ", a) + " " + c + "ms\n"
                        }
                        return r
                    }
                },
                e
            }()
              , ft = function(t, e) {
                if ("undefined" != typeof Blob)
                    return new Blob([t],{
                        type: e
                    });
                r('The "Blob" constructor is not supported.')
            }
              , gt = function() {
                var t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
                return function(e, n, i) {
                    if (!i && "undefined" != typeof URL && URL.createObjectURL) {
                        var r = ft(e, n);
                        return URL.createObjectURL(r)
                    }
                    for (var a = "data:" + n + ";base64,", s = 0, o = e.length; s < o; s += 3) {
                        var c = 255 & e[s]
                          , l = 255 & e[s + 1]
                          , h = 255 & e[s + 2]
                          , u = c >> 2
                          , d = (3 & c) << 4 | l >> 4
                          , p = s + 1 < o ? (15 & l) << 2 | h >> 6 : 64
                          , f = s + 2 < o ? 63 & h : 64;
                        a += t[u] + t[d] + t[p] + t[f]
                    }
                    return a
                }
            }();
            F.prototype = {
                on: function(t, e, n) {
                    var i = this.actionHandler;
                    i[t] && s('There is already an actionName called "' + t + '"'),
                    i[t] = [e, n]
                },
                send: function(t, e, n) {
                    var i = {
                        sourceName: this.sourceName,
                        targetName: this.targetName,
                        action: t,
                        data: e
                    };
                    this.postMessage(i, n)
                },
                sendWithPromise: function(t, e, n) {
                    var i = this.callbackIndex++
                      , r = {
                        sourceName: this.sourceName,
                        targetName: this.targetName,
                        action: t,
                        data: e,
                        callbackId: i
                    }
                      , a = M();
                    this.callbacksCapabilities[i] = a;
                    try {
                        this.postMessage(r, n)
                    } catch (t) {
                        a.reject(t)
                    }
                    return a.promise
                },
                postMessage: function(t, e) {
                    e && this.postMessageTransfers ? this.comObj.postMessage(t, e) : this.comObj.postMessage(t)
                },
                destroy: function() {
                    this.comObj.removeEventListener("message", this._onComObjOnMessage)
                }
            },
            function(t) {
                function e(t) {
                    return void 0 !== u[t]
                }
                function n() {
                    o.call(this),
                    this._isInvalid = !0
                }
                function i(t) {
                    return "" === t && n.call(this),
                    t.toLowerCase()
                }
                function r(t) {
                    var e = t.charCodeAt(0);
                    return e > 32 && e < 127 && [34, 35, 60, 62, 63, 96].indexOf(e) === -1 ? t : encodeURIComponent(t)
                }
                function a(t) {
                    var e = t.charCodeAt(0);
                    return e > 32 && e < 127 && [34, 35, 60, 62, 96].indexOf(e) === -1 ? t : encodeURIComponent(t)
                }
                function s(t, s, o) {
                    function c(t) {
                        b.push(t)
                    }
                    var l = s || "scheme start"
                      , h = 0
                      , m = ""
                      , A = !1
                      , v = !1
                      , b = [];
                    t: for (; (t[h - 1] !== p || 0 === h) && !this._isInvalid; ) {
                        var y = t[h];
                        switch (l) {
                        case "scheme start":
                            if (!y || !f.test(y)) {
                                if (s) {
                                    c("Invalid scheme.");
                                    break t
                                }
                                m = "",
                                l = "no scheme";
                                continue
                            }
                            m += y.toLowerCase(),
                            l = "scheme";
                            break;
                        case "scheme":
                            if (y && g.test(y))
                                m += y.toLowerCase();
                            else {
                                if (":" !== y) {
                                    if (s) {
                                        if (p === y)
                                            break t;
                                        c("Code point not allowed in scheme: " + y);
                                        break t
                                    }
                                    m = "",
                                    h = 0,
                                    l = "no scheme";
                                    continue
                                }
                                if (this._scheme = m,
                                m = "",
                                s)
                                    break t;
                                e(this._scheme) && (this._isRelative = !0),
                                l = "file" === this._scheme ? "relative" : this._isRelative && o && o._scheme === this._scheme ? "relative or authority" : this._isRelative ? "authority first slash" : "scheme data"
                            }
                            break;
                        case "scheme data":
                            "?" === y ? (this._query = "?",
                            l = "query") : "#" === y ? (this._fragment = "#",
                            l = "fragment") : p !== y && "\t" !== y && "\n" !== y && "\r" !== y && (this._schemeData += r(y));
                            break;
                        case "no scheme":
                            if (o && e(o._scheme)) {
                                l = "relative";
                                continue
                            }
                            c("Missing scheme."),
                            n.call(this);
                            break;
                        case "relative or authority":
                            if ("/" !== y || "/" !== t[h + 1]) {
                                c("Expected /, got: " + y),
                                l = "relative";
                                continue
                            }
                            l = "authority ignore slashes";
                            break;
                        case "relative":
                            if (this._isRelative = !0,
                            "file" !== this._scheme && (this._scheme = o._scheme),
                            p === y) {
                                this._host = o._host,
                                this._port = o._port,
                                this._path = o._path.slice(),
                                this._query = o._query,
                                this._username = o._username,
                                this._password = o._password;
                                break t
                            }
                            if ("/" === y || "\\" === y)
                                "\\" === y && c("\\ is an invalid code point."),
                                l = "relative slash";
                            else if ("?" === y)
                                this._host = o._host,
                                this._port = o._port,
                                this._path = o._path.slice(),
                                this._query = "?",
                                this._username = o._username,
                                this._password = o._password,
                                l = "query";
                            else {
                                if ("#" !== y) {
                                    var x = t[h + 1]
                                      , S = t[h + 2];
                                    ("file" !== this._scheme || !f.test(y) || ":" !== x && "|" !== x || p !== S && "/" !== S && "\\" !== S && "?" !== S && "#" !== S) && (this._host = o._host,
                                    this._port = o._port,
                                    this._username = o._username,
                                    this._password = o._password,
                                    this._path = o._path.slice(),
                                    this._path.pop()),
                                    l = "relative path";
                                    continue
                                }
                                this._host = o._host,
                                this._port = o._port,
                                this._path = o._path.slice(),
                                this._query = o._query,
                                this._fragment = "#",
                                this._username = o._username,
                                this._password = o._password,
                                l = "fragment"
                            }
                            break;
                        case "relative slash":
                            if ("/" !== y && "\\" !== y) {
                                "file" !== this._scheme && (this._host = o._host,
                                this._port = o._port,
                                this._username = o._username,
                                this._password = o._password),
                                l = "relative path";
                                continue
                            }
                            "\\" === y && c("\\ is an invalid code point."),
                            l = "file" === this._scheme ? "file host" : "authority ignore slashes";
                            break;
                        case "authority first slash":
                            if ("/" !== y) {
                                c("Expected '/', got: " + y),
                                l = "authority ignore slashes";
                                continue
                            }
                            l = "authority second slash";
                            break;
                        case "authority second slash":
                            if (l = "authority ignore slashes",
                            "/" !== y) {
                                c("Expected '/', got: " + y);
                                continue
                            }
                            break;
                        case "authority ignore slashes":
                            if ("/" !== y && "\\" !== y) {
                                l = "authority";
                                continue
                            }
                            c("Expected authority, got: " + y);
                            break;
                        case "authority":
                            if ("@" === y) {
                                A && (c("@ already seen."),
                                m += "%40"),
                                A = !0;
                                for (var k = 0; k < m.length; k++) {
                                    var C = m[k];
                                    if ("\t" !== C && "\n" !== C && "\r" !== C)
                                        if (":" !== C || null !== this._password) {
                                            var _ = r(C);
                                            null !== this._password ? this._password += _ : this._username += _
                                        } else
                                            this._password = "";
                                    else
                                        c("Invalid whitespace in authority.")
                                }
                                m = ""
                            } else {
                                if (p === y || "/" === y || "\\" === y || "?" === y || "#" === y) {
                                    h -= m.length,
                                    m = "",
                                    l = "host";
                                    continue
                                }
                                m += y
                            }
                            break;
                        case "file host":
                            if (p === y || "/" === y || "\\" === y || "?" === y || "#" === y) {
                                2 !== m.length || !f.test(m[0]) || ":" !== m[1] && "|" !== m[1] ? 0 === m.length ? l = "relative path start" : (this._host = i.call(this, m),
                                m = "",
                                l = "relative path start") : l = "relative path";
                                continue
                            }
                            "\t" === y || "\n" === y || "\r" === y ? c("Invalid whitespace in file host.") : m += y;
                            break;
                        case "host":
                        case "hostname":
                            if (":" !== y || v) {
                                if (p === y || "/" === y || "\\" === y || "?" === y || "#" === y) {
                                    if (this._host = i.call(this, m),
                                    m = "",
                                    l = "relative path start",
                                    s)
                                        break t;
                                    continue
                                }
                                "\t" !== y && "\n" !== y && "\r" !== y ? ("[" === y ? v = !0 : "]" === y && (v = !1),
                                m += y) : c("Invalid code point in host/hostname: " + y)
                            } else if (this._host = i.call(this, m),
                            m = "",
                            l = "port",
                            "hostname" === s)
                                break t;
                            break;
                        case "port":
                            if (/[0-9]/.test(y))
                                m += y;
                            else {
                                if (p === y || "/" === y || "\\" === y || "?" === y || "#" === y || s) {
                                    if ("" !== m) {
                                        var w = parseInt(m, 10);
                                        w !== u[this._scheme] && (this._port = w + ""),
                                        m = ""
                                    }
                                    if (s)
                                        break t;
                                    l = "relative path start";
                                    continue
                                }
                                "\t" === y || "\n" === y || "\r" === y ? c("Invalid code point in port: " + y) : n.call(this)
                            }
                            break;
                        case "relative path start":
                            if ("\\" === y && c("'\\' not allowed in path."),
                            l = "relative path",
                            "/" !== y && "\\" !== y)
                                continue;
                            break;
                        case "relative path":
                            if (p !== y && "/" !== y && "\\" !== y && (s || "?" !== y && "#" !== y))
                                "\t" !== y && "\n" !== y && "\r" !== y && (m += r(y));
                            else {
                                "\\" === y && c("\\ not allowed in relative path.");
                                var T;
                                (T = d[m.toLowerCase()]) && (m = T),
                                ".." === m ? (this._path.pop(),
                                "/" !== y && "\\" !== y && this._path.push("")) : "." === m && "/" !== y && "\\" !== y ? this._path.push("") : "." !== m && ("file" === this._scheme && 0 === this._path.length && 2 === m.length && f.test(m[0]) && "|" === m[1] && (m = m[0] + ":"),
                                this._path.push(m)),
                                m = "",
                                "?" === y ? (this._query = "?",
                                l = "query") : "#" === y && (this._fragment = "#",
                                l = "fragment")
                            }
                            break;
                        case "query":
                            s || "#" !== y ? p !== y && "\t" !== y && "\n" !== y && "\r" !== y && (this._query += a(y)) : (this._fragment = "#",
                            l = "fragment");
                            break;
                        case "fragment":
                            p !== y && "\t" !== y && "\n" !== y && "\r" !== y && (this._fragment += y)
                        }
                        h++
                    }
                }
                function o() {
                    this._scheme = "",
                    this._schemeData = "",
                    this._username = "",
                    this._password = null,
                    this._host = "",
                    this._port = "",
                    this._path = [],
                    this._query = "",
                    this._fragment = "",
                    this._isInvalid = !1,
                    this._isRelative = !1
                }
                function c(t, e) {
                    void 0 === e || e instanceof c || (e = new c(String(e))),
                    this._url = t,
                    o.call(this);
                    var n = t.replace(/^[ \t\r\n\f]+|[ \t\r\n\f]+$/g, "");
                    s.call(this, n, null, e)
                }
                var l = !1;
                try {
                    if ("function" == typeof URL && "object" == typeof URL.prototype && "origin"in URL.prototype) {
                        var h = new URL("b","http://a");
                        h.pathname = "c%20d",
                        l = "http://a/c%20d" === h.href
                    }
                } catch (t) {}
                if (!l) {
                    var u = Object.create(null);
                    u.ftp = 21,
                    u.file = 0,
                    u.gopher = 70,
                    u.http = 80,
                    u.https = 443,
                    u.ws = 80,
                    u.wss = 443;
                    var d = Object.create(null);
                    d["%2e"] = ".",
                    d[".%2e"] = "..",
                    d["%2e."] = "..",
                    d["%2e%2e"] = "..";
                    var p, f = /[a-zA-Z]/, g = /[a-zA-Z0-9\+\-\.]/;
                    c.prototype = {
                        toString: function() {
                            return this.href
                        },
                        get href() {
                            if (this._isInvalid)
                                return this._url;
                            var t = "";
                            return "" === this._username && null === this._password || (t = this._username + (null !== this._password ? ":" + this._password : "") + "@"),
                            this.protocol + (this._isRelative ? "//" + t + this.host : "") + this.pathname + this._query + this._fragment
                        },
                        set href(t) {
                            o.call(this),
                            s.call(this, t)
                        },
                        get protocol() {
                            return this._scheme + ":"
                        },
                        set protocol(t) {
                            this._isInvalid || s.call(this, t + ":", "scheme start")
                        },
                        get host() {
                            return this._isInvalid ? "" : this._port ? this._host + ":" + this._port : this._host
                        },
                        set host(t) {
                            !this._isInvalid && this._isRelative && s.call(this, t, "host")
                        },
                        get hostname() {
                            return this._host
                        },
                        set hostname(t) {
                            !this._isInvalid && this._isRelative && s.call(this, t, "hostname")
                        },
                        get port() {
                            return this._port
                        },
                        set port(t) {
                            !this._isInvalid && this._isRelative && s.call(this, t, "port")
                        },
                        get pathname() {
                            return this._isInvalid ? "" : this._isRelative ? "/" + this._path.join("/") : this._schemeData
                        },
                        set pathname(t) {
                            !this._isInvalid && this._isRelative && (this._path = [],
                            s.call(this, t, "relative path start"))
                        },
                        get search() {
                            return this._isInvalid || !this._query || "?" === this._query ? "" : this._query
                        },
                        set search(t) {
                            !this._isInvalid && this._isRelative && (this._query = "?",
                            "?" === t[0] && (t = t.slice(1)),
                            s.call(this, t, "query"))
                        },
                        get hash() {
                            return this._isInvalid || !this._fragment || "#" === this._fragment ? "" : this._fragment
                        },
                        set hash(t) {
                            this._isInvalid || (this._fragment = "#",
                            "#" === t[0] && (t = t.slice(1)),
                            s.call(this, t, "fragment"))
                        },
                        get origin() {
                            var t;
                            if (this._isInvalid || !this._scheme)
                                return "";
                            switch (this._scheme) {
                            case "data":
                            case "file":
                            case "javascript":
                            case "mailto":
                                return "null"
                            }
                            return t = this.host,
                            t ? this._scheme + "://" + t : ""
                        }
                    };
                    var m = t.URL;
                    m && (c.createObjectURL = function(t) {
                        return m.createObjectURL.apply(m, arguments)
                    }
                    ,
                    c.revokeObjectURL = function(t) {
                        m.revokeObjectURL(t)
                    }
                    ),
                    t.URL = c
                }
            }(U),
            t.FONT_IDENTITY_MATRIX = B,
            t.IDENTITY_MATRIX = lt,
            t.OPS = Q,
            t.VERBOSITY_LEVELS = J,
            t.UNSUPPORTED_FEATURES = Z,
            t.AnnotationBorderStyleType = Y,
            t.AnnotationFieldFlag = H,
            t.AnnotationFlag = z,
            t.AnnotationType = X,
            t.FontType = V,
            t.ImageKind = G,
            t.InvalidPDFException = nt,
            t.MessageHandler = F,
            t.MissingDataException = st,
            t.MissingPDFException = it,
            t.NotImplementedException = at,
            t.PageViewport = ut,
            t.PasswordException = tt,
            t.PasswordResponses = $,
            t.StatTimer = pt,
            t.StreamType = q,
            t.TextRenderingMode = W,
            t.UnexpectedResponseException = rt,
            t.UnknownErrorException = et,
            t.Util = ht,
            t.XRefParseException = ot,
            t.arrayByteLength = m,
            t.arraysToBytes = A,
            t.assert = c,
            t.bytesToString = f,
            t.createBlob = ft,
            t.createPromiseCapability = M,
            t.createObjectURL = gt,
            t.deprecated = a,
            t.error = s,
            t.getLookupTableFactory = d,
            t.getVerbosityLevel = n,
            t.globalScope = U,
            t.info = i,
            t.isArray = D,
            t.isArrayBuffer = j,
            t.isBool = P,
            t.isEmptyObj = L,
            t.isInt = E,
            t.isNum = R,
            t.isString = I,
            t.isSpace = O,
            t.isSameOrigin = l,
            t.isValidUrl = h,
            t.isLittleEndian = k,
            t.isEvalSupported = C,
            t.loadJpegStream = N,
            t.log2 = b,
            t.readInt8 = y,
            t.readUint16 = x,
            t.readUint32 = S,
            t.removeNullCharacters = p,
            t.setVerbosityLevel = e,
            t.shadow = u,
            t.string32 = v,
            t.stringToBytes = g,
            t.stringToPDFString = _,
            t.stringToUTF8String = w,
            t.utf8StringToString = T,
            t.warn = r
        }),
        function(t, e) {
            e(t.pdfjsDisplayDOMUtils = {}, t.pdfjsSharedUtil)
        }(this, function(t, e) {
            function n() {
                var t = document.createElement("canvas");
                return t.width = t.height = 1,
                void 0 !== t.getContext("2d").createImageData(1, 1).data.buffer
            }
            function i(t, e) {
                var n = e && e.url;
                if (t.href = t.title = n ? o(n) : "",
                n) {
                    var i = e.target;
                    void 0 === i && (i = a("externalLinkTarget")),
                    t.target = u[i];
                    var r = e.rel;
                    void 0 === r && (r = a("externalLinkRel")),
                    t.rel = r
                }
            }
            function r(t) {
                var e = t.indexOf("#")
                  , n = t.indexOf("?")
                  , i = Math.min(e > 0 ? e : t.length, n > 0 ? n : t.length);
                return t.substring(t.lastIndexOf("/", i) + 1, i)
            }
            function a(t) {
                var n = e.globalScope.PDFJS;
                switch (t) {
                case "pdfBug":
                    return !!n && n.pdfBug;
                case "disableAutoFetch":
                    return !!n && n.disableAutoFetch;
                case "disableStream":
                    return !!n && n.disableStream;
                case "disableRange":
                    return !!n && n.disableRange;
                case "disableFontFace":
                    return !!n && n.disableFontFace;
                case "disableCreateObjectURL":
                    return !!n && n.disableCreateObjectURL;
                case "disableWebGL":
                    return !n || n.disableWebGL;
                case "cMapUrl":
                    return n ? n.cMapUrl : null;
                case "cMapPacked":
                    return !!n && n.cMapPacked;
                case "postMessageTransfers":
                    return !n || n.postMessageTransfers;
                case "workerSrc":
                    return n ? n.workerSrc : null;
                case "disableWorker":
                    return !!n && n.disableWorker;
                case "maxImageSize":
                    return n ? n.maxImageSize : -1;
                case "imageResourcesPath":
                    return n ? n.imageResourcesPath : "";
                case "isEvalSupported":
                    return !n || n.isEvalSupported;
                case "externalLinkTarget":
                    if (!n)
                        return h.NONE;
                    switch (n.externalLinkTarget) {
                    case h.NONE:
                    case h.SELF:
                    case h.BLANK:
                    case h.PARENT:
                    case h.TOP:
                        return n.externalLinkTarget
                    }
                    return c("PDFJS.externalLinkTarget is invalid: " + n.externalLinkTarget),
                    n.externalLinkTarget = h.NONE,
                    h.NONE;
                case "externalLinkRel":
                    return n ? n.externalLinkRel : "noreferrer";
                case "enableStats":
                    return !(!n || !n.enableStats);
                default:
                    throw new Error("Unknown default setting: " + t)
                }
            }
            function s() {
                switch (a("externalLinkTarget")) {
                case h.NONE:
                    return !1;
                case h.SELF:
                case h.BLANK:
                case h.PARENT:
                case h.TOP:
                    return !0
                }
            }
            var o = e.removeNullCharacters
              , c = e.warn
              , l = function() {
                function t() {}
                var e = ["ms", "Moz", "Webkit", "O"]
                  , n = Object.create(null);
                return t.getProp = function(t, i) {
                    if (1 === arguments.length && "string" == typeof n[t])
                        return n[t];
                    i = i || document.documentElement;
                    var r, a, s = i.style;
                    if ("string" == typeof s[t])
                        return n[t] = t;
                    a = t.charAt(0).toUpperCase() + t.slice(1);
                    for (var o = 0, c = e.length; o < c; o++)
                        if (r = e[o] + a,
                        "string" == typeof s[r])
                            return n[t] = r;
                    return n[t] = "undefined"
                }
                ,
                t.setProp = function(t, e, n) {
                    var i = this.getProp(t);
                    "undefined" !== i && (e.style[i] = n)
                }
                ,
                t
            }()
              , h = {
                NONE: 0,
                SELF: 1,
                BLANK: 2,
                PARENT: 3,
                TOP: 4
            }
              , u = ["", "_self", "_blank", "_parent", "_top"];
            t.CustomStyle = l,
            t.addLinkAttributes = i,
            t.isExternalLinkTargetSet = s,
            t.getFilenameFromUrl = r,
            t.LinkTarget = h,
            t.hasCanvasTypedArrays = n,
            t.getDefaultSetting = a
        }),
        function(t, e) {
            e(t.pdfjsDisplayFontLoader = {}, t.pdfjsSharedUtil)
        }(this, function(t, e) {
            function n(t) {
                this.docId = t,
                this.styleElement = null,
                this.nativeFontFaces = [],
                this.loadTestFontId = 0,
                this.loadingContext = {
                    requests: [],
                    nextRequestId: 0
                }
            }
            var i = e.assert
              , r = e.bytesToString
              , a = e.string32
              , s = e.shadow
              , o = e.warn;
            n.prototype = {
                insertRule: function(t) {
                    var e = this.styleElement;
                    e || (e = this.styleElement = document.createElement("style"),
                    e.id = "PDFJS_FONT_STYLE_TAG_" + this.docId,
                    document.documentElement.getElementsByTagName("head")[0].appendChild(e));
                    var n = e.sheet;
                    n.insertRule(t, n.cssRules.length)
                },
                clear: function() {
                    var t = this.styleElement;
                    t && (t.parentNode.removeChild(t),
                    t = this.styleElement = null),
                    this.nativeFontFaces.forEach(function(t) {
                        document.fonts.delete(t)
                    }),
                    this.nativeFontFaces.length = 0
                },
                get loadTestFont() {
                    return s(this, "loadTestFont", atob("T1RUTwALAIAAAwAwQ0ZGIDHtZg4AAAOYAAAAgUZGVE1lkzZwAAAEHAAAABxHREVGABQAFQAABDgAAAAeT1MvMlYNYwkAAAEgAAAAYGNtYXABDQLUAAACNAAAAUJoZWFk/xVFDQAAALwAAAA2aGhlYQdkA+oAAAD0AAAAJGhtdHgD6AAAAAAEWAAAAAZtYXhwAAJQAAAAARgAAAAGbmFtZVjmdH4AAAGAAAAAsXBvc3T/hgAzAAADeAAAACAAAQAAAAEAALZRFsRfDzz1AAsD6AAAAADOBOTLAAAAAM4KHDwAAAAAA+gDIQAAAAgAAgAAAAAAAAABAAADIQAAAFoD6AAAAAAD6AABAAAAAAAAAAAAAAAAAAAAAQAAUAAAAgAAAAQD6AH0AAUAAAKKArwAAACMAooCvAAAAeAAMQECAAACAAYJAAAAAAAAAAAAAQAAAAAAAAAAAAAAAFBmRWQAwAAuAC4DIP84AFoDIQAAAAAAAQAAAAAAAAAAACAAIAABAAAADgCuAAEAAAAAAAAAAQAAAAEAAAAAAAEAAQAAAAEAAAAAAAIAAQAAAAEAAAAAAAMAAQAAAAEAAAAAAAQAAQAAAAEAAAAAAAUAAQAAAAEAAAAAAAYAAQAAAAMAAQQJAAAAAgABAAMAAQQJAAEAAgABAAMAAQQJAAIAAgABAAMAAQQJAAMAAgABAAMAAQQJAAQAAgABAAMAAQQJAAUAAgABAAMAAQQJAAYAAgABWABYAAAAAAAAAwAAAAMAAAAcAAEAAAAAADwAAwABAAAAHAAEACAAAAAEAAQAAQAAAC7//wAAAC7////TAAEAAAAAAAABBgAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAD/gwAyAAAAAQAAAAAAAAAAAAAAAAAAAAABAAQEAAEBAQJYAAEBASH4DwD4GwHEAvgcA/gXBIwMAYuL+nz5tQXkD5j3CBLnEQACAQEBIVhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYAAABAQAADwACAQEEE/t3Dov6fAH6fAT+fPp8+nwHDosMCvm1Cvm1DAz6fBQAAAAAAAABAAAAAMmJbzEAAAAAzgTjFQAAAADOBOQpAAEAAAAAAAAADAAUAAQAAAABAAAAAgABAAAAAAAAAAAD6AAAAAAAAA=="))
                },
                addNativeFontFace: function(t) {
                    this.nativeFontFaces.push(t),
                    document.fonts.add(t)
                },
                bind: function(t, e) {
                    for (var i = [], r = [], a = [], s = function(t) {
                        return t.loaded.catch(function(e) {
                            o('Failed to load font "' + t.family + '": ' + e)
                        })
                    }, c = 0, l = t.length; c < l; c++) {
                        var h = t[c];
                        if (!h.attached && h.loading !== !1)
                            if (h.attached = !0,
                            n.isFontLoadingAPISupported) {
                                var u = h.createNativeFontFace();
                                u && (this.addNativeFontFace(u),
                                a.push(s(u)))
                            } else {
                                var d = h.createFontFaceRule();
                                d && (this.insertRule(d),
                                i.push(d),
                                r.push(h))
                            }
                    }
                    var p = this.queueLoadingCallback(e);
                    n.isFontLoadingAPISupported ? Promise.all(a).then(function() {
                        p.complete()
                    }) : i.length > 0 && !n.isSyncFontLoadingSupported ? this.prepareFontLoadEvent(i, r, p) : p.complete()
                },
                queueLoadingCallback: function(t) {
                    function e() {
                        for (i(!a.end, "completeRequest() cannot be called twice"),
                        a.end = Date.now(); n.requests.length > 0 && n.requests[0].end; ) {
                            var t = n.requests.shift();
                            setTimeout(t.callback, 0)
                        }
                    }
                    var n = this.loadingContext
                      , r = "pdfjs-font-loading-" + n.nextRequestId++
                      , a = {
                        id: r,
                        complete: e,
                        callback: t,
                        started: Date.now()
                    };
                    return n.requests.push(a),
                    a
                },
                prepareFontLoadEvent: function(t, e, n) {
                    function i(t, e) {
                        return t.charCodeAt(e) << 24 | t.charCodeAt(e + 1) << 16 | t.charCodeAt(e + 2) << 8 | 255 & t.charCodeAt(e + 3)
                    }
                    function r(t, e, n, i) {
                        return t.substr(0, e) + i + t.substr(e + n)
                    }
                    function s(t, e) {
                        return ++d > 30 ? (o("Load test font never loaded."),
                        void e()) : (u.font = "30px " + t,
                        u.fillText(".", 0, 20),
                        u.getImageData(0, 0, 1, 1).data[3] > 0 ? void e() : void setTimeout(s.bind(null, t, e)))
                    }
                    var c, l, h = document.createElement("canvas");
                    h.width = 1,
                    h.height = 1;
                    var u = h.getContext("2d")
                      , d = 0
                      , p = "lt" + Date.now() + this.loadTestFontId++
                      , f = this.loadTestFont;
                    f = r(f, 976, p.length, p);
                    var g = i(f, 16);
                    for (c = 0,
                    l = p.length - 3; c < l; c += 4)
                        g = g - 1482184792 + i(p, c) | 0;
                    c < p.length && (g = g - 1482184792 + i(p + "XXX", c) | 0),
                    f = r(f, 16, 4, a(g));
                    var m = "url(data:font/opentype;base64," + btoa(f) + ");"
                      , A = '@font-face { font-family:"' + p + '";src:' + m + "}";
                    this.insertRule(A);
                    var v = [];
                    for (c = 0,
                    l = e.length; c < l; c++)
                        v.push(e[c].loadedName);
                    v.push(p);
                    var b = document.createElement("div");
                    for (b.setAttribute("style", "visibility: hidden;width: 10px; height: 10px;position: absolute; top: 0px; left: 0px;"),
                    c = 0,
                    l = v.length; c < l; ++c) {
                        var y = document.createElement("span");
                        y.textContent = "Hi",
                        y.style.fontFamily = v[c],
                        b.appendChild(y)
                    }
                    document.body.appendChild(b),
                    s(p, function() {
                        document.body.removeChild(b),
                        n.complete()
                    })
                }
            },
            n.isFontLoadingAPISupported = "undefined" != typeof document && !!document.fonts,
            Object.defineProperty(n, "isSyncFontLoadingSupported", {
                get: function() {
                    if ("undefined" == typeof navigator)
                        return s(n, "isSyncFontLoadingSupported", !0);
                    var t = !1
                      , e = /Mozilla\/5.0.*?rv:(\d+).*? Gecko/.exec(navigator.userAgent);
                    return e && e[1] >= 14 && (t = !0),
                    s(n, "isSyncFontLoadingSupported", t)
                },
                enumerable: !0,
                configurable: !0
            });
            var c = {
                get value() {
                    return s(this, "value", e.isEvalSupported())
                }
            }
              , l = function() {
                function t(t, e) {
                    this.compiledGlyphs = Object.create(null);
                    for (var n in t)
                        this[n] = t[n];
                    this.options = e
                }
                return t.prototype = {
                    createNativeFontFace: function() {
                        if (!this.data)
                            return null;
                        if (this.options.disableFontFace)
                            return this.disableFontFace = !0,
                            null;
                        var t = new FontFace(this.loadedName,this.data,{});
                        return this.options.fontRegistry && this.options.fontRegistry.registerFont(this),
                        t
                    },
                    createFontFaceRule: function() {
                        if (!this.data)
                            return null;
                        if (this.options.disableFontFace)
                            return this.disableFontFace = !0,
                            null;
                        var t = r(new Uint8Array(this.data))
                          , e = this.loadedName
                          , n = "url(data:" + this.mimetype + ";base64," + btoa(t) + ");"
                          , i = '@font-face { font-family:"' + e + '";src:' + n + "}";
                        return this.options.fontRegistry && this.options.fontRegistry.registerFont(this, n),
                        i
                    },
                    getPathGenerator: function(t, e) {
                        if (!(e in this.compiledGlyphs)) {
                            var n, i, r, a = t.get(this.loadedName + "_path_" + e);
                            if (this.options.isEvalSupported && c.value) {
                                var s, o = "";
                                for (i = 0,
                                r = a.length; i < r; i++)
                                    n = a[i],
                                    s = void 0 !== n.args ? n.args.join(",") : "",
                                    o += "c." + n.cmd + "(" + s + ");\n";
                                this.compiledGlyphs[e] = new Function("c","size",o)
                            } else
                                this.compiledGlyphs[e] = function(t, e) {
                                    for (i = 0,
                                    r = a.length; i < r; i++)
                                        n = a[i],
                                        "scale" === n.cmd && (n.args = [e, -e]),
                                        t[n.cmd].apply(t, n.args)
                                }
                        }
                        return this.compiledGlyphs[e]
                    }
                },
                t
            }();
            t.FontFaceObject = l,
            t.FontLoader = n
        }),
        function(t, e) {
            e(t.pdfjsDisplayMetadata = {}, t.pdfjsSharedUtil)
        }(this, function(t, e) {
            function n(t) {
                return t.replace(/>\\376\\377([^<]+)/g, function(t, e) {
                    for (var n = e.replace(/\\([0-3])([0-7])([0-7])/g, function(t, e, n, i) {
                        return String.fromCharCode(64 * e + 8 * n + 1 * i)
                    }), i = "", r = 0; r < n.length; r += 2) {
                        var a = 256 * n.charCodeAt(r) + n.charCodeAt(r + 1);
                        i += "&#x" + (65536 + a).toString(16).substring(1) + ";"
                    }
                    return ">" + i
                })
            }
            function i(t) {
                if ("string" == typeof t) {
                    t = n(t);
                    t = (new DOMParser).parseFromString(t, "application/xml")
                } else
                    t instanceof Document || r("Metadata: Invalid metadata object");
                this.metaDocument = t,
                this.metadata = Object.create(null),
                this.parse()
            }
            var r = e.error;
            i.prototype = {
                parse: function() {
                    var t = this.metaDocument
                      , e = t.documentElement;
                    if ("rdf:rdf" !== e.nodeName.toLowerCase())
                        for (e = e.firstChild; e && "rdf:rdf" !== e.nodeName.toLowerCase(); )
                            e = e.nextSibling;
                    var n = e ? e.nodeName.toLowerCase() : null;
                    if (e && "rdf:rdf" === n && e.hasChildNodes()) {
                        var i, r, a, s, o, c, l, h = e.childNodes;
                        for (s = 0,
                        c = h.length; s < c; s++)
                            if (i = h[s],
                            "rdf:description" === i.nodeName.toLowerCase())
                                for (o = 0,
                                l = i.childNodes.length; o < l; o++)
                                    "#text" !== i.childNodes[o].nodeName.toLowerCase() && (r = i.childNodes[o],
                                    a = r.nodeName.toLowerCase(),
                                    this.metadata[a] = r.textContent.trim())
                    }
                },
                get: function(t) {
                    return this.metadata[t] || null
                },
                has: function(t) {
                    return void 0 !== this.metadata[t]
                }
            },
            t.Metadata = i
        }),
        function(t, e) {
            e(t.pdfjsDisplaySVG = {}, t.pdfjsSharedUtil)
        }(this, function(t, e) {
            var n = e.FONT_IDENTITY_MATRIX
              , i = e.IDENTITY_MATRIX
              , r = e.ImageKind
              , a = e.OPS
              , s = e.Util
              , o = e.isNum
              , c = e.isArray
              , l = e.warn
              , h = e.createObjectURL
              , u = {
                fontStyle: "normal",
                fontWeight: "normal",
                fillColor: "#000000"
            }
              , d = function() {
                function t(t, e, n) {
                    for (var i = -1, r = e; r < n; r++) {
                        i = i >>> 8 ^ s[255 & (i ^ t[r])]
                    }
                    return i ^ -1
                }
                function e(e, n, i, r) {
                    var a = r
                      , s = n.length;
                    i[a] = s >> 24 & 255,
                    i[a + 1] = s >> 16 & 255,
                    i[a + 2] = s >> 8 & 255,
                    i[a + 3] = 255 & s,
                    a += 4,
                    i[a] = 255 & e.charCodeAt(0),
                    i[a + 1] = 255 & e.charCodeAt(1),
                    i[a + 2] = 255 & e.charCodeAt(2),
                    i[a + 3] = 255 & e.charCodeAt(3),
                    a += 4,
                    i.set(n, a),
                    a += n.length;
                    var o = t(i, r + 4, a);
                    i[a] = o >> 24 & 255,
                    i[a + 1] = o >> 16 & 255,
                    i[a + 2] = o >> 8 & 255,
                    i[a + 3] = 255 & o
                }
                function n(t, e, n) {
                    for (var i = 1, r = 0, a = e; a < n; ++a)
                        i = (i + (255 & t[a])) % 65521,
                        r = (r + i) % 65521;
                    return r << 16 | i
                }
                function i(t, i, s) {
                    var o, c, l, u = t.width, d = t.height, p = t.data;
                    switch (i) {
                    case r.GRAYSCALE_1BPP:
                        c = 0,
                        o = 1,
                        l = u + 7 >> 3;
                        break;
                    case r.RGB_24BPP:
                        c = 2,
                        o = 8,
                        l = 3 * u;
                        break;
                    case r.RGBA_32BPP:
                        c = 6,
                        o = 8,
                        l = 4 * u;
                        break;
                    default:
                        throw new Error("invalid format")
                    }
                    var f, g, m = new Uint8Array((1 + l) * d), A = 0, v = 0;
                    for (f = 0; f < d; ++f)
                        m[A++] = 0,
                        m.set(p.subarray(v, v + l), A),
                        v += l,
                        A += l;
                    if (i === r.GRAYSCALE_1BPP)
                        for (A = 0,
                        f = 0; f < d; f++)
                            for (A++,
                            g = 0; g < l; g++)
                                m[A++] ^= 255;
                    var b = new Uint8Array([u >> 24 & 255, u >> 16 & 255, u >> 8 & 255, 255 & u, d >> 24 & 255, d >> 16 & 255, d >> 8 & 255, 255 & d, o, c, 0, 0, 0])
                      , y = m.length
                      , x = Math.ceil(y / 65535)
                      , S = new Uint8Array(2 + y + 5 * x + 4)
                      , k = 0;
                    S[k++] = 120,
                    S[k++] = 156;
                    for (var C = 0; y > 65535; )
                        S[k++] = 0,
                        S[k++] = 255,
                        S[k++] = 255,
                        S[k++] = 0,
                        S[k++] = 0,
                        S.set(m.subarray(C, C + 65535), k),
                        k += 65535,
                        C += 65535,
                        y -= 65535;
                    S[k++] = 1,
                    S[k++] = 255 & y,
                    S[k++] = y >> 8 & 255,
                    S[k++] = 255 & ~y,
                    S[k++] = (65535 & ~y) >> 8 & 255,
                    S.set(m.subarray(C), k),
                    k += m.length - C;
                    var _ = n(m, 0, m.length);
                    S[k++] = _ >> 24 & 255,
                    S[k++] = _ >> 16 & 255,
                    S[k++] = _ >> 8 & 255,
                    S[k++] = 255 & _;
                    var w = a.length + 36 + b.length + S.length
                      , T = new Uint8Array(w)
                      , L = 0;
                    return T.set(a, L),
                    L += a.length,
                    e("IHDR", b, T, L),
                    L += 12 + b.length,
                    e("IDATA", S, T, L),
                    L += 12 + S.length,
                    e("IEND", new Uint8Array(0), T, L),
                    h(T, "image/png", s)
                }
                for (var a = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), s = new Int32Array(256), o = 0; o < 256; o++) {
                    for (var c = o, l = 0; l < 8; l++)
                        c = 1 & c ? 3988292384 ^ c >> 1 & 2147483647 : c >> 1 & 2147483647;
                    s[o] = c
                }
                return function(t, e) {
                    return i(t, void 0 === t.kind ? r.GRAYSCALE_1BPP : t.kind, e)
                }
            }()
              , p = function() {
                function t() {
                    this.fontSizeScale = 1,
                    this.fontWeight = u.fontWeight,
                    this.fontSize = 0,
                    this.textMatrix = i,
                    this.fontMatrix = n,
                    this.leading = 0,
                    this.x = 0,
                    this.y = 0,
                    this.lineX = 0,
                    this.lineY = 0,
                    this.charSpacing = 0,
                    this.wordSpacing = 0,
                    this.textHScale = 1,
                    this.textRise = 0,
                    this.fillColor = u.fillColor,
                    this.strokeColor = "#000000",
                    this.fillAlpha = 1,
                    this.strokeAlpha = 1,
                    this.lineWidth = 1,
                    this.lineJoin = "",
                    this.lineCap = "",
                    this.miterLimit = 0,
                    this.dashArray = [],
                    this.dashPhase = 0,
                    this.dependencies = [],
                    this.clipId = "",
                    this.pendingClip = !1,
                    this.maskId = ""
                }
                return t.prototype = {
                    clone: function() {
                        return Object.create(this)
                    },
                    setCurrentPoint: function(t, e) {
                        this.x = t,
                        this.y = e
                    }
                },
                t
            }()
              , f = function() {
                function t(t, e) {
                    var n = document.createElementNS("http://www.w3.org/2000/svg", "svg:svg");
                    return n.setAttributeNS(null, "version", "1.1"),
                    n.setAttributeNS(null, "width", t + "px"),
                    n.setAttributeNS(null, "height", e + "px"),
                    n.setAttributeNS(null, "viewBox", "0 0 " + t + " " + e),
                    n
                }
                function e(t) {
                    for (var e = [], n = [], i = t.length, r = 0; r < i; r++)
                        "save" !== t[r].fn ? "restore" === t[r].fn ? e = n.pop() : e.push(t[r]) : (e.push({
                            fnId: 92,
                            fn: "group",
                            items: []
                        }),
                        n.push(e),
                        e = e[e.length - 1].items);
                    return e
                }
                function r(t) {
                    if (t === (0 | t))
                        return t.toString();
                    var e = t.toFixed(10)
                      , n = e.length - 1;
                    if ("0" !== e[n])
                        return e;
                    do
                        n--;
                    while ("0" === e[n]);
                    return e.substr(0, "." === e[n] ? n : n + 1)
                }
                function f(t) {
                    if (0 === t[4] && 0 === t[5]) {
                        if (0 === t[1] && 0 === t[2])
                            return 1 === t[0] && 1 === t[3] ? "" : "scale(" + r(t[0]) + " " + r(t[3]) + ")";
                        if (t[0] === t[3] && t[1] === -t[2]) {
                            return "rotate(" + r(180 * Math.acos(t[0]) / Math.PI) + ")"
                        }
                    } else if (1 === t[0] && 0 === t[1] && 0 === t[2] && 1 === t[3])
                        return "translate(" + r(t[4]) + " " + r(t[5]) + ")";
                    return "matrix(" + r(t[0]) + " " + r(t[1]) + " " + r(t[2]) + " " + r(t[3]) + " " + r(t[4]) + " " + r(t[5]) + ")"
                }
                function g(t, e, n) {
                    this.current = new p,
                    this.transformMatrix = i,
                    this.transformStack = [],
                    this.extraStack = [],
                    this.commonObjs = t,
                    this.objs = e,
                    this.pendingEOFill = !1,
                    this.embedFonts = !1,
                    this.embeddedFonts = Object.create(null),
                    this.cssStyle = null,
                    this.forceDataSchema = !!n
                }
                var m = "http://www.w3.org/2000/svg"
                  , A = "http://www.w3.org/1999/xlink"
                  , v = ["butt", "round", "square"]
                  , b = ["miter", "round", "bevel"]
                  , y = 0
                  , x = 0;
                return g.prototype = {
                    save: function() {
                        this.transformStack.push(this.transformMatrix);
                        var t = this.current;
                        this.extraStack.push(t),
                        this.current = t.clone()
                    },
                    restore: function() {
                        this.transformMatrix = this.transformStack.pop(),
                        this.current = this.extraStack.pop(),
                        this.tgrp = document.createElementNS(m, "svg:g"),
                        this.tgrp.setAttributeNS(null, "transform", f(this.transformMatrix)),
                        this.pgrp.appendChild(this.tgrp)
                    },
                    group: function(t) {
                        this.save(),
                        this.executeOpTree(t),
                        this.restore()
                    },
                    loadDependencies: function(t) {
                        for (var e = t.fnArray, n = e.length, i = t.argsArray, r = this, s = 0; s < n; s++)
                            if (a.dependency === e[s])
                                for (var o = i[s], c = 0, l = o.length; c < l; c++) {
                                    var h, u = o[c], d = "g_" === u.substring(0, 2);
                                    h = d ? new Promise(function(t) {
                                        r.commonObjs.get(u, t)
                                    }
                                    ) : new Promise(function(t) {
                                        r.objs.get(u, t)
                                    }
                                    ),
                                    this.current.dependencies.push(h)
                                }
                        return Promise.all(this.current.dependencies)
                    },
                    transform: function(t, e, n, i, r, a) {
                        var o = [t, e, n, i, r, a];
                        this.transformMatrix = s.transform(this.transformMatrix, o),
                        this.tgrp = document.createElementNS(m, "svg:g"),
                        this.tgrp.setAttributeNS(null, "transform", f(this.transformMatrix))
                    },
                    getSVG: function(e, n) {
                        return this.svg = t(n.width, n.height),
                        this.viewport = n,
                        this.loadDependencies(e).then(function() {
                            this.transformMatrix = i,
                            this.pgrp = document.createElementNS(m, "svg:g"),
                            this.pgrp.setAttributeNS(null, "transform", f(n.transform)),
                            this.tgrp = document.createElementNS(m, "svg:g"),
                            this.tgrp.setAttributeNS(null, "transform", f(this.transformMatrix)),
                            this.defs = document.createElementNS(m, "svg:defs"),
                            this.pgrp.appendChild(this.defs),
                            this.pgrp.appendChild(this.tgrp),
                            this.svg.appendChild(this.pgrp);
                            var t = this.convertOpList(e);
                            return this.executeOpTree(t),
                            this.svg
                        }
                        .bind(this))
                    },
                    convertOpList: function(t) {
                        var n = t.argsArray
                          , i = t.fnArray
                          , r = i.length
                          , s = []
                          , o = [];
                        for (var c in a)
                            s[a[c]] = c;
                        for (var l = 0; l < r; l++) {
                            var h = i[l];
                            o.push({
                                fnId: h,
                                fn: s[h],
                                args: n[l]
                            })
                        }
                        return e(o)
                    },
                    executeOpTree: function(t) {
                        for (var e = t.length, n = 0; n < e; n++) {
                            var i = t[n].fn
                              , r = t[n].fnId
                              , s = t[n].args;
                            switch (0 | r) {
                            case a.beginText:
                                this.beginText();
                                break;
                            case a.setLeading:
                                this.setLeading(s);
                                break;
                            case a.setLeadingMoveText:
                                this.setLeadingMoveText(s[0], s[1]);
                                break;
                            case a.setFont:
                                this.setFont(s);
                                break;
                            case a.showText:
                                this.showText(s[0]);
                                break;
                            case a.showSpacedText:
                                this.showText(s[0]);
                                break;
                            case a.endText:
                                this.endText();
                                break;
                            case a.moveText:
                                this.moveText(s[0], s[1]);
                                break;
                            case a.setCharSpacing:
                                this.setCharSpacing(s[0]);
                                break;
                            case a.setWordSpacing:
                                this.setWordSpacing(s[0]);
                                break;
                            case a.setHScale:
                                this.setHScale(s[0]);
                                break;
                            case a.setTextMatrix:
                                this.setTextMatrix(s[0], s[1], s[2], s[3], s[4], s[5]);
                                break;
                            case a.setLineWidth:
                                this.setLineWidth(s[0]);
                                break;
                            case a.setLineJoin:
                                this.setLineJoin(s[0]);
                                break;
                            case a.setLineCap:
                                this.setLineCap(s[0]);
                                break;
                            case a.setMiterLimit:
                                this.setMiterLimit(s[0]);
                                break;
                            case a.setFillRGBColor:
                                this.setFillRGBColor(s[0], s[1], s[2]);
                                break;
                            case a.setStrokeRGBColor:
                                this.setStrokeRGBColor(s[0], s[1], s[2]);
                                break;
                            case a.setDash:
                                this.setDash(s[0], s[1]);
                                break;
                            case a.setGState:
                                this.setGState(s[0]);
                                break;
                            case a.fill:
                                this.fill();
                                break;
                            case a.eoFill:
                                this.eoFill();
                                break;
                            case a.stroke:
                                this.stroke();
                                break;
                            case a.fillStroke:
                                this.fillStroke();
                                break;
                            case a.eoFillStroke:
                                this.eoFillStroke();
                                break;
                            case a.clip:
                                this.clip("nonzero");
                                break;
                            case a.eoClip:
                                this.clip("evenodd");
                                break;
                            case a.paintSolidColorImageMask:
                                this.paintSolidColorImageMask();
                                break;
                            case a.paintJpegXObject:
                                this.paintJpegXObject(s[0], s[1], s[2]);
                                break;
                            case a.paintImageXObject:
                                this.paintImageXObject(s[0]);
                                break;
                            case a.paintInlineImageXObject:
                                this.paintInlineImageXObject(s[0]);
                                break;
                            case a.paintImageMaskXObject:
                                this.paintImageMaskXObject(s[0]);
                                break;
                            case a.paintFormXObjectBegin:
                                this.paintFormXObjectBegin(s[0], s[1]);
                                break;
                            case a.paintFormXObjectEnd:
                                this.paintFormXObjectEnd();
                                break;
                            case a.closePath:
                                this.closePath();
                                break;
                            case a.closeStroke:
                                this.closeStroke();
                                break;
                            case a.closeFillStroke:
                                this.closeFillStroke();
                                break;
                            case a.nextLine:
                                this.nextLine();
                                break;
                            case a.transform:
                                this.transform(s[0], s[1], s[2], s[3], s[4], s[5]);
                                break;
                            case a.constructPath:
                                this.constructPath(s[0], s[1]);
                                break;
                            case a.endPath:
                                this.endPath();
                                break;
                            case 92:
                                this.group(t[n].items);
                                break;
                            default:
                                l("Unimplemented method " + i)
                            }
                        }
                    },
                    setWordSpacing: function(t) {
                        this.current.wordSpacing = t
                    },
                    setCharSpacing: function(t) {
                        this.current.charSpacing = t
                    },
                    nextLine: function() {
                        this.moveText(0, this.current.leading)
                    },
                    setTextMatrix: function(t, e, n, i, a, s) {
                        var o = this.current;
                        this.current.textMatrix = this.current.lineMatrix = [t, e, n, i, a, s],
                        this.current.x = this.current.lineX = 0,
                        this.current.y = this.current.lineY = 0,
                        o.xcoords = [],
                        o.tspan = document.createElementNS(m, "svg:tspan"),
                        o.tspan.setAttributeNS(null, "font-family", o.fontFamily),
                        o.tspan.setAttributeNS(null, "font-size", r(o.fontSize) + "px"),
                        o.tspan.setAttributeNS(null, "y", r(-o.y)),
                        o.txtElement = document.createElementNS(m, "svg:text"),
                        o.txtElement.appendChild(o.tspan)
                    },
                    beginText: function() {
                        this.current.x = this.current.lineX = 0,
                        this.current.y = this.current.lineY = 0,
                        this.current.textMatrix = i,
                        this.current.lineMatrix = i,
                        this.current.tspan = document.createElementNS(m, "svg:tspan"),
                        this.current.txtElement = document.createElementNS(m, "svg:text"),
                        this.current.txtgrp = document.createElementNS(m, "svg:g"),
                        this.current.xcoords = []
                    },
                    moveText: function(t, e) {
                        var n = this.current;
                        this.current.x = this.current.lineX += t,
                        this.current.y = this.current.lineY += e,
                        n.xcoords = [],
                        n.tspan = document.createElementNS(m, "svg:tspan"),
                        n.tspan.setAttributeNS(null, "font-family", n.fontFamily),
                        n.tspan.setAttributeNS(null, "font-size", r(n.fontSize) + "px"),
                        n.tspan.setAttributeNS(null, "y", r(-n.y))
                    },
                    showText: function(t) {
                        var e = this.current
                          , n = e.font
                          , i = e.fontSize;
                        if (0 !== i) {
                            var a, s = e.charSpacing, c = e.wordSpacing, l = e.fontDirection, h = e.textHScale * l, d = t.length, p = n.vertical, g = i * e.fontMatrix[0], m = 0;
                            for (a = 0; a < d; ++a) {
                                var A = t[a];
                                if (null !== A)
                                    if (o(A))
                                        m += -A * i * .001;
                                    else {
                                        e.xcoords.push(e.x + m * h);
                                        var v = A.width
                                          , b = A.fontChar
                                          , y = v * g + s * l;
                                        m += y,
                                        e.tspan.textContent += b
                                    }
                                else
                                    m += l * c
                            }
                            p ? e.y -= m * h : e.x += m * h,
                            e.tspan.setAttributeNS(null, "x", e.xcoords.map(r).join(" ")),
                            e.tspan.setAttributeNS(null, "y", r(-e.y)),
                            e.tspan.setAttributeNS(null, "font-family", e.fontFamily),
                            e.tspan.setAttributeNS(null, "font-size", r(e.fontSize) + "px"),
                            e.fontStyle !== u.fontStyle && e.tspan.setAttributeNS(null, "font-style", e.fontStyle),
                            e.fontWeight !== u.fontWeight && e.tspan.setAttributeNS(null, "font-weight", e.fontWeight),
                            e.fillColor !== u.fillColor && e.tspan.setAttributeNS(null, "fill", e.fillColor),
                            e.txtElement.setAttributeNS(null, "transform", f(e.textMatrix) + " scale(1, -1)"),
                            e.txtElement.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve"),
                            e.txtElement.appendChild(e.tspan),
                            e.txtgrp.appendChild(e.txtElement),
                            this.tgrp.appendChild(e.txtElement)
                        }
                    },
                    setLeadingMoveText: function(t, e) {
                        this.setLeading(-e),
                        this.moveText(t, e)
                    },
                    addFontStyle: function(t) {
                        this.cssStyle || (this.cssStyle = document.createElementNS(m, "svg:style"),
                        this.cssStyle.setAttributeNS(null, "type", "text/css"),
                        this.defs.appendChild(this.cssStyle));
                        var e = h(t.data, t.mimetype, this.forceDataSchema);
                        this.cssStyle.textContent += '@font-face { font-family: "' + t.loadedName + '"; src: url(' + e + "); }\n"
                    },
                    setFont: function(t) {
                        var e = this.current
                          , i = this.commonObjs.get(t[0])
                          , a = t[1];
                        this.current.font = i,
                        this.embedFonts && i.data && !this.embeddedFonts[i.loadedName] && (this.addFontStyle(i),
                        this.embeddedFonts[i.loadedName] = i),
                        e.fontMatrix = i.fontMatrix ? i.fontMatrix : n;
                        var s = i.black ? i.bold ? "bolder" : "bold" : i.bold ? "bold" : "normal"
                          , o = i.italic ? "italic" : "normal";
                        a < 0 ? (a = -a,
                        e.fontDirection = -1) : e.fontDirection = 1,
                        e.fontSize = a,
                        e.fontFamily = i.loadedName,
                        e.fontWeight = s,
                        e.fontStyle = o,
                        e.tspan = document.createElementNS(m, "svg:tspan"),
                        e.tspan.setAttributeNS(null, "y", r(-e.y)),
                        e.xcoords = []
                    },
                    endText: function() {
                        this.current.pendingClip ? (this.cgrp.appendChild(this.tgrp),
                        this.pgrp.appendChild(this.cgrp)) : this.pgrp.appendChild(this.tgrp),
                        this.tgrp = document.createElementNS(m, "svg:g"),
                        this.tgrp.setAttributeNS(null, "transform", f(this.transformMatrix))
                    },
                    setLineWidth: function(t) {
                        this.current.lineWidth = t
                    },
                    setLineCap: function(t) {
                        this.current.lineCap = v[t]
                    },
                    setLineJoin: function(t) {
                        this.current.lineJoin = b[t]
                    },
                    setMiterLimit: function(t) {
                        this.current.miterLimit = t
                    },
                    setStrokeRGBColor: function(t, e, n) {
                        var i = s.makeCssRgb(t, e, n);
                        this.current.strokeColor = i
                    },
                    setFillRGBColor: function(t, e, n) {
                        var i = s.makeCssRgb(t, e, n);
                        this.current.fillColor = i,
                        this.current.tspan = document.createElementNS(m, "svg:tspan"),
                        this.current.xcoords = []
                    },
                    setDash: function(t, e) {
                        this.current.dashArray = t,
                        this.current.dashPhase = e
                    },
                    constructPath: function(t, e) {
                        var n = this.current
                          , i = n.x
                          , s = n.y;
                        n.path = document.createElementNS(m, "svg:path");
                        for (var o = [], c = t.length, l = 0, h = 0; l < c; l++)
                            switch (0 | t[l]) {
                            case a.rectangle:
                                i = e[h++],
                                s = e[h++];
                                var u = e[h++]
                                  , d = e[h++]
                                  , p = i + u
                                  , f = s + d;
                                o.push("M", r(i), r(s), "L", r(p), r(s), "L", r(p), r(f), "L", r(i), r(f), "Z");
                                break;
                            case a.moveTo:
                                i = e[h++],
                                s = e[h++],
                                o.push("M", r(i), r(s));
                                break;
                            case a.lineTo:
                                i = e[h++],
                                s = e[h++],
                                o.push("L", r(i), r(s));
                                break;
                            case a.curveTo:
                                i = e[h + 4],
                                s = e[h + 5],
                                o.push("C", r(e[h]), r(e[h + 1]), r(e[h + 2]), r(e[h + 3]), r(i), r(s)),
                                h += 6;
                                break;
                            case a.curveTo2:
                                i = e[h + 2],
                                s = e[h + 3],
                                o.push("C", r(i), r(s), r(e[h]), r(e[h + 1]), r(e[h + 2]), r(e[h + 3])),
                                h += 4;
                                break;
                            case a.curveTo3:
                                i = e[h + 2],
                                s = e[h + 3],
                                o.push("C", r(e[h]), r(e[h + 1]), r(i), r(s), r(i), r(s)),
                                h += 4;
                                break;
                            case a.closePath:
                                o.push("Z")
                            }
                        n.path.setAttributeNS(null, "d", o.join(" ")),
                        n.path.setAttributeNS(null, "stroke-miterlimit", r(n.miterLimit)),
                        n.path.setAttributeNS(null, "stroke-linecap", n.lineCap),
                        n.path.setAttributeNS(null, "stroke-linejoin", n.lineJoin),
                        n.path.setAttributeNS(null, "stroke-width", r(n.lineWidth) + "px"),
                        n.path.setAttributeNS(null, "stroke-dasharray", n.dashArray.map(r).join(" ")),
                        n.path.setAttributeNS(null, "stroke-dashoffset", r(n.dashPhase) + "px"),
                        n.path.setAttributeNS(null, "fill", "none"),
                        this.tgrp.appendChild(n.path),
                        n.pendingClip ? (this.cgrp.appendChild(this.tgrp),
                        this.pgrp.appendChild(this.cgrp)) : this.pgrp.appendChild(this.tgrp),
                        n.element = n.path,
                        n.setCurrentPoint(i, s)
                    },
                    endPath: function() {
                        this.current.pendingClip ? (this.cgrp.appendChild(this.tgrp),
                        this.pgrp.appendChild(this.cgrp)) : this.pgrp.appendChild(this.tgrp),
                        this.tgrp = document.createElementNS(m, "svg:g"),
                        this.tgrp.setAttributeNS(null, "transform", f(this.transformMatrix))
                    },
                    clip: function(t) {
                        var e = this.current;
                        e.clipId = "clippath" + y,
                        y++,
                        this.clippath = document.createElementNS(m, "svg:clipPath"),
                        this.clippath.setAttributeNS(null, "id", e.clipId);
                        var n = e.element.cloneNode();
                        "evenodd" === t ? n.setAttributeNS(null, "clip-rule", "evenodd") : n.setAttributeNS(null, "clip-rule", "nonzero"),
                        this.clippath.setAttributeNS(null, "transform", f(this.transformMatrix)),
                        this.clippath.appendChild(n),
                        this.defs.appendChild(this.clippath),
                        e.pendingClip = !0,
                        this.cgrp = document.createElementNS(m, "svg:g"),
                        this.cgrp.setAttributeNS(null, "clip-path", "url(#" + e.clipId + ")"),
                        this.pgrp.appendChild(this.cgrp)
                    },
                    closePath: function() {
                        var t = this.current
                          , e = t.path.getAttributeNS(null, "d");
                        e += "Z",
                        t.path.setAttributeNS(null, "d", e)
                    },
                    setLeading: function(t) {
                        this.current.leading = -t
                    },
                    setTextRise: function(t) {
                        this.current.textRise = t
                    },
                    setHScale: function(t) {
                        this.current.textHScale = t / 100
                    },
                    setGState: function(t) {
                        for (var e = 0, n = t.length; e < n; e++) {
                            var i = t[e]
                              , r = i[0]
                              , a = i[1];
                            switch (r) {
                            case "LW":
                                this.setLineWidth(a);
                                break;
                            case "LC":
                                this.setLineCap(a);
                                break;
                            case "LJ":
                                this.setLineJoin(a);
                                break;
                            case "ML":
                                this.setMiterLimit(a);
                                break;
                            case "D":
                                this.setDash(a[0], a[1]);
                                break;
                            case "RI":
                                break;
                            case "FL":
                                break;
                            case "Font":
                                this.setFont(a);
                                break;
                            case "CA":
                                break;
                            case "ca":
                                break;
                            case "BM":
                                break;
                            case "SMask":
                            }
                        }
                    },
                    fill: function() {
                        var t = this.current;
                        t.element.setAttributeNS(null, "fill", t.fillColor)
                    },
                    stroke: function() {
                        var t = this.current;
                        t.element.setAttributeNS(null, "stroke", t.strokeColor),
                        t.element.setAttributeNS(null, "fill", "none")
                    },
                    eoFill: function() {
                        var t = this.current;
                        t.element.setAttributeNS(null, "fill", t.fillColor),
                        t.element.setAttributeNS(null, "fill-rule", "evenodd")
                    },
                    fillStroke: function() {
                        this.stroke(),
                        this.fill()
                    },
                    eoFillStroke: function() {
                        this.current.element.setAttributeNS(null, "fill-rule", "evenodd"),
                        this.fillStroke()
                    },
                    closeStroke: function() {
                        this.closePath(),
                        this.stroke()
                    },
                    closeFillStroke: function() {
                        this.closePath(),
                        this.fillStroke()
                    },
                    paintSolidColorImageMask: function() {
                        var t = this.current
                          , e = document.createElementNS(m, "svg:rect");
                        e.setAttributeNS(null, "x", "0"),
                        e.setAttributeNS(null, "y", "0"),
                        e.setAttributeNS(null, "width", "1px"),
                        e.setAttributeNS(null, "height", "1px"),
                        e.setAttributeNS(null, "fill", t.fillColor),
                        this.tgrp.appendChild(e)
                    },
                    paintJpegXObject: function(t, e, n) {
                        var i = this.current
                          , a = this.objs.get(t)
                          , s = document.createElementNS(m, "svg:image");
                        s.setAttributeNS(A, "xlink:href", a.src),
                        s.setAttributeNS(null, "width", a.width + "px"),
                        s.setAttributeNS(null, "height", a.height + "px"),
                        s.setAttributeNS(null, "x", "0"),
                        s.setAttributeNS(null, "y", r(-n)),
                        s.setAttributeNS(null, "transform", "scale(" + r(1 / e) + " " + r(-1 / n) + ")"),
                        this.tgrp.appendChild(s),
                        i.pendingClip ? (this.cgrp.appendChild(this.tgrp),
                        this.pgrp.appendChild(this.cgrp)) : this.pgrp.appendChild(this.tgrp)
                    },
                    paintImageXObject: function(t) {
                        var e = this.objs.get(t);
                        if (!e)
                            return void l("Dependent image isn't ready yet");
                        this.paintInlineImageXObject(e)
                    },
                    paintInlineImageXObject: function(t, e) {
                        var n = this.current
                          , i = t.width
                          , a = t.height
                          , s = d(t, this.forceDataSchema)
                          , o = document.createElementNS(m, "svg:rect");
                        o.setAttributeNS(null, "x", "0"),
                        o.setAttributeNS(null, "y", "0"),
                        o.setAttributeNS(null, "width", r(i)),
                        o.setAttributeNS(null, "height", r(a)),
                        n.element = o,
                        this.clip("nonzero");
                        var c = document.createElementNS(m, "svg:image");
                        c.setAttributeNS(A, "xlink:href", s),
                        c.setAttributeNS(null, "x", "0"),
                        c.setAttributeNS(null, "y", r(-a)),
                        c.setAttributeNS(null, "width", r(i) + "px"),
                        c.setAttributeNS(null, "height", r(a) + "px"),
                        c.setAttributeNS(null, "transform", "scale(" + r(1 / i) + " " + r(-1 / a) + ")"),
                        e ? e.appendChild(c) : this.tgrp.appendChild(c),
                        n.pendingClip ? (this.cgrp.appendChild(this.tgrp),
                        this.pgrp.appendChild(this.cgrp)) : this.pgrp.appendChild(this.tgrp)
                    },
                    paintImageMaskXObject: function(t) {
                        var e = this.current
                          , n = t.width
                          , i = t.height
                          , a = e.fillColor;
                        e.maskId = "mask" + x++;
                        var s = document.createElementNS(m, "svg:mask");
                        s.setAttributeNS(null, "id", e.maskId);
                        var o = document.createElementNS(m, "svg:rect");
                        o.setAttributeNS(null, "x", "0"),
                        o.setAttributeNS(null, "y", "0"),
                        o.setAttributeNS(null, "width", r(n)),
                        o.setAttributeNS(null, "height", r(i)),
                        o.setAttributeNS(null, "fill", a),
                        o.setAttributeNS(null, "mask", "url(#" + e.maskId + ")"),
                        this.defs.appendChild(s),
                        this.tgrp.appendChild(o),
                        this.paintInlineImageXObject(t, s)
                    },
                    paintFormXObjectBegin: function(t, e) {
                        if (this.save(),
                        c(t) && 6 === t.length && this.transform(t[0], t[1], t[2], t[3], t[4], t[5]),
                        c(e) && 4 === e.length) {
                            var n = e[2] - e[0]
                              , i = e[3] - e[1]
                              , a = document.createElementNS(m, "svg:rect");
                            a.setAttributeNS(null, "x", e[0]),
                            a.setAttributeNS(null, "y", e[1]),
                            a.setAttributeNS(null, "width", r(n)),
                            a.setAttributeNS(null, "height", r(i)),
                            this.current.element = a,
                            this.clip("nonzero"),
                            this.endPath()
                        }
                    },
                    paintFormXObjectEnd: function() {
                        this.restore()
                    }
                },
                g
            }();
            t.SVGGraphics = f
        }),
        function(t, e) {
            e(t.pdfjsDisplayAnnotationLayer = {}, t.pdfjsSharedUtil, t.pdfjsDisplayDOMUtils)
        }(this, function(t, e, n) {
            function i() {}
            var r = e.AnnotationBorderStyleType
              , a = e.AnnotationType
              , s = e.Util
              , o = n.addLinkAttributes
              , c = n.LinkTarget
              , l = n.getFilenameFromUrl
              , h = e.warn
              , u = n.CustomStyle
              , d = n.getDefaultSetting;
            i.prototype = {
                create: function(t) {
                    switch (t.data.annotationType) {
                    case a.LINK:
                        return new f(t);
                    case a.TEXT:
                        return new g(t);
                    case a.WIDGET:
                        switch (t.data.fieldType) {
                        case "Tx":
                            return new A(t)
                        }
                        return new m(t);
                    case a.POPUP:
                        return new v(t);
                    case a.HIGHLIGHT:
                        return new y(t);
                    case a.UNDERLINE:
                        return new x(t);
                    case a.SQUIGGLY:
                        return new S(t);
                    case a.STRIKEOUT:
                        return new k(t);
                    case a.FILEATTACHMENT:
                        return new C(t);
                    default:
                        return new p(t)
                    }
                }
            };
            var p = function() {
                function t(t, e) {
                    this.isRenderable = e || !1,
                    this.data = t.data,
                    this.layer = t.layer,
                    this.page = t.page,
                    this.viewport = t.viewport,
                    this.linkService = t.linkService,
                    this.downloadManager = t.downloadManager,
                    this.imageResourcesPath = t.imageResourcesPath,
                    this.renderInteractiveForms = t.renderInteractiveForms,
                    e && (this.container = this._createContainer())
                }
                return t.prototype = {
                    _createContainer: function() {
                        var t = this.data
                          , e = this.page
                          , n = this.viewport
                          , i = document.createElement("section")
                          , a = t.rect[2] - t.rect[0]
                          , o = t.rect[3] - t.rect[1];
                        i.setAttribute("data-annotation-id", t.id);
                        var c = s.normalizeRect([t.rect[0], e.view[3] - t.rect[1] + e.view[1], t.rect[2], e.view[3] - t.rect[3] + e.view[1]]);
                        if (u.setProp("transform", i, "matrix(" + n.transform.join(",") + ")"),
                        u.setProp("transformOrigin", i, -c[0] + "px " + -c[1] + "px"),
                        t.borderStyle.width > 0) {
                            i.style.borderWidth = t.borderStyle.width + "px",
                            t.borderStyle.style !== r.UNDERLINE && (a -= 2 * t.borderStyle.width,
                            o -= 2 * t.borderStyle.width);
                            var l = t.borderStyle.horizontalCornerRadius
                              , d = t.borderStyle.verticalCornerRadius;
                            if (l > 0 || d > 0) {
                                var p = l + "px / " + d + "px";
                                u.setProp("borderRadius", i, p)
                            }
                            switch (t.borderStyle.style) {
                            case r.SOLID:
                                i.style.borderStyle = "solid";
                                break;
                            case r.DASHED:
                                i.style.borderStyle = "dashed";
                                break;
                            case r.BEVELED:
                                h("Unimplemented border style: beveled");
                                break;
                            case r.INSET:
                                h("Unimplemented border style: inset");
                                break;
                            case r.UNDERLINE:
                                i.style.borderBottomStyle = "solid"
                            }
                            t.color ? i.style.borderColor = s.makeCssRgb(0 | t.color[0], 0 | t.color[1], 0 | t.color[2]) : i.style.borderWidth = 0
                        }
                        return i.style.left = c[0] + "px",
                        i.style.top = c[1] + "px",
                        i.style.width = a + "px",
                        i.style.height = o + "px",
                        i
                    },
                    _createPopup: function(t, e, n) {
                        e || (e = document.createElement("div"),
                        e.style.height = t.style.height,
                        e.style.width = t.style.width,
                        t.appendChild(e));
                        var i = new b({
                            container: t,
                            trigger: e,
                            color: n.color,
                            title: n.title,
                            contents: n.contents,
                            hideWrapper: !0
                        })
                          , r = i.render();
                        r.style.left = t.style.width,
                        t.appendChild(r)
                    },
                    render: function() {
                        throw new Error("Abstract method AnnotationElement.render called")
                    }
                },
                t
            }()
              , f = function() {
                function t(t) {
                    p.call(this, t, !0)
                }
                return s.inherit(t, p, {
                    render: function() {
                        this.container.className = "linkAnnotation";
                        var t = document.createElement("a");
                        return o(t, {
                            url: this.data.url,
                            target: this.data.newWindow ? c.BLANK : void 0
                        }),
                        this.data.url || (this.data.action ? this._bindNamedAction(t, this.data.action) : this._bindLink(t, this.data.dest || null)),
                        this.container.appendChild(t),
                        this.container
                    },
                    _bindLink: function(t, e) {
                        var n = this;
                        t.href = this.linkService.getDestinationHash(e),
                        t.onclick = function() {
                            return e && n.linkService.navigateTo(e),
                            !1
                        }
                        ,
                        e && (t.className = "internalLink")
                    },
                    _bindNamedAction: function(t, e) {
                        var n = this;
                        t.href = this.linkService.getAnchorUrl(""),
                        t.onclick = function() {
                            return n.linkService.executeNamedAction(e),
                            !1
                        }
                        ,
                        t.className = "internalLink"
                    }
                }),
                t
            }()
              , g = function() {
                function t(t) {
                    var e = !!(t.data.hasPopup || t.data.title || t.data.contents);
                    p.call(this, t, e)
                }
                return s.inherit(t, p, {
                    render: function() {
                        this.container.className = "textAnnotation";
                        var t = document.createElement("img");
                        return t.style.height = this.container.style.height,
                        t.style.width = this.container.style.width,
                        t.src = this.imageResourcesPath + "annotation-" + this.data.name.toLowerCase() + ".svg",
                        t.alt = "[{{type}} Annotation]",
                        t.dataset.l10nId = "text_annotation_type",
                        t.dataset.l10nArgs = JSON.stringify({
                            type: this.data.name
                        }),
                        this.data.hasPopup || this._createPopup(this.container, t, this.data),
                        this.container.appendChild(t),
                        this.container
                    }
                }),
                t
            }()
              , m = function() {
                function t(t) {
                    var e = t.renderInteractiveForms || !t.data.hasAppearance && !!t.data.fieldValue;
                    p.call(this, t, e)
                }
                return s.inherit(t, p, {
                    render: function() {
                        return this.container
                    }
                }),
                t
            }()
              , A = function() {
                function t(t) {
                    m.call(this, t)
                }
                var e = ["left", "center", "right"];
                return s.inherit(t, m, {
                    render: function() {
                        this.container.className = "textWidgetAnnotation";
                        var t = null;
                        if (this.renderInteractiveForms) {
                            if (this.data.multiLine ? (t = document.createElement("textarea"),
                            t.textContent = this.data.fieldValue) : (t = document.createElement("input"),
                            t.type = "text",
                            t.setAttribute("value", this.data.fieldValue)),
                            t.disabled = this.data.readOnly,
                            null !== this.data.maxLen && (t.maxLength = this.data.maxLen),
                            this.data.comb) {
                                var n = this.data.rect[2] - this.data.rect[0]
                                  , i = n / this.data.maxLen;
                                t.classList.add("comb"),
                                t.style.letterSpacing = "calc(" + i + "px - 1ch)"
                            }
                        } else {
                            t = document.createElement("div"),
                            t.textContent = this.data.fieldValue,
                            t.style.verticalAlign = "middle",
                            t.style.display = "table-cell";
                            var r = null;
                            this.data.fontRefName && (r = this.page.commonObjs.getData(this.data.fontRefName)),
                            this._setTextStyle(t, r)
                        }
                        return null !== this.data.textAlignment && (t.style.textAlign = e[this.data.textAlignment]),
                        this.container.appendChild(t),
                        this.container
                    },
                    _setTextStyle: function(t, e) {
                        var n = t.style;
                        if (n.fontSize = this.data.fontSize + "px",
                        n.direction = this.data.fontDirection < 0 ? "rtl" : "ltr",
                        e) {
                            n.fontWeight = e.black ? e.bold ? "900" : "bold" : e.bold ? "bold" : "normal",
                            n.fontStyle = e.italic ? "italic" : "normal";
                            var i = e.loadedName ? '"' + e.loadedName + '", ' : ""
                              , r = e.fallbackName || "Helvetica, sans-serif";
                            n.fontFamily = i + r
                        }
                    }
                }),
                t
            }()
              , v = function() {
                function t(t) {
                    var e = !(!t.data.title && !t.data.contents);
                    p.call(this, t, e)
                }
                return s.inherit(t, p, {
                    render: function() {
                        this.container.className = "popupAnnotation";
                        var t = '[data-annotation-id="' + this.data.parentId + '"]'
                          , e = this.layer.querySelector(t);
                        if (!e)
                            return this.container;
                        var n = new b({
                            container: this.container,
                            trigger: e,
                            color: this.data.color,
                            title: this.data.title,
                            contents: this.data.contents
                        })
                          , i = parseFloat(e.style.left)
                          , r = parseFloat(e.style.width);
                        return u.setProp("transformOrigin", this.container, -(i + r) + "px -" + e.style.top),
                        this.container.style.left = i + r + "px",
                        this.container.appendChild(n.render()),
                        this.container
                    }
                }),
                t
            }()
              , b = function() {
                function t(t) {
                    this.container = t.container,
                    this.trigger = t.trigger,
                    this.color = t.color,
                    this.title = t.title,
                    this.contents = t.contents,
                    this.hideWrapper = t.hideWrapper || !1,
                    this.pinned = !1
                }
                return t.prototype = {
                    render: function() {
                        var t = document.createElement("div");
                        t.className = "popupWrapper",
                        this.hideElement = this.hideWrapper ? t : this.container,
                        this.hideElement.setAttribute("hidden", !0);
                        var e = document.createElement("div");
                        e.className = "popup";
                        var n = this.color;
                        if (n) {
                            var i = .7 * (255 - n[0]) + n[0]
                              , r = .7 * (255 - n[1]) + n[1]
                              , a = .7 * (255 - n[2]) + n[2];
                            e.style.backgroundColor = s.makeCssRgb(0 | i, 0 | r, 0 | a)
                        }
                        var o = this._formatContents(this.contents)
                          , c = document.createElement("h1");
                        return c.textContent = this.title,
                        this.trigger.addEventListener("click", this._toggle.bind(this)),
                        this.trigger.addEventListener("mouseover", this._show.bind(this, !1)),
                        this.trigger.addEventListener("mouseout", this._hide.bind(this, !1)),
                        e.addEventListener("click", this._hide.bind(this, !0)),
                        e.appendChild(c),
                        e.appendChild(o),
                        t.appendChild(e),
                        t
                    },
                    _formatContents: function(t) {
                        for (var e = document.createElement("p"), n = t.split(/(?:\r\n?|\n)/), i = 0, r = n.length; i < r; ++i) {
                            var a = n[i];
                            e.appendChild(document.createTextNode(a)),
                            i < r - 1 && e.appendChild(document.createElement("br"))
                        }
                        return e
                    },
                    _toggle: function() {
                        this.pinned ? this._hide(!0) : this._show(!0)
                    },
                    _show: function(t) {
                        t && (this.pinned = !0),
                        this.hideElement.hasAttribute("hidden") && (this.hideElement.removeAttribute("hidden"),
                        this.container.style.zIndex += 1)
                    },
                    _hide: function(t) {
                        t && (this.pinned = !1),
                        this.hideElement.hasAttribute("hidden") || this.pinned || (this.hideElement.setAttribute("hidden", !0),
                        this.container.style.zIndex -= 1)
                    }
                },
                t
            }()
              , y = function() {
                function t(t) {
                    var e = !!(t.data.hasPopup || t.data.title || t.data.contents);
                    p.call(this, t, e)
                }
                return s.inherit(t, p, {
                    render: function() {
                        return this.container.className = "highlightAnnotation",
                        this.data.hasPopup || this._createPopup(this.container, null, this.data),
                        this.container
                    }
                }),
                t
            }()
              , x = function() {
                function t(t) {
                    var e = !!(t.data.hasPopup || t.data.title || t.data.contents);
                    p.call(this, t, e)
                }
                return s.inherit(t, p, {
                    render: function() {
                        return this.container.className = "underlineAnnotation",
                        this.data.hasPopup || this._createPopup(this.container, null, this.data),
                        this.container
                    }
                }),
                t
            }()
              , S = function() {
                function t(t) {
                    var e = !!(t.data.hasPopup || t.data.title || t.data.contents);
                    p.call(this, t, e)
                }
                return s.inherit(t, p, {
                    render: function() {
                        return this.container.className = "squigglyAnnotation",
                        this.data.hasPopup || this._createPopup(this.container, null, this.data),
                        this.container
                    }
                }),
                t
            }()
              , k = function() {
                function t(t) {
                    var e = !!(t.data.hasPopup || t.data.title || t.data.contents);
                    p.call(this, t, e)
                }
                return s.inherit(t, p, {
                    render: function() {
                        return this.container.className = "strikeoutAnnotation",
                        this.data.hasPopup || this._createPopup(this.container, null, this.data),
                        this.container
                    }
                }),
                t
            }()
              , C = function() {
                function t(t) {
                    p.call(this, t, !0),
                    this.filename = l(t.data.file.filename),
                    this.content = t.data.file.content
                }
                return s.inherit(t, p, {
                    render: function() {
                        this.container.className = "fileAttachmentAnnotation";
                        var t = document.createElement("div");
                        return t.style.height = this.container.style.height,
                        t.style.width = this.container.style.width,
                        t.addEventListener("dblclick", this._download.bind(this)),
                        this.data.hasPopup || !this.data.title && !this.data.contents || this._createPopup(this.container, t, this.data),
                        this.container.appendChild(t),
                        this.container
                    },
                    _download: function() {
                        if (!this.downloadManager)
                            return void h("Download cannot be started due to unavailable download manager");
                        this.downloadManager.downloadData(this.content, this.filename, "")
                    }
                }),
                t
            }()
              , _ = function() {
                return {
                    render: function(t) {
                        for (var e = new i, n = 0, r = t.annotations.length; n < r; n++) {
                            var a = t.annotations[n];
                            if (a) {
                                var s = {
                                    data: a,
                                    layer: t.div,
                                    page: t.page,
                                    viewport: t.viewport,
                                    linkService: t.linkService,
                                    downloadManager: t.downloadManager,
                                    imageResourcesPath: t.imageResourcesPath || d("imageResourcesPath"),
                                    renderInteractiveForms: t.renderInteractiveForms || !1
                                }
                                  , o = e.create(s);
                                o.isRenderable && t.div.appendChild(o.render())
                            }
                        }
                    },
                    update: function(t) {
                        for (var e = 0, n = t.annotations.length; e < n; e++) {
                            var i = t.annotations[e]
                              , r = t.div.querySelector('[data-annotation-id="' + i.id + '"]');
                            r && u.setProp("transform", r, "matrix(" + t.viewport.transform.join(",") + ")")
                        }
                        t.div.removeAttribute("hidden")
                    }
                }
            }();
            t.AnnotationLayer = _
        }),
        function(t, e) {
            e(t.pdfjsDisplayTextLayer = {}, t.pdfjsSharedUtil, t.pdfjsDisplayDOMUtils)
        }(this, function(t, e, n) {
            var i = e.Util
              , r = e.createPromiseCapability
              , a = n.CustomStyle
              , s = n.getDefaultSetting
              , o = function() {
                function t(t) {
                    return !d.test(t)
                }
                function e(e, n, r) {
                    var a = document.createElement("div")
                      , o = {
                        style: null,
                        angle: 0,
                        canvasWidth: 0,
                        isWhitespace: !1,
                        originalTransform: null,
                        paddingBottom: 0,
                        paddingLeft: 0,
                        paddingRight: 0,
                        paddingTop: 0,
                        scale: 1
                    };
                    if (e._textDivs.push(a),
                    t(n.str))
                        return o.isWhitespace = !0,
                        void e._textDivProperties.set(a, o);
                    var c = i.transform(e._viewport.transform, n.transform)
                      , l = Math.atan2(c[1], c[0])
                      , h = r[n.fontName];
                    h.vertical && (l += Math.PI / 2);
                    var u = Math.sqrt(c[2] * c[2] + c[3] * c[3])
                      , d = u;
                    h.ascent ? d = h.ascent * d : h.descent && (d = (1 + h.descent) * d);
                    var f, g;
                    if (0 === l ? (f = c[4],
                    g = c[5] - d) : (f = c[4] + d * Math.sin(l),
                    g = c[5] - d * Math.cos(l)),
                    p[1] = f,
                    p[3] = g,
                    p[5] = u,
                    p[7] = h.fontFamily,
                    o.style = p.join(""),
                    a.setAttribute("style", o.style),
                    a.textContent = n.str,
                    s("pdfBug") && (a.dataset.fontName = n.fontName),
                    0 !== l && (o.angle = l * (180 / Math.PI)),
                    n.str.length > 1 && (h.vertical ? o.canvasWidth = n.height * e._viewport.scale : o.canvasWidth = n.width * e._viewport.scale),
                    e._textDivProperties.set(a, o),
                    e._enhanceTextSelection) {
                        var m = 1
                          , A = 0;
                        0 !== l && (m = Math.cos(l),
                        A = Math.sin(l));
                        var v, b, y = (h.vertical ? n.height : n.width) * e._viewport.scale, x = u;
                        0 !== l ? (v = [m, A, -A, m, f, g],
                        b = i.getAxialAlignedBoundingBox([0, 0, y, x], v)) : b = [f, g, f + y, g + x],
                        e._bounds.push({
                            left: b[0],
                            top: b[1],
                            right: b[2],
                            bottom: b[3],
                            div: a,
                            size: [y, x],
                            m: v
                        })
                    }
                }
                function n(t) {
                    if (!t._canceled) {
                        var e = t._container
                          , n = t._textDivs
                          , i = t._capability
                          , r = n.length;
                        if (r > 1e5)
                            return t._renderingDone = !0,
                            void i.resolve();
                        var s = document.createElement("canvas");
                        s.mozOpaque = !0;
                        for (var o, c, l = s.getContext("2d", {
                            alpha: !1
                        }), h = 0; h < r; h++) {
                            var u = n[h]
                              , d = t._textDivProperties.get(u);
                            if (!d.isWhitespace) {
                                var p = u.style.fontSize
                                  , f = u.style.fontFamily;
                                p === o && f === c || (l.font = p + " " + f,
                                o = p,
                                c = f);
                                var g = l.measureText(u.textContent).width;
                                e.appendChild(u);
                                var m = "";
                                0 !== d.canvasWidth && g > 0 && (d.scale = d.canvasWidth / g,
                                m = "scaleX(" + d.scale + ")"),
                                0 !== d.angle && (m = "rotate(" + d.angle + "deg) " + m),
                                "" !== m && (d.originalTransform = m,
                                a.setProp("transform", u, m)),
                                t._textDivProperties.set(u, d)
                            }
                        }
                        t._renderingDone = !0,
                        i.resolve()
                    }
                }
                function o(t) {
                    for (var e = t._bounds, n = t._viewport, r = c(n.width, n.height, e), a = 0; a < r.length; a++) {
                        var s = e[a].div
                          , o = t._textDivProperties.get(s);
                        if (0 !== o.angle) {
                            var l = r[a]
                              , h = e[a]
                              , u = h.m
                              , d = u[0]
                              , p = u[1]
                              , f = [[0, 0], [0, h.size[1]], [h.size[0], 0], h.size]
                              , g = new Float64Array(64);
                            f.forEach(function(t, e) {
                                var n = i.applyTransform(t, u);
                                g[e + 0] = d && (l.left - n[0]) / d,
                                g[e + 4] = p && (l.top - n[1]) / p,
                                g[e + 8] = d && (l.right - n[0]) / d,
                                g[e + 12] = p && (l.bottom - n[1]) / p,
                                g[e + 16] = p && (l.left - n[0]) / -p,
                                g[e + 20] = d && (l.top - n[1]) / d,
                                g[e + 24] = p && (l.right - n[0]) / -p,
                                g[e + 28] = d && (l.bottom - n[1]) / d,
                                g[e + 32] = d && (l.left - n[0]) / -d,
                                g[e + 36] = p && (l.top - n[1]) / -p,
                                g[e + 40] = d && (l.right - n[0]) / -d,
                                g[e + 44] = p && (l.bottom - n[1]) / -p,
                                g[e + 48] = p && (l.left - n[0]) / p,
                                g[e + 52] = d && (l.top - n[1]) / -d,
                                g[e + 56] = p && (l.right - n[0]) / p,
                                g[e + 60] = d && (l.bottom - n[1]) / -d
                            });
                            var m = function(t, e, n) {
                                for (var i = 0, r = 0; r < n; r++) {
                                    var a = t[e++];
                                    a > 0 && (i = i ? Math.min(a, i) : a)
                                }
                                return i
                            }
                              , A = 1 + Math.min(Math.abs(d), Math.abs(p));
                            o.paddingLeft = m(g, 32, 16) / A,
                            o.paddingTop = m(g, 48, 16) / A,
                            o.paddingRight = m(g, 0, 16) / A,
                            o.paddingBottom = m(g, 16, 16) / A,
                            t._textDivProperties.set(s, o)
                        } else
                            o.paddingLeft = e[a].left - r[a].left,
                            o.paddingTop = e[a].top - r[a].top,
                            o.paddingRight = r[a].right - e[a].right,
                            o.paddingBottom = r[a].bottom - e[a].bottom,
                            t._textDivProperties.set(s, o)
                    }
                }
                function c(t, e, n) {
                    var i = n.map(function(t, e) {
                        return {
                            x1: t.left,
                            y1: t.top,
                            x2: t.right,
                            y2: t.bottom,
                            index: e,
                            x1New: void 0,
                            x2New: void 0
                        }
                    });
                    l(t, i);
                    var r = new Array(n.length);
                    return i.forEach(function(t) {
                        r[t.index] = {
                            left: t.x1New,
                            top: 0,
                            right: t.x2New,
                            bottom: 0
                        }
                    }),
                    n.map(function(e, n) {
                        var a = r[n]
                          , s = i[n];
                        s.x1 = e.top,
                        s.y1 = t - a.right,
                        s.x2 = e.bottom,
                        s.y2 = t - a.left,
                        s.index = n,
                        s.x1New = void 0,
                        s.x2New = void 0
                    }),
                    l(e, i),
                    i.forEach(function(t) {
                        var e = t.index;
                        r[e].top = t.x1New,
                        r[e].bottom = t.x2New
                    }),
                    r
                }
                function l(t, e) {
                    e.sort(function(t, e) {
                        return t.x1 - e.x1 || t.index - e.index
                    });
                    var n = {
                        x1: -(1 / 0),
                        y1: -(1 / 0),
                        x2: 0,
                        y2: 1 / 0,
                        index: -1,
                        x1New: 0,
                        x2New: 0
                    }
                      , i = [{
                        start: -(1 / 0),
                        end: 1 / 0,
                        boundary: n
                    }];
                    e.forEach(function(t) {
                        for (var e = 0; e < i.length && i[e].end <= t.y1; )
                            e++;
                        for (var n = i.length - 1; n >= 0 && i[n].start >= t.y2; )
                            n--;
                        var r, a, s, o, c = -(1 / 0);
                        for (s = e; s <= n; s++) {
                            r = i[s],
                            a = r.boundary;
                            var l;
                            l = a.x2 > t.x1 ? a.index > t.index ? a.x1New : t.x1 : void 0 === a.x2New ? (a.x2 + t.x1) / 2 : a.x2New,
                            l > c && (c = l)
                        }
                        for (t.x1New = c,
                        s = e; s <= n; s++)
                            r = i[s],
                            a = r.boundary,
                            void 0 === a.x2New ? a.x2 > t.x1 ? a.index > t.index && (a.x2New = a.x2) : a.x2New = c : a.x2New > c && (a.x2New = Math.max(c, a.x2));
                        var h = []
                          , u = null;
                        for (s = e; s <= n; s++) {
                            r = i[s],
                            a = r.boundary;
                            var d = a.x2 > t.x2 ? a : t;
                            u === d ? h[h.length - 1].end = r.end : (h.push({
                                start: r.start,
                                end: r.end,
                                boundary: d
                            }),
                            u = d)
                        }
                        for (i[e].start < t.y1 && (h[0].start = t.y1,
                        h.unshift({
                            start: i[e].start,
                            end: t.y1,
                            boundary: i[e].boundary
                        })),
                        t.y2 < i[n].end && (h[h.length - 1].end = t.y2,
                        h.push({
                            start: t.y2,
                            end: i[n].end,
                            boundary: i[n].boundary
                        })),
                        s = e; s <= n; s++)
                            if (r = i[s],
                            a = r.boundary,
                            void 0 === a.x2New) {
                                var p = !1;
                                for (o = e - 1; !p && o >= 0 && i[o].start >= a.y1; o--)
                                    p = i[o].boundary === a;
                                for (o = n + 1; !p && o < i.length && i[o].end <= a.y2; o++)
                                    p = i[o].boundary === a;
                                for (o = 0; !p && o < h.length; o++)
                                    p = h[o].boundary === a;
                                p || (a.x2New = c)
                            }
                        Array.prototype.splice.apply(i, [e, n - e + 1].concat(h))
                    }),
                    i.forEach(function(e) {
                        var n = e.boundary;
                        void 0 === n.x2New && (n.x2New = Math.max(t, n.x2))
                    })
                }
                function h(t, e, n, i, a) {
                    this._textContent = t,
                    this._container = e,
                    this._viewport = n,
                    this._textDivs = i || [],
                    this._textDivProperties = new WeakMap,
                    this._renderingDone = !1,
                    this._canceled = !1,
                    this._capability = r(),
                    this._renderTimer = null,
                    this._bounds = [],
                    this._enhanceTextSelection = !!a
                }
                function u(t) {
                    var e = new h(t.textContent,t.container,t.viewport,t.textDivs,t.enhanceTextSelection);
                    return e._render(t.timeout),
                    e
                }
                var d = /\S/
                  , p = ["left: ", 0, "px; top: ", 0, "px; font-size: ", 0, "px; font-family: ", "", ";"];
                return h.prototype = {
                    get promise() {
                        return this._capability.promise
                    },
                    cancel: function() {
                        this._canceled = !0,
                        null !== this._renderTimer && (clearTimeout(this._renderTimer),
                        this._renderTimer = null),
                        this._capability.reject("canceled")
                    },
                    _render: function(t) {
                        for (var i = this._textContent.items, r = this._textContent.styles, a = 0, s = i.length; a < s; a++)
                            e(this, i[a], r);
                        if (t) {
                            var o = this;
                            this._renderTimer = setTimeout(function() {
                                n(o),
                                o._renderTimer = null
                            }, t)
                        } else
                            n(this)
                    },
                    expandTextDivs: function(t) {
                        if (this._enhanceTextSelection && this._renderingDone) {
                            null !== this._bounds && (o(this),
                            this._bounds = null);
                            for (var e = 0, n = this._textDivs.length; e < n; e++) {
                                var i = this._textDivs[e]
                                  , r = this._textDivProperties.get(i);
                                if (!r.isWhitespace)
                                    if (t) {
                                        var s = ""
                                          , c = "";
                                        1 !== r.scale && (s = "scaleX(" + r.scale + ")"),
                                        0 !== r.angle && (s = "rotate(" + r.angle + "deg) " + s),
                                        0 !== r.paddingLeft && (c += " padding-left: " + r.paddingLeft / r.scale + "px;",
                                        s += " translateX(" + -r.paddingLeft / r.scale + "px)"),
                                        0 !== r.paddingTop && (c += " padding-top: " + r.paddingTop + "px;",
                                        s += " translateY(" + -r.paddingTop + "px)"),
                                        0 !== r.paddingRight && (c += " padding-right: " + r.paddingRight / r.scale + "px;"),
                                        0 !== r.paddingBottom && (c += " padding-bottom: " + r.paddingBottom + "px;"),
                                        "" !== c && i.setAttribute("style", r.style + c),
                                        "" !== s && a.setProp("transform", i, s)
                                    } else
                                        i.style.padding = 0,
                                        a.setProp("transform", i, r.originalTransform || "")
                            }
                        }
                    }
                },
                u
            }();
            t.renderTextLayer = o
        }),
        function(t, e) {
            e(t.pdfjsDisplayWebGL = {}, t.pdfjsSharedUtil, t.pdfjsDisplayDOMUtils)
        }(this, function(t, e, n) {
            var i = e.shadow
              , r = n.getDefaultSetting
              , a = function() {
                function t(t, e, n) {
                    var i = t.createShader(n);
                    if (t.shaderSource(i, e),
                    t.compileShader(i),
                    !t.getShaderParameter(i, t.COMPILE_STATUS)) {
                        var r = t.getShaderInfoLog(i);
                        throw new Error("Error during shader compilation: " + r)
                    }
                    return i
                }
                function e(e, n) {
                    return t(e, n, e.VERTEX_SHADER)
                }
                function n(e, n) {
                    return t(e, n, e.FRAGMENT_SHADER)
                }
                function a(t, e) {
                    for (var n = t.createProgram(), i = 0, r = e.length; i < r; ++i)
                        t.attachShader(n, e[i]);
                    if (t.linkProgram(n),
                    !t.getProgramParameter(n, t.LINK_STATUS)) {
                        var a = t.getProgramInfoLog(n);
                        throw new Error("Error during program linking: " + a)
                    }
                    return n
                }
                function s(t, e, n) {
                    t.activeTexture(n);
                    var i = t.createTexture();
                    return t.bindTexture(t.TEXTURE_2D, i),
                    t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE),
                    t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE),
                    t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST),
                    t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST),
                    t.texImage2D(t.TEXTURE_2D, 0, t.RGBA, t.RGBA, t.UNSIGNED_BYTE, e),
                    i
                }
                function o() {
                    p || (f = document.createElement("canvas"),
                    p = f.getContext("webgl", {
                        premultipliedalpha: !1
                    }))
                }
                function c() {
                    var t, i;
                    o(),
                    t = f,
                    f = null,
                    i = p,
                    p = null;
                    var r = e(i, "  attribute vec2 a_position;                                      attribute vec2 a_texCoord;                                                                                                      uniform vec2 u_resolution;                                                                                                      varying vec2 v_texCoord;                                                                                                        void main() {                                                     vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;       gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);                                                                              v_texCoord = a_texCoord;                                      }                                                             ")
                      , s = n(i, "  precision mediump float;                                                                                                        uniform vec4 u_backdrop;                                        uniform int u_subtype;                                          uniform sampler2D u_image;                                      uniform sampler2D u_mask;                                                                                                       varying vec2 v_texCoord;                                                                                                        void main() {                                                     vec4 imageColor = texture2D(u_image, v_texCoord);               vec4 maskColor = texture2D(u_mask, v_texCoord);                 if (u_backdrop.a > 0.0) {                                         maskColor.rgb = maskColor.rgb * maskColor.a +                                   u_backdrop.rgb * (1.0 - maskColor.a);         }                                                               float lum;                                                      if (u_subtype == 0) {                                             lum = maskColor.a;                                            } else {                                                          lum = maskColor.r * 0.3 + maskColor.g * 0.59 +                        maskColor.b * 0.11;                                     }                                                               imageColor.a *= lum;                                            imageColor.rgb *= imageColor.a;                                 gl_FragColor = imageColor;                                    }                                                             ")
                      , c = a(i, [r, s]);
                    i.useProgram(c);
                    var l = {};
                    l.gl = i,
                    l.canvas = t,
                    l.resolutionLocation = i.getUniformLocation(c, "u_resolution"),
                    l.positionLocation = i.getAttribLocation(c, "a_position"),
                    l.backdropLocation = i.getUniformLocation(c, "u_backdrop"),
                    l.subtypeLocation = i.getUniformLocation(c, "u_subtype");
                    var h = i.getAttribLocation(c, "a_texCoord")
                      , u = i.getUniformLocation(c, "u_image")
                      , d = i.getUniformLocation(c, "u_mask")
                      , m = i.createBuffer();
                    i.bindBuffer(i.ARRAY_BUFFER, m),
                    i.bufferData(i.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), i.STATIC_DRAW),
                    i.enableVertexAttribArray(h),
                    i.vertexAttribPointer(h, 2, i.FLOAT, !1, 0, 0),
                    i.uniform1i(u, 0),
                    i.uniform1i(d, 1),
                    g = l
                }
                function l(t, e, n) {
                    var i = t.width
                      , r = t.height;
                    g || c();
                    var a = g
                      , o = a.canvas
                      , l = a.gl;
                    o.width = i,
                    o.height = r,
                    l.viewport(0, 0, l.drawingBufferWidth, l.drawingBufferHeight),
                    l.uniform2f(a.resolutionLocation, i, r),
                    n.backdrop ? l.uniform4f(a.resolutionLocation, n.backdrop[0], n.backdrop[1], n.backdrop[2], 1) : l.uniform4f(a.resolutionLocation, 0, 0, 0, 0),
                    l.uniform1i(a.subtypeLocation, "Luminosity" === n.subtype ? 1 : 0);
                    var h = s(l, t, l.TEXTURE0)
                      , u = s(l, e, l.TEXTURE1)
                      , d = l.createBuffer();
                    return l.bindBuffer(l.ARRAY_BUFFER, d),
                    l.bufferData(l.ARRAY_BUFFER, new Float32Array([0, 0, i, 0, 0, r, 0, r, i, 0, i, r]), l.STATIC_DRAW),
                    l.enableVertexAttribArray(a.positionLocation),
                    l.vertexAttribPointer(a.positionLocation, 2, l.FLOAT, !1, 0, 0),
                    l.clearColor(0, 0, 0, 0),
                    l.enable(l.BLEND),
                    l.blendFunc(l.ONE, l.ONE_MINUS_SRC_ALPHA),
                    l.clear(l.COLOR_BUFFER_BIT),
                    l.drawArrays(l.TRIANGLES, 0, 6),
                    l.flush(),
                    l.deleteTexture(h),
                    l.deleteTexture(u),
                    l.deleteBuffer(d),
                    o
                }
                function h() {
                    var t, i;
                    o(),
                    t = f,
                    f = null,
                    i = p,
                    p = null;
                    var r = e(i, "  attribute vec2 a_position;                                      attribute vec3 a_color;                                                                                                         uniform vec2 u_resolution;                                      uniform vec2 u_scale;                                           uniform vec2 u_offset;                                                                                                          varying vec4 v_color;                                                                                                           void main() {                                                     vec2 position = (a_position + u_offset) * u_scale;              vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;         gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);                                                                              v_color = vec4(a_color / 255.0, 1.0);                         }                                                             ")
                      , s = n(i, "  precision mediump float;                                                                                                        varying vec4 v_color;                                                                                                           void main() {                                                     gl_FragColor = v_color;                                       }                                                             ")
                      , c = a(i, [r, s]);
                    i.useProgram(c);
                    var l = {};
                    l.gl = i,
                    l.canvas = t,
                    l.resolutionLocation = i.getUniformLocation(c, "u_resolution"),
                    l.scaleLocation = i.getUniformLocation(c, "u_scale"),
                    l.offsetLocation = i.getUniformLocation(c, "u_offset"),
                    l.positionLocation = i.getAttribLocation(c, "a_position"),
                    l.colorLocation = i.getAttribLocation(c, "a_color"),
                    m = l
                }
                function u(t, e, n, i, r) {
                    m || h();
                    var a = m
                      , s = a.canvas
                      , o = a.gl;
                    s.width = t,
                    s.height = e,
                    o.viewport(0, 0, o.drawingBufferWidth, o.drawingBufferHeight),
                    o.uniform2f(a.resolutionLocation, t, e);
                    var c, l, u, d = 0;
                    for (c = 0,
                    l = i.length; c < l; c++)
                        switch (i[c].type) {
                        case "lattice":
                            u = i[c].coords.length / i[c].verticesPerRow | 0,
                            d += (u - 1) * (i[c].verticesPerRow - 1) * 6;
                            break;
                        case "triangles":
                            d += i[c].coords.length
                        }
                    var p = new Float32Array(2 * d)
                      , f = new Uint8Array(3 * d)
                      , g = r.coords
                      , A = r.colors
                      , v = 0
                      , b = 0;
                    for (c = 0,
                    l = i.length; c < l; c++) {
                        var y = i[c]
                          , x = y.coords
                          , S = y.colors;
                        switch (y.type) {
                        case "lattice":
                            var k = y.verticesPerRow;
                            u = x.length / k | 0;
                            for (var C = 1; C < u; C++)
                                for (var _ = C * k + 1, w = 1; w < k; w++,
                                _++)
                                    p[v] = g[x[_ - k - 1]],
                                    p[v + 1] = g[x[_ - k - 1] + 1],
                                    p[v + 2] = g[x[_ - k]],
                                    p[v + 3] = g[x[_ - k] + 1],
                                    p[v + 4] = g[x[_ - 1]],
                                    p[v + 5] = g[x[_ - 1] + 1],
                                    f[b] = A[S[_ - k - 1]],
                                    f[b + 1] = A[S[_ - k - 1] + 1],
                                    f[b + 2] = A[S[_ - k - 1] + 2],
                                    f[b + 3] = A[S[_ - k]],
                                    f[b + 4] = A[S[_ - k] + 1],
                                    f[b + 5] = A[S[_ - k] + 2],
                                    f[b + 6] = A[S[_ - 1]],
                                    f[b + 7] = A[S[_ - 1] + 1],
                                    f[b + 8] = A[S[_ - 1] + 2],
                                    p[v + 6] = p[v + 2],
                                    p[v + 7] = p[v + 3],
                                    p[v + 8] = p[v + 4],
                                    p[v + 9] = p[v + 5],
                                    p[v + 10] = g[x[_]],
                                    p[v + 11] = g[x[_] + 1],
                                    f[b + 9] = f[b + 3],
                                    f[b + 10] = f[b + 4],
                                    f[b + 11] = f[b + 5],
                                    f[b + 12] = f[b + 6],
                                    f[b + 13] = f[b + 7],
                                    f[b + 14] = f[b + 8],
                                    f[b + 15] = A[S[_]],
                                    f[b + 16] = A[S[_] + 1],
                                    f[b + 17] = A[S[_] + 2],
                                    v += 12,
                                    b += 18;
                            break;
                        case "triangles":
                            for (var T = 0, L = x.length; T < L; T++)
                                p[v] = g[x[T]],
                                p[v + 1] = g[x[T] + 1],
                                f[b] = A[S[T]],
                                f[b + 1] = A[S[T] + 1],
                                f[b + 2] = A[S[T] + 2],
                                v += 2,
                                b += 3
                        }
                    }
                    n ? o.clearColor(n[0] / 255, n[1] / 255, n[2] / 255, 1) : o.clearColor(0, 0, 0, 0),
                    o.clear(o.COLOR_BUFFER_BIT);
                    var P = o.createBuffer();
                    o.bindBuffer(o.ARRAY_BUFFER, P),
                    o.bufferData(o.ARRAY_BUFFER, p, o.STATIC_DRAW),
                    o.enableVertexAttribArray(a.positionLocation),
                    o.vertexAttribPointer(a.positionLocation, 2, o.FLOAT, !1, 0, 0);
                    var E = o.createBuffer();
                    return o.bindBuffer(o.ARRAY_BUFFER, E),
                    o.bufferData(o.ARRAY_BUFFER, f, o.STATIC_DRAW),
                    o.enableVertexAttribArray(a.colorLocation),
                    o.vertexAttribPointer(a.colorLocation, 3, o.UNSIGNED_BYTE, !1, 0, 0),
                    o.uniform2f(a.scaleLocation, r.scaleX, r.scaleY),
                    o.uniform2f(a.offsetLocation, r.offsetX, r.offsetY),
                    o.drawArrays(o.TRIANGLES, 0, d),
                    o.flush(),
                    o.deleteBuffer(P),
                    o.deleteBuffer(E),
                    s
                }
                function d() {
                    g && g.canvas && (g.canvas.width = 0,
                    g.canvas.height = 0),
                    m && m.canvas && (m.canvas.width = 0,
                    m.canvas.height = 0),
                    g = null,
                    m = null
                }
                var p, f, g = null, m = null;
                return {
                    get isEnabled() {
                        if (r("disableWebGL"))
                            return !1;
                        var t = !1;
                        try {
                            o(),
                            t = !!p
                        } catch (t) {}
                        return i(this, "isEnabled", t)
                    },
                    composeSMask: l,
                    drawFigures: u,
                    clear: d
                }
            }();
            t.WebGLUtils = a
        }),
        function(t, e) {
            e(t.pdfjsDisplayPatternHelper = {}, t.pdfjsSharedUtil, t.pdfjsDisplayWebGL)
        }(this, function(t, e, n) {
            function i(t) {
                var e = l[t[0]];
                return e || o("Unknown IR type: " + t[0]),
                e.fromIR(t)
            }
            var r = e.Util
              , a = e.info
              , s = e.isArray
              , o = e.error
              , c = n.WebGLUtils
              , l = {};
            l.RadialAxial = {
                fromIR: function(t) {
                    var e = t[1]
                      , n = t[2]
                      , i = t[3]
                      , r = t[4]
                      , a = t[5]
                      , s = t[6];
                    return {
                        type: "Pattern",
                        getPattern: function(t) {
                            var o;
                            "axial" === e ? o = t.createLinearGradient(i[0], i[1], r[0], r[1]) : "radial" === e && (o = t.createRadialGradient(i[0], i[1], a, r[0], r[1], s));
                            for (var c = 0, l = n.length; c < l; ++c) {
                                var h = n[c];
                                o.addColorStop(h[0], h[1])
                            }
                            return o
                        }
                    }
                }
            };
            var h = function() {
                function t(t, e, n, i, r, a, s, o) {
                    var c, l = e.coords, h = e.colors, u = t.data, d = 4 * t.width;
                    l[n + 1] > l[i + 1] && (c = n,
                    n = i,
                    i = c,
                    c = a,
                    a = s,
                    s = c),
                    l[i + 1] > l[r + 1] && (c = i,
                    i = r,
                    r = c,
                    c = s,
                    s = o,
                    o = c),
                    l[n + 1] > l[i + 1] && (c = n,
                    n = i,
                    i = c,
                    c = a,
                    a = s,
                    s = c);
                    var p = (l[n] + e.offsetX) * e.scaleX
                      , f = (l[n + 1] + e.offsetY) * e.scaleY
                      , g = (l[i] + e.offsetX) * e.scaleX
                      , m = (l[i + 1] + e.offsetY) * e.scaleY
                      , A = (l[r] + e.offsetX) * e.scaleX
                      , v = (l[r + 1] + e.offsetY) * e.scaleY;
                    if (!(f >= v))
                        for (var b, y, x, S, k, C, _, w, T, L = h[a], P = h[a + 1], E = h[a + 2], R = h[s], I = h[s + 1], D = h[s + 2], j = h[o], O = h[o + 1], M = h[o + 2], F = Math.round(f), N = Math.round(v), U = F; U <= N; U++) {
                            U < m ? (T = U < f ? 0 : f === m ? 1 : (f - U) / (f - m),
                            b = p - (p - g) * T,
                            y = L - (L - R) * T,
                            x = P - (P - I) * T,
                            S = E - (E - D) * T) : (T = U > v ? 1 : m === v ? 0 : (m - U) / (m - v),
                            b = g - (g - A) * T,
                            y = R - (R - j) * T,
                            x = I - (I - O) * T,
                            S = D - (D - M) * T),
                            T = U < f ? 0 : U > v ? 1 : (f - U) / (f - v),
                            k = p - (p - A) * T,
                            C = L - (L - j) * T,
                            _ = P - (P - O) * T,
                            w = E - (E - M) * T;
                            for (var B = Math.round(Math.min(b, k)), W = Math.round(Math.max(b, k)), G = d * U + 4 * B, X = B; X <= W; X++)
                                T = (b - X) / (b - k),
                                T = T < 0 ? 0 : T > 1 ? 1 : T,
                                u[G++] = y - (y - C) * T | 0,
                                u[G++] = x - (x - _) * T | 0,
                                u[G++] = S - (S - w) * T | 0,
                                u[G++] = 255
                        }
                }
                function e(e, n, i) {
                    var r, a, s = n.coords, c = n.colors;
                    switch (n.type) {
                    case "lattice":
                        var l = n.verticesPerRow
                          , h = Math.floor(s.length / l) - 1
                          , u = l - 1;
                        for (r = 0; r < h; r++)
                            for (var d = r * l, p = 0; p < u; p++,
                            d++)
                                t(e, i, s[d], s[d + 1], s[d + l], c[d], c[d + 1], c[d + l]),
                                t(e, i, s[d + l + 1], s[d + 1], s[d + l], c[d + l + 1], c[d + 1], c[d + l]);
                        break;
                    case "triangles":
                        for (r = 0,
                        a = s.length; r < a; r += 3)
                            t(e, i, s[r], s[r + 1], s[r + 2], c[r], c[r + 1], c[r + 2]);
                        break;
                    default:
                        o("illigal figure")
                    }
                }
                function n(t, n, i, r, a, s, o) {
                    var l, h, u, d, p = Math.floor(t[0]), f = Math.floor(t[1]), g = Math.ceil(t[2]) - p, m = Math.ceil(t[3]) - f, A = Math.min(Math.ceil(Math.abs(g * n[0] * 1.1)), 3e3), v = Math.min(Math.ceil(Math.abs(m * n[1] * 1.1)), 3e3), b = g / A, y = m / v, x = {
                        coords: i,
                        colors: r,
                        offsetX: -p,
                        offsetY: -f,
                        scaleX: 1 / b,
                        scaleY: 1 / y
                    }, S = A + 4, k = v + 4;
                    if (c.isEnabled)
                        l = c.drawFigures(A, v, s, a, x),
                        h = o.getCanvas("mesh", S, k, !1),
                        h.context.drawImage(l, 2, 2),
                        l = h.canvas;
                    else {
                        h = o.getCanvas("mesh", S, k, !1);
                        var C = h.context
                          , _ = C.createImageData(A, v);
                        if (s) {
                            var w = _.data;
                            for (u = 0,
                            d = w.length; u < d; u += 4)
                                w[u] = s[0],
                                w[u + 1] = s[1],
                                w[u + 2] = s[2],
                                w[u + 3] = 255
                        }
                        for (u = 0; u < a.length; u++)
                            e(_, a[u], x);
                        C.putImageData(_, 2, 2),
                        l = h.canvas
                    }
                    return {
                        canvas: l,
                        offsetX: p - 2 * b,
                        offsetY: f - 2 * y,
                        scaleX: b,
                        scaleY: y
                    }
                }
                return n
            }();
            l.Mesh = {
                fromIR: function(t) {
                    var e = t[2]
                      , n = t[3]
                      , i = t[4]
                      , a = t[5]
                      , s = t[6]
                      , o = t[8];
                    return {
                        type: "Pattern",
                        getPattern: function(t, c, l) {
                            var u;
                            if (l)
                                u = r.singularValueDecompose2dScale(t.mozCurrentTransform);
                            else if (u = r.singularValueDecompose2dScale(c.baseTransform),
                            s) {
                                var d = r.singularValueDecompose2dScale(s);
                                u = [u[0] * d[0], u[1] * d[1]]
                            }
                            var p = h(a, u, e, n, i, l ? null : o, c.cachedCanvases);
                            return l || (t.setTransform.apply(t, c.baseTransform),
                            s && t.transform.apply(t, s)),
                            t.translate(p.offsetX, p.offsetY),
                            t.scale(p.scaleX, p.scaleY),
                            t.createPattern(p.canvas, "no-repeat")
                        }
                    }
                }
            },
            l.Dummy = {
                fromIR: function() {
                    return {
                        type: "Pattern",
                        getPattern: function() {
                            return "hotpink"
                        }
                    }
                }
            };
            var u = function() {
                function t(t, e, n, i, r) {
                    this.operatorList = t[2],
                    this.matrix = t[3] || [1, 0, 0, 1, 0, 0],
                    this.bbox = t[4],
                    this.xstep = t[5],
                    this.ystep = t[6],
                    this.paintType = t[7],
                    this.tilingType = t[8],
                    this.color = e,
                    this.canvasGraphicsFactory = i,
                    this.baseTransform = r,
                    this.type = "Pattern",
                    this.ctx = n
                }
                var e = {
                    COLORED: 1,
                    UNCOLORED: 2
                };
                return t.prototype = {
                    createPatternCanvas: function(t) {
                        var e = this.operatorList
                          , n = this.bbox
                          , i = this.xstep
                          , s = this.ystep
                          , o = this.paintType
                          , c = this.tilingType
                          , l = this.color
                          , h = this.canvasGraphicsFactory;
                        a("TilingType: " + c);
                        var u = n[0]
                          , d = n[1]
                          , p = n[2]
                          , f = n[3]
                          , g = [u, d]
                          , m = [u + i, d + s]
                          , A = m[0] - g[0]
                          , v = m[1] - g[1]
                          , b = r.singularValueDecompose2dScale(this.matrix)
                          , y = r.singularValueDecompose2dScale(this.baseTransform)
                          , x = [b[0] * y[0], b[1] * y[1]];
                        A = Math.min(Math.ceil(Math.abs(A * x[0])), 3e3),
                        v = Math.min(Math.ceil(Math.abs(v * x[1])), 3e3);
                        var S = t.cachedCanvases.getCanvas("pattern", A, v, !0)
                          , k = S.context
                          , C = h.createCanvasGraphics(k);
                        C.groupLevel = t.groupLevel,
                        this.setFillAndStrokeStyleToContext(k, o, l),
                        this.setScale(A, v, i, s),
                        this.transformToScale(C);
                        var _ = [1, 0, 0, 1, -g[0], -g[1]];
                        return C.transform.apply(C, _),
                        this.clipBbox(C, n, u, d, p, f),
                        C.executeOperatorList(e),
                        S.canvas
                    },
                    setScale: function(t, e, n, i) {
                        this.scale = [t / n, e / i]
                    },
                    transformToScale: function(t) {
                        var e = this.scale
                          , n = [e[0], 0, 0, e[1], 0, 0];
                        t.transform.apply(t, n)
                    },
                    scaleToContext: function() {
                        var t = this.scale;
                        this.ctx.scale(1 / t[0], 1 / t[1])
                    },
                    clipBbox: function(t, e, n, i, r, a) {
                        if (e && s(e) && 4 === e.length) {
                            var o = r - n
                              , c = a - i;
                            t.ctx.rect(n, i, o, c),
                            t.clip(),
                            t.endPath()
                        }
                    },
                    setFillAndStrokeStyleToContext: function(t, n, i) {
                        switch (n) {
                        case e.COLORED:
                            var a = this.ctx;
                            t.fillStyle = a.fillStyle,
                            t.strokeStyle = a.strokeStyle;
                            break;
                        case e.UNCOLORED:
                            var s = r.makeCssRgb(i[0], i[1], i[2]);
                            t.fillStyle = s,
                            t.strokeStyle = s;
                            break;
                        default:
                            o("Unsupported paint type: " + n)
                        }
                    },
                    getPattern: function(t, e) {
                        var n = this.createPatternCanvas(e);
                        return t = this.ctx,
                        t.setTransform.apply(t, this.baseTransform),
                        t.transform.apply(t, this.matrix),
                        this.scaleToContext(),
                        t.createPattern(n, "repeat")
                    }
                },
                t
            }();
            t.getShadingPatternFromIR = i,
            t.TilingPattern = u
        }),
        function(t, e) {
            e(t.pdfjsDisplayCanvas = {}, t.pdfjsSharedUtil, t.pdfjsDisplayDOMUtils, t.pdfjsDisplayPatternHelper, t.pdfjsDisplayWebGL)
        }(this, function(t, e, n, i, r) {
            function a(t, e) {
                var n = document.createElement("canvas");
                return n.width = t,
                n.height = e,
                n
            }
            function s(t) {
                t.mozCurrentTransform || (t._originalSave = t.save,
                t._originalRestore = t.restore,
                t._originalRotate = t.rotate,
                t._originalScale = t.scale,
                t._originalTranslate = t.translate,
                t._originalTransform = t.transform,
                t._originalSetTransform = t.setTransform,
                t._transformMatrix = t._transformMatrix || [1, 0, 0, 1, 0, 0],
                t._transformStack = [],
                Object.defineProperty(t, "mozCurrentTransform", {
                    get: function() {
                        return this._transformMatrix
                    }
                }),
                Object.defineProperty(t, "mozCurrentTransformInverse", {
                    get: function() {
                        var t = this._transformMatrix
                          , e = t[0]
                          , n = t[1]
                          , i = t[2]
                          , r = t[3]
                          , a = t[4]
                          , s = t[5]
                          , o = e * r - n * i
                          , c = n * i - e * r;
                        return [r / o, n / c, i / c, e / o, (r * a - i * s) / c, (n * a - e * s) / o]
                    }
                }),
                t.save = function() {
                    var t = this._transformMatrix;
                    this._transformStack.push(t),
                    this._transformMatrix = t.slice(0, 6),
                    this._originalSave()
                }
                ,
                t.restore = function() {
                    var t = this._transformStack.pop();
                    t && (this._transformMatrix = t,
                    this._originalRestore())
                }
                ,
                t.translate = function(t, e) {
                    var n = this._transformMatrix;
                    n[4] = n[0] * t + n[2] * e + n[4],
                    n[5] = n[1] * t + n[3] * e + n[5],
                    this._originalTranslate(t, e)
                }
                ,
                t.scale = function(t, e) {
                    var n = this._transformMatrix;
                    n[0] = n[0] * t,
                    n[1] = n[1] * t,
                    n[2] = n[2] * e,
                    n[3] = n[3] * e,
                    this._originalScale(t, e)
                }
                ,
                t.transform = function(e, n, i, r, a, s) {
                    var o = this._transformMatrix;
                    this._transformMatrix = [o[0] * e + o[2] * n, o[1] * e + o[3] * n, o[0] * i + o[2] * r, o[1] * i + o[3] * r, o[0] * a + o[2] * s + o[4], o[1] * a + o[3] * s + o[5]],
                    t._originalTransform(e, n, i, r, a, s)
                }
                ,
                t.setTransform = function(e, n, i, r, a, s) {
                    this._transformMatrix = [e, n, i, r, a, s],
                    t._originalSetTransform(e, n, i, r, a, s)
                }
                ,
                t.rotate = function(t) {
                    var e = Math.cos(t)
                      , n = Math.sin(t)
                      , i = this._transformMatrix;
                    this._transformMatrix = [i[0] * e + i[2] * n, i[1] * e + i[3] * n, i[0] * -n + i[2] * e, i[1] * -n + i[3] * e, i[4], i[5]],
                    this._originalRotate(t)
                }
                )
            }
            function o(t) {
                var e, n, i, r, a = t.width, s = t.height, o = a + 1, c = new Uint8Array(o * (s + 1)), l = new Uint8Array([0, 2, 4, 0, 1, 0, 5, 4, 8, 10, 0, 8, 0, 2, 1, 0]), h = a + 7 & -8, u = t.data, d = new Uint8Array(h * s), p = 0;
                for (e = 0,
                r = u.length; e < r; e++)
                    for (var f = 128, g = u[e]; f > 0; )
                        d[p++] = g & f ? 0 : 255,
                        f >>= 1;
                var m = 0;
                for (p = 0,
                0 !== d[p] && (c[0] = 1,
                ++m),
                n = 1; n < a; n++)
                    d[p] !== d[p + 1] && (c[n] = d[p] ? 2 : 1,
                    ++m),
                    p++;
                for (0 !== d[p] && (c[n] = 2,
                ++m),
                e = 1; e < s; e++) {
                    p = e * h,
                    i = e * o,
                    d[p - h] !== d[p] && (c[i] = d[p] ? 1 : 8,
                    ++m);
                    var A = (d[p] ? 4 : 0) + (d[p - h] ? 8 : 0);
                    for (n = 1; n < a; n++)
                        A = (A >> 2) + (d[p + 1] ? 4 : 0) + (d[p - h + 1] ? 8 : 0),
                        l[A] && (c[i + n] = l[A],
                        ++m),
                        p++;
                    if (d[p - h] !== d[p] && (c[i + n] = d[p] ? 2 : 4,
                    ++m),
                    m > 1e3)
                        return null
                }
                for (p = h * (s - 1),
                i = e * o,
                0 !== d[p] && (c[i] = 8,
                ++m),
                n = 1; n < a; n++)
                    d[p] !== d[p + 1] && (c[i + n] = d[p] ? 4 : 8,
                    ++m),
                    p++;
                if (0 !== d[p] && (c[i + n] = 4,
                ++m),
                m > 1e3)
                    return null;
                var v = new Int32Array([0, o, -1, 0, -o, 0, 0, 0, 1])
                  , b = [];
                for (e = 0; m && e <= s; e++) {
                    for (var y = e * o, x = y + a; y < x && !c[y]; )
                        y++;
                    if (y !== x) {
                        var S, k = [y % o, e], C = c[y], _ = y;
                        do {
                            var w = v[C];
                            do
                                y += w;
                            while (!c[y]);
                            S = c[y],
                            5 !== S && 10 !== S ? (C = S,
                            c[y] = 0) : (C = S & 51 * C >> 4,
                            c[y] &= C >> 2 | C << 2),
                            k.push(y % o),
                            k.push(y / o | 0),
                            --m
                        } while (_ !== y);
                        b.push(k),
                        --e
                    }
                }
                return function(t) {
                    t.save(),
                    t.scale(1 / a, -1 / s),
                    t.translate(0, -s),
                    t.beginPath();
                    for (var e = 0, n = b.length; e < n; e++) {
                        var i = b[e];
                        t.moveTo(i[0], i[1]);
                        for (var r = 2, o = i.length; r < o; r += 2)
                            t.lineTo(i[r], i[r + 1])
                    }
                    t.fill(),
                    t.beginPath(),
                    t.restore()
                }
            }
            var c = e.FONT_IDENTITY_MATRIX
              , l = e.IDENTITY_MATRIX
              , h = e.ImageKind
              , u = e.OPS
              , d = e.TextRenderingMode
              , p = e.Uint32ArrayView
              , f = e.Util
              , g = e.assert
              , m = e.info
              , A = e.isNum
              , v = e.isArray
              , b = e.isLittleEndian
              , y = e.error
              , x = e.shadow
              , S = e.warn
              , k = i.TilingPattern
              , C = i.getShadingPatternFromIR
              , _ = r.WebGLUtils
              , w = n.hasCanvasTypedArrays
              , T = {
                get value() {
                    return x(T, "value", w())
                }
            }
              , L = {
                get value() {
                    return x(L, "value", b())
                }
            }
              , P = function() {
                function t() {
                    this.cache = Object.create(null)
                }
                return t.prototype = {
                    getCanvas: function(t, e, n, i) {
                        var r;
                        if (void 0 !== this.cache[t])
                            r = this.cache[t],
                            r.canvas.width = e,
                            r.canvas.height = n,
                            r.context.setTransform(1, 0, 0, 1, 0, 0);
                        else {
                            var o = a(e, n)
                              , c = o.getContext("2d");
                            i && s(c),
                            this.cache[t] = r = {
                                canvas: o,
                                context: c
                            }
                        }
                        return r
                    },
                    clear: function() {
                        for (var t in this.cache) {
                            var e = this.cache[t];
                            e.canvas.width = 0,
                            e.canvas.height = 0,
                            delete this.cache[t]
                        }
                    }
                },
                t
            }()
              , E = function() {
                function t(t) {
                    this.alphaIsShape = !1,
                    this.fontSize = 0,
                    this.fontSizeScale = 1,
                    this.textMatrix = l,
                    this.textMatrixScale = 1,
                    this.fontMatrix = c,
                    this.leading = 0,
                    this.x = 0,
                    this.y = 0,
                    this.lineX = 0,
                    this.lineY = 0,
                    this.charSpacing = 0,
                    this.wordSpacing = 0,
                    this.textHScale = 1,
                    this.textRenderingMode = d.FILL,
                    this.textRise = 0,
                    this.fillColor = "#000000",
                    this.strokeColor = "#000000",
                    this.patternFill = !1,
                    this.fillAlpha = 1,
                    this.strokeAlpha = 1,
                    this.lineWidth = 1,
                    this.activeSMask = null,
                    this.resumeSMaskCtx = null,
                    this.old = t
                }
                return t.prototype = {
                    clone: function() {
                        return Object.create(this)
                    },
                    setCurrentPoint: function(t, e) {
                        this.x = t,
                        this.y = e
                    }
                },
                t
            }()
              , R = function() {
                function t(t, e, n, i) {
                    this.ctx = t,
                    this.current = new E,
                    this.stateStack = [],
                    this.pendingClip = null,
                    this.pendingEOFill = !1,
                    this.res = null,
                    this.xobjs = null,
                    this.commonObjs = e,
                    this.objs = n,
                    this.imageLayer = i,
                    this.groupStack = [],
                    this.processingType3 = null,
                    this.baseTransform = null,
                    this.baseTransformStack = [],
                    this.groupLevel = 0,
                    this.smaskStack = [],
                    this.smaskCounter = 0,
                    this.tempSMask = null,
                    this.cachedCanvases = new P,
                    t && s(t),
                    this.cachedGetSinglePixelWidth = null
                }
                function e(t, e) {
                    if ("undefined" != typeof ImageData && e instanceof ImageData)
                        return void t.putImageData(e, 0, 0);
                    var n, i, r, a, s, o = e.height, c = e.width, l = o % 16, u = (o - l) / 16, d = 0 === l ? u : u + 1, f = t.createImageData(c, 16), g = 0, m = e.data, A = f.data;
                    if (e.kind === h.GRAYSCALE_1BPP) {
                        var v = m.byteLength
                          , b = T.value ? new Uint32Array(A.buffer) : new p(A)
                          , x = b.length
                          , S = c + 7 >> 3
                          , k = 4294967295
                          , C = L.value || !T.value ? 4278190080 : 255;
                        for (i = 0; i < d; i++) {
                            for (a = i < u ? 16 : l,
                            n = 0,
                            r = 0; r < a; r++) {
                                for (var _ = v - g, w = 0, P = _ > S ? c : 8 * _ - 7, E = P & -8, R = 0, I = 0; w < E; w += 8)
                                    I = m[g++],
                                    b[n++] = 128 & I ? k : C,
                                    b[n++] = 64 & I ? k : C,
                                    b[n++] = 32 & I ? k : C,
                                    b[n++] = 16 & I ? k : C,
                                    b[n++] = 8 & I ? k : C,
                                    b[n++] = 4 & I ? k : C,
                                    b[n++] = 2 & I ? k : C,
                                    b[n++] = 1 & I ? k : C;
                                for (; w < P; w++)
                                    0 === R && (I = m[g++],
                                    R = 128),
                                    b[n++] = I & R ? k : C,
                                    R >>= 1
                            }
                            for (; n < x; )
                                b[n++] = 0;
                            t.putImageData(f, 0, 16 * i)
                        }
                    } else if (e.kind === h.RGBA_32BPP) {
                        for (r = 0,
                        s = 16 * c * 4,
                        i = 0; i < u; i++)
                            A.set(m.subarray(g, g + s)),
                            g += s,
                            t.putImageData(f, 0, r),
                            r += 16;
                        i < d && (s = c * l * 4,
                        A.set(m.subarray(g, g + s)),
                        t.putImageData(f, 0, r))
                    } else if (e.kind === h.RGB_24BPP)
                        for (a = 16,
                        s = c * a,
                        i = 0; i < d; i++) {
                            for (i >= u && (a = l,
                            s = c * a),
                            n = 0,
                            r = s; r--; )
                                A[n++] = m[g++],
                                A[n++] = m[g++],
                                A[n++] = m[g++],
                                A[n++] = 255;
                            t.putImageData(f, 0, 16 * i)
                        }
                    else
                        y("bad image kind: " + e.kind)
                }
                function n(t, e) {
                    for (var n = e.height, i = e.width, r = n % 16, a = (n - r) / 16, s = 0 === r ? a : a + 1, o = t.createImageData(i, 16), c = 0, l = e.data, h = o.data, u = 0; u < s; u++) {
                        for (var d = u < a ? 16 : r, p = 3, f = 0; f < d; f++)
                            for (var g = 0, m = 0; m < i; m++) {
                                if (!g) {
                                    var A = l[c++];
                                    g = 128
                                }
                                h[p] = A & g ? 0 : 255,
                                p += 4,
                                g >>= 1
                            }
                        t.putImageData(o, 0, 16 * u)
                    }
                }
                function i(t, e) {
                    for (var n = ["strokeStyle", "fillStyle", "fillRule", "globalAlpha", "lineWidth", "lineCap", "lineJoin", "miterLimit", "globalCompositeOperation", "font"], i = 0, r = n.length; i < r; i++) {
                        var a = n[i];
                        void 0 !== t[a] && (e[a] = t[a])
                    }
                    void 0 !== t.setLineDash && (e.setLineDash(t.getLineDash()),
                    e.lineDashOffset = t.lineDashOffset)
                }
                function r(t, e, n, i) {
                    for (var r = t.length, a = 3; a < r; a += 4) {
                        var s = t[a];
                        if (0 === s)
                            t[a - 3] = e,
                            t[a - 2] = n,
                            t[a - 1] = i;
                        else if (s < 255) {
                            var o = 255 - s;
                            t[a - 3] = t[a - 3] * s + e * o >> 8,
                            t[a - 2] = t[a - 2] * s + n * o >> 8,
                            t[a - 1] = t[a - 1] * s + i * o >> 8
                        }
                    }
                }
                function a(t, e, n) {
                    for (var i = t.length, r = 3; r < i; r += 4) {
                        var a = n ? n[t[r]] : t[r];
                        e[r] = e[r] * a * (1 / 255) | 0
                    }
                }
                function b(t, e, n) {
                    for (var i = t.length, r = 3; r < i; r += 4) {
                        var a = 77 * t[r - 3] + 152 * t[r - 2] + 28 * t[r - 1];
                        e[r] = n ? e[r] * n[a >> 8] >> 8 : e[r] * a >> 16
                    }
                }
                function w(t, e, n, i, s, o, c) {
                    var l, h = !!o, u = h ? o[0] : 0, d = h ? o[1] : 0, p = h ? o[2] : 0;
                    l = "Luminosity" === s ? b : a;
                    for (var f = Math.min(i, Math.ceil(1048576 / n)), g = 0; g < i; g += f) {
                        var m = Math.min(f, i - g)
                          , A = t.getImageData(0, g, n, m)
                          , v = e.getImageData(0, g, n, m);
                        h && r(A.data, u, d, p),
                        l(A.data, v.data, c),
                        t.putImageData(v, 0, g)
                    }
                }
                function R(t, e, n) {
                    var i = e.canvas
                      , r = e.context;
                    t.setTransform(e.scaleX, 0, 0, e.scaleY, e.offsetX, e.offsetY);
                    var a = e.backdrop || null;
                    if (!e.transferMap && _.isEnabled) {
                        var s = _.composeSMask(n.canvas, i, {
                            subtype: e.subtype,
                            backdrop: a
                        });
                        return t.setTransform(1, 0, 0, 1, 0, 0),
                        void t.drawImage(s, e.offsetX, e.offsetY)
                    }
                    w(r, n, i.width, i.height, e.subtype, a, e.transferMap),
                    t.drawImage(i, 0, 0)
                }
                var I = ["butt", "round", "square"]
                  , D = ["miter", "round", "bevel"]
                  , j = {}
                  , O = {};
                t.prototype = {
                    beginDrawing: function(t, e, n) {
                        var i = this.ctx.canvas.width
                          , r = this.ctx.canvas.height;
                        if (this.ctx.save(),
                        this.ctx.fillStyle = "rgb(255, 255, 255)",
                        this.ctx.fillRect(0, 0, i, r),
                        this.ctx.restore(),
                        n) {
                            var a = this.cachedCanvases.getCanvas("transparent", i, r, !0);
                            this.compositeCtx = this.ctx,
                            this.transparentCanvas = a.canvas,
                            this.ctx = a.context,
                            this.ctx.save(),
                            this.ctx.transform.apply(this.ctx, this.compositeCtx.mozCurrentTransform)
                        }
                        this.ctx.save(),
                        t && this.ctx.transform.apply(this.ctx, t),
                        this.ctx.transform.apply(this.ctx, e.transform),
                        this.baseTransform = this.ctx.mozCurrentTransform.slice(),
                        this.imageLayer && this.imageLayer.beginLayout()
                    },
                    executeOperatorList: function(t, e, n, i) {
                        var r = t.argsArray
                          , a = t.fnArray
                          , s = e || 0
                          , o = r.length;
                        if (o === s)
                            return s;
                        for (var c, l = o - s > 10 && "function" == typeof n, h = l ? Date.now() + 15 : 0, d = 0, p = this.commonObjs, f = this.objs; ; ) {
                            if (void 0 !== i && s === i.nextBreakPoint)
                                return i.breakIt(s, n),
                                s;
                            if ((c = a[s]) !== u.dependency)
                                this[c].apply(this, r[s]);
                            else
                                for (var g = r[s], m = 0, A = g.length; m < A; m++) {
                                    var v = g[m]
                                      , b = "g" === v[0] && "_" === v[1]
                                      , y = b ? p : f;
                                    if (!y.isResolved(v))
                                        return y.get(v, n),
                                        s
                                }
                            if (++s === o)
                                return s;
                            if (l && ++d > 10) {
                                if (Date.now() > h)
                                    return n(),
                                    s;
                                d = 0
                            }
                        }
                    },
                    endDrawing: function() {
                        null !== this.current.activeSMask && this.endSMaskGroup(),
                        this.ctx.restore(),
                        this.transparentCanvas && (this.ctx = this.compositeCtx,
                        this.ctx.save(),
                        this.ctx.setTransform(1, 0, 0, 1, 0, 0),
                        this.ctx.drawImage(this.transparentCanvas, 0, 0),
                        this.ctx.restore(),
                        this.transparentCanvas = null),
                        this.cachedCanvases.clear(),
                        _.clear(),
                        this.imageLayer && this.imageLayer.endLayout()
                    },
                    setLineWidth: function(t) {
                        this.current.lineWidth = t,
                        this.ctx.lineWidth = t
                    },
                    setLineCap: function(t) {
                        this.ctx.lineCap = I[t]
                    },
                    setLineJoin: function(t) {
                        this.ctx.lineJoin = D[t]
                    },
                    setMiterLimit: function(t) {
                        this.ctx.miterLimit = t
                    },
                    setDash: function(t, e) {
                        var n = this.ctx;
                        void 0 !== n.setLineDash && (n.setLineDash(t),
                        n.lineDashOffset = e)
                    },
                    setRenderingIntent: function(t) {},
                    setFlatness: function(t) {},
                    setGState: function(t) {
                        for (var e = 0, n = t.length; e < n; e++) {
                            var i = t[e]
                              , r = i[0]
                              , a = i[1];
                            switch (r) {
                            case "LW":
                                this.setLineWidth(a);
                                break;
                            case "LC":
                                this.setLineCap(a);
                                break;
                            case "LJ":
                                this.setLineJoin(a);
                                break;
                            case "ML":
                                this.setMiterLimit(a);
                                break;
                            case "D":
                                this.setDash(a[0], a[1]);
                                break;
                            case "RI":
                                this.setRenderingIntent(a);
                                break;
                            case "FL":
                                this.setFlatness(a);
                                break;
                            case "Font":
                                this.setFont(a[0], a[1]);
                                break;
                            case "CA":
                                this.current.strokeAlpha = i[1];
                                break;
                            case "ca":
                                this.current.fillAlpha = i[1],
                                this.ctx.globalAlpha = i[1];
                                break;
                            case "BM":
                                if (a && a.name && "Normal" !== a.name) {
                                    var s = a.name.replace(/([A-Z])/g, function(t) {
                                        return "-" + t.toLowerCase()
                                    }).substring(1);
                                    this.ctx.globalCompositeOperation = s,
                                    this.ctx.globalCompositeOperation !== s && S('globalCompositeOperation "' + s + '" is not supported')
                                } else
                                    this.ctx.globalCompositeOperation = "source-over";
                                break;
                            case "SMask":
                                this.current.activeSMask && (this.stateStack.length > 0 && this.stateStack[this.stateStack.length - 1].activeSMask === this.current.activeSMask ? this.suspendSMaskGroup() : this.endSMaskGroup()),
                                this.current.activeSMask = a ? this.tempSMask : null,
                                this.current.activeSMask && this.beginSMaskGroup(),
                                this.tempSMask = null
                            }
                        }
                    },
                    beginSMaskGroup: function() {
                        var t = this.current.activeSMask
                          , e = t.canvas.width
                          , n = t.canvas.height
                          , r = "smaskGroupAt" + this.groupLevel
                          , a = this.cachedCanvases.getCanvas(r, e, n, !0)
                          , s = this.ctx
                          , o = s.mozCurrentTransform;
                        this.ctx.save();
                        var c = a.context;
                        c.scale(1 / t.scaleX, 1 / t.scaleY),
                        c.translate(-t.offsetX, -t.offsetY),
                        c.transform.apply(c, o),
                        t.startTransformInverse = c.mozCurrentTransformInverse,
                        i(s, c),
                        this.ctx = c,
                        this.setGState([["BM", "Normal"], ["ca", 1], ["CA", 1]]),
                        this.groupStack.push(s),
                        this.groupLevel++
                    },
                    suspendSMaskGroup: function() {
                        var t = this.ctx;
                        this.groupLevel--,
                        this.ctx = this.groupStack.pop(),
                        R(this.ctx, this.current.activeSMask, t),
                        this.ctx.restore(),
                        this.ctx.save(),
                        i(t, this.ctx),
                        this.current.resumeSMaskCtx = t;
                        var e = f.transform(this.current.activeSMask.startTransformInverse, t.mozCurrentTransform);
                        this.ctx.transform.apply(this.ctx, e),
                        t.save(),
                        t.setTransform(1, 0, 0, 1, 0, 0),
                        t.clearRect(0, 0, t.canvas.width, t.canvas.height),
                        t.restore()
                    },
                    resumeSMaskGroup: function() {
                        var t = this.current.resumeSMaskCtx
                          , e = this.ctx;
                        this.ctx = t,
                        this.groupStack.push(e),
                        this.groupLevel++
                    },
                    endSMaskGroup: function() {
                        var t = this.ctx;
                        this.groupLevel--,
                        this.ctx = this.groupStack.pop(),
                        R(this.ctx, this.current.activeSMask, t),
                        this.ctx.restore(),
                        i(t, this.ctx);
                        var e = f.transform(this.current.activeSMask.startTransformInverse, t.mozCurrentTransform);
                        this.ctx.transform.apply(this.ctx, e)
                    },
                    save: function() {
                        this.ctx.save();
                        var t = this.current;
                        this.stateStack.push(t),
                        this.current = t.clone(),
                        this.current.resumeSMaskCtx = null
                    },
                    restore: function() {
                        this.current.resumeSMaskCtx && this.resumeSMaskGroup(),
                        null === this.current.activeSMask || 0 !== this.stateStack.length && this.stateStack[this.stateStack.length - 1].activeSMask === this.current.activeSMask || this.endSMaskGroup(),
                        0 !== this.stateStack.length && (this.current = this.stateStack.pop(),
                        this.ctx.restore(),
                        this.pendingClip = null,
                        this.cachedGetSinglePixelWidth = null)
                    },
                    transform: function(t, e, n, i, r, a) {
                        this.ctx.transform(t, e, n, i, r, a),
                        this.cachedGetSinglePixelWidth = null
                    },
                    constructPath: function(t, e) {
                        for (var n = this.ctx, i = this.current, r = i.x, a = i.y, s = 0, o = 0, c = t.length; s < c; s++)
                            switch (0 | t[s]) {
                            case u.rectangle:
                                r = e[o++],
                                a = e[o++];
                                var l = e[o++]
                                  , h = e[o++];
                                0 === l && (l = this.getSinglePixelWidth()),
                                0 === h && (h = this.getSinglePixelWidth());
                                var d = r + l
                                  , p = a + h;
                                this.ctx.moveTo(r, a),
                                this.ctx.lineTo(d, a),
                                this.ctx.lineTo(d, p),
                                this.ctx.lineTo(r, p),
                                this.ctx.lineTo(r, a),
                                this.ctx.closePath();
                                break;
                            case u.moveTo:
                                r = e[o++],
                                a = e[o++],
                                n.moveTo(r, a);
                                break;
                            case u.lineTo:
                                r = e[o++],
                                a = e[o++],
                                n.lineTo(r, a);
                                break;
                            case u.curveTo:
                                r = e[o + 4],
                                a = e[o + 5],
                                n.bezierCurveTo(e[o], e[o + 1], e[o + 2], e[o + 3], r, a),
                                o += 6;
                                break;
                            case u.curveTo2:
                                n.bezierCurveTo(r, a, e[o], e[o + 1], e[o + 2], e[o + 3]),
                                r = e[o + 2],
                                a = e[o + 3],
                                o += 4;
                                break;
                            case u.curveTo3:
                                r = e[o + 2],
                                a = e[o + 3],
                                n.bezierCurveTo(e[o], e[o + 1], r, a, r, a),
                                o += 4;
                                break;
                            case u.closePath:
                                n.closePath()
                            }
                        i.setCurrentPoint(r, a)
                    },
                    closePath: function() {
                        this.ctx.closePath()
                    },
                    stroke: function(t) {
                        t = void 0 === t || t;
                        var e = this.ctx
                          , n = this.current.strokeColor;
                        e.lineWidth = Math.max(.65 * this.getSinglePixelWidth(), this.current.lineWidth),
                        e.globalAlpha = this.current.strokeAlpha,
                        n && n.hasOwnProperty("type") && "Pattern" === n.type ? (e.save(),
                        e.strokeStyle = n.getPattern(e, this),
                        e.stroke(),
                        e.restore()) : e.stroke(),
                        t && this.consumePath(),
                        e.globalAlpha = this.current.fillAlpha
                    },
                    closeStroke: function() {
                        this.closePath(),
                        this.stroke()
                    },
                    fill: function(t) {
                        t = void 0 === t || t;
                        var e = this.ctx
                          , n = this.current.fillColor
                          , i = this.current.patternFill
                          , r = !1;
                        i && (e.save(),
                        this.baseTransform && e.setTransform.apply(e, this.baseTransform),
                        e.fillStyle = n.getPattern(e, this),
                        r = !0),
                        this.pendingEOFill ? (void 0 !== e.mozFillRule ? (e.mozFillRule = "evenodd",
                        e.fill(),
                        e.mozFillRule = "nonzero") : e.fill("evenodd"),
                        this.pendingEOFill = !1) : e.fill(),
                        r && e.restore(),
                        t && this.consumePath()
                    },
                    eoFill: function() {
                        this.pendingEOFill = !0,
                        this.fill()
                    },
                    fillStroke: function() {
                        this.fill(!1),
                        this.stroke(!1),
                        this.consumePath()
                    },
                    eoFillStroke: function() {
                        this.pendingEOFill = !0,
                        this.fillStroke()
                    },
                    closeFillStroke: function() {
                        this.closePath(),
                        this.fillStroke()
                    },
                    closeEOFillStroke: function() {
                        this.pendingEOFill = !0,
                        this.closePath(),
                        this.fillStroke()
                    },
                    endPath: function() {
                        this.consumePath()
                    },
                    clip: function() {
                        this.pendingClip = j
                    },
                    eoClip: function() {
                        this.pendingClip = O
                    },
                    beginText: function() {
                        this.current.textMatrix = l,
                        this.current.textMatrixScale = 1,
                        this.current.x = this.current.lineX = 0,
                        this.current.y = this.current.lineY = 0
                    },
                    endText: function() {
                        var t = this.pendingTextPaths
                          , e = this.ctx;
                        if (void 0 === t)
                            return void e.beginPath();
                        e.save(),
                        e.beginPath();
                        for (var n = 0; n < t.length; n++) {
                            var i = t[n];
                            e.setTransform.apply(e, i.transform),
                            e.translate(i.x, i.y),
                            i.addToPath(e, i.fontSize)
                        }
                        e.restore(),
                        e.clip(),
                        e.beginPath(),
                        delete this.pendingTextPaths
                    },
                    setCharSpacing: function(t) {
                        this.current.charSpacing = t
                    },
                    setWordSpacing: function(t) {
                        this.current.wordSpacing = t
                    },
                    setHScale: function(t) {
                        this.current.textHScale = t / 100
                    },
                    setLeading: function(t) {
                        this.current.leading = -t
                    },
                    setFont: function(t, e) {
                        var n = this.commonObjs.get(t)
                          , i = this.current;
                        if (n || y("Can't find font for " + t),
                        i.fontMatrix = n.fontMatrix ? n.fontMatrix : c,
                        0 !== i.fontMatrix[0] && 0 !== i.fontMatrix[3] || S("Invalid font matrix for font " + t),
                        e < 0 ? (e = -e,
                        i.fontDirection = -1) : i.fontDirection = 1,
                        this.current.font = n,
                        this.current.fontSize = e,
                        !n.isType3Font) {
                            var r = n.loadedName || "sans-serif"
                              , a = n.black ? n.bold ? "900" : "bold" : n.bold ? "bold" : "normal"
                              , s = n.italic ? "italic" : "normal"
                              , o = '"' + r + '", ' + n.fallbackName
                              , l = e < 16 ? 16 : e > 100 ? 100 : e;
                            this.current.fontSizeScale = e / l;
                            var h = s + " " + a + " " + l + "px " + o;
                            this.ctx.font = h
                        }
                    },
                    setTextRenderingMode: function(t) {
                        this.current.textRenderingMode = t
                    },
                    setTextRise: function(t) {
                        this.current.textRise = t
                    },
                    moveText: function(t, e) {
                        this.current.x = this.current.lineX += t,
                        this.current.y = this.current.lineY += e
                    },
                    setLeadingMoveText: function(t, e) {
                        this.setLeading(-e),
                        this.moveText(t, e)
                    },
                    setTextMatrix: function(t, e, n, i, r, a) {
                        this.current.textMatrix = [t, e, n, i, r, a],
                        this.current.textMatrixScale = Math.sqrt(t * t + e * e),
                        this.current.x = this.current.lineX = 0,
                        this.current.y = this.current.lineY = 0
                    },
                    nextLine: function() {
                        this.moveText(0, this.current.leading)
                    },
                    paintChar: function(t, e, n) {
                        var i, r = this.ctx, a = this.current, s = a.font, o = a.textRenderingMode, c = a.fontSize / a.fontSizeScale, l = o & d.FILL_STROKE_MASK, h = !!(o & d.ADD_TO_PATH_FLAG);
                        if ((s.disableFontFace || h) && (i = s.getPathGenerator(this.commonObjs, t)),
                        s.disableFontFace ? (r.save(),
                        r.translate(e, n),
                        r.beginPath(),
                        i(r, c),
                        l !== d.FILL && l !== d.FILL_STROKE || r.fill(),
                        l !== d.STROKE && l !== d.FILL_STROKE || r.stroke(),
                        r.restore()) : (l !== d.FILL && l !== d.FILL_STROKE || r.fillText(t, e, n),
                        l !== d.STROKE && l !== d.FILL_STROKE || r.strokeText(t, e, n)),
                        h) {
                            (this.pendingTextPaths || (this.pendingTextPaths = [])).push({
                                transform: r.mozCurrentTransform,
                                x: e,
                                y: n,
                                fontSize: c,
                                addToPath: i
                            })
                        }
                    },
                    get isFontSubpixelAAEnabled() {
                        var t = document.createElement("canvas").getContext("2d");
                        t.scale(1.5, 1),
                        t.fillText("I", 0, 10);
                        for (var e = t.getImageData(0, 0, 10, 10).data, n = !1, i = 3; i < e.length; i += 4)
                            if (e[i] > 0 && e[i] < 255) {
                                n = !0;
                                break
                            }
                        return x(this, "isFontSubpixelAAEnabled", n)
                    },
                    showText: function(t) {
                        var e = this.current
                          , n = e.font;
                        if (n.isType3Font)
                            return this.showType3Text(t);
                        var i = e.fontSize;
                        if (0 !== i) {
                            var r = this.ctx
                              , a = e.fontSizeScale
                              , s = e.charSpacing
                              , o = e.wordSpacing
                              , c = e.fontDirection
                              , l = e.textHScale * c
                              , h = t.length
                              , u = n.vertical
                              , p = u ? 1 : -1
                              , f = n.defaultVMetrics
                              , g = i * e.fontMatrix[0]
                              , m = e.textRenderingMode === d.FILL && !n.disableFontFace;
                            r.save(),
                            r.transform.apply(r, e.textMatrix),
                            r.translate(e.x, e.y + e.textRise),
                            e.patternFill && (r.fillStyle = e.fillColor.getPattern(r, this)),
                            c > 0 ? r.scale(l, -1) : r.scale(l, 1);
                            var v = e.lineWidth
                              , b = e.textMatrixScale;
                            if (0 === b || 0 === v) {
                                var y = e.textRenderingMode & d.FILL_STROKE_MASK;
                                y !== d.STROKE && y !== d.FILL_STROKE || (this.cachedGetSinglePixelWidth = null,
                                v = .65 * this.getSinglePixelWidth())
                            } else
                                v /= b;
                            1 !== a && (r.scale(a, a),
                            v /= a),
                            r.lineWidth = v;
                            var x, S = 0;
                            for (x = 0; x < h; ++x) {
                                var k = t[x];
                                if (A(k))
                                    S += p * k * i / 1e3;
                                else {
                                    var C, _, w, T, L = !1, P = (k.isSpace ? o : 0) + s, E = k.fontChar, R = k.accent, I = k.width;
                                    if (u) {
                                        var D, j, O;
                                        D = k.vmetric || f,
                                        j = k.vmetric ? D[1] : .5 * I,
                                        j = -j * g,
                                        O = D[2] * g,
                                        I = D ? -D[0] : I,
                                        C = j / a,
                                        _ = (S + O) / a
                                    } else
                                        C = S / a,
                                        _ = 0;
                                    if (n.remeasure && I > 0) {
                                        var M = 1e3 * r.measureText(E).width / i * a;
                                        if (I < M && this.isFontSubpixelAAEnabled) {
                                            var F = I / M;
                                            L = !0,
                                            r.save(),
                                            r.scale(F, 1),
                                            C /= F
                                        } else
                                            I !== M && (C += (I - M) / 2e3 * i / a)
                                    }
                                    (k.isInFont || n.missingFile) && (m && !R ? r.fillText(E, C, _) : (this.paintChar(E, C, _),
                                    R && (w = C + R.offset.x / a,
                                    T = _ - R.offset.y / a,
                                    this.paintChar(R.fontChar, w, T))));
                                    S += I * g + P * c,
                                    L && r.restore()
                                }
                            }
                            u ? e.y -= S * l : e.x += S * l,
                            r.restore()
                        }
                    },
                    showType3Text: function(t) {
                        var e, n, i, r, a = this.ctx, s = this.current, o = s.font, l = s.fontSize, h = s.fontDirection, u = o.vertical ? 1 : -1, p = s.charSpacing, g = s.wordSpacing, m = s.textHScale * h, v = s.fontMatrix || c, b = t.length, y = s.textRenderingMode === d.INVISIBLE;
                        if (!y && 0 !== l) {
                            for (this.cachedGetSinglePixelWidth = null,
                            a.save(),
                            a.transform.apply(a, s.textMatrix),
                            a.translate(s.x, s.y),
                            a.scale(m, h),
                            e = 0; e < b; ++e)
                                if (n = t[e],
                                A(n))
                                    r = u * n * l / 1e3,
                                    this.ctx.translate(r, 0),
                                    s.x += r * m;
                                else {
                                    var x = (n.isSpace ? g : 0) + p
                                      , k = o.charProcOperatorList[n.operatorListId];
                                    if (k) {
                                        this.processingType3 = n,
                                        this.save(),
                                        a.scale(l, l),
                                        a.transform.apply(a, v),
                                        this.executeOperatorList(k),
                                        this.restore();
                                        var C = f.applyTransform([n.width, 0], v);
                                        i = C[0] * l + x,
                                        a.translate(i, 0),
                                        s.x += i * m
                                    } else
                                        S('Type3 character "' + n.operatorListId + '" is not available')
                                }
                            a.restore(),
                            this.processingType3 = null
                        }
                    },
                    setCharWidth: function(t, e) {},
                    setCharWidthAndBounds: function(t, e, n, i, r, a) {
                        this.ctx.rect(n, i, r - n, a - i),
                        this.clip(),
                        this.endPath()
                    },
                    getColorN_Pattern: function(e) {
                        var n;
                        if ("TilingPattern" === e[0]) {
                            var i = e[1]
                              , r = this.baseTransform || this.ctx.mozCurrentTransform.slice()
                              , a = this
                              , s = {
                                createCanvasGraphics: function(e) {
                                    return new t(e,a.commonObjs,a.objs)
                                }
                            };
                            n = new k(e,i,this.ctx,s,r)
                        } else
                            n = C(e);
                        return n
                    },
                    setStrokeColorN: function() {
                        this.current.strokeColor = this.getColorN_Pattern(arguments)
                    },
                    setFillColorN: function() {
                        this.current.fillColor = this.getColorN_Pattern(arguments),
                        this.current.patternFill = !0
                    },
                    setStrokeRGBColor: function(t, e, n) {
                        var i = f.makeCssRgb(t, e, n);
                        this.ctx.strokeStyle = i,
                        this.current.strokeColor = i
                    },
                    setFillRGBColor: function(t, e, n) {
                        var i = f.makeCssRgb(t, e, n);
                        this.ctx.fillStyle = i,
                        this.current.fillColor = i,
                        this.current.patternFill = !1
                    },
                    shadingFill: function(t) {
                        var e = this.ctx;
                        this.save();
                        var n = C(t);
                        e.fillStyle = n.getPattern(e, this, !0);
                        var i = e.mozCurrentTransformInverse;
                        if (i) {
                            var r = e.canvas
                              , a = r.width
                              , s = r.height
                              , o = f.applyTransform([0, 0], i)
                              , c = f.applyTransform([0, s], i)
                              , l = f.applyTransform([a, 0], i)
                              , h = f.applyTransform([a, s], i)
                              , u = Math.min(o[0], c[0], l[0], h[0])
                              , d = Math.min(o[1], c[1], l[1], h[1])
                              , p = Math.max(o[0], c[0], l[0], h[0])
                              , g = Math.max(o[1], c[1], l[1], h[1]);
                            this.ctx.fillRect(u, d, p - u, g - d)
                        } else
                            this.ctx.fillRect(-1e10, -1e10, 2e10, 2e10);
                        this.restore()
                    },
                    beginInlineImage: function() {
                        y("Should not call beginInlineImage")
                    },
                    beginImageData: function() {
                        y("Should not call beginImageData")
                    },
                    paintFormXObjectBegin: function(t, e) {
                        if (this.save(),
                        this.baseTransformStack.push(this.baseTransform),
                        v(t) && 6 === t.length && this.transform.apply(this, t),
                        this.baseTransform = this.ctx.mozCurrentTransform,
                        v(e) && 4 === e.length) {
                            var n = e[2] - e[0]
                              , i = e[3] - e[1];
                            this.ctx.rect(e[0], e[1], n, i),
                            this.clip(),
                            this.endPath()
                        }
                    },
                    paintFormXObjectEnd: function() {
                        this.restore(),
                        this.baseTransform = this.baseTransformStack.pop()
                    },
                    beginGroup: function(t) {
                        this.save();
                        var e = this.ctx;
                        t.isolated || m("TODO: Support non-isolated groups."),
                        t.knockout && S("Knockout groups not supported.");
                        var n = e.mozCurrentTransform;
                        t.matrix && e.transform.apply(e, t.matrix),
                        g(t.bbox, "Bounding box is required.");
                        var r = f.getAxialAlignedBoundingBox(t.bbox, e.mozCurrentTransform)
                          , a = [0, 0, e.canvas.width, e.canvas.height];
                        r = f.intersect(r, a) || [0, 0, 0, 0];
                        var s = Math.floor(r[0])
                          , o = Math.floor(r[1])
                          , c = Math.max(Math.ceil(r[2]) - s, 1)
                          , l = Math.max(Math.ceil(r[3]) - o, 1)
                          , h = 1
                          , u = 1;
                        c > 4096 && (h = c / 4096,
                        c = 4096),
                        l > 4096 && (u = l / 4096,
                        l = 4096);
                        var d = "groupAt" + this.groupLevel;
                        t.smask && (d += "_smask_" + this.smaskCounter++ % 2);
                        var p = this.cachedCanvases.getCanvas(d, c, l, !0)
                          , A = p.context;
                        A.scale(1 / h, 1 / u),
                        A.translate(-s, -o),
                        A.transform.apply(A, n),
                        t.smask ? this.smaskStack.push({
                            canvas: p.canvas,
                            context: A,
                            offsetX: s,
                            offsetY: o,
                            scaleX: h,
                            scaleY: u,
                            subtype: t.smask.subtype,
                            backdrop: t.smask.backdrop,
                            transferMap: t.smask.transferMap || null,
                            startTransformInverse: null
                        }) : (e.setTransform(1, 0, 0, 1, 0, 0),
                        e.translate(s, o),
                        e.scale(h, u)),
                        i(e, A),
                        this.ctx = A,
                        this.setGState([["BM", "Normal"], ["ca", 1], ["CA", 1]]),
                        this.groupStack.push(e),
                        this.groupLevel++,
                        this.current.activeSMask = null
                    },
                    endGroup: function(t) {
                        this.groupLevel--;
                        var e = this.ctx;
                        /*this.ctx = this.groupStack.pop(),
                        void 0 !== this.ctx.imageSmoothingEnabled ? this.ctx.imageSmoothingEnabled = !1 : this.ctx.mozImageSmoothingEnabled = !1,
                        t.smask ? this.tempSMask = this.smaskStack.pop() : this.ctx.drawImage(e.canvas, 0, 0),*/
                        this.restore()
                    },
                    beginAnnotations: function() {
                        this.save(),
                        this.current = new E,
                        this.baseTransform && this.ctx.setTransform.apply(this.ctx, this.baseTransform)
                    },
                    endAnnotations: function() {
                        this.restore()
                    },
                    beginAnnotation: function(t, e, n) {
                        if (this.save(),
                        v(t) && 4 === t.length) {
                            var i = t[2] - t[0]
                              , r = t[3] - t[1];
                            this.ctx.rect(t[0], t[1], i, r),
                            this.clip(),
                            this.endPath()
                        }
                        this.transform.apply(this, e),
                        this.transform.apply(this, n)
                    },
                    endAnnotation: function() {
                        this.restore()
                    },
                    paintJpegXObject: function(t, e, n) {
                        var i = this.objs.get(t);
                        if (!i)
                            return void S("Dependent image isn't ready yet");
                        this.save();
                        var r = this.ctx;
                        if (r.scale(1 / e, -1 / n),
                        r.drawImage(i, 0, 0, i.width, i.height, 0, -n, e, n),
                        this.imageLayer) {
                            var a = r.mozCurrentTransformInverse
                              , s = this.getCanvasPosition(0, 0);
                            this.imageLayer.appendImage({
                                objId: t,
                                left: s[0],
                                top: s[1],
                                width: e / a[0],
                                height: n / a[3]
                            })
                        }
                        this.restore()
                    },
                    paintImageMaskXObject: function(t) {
                        var e = this.ctx
                          , i = t.width
                          , r = t.height
                          , a = this.current.fillColor
                          , s = this.current.patternFill
                          , c = this.processingType3;
                        if (c && void 0 === c.compiled && (c.compiled = i <= 1e3 && r <= 1e3 ? o({
                            data: t.data,
                            width: i,
                            height: r
                        }) : null),
                        c && c.compiled)
                            return void c.compiled(e);
                        var l = this.cachedCanvases.getCanvas("maskCanvas", i, r)
                          , h = l.context;
                        h.save(),
                        n(h, t),
                        h.globalCompositeOperation = "source-in",
                        h.fillStyle = s ? a.getPattern(h, this) : a,
                        h.fillRect(0, 0, i, r),
                        h.restore(),
                        this.paintInlineImageXObject(l.canvas)
                    },
                    paintImageMaskXObjectRepeat: function(t, e, i, r) {
                        var a = t.width
                          , s = t.height
                          , o = this.current.fillColor
                          , c = this.current.patternFill
                          , l = this.cachedCanvases.getCanvas("maskCanvas", a, s)
                          , h = l.context;
                        h.save(),
                        n(h, t),
                        h.globalCompositeOperation = "source-in",
                        h.fillStyle = c ? o.getPattern(h, this) : o,
                        h.fillRect(0, 0, a, s),
                        h.restore();
                        for (var u = this.ctx, d = 0, p = r.length; d < p; d += 2)
                            u.save(),
                            u.transform(e, 0, 0, i, r[d], r[d + 1]),
                            u.scale(1, -1),
                            u.drawImage(l.canvas, 0, 0, a, s, 0, -1, 1, 1),
                            u.restore()
                    },
                    paintImageMaskXObjectGroup: function(t) {
                        for (var e = this.ctx, i = this.current.fillColor, r = this.current.patternFill, a = 0, s = t.length; a < s; a++) {
                            var o = t[a]
                              , c = o.width
                              , l = o.height
                              , h = this.cachedCanvases.getCanvas("maskCanvas", c, l)
                              , u = h.context;
                            u.save(),
                            n(u, o),
                            u.globalCompositeOperation = "source-in",
                            u.fillStyle = r ? i.getPattern(u, this) : i,
                            u.fillRect(0, 0, c, l),
                            u.restore(),
                            e.save(),
                            e.transform.apply(e, o.transform),
                            e.scale(1, -1),
                            e.drawImage(h.canvas, 0, 0, c, l, 0, -1, 1, 1),
                            e.restore()
                        }
                    },
                    paintImageXObject: function(t) {
                        var e = this.objs.get(t);
                        if (!e)
                            return void S("Dependent image isn't ready yet");
                        this.paintInlineImageXObject(e)
                    },
                    paintImageXObjectRepeat: function(t, e, n, i) {
                        var r = this.objs.get(t);
                        if (!r)
                            return void S("Dependent image isn't ready yet");
                        for (var a = r.width, s = r.height, o = [], c = 0, l = i.length; c < l; c += 2)
                            o.push({
                                transform: [e, 0, 0, n, i[c], i[c + 1]],
                                x: 0,
                                y: 0,
                                w: a,
                                h: s
                            });
                        this.paintInlineImageXObjectGroup(r, o)
                    },
                    paintInlineImageXObject: function(t) {
                        var n = t.width
                          , i = t.height
                          , r = this.ctx;
                        this.save(),
                        r.scale(1 / n, -1 / i);
                        var a, s, o = r.mozCurrentTransformInverse, c = o[0], l = o[1], h = Math.max(Math.sqrt(c * c + l * l), 1), u = o[2], d = o[3], p = Math.max(Math.sqrt(u * u + d * d), 1);
                        if (t instanceof HTMLElement || !t.data)
                            a = t;
                        else {
                            s = this.cachedCanvases.getCanvas("inlineImage", n, i);
                            var f = s.context;
                            e(f, t),
                            a = s.canvas
                        }
                        for (var g = n, m = i, A = "prescale1"; h > 2 && g > 1 || p > 2 && m > 1; ) {
                            var v = g
                              , b = m;
                            h > 2 && g > 1 && (v = Math.ceil(g / 2),
                            h /= g / v),
                            p > 2 && m > 1 && (b = Math.ceil(m / 2),
                            p /= m / b),
                            s = this.cachedCanvases.getCanvas(A, v, b),
                            f = s.context,
                            f.clearRect(0, 0, v, b),
                            f.drawImage(a, 0, 0, g, m, 0, 0, v, b),
                            a = s.canvas,
                            g = v,
                            m = b,
                            A = "prescale1" === A ? "prescale2" : "prescale1"
                        }
                        if (r.drawImage(a, 0, 0, g, m, 0, -i, n, i),
                        this.imageLayer) {
                            var y = this.getCanvasPosition(0, -i);
                            this.imageLayer.appendImage({
                                imgData: t,
                                left: y[0],
                                top: y[1],
                                width: n / o[0],
                                height: i / o[3]
                            })
                        }
                        this.restore()
                    },
                    paintInlineImageXObjectGroup: function(t, n) {
                        var i = this.ctx
                          , r = t.width
                          , a = t.height
                          , s = this.cachedCanvases.getCanvas("inlineImage", r, a);
                        e(s.context, t);
                        for (var o = 0, c = n.length; o < c; o++) {
                            var l = n[o];
                            if (i.save(),
                            i.transform.apply(i, l.transform),
                            i.scale(1, -1),
                            i.drawImage(s.canvas, l.x, l.y, l.w, l.h, 0, -1, 1, 1),
                            this.imageLayer) {
                                var h = this.getCanvasPosition(l.x, l.y);
                                this.imageLayer.appendImage({
                                    imgData: t,
                                    left: h[0],
                                    top: h[1],
                                    width: r,
                                    height: a
                                })
                            }
                            i.restore()
                        }
                    },
                    paintSolidColorImageMask: function() {
                        this.ctx.fillRect(0, 0, 1, 1)
                    },
                    paintXObject: function() {
                        S("Unsupported 'paintXObject' command.")
                    },
                    markPoint: function(t) {},
                    markPointProps: function(t, e) {},
                    beginMarkedContent: function(t) {},
                    beginMarkedContentProps: function(t, e) {},
                    endMarkedContent: function() {},
                    beginCompat: function() {},
                    endCompat: function() {},
                    consumePath: function() {
                        var t = this.ctx;
                        this.pendingClip && (this.pendingClip === O ? void 0 !== t.mozFillRule ? (t.mozFillRule = "evenodd",
                        t.clip(),
                        t.mozFillRule = "nonzero") : t.clip("evenodd") : t.clip(),
                        this.pendingClip = null),
                        t.beginPath()
                    },
                    getSinglePixelWidth: function(t) {
                        if (null === this.cachedGetSinglePixelWidth) {
                            this.ctx.save();
                            var e = this.ctx.mozCurrentTransformInverse;
                            this.ctx.restore(),
                            this.cachedGetSinglePixelWidth = Math.sqrt(Math.max(e[0] * e[0] + e[1] * e[1], e[2] * e[2] + e[3] * e[3]))
                        }
                        return this.cachedGetSinglePixelWidth
                    },
                    getCanvasPosition: function(t, e) {
                        var n = this.ctx.mozCurrentTransform;
                        return [n[0] * t + n[2] * e + n[4], n[1] * t + n[3] * e + n[5]]
                    }
                };
                for (var M in u)
                    t.prototype[u[M]] = t.prototype[M];
                return t
            }();
            t.CanvasGraphics = R,
            t.createScratchCanvas = a
        }),
        function(t, e) {
            e(t.pdfjsDisplayAPI = {}, t.pdfjsSharedUtil, t.pdfjsDisplayFontLoader, t.pdfjsDisplayCanvas, t.pdfjsDisplayMetadata, t.pdfjsDisplayDOMUtils)
        }(this, function(t, n, i, r, a, s, o) {
            function c(t, e, n, i) {
                var r = new H;
                arguments.length > 1 && k("getDocument is called with pdfDataRangeTransport, passwordCallback or progressCallback argument"),
                e && (e instanceof Y || (e = Object.create(e),
                e.length = t.length,
                e.initialData = t.initialData,
                e.abort || (e.abort = function() {}
                )),
                t = Object.create(t),
                t.range = e),
                r.onPassword = n || null,
                r.onProgress = i || null;
                var a;
                "string" == typeof t ? a = {
                    url: t
                } : L(t) ? a = {
                    data: t
                } : t instanceof Y ? a = {
                    range: t
                } : ("object" != typeof t && S("Invalid parameter in getDocument, need either Uint8Array, string or a parameter object"),
                t.url || t.data || t.range || S("Invalid parameter object: need either .data, .range or .url"),
                a = t);
                var s = {}
                  , o = null
                  , c = null;
                for (var h in a)
                    if ("url" !== h || "undefined" == typeof window)
                        if ("range" !== h)
                            if ("worker" !== h)
                                if ("data" !== h || a[h]instanceof Uint8Array)
                                    s[h] = a[h];
                                else {
                                    var u = a[h];
                                    "string" == typeof u ? s[h] = R(u) : "object" != typeof u || null === u || isNaN(u.length) ? L(u) ? s[h] = new Uint8Array(u) : S("Invalid PDF binary data: either typed array, string or array-like object is expected in the data property.") : s[h] = new Uint8Array(u)
                                }
                            else
                                c = a[h];
                        else
                            o = a[h];
                    else
                        s[h] = new URL(a[h],window.location).href;
                s.rangeChunkSize = s.rangeChunkSize || 65536,
                c || (c = new J,
                r._worker = c);
                var p = r.docId;
                return c.promise.then(function() {
                    if (r.destroyed)
                        throw new Error("Loading aborted");
                    return l(c, s, o, p).then(function(t) {
                        if (r.destroyed)
                            throw new Error("Loading aborted");
                        var e = new d(p,t,c.port)
                          , n = new Q(e,r,o);
                        r._transport = n,
                        e.send("Ready", null)
                    })
                }).catch(r._capability.reject),
                r
            }
            function l(t, e, n, i) {
                return t.destroyed ? Promise.reject(new Error("Worker was destroyed")) : (e.disableAutoFetch = U("disableAutoFetch"),
                e.disableStream = U("disableStream"),
                e.chunkedViewerLoading = !!n,
                n && (e.length = n.length,
                e.initialData = n.initialData),
                t.messageHandler.sendWithPromise("GetDocRequest", {
                    docId: i,
                    source: e,
                    disableRange: U("disableRange"),
                    maxImageSize: U("maxImageSize"),
                    cMapUrl: U("cMapUrl"),
                    cMapPacked: U("cMapPacked"),
                    disableFontFace: U("disableFontFace"),
                    disableCreateObjectURL: U("disableCreateObjectURL"),
                    postMessageTransfers: U("postMessageTransfers") && !W
                }).then(function(e) {
                    if (t.destroyed)
                        throw new Error("Worker was destroyed");
                    return e
                }))
            }
            var h, u = n.InvalidPDFException, d = n.MessageHandler, p = n.MissingPDFException, f = n.PageViewport, g = n.PasswordResponses, m = n.PasswordException, A = n.StatTimer, v = n.UnexpectedResponseException, b = n.UnknownErrorException, y = n.Util, x = n.createPromiseCapability, S = n.error, k = n.deprecated, C = n.getVerbosityLevel, _ = n.info, w = n.isInt, T = n.isArray, L = n.isArrayBuffer, P = n.isSameOrigin, E = n.loadJpegStream, R = n.stringToBytes, I = n.globalScope, D = n.warn, j = i.FontFaceObject, O = i.FontLoader, M = r.CanvasGraphics, F = r.createScratchCanvas, N = a.Metadata, U = s.getDefaultSetting, B = !1, W = !1, G = !1;
            "undefined" == typeof window && (B = !0,
            void 0 === require.ensure && (require.ensure = require("node-ensure")),
            G = !0),
            "undefined" != typeof __webpack_require__ && (G = !0),
            "undefined" != typeof requirejs && requirejs.toUrl && (h = requirejs.toUrl("pdfjs-dist/build/pdf.worker.js"));
            var X = "undefined" != typeof requirejs && requirejs.load
              , z = G ? function(t) {
                require.ensure([], function() {
                    t(require("./pdf.worker.js").WorkerMessageHandler)
                })
            }
            : X ? function(t) {
                requirejs(["pdfjs-dist/build/pdf.worker"], function(e) {
                    t(e.WorkerMessageHandler)
                })
            }
            : null
              , H = function() {
                function t() {
                    this._capability = x(),
                    this._transport = null,
                    this._worker = null,
                    this.docId = "d" + e++,
                    this.destroyed = !1,
                    this.onPassword = null,
                    this.onProgress = null,
                    this.onUnsupportedFeature = null
                }
                var e = Math.floor(1e6 * Math.random());
                return t.prototype = {
                    get promise() {
                        return this._capability.promise
                    },
                    destroy: function() {
                        return this.destroyed = !0,
                        (this._transport ? this._transport.destroy() : Promise.resolve()).then(function() {
                            this._transport = null,
                            this._worker && (this._worker.destroy(),
                            this._worker = null)
                        }
                        .bind(this))
                    },
                    then: function(t, e) {
                        return this.promise.then.apply(this.promise, arguments)
                    }
                },
                t
            }()
              , Y = function() {
                function t(t, e) {
                    this.length = t,
                    this.initialData = e,
                    this._rangeListeners = [],
                    this._progressListeners = [],
                    this._progressiveReadListeners = [],
                    this._readyCapability = x()
                }
                return t.prototype = {
                    addRangeListener: function(t) {
                        this._rangeListeners.push(t)
                    },
                    addProgressListener: function(t) {
                        this._progressListeners.push(t)
                    },
                    addProgressiveReadListener: function(t) {
                        this._progressiveReadListeners.push(t)
                    },
                    onDataRange: function(t, e) {
                        for (var n = this._rangeListeners, i = 0, r = n.length; i < r; ++i)
                            n[i](t, e)
                    },
                    onDataProgress: function(t) {
                        this._readyCapability.promise.then(function() {
                            for (var e = this._progressListeners, n = 0, i = e.length; n < i; ++n)
                                e[n](t)
                        }
                        .bind(this))
                    },
                    onDataProgressiveRead: function(t) {
                        this._readyCapability.promise.then(function() {
                            for (var e = this._progressiveReadListeners, n = 0, i = e.length; n < i; ++n)
                                e[n](t)
                        }
                        .bind(this))
                    },
                    transportReady: function() {
                        this._readyCapability.resolve()
                    },
                    requestDataRange: function(t, e) {
                        throw new Error("Abstract method PDFDataRangeTransport.requestDataRange")
                    },
                    abort: function() {}
                },
                t
            }()
              , q = function() {
                function t(t, e, n) {
                    this.pdfInfo = t,
                    this.transport = e,
                    this.loadingTask = n
                }
                return t.prototype = {
                    get numPages() {
                        return this.pdfInfo.numPages
                    },
                    get fingerprint() {
                        return this.pdfInfo.fingerprint
                    },
                    getPage: function(t) {
                        return this.transport.getPage(t)
                    },
                    getPageIndex: function(t) {
                        return this.transport.getPageIndex(t)
                    },
                    getDestinations: function() {
                        return this.transport.getDestinations()
                    },
                    getDestination: function(t) {
                        return this.transport.getDestination(t)
                    },
                    getPageLabels: function() {
                        return this.transport.getPageLabels()
                    },
                    getAttachments: function() {
                        return this.transport.getAttachments()
                    },
                    getJavaScript: function() {
                        return this.transport.getJavaScript()
                    },
                    getOutline: function() {
                        return this.transport.getOutline()
                    },
                    getMetadata: function() {
                        return this.transport.getMetadata()
                    },
                    getData: function() {
                        return this.transport.getData()
                    },
                    getDownloadInfo: function() {
                        return this.transport.downloadInfoCapability.promise
                    },
                    getStats: function() {
                        return this.transport.getStats()
                    },
                    cleanup: function() {
                        this.transport.startCleanup()
                    },
                    destroy: function() {
                        return this.loadingTask.destroy()
                    }
                },
                t
            }()
              , V = function() {
                function t(t, e, n) {
                    this.pageIndex = t,
                    this.pageInfo = e,
                    this.transport = n,
                    this.stats = new A,
                    this.stats.enabled = U("enableStats"),
                    this.commonObjs = n.commonObjs,
                    this.objs = new K,
                    this.cleanupAfterRender = !1,
                    this.pendingCleanup = !1,
                    this.intentStates = Object.create(null),
                    this.destroyed = !1
                }
                return t.prototype = {
                    get pageNumber() {
                        return this.pageIndex + 1
                    },
                    get rotate() {
                        return this.pageInfo.rotate
                    },
                    get ref() {
                        return this.pageInfo.ref
                    },
                    get view() {
                        return this.pageInfo.view
                    },
                    getViewport: function(t, e) {
                        return arguments.length < 2 && (e = this.rotate),
                        new f(this.view,t,e,0,0)
                    },
                    getAnnotations: function(t) {
                        var e = t && t.intent || null;
                        return this.annotationsPromise && this.annotationsIntent === e || (this.annotationsPromise = this.transport.getAnnotations(this.pageIndex, e),
                        this.annotationsIntent = e),
                        this.annotationsPromise
                    },
                    render: function(t) {
                        function e(t) {
                            var e = a.renderTasks.indexOf(s);
                            e >= 0 && a.renderTasks.splice(e, 1),
                            c.cleanupAfterRender && (c.pendingCleanup = !0),
                            c._tryCleanup(),
                            t ? s.capability.reject(t) : s.capability.resolve(),
                            n.timeEnd("Rendering"),
                            n.timeEnd("Overall")
                        }
                        var n = this.stats;
                        n.time("Overall"),
                        this.pendingCleanup = !1;
                        var i = "print" === t.intent ? "print" : "display"
                          , r = t.renderInteractiveForms === !0;
                        this.intentStates[i] || (this.intentStates[i] = Object.create(null));
                        var a = this.intentStates[i];
                        a.displayReadyCapability || (a.receivingOperatorList = !0,
                        a.displayReadyCapability = x(),
                        a.operatorList = {
                            fnArray: [],
                            argsArray: [],
                            lastChunk: !1
                        },
                        this.stats.time("Page Request"),
                        this.transport.messageHandler.send("RenderPageRequest", {
                            pageIndex: this.pageNumber - 1,
                            intent: i,
                            renderInteractiveForms: r
                        }));
                        var s = new $(e,t,this.objs,this.commonObjs,a.operatorList,this.pageNumber);
                        s.useRequestAnimationFrame = "print" !== i,
                        a.renderTasks || (a.renderTasks = []),
                        a.renderTasks.push(s);
                        var o = s.task;
                        t.continueCallback && (k("render is used with continueCallback parameter"),
                        o.onContinue = t.continueCallback);
                        var c = this;
                        return a.displayReadyCapability.promise.then(function(t) {
                            if (c.pendingCleanup)
                                return void e();
                            n.time("Rendering"),
                            s.initializeGraphics(t),
                            s.operatorListChanged()
                        }, function(t) {
                            e(t)
                        }),
                        o
                    },
                    getOperatorList: function() {
                        function t() {
                            if (n.operatorList.lastChunk) {
                                n.opListReadCapability.resolve(n.operatorList);
                                var t = n.renderTasks.indexOf(e);
                                t >= 0 && n.renderTasks.splice(t, 1)
                            }
                        }
                        this.intentStates.oplist || (this.intentStates.oplist = Object.create(null));
                        var e, n = this.intentStates.oplist;
                        return n.opListReadCapability || (e = {},
                        e.operatorListChanged = t,
                        n.receivingOperatorList = !0,
                        n.opListReadCapability = x(),
                        n.renderTasks = [],
                        n.renderTasks.push(e),
                        n.operatorList = {
                            fnArray: [],
                            argsArray: [],
                            lastChunk: !1
                        },
                        this.transport.messageHandler.send("RenderPageRequest", {
                            pageIndex: this.pageIndex,
                            intent: "oplist"
                        })),
                        n.opListReadCapability.promise
                    },
                    getTextContent: function(t) {
                        return this.transport.messageHandler.sendWithPromise("GetTextContent", {
                            pageIndex: this.pageNumber - 1,
                            normalizeWhitespace: !(!t || t.normalizeWhitespace !== !0),
                            combineTextItems: !t || t.disableCombineTextItems !== !0
                        })
                    },
                    _destroy: function() {
                        this.destroyed = !0,
                        this.transport.pageCache[this.pageIndex] = null;
                        var t = [];
                        return Object.keys(this.intentStates).forEach(function(e) {
                            if ("oplist" !== e) {
                                this.intentStates[e].renderTasks.forEach(function(e) {
                                    var n = e.capability.promise.catch(function() {});
                                    t.push(n),
                                    e.cancel()
                                })
                            }
                        }, this),
                        this.objs.clear(),
                        this.annotationsPromise = null,
                        this.pendingCleanup = !1,
                        Promise.all(t)
                    },
                    destroy: function() {
                        k("page destroy method, use cleanup() instead"),
                        this.cleanup()
                    },
                    cleanup: function() {
                        this.pendingCleanup = !0,
                        this._tryCleanup()
                    },
                    _tryCleanup: function() {
                        this.pendingCleanup && !Object.keys(this.intentStates).some(function(t) {
                            var e = this.intentStates[t];
                            return 0 !== e.renderTasks.length || e.receivingOperatorList
                        }, this) && (Object.keys(this.intentStates).forEach(function(t) {
                            delete this.intentStates[t]
                        }, this),
                        this.objs.clear(),
                        this.annotationsPromise = null,
                        this.pendingCleanup = !1)
                    },
                    _startRenderPage: function(t, e) {
                        var n = this.intentStates[e];
                        n.displayReadyCapability && n.displayReadyCapability.resolve(t)
                    },
                    _renderPageChunk: function(t, e) {
                        var n, i, r = this.intentStates[e];
                        for (n = 0,
                        i = t.length; n < i; n++)
                            r.operatorList.fnArray.push(t.fnArray[n]),
                            r.operatorList.argsArray.push(t.argsArray[n]);
                        for (r.operatorList.lastChunk = t.lastChunk,
                        n = 0; n < r.renderTasks.length; n++)
                            r.renderTasks[n].operatorListChanged();
                        t.lastChunk && (r.receivingOperatorList = !1,
                        this._tryCleanup())
                    }
                },
                t
            }()
              , J = function() {
                function t() {
                    return void 0 !== h ? h : U("workerSrc") ? U("workerSrc") : e ? e.replace(/\.js$/i, ".worker.js") : void S("No PDFJS.workerSrc specified")
                }
                function n() {
                    if (!s) {
                        s = x();
                        (z || function(e) {
                            y.loadScript(t(), function() {
                                e(window.pdfjsDistBuildPdfWorker.WorkerMessageHandler)
                            })
                        }
                        )(s.resolve)
                    }
                    return s.promise
                }
                function i(t) {
                    this._listeners = [],
                    this._defer = t,
                    this._deferred = Promise.resolve(void 0)
                }
                function r(t) {
                    var e = "importScripts('" + t + "');";
                    return URL.createObjectURL(new Blob([e]))
                }
                function a(t) {
                    this.name = t,
                    this.destroyed = !1,
                    this._readyCapability = x(),
                    this._port = null,
                    this._webWorker = null,
                    this._messageHandler = null,
                    this._initialize()
                }
                var s, o = 0;
                return i.prototype = {
                    postMessage: function(t, e) {
                        function n(t) {
                            if ("object" != typeof t || null === t)
                                return t;
                            if (i.has(t))
                                return i.get(t);
                            var r, a;
                            if ((a = t.buffer) && L(a)) {
                                var s = e && e.indexOf(a) >= 0;
                                return r = t === a ? t : s ? new t.constructor(a,t.byteOffset,t.byteLength) : new t.constructor(t),
                                i.set(t, r),
                                r
                            }
                            r = T(t) ? [] : {},
                            i.set(t, r);
                            for (var o in t) {
                                for (var c, l = t; !(c = Object.getOwnPropertyDescriptor(l, o)); )
                                    l = Object.getPrototypeOf(l);
                                void 0 !== c.value && "function" != typeof c.value && (r[o] = n(c.value))
                            }
                            return r
                        }
                        if (!this._defer)
                            return void this._listeners.forEach(function(e) {
                                e.call(this, {
                                    data: t
                                })
                            }, this);
                        var i = new WeakMap
                          , r = {
                            data: n(t)
                        };
                        this._deferred.then(function() {
                            this._listeners.forEach(function(t) {
                                t.call(this, r)
                            }, this)
                        }
                        .bind(this))
                    },
                    addEventListener: function(t, e) {
                        this._listeners.push(e)
                    },
                    removeEventListener: function(t, e) {
                        var n = this._listeners.indexOf(e);
                        this._listeners.splice(n, 1)
                    },
                    terminate: function() {
                        this._listeners = []
                    }
                },
                a.prototype = {
                    get promise() {
                        return this._readyCapability.promise
                    },
                    get port() {
                        return this._port
                    },
                    get messageHandler() {
                        return this._messageHandler
                    },
                    _initialize: function() {
                        if (!B && !U("disableWorker") && "undefined" != typeof Worker) {
                            var e = t();
                            try {
                                P(window.location.href, e) || (e = r(new URL(e,window.location).href));
                                var n = new Worker(e)
                                  , i = new d("main","worker",n)
                                  , a = function() {
                                    n.removeEventListener("error", s),
                                    i.destroy(),
                                    n.terminate(),
                                    this.destroyed ? this._readyCapability.reject(new Error("Worker was destroyed")) : this._setupFakeWorker()
                                }
                                .bind(this)
                                  , s = function(t) {
                                    this._webWorker || a()
                                }
                                .bind(this);
                                n.addEventListener("error", s),
                                i.on("test", function(t) {
                                    if (n.removeEventListener("error", s),
                                    this.destroyed)
                                        return void a();
                                    t && t.supportTypedArray ? (this._messageHandler = i,
                                    this._port = n,
                                    this._webWorker = n,
                                    t.supportTransfers || (W = !0),
                                    this._readyCapability.resolve(),
                                    i.send("configure", {
                                        verbosity: C()
                                    })) : (this._setupFakeWorker(),
                                    i.destroy(),
                                    n.terminate())
                                }
                                .bind(this)),
                                i.on("console_log", function(t) {
                                    console.log.apply(console, t)
                                }),
                                i.on("console_error", function(t) {
                                    console.error.apply(console, t)
                                }),
                                i.on("ready", function(t) {
                                    if (n.removeEventListener("error", s),
                                    this.destroyed)
                                        return void a();
                                    try {
                                        o()
                                    } catch (t) {
                                        this._setupFakeWorker()
                                    }
                                }
                                .bind(this));
                                var o = function() {
                                    var t = U("postMessageTransfers") && !W
                                      , e = new Uint8Array([t ? 255 : 0]);
                                    try {
                                        i.send("test", e, [e.buffer])
                                    } catch (t) {
                                        _("Cannot use postMessage transfers"),
                                        e[0] = 0,
                                        i.send("test", e)
                                    }
                                };
                                return void o()
                            } catch (t) {
                                _("The worker has been disabled.")
                            }
                        }
                        this._setupFakeWorker()
                    },
                    _setupFakeWorker: function() {
                        B || U("disableWorker") || (D("Setting up fake worker."),
                        B = !0),
                        n().then(function(t) {
                            if (this.destroyed)
                                return void this._readyCapability.reject(new Error("Worker was destroyed"));
                            var e = Uint8Array !== Float32Array
                              , n = new i(e);
                            this._port = n;
                            var r = "fake" + o++
                              , a = new d(r + "_worker",r,n);
                            t.setup(a, n);
                            var s = new d(r,r + "_worker",n);
                            this._messageHandler = s,
                            this._readyCapability.resolve()
                        }
                        .bind(this))
                    },
                    destroy: function() {
                        this.destroyed = !0,
                        this._webWorker && (this._webWorker.terminate(),
                        this._webWorker = null),
                        this._port = null,
                        this._messageHandler && (this._messageHandler.destroy(),
                        this._messageHandler = null)
                    }
                },
                a
            }()
              , Q = function() {
                function t(t, e, n) {
                    this.messageHandler = t,
                    this.loadingTask = e,
                    this.pdfDataRangeTransport = n,
                    this.commonObjs = new K,
                    this.fontLoader = new O(e.docId),
                    this.destroyed = !1,
                    this.destroyCapability = null,
                    this.pageCache = [],
                    this.pagePromises = [],
                    this.downloadInfoCapability = x(),
                    this.setupMessageHandler()
                }
                return t.prototype = {
                    destroy: function() {
                        if (this.destroyCapability)
                            return this.destroyCapability.promise;
                        this.destroyed = !0,
                        this.destroyCapability = x();
                        var t = [];
                        this.pageCache.forEach(function(e) {
                            e && t.push(e._destroy())
                        }),
                        this.pageCache = [],
                        this.pagePromises = [];
                        var e = this
                          , n = this.messageHandler.sendWithPromise("Terminate", null);
                        return t.push(n),
                        Promise.all(t).then(function() {
                            e.fontLoader.clear(),
                            e.pdfDataRangeTransport && (e.pdfDataRangeTransport.abort(),
                            e.pdfDataRangeTransport = null),
                            e.messageHandler && (e.messageHandler.destroy(),
                            e.messageHandler = null),
                            e.destroyCapability.resolve()
                        }, this.destroyCapability.reject),
                        this.destroyCapability.promise
                    },
                    setupMessageHandler: function() {
                        function t(t) {
                            e.send("UpdatePassword", t)
                        }
                        var e = this.messageHandler
                          , n = this.pdfDataRangeTransport;
                        n && (n.addRangeListener(function(t, n) {
                            e.send("OnDataRange", {
                                begin: t,
                                chunk: n
                            })
                        }),
                        n.addProgressListener(function(t) {
                            e.send("OnDataProgress", {
                                loaded: t
                            })
                        }),
                        n.addProgressiveReadListener(function(t) {
                            e.send("OnDataRange", {
                                chunk: t
                            })
                        }),
                        e.on("RequestDataRange", function(t) {
                            n.requestDataRange(t.begin, t.end)
                        }, this)),
                        e.on("GetDoc", function(t) {
                            var e = t.pdfInfo;
                            this.numPages = t.pdfInfo.numPages;
                            var n = this.loadingTask
                              , i = new q(e,this,n);
                            this.pdfDocument = i,
                            n._capability.resolve(i)
                        }, this),
                        e.on("NeedPassword", function(e) {
                            var n = this.loadingTask;
                            if (n.onPassword)
                                return n.onPassword(t, g.NEED_PASSWORD);
                            n._capability.reject(new m(e.message,e.code))
                        }, this),
                        e.on("IncorrectPassword", function(e) {
                            var n = this.loadingTask;
                            if (n.onPassword)
                                return n.onPassword(t, g.INCORRECT_PASSWORD);
                            n._capability.reject(new m(e.message,e.code))
                        }, this),
                        e.on("InvalidPDF", function(t) {
                            this.loadingTask._capability.reject(new u(t.message))
                        }, this),
                        e.on("MissingPDF", function(t) {
                            this.loadingTask._capability.reject(new p(t.message))
                        }, this),
                        e.on("UnexpectedResponse", function(t) {
                            this.loadingTask._capability.reject(new v(t.message,t.status))
                        }, this),
                        e.on("UnknownError", function(t) {
                            this.loadingTask._capability.reject(new b(t.message,t.details))
                        }, this),
                        e.on("DataLoaded", function(t) {
                            this.downloadInfoCapability.resolve(t)
                        }, this),
                        e.on("PDFManagerReady", function(t) {
                            this.pdfDataRangeTransport && this.pdfDataRangeTransport.transportReady()
                        }, this),
                        e.on("StartRenderPage", function(t) {
                            if (!this.destroyed) {
                                var e = this.pageCache[t.pageIndex];
                                e.stats.timeEnd("Page Request"),
                                e._startRenderPage(t.transparency, t.intent)
                            }
                        }, this),
                        e.on("RenderPageChunk", function(t) {
                            if (!this.destroyed) {
                                this.pageCache[t.pageIndex]._renderPageChunk(t.operatorList, t.intent)
                            }
                        }, this),
                        e.on("commonobj", function(t) {
                            if (!this.destroyed) {
                                var e = t[0]
                                  , n = t[1];
                                if (!this.commonObjs.hasData(e))
                                    switch (n) {
                                    case "Font":
                                        var i = t[2];
                                        if ("error"in i) {
                                            var r = i.error;
                                            D("Error during font loading: " + r),
                                            this.commonObjs.resolve(e, r);
                                            break
                                        }
                                        var a = null;
                                        U("pdfBug") && I.FontInspector && I.FontInspector.enabled && (a = {
                                            registerFont: function(t, e) {
                                                I.FontInspector.fontAdded(t, e)
                                            }
                                        });
                                        var s = new j(i,{
                                            isEvalSuported: U("isEvalSupported"),
                                            disableFontFace: U("disableFontFace"),
                                            fontRegistry: a
                                        });
                                        this.fontLoader.bind([s], function(t) {
                                            this.commonObjs.resolve(e, s)
                                        }
                                        .bind(this));
                                        break;
                                    case "FontPath":
                                        this.commonObjs.resolve(e, t[2]);
                                        break;
                                    default:
                                        S("Got unknown common object type " + n)
                                    }
                            }
                        }, this),
                        e.on("obj", function(t) {
                            if (!this.destroyed) {
                                var e, n = t[0], i = t[1], r = t[2], a = this.pageCache[i];
                                if (!a.objs.hasData(n))
                                    switch (r) {
                                    case "JpegStream":
                                        e = t[3],
                                        E(n, e, a.objs);
                                        break;
                                    case "Image":
                                        e = t[3],
                                        a.objs.resolve(n, e);
                                        e && "data"in e && e.data.length > 8e6 && (a.cleanupAfterRender = !0);
                                        break;
                                    default:
                                        S("Got unknown object type " + r)
                                    }
                            }
                        }, this),
                        e.on("DocProgress", function(t) {
                            if (!this.destroyed) {
                                var e = this.loadingTask;
                                e.onProgress && e.onProgress({
                                    loaded: t.loaded,
                                    total: t.total
                                })
                            }
                        }, this),
                        e.on("PageError", function(t) {
                            if (!this.destroyed) {
                                var e = this.pageCache[t.pageNum - 1]
                                  , n = e.intentStates[t.intent];
                                if (n.displayReadyCapability ? n.displayReadyCapability.reject(t.error) : S(t.error),
                                n.operatorList) {
                                    n.operatorList.lastChunk = !0;
                                    for (var i = 0; i < n.renderTasks.length; i++)
                                        n.renderTasks[i].operatorListChanged()
                                }
                            }
                        }, this),
                        e.on("UnsupportedFeature", function(t) {
                            if (!this.destroyed) {
                                var e = t.featureId
                                  , n = this.loadingTask;
                                n.onUnsupportedFeature && n.onUnsupportedFeature(e),
                                tt.notify(e)
                            }
                        }, this),
                        e.on("JpegDecode", function(t) {
                            if (this.destroyed)
                                return Promise.reject(new Error("Worker was destroyed"));
                            var e = t[0]
                              , n = t[1];
                            return 3 !== n && 1 !== n ? Promise.reject(new Error("Only 3 components or 1 component can be returned")) : new Promise(function(t, i) {
                                var r = new Image;
                                r.onload = function() {
                                    var e = r.width
                                      , i = r.height
                                      , a = e * i
                                      , s = 4 * a
                                      , o = new Uint8Array(a * n)
                                      , c = F(e, i)
                                      , l = c.getContext("2d");
                                    l.drawImage(r, 0, 0);
                                    var h, u, d = l.getImageData(0, 0, e, i).data;
                                    if (3 === n)
                                        for (h = 0,
                                        u = 0; h < s; h += 4,
                                        u += 3)
                                            o[u] = d[h],
                                            o[u + 1] = d[h + 1],
                                            o[u + 2] = d[h + 2];
                                    else if (1 === n)
                                        for (h = 0,
                                        u = 0; h < s; h += 4,
                                        u++)
                                            o[u] = d[h];
                                    t({
                                        data: o,
                                        width: e,
                                        height: i
                                    })
                                }
                                ,
                                r.onerror = function() {
                                    i(new Error("JpegDecode failed to load image"))
                                }
                                ,
                                r.src = e
                            }
                            )
                        }, this)
                    },
                    getData: function() {
                        return this.messageHandler.sendWithPromise("GetData", null)
                    },
                    getPage: function(t, e) {
                        if (!w(t) || t <= 0 || t > this.numPages)
                            return Promise.reject(new Error("Invalid page request"));
                        var n = t - 1;
                        if (n in this.pagePromises)
                            return this.pagePromises[n];
                        var i = this.messageHandler.sendWithPromise("GetPage", {
                            pageIndex: n
                        }).then(function(t) {
                            if (this.destroyed)
                                throw new Error("Transport destroyed");
                            var e = new V(n,t,this);
                            return this.pageCache[n] = e,
                            e
                        }
                        .bind(this));
                        return this.pagePromises[n] = i,
                        i
                    },
                    getPageIndex: function(t) {
                        return this.messageHandler.sendWithPromise("GetPageIndex", {
                            ref: t
                        }).catch(function(t) {
                            return Promise.reject(new Error(t))
                        })
                    },
                    getAnnotations: function(t, e) {
                        return this.messageHandler.sendWithPromise("GetAnnotations", {
                            pageIndex: t,
                            intent: e
                        })
                    },
                    getDestinations: function() {
                        return this.messageHandler.sendWithPromise("GetDestinations", null)
                    },
                    getDestination: function(t) {
                        return this.messageHandler.sendWithPromise("GetDestination", {
                            id: t
                        })
                    },
                    getPageLabels: function() {
                        return this.messageHandler.sendWithPromise("GetPageLabels", null)
                    },
                    getAttachments: function() {
                        return this.messageHandler.sendWithPromise("GetAttachments", null)
                    },
                    getJavaScript: function() {
                        return this.messageHandler.sendWithPromise("GetJavaScript", null)
                    },
                    getOutline: function() {
                        return this.messageHandler.sendWithPromise("GetOutline", null)
                    },
                    getMetadata: function() {
                        return this.messageHandler.sendWithPromise("GetMetadata", null).then(function(t) {
                            return {
                                info: t[0],
                                metadata: t[1] ? new N(t[1]) : null
                            }
                        })
                    },
                    getStats: function() {
                        return this.messageHandler.sendWithPromise("GetStats", null)
                    },
                    startCleanup: function() {
                        this.messageHandler.sendWithPromise("Cleanup", null).then(function() {
                            for (var t = 0, e = this.pageCache.length; t < e; t++) {
                                var n = this.pageCache[t];
                                n && n.cleanup()
                            }
                            this.commonObjs.clear(),
                            this.fontLoader.clear()
                        }
                        .bind(this))
                    }
                },
                t
            }()
              , K = function() {
                function t() {
                    this.objs = Object.create(null)
                }
                return t.prototype = {
                    ensureObj: function(t) {
                        if (this.objs[t])
                            return this.objs[t];
                        var e = {
                            capability: x(),
                            data: null,
                            resolved: !1
                        };
                        return this.objs[t] = e,
                        e
                    },
                    get: function(t, e) {
                        if (e)
                            return this.ensureObj(t).capability.promise.then(e),
                            null;
                        var n = this.objs[t];
                        return n && n.resolved || S("Requesting object that isn't resolved yet " + t),
                        n.data
                    },
                    resolve: function(t, e) {
                        var n = this.ensureObj(t);
                        n.resolved = !0,
                        n.data = e,
                        n.capability.resolve(e)
                    },
                    isResolved: function(t) {
                        var e = this.objs;
                        return !!e[t] && e[t].resolved
                    },
                    hasData: function(t) {
                        return this.isResolved(t)
                    },
                    getData: function(t) {
                        var e = this.objs;
                        return e[t] && e[t].resolved ? e[t].data : null
                    },
                    clear: function() {
                        this.objs = Object.create(null)
                    }
                },
                t
            }()
              , Z = function() {
                function t(t) {
                    this._internalRenderTask = t,
                    this.onContinue = null
                }
                return t.prototype = {
                    get promise() {
                        return this._internalRenderTask.capability.promise
                    },
                    cancel: function() {
                        this._internalRenderTask.cancel()
                    },
                    then: function(t, e) {
                        return this.promise.then.apply(this.promise, arguments)
                    }
                },
                t
            }()
              , $ = function() {
                function t(t, e, n, i, r, a) {
                    this.callback = t,
                    this.params = e,
                    this.objs = n,
                    this.commonObjs = i,
                    this.operatorListIdx = null,
                    this.operatorList = r,
                    this.pageNumber = a,
                    this.running = !1,
                    this.graphicsReadyCallback = null,
                    this.graphicsReady = !1,
                    this.useRequestAnimationFrame = !1,
                    this.cancelled = !1,
                    this.capability = x(),
                    this.task = new Z(this),
                    this._continueBound = this._continue.bind(this),
                    this._scheduleNextBound = this._scheduleNext.bind(this),
                    this._nextBound = this._next.bind(this)
                }
                return t.prototype = {
                    initializeGraphics: function(t) {
                        if (!this.cancelled) {
                            U("pdfBug") && I.StepperManager && I.StepperManager.enabled && (this.stepper = I.StepperManager.create(this.pageNumber - 1),
                            this.stepper.init(this.operatorList),
                            this.stepper.nextBreakPoint = this.stepper.getNextBreakPoint());
                            var e = this.params;
                            this.gfx = new M(e.canvasContext,this.commonObjs,this.objs,e.imageLayer),
                            this.gfx.beginDrawing(e.transform, e.viewport, t),
                            this.operatorListIdx = 0,
                            this.graphicsReady = !0,
                            this.graphicsReadyCallback && this.graphicsReadyCallback()
                        }
                    },
                    cancel: function() {
                        this.running = !1,
                        this.cancelled = !0,
                        this.callback("cancelled")
                    },
                    operatorListChanged: function() {
                        if (!this.graphicsReady)
                            return void (this.graphicsReadyCallback || (this.graphicsReadyCallback = this._continueBound));
                        this.stepper && this.stepper.updateOperatorList(this.operatorList),
                        this.running || this._continue()
                    },
                    _continue: function() {
                        this.running = !0,
                        this.cancelled || (this.task.onContinue ? this.task.onContinue.call(this.task, this._scheduleNextBound) : this._scheduleNext())
                    },
                    _scheduleNext: function() {
                        this.useRequestAnimationFrame && "undefined" != typeof window ? window.requestAnimationFrame(this._nextBound) : Promise.resolve(void 0).then(this._nextBound)
                    },
                    _next: function() {
                        this.cancelled || (this.operatorListIdx = this.gfx.executeOperatorList(this.operatorList, this.operatorListIdx, this._continueBound, this.stepper),
                        this.operatorListIdx === this.operatorList.argsArray.length && (this.running = !1,
                        this.operatorList.lastChunk && (this.gfx.endDrawing(),
                        this.callback())))
                    }
                },
                t
            }()
              , tt = function() {
                var t = [];
                return {
                    listen: function(e) {
                        k("Global UnsupportedManager.listen is used:  use PDFDocumentLoadingTask.onUnsupportedFeature instead"),
                        t.push(e)
                    },
                    notify: function(e) {
                        for (var n = 0, i = t.length; n < i; n++)
                            t[n](e)
                    }
                }
            }();
            t.version = "1.6.214",
            t.build = "86bdfab",
            t.getDocument = c,
            t.PDFDataRangeTransport = Y,
            t.PDFWorker = J,
            t.PDFDocumentProxy = q,
            t.PDFPageProxy = V,
            t._UnsupportedManager = tt
        }),
        function(t, e) {
            e(t.pdfjsDisplayGlobal = {}, t.pdfjsSharedUtil, t.pdfjsDisplayDOMUtils, t.pdfjsDisplayAPI, t.pdfjsDisplayAnnotationLayer, t.pdfjsDisplayTextLayer, t.pdfjsDisplayMetadata, t.pdfjsDisplaySVG)
        }(this, function(t, e, n, i, r, a, s, o) {
            var c = e.globalScope
              , l = e.deprecated
              , h = e.warn
              , u = n.LinkTarget
              , d = "undefined" == typeof window;
            c.PDFJS || (c.PDFJS = {});
            var p = c.PDFJS;
            p.version = "1.6.214",
            p.build = "86bdfab",
            p.pdfBug = !1,
            void 0 !== p.verbosity && e.setVerbosityLevel(p.verbosity),
            delete p.verbosity,
            Object.defineProperty(p, "verbosity", {
                get: function() {
                    return e.getVerbosityLevel()
                },
                set: function(t) {
                    e.setVerbosityLevel(t)
                },
                enumerable: !0,
                configurable: !0
            }),
            p.VERBOSITY_LEVELS = e.VERBOSITY_LEVELS,
            p.OPS = e.OPS,
            p.UNSUPPORTED_FEATURES = e.UNSUPPORTED_FEATURES,
            p.isValidUrl = e.isValidUrl,
            p.shadow = e.shadow,
            p.createBlob = e.createBlob,
            p.createObjectURL = function(t, n) {
                return e.createObjectURL(t, n, p.disableCreateObjectURL)
            }
            ,
            Object.defineProperty(p, "isLittleEndian", {
                configurable: !0,
                get: function() {
                    var t = e.isLittleEndian();
                    return e.shadow(p, "isLittleEndian", t)
                }
            }),
            p.removeNullCharacters = e.removeNullCharacters,
            p.PasswordResponses = e.PasswordResponses,
            p.PasswordException = e.PasswordException,
            p.UnknownErrorException = e.UnknownErrorException,
            p.InvalidPDFException = e.InvalidPDFException,
            p.MissingPDFException = e.MissingPDFException,
            p.UnexpectedResponseException = e.UnexpectedResponseException,
            p.Util = e.Util,
            p.PageViewport = e.PageViewport,
            p.createPromiseCapability = e.createPromiseCapability,
            p.maxImageSize = void 0 === p.maxImageSize ? -1 : p.maxImageSize,
            p.cMapUrl = void 0 === p.cMapUrl ? null : p.cMapUrl,
            p.cMapPacked = void 0 !== p.cMapPacked && p.cMapPacked,
            p.disableFontFace = void 0 !== p.disableFontFace && p.disableFontFace,
            p.imageResourcesPath = void 0 === p.imageResourcesPath ? "" : p.imageResourcesPath,
            p.disableWorker = void 0 !== p.disableWorker && p.disableWorker,
            p.workerSrc = void 0 === p.workerSrc ? null : p.workerSrc,
            p.disableRange = void 0 !== p.disableRange && p.disableRange,
            p.disableStream = void 0 !== p.disableStream && p.disableStream,
            p.disableAutoFetch = void 0 !== p.disableAutoFetch && p.disableAutoFetch,
            p.pdfBug = void 0 !== p.pdfBug && p.pdfBug,
            p.postMessageTransfers = void 0 === p.postMessageTransfers || p.postMessageTransfers,
            p.disableCreateObjectURL = void 0 !== p.disableCreateObjectURL && p.disableCreateObjectURL,
            p.disableWebGL = void 0 === p.disableWebGL || p.disableWebGL,
            p.externalLinkTarget = void 0 === p.externalLinkTarget ? u.NONE : p.externalLinkTarget,
            p.externalLinkRel = void 0 === p.externalLinkRel ? "noreferrer" : p.externalLinkRel,
            p.isEvalSupported = void 0 === p.isEvalSupported || p.isEvalSupported;
            var f = p.openExternalLinksInNewWindow;
            delete p.openExternalLinksInNewWindow,
            Object.defineProperty(p, "openExternalLinksInNewWindow", {
                get: function() {
                    return p.externalLinkTarget === u.BLANK
                },
                set: function(t) {
                    if (t && l('PDFJS.openExternalLinksInNewWindow, please use "PDFJS.externalLinkTarget = PDFJS.LinkTarget.BLANK" instead.'),
                    p.externalLinkTarget !== u.NONE)
                        return void h("PDFJS.externalLinkTarget is already initialized");
                    p.externalLinkTarget = t ? u.BLANK : u.NONE
                },
                enumerable: !0,
                configurable: !0
            }),
            f && (p.openExternalLinksInNewWindow = f),
            p.getDocument = i.getDocument,
            p.PDFDataRangeTransport = i.PDFDataRangeTransport,
            p.PDFWorker = i.PDFWorker,
            Object.defineProperty(p, "hasCanvasTypedArrays", {
                configurable: !0,
                get: function() {
                    var t = n.hasCanvasTypedArrays();
                    return e.shadow(p, "hasCanvasTypedArrays", t)
                }
            }),
            p.CustomStyle = n.CustomStyle,
            p.LinkTarget = u,
            p.addLinkAttributes = n.addLinkAttributes,
            p.getFilenameFromUrl = n.getFilenameFromUrl,
            p.isExternalLinkTargetSet = n.isExternalLinkTargetSet,
            p.AnnotationLayer = r.AnnotationLayer,
            p.renderTextLayer = a.renderTextLayer,
            p.Metadata = s.Metadata,
            p.SVGGraphics = o.SVGGraphics,
            p.UnsupportedManager = i._UnsupportedManager,
            t.globalScope = c,
            t.isWorker = d,
            t.PDFJS = c.PDFJS
        })
    }
    ).call(n),
    t.PDFJS = n.pdfjsDisplayGlobal.PDFJS,
    t.build = n.pdfjsDisplayAPI.build,
    t.version = n.pdfjsDisplayAPI.version,
    t.getDocument = n.pdfjsDisplayAPI.getDocument,
    t.PDFDataRangeTransport = n.pdfjsDisplayAPI.PDFDataRangeTransport,
    t.PDFWorker = n.pdfjsDisplayAPI.PDFWorker,
    t.renderTextLayer = n.pdfjsDisplayTextLayer.renderTextLayer,
    t.AnnotationLayer = n.pdfjsDisplayAnnotationLayer.AnnotationLayer,
    t.CustomStyle = n.pdfjsDisplayDOMUtils.CustomStyle,
    t.PasswordResponses = n.pdfjsSharedUtil.PasswordResponses,
    t.InvalidPDFException = n.pdfjsSharedUtil.InvalidPDFException,
    t.MissingPDFException = n.pdfjsSharedUtil.MissingPDFException,
    t.SVGGraphics = n.pdfjsDisplaySVG.SVGGraphics,
    t.UnexpectedResponseException = n.pdfjsSharedUtil.UnexpectedResponseException,
    t.OPS = n.pdfjsSharedUtil.OPS,
    t.UNSUPPORTED_FEATURES = n.pdfjsSharedUtil.UNSUPPORTED_FEATURES,
    t.isValidUrl = n.pdfjsSharedUtil.isValidUrl,
    t.createObjectURL = n.pdfjsSharedUtil.createObjectURL,
    t.removeNullCharacters = n.pdfjsSharedUtil.removeNullCharacters,
    t.shadow = n.pdfjsSharedUtil.shadow,
    t.createBlob = n.pdfjsSharedUtil.createBlob,
    t.getFilenameFromUrl = n.pdfjsDisplayDOMUtils.getFilenameFromUrl,
    t.addLinkAttributes = n.pdfjsDisplayDOMUtils.addLinkAttributes
});
(function() {
    var e;
    function ba(a) {
        var b = 0;
        return function() {
            return b < a.length ? {
                done: !1,
                value: a[b++]
            } : {
                done: !0
            }
        }
    }
    function l(a) {
        var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
        return b ? b.call(a) : {
            next: ba(a)
        }
    }
    function ca(a) {
        if (!(a instanceof Array)) {
            a = l(a);
            for (var b, c = []; !(b = a.next()).done; )
                c.push(b.value);
            a = c
        }
        return a
    }
    var da = "function" == typeof Object.create ? Object.create : function(a) {
        function b() {}
        b.prototype = a;
        return new b
    }
    , fa;
    if ("function" == typeof Object.setPrototypeOf)
        fa = Object.setPrototypeOf;
    else {
        var ha;
        a: {
            var ia = {
                Ur: !0
            }
              , ja = {};
            try {
                ja.__proto__ = ia;
                ha = ja.Ur;
                break a
            } catch (a) {}
            ha = !1
        }
        fa = ha ? function(a, b) {
            a.__proto__ = b;
            if (a.__proto__ !== b)
                throw new TypeError(a + " is not extensible");
            return a
        }
        : null
    }
    var ka = fa;
    function m(a, b) {
        a.prototype = da(b.prototype);
        a.prototype.constructor = a;
        if (ka)
            ka(a, b);
        else
            for (var c in b)
                if ("prototype" != c)
                    if (Object.defineProperties) {
                        var d = Object.getOwnPropertyDescriptor(b, c);
                        d && Object.defineProperty(a, c, d)
                    } else
                        a[c] = b[c];
        a.V = b.prototype
    }
    function la(a, b, c) {
        a instanceof String && (a = String(a));
        for (var d = a.length, f = 0; f < d; f++) {
            var g = a[f];
            if (b.call(c, g, f, a))
                return {
                    np: f,
                    Np: g
                }
        }
        return {
            np: -1,
            Np: void 0
        }
    }
    var ma = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, c) {
        a != Array.prototype && a != Object.prototype && (a[b] = c.value)
    }
      , na = "undefined" != typeof window && window === this ? this : "undefined" != typeof global && null != global ? global : this;
    function oa(a, b) {
        if (b) {
            var c = na;
            a = a.split(".");
            for (var d = 0; d < a.length - 1; d++) {
                var f = a[d];
                f in c || (c[f] = {});
                c = c[f]
            }
            a = a[a.length - 1];
            d = c[a];
            b = b(d);
            b != d && null != b && ma(c, a, {
                configurable: !0,
                writable: !0,
                value: b
            })
        }
    }
    oa("Array.prototype.findIndex", function(a) {
        return a ? a : function(a, c) {
            return la(this, a, c).np
        }
    });
    oa("Array.prototype.find", function(a) {
        return a ? a : function(a, c) {
            return la(this, a, c).Np
        }
    });
    oa("Object.is", function(a) {
        return a ? a : function(a, c) {
            return a === c ? 0 !== a || 1 / a === 1 / c : a !== a && c !== c
        }
    });
    function pa(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b)
    }
    oa("WeakMap", function(a) {
        function b(a) {
            this.za = (h += Math.random() + 1).toString();
            if (a) {
                a = l(a);
                for (var b; !(b = a.next()).done; )
                    b = b.value,
                    this.set(b[0], b[1])
            }
        }
        function c() {}
        function d(a) {
            pa(a, g) || ma(a, g, {
                value: new c
            })
        }
        function f(a) {
            var b = Object[a];
            b && (Object[a] = function(a) {
                if (a instanceof c)
                    return a;
                d(a);
                return b(a)
            }
            )
        }
        if (function() {
            if (!a || !Object.seal)
                return !1;
            try {
                var b = Object.seal({})
                  , c = Object.seal({})
                  , d = new a([[b, 2], [c, 3]]);
                if (2 != d.get(b) || 3 != d.get(c))
                    return !1;
                d.delete(b);
                d.set(c, 4);
                return !d.has(b) && 4 == d.get(c)
            } catch (y) {
                return !1
            }
        }())
            return a;
        var g = "$jscomp_hidden_" + Math.random();
        f("freeze");
        f("preventExtensions");
        f("seal");
        var h = 0;
        b.prototype.set = function(a, b) {
            d(a);
            if (!pa(a, g))
                throw Error("WeakMap key fail: " + a);
            a[g][this.za] = b;
            return this
        }
        ;
        b.prototype.get = function(a) {
            return pa(a, g) ? a[g][this.za] : void 0
        }
        ;
        b.prototype.has = function(a) {
            return pa(a, g) && pa(a[g], this.za)
        }
        ;
        b.prototype.delete = function(a) {
            return pa(a, g) && pa(a[g], this.za) ? delete a[g][this.za] : !1
        }
        ;
        return b
    });
    function qa() {
        qa = function() {}
        ;
        na.Symbol || (na.Symbol = ra)
    }
    var ra = function() {
        var a = 0;
        return function(b) {
            return "jscomp_symbol_" + (b || "") + a++
        }
    }();
    function sa() {
        qa();
        var a = na.Symbol.iterator;
        a || (a = na.Symbol.iterator = na.Symbol("iterator"));
        "function" != typeof Array.prototype[a] && ma(Array.prototype, a, {
            configurable: !0,
            writable: !0,
            value: function() {
                return ta(ba(this))
            }
        });
        sa = function() {}
    }
    function ta(a) {
        sa();
        a = {
            next: a
        };
        a[na.Symbol.iterator] = function() {
            return this
        }
        ;
        return a
    }
    oa("Promise", function(a) {
        function b(a) {
            this.rb = 0;
            this.Em = void 0;
            this.jg = [];
            var b = this.gm();
            try {
                a(b.resolve, b.reject)
            } catch (u) {
                b.reject(u)
            }
        }
        function c() {
            this.je = null
        }
        function d(a) {
            return a instanceof b ? a : new b(function(b) {
                b(a)
            }
            )
        }
        if (a)
            return a;
        c.prototype.ep = function(a) {
            null == this.je && (this.je = [],
            this.Yr());
            this.je.push(a)
        }
        ;
        c.prototype.Yr = function() {
            var a = this;
            this.fp(function() {
                a.fs()
            })
        }
        ;
        var f = na.setTimeout;
        c.prototype.fp = function(a) {
            f(a, 0)
        }
        ;
        c.prototype.fs = function() {
            for (; this.je && this.je.length; ) {
                var a = this.je;
                this.je = [];
                for (var b = 0; b < a.length; ++b) {
                    var c = a[b];
                    a[b] = null;
                    try {
                        c()
                    } catch (q) {
                        this.Zr(q)
                    }
                }
            }
            this.je = null
        }
        ;
        c.prototype.Zr = function(a) {
            this.fp(function() {
                throw a;
            })
        }
        ;
        b.prototype.gm = function() {
            function a(a) {
                return function(d) {
                    c || (c = !0,
                    a.call(b, d))
                }
            }
            var b = this
              , c = !1;
            return {
                resolve: a(this.Is),
                reject: a(this.Bm)
            }
        }
        ;
        b.prototype.Is = function(a) {
            if (a === this)
                this.Bm(new TypeError("A Promise cannot resolve to itself"));
            else if (a instanceof b)
                this.Ns(a);
            else {
                a: switch (typeof a) {
                case "object":
                    var c = null != a;
                    break a;
                case "function":
                    c = !0;
                    break a;
                default:
                    c = !1
                }
                c ? this.Hs(a) : this.lp(a)
            }
        }
        ;
        b.prototype.Hs = function(a) {
            var b = void 0;
            try {
                b = a.then
            } catch (u) {
                this.Bm(u);
                return
            }
            "function" == typeof b ? this.Os(b, a) : this.lp(a)
        }
        ;
        b.prototype.Bm = function(a) {
            this.Gp(2, a)
        }
        ;
        b.prototype.lp = function(a) {
            this.Gp(1, a)
        }
        ;
        b.prototype.Gp = function(a, b) {
            if (0 != this.rb)
                throw Error("Cannot settle(" + a + ", " + b + "): Promise already settled in state" + this.rb);
            this.rb = a;
            this.Em = b;
            this.gs()
        }
        ;
        b.prototype.gs = function() {
            if (null != this.jg) {
                for (var a = 0; a < this.jg.length; ++a)
                    g.ep(this.jg[a]);
                this.jg = null
            }
        }
        ;
        var g = new c;
        b.prototype.Ns = function(a) {
            var b = this.gm();
            a.Cj(b.resolve, b.reject)
        }
        ;
        b.prototype.Os = function(a, b) {
            var c = this.gm();
            try {
                a.call(b, c.resolve, c.reject)
            } catch (q) {
                c.reject(q)
            }
        }
        ;
        b.prototype.then = function(a, c) {
            function d(a, b) {
                return "function" == typeof a ? function(b) {
                    try {
                        f(a(b))
                    } catch (P) {
                        g(P)
                    }
                }
                : b
            }
            var f, g, h = new b(function(a, b) {
                f = a;
                g = b
            }
            );
            this.Cj(d(a, f), d(c, g));
            return h
        }
        ;
        b.prototype.catch = function(a) {
            return this.then(void 0, a)
        }
        ;
        b.prototype.Cj = function(a, b) {
            function c() {
                switch (d.rb) {
                case 1:
                    a(d.Em);
                    break;
                case 2:
                    b(d.Em);
                    break;
                default:
                    throw Error("Unexpected state: " + d.rb);
                }
            }
            var d = this;
            null == this.jg ? g.ep(c) : this.jg.push(c)
        }
        ;
        b.resolve = d;
        b.reject = function(a) {
            return new b(function(b, c) {
                c(a)
            }
            )
        }
        ;
        b.race = function(a) {
            return new b(function(b, c) {
                for (var f = l(a), g = f.next(); !g.done; g = f.next())
                    d(g.value).Cj(b, c)
            }
            )
        }
        ;
        b.all = function(a) {
            var c = l(a)
              , f = c.next();
            return f.done ? d([]) : new b(function(a, b) {
                function g(b) {
                    return function(c) {
                        h[b] = c;
                        k--;
                        0 == k && a(h)
                    }
                }
                var h = []
                  , k = 0;
                do
                    h.push(void 0),
                    k++,
                    d(f.value).Cj(g(h.length - 1), b),
                    f = c.next();
                while (!f.done)
            }
            )
        }
        ;
        return b
    });
    var ua = "function" == typeof Object.assign ? Object.assign : function(a, b) {
        for (var c = 1; c < arguments.length; c++) {
            var d = arguments[c];
            if (d)
                for (var f in d)
                    pa(d, f) && (a[f] = d[f])
        }
        return a
    }
    ;
    oa("Object.assign", function(a) {
        return a || ua
    });
    oa("Map", function(a) {
        function b() {
            var a = {};
            return a.Fd = a.next = a.head = a
        }
        function c(a, b) {
            var c = a.Cd;
            return ta(function() {
                if (c) {
                    for (; c.head != a.Cd; )
                        c = c.Fd;
                    for (; c.next != c.head; )
                        return c = c.next,
                        {
                            done: !1,
                            value: b(c)
                        };
                    c = null
                }
                return {
                    done: !0,
                    value: void 0
                }
            })
        }
        function d(a, b) {
            var c = b && typeof b;
            "object" == c || "function" == c ? g.has(b) ? c = g.get(b) : (c = "" + ++h,
            g.set(b, c)) : c = "p_" + b;
            var d = a.Ph[c];
            if (d && pa(a.Ph, c))
                for (a = 0; a < d.length; a++) {
                    var f = d[a];
                    if (b !== b && f.key !== f.key || b === f.key)
                        return {
                            id: c,
                            list: d,
                            index: a,
                            xb: f
                        }
                }
            return {
                id: c,
                list: d,
                index: -1,
                xb: void 0
            }
        }
        function f(a) {
            this.Ph = {};
            this.Cd = b();
            this.size = 0;
            if (a) {
                a = l(a);
                for (var c; !(c = a.next()).done; )
                    c = c.value,
                    this.set(c[0], c[1])
            }
        }
        if (function() {
            if (!a || "function" != typeof a || !a.prototype.entries || "function" != typeof Object.seal)
                return !1;
            try {
                var b = Object.seal({
                    x: 4
                })
                  , c = new a(l([[b, "s"]]));
                if ("s" != c.get(b) || 1 != c.size || c.get({
                    x: 4
                }) || c.set({
                    x: 4
                }, "t") != c || 2 != c.size)
                    return !1;
                var d = c.entries()
                  , f = d.next();
                if (f.done || f.value[0] != b || "s" != f.value[1])
                    return !1;
                f = d.next();
                return f.done || 4 != f.value[0].x || "t" != f.value[1] || !d.next().done ? !1 : !0
            } catch (I) {
                return !1
            }
        }())
            return a;
        sa();
        var g = new WeakMap;
        f.prototype.set = function(a, b) {
            a = 0 === a ? 0 : a;
            var c = d(this, a);
            c.list || (c.list = this.Ph[c.id] = []);
            c.xb ? c.xb.value = b : (c.xb = {
                next: this.Cd,
                Fd: this.Cd.Fd,
                head: this.Cd,
                key: a,
                value: b
            },
            c.list.push(c.xb),
            this.Cd.Fd.next = c.xb,
            this.Cd.Fd = c.xb,
            this.size++);
            return this
        }
        ;
        f.prototype.delete = function(a) {
            a = d(this, a);
            return a.xb && a.list ? (a.list.splice(a.index, 1),
            a.list.length || delete this.Ph[a.id],
            a.xb.Fd.next = a.xb.next,
            a.xb.next.Fd = a.xb.Fd,
            a.xb.head = null,
            this.size--,
            !0) : !1
        }
        ;
        f.prototype.clear = function() {
            this.Ph = {};
            this.Cd = this.Cd.Fd = b();
            this.size = 0
        }
        ;
        f.prototype.has = function(a) {
            return !!d(this, a).xb
        }
        ;
        f.prototype.get = function(a) {
            return (a = d(this, a).xb) && a.value
        }
        ;
        f.prototype.entries = function() {
            return c(this, function(a) {
                return [a.key, a.value]
            })
        }
        ;
        f.prototype.keys = function() {
            return c(this, function(a) {
                return a.key
            })
        }
        ;
        f.prototype.values = function() {
            return c(this, function(a) {
                return a.value
            })
        }
        ;
        f.prototype.forEach = function(a, b) {
            for (var c = this.entries(), d; !(d = c.next()).done; )
                d = d.value,
                a.call(b, d[1], d[0], this)
        }
        ;
        f.prototype[Symbol.iterator] = f.prototype.entries;
        var h = 0;
        return f
    });
    oa("Array.prototype.fill", function(a) {
        return a ? a : function(a, c, d) {
            var b = this.length || 0;
            0 > c && (c = Math.max(0, b + c));
            if (null == d || d > b)
                d = b;
            d = Number(d);
            0 > d && (d = Math.max(0, b + d));
            for (c = Number(c || 0); c < d; c++)
                this[c] = a;
            return this
        }
    });
    var n = this;
    function p(a) {
        return void 0 !== a
    }
    function r(a) {
        return "string" == typeof a
    }
    function t(a) {
        return "number" == typeof a
    }
    function va() {}
    function wa(a) {
        var b = typeof a;
        if ("object" == b)
            if (a) {
                if (a instanceof Array)
                    return "array";
                if (a instanceof Object)
                    return b;
                var c = Object.prototype.toString.call(a);
                if ("[object Window]" == c)
                    return "object";
                if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice"))
                    return "array";
                if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call"))
                    return "function"
            } else
                return "null";
        else if ("function" == b && "undefined" == typeof a.call)
            return "object";
        return b
    }
    function v(a) {
        return "array" == wa(a)
    }
    function xa(a) {
        var b = wa(a);
        return "array" == b || "object" == b && "number" == typeof a.length
    }
    function ya(a) {
        return "function" == wa(a)
    }
    function za(a) {
        var b = typeof a;
        return "object" == b && null != a || "function" == b
    }
    function Aa(a) {
        return a[Ba] || (a[Ba] = ++Ca)
    }
    var Ba = "closure_uid_" + (1E9 * Math.random() >>> 0)
      , Ca = 0;
    function Da(a, b, c) {
        return a.call.apply(a.bind, arguments)
    }
    function Ea(a, b, c) {
        if (!a)
            throw Error();
        if (2 < arguments.length) {
            var d = Array.prototype.slice.call(arguments, 2);
            return function() {
                var c = Array.prototype.slice.call(arguments);
                Array.prototype.unshift.apply(c, d);
                return a.apply(b, c)
            }
        }
        return function() {
            return a.apply(b, arguments)
        }
    }
    function Fa(a, b, c) {
        Fa = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? Da : Ea;
        return Fa.apply(null, arguments)
    }
    var Ga = Date.now || function() {
        return +new Date
    }
    ;
    function Ha(a, b) {
        a = a.split(".");
        var c = n;
        a[0]in c || "undefined" == typeof c.execScript || c.execScript("var " + a[0]);
        for (var d; a.length && (d = a.shift()); )
            !a.length && p(b) ? c[d] = b : c = c[d] && c[d] !== Object.prototype[d] ? c[d] : c[d] = {}
    }
    function w(a, b) {
        function c() {}
        c.prototype = b.prototype;
        a.V = b.prototype;
        a.prototype = new c;
        a.prototype.constructor = a;
        a.av = function(a, c, g) {
            for (var d = Array(arguments.length - 2), f = 2; f < arguments.length; f++)
                d[f - 2] = arguments[f];
            return b.prototype[c].apply(a, d)
        }
    }
    ;function Ia(a) {
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, Ia);
        else {
            var b = Error().stack;
            b && (this.stack = b)
        }
        a && (this.message = String(a))
    }
    w(Ia, Error);
    Ia.prototype.name = "CustomError";
    var Ja;
    function Ka(a, b) {
        a = a.split("%s");
        for (var c = "", d = a.length - 1, f = 0; f < d; f++)
            c += a[f] + (f < b.length ? b[f] : "%s");
        Ia.call(this, c + a[d])
    }
    w(Ka, Ia);
    Ka.prototype.name = "AssertionError";
    function La(a) {
        throw a;
    }
    function Ma(a, b, c, d) {
        var f = "Assertion failed";
        if (c) {
            f += ": " + c;
            var g = d
        } else
            a && (f += ": " + a,
            g = b);
        a = new Ka("" + f,g || []);
        La(a)
    }
    function x(a, b, c) {
        a || Ma("", null, b, Array.prototype.slice.call(arguments, 2));
        return a
    }
    function Na(a, b) {
        La(new Ka("Failure" + (a ? ": " + a : ""),Array.prototype.slice.call(arguments, 1)))
    }
    function Oa(a, b, c) {
        t(a) || Ma("Expected number but got %s: %s.", [wa(a), a], b, Array.prototype.slice.call(arguments, 2));
        return a
    }
    function Pa(a, b, c) {
        r(a) || Ma("Expected string but got %s: %s.", [wa(a), a], b, Array.prototype.slice.call(arguments, 2));
        return a
    }
    function Qa(a, b, c, d) {
        a instanceof b || Ma("Expected instanceof %s but got %s.", [Ra(b), Ra(a)], c, Array.prototype.slice.call(arguments, 3));
        return a
    }
    function Ra(a) {
        return a instanceof Function ? a.displayName || a.name || "unknown type name" : a instanceof Object ? a.constructor.displayName || a.constructor.name || Object.prototype.toString.call(a) : null === a ? "null" : typeof a
    }
    ;var Sa = Array.prototype.indexOf ? function(a, b) {
        x(null != a.length);
        return Array.prototype.indexOf.call(a, b, void 0)
    }
    : function(a, b) {
        if (r(a))
            return r(b) && 1 == b.length ? a.indexOf(b, 0) : -1;
        for (var c = 0; c < a.length; c++)
            if (c in a && a[c] === b)
                return c;
        return -1
    }
      , Ta = Array.prototype.forEach ? function(a, b, c) {
        x(null != a.length);
        Array.prototype.forEach.call(a, b, c)
    }
    : function(a, b, c) {
        for (var d = a.length, f = r(a) ? a.split("") : a, g = 0; g < d; g++)
            g in f && b.call(c, f[g], g, a)
    }
      , Ua = Array.prototype.filter ? function(a, b) {
        x(null != a.length);
        return Array.prototype.filter.call(a, b, void 0)
    }
    : function(a, b) {
        for (var c = a.length, d = [], f = 0, g = r(a) ? a.split("") : a, h = 0; h < c; h++)
            if (h in g) {
                var k = g[h];
                b.call(void 0, k, h, a) && (d[f++] = k)
            }
        return d
    }
    ;
    function Va(a, b) {
        a: {
            for (var c = a.length, d = r(a) ? a.split("") : a, f = 0; f < c; f++)
                if (f in d && b.call(void 0, d[f], f, a)) {
                    b = f;
                    break a
                }
            b = -1
        }
        return 0 > b ? null : r(a) ? a.charAt(b) : a[b]
    }
    function Wa(a, b) {
        b = Sa(a, b);
        var c;
        (c = 0 <= b) && Xa(a, b);
        return c
    }
    function Xa(a, b) {
        x(null != a.length);
        Array.prototype.splice.call(a, b, 1)
    }
    function Ya(a) {
        var b = a.length;
        if (0 < b) {
            for (var c = Array(b), d = 0; d < b; d++)
                c[d] = a[d];
            return c
        }
        return []
    }
    function Za(a, b) {
        for (var c = 1; c < arguments.length; c++) {
            var d = arguments[c];
            if (xa(d)) {
                var f = a.length || 0
                  , g = d.length || 0;
                a.length = f + g;
                for (var h = 0; h < g; h++)
                    a[f + h] = d[h]
            } else
                a.push(d)
        }
    }
    function $a(a, b, c, d) {
        x(null != a.length);
        Array.prototype.splice.apply(a, ab(arguments, 1))
    }
    function ab(a, b, c) {
        x(null != a.length);
        return 2 >= arguments.length ? Array.prototype.slice.call(a, b) : Array.prototype.slice.call(a, b, c)
    }
    ;function bb(a) {
        var b = b || 0;
        return function() {
            return a.apply(this, Array.prototype.slice.call(arguments, 0, b))
        }
    }
    ;function cb(a, b, c) {
        return Math.min(Math.max(a, b), c)
    }
    function db(a) {
        return 0 < a ? 1 : 0 > a ? -1 : a
    }
    ;var eb = "StopIteration"in n ? n.StopIteration : {
        message: "StopIteration",
        stack: ""
    };
    function fb() {}
    fb.prototype.next = function() {
        throw eb;
    }
    ;
    fb.prototype.hd = function() {
        return this
    }
    ;
    function gb(a) {
        if (a instanceof fb)
            return a;
        if ("function" == typeof a.hd)
            return a.hd(!1);
        if (xa(a)) {
            var b = 0
              , c = new fb;
            c.next = function() {
                for (; ; ) {
                    if (b >= a.length)
                        throw eb;
                    if (b in a)
                        return a[b++];
                    b++
                }
            }
            ;
            return c
        }
        throw Error("Not implemented");
    }
    function hb(a, b, c) {
        if (xa(a))
            try {
                Ta(a, b, c)
            } catch (d) {
                if (d !== eb)
                    throw d;
            }
        else {
            a = gb(a);
            try {
                for (; ; )
                    b.call(c, a.next(), void 0, a)
            } catch (d) {
                if (d !== eb)
                    throw d;
            }
        }
    }
    function ib(a) {
        if (xa(a))
            return Ya(a);
        a = gb(a);
        var b = [];
        hb(a, function(a) {
            b.push(a)
        });
        return b
    }
    ;var z = {
        ev: 96 / 72,
        Fm: !0,
        zb: 640,
        bi: 480,
        Sp: .2,
        Xe: 0,
        We: 1,
        cs: 4,
        ys: 2628E3,
        Ws: 250,
        Ks: 200,
        Ps: 350,
        Rs: 200,
        Dm: 200,
        ds: 500,
        Ss: "data/thumbs",
        Mp: .1,
        Pm: 35,
        rs: 20,
        gv: !1,
        cb: 50,
        uv: .7,
        Xu: {
            qv: 7,
            pv: 3,
            fv: 200,
            minWidth: 150,
            maxWidth: 400,
            tv: 25
        },
        ik: {
            className: "lineSpreadThumbnail",
            nb: 8,
            Pp: .12,
            animationDuration: 200,
            Xc: 10,
            Ue: 40,
            bg: 2,
            og: 5,
            ci: 3,
            ic: 2,
            ri: 2,
            cg: 24,
            $h: 15,
            lg: 2,
            minHeight: 70,
            ki: 2
        },
        hk: {
            className: "linePageThumbnail",
            nb: 15,
            Pp: .12,
            animationDuration: 200,
            fm: 30,
            Xc: 10,
            Ue: 10,
            bg: 2,
            ip: 5,
            og: 5,
            ci: 3,
            ic: 2,
            ri: 2,
            cg: 24,
            $h: 15,
            lg: 2,
            minHeight: 70,
            ki: 2
        },
        qe: {
            className: "pageViewer",
            Op: "pages",
            Ea: 9
        },
        ef: {
            className: "bookViewer",
            Om: 9,
            Qp: 50
        },
        Gu: {
            className: "slideViewer",
            Ea: 9,
            fk: 30
        },
        xg: {
            className: "slideWithTransitionViewer",
            Ea: 0,
            hs: 5,
            bs: 2,
            fk: 4,
            Rp: 200
        }
    };
    function jb(a, b) {
        return (new kb(b)).Gm(a)
    }
    function kb(a) {
        this.Uj = a
    }
    kb.prototype.Gm = function(a) {
        var b = [];
        lb(this, a, b);
        return b.join("")
    }
    ;
    function lb(a, b, c) {
        if (null == b)
            c.push("null");
        else {
            if ("object" == typeof b) {
                if (v(b)) {
                    var d = b;
                    b = d.length;
                    c.push("[");
                    for (var f = "", g = 0; g < b; g++)
                        c.push(f),
                        f = d[g],
                        lb(a, a.Uj ? a.Uj.call(d, String(g), f) : f, c),
                        f = ",";
                    c.push("]");
                    return
                }
                if (b instanceof String || b instanceof Number || b instanceof Boolean)
                    b = b.valueOf();
                else {
                    c.push("{");
                    g = "";
                    for (d in b)
                        Object.prototype.hasOwnProperty.call(b, d) && (f = b[d],
                        "function" != typeof f && (c.push(g),
                        mb(d, c),
                        c.push(":"),
                        lb(a, a.Uj ? a.Uj.call(b, d, f) : f, c),
                        g = ","));
                    c.push("}");
                    return
                }
            }
            switch (typeof b) {
            case "string":
                mb(b, c);
                break;
            case "number":
                c.push(isFinite(b) && !isNaN(b) ? String(b) : "null");
                break;
            case "boolean":
                c.push(String(b));
                break;
            case "function":
                c.push("null");
                break;
            default:
                throw Error("Unknown type: " + typeof b);
            }
        }
    }
    var nb = {
        '"': '\\"',
        "\\": "\\\\",
        "/": "\\/",
        "\b": "\\b",
        "\f": "\\f",
        "\n": "\\n",
        "\r": "\\r",
        "\t": "\\t",
        "\x0B": "\\u000b"
    }
      , ob = /\uffff/.test("\uffff") ? /[\\"\x00-\x1f\x7f-\uffff]/g : /[\\"\x00-\x1f\x7f-\xff]/g;
    function mb(a, b) {
        b.push('"', a.replace(ob, function(a) {
            var b = nb[a];
            b || (b = "\\u" + (a.charCodeAt(0) | 65536).toString(16).substr(1),
            nb[a] = b);
            return b
        }), '"')
    }
    ;function pb(a) {
        this.Nj = a
    }
    pb.prototype.set = function(a, b) {
        p(b) ? this.Nj.set(a, jb(b)) : this.Nj.remove(a)
    }
    ;
    pb.prototype.get = function(a) {
        try {
            var b = this.Nj.get(a)
        } catch (c) {
            return
        }
        if (null !== b)
            try {
                return JSON.parse(b)
            } catch (c) {
                throw "Storage: Invalid value was encountered";
            }
    }
    ;
    pb.prototype.remove = function(a) {
        this.Nj.remove(a)
    }
    ;
    function qb() {}
    ;function rb() {}
    w(rb, qb);
    rb.prototype.clear = function() {
        var a = ib(this.hd(!0))
          , b = this;
        Ta(a, function(a) {
            b.remove(a)
        })
    }
    ;
    function sb(a) {
        this.Kc = a
    }
    w(sb, rb);
    e = sb.prototype;
    e.um = function() {
        if (!this.Kc)
            return !1;
        try {
            return this.Kc.setItem("__sak", "1"),
            this.Kc.removeItem("__sak"),
            !0
        } catch (a) {
            return !1
        }
    }
    ;
    e.set = function(a, b) {
        try {
            this.Kc.setItem(a, b)
        } catch (c) {
            if (0 == this.Kc.length)
                throw "Storage mechanism: Storage disabled";
            throw "Storage mechanism: Quota exceeded";
        }
    }
    ;
    e.get = function(a) {
        a = this.Kc.getItem(a);
        if (!r(a) && null !== a)
            throw "Storage mechanism: Invalid value was encountered";
        return a
    }
    ;
    e.remove = function(a) {
        this.Kc.removeItem(a)
    }
    ;
    e.hd = function(a) {
        var b = 0
          , c = this.Kc
          , d = new fb;
        d.next = function() {
            if (b >= c.length)
                throw eb;
            var d = Pa(c.key(b++));
            if (a)
                return d;
            d = c.getItem(d);
            if (!r(d))
                throw "Storage mechanism: Invalid value was encountered";
            return d
        }
        ;
        return d
    }
    ;
    e.clear = function() {
        this.Kc.clear()
    }
    ;
    e.key = function(a) {
        return this.Kc.key(a)
    }
    ;
    function tb() {
        var a = null;
        try {
            a = window.localStorage || null
        } catch (b) {}
        this.Kc = a
    }
    w(tb, sb);
    function ub(a, b) {
        this.Ed = {};
        this.ob = [];
        this.oi = this.dg = 0;
        var c = arguments.length;
        if (1 < c) {
            if (c % 2)
                throw Error("Uneven number of arguments");
            for (var d = 0; d < c; d += 2)
                this.set(arguments[d], arguments[d + 1])
        } else
            a && this.addAll(a)
    }
    function vb(a) {
        wb(a);
        return a.ob.concat()
    }
    e = ub.prototype;
    e.clear = function() {
        this.Ed = {};
        this.oi = this.dg = this.ob.length = 0
    }
    ;
    e.remove = function(a) {
        return Object.prototype.hasOwnProperty.call(this.Ed, a) ? (delete this.Ed[a],
        this.dg--,
        this.oi++,
        this.ob.length > 2 * this.dg && wb(this),
        !0) : !1
    }
    ;
    function wb(a) {
        if (a.dg != a.ob.length) {
            for (var b = 0, c = 0; b < a.ob.length; ) {
                var d = a.ob[b];
                Object.prototype.hasOwnProperty.call(a.Ed, d) && (a.ob[c++] = d);
                b++
            }
            a.ob.length = c
        }
        if (a.dg != a.ob.length) {
            var f = {};
            for (c = b = 0; b < a.ob.length; )
                d = a.ob[b],
                Object.prototype.hasOwnProperty.call(f, d) || (a.ob[c++] = d,
                f[d] = 1),
                b++;
            a.ob.length = c
        }
    }
    e.get = function(a, b) {
        return Object.prototype.hasOwnProperty.call(this.Ed, a) ? this.Ed[a] : b
    }
    ;
    e.set = function(a, b) {
        Object.prototype.hasOwnProperty.call(this.Ed, a) || (this.dg++,
        this.ob.push(a),
        this.oi++);
        this.Ed[a] = b
    }
    ;
    e.addAll = function(a) {
        if (a instanceof ub)
            for (var b = vb(a), c = 0; c < b.length; c++)
                this.set(b[c], a.get(b[c]));
        else
            for (b in a)
                this.set(b, a[b])
    }
    ;
    e.forEach = function(a, b) {
        for (var c = vb(this), d = 0; d < c.length; d++) {
            var f = c[d]
              , g = this.get(f);
            a.call(b, g, f, this)
        }
    }
    ;
    e.clone = function() {
        return new ub(this)
    }
    ;
    e.hd = function(a) {
        wb(this);
        var b = 0
          , c = this.oi
          , d = this
          , f = new fb;
        f.next = function() {
            if (c != d.oi)
                throw Error("The map has changed since the iterator was created");
            if (b >= d.ob.length)
                throw eb;
            var f = d.ob[b++];
            return a ? f : d.Ed[f]
        }
        ;
        return f
    }
    ;
    var xb = String.prototype.trim ? function(a) {
        return a.trim()
    }
    : function(a) {
        return /^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(a)[1]
    }
    ;
    function yb(a) {
        if (!zb.test(a))
            return a;
        -1 != a.indexOf("&") && (a = a.replace(Ab, "&amp;"));
        -1 != a.indexOf("<") && (a = a.replace(Bb, "&lt;"));
        -1 != a.indexOf(">") && (a = a.replace(Cb, "&gt;"));
        -1 != a.indexOf('"') && (a = a.replace(Db, "&quot;"));
        -1 != a.indexOf("'") && (a = a.replace(Eb, "&#39;"));
        -1 != a.indexOf("\x00") && (a = a.replace(Fb, "&#0;"));
        return a
    }
    var Ab = /&/g
      , Bb = /</g
      , Cb = />/g
      , Db = /"/g
      , Eb = /'/g
      , Fb = /\x00/g
      , zb = /[\x00&<>"']/;
    function Gb(a, b) {
        var c = 0;
        a = xb(String(a)).split(".");
        b = xb(String(b)).split(".");
        for (var d = Math.max(a.length, b.length), f = 0; 0 == c && f < d; f++) {
            var g = a[f] || ""
              , h = b[f] || "";
            do {
                g = /(\d*)(\D*)(.*)/.exec(g) || ["", "", "", ""];
                h = /(\d*)(\D*)(.*)/.exec(h) || ["", "", "", ""];
                if (0 == g[0].length && 0 == h[0].length)
                    break;
                c = Hb(0 == g[1].length ? 0 : parseInt(g[1], 10), 0 == h[1].length ? 0 : parseInt(h[1], 10)) || Hb(0 == g[2].length, 0 == h[2].length) || Hb(g[2], h[2]);
                g = g[3];
                h = h[3]
            } while (0 == c)
        }
        return c
    }
    function Hb(a, b) {
        return a < b ? -1 : a > b ? 1 : 0
    }
    function Ib(a) {
        return String(a).replace(/\-([a-z])/g, function(a, c) {
            return c.toUpperCase()
        })
    }
    function Jb(a) {
        var b = r(void 0) ? "undefined".replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08") : "\\s";
        return a.replace(new RegExp("(^" + (b ? "|[" + b + "]+" : "") + ")([a-z])","g"), function(a, b, f) {
            return b + f.toUpperCase()
        })
    }
    ;var Kb;
    a: {
        var Lb = n.navigator;
        if (Lb) {
            var Mb = Lb.userAgent;
            if (Mb) {
                Kb = Mb;
                break a
            }
        }
        Kb = ""
    }
    function A(a) {
        return -1 != Kb.indexOf(a)
    }
    ;function Nb(a, b) {
        for (var c in a)
            b.call(void 0, a[c], c, a)
    }
    function Ob(a, b) {
        var c = {}, d;
        for (d in a)
            b.call(void 0, a[d], d, a) && (c[d] = a[d]);
        return c
    }
    function Pb(a) {
        var b = [], c = 0, d;
        for (d in a)
            b[c++] = a[d];
        return b
    }
    function Qb(a, b) {
        for (var c in a)
            if (a[c] == b)
                return !0;
        return !1
    }
    function Rb(a, b) {
        for (var c in a)
            if (b.call(void 0, a[c], c, a))
                return c
    }
    function Sb() {
        var a = Tb, b;
        for (b in a)
            return !1;
        return !0
    }
    function Ub(a, b) {
        for (var c in a)
            if (!(c in b) || a[c] !== b[c])
                return !1;
        for (c in b)
            if (!(c in a))
                return !1;
        return !0
    }
    function Vb() {
        var a = {}, b;
        for (b in z)
            a[b] = z[b];
        return a
    }
    var Wb = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
    function Xb(a, b) {
        for (var c, d, f = 1; f < arguments.length; f++) {
            d = arguments[f];
            for (c in d)
                a[c] = d[c];
            for (var g = 0; g < Wb.length; g++)
                c = Wb[g],
                Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c])
        }
    }
    function Yb(a) {
        var b = arguments.length;
        if (1 == b && v(arguments[0]))
            return Yb.apply(null, arguments[0]);
        for (var c = {}, d = 0; d < b; d++)
            c[arguments[d]] = !0;
        return c
    }
    ;function Zb() {
        return (A("Chrome") || A("CriOS")) && !A("Edge")
    }
    ;function $b() {
        return A("iPhone") && !A("iPod") && !A("iPad")
    }
    function ac() {
        return $b() || A("iPad") || A("iPod")
    }
    ;function bc(a) {
        bc[" "](a);
        return a
    }
    bc[" "] = va;
    function cc(a, b) {
        var c = dc;
        return Object.prototype.hasOwnProperty.call(c, a) ? c[a] : c[a] = b(a)
    }
    ;var ec = A("Opera")
      , B = A("Trident") || A("MSIE")
      , fc = A("Edge")
      , gc = fc || B
      , hc = A("Gecko") && !(-1 != Kb.toLowerCase().indexOf("webkit") && !A("Edge")) && !(A("Trident") || A("MSIE")) && !A("Edge")
      , ic = -1 != Kb.toLowerCase().indexOf("webkit") && !A("Edge")
      , jc = A("Macintosh")
      , kc = A("Windows")
      , lc = A("Linux") || A("CrOS")
      , mc = A("Android")
      , nc = $b()
      , oc = A("iPad")
      , pc = A("iPod")
      , qc = ac();
    function rc() {
        var a = n.document;
        return a ? a.documentMode : void 0
    }
    var sc;
    a: {
        var tc = ""
          , uc = function() {
            var a = Kb;
            if (hc)
                return /rv:([^\);]+)(\)|;)/.exec(a);
            if (fc)
                return /Edge\/([\d\.]+)/.exec(a);
            if (B)
                return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);
            if (ic)
                return /WebKit\/(\S+)/.exec(a);
            if (ec)
                return /(?:Version)[ \/]?(\S+)/.exec(a)
        }();
        uc && (tc = uc ? uc[1] : "");
        if (B) {
            var vc = rc();
            if (null != vc && vc > parseFloat(tc)) {
                sc = String(vc);
                break a
            }
        }
        sc = tc
    }
    var dc = {};
    function wc(a) {
        return cc(a, function() {
            return 0 <= Gb(sc, a)
        })
    }
    var xc;
    var yc = n.document;
    xc = yc && B ? rc() || ("CSS1Compat" == yc.compatMode ? parseInt(sc, 10) : 5) : void 0;
    function zc(a, b) {
        this.Jp = a;
        this.sb = null;
        if (B && !(9 <= Number(xc))) {
            Ac || (Ac = new ub);
            this.sb = Ac.get(a);
            this.sb || (b ? this.sb = document.getElementById(b) : (this.sb = document.createElement("userdata"),
            this.sb.addBehavior("#default#userData"),
            document.body.appendChild(this.sb)),
            Ac.set(a, this.sb));
            try {
                this.sb.load(this.Jp)
            } catch (c) {
                this.sb = null
            }
        }
    }
    w(zc, rb);
    var Bc = {
        ".": ".2E",
        "!": ".21",
        "~": ".7E",
        "*": ".2A",
        "'": ".27",
        "(": ".28",
        ")": ".29",
        "%": "."
    }
      , Ac = null;
    function Cc(a) {
        return "_" + encodeURIComponent(a).replace(/[.!~*'()%]/g, function(a) {
            return Bc[a]
        })
    }
    e = zc.prototype;
    e.um = function() {
        return !!this.sb
    }
    ;
    e.set = function(a, b) {
        this.sb.setAttribute(Cc(a), b);
        Dc(this)
    }
    ;
    e.get = function(a) {
        a = this.sb.getAttribute(Cc(a));
        if (!r(a) && null !== a)
            throw "Storage mechanism: Invalid value was encountered";
        return a
    }
    ;
    e.remove = function(a) {
        this.sb.removeAttribute(Cc(a));
        Dc(this)
    }
    ;
    e.hd = function(a) {
        var b = 0
          , c = this.sb.XMLDocument.documentElement.attributes
          , d = new fb;
        d.next = function() {
            if (b >= c.length)
                throw eb;
            var d = x(c[b++]);
            if (a)
                return decodeURIComponent(d.nodeName.replace(/\./g, "%")).substr(1);
            d = d.nodeValue;
            if (!r(d))
                throw "Storage mechanism: Invalid value was encountered";
            return d
        }
        ;
        return d
    }
    ;
    e.clear = function() {
        for (var a = this.sb.XMLDocument.documentElement, b = a.attributes.length; 0 < b; b--)
            a.removeAttribute(a.attributes[b - 1].nodeName);
        Dc(this)
    }
    ;
    function Dc(a) {
        try {
            a.sb.save(a.Jp)
        } catch (b) {
            throw "Storage mechanism: Quota exceeded";
        }
    }
    ;function Ec(a, b) {
        this.Yh = a;
        this.mg = b + "::"
    }
    w(Ec, rb);
    Ec.prototype.set = function(a, b) {
        this.Yh.set(this.mg + a, b)
    }
    ;
    Ec.prototype.get = function(a) {
        return this.Yh.get(this.mg + a)
    }
    ;
    Ec.prototype.remove = function(a) {
        this.Yh.remove(this.mg + a)
    }
    ;
    Ec.prototype.hd = function(a) {
        var b = this.Yh.hd(!0)
          , c = this
          , d = new fb;
        d.next = function() {
            for (var d = b.next(); d.substr(0, c.mg.length) != c.mg; )
                d = b.next();
            return a ? d.substr(c.mg.length) : c.Yh.get(d)
        }
        ;
        return d
    }
    ;
    function Fc() {}
    w(Fc, qb);
    Fc.prototype.set = function() {}
    ;
    Fc.prototype.get = function() {
        return null
    }
    ;
    Fc.prototype.remove = function() {}
    ;
    function Gc(a, b) {
        var c = Hc();
        try {
            c.set(a, b)
        } catch (d) {}
    }
    function Ic(a) {
        Hc().remove(a)
    }
    var Jc = null;
    function Hc() {
        if (!Jc) {
            var a = new tb;
            (a = a.um() ? new Ec(a,"ispring") : null) || (a = new zc("ispring"),
            a = a.um() ? a : null);
            Jc = new pb(a || new Fc)
        }
        return Jc
    }
    ;function Kc(a, b) {
        this.pk = Lc + b + "/" + a
    }
    var Lc = "book/";
    Kc.prototype.getState = function() {
        return Mc(this.pk)
    }
    ;
    function Nc(a) {
        var b = null
          , c = null
          , d = !0
          , f = Math.floor(Date.now() / 1E3)
          , g = Hc();
        g instanceof rb && (hb(g.hd(!0), function(a) {
            var g = Mc(a);
            g && (g.updated + z.ys < f && (Ic(a),
            d = !1),
            d && (null == b || g.updated < b) && (b = g.updated,
            c = a))
        }, a),
        d && Ic(c))
    }
    function Mc(a) {
        a = Hc().get(a);
        a = p(a) ? a : null;
        return null == a ? null : JSON.parse(a)
    }
    ;function Oc(a) {
        this.bl = a
    }
    Oc.prototype.ja = function(a, b, c) {
        c = this.bl.hasOwnProperty(a) ? this.bl[a] : c;
        if (p(c)) {
            if (p(b)) {
                a = this.nq;
                for (var d in b)
                    if (b.hasOwnProperty(d)) {
                        var f = b[d];
                        a && (d = a(d));
                        c = c.replace(new RegExp(d,"g"), f)
                    }
            }
            return c
        }
        Na("unknown message id: " + a);
        return a
    }
    ;
    Oc.prototype.messages = function() {
        return this.bl
    }
    ;
    Oc.prototype.nq = function(a) {
        return "%" + a.toUpperCase() + "%"
    }
    ;
    Oc.prototype.getMessage = Oc.prototype.ja;
    var Pc, Qc = {
        at: "alert",
        bt: "alertdialog",
        ct: "application",
        dt: "article",
        gt: "banner",
        it: "button",
        jt: "checkbox",
        mt: "columnheader",
        nt: "combobox",
        ot: "complementary",
        pt: "contentinfo",
        rt: "definition",
        tt: "dialog",
        ut: "directory",
        wt: "document",
        At: "form",
        Ct: "grid",
        Dt: "gridcell",
        Et: "group",
        Gt: "heading",
        It: "img",
        Ot: "link",
        Pt: "list",
        Qt: "listbox",
        Rt: "listitem",
        Tt: "log",
        Ut: "main",
        Vt: "marquee",
        Wt: "math",
        Xt: "menu",
        Yt: "menubar",
        Zt: "menuitem",
        $t: "menuitemcheckbox",
        au: "menuitemradio",
        eu: "navigation",
        fu: "note",
        gu: "option",
        ku: "presentation",
        mu: "progressbar",
        nu: "radio",
        ou: "radiogroup",
        qu: "region",
        tu: "row",
        uu: "rowgroup",
        vu: "rowheader",
        xu: "scrollbar",
        yu: "search",
        Au: "separator",
        Cu: "slider",
        Eu: "spinbutton",
        Fu: "status",
        Hu: "tab",
        Iu: "tablist",
        Ju: "tabpanel",
        Ku: "textbox",
        Lu: "textinfo",
        Mu: "timer",
        Nu: "toolbar",
        Ou: "tooltip",
        Pu: "tree",
        Qu: "treegrid",
        Ru: "treeitem"
    };
    var Rc = {
        $s: "activedescendant",
        et: "atomic",
        ft: "autocomplete",
        ht: "busy",
        kt: "checked",
        lt: "colindex",
        qt: "controls",
        st: "describedby",
        vt: "disabled",
        xt: "dropeffect",
        yt: "expanded",
        zt: "flowto",
        Bt: "grabbed",
        Ft: "haspopup",
        Ht: "hidden",
        Jt: "invalid",
        Lt: "label",
        Mt: "labelledby",
        Nt: "level",
        St: "live",
        bu: "multiline",
        cu: "multiselectable",
        hu: "orientation",
        iu: "owns",
        ju: "posinset",
        lu: "pressed",
        pu: "readonly",
        ru: "relevant",
        su: "required",
        wu: "rowindex",
        zu: "selected",
        Bu: "setsize",
        Du: "sort",
        Tu: "valuemax",
        Uu: "valuemin",
        Vu: "valuenow",
        Wu: "valuetext"
    };
    var Sc = !B || 9 <= Number(xc)
      , Tc = B && !wc("9");
    function C(a, b) {
        this.x = p(a) ? a : 0;
        this.y = p(b) ? b : 0
    }
    e = C.prototype;
    e.clone = function() {
        return new C(this.x,this.y)
    }
    ;
    function Uc(a, b) {
        var c = a.x - b.x;
        a = a.y - b.y;
        return c * c + a * a
    }
    function Vc(a, b) {
        return new C(a.x - b.x,a.y - b.y)
    }
    e.ceil = function() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        return this
    }
    ;
    e.floor = function() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this
    }
    ;
    e.round = function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this
    }
    ;
    e.translate = function(a, b) {
        a instanceof C ? (this.x += a.x,
        this.y += a.y) : (this.x += Number(a),
        t(b) && (this.y += b));
        return this
    }
    ;
    e.scale = function(a, b) {
        b = t(b) ? b : a;
        this.x *= a;
        this.y *= b;
        return this
    }
    ;
    function Wc(a, b) {
        this.width = a;
        this.height = b
    }
    e = Wc.prototype;
    e.clone = function() {
        return new Wc(this.width,this.height)
    }
    ;
    e.aspectRatio = function() {
        return this.width / this.height
    }
    ;
    e.ceil = function() {
        this.width = Math.ceil(this.width);
        this.height = Math.ceil(this.height);
        return this
    }
    ;
    e.floor = function() {
        this.width = Math.floor(this.width);
        this.height = Math.floor(this.height);
        return this
    }
    ;
    e.round = function() {
        this.width = Math.round(this.width);
        this.height = Math.round(this.height);
        return this
    }
    ;
    e.scale = function(a, b) {
        b = t(b) ? b : a;
        this.width *= a;
        this.height *= b;
        return this
    }
    ;
    function Xc(a, b) {
        Nb(b, function(b, d) {
            b && "object" == typeof b && b.kv && (b = b.jv());
            "style" == d ? a.style.cssText = b : "class" == d ? a.className = b : "for" == d ? a.htmlFor = b : Yc.hasOwnProperty(d) ? a.setAttribute(Yc[d], b) : 0 == d.lastIndexOf("aria-", 0) || 0 == d.lastIndexOf("data-", 0) ? a.setAttribute(d, b) : a[d] = b
        })
    }
    var Yc = {
        cellpadding: "cellPadding",
        cellspacing: "cellSpacing",
        colspan: "colSpan",
        frameborder: "frameBorder",
        height: "height",
        maxlength: "maxLength",
        nonce: "nonce",
        role: "role",
        rowspan: "rowSpan",
        type: "type",
        usemap: "useMap",
        valign: "vAlign",
        width: "width"
    };
    function Zc(a, b, c) {
        var d = arguments
          , f = document
          , g = String(d[0])
          , h = d[1];
        if (!Sc && h && (h.name || h.type)) {
            g = ["<", g];
            h.name && g.push(' name="', yb(h.name), '"');
            if (h.type) {
                g.push(' type="', yb(h.type), '"');
                var k = {};
                Xb(k, h);
                delete k.type;
                h = k
            }
            g.push(">");
            g = g.join("")
        }
        g = f.createElement(g);
        h && (r(h) ? g.className = h : v(h) ? g.className = h.join(" ") : Xc(g, h));
        2 < d.length && $c(f, g, d, 2);
        return g
    }
    function $c(a, b, c, d) {
        function f(c) {
            c && b.appendChild(r(c) ? a.createTextNode(c) : c)
        }
        for (; d < c.length; d++) {
            var g = c[d];
            !xa(g) || za(g) && 0 < g.nodeType ? f(g) : Ta(ad(g) ? Ya(g) : g, f)
        }
    }
    function bd(a, b) {
        x(null != a && null != b, "goog.dom.appendChild expects non-null arguments");
        a.appendChild(b)
    }
    function cd(a, b) {
        $c(dd(a), a, arguments, 1)
    }
    function ed(a, b, c) {
        x(null != a, "goog.dom.insertChildAt expects a non-null parent");
        a.insertBefore(b, a.childNodes[c] || null)
    }
    function fd(a) {
        return a && a.parentNode ? a.parentNode.removeChild(a) : null
    }
    function gd(a, b) {
        if (!a || !b)
            return !1;
        if (a.contains && 1 == b.nodeType)
            return a == b || a.contains(b);
        if ("undefined" != typeof a.compareDocumentPosition)
            return a == b || !!(a.compareDocumentPosition(b) & 16);
        for (; b && a != b; )
            b = b.parentNode;
        return b == a
    }
    function dd(a) {
        x(a, "Node cannot be null or undefined.");
        return 9 == a.nodeType ? a : a.ownerDocument || a.document
    }
    function hd(a, b) {
        x(null != a, "goog.dom.setTextContent expects a non-null value for node");
        if ("textContent"in a)
            a.textContent = b;
        else if (3 == a.nodeType)
            a.data = String(b);
        else if (a.firstChild && 3 == a.firstChild.nodeType) {
            for (; a.lastChild != a.firstChild; )
                a.removeChild(x(a.lastChild));
            a.firstChild.data = String(b)
        } else {
            for (var c; c = a.firstChild; )
                a.removeChild(c);
            c = dd(a);
            a.appendChild(c.createTextNode(String(b)))
        }
    }
    var id = {
        SCRIPT: 1,
        STYLE: 1,
        HEAD: 1,
        IFRAME: 1,
        OBJECT: 1
    }
      , jd = {
        IMG: " ",
        BR: "\n"
    };
    function kd(a, b, c) {
        if (!(a.nodeName in id))
            if (3 == a.nodeType)
                c ? b.push(String(a.nodeValue).replace(/(\r\n|\r|\n)/g, "")) : b.push(a.nodeValue);
            else if (a.nodeName in jd)
                b.push(jd[a.nodeName]);
            else
                for (a = a.firstChild; a; )
                    kd(a, b, c),
                    a = a.nextSibling
    }
    function ad(a) {
        if (a && "number" == typeof a.length) {
            if (za(a))
                return "function" == typeof a.item || "string" == typeof a.item;
            if (ya(a))
                return "function" == typeof a.item
        }
        return !1
    }
    function ld() {
        var a = document;
        try {
            var b = a && a.activeElement;
            return b && b.nodeName ? b : null
        } catch (c) {
            return null
        }
    }
    function md(a) {
        this.fg = a || n.document || document
    }
    e = md.prototype;
    e.bb = function(a) {
        this.fg = a
    }
    ;
    e.getDocument = function() {
        return this.fg
    }
    ;
    e.getElementsByTagName = function(a, b) {
        return (b || this.fg).getElementsByTagName(String(a))
    }
    ;
    e.createElement = function(a) {
        return this.fg.createElement(String(a))
    }
    ;
    e.createTextNode = function(a) {
        return this.fg.createTextNode(String(a))
    }
    ;
    e.appendChild = bd;
    e.append = cd;
    e.canHaveChildren = function(a) {
        if (1 != a.nodeType)
            return !1;
        switch (a.tagName) {
        case "APPLET":
        case "AREA":
        case "BASE":
        case "BR":
        case "COL":
        case "COMMAND":
        case "EMBED":
        case "FRAME":
        case "HR":
        case "IMG":
        case "INPUT":
        case "IFRAME":
        case "ISINDEX":
        case "KEYGEN":
        case "LINK":
        case "NOFRAMES":
        case "NOSCRIPT":
        case "META":
        case "OBJECT":
        case "PARAM":
        case "SCRIPT":
        case "SOURCE":
        case "STYLE":
        case "TRACK":
        case "WBR":
            return !1
        }
        return !0
    }
    ;
    e.removeNode = fd;
    e.contains = gd;
    e.U = hd;
    e.getTextContent = function(a) {
        if (Tc && null !== a && "innerText"in a)
            a = a.innerText.replace(/(\r\n|\r|\n)/g, "\n");
        else {
            var b = [];
            kd(a, b, !0);
            a = b.join("")
        }
        a = a.replace(/ \xAD /g, " ").replace(/\xAD/g, "");
        a = a.replace(/\u200B/g, "");
        Tc || (a = a.replace(/ +/g, " "));
        " " != a && (a = a.replace(/^\s*/, ""));
        return a
    }
    ;
    Yb("A AREA BUTTON HEAD INPUT LINK MENU META OPTGROUP OPTION PROGRESS STYLE SELECT SOURCE TEXTAREA TITLE TRACK".split(" "));
    function nd(a, b) {
        b ? (x(Qb(Qc, b), "No such ARIA role " + b),
        a.setAttribute("role", b)) : a.removeAttribute("role")
    }
    function od(a, b, c) {
        v(c) && (c = c.join(" "));
        var d = pd(b);
        "" === c || void 0 == c ? (Pc || (Pc = {
            atomic: !1,
            autocomplete: "none",
            dropeffect: "none",
            haspopup: !1,
            live: "off",
            multiline: !1,
            multiselectable: !1,
            orientation: "vertical",
            readonly: !1,
            relevant: "additions text",
            required: !1,
            sort: "none",
            busy: !1,
            disabled: !1,
            hidden: !1,
            invalid: "false"
        }),
        c = Pc,
        b in c ? a.setAttribute(d, c[b]) : a.removeAttribute(d)) : a.setAttribute(d, c)
    }
    function pd(a) {
        x(a, "ARIA attribute cannot be empty.");
        x(Qb(Rc, a), "No such ARIA attribute " + a);
        return "aria-" + a
    }
    ;function qd(a, b, c, d) {
        this.top = a;
        this.right = b;
        this.bottom = c;
        this.left = d
    }
    e = qd.prototype;
    e.clone = function() {
        return new qd(this.top,this.right,this.bottom,this.left)
    }
    ;
    e.contains = function(a) {
        return this && a ? a instanceof qd ? a.left >= this.left && a.right <= this.right && a.top >= this.top && a.bottom <= this.bottom : a.x >= this.left && a.x <= this.right && a.y >= this.top && a.y <= this.bottom : !1
    }
    ;
    e.expand = function(a, b, c, d) {
        za(a) ? (this.top -= a.top,
        this.right += a.right,
        this.bottom += a.bottom,
        this.left -= a.left) : (this.top -= a,
        this.right += Number(b),
        this.bottom += Number(c),
        this.left -= Number(d));
        return this
    }
    ;
    e.ceil = function() {
        this.top = Math.ceil(this.top);
        this.right = Math.ceil(this.right);
        this.bottom = Math.ceil(this.bottom);
        this.left = Math.ceil(this.left);
        return this
    }
    ;
    e.floor = function() {
        this.top = Math.floor(this.top);
        this.right = Math.floor(this.right);
        this.bottom = Math.floor(this.bottom);
        this.left = Math.floor(this.left);
        return this
    }
    ;
    e.round = function() {
        this.top = Math.round(this.top);
        this.right = Math.round(this.right);
        this.bottom = Math.round(this.bottom);
        this.left = Math.round(this.left);
        return this
    }
    ;
    e.translate = function(a, b) {
        a instanceof C ? (this.left += a.x,
        this.right += a.x,
        this.top += a.y,
        this.bottom += a.y) : (Oa(a),
        this.left += a,
        this.right += a,
        t(b) && (this.top += b,
        this.bottom += b));
        return this
    }
    ;
    e.scale = function(a, b) {
        b = t(b) ? b : a;
        this.left *= a;
        this.right *= a;
        this.top *= b;
        this.bottom *= b;
        return this
    }
    ;
    function rd(a, b, c, d) {
        this.left = a;
        this.top = b;
        this.width = c;
        this.height = d
    }
    e = rd.prototype;
    e.clone = function() {
        return new rd(this.left,this.top,this.width,this.height)
    }
    ;
    e.contains = function(a) {
        return a instanceof C ? a.x >= this.left && a.x <= this.left + this.width && a.y >= this.top && a.y <= this.top + this.height : this.left <= a.left && this.left + this.width >= a.left + a.width && this.top <= a.top && this.top + this.height >= a.top + a.height
    }
    ;
    e.ceil = function() {
        this.left = Math.ceil(this.left);
        this.top = Math.ceil(this.top);
        this.width = Math.ceil(this.width);
        this.height = Math.ceil(this.height);
        return this
    }
    ;
    e.floor = function() {
        this.left = Math.floor(this.left);
        this.top = Math.floor(this.top);
        this.width = Math.floor(this.width);
        this.height = Math.floor(this.height);
        return this
    }
    ;
    e.round = function() {
        this.left = Math.round(this.left);
        this.top = Math.round(this.top);
        this.width = Math.round(this.width);
        this.height = Math.round(this.height);
        return this
    }
    ;
    e.translate = function(a, b) {
        a instanceof C ? (this.left += a.x,
        this.top += a.y) : (this.left += Oa(a),
        t(b) && (this.top += b));
        return this
    }
    ;
    e.scale = function(a, b) {
        b = t(b) ? b : a;
        this.left *= a;
        this.width *= a;
        this.top *= b;
        this.height *= b;
        return this
    }
    ;
    var sd = !B || 9 <= Number(xc)
      , td = B && !wc("9")
      , ud = function() {
        if (!n.addEventListener || !Object.defineProperty)
            return !1;
        var a = !1
          , b = Object.defineProperty({}, "passive", {
            get: function() {
                a = !0
            }
        });
        try {
            n.addEventListener("test", va, b),
            n.removeEventListener("test", va, b)
        } catch (c) {}
        return a
    }();
    function vd() {
        0 != wd && (xd[Aa(this)] = this);
        this.Dj = this.Dj;
        this.ig = this.ig
    }
    var wd = 0
      , xd = {};
    vd.prototype.Dj = !1;
    vd.prototype.eg = function() {
        if (!this.Dj && (this.Dj = !0,
        this.dc(),
        0 != wd)) {
            var a = Aa(this);
            if (0 != wd && this.ig && 0 < this.ig.length)
                throw Error(this + " did not empty its onDisposeCallbacks queue. This probably means it overrode dispose() or disposeInternal() without calling the superclass' method.");
            delete xd[a]
        }
    }
    ;
    vd.prototype.dc = function() {
        if (this.ig)
            for (; this.ig.length; )
                this.ig.shift()()
    }
    ;
    function yd() {
        this.id = "mousewheel"
    }
    yd.prototype.toString = function() {
        return this.id
    }
    ;
    function zd(a, b) {
        this.type = a instanceof yd ? String(a) : a;
        this.currentTarget = this.target = b;
        this.defaultPrevented = this.Ze = !1;
        this.xp = !0
    }
    zd.prototype.stopPropagation = function() {
        this.Ze = !0
    }
    ;
    zd.prototype.preventDefault = function() {
        this.defaultPrevented = !0;
        this.xp = !1
    }
    ;
    function Ad(a, b) {
        zd.call(this, a ? a.type : "");
        this.relatedTarget = this.currentTarget = this.target = null;
        this.button = this.screenY = this.screenX = this.clientY = this.clientX = this.offsetY = this.offsetX = 0;
        this.key = "";
        this.charCode = this.keyCode = 0;
        this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1;
        this.state = null;
        this.pointerId = 0;
        this.pointerType = "";
        this.Oa = null;
        if (a) {
            var c = this.type = a.type
              , d = a.changedTouches && a.changedTouches.length ? a.changedTouches[0] : null;
            this.target = a.target || a.srcElement;
            this.currentTarget = b;
            if (b = a.relatedTarget) {
                if (hc) {
                    a: {
                        try {
                            bc(b.nodeName);
                            var f = !0;
                            break a
                        } catch (g) {}
                        f = !1
                    }
                    f || (b = null)
                }
            } else
                "mouseover" == c ? b = a.fromElement : "mouseout" == c && (b = a.toElement);
            this.relatedTarget = b;
            d ? (this.clientX = void 0 !== d.clientX ? d.clientX : d.pageX,
            this.clientY = void 0 !== d.clientY ? d.clientY : d.pageY,
            this.screenX = d.screenX || 0,
            this.screenY = d.screenY || 0) : (this.offsetX = ic || void 0 !== a.offsetX ? a.offsetX : a.layerX,
            this.offsetY = ic || void 0 !== a.offsetY ? a.offsetY : a.layerY,
            this.clientX = void 0 !== a.clientX ? a.clientX : a.pageX,
            this.clientY = void 0 !== a.clientY ? a.clientY : a.pageY,
            this.screenX = a.screenX || 0,
            this.screenY = a.screenY || 0);
            this.button = a.button;
            this.keyCode = a.keyCode || 0;
            this.key = a.key || "";
            this.charCode = a.charCode || ("keypress" == c ? a.keyCode : 0);
            this.ctrlKey = a.ctrlKey;
            this.altKey = a.altKey;
            this.shiftKey = a.shiftKey;
            this.metaKey = a.metaKey;
            this.pointerId = a.pointerId || 0;
            this.pointerType = r(a.pointerType) ? a.pointerType : Bd[a.pointerType] || "";
            this.state = a.state;
            this.Oa = a;
            a.defaultPrevented && this.preventDefault()
        }
    }
    w(Ad, zd);
    var Bd = {
        2: "touch",
        3: "pen",
        4: "mouse"
    };
    Ad.prototype.stopPropagation = function() {
        Ad.V.stopPropagation.call(this);
        this.Oa.stopPropagation ? this.Oa.stopPropagation() : this.Oa.cancelBubble = !0
    }
    ;
    Ad.prototype.preventDefault = function() {
        Ad.V.preventDefault.call(this);
        var a = this.Oa;
        if (a.preventDefault)
            a.preventDefault();
        else if (a.returnValue = !1,
        td)
            try {
                if (a.ctrlKey || 112 <= a.keyCode && 123 >= a.keyCode)
                    a.keyCode = -1
            } catch (b) {}
    }
    ;
    var Cd = "closure_listenable_" + (1E6 * Math.random() | 0);
    function Dd(a) {
        return !(!a || !a[Cd])
    }
    var Ed = 0;
    function Fd(a, b, c, d, f) {
        this.listener = a;
        this.proxy = null;
        this.src = b;
        this.type = c;
        this.capture = !!d;
        this.Hj = f;
        this.key = ++Ed;
        this.ng = this.Bj = !1
    }
    function Gd(a) {
        a.ng = !0;
        a.listener = null;
        a.proxy = null;
        a.src = null;
        a.Hj = null
    }
    ;function Hd(a) {
        this.src = a;
        this.yb = {};
        this.ni = 0
    }
    Hd.prototype.add = function(a, b, c, d, f) {
        var g = a.toString();
        a = this.yb[g];
        a || (a = this.yb[g] = [],
        this.ni++);
        var h = Id(a, b, d, f);
        -1 < h ? (b = a[h],
        c || (b.Bj = !1)) : (b = new Fd(b,this.src,g,!!d,f),
        b.Bj = c,
        a.push(b));
        return b
    }
    ;
    Hd.prototype.remove = function(a, b, c, d) {
        a = a.toString();
        if (!(a in this.yb))
            return !1;
        var f = this.yb[a];
        b = Id(f, b, c, d);
        return -1 < b ? (Gd(f[b]),
        Xa(f, b),
        0 == f.length && (delete this.yb[a],
        this.ni--),
        !0) : !1
    }
    ;
    function Jd(a, b) {
        var c = b.type;
        if (!(c in a.yb))
            return !1;
        var d = Wa(a.yb[c], b);
        d && (Gd(b),
        0 == a.yb[c].length && (delete a.yb[c],
        a.ni--));
        return d
    }
    Hd.prototype.Th = function(a, b, c, d) {
        a = this.yb[a.toString()];
        var f = -1;
        a && (f = Id(a, b, c, d));
        return -1 < f ? a[f] : null
    }
    ;
    function Id(a, b, c, d) {
        for (var f = 0; f < a.length; ++f) {
            var g = a[f];
            if (!g.ng && g.listener == b && g.capture == !!c && g.Hj == d)
                return f
        }
        return -1
    }
    ;var Kd = "closure_lm_" + (1E6 * Math.random() | 0)
      , Ld = {}
      , Md = 0;
    function D(a, b, c, d, f) {
        if (d && d.once)
            return Nd(a, b, c, d, f);
        if (v(b)) {
            for (var g = 0; g < b.length; g++)
                D(a, b[g], c, d, f);
            return null
        }
        c = Od(c);
        Dd(a) ? (d = za(d) ? !!d.capture : !!d,
        Pd(a),
        a = a.Zc.add(String(b), c, !1, d, f)) : a = Qd(a, b, c, !1, d, f);
        return a
    }
    function Qd(a, b, c, d, f, g) {
        if (!b)
            throw Error("Invalid event type");
        var h = za(f) ? !!f.capture : !!f
          , k = Rd(a);
        k || (a[Kd] = k = new Hd(a));
        c = k.add(b, c, d, h, g);
        if (c.proxy)
            return c;
        d = Sd();
        c.proxy = d;
        d.src = a;
        d.listener = c;
        if (a.addEventListener)
            ud || (f = h),
            void 0 === f && (f = !1),
            a.addEventListener(b.toString(), d, f);
        else if (a.attachEvent)
            a.attachEvent(Td(b.toString()), d);
        else if (a.addListener && a.removeListener)
            x("change" === b, "MediaQueryList only has a change event"),
            a.addListener(d);
        else
            throw Error("addEventListener and attachEvent are unavailable.");
        Md++;
        return c
    }
    function Sd() {
        var a = Ud
          , b = sd ? function(c) {
            return a.call(b.src, b.listener, c)
        }
        : function(c) {
            c = a.call(b.src, b.listener, c);
            if (!c)
                return c
        }
        ;
        return b
    }
    function Nd(a, b, c, d, f) {
        if (v(b)) {
            for (var g = 0; g < b.length; g++)
                Nd(a, b[g], c, d, f);
            return null
        }
        c = Od(c);
        return Dd(a) ? a.Zc.add(String(b), c, !0, za(d) ? !!d.capture : !!d, f) : Qd(a, b, c, !0, d, f)
    }
    function Vd(a, b, c, d, f) {
        if (v(b))
            for (var g = 0; g < b.length; g++)
                Vd(a, b[g], c, d, f);
        else
            d = za(d) ? !!d.capture : !!d,
            c = Od(c),
            Dd(a) ? a.Zc.remove(String(b), c, d, f) : a && (a = Rd(a)) && (b = a.Th(b, c, d, f)) && Wd(b)
    }
    function Wd(a) {
        if (t(a) || !a || a.ng)
            return !1;
        var b = a.src;
        if (Dd(b))
            return Jd(b.Zc, a);
        var c = a.type
          , d = a.proxy;
        b.removeEventListener ? b.removeEventListener(c, d, a.capture) : b.detachEvent ? b.detachEvent(Td(c), d) : b.addListener && b.removeListener && b.removeListener(d);
        Md--;
        (c = Rd(b)) ? (Jd(c, a),
        0 == c.ni && (c.src = null,
        b[Kd] = null)) : Gd(a);
        return !0
    }
    function Td(a) {
        return a in Ld ? Ld[a] : Ld[a] = "on" + a
    }
    function Xd(a, b, c, d) {
        var f = !0;
        if (a = Rd(a))
            if (b = a.yb[b.toString()])
                for (b = b.concat(),
                a = 0; a < b.length; a++) {
                    var g = b[a];
                    g && g.capture == c && !g.ng && (g = Yd(g, d),
                    f = f && !1 !== g)
                }
        return f
    }
    function Yd(a, b) {
        var c = a.listener
          , d = a.Hj || a.src;
        a.Bj && Wd(a);
        return c.call(d, b)
    }
    function Ud(a, b) {
        if (a.ng)
            return !0;
        if (!sd) {
            if (!b)
                a: {
                    b = ["window", "event"];
                    for (var c = n, d = 0; d < b.length; d++)
                        if (c = c[b[d]],
                        null == c) {
                            b = null;
                            break a
                        }
                    b = c
                }
            d = b;
            b = new Ad(d,this);
            c = !0;
            if (!(0 > d.keyCode || void 0 != d.returnValue)) {
                a: {
                    var f = !1;
                    if (0 == d.keyCode)
                        try {
                            d.keyCode = -1;
                            break a
                        } catch (h) {
                            f = !0
                        }
                    if (f || void 0 == d.returnValue)
                        d.returnValue = !0
                }
                d = [];
                for (f = b.currentTarget; f; f = f.parentNode)
                    d.push(f);
                a = a.type;
                for (f = d.length - 1; !b.Ze && 0 <= f; f--) {
                    b.currentTarget = d[f];
                    var g = Xd(d[f], a, !0, b);
                    c = c && g
                }
                for (f = 0; !b.Ze && f < d.length; f++)
                    b.currentTarget = d[f],
                    g = Xd(d[f], a, !1, b),
                    c = c && g
            }
            return c
        }
        return Yd(a, new Ad(b,this))
    }
    function Rd(a) {
        a = a[Kd];
        return a instanceof Hd ? a : null
    }
    var Zd = "__closure_events_fn_" + (1E9 * Math.random() >>> 0);
    function Od(a) {
        x(a, "Listener can not be null.");
        if (ya(a))
            return a;
        x(a.handleEvent, "An object listener must have handleEvent method.");
        a[Zd] || (a[Zd] = function(b) {
            return a.handleEvent(b)
        }
        );
        return a[Zd]
    }
    ;function $d() {
        vd.call(this);
        this.Zc = new Hd(this);
        this.Vr = this;
        this.zm = null
    }
    w($d, vd);
    $d.prototype[Cd] = !0;
    e = $d.prototype;
    e.addEventListener = function(a, b, c, d) {
        D(this, a, b, c, d)
    }
    ;
    e.removeEventListener = function(a, b, c, d) {
        Vd(this, a, b, c, d)
    }
    ;
    e.dispatchEvent = function(a) {
        Pd(this);
        var b = this.zm;
        if (b) {
            var c = [];
            for (var d = 1; b; b = b.zm)
                c.push(b),
                x(1E3 > ++d, "infinite loop")
        }
        b = this.Vr;
        d = a.type || a;
        if (r(a))
            a = new zd(a,b);
        else if (a instanceof zd)
            a.target = a.target || b;
        else {
            var f = a;
            a = new zd(d,b);
            Xb(a, f)
        }
        f = !0;
        if (c)
            for (var g = c.length - 1; !a.Ze && 0 <= g; g--) {
                var h = a.currentTarget = c[g];
                f = ae(h, d, !0, a) && f
            }
        a.Ze || (h = a.currentTarget = b,
        f = ae(h, d, !0, a) && f,
        a.Ze || (f = ae(h, d, !1, a) && f));
        if (c)
            for (g = 0; !a.Ze && g < c.length; g++)
                h = a.currentTarget = c[g],
                f = ae(h, d, !1, a) && f;
        return f
    }
    ;
    e.dc = function() {
        $d.V.dc.call(this);
        if (this.Zc) {
            var a = this.Zc, b = 0, c;
            for (c in a.yb) {
                for (var d = a.yb[c], f = 0; f < d.length; f++)
                    ++b,
                    Gd(d[f]);
                delete a.yb[c];
                a.ni--
            }
        }
        this.zm = null
    }
    ;
    function ae(a, b, c, d) {
        b = a.Zc.yb[String(b)];
        if (!b)
            return !0;
        b = b.concat();
        for (var f = !0, g = 0; g < b.length; ++g) {
            var h = b[g];
            if (h && !h.ng && h.capture == c) {
                var k = h.listener
                  , u = h.Hj || h.src;
                h.Bj && Jd(a.Zc, h);
                f = !1 !== k.call(u, d) && f
            }
        }
        return f && 0 != d.xp
    }
    e.Th = function(a, b, c, d) {
        return this.Zc.Th(String(a), b, c, d)
    }
    ;
    function Pd(a) {
        x(a.Zc, "Event target is not initialized. Did you call the superclass (goog.events.EventTarget) constructor?")
    }
    ;var be = 0;
    function ce() {
        this.Lg = this.Od = this.jc = this.gb = null
    }
    e = ce.prototype;
    e.eg = function() {
        this.lf();
        if (this.Od)
            for (var a = l(this.Od), b = a.next(); !b.done; b = a.next())
                de(b.value);
        if (this.gb) {
            a = l(this.gb);
            for (b = a.next(); !b.done; b = a.next())
                if (b = b.value,
                v(b)) {
                    b = l(b);
                    for (var c = b.next(); !c.done; c = b.next())
                        Wd(c.value)
                } else
                    Wd(b);
            this.gb = null
        }
        if (this.jc)
            for (a = l(Object.keys(this.jc)),
            b = a.next(); !b.done; b = a.next())
                ee(this, b.value)
    }
    ;
    function E(a, b, c, d, f, g) {
        f = void 0 === f ? null : f;
        g = void 0 === g ? !1 : g;
        a.gb = a.gb || [];
        if (v(c)) {
            var h = [];
            c = l(c);
            for (var k = c.next(); !k.done; k = c.next())
                k = k.value,
                k = D(fe(b), k, d, g, f),
                h.push(k);
            a.gb.push(h)
        } else
            b = D(fe(b), c, d, g, f),
            a.gb.push(b)
    }
    function ge(a, b, c, d, f) {
        if (v(c)) {
            var g = !1;
            c = l(c);
            for (var h = c.next(); !h.done; h = c.next())
                g = ge(a, b, h.value, d, f) || g;
            return g
        }
        b = fe(b);
        d = Od(d);
        f = Dd(b) ? b.Th(c, d, !1, f) : b ? (b = Rd(b)) ? b.Th(c, d, !1, f) : null : null;
        return !!f && he(a, f)
    }
    function he(a, b) {
        if (v(b)) {
            var c = !1;
            b = l(b);
            for (var d = b.next(); !d.done; d = b.next())
                c = he(a, d.value) || c;
            return c
        }
        Wa(a.gb, b);
        return Wd(b)
    }
    function F(a, b, c, d, f) {
        a.jc = a.jc || {};
        b.addHandler(c, d, f);
        var g = ++be;
        a.jc[g] = {
            hm: b,
            gg: c,
            context: d,
            priority: f
        };
        return g
    }
    function ie(a, b, c, d) {
        function f(g) {
            for (var h = [], k = 0; k < arguments.length; ++k)
                h[k - 0] = arguments[k];
            c.apply(d, h);
            je(a, b, f, d)
        }
        F(a, b, f, d, void 0)
    }
    function je(a, b, c, d) {
        var f = Rb(a.jc, function(a) {
            return Ub(a, {
                hm: b,
                gg: c,
                context: d,
                priority: void 0
            })
        });
        f && ee(a, f)
    }
    function ee(a, b) {
        if (a.jc && a.jc[b]) {
            var c = a.jc[b];
            c.hm.removeHandler(c.gg, c.context, c.priority);
            delete a.jc[b]
        } else
            Na("unknown handler key")
    }
    function ke(a, b) {
        if (b) {
            if (a.jc) {
                var c = Ob(a.jc, function(a) {
                    return a.hm.co == b
                })
                  , d = l(Object.keys(c));
                for (c = d.next(); !c.done; c = d.next())
                    ee(a, c.value)
            }
            if (a.gb) {
                var f = fe(b);
                c = Ua(a.gb, function(a) {
                    return a.src == f
                });
                d = l(c);
                for (c = d.next(); !c.done; c = d.next())
                    he(a, c.value)
            }
        }
    }
    function G(a, b, c) {
        a.Od = a.Od || [];
        c && (a.Lg = a.Lg || {},
        a.Lg[c] = a.Lg[c] || [],
        a.Lg[c].push(b));
        a.Od.push(b);
        return b
    }
    e.oh = function(a) {
        for (var b = [], c = 0; c < arguments.length; ++c)
            b[c - 0] = arguments[c];
        if (this.Od)
            for (b = l(b),
            c = b.next(); !c.done; c = b.next())
                if (c = c.value) {
                    this.Ei(c);
                    var d = Sa(this.Od, c);
                    0 <= d && (this.Od.splice(d, 1),
                    de(c))
                }
    }
    ;
    e.Ei = function(a) {
        ke(this, a)
    }
    ;
    e.cn = function(a) {
        for (var b = [], c = 0; c < arguments.length; ++c)
            b[c - 0] = arguments[c];
        b = l(b);
        for (c = b.next(); !c.done; c = b.next())
            (c = c.value) && this.Ei(c)
    }
    ;
    function fe(a) {
        return p(a.displayObject) ? a.displayObject() : a
    }
    e.lf = function() {}
    ;
    function le() {
        this.Zf = this.Pe = this.kj = null
    }
    le.prototype.push = function(a, b) {
        if (0 == b)
            this.Zf = this.Zf || [];
        else if (this.kj = this.kj || [0],
        this.Pe = this.Pe || {},
        !(b in this.Pe)) {
            this.Pe[b] = [];
            var c = this.kj;
            var d = 0;
            for (var f = c.length, g; d < f; ) {
                var h = d + f >> 1;
                var k = c[h];
                k = b > k ? 1 : b < k ? -1 : 0;
                0 < k ? d = h + 1 : (f = h,
                g = !k)
            }
            d = g ? d : ~d;
            0 > d && $a(c, -(d + 1), 0, b)
        }
        b = me(this, b);
        x(b).push(a)
    }
    ;
    le.prototype.remove = function(a, b) {
        (b = me(this, b)) && Wa(b, a)
    }
    ;
    function ne(a, b) {
        return 0 == b ? a.Zf || [] : b in x(a.Pe) ? x(me(a, b)) : []
    }
    function oe(a) {
        if (!a.Pe)
            return a.Zf ? a.Zf.slice() : [];
        for (var b = [], c = x(a.kj), d = 0; d < c.length; ++d) {
            var f = me(a, c[d]);
            f && Za(b, f)
        }
        return b
    }
    function me(a, b) {
        return 0 == b ? a.Zf : x(a.Pe)[b]
    }
    ;function H(a) {
        a = void 0 === a ? null : a;
        ce.call(this);
        this.Xd = this.Ka = null;
        this.co = a
    }
    m(H, ce);
    e = H.prototype;
    e.es = function() {
        return this.co
    }
    ;
    e.addHandler = function(a, b, c) {
        this.Ka = this.Ka || new le;
        this.Ka.push({
            gg: a,
            context: b
        }, c || 0)
    }
    ;
    e.removeHandler = function(a, b, c) {
        c = c || 0;
        if (this.Ka)
            for (var d = ne(this.Ka, c), f = d.length, g = 0; g < f; ++g) {
                var h = d[g];
                if (h.gg == a && h.context == b) {
                    a = g;
                    (c = me(this.Ka, c)) && Xa(c, a);
                    break
                }
            }
        else
            Na("EventDispatcher has no handlers!")
    }
    ;
    e.ns = function(a, b, c) {
        if (!this.Ka)
            return !1;
        c = ne(this.Ka, c || 0);
        for (var d = c.length, f = 0; f < d; ++f) {
            var g = c[f];
            if (g.gg == a && g.context == b)
                return !0
        }
        return !1
    }
    ;
    e.f = function(a) {
        for (var b = [], c = 0; c < arguments.length; ++c)
            b[c - 0] = arguments[c];
        if (this.Ka) {
            c = oe(this.Ka);
            for (var d = c.length, f = 0; f < d; ++f) {
                var g = c[f];
                if (-1 != Sa(oe(this.Ka), g))
                    try {
                        g.gg.apply(g.context, arguments)
                    } catch (h) {
                        pe(h, !0)
                    }
            }
        }
        this.Xd && this.Xd.forEach(function(a) {
            a.f.apply(a, ca(b))
        })
    }
    ;
    function qe(a) {
        return a.Ka ? oe(a.Ka).length : 0
    }
    e.lf = function() {
        ce.prototype.lf.call(this)
    }
    ;
    H.prototype.dispatch = H.prototype.f;
    H.prototype.hasHandler = H.prototype.ns;
    H.prototype.removeHandler = H.prototype.removeHandler;
    H.prototype.addHandler = H.prototype.addHandler;
    H.prototype.eventOwner = H.prototype.es;
    function re(a, b, c) {
        this.Ee = a;
        this.Qc = b;
        this.Kf = null;
        this.Me = c
    }
    e = re.prototype;
    e.getViewport = function(a) {
        return this.Ee.getViewport(a)
    }
    ;
    e.getTextContent = function(a) {
        return this.Ee.getTextContent(a)
    }
    ;
    e.render = function(a, b) {
        var c = this;
        this.Kf = a = this.Ee.render(a);
        a.promise.then(function() {
            c.Kf = null;
            b && b(null)
        }, function(a) {
            console.warn("render", a);
            b && b(a)
        })
    }
    ;
    e.renderTextLayer = function(a, b) {
        this.Me ? this.Me.renderTextLayer(this.Ee, a, b) : b()
    }
    ;
    function se(a, b, c) {
        var d = b.viewport.clone({
            dontFlip: !0
        });
        a.Ee.getAnnotations({
            intent: "display"
        }).then(function(f) {
            if (0 < f.length) {
                for (var g = 0; g < f.length; ++g)
                    2 == f[g].annotationType && (f[g].newWindow = !0);
                PDFJS.AnnotationLayer.render({
                    viewport: d,
                    div: b.container,
                    annotations: f,
                    page: a.Ee,
                    linkService: a.Qc
                })
            }
            c()
        })
    }
    e.cleanup = function() {
        this.Ee.cleanup()
    }
    ;
    var te = /\S/;
    function ue(a, b) {
        return new C(a[0] * b[0] + a[1] * b[2] + b[4],a[0] * b[1] + a[1] * b[3] + b[5])
    }
    function ve(a, b, c) {
        var d = null;
        a.forEach(function(a) {
            if (te.test(a.str)) {
                var f = c.transform
                  , h = a.transform;
                var k = [f[0] * h[0] + f[2] * h[1], f[1] * h[0] + f[3] * h[1], f[0] * h[2] + f[2] * h[3], f[1] * h[2] + f[3] * h[3], f[0] * h[4] + f[2] * h[5] + f[4], f[1] * h[4] + f[3] * h[5] + f[5]];
                h = Math.atan2(k[1], k[0]);
                var u = b[a.fontName];
                u.vertical && (h += Math.PI / 2);
                var q = Math.sqrt(k[2] * k[2] + k[3] * k[3])
                  , y = q;
                u.ascent ? y *= u.ascent : u.descent && (y *= 1 + u.descent);
                0 === h ? (f = k[4],
                k = k[5] - y) : (f = k[4] + y * Math.sin(h),
                k = k[5] - y * Math.cos(h));
                y = 1;
                var I = 0;
                0 !== h && (y = Math.cos(h),
                I = Math.sin(h));
                a = (u.vertical ? a.height : a.width) * c.scale;
                0 !== h ? (a = [0, 0, a, q],
                u = [y, I, -I, y, f, k],
                f = ue(a, u),
                h = ue(a.slice(2, 4), u),
                q = ue([a[0], a[3]], u),
                a = ue([a[2], a[1]], u),
                a = new qd(Math.min(f.y, h.y, q.y, a.y),Math.max(f.x, h.x, q.x, a.x),Math.max(f.y, h.y, q.y, a.y),Math.min(f.x, h.x, q.x, a.x))) : a = new qd(k,f + a,k + q,f);
                a = new rd(a.left,a.top,a.right - a.left,a.bottom - a.top)
            } else
                a = null;
            a && (d && (d && a ? (f = new rd(d.left,d.top,d.width,d.height),
            h = Math.max(f.left + f.width, a.left + a.width),
            q = Math.max(f.top + f.height, a.top + a.height),
            f.left = Math.min(f.left, a.left),
            f.top = Math.min(f.top, a.top),
            f.width = h - f.left,
            f.height = q - f.top,
            a = f) : a = null),
            d = a)
        });
        return d
    }
    ;function we(a, b, c, d, f) {
        this.qq = a;
        this.Zp = b;
        this.$p = c;
        this.pr = d;
        this.qr = f
    }
    e = we.prototype;
    e.id = function() {
        return this.qq
    }
    ;
    e.clientX = function() {
        return this.Zp
    }
    ;
    e.clientY = function() {
        return this.$p
    }
    ;
    e.screenX = function() {
        return this.pr
    }
    ;
    e.screenY = function() {
        return this.qr
    }
    ;
    function xe(a, b) {
        this.Qd = a;
        this.Fr = b
    }
    function ye(a) {
        x(0 < a.length);
        for (var b = [], c = 0; c < a.length; ++c) {
            var d = a[c];
            b.push(new we(d.pointerId,d.clientX,d.clientY,d.screenX,d.screenY))
        }
        return new xe(a[0],b)
    }
    xe.prototype.touches = function() {
        return this.Fr
    }
    ;
    xe.prototype.scale = function() {
        return this.Qd.scale
    }
    ;
    xe.prototype.rotation = function() {
        return this.Qd.rotation
    }
    ;
    var ze = ["touchstart", "mousedown"]
      , Ae = ["touchend", "mouseup"]
      , Be = ["touchmove", "mousemove"];
    var Ce = {
        passive: !1
    }
      , De = {
        passive: !0
    };
    function Ee(a) {
        this.Nd = a;
        this.jd = {};
        this.xe = {}
    }
    e = Ee.prototype;
    e.Eh = !1;
    e.Qi = -1;
    function Fe(a) {
        var b = a.Nd;
        window.navigator.msPointerEnabled ? (D(b, "MSPointerDown", a.Sn, !1, a),
        D(b, "MSPointerUp", a.Un, !1, a),
        D(b, "MSPointerMove", a.Tn, !1, a)) : (D(b, ze, a.bo, Ce, a),
        D(b, Ae, a.$n, !1, a),
        D(b, Be, a.ao, Ce, a))
    }
    function Ge(a) {
        var b = a.Nd;
        window.navigator.msPointerEnabled ? (Vd(b, "MSPointerDown", a.Sn, !1, a),
        Vd(b, "MSPointerUp", a.Un, !1, a),
        Vd(b, "MSPointerMove", a.Tn, !1, a)) : (Vd(b, ze, a.bo, Ce, a),
        Vd(b, Ae, a.$n, !1, a),
        Vd(b, Be, a.ao, Ce, a))
    }
    e.bo = function(a) {
        var b = a.Oa;
        x(b);
        if (!this.Eh || b.touches && 1 == b.touches.length)
            this.Eh = !0,
            a = He(a),
            Ie(this, "touchStart", a)
    }
    ;
    e.$n = function(a) {
        if (this.Eh) {
            this.Eh = !1;
            var b = He(a);
            if (Ie(this, "touchEnd", b)) {
                if (b = a.target)
                    if ("TEXTAREA" == b.nodeName)
                        b = !0;
                    else {
                        var c = b.getAttribute("type");
                        b = "INPUT" == b.nodeName && (!c || "text" == c || "number" == c)
                    }
                else
                    b = !1;
                b || Je(a.target) || Ke(a.target) || a.preventDefault()
            }
        }
    }
    ;
    e.ao = function(a) {
        !Ke(a.target) && this.Eh && (a = He(a),
        Ie(this, "touchMove", a))
    }
    ;
    function He(a) {
        a = a.Oa;
        x(a);
        if (p(window.TouchEvent) && a instanceof TouchEvent) {
            x(a.touches);
            for (var b = [], c = 0; c < a.touches.length; ++c) {
                var d = a.touches[c];
                b.push(new we(d.identifier,d.clientX,d.clientY,d.screenX,d.screenY))
            }
            a = new xe(a,b)
        } else
            b = [],
            b.push(new we(0,a.clientX,a.clientY,a.screenX,a.screenY)),
            a = new xe(a,b);
        return a
    }
    e.Sn = function(a) {
        var b = a.Oa;
        this.jd[b.pointerId] = b;
        Le(this, a);
        b = Pb(this.jd);
        a = 1 == b.length ? "touchStart" : "touchMove";
        b = ye(b);
        Ie(this, a, b)
    }
    ;
    e.Un = function(a) {
        var b = a.Oa;
        if (b.pointerId in this.jd) {
            delete this.jd[b.pointerId];
            Le(this, a);
            var c = Pb(this.jd);
            a = 0 < c.length ? "touchMove" : "touchEnd";
            0 == c.length && (c = [b]);
            c = ye(c);
            Ie(this, a, c) && b.preventDefault()
        }
    }
    ;
    e.Tn = function(a) {
        var b = a.Oa;
        b.pointerId in this.jd && (this.jd[b.pointerId] = b,
        Le(this, a),
        a = ye(Pb(this.jd)),
        Ie(this, "touchMove", a))
    }
    ;
    function Le(a, b) {
        "touch" == b.pointerType && (0 < a.Qi && clearTimeout(a.Qi),
        a.Qi = setTimeout(Fa(a.rq, a), 200))
    }
    e.rq = function() {
        this.jd = {};
        this.Qi = -1;
        for (var a in this.xe)
            this.xe.hasOwnProperty(a) && this.xe[a].ke()
    }
    ;
    function Ie(a, b, c) {
        var d = 0, f = null, g;
        for (g in a.xe)
            if (a.xe.hasOwnProperty(g)) {
                var h = a.xe[g]
                  , k = h.Gj(b, c);
                k > d && (d = k,
                f = h)
            }
        return f ? (c.Qd.defaultPrevented ? f.ke() : f.zj(c),
        !0) : !1
    }
    function Me(a, b) {
        a.xe[b.Sh()] = b
    }
    ;function Ne() {
        this.tj = new H;
        this.ln = new H;
        this.Dl = new H;
        this.Cl = new H
    }
    e = Ne.prototype;
    e.Pb = null;
    e.wj = !1;
    e.Sh = function() {
        return "tap"
    }
    ;
    e.Gj = function(a, b) {
        if ("touchEnd" == a)
            return this.wj ? 1 : 0;
        var c = new C(b.touches()[0].clientX(),b.touches()[0].clientY());
        if ("touchStart" == a && 1 == b.touches().length)
            return this.Pb = c,
            this.wj = !0,
            this.Dl.f(),
            Oe || D(window, "scroll", this.ke, !1, this),
            0;
        if (!this.Pb)
            return 0;
        50 >= Uc(c, this.Pb) || this.wj && this.ke();
        return 0
    }
    ;
    e.zj = function(a) {
        x(this.Pb);
        this.tj.f(this.Pb.x, this.Pb.y, a.Qd);
        var b = !1
          , c = Ga();
        this.$k && (x(this.Bn),
        1E3 > c - this.$k && 50 >= Uc(this.Bn, this.Pb) && (b = !0,
        this.ln.f(this.Pb.x, this.Pb.y, a.Qd)));
        this.$k = b ? null : c;
        this.Bn = this.Pb
    }
    ;
    e.ke = function() {
        Vd(window, "scroll", this.ke, !1, this);
        this.wj = !1;
        this.Cl.f()
    }
    ;
    function Pe(a, b, c) {
        if (r(b))
            (b = Qe(a, b)) && (a.style[b] = c);
        else
            for (var d in b) {
                c = a;
                var f = b[d]
                  , g = Qe(c, d);
                g && (c.style[g] = f)
            }
    }
    var Re = {};
    function Qe(a, b) {
        var c = Re[b];
        if (!c) {
            var d = Ib(b);
            c = d;
            void 0 === a.style[d] && (d = (ic ? "Webkit" : hc ? "Moz" : B ? "ms" : ec ? "O" : null) + Jb(d),
            void 0 !== a.style[d] && (c = d));
            Re[b] = c
        }
        return c
    }
    function Se(a, b) {
        var c = dd(a);
        return c.defaultView && c.defaultView.getComputedStyle && (a = c.defaultView.getComputedStyle(a, null)) ? a[b] || a.getPropertyValue(b) || "" : ""
    }
    function Te(a) {
        return Se(a, "direction") || (a.currentStyle ? a.currentStyle.direction : null) || a.style && a.style.direction
    }
    function Ue(a) {
        return new C(a.offsetLeft,a.offsetTop)
    }
    function Ve(a) {
        x(a);
        if (1 == a.nodeType) {
            a: {
                try {
                    var b = a.getBoundingClientRect()
                } catch (c) {
                    b = {
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0
                    };
                    break a
                }
                B && a.ownerDocument.body && (a = a.ownerDocument,
                b.left -= a.documentElement.clientLeft + a.body.clientLeft,
                b.top -= a.documentElement.clientTop + a.body.clientTop)
            }
            return new C(b.left,b.top)
        }
        b = a.changedTouches ? a.changedTouches[0] : a;
        return new C(b.clientX,b.clientY)
    }
    function We(a) {
        "number" == typeof a && (a = Math.round(a) + "px");
        return a
    }
    function Xe(a) {
        return new Wc(a.offsetWidth,a.offsetHeight)
    }
    function Ye(a, b, c, d) {
        if (/^\d+px?$/.test(b))
            return parseInt(b, 10);
        var f = a.style[c]
          , g = a.runtimeStyle[c];
        a.runtimeStyle[c] = a.currentStyle[c];
        a.style[c] = b;
        b = a.style[d];
        a.style[c] = f;
        a.runtimeStyle[c] = g;
        return +b
    }
    function Ze(a, b) {
        return (b = a.currentStyle ? a.currentStyle[b] : null) ? Ye(a, b, "left", "pixelLeft") : 0
    }
    var $e = {
        thin: 2,
        medium: 4,
        thick: 6
    };
    function af(a, b) {
        if ("none" == (a.currentStyle ? a.currentStyle[b + "Style"] : null))
            return 0;
        b = a.currentStyle ? a.currentStyle[b + "Width"] : null;
        return b in $e ? $e[b] : Ye(a, b, "left", "pixelLeft")
    }
    ;function bf(a) {
        if (a.classList)
            return a.classList;
        a = a.className;
        return r(a) && a.match(/\S+/g) || []
    }
    function cf(a, b) {
        a.classList ? b = a.classList.contains(b) : (a = bf(a),
        b = 0 <= Sa(a, b));
        return b
    }
    function J(a, b) {
        a.classList ? a.classList.add(b) : cf(a, b) || (a.className += 0 < a.className.length ? " " + b : b)
    }
    function K(a, b) {
        a.classList ? a.classList.remove(b) : cf(a, b) && (a.className = Ua(bf(a), function(a) {
            return a != b
        }).join(" "))
    }
    ;function df(a, b) {
        this.nk = a;
        this.Pd = b
    }
    df.prototype.className = function() {
        return this.Pd ? this.nk + "__" + this.Pd : this.nk
    }
    ;
    function ef(a, b) {
        return a.className() + "_" + b
    }
    function ff(a, b, c) {
        return ef(a, b) + "_" + c
    }
    function gf(a, b, c) {
        b = bf(b);
        var d = ff(a, c, "");
        return Va(b, function(a) {
            return 0 == a.indexOf(d)
        })
    }
    ;var hf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || setTimeout;
    function jf(a, b) {
        a.className.baseVal = b
    }
    function kf(a) {
        return r(a.className) ? bf(a) : (a = a.className.baseVal,
        r(a) && a.match(/\S+/g) || [])
    }
    function lf(a, b) {
        r(a.className) ? b = cf(a, b) : (a = kf(a),
        b = 0 <= Sa(a, b));
        return b
    }
    function mf(a, b) {
        if (r(a.className))
            J(a, b);
        else if (!lf(a, b)) {
            var c = a.className.baseVal;
            c += 0 < a.className.baseVal.length ? " " + b : b;
            jf(a, c)
        }
    }
    function nf(a, b) {
        r(a.className) ? K(a, b) : lf(a, b) && jf(a, Ua(kf(a), function(a) {
            return a != b
        }).join(" "))
    }
    ;function L(a) {
        ce.apply(this, arguments)
    }
    m(L, ce);
    function M(a, b) {
        var c = new H(a);
        G(a, c);
        if (b)
            if (v(b))
                for (a = l(b),
                b = a.next(); !b.done; b = a.next())
                    b = b.value,
                    b.Xd || (b.Xd = []),
                    b.Xd.push(c);
            else
                b.Xd || (b.Xd = []),
                b.Xd.push(c);
        return c
    }
    ;function of(a) {
        H.call(this, a);
        this.Tg = G(this, new H);
        this.Mk = G(this, new H)
    }
    m(of, H);
    of.prototype.addHandler = function(a, b, c) {
        H.prototype.addHandler.call(this, a, b, c);
        this.Tg.f()
    }
    ;
    of.prototype.removeHandler = function(a, b, c) {
        H.prototype.removeHandler.call(this, a, b, c);
        this.Mk.f()
    }
    ;
    var pf = A("Firefox")
      , qf = $b() || A("iPod")
      , rf = A("iPad")
      , sf = A("Android") && !(Zb() || A("Firefox") || A("Opera") || A("Silk"))
      , tf = Zb()
      , uf = A("Safari") && !(Zb() || A("Coast") || A("Opera") || A("Edge") || A("Silk") || A("Android")) && !ac();
    var vf;
    function wf(a) {
        a instanceof Ad && (a = a.Oa);
        x(a);
        vf || (vf = new WeakMap);
        return vf.has(a)
    }
    function xf(a) {
        a instanceof Ad && (a = a.Oa);
        x(a);
        return a.defaultPrevented ? !0 : wf(a)
    }
    ;function yf(a, b) {
        $d.call(this);
        this.hg = a || 1;
        this.li = b || n;
        this.hp = Fa(this.Ts, this);
        this.pp = Ga()
    }
    w(yf, $d);
    e = yf.prototype;
    e.enabled = !1;
    e.Lc = null;
    e.setInterval = function(a) {
        this.hg = a;
        this.Lc && this.enabled ? (this.stop(),
        this.start()) : this.Lc && this.stop()
    }
    ;
    e.Ts = function() {
        if (this.enabled) {
            var a = Ga() - this.pp;
            0 < a && a < .8 * this.hg ? this.Lc = this.li.setTimeout(this.hp, this.hg - a) : (this.Lc && (this.li.clearTimeout(this.Lc),
            this.Lc = null),
            this.dispatchEvent("tick"),
            this.enabled && (this.stop(),
            this.start()))
        }
    }
    ;
    e.start = function() {
        this.enabled = !0;
        this.Lc || (this.Lc = this.li.setTimeout(this.hp, this.hg),
        this.pp = Ga())
    }
    ;
    e.stop = function() {
        this.enabled = !1;
        this.Lc && (this.li.clearTimeout(this.Lc),
        this.Lc = null)
    }
    ;
    e.dc = function() {
        yf.V.dc.call(this);
        this.stop();
        delete this.li
    }
    ;
    function zf(a, b) {
        if (!ya(a))
            if (a && "function" == typeof a.handleEvent)
                a = Fa(a.handleEvent, a);
            else
                throw Error("Invalid listener argument");
        return 2147483647 < Number(b) ? -1 : n.setTimeout(a, b || 0)
    }
    ;var Af = null
      , Bf = null
      , Cf = hc || ic && !uf || ec || "function" == typeof n.btoa;
    function Df(a) {
        var b = [];
        Ef(a, function(a) {
            b.push(a)
        });
        return b
    }
    function Ef(a, b) {
        function c(b) {
            for (; d < a.length; ) {
                var c = a.charAt(d++)
                  , f = Bf[c];
                if (null != f)
                    return f;
                if (!/^[\s\xa0]*$/.test(c))
                    throw Error("Unknown base64 encoding at char: " + c);
            }
            return b
        }
        Ff();
        for (var d = 0; ; ) {
            var f = c(-1)
              , g = c(0)
              , h = c(64)
              , k = c(64);
            if (64 === k && -1 === f)
                break;
            b(f << 2 | g >> 4);
            64 != h && (b(g << 4 & 240 | h >> 2),
            64 != k && b(h << 6 & 192 | k))
        }
    }
    function Ff() {
        if (!Af) {
            Af = {};
            Bf = {};
            for (var a = 0; 65 > a; a++)
                Af[a] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a),
                Bf[Af[a]] = a,
                62 <= a && (Bf["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(a)] = a)
        }
    }
    ;function Gf(a, b) {
        this.Kr = a;
        this.Wp = b || []
    }
    Ha("iSpring.ios.mobile.MobileAppCommand", Gf);
    Gf.prototype.id = function() {
        return Aa(this)
    }
    ;
    function Hf(a) {
        try {
            var b = document.createElement("iframe");
            Pe(b, {
                width: "1px",
                height: "1px",
                border: "0"
            });
            b.src = a;
            bd(document.body, b);
            zf(function() {
                fd(b)
            }, 100)
        } catch (c) {}
    }
    ;function If(a) {
        this.length = a.length || a;
        for (var b = 0; b < this.length; b++)
            this[b] = a[b] || 0
    }
    If.prototype.BYTES_PER_ELEMENT = 4;
    If.prototype.set = function(a, b) {
        b = b || 0;
        for (var c = 0; c < a.length && b + c < this.length; c++)
            this[b + c] = a[c]
    }
    ;
    If.prototype.toString = Array.prototype.join;
    "undefined" == typeof Float32Array && (If.BYTES_PER_ELEMENT = 4,
    If.prototype.BYTES_PER_ELEMENT = If.prototype.BYTES_PER_ELEMENT,
    If.prototype.set = If.prototype.set,
    If.prototype.toString = If.prototype.toString,
    Ha("Float32Array", If));
    function Jf(a) {
        this.length = a.length || a;
        for (var b = 0; b < this.length; b++)
            this[b] = a[b] || 0
    }
    Jf.prototype.BYTES_PER_ELEMENT = 8;
    Jf.prototype.set = function(a, b) {
        b = b || 0;
        for (var c = 0; c < a.length && b + c < this.length; c++)
            this[b + c] = a[c]
    }
    ;
    Jf.prototype.toString = Array.prototype.join;
    if ("undefined" == typeof Float64Array) {
        try {
            Jf.BYTES_PER_ELEMENT = 8
        } catch (a) {}
        Jf.prototype.BYTES_PER_ELEMENT = Jf.prototype.BYTES_PER_ELEMENT;
        Jf.prototype.set = Jf.prototype.set;
        Jf.prototype.toString = Jf.prototype.toString;
        Ha("Float64Array", Jf)
    }
    ;function Kf(a, b) {
        a: {
            var c = ["transformOrigin", "webkitTransformOrigin", "msTransformOrigin", "MozTransformOrigin", "OTransformOrigin"];
            for (var d = 0; d < c.length; ++d)
                if (p(a.style[c[d]])) {
                    c = c[d];
                    break a
                }
            throw Error("browser doesn't support css style " + c[0]);
        }
        Pe(a, c, b)
    }
    ;function Lf() {
        if (Mf)
            return new Wc(document.documentElement.clientWidth,document.documentElement.clientHeight);
        if (N && B)
            return new Wc(screen.width,screen.height);
        var a = p(window.devicePixelRatio) ? window.devicePixelRatio : 1;
        return Nf ? new Wc(screen.width / a,screen.height / a) : N ? Of && (a = Math.max(screen.width, screen.height),
        document.documentElement.clientWidth > a) ? new Wc(Math.max(document.documentElement.clientWidth, a),Math.max(document.documentElement.clientHeight, Math.min(screen.width, screen.height))) : new Wc(screen.width,screen.height) : new Wc(screen.width * a,screen.height * a)
    }
    function Pf(a) {
        var b = window.location.search.substr(1);
        if (!b)
            return {};
        var c = {};
        b = b.split("&");
        for (var d = 0; d < b.length; ++d) {
            var f = b[d].split("=");
            if (2 == f.length) {
                try {
                    var g = decodeURIComponent(f[0].replace(/\+/g, " "))
                } catch (k) {
                    g = f[0]
                }
                try {
                    var h = decodeURIComponent(f[1].replace(/\+/g, " "))
                } catch (k) {
                    h = f[1]
                }
                a || (g = g.toLowerCase());
                c[g] = h
            }
        }
        return c
    }
    function Je(a) {
        if (!a)
            return !1;
        for (; a; ) {
            if ("A" == a.nodeName.toLocaleUpperCase())
                return !0;
            a = a.parentNode
        }
        return !1
    }
    function Ke(a) {
        return a && "VIDEO" == a.nodeName && a.controls
    }
    ;(function() {
        function a(a) {
            try {
                return a.ISPlayer && (window.ISPlayer = a.ISPlayer),
                a.ISPVideoPlayer && (window.ISPVideoPlayer = a.ISPVideoPlayer),
                a.ISPQuizPlayer && (window.ISPQuizPlayer = a.ISPQuizPlayer),
                a.ISPInteractionPlayerCore && (window.ISPInteractionPlayerCore = a.ISPInteractionPlayerCore),
                a.ISPBookPlayer && (window.ISPBookPlayer = a.ISPBookPlayer),
                a.ISPScenarioPlayer && (window.ISPScenarioPlayer = a.ISPScenarioPlayer),
                a.ISPFlipPlayer && (window.ISPFlipPlayer = a.ISPFlipPlayer),
                !0
            } catch (f) {
                return !1
            }
        }
        if (function() {
            try {
                var a = window.frameElement
            } catch (f) {}
            return null != a
        }())
            for (var b = window, c = 7; b && b.parent != b && 0 != c-- && !a(b.parent); )
                b = b.parent
    }
    )();
    var Qf, Rf = Pf(void 0).user_agent;
    Qf = Rf ? Rf : Kb || "";
    var Of = rf || qf, Mf = "1" == Pf(void 0).small_screen, Sf = "1" == Pf(void 0).tablet_screen, Tf, Vf;
    try {
        Vf = window.top.location.href ? window.frameElement : null
    } catch (a) {}
    var Wf = (Tf = null != Vf) && window.frameElement && window.frameElement.parentNode && "FRAMESET" == window.frameElement.parentNode.tagName ? !0 : !1
      , Xf = qf && Tf;
    function Yf() {
        var a = Qf.toLowerCase();
        return -1 != a.indexOf("android") || -1 != a.indexOf("mobile") || -1 != a.indexOf("wpdesktop") || Mf || Sf
    }
    var Zf = -1 != Qf.toLowerCase().indexOf("chrome")
      , $f = -1 == Qf.toLowerCase().indexOf("windows phone") && -1 != Qf.toLowerCase().indexOf("android")
      , N = Yf()
      , ag = N && (Yf() ? "ontouchstart"in window || p(window.DocumentTouch) && document instanceof window.DocumentTouch || -1 != Qf.toLowerCase().indexOf("touch") : !1)
      , bg = "";
    if (Of) {
        var cg = /CPU.+OS\s(\d+)_(\d+)/.exec(Qf);
        bg = cg ? cg[1] + "." + cg[2] : ""
    }
    var dg = parseInt(bg, 10), eg = Of && 12 <= dg, fg = B && "9." == sc.substr(0, 2), Oe = gg && B, Nf = $f && !Zf && !pf && !ec, hg = -1 != Qf.toLowerCase().indexOf("micromessenger"), ig = -1 != Qf.indexOf("ismobile"), jg;
    if (jg = !window._ispringFullsizeSkin) {
        var kg;
        if (!(kg = Mf))
            if (window._ispringFullsizeSkin)
                kg = !1;
            else {
                var lg = Lf();
                kg = (qf || 700 > Math.min(lg.width, lg.height)) && !Sf
            }
        jg = kg
    }
    var gg = jg
      , mg = p(window.ISPlayer)
      , ng = document.createElement("audio")
      , og = ng.play && ng.play();
    og && og.then(function() {
        ng.pause()
    }, function() {});
    Pf(void 0);
    Pf(void 0);
    function pg() {
        return 1 == window._ispringDebug || "1" == Pf(void 0).isdebug
    }
    if (A("Windows")) {
        var qg = Kb, rg;
        if (A("Windows")) {
            rg = /Windows (?:NT|Phone) ([0-9.]+)/;
            var sg = rg.exec(qg)
        } else
            ac() ? (rg = /(?:iPhone|iPod|iPad|CPU)\s+OS\s+(\S+)/,
            (sg = rg.exec(qg)) && sg[1].replace(/_/g, ".")) : A("Macintosh") ? (rg = /Mac OS X ([0-9_.]+)/,
            (sg = rg.exec(qg)) && sg[1].replace(/_/g, ".")) : A("Android") ? (rg = /Android\s+([^\);]+)(\)|;)/,
            sg = rg.exec(qg)) : A("CrOS") && (rg = /(?:CrOS\s+(?:i686|x86_64)\s+([0-9.]+))/,
            sg = rg.exec(qg))
    }
    setTimeout(function() {
        tg = pg
    }, 0);
    function ug(a, b, c, d, f, g) {
        if (6 == arguments.length)
            this.setTransform(a, b, c, d, f, g);
        else {
            if (0 != arguments.length)
                throw Error("Insufficient matrix parameters");
            this.ec = this.hc = 1;
            this.gc = this.fc = this.qc = this.rc = 0
        }
    }
    e = ug.prototype;
    e.clone = function() {
        return new ug(this.ec,this.gc,this.fc,this.hc,this.qc,this.rc)
    }
    ;
    e.setTransform = function(a, b, c, d, f, g) {
        if (!(t(a) && t(b) && t(c) && t(d) && t(f) && t(g)))
            throw Error("Invalid transform parameters");
        this.ec = a;
        this.gc = b;
        this.fc = c;
        this.hc = d;
        this.qc = f;
        this.rc = g;
        return this
    }
    ;
    e.scale = function(a, b) {
        this.ec *= a;
        this.gc *= a;
        this.fc *= b;
        this.hc *= b;
        return this
    }
    ;
    e.translate = function(a, b) {
        this.qc += a * this.ec + b * this.fc;
        this.rc += a * this.gc + b * this.hc;
        return this
    }
    ;
    e.rotate = function(a, b, c) {
        var d = new ug
          , f = Math.cos(a);
        a = Math.sin(a);
        b = d.setTransform(f, a, -a, f, b - b * f + c * a, c - b * a - c * f);
        c = this.ec;
        d = this.fc;
        this.ec = b.ec * c + b.gc * d;
        this.fc = b.fc * c + b.hc * d;
        this.qc += b.qc * c + b.rc * d;
        c = this.gc;
        d = this.hc;
        this.gc = b.ec * c + b.gc * d;
        this.hc = b.fc * c + b.hc * d;
        this.rc += b.qc * c + b.rc * d;
        return this
    }
    ;
    e.toString = function() {
        return "matrix(" + [this.ec, this.gc, this.fc, this.hc, this.qc, this.rc].join() + ")"
    }
    ;
    e.transform = function(a, b, c, d, f) {
        var g = b;
        for (b += 2 * f; g < b; ) {
            f = a[g++];
            var h = a[g++];
            c[d++] = f * this.ec + h * this.fc + this.qc;
            c[d++] = f * this.gc + h * this.hc + this.rc
        }
    }
    ;
    function vg(a, b, c) {
        c = c || b;
        b = (new ug).setTransform(b, 0, 0, c, 0, 0);
        if (wg)
            c = wg;
        else {
            c = null;
            for (var d = Zc("DIV"), f = [["transform", xg, {
                transform: "transform",
                transformOrigin: "transformOrigin"
            }], ["webkitTransform", xg, {
                transform: "webkitTransform",
                transformOrigin: "webkitTransformOrigin"
            }], ["msTransform", xg, {
                transform: "msTransform",
                transformOrigin: "msTransformOrigin"
            }], ["MozTransform", yg, {
                transform: "MozTransform",
                transformOrigin: "MozTransformOrigin"
            }], ["OTransform", xg, {
                transform: "OTransform",
                transformOrigin: "OTransformOrigin"
            }]], g = 0; g < f.length; ++g)
                if (p(d.style[f[g][0]])) {
                    c = new f[g][1](f[g][2]);
                    break
                }
            if (!c)
                throw Error("browser doesn't support css matrix transformation");
            wg = c
        }
        a.style[c.io.transform] = 1 == b.ec && 0 == b.gc && 0 == b.fc && 1 == b.hc && 0 == b.qc && 0 == b.rc ? "" : "matrix(" + c.Jl(b).join(",") + ")"
    }
    function zg(a) {
        return Math.floor(1E6 * a) / 1E6
    }
    var wg = null;
    function xg(a) {
        this.io = a
    }
    xg.prototype.Jl = function(a) {
        return [zg(a.ec), zg(a.gc), zg(a.fc), zg(a.hc), zg(a.qc), zg(a.rc)]
    }
    ;
    function yg(a) {
        this.io = a
    }
    w(yg, xg);
    yg.prototype.Jl = function(a) {
        a = yg.V.Jl.call(this, a);
        a[4] += "px";
        a[5] += "px";
        return a
    }
    ;
    var Ag, Bg = [];
    if (window.MutationObserver) {
        Ag = new MutationObserver(function(a) {
            a && a.forEach(function(a) {
                x(a);
                a = l(a.removedNodes);
                for (var b = a.next(); !b.done; b = a.next()) {
                    b = b.value;
                    for (var d = l(Bg), f = d.next(); !f.done; f = d.next())
                        f = f.value,
                        ya(b.contains) && b.contains(f.displayObject()) && f.Bc()
                }
            })
        }
        );
        var Cg = {
            subtree: !0,
            childList: !0
        };
        hf(function() {
            Ag.observe(document.body, Cg)
        })
    }
    function R(a) {
        var b = a || {};
        a = b.J;
        var c = b.S
          , d = b.jp
          , f = b.gp
          , g = b.$f
          , h = b.wp
          , k = b.cp
          , u = b.hv
          , q = b.Jd
          , y = b.zp
          , I = b.tabIndex;
        b = b.Wr;
        L.call(this);
        var O = this;
        f || (f = Zc(g || "DIV"));
        this.g = f;
        this.Di = [];
        if (a || c)
            a = a || new df(x(c),d),
            Dg(this, a);
        this.nh = p(h) ? h : !0;
        this.Gf = this.yc = this.Fc = this.ie = this.he = this.kf = void 0;
        this.ih = 1;
        this.No = {};
        this.Sl = null;
        q && (this.Je = Eg(this));
        (this.zl = y) && this.ii(!1);
        p(I) && this.Mm(I);
        this.D = G(this, new of(this));
        Fg(this, this.D);
        u && F(this, this.D, va);
        b && Gg(this);
        this.Ie = M(this);
        if (!1 === k) {
            var Q = !1;
            E(this, this.displayObject(), "mousedown", function() {
                Q = !0
            });
            E(this, this.displayObject(), "focusout", function(a) {
                a.target == a.currentTarget && (Q = !1)
            });
            E(this, this.displayObject(), "focusin", function(a) {
                Q && a.target == a.currentTarget && hf(function() {
                    O.displayObject().blur()
                })
            })
        }
    }
    m(R, L);
    e = R.prototype;
    e.focus = function() {
        this.g.focus()
    }
    ;
    e.getAttribute = function(a) {
        return this.g.getAttribute(a)
    }
    ;
    e.setAttribute = function(a, b) {
        this.g.setAttribute(a, b)
    }
    ;
    e.removeAttribute = function(a) {
        this.g.removeAttribute(a)
    }
    ;
    e.Mm = function(a) {
        this.kf = a;
        this.uh(a)
    }
    ;
    e.ka = function(a) {
        this.he = a;
        this.g.style.left = a + "px"
    }
    ;
    e.Jc = function(a) {
        this.ie = a;
        this.g.style.top = a + "px"
    }
    ;
    e.move = function(a, b) {
        this.ka(a);
        this.Jc(b)
    }
    ;
    e.$ = function(a) {
        this.resize(a)
    }
    ;
    e.qa = function(a) {
        this.resize(void 0, a)
    }
    ;
    e.resize = function(a, b) {
        this.ul(a, b);
        p(a) && (this.Fc = a);
        p(b) && (this.yc = b);
        this.ia(this.width(), this.height());
        this.Ie.f(this)
    }
    ;
    e.Pa = function(a) {
        p(this.kf) && this.uh(a ? this.kf : -1);
        a ? this.g.removeAttribute("disabled") : this.g.setAttribute("disabled", "")
    }
    ;
    e.Ep = function(a) {
        this.Sl = null;
        this.g.style.display = a ? "" : "none"
    }
    ;
    e.dd = function(a) {
        this.va("opacity", a);
        this.Gf = a
    }
    ;
    e.c = function(a) {
        a = this.Eb(a);
        bd(this.g, a)
    }
    ;
    function Hg(a, b) {
        G(a, b, void 0);
        a.c(b)
    }
    e.xj = function(a, b) {
        a = this.Eb(a);
        this.g == a.parentNode && this.g.childNodes[b] == a || ed(this.g, a, b)
    }
    ;
    e.removeChild = function(a) {
        a = this.Eb(a);
        this.sm(a) && this.g.removeChild(a)
    }
    ;
    e.U = function(a) {
        hd(this.g, a)
    }
    ;
    e.ei = function(a) {
        this.g.innerHTML = a
    }
    ;
    e.va = function(a, b) {
        Pe(this.g, a, b)
    }
    ;
    e.qg = function(a) {
        this.$e("label", a)
    }
    ;
    e.Im = function(a) {
        v(a) && (a = a.join(" "));
        nd(this.g, a)
    }
    ;
    e.di = function(a) {
        this.$e("hidden", a)
    }
    ;
    e.$e = function(a, b) {
        od(this.g, a, b)
    }
    ;
    function Ig(a, b) {
        a = a.g.getAttribute(pd(b));
        return null == a || void 0 == a ? "" : String(a)
    }
    function Jg(a, b) {
        b instanceof df || (b = new df(b,void 0));
        Dg(a, b)
    }
    e.Z = function(a, b) {
        var c = this;
        if (this.Di.length)
            for (var d = {}, f = l(this.Di), g = f.next(); !g.done; d = {
                ui: d.ui,
                ti: d.ti,
                gk: d.gk
            },
            g = f.next())
                g = g.value,
                r(b) ? (d.ui = gf(g, this.g, a),
                d.ui && (delete this.No[a],
                function(a) {
                    return function() {
                        nf(c.g, x(a.ui))
                    }
                }(d)()),
                b && (d.ti = ff(g, a, b),
                this.No[a] = d.ti,
                function(a) {
                    return function() {
                        mf(c.g, a.ti)
                    }
                }(d)())) : (d.gk = ef(g, a),
                function(a) {
                    return function() {
                        var d = c.g
                          , f = a.gk;
                        b ? J(d, f) : K(d, f)
                    }
                }(d)());
        else
            (function() {
                var d = c.g;
                b ? J(d, a) : K(d, a)
            }
            )(),
            Na("component has no bemInfo")
    }
    ;
    e.ii = function(a) {
        x(this.zl);
        this.$e("selected", a)
    }
    ;
    e.selected = function() {
        x(this.zl);
        return "true" == Ig(this, "selected")
    }
    ;
    function S(a, b) {
        a = x(a.Di[0]);
        x(!a.Pd);
        return new df(a.nk,b)
    }
    function Kg(a) {
        a.ia(a.width(), a.height());
        a.Ie.f()
    }
    e.sm = function(a) {
        return this.Eb(a).parentNode == this.displayObject()
    }
    ;
    e.x = function() {
        return p(this.he) ? this.he : Ue(this.displayObject()).x
    }
    ;
    e.y = function() {
        return p(this.ie) ? this.ie : Ue(this.displayObject()).y
    }
    ;
    e.width = function() {
        return p(this.Fc) ? this.Fc : this.Dk()
    }
    ;
    e.height = function() {
        return p(this.yc) ? this.yc : this.Ck()
    }
    ;
    e.enabled = function() {
        return !this.g.hasAttribute("disabled")
    }
    ;
    e.visible = function() {
        return "boolean" == typeof this.Sl ? this.Sl : "none" != this.displayObject().style.display
    }
    ;
    e.opacity = function() {
        if (p(this.Gf))
            return this.Gf;
        var a = this.g;
        x(a);
        var b = a.style;
        a = "";
        "opacity"in b ? a = b.opacity : "MozOpacity"in b ? a = b.MozOpacity : "filter"in b && (b = b.filter.match(/alpha\(opacity=([\d.]+)\)/)) && (a = String(b[1] / 100));
        a = "" == a ? a : Number(a);
        return t(a) ? a : 1
    }
    ;
    e.displayObject = function() {
        return this.g
    }
    ;
    e.$j = function(a) {
        this.g.scrollTop = a
    }
    ;
    e.G = function(a) {
        var b = void 0 === b ? "0 0" : b;
        vg(this.g, a, a);
        Kf(this.g, x(b))
    }
    ;
    e.Lm = function(a) {
        this.ih = a
    }
    ;
    e.contains = function(a) {
        if (!a)
            return !1;
        a = this.Eb(a);
        return gd(this.g, a)
    }
    ;
    e.Ei = function(a) {
        (a instanceof Node || ya(a.displayObject)) && this.removeChild(a);
        L.prototype.Ei.call(this, a)
    }
    ;
    e.Eb = function(a) {
        return a instanceof Node ? a : a.displayObject()
    }
    ;
    e.Dk = function() {
        var a = this.g;
        return a.tagName.toUpperCase() == "SVG".toString() ? a.width.baseVal.value : Xe(a).width
    }
    ;
    e.Ck = function() {
        var a = this.g;
        return a.tagName.toUpperCase() == "SVG".toString() ? a.height.baseVal.value : Xe(a).height
    }
    ;
    e.ul = function(a, b) {
        p(a) && (this.g.style.width = We(a));
        p(b) && (this.g.style.height = We(b))
    }
    ;
    e.ia = function() {}
    ;
    function Eg(a) {
        var b = new ResizeObserver(function(b) {
            b = l(b);
            for (var c = b.next(); !c.done; c = b.next())
                c = c.value,
                p(c.target) && 0 < c.contentRect.width && 0 < c.contentRect.height && (a.ia(a.g.clientWidth, a.g.clientHeight),
                a.Ie.f(a))
        }
        );
        b.observe(a.g);
        return b
    }
    function Fg(a, b) {
        var c = G(a, new Ee(a.g));
        F(a, b.Tg, function() {
            1 == qe(b) && Fe(c);
            E(a, a.g, "mouseover", function() {
                a.enabled() && 0 < qe(a.D) && a.yg()
            });
            E(a, a.g, "mouseout", function() {
                a.Bc()
            })
        });
        F(a, b.Mk, function() {
            0 == qe(b) && Ge(c)
        });
        var d = new Ne;
        F(a, d.tj, function(b, c, d) {
            a.Bc();
            a.enabled() && a.nf(d);
            a.nh && d.target == a.g && d.preventDefault()
        });
        F(a, d.Cl, function() {
            a.Bc()
        });
        F(a, d.Dl, function() {
            a.enabled() && a.yg()
        });
        Me(c, d)
    }
    e.nf = function(a) {
        this.D.f(this, a)
    }
    ;
    function Dg(a, b) {
        a.Di.push(b);
        mf(a.g, b.className())
    }
    e.yg = function() {
        this.Z("active", !0)
    }
    ;
    e.Bc = function() {
        this.Z("active", !1)
    }
    ;
    e.Vm = function() {
        E(this, this.g, "keydown", this.jl, this)
    }
    ;
    e.jl = function(a) {
        document.activeElement != this.displayObject() || a.defaultPrevented || 13 != a.keyCode && 32 != a.keyCode || (a.preventDefault(),
        this.nf())
    }
    ;
    function Gg(a) {
        Ag ? Bg.push(a) : B ? E(a, window, "DOMNodeRemoved", function(b) {
            gd(b.target, a.g) && a.Bc()
        }) : E(a, a.g, "DOMNodeRemovedFromDocument", function() {
            a.Bc()
        })
    }
    e.uh = function(a) {
        this.setAttribute("tabindex", a + "")
    }
    ;
    e.lf = function() {
        this.Je && this.Je.disconnect();
        var a = Bg.indexOf(this);
        0 <= a && Bg.splice(a, 1)
    }
    ;
    function Lg(a) {
        za(a) && 1 == a.nodeType ? this.wa = this.g = a : (this.g = Zc("DIV", Mg("component_container", a)),
        this.wa = Zc("DIV", Mg("component_base", a)),
        bd(this.g, this.wa));
        this.gb = [];
        this.nh = !1;
        if (ag) {
            var b = new Ee(this.displayObject());
            this.D = new of;
            this.D.Tg.addHandler(function() {
                1 == qe(this.D) && Fe(b)
            }, this);
            this.D.Mk.addHandler(function() {
                0 == qe(this.D) && Ge(b)
            }, this);
            a = new Ne;
            a.tj.addHandler(function(a, b, f) {
                this.Bc();
                this.nh && f.preventDefault();
                this.enabled() && this.nf(f)
            }, this);
            a.Cl.addHandler(function() {
                this.Bc()
            }, this);
            a.Dl.addHandler(function() {
                this.enabled() && this.yg()
            }, this);
            Me(b, a)
        } else
            this.nh = !0,
            this.D = new of,
            this.D.Tg.addHandler(function d() {
                Qa(this.D, of);
                this.D.Tg.removeHandler(d, this);
                var a = D(this.displayObject(), "mouseover", function() {
                    this.enabled() && 0 < qe(this.D) && this.yg()
                }, !1, this);
                this.gb.push(a);
                a = D(this.displayObject(), "mouseout", function() {
                    this.Bc()
                }, !1, this);
                this.gb.push(a);
                a = D(this.displayObject(), "click", function(a) {
                    this.Bc();
                    this.nh && 0 < qe(this.D) && (a.preventDefault(),
                    a.stopPropagation());
                    this.nf(a)
                }, !1, this);
                this.gb.push(a)
            }, this);
        this.Ie = new H
    }
    e = Lg.prototype;
    e.Gf = 1;
    e.Up = !0;
    e.nf = function(a) {
        !this.Up && a && (this.displayObject().blur(),
        this.wa.blur());
        this.D.f(this, a)
    }
    ;
    e.setAttribute = function(a, b) {
        this.displayObject().setAttribute(a, b)
    }
    ;
    e.removeAttribute = function(a) {
        this.displayObject().removeAttribute(a)
    }
    ;
    e.Mm = function(a) {
        this.kf = a;
        this.uh(a)
    }
    ;
    e.Jd = function() {
        var a = this;
        this.yc = this.Fc = void 0;
        this.Je = new ResizeObserver(function(b) {
            b = l(b);
            for (var c = b.next(); !c.done; c = b.next())
                c = c.value,
                p(c.target) && (c = c.contentRect,
                a.Fc = c.width,
                a.yc = c.height,
                a.ia(c.width, c.height),
                a.Ie.f(a))
        }
        );
        this.Je.observe(this.g);
        this.ia(parseInt(this.g.style.width, 10), parseInt(this.g.style.height, 10));
        this.Ie.f(this)
    }
    ;
    e.yg = function() {
        this.Z("active", !0)
    }
    ;
    e.Bc = function() {
        this.Z("active", !1)
    }
    ;
    e.gp = function() {
        return this.wa
    }
    ;
    Lg.prototype.baseElement = Lg.prototype.gp;
    Lg.prototype.displayObject = function() {
        return this.g
    }
    ;
    Lg.prototype.displayObject = Lg.prototype.displayObject;
    e = Lg.prototype;
    e.width = function() {
        return p(this.Fc) ? this.Fc : this.Dk(this.wa)
    }
    ;
    e.Dk = function(a) {
        return "SVG" == a.tagName.toUpperCase() ? a.width.baseVal.value : Xe(a).width
    }
    ;
    e.$ = function(a) {
        this.resize(a)
    }
    ;
    e.height = function() {
        return p(this.yc) ? this.yc : this.Ck(this.wa)
    }
    ;
    e.Ck = function(a) {
        return "SVG" == a.tagName.toUpperCase() ? a.height.baseVal.value : Xe(a).height
    }
    ;
    e.qa = function(a) {
        this.resize(void 0, a)
    }
    ;
    e.resize = function(a, b) {
        if (p(this.Je))
            throw Error("ResizeObserver is turned on");
        this.ul(a, b);
        p(a) && (this.Fc = a);
        p(b) && (this.yc = b);
        this.Ie.f(this)
    }
    ;
    e.ul = function(a, b) {
        p(a) && (this.displayObject().style.width = We(a),
        this.wa.style.width = We(a));
        p(b) && (this.displayObject().style.height = We(b),
        this.wa.style.height = We(b));
        p(a) && p(b) && this.ia(a, b)
    }
    ;
    e.ia = function() {}
    ;
    e.x = function() {
        return p(this.he) ? this.he : Ue(this.displayObject()).x
    }
    ;
    e.ka = function(a) {
        this.he = a;
        this.displayObject().style.left = a + "px"
    }
    ;
    e.y = function() {
        return p(this.ie) ? this.ie : Ue(this.displayObject()).y
    }
    ;
    e.Jc = function(a) {
        this.ie = a;
        this.displayObject().style.top = a + "px"
    }
    ;
    e.move = function(a, b) {
        this.ka(a);
        this.Jc(b)
    }
    ;
    e.enabled = function() {
        return !this.wa.hasAttribute("disabled")
    }
    ;
    e.Pa = function(a) {
        p(this.kf) && this.uh(a ? this.kf : -1);
        a ? this.wa.removeAttribute("disabled") : this.wa.setAttribute("disabled", "")
    }
    ;
    e.visible = function() {
        return "none" != this.displayObject().style.display
    }
    ;
    e.Ep = function(a) {
        this.displayObject().style.display = a ? "" : "none"
    }
    ;
    e.opacity = function() {
        return this.Gf
    }
    ;
    e.dd = function(a) {
        T(this, "opacity", a);
        this.Gf = a
    }
    ;
    e.c = function(a) {
        a = this.Eb(a);
        bd(this.displayObject(), a)
    }
    ;
    e.xj = function(a, b) {
        a = this.Eb(a);
        ed(this.displayObject(), a, b)
    }
    ;
    e.removeChild = function(a) {
        a = this.Eb(a);
        this.sm(a) && this.displayObject().removeChild(a)
    }
    ;
    e.sm = function(a) {
        return (a instanceof Lg ? a.displayObject() : a).parentNode == this.displayObject()
    }
    ;
    e.U = function(a) {
        hd(this.wa, a)
    }
    ;
    e.ei = function(a) {
        this.wa.innerHTML = a
    }
    ;
    function T(a, b, c) {
        Pe(a.displayObject(), b, c)
    }
    e.qg = function(a) {
        this.$e("label", a)
    }
    ;
    e.Im = function(a) {
        v(a) && (a = a.join(" "));
        nd(this.Mr ? this.wa : this.g, a)
    }
    ;
    e.di = function(a) {
        this.$e("hidden", a)
    }
    ;
    e.$e = function(a, b) {
        od(this.Mr ? this.wa : this.g, a, b)
    }
    ;
    function Mg(a, b) {
        return p(b) ? b instanceof Array ? (b = Ya(b),
        b.push(a),
        b) : [a, b] : a
    }
    e.Z = function(a, b) {
        a = this.Xp ? ef(this.Xp, a) : a;
        var c = this.g;
        b ? J(c, a) : K(c, a);
        this.g != this.wa && (c = this.wa,
        b ? J(c, a) : K(c, a))
    }
    ;
    e.H = function(a) {
        var b = this.displayObject();
        J(b, a)
    }
    ;
    e.T = function(a) {
        var b = this.displayObject();
        K(b, a)
    }
    ;
    e.Vm = function() {
        D(this.displayObject(), "keydown", this.jl, !1, this)
    }
    ;
    e.jl = function(a) {
        document.activeElement != this.displayObject() || a.defaultPrevented || 13 != a.keyCode && 32 != a.keyCode || (a.preventDefault(),
        this.nf(null))
    }
    ;
    e.uh = function(a) {
        this.setAttribute("tabindex", a + "")
    }
    ;
    e.eg = function() {
        for (var a = 0; a < this.gb.length; ++a) {
            var b = this.gb[a];
            b && Wd(b)
        }
        this.Je && this.Je.disconnect()
    }
    ;
    e.Eb = function(a) {
        return a instanceof Lg || a instanceof R ? a.displayObject() : a
    }
    ;
    function U(a, b) {
        Lg.call(this, Zc(b || "DIV", a))
    }
    w(U, Lg);
    function Ng(a, b, c, d) {
        d = void 0 === d ? !1 : d;
        U.call(this, "page");
        this.xa = a;
        this.Sa = b;
        this.Yf = this.Sa.scale / c;
        this.Td = d;
        this.v = b;
        this.Lf = this.K = null;
        this.Y = 0;
        this.ga = this.M = null;
        this.Fg = {
            top: 0,
            left: 0
        };
        this.$i = 0;
        this.Za = new H;
        this.jf = new U("canvasWrapper","DIV");
        this.c(this.jf);
        this.ab = null;
        this.An = 0;
        this.Vk = !1;
        this.al = new U("loadingIcon","DIV");
        this.c(this.al);
        this.$(this.Sa.width);
        this.qa(this.Sa.height)
    }
    m(Ng, U);
    e = Ng.prototype;
    e.pageNumber = function() {
        return this.xa
    }
    ;
    e.Bd = function() {
        return this.Sa
    }
    ;
    e.$c = function() {
        x(this.K);
        return this.K
    }
    ;
    e.Uh = function() {
        return null !== this.ga
    }
    ;
    e.gi = function(a) {
        this.ga = a;
        this.K = a.getViewport(1);
        x(this.K);
        a = this.Ua(this.Sa, this.K);
        this.v = this.K.clone({
            scale: a
        })
    }
    ;
    e.$ = function(a) {
        U.prototype.$.call(this, Math.floor(a))
    }
    ;
    e.qa = function(a) {
        U.prototype.qa.call(this, Math.floor(a))
    }
    ;
    e.va = function(a, b) {
        T(this, a, b)
    }
    ;
    e.G = function(a) {
        this.Sa = this.Sa.clone({
            scale: this.Yf * a
        });
        this.$(this.Sa.width);
        this.qa(this.Sa.height);
        null !== this.K && (a = this.Ua(this.Sa, this.K),
        this.v = this.K.clone({
            scale: a
        }));
        null !== this.M && (Og(this),
        Pg(this))
    }
    ;
    e.aa = function(a, b) {
        this.Yf = a.scale / b;
        this.Sa = a;
        this.$(this.Sa.width);
        this.qa(this.Sa.height);
        this.K && (a = this.Ua(this.Sa, this.K),
        this.v = this.K.clone({
            scale: a
        }),
        null !== this.M && (Og(this),
        Pg(this)))
    }
    ;
    e.render = function() {
        var a = this;
        if (0 !== this.Y)
            throw Error("Page renderingState is wrong");
        this.Y = 1;
        var b = Date.now();
        this.An = b;
        var c = null !== this.M ? this.M : null
          , d = this.v
          , f = document.createElement("canvas")
          , g = x(f.getContext("2d"))
          , h = Qg(g)
          , k = h.Kp
          , u = h.Lp;
        h = h.Js;
        this.Lf = this.v;
        if (0 < PDFJS.maxCanvasPixels) {
            var q = (Math.floor(d.width) * k | 0) * (Math.floor(d.height) * u | 0);
            q > PDFJS.maxCanvasPixels && (q = PDFJS.maxCanvasPixels / (k * u),
            this.Lf = d.clone({
                scale: Math.floor(Math.sqrt(1 / (d.width / d.height) * q)) / d.height * this.v.scale * .9
            }))
        }
        q = Rg(k);
        var y = Rg(u);
        f.width = Sg(this.Lf.width * k, q[0]);
        f.height = Sg(this.Lf.height * u, y[0]);
        f.style.width = Sg(d.width, q[1]) + "px";
        f.style.height = Sg(d.height, y[1]) + "px";
        f.className = "content";
        f.setAttribute("hidden", "hidden");
        this.jf.c(f);
        this.M = f;
        Og(this);
        this.ga.render({
            canvasContext: g,
            transform: h ? [k, 0, 0, u, 0, 0] : null,
            viewport: this.Lf
        }, function(d) {
            null !== d ? a.Y = 0 : (a.M.removeAttribute("hidden"),
            null !== c && (c.width = 0,
            c.height = 0,
            a.jf.removeChild(c),
            c = null),
            b == a.An && (a.al && a.removeChild(a.al),
            Tg(a)))
        })
    }
    ;
    e.reset = function() {
        this.Y = 0;
        this.ab && this.removeChild(this.ab)
    }
    ;
    e.destroy = function() {
        this.reset();
        if (this.ga) {
            var a = this.ga;
            null !== a.Kf && a.Kf.cancel();
            this.ga.cleanup()
        }
        this.M && (this.M.width = 0,
        this.M.height = 0,
        this.jf.removeChild(this.M),
        this.M = null)
    }
    ;
    function Ug(a, b) {
        if (a.$i != b) {
            var c = Math.floor((a.Sa.width - a.v.width) / 2);
            if (0 < c) {
                var d = 0 == a.$i ? "left" : "right";
                a.M.style[d] = "";
                a.ab && T(a.ab, d, "");
                Vg(a, b, c)
            }
            a.$i = b
        }
    }
    e.focus = function() {
        if (this.ab) {
            var a = this.ab.displayObject().firstElementChild;
            a && a.focus()
        } else
            this.Vk = !0
    }
    ;
    function Pg(a) {
        var b = a.v.width / a.Lf.width;
        a.M.style.width = a.v.width + "px";
        a.M.style.height = a.v.height + "px";
        a.ab && (Pe(a.ab.wa, "transform", "scale(" + b + ", " + b + ") "),
        Pe(a.ab.wa, "transformOrigin", "0% 0%"))
    }
    function Og(a) {
        var b = Math.floor((a.Sa.height - a.v.height) / 2);
        0 < b && (a.Fg.top = b,
        a.M.style.top = b + "px",
        a.ab && T(a.ab, "top", b + "px"));
        b = Math.floor((a.Sa.width - a.v.width) / 2);
        0 < b && (a.Fg.left = b,
        Vg(a, a.$i, b))
    }
    function Vg(a, b, c) {
        b = 0 == b ? "left" : "right";
        a.M.style[b] = c + "px";
        a.ab && T(a.ab, b, c + "px")
    }
    e.Ua = function(a, b) {
        return Math.min(a.height / b.height, a.width / b.width)
    }
    ;
    function Wg(a, b) {
        b = [].concat(ca(b.displayObject().children)).filter(function(a) {
            return "linkAnnotation" === a.className
        });
        a = [].concat(ca(a.ab.displayObject().children));
        b = l(b);
        for (var c = b.next(); !c.done; c = b.next()) {
            c = c.value;
            for (var d = c.getBoundingClientRect(), f = l(a), g = f.next(); !g.done; g = f.next()) {
                g = g.value;
                var h = g.getBoundingClientRect();
                Xg(d, h) && Yg(c, g)
            }
        }
    }
    function Yg(a, b) {
        var c = a.firstElementChild.cloneNode(!0);
        for (c.onclick = a.firstElementChild.onclick; b.childNodes.length; )
            c.appendChild(b.firstChild);
        b.appendChild(c)
    }
    function Xg(a, b) {
        a: {
            var c = Math.max(a.left, b.left);
            var d = Math.min(a.left + a.width, b.left + b.width);
            if (c <= d) {
                var f = Math.max(a.top, b.top);
                a = Math.min(a.top + a.height, b.top + b.height);
                if (f <= a) {
                    c = new rd(c,f,d - c,a - f);
                    break a
                }
            }
            c = null
        }
        return c ? .9 < c.width * c.height / (b.width * b.height) : !1
    }
    function Tg(a) {
        var b = new U("textLayer","P")
          , c = {
            viewport: a.v,
            container: b.displayObject(),
            timeout: z.Rs
        };
        a.ga.renderTextLayer(c, function() {
            var c = 0 < b.displayObject().childElementCount;
            c && (a.ab = b,
            a.ab.Mm(-1),
            a.c(a.ab));
            Zg(a, a.Td && c)
        })
    }
    function Zg(a, b) {
        var c = new U("annotationsLayer")
          , d = {
            viewport: a.v,
            container: c.displayObject()
        };
        se(a.ga, d, function() {
            0 < c.displayObject().childElementCount && (a.c(c),
            b && Wg(a, c),
            b && a.removeChild(c));
            a.Vk && (a.Vk = !1,
            a.focus());
            a.Y = 3;
            a.Za.f()
        })
    }
    function Qg(a) {
        a = (window.devicePixelRatio || 1) / (a.vv || a.lv || a.mv || a.nv || a.$u || 1);
        return {
            Kp: a,
            Lp: a,
            Js: 1 !== a
        }
    }
    e.rm = function() {
        var a = this;
        return this.ga.getTextContent({}).then(function(b) {
            return ve(b.items, b.styles, a.v)
        })
    }
    ;
    function Rg(a) {
        if (Math.floor(a) === a)
            return [a, 1];
        var b = 1 / a;
        if (8 < b)
            return [1, 8];
        if (Math.floor(b) === b)
            return [1, b];
        b = 1 < a ? b : a;
        for (var c = 0, d = 1, f = 1, g = 1; ; ) {
            var h = c + f
              , k = d + g;
            if (8 < k)
                break;
            b <= h / k ? (f = h,
            g = k) : (c = h,
            d = k)
        }
        return b - c / d < f / g - b ? b === a ? [c, d] : [d, c] : b === a ? [f, g] : [g, f]
    }
    function Sg(a, b) {
        var c = a % b;
        return 0 === c ? a : Math.round(a - c + b)
    }
    ;function $g(a, b, c) {
        var d = new Image;
        d.src = a;
        this.Fb = d;
        this.Lr = b;
        this.W = c
    }
    $g.prototype.render = function(a, b, c, d) {
        b = d || {
            top: 0,
            left: 0
        };
        c = .31 * a.width();
        d = c * this.Fb.height / this.Fb.width;
        for (var f = a.jf.displayObject(), g = 0; g < f.childElementCount; ++g) {
            var h = f.childNodes[g];
            if ("content" == h.className) {
                var k = x(h.getContext("2d"))
                  , u = Qg(k)
                  , q = u.Kp;
                k.drawImage(this.Fb, h.width - c * q, 0, c * q, d * u.Lp)
            }
        }
        a: {
            f = a.displayObject();
            for (g = 0; g < f.childElementCount; ++g)
                if ("ispring" == f.childNodes[g].className) {
                    f = f.childNodes[g];
                    break a
                }
            f = null
        }
        f || (f = document.createElement("a"),
        f.className = "ispring",
        f.href = this.Lr,
        f.target = "_blank",
        od(f, "label", this.W.ja("PB_ACCESSIBILITY_CREATED_WITH")),
        nd(f, "banner"),
        a.c(f));
        f.style.width = c + "px";
        f.style.height = d + "px";
        b.top && (f.style.top = b.top + "px");
        b.left && (f.style.right = b.left + "px")
    }
    ;
    function ah(a, b, c) {
        this.Ho = a;
        this.nn = b;
        this.ea = c
    }
    function bh(a) {
        return a.nn - a.Ho + 1
    }
    ah.prototype.inRange = function(a) {
        return this.Ho <= a && a <= this.nn
    }
    ;
    ah.prototype.size = function() {
        return this.ea
    }
    ;
    ah.prototype.getViewport = function() {
        var a = [0, 0, this.ea.width(), this.ea.height()];
        return new PDFJS.PageViewport(a,1,0,0,0,!1)
    }
    ;
    function W(a, b) {
        this.Fc = Math.floor(a);
        this.yc = Math.floor(b)
    }
    W.prototype.width = function() {
        return this.Fc
    }
    ;
    W.prototype.height = function() {
        return this.yc
    }
    ;
    W.prototype.isEqual = function(a) {
        return this.Fc == a.width() && this.yc == a.height()
    }
    ;
    function ch(a) {
        this.Jb = [];
        this.ej(a);
        this.cl = this.dl = -1
    }
    function dh(a, b) {
        for (var c = null, d = 0; d < a.Jb.length; ++d)
            a.Jb[d].inRange(b) && (c = a.Jb[d].getViewport());
        x(c);
        return c
    }
    function eh(a) {
        if (-1 == a.dl) {
            if (1 == a.Jb.length)
                var b = 0;
            else {
                b = bh(a.Jb[0]);
                for (var c = 0, d = 1; d < a.Jb.length; ++d)
                    bh(a.Jb[d]) > b && (b = bh(a.Jb[d]),
                    c = d);
                b = c
            }
            a.dl = b
        }
        return a.Jb[a.dl].getViewport()
    }
    ch.prototype.ej = function(a) {
        for (var b = 0; b < a.length; ++b) {
            var c = a[b];
            this.Jb.push(new ah(c.range[0],c.range[1],new W(c.size[0],c.size[1])))
        }
    }
    ;
    var fh = function() {
        function a() {
            throw Error("stream error");
        }
        function b(a) {
            return "undefined" == typeof a
        }
        function c(b) {
            var c = 0
              , d = b[c++]
              , f = b[c++];
            (-1 == d || -1 == f || 8 != (d & 15) || 0 != ((d << 8) + f) % 31 || f & 32) && a();
            this.dm = b;
            this.ag = c;
            this.Lh = this.Nh = this.Oh = 0;
            this.km = !1;
            this.Aj = null
        }
        var d = [], f = [], g = [], h, k;
        (function() {
            var a = [], b, c = 2;
            for (b = 0; 8 > b; ++b)
                a.push(c),
                c += 1 << (b >> 1);
            for (b = 0; 3 > b; ++b)
                d.push(b + 16);
            for (b = 0; 7 >= b; ++b)
                d.push((8 - b) % 8),
                d.push(8 + b);
            for (b = 1; 3 > b; ++b)
                f.push(b);
            for (b = 0; 28 > b; ++b) {
                var h = b >> 1 << 16;
                c = b % 8;
                h += (a[c] << (b - c) / 2) + 1;
                f.push(h)
            }
            for (b = 3; 7 > b; ++b)
                g.push(b);
            c = 7;
            for (b = 0; 24 > b; ++b)
                a = b >> 2,
                h = (a << 16) + c,
                c += 1 << a,
                g.push(h);
            for (b = 0; 3 > b; ++b)
                g.push(258)
        }
        )();
        c.prototype.jm = function(a) {
            var b = this.Aj
              , c = b ? b.length : 0;
            if (a < c)
                return b;
            for (var d = 1024; d < a; )
                d <<= 1;
            a = Array(d);
            for (d = 0; d < c; ++d)
                a[d] = b[d];
            return this.Aj = a
        }
        ;
        c.prototype.ls = function() {
            for (; !this.km; )
                this.Ds();
            return this.Aj.slice(0, this.Lh)
        }
        ;
        c.prototype.le = function(c) {
            for (var d = this.Oh, f = this.Nh, g = this.dm, h = this.ag, k; d < c; )
                b(k = g[h++]) && a(),
                f |= k << d,
                d += 8;
            this.Nh = f >> c;
            this.Oh = d - c;
            this.ag = h;
            return f & (1 << c) - 1
        }
        ;
        c.prototype.pm = function(c) {
            var d = c[0]
              , f = c[1];
            c = this.Oh;
            for (var g = this.Nh, h = this.dm, k = this.ag; c < f; ) {
                var u;
                b(u = h[k++]) && a();
                g |= u << c;
                c += 8
            }
            f = d[g & (1 << f) - 1];
            d = f >> 16;
            f &= 65535;
            (0 == c || c < d || 0 == d) && a();
            this.Nh = g >> d;
            this.Oh = c - d;
            this.ag = k;
            return f
        }
        ;
        c.prototype.Rh = function(a) {
            for (var b = a.length, c = 0, d = 0; d < b; ++d)
                a[d] > c && (c = a[d]);
            for (var f = 1 << c, g = Array(f), h = 1, k = 0, u = 2; h <= c; ++h,
            k <<= 1,
            u <<= 1)
                for (var aa = 0; aa < b; ++aa)
                    if (a[aa] == h) {
                        var Uf = 0
                          , Xi = k;
                        for (d = 0; d < h; ++d)
                            Uf = Uf << 1 | Xi & 1,
                            Xi >>= 1;
                        for (d = Uf; d < f; d += u)
                            g[d] = h << 16 | aa;
                        ++k
                    }
            return [g, c]
        }
        ;
        c.prototype.Ds = function() {
            function c(a, b, c, d, f) {
                for (a = a.le(c) + d; 0 < a--; )
                    b[P++] = f
            }
            var q = this.le(3);
            q & 1 && (this.km = !0);
            q >>= 1;
            if (0 == q) {
                var y = this.dm, I = this.ag, O;
                b(O = y[I++]) && a();
                var Q = O;
                b(O = y[I++]) && a();
                Q |= O << 8;
                b(O = y[I++]) && a();
                q = O;
                b(O = y[I++]) && a();
                (q | O << 8) != (~Q & 65535) && a();
                this.Oh = this.Nh = 0;
                O = this.Lh;
                q = this.jm(O + Q);
                this.Lh = Q = O + Q;
                for (var V = O; V < Q; ++V) {
                    if (b(O = y[I++])) {
                        this.km = !0;
                        break
                    }
                    q[V] = O
                }
                this.ag = I
            } else {
                if (1 == q) {
                    if (!h) {
                        y = Array(288);
                        for (var P = 0; 143 >= P; ++P)
                            y[P] = 8;
                        for (; 255 >= P; ++P)
                            y[P] = 9;
                        for (; 279 >= P; ++P)
                            y[P] = 7;
                        for (; 287 >= P; ++P)
                            y[P] = 8;
                        h = this.Rh(y);
                        q = Array(31);
                        for (P = 0; 32 > P; ++P)
                            q[P] = 5;
                        k = this.Rh(q);
                        k[0][15] = 0;
                        k[0][31] = 0
                    }
                    I = h;
                    O = k
                } else if (2 == q) {
                    q = this.le(5) + 257;
                    O = this.le(5) + 1;
                    I = this.le(4) + 4;
                    y = Array(d.length);
                    for (P = 0; P < I; )
                        y[d[P++]] = this.le(3);
                    I = this.Rh(y);
                    P = y = 0;
                    O = q + O;
                    for (Q = Array(O); P < O; )
                        V = this.pm(I),
                        16 == V ? c(this, Q, 2, 3, y) : 17 == V ? c(this, Q, 3, 3, y = 0) : 18 == V ? c(this, Q, 7, 11, y = 0) : Q[P++] = y = V;
                    I = this.Rh(Q.slice(0, q));
                    O = this.Rh(Q.slice(q, O))
                } else
                    a();
                Q = (q = this.Aj) ? q.length : 0;
                for (V = this.Lh; ; ) {
                    var ea = this.pm(I);
                    if (256 > ea)
                        V + 1 >= Q && (q = this.jm(V + 1),
                        Q = q.length),
                        q[V++] = ea;
                    else {
                        if (256 == ea) {
                            this.Lh = V;
                            break
                        }
                        ea -= 257;
                        ea = g[ea];
                        var aa = ea >> 16;
                        0 < aa && (aa = this.le(aa));
                        y = (ea & 65535) + aa;
                        ea = this.pm(O);
                        ea = f[ea];
                        aa = ea >> 16;
                        0 < aa && (aa = this.le(aa));
                        ea = (ea & 65535) + aa;
                        V + y >= Q && (q = this.jm(V + y),
                        Q = q.length);
                        for (aa = 0; aa < y; ++aa,
                        ++V)
                            q[V] = q[V - ea]
                    }
                }
            }
        }
        ;
        return c
    }();
    function gh(a, b) {
        a = Df(a);
        a = (new fh(a)).ls();
        for (var c = [], d = 0, f, g, h, k = -1, u = a.length; d < u; )
            (f = a[d]) ? 128 > f ? (c[++k] = String.fromCharCode(f),
            ++d) : 191 < f && 224 > f ? (g = a[d + 1],
            c[++k] = String.fromCharCode((f & 31) << 6 | g & 63),
            d += 2) : (g = a[d + 1],
            h = a[d + 2],
            c[++k] = String.fromCharCode((f & 15) << 12 | (g & 63) << 6 | h & 63),
            d += 3) : ++d;
        b(c.join(""))
    }
    ;function hh(a) {
        var b = this;
        this.lb = "FlippingBook";
        this.wb = null;
        this.un = !1;
        this.ph = "";
        this.W = null;
        this.pn = "";
        this.vn = this.jo = !1;
        this.Na = null;
        this.Td = this.Xk = !1;
        r(a) ? gh(a, function(a) {
            a = JSON.parse(a);
            b.ej(a)
        }) : this.ej(a)
    }
    e = hh.prototype;
    e.title = function() {
        x(this.lb);
        return this.lb
    }
    ;
    e.Ye = function() {
        x(this.wb);
        return this.wb
    }
    ;
    e.Dd = function() {
        x(this.W);
        return this.W
    }
    ;
    e.si = function() {
        return this.Na
    }
    ;
    e.ej = function(a) {
        this.lb = a.title;
        this.un = a.hasLocalVersion;
        a.pageSizes && (this.wb = new ch(a.pageSizes));
        this.ph = a.salt;
        this.W = new Oc(a.i18n);
        this.pn = a.fingerprint;
        this.jo = a.protectFromCopying;
        this.vn = a.hasPassword;
        this.Xk = a.ispringPlayIntegration;
        this.Td = a.enableAccessibilityMode;
        if (a = a.watermark)
            this.Na = new $g(a.image,a.url,this.W)
    }
    ;
    function ih(a) {
        U.call(this, "banner");
        var b = new U("no-local-view");
        this.c(b);
        b = new U("message");
        var c = new U("title");
        c.U(a.ja("PB_UNAVAILABLE_BANNER_TITLE"));
        b.c(c);
        c = new U("text");
        c.U(a.ja("PB_UNAVAILABLE_BANNER_TEXT"));
        b.c(c);
        this.c(b)
    }
    w(ih, U);
    function jh() {
        for (var a = document.location.search.split("+").join(" "), b = {}, c, d = /[?&]?([^=]+)=([^&]*)/g; c = d.exec(a); )
            b[decodeURIComponent(c[1])] = decodeURIComponent(c[2]);
        return b
    }
    function kh(a, b) {
        var c = document.createElement("script");
        c.src = a;
        c.onload = function() {
            b(window.PDF_DATA)
        }
        ;
        document.head.appendChild(c)
    }
    ;function lh() {
        return !mh() && p(window.orientation) ? !!(window.orientation % 180) : window.innerWidth > window.innerHeight
    }
    function mh() {
        return 0 <= window.location.search.indexOf("ispringpreview=1")
    }
    ;var nh = {
        1: "resume",
        2: "startover"
    };
    function oh() {
        L.call(this);
        this.fb = [];
        this.te = M(this)
    }
    m(oh, L);
    oh.prototype.cc = function() {
        return this.fb.slice()
    }
    ;
    function ph(a, b) {
        a.fb.splice(b, 1);
        a.te.f()
    }
    ;function qh() {
        this.rl = Object.create(null);
        this.i = this.R = null
    }
    qh.prototype.bb = function(a) {
        this.R = a
    }
    ;
    qh.prototype.bk = function(a) {
        this.i = a
    }
    ;
    qh.prototype.ms = function(a) {
        return a instanceof Array ? "#page=" + this.Rg(a[0]) : ""
    }
    ;
    qh.prototype.getDestinationHash = qh.prototype.ms;
    qh.prototype.vs = function(a) {
        var b = function(a) {
            a instanceof Array && rh(this, a[0])
        }
        .bind(this);
        "string" === typeof a ? this.R.getDestination(a, b) : b(a)
    }
    ;
    qh.prototype.navigateTo = qh.prototype.vs;
    qh.prototype.Rg = function(a) {
        return a instanceof Object ? this.rl[sh(a)] : parseInt(a, 10) + 1
    }
    ;
    function sh(a) {
        return a.num + " " + a.gen + " R"
    }
    function rh(a, b) {
        var c = a.Rg(b);
        c ? (c > a.R.o() && (c = a.R.o()),
        a.i.u(c)) : a.R.getPageIndex(b, function(c) {
            a.rl[sh(b)] = c + 1;
            rh(a, b)
        })
    }
    ;function th(a, b, c) {
        this.Yk = a;
        this.xa = b;
        this.Si = c
    }
    th.prototype.label = function() {
        return this.Yk
    }
    ;
    th.prototype.pageNumber = function() {
        return this.xa
    }
    ;
    th.prototype.items = function() {
        return this.Si
    }
    ;
    function uh() {
        this.Ch = {}
    }
    uh.prototype.renderTextLayer = function(a, b, c) {
        var d = this
          , f = a.pageNumber;
        a.getTextContent({
            normalizeWhitespace: !0
        }).then(function(a) {
            if (0 == a.items.length)
                c();
            else {
                d.Ch[f] && d.Ch[f].cancel();
                var g = document.createDocumentFragment();
                d.Ch[f] = PDFJS.renderTextLayer({
                    textContent: a,
                    container: g,
                    viewport: b.viewport,
                    timeout: b.timeout
                });
                d.Ch[f].promise.then(function() {
                    b.container.appendChild(g);
                    [].concat(ca(b.container.childNodes)).forEach(function(a) {
                        a.tabIndex = 0
                    });
                    var a = document.createElement("div");
                    a.className = "endOfContent";
                    b.container.appendChild(a);
                    vh(b.container);
                    c();
                    delete d.Ch[f]
                }, function() {})
            }
        })
    }
    ;
    function vh(a) {
        a.addEventListener("mousedown", function(b) {
            var c = a.querySelector(".endOfContent");
            if (c) {
                if (b.target !== a && "none" !== window.getComputedStyle(c).getPropertyValue("-moz-user-select")) {
                    var d = a.getBoundingClientRect();
                    c.style.top = (100 * Math.max(0, (b.pageY - d.top) / d.height)).toFixed(2) + "%"
                }
                J(c, "active")
            }
        });
        a.addEventListener("mouseup", function() {
            var b = a.querySelector(".endOfContent");
            b && (b.style.top = "",
            K(b, "active"))
        })
    }
    ;function wh(a) {
        this.De = a;
        this.Me = this.Qc = null
    }
    e = wh.prototype;
    e.o = function() {
        return this.De.numPages
    }
    ;
    function xh(a, b) {
        b.bb(a);
        a.Qc = b
    }
    e.getPage = function(a, b) {
        var c = this;
        this.De.getPage(a).then(function(d) {
            c.Qc.rl[sh(d.ref)] = a;
            b(new re(d,c.Qc,c.Me), a)
        })
    }
    ;
    e.getPageIndex = function(a, b) {
        this.De.getPageIndex(a).then(function(a) {
            b(a)
        })
    }
    ;
    e.getDestination = function(a, b) {
        this.De.getDestination(a).then(function(a) {
            b(a)
        })
    }
    ;
    e.getOutline = function() {
        var a = this;
        return this.De.getOutline().then(function(b) {
            return b ? yh(a, b, !1) : null
        })
    }
    ;
    function yh(a, b, c) {
        b = b.map(function(b) {
            var d = zh(a, b)
              , g = c || !b.items ? Promise.resolve(null) : yh(a, b.items, !0);
            return Promise.all([d, g]).then(function(a) {
                var c = l(a);
                a = c.next().value;
                c = c.next().value;
                return new th(b.title,a,c)
            }).catch(function() {
                return null
            })
        });
        return Promise.all(b).then(function(a) {
            return a.filter(function(a) {
                return !!a
            }).sort(function(a, b) {
                return a.pageNumber() - b.pageNumber()
            })
        })
    }
    function zh(a, b) {
        b = b.dest;
        return v(b) ? Ah(a, b) : r(b) ? (Pa(b),
        a.De.getDestination(b).then(function(b) {
            return Ah(a, b)
        })) : Promise.reject()
    }
    function Ah(a, b) {
        return b ? a.De.getPageIndex(b[0]).then(function(a) {
            return a + 1
        }) : Promise.reject()
    }
    ;var Bh = ic || fc ? "webkitfullscreenchange" : hc ? "mozfullscreenchange" : B ? "MSFullscreenChange" : "fullscreenchange";
    function Ch(a) {
        a.mozRequestFullScreenWithKeys ? a.mozRequestFullScreenWithKeys() : a.webkitRequestFullscreen ? a.webkitRequestFullscreen() : a.webkitRequestFullscreen ? a.webkitRequestFullscreen() : a.mozRequestFullScreen ? a.mozRequestFullScreen() : a.msRequestFullscreen ? a.msRequestFullscreen() : a.requestFullscreen && a.requestFullscreen()
    }
    function Dh() {
        var a = Eh();
        a.webkitCancelFullScreen ? a.webkitCancelFullScreen() : a.mozCancelFullScreen ? a.mozCancelFullScreen() : a.msExitFullscreen ? a.msExitFullscreen() : a.exitFullscreen && a.exitFullscreen()
    }
    function Fh() {
        var a = Eh();
        return !!(a.webkitIsFullScreen || a.mozFullScreen || a.msFullscreenElement || a.fullscreenElement)
    }
    function Eh() {
        return (Ja || (Ja = new md)).getDocument()
    }
    ;function Gh() {
        this.we = new H;
        D(document, Bh, function() {
            this.we.f(Fh())
        }, !1, this)
    }
    Gh.prototype.Bp = function(a) {
        a ? (x(document.body),
        Ch(document.body)) : Dh()
    }
    ;
    Gh.prototype.Rb = function() {
        return this.we
    }
    ;
    function Hh(a) {
        Gh.call(this);
        this.a = a;
        this.Pd = a.displayObject();
        this.Bk = this.Uk = !1;
        if (ig || hg || eg || Wf)
            a = 0;
        else {
            a = Eh();
            var b = a.body;
            a = !!(b.webkitRequestFullscreen || b.mozRequestFullScreen && a.mozFullScreenEnabled || b.msRequestFullscreen && a.msFullscreenEnabled || b.requestFullscreen && a.fullscreenEnabled)
        }
        a || this.a.ad();
        this.Rb().addHandler(this.nd, this)
    }
    w(Hh, Gh);
    Hh.prototype.toggle = function() {
        this.Bk || (this.Bk = !0,
        this.Bp(!this.Uk))
    }
    ;
    Hh.prototype.Bp = function(a) {
        a ? Ch(this.Pd) : Dh()
    }
    ;
    Hh.prototype.nd = function(a) {
        this.Uk = a;
        this.Bk = !1;
        this.a.cd(this.Uk)
    }
    ;
    function Ih() {
        this.Mg = new H;
        this.Zm = new H;
        this.Ji = new H;
        this.yk = new H
    }
    e = Ih.prototype;
    e.rf = !1;
    e.qf = !1;
    e.wh = null;
    e.Hf = null;
    e.Sh = function() {
        return "drag"
    }
    ;
    e.Gj = function(a, b) {
        if (1 == b.touches().length) {
            if ("touchStart" == a)
                return this.rf && (this.qf = this.rf = !1),
                this.qf = !1,
                1;
            if ("touchMove" == a && this.qf)
                return 1
        }
        this.rf && (x(this.Hf),
        this.qf = this.rf = !1,
        this.yk.f(this.Hf.x, this.Hf.y));
        return 0
    }
    ;
    e.zj = function(a) {
        a = new C(a.touches()[0].clientX(),a.touches()[0].clientY());
        if (this.qf) {
            a = Vc(a, this.wh);
            var b = this.Hf;
            a == b || a && b && a.x == b.x && a.y == b.y || (this.rf || (x(this.wh),
            this.rf = !0,
            this.Ji.f(this.wh.x, this.wh.y)),
            this.Hf = a,
            this.Mg.f(a.x, a.y))
        } else
            this.qf = !0,
            this.wh = a,
            this.Hf = new C,
            this.Zm.f()
    }
    ;
    e.Ve = function() {
        return this.Mg
    }
    ;
    e.ke = function() {}
    ;
    function Jh() {
        this.uo = new H;
        this.to = new H;
        this.xl = new H;
        this.Mg = new H;
        this.Go = this.Yg = null;
        this.wl = !1
    }
    e = Jh.prototype;
    e.Zg = -1;
    e.Pi = 0;
    e.Sh = function() {
        return "scale"
    }
    ;
    e.Gj = function(a, b) {
        a = 2 == b.touches().length;
        var c = !a && 0 < this.Zg;
        a != this.wl && (this.wl || (this.Go = Kh(b),
        this.uo.f()),
        this.wl = a);
        return a || c ? 1 : 0
    }
    ;
    e.zj = function(a) {
        if (2 == a.touches().length) {
            var b = Kh(a);
            if (this.Yg && b) {
                var c = Vc(b.Fj, this.Yg.Fj)
                  , d = Vc(b.Xj, this.Yg.Xj)
                  , f = 0 > c.x && 0 > d.x || 0 < c.x && 0 < d.x;
                (0 > c.y && 0 > d.y || 0 < c.y && 0 < d.y || f) && this.Mg.f(Math.abs(c.x) < Math.abs(d.x) ? c.x : d.x, Math.abs(c.y) < Math.abs(d.y) ? c.y : d.y)
            }
            this.Yg = b;
            b = a.scale();
            p(b) || (b = a.touches()[0],
            c = a.touches()[1],
            a = new C(b.clientX(),b.clientY()),
            c = new C(c.clientX(),c.clientY()),
            b = a.x - c.x,
            a = a.y - c.y,
            a = Math.sqrt(b * b + a * a),
            this.Pi ? b = a / this.Pi : (b = 1,
            this.Pi = a));
            a = b;
            this.to.f(a);
            this.Zg = a
        } else
            0 < this.Zg && (this.xl.f(this.Zg),
            this.Yg = null,
            this.Zg = -1,
            this.Pi = 0)
    }
    ;
    function Kh(a) {
        a = a.touches();
        return 2 != a.length ? null : {
            Fj: new C(a[0].clientX(),a[0].clientY()),
            Xj: new C(a[1].clientX(),a[1].clientY())
        }
    }
    e.Ve = function() {
        return this.Mg
    }
    ;
    e.ke = function() {}
    ;
    function Lh() {
        this.yl = new H
    }
    e = Lh.prototype;
    e.Bh = null;
    e.Yd = null;
    e.Oe = !1;
    e.Gj = function(a, b) {
        if ("touchEnd" == a)
            return this.Oe && this.Bh && this.Yd ? this.Wo(this.Yd, this.Bh) ? 1 : 0 : 0;
        if (1 != b.touches().length || wf(b.Qd))
            return this.Oe = !1,
            0;
        var c = new C(b.touches()[0].screenX(),b.touches()[0].screenY());
        if ("touchStart" == a) {
            if (xf(b.Qd))
                return this.Oe = !1,
                0;
            this.Bh = this.Yd = c;
            this.Oe = !0;
            return 0
        }
        if (!this.Oe || !this.Bh || !this.Yd)
            return 0;
        (this.Oe = this.Bh == this.Yd ? this.Xo(c, this.Yd) : this.Yo(c, this.Yd)) && b.Qd.preventDefault();
        this.Yd = c;
        return 0
    }
    ;
    e.zj = function() {
        this.yl.f()
    }
    ;
    e.ke = function() {}
    ;
    function Mh(a) {
        Lh.apply(this, arguments)
    }
    m(Mh, Lh);
    Mh.prototype.Sh = function() {
        return "scrollLeft"
    }
    ;
    Mh.prototype.Yo = function(a, b) {
        return a.x - 20 <= b.x
    }
    ;
    Mh.prototype.Xo = function(a, b) {
        return b.x - a.x >= Math.abs(a.y - b.y)
    }
    ;
    Mh.prototype.Wo = function(a, b) {
        var c = b.x - a.x;
        return 80 < c && .7 * c >= Math.abs(a.y - b.y)
    }
    ;
    function Nh(a) {
        Lh.apply(this, arguments)
    }
    m(Nh, Lh);
    Nh.prototype.Sh = function() {
        return "scrollRight"
    }
    ;
    Nh.prototype.Yo = function(a, b) {
        return a.x + 20 >= b.x
    }
    ;
    Nh.prototype.Xo = function(a, b) {
        return a.x - b.x >= Math.abs(a.y - b.y)
    }
    ;
    Nh.prototype.Wo = function(a, b) {
        var c = a.x - b.x;
        return 80 < c && .7 * c >= Math.abs(a.y - b.y)
    }
    ;
    function Oh(a) {
        L.call(this);
        var b = this;
        this.g = a;
        this.$l = M(this);
        this.qd = !1;
        var c = new Ee(a.displayObject());
        this.Ke = new Jh;
        F(this, this.Ke.uo, this.mr, this);
        Me(c, this.Ke);
        this.ah = this.fe = null;
        this.Df = new Ee(a.displayObject());
        var d = new Ih;
        Me(this.Df, d);
        this.Cr = M(this, d.Ji);
        this.Nn = M(this);
        F(this, d.yk, this.Qq, this);
        this.Hq = M(this, d.Ve());
        Fe(this.Df);
        this.uj = new Ne;
        Me(c, this.uj);
        this.rn = M(this);
        F(this, this.uj.tj, this.ar, this);
        F(this, this.uj.ln, function(a, c) {
            b.fe && (clearTimeout(b.fe),
            b.fe = null);
            b.rn.f(a, c)
        }, this);
        Fe(c);
        this.Ae = new Ee(a.displayObject());
        a = new Mh;
        Me(this.Ae, a);
        this.Dc = M(this);
        F(this, a.yl, function() {
            b.ah && clearTimeout(b.ah);
            b.Dc.f(!0)
        });
        a = new Nh;
        Me(this.Ae, a);
        F(this, a.yl, function() {
            b.ah && clearTimeout(b.ah);
            b.yd.f(!0)
        });
        this.yd = M(this);
        Fe(this.Ae);
        this.bn = M(this);
        this.Ud = this.qd = !0
    }
    m(Oh, L);
    e = Oh.prototype;
    e.Qq = function() {
        var a = this;
        this.ah = setTimeout(function() {
            a.Nn.f()
        }, 0)
    }
    ;
    e.Ve = function() {
        return this.Ke.Ve()
    }
    ;
    e.wg = function() {
        return this.Ke.to
    }
    ;
    e.Ra = function() {
        return this.yd
    }
    ;
    e.Qa = function() {
        return this.Dc
    }
    ;
    e.mr = function() {
        var a = x(this.Ke.Go);
        this.$l.f((a.Fj.x + a.Xj.x) / 2, (a.Fj.y + a.Xj.y) / 2)
    }
    ;
    e.ar = function(a) {
        var b = this;
        if (this.fe)
            clearTimeout(this.fe),
            this.fe = null;
        else {
            var c = this.g.displayObject().getBoundingClientRect()
              , d = lh() ? a > c.width - 120 : a > c.width - 70
              , f = lh() ? 120 > a : 70 > a;
            this.fe = setTimeout(function() {
                f ? b.yd.f(!1) : d ? b.Dc.f(!1) : b.bn.f();
                b.uj.$k = null;
                b.fe = null
            }, f || d ? 300 : 500)
        }
    }
    ;
    function Ph() {
        D(window, "keydown", this.yf, !1, this);
        this.X = 0;
        this.yd = new H;
        this.Dc = new H;
        this.Uc = new H;
        this.we = new H;
        this.Sk = !1
    }
    e = Ph.prototype;
    e.ra = function(a) {
        this.X = a
    }
    ;
    e.Ra = function() {
        return this.yd
    }
    ;
    e.Qa = function() {
        return this.Dc
    }
    ;
    e.Rb = function() {
        return this.we
    }
    ;
    e.Ab = function() {
        return this.Uc
    }
    ;
    e.yf = function(a) {
        if (this.Sk)
            a.preventDefault();
        else {
            var b = (a.ctrlKey ? 1 : 0) | (a.altKey ? 2 : 0) | (a.shiftKey ? 4 : 0) | (a.metaKey ? 8 : 0);
            if (1 !== b && 8 !== b || !Qh(a)) {
                var c;
                if (c = 4 === b)
                    a: {
                        switch (a.keyCode) {
                        case 32:
                            this.yd.f();
                            c = !0;
                            break a
                        }
                        c = !1
                    }
                if (c)
                    a.preventDefault();
                else {
                    if (!(c = 3 !== b && 10 !== b)) {
                        a: {
                            switch (a.keyCode) {
                            case 70:
                                this.we.f();
                                c = !0;
                                break a
                            }
                            c = !1
                        }
                        c = !c
                    }
                    c ? 0 === b && Rh(this, a) && a.preventDefault() : a.preventDefault()
                }
            } else
                a.preventDefault()
        }
    }
    ;
    function Qh(a) {
        switch (a.keyCode) {
        case 61:
        case 107:
        case 187:
        case 171:
            return !0;
        case 173:
        case 109:
        case 189:
            return !0;
        case 48:
        case 96:
            return !0
        }
        return !1
    }
    function Rh(a, b) {
        switch (b.keyCode) {
        case 8:
        case 37:
            return a.yd.f(),
            !0;
        case 32:
        case 39:
            return a.Dc.f(),
            !0;
        case 36:
            return a.Uc.f(1),
            !0;
        case 35:
            return a.Uc.f(a.X),
            !0;
        case 38:
        case 40:
            return B
        }
        return !1
    }
    ;function Sh() {
        $d.call(this);
        this.rb = Th;
        this.endTime = this.startTime = null
    }
    w(Sh, $d);
    var Th = 0;
    Sh.prototype.Lj = function() {
        return 1 == this.rb
    }
    ;
    Sh.prototype.Pj = function() {
        this.Yc("begin")
    }
    ;
    Sh.prototype.Zh = function() {
        this.Yc("end")
    }
    ;
    Sh.prototype.Yc = function(a) {
        this.dispatchEvent(a)
    }
    ;
    function Uh(a, b, c) {
        vd.call(this);
        this.za = null;
        this.Qm = !1;
        this.Xh = a;
        this.Ij = c;
        this.gd = b || window;
        this.Mh = Fa(this.im, this)
    }
    w(Uh, vd);
    e = Uh.prototype;
    e.start = function() {
        this.stop();
        this.Qm = !1;
        var a = Vh(this)
          , b = Wh(this);
        a && !b && this.gd.mozRequestAnimationFrame ? (this.za = D(this.gd, "MozBeforePaint", this.Mh),
        this.gd.mozRequestAnimationFrame(null),
        this.Qm = !0) : this.za = a && b ? a.call(this.gd, this.Mh) : this.gd.setTimeout(bb(this.Mh), 20)
    }
    ;
    e.stop = function() {
        if (this.Sb()) {
            var a = Vh(this)
              , b = Wh(this);
            a && !b && this.gd.mozRequestAnimationFrame ? Wd(this.za) : a && b ? b.call(this.gd, this.za) : this.gd.clearTimeout(this.za)
        }
        this.za = null
    }
    ;
    e.Sb = function() {
        return null != this.za
    }
    ;
    e.im = function() {
        this.Qm && this.za && Wd(this.za);
        this.za = null;
        this.Xh.call(this.Ij, Ga())
    }
    ;
    e.dc = function() {
        this.stop();
        Uh.V.dc.call(this)
    }
    ;
    function Vh(a) {
        a = a.gd;
        return a.requestAnimationFrame || a.webkitRequestAnimationFrame || a.mozRequestAnimationFrame || a.oRequestAnimationFrame || a.msRequestAnimationFrame || null
    }
    function Wh(a) {
        a = a.gd;
        return a.cancelAnimationFrame || a.cancelRequestAnimationFrame || a.webkitCancelRequestAnimationFrame || a.mozCancelRequestAnimationFrame || a.oCancelRequestAnimationFrame || a.msCancelRequestAnimationFrame || null
    }
    ;function Xh(a, b, c) {
        vd.call(this);
        this.Xh = a;
        this.hg = b || 0;
        this.Ij = c;
        this.Mh = Fa(this.im, this)
    }
    w(Xh, vd);
    e = Xh.prototype;
    e.za = 0;
    e.dc = function() {
        Xh.V.dc.call(this);
        this.stop();
        delete this.Xh;
        delete this.Ij
    }
    ;
    e.start = function(a) {
        this.stop();
        this.za = zf(this.Mh, p(a) ? a : this.hg)
    }
    ;
    e.stop = function() {
        this.Sb() && n.clearTimeout(this.za);
        this.za = 0
    }
    ;
    e.Sb = function() {
        return 0 != this.za
    }
    ;
    e.im = function() {
        this.za = 0;
        this.Xh && this.Xh.call(this.Ij)
    }
    ;
    var Tb = {}
      , Yh = null;
    function Zh(a) {
        a = Aa(a);
        delete Tb[a];
        Sb() && Yh && Yh.stop()
    }
    function $h() {
        Yh || (Yh = new Xh(function() {
            ai()
        }
        ,20));
        var a = Yh;
        a.Sb() || a.start()
    }
    function ai() {
        var a = Ga();
        Nb(Tb, function(b) {
            bi(b, a)
        });
        Sb() || $h()
    }
    ;function ci(a, b, c, d) {
        Sh.call(this);
        if (!v(a) || !v(b))
            throw Error("Start and end parameters must be arrays");
        if (a.length != b.length)
            throw Error("Start and end points must be the same length");
        this.tg = a;
        this.kp = b;
        this.duration = c;
        this.ap = d;
        this.coords = [];
        this.Xs = !1;
        this.sc = 0;
        this.wm = null
    }
    w(ci, Sh);
    e = ci.prototype;
    e.play = function(a) {
        if (a || this.rb == Th)
            this.sc = 0,
            this.coords = this.tg;
        else if (this.Lj())
            return !1;
        Zh(this);
        this.startTime = a = Ga();
        -1 == this.rb && (this.startTime -= this.duration * this.sc);
        this.endTime = this.startTime + this.duration;
        this.wm = this.startTime;
        this.sc || this.Pj();
        this.Yc("play");
        -1 == this.rb && this.Yc("resume");
        this.rb = 1;
        var b = Aa(this);
        b in Tb || (Tb[b] = this);
        $h();
        bi(this, a);
        return !0
    }
    ;
    e.stop = function(a) {
        Zh(this);
        this.rb = Th;
        a && (this.sc = 1);
        di(this, this.sc);
        this.Yc("stop");
        this.Zh()
    }
    ;
    e.pause = function() {
        this.Lj() && (Zh(this),
        this.rb = -1,
        this.Yc("pause"))
    }
    ;
    e.dc = function() {
        this.rb == Th || this.stop(!1);
        this.tp();
        ci.V.dc.call(this)
    }
    ;
    e.destroy = function() {
        this.eg()
    }
    ;
    function bi(a, b) {
        Oa(a.startTime);
        Oa(a.endTime);
        Oa(a.wm);
        b < a.startTime && (a.endTime = b + a.endTime - a.startTime,
        a.startTime = b);
        a.sc = (b - a.startTime) / (a.endTime - a.startTime);
        1 < a.sc && (a.sc = 1);
        a.wm = b;
        di(a, a.sc);
        1 == a.sc ? (a.rb = Th,
        Zh(a),
        a.Yc("finish"),
        a.Zh()) : a.Lj() && a.Oj()
    }
    function di(a, b) {
        ya(a.ap) && (b = a.ap(b));
        a.coords = Array(a.tg.length);
        for (var c = 0; c < a.tg.length; c++)
            a.coords[c] = (a.kp[c] - a.tg[c]) * b + a.tg[c]
    }
    e.Oj = function() {
        this.Yc("animate")
    }
    ;
    e.tp = function() {
        this.Yc("destroy")
    }
    ;
    e.Yc = function(a) {
        this.dispatchEvent(new ei(a,this))
    }
    ;
    function ei(a, b) {
        zd.call(this, a);
        this.coords = b.coords;
        this.x = b.coords[0];
        this.y = b.coords[1];
        this.z = b.coords[2];
        this.duration = b.duration;
        this.sc = b.sc;
        this.state = b.rb
    }
    w(ei, zd);
    function X(a, b, c, d) {
        ci.call(this, a, b, c, d);
        this.mk = new H;
        this.Vp = new H;
        this.la = new H
    }
    w(X, ci);
    e = X.prototype;
    e.mb = function(a) {
        this.Bg && this.Bg.Zu(a)
    }
    ;
    e.Ge = function() {
        this.Bg && this.Bg.ov()
    }
    ;
    e.wd = function() {
        this.Bg && this.Bg.cv()
    }
    ;
    e.Oj = function() {
        x(this.coords);
        this.mb(this.coords);
        this.Vp.f()
    }
    ;
    e.tp = function() {}
    ;
    e.Zh = function() {
        x(this.coords);
        this.mb(this.coords);
        this.wd();
        this.la.f()
    }
    ;
    e.Pj = function() {
        x(this.coords);
        this.mk.f();
        this.Ge();
        this.mb(this.coords)
    }
    ;
    function fi(a) {
        var b = a.Hc
          , c = a.nextPage
          , d = a.Gc
          , f = a.ws
          , g = a.$r
          , h = a.Cs;
        X.call(this, [0], [1], a.duration);
        this.w = b;
        this.B = d;
        this.Sf = (this.F = c) ? this.F.x() : 0;
        this.dh = f - this.Sf;
        this.Rf = this.B ? this.B.x() : 0;
        this.Ig = g - this.Rf;
        this.Tf = this.w ? this.w.x() : 0;
        this.mh = h - this.Tf
    }
    m(fi, X);
    fi.prototype.mb = function(a) {
        a = a[0];
        this.w.ka(this.Tf + this.mh * a);
        this.B.ka(this.Rf + this.Ig * a);
        this.F.ka(this.Sf + this.dh * a)
    }
    ;
    function gi() {
        L.call(this);
        this.Vg = !1;
        this.xh = M(this);
        this.bh = M(this);
        this.la = M(this)
    }
    m(gi, L);
    gi.prototype.xk = function(a, b) {
        this.xh.f(a, b)
    }
    ;
    gi.prototype.wk = function(a, b) {
        this.bh.f(a, b)
    }
    ;
    function hi() {
        L.call(this);
        this.O = null;
        this.Vb = new C(0,0);
        this.gj = new C(0,0);
        this.Ri = !1;
        this.Tb = new C(0,0);
        this.sj = ii(this)
    }
    m(hi, L);
    hi.prototype.Id = function(a) {
        this.O = a
    }
    ;
    function ii(a) {
        return new Uh(function() {
            if (!a.Ri) {
                a.Vb.x = .5 * -db(a.Vb.x);
                a.Vb.y += .5 * -db(a.Vb.y);
                a.Tb = a.Tb.translate(a.Vb);
                a.O.scrollTo(a.Tb.x, a.Tb.y);
                var b = a.O.scrollTop()
                  , c = a.O.scrollLeft();
                b = 0 == b || b >= a.O.scrollHeight();
                c = 0 == c || c >= a.O.scrollWidth();
                b && c ? a.sj.stop() : .5 > Math.abs(a.Vb.x) && .5 > Math.abs(a.Vb.y) || .5 >= Math.abs(a.Vb.x) && .5 >= Math.abs(a.Vb.y) || a.sj.start()
            }
        }
        )
    }
    ;function ji() {
        gi.call(this);
        this.Ta = this.R = this.Fa = null;
        this.zk = this.zi = this.Ai = !1;
        this.zg = new C(0,0);
        this.Cf = new hi;
        G(this, this.Cf)
    }
    m(ji, gi);
    e = ji.prototype;
    e.enable = function(a) {
        var b = this;
        this.Fa = a;
        this.R = a.ownerDocument;
        this.Ta = new Ee(this.Fa);
        G(this, this.Ta);
        a = new Ih;
        F(this, a.Zm, function() {
            var a = b.Cf;
            a.Ri = !0;
            a.sj.stop()
        }, this);
        F(this, a.Ji, this.Pq, this);
        F(this, a.Ve(), this.Oq, this);
        F(this, a.yk, this.Nq, this);
        Me(this.Ta, a);
        Fe(this.Ta)
    }
    ;
    e.disable = function() {
        this.Ta && (Ge(this.Ta),
        this.oh(this.Ta),
        this.Ta = null)
    }
    ;
    e.Id = function(a) {
        this.Cf.Id(a)
    }
    ;
    e.Pq = function(a, b) {
        this.zk = !1;
        this.zg = new C(0,0);
        var c = this.Cf;
        c.Ri = !0;
        c.Vb = new C(0,0);
        c.gj = new C(0,0);
        this.xk(a, b)
    }
    ;
    e.Oq = function(a, b) {
        this.zk || (this.Ai = Math.abs(b) > Math.abs(a),
        this.zi = Math.abs(a) > Math.abs(b));
        this.zk = !0;
        this.Ai && 70 < Math.abs(a) && (this.Ai = !1,
        this.zg = new C(a,0));
        this.zi && 70 < Math.abs(b) && (this.zi = !1,
        this.zg = new C(0,b));
        a = this.Ai ? 0 : a - this.zg.x;
        b = this.zi ? 0 : b - this.zg.y;
        this.wk(a, b);
        var c = this.Cf
          , d = a - c.gj.x
          , f = b - c.gj.y;
        5 > Math.abs(d) && 5 > Math.abs(f) ? c.Vb = new C(0,0) : (c.Vb = new C(-db(d) * cb(Math.abs(d), 0, 25),-db(f) * cb(Math.abs(f), 0, 25)),
        c.gj = new C(a,b))
    }
    ;
    e.Nq = function() {
        var a = this.Cf;
        a.Ri = !1;
        a.Tb = new C(a.O.scrollLeft(),a.O.scrollTop());
        a.sj.start();
        this.la.f()
    }
    ;
    function ki() {
        gi.call(this);
        this.R = this.Fa = null;
        this.Pb = new C(0,0)
    }
    m(ki, gi);
    e = ki.prototype;
    e.enable = function(a) {
        this.Fa = a;
        this.R = a.ownerDocument;
        this.Vg = !1;
        D(this.Fa, "mousedown", this.In, !0, this);
        D(this.R, "mousemove", this.Jn, !0, this);
        D(this.R, "mouseup", this.Ln, !0, this)
    }
    ;
    e.disable = function() {
        Vd(this.Fa, "mousedown", this.In, !0, this);
        Vd(this.R, "mousemove", this.Jn, !0, this);
        Vd(this.R, "mouseup", this.Ln, !0, this)
    }
    ;
    e.In = function(a) {
        a.preventDefault();
        0 == a.button && (J(this.Fa, "holdHand"),
        this.Pb = new C(a.clientX,a.clientY),
        this.xk(a.clientX, a.clientY),
        this.Vg = !0)
    }
    ;
    e.Jn = function(a) {
        this.Vg && this.wk(a.clientX - this.Pb.x, a.clientY - this.Pb.y)
    }
    ;
    e.Ln = function() {
        this.Vg && (K(this.Fa, "holdHand"),
        this.Vg = !1)
    }
    ;
    function li() {
        gi.call(this);
        this.Ta = this.R = this.Fa = null
    }
    m(li, gi);
    li.prototype.enable = function(a) {
        this.Fa = a;
        this.R = a.ownerDocument;
        this.Ta = new Ee(this.Fa);
        G(this, this.Ta);
        a = new Ih;
        F(this, a.Ji, this.xk, this);
        F(this, a.Ve(), this.wk, this);
        Me(this.Ta, a);
        Fe(this.Ta)
    }
    ;
    li.prototype.disable = function() {
        this.Ta && (Ge(this.Ta),
        this.oh(this.Ta),
        this.Ta = null)
    }
    ;
    function mi(a, b) {
        L.call(this);
        this.g = a;
        this.Fa = null;
        this.Ug = !1;
        this.ue = b && gg ? new ji : b ? new li : new ki;
        F(this, this.ue.xh, this.Br, this);
        F(this, this.ue.bh, this.Gq, this);
        F(this, this.ue.la, this.hq, this);
        this.Ah = this.zh = 0;
        this.On = M(this);
        this.bh = M(this);
        this.Mn = M(this)
    }
    m(mi, L);
    e = mi.prototype;
    e.Sb = function() {
        return this.Ug
    }
    ;
    e.Id = function(a) {
        this.ue instanceof ji && this.ue.Id(a)
    }
    ;
    e.enable = function() {
        if (this.Ug)
            throw Error("HandMotion already enable");
        x(this.Fa);
        J(this.Fa, "handMotionOverlay");
        this.ue.enable(this.Fa);
        this.Ug = !0
    }
    ;
    e.disable = function() {
        if (!this.Ug)
            throw Error("HandMotion already disable");
        K(this.Fa, "handMotionOverlay");
        this.ue.disable();
        this.Ug = !1
    }
    ;
    e.Br = function() {
        this.zh = this.g.scrollLeft;
        this.Ah = this.g.scrollTop;
        this.On.f()
    }
    ;
    e.Gq = function(a, b) {
        a = this.zh - a;
        b = this.Ah - b;
        this.g.scrollLeft = a;
        this.g.scrollTop = b;
        this.bh.f(this.g.scrollLeft - a, this.g.scrollTop - b)
    }
    ;
    e.hq = function() {
        this.Mn.f()
    }
    ;
    function ni(a) {
        var b = a.scrollTop
          , c = a.scrollLeft
          , d = a.scale
          , f = a.Ic
          , g = a.pe;
        X.call(this, [0], [1], a.duration);
        this.i = g;
        this.O = f;
        this.Ah = this.O.scrollTop();
        this.sr = this.Ah - b;
        this.zh = this.O.scrollLeft();
        this.rr = this.zh - c;
        this.Io = this.i.scale();
        this.lr = this.Io - d
    }
    m(ni, X);
    ni.prototype.mb = function(a) {
        a = a[0];
        this.i.G(this.Io - this.lr * a);
        this.O.scrollTo(this.zh - this.rr * a, this.Ah - this.sr * a)
    }
    ;
    function oi(a, b) {
        this.he = a;
        this.ie = b
    }
    oi.prototype.x = function() {
        return this.he
    }
    ;
    oi.prototype.y = function() {
        return this.ie
    }
    ;
    function pi(a) {
        var b = Math.pow(10, 2);
        return Math.round(a * b) / b
    }
    function qi(a) {
        var b = z.Sp;
        return a == z.We ? a : pi(Math.min(a + b, z.We))
    }
    function ri(a) {
        var b = z.Sp;
        return a == z.Xe ? a : pi(Math.max(a - b, z.Xe))
    }
    function si(a) {
        var b = Lf();
        return Math.max(a.width / b.width, a.height / b.height)
    }
    ;function ti(a) {
        this.g = a;
        this.K = null;
        this.Cb = this.$b = 0;
        this.N = 1;
        this.C = 0;
        this.ba = this.Aa = null;
        this.$a = z.cs;
        this.X = 0;
        this.R = null;
        this.Xb = !1;
        this.Wa = new H;
        this.Pf = new H;
        this.Ec = new H
    }
    e = ti.prototype;
    e.container = function() {
        return this.g
    }
    ;
    function ui(a) {
        return a.g.displayObject()
    }
    e.o = function() {
        return this.X
    }
    ;
    e.document = function() {
        return this.R
    }
    ;
    e.bb = function(a) {
        this.R = a;
        this.X = a.o()
    }
    ;
    e.$c = function() {
        return this.K
    }
    ;
    e.Da = function() {
        return this.C
    }
    ;
    e.scale = function() {
        return this.Cb
    }
    ;
    e.Gd = function() {
        return this.N
    }
    ;
    e.Rj = function() {
        return this.Wa
    }
    ;
    e.disable = function() {
        this.ba.Sb() && this.ba.disable();
        this.Xb = !1;
        this.Cb = 0;
        this.N = 1;
        this.C = 0
    }
    ;
    e.kc = function() {
        this.Wa.f(this.C)
    }
    ;
    function vi(a) {
        a.Xb = !0;
        a.Ec.f()
    }
    function wi(a, b) {
        return a.R && a.C != b && 0 < b && b <= a.o()
    }
    ;function xi(a) {
        ti.call(this, a);
        this.Na = this.lc = null
    }
    w(xi, ti);
    xi.prototype.Zj = function(a) {
        this.lc = a
    }
    ;
    xi.prototype.lm = function() {}
    ;
    function yi() {}
    e = yi.prototype;
    e.pageNumber = function() {
        return 0
    }
    ;
    e.Bd = function() {}
    ;
    e.$c = function() {}
    ;
    e.H = function() {}
    ;
    e.T = function() {}
    ;
    e.reset = function() {}
    ;
    e.destroy = function() {}
    ;
    e.ka = function() {}
    ;
    e.x = function() {
        return 0
    }
    ;
    e.Jc = function() {}
    ;
    e.y = function() {
        return 0
    }
    ;
    e.aa = function() {}
    ;
    e.G = function() {}
    ;
    e.rm = function() {
        return Promise.resolve(null)
    }
    ;
    e.va = function() {}
    ;
    e.displayObject = function() {}
    ;
    function zi(a) {
        this.i = a
    }
    e = zi.prototype;
    e.$j = function(a) {
        this.i.container().displayObject().scrollTop = a
    }
    ;
    e.scrollTo = function(a, b) {
        this.i.container().displayObject().scrollLeft = a;
        this.$j(b)
    }
    ;
    e.scrollTop = function() {
        return this.Eb().scrollTop
    }
    ;
    e.scrollLeft = function() {
        return this.Eb().scrollLeft
    }
    ;
    e.scrollWidth = function() {
        return this.Eb().scrollWidth
    }
    ;
    e.scrollHeight = function() {
        return this.Eb().scrollHeight
    }
    ;
    e.Eb = function() {
        return this.i.container().displayObject()
    }
    ;
    function Ai() {
        this.re = [];
        this.mk = new H;
        this.la = new H
    }
    e = Ai.prototype;
    e.add = function(a) {
        this.re.push(a);
        a.la.addHandler(this.Pn, this)
    }
    ;
    e.remove = function(a) {
        var b = this.re.indexOf(a);
        -1 != b && (this.re.splice(b, 1),
        a.la.removeHandler(this.Pn, this))
    }
    ;
    e.play = function(a) {
        this.mk.f();
        this.re.length && (this.qn = 0,
        this.fo = !0,
        Ta(this.re, function(b) {
            b.play(p(a) ? a : !0)
        }, this));
        return !0
    }
    ;
    e.stop = function(a) {
        Ta(this.re, function(b) {
            b.stop(p(a) ? a : !0)
        }, this)
    }
    ;
    e.Lj = function() {
        return this.fo
    }
    ;
    e.Pn = function() {
        ++this.qn;
        this.qn == this.re.length && (this.fo = !1,
        this.la.f())
    }
    ;
    function Bi(a, b, c, d) {
        return function(f) {
            if (a != b || c != d) {
                for (var g = f, h = 0; 4 > h; ++h) {
                    var k = 3 * (1 - 3 * c + 3 * a) * g * g + 2 * (3 * c - 6 * a) * g + 3 * a;
                    if (0 == k)
                        break;
                    g -= ((((1 - 3 * c + 3 * a) * g + (3 * c - 6 * a)) * g + 3 * a) * g - f) / k
                }
                f = g;
                f *= ((1 - 3 * d + 3 * b) * f + (3 * d - 6 * b)) * f + 3 * b
            }
            return f
        }
    }
    var Ci = Bi(.25, .1, .25, 1)
      , Di = Bi(0, 0, .58, 1);
    var Ei = Bi(.64, .04, .35, 1)
      , Fi = Bi(.09, .74, .35, 1)
      , Gi = Bi(.35, .02, .67, .19);
    var Hi = z.xg;
    function Ii(a) {
        var b = a.pb
          , c = a.Hc
          , d = a.Gc
          , f = a.nextPage
          , g = a.js;
        X.call(this, [0], [1], a.duration, Ei);
        this.Ga = b;
        this.w = c;
        this.B = d;
        this.F = f;
        this.Og = g;
        a = this.xc(this.Og);
        this.Og.ka(this.Ga.width() + a);
        a = this.xc(this.w);
        this.hj = this.w.x();
        this.mh = a;
        a = this.xc(this.B);
        this.Jg = this.B.x();
        this.Ig = this.Jg - -a;
        a = this.xc(this.F);
        a = Math.floor(this.Ga.width() / 2 - a / 2);
        a = Math.max(a, 0);
        this.Wi = this.F.x();
        this.dh = this.Wi - a;
        a = this.xc(this.Og);
        this.kq = this.Og.x();
        this.jq = a
    }
    m(Ii, X);
    Ii.prototype.mb = function(a) {
        a = a[0];
        this.w.ka(this.hj - this.mh * a);
        this.B.ka(this.Jg - this.Ig * a);
        this.F.ka(this.Wi - this.dh * a);
        this.Og.ka(this.kq - this.jq * a)
    }
    ;
    Ii.prototype.xc = function(a) {
        return 0 == a.pageNumber() ? 0 : a.Bd().width + 2 * Hi.Ea
    }
    ;
    var Ji = z.xg;
    function Ki(a) {
        var b = a.pb
          , c = a.Hc
          , d = a.Gc
          , f = a.nextPage
          , g = a.ks;
        X.call(this, [0], [1], a.duration, Ei);
        this.Ga = b;
        this.w = c;
        this.B = d;
        this.F = f;
        this.Pg = g;
        a = this.xc(this.Pg);
        this.Pg.ka(-2 * a);
        a = this.xc(this.F);
        this.Wi = this.F.x();
        this.dh = a;
        this.Jg = this.B.x();
        this.Ig = this.Ga.width() - this.Jg;
        a = this.xc(this.w);
        a = Math.floor(this.Ga.width() / 2 - a / 2);
        a = Math.max(a, 0);
        this.hj = this.w.x();
        this.mh = a - this.hj;
        a = this.xc(this.Pg);
        this.mq = this.Pg.x();
        this.lq = a
    }
    m(Ki, X);
    Ki.prototype.mb = function(a) {
        a = a[0];
        this.F.ka(this.Wi + this.dh * a);
        this.B.ka(this.Jg + this.Ig * a);
        this.w.ka(this.hj + this.mh * a);
        this.Pg.ka(this.mq + this.lq * a)
    }
    ;
    Ki.prototype.xc = function(a) {
        return 0 == a.pageNumber() ? 0 : a.Bd().width + 2 * Ji.Ea
    }
    ;
    function Li(a, b, c) {
        return b && c ? new C(b,c) : new C(a.width() / 2,a.height() / 2)
    }
    function Mi(a) {
        return a.scale() * (a.$a - 1) + 1
    }
    function Ni(a) {
        var b = a.pe
          , c = a.page
          , d = a.ug
          , f = a.Fp
          , g = a.clientX;
        a = a.clientY;
        var h = Li(b.container(), g, a);
        g = f.bs;
        c = c.displayObject().getBoundingClientRect();
        d && (h = b.container().displayObject().getBoundingClientRect(),
        f = 2 * f.hs,
        b = Mi(b),
        g = (h.width - f) * b / d.width,
        b = b / g * (h.height - f),
        f = c.top + d.top + .5 * b,
        h = new C(c.left + d.left + d.width / 2,cb(a || f, f, c.top + (new qd(d.top,d.left + d.width,d.top + d.height,d.left)).bottom - .5 * b)));
        return {
            scale: g,
            position: new C(Math.max(h.x - c.left, 0),Math.max(h.y - c.top, 0))
        }
    }
    function Oi(a) {
        var b = a.pe
          , c = a.scale;
        a = a.position;
        var d = Mi(b)
          , f = (c - 1) / (b.$a - 1);
        c /= d;
        b = b.container().displayObject().getBoundingClientRect();
        return {
            Gd: f,
            scrollTop: a.y * c - b.height / 2,
            scrollLeft: a.x * c - b.width / 2
        }
    }
    ;var Pi = z.xg;
    function Qi(a, b, c) {
        L.call(this);
        this.i = b;
        this.Ki = a;
        this.Ag = null;
        this.O = c;
        this.Rd = null;
        this.Bi = M(this);
        this.He = this.ze = null
    }
    m(Qi, L);
    e = Qi.prototype;
    e.Km = function(a) {
        this.Rd = a
    }
    ;
    e.playing = function() {
        return !!this.ze || !!this.He
    }
    ;
    function Ri(a, b, c, d, f) {
        if (!a.ze) {
            a.Ag = f;
            c || Si(a);
            a.cn(a.ze);
            f = a.Ki;
            var g = a.i.view();
            b = new Ii({
                duration: f,
                pb: g.pb(),
                Hc: a.i.Hc(),
                Gc: a.i.Gc(),
                nextPage: a.i.nextPage(),
                js: b
            });
            c = a.Gi({
                duration: a.Ki,
                yp: c,
                ug: d,
                up: a.i.nextPage()
            });
            d = new Ai;
            d.add(b);
            d.add(c);
            a.ze = d;
            F(a, a.ze.la, a.Wm, a);
            a.ze.play()
        }
    }
    function Ti(a, b, c, d, f) {
        if (!a.He) {
            a.Ag = f;
            c || Si(a);
            a.cn(a.He);
            f = a.Ki;
            var g = a.i.view();
            b = new Ki({
                duration: f,
                pb: g.pb(),
                Hc: a.i.Hc(),
                Gc: a.i.Gc(),
                nextPage: a.i.nextPage(),
                ks: b
            });
            c = a.Gi({
                duration: a.Ki,
                yp: c,
                up: a.i.Hc(),
                ug: d
            });
            d = new Ai;
            d.add(b);
            d.add(c);
            a.He = d;
            F(a, a.He.la, a.Wm, a);
            a.He.play()
        }
    }
    function Si(a) {
        a.i.Gc().va("transform", "translateY(-" + a.O.scrollTop() + "px)");
        a.O.$j(0)
    }
    e.Wm = function() {
        null !== this.Ag && (this.Ag(),
        this.Ag = null);
        this.He = this.ze = null
    }
    ;
    e.kk = function() {
        this.Bi.f()
    }
    ;
    e.Gi = function(a) {
        var b = a.duration;
        var c = a.yp;
        var d = a.ug;
        this.Rd && this.Rd.sf && d ? (a = Ni({
            pe: this.i,
            page: a.up,
            Fp: Pi,
            ug: d
        }),
        d = Oi({
            pe: this.i,
            position: a.position,
            scale: a.scale,
            ug: d
        }),
        a = d.scrollTop,
        c = {
            scale: d.Gd,
            scrollLeft: d.scrollLeft,
            scrollTop: c ? a : 0
        }) : c = {
            scrollLeft: this.O.scrollLeft(),
            scrollTop: c ? 0 : this.O.scrollTop(),
            scale: this.i.scale()
        };
        return new ni({
            duration: b,
            scrollTop: c.scrollTop,
            scrollLeft: c.scrollLeft,
            scale: c.scale,
            Ic: this.O,
            pe: this.i
        })
    }
    ;
    function Ui() {
        this.Lb = []
    }
    Ui.prototype.render = function(a) {
        var b = this
          , c = this.Qg(a);
        c && !this.Xg(c) && (c.Uh() ? this.$d(c) : (a = c.pageNumber(),
        this.Lb[a] || (this.Lb[a] = !0,
        this.R().getPage(a, function(a, f) {
            c.gi(a);
            b.Lb[f] = !1;
            b.$d(c)
        }))))
    }
    ;
    Ui.prototype.Wg = function(a) {
        return 3 == a.Y
    }
    ;
    Ui.prototype.Xg = function(a) {
        return 1 == a.Y
    }
    ;
    Ui.prototype.Qg = function(a) {
        for (var b = 0; b < a.length; ++b)
            if (!this.Wg(a[b].page))
                return a[b].page;
        return null
    }
    ;
    function Vi(a) {
        this.Lb = [];
        this.i = a
    }
    w(Vi, Ui);
    Vi.prototype.Ia = function() {
        var a = []
          , b = this.i.Gc();
        a.push({
            me: b.pageNumber(),
            page: b
        });
        b = this.i.nextPage();
        0 != b.pageNumber() && a.push({
            me: b.pageNumber(),
            page: b
        });
        b = this.i.Hc();
        0 != b.pageNumber() && a.push({
            me: b.pageNumber(),
            page: b
        });
        return {
            Oc: a
        }
    }
    ;
    Vi.prototype.update = function() {
        this.i.Gc().reset();
        this.i.nextPage().reset();
        this.i.Hc().reset();
        var a = this.Ia();
        this.render(a.Oc)
    }
    ;
    Vi.prototype.$d = function(a) {
        var b = this;
        switch (a.Y) {
        case 3:
            break;
        case 2:
            break;
        case 1:
            break;
        case 0:
            a.Za.addHandler(function() {
                var a = b.Ia();
                b.render(a.Oc)
            }, this);
            a.render();
            break;
        default:
            throw Error("renderingState is wrong");
        }
    }
    ;
    Vi.prototype.R = function() {
        var a = this.i.document();
        x(a);
        return a
    }
    ;
    function Wi() {
        U.call(this, ["viewer", z.xg.className]);
        this.Ga = new U("pageContainer");
        this.c(this.Ga);
        this.i = null
    }
    w(Wi, U);
    e = Wi.prototype;
    e.ji = function(a) {
        this.i = a
    }
    ;
    e.pb = function() {
        return this.Ga
    }
    ;
    e.$ = function(a) {
        this.Ga.$(a)
    }
    ;
    e.width = function() {
        return this.Ga.width()
    }
    ;
    e.qa = function(a) {
        this.Ga.qa(a)
    }
    ;
    e.height = function() {
        return this.Ga.height()
    }
    ;
    var Y = z.xg;
    function Yi(a) {
        xi.call(this, a);
        this.O = new zi(this);
        this.F = this.B = this.w = this.a = this.Rd = null;
        this.ff = 0;
        this.vk = !0;
        this.nc = 0;
        this.Wl = null;
        this.Tf = this.Sf = this.Rf = 0;
        this.Ya = new Vi(this);
        this.Qf = new Qi(z.Ps,this,this.O);
        this.ye = null;
        this.wc = new oi(0,0);
        this.ve = new oi(0,0);
        this.Le = new Wc(0,0);
        this.Ec.addHandler(function() {
            var a = this.a.displayObject();
            this.ba.Fa = a
        }, this)
    }
    m(Yi, xi);
    e = Yi.prototype;
    e.Ic = function() {
        return this.O
    }
    ;
    e.Km = function(a) {
        this.Rd = a;
        this.Qf.Km(a)
    }
    ;
    e.Hc = function() {
        x(this.w);
        return this.w
    }
    ;
    e.Gc = function() {
        x(this.B);
        return this.B
    }
    ;
    e.nextPage = function() {
        x(this.F);
        return this.F
    }
    ;
    e.view = function() {
        x(this.a);
        return this.a
    }
    ;
    e.u = function(a, b) {
        b = void 0 === b ? !0 : b;
        if (wi(this, a) && 0 == this.nc)
            if (this.nc = a,
            Zi(this),
            this.vk)
                $i(this, a),
                vi(this),
                this.vk = !1;
            else {
                this.ye && (this.ye.pause(),
                this.ye = null);
                switch (this.Kk(a)) {
                case 0:
                    var c = this.yr;
                    break;
                case 2:
                    c = this.zr;
                    break;
                case 1:
                    c = this.vq;
                    break;
                case 3:
                    c = this.xq;
                    break;
                default:
                    throw Error("TransitionType is wrong");
                }
                c.call(this, a, b)
            }
    }
    ;
    e.bf = function(a) {
        1 >= this.C || this.u(this.C - 1, void 0 === a ? !0 : a)
    }
    ;
    e.af = function(a) {
        a = void 0 === a ? !0 : a;
        this.C >= this.o() || this.u(this.C + 1, a)
    }
    ;
    function aj(a) {
        a.Rf = a.B.x();
        a.Sf = a.F ? a.F.x() : 0;
        a.Tf = a.w ? a.w.x() : 0
    }
    function bj(a, b, c) {
        0 > b && a.C >= a.o() || 0 < b && 1 >= a.C || (c ? cj(a, b) : ((c = a.B) && c.ka(a.Rf + b),
        (c = a.F) && c.ka(a.Sf + b),
        (c = a.w) && c.ka(a.Tf + b),
        b = a.Ic().scrollTop(),
        a.w.va("transform", "translate(-1px, " + b + "px)"),
        a.F.va("transform", "translate(1px, " + b + "px)")))
    }
    e.mm = function() {}
    ;
    e.Hm = function() {}
    ;
    function cj(a, b) {
        a.Qf.playing() || (a.ye = new fi({
            duration: 150,
            Gc: a.B,
            nextPage: a.F,
            Hc: a.w,
            ws: a.Sf + b,
            $r: a.Rf + b,
            Cs: a.Tf + b
        }),
        a.ye.la.addHandler(function() {
            a.ye = null;
            Zi(a)
        }),
        a.ye.play())
    }
    function Zi(a) {
        dj(a.B);
        dj(a.w);
        dj(a.F)
    }
    function dj(a) {
        a && a.va("transform", "")
    }
    e.G = function(a) {
        this.Cb != a && 0 == this.nc && (this.Cb = a,
        this.N = a * (this.$a - 1) + 1,
        this.B.G(this.N),
        ej(this, this.B, 1),
        fj(this),
        this.F.G(this.N),
        ej(this, this.F, 2),
        this.w.G(this.N),
        ej(this, this.w, 0),
        this.Pf.f(this.Cb))
    }
    ;
    e.ne = function(a) {
        this.G(a);
        var b = this.B.displayObject().getBoundingClientRect();
        a = b.width / this.Le.width;
        b = b.height / this.Le.height;
        a *= this.ve.x();
        b *= this.ve.y();
        a = a - this.wc.x() + Y.Ea;
        b = b - this.wc.y() + Y.Ea;
        this.O.scrollTo(a, b)
    }
    ;
    e.Hd = function(a, b) {
        var c = this.B.displayObject().getBoundingClientRect();
        this.wc = new oi(a,b);
        this.ve = new oi(Math.max(a - c.left, 0),Math.max(b - c.top, 0));
        this.Le = new Wc(c.width,c.height)
    }
    ;
    e.resize = function(a) {
        this.Aa = a;
        this.Ml();
        this.Xb && (this.N = this.Cb * (this.$a - 1) + 1,
        x(this.B),
        gj(this, this.B, 1),
        fj(this),
        x(this.F),
        gj(this, this.F, 2),
        x(this.w),
        gj(this, this.w, 0))
    }
    ;
    e.enable = function(a) {
        this.a = new Wi;
        this.a.ji(this);
        this.container().c(this.a);
        this.u(a)
    }
    ;
    e.disable = function() {
        xi.prototype.disable.call(this);
        x(this.a);
        this.container().removeChild(this.a);
        this.a = null;
        this.vk = !0
    }
    ;
    e.update = function() {
        this.Ya.update()
    }
    ;
    e.Nc = function() {
        return [this.C - 1]
    }
    ;
    e.lm = function(a) {
        var b = this
          , c = a.clientX
          , d = a.clientY
          , f = a.bp;
        this.Wl || (this.Rd.sf ? this.B.rm().then(function(a) {
            a = Ni({
                pe: b,
                Fp: Y,
                page: x(b.B),
                ug: a,
                clientX: c,
                clientY: d
            });
            hj(b, a.scale, a.position, f)
        }) : hj(this, 1, Li(this.g, c, d), !f))
    }
    ;
    function hj(a, b, c, d) {
        b = Oi({
            pe: a,
            scale: b,
            position: c
        });
        a.Wl = a.Gi(b.scrollLeft, b.scrollTop, b.Gd, d)
    }
    e.Gi = function(a, b, c, d) {
        var f = this;
        a = new ni({
            pe: this,
            Ic: this.O,
            scrollLeft: a,
            scrollTop: b,
            scale: c,
            duration: d ? Y.Rp / 2 : Y.Rp
        });
        a.play();
        a.la.addHandler(function() {
            f.Wl = null;
            f.update()
        });
        return a
    }
    ;
    function $i(a, b) {
        a.B = ij(a, b);
        a.B.H("current");
        ej(a, a.B, 1);
        a.w = ij(a, b - 1);
        ej(a, a.w, 0);
        a.F = ij(a, b + 1);
        ej(a, a.F, 2);
        fj(a);
        jj(a)
    }
    e.yr = function(a, b) {
        var c = this
          , d = ij(this, a + 1);
        d.H("future-next");
        kj(this, this.F).then(function(a) {
            Ri(c.Qf, d, b, a, function() {
                c.ib(c.w);
                c.B.T("current");
                c.B.H("prev");
                c.w = c.B;
                c.F.T("next");
                c.F.H("current");
                c.B = c.F;
                d.T("future-next");
                d.H("next");
                c.F = d;
                jj(c)
            })
        })
    }
    ;
    e.zr = function(a, b) {
        var c = this
          , d = ij(this, a - 1);
        d.H("future-prev");
        kj(this, this.w).then(function(a) {
            Ti(c.Qf, d, b, a, function() {
                c.ib(c.F);
                c.B.T("current");
                c.B.H("next");
                c.F = c.B;
                c.w.T("prev");
                c.w.H("current");
                c.B = c.w;
                d.T("future-prev");
                d.H("prev");
                c.w = d;
                jj(c)
            })
        })
    }
    ;
    e.vq = function(a, b) {
        var c = this;
        this.ib(this.F);
        this.F = ij(this, a);
        this.F.ka(this.a.width());
        var d = ij(this, a + 1);
        kj(this, this.F).then(function(f) {
            Ri(c.Qf, d, b, f, function() {
                c.ib(c.w);
                c.ib(c.B);
                c.w = ij(c, a - 1);
                c.w.ka(-(c.w.Bd().width + 2 * Y.Ea));
                c.w.H("prev");
                c.F.T("next");
                c.F.H("current");
                c.B = c.F;
                d.H("next");
                c.F = d;
                jj(c)
            })
        })
    }
    ;
    e.xq = function(a, b) {
        var c = this;
        this.ib(this.w);
        this.w = ij(this, a);
        this.w.ka(-(this.w.Bd().width + 2 * Y.Ea));
        var d = ij(this, a - 1);
        kj(this, this.w).then(function(f) {
            Ti(c.Qf, d, b, f, function() {
                c.ib(c.F);
                c.ib(c.B);
                c.F = ij(c, a + 1);
                c.F.ka(c.a.width());
                c.w.T("prev");
                c.w.H("current");
                c.B = c.w;
                d.H("prev");
                c.w = d;
                jj(c);
                Zi(c)
            })
        })
    }
    ;
    function kj(a, b) {
        return b && a.Rd && a.Rd.sf ? b.rm() : Promise.resolve(null)
    }
    function jj(a) {
        a.C = a.nc;
        a.kc();
        a.Zb();
        a.nc = 0;
        Zi(a)
    }
    e.Kk = function(a) {
        var b = this.C;
        return a > b ? a == b + 1 ? 0 : 1 : a == b - 1 ? 2 : 3
    }
    ;
    function ij(a, b) {
        if (0 >= b || b > a.o()) {
            var c = dh(a.lc, 1);
            return new yi
        }
        var d = dh(a.lc, b);
        c = a.Ua(d);
        c = d.clone({
            scale: c * a.N
        });
        b = new Ng(b,c,a.N);
        b.K = d;
        c = c.height + 2 * Y.Ea;
        b.Jc(Math.max((a.Aa.height() - c) / 2, 0));
        a.a.Ga.c(b.displayObject());
        a.Na && b.Za.addHandler(function(a, b) {
            b = this.Ua(b) * si(b);
            this.Na.render(a, this.N, b)
        }
        .bind(a, b, d));
        return b
    }
    function gj(a, b, c) {
        if (0 != b.pageNumber()) {
            var d = b.$c()
              , f = a.Ua(d);
            d = d.clone({
                scale: f * a.N
            });
            b.aa(d, a.N);
            ej(a, b, c)
        }
    }
    e.ib = function(a) {
        a && 0 != a.pageNumber() && (this.a.Ga.removeChild(a.displayObject()),
        a.destroy())
    }
    ;
    e.Zb = function() {
        var a = this.Ya.Ia().Oc;
        this.Ya.render(a)
    }
    ;
    e.Ua = function(a) {
        var b = 2 * (Y.Ea + Y.fk)
          , c = (this.Aa.width() - b) / a.width;
        a = (this.Aa.height() - b) / a.height;
        return Math.min(a, c)
    }
    ;
    function ej(a, b, c) {
        if (0 != b.pageNumber()) {
            var d = b.Bd().width + 2 * Y.Ea;
            switch (c) {
            case 0:
                b.ka(-d);
                break;
            case 1:
                b.ka(Math.max(a.Aa.width() / 2 - d / 2, 0));
                break;
            case 2:
                b.ka(a.a.width());
                break;
            default:
                throw Error("slidePath is wrong");
            }
            c = b.Bd().height + 2 * Y.Ea;
            b.Jc(Math.max((a.Aa.height() - c) / 2, 0))
        }
    }
    function fj(a) {
        var b = a.B.Bd()
          , c = a.Aa.width()
          , d = b.width + 2 * (Y.Ea + Y.fk);
        d > c && (c = d);
        a.a.$(c);
        c = a.Aa.height();
        b = b.height + 2 * (Y.Ea + Y.fk);
        b > c && (c = b);
        a.a.qa(c)
    }
    e.Ml = function() {
        var a = eh(this.lc)
          , b = this.Ua(a);
        a = a.clone({
            scale: b
        });
        a = a.width + 2 * Y.Ea;
        a = this.Aa.width() / a * 2;
        this.$a = Math.max(a, this.$a);
        if (Of) {
            a = this.lc;
            if (-1 == a.cl) {
                if (1 == a.Jb.length)
                    b = 0;
                else {
                    for (var c = b = 0, d = 1; d < a.Jb.length; ++d) {
                        var f = a.Jb[d].size();
                        f = f.width() * f.height();
                        f > b && (b = f,
                        c = d)
                    }
                    b = c
                }
                a.cl = b
            }
            a = a.Jb[a.cl].getViewport();
            b = this.Ua(a);
            a = a.clone({
                scale: b
            });
            a = a.width * a.height * this.$a;
            a > PDFJS.maxCanvasPixels && (this.$a *= PDFJS.maxCanvasPixels / a)
        }
    }
    ;
    e.xc = function(a) {
        return 0 == a.pageNumber() ? 0 : a.Bd().width + 2 * Y.Ea
    }
    ;
    function lj() {
        L.call(this);
        this.j = null;
        this.Zk = 0;
        this.Wa = M(this)
    }
    m(lj, L);
    lj.prototype.Rj = function() {
        return this.Wa
    }
    ;
    function mj(a) {
        var b = Object.assign({}, a), c = {}, d;
        for (d in b)
            "object" == typeof b[d] && (b[d] = mj(b[d]),
            a = b[d],
            a._d && (c[a._d] = a));
        b.toString = function() {
            return b._
        }
        ;
        b.iv = function(a) {
            return c[a]
        }
        ;
        return b
    }
    ;var nj = {
        title: {
            _: "t"
        },
        creationTime: {
            _: "ct"
        },
        pageNumber: {
            _: "pn"
        }
    }, oj = {}, pj;
    for (pj in nj)
        nj.hasOwnProperty(pj) && (oj[pj] = mj(nj[pj]));
    function qj() {}
    qj.prototype.Gm = function(a) {
        return a.cc().map(function(a) {
            var b = {};
            return b[oj.title] = a.title(),
            b[oj.creationTime] = a.creationTime(),
            b[oj.pageNumber] = a.pageNumber(),
            b
        })
    }
    ;
    function rj(a, b, c) {
        p(b) && (a = Math.max(a, b));
        p(c) && (a = Math.min(a, c));
        return a
    }
    ;function sj() {
        this.En = new H;
        this.Bq = new H;
        this.fq = new H;
        this.hl = new H;
        this.lb = null
    }
    e = sj.prototype;
    e.Mj = function(a, b) {
        this.lb = a.split("/").pop();
        a = PDFJS.getDocument(a);
        a.onProgress = this.Gn.bind(this);
        a.onPassword = function(a) {
            b ? a(b) : this.hl.f(a)
        }
        .bind(this);
        a.promise.then(this.Dn.bind(this), this.Fn.bind(this))
    }
    ;
    e.ym = function(a, b, c) {
        this.lb = b;
        b = Object.create(null);
        b.data = a;
        a = PDFJS.getDocument(b);
        a.onProgress = this.Gn.bind(this);
        a.onPassword = function(a) {
            c ? a(c) : this.hl.f(a)
        }
        .bind(this);
        a.promise.then(this.Dn.bind(this), this.Fn.bind(this))
    }
    ;
    e.Gn = function(a) {
        this.Bq.f(rj(a.loaded / a.total, 0, 1))
    }
    ;
    e.Dn = function(a) {
        this.En.f(new wh(a));
        a.getDownloadInfo().then(this.gq.bind(this))
    }
    ;
    e.Fn = function(a) {
        var b = a && a.message
          , c = "An error occurred while loading the PDF.";
        a instanceof PDFJS.Kt ? c = "Invalid or corrupted PDF file." : a instanceof PDFJS.du ? c = "Missing PDF file." : a instanceof PDFJS.Su && (c = "Unexpected server response.");
        console.log(c, {
            message: b
        });
        throw Error(c);
    }
    ;
    e.gq = function() {
        this.fq.f()
    }
    ;
    function tj(a, b, c) {
        U.call(this, "thumbnail");
        this.xa = a;
        this.X = c;
        this.Fb = null;
        this.Y = 0;
        this.Za = new H;
        this.K = null;
        this.Ib = b.width() / b.height();
        this.Yb = b.width() * z.Mp;
        this.Yb < b.width() && (this.Yb = b.width());
        this.$g = Math.floor(this.Yb / this.Ib);
        this.Oi = this.Yb;
        this.Pk = this.$g;
        this.$(b.width());
        this.qa(b.height())
    }
    w(tj, U);
    e = tj.prototype;
    e.pageNumber = function() {
        return this.xa
    }
    ;
    e.gi = function(a) {
        this.K = a.getViewport(1)
    }
    ;
    e.Uh = function() {
        return !0
    }
    ;
    e.$c = function() {
        return this.K
    }
    ;
    e.aa = function(a) {
        this.$(a.width());
        this.qa(a.height());
        this.Oi = a.width();
        this.Pk = a.height();
        this.Oi < this.Yb && (this.Oi = this.Yb,
        this.Pk = this.$g);
        null !== this.Fb && (this.Fb.style.width = a.width() + "px",
        this.Fb.style.height = a.height() + "px")
    }
    ;
    e.reset = function() {
        3 != this.Y && (this.Y = 0)
    }
    ;
    e.render = function() {
        if (0 != this.Y)
            throw Error("Page renderingState is wrong");
        this.Y = 1;
        var a = document.createElement("img");
        a.className = "content";
        a.width = this.Oi;
        a.height = this.Pk;
        a.style.width = this.width() + "px";
        a.style.height = this.height() + "px";
        a.setAttribute("hidden", "hidden");
        this.c(a);
        this.Fb = a;
        a.onload = function() {
            this.Fb.removeAttribute("hidden");
            this.Y = 3;
            this.Za.f()
        }
        .bind(this);
        a.src = z.Ss + "/page-" + uj(this.xa, this.X.toString().length) + ".jpg"
    }
    ;
    e.destroy = function() {
        this.Y = 0;
        this.Fb && (this.Fb.width = 0,
        this.Fb.height = 0,
        this.removeChild(this.Fb),
        this.Fb = null)
    }
    ;
    function uj(a, b) {
        a = a.toString();
        b -= a.length;
        for (var c = 0; c < b; ++c)
            a = "0" + a;
        return a
    }
    ;function vj(a, b) {
        U.call(this, "thumbnail");
        this.xa = a;
        this.ga = this.M = null;
        this.Y = 0;
        this.Za = new H;
        this.K = null;
        this.Ib = b.width() / b.height();
        this.Yb = b.width() * z.Mp;
        this.Yb < b.width() && (this.Yb = b.width());
        this.$g = Math.floor(this.Yb / this.Ib);
        this.hf = this.Yb;
        this.qk = this.$g;
        this.vl = 0;
        this.$(b.width());
        this.qa(b.height())
    }
    w(vj, U);
    e = vj.prototype;
    e.pageNumber = function() {
        return this.xa
    }
    ;
    e.gi = function(a) {
        this.ga = a;
        this.K = a.getViewport(1);
        this.vl = this.hf / this.K.width
    }
    ;
    e.Uh = function() {
        return null !== this.ga
    }
    ;
    e.$c = function() {
        return this.K
    }
    ;
    e.aa = function(a) {
        this.$(a.width());
        this.qa(a.height());
        this.hf = a.width();
        this.qk = a.height();
        this.hf < this.Yb && (this.hf = this.Yb,
        this.qk = this.$g);
        null !== this.K && (this.vl = this.hf / this.K.width);
        null !== this.M && (this.M.style.width = a.width() + "px",
        this.M.style.height = a.height() + "px")
    }
    ;
    e.reset = function() {
        this.Y = 0
    }
    ;
    e.render = function() {
        var a = this;
        if (0 != this.Y)
            throw Error("Page renderingState is wrong");
        this.Y = 1;
        var b = null !== this.M ? this.M : null
          , c = document.createElement("canvas");
        c.className = "content";
        c.width = this.hf;
        c.height = this.qk;
        c.style.width = this.width() + "px";
        c.style.height = this.height() + "px";
        c.setAttribute("hidden", "hidden");
        this.c(c);
        this.M = c;
        c = {
            canvasContext: c.getContext("2d"),
            viewport: this.K.clone({
                scale: this.vl
            })
        };
        this.ga.render(c, function(c) {
            null !== c ? a.Y = 0 : (a.M.removeAttribute("hidden"),
            null !== b && (b.width = 0,
            b.height = 0,
            a.removeChild(b),
            b = null),
            a.Y = 3,
            a.Za.f())
        })
    }
    ;
    e.destroy = function() {
        this.Y = 0;
        if (this.ga) {
            var a = this.ga;
            null !== a.Kf && a.Kf.cancel();
            this.ga.cleanup()
        }
        this.M && (this.M.width = 0,
        this.M.height = 0,
        this.removeChild(this.M),
        this.M = null)
    }
    ;
    function wj() {
        this.mn = !1;
        this.X = 0
    }
    wj.prototype.Jm = function(a) {
        this.mn = a
    }
    ;
    wj.prototype.ra = function(a) {
        this.X = a
    }
    ;
    function xj(a, b, c) {
        return a.mn ? new vj(b,c) : new tj(b,c,a.X)
    }
    ;function yj(a) {
        var b = a.creationTime
          , c = a.pageNumber;
        this.lb = a.title;
        this.cq = b;
        this.xa = c
    }
    yj.prototype.title = function() {
        return this.lb
    }
    ;
    yj.prototype.pageNumber = function() {
        return this.xa
    }
    ;
    yj.prototype.creationTime = function() {
        return this.cq
    }
    ;
    function zj() {}
    zj.prototype.load = function(a, b) {
        a.forEach(function(a, d) {
            b.fb.splice(d || 0, 0, new yj({
                title: a[oj.title],
                creationTime: a[oj.creationTime],
                pageNumber: a[oj.pageNumber]
            }));
            b.te.f()
        })
    }
    ;
    function Aj() {}
    Aj.prototype.encode = function(a) {
        var b = a.pi
          , c = a.cc
          , d = {};
        return d.p = a.pageNumber,
        d.m = b,
        d.b = c,
        d
    }
    ;
    Aj.prototype.decode = function(a) {
        return {
            pageNumber: a.p,
            pi: a.m,
            cc: a.b
        }
    }
    ;
    function Bj() {
        this.Gg = [];
        this.Hg = 0
    }
    function Cj(a, b) {
        D(b.displayObject(), "focus", a.bq, !1, a);
        D(b.displayObject(), "blur", a.aq, !1, a);
        a.Gg.push(b)
    }
    Bj.prototype.bq = function(a) {
        a = x(a.Oa);
        var b = Qa(a.currentTarget, Element);
        a: {
            var c = a.currentTarget;
            for (var d = 0; d < this.Gg.length; ++d)
                if (this.Gg[d].displayObject() == c) {
                    c = d;
                    break a
                }
            c = 0
        }
        this.Hg = c;
        "BUTTON" == a.currentTarget.tagName && J(b, "active")
    }
    ;
    Bj.prototype.aq = function(a) {
        a = x(a.Oa);
        var b = Qa(a.currentTarget, Element);
        "BUTTON" == a.currentTarget.tagName && K(b, "active")
    }
    ;
    function Dj(a) {
        U.call(this, "dialogContainerOverlay");
        this.Bl = new Bj;
        this.yn = !1;
        this.W = a;
        this.Uf = new H;
        this.wf = new H;
        var b = new U("dialogCenter");
        this.ub = new U(["dialog", "askPassword"]);
        var c = new U(["row", "text"]);
        c.U(a.ja("ED_ASK_PASSWORD_DIALOG_LABEL"));
        this.ub.c(c);
        c = new U(["row", "control"]);
        this.Ha = new U("passwordInput","INPUT");
        Cj(this.Bl, this.Ha);
        this.Ha.displayObject().type = "password";
        this.Ha.qg(a.ja("ED_ASK_PASSWORD_DIALOG_LABEL"));
        c.c(this.Ha);
        this.ub.c(c);
        this.md = new U(["row", "error", "hidden"]);
        this.md.U(a.ja("ED_ASK_PASSWORD_DIALOG_INVALID_PASSWORD_LABEL"));
        this.ub.c(this.md);
        this.sk(this.ub);
        b.c(this.ub);
        this.c(b);
        D(window, "keydown", this.yf, !0, this)
    }
    w(Dj, U);
    e = Dj.prototype;
    e.eg = function() {
        Vd(window, "keydown", this.yf, !0, this)
    }
    ;
    e.Dp = function(a) {
        this.yn = a
    }
    ;
    e.focus = function() {
        this.Ha.displayObject().focus()
    }
    ;
    e.aa = function(a) {
        if (this.yn) {
            var b = a.width() / z.zb
              , c = a.height() / z.bi;
            b = Math.min(b, c);
            1 > b ? (Kf(this.ub.displayObject(), "center center"),
            vg(this.ub.displayObject(), b),
            a.height() < this.ub.height() && T(this.ub, "margin-top", (a.height() - this.ub.height()) / 2 + "px"),
            a.width() < this.ub.width() && T(this.ub, "margin-left", (a.width() - this.ub.width()) / 2 + "px")) : (Kf(this.ub.displayObject(), ""),
            vg(this.ub.displayObject(), 1))
        }
    }
    ;
    e.Cp = function() {
        this.md.Im("");
        this.md.Im("alert");
        this.md.T("hidden")
    }
    ;
    e.sk = function(a) {
        var b = new U(["row", "control"])
          , c = new U(["submit"],"BUTTON");
        Cj(this.Bl, c);
        c.U(this.W.ja("ED_OK"));
        c.D.addHandler(this.Al, this);
        b.c(c);
        a.c(b)
    }
    ;
    e.yf = function(a) {
        a.stopPropagation();
        13 == a.keyCode ? (a = this.Ha.displayObject().value,
        0 < a.length && this.Uf.f(a)) : 9 == a.keyCode && (a.preventDefault(),
        a = this.Bl,
        ++a.Hg,
        a.Hg >= a.Gg.length && (a.Hg = 0),
        a.Gg[a.Hg].displayObject().focus())
    }
    ;
    e.Al = function() {
        var a = this.Ha.displayObject().value;
        0 < a.length && this.Uf.f(a)
    }
    ;
    function Ej(a) {
        R.call(this, {
            S: "mobile-password-dialog-view"
        });
        var b = this;
        this.W = a;
        this.Uf = M(this);
        this.wf = M(this);
        this.vb = new R({
            S: "ask-password-dialog-container"
        });
        var c = new R({
            J: S(this.vb, "header")
        });
        c.U(a.ja("ED_ASK_PASSWORD_DIALOG_LABEL"));
        this.vb.c(c);
        c = new R({
            J: S(this.vb, "password-container")
        });
        this.vb.c(c);
        this.Ha = new R({
            J: S(this.vb, "input"),
            $f: "INPUT"
        });
        this.Ha.setAttribute("type", "password");
        var d = new R({
            J: S(this.vb, "password-placeholder")
        });
        c.c(d);
        d.U(this.W.ja("ED_ASK_PASSWORD_DIALOG_PLACEHOLDER"));
        c.c(this.Ha);
        this.md = new R({
            J: S(this.vb, "error")
        });
        this.md.U(a.ja("ED_ASK_PASSWORD_DIALOG_INVALID_PASSWORD_LABEL"));
        this.vb.c(this.md);
        this.sk();
        this.c(this.vb);
        E(this, this.Ha.displayObject(), "input", this.Qk, this);
        E(this, this.Ha.displayObject(), "focus", this.Qk, this);
        E(this, this.Ha.displayObject(), "focusout", function() {
            b.Qk();
            b.wf.f()
        }, this);
        E(this, this.Ha.displayObject(), "keydown", this.yf, this);
        this.Z("mobile-app", mg);
        this.vb.va("margin-bottom", "50px")
    }
    m(Ej, R);
    e = Ej.prototype;
    e.focus = function() {
        this.Ha.focus()
    }
    ;
    e.aa = function() {
        this.Z("landscape", lh())
    }
    ;
    e.Dp = function() {}
    ;
    e.Cp = function() {
        this.vb.Z("incorrect-password", !0);
        this.vb.va("margin-bottom", 50 - this.md.height() + "px")
    }
    ;
    e.yf = function(a) {
        a.stopPropagation();
        13 == a.keyCode && (a = this.Ha.displayObject().value,
        0 < a.length && this.Uf.f(a))
    }
    ;
    e.sk = function() {
        var a = new R({
            J: S(this.vb, "submit"),
            $f: "BUTTON"
        });
        a.U(this.W.ja("ED_OK"));
        F(this, a.D, this.Al, this);
        this.vb.c(a)
    }
    ;
    e.Al = function() {
        var a = this.Ha.displayObject().value;
        0 < a.length && this.Uf.f(a)
    }
    ;
    e.Qk = function() {
        var a = !!this.Ha.displayObject().value.length || document.activeElement == this.Ha.displayObject();
        this.vb.Z("hide-placeholder", a)
    }
    ;
    function Z(a, b, c, d, f, g) {
        this.ea = new W(a.clientWidth,a.clientHeight);
        this.Gb = b;
        this.Ja = null;
        this.ua = [];
        this.R = this.j = null;
        this.kb = [];
        this.P = null;
        this.Ub = c;
        this.ba = new mi(this.a.fa.displayObject(),ag);
        this.Qc = new qh;
        this.h = d;
        this.oa = {
            dk: 0,
            Da: 1,
            Jj: !1
        };
        this.fb = f;
        this.Lo = new Aj;
        this.ge = new wj;
        this.Wa = new H;
        this.ee = new H;
        this.Ko = new H;
        this.wf = new H;
        this.Ti = {};
        document.title = b.title();
        g && Fj(this, g);
        this.fb.te.addHandler(this.Nl, this);
        N && gg && (D(document.body, "focusin", function() {
            var a = ld();
            !a || "INPUT" != a.nodeName && "TEXTAREA" != a.nodeName || J(document.body, "keyboard-showed")
        }, !1, this),
        D(document.body, "focusout", function() {
            K(document.body, "keyboard-showed")
        }, !1, this))
    }
    Z.prototype.pi = function() {
        return this.Ub
    }
    ;
    Z.prototype.viewMode = Z.prototype.pi;
    Z.prototype.Rj = function() {
        return this.Wa
    }
    ;
    Z.prototype.pageChangedEvent = Z.prototype.Rj;
    Z.prototype.Ip = function() {
        return this.ee
    }
    ;
    Z.prototype.stateChangedEvent = Z.prototype.Ip;
    Z.prototype.Qs = function() {
        return this.Ko
    }
    ;
    Z.prototype.startupCompletedEvent = Z.prototype.Qs;
    Z.prototype.Mj = function(a) {
        Gj(this, "loadFromUrl", [a])
    }
    ;
    Z.prototype.ym = function(a, b) {
        Gj(this, "loadBinary", [a, b])
    }
    ;
    Z.prototype.title = function() {
        return this.Gb.title()
    }
    ;
    Z.prototype.title = Z.prototype.title;
    Z.prototype.o = function() {
        x(this.R);
        return this.R.o()
    }
    ;
    Z.prototype.pagesCount = Z.prototype.o;
    Z.prototype.Ms = function(a) {
        this.oa.Da = a
    }
    ;
    Z.prototype.setPageNumber = Z.prototype.Ms;
    Z.prototype.Jm = function() {
        this.a.bd(!1);
        this.ge.Jm(!0)
    }
    ;
    Z.prototype.zs = function() {
        return this.Ti
    }
    ;
    Z.prototype.persistState = Z.prototype.zs;
    e = Z.prototype;
    e.Nl = function() {
        var a = (new qj).Gm(this.fb);
        a = {
            pageNumber: this.j.Da(),
            pi: this.Ub,
            cc: a
        };
        a = this.Lo.encode(a);
        Ub(a, this.Ti) || (this.Ti = a,
        this.ee.f())
    }
    ;
    e.kc = function(a) {
        this.Wa.f(a)
    }
    ;
    e.Ac = function(a, b) {
        this.ua[a] = new b(this.a.fa);
        this.ua[a].Hm(this.Gb.Td);
        this.ua[a].Zj(this.Gb.Ye());
        this.ua[a].ba = this.ba;
        this.ua[a].Wa.addHandler(this.Se, this)
    }
    ;
    e.Zd = function(a, b, c) {
        this.kb[a] = new b(this.a,c,this.ge);
        this.kb[a].Zj(this.Gb.Ye())
    }
    ;
    e.Wb = function(a) {
        this.j && this.j.disable();
        this.P && this.P.disable();
        this.j = this.ua[a];
        this.kb[a] && (this.P = this.kb[a]);
        this.Ub = a;
        this.Qc.bk(this.j)
    }
    ;
    function Fj(a, b) {
        b = a.Lo.decode(b);
        a.oa.Da = b.pageNumber;
        a.Ub = b.pi;
        (b = b.cc) && (new zj).load(b, a.fb)
    }
    function Gj(a, b, c) {
        var d = new sj;
        d.En.addHandler(a.rd, a);
        d.hl.addHandler(a.Iq, a);
        var f = "";
        a.Gb.vn || "" == a.Gb.ph || (f = a.Gb.ph);
        c.push(f);
        "loadFromUrl" == b ? d.Mj.apply(d, ca(c)) : d.ym.apply(d, ca(c))
    }
    e.Iq = function(a) {
        var b = this;
        Hj(this.a);
        this.a.Ej(!0);
        null == this.Ja ? (this.Ja = gg ? new Ej(this.Gb.Dd()) : new Dj(this.Gb.Dd()),
        this.h.Fm && this.Ja.Dp(!0),
        this.Ja.aa(this.ea),
        this.Ja.wf.addHandler(this.kn, this),
        this.Ja.Uf.addHandler(function(c) {
            a(c + b.Gb.ph)
        }, this),
        this.a.c(this.Ja.displayObject()),
        N || this.Ja.focus()) : this.Ja.Cp()
    }
    ;
    e.rd = function(a) {
        this.R = a;
        this.Ja && (this.a.Ej(!1),
        this.a.removeChild(this.Ja.displayObject()),
        de(this.Ja));
        this.ge.ra(a.o());
        gg && (K(window.document.body, "keyboard-showed"),
        this.kn())
    }
    ;
    function Ij(a) {
        a.a.Nm();
        Hj(a.a);
        a.oa.Jj = !0;
        a.Ko.f()
    }
    e.Se = function(a) {
        this.oa.Da = a;
        this.Nl()
    }
    ;
    e.kn = function() {
        this.wf.f()
    }
    ;
    var Jj = Vb();
    Jj.Fm = !1;
    function Kj(a, b) {
        $d.call(this);
        a = this.Qh = a;
        a = za(a) && 1 == a.nodeType ? this.Qh : this.Qh ? this.Qh.body : null;
        this.qs = !!a && "rtl" == Te(a);
        this.qp = D(this.Qh, hc ? "DOMMouseScroll" : "mousewheel", this, b)
    }
    w(Kj, $d);
    Kj.prototype.handleEvent = function(a) {
        var b = 0
          , c = 0
          , d = a.Oa;
        "mousewheel" == d.type ? (a = Lj(-d.wheelDelta),
        p(d.wheelDeltaX) ? (b = Lj(-d.wheelDeltaX),
        c = Lj(-d.wheelDeltaY)) : c = a) : (a = d.detail,
        100 < a ? a = 3 : -100 > a && (a = -3),
        p(d.axis) && d.axis === d.HORIZONTAL_AXIS ? b = a : c = a);
        t(this.rp) && (b = cb(b, -this.rp, this.rp));
        t(this.sp) && (c = cb(c, -this.sp, this.sp));
        this.qs && (b = -b);
        b = new Mj(a,d,b,c);
        this.dispatchEvent(b)
    }
    ;
    function Lj(a) {
        return ic && (jc || lc) && 0 != a % 40 ? a : a / 40
    }
    Kj.prototype.dc = function() {
        Kj.V.dc.call(this);
        Wd(this.qp);
        this.qp = null
    }
    ;
    function Mj(a, b, c, d) {
        Ad.call(this, b);
        this.type = "mousewheel";
        this.detail = a;
        this.deltaX = c;
        this.deltaY = d
    }
    w(Mj, Ad);
    function Nj(a) {
        R.call(this, {
            S: a.S,
            Jd: !0
        });
        this.Cq = 15;
        this.Ca = this.mc = this.sd = this.wb = 0;
        this.Aq = a.pc || 1;
        this.po = this.ql = 0;
        this.kr = 100;
        this.Xf = G(this, new R({
            J: S(this, "up")
        }));
        this.c(this.Xf);
        this.Ma = G(this, new R({
            S: "thumb"
        }));
        this.c(this.Ma);
        this.Ma.c(G(this, new R({
            J: S(this.Ma, "background")
        })));
        this.pf = G(this, new R({
            J: S(this, "down")
        }));
        this.c(this.pf);
        this.lj = this.Mf = null;
        this.ae = M(this);
        this.Dr = M(this);
        this.Nf = new yf(this.kr);
        E(this, this.Nf, "tick", this.Yq, this);
        E(this, this, ze, this.Vo, this, De);
        E(this, this.Xf, ze, this.br, this, De);
        E(this, this.Ma, ze, this.nl, this, De);
        E(this, this.pf, ze, this.Mq, this, De);
        E(this, document.body, Ae, this.Rq, this)
    }
    m(Nj, R);
    e = Nj.prototype;
    e.oe = function(a) {
        Oj(this, a)
    }
    ;
    e.pc = function() {
        return this.Aq
    }
    ;
    e.Ye = function() {
        return this.wb
    }
    ;
    e.scale = function() {
        return this.ih
    }
    ;
    e.G = function(a) {
        this.Lm(a)
    }
    ;
    e.rg = function(a, b, c, d) {
        d = void 0 === d ? 0 : d;
        x(b <= c);
        this.wb = a;
        this.sd = b;
        this.mc = c;
        this.ql = d;
        Pj(this);
        this.oe(this.Ca)
    }
    ;
    function Oj(a, b) {
        b = rj(b, a.sd, a.mc);
        a.Ca != b && (a.Ca = b,
        Qj(a),
        a.ae.f())
    }
    e.Vo = function() {}
    ;
    e.br = function(a) {
        a.preventDefault();
        a = -this.pc();
        Oj(this, this.Ca + a);
        Rj(this, this.Xf, -this.pc())
    }
    ;
    e.Mq = function(a) {
        a.preventDefault();
        a = this.pc();
        Oj(this, this.Ca + a);
        Rj(this, this.pf, this.pc())
    }
    ;
    function Rj(a, b, c) {
        a.Mf = b;
        E(a, a.Mf, "mouseover", a.Xn, a);
        E(a, a.Mf, "mouseout", a.Wn, a);
        E(a, document, Ae, a.qo, a);
        a.Nf.stop();
        a.lj = function() {
            Oj(this, this.Ca + this.po)
        }
        ;
        a.po = c;
        a.Nf.start()
    }
    e.qo = function() {
        x(this.Mf);
        ge(this, this.Mf, "mouseover", this.Xn, this);
        ge(this, this.Mf, "mouseout", this.Wn, this);
        ge(this, document, Ae, this.qo, this);
        this.Nf.stop();
        this.lj = null
    }
    ;
    e.Xn = function() {
        this.Nf.start()
    }
    ;
    e.Wn = function() {
        this.Nf.stop()
    }
    ;
    e.Yq = function() {
        this.lj && this.lj()
    }
    ;
    e.nl = function(a) {
        this.Dr.f();
        a.preventDefault();
        E(this, document.body, Be, this.aj, this);
        this.Ol(!0)
    }
    ;
    e.Ol = function(a) {
        this.Ma.Z("active", a)
    }
    ;
    e.Rq = function() {
        ge(this, document.body, Be, this.aj, this);
        this.Ol(!1)
    }
    ;
    e.aj = function() {}
    ;
    e.ia = function() {
        Pj(this)
    }
    ;
    function Sj(a) {
        Nj.call(this, a);
        this.Kn = 0
    }
    m(Sj, Nj);
    function Pj(a) {
        var b = a.height() - a.Xf.height() - a.pf.height();
        b = 0 == a.mc - a.sd ? b : Math.max(a.Cq, Math.ceil(b * (a.Ye() / (a.mc - a.sd + a.Ye()))));
        a.Ma.qa(b);
        Qj(a)
    }
    function Qj(a) {
        var b = Tj(a);
        0 == a.mc - a.sd ? a.Ma.Jc(b.top) : a.Ma.Jc(b.top + Math.round((a.Ca - a.sd) / (a.mc - a.sd) * b.height));
        a.Xf.Pa(!!a.Ca);
        a.pf.Pa(a.Ca != a.mc)
    }
    function Tj(a) {
        var b = new rd(0,0,0,0);
        b.top = a.Xf.height();
        b.height = a.height() - a.pf.height() - a.Ma.height() - b.top;
        b.left = a.Ma.x();
        return b
    }
    Sj.prototype.Vo = function(a) {
        var b;
        if (b = !a.defaultPrevented)
            b = this.Ma.displayObject().getBoundingClientRect(),
            b = !(a.clientY >= b.top && a.clientY <= b.top + b.height);
        if (b) {
            b = this.displayObject().getBoundingClientRect();
            var c = Tj(this);
            a = (a.clientY - (b.top - c.top)) / this.ih;
            b = 0 == this.ql ? this.Ye() : this.ql;
            a = a <= this.Ma.y() ? -b : b;
            this.oe(this.Ca + a)
        }
    }
    ;
    Sj.prototype.nl = function(a) {
        Nj.prototype.nl.call(this, a);
        var b = this.Ma.displayObject().getBoundingClientRect();
        this.Kn = a.clientY - Math.round(b.top);
        this.aj(a)
    }
    ;
    Sj.prototype.aj = function(a) {
        var b = this.displayObject().getBoundingClientRect()
          , c = Tj(this);
        Oj(this, (a.clientY - b.top - c.top * this.ih - this.Kn) / (c.height * this.ih) * (this.mc - this.sd) + this.sd)
    }
    ;
    var Uj = new yd;
    function Vj(a) {
        var b = a.Tj
          , c = a.os
          , d = void 0 === a.Wj ? null : a.Wj;
        Sj.call(this, {
            S: a.S,
            pc: a.pc
        });
        var f = this;
        this.Jf = b;
        this.fl = this.Qo = !1;
        this.oq = c;
        this.rh = d;
        b.va("overflow", "hidden");
        F(this, this.ae, function() {
            b.displayObject().scrollTop = f.Ca
        });
        E(this, b, "scroll", function() {
            f.oe(b.displayObject().scrollTop)
        }, this);
        this.rh ? Wj(this, this.rh) : (Wj(this, this.Jf),
        Wj(this, this));
        c ? (this.dd(0),
        this.rh ? (E(this, this.rh, "mouseenter", this.ml, this),
        E(this, this.rh, "mouseleave", this.ll, this)) : (E(this, this.Jf, "mouseover", this.ml, this),
        E(this, this, "mouseover", this.ml, this),
        E(this, this.Jf, "mouseout", this.ll, this),
        E(this, this, "mouseout", this.ll, this))) : this.dd(1)
    }
    m(Vj, Sj);
    e = Vj.prototype;
    e.rg = function(a, b, c, d) {
        d = void 0 === d ? 0 : d;
        this.Ep(0 < c);
        Sj.prototype.rg.call(this, a, b, c, d)
    }
    ;
    e.Kj = function() {
        this.oe(this.Jf.displayObject().scrollTop)
    }
    ;
    e.Ol = function(a) {
        this.Qo = a;
        Xj(this)
    }
    ;
    e.ml = function(a) {
        a && (this.contains(a.relatedTarget) || this.Jf.contains(a.relatedTarget)) || (this.fl = !0,
        Xj(this))
    }
    ;
    e.ll = function(a) {
        a && (null == a.relatedTarget || this.contains(a.relatedTarget) || this.Jf.contains(a.relatedTarget)) || (this.fl = !1,
        Xj(this))
    }
    ;
    function Xj(a) {
        a.oq && a.dd(a.Qo || a.fl ? .5 : 0)
    }
    function Wj(a, b) {
        b = new Kj(b.displayObject(),{
            passive: !0
        });
        E(a, b, Uj, function(b) {
            !xf(b.Oa) && b.deltaY && (b = 0 < b.deltaY ? a.pc() : -a.pc(),
            a.oe(a.Ca + b))
        }, a)
    }
    ;function Yj(a) {
        R.call(this, {
            S: a
        });
        a = new R({
            J: S(this, "thumb")
        });
        Hg(this, a)
    }
    m(Yj, R);
    function Zj(a, b) {
        this.od = a;
        this.ae = b
    }
    Zj.prototype.scrollY = function() {
        var a = this.od.getComputedPosition().y;
        return isNaN(a) ? 0 : -a
    }
    ;
    Zj.prototype.Qj = function() {
        return this.ae
    }
    ;
    Zj.prototype.ak = function(a) {
        this.scrollY() != a && this.od.scrollTo(0, -a)
    }
    ;
    function ak(a) {
        L.call(this);
        var b = this;
        this.g = a;
        this.eh = M(this);
        E(this, a, "scroll", function() {
            b.eh.f()
        })
    }
    m(ak, L);
    ak.prototype.scrollY = function() {
        return this.g.scrollTop
    }
    ;
    ak.prototype.Qj = function() {
        return this.eh
    }
    ;
    ak.prototype.ak = function(a) {
        this.g.scrollTop = a
    }
    ;
    function bk(a) {
        var b = void 0 === a.S ? "vertical-scrollbar" : a.S
          , c = void 0 === a.ts ? "mobile-vertical-scrollbar" : a.ts
          , d = a.Tj
          , f = a.sv
          , g = a.bv
          , h = void 0 === a.Wj ? null : a.Wj
          , k = void 0 === a.pc ? 20 : a.pc;
        a = void 0 === a.preventDefault ? !0 : a.preventDefault;
        L.call(this);
        this.ta = this.od = null;
        this.Uo = f || null;
        this.$m = g || null;
        this.mc = 0;
        if (N) {
            var u = M(this);
            b = {
                fadeScrollbars: !0,
                scrollX: !1,
                scrollY: !0,
                bounce: !1,
                deceleration: .006,
                useTransition: !1,
                preventDefault: a,
                disablePointer: !0,
                disableTouch: !1,
                disableMouse: !1,
                onScrollHandler: function() {
                    u.f()
                }
            };
            c = new Yj(c);
            b.indicators = {
                el: c.displayObject(),
                shrink: "scale"
            };
            this.od = new IScroll(d.displayObject(),b);
            this.O = new Zj(this.od,u)
        } else
            this.ta = G(this, new Vj({
                S: b,
                pc: k,
                Tj: d,
                os: !0,
                Wj: h
            })),
            this.O = new ak(d.displayObject(),this.ta),
            c = this.ta;
        F(this, this.O.Qj(), this.ko, this);
        this.xo = x(c)
    }
    m(bk, L);
    e = bk.prototype;
    e.Ic = function() {
        return this.O
    }
    ;
    e.rg = function(a, b) {
        this.mc = Math.max(0, b - a);
        this.od ? this.od.setScrollHeight(b) : this.ta && this.ta.rg(a, 0, Math.max(this.mc, 0));
        this.ko()
    }
    ;
    e.Lm = function(a) {
        this.ta && this.ta.Lm(a)
    }
    ;
    e.Kj = function() {
        this.ta && this.ta.Kj()
    }
    ;
    e.ko = function() {
        if (this.Uo) {
            var a = Math.min(this.Ic().scrollY(), 60);
            this.Uo.style.height = We(a)
        }
        this.$m && (a = this.mc - this.Ic().scrollY(),
        this.$m.style.height = We(Math.min(a, 60)))
    }
    ;
    e.lf = function() {
        L.prototype.lf.call(this);
        this.od && this.od.destroy()
    }
    ;
    function ck(a) {
        L.call(this);
        var b = this;
        this.g = a;
        this.eh = M(this);
        E(this, this.g, "scroll", function() {
            b.eh.f()
        })
    }
    m(ck, L);
    ck.prototype.scrollY = function() {
        return this.g.scrollTop
    }
    ;
    ck.prototype.Qj = function() {
        return this.eh
    }
    ;
    ck.prototype.ak = function(a) {
        this.g.scrollTop = a
    }
    ;
    function dk(a) {
        var b = a.vp
          , c = a.dv;
        R.call(this, {
            S: a.S,
            Jd: a.Jd,
            tabIndex: -1
        });
        this.Ih = new Map;
        this.gn = c || this;
        this.Nd = new R;
        Hg(this.gn, this.Nd);
        this.Id(new ck(this.gn.displayObject()));
        this.hb = b;
        F(this, this.hb.te, this.Xq, this)
    }
    m(dk, R);
    dk.prototype.Ic = function() {
        return this.O
    }
    ;
    dk.prototype.Id = function(a) {
        var b = this;
        this.oh(this.O);
        this.O = a;
        G(this, this.O);
        F(this, this.O.Qj(), function() {
            document.body.contains(b.displayObject()) && b.hb.oe(b.O.scrollY())
        })
    }
    ;
    dk.prototype.ia = function() {
        var a = this.displayObject();
        var b = dd(a)
          , c = B && a.currentStyle;
        if (c && "CSS1Compat" == (b ? new md(dd(b)) : Ja || (Ja = new md)).fg.compatMode && "auto" != c.width && "auto" != c.height && !c.boxSizing)
            b = Ye(a, c.width, "width", "pixelWidth"),
            a = Ye(a, c.height, "height", "pixelHeight"),
            a = new Wc(b,a);
        else {
            c = Xe(a);
            if (B) {
                b = Ze(a, "paddingLeft");
                var d = Ze(a, "paddingRight")
                  , f = Ze(a, "paddingTop")
                  , g = Ze(a, "paddingBottom");
                b = new qd(f,d,g,b)
            } else
                b = Se(a, "paddingLeft"),
                d = Se(a, "paddingRight"),
                f = Se(a, "paddingTop"),
                g = Se(a, "paddingBottom"),
                b = new qd(parseFloat(f),parseFloat(d),parseFloat(g),parseFloat(b));
            !B || 9 <= Number(xc) ? (d = Se(a, "borderLeftWidth"),
            f = Se(a, "borderRightWidth"),
            g = Se(a, "borderTopWidth"),
            a = Se(a, "borderBottomWidth"),
            a = new qd(parseFloat(g),parseFloat(f),parseFloat(a),parseFloat(d))) : (d = af(a, "borderLeft"),
            f = af(a, "borderRight"),
            g = af(a, "borderTop"),
            a = af(a, "borderBottom"),
            a = new qd(g,f,a,d));
            a = new Wc(c.width - a.left - b.left - b.right - a.right,c.height - a.top - b.top - b.bottom - a.bottom)
        }
        c = this.hb;
        c.Qe = isNaN(a.height) ? 0 : a.height;
        ek(c)
    }
    ;
    dk.prototype.Xq = function() {
        this.Z("with-scroll", this.hb.Ne > this.hb.Qe);
        this.Nd.qa(this.hb.Ne);
        this.O.ak(this.hb.Ca);
        this.Nd.va("padding-top", this.hb.Nk + "px");
        fk(this)
    }
    ;
    function fk(a) {
        var b = gk(a.hb);
        a.Ih.forEach(function(c, d) {
            0 > b.indexOf(d) && (a.Ih.delete(d),
            a.Nd.removeChild(c),
            a.oh(c))
        });
        for (var c = 0; c < b.length; ++c) {
            var d = b[c]
              , f = void 0;
            a.Ih.has(d) ? f = a.Ih.get(d) : (f = a.hn(d),
            G(a, f),
            a.Ih.set(d, f));
            a.Nd.xj(f, c);
            f.qa(a.hb.xf)
        }
        a.O.ak(a.hb.Ca)
    }
    ;function hk() {
        L.call(this);
        this.xf = this.Ne = this.Qe = this.Ca = 0;
        this.Si = [];
        this.zn = this.Li = this.Nk = 0;
        this.te = M(this)
    }
    m(hk, L);
    hk.prototype.invalidate = function() {
        this.pd()
    }
    ;
    function ik(a, b, c) {
        c && (a.xf = c);
        a.Si = b;
        a.Ne = a.xf * b.length;
        a.pd()
    }
    function gk(a) {
        return a.Si.slice(a.Li, a.Li + a.zn)
    }
    hk.prototype.oe = function(a) {
        p(this.Qe) && this.Ca != a && (this.Ca = a,
        ek(this))
    }
    ;
    function ek(a) {
        a.Ca = rj(a.Ca, 0, Math.max(a.Ne - a.Qe, 0));
        a.pd()
    }
    hk.prototype.pd = function() {
        this.Li = Math.floor(Math.max(0, this.Ca - (N ? this.Qe : 0)) / this.xf);
        this.Nk = this.xf * this.Li;
        this.zn = Math.ceil((Math.min(this.Ne, this.Ca + this.Qe + (N ? this.Qe : 0)) - this.Nk) / this.xf);
        this.te.f()
    }
    ;
    function jk(a, b) {
        R.call(this, b);
        this.uq = a
    }
    m(jk, R);
    jk.prototype.item = function() {
        return this.uq
    }
    ;
    function kk(a) {
        var b = a.ss
          , c = a.ps
          , d = a.days
          , f = a.us
          , g = a.Zs
          , h = a.Xr;
        this.jr = a.Gs;
        this.Dq = b;
        this.pq = c;
        this.eq = d;
        this.Eq = f;
        this.Pr = g;
        this.Tp = h
    }
    function lk(a, b, c) {
        var d = b - c;
        if (6E4 > d)
            return a.jr;
        var f = mk(b, c);
        if (1 == mk(b, c))
            return a.Pr;
        if (36E5 > d)
            b = Math.floor(d / 6E4) + " " + a.Dq;
        else if (864E5 > d)
            b = Math.floor(d / 36E5) + " " + a.pq;
        else if (7 > f)
            b = f + " " + a.eq;
        else
            return b = new Date(c),
            b.getDate() + " " + a.Eq[b.getMonth()] + " " + b.getFullYear();
        return b + " " + a.Tp
    }
    function mk(a, b) {
        a = new Date(a);
        b = new Date(b);
        return Math.floor((new Date(a.getFullYear(),a.getMonth(),a.getDate()) - new Date(b.getFullYear(),b.getMonth(),b.getDate())) / 864E5)
    }
    ;function nk(a, b) {
        jk.call(this, a, {
            S: "bookmarks-item-view"
        });
        this.Hl = b;
        this.lb = new R({
            J: S(this, "title")
        });
        this.c(this.lb);
        this.lb.U(a.title());
        this.xa = new R({
            J: S(this, "page-number")
        });
        this.c(this.xa);
        this.xa.U(a.pageNumber().toString());
        this.Ro = new R({
            J: S(this, "time-passed")
        });
        this.c(this.Ro);
        this.Ro.U(lk(this.Hl, Date.now(), a.creationTime()))
    }
    m(nk, jk);
    function ok(a, b) {
        var c = new hk;
        dk.call(this, {
            S: "bookmarks-list-view",
            vp: c
        });
        G(this, c);
        this.W = a;
        this.Hl = new kk({
            Gs: this.W.ja("PB_RECENTLY_ADDED"),
            ss: this.W.ja("PB_MINUTES_LABEL"),
            ps: this.W.ja("PB_HOURS_LABEL"),
            days: this.W.ja("PB_DAYS_LABEL"),
            us: this.W.ja("PB_MONTH_LABELS").split("|"),
            Zs: this.W.ja("PB_YESTERDAY_LABEL"),
            Xr: this.W.ja("PB_AGO_LABEL")
        });
        this.fb = b;
        this.ta = new bk({
            Tj: this
        });
        G(this, this.ta);
        this.c(this.ta.xo);
        this.ac = M(this);
        (a = this.ta.Ic()) && this.Id(a);
        ik(this.hb, this.fb.cc(), 70)
    }
    m(ok, dk);
    ok.prototype.hn = function(a) {
        var b = this
          , c = new nk(a,this.Hl);
        F(this, c.D, function() {
            return b.ac.f(a.pageNumber())
        }, this);
        return c
    }
    ;
    ok.prototype.ia = function(a, b) {
        dk.prototype.ia.call(this, a, b);
        a && b && this.Rk(b)
    }
    ;
    ok.prototype.Rk = function(a) {
        this.ta && (this.ta.rg(a, this.hb.Ne),
        this.ta.Kj())
    }
    ;
    function pk(a, b) {
        R.call(this, {
            S: "bookmarks-view"
        });
        this.W = a;
        a = new R({
            S: "add-bookmark-container"
        });
        Jg(a, S(this, "add-bookmarks"));
        var c = new R({
            J: S(a, "header")
        });
        c.U(this.W.ja("PB_ADD_BOOKMARK_HEADER"));
        a.c(c);
        c = new R({
            J: S(a, "text")
        });
        c.U(this.W.ja("PB_ADD_BOOKMARK_TEXT"));
        a.c(c);
        this.jk = a;
        this.c(this.jk);
        this.zc = new ok(this.W,b);
        Jg(this.zc, S(this, "bookmarks-list"));
        Hg(this, this.zc);
        this.ac = M(this, this.zc.ac);
        this.Z("without-bookmarks", !b.cc().length)
    }
    m(pk, R);
    pk.prototype.invalidate = function(a) {
        Kg(this);
        a = (this.height() - a - this.jk.height()) / 2;
        this.jk.Jc(a)
    }
    ;
    pk.prototype.ia = function(a, b) {
        R.prototype.ia.call(this, a, b);
        Kg(this.zc)
    }
    ;
    pk.prototype.Vj = function() {}
    ;
    var qk = {}
      , rk = (qk.outline = "PB_OUTLINE_TAB",
    qk.bookmarks = "PB_BOOKMARKS_TAB",
    qk);
    function sk(a) {
        R.call(this, {
            S: "popup-tabs"
        });
        this.W = a;
        this.Oo = M(this);
        this.yi = "outline";
        this.Po = new Map;
        tk(this)
    }
    m(sk, R);
    function tk(a) {
        ["outline", "bookmarks"].forEach(function(b) {
            var c = new R({
                J: S(a, "tab"),
                zp: !0
            });
            Hg(a, c);
            F(a, c.D, function() {
                return uk(a, b)
            }, a);
            c.U(a.W.ja(rk[b]));
            a.Po.set(b, c);
            c.ii(b == a.yi)
        })
    }
    function uk(a, b) {
        a.yi != b && (a.yi = b,
        a.Po.forEach(function(a, d) {
            a.ii(d == b)
        }),
        a.Oo.f())
    }
    ;function vk(a, b, c) {
        var d = b.find(function(c, d) {
            if (d == b.length - 1)
                return !0;
            var f = c.pageNumber() <= a && b[d + 1].pageNumber() > a;
            return d ? f : c.pageNumber() >= a || f
        })
          , f = d.items();
        return c ? d.pageNumber() > a ? null : d : f && f.length ? vk(a, f, !0) || d : d
    }
    ;function wk(a) {
        var b = a.xs
          , c = a.vm
          , d = a.selected;
        this.Yk = a.label;
        this.xa = b;
        this.tq = c;
        this.tr = d
    }
    wk.prototype.label = function() {
        return this.Yk
    }
    ;
    wk.prototype.pageNumber = function() {
        return this.xa
    }
    ;
    wk.prototype.vm = function() {
        return this.tq
    }
    ;
    wk.prototype.selected = function() {
        return this.tr
    }
    ;
    function xk(a) {
        var b = void 0 === a.Ys ? !0 : a.Ys;
        R.call(this, {
            J: a.J,
            S: a.S,
            Jd: void 0 === a.Jd ? !0 : a.Jd
        });
        this.Nr = b;
        this.Ok = this.Fh = !1;
        this.Gr = M(this)
    }
    m(xk, R);
    xk.prototype.ia = function(a, b) {
        R.prototype.ia.call(this, a, b);
        this.Ok = !0;
        a = this.Fh;
        var c = Ig(this, "label");
        yk(this, c, fc || B ? b + 1 : b);
        this.Ok = !1;
        a != this.Fh && (this.Nr && this.setAttribute("title", this.Fh ? c : ""),
        this.Gr.f())
    }
    ;
    function yk(a, b, c) {
        function d() {
            k = h < b.length ? b.substr(0, h) + "\u2026" : b;
            f.U(k)
        }
        a.Fh = !1;
        var f = a;
        f.U(b);
        if (p(c) && a.displayObject().parentNode) {
            f.displayObject().style.height = "";
            var g = f.displayObject().scrollHeight;
            g = B ? --g : g;
            if (!(c >= g)) {
                var h = Math.floor(c / f.displayObject().scrollHeight * b.length)
                  , k = "";
                for (d(); f.displayObject().scrollHeight <= c; )
                    h += 10,
                    d();
                for (; 0 < h && f.displayObject().scrollHeight > c; )
                    d(),
                    --h;
                d();
                a.Fh = !0
            }
        }
    }
    xk.prototype.U = function(a) {
        R.prototype.U.call(this, a);
        this.Ok || (this.qg(a),
        Kg(this))
    }
    ;
    xk.prototype.ei = function() {
        throw Error("html text is not supported");
    }
    ;
    function zk(a) {
        jk.call(this, a, {
            S: "outline-item-view",
            zp: !0
        });
        this.lb = new xk({
            J: S(this, "title")
        });
        this.c(this.lb);
        this.lb.U(a.label());
        this.xa = new R({
            J: S(this, "page-number")
        });
        this.c(this.xa);
        this.xa.U(a.pageNumber().toString());
        this.Z("subitem", a.vm());
        this.ii(a.selected())
    }
    m(zk, jk);
    zk.prototype.ia = function(a, b) {
        jk.prototype.ia.call(this, a, b);
        a && b && (a = (b - 1 - this.lb.height()) / 2,
        this.lb.Jc(a))
    }
    ;
    function Ak() {
        var a = new hk;
        dk.call(this, {
            S: "outline-list-view",
            vp: a
        });
        G(this, a);
        this.ta = new bk({
            Tj: this
        });
        G(this, this.ta);
        this.c(this.ta.xo);
        this.wn = !1;
        this.ol = [];
        this.ac = M(this);
        a = this.ta.Ic();
        this.Id(a)
    }
    m(Ak, dk);
    function Bk(a, b, c) {
        a.wn = b.some(function(a) {
            return (a = a.items()) && !!a.length
        });
        c = x(vk(c, b, !1));
        a.ol = Ck(a, b, !1, c);
        ik(a.hb, a.ol, 60)
    }
    Ak.prototype.Vj = function() {
        var a = this.ol.findIndex(function(a) {
            return a.selected()
        });
        this.hb.oe(60 * (a - 2))
    }
    ;
    function Ck(a, b, c, d) {
        var f = [];
        b = l(b);
        for (var g = b.next(); !g.done; g = b.next())
            g = g.value,
            f.push(new wk({
                label: g.label(),
                xs: g.pageNumber(),
                vm: c,
                selected: g == d
            })),
            (g = g.items()) && !c && f.push.apply(f, ca(Ck(a, g, !0, d)));
        return f
    }
    Ak.prototype.hn = function(a) {
        var b = this
          , c = new zk(a);
        c.Z("has-subitems", this.wn);
        F(this, c.D, function() {
            return b.ac.f(a.pageNumber())
        }, this);
        return c
    }
    ;
    Ak.prototype.ia = function(a, b) {
        dk.prototype.ia.call(this, a, b);
        a && b && this.Rk(b)
    }
    ;
    Ak.prototype.Rk = function(a) {
        this.ta && (this.ta.rg(a, this.hb.Ne),
        this.ta.Kj())
    }
    ;
    function Dk(a, b, c) {
        R.call(this, {
            S: "outline-view"
        });
        this.W = a;
        this.Zi = new R({
            J: S(this, "no-outline-label")
        });
        this.c(this.Zi);
        this.Zi.U(this.W.ja("PB_NO_OUTLINE"));
        this.zc = new Ak;
        Jg(this.zc, S(this, "outline-list"));
        this.c(this.zc);
        this.ac = M(this, this.zc.ac);
        b && Bk(this.zc, b, c);
        this.Z("without-outline", !b)
    }
    m(Dk, R);
    Dk.prototype.invalidate = function(a) {
        Kg(this);
        a = (this.height() - a - this.Zi.height()) / 2;
        this.Zi.Jc(a)
    }
    ;
    Dk.prototype.Vj = function() {
        this.zc.Vj()
    }
    ;
    Dk.prototype.ia = function(a, b) {
        R.prototype.ia.call(this, a, b);
        Kg(this.zc)
    }
    ;
    function Ek(a, b) {
        R.call(this, {
            S: "popup-panel"
        });
        var c = this;
        this.W = a;
        this.fb = b;
        this.C = 0;
        this.Sc = new R({
            S: "popup-menu"
        });
        Jg(this.Sc, S(this, "popup-menu"));
        Hg(this, this.Sc);
        this.To = new R({
            J: S(this.Sc, "title")
        });
        this.Sc.c(this.To);
        this.lh = new sk(a);
        Hg(this.Sc, this.lh);
        F(this, this.lh.Oo, this.il, this);
        this.en = new R({
            J: S(this.Sc, "close-button")
        });
        Hg(this.Sc, this.en);
        F(this, this.en.D, function() {
            return c.fn.f()
        }, this);
        this.rk = new R({
            J: S(this, "content-view")
        });
        this.c(this.rk);
        this.gh = this.ld = null;
        this.fn = M(this);
        this.ac = M(this);
        this.il()
    }
    m(Ek, R);
    e = Ek.prototype;
    e.fi = function(a) {
        this.gh = a
    }
    ;
    e.u = function(a) {
        this.C = a
    }
    ;
    e.hi = function(a) {
        this.To.U(a || "")
    }
    ;
    e.ia = function(a, b) {
        R.prototype.ia.call(this, a, b);
        this.Z("landscape", lh());
        this.lh.Z("landscape", lh());
        this.Sc.Z("landscape", lh());
        this.ld.invalidate(this.Sc.height())
    }
    ;
    e.il = function() {
        var a = this.lh.yi;
        this.ld && (this.rk.removeChild(this.ld),
        this.oh(this.ld));
        switch (a) {
        case "outline":
            a = new Dk(this.W,this.gh,this.C);
            G(this, a);
            F(this, a.ac, this.Zn, this);
            this.ld = a;
            break;
        case "bookmarks":
            a = new pk(this.W,this.fb);
            G(this, a);
            F(this, a.ac, this.Zn, this);
            this.ld = a;
            break;
        default:
            throw Error("unknown tab type");
        }
        this.rk.c(this.ld);
        this.ld.invalidate(this.Sc.height());
        this.ld.Vj()
    }
    ;
    e.Zn = function(a) {
        this.ac.f(a)
    }
    ;
    function Fk(a) {
        R.call(this, {
            S: a
        });
        this.B = new R({
            J: S(this, "current-page"),
            $f: "SPAN"
        });
        this.c(this.B);
        this.B.U("0");
        a = new R({
            J: S(this, "separator"),
            $f: "SPAN"
        });
        this.c(a);
        a.ei("&nbsp/&nbsp");
        this.X = new R({
            J: S(this, "pages-count"),
            $f: "SPAN"
        });
        this.c(this.X);
        this.X.U("0")
    }
    m(Fk, R);
    Fk.prototype.u = function(a) {
        this.B.U(a.toString())
    }
    ;
    Fk.prototype.ra = function(a) {
        this.X.U(a.toString())
    }
    ;
    function Gk() {
        R.call(this, {
            S: "seek-bar"
        });
        this.gf = new R({
            J: S(this, "background")
        });
        this.c(this.gf);
        this.ho = new R({
            J: S(this, "progress")
        });
        this.gf.c(this.ho);
        this.Ma = new R({
            J: S(this, "thumb")
        });
        this.gf.c(this.Ma);
        this.X = this.Tb = 0;
        this.yo = M(this);
        this.Jo = M(this);
        this.on = M(this);
        E(this, this.displayObject(), ze, this.$q, this, Ce)
    }
    m(Gk, R);
    e = Gk.prototype;
    e.Da = function() {
        return Math.min(Math.ceil(this.Tb * (this.X - 1)) + 1, this.X)
    }
    ;
    e.ra = function(a) {
        this.X = a
    }
    ;
    e.u = function(a) {
        this.Tb = 1 == this.X ? 1 : (a - 1) / (this.X - 1);
        this.pd()
    }
    ;
    e.ia = function(a, b) {
        R.prototype.ia.call(this, a, b);
        this.pd();
        this.Z("landscape", lh())
    }
    ;
    e.$q = function(a) {
        this.enabled() && (E(this, document, Be, this.Qn, this),
        E(this, document, Ae, this.Rn, this),
        this.Tb = Hk(this, a),
        this.pd(),
        this.Ma.Z("dragged", !0),
        this.Jo.f(),
        a.preventDefault())
    }
    ;
    e.Qn = function(a) {
        this.Tb = Hk(this, a);
        this.pd();
        this.yo.f();
        a.preventDefault()
    }
    ;
    e.Rn = function(a) {
        ge(this, document, Be, this.Qn, this);
        ge(this, document, Ae, this.Rn, this);
        this.Tb = Hk(this, a);
        this.pd();
        this.Ma.Z("dragged", !1);
        this.on.f();
        a.preventDefault()
    }
    ;
    function Hk(a, b) {
        var c = a.gf.g.getBoundingClientRect();
        a = a.gf.displayObject();
        b = Ve(b);
        a = Ve(a);
        return cb((new C(b.x - a.x,b.y - a.y)).x / c.width, 0, 1)
    }
    e.pd = function() {
        var a = this.gf.width();
        this.Ma.va("transform", "translateX(" + this.Tb * a + "px)");
        this.ho.$(this.Tb * a)
    }
    ;
    function Ik(a) {
        R.call(this, {
            S: "bottom-toolbar"
        });
        this.Fe = a;
        this.Ce = new Fk("pages-count");
        Jg(this.Ce, S(this, "pages-count"));
        this.c(this.Ce);
        this.xd = new Gk;
        Hg(this, this.xd);
        F(this, this.xd.Jo, this.Yn, this);
        F(this, this.xd.yo, this.Yn, this);
        F(this, this.xd.on, this.Zq, this);
        this.X = 0;
        this.Uc = M(this)
    }
    m(Ik, R);
    e = Ik.prototype;
    e.Ab = function() {
        return this.Uc
    }
    ;
    e.Da = function() {
        return this.xd.Da()
    }
    ;
    e.u = function(a) {
        this.Ce.u(a);
        this.xd.u(a)
    }
    ;
    e.ra = function(a) {
        this.X = a;
        this.Ce.ra(a);
        this.xd.ra(a)
    }
    ;
    e.Yn = function() {
        var a = this.Fe
          , b = this.xd.Da()
          , c = this.X;
        Jk(a);
        var d = !a.Kb;
        a.Kb || (a.Kb = new Fk("pages-count-popup"),
        a.Wf.appendChild(a.Kb.displayObject()));
        a.Kb.u(b);
        a.Kb.ra(c);
        b = (a.a.width() - a.Kb.width()) / 2;
        c = a.a.height() - a.a.cb() - 58;
        a.Kb.va("transform", "translate(" + b + "px, " + c + "px)");
        d && (a.Kb.dd(0),
        (new Kk(a.Kb,150,!1)).play())
    }
    ;
    e.Zq = function() {
        Lk(this.Fe);
        this.Uc.f()
    }
    ;
    e.ia = function(a, b) {
        R.prototype.ia.call(this, a, b);
        Kg(this.xd)
    }
    ;
    function Kk(a, b, c) {
        X.call(this, [0], [1], b);
        this.Pd = a;
        this.sq = c
    }
    m(Kk, X);
    Kk.prototype.mb = function(a) {
        a = Ci(a[0]);
        this.sq ? this.Pd.dd(1 - a) : this.Pd.dd(a)
    }
    ;
    function Mk(a, b, c, d) {
        X.call(this, [0], [1], c, d);
        this.na = a;
        this.vd = b
    }
    m(Mk, X);
    Mk.prototype.mb = function(a) {
        a = Di(a[0]);
        this.na.va("transform", "translateY(" + this.na.height() * a + "px)");
        this.vd.dd(1 - a)
    }
    ;
    Mk.prototype.wd = function() {
        this.na.va("transform", "")
    }
    ;
    function Nk(a, b, c, d) {
        X.call(this, [0], [1], c, d);
        this.na = a;
        this.vd = b
    }
    m(Nk, X);
    Nk.prototype.play = function() {
        this.na.va("top", "");
        return X.prototype.play.call(this)
    }
    ;
    Nk.prototype.mb = function(a) {
        a = Di(a[0]);
        this.na.va("transform", "translateY(" + this.na.height() * (1 - a) + "px)");
        this.vd.dd(a)
    }
    ;
    Nk.prototype.wd = function() {
        this.na.va("transform", "")
    }
    ;
    function Ok(a) {
        var b = a.Us
          , c = a.view;
        a = a.Bs;
        L.call(this);
        this.Wf = b;
        this.a = c;
        this.vd = new R({
            S: "popup-layer"
        });
        this.na = a;
        this.vd.c(this.na);
        F(this, this.na.fn, this.mp, this);
        F(this, this.na.ac, this.mp, this);
        this.Ni = this.Mi = this.Kb = null
    }
    m(Ok, L);
    function Lk(a) {
        Jk(a);
        a.Ni = setTimeout(function() {
            if (a.Kb) {
                var b = new Kk(a.Kb,250,!0);
                a.Mi = F(a, b.la, function() {
                    Jk(a);
                    a.Wf.removeChild(a.Kb.displayObject());
                    a.Kb = null;
                    a.Ni = null
                });
                b.play()
            }
        }, 500)
    }
    Ok.prototype.mp = function() {
        var a = this
          , b = new Mk(this.na,this.vd,350,Gi);
        ie(this, b.la, function() {
            a.Wf.removeChild(a.vd.displayObject());
            a.Wf.removeChild(a.na.displayObject())
        }, this);
        b.play()
    }
    ;
    function Jk(a) {
        null != a.Mi && (ee(a, a.Mi),
        a.Mi = null);
        a.Ni && clearTimeout(a.Ni)
    }
    ;function Pk(a) {
        var b = a.rv
          , c = a.toggle;
        R.call(this, {
            J: a.J,
            S: a.S,
            jp: a.jp,
            wp: a.wp,
            cp: a.cp,
            tabIndex: a.tabIndex,
            $f: "BUTTON",
            Wr: !0,
            Jd: a.Jd
        });
        if (b) {
            a = b.top;
            var d = b.right
              , f = b.bottom;
            b = b.left;
            this.Wc = new R;
            Hg(this, this.Wc);
            this.Wc.va("position", "absolute");
            this.Wc.va("top", a ? -a + "px" : 0);
            this.Wc.va("right", d ? -d + "px" : 0);
            this.Wc.va("bottom", f ? -f + "px" : 0);
            this.Wc.va("left", b ? -b + "px" : 0)
        }
        (this.Il = c) && Qk(this, !1);
        this.Vm()
    }
    m(Pk, R);
    function Qk(a, b) {
        x(a.Il);
        a.$e("pressed", b)
    }
    e = Pk.prototype;
    e.selected = function() {
        return !1
    }
    ;
    e.ii = function() {}
    ;
    e.pressed = function() {
        x(this.Il);
        return "true" == Ig(this, "pressed")
    }
    ;
    e.U = function(a) {
        R.prototype.U.call(this, a);
        this.Wc && this.xj(this.Wc, 0)
    }
    ;
    e.ei = function(a) {
        R.prototype.ei.call(this, a);
        this.Wc && this.xj(this.Wc, 0)
    }
    ;
    function Rk(a, b) {
        var c = b.cc().findIndex(function(b) {
            return b.pageNumber() == a
        });
        ph(b, c)
    }
    ;function Sk(a) {
        var b = a.As
          , c = a.cc;
        a = a.Dd;
        R.call(this, {
            S: "top-toolbar"
        });
        var d = this;
        this.Fe = b;
        this.fb = c;
        this.W = a;
        this.gh = null;
        this.C = 0;
        b = new R({
            J: S(this, "container")
        });
        b.Z("position", "left");
        Hg(this, b);
        mg && (c = new Pk({
            J: S(this, "close-window-button")
        }),
        Hg(b, c),
        F(this, b.D, this.Lq, this),
        this.Z("mobile-app", !0));
        this.So = new R({
            J: S(this, "title")
        });
        b.c(this.So);
        this.mj = new R({
            J: S(this, "container")
        });
        this.mj.Z("position", "right");
        Hg(this, this.mj);
        this.Do = new Pk({
            J: S(this, "show-popup-button")
        });
        Hg(this.mj, this.Do);
        this.Cg = new Pk({
            J: S(this, "bookmark-button"),
            toggle: !0
        });
        F(this, this.Cg.D, this.Jq, this);
        Hg(this.mj, this.Cg);
        F(this, this.Do.D, function() {
            var a = d.Fe;
            a.Wf.appendChild(a.vd.displayObject());
            a.Wf.appendChild(a.na.displayObject());
            var b = new Nk(a.na,a.vd,350,Fi);
            a = a.na;
            uk(a.lh, "outline");
            a.il();
            b.play()
        })
    }
    m(Sk, R);
    e = Sk.prototype;
    e.fi = function(a) {
        this.gh = a
    }
    ;
    e.hi = function(a) {
        this.So.U(a)
    }
    ;
    e.u = function(a) {
        this.C = a;
        Tk(this)
    }
    ;
    e.Jq = function() {
        var a = this.Cg.pressed();
        if (a)
            Rk(this.C, this.fb);
        else {
            var b = this.C
              , c = this.fb
              , d = this.gh
              , f = this.W;
            d = d ? x(vk(b, d, !1)).label() : f.ja("PB_PAGE_LABEL").replace("%PAGE_NUMBER%", b.toString());
            c.fb.splice(0, 0, new yj({
                title: d,
                pageNumber: b,
                creationTime: Date.now()
            }));
            c.te.f()
        }
        Qk(this.Cg, !a)
    }
    ;
    function Tk(a) {
        var b = a.fb.cc().some(function(b) {
            return b.pageNumber() == a.C
        });
        Qk(a.Cg, b)
    }
    e.Lq = function() {
        var a = new Gf("closeWindow");
        if (ig) {
            var b = a.Kr
              , c = a.Wp;
            a = a.id();
            var d = jb(c, null);
            if (Cf)
                c = n.btoa(d);
            else {
                c = [];
                for (var f = 0, g = 0; g < d.length; g++) {
                    var h = d.charCodeAt(g);
                    255 < h && (c[f++] = h & 255,
                    h >>= 8);
                    c[f++] = h
                }
                x(xa(c), "encodeByteArray takes an array as a parameter");
                Ff();
                d = Af;
                f = [];
                for (g = 0; g < c.length; g += 3) {
                    var k = c[g]
                      , u = (h = g + 1 < c.length) ? c[g + 1] : 0
                      , q = g + 2 < c.length
                      , y = q ? c[g + 2] : 0
                      , I = k >> 2;
                    k = (k & 3) << 4 | u >> 4;
                    u = (u & 15) << 2 | y >> 6;
                    y &= 63;
                    q || (y = 64,
                    h || (u = 64));
                    f.push(d[I], d[k], d[u], d[y])
                }
                c = f.join("")
            }
            Hf("isplayer://" + b + "/" + a + "/" + c)
        }
    }
    ;
    function Uk(a) {
        var b = a.width
          , c = a.height
          , d = a.Dd;
        a = a.cc;
        U.call(this, ["mainContainer", "mobile"]);
        var f = this;
        this.$(b);
        this.qa(c);
        this.na = new Ek(d,a);
        this.na.ac.addHandler(function(a) {
            return f.Uc.f(a)
        }, this);
        this.Fe = new Ok({
            Us: document.body,
            view: this,
            Bs: this.na
        });
        this.Af = new U("loaderIcon");
        this.c(this.Af);
        this.fa = new U("viewerContainer mobile");
        this.c(this.fa);
        this.Qb = new Sk({
            As: this.Fe,
            Dd: d,
            cc: a
        });
        this.c(this.Qb);
        this.Bb = new Ik(this.Fe);
        this.c(this.Bb);
        this.Bb.Ab().addHandler(function() {
            var a = f.Bb.Da();
            f.Uc.f(a)
        });
        this.yd = new H;
        this.Dc = new H;
        this.Uc = new H;
        this.we = new H
    }
    m(Uk, U);
    e = Uk.prototype;
    e.cb = function() {
        return this.Bb.height()
    }
    ;
    e.ra = function(a) {
        this.Bb.ra(a)
    }
    ;
    e.u = function(a) {
        this.Bb.u(a);
        this.Qb.u(a);
        this.na.u(a)
    }
    ;
    e.eb = function() {
        return new W(this.width(),this.height())
    }
    ;
    e.Ra = function() {
        return this.yd
    }
    ;
    e.Qa = function() {
        return this.Dc
    }
    ;
    e.Ab = function() {
        return this.Uc
    }
    ;
    e.Rb = function() {
        return this.we
    }
    ;
    e.Nm = function() {}
    ;
    e.cd = function() {}
    ;
    e.bd = function() {}
    ;
    function Hj(a) {
        a.removeChild(a.Af)
    }
    e.Ej = function(a) {
        mg ? (this.Qb.Z("above-auth-popup", a),
        this.Qb.Pa(!0),
        Vk(this.Qb, !0)) : (this.Qb.Pa(!a),
        Vk(this.Qb, !a));
        this.Bb.Pa(!a);
        Vk(this.Bb, !a)
    }
    ;
    e.ad = function() {}
    ;
    function Wk(a) {
        a.Bb.Pa(!1);
        a.Qb.Pa(!1);
        Vk(a.Bb, !1);
        Vk(a.Qb, !1)
    }
    function Vk(a, b) {
        a.dd(b ? 1 : 0);
        a.Z("hidden", !b)
    }
    e.fi = function(a) {
        this.na.fi(a);
        this.Qb.fi(a)
    }
    ;
    e.hi = function(a) {
        this.na.hi(a);
        this.Qb.hi(a)
    }
    ;
    e.invalidate = function() {
        var a = this
          , b = lh();
        this.Bb.Z("landscape", b);
        this.Qb.Z("landscape", b);
        this.na.Z("landscape", b);
        window.requestAnimationFrame(function() {
            Kg(a.na);
            Kg(a.Bb)
        })
    }
    ;
    function Xk(a, b, c) {
        var d = this
          , f = new oh;
        this.a = new Uk({
            width: a.clientWidth,
            height: a.clientHeight,
            Dd: b.Dd(),
            cc: f
        });
        bd(a, this.a.wa);
        Z.call(this, a, b, 1, Jj, f, c);
        this.Ng = new Hh(this.a);
        this.yh = this.mf = this.Cc = 0;
        this.sf = !1;
        this.dj = !0;
        this.Wk = !1;
        this.nj = new C;
        this.La = new Ph;
        this.La.Ra().addHandler(this.Vc, this);
        this.La.Qa().addHandler(this.Tc, this);
        this.La.Ab().addHandler(this.ce, this);
        this.ma = new Oh(this.a.fa);
        this.ma.$l.addHandler(this.am, this);
        this.ma.wg().addHandler(this.Kh, this);
        this.ma.Ke.xl.addHandler(this.Xl, this);
        this.ma.Ra().addHandler(this.Vc, this);
        this.ma.Cr.addHandler(function() {
            aj(Qa(d.j, Yi))
        }, this);
        this.ma.Hq.addHandler(function(a) {
            bj(Qa(d.j, Yi), a, !1)
        }, this);
        this.ma.Nn.addHandler(function() {
            bj(Qa(d.j, Yi), 0, !0)
        }, this);
        this.ma.Qa().addHandler(this.Tc, this);
        this.ma.rn.addHandler(this.Sq, this);
        this.ma.bn.addHandler(this.Kq, this);
        this.ma.Ve().addHandler(function(a, b) {
            var c = d.a.fa.displayObject();
            c.scrollLeft -= a;
            c.scrollTop -= b;
            a = d.nj.x + a;
            b = d.nj.y + b;
            d.nj = new C(a,b);
            d.j.Hd(a, b)
        }, this);
        Yk(this);
        this.qh = new lj;
        this.qh.Wa.addHandler(this.kl, this);
        this.a.Ra().addHandler(this.Vc, this);
        this.a.Qa().addHandler(this.Tc, this);
        this.a.Ab().addHandler(this.ce, this);
        this.a.Rb().addHandler(this.nd, this);
        this.fj = new R({
            S: "preloader-view"
        });
        this.a.c(this.fj);
        this.Ac(1, Yi);
        this.kh();
        this.a.hi(this.Gb.title());
        J(document.body, "mobile")
    }
    w(Xk, Z);
    e = Xk.prototype;
    e.enable = function() {}
    ;
    e.disable = function() {}
    ;
    e.resize = function(a, b) {
        var c = this;
        this.Cc && clearTimeout(this.Cc);
        this.a.resize(a, b);
        this.a.invalidate();
        var d = 1 < a / b;
        this.oa.Jj ? (this.j.resize(this.Sd()),
        this.Cc = setTimeout(function() {
            c.j.update();
            c.sf && d != c.Wk && c.j.lm({
                bp: !0
            });
            c.Wk = d
        }, Jj.Dm)) : this.Wk = d;
        this.Ja && this.Ja.aa(this.ea)
    }
    ;
    e.Kq = function() {
        if (this.dj)
            Wk(this.a);
        else {
            var a = this.a;
            a.Bb.Pa(!0);
            a.Qb.Pa(!0);
            Vk(a.Bb, !0);
            Vk(a.Qb, !0)
        }
        this.dj = !this.dj
    }
    ;
    e.Nc = function() {
        return this.j.Nc()
    }
    ;
    Xk.prototype.viewPages = Xk.prototype.Nc;
    function Yk(a) {
        a.ba.On.addHandler(function() {
            aj(a.qh.j)
        }, a);
        a.ba.bh.addHandler(function(b) {
            var c = a.qh;
            b = 0 == b ? 0 : (0 > b ? Math.max(b / 2.5, -50) : Math.min(b / 2.5, 50)) + (0 > b ? Math.min(b + 125, 0) : Math.max(b - 125, 0));
            c.Zk = b;
            bj(c.j, b, !1)
        }, a);
        a.ba.Mn.addHandler(function() {
            var b = a.qh;
            bj(b.j, 0, !0);
            b.j.container().displayObject();
            50 < b.Zk && (b.j.bf(!1),
            b.Wa.f());
            -50 > b.Zk && (b.j.af(!1),
            b.Wa.f())
        }, a)
    }
    e = Xk.prototype;
    e.kh = function() {
        if (window.location.hash) {
            var a = this.jh(window.location.hash.substring(1));
            "page"in a && (this.oa.Da = parseInt(a.page, 10))
        }
    }
    ;
    e.jh = function(a) {
        a = a.split("&");
        for (var b = {}, c = 0; c < a.length; ++c) {
            var d = a[c].split("=");
            b[decodeURIComponent(d[0].toLowerCase())] = 1 < d.length ? decodeURIComponent(d[1]) : null
        }
        return b
    }
    ;
    e.Ac = function(a, b) {
        Xk.V.Ac.call(this, a, b);
        this.ua[a].Pf.addHandler(this.Or, this);
        Qa(this.ua[a], Yi).Km(this)
    }
    ;
    e.Vc = function(a) {
        a = void 0 === a ? !0 : a;
        this.kl();
        this.j.bf(a)
    }
    ;
    e.Tc = function(a) {
        a = void 0 === a ? !0 : a;
        this.kl();
        this.j.af(a)
    }
    ;
    e.kl = function() {
        Wk(this.a);
        this.dj = !1
    }
    ;
    e.nd = function() {
        this.Ng.toggle()
    }
    ;
    e.Sd = function() {
        return this.a.eb()
    }
    ;
    e.ce = function(a) {
        var b = Qa(this.j, Yi);
        b.ib(b.B);
        b.ib(b.w);
        b.ib(b.F);
        b.nc = a;
        $i(b, a);
        b.O.$j(0)
    }
    ;
    e.rd = function(a) {
        var b = this;
        Xk.V.rd.call(this, a);
        xh(a, this.Qc);
        var c = a.o();
        this.a.u(1);
        this.a.ra(c);
        this.La.ra(c);
        this.ua[1].bb(a);
        this.Wb(1);
        Ij(this);
        this.R.getOutline().then(function(a) {
            b.a.fi(a)
        });
        this.fj && (this.a.removeChild(this.fj),
        this.fj = null)
    }
    ;
    e.Wb = function(a) {
        Xk.V.Wb.call(this, a);
        this.j.resize(this.Sd());
        this.j.enable(this.oa.Da);
        a = Qa(this.j, Yi);
        this.qh.j = a;
        this.ba.Id(Qa(this.j, Yi).Ic())
    }
    ;
    e.Se = function(a) {
        Xk.V.Se.call(this, a);
        this.a.u(a);
        this.kc(a)
    }
    ;
    e.Or = function(a) {
        0 < a ? (this.ba.Sb() || this.ba.enable(),
        a = this.ma,
        a.qd && (Ge(a.Ae),
        a.qd = !1),
        a = this.ma,
        a.Ud && (Ge(a.Df),
        a.Ud = !1)) : (this.ba.Sb() && this.ba.disable(),
        a = this.ma,
        a.qd || (Fe(a.Ae),
        a.qd = !0),
        a = this.ma,
        a.Ud || (Fe(a.Df),
        a.Ud = !0))
    }
    ;
    e.am = function(a, b) {
        this.yh = this.j.Gd();
        this.nj = new C(a,b);
        this.j.Hd(a, b)
    }
    ;
    e.Kh = function(a) {
        this.sf = !1;
        a = this.uf(this.yh * a);
        a = cb(a, Jj.Xe, Jj.We);
        this.j.ne(a)
    }
    ;
    e.Xl = function() {
        this.j.update()
    }
    ;
    e.uf = function(a) {
        return (a - 1) / (this.j.$a - 1)
    }
    ;
    e.Sq = function(a, b) {
        this.sf = 1 == this.j.Gd();
        this.j.lm({
            clientX: a,
            clientY: b,
            bp: !1
        })
    }
    ;
    function Zk(a) {
        X.call(this, [0], [1], a);
        this.A = this.sa = null;
        this.I = 0
    }
    w(Zk, X);
    Zk.prototype.qb = function(a, b, c) {
        this.sa = a;
        this.A = b;
        this.I = c
    }
    ;
    Zk.prototype.Ge = function() {
        T(this.sa, "bottom", this.A.cb() + "px");
        this.sa.T("open")
    }
    ;
    Zk.prototype.mb = function(a) {
        a = this.I * a[0];
        T(this.sa, "bottom", this.A.cb() - a + "px")
    }
    ;
    Zk.prototype.wd = function() {
        this.sa.H("close")
    }
    ;
    function $k(a) {
        X.call(this, [0], [1], a);
        this.A = this.sa = null;
        this.I = 0
    }
    w($k, X);
    $k.prototype.qb = function(a, b, c) {
        this.sa = a;
        this.A = b;
        this.I = c
    }
    ;
    $k.prototype.Ge = function() {
        var a = this.A.cb() - this.I;
        T(this.sa, "bottom", a + "px");
        this.sa.T("close")
    }
    ;
    $k.prototype.mb = function(a) {
        a = this.I * (1 - a[0]);
        T(this.sa, "bottom", this.A.cb() - a + "px")
    }
    ;
    $k.prototype.wd = function() {
        this.sa.H("open")
    }
    ;
    function al(a, b, c) {
        this.h = b;
        this.Ib = a;
        this.Ba = c
    }
    function bl(a, b) {
        b = Math.floor(b.height() * a.h.Pp);
        return Math.max(b, a.h.minHeight)
    }
    e = al.prototype;
    e.Hk = function(a) {
        a = a - this.h.Xc - 2 * (this.h.og + this.h.ic);
        a = 1 == this.Ba ? a - this.h.Xc : a - (this.h.bg + this.h.$h + this.h.lg);
        return Math.floor(a)
    }
    ;
    e.Ik = function(a) {
        a = a + this.h.Xc + 2 * (this.h.og + this.h.ic);
        a = 1 == this.Ba ? a + this.h.Xc : a + (this.h.bg + this.h.$h + this.h.lg);
        return Math.floor(a)
    }
    ;
    e.Jk = function(a) {
        a += 2 * this.h.Ue;
        1 < this.Ba && (a += 2 * this.h.cg);
        return a
    }
    ;
    e.Gk = function(a) {
        a -= 2 * this.h.Ue;
        1 < this.Ba && (a -= 2 * this.h.cg);
        return a
    }
    ;
    e.uf = function(a, b, c) {
        var d = 1
          , f = 1;
        a.width() < b && (d = a.width() / b);
        a.height() < c && (f = a.height() / c);
        return Math.min(d, f)
    }
    ;
    function cl(a, b, c, d) {
        al.call(this, a, b, c);
        this.X = d
    }
    w(cl, al);
    e = cl.prototype;
    e.em = function(a) {
        var b = bl(this, a)
          , c = this.Hk(b)
          , d = this.Fk(c)
          , f = Math.min(this.X, this.h.nb)
          , g = (d + 2 * (this.h.ci + this.h.ic + this.h.ri)) * f
          , h = this.Jk(g);
        h > a.width() && (a.width() > z.zb ? h = a.width() : h > z.zb && (h = z.zb),
        g = this.Gk(h),
        d = g / f - 2 * (this.h.ci + this.h.ic + this.h.ri),
        c = this.Ek(d),
        b = this.Ik(c));
        a = this.uf(a, h, b);
        return {
            vg: new W(h,b),
            Wh: g,
            Vh: new W(d,c),
            scale: a
        }
    }
    ;
    e.Hk = function(a) {
        a = a - this.h.Xc - 2 * (this.h.og + this.h.ic) - this.h.ip;
        a = 1 == this.Ba ? a - this.h.Xc : a - (this.h.bg + this.h.$h + this.h.lg);
        return Math.floor(a)
    }
    ;
    e.Ik = function(a) {
        a = a + this.h.Xc + 2 * (this.h.og + this.h.ic) + this.h.ip;
        a = 1 == this.Ba ? a + this.h.Xc : a + (this.h.bg + this.h.$h + this.h.lg);
        return Math.floor(a)
    }
    ;
    e.Jk = function(a) {
        a += 2 * (this.h.Ue + this.h.fm);
        1 < this.Ba && (a += 2 * this.h.cg);
        return a
    }
    ;
    e.Gk = function(a) {
        a -= 2 * (this.h.Ue + this.h.fm);
        1 < this.Ba && (a -= 2 * this.h.cg);
        return a
    }
    ;
    e.Fk = function(a) {
        return Math.floor(a * this.Ib)
    }
    ;
    e.Ek = function(a) {
        return a / this.Ib
    }
    ;
    function dl() {
        this.X = 0;
        this.R = null;
        this.oa = 0;
        this.ee = new H;
        this.Ec = new H;
        this.Wa = new H
    }
    e = dl.prototype;
    e.state = function() {
        return this.oa
    }
    ;
    e.o = function() {
        return this.X
    }
    ;
    e.Ip = function() {
        return this.ee
    }
    ;
    e.Rj = function() {
        return this.Wa
    }
    ;
    e.document = function() {
        x(this.R);
        return this.R
    }
    ;
    e.bb = function(a) {
        this.R = a;
        this.X = a.o()
    }
    ;
    function el(a, b) {
        a.oa = b;
        a.ee.f(b)
    }
    e.kc = function(a) {
        this.Wa.f(a)
    }
    ;
    function fl(a, b) {
        dl.call(this);
        this.A = a;
        this.Ba = 0;
        this.lc = this.ya = this.Vd = null;
        this.h = b;
        this.Rc = 0;
        this.ud = [];
        this.Xi = this.ij = null;
        this.cj = z.Pm;
        this.Ui = this.Pc = this.Re = 0;
        this.hh = null
    }
    w(fl, dl);
    fl.prototype.Zj = function(a) {
        this.lc = a
    }
    ;
    fl.prototype.disable = function() {
        this.Ba = this.Rc = 0;
        this.ud = [];
        this.Ui = this.Pc = 0;
        this.hh = null
    }
    ;
    function gl(a, b, c) {
        if (1 != a.Ba)
            if (a.ij.displayObject().firstChild.style.height = b + "px",
            a.Xi.displayObject().firstChild.style.height = b + "px",
            b = hl(a, c),
            a.cj = b.width,
            b.o != a.Re) {
                c = b.o - a.Re;
                a.Re = b.o;
                var d = a.Rc - a.Pc;
                if (0 > c && d > b.o / 2 || 0 < c && d < b.o / 2)
                    a.Pc = Math.max(1, a.Pc - c);
                il(a, a.Pc);
                jl(a, a.Rc)
            } else
                for (c = 0; c < a.ud.length; ++c)
                    a.ud[c].displayObject().firstChild.style.width = b.width + "px"
    }
    function kl(a, b, c) {
        var d = new U("thumbnailContainer");
        if (1 < a.Ba) {
            d.H("withPagination");
            var f = new U("thumbnailControlsContainer");
            d.c(f);
            a.ij = ll(a, b);
            f.c(a.ij);
            a.Vd = new U("itemsContainer");
            f.c(a.Vd);
            a.Xi = ml(a, b);
            f.c(a.Xi);
            a.hh = new U("thumbnailPagination");
            d.c(a.hh);
            b = hl(a, c);
            a.Re = b.o;
            a.cj = b.width
        } else
            a.Vd = new U("itemsContainer"),
            d.c(a.Vd);
        return d
    }
    function nl(a, b) {
        a.Rc != b && (a.oo(b),
        1 < a.Ba && ((b <= a.Pc || b >= a.Ui) && il(a, Math.max(b - Math.floor(a.Re / 2), 1)),
        jl(a, b),
        T(a.ij, "visibility", 1 == b ? "hidden" : "visible"),
        T(a.Xi, "visibility", b == a.Ba ? "hidden" : "visible")),
        a.Rc = b,
        a.Zb())
    }
    function ol(a) {
        return a.A.cb()
    }
    function jl(a, b) {
        var c = a.Rc - a.Pc;
        b = Math.max(0, b - a.Pc);
        a.Pc <= a.Rc && a.Rc <= a.Ui && 0 <= c && a.ud[c].T("selected");
        a.ud[b].H("selected")
    }
    function il(a, b) {
        pl(a);
        var c = b + a.Re - 1;
        c > a.Ba && (c = a.Ba,
        b = Math.max(c - (a.Re - 1), 1));
        a.Pc = b;
        for (a.Ui = c; b <= c; ++b) {
            var d = a.sn(b);
            d = ql(a, d);
            d.D.addHandler(function(a) {
                nl(this, a)
            }
            .bind(a, b), a);
            a.ud.push(d);
            a.hh.c(d)
        }
    }
    function hl(a, b) {
        var c = z.rs + 2 * a.h.ki
          , d = Math.floor(b / c);
        d = Math.min(d, a.Ba);
        b -= d * c;
        b > d && (c += Math.floor(b / d));
        c = Math.min(c, z.Pm);
        return {
            o: d,
            width: c - 2 * a.h.ki
        }
    }
    function pl(a) {
        for (var b = 0; b < a.ud.length; ++b)
            a.hh.removeChild(a.ud[b]);
        a.ud = []
    }
    function ql(a, b) {
        var c = new U("selection");
        c.setAttribute("title", b.left + " - " + b.right);
        b = new U("paginationPage");
        a.cj != z.Pm && b.$(a.cj);
        c.c(b);
        return c
    }
    function ml(a, b) {
        var c = new U(["next", "paginationPage"],"A")
          , d = new U("backLight");
        T(d, "height", b + "px");
        d.D.addHandler(function() {
            nl(this, this.Rc + 1)
        }, a);
        c.c(d);
        a = new U("arrow");
        d.c(a);
        return c
    }
    function ll(a, b) {
        var c = new U(["prev", "paginationPage"],"A")
          , d = new U("backLight");
        T(d, "height", b + "px");
        d.D.addHandler(function() {
            nl(this, this.Rc - 1)
        }, a);
        c.c(d);
        a = new U("arrow");
        d.c(a);
        return c
    }
    ;function rl(a) {
        this.Lb = [];
        this.Dh = a
    }
    e = rl.prototype;
    e.Ia = function() {
        for (var a = [], b = this.Dh.ha, c = 0; c < b.length; ++c)
            a.push(b[c].page());
        return a
    }
    ;
    e.render = function(a) {
        var b = this
          , c = this.Qg(a);
        c && !this.Xg(c) && (c.Uh() ? this.$d(c) : (a = c.pageNumber(),
        this.Lb[a] || (this.Lb[a] = !0,
        this.Dh.document().getPage(a, function(a, f) {
            c.gi(a);
            b.Lb[f] = !1;
            b.render(b.Ia())
        }))))
    }
    ;
    e.$d = function(a) {
        switch (a.Y) {
        case 3:
            break;
        case 2:
            break;
        case 1:
            break;
        case 0:
            a.Za.addHandler(function() {
                this.render(this.Ia())
            }, this);
            a.render();
            break;
        default:
            throw Error("renderingState is wrong");
        }
    }
    ;
    e.Qg = function(a) {
        for (var b = 0; b < a.length; ++b)
            if (!this.Wg(a[b]))
                return a[b];
        return null
    }
    ;
    e.Wg = function(a) {
        return 3 == a.Y
    }
    ;
    e.Xg = function(a) {
        return 1 == a.Y
    }
    ;
    function sl(a, b, c) {
        U.call(this, "thumbnailView");
        this.xa = a;
        this.eo = new H;
        this.Mb = new U("selection");
        this.c(this.Mb);
        this.ga = xj(c, a, b);
        this.ga.D.addHandler(function() {
            this.eo.f(a)
        }, this);
        this.Mb.c(this.ga.displayObject())
    }
    w(sl, U);
    e = sl.prototype;
    e.page = function() {
        return this.ga
    }
    ;
    e.pageNumber = function() {
        return this.xa
    }
    ;
    e.aa = function(a) {
        this.ga.aa(a)
    }
    ;
    e.update = function() {
        this.ga.reset()
    }
    ;
    e.setActive = function(a) {
        a ? this.Mb.H("selected") : this.Mb.T("selected")
    }
    ;
    var tl = {
        xi: [0, .03, .04, .05, .1, .11, .3],
        vi: [.6, .09, .02, .01, .15, .16, 0],
        wi: [0, 0, 0, 255, 255, 255, 255]
    }
      , ul = {
        xi: [.78, .88, .9, .94, .95, .98, 1],
        vi: [0, .09, .09, .03, .06, .22, .6],
        wi: [255, 255, 255, 255, 0, 0, 0]
    }
      , vl = {
        xi: [.43, .44, .46, .48, .5, .52, .54, .58, .61],
        vi: [0, .05, .2, .2, .5, .4, .3, .1, 0],
        wi: [255, 255, 255, 0, 0, 0, 0, 0, 0]
    }
      , wl = {
        xi: [.46, .47, .49, .5, .51, .52, .53, .54, .55],
        vi: [0, .1, .3, .5, .1, .3, .2, .1, 0],
        wi: [0, 0, 0, 0, 0, 255, 255, 255, 255]
    };
    function xl() {
        this.Vl = []
    }
    function yl(a, b, c) {
        a: {
            var d = b.pageNumber();
            for (var f = 0; f < a.Vl.length; ++f)
                if (a.Vl[f] == d) {
                    d = !0;
                    break a
                }
            d = !1
        }
        if (d)
            return null;
        d = b.jf;
        a = a.Fi(b.width(), b.height());
        zl(a, c);
        d.c(a);
        return a
    }
    function zl(a, b) {
        var c = a.getContext("2d")
          , d = c.createLinearGradient(0, 0, a.width, 0)
          , f = Al(b);
        b = f.xi;
        var g = f.vi;
        f = f.wi;
        for (var h = 0; h < b.length; ++h)
            d.addColorStop(b[h], "rgba(" + f[h] + ", " + f[h] + ", " + f[h] + ", " + g[h] + ")");
        c.rect(0, 0, a.width, a.height);
        c.fillStyle = d;
        c.fill()
    }
    xl.prototype.Fi = function(a, b) {
        var c = document.createElement("canvas");
        c.className = "shadow";
        c.width = a;
        c.height = b;
        c.style.width = a + "px";
        c.style.height = b + "px";
        return c
    }
    ;
    function Al(a) {
        switch (a) {
        case 1:
            return tl;
        case 2:
            return ul;
        case 3:
            return vl;
        case 4:
            return wl;
        default:
            throw Error("shadowType is wrong");
        }
    }
    ;function Bl(a, b, c) {
        fl.call(this, a, b);
        this.a = null;
        this.Nb = new xl;
        this.ha = [];
        this.Ya = new rl(this);
        this.wb = null;
        this.ff = this.C = this.Ib = 0;
        this.Xb = !1;
        this.I = 0;
        this.ge = c;
        this.td = new $k(this.h.animationDuration);
        this.td.la.addHandler(this.fh, this);
        this.kd = new Zk(this.h.animationDuration);
        this.kd.la.addHandler(this.Eg, this)
    }
    w(Bl, fl);
    e = Bl.prototype;
    e.view = function() {
        x(this.a);
        return this.a
    }
    ;
    e.u = function(a) {
        this.Xb && this.C != a && (nl(this, Math.ceil(a / this.h.nb)),
        Cl(this, a),
        this.C = a)
    }
    ;
    e.toggle = function(a) {
        1 == this.state() ? this.close(a) : this.open(a)
    }
    ;
    e.open = function(a) {
        a ? this.td.play() : (T(this.a, "bottom", ol(this) + "px"),
        this.a.T("close"),
        this.fh())
    }
    ;
    e.close = function(a) {
        a ? this.kd.play() : (T(this.a, "bottom", ol(this) - this.I + "px"),
        this.a.T("open"),
        this.Eg())
    }
    ;
    e.tm = function() {
        T(this.a, "display", "none");
        el(this, 2)
    }
    ;
    e.show = function() {
        T(this.a, "display", "");
        el(this, 1)
    }
    ;
    e.enable = function(a) {
        this.a = new U(["thumbnailWrapper", this.h.className, "close"]);
        this.a.di(!0);
        this.A.c(this.a);
        var b = eh(this.lc);
        this.Ib = b.width / b.height;
        this.Ba = Math.ceil(this.o() / this.h.nb);
        b = this.Sg();
        this.I = b.vg.height();
        this.wb = b.Vh;
        var c = this.wb.height() + 2 * this.h.ic;
        this.ya = kl(this, c, b.Wh);
        this.a.c(this.ya);
        this.th(b);
        this.td.qb(this.a, this.A, this.I);
        this.kd.qb(this.a, this.A, this.I);
        this.Xb = !0;
        this.u(a);
        T(this.a, "bottom", ol(this) - this.I + "px");
        this.Ec.f();
        this.Zb()
    }
    ;
    e.disable = function() {
        Bl.V.disable.call(this);
        this.ha = [];
        this.C = 0;
        this.Xb = !1;
        this.I = 0;
        T(this.A.fa, "bottom", ol(this) + "px");
        x(this.a);
        this.A.removeChild(this.a)
    }
    ;
    e.resize = function() {
        var a = this.Sg();
        this.I = a.vg.height();
        this.th(a);
        x(this.a);
        this.td.qb(this.a, this.A, this.I);
        this.kd.qb(this.a, this.A, this.I);
        0 == this.state() ? T(this.a, "bottom", ol(this) - this.I + "px") : 1 == this.state() && (T(this.A.fa, "bottom", ol(this) + "px"),
        T(this.a, "bottom", ol(this) + "px"));
        this.wb = a.Vh;
        x(this.wb);
        for (var b = 0; b < this.ha.length; ++b)
            this.ha[b].aa(this.wb);
        b = this.wb.height() + 2 * this.h.ic;
        gl(this, b, a.Wh)
    }
    ;
    e.update = function() {
        for (var a = 0; a < this.ha.length; ++a)
            this.ha[a].update();
        this.Zb()
    }
    ;
    e.oo = function(a) {
        for (var b = 0; b < this.ha.length; ++b)
            this.Vd.removeChild(this.ha[b]);
        this.ha = [];
        b = (a - 1) * this.h.nb + 1;
        a = Math.min(b + this.h.nb - 1, this.o());
        for (x(this.wb); b <= a; ++b) {
            var c = new sl(b,this.wb,this.ge);
            c.eo.addHandler(this.dr, this);
            this.Vd.c(c);
            this.ha.push(c)
        }
        Cl(this, this.C)
    }
    ;
    e.Zb = function() {
        var a = this.Ya.Ia();
        this.Ya.render(a)
    }
    ;
    e.dr = function(a) {
        this.C != a && this.kc(a)
    }
    ;
    e.fh = function() {
        el(this, 1)
    }
    ;
    e.Eg = function() {
        el(this, 0)
    }
    ;
    e.th = function(a) {
        if (1 > a.scale) {
            this.ya.H("scaled");
            var b = this.h.Ue + this.h.fm
              , c = a.vg.width();
            this.ya.$(c - 2 * b);
            vg(this.ya.displayObject(), a.scale);
            this.A.eb().width() < c ? T(this.ya, "margin-left", (this.A.eb().width() - c + b) / 2 + "px") : T(this.ya, "margin-left", "")
        } else
            vg(this.ya.displayObject(), 1),
            this.ya.T("scaled"),
            T(this.ya, "margin-left", ""),
            this.ya.displayObject().style.width = ""
    }
    ;
    function Cl(a, b) {
        for (var c = 0; c < a.ha.length; ++c) {
            var d = a.ha[c].pageNumber();
            0 != a.C && a.C != b && a.C == d && a.ha[c].setActive(!1);
            d == b && a.ha[c].setActive(!0)
        }
    }
    e.Sg = function() {
        return (new cl(this.Ib,this.h,this.Ba,this.o())).em(this.A.eb())
    }
    ;
    e.sn = function(a) {
        var b = (a - 1) * this.h.nb + 1;
        a *= this.h.nb;
        a > this.o() && (a = this.o());
        return {
            left: b,
            right: a
        }
    }
    ;
    function Dl(a) {
        X.call(this, [0], [1], a);
        this.A = this.sa = null;
        this.I = 0;
        this.i = this.Aa = null
    }
    w(Dl, X);
    Dl.prototype.qb = function(a, b, c) {
        this.i = c;
        this.A = b;
        this.sa = a.view();
        this.I = a.height()
    }
    ;
    Dl.prototype.Ge = function() {
        var a = this.A.cb();
        T(this.sa, "bottom", a - this.I + "px");
        T(this.i.container(), "bottom", a + "px");
        this.sa.T("close")
    }
    ;
    Dl.prototype.mb = function(a) {
        var b = a[0]
          , c = this.A.cb();
        a = this.I * b;
        T(this.sa, "bottom", c - a + "px");
        a = this.I * (1 - b);
        T(this.i.container(), "bottom", Math.ceil(c + a) + "px");
        b = this.A.eb();
        a = b.height() - a;
        this.i.resize(new W(b.width(),a))
    }
    ;
    Dl.prototype.wd = function() {
        this.sa.H("open");
        this.i.update()
    }
    ;
    function El(a) {
        X.call(this, [0], [1], a);
        this.A = this.sa = null;
        this.I = 0;
        this.i = this.Aa = null
    }
    w(El, X);
    El.prototype.qb = function(a, b, c) {
        this.i = c;
        this.A = b;
        this.sa = a.view();
        this.I = a.height()
    }
    ;
    El.prototype.Ge = function() {
        var a = this.A.cb();
        T(this.sa, "bottom", a - this.I + "px");
        T(this.i.container(), "bottom", a + "px");
        this.sa.T("close")
    }
    ;
    El.prototype.mb = function(a) {
        var b = a[0]
          , c = this.A.cb();
        a = this.I * (1 - b);
        T(this.sa, "bottom", c - a + "px");
        a = this.I * b;
        T(this.i.container(), "bottom", Math.ceil(c + a) + "px");
        b = this.A.eb();
        a = b.height() - a;
        this.i.resize(new W(b.width(),a))
    }
    ;
    El.prototype.wd = function() {
        this.sa.H("open");
        this.i.update()
    }
    ;
    function Fl(a, b, c) {
        al.call(this, a, b, c)
    }
    w(Fl, al);
    Fl.prototype.em = function(a) {
        var b = bl(this, a)
          , c = this.Hk(b)
          , d = this.Fk(c)
          , f = (d + 2 * (this.h.ci + this.h.ic + this.h.ri)) * this.h.nb
          , g = this.Jk(f);
        g > a.width() && (a.width() > z.zb ? g = a.width() : g > z.zb && (g = z.zb),
        f = this.Gk(g),
        d = f / this.h.nb - 2 * (this.h.ci + this.h.ic + this.h.ri),
        c = this.Ek(d),
        b = this.Ik(c));
        a = this.uf(a, z.zb, z.bi);
        1 != a && (g *= a,
        b *= a);
        return {
            vg: new W(g,b),
            Wh: f,
            Vh: new W(d,c),
            scale: a
        }
    }
    ;
    Fl.prototype.Fk = function(a) {
        return Math.floor(a * this.Ib * 2)
    }
    ;
    Fl.prototype.Ek = function(a) {
        return a / this.Ib / 2
    }
    ;
    function Gl(a, b, c, d) {
        U.call(this, "thumbnailView");
        this.qj = new H;
        var f = c.width() / 2;
        this.Mb = new U("selection");
        this.c(this.Mb);
        this.jb = new U("thumbnailSpread");
        this.jb.$(f);
        this.jb.qa(c.height());
        this.jb.D.addHandler(function() {
            this.qj.f(a, b)
        }, this);
        this.Mb.c(this.jb);
        this.Eo = a;
        c = new W(f,c.height());
        this.ga = xj(d, b, c);
        this.jb.c(this.ga.displayObject())
    }
    w(Gl, U);
    Gl.prototype.page = function() {
        return this.ga
    }
    ;
    Gl.prototype.aa = function(a) {
        var b = a.width() / 2;
        this.jb.$(b);
        this.jb.qa(a.height());
        a = new W(b,a.height());
        this.ga.aa(a)
    }
    ;
    Gl.prototype.update = function() {
        this.ga.reset()
    }
    ;
    Gl.prototype.setActive = function(a) {
        a ? this.Mb.H("selected") : this.Mb.T("selected")
    }
    ;
    function Hl(a, b, c, d) {
        U.call(this, "thumbnailView");
        this.Eo = a;
        this.qj = new H;
        c = this.Rg(a, 0);
        var f = this.Rg(a, 1);
        this.Mb = new U("selection");
        this.c(this.Mb);
        this.jb = new U("thumbnailSpread");
        this.jb.$(b.width());
        this.jb.qa(b.height());
        this.jb.D.addHandler(function() {
            this.qj.f(a, f)
        }, this);
        this.Mb.c(this.jb);
        b = new W(b.width() / 2,b.height());
        this.zf = xj(d, c, b);
        this.zf.H("left");
        this.jb.c(this.zf.displayObject());
        c = this.Fi(b);
        zl(c, 2);
        this.Cn = c;
        this.zf.c(c);
        this.Of = xj(d, f, b);
        this.Of.H("right");
        this.jb.c(this.Of.displayObject());
        c = this.Fi(b);
        zl(c, 1);
        this.so = c;
        this.Of.c(c)
    }
    w(Hl, U);
    e = Hl.prototype;
    e.aa = function(a) {
        this.jb.$(a.width());
        this.jb.qa(a.height());
        a = new W(a.width() / 2,a.height());
        this.zf.aa(a);
        this.Of.aa(a);
        this.Cn.style.width = a.width() + "px";
        this.Cn.style.height = a.height() + "px";
        this.so.style.width = a.width() + "px";
        this.so.style.height = a.height() + "px"
    }
    ;
    e.update = function() {
        this.zf.reset();
        this.Of.reset()
    }
    ;
    e.setActive = function(a) {
        a ? this.Mb.H("selected") : this.Mb.T("selected")
    }
    ;
    e.Fi = function(a) {
        var b = document.createElement("canvas");
        b.className = "shadow";
        b.width = a.width();
        b.height = a.height();
        return b
    }
    ;
    e.Rg = function(a, b) {
        switch (b) {
        case 0:
            a = 2 * (a - 1);
            break;
        case 1:
            a = 2 * (a - 1) + 1;
            break;
        default:
            throw Error("spreadSideId is wrong");
        }
        return a
    }
    ;
    function Il(a) {
        this.Lb = [];
        this.Dh = a
    }
    e = Il.prototype;
    e.Ia = function() {
        for (var a = [], b = this.Dh.Ob, c = 0; c < b.length; ++c) {
            var d = b[c];
            d instanceof Gl ? a.push(d.page()) : d instanceof Hl && (a.push(d.zf),
            a.push(d.Of))
        }
        return a
    }
    ;
    e.render = function(a) {
        var b = this
          , c = this.Qg(a);
        c && !this.Xg(c) && (c.Uh() ? this.$d(c) : (a = c.pageNumber(),
        this.Lb[a] || (this.Lb[a] = !0,
        this.Dh.document().getPage(a, function(a, f) {
            c.gi(a);
            b.Lb[f] = !1;
            b.render(b.Ia())
        }))))
    }
    ;
    e.$d = function(a) {
        switch (a.Y) {
        case 3:
            break;
        case 2:
            break;
        case 1:
            break;
        case 0:
            a.Za.addHandler(function() {
                this.render(this.Ia())
            }, this);
            a.render();
            break;
        default:
            throw Error("renderingState is wrong");
        }
    }
    ;
    e.Qg = function(a) {
        for (var b = 0; b < a.length; ++b)
            if (!this.Wg(a[b]))
                return a[b];
        return null
    }
    ;
    e.Wg = function(a) {
        return 3 == a.Y
    }
    ;
    e.Xg = function(a) {
        return 1 == a.Y
    }
    ;
    function Jl(a, b) {
        switch (b) {
        case 0:
            a = 2 * a - 1;
            break;
        case 1:
            a *= 2;
            break;
        default:
            throw Error("sheetSideId is wrong");
        }
        return a
    }
    function Kl(a, b) {
        switch (b) {
        case 0:
            a -= 2;
            break;
        case 1:
            --a;
            break;
        case 2:
            break;
        case 3:
            a += 1;
            break;
        default:
            throw Error("bookSheetId is wrong");
        }
        return a
    }
    function Ll(a, b) {
        var c = Math.floor(b / 2) + 1;
        return 1 == a || a == c && 0 == b % 2
    }
    ;function Ml(a, b, c) {
        fl.call(this, a, b);
        this.a = null;
        this.Nb = new xl;
        this.Ob = [];
        this.de = 0;
        this.Ya = new Il(this);
        this.zd = null;
        this.ff = this.tb = this.Ib = 0;
        this.Xb = !1;
        this.I = 0;
        this.i = null;
        this.ge = c;
        this.td = new El(this.h.animationDuration);
        this.td.la.addHandler(this.fh, this);
        this.kd = new Dl(this.h.animationDuration);
        this.kd.la.addHandler(this.Eg, this)
    }
    w(Ml, fl);
    e = Ml.prototype;
    e.view = function() {
        x(this.a);
        return this.a
    }
    ;
    e.height = function() {
        return this.I
    }
    ;
    e.u = function(a) {
        this.Xb && (a = Math.floor(a / 2 + 1),
        this.tb != a && (nl(this, Math.ceil(a / this.h.nb)),
        Nl(this, a),
        this.tb = a))
    }
    ;
    e.bb = function(a) {
        Ml.V.bb.call(this, a);
        this.de = Math.floor(this.o() / 2) + 1
    }
    ;
    e.bk = function(a) {
        this.i = a
    }
    ;
    e.toggle = function(a) {
        1 == this.state() ? this.close(a) : this.open(a)
    }
    ;
    e.open = function(a) {
        if (a)
            this.td.play();
        else {
            T(this.A.fa, "bottom", Math.ceil(this.I + ol(this)) + "px");
            T(this.a, "bottom", ol(this) + "px");
            this.a.T("close");
            a = this.A.eb();
            var b = a.height() - this.I;
            this.i.resize(new W(a.width(),b));
            this.fh()
        }
    }
    ;
    e.close = function(a) {
        a ? this.kd.play() : (T(this.a, "bottom", ol(this) - this.I + "px"),
        this.a.T("open"),
        this.Eg())
    }
    ;
    e.enable = function(a) {
        this.a = new U(["thumbnailWrapper", this.h.className, "close"]);
        this.a.di(!0);
        this.A.c(this.a);
        var b = eh(this.lc);
        this.Ib = b.width / b.height;
        this.Ba = Math.ceil(this.de / this.h.nb);
        b = this.Sg();
        this.I = b.vg.height();
        this.zd = b.Vh;
        var c = this.zd.height() + 2 * this.h.ic;
        this.ya = kl(this, c, b.Wh);
        this.a.c(this.ya);
        this.th(b.scale);
        x(this.i);
        this.td.qb(this, this.A, this.i);
        this.kd.qb(this, this.A, this.i);
        this.Xb = !0;
        this.u(a);
        T(this.a, "bottom", ol(this) - this.I + "px");
        this.Ec.f();
        this.Zb()
    }
    ;
    e.tm = function() {
        T(this.A.fa, "bottom", "");
        var a = this.A.eb();
        this.i.resize(a);
        T(this.a, "display", "none");
        el(this, 2)
    }
    ;
    e.show = function() {
        T(this.A.fa, "bottom", Math.ceil(this.I + ol(this)) + "px");
        var a = this.A.eb()
          , b = a.height() - this.I;
        this.i.resize(new W(a.width(),b));
        T(this.a, "display", "");
        el(this, 1)
    }
    ;
    e.disable = function() {
        Ml.V.disable.call(this);
        this.Ob = [];
        this.tb = 0;
        this.Xb = !1;
        this.I = 0;
        T(this.A.fa, "bottom", ol(this) + "px");
        x(this.a);
        this.A.removeChild(this.a)
    }
    ;
    e.resize = function() {
        var a = this.Sg();
        this.I = a.vg.height();
        this.th(a.scale);
        x(this.i);
        this.td.qb(this, this.A, this.i);
        this.kd.qb(this, this.A, this.i);
        0 == this.state() ? T(this.a, "bottom", ol(this) - this.I + "px") : 1 == this.state() && (T(this.A.fa, "bottom", Math.ceil(this.I + ol(this)) + "px"),
        T(this.a, "bottom", ol(this) + "px"));
        this.zd = a.Vh;
        x(this.zd);
        for (var b = 0; b < this.Ob.length; ++b)
            this.Ob[b].aa(this.zd);
        b = this.zd.height() + 2 * this.h.ic;
        gl(this, b, a.Wh)
    }
    ;
    e.update = function() {
        for (var a = 0; a < this.Ob.length; ++a)
            this.Ob[a].update();
        this.Zb()
    }
    ;
    e.oo = function(a) {
        for (var b = 0; b < this.Ob.length; ++b)
            this.Vd.removeChild(this.Ob[b]);
        this.Ob = [];
        b = (a - 1) * this.h.nb + 1;
        a = Math.min(b + this.h.nb - 1, this.de);
        x(this.zd);
        for (var c; b <= a; ++b)
            Ll(b, this.o()) ? (c = 1 == b ? 1 : this.o(),
            c = new Gl(b,c,this.zd,this.ge)) : c = new Hl(b,this.zd,this.Nb,this.ge),
            c.qj.addHandler(this.Ar, this),
            this.Vd.c(c),
            this.Ob.push(c);
        Nl(this, this.tb)
    }
    ;
    e.Zb = function() {
        var a = this.Ya.Ia();
        this.Ya.render(a)
    }
    ;
    e.Ar = function(a, b) {
        this.tb != a && this.kc(b)
    }
    ;
    e.fh = function() {
        el(this, 1)
    }
    ;
    e.Eg = function() {
        el(this, 0)
    }
    ;
    function Nl(a, b) {
        for (var c = 0; c < a.Ob.length; ++c) {
            var d = a.Ob[c].Eo;
            0 != a.tb && a.tb != b && a.tb == d && a.Ob[c].setActive(!1);
            d == b && a.Ob[c].setActive(!0)
        }
    }
    e.Sg = function() {
        return (new Fl(this.Ib,this.h,this.Ba)).em(this.A.eb())
    }
    ;
    e.th = function(a) {
        this.A.eb().width() < z.zb ? this.ya.$(z.zb - 2 * this.h.Ue) : this.ya.displayObject().style.width = "";
        1 > a ? (this.ya.H("scaled"),
        vg(this.ya.displayObject(), a),
        this.A.eb().width() < z.zb ? T(this.ya, "margin-left", (this.A.eb().width() - z.zb) / 2 + "px") : T(this.ya, "margin-left", "")) : (vg(this.ya.displayObject(), 1),
        this.ya.T("scaled"),
        T(this.ya, "margin-left", ""))
    }
    ;
    e.sn = function(a) {
        var b = (a - 1) * this.h.nb * 2;
        0 == b && (b = 1);
        a = a * this.h.nb * 2 - 1;
        a > this.o() && (a = this.o());
        return {
            left: b,
            right: a
        }
    }
    ;
    function Ol(a, b, c) {
        B && (a.style.visibility = "hidden");
        a.scrollLeft = b;
        a.scrollTop = c;
        B && (a.style.visibility = "visible")
    }
    ;var Pl = [{
        Ld: "left",
        Kd: "back"
    }, {
        Ld: "right",
        Kd: "front"
    }, {
        Ld: "right",
        Kd: "back"
    }, {
        Ld: "left",
        Kd: "front"
    }, {
        Ld: "next",
        Kd: "front"
    }, {
        Ld: "next",
        Kd: "back"
    }, {
        Ld: "prev",
        Kd: "back"
    }, {
        Ld: "prev",
        Kd: "front"
    }];
    function Ql(a) {
        this.Lb = [];
        this.i = a
    }
    w(Ql, Ui);
    Ql.prototype.Ia = function() {
        for (var a = [], b, c, d = 0; d < Pl.length; ++d) {
            c = Pl[d].Ld;
            b = Pl[d].Kd;
            var f = this.i;
            switch (c) {
            case "prev":
                c = f.Xa;
                break;
            case "left":
                c = f.ca;
                break;
            case "right":
                c = f.da;
                break;
            case "next":
                c = f.Va;
                break;
            default:
                throw Error("sheetName is wrong");
            }
            (b = c.qm(b)) && 0 != b.pageNumber() && a.push({
                me: b.pageNumber(),
                page: b
            })
        }
        return {
            Oc: a
        }
    }
    ;
    Ql.prototype.update = function() {
        for (var a = this.Ia().Oc, b = 0; b < a.length; ++b)
            a[b].page.reset();
        this.render(a)
    }
    ;
    Ql.prototype.R = function() {
        var a = this.i.document();
        x(a);
        return a
    }
    ;
    Ql.prototype.$d = function(a) {
        switch (a.Y) {
        case 3:
            break;
        case 2:
            break;
        case 1:
            break;
        case 0:
            a.Za.addHandler(function() {
                var a = this.Ia();
                this.render(a.Oc)
            }, this);
            a.render();
            break;
        default:
            throw Error("renderingState is wrong");
        }
    }
    ;
    function Rl(a) {
        X.call(this, [0], [1], a);
        this.bc = this.L = this.l = null;
        this.Ii = 0;
        this.a = null
    }
    w(Rl, X);
    Rl.prototype.Ge = function() {
        this.l.style.width = "0px";
        this.l.style.right = "0px";
        this.L.style.right = "0px";
        this.Co();
        this.Ii = parseInt(this.L.style.width, 10)
    }
    ;
    Rl.prototype.mb = function(a) {
        var b = this.Ii;
        a = Math.ceil(b * a[0]);
        this.l.style.width = b - a + "px";
        this.L.style.width = a + "px";
        2 != this.bc && 3 != this.bc && this.zo(a);
        var c = null
          , d = !1;
        1 == this.bc ? (c = 2 * a,
        d = c > b) : 2 == this.bc ? (c = 2 * b - a,
        d = a < b) : 3 == this.bc && (c = b - a,
        a > c && (c = a),
        d = !0);
        d && (x(c),
        this.a.$(c))
    }
    ;
    Rl.prototype.wd = function() {
        this.l.style.width = this.Ii + "px";
        this.no();
        this.dn();
        2 == this.bc && this.a.$(this.Ii)
    }
    ;
    function Sl(a) {
        Rl.call(this, a)
    }
    w(Sl, Rl);
    e = Sl.prototype;
    e.qb = function(a, b, c) {
        this.l = a.cm();
        this.L = a.om();
        this.a = b;
        this.bc = c
    }
    ;
    e.Co = function() {
        J(this.l, "back-flipping");
        J(this.L, "back-flipping")
    }
    ;
    e.no = function() {
        K(this.l, "back-flipping");
        K(this.L, "back-flipping")
    }
    ;
    e.zo = function(a) {
        this.l.style.left = a + "px";
        this.L.style.left = a + "px"
    }
    ;
    e.dn = function() {
        this.l.style.left = "";
        this.L.style.left = ""
    }
    ;
    var Tl = 1 / (1 - .9);
    function Ul(a, b) {
        X.call(this, [0], [1], a);
        this.Nb = b;
        this.a = this.M = this.bc = this.v = null
    }
    w(Ul, X);
    Ul.prototype.qb = function(a, b, c) {
        this.a = b;
        this.v = a;
        this.bc = c
    }
    ;
    Ul.prototype.Ge = function() {
        var a = this.v.width
          , b = this.v.height
          , c = document.createElement("canvas");
        c.className = "turn-shadow";
        c.width = a;
        c.height = b;
        c.style.width = a + "px";
        c.style.height = b + "px";
        this.M = c;
        zl(c, this.tn());
        this.a.pb().c(c);
        2 == this.bc ? this.sh(-(a / 2)) : this.sh(0);
        c.style.width = "0px"
    }
    ;
    Ul.prototype.mb = function(a) {
        a = a[0];
        var b = this.M
          , c = Math.ceil(this.v.width * a)
          , d = Math.min(c, 600);
        .9 <= a && (b.style.opacity = (1 - (a - .9) * Tl * .6).toFixed(2));
        b.style.width = d + "px";
        2 != this.bc && 3 != this.bc ? this.sh(c - d / 2) : this.sh(-(d / 2))
    }
    ;
    Ul.prototype.wd = function() {
        x(this.M);
        this.a.pb().removeChild(this.M)
    }
    ;
    function Vl(a, b) {
        Ul.call(this, a, b)
    }
    w(Vl, Ul);
    Vl.prototype.sh = function(a) {
        this.M.style.left = a + "px"
    }
    ;
    Vl.prototype.tn = function() {
        return 4
    }
    ;
    function Wl(a) {
        Rl.call(this, a)
    }
    w(Wl, Rl);
    e = Wl.prototype;
    e.qb = function(a, b, c) {
        this.l = a.om();
        this.L = a.cm();
        this.a = b;
        this.bc = c
    }
    ;
    e.Co = function() {
        J(this.l, "front-flipping");
        J(this.L, "front-flipping")
    }
    ;
    e.no = function() {
        K(this.l, "front-flipping");
        K(this.L, "front-flipping")
    }
    ;
    e.zo = function(a) {
        this.l.style.right = a + "px";
        this.L.style.right = a + "px"
    }
    ;
    e.dn = function() {
        this.l.style.right = "";
        this.L.style.right = ""
    }
    ;
    function Xl(a, b) {
        Ul.call(this, a, b)
    }
    w(Xl, Ul);
    Xl.prototype.sh = function(a) {
        this.M.style.right = a + "px"
    }
    ;
    Xl.prototype.tn = function() {
        return 3
    }
    ;
    function Yl(a, b) {
        Ai.call(this);
        this.Kl = a;
        this.Hr = b;
        this.add(a);
        this.add(b)
    }
    w(Yl, Ai);
    function Zl(a) {
        var b = z.Ws;
        this.i = a;
        this.Ci = null;
        this.Bi = new H;
        a = a.ck();
        this.Ak = new Yl(new Wl(b),new Xl(b,a));
        this.lk = new Yl(new Sl(b),new Vl(b,a));
        this.Ak.Kl.la.addHandler(this.Xm, this);
        this.lk.Kl.la.addHandler(this.Xm, this);
        this.Ak.la.addHandler(this.kk, this);
        this.lk.la.addHandler(this.kk, this)
    }
    Zl.prototype.play = function(a, b) {
        var c = 0 == a.Hp();
        this.Ci = b;
        b = this.i.tb;
        var d = this.i.Ff
          , f = this.i.o();
        d = Ll(d, f);
        b = Ll(b, f) ? d ? 3 : 1 : d ? 2 : null;
        f = this.i.view();
        d = this.i.$c();
        x(d);
        c = c ? this.Ak : this.lk;
        c.Kl.qb(a, f, b);
        c.Hr.qb(d, f, b);
        c.play()
    }
    ;
    Zl.prototype.Xm = function() {
        null !== this.Ci && (this.Ci(),
        this.Ci = null)
    }
    ;
    Zl.prototype.kk = function() {
        this.Bi.f()
    }
    ;
    function $l() {
        U.call(this, ["viewer", z.ef.className]);
        var a = this;
        this.jj = am("prev");
        this.c(this.jj);
        this.vh = new U("bookSpread");
        this.c(this.vh);
        this.Ga = new U("pageContainer");
        this.vh.c(this.Ga);
        this.Yi = am("next");
        this.c(this.Yi);
        this.Dc = new H;
        this.Ao = new H;
        this.Yi.D.addHandler(function() {
            return a.Dc.f()
        });
        this.jj.D.addHandler(function() {
            return a.Ao.f()
        })
    }
    m($l, U);
    e = $l.prototype;
    e.pb = function() {
        return this.Ga
    }
    ;
    e.$ = function(a) {
        this.Ga.$(a);
        this.vh.$(a)
    }
    ;
    e.qa = function(a) {
        this.Ga.qa(a);
        this.vh.qa(a)
    }
    ;
    e.tc = function(a) {
        var b = a.width() / z.zb;
        a = a.height() / z.bi;
        b = Math.min(b, a);
        a = this.jj.displayObject().firstElementChild;
        var c = this.Yi.displayObject().firstElementChild;
        x(a);
        x(c);
        1 > b ? (Kf(a, "right center"),
        vg(a, b),
        Kf(c, "left center"),
        vg(c, b)) : (Kf(a, ""),
        vg(a, 1),
        Kf(c, ""),
        vg(c, 1))
    }
    ;
    e.Ra = function() {
        return this.Ao
    }
    ;
    e.Qa = function() {
        return this.Dc
    }
    ;
    function am(a) {
        var b = new R({
            S: "spread"
        });
        b.Z("type", a);
        a = new R({
            J: S(b, "backLight")
        });
        b.c(a);
        var c = new R({
            J: S(b, "arrow")
        });
        a.c(c);
        return b
    }
    ;function bm(a, b, c) {
        var d = this
          , f = c.container;
        this.g = f;
        this.pj = b;
        this.oc = c.Gd;
        this.v = c.viewport;
        this.$b = this.v.scale / this.oc;
        this.Nb = c.ck;
        this.Wd = new H;
        var g = Jl(a, 0);
        this.l = new Ng(g,this.v,this.oc);
        (this.Na = c.si) && this.l.Za.addHandler(function() {
            var a = d.$b * si(d.l.$c());
            d.Na.render(d.l, d.oc, a, d.l.Fg);
            d.Wd.f(d.l)
        });
        f.c(this.l);
        g = Jl(a, 1);
        this.L = new Ng(g,this.v,this.oc);
        this.L.Za.addHandler(function() {
            this.Wd.f(this.L)
        }, this);
        f.c(this.L);
        0 == b ? (this.l.H("front"),
        Ug(this.l, 0),
        this.L.H("back"),
        Ug(this.L, 0)) : (this.l.H("back"),
        Ug(this.l, 1),
        this.L.H("front"),
        Ug(this.L, 1));
        this.Db = yl(this.Nb, this.l, 1);
        this.se = yl(this.Nb, this.L, 2)
    }
    e = bm.prototype;
    e.nm = function() {
        return this.l
    }
    ;
    e.bm = function() {
        return this.L
    }
    ;
    e.om = function() {
        return this.l.displayObject()
    }
    ;
    e.cm = function() {
        return this.L.displayObject()
    }
    ;
    e.Hp = function() {
        return this.pj
    }
    ;
    e.kg = function() {
        return this.Wd
    }
    ;
    e.G = function(a) {
        this.l.G(a);
        this.L.G(a);
        this.oc = a;
        this.v = this.v.clone({
            scale: this.$b * a
        });
        this.Db && (this.Db.style.width = this.v.width + "px",
        this.Db.style.height = this.v.height + "px");
        this.se && (this.se.style.width = this.v.width + "px",
        this.se.style.height = this.v.height + "px")
    }
    ;
    e.aa = function(a, b) {
        this.$b = a.scale / b;
        this.v = a;
        this.Db && (this.Db.style.width = this.v.width + "px",
        this.Db.style.height = this.v.height + "px");
        this.se && (this.se.style.width = this.v.width + "px",
        this.se.style.height = this.v.height + "px");
        this.l.aa(a, b);
        this.L.aa(a, b)
    }
    ;
    e.destroy = function() {
        this.ib(this.l);
        this.ib(this.L)
    }
    ;
    e.mi = function() {
        this.pj = 0 == this.pj ? 1 : 0;
        if (0 == this.pj) {
            var a = this.l;
            a.T("back");
            a.H("front");
            Ug(this.l, 0);
            a = this.L;
            a.T("front");
            a.H("back");
            Ug(this.L, 0)
        } else
            a = this.l,
            a.T("front"),
            a.H("back"),
            Ug(this.l, 1),
            a = this.L,
            a.T("back"),
            a.H("front"),
            Ug(this.L, 1)
    }
    ;
    e.Mc = function(a, b) {
        this.Cm(a);
        this.yj(b)
    }
    ;
    e.yj = function(a) {
        this.l.H(a);
        this.L.H(a)
    }
    ;
    e.Cm = function(a) {
        this.l.T(a);
        this.L.T(a)
    }
    ;
    e.qm = function(a) {
        switch (a) {
        case "front":
            a = this.l;
            break;
        case "back":
            a = this.L;
            break;
        default:
            throw Error("pageName is wrong");
        }
        return a
    }
    ;
    e.ai = function(a, b) {
        var c = this
          , d = 0 == a ? this.l : this.L
          , f = d.displayObject()
          , g = f.style.cssText
          , h = f.className;
        this.ib(d);
        b = Jl(b, a);
        0 == a ? (this.l = d = new Ng(b,this.v,this.oc),
        this.Na && this.l.Za.addHandler(function() {
            var a = c.$b * si(c.l.$c());
            c.Na.render(c.l, c.oc, a, c.l.Fg);
            c.Wd.f(c.l)
        }),
        this.Db = yl(this.Nb, this.l, 1)) : (this.L = d = new Ng(b,this.v,this.oc),
        this.se = yl(this.Nb, this.L, 2));
        f = d.displayObject();
        f.style.cssText = g;
        f.className = h;
        this.g.c(d)
    }
    ;
    e.ib = function(a) {
        null !== a && (this.g.removeChild(a),
        a.reset())
    }
    ;
    function cm(a, b) {
        var c = this
          , d = b.container;
        this.g = d;
        this.oc = b.Gd;
        this.v = b.viewport;
        this.$b = this.v.scale;
        this.Nb = b.ck;
        this.Wd = new H;
        this.Na = b.si;
        a = Jl(a, 0);
        this.l = new Ng(a,this.v,this.oc);
        this.Na && this.l.Za.addHandler(function() {
            var a = c.$b * si(c.l.$c());
            c.Na.render(c.l, c.oc, a, c.l.Fg);
            c.Wd.f(c.l)
        });
        this.l.Za.addHandler(function() {
            this.Wd.f(this.l)
        }, this);
        d.c(this.l);
        this.l.H("front");
        this.Db = yl(this.Nb, this.l, 1)
    }
    w(cm, bm);
    e = cm.prototype;
    e.kg = function() {
        return this.Wd
    }
    ;
    e.G = function(a) {
        this.l.G(a);
        this.oc = a;
        this.v = this.v.clone({
            scale: this.$b * a
        });
        this.Db && (this.Db.style.width = this.v.width + "px",
        this.Db.style.height = this.v.height + "px")
    }
    ;
    e.aa = function(a, b) {
        this.$b = a.scale / b;
        this.v = a;
        this.Db && (this.Db.style.width = this.v.width + "px",
        this.Db.style.height = this.v.height + "px");
        this.l.aa(a, b)
    }
    ;
    e.destroy = function() {
        this.ib(this.l)
    }
    ;
    e.yj = function(a) {
        this.l.H(a)
    }
    ;
    e.Cm = function(a) {
        this.l.T(a)
    }
    ;
    e.qm = function(a) {
        switch (a) {
        case "front":
            a = this.l;
            break;
        case "back":
            a = null;
            break;
        default:
            throw Error("pageName is wrong");
        }
        return a
    }
    ;
    function dm() {}
    e = dm.prototype;
    e.kg = function() {
        return new H
    }
    ;
    e.destroy = function() {}
    ;
    e.Mc = function() {}
    ;
    e.yj = function() {}
    ;
    e.Cm = function() {}
    ;
    e.mi = function() {}
    ;
    e.G = function() {}
    ;
    e.ai = function() {}
    ;
    e.qm = function() {}
    ;
    e.om = function() {}
    ;
    e.cm = function() {}
    ;
    e.nm = function() {}
    ;
    e.bm = function() {}
    ;
    e.aa = function() {}
    ;
    e.Hp = function() {}
    ;
    function em(a) {
        xi.call(this, a);
        this.a = null;
        this.Wa.addHandler(this.cr, this);
        this.de = this.tb = 0;
        this.Va = this.da = this.ca = this.Xa = null;
        this.uk = !0;
        this.Nb = new xl;
        this.Ya = new Ql(this);
        this.Ff = 0;
        this.wc = new oi(0,0);
        this.ve = new oi(0,0);
        this.Le = new Wc(0,0);
        this.vf = null;
        this.Zo = new H;
        this.Gh = new Zl(this);
        this.Gh.Bi.addHandler(this.Bo, this);
        this.Ec.addHandler(function() {
            var a = this.a.vh.displayObject();
            this.ba.Fa = a
        }, this)
    }
    w(em, xi);
    e = em.prototype;
    e.ck = function() {
        return this.Nb
    }
    ;
    e.view = function() {
        x(this.a);
        return this.a
    }
    ;
    e.Nc = function() {
        var a = []
          , b = this.ca.bm();
        b && (b = b.pageNumber() - 1,
        a.push(b));
        if (b = this.da.nm())
            b = b.pageNumber() - 1,
            a.push(b);
        return a
    }
    ;
    e.u = function(a) {
        if (wi(this, a) && 0 == this.Ff)
            if (this.C = a,
            a = Math.floor(a / 2 + 1),
            this.tb != a)
                if (this.Ff = a,
                this.uk)
                    this.Xa = fm(this, a, 0),
                    this.ca = fm(this, a, 1),
                    this.ca.kg().addHandler(this.oj, this),
                    this.da = fm(this, a, 2),
                    this.da.kg().addHandler(this.oj, this),
                    this.Va = fm(this, a, 3),
                    this.Bo(),
                    vi(this),
                    this.uk = !1;
                else {
                    switch (this.Kk(a)) {
                    case 0:
                        var b = this.Ir;
                        break;
                    case 2:
                        b = this.Jr;
                        break;
                    case 1:
                        b = this.wq;
                        break;
                    case 3:
                        b = this.yq;
                        break;
                    default:
                        throw Error("TransitionType is wrong");
                    }
                    b.call(this, a)
                }
            else
                this.kc()
    }
    ;
    e.bf = function() {
        1 >= this.C || this.u(this.C - (2 < this.C ? 2 : 1))
    }
    ;
    e.af = function() {
        if (!(this.C >= this.o())) {
            var a = 1 < this.o() - this.C ? 2 : 1;
            this.u(this.C + a)
        }
    }
    ;
    e.G = function(a) {
        this.Cb != a && 0 == this.Ff && (this.Cb = a,
        this.N = a * (this.$a - 1) + 1,
        this.K = this.K.clone({
            scale: this.$b * this.N
        }),
        gm(this),
        hm(this),
        this.ca.G(this.N),
        this.da.G(this.N),
        this.Xa.G(this.N),
        this.Va.G(this.N),
        this.Pf.f(this.Cb))
    }
    ;
    e.ne = function(a) {
        this.G(a);
        var b = this.a.pb().displayObject().getBoundingClientRect();
        a = b.width / this.Le.width;
        b = b.height / this.Le.height;
        a *= this.ve.x();
        b *= this.ve.y();
        var c = 1 < this.X ? z.ef.Qp : 0;
        Ol(this.g.displayObject(), a - this.wc.x() + z.ef.Om + c, b - this.wc.y() + z.ef.Om)
    }
    ;
    e.Hd = function(a, b) {
        var c = this.a.pb().displayObject().getBoundingClientRect();
        this.wc = new oi(a,b);
        this.ve = new oi(Math.max(a - c.left, 0),Math.max(b - c.top, 0));
        this.Le = new Wc(c.width,c.height)
    }
    ;
    e.resize = function(a) {
        this.Aa = a;
        this.Xb && (this.a.tc(a),
        this.N = this.Cb * (this.$a - 1) + 1,
        this.$b = this.Ua(this.vf),
        this.K = this.vf.clone({
            scale: this.$b * this.N
        }),
        gm(this),
        hm(this),
        this.ca.aa(this.K, this.N),
        this.da.aa(this.K, this.N),
        this.Xa.aa(this.K, this.N),
        this.Va.aa(this.K, this.N))
    }
    ;
    e.update = function() {
        this.Ya.update()
    }
    ;
    e.bb = function(a) {
        em.V.bb.call(this, a);
        this.de = Math.floor(this.o() / 2) + 1;
        a = this.Nb;
        var b = [1];
        0 == this.o() % 2 && b.push(this.o());
        a.Vl = b;
        this.vf = eh(this.lc)
    }
    ;
    e.enable = function(a) {
        this.a = new $l;
        x(this.Aa);
        this.a.tc(this.Aa);
        this.a.Ra().addHandler(this.bf, this);
        this.a.Qa().addHandler(this.af, this);
        1 == this.o() && this.a.H("onePage");
        this.container().c(this.a);
        var b = this.Ua(this.vf);
        this.K = this.vf.clone({
            scale: b
        });
        this.$b = this.K.scale;
        this.u(a);
        gm(this);
        hm(this)
    }
    ;
    e.disable = function() {
        em.V.disable.call(this);
        x(this.a);
        this.container().removeChild(this.a);
        this.a = null;
        im(this.Xa);
        im(this.ca);
        im(this.da);
        im(this.Va);
        this.g.displayObject().style.marginTop = "";
        this.tb = 0;
        this.uk = !0
    }
    ;
    e.mm = function() {}
    ;
    e.Hm = function() {}
    ;
    e.Zb = function() {
        var a = this.Ya.Ia();
        this.Ya.render(a.Oc)
    }
    ;
    e.Bo = function() {
        this.tb = this.Ff;
        this.Zb();
        this.kc();
        this.Ff = 0
    }
    ;
    e.Ir = function(a) {
        var b = this;
        x(this.da);
        this.Gh.play(this.da, function() {
            im(b.Xa);
            b.ca.Mc("left", "prev");
            b.Xa = b.ca;
            b.da.mi();
            b.da.Mc("right", "left");
            b.ca = b.da;
            b.Va.Mc("next", "right");
            b.da = b.Va;
            b.Va = fm(b, a, 3)
        })
    }
    ;
    e.Jr = function(a) {
        var b = this;
        x(this.ca);
        this.Gh.play(this.ca, function() {
            im(b.Va);
            b.da.Mc("right", "next");
            b.Va = b.da;
            b.ca.mi();
            b.ca.Mc("left", "right");
            b.da = b.ca;
            b.Xa.Mc("prev", "left");
            b.ca = b.Xa;
            b.Xa = fm(b, a, 0)
        })
    }
    ;
    e.wq = function(a) {
        var b = this;
        im(this.Xa);
        im(this.Va);
        var c = Kl(a, 1);
        this.da.ai(1, c);
        this.Va = fm(this, a, 2);
        x(this.da);
        this.Gh.play(this.da, function() {
            im(b.ca);
            b.da.mi();
            b.da.Mc("right", "left");
            b.ca = b.da;
            b.ca.ai(0, c);
            b.Va.Mc("next", "right");
            b.da = b.Va;
            b.Va = fm(b, a, 3);
            b.Xa = fm(b, a, 0)
        })
    }
    ;
    e.yq = function(a) {
        var b = this;
        im(this.Xa);
        im(this.Va);
        var c = Kl(a, 2);
        this.ca.ai(0, c);
        this.Xa = fm(this, a, 1);
        x(this.ca);
        this.Gh.play(this.ca, function() {
            im(b.da);
            b.ca.mi();
            b.ca.Mc("left", "right");
            b.da = b.ca;
            b.da.ai(1, c);
            b.Xa.Mc("prev", "left");
            b.ca = b.Xa;
            b.Xa = fm(b, a, 0);
            b.Va = fm(b, a, 3)
        })
    }
    ;
    function im(a) {
        a && a.destroy()
    }
    e.oj = function() {
        var a = this.ca.bm();
        a && 3 != a.Y || (a = this.da.nm(),
        a && 3 != a.Y || (this.Zo.f(),
        this.ca.kg().removeHandler(this.oj, this),
        this.da.kg().removeHandler(this.oj, this)))
    }
    ;
    e.Kk = function(a) {
        var b = this.tb;
        return a > b ? a == b + 1 ? 0 : 1 : a == b - 1 ? 2 : 3
    }
    ;
    function fm(a, b, c) {
        b = Kl(b, c);
        switch (c) {
        case 0:
        case 1:
            var d = 1;
            break;
        case 2:
        case 3:
            d = 0;
            break;
        default:
            throw Error("bookSheetId is wrong");
        }
        var f = {
            container: a.a.pb(),
            Gd: a.N,
            viewport: a.K,
            ck: a.Nb,
            si: a.Na
        };
        a = 0 < b && b < a.de ? new bm(b,d,f) : 0 == a.o() % 2 || b != a.de ? new dm : new cm(b,f);
        switch (c) {
        case 0:
            c = "prev";
            break;
        case 1:
            c = "left";
            break;
        case 2:
            c = "right";
            break;
        case 3:
            c = "next";
            break;
        default:
            throw Error("bookSheetId is wrong");
        }
        a.yj(c);
        return a
    }
    e.Ua = function(a) {
        var b = z.ef.Om
          , c = z.ef.Qp
          , d = this.Aa.width() - 2 * b;
        1 < this.o() && (d -= 2 * c);
        2 < this.o() && (d /= 2);
        c = d / a.width;
        a = (this.Aa.height() - 2 * b) / a.height;
        return Math.min(a, c)
    }
    ;
    function gm(a) {
        var b = Math.floor(a.K.width)
          , c = Math.floor(a.K.height);
        Ll(a.tb, a.o()) || (b *= 2);
        a.a.$(b);
        a.a.qa(c)
    }
    function hm(a) {
        var b = Math.round(a.K.height);
        b = (a.Aa.height() - b - 18) / 2;
        0 < b ? a.g.displayObject().style.marginTop = b + "px" : a.g.displayObject().style.marginTop = ""
    }
    e.cr = function(a) {
        this.a.jj.Z("invisible", !(1 < a));
        this.a.Yi.Z("invisible", !(Math.floor(a / 2 + 1) < this.de))
    }
    ;
    var jm = Vb();
    jm.Fm = !1;
    Xb(jm.ik, {
        Xc: 3,
        ki: 3,
        lg: 3,
        bg: 6,
        og: 7,
        cg: 34
    });
    Xb(jm.hk, {
        ki: 4
    });
    function km(a) {
        var b = new U("btn","BUTTON");
        a = new U(["icon", a]);
        b.c(a);
        return b
    }
    ;function lm(a) {
        U.call(this, "pageNavigationToolbarContainer");
        this.X = 0;
        this.pl = new H;
        this.If = km("previous");
        a && this.If.qg(a.ja("PB_ACCESSIBILITY_GOTO_PREV"));
        this.c(this.If);
        var b = new U("pageNumber");
        this.c(b);
        var c = new U("view");
        b.c(c);
        N && gg ? b = new U("currentPage mobile","DIV") : (b = new U("currentPage","INPUT"),
        b.setAttribute("type", "text"),
        b.setAttribute("maxlength", "4"),
        D(b.displayObject(), "keydown", this.Vq, !1, this),
        D(b.displayObject(), "keyup", this.Vn, !1, this),
        D(b.displayObject(), "paste", this.Wq, !1, this),
        D(b.displayObject(), "input", this.Uq, !1, this));
        this.bj = b;
        a && this.bj.qg(a.ja("PB_ACCESSIBILITY_CURRENT_PAGE"));
        c.c(this.bj);
        b = document.createTextNode("\u00a0/\u00a0");
        cd(c.displayObject(), b);
        this.Ce = new U("pagesCount","SPAN");
        c.c(this.Ce);
        this.Ef = km("next");
        a && this.Ef.qg(a.ja("PB_ACCESSIBILITY_GOTO_NEXT"));
        this.c(this.Ef)
    }
    w(lm, U);
    e = lm.prototype;
    e.ra = function(a) {
        this.X = a;
        this.Ce.U(a.toString())
    }
    ;
    e.u = function(a) {
        this.If.Pa(1 != a);
        this.Ef.Pa(a != this.X);
        N && gg ? this.bj.U(a.toString()) : this.bj.displayObject().value = a.toString()
    }
    ;
    e.vc = function(a) {
        var b = this.If.displayObject().firstElementChild
          , c = this.Ef.displayObject().firstElementChild;
        switch (a) {
        case 1:
            J(b, "up");
            J(c, "down");
            break;
        case 2:
            K(b, "up"),
            K(c, "down")
        }
    }
    ;
    e.Uq = function(a) {
        var b = a.target.value;
        b.match(/[^0-9]/g) && (a.target.value = b.replace(/[^0-9]/g, ""))
    }
    ;
    e.Vq = function(a) {
        a.stopPropagation();
        mm(a) && a.preventDefault();
        var b = a.which || a.keyCode;
        B && 10 >= parseInt(sc, 10) && 13 == b && (a.preventDefault(),
        this.Vn(a))
    }
    ;
    e.Vn = function(a) {
        13 == a.keyCode && (a = nm(a.target.value),
        isNaN(a) || this.pl.f(a))
    }
    ;
    e.Wq = function(a) {
        var b = nm((a.Oa.clipboardData || window.clipboardData).getData("text"));
        isNaN(b) && a.preventDefault()
    }
    ;
    function mm(a) {
        switch (a.which || a.keyCode) {
        case 9:
            return !1;
        case 8:
        case 46:
        case 48:
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
        case 96:
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
            return a.shiftKey || a.metaKey;
        case 13:
            return !1;
        case 65:
        case 67:
        case 88:
        case 86:
            return !0 !== a.ctrlKey;
        case 37:
        case 39:
            return !1
        }
        return !0
    }
    function nm(a) {
        return /^\d+$/.test(a) ? parseInt(a, 10) : NaN
    }
    ;function om() {
        U.call(this, "viewerToolbarContainer");
        this.di(!0);
        this.Vf = km("thumbnail");
        this.c(this.Vf);
        this.Jh = km("viewMode");
        this.c(this.Jh);
        this.tf = km("fullscreen");
        this.c(this.tf)
    }
    w(om, U);
    e = om.prototype;
    e.vc = function(a) {
        var b = this.Jh.displayObject().firstElementChild;
        switch (a) {
        case 1:
            K(b, "book");
            J(b, "pages");
            break;
        case 2:
            K(b, "pages"),
            J(b, "book")
        }
    }
    ;
    e.cd = function(a) {
        var b = this.tf.displayObject().firstElementChild;
        a ? J(b, "selected") : K(b, "selected")
    }
    ;
    e.ed = function(a) {
        var b = this.Vf.displayObject().firstElementChild;
        switch (a) {
        case 1:
            J(b, "open");
            break;
        case 0:
            K(b, "open")
        }
    }
    ;
    e.G = function(a) {
        this.Vf.Pa(0 == a)
    }
    ;
    e.uc = function(a) {
        this.Vf.Pa(a)
    }
    ;
    e.fd = function(a) {
        this.Jh.Pa(a)
    }
    ;
    e.bd = function(a) {
        this.tf.Pa(a)
    }
    ;
    e.ad = function() {
        this.removeChild(this.tf)
    }
    ;
    function pm() {
        U.call(this, ["toolbar", "mobile", "hidden"]);
        this.Yf = 1;
        this.ea = new W(0,0);
        var a = new U("toolbarCenter");
        this.Hb = new lm(null);
        a.c(this.Hb);
        this.pa = new om;
        a.c(this.pa);
        this.c(a)
    }
    w(pm, U);
    e = pm.prototype;
    e.width = function() {
        return this.ea.width()
    }
    ;
    e.height = function() {
        return this.ea.height()
    }
    ;
    e.ra = function(a) {
        this.Hb.ra(a)
    }
    ;
    e.u = function(a) {
        this.Hb.u(a)
    }
    ;
    e.vc = function(a) {
        this.pa.vc(a)
    }
    ;
    e.cd = function(a) {
        this.pa.cd(a)
    }
    ;
    e.ed = function(a) {
        this.pa.ed(a)
    }
    ;
    e.G = function(a) {
        this.pa.G(a)
    }
    ;
    e.tc = function(a) {
        var b = a.width() / z.zb
          , c = a.height() / z.bi;
        b = Math.min(b, c);
        c = a.width();
        var d = z.cb;
        1 > b ? (Kf(this.displayObject(), "left bottom"),
        vg(this.displayObject(), b),
        d = Math.floor(z.cb * b),
        this.$(a.width() * (1 / b))) : (Kf(this.displayObject(), ""),
        vg(this.displayObject(), 1),
        T(this, "width", ""));
        this.Yf = Math.min(1, b);
        this.ea = new W(c,d)
    }
    ;
    e.uc = function(a) {
        this.pa.uc(a)
    }
    ;
    e.fd = function(a) {
        this.pa.fd(a)
    }
    ;
    e.bd = function(a) {
        this.pa.bd(a)
    }
    ;
    e.df = function() {
        return this.pa.Jh.D
    }
    ;
    e.Ra = function() {
        return this.Hb.If.D
    }
    ;
    e.Qa = function() {
        return this.Hb.Ef.D
    }
    ;
    e.Ab = function() {
        return this.Hb.pl
    }
    ;
    e.Rb = function() {
        return this.pa.tf.D
    }
    ;
    e.cf = function() {
        return this.pa.Vf.D
    }
    ;
    e.ad = function() {
        this.pa.ad()
    }
    ;
    function qm(a, b) {
        U.call(this, "mainContainer");
        this.ea = new W(0,0);
        this.Af = new U("loaderIcon");
        this.c(this.Af);
        this.fa = new U("viewerContainer");
        this.c(this.fa);
        this.s = new pm;
        this.c(this.s);
        this.Fq = new H;
        this.tc(new W(a,b));
        a = new Kj(this.fa.displayObject());
        D(a, "mousewheel", this.Rl, !1, this)
    }
    w(qm, U);
    e = qm.prototype;
    e.ra = function(a) {
        this.s.ra(a)
    }
    ;
    e.u = function(a) {
        this.s.u(a)
    }
    ;
    e.eb = function() {
        return new W(this.ea.width(),this.ea.height() - this.s.height())
    }
    ;
    e.cb = function() {
        return this.s.height()
    }
    ;
    e.vc = function(a) {
        this.s.vc(a)
    }
    ;
    e.cd = function(a) {
        this.s.cd(a)
    }
    ;
    e.ed = function(a) {
        this.s.ed(a)
    }
    ;
    e.G = function(a) {
        this.s.G(a)
    }
    ;
    e.tc = function(a) {
        this.ea = a;
        this.resize(a.width(), a.height());
        this.s.tc(a);
        a = Math.round(this.s.height());
        T(this.fa, "bottom", a + "px")
    }
    ;
    e.df = function() {
        return this.s.df()
    }
    ;
    e.Ra = function() {
        return this.s.Ra()
    }
    ;
    e.Qa = function() {
        return this.s.Qa()
    }
    ;
    e.Ab = function() {
        return this.s.Ab()
    }
    ;
    e.Rb = function() {
        return this.s.Rb()
    }
    ;
    e.sg = function() {
        return new H
    }
    ;
    e.cf = function() {
        return this.s.cf()
    }
    ;
    e.Nm = function() {
        this.s.T("hidden")
    }
    ;
    e.ad = function() {
        this.s.ad()
    }
    ;
    e.Ej = function() {}
    ;
    e.uc = function(a) {
        this.s.uc(a)
    }
    ;
    e.fd = function(a) {
        this.s.fd(a)
    }
    ;
    e.bd = function(a) {
        this.s.bd(a)
    }
    ;
    e.Rl = function(a) {
        this.Fq.f(a.Oa)
    }
    ;
    function rm(a, b, c) {
        var d = new oh;
        this.a = new qm(a.clientWidth,a.clientHeight);
        bd(a, this.a.wa);
        Z.call(this, a, b, 2, jm, d, c);
        this.Ng = new Hh(this.a);
        this.yh = this.mf = this.Cc = 0;
        this.La = new Ph;
        this.La.Ra().addHandler(this.Vc, this);
        this.La.Qa().addHandler(this.Tc, this);
        this.La.Ab().addHandler(this.ce, this);
        this.La.Rb().addHandler(this.nd, this);
        this.ma = new Oh(this.a.fa);
        this.ma.$l.addHandler(this.am, this);
        this.ma.wg().addHandler(this.Kh, this);
        this.ma.Ke.xl.addHandler(this.Xl, this);
        this.ma.Ra().addHandler(this.Vc, this);
        this.ma.Qa().addHandler(this.Tc, this);
        this.a.df().addHandler(this.Pl, this);
        this.a.Ra().addHandler(this.Vc, this);
        this.a.Qa().addHandler(this.Tc, this);
        this.a.Ab().addHandler(this.ce, this);
        this.a.Rb().addHandler(this.nd, this);
        this.a.cf().addHandler(this.Ql, this);
        this.a.G(0);
        this.Ac(1, Yi);
        this.Ac(2, em);
        this.Zd(1, Bl, jm.hk);
        this.Zd(2, Ml, jm.ik);
        this.kh()
    }
    w(rm, Z);
    rm.prototype.view = function() {
        return this.a
    }
    ;
    rm.prototype.resize = function(a, b) {
        this.Cc && clearTimeout(this.Cc);
        this.ea = new W(a,b);
        this.a.tc(this.ea);
        this.Ja && this.Ja.aa(this.ea);
        this.oa.Jj && (this.P.resize(),
        this.j.resize(this.Sd()),
        this.Cc = setTimeout(this.Ll.bind(this), jm.Dm));
        document.body.scrollTop = 0
    }
    ;
    rm.prototype.Nc = function() {
        return this.j.Nc()
    }
    ;
    rm.prototype.viewPages = rm.prototype.Nc;
    e = rm.prototype;
    e.Ll = function() {
        this.j.update();
        this.P.update()
    }
    ;
    e.Wb = function(a) {
        rm.V.Wb.call(this, a);
        this.P.enable(this.oa.Da);
        this.P.view().H("tablet");
        this.j.resize(this.Sd());
        this.j.enable(this.oa.Da);
        this.a.vc(a)
    }
    ;
    e.kh = function() {
        if (window.location.hash) {
            var a = this.jh(window.location.hash.substring(1));
            "page"in a && (this.oa.Da = parseInt(a.page, 10));
            if ("mode"in a)
                switch (a.mode) {
                case "book":
                    this.Ub = 2;
                    break;
                case "pages":
                    this.Ub = 1
                }
        }
    }
    ;
    e.jh = function(a) {
        a = a.split("&");
        for (var b = {}, c = 0; c < a.length; ++c) {
            var d = a[c].split("=");
            b[decodeURIComponent(d[0].toLowerCase())] = 1 < d.length ? decodeURIComponent(d[1]) : null
        }
        return b
    }
    ;
    e.Vc = function() {
        this.j.bf()
    }
    ;
    e.Tc = function() {
        this.j.af()
    }
    ;
    e.Pl = function() {
        switch (this.Ub) {
        case 2:
            this.Wb(1);
            break;
        case 1:
            this.Wb(2)
        }
    }
    ;
    e.Sd = function() {
        var a = this.a.eb()
          , b = a.height();
        this.P instanceof Ml && 0 != this.P.state() && (b -= this.P.height());
        return new W(a.width(),b)
    }
    ;
    e.ce = function(a) {
        this.j.u(a)
    }
    ;
    e.nd = function() {
        this.Ng.toggle()
    }
    ;
    e.Ac = function(a, b) {
        rm.V.Ac.call(this, a, b);
        if (b = this.Gb.si())
            this.ua[a].Na = b;
        this.ua[a].Zj(this.Gb.Ye());
        this.ua[a].Pf.addHandler(this.Tl, this);
        this.ua[a].Ec.addHandler(this.Ul, this)
    }
    ;
    e.Zd = function(a, b, c) {
        rm.V.Zd.call(this, a, b, c);
        this.kb[a].Wa.addHandler(this.El, this);
        this.kb[a].ee.addHandler(this.Fl, this);
        this.kb[a].Ec.addHandler(this.Gl, this)
    }
    ;
    e.rd = function(a) {
        rm.V.rd.call(this, a);
        xh(a, this.Qc);
        var b = a.o();
        this.a.u(1);
        this.a.ra(b);
        this.ua[2].bb(a);
        this.ua[1].bb(a);
        this.kb[2].bb(a);
        this.kb[1].bb(a);
        a = this.kb[2];
        a instanceof Ml && a.bk(this.ua[2]);
        this.Wb(this.Ub);
        this.La.ra(b);
        1 == b && (this.a.uc(!1),
        this.a.fd(!1));
        Ij(this)
    }
    ;
    e.Se = function(a) {
        rm.V.Se.call(this, a);
        this.a.u(a);
        null !== this.P && this.P.u(a);
        this.kc(a)
    }
    ;
    e.Tl = function(a) {
        this.a.G(a);
        0 < a ? (this.ba.Sb() || this.ba.enable(),
        1 == this.P.state() && this.P.tm(),
        a = this.ma,
        a.qd && (Ge(a.Ae),
        a.qd = !1),
        a = this.ma,
        a.Ud && (Ge(a.Df),
        a.Ud = !1)) : (this.ba.Sb() && this.ba.disable(),
        2 == this.P.state() && this.P.show(),
        1 == this.R.o() && this.a.uc(!1),
        a = this.ma,
        a.qd || (Fe(a.Ae),
        a.qd = !0),
        a = this.ma,
        a.Ud || (Fe(a.Df),
        a.Ud = !0))
    }
    ;
    e.Ul = function() {
        this.j.G(0);
        this.a.G(0);
        this.ba.Sb() && this.ba.disable()
    }
    ;
    e.El = function(a) {
        this.oa.Da = a;
        this.a.u(a);
        this.j.u(a)
    }
    ;
    e.Fl = function(a) {
        this.oa.dk = a;
        this.a.ed(a)
    }
    ;
    e.Gl = function() {
        1 == this.oa.dk ? this.P.open() : this.P.close()
    }
    ;
    e.Ql = function() {
        this.P.toggle(!0)
    }
    ;
    e.am = function(a, b) {
        this.yh = this.j.Gd();
        this.j.Hd(a, b)
    }
    ;
    e.Kh = function(a) {
        a = this.uf(this.yh * a);
        a = cb(a, jm.Xe, jm.We);
        this.j.ne(a)
    }
    ;
    e.Xl = function() {
        this.j.update()
    }
    ;
    e.uf = function(a) {
        return (a - 1) / (this.j.$a - 1)
    }
    ;
    function sm() {
        var a = null
          , b = null;
        this.sl = new Promise(function(c, d) {
            a = c;
            b = d
        }
        );
        this.ro = a;
        this.tl = b
    }
    e = sm.prototype;
    e.resolveFunc = function() {
        return x(this.ro)
    }
    ;
    e.rejectFunc = function() {
        return x(this.tl)
    }
    ;
    e.resolve = function(a) {
        x(this.ro)(a)
    }
    ;
    e.reject = function(a) {
        x(this.tl)(a)
    }
    ;
    e.cancel = function() {
        x(this.tl)("canceled")
    }
    ;
    e.then = function(a, b) {
        return this.sl.then(a, b)
    }
    ;
    e.catch = function(a) {
        return this.sl.catch(a)
    }
    ;
    e.toPromise = function() {
        return this.sl
    }
    ;
    function tm() {}
    tm.prototype.cancel = function() {}
    ;
    var um = {
        Yj: "cefclientSendQuery",
        Ap: "cefclientCancelQuery",
        pg: "cefclientSendCallbackResult",
        Fs: "cefclientDispatch",
        Es: "cefclientDispatchCancel"
    };
    function vm() {
        if (!wm(um.Yj) || !wm(um.Ap) || !wm(um.pg))
            throw Error("Cef interaction functions not found");
        this.vr = window[um.Yj];
        this.ur = window[um.Ap];
        this.wr = window[um.pg];
        this.mo = new H;
        this.lo = new H;
        window[um.Fs] = this.ir.bind(this);
        window[um.Es] = this.gr.bind(this)
    }
    e = vm.prototype;
    e.Am = function() {
        return this.mo
    }
    ;
    e.Yj = function(a, b, c, d) {
        return this.vr(a, b, c, d)
    }
    ;
    e.pg = function(a, b, c, d) {
        this.wr(a, b, c, d)
    }
    ;
    e.ir = function(a, b, c) {
        this.mo.f(a, b, c)
    }
    ;
    e.gr = function(a) {
        this.lo.f(a)
    }
    ;
    function wm(a) {
        return window[a] && "function" === typeof window[a]
    }
    ;function xm() {
        this.Md = new vm;
        this.Ka = {};
        this.Dg = {};
        this.Md.Am().addHandler(this.hr, this);
        this.Md.lo.addHandler(this.fr, this)
    }
    e = xm.prototype;
    e.Am = function() {
        return this.Md.Am()
    }
    ;
    e.call = function(a, b) {
        for (var c = [], d = 1; d < arguments.length; ++d)
            c[d - 1] = arguments[d];
        var f = new sm;
        c = this.Md.Yj(a, c, f.resolveFunc(), function(b, c) {
            f.rejectFunc()("cef.Client call '" + a + "' failed: " + c)
        });
        f.catch(this.er.bind(this, c));
        return f
    }
    ;
    e.addHandler = function(a, b, c) {
        this.Ka[a] = b.bind(c)
    }
    ;
    e.removeHandler = function(a) {
        delete this.Ka[a]
    }
    ;
    e.er = function(a, b) {
        "canceled" == b && this.Md.ur(a)
    }
    ;
    e.hr = function(a, b, c) {
        var d = this;
        if (this.Ka[a]) {
            this.Dg[b] = new tm;
            var f = this.Ka[a];
            try {
                var g = f.apply(f, [this.Dg[b]].concat(c));
                var h = "function" === typeof g ? new Promise(g) : new Promise(function(a) {
                    return a(g)
                }
                )
            } catch (k) {
                h = new Promise(function(a, b) {
                    b(k)
                }
                )
            }
            h.then(function(c) {
                d.Md.pg(b, a, !0, c);
                delete d.Dg[b]
            }, function(c) {
                d.Md.pg(b, a, !1, ym(c));
                delete d.Dg[b]
            })
        } else
            c = "Request " + a + " have no handler",
            this.Md.pg(b, a, !1, ym(Error(c))),
            n.console.error(c)
    }
    ;
    e.fr = function(a) {
        this.Dg[a].cancel()
    }
    ;
    function ym(a) {
        try {
            return "object" == typeof a && void 0 !== a.message && void 0 !== a.stack ? '"' + a.message + '", stack:\n' + a.stack : "<" + typeof a + "> " + a
        } catch (b) {
            return "error while printing error: " + b
        }
    }
    ;var zm = function() {
        if (kc) {
            var a = /Windows NT ([0-9.]+)/;
            return (a = a.exec(Kb)) ? a[1] : "0"
        }
        return jc ? (a = /10[_.][0-9_.]+/,
        (a = a.exec(Kb)) ? a[0].replace(/_/g, ".") : "10") : mc ? (a = /Android\s+([^\);]+)(\)|;)/,
        (a = a.exec(Kb)) ? a[1] : "") : nc || oc || pc ? (a = /(?:iPhone|CPU)\s+OS\s+(\S+)/,
        (a = a.exec(Kb)) ? a[1].replace(/_/g, ".") : "") : ""
    }();
    function Am(a) {
        return (a = a.exec(Kb)) ? a[1] : ""
    }
    var Bm = function() {
        if (pf)
            return Am(/Firefox\/([0-9.]+)/);
        if (B || fc || ec)
            return sc;
        if (tf)
            return ac() ? Am(/CriOS\/([0-9.]+)/) : Am(/Chrome\/([0-9.]+)/);
        if (uf && !ac())
            return Am(/Version\/([0-9.]+)/);
        if (qf || rf) {
            var a = /Version\/(\S+).*Mobile\/(\S+)/.exec(Kb);
            if (a)
                return a[1] + "." + a[2]
        } else if (sf)
            return (a = Am(/Android\s+([0-9.]+)/)) ? a : Am(/Version\/([0-9.]+)/);
        return ""
    }();
    function Cm(a, b, c, d, f) {
        ci.call(this, b, c, d, f);
        this.element = a
    }
    w(Cm, ci);
    Cm.prototype.ek = va;
    Cm.prototype.Oj = function() {
        this.ek();
        Cm.V.Oj.call(this)
    }
    ;
    Cm.prototype.Zh = function() {
        this.ek();
        Cm.V.Zh.call(this)
    }
    ;
    Cm.prototype.Pj = function() {
        this.ek();
        Cm.V.Pj.call(this)
    }
    ;
    function Dm(a, b, c, d, f) {
        if (2 != b.length || 2 != c.length)
            throw Error("Start and end points must be 2D");
        Cm.apply(this, arguments)
    }
    w(Dm, Cm);
    Dm.prototype.ek = function() {
        if (this.Xs) {
            var a = this.element
              , b = Math.round(this.coords[0]);
            b = Math.max(b, 0);
            if ("rtl" == Te(a)) {
                var c;
                if (c = uf)
                    c = 0 <= Gb(Bm, 10);
                var d;
                if (d = qc)
                    d = 0 <= Gb(zm, 10);
                a.scrollLeft = hc || c || d ? -b : gc && wc("8") ? b : a.scrollWidth - b - a.clientWidth
            } else
                a.scrollLeft = b
        } else
            this.element.scrollLeft = Math.round(this.coords[0]);
        this.element.scrollTop = Math.round(this.coords[1])
    }
    ;
    function Em(a, b) {
        Dm.call(this, a, [0, 0], [0, 0], b)
    }
    w(Em, Dm);
    function Fm(a, b, c) {
        this.xa = a || 0;
        this.Er = b || 0;
        this.zq = c || 0
    }
    Fm.prototype.pageNumber = function() {
        return this.xa
    }
    ;
    Fm.prototype.top = function() {
        return this.Er
    }
    ;
    Fm.prototype.left = function() {
        return this.zq
    }
    ;
    function Gm(a) {
        this.Lb = [];
        this.i = a;
        this.Be = [];
        this.xn = !0
    }
    w(Gm, Ui);
    Gm.prototype.Ia = function() {
        for (var a = this.i, b = ui(a), c = b.scrollTop, d = c + b.clientHeight, f = b = Hm(this, c), g = [], h = a.o(), k, u, q, y, I = b; I < h; ++I) {
            k = a.getPage(I);
            u = k.displayObject();
            q = u.offsetTop + u.clientTop;
            if (q > d)
                break;
            y = u.offsetLeft + u.clientLeft;
            f = u.clientHeight;
            u = Math.max(0, c - q) + Math.max(0, q + f - d);
            u = 100 * (f - u) / f | 0;
            f = I;
            g.push({
                me: k.pageNumber(),
                top: q,
                left: y,
                page: k,
                Sj: u
            })
        }
        c = g[0];
        g.sort(function(a, b) {
            var c = a.Sj - b.Sj;
            return .001 < Math.abs(c) ? -c : a.id - b.id
        });
        a.be.op && f + 1 <= h - 1 && g.push({
            me: f + 2,
            page: a.getPage(f + 1),
            Sj: 0
        });
        0 < b && g.push({
            me: b - 1,
            page: a.getPage(b - 1),
            Sj: 0
        });
        return {
            Vs: c,
            Oc: g
        }
    }
    ;
    Gm.prototype.update = function() {
        for (var a = 0; a < this.Be.length; ++a)
            this.Be[a].reset();
        a = this.Ia();
        this.render(a.Oc)
    }
    ;
    Gm.prototype.R = function() {
        var a = this.i.document();
        x(a);
        return a
    }
    ;
    Gm.prototype.$d = function(a) {
        switch (a.Y) {
        case 3:
            break;
        case 2:
            break;
        case 1:
            break;
        case 0:
            Im(this, a);
            a.Za.addHandler(function() {
                var b = this.Ia();
                this.xn && a.focus();
                this.xn = !1;
                this.render(b.Oc)
            }, this);
            a.render();
            break;
        default:
            throw Error("renderingState is wrong");
        }
    }
    ;
    function Im(a, b) {
        var c = a.Be.indexOf(b);
        0 <= c && a.Be.splice(c, 1);
        a.Be.push(b);
        10 < a.Be.length && a.Be.shift().destroy()
    }
    function Hm(a, b) {
        function c(a) {
            a = a.displayObject();
            return a.offsetTop + a.clientTop + a.clientHeight > b
        }
        a = a.i;
        var d = 0
          , f = a.o() - 1
          , g = a.getPage(d);
        x(g);
        if (c(g))
            return d;
        for (; d < f; ) {
            var h = d + f >> 1;
            g = a.getPage(h);
            x(g);
            c(g) ? f = h : d = h + 1
        }
        return d
    }
    ;function Jm() {
        U.call(this, ["viewer", z.qe.className]);
        this.i = null
    }
    w(Jm, U);
    Jm.prototype.ji = function(a) {
        this.i = a
    }
    ;
    Jm.prototype.pb = function() {
        return this
    }
    ;
    function Km(a) {
        xi.call(this, a);
        this.a = null;
        this.$o = 0;
        this.ha = [];
        this.ff = 0;
        this.Ya = new Gm(this);
        this.be = {
            op: !0,
            xm: 0,
            position: 0
        };
        this.Hi = !0;
        this.Tk = !1;
        this.nc = 0;
        this.Hn = new Fm;
        this.vf = null;
        this.Td = !1;
        this.wc = new oi(0,0);
        this.vo = new Em(a.displayObject(),z.Ks);
        D(this.vo, "finish", this.wo, !1, this);
        this.Ec.addHandler(function() {
            var a = this.a.displayObject();
            this.ba.Fa = a
        }, this)
    }
    w(Km, xi);
    e = Km.prototype;
    e.mm = function() {
        this.ha[this.C - 1].focus()
    }
    ;
    e.Hm = function(a) {
        this.Td = a
    }
    ;
    e.view = function() {
        x(this.a);
        return this.a
    }
    ;
    e.Nc = function() {
        return [this.C - 1]
    }
    ;
    e.u = function(a) {
        if (wi(this, a) && 0 == this.nc) {
            var b = ui(this)
              , c = this.ha[a - 1].displayObject()
              , d = b.scrollTop;
            c = c.offsetTop + c.clientTop - z.qe.Ea;
            this.nc = a;
            this.Tk = !0;
            this.Hi ? (b.scrollTop = c,
            this.be.position = c / b.scrollHeight,
            this.Hi = !1,
            this.wo()) : (a = this.vo,
            a.tg = [0, d],
            a.kp = [0, c],
            a.play(!0))
        }
    }
    ;
    e.bf = function() {
        1 >= this.C || this.u(this.C - 1)
    }
    ;
    e.af = function() {
        this.C >= this.o() || this.u(this.C + 1)
    }
    ;
    e.getPage = function(a) {
        if (0 > a || a > this.o())
            throw Error("PageNumber is wrong");
        return this.ha[a]
    }
    ;
    e.G = function(a) {
        if (this.Cb != a && 0 == this.nc) {
            var b = this.N;
            this.Cb = a;
            this.N = a * (this.$a - 1) + 1;
            for (a = 0; a < this.ha.length; ++a)
                this.ha[a].G(this.N);
            Lm(this);
            this.Pf.f(this.Cb);
            Mm(this, .5, this.N / b - 1)
        }
    }
    ;
    e.ne = function(a) {
        var b = this.N;
        this.G(a);
        var c = ui(this);
        a = this.a.pb().displayObject().getBoundingClientRect();
        var d = c.getBoundingClientRect();
        c = Math.min(this.wc.x(), a.right);
        c = Math.max(c, a.left);
        c = (c - a.left) / a.width;
        a = this.wc.y() / d.height;
        Mm(this, c, a * (this.N / b - 1) * 2)
    }
    ;
    e.Hd = function(a, b) {
        this.wc = new oi(a,b)
    }
    ;
    e.resize = function(a) {
        this.Aa = a;
        this.Ml();
        if (this.Xb) {
            this.N = this.Cb * (this.$a - 1) + 1;
            for (a = 0; a < this.ha.length; ++a) {
                var b = this.ha[a].$c()
                  , c = this.Ua(b);
                b = b.clone({
                    scale: c * this.N
                });
                this.ha[a].aa(b, this.N)
            }
            Lm(this);
            a = this.Hn;
            b = a.left();
            c = a.top();
            a = this.ha[a.pageNumber() - 1];
            c = [a.v.convertToViewportPoint(b, c), a.v.convertToViewportPoint(b, c)];
            b = Math.min(c[0][0], c[1][0]);
            c = Math.min(c[0][1], c[1][1]);
            a: if (a = a.displayObject(),
            b = {
                left: b,
                top: c
            },
            c = a.offsetParent) {
                var d = a.offsetTop + a.clientTop;
                for (a = a.offsetLeft + a.clientLeft; c.clientHeight === c.scrollHeight; )
                    if (c.dataset.nr && (d /= c.dataset.nr,
                    a /= c.dataset.Yu),
                    d += c.offsetTop,
                    a += c.offsetLeft,
                    c = c.offsetParent,
                    !c) {
                        a = 0;
                        break a
                    }
                b && (void 0 !== b.top && (d += b.top),
                void 0 !== b.left && (a += b.left,
                c.scrollLeft = a));
                a = d
            } else
                console.error("offsetParent is not set -- cannot scroll"),
                a = 0;
            ui(this).scrollTop = a
        }
    }
    ;
    e.enable = function(a) {
        this.a = new Jm;
        this.a.ji(this);
        this.container().H(z.qe.Op);
        this.container().c(this.a);
        var b = ui(this);
        D(b, "scroll", this.ae, !1, this);
        Nm(this);
        Lm(this);
        1 == a && (this.Hi = !1);
        this.u(a);
        this.Zb();
        vi(this)
    }
    ;
    e.disable = function() {
        Km.V.disable.call(this);
        this.container().T(z.qe.Op);
        x(this.a);
        this.container().removeChild(this.a);
        this.a = null;
        var a = this.container().displayObject();
        Vd(a, "scroll", this.ae, !1, this);
        this.Hi = !0;
        this.ha = []
    }
    ;
    e.update = function() {
        this.Ya.update()
    }
    ;
    function Nm(a) {
        for (var b = 0, c = 1; c <= a.o(); ++c) {
            var d = dh(a.lc, c)
              , f = a.Ua(d);
            f = d.clone({
                scale: f
            });
            f.width > b && (b = f.width,
            a.$o = c - 1);
            f = new Ng(c,f,a.N,a.Td);
            f.K = d;
            a.Na && f.Za.addHandler(function(a, b) {
                b = this.Ua(b) * si(b);
                this.Na.render(a, this.N, b)
            }
            .bind(a, f, d));
            a.ha.push(f);
            d = new U("shadowOffset");
            d.c(f);
            a.a.c(d)
        }
    }
    e.ae = function() {
        var a = this;
        0 != this.ff || this.Tk || (this.ff = window.requestAnimationFrame(function() {
            var b = ui(a).scrollTop;
            b !== a.be.xm && (a.be.op = b > a.be.xm);
            a.be.xm = b;
            var c = a.a.pb().displayObject();
            a.be.position = b / c.clientHeight;
            a.ff = 0;
            a.Zb()
        }))
    }
    ;
    e.Zb = function() {
        var a = this.Ya.Ia()
          , b = a.Oc;
        a = a.Vs;
        this.Ya.render(b);
        b = b[0].me;
        b != this.C && (this.C = b,
        this.kc());
        b = ui(this).scrollLeft - a.left;
        var c = ui(this).scrollTop - a.top;
        b = a.page.v.convertToPdfPoint(b, c);
        this.Hn = new Fm(a.me,Math.round(b[1]),Math.round(b[0]))
    }
    ;
    e.wo = function() {
        var a = this.nc;
        this.nc = 0;
        this.C = a;
        this.Tk = !1;
        this.ae();
        this.kc()
    }
    ;
    e.Ua = function(a) {
        var b = 2 * z.qe.Ea
          , c = (this.Aa.width() - b) / a.width;
        a = (this.Aa.height() - b) / a.height;
        return Math.min(a, c)
    }
    ;
    function Lm(a) {
        var b = Math.round(a.ha[a.$o].width() + 2 * z.qe.Ea);
        a.a.$(b)
    }
    e.Ml = function() {
        var a = eh(this.lc)
          , b = this.Ua(a);
        a = a.clone({
            scale: b
        }).width + 2 * z.qe.Ea;
        a = this.Aa.width() / a * 2;
        this.$a = Math.max(a, this.$a)
    }
    ;
    function Mm(a, b, c) {
        var d = ui(a)
          , f = a.a.pb().displayObject()
          , g = f.getBoundingClientRect()
          , h = d.getBoundingClientRect();
        Ol(d, Math.max(g.width - h.width, 0) * b, f.clientHeight * a.be.position + h.height / 2 * c)
    }
    ;function Om() {
        this.i = null;
        this.mf = 0
    }
    function Pm(a, b) {
        b = new Kj(b.displayObject());
        D(b, "mousewheel", a.Rl, !1, a)
    }
    Om.prototype.ji = function(a) {
        this.i = a
    }
    ;
    function Qm() {
        Om.call(this)
    }
    w(Qm, Om);
    Qm.prototype.Rl = function(a) {
        if (a.ctrlKey || a.metaKey) {
            a.preventDefault();
            var b = a.deltaY
              , c = a.clientX;
            a = a.clientY;
            var d = this.i.scale();
            b = 0 > b ? qi(d) : ri(d);
            d != b && (this.mf && clearTimeout(this.mf),
            this.i.Hd(c, a),
            this.i.ne(b),
            this.mf = setTimeout(this.i.update.bind(this.i), z.ds))
        }
    }
    ;
    function Rm(a, b) {
        U.call(this, "slider");
        this.Hh = a;
        this.jn = !1;
        this.rj = [];
        if (a > b)
            throw Error("An incorrect range");
        this.Bf = a;
        this.Vi = b;
        this.Ym = new U("slider__slider-base");
        this.Lk = new U("slider__handler");
        this.Ym.c(this.Lk);
        this.c(this.Ym);
        this.an = new H;
        this.xh = new H;
        this.la = new H;
        D(this.Lk.displayObject(), "mousedown", this.Tq, !1, this)
    }
    w(Rm, U);
    Rm.prototype.value = function() {
        return this.Hh
    }
    ;
    function Sm(a, b) {
        if (!(a.Bf <= b && b <= a.Vi))
            throw Error("Value is out of range");
        if (a.Hh != b) {
            var c = 0 <= a.rj.indexOf(b);
            if (a.jn && !c)
                throw Error("Incorrect value");
            a.Hh = b;
            a.Lk.displayObject().style.left = 100 * (Math.abs(a.Bf) + b) / (a.Vi - a.Bf) + "%"
        }
    }
    Rm.prototype.Tq = function(a) {
        if (!(a.defaultPrevented || 0 < a.button)) {
            this.xh.f(this.value());
            var b = D(document, "mousemove", function(a) {
                a = a.clientX - this.displayObject().getBoundingClientRect().left;
                var b = this.width() / (this.Vi - this.Bf);
                a = rj(a / b - Math.abs(this.Bf), this.Bf, this.Vi);
                if (this.jn) {
                    b = this.Hh;
                    for (var c = a, d = 0; d <= this.rj.length; ++d) {
                        var k = this.rj[d]
                          , u = this.rj[d - 1];
                        if (b < a && a >= k)
                            c = k;
                        else if (b >= a && a <= u) {
                            c = u;
                            break
                        }
                    }
                    a = c
                }
                a != this.Hh && (this.an.f(a),
                Sm(this, a))
            }, !1, this)
              , c = D(document, "mouseup", function() {
                this.la.f(this.value());
                Wd(b);
                Wd(c)
            }, !1, this);
            a.preventDefault()
        }
    }
    ;
    function Tm() {
        U.call(this, "zoomToolbarContainer");
        this.di(!0);
        this.Zl = km("zoomOut");
        this.c(this.Zl);
        this.Te = new Rm(z.Xe,z.We);
        this.c(this.Te);
        this.Yl = km("zoomIn");
        this.c(this.Yl)
    }
    w(Tm, U);
    Tm.prototype.G = function(a) {
        this.Yl.Pa(a != z.We);
        this.Zl.Pa(a != z.Xe);
        this.Te.value() != a && Sm(this.Te, a)
    }
    ;
    Tm.prototype.sg = function() {
        return this.Te.la
    }
    ;
    function Um(a) {
        U.call(this, ["toolbar", "hidden"]);
        this.Yf = 1;
        this.ea = new W(0,0);
        var b = new U("toolbarCenter");
        this.Ad = new Tm;
        b.c(this.Ad);
        this.Hb = new lm(a);
        b.c(this.Hb);
        this.pa = new om;
        b.c(this.pa);
        this.c(b)
    }
    w(Um, U);
    e = Um.prototype;
    e.width = function() {
        return this.ea.width()
    }
    ;
    e.height = function() {
        return this.ea.height()
    }
    ;
    e.ra = function(a) {
        this.Hb.ra(a)
    }
    ;
    e.u = function(a) {
        this.Hb.u(a)
    }
    ;
    e.vc = function(a) {
        this.Ad.G(0);
        this.pa.vc(a);
        this.Hb.vc(a)
    }
    ;
    e.cd = function(a) {
        this.pa.cd(a)
    }
    ;
    e.ed = function(a) {
        this.pa.ed(a)
    }
    ;
    e.G = function(a) {
        this.Ad.G(a);
        this.pa.G(a)
    }
    ;
    e.tc = function(a) {
        var b = a.width() / z.zb
          , c = a.height() / z.bi;
        b = Math.min(b, c);
        c = a.width();
        var d = z.cb;
        1 > b ? (Kf(this.displayObject(), "left bottom"),
        vg(this.displayObject(), b),
        d = Math.floor(z.cb * b),
        this.$(a.width() * (1 / b))) : (Kf(this.displayObject(), ""),
        vg(this.displayObject(), 1),
        T(this, "width", ""));
        this.Yf = Math.min(1, b);
        this.ea = new W(c,d)
    }
    ;
    e.uc = function(a) {
        this.pa.uc(a)
    }
    ;
    e.fd = function(a) {
        this.pa.fd(a)
    }
    ;
    e.bd = function(a) {
        this.pa.bd(a)
    }
    ;
    e.df = function() {
        return this.pa.Jh.D
    }
    ;
    e.Ra = function() {
        return this.Hb.If.D
    }
    ;
    e.Qa = function() {
        return this.Hb.Ef.D
    }
    ;
    e.Rm = function() {
        return this.Ad.Yl.D
    }
    ;
    e.Sm = function() {
        return this.Ad.Zl.D
    }
    ;
    e.Um = function() {
        return this.Ad.Te.xh
    }
    ;
    e.wg = function() {
        return this.Ad.Te.an
    }
    ;
    e.Tm = function() {
        return this.Ad.Te.la
    }
    ;
    e.Ab = function() {
        return this.Hb.pl
    }
    ;
    e.Rb = function() {
        return this.pa.tf.D
    }
    ;
    e.sg = function() {
        return this.Ad.sg()
    }
    ;
    e.cf = function() {
        return this.pa.Vf.D
    }
    ;
    e.ad = function() {
        this.pa.ad()
    }
    ;
    function Vm(a, b, c) {
        U.call(this, "mainContainer");
        this.ea = new W(0,0);
        this.Af = new U("loaderIcon");
        this.c(this.Af);
        this.fa = new U("viewerContainer");
        this.fa.displayObject().tabIndex = -1;
        this.c(this.fa);
        this.s = new Um(a);
        this.c(this.s);
        this.tc(new W(b,c))
    }
    w(Vm, U);
    e = Vm.prototype;
    e.ra = function(a) {
        this.s.ra(a)
    }
    ;
    e.u = function(a) {
        this.s.u(a)
    }
    ;
    e.toolbar = function() {
        return this.s
    }
    ;
    e.eb = function() {
        return new W(this.ea.width(),this.ea.height() - this.s.height())
    }
    ;
    e.cb = function() {
        return this.s.height()
    }
    ;
    e.vc = function(a) {
        this.s.vc(a)
    }
    ;
    e.cd = function(a) {
        this.s.cd(a)
    }
    ;
    e.ed = function(a) {
        this.s.ed(a)
    }
    ;
    e.G = function(a) {
        this.s.G(a)
    }
    ;
    e.tc = function(a) {
        this.ea = a;
        this.resize(a.width(), a.height());
        this.s.tc(a);
        a = Math.round(this.s.height());
        T(this.fa, "bottom", a + "px")
    }
    ;
    e.df = function() {
        return this.s.df()
    }
    ;
    e.Ra = function() {
        return this.s.Ra()
    }
    ;
    e.Qa = function() {
        return this.s.Qa()
    }
    ;
    e.Ab = function() {
        return this.s.Ab()
    }
    ;
    e.Rb = function() {
        return this.s.Rb()
    }
    ;
    e.Rm = function() {
        return this.s.Rm()
    }
    ;
    e.Sm = function() {
        return this.s.Sm()
    }
    ;
    e.Um = function() {
        return this.s.Um()
    }
    ;
    e.wg = function() {
        return this.s.wg()
    }
    ;
    e.Tm = function() {
        return this.s.Tm()
    }
    ;
    e.sg = function() {
        return this.s.sg()
    }
    ;
    e.cf = function() {
        return this.s.cf()
    }
    ;
    e.Nm = function() {
        this.s.T("hidden")
    }
    ;
    e.ad = function() {
        this.s.ad()
    }
    ;
    e.Ej = function() {}
    ;
    e.uc = function(a) {
        this.s.uc(a)
    }
    ;
    e.fd = function(a) {
        this.s.fd(a)
    }
    ;
    e.bd = function(a) {
        this.s.bd(a)
    }
    ;
    function Wm(a, b, c) {
        var d = new oh;
        this.a = new Vm(b.Dd(),a.clientWidth,a.clientHeight);
        bd(a, this.a.wa);
        Z.call(this, a, b, b.Td ? 1 : 2, z, d, c);
        this.Me = b.jo ? null : new uh;
        this.Ng = new Hh(this.a);
        this.mf = this.Cc = 0;
        this.gl = new Qm;
        Pm(this.gl, this.a.fa);
        Pm(this.gl, this.a.toolbar());
        this.La = new Ph;
        this.La.Ra().addHandler(this.Vc, this);
        this.La.Qa().addHandler(this.Tc, this);
        this.La.Ab().addHandler(this.ce, this);
        this.La.Rb().addHandler(this.nd, this);
        this.a.df().addHandler(this.Pl, this);
        this.a.Ra().addHandler(this.Vc, this);
        this.a.Qa().addHandler(this.Tc, this);
        this.a.Ab().addHandler(this.ce, this);
        this.a.Rb().addHandler(this.nd, this);
        this.a.Rm().addHandler(this.Qr, this);
        this.a.Sm().addHandler(this.Rr, this);
        this.a.Um().addHandler(this.Tr, this);
        this.a.wg().addHandler(this.Kh, this);
        this.a.Tm().addHandler(this.Sr, this);
        this.a.sg().addHandler(this.xr, this);
        this.a.cf().addHandler(this.Ql, this);
        this.a.G(0);
        this.Ac(1, Km);
        this.Ac(2, em);
        this.Zd(1, Bl, z.hk);
        this.Zd(2, Ml, z.ik);
        this.kh()
    }
    w(Wm, Z);
    Wm.prototype.view = function() {
        return this.a
    }
    ;
    Wm.prototype.Nc = function() {
        return this.j.Nc()
    }
    ;
    Wm.prototype.viewPages = Wm.prototype.Nc;
    e = Wm.prototype;
    e.resize = function(a, b) {
        this.Cc && clearTimeout(this.Cc);
        this.ea = new W(a,b);
        this.a.tc(this.ea);
        this.Ja && this.Ja.aa(this.ea);
        this.oa.Jj && (this.P.resize(),
        this.j.resize(this.Sd()),
        this.Cc = setTimeout(this.Ll.bind(this), z.Dm))
    }
    ;
    e.Ll = function() {
        this.j.update();
        this.P.update()
    }
    ;
    e.Wb = function(a) {
        Wm.V.Wb.call(this, a);
        this.P.enable(this.oa.Da);
        this.j.resize(this.Sd());
        this.j.enable(this.oa.Da);
        this.gl.ji(this.j);
        this.a.vc(a)
    }
    ;
    e.kh = function() {
        if (window.location.hash) {
            var a = this.jh(window.location.hash.substring(1));
            "page"in a && (this.oa.Da = parseInt(a.page, 10));
            if ("mode"in a)
                switch (a.mode) {
                case "book":
                    this.Ub = 2;
                    break;
                case "pages":
                    this.Ub = 1
                }
        }
    }
    ;
    e.jh = function(a) {
        a = a.split("&");
        for (var b = {}, c = 0; c < a.length; ++c) {
            var d = a[c].split("=");
            b[decodeURIComponent(d[0].toLowerCase())] = 1 < d.length ? decodeURIComponent(d[1]) : null
        }
        return b
    }
    ;
    e.Vc = function() {
        this.j.bf()
    }
    ;
    e.Tc = function() {
        this.j.af()
    }
    ;
    e.Pl = function() {
        switch (this.Ub) {
        case 2:
            this.Wb(1);
            break;
        case 1:
            this.Wb(2)
        }
    }
    ;
    e.Sd = function() {
        var a = this.a.eb()
          , b = a.height();
        this.P instanceof Ml && 0 != this.P.state() && (b -= this.P.height());
        return new W(a.width(),b)
    }
    ;
    e.ce = function(a) {
        this.j.u(a)
    }
    ;
    e.nd = function() {
        this.Ng.toggle();
        this.a.fa.displayObject().focus()
    }
    ;
    e.Ac = function(a, b) {
        Wm.V.Ac.call(this, a, b);
        if (b = this.Gb.si())
            this.ua[a].Na = b;
        this.ua[a].Pf.addHandler(this.Tl, this);
        this.ua[a].Ec.addHandler(this.Ul, this)
    }
    ;
    e.Zd = function(a, b, c) {
        Wm.V.Zd.call(this, a, b, c);
        this.kb[a].Wa.addHandler(this.El, this);
        this.kb[a].ee.addHandler(this.Fl, this);
        this.kb[a].Ec.addHandler(this.Gl, this)
    }
    ;
    e.rd = function(a) {
        Wm.V.rd.call(this, a);
        xh(a, this.Qc);
        a.Me = this.Me;
        var b = a.o();
        this.a.u(1);
        this.a.ra(b);
        this.ua[2].bb(a);
        this.ua[1].bb(a);
        this.kb[2].bb(a);
        this.kb[1].bb(a);
        a = this.kb[2];
        a instanceof Ml && a.bk(this.ua[2]);
        x(this.Ub);
        this.Wb(this.Ub);
        this.La.ra(b);
        1 == b && (this.a.uc(!1),
        this.a.fd(!1));
        Ij(this)
    }
    ;
    e.Se = function(a) {
        Wm.V.Se.call(this, a);
        this.a.u(a);
        null !== this.P && this.P.u(a);
        this.j.mm();
        this.kc(a)
    }
    ;
    e.Tl = function(a) {
        this.a.G(a);
        0 < a ? (this.ba.Sb() || this.ba.enable(),
        1 == this.P.state() && this.P.tm()) : (this.ba.Sb() && this.ba.disable(),
        2 == this.P.state() && this.P.show(),
        1 == this.R.o() && this.a.uc(!1));
        this.a.fa.displayObject().focus()
    }
    ;
    e.Ul = function() {
        this.j.G(0);
        this.a.G(0);
        this.ba.Sb() && this.ba.disable();
        this.Nl()
    }
    ;
    e.El = function(a) {
        this.oa.Da = a;
        this.a.u(a);
        this.j.u(a)
    }
    ;
    e.Fl = function(a) {
        this.oa.dk = a;
        this.a.ed(a)
    }
    ;
    e.Gl = function() {
        1 == this.oa.dk ? this.P.open() : this.P.close()
    }
    ;
    e.Qr = function() {
        var a = this.j.scale();
        if (a != z.We) {
            var b = this.a.fa.displayObject().getBoundingClientRect();
            this.j.Hd(b.width / 2, b.height / 2);
            this.j.ne(qi(a));
            this.j.update()
        }
    }
    ;
    e.Rr = function() {
        var a = this.j.scale();
        if (a != z.Xe) {
            var b = this.a.fa.displayObject().getBoundingClientRect();
            this.j.Hd(b.width / 2, b.height / 2);
            this.j.ne(ri(a));
            this.j.update()
        }
    }
    ;
    e.Tr = function() {
        this.La.Sk = !0;
        var a = this.a.fa.displayObject().getBoundingClientRect();
        this.j.Hd(a.width / 2, a.height / 2)
    }
    ;
    e.Kh = function(a) {
        this.j.ne(a)
    }
    ;
    e.Sr = function() {
        this.La.Sk = !1
    }
    ;
    e.xr = function() {
        this.j.update()
    }
    ;
    e.Ql = function() {
        this.P.toggle(!0);
        this.a.fa.displayObject().focus()
    }
    ;
    function Xm(a, b, c) {
        Wm.call(this, a, b, c);
        this.Yp = new xm;
        this.ua[2].Zo.addHandler(function() {
            this.Yp.call("Player_initializationFinished")
        }, this)
    }
    w(Xm, Wm);
    Xm.prototype.rd = function(a) {
        var b = a.o();
        this.oa.Da = 2 < b ? 2 : 1;
        Xm.V.rd.call(this, a)
    }
    ;
    function Ym(a, b) {
        this.iq = a;
        this.Mo = b
    }
    Ym.prototype.create = function(a, b, c) {
        var d = Wm;
        gg ? d = Xk : N ? d = rm : this.iq.cefclientRequired && (d = Xm);
        this.Mo && (c = this.Mo.getState());
        var f = Pf(!0).resume;
        f = "resume" != (nh[f] || null);
        c = mh() && f ? void 0 : c;
        return new d(a,b,c)
    }
    ;
    function Zm(a, b) {
        window.scrollTo(a, b)
    }
    window.yPos = function() {
        return window.pageYOffset
    }
    ;
    window.scrollPageTo = Zm;
    function $m() {
        var a = this;
        this.Fo = new H;
        this.tk = this.Kg = 0;
        this.vj = !1;
        this.g = document.createElement("DIV");
        this.g.style.width = fg ? "100%" : "100vw";
        this.g.style.height = Of ? "50vh" : "100vh";
        this.g.style.position = "absolute";
        this.g.style.zIndex = "-1";
        this.g.style.top = "0";
        N && !gg && (document.body.style.position = "fixed");
        var b = window;
        if (Tf)
            try {
                b = window.top
            } catch (d) {}
        document.body.insertAdjacentElement("afterbegin", this.g);
        (new ResizeObserver(function() {
            Of && gg ? setTimeout(function() {
                an(a)
            }, 100) : an(a)
        }
        )).observe(this.g);
        window.invalidatePlayerSize = va;
        window.setPlayerSize = va;
        window.removeResizeListeners = va;
        document.addEventListener("touchend", function(b) {
            0 == b.touches.length && (a.vj = !1,
            setTimeout(function() {
                an(a, !1, !1)
            }, 100))
        }, !0);
        document.addEventListener("touchstart", function(b) {
            1 == window.event.touches.length && (a.vj = !0);
            1 < b.touches.length && b.preventDefault()
        }, !0);
        var c = b.onresize;
        b.onresize = function() {
            c && c();
            an(a)
        }
        ;
        b.onorientationchange = function() {
            var b = ld();
            b && N && (Of ? setTimeout(function() {
                x(b).blur();
                eg && an(a)
            }, 800) : b.blur())
        }
        ;
        Xf && window.frameElement && window.frameElement.setAttribute("scrolling", "no")
    }
    function an(a, b, c) {
        function d(a, c) {
            if (b || q.Kg != a || q.tk != c) {
                var d = q.Kg;
                q.Kg = a;
                q.tk = c;
                q.Fo.f(q.Kg, q.tk);
                d != q.Kg && Of && !q.vj && setTimeout(function() {
                    f(0, 0)
                }, 100)
            }
        }
        b = void 0 === b ? !1 : b;
        c = void 0 === c ? !0 : c;
        var f = Zm;
        if (b || !a.vj) {
            var g = Of ? 2 * a.g.clientHeight : a.g.clientHeight;
            if (Tf || !($f && .7 > g / screen.height || qf && .7 > window.innerHeight / g)) {
                var h = 1
                  , k = a.g.clientWidth;
                c && Xf && window.frameElement && (k = 0,
                h = k / window.innerWidth);
                var u = window.innerHeight * h
                  , q = a;
                d(k, u);
                c && Xf && window.frameElement && setTimeout(function() {
                    k = x(window.frameElement).clientWidth;
                    h = k / window.innerWidth;
                    u = window.innerHeight * h;
                    d(k, u)
                }, 0)
            }
        }
    }
    $m.prototype.Ls = va;
    PDFJS.workerSrc = "data/js/pdf.worker.js";
    Ha("PDFJS.workerSrc", PDFJS.workerSrc);
    PDFJS.disableAutoFetch = !0;
    Ha("PDFJS.disableAutoFetch", PDFJS.disableAutoFetch);
    Ha("PdfViewer.open", function(a, b, c, d, f) {
        c = new hh(c);
        var g = jh();
        if (!N || !c.Xk || g.ispringpreview || ig || 0 < location.hash.length) {
            var h = p(f) ? null : new Kc(c.pn,c.ph)
              , k = (new Ym(a,h)).create(b, c, f);
            h && k.ee.addHandler(function() {
                var a = k.Ti;
                a.updated = Math.floor(Date.now() / 1E3);
                try {
                    Gc(h.pk, JSON.stringify(a))
                } catch (I) {
                    Nc(h),
                    Gc(h.pk, JSON.stringify(a))
                }
            });
            (f = g.ispringpreview || a.localPermission) && k.Jm();
            d && d(k);
            "query" == a.type && g.file ? k.Mj(g.file) : "fileName" == a.type && ("file:" != document.location.protocol || f || N ? k.Mj(a.filePath) : c.un ? kh(a.filePath + ".js", function(b) {
                b = window.atob(b);
                var c = a.filePath
                  , d = c.lastIndexOf("/") + 1;
                k.ym(b, c.substr(d, c.lastIndexOf(".") - d))
            }) : (b.innerHTML = "",
            d = new ih(c.Dd()),
            bd(b, d.displayObject())));
            var u = new $m;
            N && u.Ls(!1);
            u.Fo.addHandler(function(a, b) {
                k.resize(a, b)
            });
            an(u, !0);
            var q = null;
            k.wf.addHandler(function() {
                q && clearTimeout(q);
                q = setTimeout(function() {
                    an(u, !0)
                }, 200)
            });
            mg && ISPFlipPlayer.initFlip(jb({
                apiVersion: 1
            }))
        } else
            location.replace("ismplayer.html" + location.search)
    });
    Ha("PdfViewer.checkMobileIntegration", function(a) {
        a = new hh(a);
        var b = jh();
        N && a.Xk && !b.ispringpreview && (ig || 0 < location.hash.length || location.replace("ismplayer.html" + location.search))
    });
    function tg() {
        return !1
    }
    function de(a) {
        a && (x(!a.disposed),
        ya(a.eg) && a.eg(),
        a.disposed = !0)
    }
    function bn(a, b) {
        tg() && (b ? n.console.error(a) : n.console.warn(a))
    }
    function pe(a, b) {
        var c = a.stack || a.toString();
        0 > String(c).indexOf(a.message) && bn(a.message, b);
        bn(c, b)
    }
    window.onerror = function(a) {
        for (var b = [], c = 0; c < arguments.length; ++c)
            b[c - 0] = arguments[c];
        c = l(b);
        b = c.next().value;
        c.next();
        c.next();
        c.next();
        (c = c.next().value) ? pe(c, !0) : bn(b, !0);
        return !0
    }
    ;
    La = function(a) {
        try {
            throw Error(a.message);
        } catch (b) {
            pe(b, !1)
        }
    }
    ;
    n.console || (window._log = "",
    n.console = {
        log: function(a) {
            window._log += "\n" + a
        },
        warn: function(a) {
            window._log += "\nwarn: " + a
        },
        error: function(a) {
            window._log += "\nerror: " + a
        }
    });
}
)();

!function(t, e) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : t.ResizeObserver = e()
}(this, function() {
    "use strict";
    function t(t) {
        return window.getComputedStyle(t)
    }
    function e(t) {
        return parseFloat(t) || 0
    }
    function n(t) {
        for (var n = arguments.length, r = Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
            r[i - 1] = arguments[i];
        return r.reduce(function(n, r) {
            var i = t["border-" + r + "-width"];
            return n + e(i)
        }, 0)
    }
    function r(t) {
        for (var n = ["top", "right", "bottom", "left"], r = {}, i = n, o = Array.isArray(i), s = 0, i = o ? i : i[Symbol.iterator](); ; ) {
            var a;
            if (o) {
                if (s >= i.length)
                    break;
                a = i[s++]
            } else {
                if (s = i.next(),
                s.done)
                    break;
                a = s.value
            }
            var u = a
              , c = t["padding-" + u];
            r[u] = e(c)
        }
        return r
    }
    function i(t, e, n, r) {
        return {
            width: t,
            height: e,
            top: n,
            right: t + r,
            bottom: e + n,
            left: r
        }
    }
    function o(t) {
        var e = t.getBBox();
        return i(e.width, e.height, 0, 0)
    }
    function s() {
        var n = t(document.documentElement)
          , r = e(n.width)
          , o = e(n.height);
        return i(r, o, 0, 0)
    }
    function a(o) {
        var s = o.clientWidth
          , a = o.clientHeight;
        if (!s && !a)
            return O;
        var u = t(o)
          , c = r(u)
          , h = c.left + c.right
          , f = c.top + c.bottom
          , l = e(u.width)
          , p = e(u.height);
        "border-box" === u.boxSizing && (Math.round(l + h) !== s && (l -= n(u, "left", "right") + h),
        Math.round(p + f) !== a && (p -= n(u, "top", "bottom") + f));
        var d = Math.round(l + h) - s
          , _ = Math.round(p + f) - a;
        return 1 !== Math.abs(d) && (l -= d),
        1 !== Math.abs(_) && (p -= _),
        i(l, p, c.top, c.left)
    }
    function u(t) {
        return t instanceof window.SVGElement
    }
    function c(t) {
        return t === document.documentElement
    }
    function h(t) {
        return u(t) ? o(t) : c(t) ? s() : a(t)
    }
    function f(t, e) {
        for (var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, r = {
            configurable: n.configurable || !1,
            writable: n.writable || !1,
            enumerable: n.enumerable || !1
        }, i = Object.keys(e), o = Array.isArray(i), s = 0, i = o ? i : i[Symbol.iterator](); ; ) {
            var a;
            if (o) {
                if (s >= i.length)
                    break;
                a = i[s++]
            } else {
                if (s = i.next(),
                s.done)
                    break;
                a = s.value
            }
            var u = a;
            r.value = e[u],
            Object.defineProperty(t, u, r)
        }
        return t
    }
    var l = function(t, e) {
        if (!(t instanceof e))
            throw new TypeError("Cannot call a class as a function")
    }
      , p = function() {
        function t(t, e) {
            for (var n = 0; n < e.length; n++) {
                var r = e[n];
                r.enumerable = r.enumerable || !1,
                r.configurable = !0,
                "value"in r && (r.writable = !0),
                Object.defineProperty(t, r.key, r)
            }
        }
        return function(e, n, r) {
            return n && t(e.prototype, n),
            r && t(e, r),
            e
        }
    }()
      , d = function(t, e) {
        if ("function" != typeof e && null !== e)
            throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
            constructor: {
                value: t,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
    }
      , _ = function(t, e) {
        if (!t)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
    }
      , b = "function" == typeof window.WeakMap && "function" == typeof window.Map
      , v = function() {
        function t(t, e) {
            var n = -1;
            return t.some(function(t, r) {
                var i = t[0] === e;
                return i && (n = r),
                i
            }),
            n
        }
        return b ? window.WeakMap : function() {
            function e() {
                l(this, e),
                this.__entries__ = []
            }
            return e.prototype.get = function(e) {
                var n = t(this.__entries__, e);
                return this.__entries__[n][1]
            }
            ,
            e.prototype.set = function(e, n) {
                var r = t(this.__entries__, e);
                ~r ? this.__entries__[r][1] = n : this.__entries__.push([e, n])
            }
            ,
            e.prototype.delete = function(e) {
                var n = this.__entries__
                  , r = t(n, e);
                ~r && n.splice(r, 1)
            }
            ,
            e.prototype.has = function(e) {
                return !!~t(this.__entries__, e)
            }
            ,
            e
        }()
    }()
      , y = function() {
        return b ? window.Map : function(t) {
            function e() {
                return l(this, e),
                _(this, t.apply(this, arguments))
            }
            return d(e, t),
            e.prototype.clear = function() {
                this.__entries__.splice(0, this.__entries__.length)
            }
            ,
            e.prototype.entries = function() {
                return this.__entries__.slice()
            }
            ,
            e.prototype.keys = function() {
                return this.__entries__.map(function(t) {
                    return t[0]
                })
            }
            ,
            e.prototype.values = function() {
                return this.__entries__.map(function(t) {
                    return t[1]
                })
            }
            ,
            e.prototype.forEach = function(t) {
                for (var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null, n = this.__entries__, r = Array.isArray(n), i = 0, n = r ? n : n[Symbol.iterator](); ; ) {
                    var o;
                    if (r) {
                        if (i >= n.length)
                            break;
                        o = n[i++]
                    } else {
                        if (i = n.next(),
                        i.done)
                            break;
                        o = i.value
                    }
                    var s = o;
                    t.call(e, s[1], s[0])
                }
            }
            ,
            p(e, [{
                key: "size",
                get: function() {
                    return this.__entries__.length
                }
            }]),
            e
        }(v)
    }()
      , w = function() {
        return "function" == typeof window.requestAnimationFrame ? window.requestAnimationFrame : function(t) {
            return setTimeout(function() {
                return t(Date.now())
            }, 1e3 / 60)
        }
    }()
      , g = function(t) {
        function e() {
            t.apply.apply(t, s),
            s = null,
            a && (r.apply.apply(r, a),
            a = null)
        }
        function n() {
            o ? w(e) : e()
        }
        function r() {
            for (var t = arguments.length, e = Array(t), r = 0; r < t; r++)
                e[r] = arguments[r];
            var o = [this, e];
            s ? a = o : (s = o,
            setTimeout(n, i))
        }
        var i = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0
          , o = arguments.length > 2 && void 0 !== arguments[2] && arguments[2]
          , s = null
          , a = null;
        return r
    }
      , m = "function" == typeof window.MutationObserver
      , E = function() {
        function t() {
            var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
            l(this, t),
            this._isCycleContinuous = !m || e,
            this._listenersEnabled = !1,
            this._mutationsObserver = null,
            this._observers = [],
            this.refresh = g(this.refresh.bind(this), 30, !0),
            this._continuousUpdateHandler = g(this.refresh, 70)
        }
        return t.prototype.connect = function(t) {
            this.isConnected(t) || this._observers.push(t),
            this._listenersEnabled || this._addListeners()
        }
        ,
        t.prototype.disconnect = function(t) {
            var e = this._observers
              , n = e.indexOf(t);
            ~n && e.splice(n, 1),
            !e.length && this._listenersEnabled && this._removeListeners()
        }
        ,
        t.prototype.isConnected = function(t) {
            return !!~this._observers.indexOf(t)
        }
        ,
        t.prototype.refresh = function() {
            var t = this._updateObservers();
            t ? this.refresh() : this._isCycleContinuous && this._listenersEnabled && this._continuousUpdateHandler()
        }
        ,
        t.prototype._updateObservers = function() {
            for (var t = !1, e = this._observers, n = Array.isArray(e), r = 0, e = n ? e : e[Symbol.iterator](); ; ) {
                var i;
                if (n) {
                    if (r >= e.length)
                        break;
                    i = e[r++]
                } else {
                    if (r = e.next(),
                    r.done)
                        break;
                    i = r.value
                }
                var o = i;
                o.gatherActive(),
                o.hasActive() && (t = !0,
                o.broadcastActive())
            }
            return t
        }
        ,
        t.prototype._addListeners = function() {
            this._listenersEnabled || (window.addEventListener("resize", this.refresh),
            m && (this._mutationsObserver = new MutationObserver(this.refresh),
            this._mutationsObserver.observe(document, {
                attributes: !0,
                childList: !0,
                characterData: !0,
                subtree: !0
            })),
            this._listenersEnabled = !0,
            this._isCycleContinuous && this.refresh())
        }
        ,
        t.prototype._removeListeners = function() {
            this._listenersEnabled && (window.removeEventListener("resize", this.refresh),
            this._mutationsObserver && this._mutationsObserver.disconnect(),
            this._mutationsObserver = null,
            this._listenersEnabled = !1)
        }
        ,
        p(t, [{
            key: "continuousUpdates",
            get: function() {
                return this._isCycleContinuous
            },
            set: function(t) {
                m && (this._isCycleContinuous = t,
                this._listenersEnabled && t && this.refresh())
            }
        }]),
        t
    }()
      , O = i(0, 0, 0, 0)
      , A = function() {
        function t(e) {
            l(this, t),
            this.target = e,
            this._contentRect = O,
            this.broadcastWidth = 0,
            this.broadcastHeight = 0
        }
        return t.prototype.broadcastRect = function() {
            var t = this._contentRect;
            return this.broadcastWidth = t.width,
            this.broadcastHeight = t.height,
            t
        }
        ,
        t.prototype.isActive = function() {
            var t = h(this.target);
            return this._contentRect = t,
            t.width !== this.broadcastWidth || t.height !== this.broadcastHeight
        }
        ,
        t
    }()
      , ResizeObserverEntry = function ResizeObserverEntry(t, e) {
        l(this, ResizeObserverEntry);
        var n = window.ClientRect || Object
          , r = Object.create(n.prototype);
        f(r, e, {
            configurable: !0
        }),
        f(this, {
            target: t,
            contentRect: r
        }, {
            configurable: !0
        })
    }
      , k = function() {
        function ResizeObserver(t, e, n) {
            if (l(this, ResizeObserver),
            "function" != typeof t)
                throw new TypeError("The callback provided as parameter 1 is not a function.");
            this._callback = t,
            this._targets = new y,
            this._activeTargets = [],
            this._controller = e,
            this._publicObserver = n
        }
        return ResizeObserver.prototype.observe = function(t) {
            if (!arguments.length)
                throw new TypeError("1 argument required, but only 0 present.");
            if (!(t instanceof Element))
                throw new TypeError('parameter 1 is not of type "Element".');
            var e = this._targets;
            e.has(t) || (e.set(t, new A(t)),
            this._controller.isConnected(this) || this._controller.connect(this),
            this._controller.refresh())
        }
        ,
        ResizeObserver.prototype.unobserve = function(t) {
            if (!arguments.length)
                throw new TypeError("1 argument required, but only 0 present.");
            if (!(t instanceof Element))
                throw new TypeError('parameter 1 is not of type "Element".');
            var e = this._targets;
            e.has(t) && (e.delete(t),
            e.size || this.disconnect())
        }
        ,
        ResizeObserver.prototype.disconnect = function() {
            this.clearActive(),
            this._targets.clear(),
            this._controller.disconnect(this)
        }
        ,
        ResizeObserver.prototype.gatherActive = function() {
            this.clearActive();
            var t = this._activeTargets;
            this._targets.forEach(function(e) {
                e.isActive() && t.push(e)
            })
        }
        ,
        ResizeObserver.prototype.broadcastActive = function() {
            if (this.hasActive()) {
                var t = this._publicObserver
                  , e = this._activeTargets.map(function(t) {
                    return new ResizeObserverEntry(t.target,t.broadcastRect())
                });
                this.clearActive(),
                this._callback.call(t, e, t)
            }
        }
        ,
        ResizeObserver.prototype.clearActive = function() {
            this._activeTargets.splice(0)
        }
        ,
        ResizeObserver.prototype.hasActive = function() {
            return !!this._activeTargets.length
        }
        ,
        ResizeObserver
    }()
      , T = new E
      , C = new v
      , ResizeObserver = function() {
        function ResizeObserver(t) {
            if (l(this, ResizeObserver),
            !arguments.length)
                throw new TypeError("1 argument required, but only 0 present.");
            var e = new k(t,T,this);
            C.set(this, e)
        }
        return p(ResizeObserver, null, [{
            key: "continuousUpdates",
            get: function() {
                return T.continuousUpdates
            },
            set: function(t) {
                if ("boolean" != typeof t)
                    throw new TypeError('type of "continuousUpdates" value must be boolean.');
                T.continuousUpdates = t
            }
        }]),
        ResizeObserver
    }();
    ["observe", "unobserve", "disconnect"].forEach(function(t) {
        ResizeObserver.prototype[t] = function() {
            var e;
            return (e = C.get(this))[t].apply(e, arguments)
        }
    }),
    "function" != typeof window.ResizeObserver && Object.defineProperty(window, "ResizeObserver", {
        value: ResizeObserver,
        writable: !0,
        configurable: !0
    });
    var x = window.ResizeObserver;
    return x
});

/*! iScroll v5.2.0-snapshot ~ (c) 2008-2018 Matteo Spinelli ~ http://cubiq.org/license */
!function(t, i, s) {
    function e(s, e) {
        this.wrapper = "string" == typeof s ? i.querySelector(s) : s,
        this.scroller = this.wrapper.children[0],
        this.scrollerStyle = this.scroller.style,
        this.options = {
            resizeScrollbars: !0,
            mouseWheelSpeed: 20,
            snapThreshold: .334,
            disablePointer: !h.hasPointer,
            disableTouch: h.hasPointer || !h.hasTouch,
            disableMouse: h.hasPointer || h.hasTouch,
            startX: 0,
            startY: 0,
            scrollY: !0,
            directionLockThreshold: 5,
            momentum: !0,
            onScrollHandler: Function.prototype,
            bounce: !0,
            bounceTime: 600,
            bounceEasing: "",
            preventDefault: !0,
            preventDefaultException: {
                tagName: /^(A|INPUT|TEXTAREA|BUTTON|SELECT)$/
            },
            HWCompositing: !0,
            useTransition: !0,
            useTransform: !0,
            bindToWrapper: "undefined" == typeof t.onmousedown
        };
        for (var o in e)
            this.options[o] = e[o];
        this.translateZ = this.options.HWCompositing && h.hasPerspective ? " translateZ(0)" : "",
        this.options.useTransition = h.hasTransition && this.options.useTransition,
        this.options.useTransform = h.hasTransform && this.options.useTransform,
        this.options.eventPassthrough = this.options.eventPassthrough === !0 ? "vertical" : this.options.eventPassthrough,
        this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault,
        this.options.scrollY = "vertical" != this.options.eventPassthrough && this.options.scrollY,
        this.options.scrollX = "horizontal" != this.options.eventPassthrough && this.options.scrollX,
        this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough,
        this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold,
        this.options.bounceEasing = "string" == typeof this.options.bounceEasing ? h.ease[this.options.bounceEasing] || h.ease.circular : this.options.bounceEasing,
        this.options.resizePolling = void 0 === this.options.resizePolling ? 60 : this.options.resizePolling,
        this.options.tap === !0 && (this.options.tap = "tap"),
        this.options.useTransition || this.options.useTransform || /relative|absolute/i.test(this.scrollerStyle.position) || (this.scrollerStyle.position = "relative"),
        "scale" == this.options.shrinkScrollbars && (this.options.useTransition = !1),
        this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1,
        this.x = 0,
        this.y = 0,
        this.directionX = 0,
        this.directionY = 0,
        this._events = {},
        this._init(),
        this.refresh(),
        this.scrollTo(this.options.startX, this.options.startY),
        this.enable()
    }
    function o(t, s, e) {
        var o = i.createElement("div")
          , n = i.createElement("div");
        return e === !0 && (o.style.cssText = "position:absolute;z-index:9999",
        n.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px"),
        n.className = "iScrollIndicator",
        "h" == t ? (e === !0 && (o.style.cssText += ";height:7px;left:2px;right:2px;bottom:0",
        n.style.height = "100%"),
        o.className = "iScrollHorizontalScrollbar") : (e === !0 && (o.style.cssText += ";width:7px;bottom:2px;top:2px;right:1px",
        n.style.width = "100%"),
        o.className = "iScrollVerticalScrollbar"),
        o.style.cssText += ";overflow:hidden",
        s || (o.style.pointerEvents = "none"),
        o.appendChild(n),
        o
    }
    function n(s, e) {
        this.wrapper = "string" == typeof e.el ? i.querySelector(e.el) : e.el,
        this.wrapperStyle = this.wrapper.style,
        this.indicator = this.wrapper.children[0],
        this.indicatorStyle = this.indicator.style,
        this.scroller = s,
        this.options = {
            listenX: !0,
            listenY: !0,
            interactive: !1,
            resize: !0,
            defaultScrollbars: !1,
            shrink: !1,
            fade: !1,
            speedRatioX: 0,
            speedRatioY: 0
        };
        for (var o in e)
            this.options[o] = e[o];
        if (this.sizeRatioX = 1,
        this.sizeRatioY = 1,
        this.maxPosX = 0,
        this.maxPosY = 0,
        this.options.interactive && (this.options.disableTouch || (h.addEvent(this.indicator, "touchstart", this),
        h.addEvent(t, "touchend", this)),
        this.options.disablePointer || (h.addEvent(this.indicator, h.prefixPointerEvent("pointerdown"), this),
        h.addEvent(t, h.prefixPointerEvent("pointerup"), this)),
        this.options.disableMouse || (h.addEvent(this.indicator, "mousedown", this),
        h.addEvent(t, "mouseup", this))),
        this.options.fade) {
            this.wrapperStyle[h.style.transform] = this.scroller.translateZ;
            var n = h.style.transitionDuration;
            if (!n)
                return;
            this.wrapperStyle[n] = h.isBadAndroid ? "0.0001ms" : "0ms";
            var a = this;
            h.isBadAndroid && r(function() {
                "0.0001ms" === a.wrapperStyle[n] && (a.wrapperStyle[n] = "0s")
            }),
            this.wrapperStyle.opacity = "0"
        }
    }
    var r = t.requestAnimationFrame || t.webkitRequestAnimationFrame || t.mozRequestAnimationFrame || t.oRequestAnimationFrame || t.msRequestAnimationFrame || function(i) {
        t.setTimeout(i, 1e3 / 60)
    }
      , h = function() {
        function e(t) {
            return r !== !1 && ("" === r ? t : r + t.charAt(0).toUpperCase() + t.substr(1))
        }
        var o = {}
          , n = i.createElement("div").style
          , r = function() {
            for (var t, i = ["t", "webkitT", "MozT", "msT", "OT"], s = 0, e = i.length; s < e; s++)
                if (t = i[s] + "ransform",
                t in n)
                    return i[s].substr(0, i[s].length - 1);
            return !1
        }();
        o.getTime = Date.now || function() {
            return (new Date).getTime()
        }
        ,
        o.extend = function(t, i) {
            for (var s in i)
                t[s] = i[s]
        }
        ,
        o.addEvent = function(t, i, s, e) {
            t.addEventListener(i, s, !!e)
        }
        ,
        o.removeEvent = function(t, i, s, e) {
            t.removeEventListener(i, s, !!e)
        }
        ,
        o.prefixPointerEvent = function(i) {
            return t.MSPointerEvent ? "MSPointer" + i.charAt(7).toUpperCase() + i.substr(8) : i
        }
        ,
        o.momentum = function(t, i, e, o, n, r) {
            var h, a, l = t - i, c = s.abs(l) / e;
            return r = void 0 === r ? 6e-4 : r,
            h = t + c * c / (2 * r) * (l < 0 ? -1 : 1),
            a = c / r,
            h < o ? (h = n ? o - n / 2.5 * (c / 8) : o,
            l = s.abs(h - t),
            a = l / c) : h > 0 && (h = n ? n / 2.5 * (c / 8) : 0,
            l = s.abs(t) + h,
            a = l / c),
            {
                destination: s.round(h),
                duration: a
            }
        }
        ;
        var h = e("transform");
        return o.extend(o, {
            hasTransform: h !== !1,
            hasPerspective: e("perspective")in n,
            hasTouch: "ontouchstart"in t,
            hasPointer: !(!t.PointerEvent && !t.MSPointerEvent),
            hasTransition: e("transition")in n
        }),
        o.isBadAndroid = function() {
            var i = t.navigator.appVersion;
            if (/Android/.test(i) && !/Chrome\/\d/.test(i)) {
                var s = i.match(/Safari\/(\d+.\d)/);
                return !(s && "object" == typeof s && s.length >= 2) || parseFloat(s[1]) < 535.19
            }
            return !1
        }(),
        o.extend(o.style = {}, {
            transform: h,
            transitionTimingFunction: e("transitionTimingFunction"),
            transitionDuration: e("transitionDuration"),
            transitionDelay: e("transitionDelay"),
            transformOrigin: e("transformOrigin"),
            touchAction: e("touchAction")
        }),
        o.hasClass = function(t, i) {
            var s = new RegExp("(^|\\s)" + i + "(\\s|$)");
            return s.test(t.className)
        }
        ,
        o.addClass = function(t, i) {
            if (!o.hasClass(t, i)) {
                var s = t.className.split(" ");
                s.push(i),
                t.className = s.join(" ")
            }
        }
        ,
        o.removeClass = function(t, i) {
            if (o.hasClass(t, i)) {
                var s = new RegExp("(^|\\s)" + i + "(\\s|$)","g");
                t.className = t.className.replace(s, " ")
            }
        }
        ,
        o.offset = function(t) {
            for (var i = -t.offsetLeft, s = -t.offsetTop; t = t.offsetParent; )
                i -= t.offsetLeft,
                s -= t.offsetTop;
            return {
                left: i,
                top: s
            }
        }
        ,
        o.isHyperlink = function(t) {
            if (!t)
                return !1;
            for (; t; ) {
                if ("A" == t.nodeName.toLocaleUpperCase())
                    return !0;
                t = t.parentNode
            }
            return !1
        }
        ,
        o.preventDefaultException = function(t, i) {
            if (o.isHyperlink(t))
                return !0;
            for (var s in i)
                if (i[s].test(t[s]))
                    return !0;
            return !1
        }
        ,
        o.extend(o.eventType = {}, {
            touchstart: 1,
            touchmove: 1,
            touchend: 1,
            mousedown: 2,
            mousemove: 2,
            mouseup: 2,
            pointerdown: 3,
            pointermove: 3,
            pointerup: 3,
            MSPointerDown: 3,
            MSPointerMove: 3,
            MSPointerUp: 3
        }),
        o.extend(o.ease = {}, {
            quadratic: {
                style: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                fn: function(t) {
                    return t * (2 - t)
                }
            },
            circular: {
                style: "cubic-bezier(0.1, 0.57, 0.1, 1)",
                fn: function(t) {
                    return s.sqrt(1 - --t * t)
                }
            },
            back: {
                style: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                fn: function(t) {
                    var i = 4;
                    return (t -= 1) * t * ((i + 1) * t + i) + 1
                }
            },
            bounce: {
                style: "",
                fn: function(t) {
                    return (t /= 1) < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375
                }
            },
            elastic: {
                style: "",
                fn: function(t) {
                    var i = .22
                      , e = .4;
                    return 0 === t ? 0 : 1 == t ? 1 : e * s.pow(2, -10 * t) * s.sin((t - i / 4) * (2 * s.PI) / i) + 1
                }
            }
        }),
        o.tap = function(t, s) {
            var e = i.createEvent("Event");
            e.initEvent(s, !0, !0),
            e.pageX = t.pageX,
            e.pageY = t.pageY,
            t.target.dispatchEvent(e)
        }
        ,
        o.click = function(s) {
            var e, o = s.target;
            /(SELECT|INPUT|TEXTAREA)/i.test(o.tagName) || (e = i.createEvent(t.MouseEvent ? "MouseEvents" : "Event"),
            e.initEvent("click", !0, !0),
            e.view = s.view || t,
            e.detail = 1,
            e.screenX = o.screenX || 0,
            e.screenY = o.screenY || 0,
            e.clientX = o.clientX || 0,
            e.clientY = o.clientY || 0,
            e.ctrlKey = !!s.ctrlKey,
            e.altKey = !!s.altKey,
            e.shiftKey = !!s.shiftKey,
            e.metaKey = !!s.metaKey,
            e.button = 0,
            e.relatedTarget = null,
            e._constructed = !0,
            o.dispatchEvent(e))
        }
        ,
        o.getTouchAction = function(t, i) {
            var s = "none";
            return "vertical" === t ? s = "pan-y" : "horizontal" === t && (s = "pan-x"),
            i && "none" != s && (s += " pinch-zoom"),
            s
        }
        ,
        o.getRect = function(t) {
            if (t instanceof SVGElement) {
                var i = t.getBoundingClientRect();
                return {
                    top: i.top,
                    left: i.left,
                    width: i.width,
                    height: i.height
                }
            }
            return {
                top: t.offsetTop,
                left: t.offsetLeft,
                width: t.offsetWidth,
                height: t.offsetHeight
            }
        }
        ,
        o
    }();
    e.prototype = {
        version: "5.2.0-snapshot",
        _init: function() {
            this._initEvents(),
            (this.options.scrollbars || this.options.indicators) && this._initIndicators(),
            this.options.mouseWheel && this._initWheel(),
            this.options.snap && this._initSnap(),
            this.options.keyBindings && this._initKeys()
        },
        destroy: function() {
            this._initEvents(!0),
            clearTimeout(this.resizeTimeout),
            this.resizeTimeout = null,
            this._execEvent("destroy")
        },
        setScrollHeight: function(t) {
            this.scrollHeight = t,
            this.refresh()
        },
        _transitionEnd: function(t) {
            t.target == this.scroller && this.isInTransition && (this._transitionTime(),
            this.resetPosition(this.options.bounceTime) || (this.isInTransition = !1,
            this._execEvent("scrollEnd")))
        },
        _start: function(t) {
            if (1 != h.eventType[t.type]) {
                var i;
                if (i = t.which ? t.button : t.button < 2 ? 0 : 4 == t.button ? 1 : 2,
                0 !== i)
                    return
            }
            if (this.enabled && (!this.initiated || h.eventType[t.type] === this.initiated)) {
                !this.options.preventDefault || h.isBadAndroid || h.preventDefaultException(t.target, this.options.preventDefaultException) || t.preventDefault();
                var e, o = t.touches ? t.touches[0] : t;
                this.initiated = h.eventType[t.type],
                this.moved = !1,
                this.distX = 0,
                this.distY = 0,
                this.directionX = 0,
                this.directionY = 0,
                this.directionLocked = 0,
                this.startTime = h.getTime(),
                this.options.useTransition && this.isInTransition ? (this._transitionTime(),
                this.isInTransition = !1,
                e = this.getComputedPosition(),
                this._translate(s.round(e.x), s.round(e.y)),
                this._execEvent("scrollEnd")) : !this.options.useTransition && this.isAnimating && (this.isAnimating = !1,
                this._execEvent("scrollEnd")),
                this.startX = this.x,
                this.startY = this.y,
                this.absStartX = this.x,
                this.absStartY = this.y,
                this.pointX = o.pageX,
                this.pointY = o.pageY,
                this._execEvent("beforeScrollStart")
            }
        },
        _move: function(t) {
            if (this.enabled && h.eventType[t.type] === this.initiated) {
                this.options.preventDefault && !h.preventDefaultException(t.target, this.options.preventDefaultException) && t.preventDefault();
                var i, e, o, n, r = t.touches ? t.touches[0] : t, a = r.pageX - this.pointX, l = r.pageY - this.pointY, c = h.getTime();
                if (this.pointX = r.pageX,
                this.pointY = r.pageY,
                this.distX += a,
                this.distY += l,
                o = s.abs(this.distX),
                n = s.abs(this.distY),
                !(c - this.endTime > 300 && o < 10 && n < 10)) {
                    if (this.directionLocked || this.options.freeScroll || (o > n + this.options.directionLockThreshold ? this.directionLocked = "h" : n >= o + this.options.directionLockThreshold ? this.directionLocked = "v" : this.directionLocked = "n"),
                    "h" == this.directionLocked) {
                        if ("vertical" == this.options.eventPassthrough)
                            t.preventDefault();
                        else if ("horizontal" == this.options.eventPassthrough)
                            return void (this.initiated = !1);
                        l = 0
                    } else if ("v" == this.directionLocked) {
                        if ("horizontal" == this.options.eventPassthrough)
                            t.preventDefault();
                        else if ("vertical" == this.options.eventPassthrough)
                            return void (this.initiated = !1);
                        a = 0
                    }
                    a = this.hasHorizontalScroll ? a : 0,
                    l = this.hasVerticalScroll ? l : 0,
                    i = this.x + a,
                    e = this.y + l,
                    (i > 0 || i < this.maxScrollX) && (i = this.options.bounce ? this.x + a / 3 : i > 0 ? 0 : this.maxScrollX),
                    (e > 0 || e < this.maxScrollY) && (e = this.options.bounce ? this.y + l / 3 : e > 0 ? 0 : this.maxScrollY),
                    this.directionX = a > 0 ? -1 : a < 0 ? 1 : 0,
                    this.directionY = l > 0 ? -1 : l < 0 ? 1 : 0,
                    this.moved || this._execEvent("scrollStart"),
                    this.moved = !0,
                    this._translate(i, e),
                    c - this.startTime > 300 && (this.startTime = c,
                    this.startX = this.x,
                    this.startY = this.y)
                }
            }
        },
        _end: function(t) {
            if (this.enabled && h.eventType[t.type] === this.initiated) {
                this.options.preventDefault && !h.preventDefaultException(t.target, this.options.preventDefaultException) && t.preventDefault();
                var i, e, o = (t.changedTouches ? t.changedTouches[0] : t,
                h.getTime() - this.startTime), n = s.round(this.x), r = s.round(this.y), a = s.abs(n - this.startX), l = s.abs(r - this.startY), c = 0, p = "";
                if (this.isInTransition = 0,
                this.initiated = 0,
                this.endTime = h.getTime(),
                !this.resetPosition(this.options.bounceTime)) {
                    if (this.scrollTo(n, r),
                    !this.moved)
                        return this.options.tap && h.tap(t, this.options.tap),
                        this.options.click && h.click(t),
                        void this._execEvent("scrollCancel");
                    if (this._events.flick && o < 200 && a < 100 && l < 100)
                        return void this._execEvent("flick");
                    if (this.options.momentum && o < 300 && (i = this.hasHorizontalScroll ? h.momentum(this.x, this.startX, o, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : {
                        destination: n,
                        duration: 0
                    },
                    e = this.hasVerticalScroll ? h.momentum(this.y, this.startY, o, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : {
                        destination: r,
                        duration: 0
                    },
                    n = i.destination,
                    r = e.destination,
                    c = s.max(i.duration, e.duration),
                    this.isInTransition = 1),
                    this.options.snap) {
                        var d = this._nearestSnap(n, r);
                        this.currentPage = d,
                        c = this.options.snapSpeed || s.max(s.max(s.min(s.abs(n - d.x), 1e3), s.min(s.abs(r - d.y), 1e3)), 300),
                        n = d.x,
                        r = d.y,
                        this.directionX = 0,
                        this.directionY = 0,
                        p = this.options.bounceEasing
                    }
                    return n != this.x || r != this.y ? ((n > 0 || n < this.maxScrollX || r > 0 || r < this.maxScrollY) && (p = h.ease.quadratic),
                    void this.scrollTo(n, r, c, p)) : void this._execEvent("scrollEnd")
                }
            }
        },
        _resize: function() {
            var t = this;
            clearTimeout(this.resizeTimeout),
            this.resizeTimeout = setTimeout(function() {
                t.refresh()
            }, this.options.resizePolling)
        },
        resetPosition: function(t) {
            var i = this.x
              , s = this.y;
            return t = t || 0,
            !this.hasHorizontalScroll || this.x > 0 ? i = 0 : this.x < this.maxScrollX && (i = this.maxScrollX),
            !this.hasVerticalScroll || this.y > 0 ? s = 0 : this.y < this.maxScrollY && (s = this.maxScrollY),
            (i != this.x || s != this.y) && (this.scrollTo(i, s, t, this.options.bounceEasing),
            !0)
        },
        disable: function() {
            this.enabled = !1
        },
        enable: function() {
            this.enabled = !0
        },
        refresh: function() {
            h.getRect(this.wrapper),
            this.wrapperWidth = this.wrapper.clientWidth,
            this.wrapperHeight = this.wrapper.clientHeight;
            var t = h.getRect(this.scroller);
            this.scrollHeight && (t.height = this.scrollHeight),
            this.scrollerWidth = t.width,
            this.scrollerHeight = t.height,
            this.maxScrollX = this.wrapperWidth - this.scrollerWidth,
            this.maxScrollY = this.wrapperHeight - this.scrollerHeight,
            this.hasHorizontalScroll = this.options.scrollX && this.maxScrollX < 0,
            this.hasVerticalScroll = this.options.scrollY && this.maxScrollY < 0,
            this.hasHorizontalScroll || (this.maxScrollX = 0,
            this.scrollerWidth = this.wrapperWidth),
            this.hasVerticalScroll || (this.maxScrollY = 0,
            this.scrollerHeight = this.wrapperHeight),
            this.endTime = 0,
            this.directionX = 0,
            this.directionY = 0,
            h.hasPointer && !this.options.disablePointer && (this.wrapper.style[h.style.touchAction] = h.getTouchAction(this.options.eventPassthrough, !0),
            this.wrapper.style[h.style.touchAction] || (this.wrapper.style[h.style.touchAction] = h.getTouchAction(this.options.eventPassthrough, !1))),
            this.wrapperOffset = h.offset(this.wrapper),
            this._execEvent("refresh"),
            this.resetPosition()
        },
        on: function(t, i) {
            this._events[t] || (this._events[t] = []),
            this._events[t].push(i)
        },
        off: function(t, i) {
            if (this._events[t]) {
                var s = this._events[t].indexOf(i);
                s > -1 && this._events[t].splice(s, 1)
            }
        },
        _execEvent: function(t) {
            if (this._events[t]) {
                var i = 0
                  , s = this._events[t].length;
                if (s)
                    for (; i < s; i++)
                        this._events[t][i].apply(this, [].slice.call(arguments, 1))
            }
        },
        scrollBy: function(t, i, s, e) {
            t = this.x + t,
            i = this.y + i,
            s = s || 0,
            this.scrollTo(t, i, s, e)
        },
        scrollTo: function(t, i, s, e) {
            e = e || h.ease.circular,
            this.isInTransition = this.options.useTransition && s > 0;
            var o = this.options.useTransition && e.style;
            !s || o ? (o && (this._transitionTimingFunction(e.style),
            this._transitionTime(s)),
            this._translate(t, i)) : this._animate(t, i, s, e.fn)
        },
        scrollToElement: function(t, i, e, o, n) {
            if (t = t.nodeType ? t : this.scroller.querySelector(t)) {
                var r = h.offset(t);
                r.left -= this.wrapperOffset.left,
                r.top -= this.wrapperOffset.top;
                var a = h.getRect(t)
                  , l = h.getRect(this.wrapper);
                e === !0 && (e = s.round(a.width / 2 - l.width / 2)),
                o === !0 && (o = s.round(a.height / 2 - l.height / 2)),
                r.left -= e || 0,
                r.top -= o || 0,
                r.left = r.left > 0 ? 0 : r.left < this.maxScrollX ? this.maxScrollX : r.left,
                r.top = r.top > 0 ? 0 : r.top < this.maxScrollY ? this.maxScrollY : r.top,
                i = void 0 === i || null === i || "auto" === i ? s.max(s.abs(this.x - r.left), s.abs(this.y - r.top)) : i,
                this.scrollTo(r.left, r.top, i, n)
            }
        },
        _transitionTime: function(t) {
            if (this.options.useTransition) {
                t = t || 0;
                var i = h.style.transitionDuration;
                if (i) {
                    if (this.scrollerStyle[i] = t + "ms",
                    !t && h.isBadAndroid) {
                        this.scrollerStyle[i] = "0.0001ms";
                        var s = this;
                        r(function() {
                            "0.0001ms" === s.scrollerStyle[i] && (s.scrollerStyle[i] = "0s")
                        })
                    }
                    if (this.indicators)
                        for (var e = this.indicators.length; e--; )
                            this.indicators[e].transitionTime(t)
                }
            }
        },
        _transitionTimingFunction: function(t) {
            if (this.scrollerStyle[h.style.transitionTimingFunction] = t,
            this.indicators)
                for (var i = this.indicators.length; i--; )
                    this.indicators[i].transitionTimingFunction(t)
        },
        _translate: function(t, i) {
            if (this.options.useTransform ? this.scrollerStyle[h.style.transform] = "translate(" + t + "px," + i + "px)" + this.translateZ : (t = s.round(t),
            i = s.round(i),
            this.scrollerStyle.left = t + "px",
            this.scrollerStyle.top = i + "px"),
            this.x = t,
            this.y = i,
            this.indicators)
                for (var e = this.indicators.length; e--; )
                    this.indicators[e].updatePosition();
            this.options.onScrollHandler()
        },
        _initEvents: function(i) {
            var s = i ? h.removeEvent : h.addEvent
              , e = this.options.bindToWrapper ? this.wrapper : t;
            s(t, "orientationchange", this),
            s(t, "resize", this),
            this.options.click && s(this.wrapper, "click", this, !0),
            this.options.disableMouse || (s(this.wrapper, "mousedown", this),
            s(e, "mousemove", this),
            s(e, "mousecancel", this),
            s(e, "mouseup", this)),
            h.hasPointer && !this.options.disablePointer && (s(this.wrapper, h.prefixPointerEvent("pointerdown"), this),
            s(e, h.prefixPointerEvent("pointermove"), this),
            s(e, h.prefixPointerEvent("pointercancel"), this),
            s(e, h.prefixPointerEvent("pointerup"), this)),
            h.hasTouch && !this.options.disableTouch && (s(this.wrapper, "touchstart", this),
            s(e, "touchmove", this),
            s(e, "touchcancel", this),
            s(e, "touchend", this)),
            s(this.scroller, "transitionend", this),
            s(this.scroller, "webkitTransitionEnd", this),
            s(this.scroller, "oTransitionEnd", this),
            s(this.scroller, "MSTransitionEnd", this)
        },
        getComputedPosition: function() {
            var i, s, e = t.getComputedStyle(this.scroller, null);
            return this.options.useTransform ? (e = e[h.style.transform].split(")")[0].split(", "),
            i = +(e[12] || e[4]),
            s = +(e[13] || e[5])) : (i = +e.left.replace(/[^-\d.]/g, ""),
            s = +e.top.replace(/[^-\d.]/g, "")),
            {
                x: i,
                y: s
            }
        },
        _initIndicators: function() {
            function t(t) {
                if (h.indicators)
                    for (var i = h.indicators.length; i--; )
                        t.call(h.indicators[i])
            }
            var i, s = this.options.interactiveScrollbars, e = "string" != typeof this.options.scrollbars, r = [], h = this;
            this.indicators = [],
            this.options.scrollbars && (this.options.scrollY && (i = {
                el: o("v", s, this.options.scrollbars),
                interactive: s,
                defaultScrollbars: !0,
                customStyle: e,
                resize: this.options.resizeScrollbars,
                shrink: this.options.shrinkScrollbars,
                fade: this.options.fadeScrollbars,
                listenX: !1
            },
            this.wrapper.appendChild(i.el),
            r.push(i)),
            this.options.scrollX && (i = {
                el: o("h", s, this.options.scrollbars),
                interactive: s,
                defaultScrollbars: !0,
                customStyle: e,
                resize: this.options.resizeScrollbars,
                shrink: this.options.shrinkScrollbars,
                fade: this.options.fadeScrollbars,
                listenY: !1
            },
            this.wrapper.appendChild(i.el),
            r.push(i))),
            this.options.indicators && (r = r.concat(this.options.indicators));
            for (var a = r.length; a--; )
                this.indicators.push(new n(this,r[a]));
            this.options.fadeScrollbars && (this.on("scrollEnd", function() {
                t(function() {
                    this.fade()
                })
            }),
            this.on("scrollCancel", function() {
                t(function() {
                    this.fade()
                })
            }),
            this.on("scrollStart", function() {
                t(function() {
                    this.fade(1)
                })
            }),
            this.on("beforeScrollStart", function() {
                t(function() {
                    this.fade(1, !0)
                })
            })),
            this.on("refresh", function() {
                t(function() {
                    this.refresh()
                })
            }),
            this.on("destroy", function() {
                t(function() {
                    this.destroy()
                }),
                delete this.indicators
            })
        },
        _initWheel: function() {
            h.addEvent(this.wrapper, "wheel", this),
            h.addEvent(this.wrapper, "mousewheel", this),
            h.addEvent(this.wrapper, "DOMMouseScroll", this),
            this.on("destroy", function() {
                clearTimeout(this.wheelTimeout),
                this.wheelTimeout = null,
                h.removeEvent(this.wrapper, "wheel", this),
                h.removeEvent(this.wrapper, "mousewheel", this),
                h.removeEvent(this.wrapper, "DOMMouseScroll", this)
            })
        },
        _wheel: function(t) {
            if (this.enabled) {
                t.preventDefault();
                var i, e, o, n, r = this;
                if (void 0 === this.wheelTimeout && r._execEvent("scrollStart"),
                clearTimeout(this.wheelTimeout),
                this.wheelTimeout = setTimeout(function() {
                    r.options.snap || r._execEvent("scrollEnd"),
                    r.wheelTimeout = void 0
                }, 400),
                "deltaX"in t)
                    1 === t.deltaMode ? (i = -t.deltaX * this.options.mouseWheelSpeed,
                    e = -t.deltaY * this.options.mouseWheelSpeed) : (i = -t.deltaX,
                    e = -t.deltaY);
                else if ("wheelDeltaX"in t)
                    i = t.wheelDeltaX / 120 * this.options.mouseWheelSpeed,
                    e = t.wheelDeltaY / 120 * this.options.mouseWheelSpeed;
                else if ("wheelDelta"in t)
                    i = e = t.wheelDelta / 120 * this.options.mouseWheelSpeed;
                else {
                    if (!("detail"in t))
                        return;
                    i = e = -t.detail / 3 * this.options.mouseWheelSpeed
                }
                if (i *= this.options.invertWheelDirection,
                e *= this.options.invertWheelDirection,
                this.hasVerticalScroll || (i = e,
                e = 0),
                this.options.snap)
                    return o = this.currentPage.pageX,
                    n = this.currentPage.pageY,
                    i > 0 ? o-- : i < 0 && o++,
                    e > 0 ? n-- : e < 0 && n++,
                    void this.goToPage(o, n);
                o = this.x + s.round(this.hasHorizontalScroll ? i : 0),
                n = this.y + s.round(this.hasVerticalScroll ? e : 0),
                this.directionX = i > 0 ? -1 : i < 0 ? 1 : 0,
                this.directionY = e > 0 ? -1 : e < 0 ? 1 : 0,
                o > 0 ? o = 0 : o < this.maxScrollX && (o = this.maxScrollX),
                n > 0 ? n = 0 : n < this.maxScrollY && (n = this.maxScrollY),
                this.scrollTo(o, n, 0)
            }
        },
        _initSnap: function() {
            this.currentPage = {},
            "string" == typeof this.options.snap && (this.options.snap = this.scroller.querySelectorAll(this.options.snap)),
            this.on("refresh", function() {
                var t, i, e, o, n, r, a, l = 0, c = 0, p = 0, d = this.options.snapStepX || this.wrapperWidth, u = this.options.snapStepY || this.wrapperHeight;
                if (this.pages = [],
                this.wrapperWidth && this.wrapperHeight && this.scrollerWidth && this.scrollerHeight) {
                    if (this.options.snap === !0)
                        for (e = s.round(d / 2),
                        o = s.round(u / 2); p > -this.scrollerWidth; ) {
                            for (this.pages[l] = [],
                            t = 0,
                            n = 0; n > -this.scrollerHeight; )
                                this.pages[l][t] = {
                                    x: s.max(p, this.maxScrollX),
                                    y: s.max(n, this.maxScrollY),
                                    width: d,
                                    height: u,
                                    cx: p - e,
                                    cy: n - o
                                },
                                n -= u,
                                t++;
                            p -= d,
                            l++
                        }
                    else
                        for (r = this.options.snap,
                        t = r.length,
                        i = -1; l < t; l++)
                            a = h.getRect(r[l]),
                            (0 === l || a.left <= h.getRect(r[l - 1]).left) && (c = 0,
                            i++),
                            this.pages[c] || (this.pages[c] = []),
                            p = s.max(-a.left, this.maxScrollX),
                            n = s.max(-a.top, this.maxScrollY),
                            e = p - s.round(a.width / 2),
                            o = n - s.round(a.height / 2),
                            this.pages[c][i] = {
                                x: p,
                                y: n,
                                width: a.width,
                                height: a.height,
                                cx: e,
                                cy: o
                            },
                            p > this.maxScrollX && c++;
                    this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0),
                    this.options.snapThreshold % 1 === 0 ? (this.snapThresholdX = this.options.snapThreshold,
                    this.snapThresholdY = this.options.snapThreshold) : (this.snapThresholdX = s.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold),
                    this.snapThresholdY = s.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold))
                }
            }),
            this.on("flick", function() {
                var t = this.options.snapSpeed || s.max(s.max(s.min(s.abs(this.x - this.startX), 1e3), s.min(s.abs(this.y - this.startY), 1e3)), 300);
                this.goToPage(this.currentPage.pageX + this.directionX, this.currentPage.pageY + this.directionY, t)
            })
        },
        _nearestSnap: function(t, i) {
            if (!this.pages.length)
                return {
                    x: 0,
                    y: 0,
                    pageX: 0,
                    pageY: 0
                };
            var e = 0
              , o = this.pages.length
              , n = 0;
            if (s.abs(t - this.absStartX) < this.snapThresholdX && s.abs(i - this.absStartY) < this.snapThresholdY)
                return this.currentPage;
            for (t > 0 ? t = 0 : t < this.maxScrollX && (t = this.maxScrollX),
            i > 0 ? i = 0 : i < this.maxScrollY && (i = this.maxScrollY); e < o; e++)
                if (t >= this.pages[e][0].cx) {
                    t = this.pages[e][0].x;
                    break
                }
            for (o = this.pages[e].length; n < o; n++)
                if (i >= this.pages[0][n].cy) {
                    i = this.pages[0][n].y;
                    break
                }
            return e == this.currentPage.pageX && (e += this.directionX,
            e < 0 ? e = 0 : e >= this.pages.length && (e = this.pages.length - 1),
            t = this.pages[e][0].x),
            n == this.currentPage.pageY && (n += this.directionY,
            n < 0 ? n = 0 : n >= this.pages[0].length && (n = this.pages[0].length - 1),
            i = this.pages[0][n].y),
            {
                x: t,
                y: i,
                pageX: e,
                pageY: n
            }
        },
        goToPage: function(t, i, e, o) {
            o = o || this.options.bounceEasing,
            t >= this.pages.length ? t = this.pages.length - 1 : t < 0 && (t = 0),
            i >= this.pages[t].length ? i = this.pages[t].length - 1 : i < 0 && (i = 0);
            var n = this.pages[t][i].x
              , r = this.pages[t][i].y;
            e = void 0 === e ? this.options.snapSpeed || s.max(s.max(s.min(s.abs(n - this.x), 1e3), s.min(s.abs(r - this.y), 1e3)), 300) : e,
            this.currentPage = {
                x: n,
                y: r,
                pageX: t,
                pageY: i
            },
            this.scrollTo(n, r, e, o)
        },
        next: function(t, i) {
            var s = this.currentPage.pageX
              , e = this.currentPage.pageY;
            s++,
            s >= this.pages.length && this.hasVerticalScroll && (s = 0,
            e++),
            this.goToPage(s, e, t, i)
        },
        prev: function(t, i) {
            var s = this.currentPage.pageX
              , e = this.currentPage.pageY;
            s--,
            s < 0 && this.hasVerticalScroll && (s = 0,
            e--),
            this.goToPage(s, e, t, i)
        },
        _initKeys: function(i) {
            var s, e = {
                pageUp: 33,
                pageDown: 34,
                end: 35,
                home: 36,
                left: 37,
                up: 38,
                right: 39,
                down: 40
            };
            if ("object" == typeof this.options.keyBindings)
                for (s in this.options.keyBindings)
                    "string" == typeof this.options.keyBindings[s] && (this.options.keyBindings[s] = this.options.keyBindings[s].toUpperCase().charCodeAt(0));
            else
                this.options.keyBindings = {};
            for (s in e)
                this.options.keyBindings[s] = this.options.keyBindings[s] || e[s];
            h.addEvent(t, "keydown", this),
            this.on("destroy", function() {
                h.removeEvent(t, "keydown", this)
            })
        },
        _key: function(t) {
            if (this.enabled) {
                var i, e = this.options.snap, o = e ? this.currentPage.pageX : this.x, n = e ? this.currentPage.pageY : this.y, r = h.getTime(), a = this.keyTime || 0, l = .25;
                switch (this.options.useTransition && this.isInTransition && (i = this.getComputedPosition(),
                this._translate(s.round(i.x), s.round(i.y)),
                this.isInTransition = !1),
                this.keyAcceleration = r - a < 200 ? s.min(this.keyAcceleration + l, 50) : 0,
                t.keyCode) {
                case this.options.keyBindings.pageUp:
                    this.hasHorizontalScroll && !this.hasVerticalScroll ? o += e ? 1 : this.wrapperWidth : n += e ? 1 : this.wrapperHeight;
                    break;
                case this.options.keyBindings.pageDown:
                    this.hasHorizontalScroll && !this.hasVerticalScroll ? o -= e ? 1 : this.wrapperWidth : n -= e ? 1 : this.wrapperHeight;
                    break;
                case this.options.keyBindings.end:
                    o = e ? this.pages.length - 1 : this.maxScrollX,
                    n = e ? this.pages[0].length - 1 : this.maxScrollY;
                    break;
                case this.options.keyBindings.home:
                    o = 0,
                    n = 0;
                    break;
                case this.options.keyBindings.left:
                    o += e ? -1 : 5 + this.keyAcceleration >> 0;
                    break;
                case this.options.keyBindings.up:
                    n += e ? 1 : 5 + this.keyAcceleration >> 0;
                    break;
                case this.options.keyBindings.right:
                    o -= e ? -1 : 5 + this.keyAcceleration >> 0;
                    break;
                case this.options.keyBindings.down:
                    n -= e ? 1 : 5 + this.keyAcceleration >> 0;
                    break;
                default:
                    return
                }
                if (e)
                    return void this.goToPage(o, n);
                o > 0 ? (o = 0,
                this.keyAcceleration = 0) : o < this.maxScrollX && (o = this.maxScrollX,
                this.keyAcceleration = 0),
                n > 0 ? (n = 0,
                this.keyAcceleration = 0) : n < this.maxScrollY && (n = this.maxScrollY,
                this.keyAcceleration = 0),
                this.scrollTo(o, n, 0),
                this.keyTime = r
            }
        },
        _animate: function(t, i, s, e) {
            function o() {
                var d, u, m, f = h.getTime();
                return f >= p ? (n.isAnimating = !1,
                n._translate(t, i),
                void (n.resetPosition(n.options.bounceTime) || n._execEvent("scrollEnd"))) : (f = (f - c) / s,
                m = e(f),
                d = (t - a) * m + a,
                u = (i - l) * m + l,
                n._translate(d, u),
                void (n.isAnimating && r(o)))
            }
            var n = this
              , a = this.x
              , l = this.y
              , c = h.getTime()
              , p = c + s;
            this.isAnimating = !0,
            o()
        },
        handleEvent: function(t) {
            switch (t.type) {
            case "touchstart":
            case "pointerdown":
            case "MSPointerDown":
            case "mousedown":
                t.defaultPrevented || this._start(t);
                break;
            case "touchmove":
            case "pointermove":
            case "MSPointerMove":
            case "mousemove":
                t.defaultPrevented || this._move(t);
                break;
            case "touchend":
            case "pointerup":
            case "MSPointerUp":
            case "mouseup":
            case "touchcancel":
            case "pointercancel":
            case "MSPointerCancel":
            case "mousecancel":
                this._end(t);
                break;
            case "orientationchange":
            case "resize":
                this._resize();
                break;
            case "transitionend":
            case "webkitTransitionEnd":
            case "oTransitionEnd":
            case "MSTransitionEnd":
                this._transitionEnd(t);
                break;
            case "wheel":
            case "DOMMouseScroll":
            case "mousewheel":
                this._wheel(t);
                break;
            case "keydown":
                this._key(t);
                break;
            case "click":
                this.enabled && !t._constructed
            }
        }
    },
    n.prototype = {
        handleEvent: function(t) {
            switch (t.type) {
            case "touchstart":
            case "pointerdown":
            case "MSPointerDown":
            case "mousedown":
                this._start(t);
                break;
            case "touchmove":
            case "pointermove":
            case "MSPointerMove":
            case "mousemove":
                this._move(t);
                break;
            case "touchend":
            case "pointerup":
            case "MSPointerUp":
            case "mouseup":
            case "touchcancel":
            case "pointercancel":
            case "MSPointerCancel":
            case "mousecancel":
                this._end(t)
            }
        },
        destroy: function() {
            this.options.fadeScrollbars && (clearTimeout(this.fadeTimeout),
            this.fadeTimeout = null),
            this.options.interactive && (h.removeEvent(this.indicator, "touchstart", this),
            h.removeEvent(this.indicator, h.prefixPointerEvent("pointerdown"), this),
            h.removeEvent(this.indicator, "mousedown", this),
            h.removeEvent(t, "touchmove", this),
            h.removeEvent(t, h.prefixPointerEvent("pointermove"), this),
            h.removeEvent(t, "mousemove", this),
            h.removeEvent(t, "touchend", this),
            h.removeEvent(t, h.prefixPointerEvent("pointerup"), this),
            h.removeEvent(t, "mouseup", this)),
            this.options.defaultScrollbars && this.wrapper.parentNode && this.wrapper.parentNode.removeChild(this.wrapper)
        },
        _start: function(i) {
            var s = i.touches ? i.touches[0] : i;
            i.preventDefault(),
            i.stopPropagation(),
            this.transitionTime(),
            this.initiated = !0,
            this.moved = !1,
            this.lastPointX = s.pageX,
            this.lastPointY = s.pageY,
            this.startTime = h.getTime(),
            this.options.disableTouch || h.addEvent(t, "touchmove", this),
            this.options.disablePointer || h.addEvent(t, h.prefixPointerEvent("pointermove"), this),
            this.options.disableMouse || h.addEvent(t, "mousemove", this),
            this.scroller._execEvent("beforeScrollStart")
        },
        _move: function(t) {
            var i, s, e, o, n = t.touches ? t.touches[0] : t;
            h.getTime();
            this.moved || this.scroller._execEvent("scrollStart"),
            this.moved = !0,
            i = n.pageX - this.lastPointX,
            this.lastPointX = n.pageX,
            s = n.pageY - this.lastPointY,
            this.lastPointY = n.pageY,
            e = this.x + i,
            o = this.y + s,
            this._pos(e, o),
            t.preventDefault(),
            t.stopPropagation()
        },
        _end: function(i) {
            if (this.initiated) {
                if (this.initiated = !1,
                i.preventDefault(),
                i.stopPropagation(),
                h.removeEvent(t, "touchmove", this),
                h.removeEvent(t, h.prefixPointerEvent("pointermove"), this),
                h.removeEvent(t, "mousemove", this),
                this.scroller.options.snap) {
                    var e = this.scroller._nearestSnap(this.scroller.x, this.scroller.y)
                      , o = this.options.snapSpeed || s.max(s.max(s.min(s.abs(this.scroller.x - e.x), 1e3), s.min(s.abs(this.scroller.y - e.y), 1e3)), 300);
                    this.scroller.x == e.x && this.scroller.y == e.y || (this.scroller.directionX = 0,
                    this.scroller.directionY = 0,
                    this.scroller.currentPage = e,
                    this.scroller.scrollTo(e.x, e.y, o, this.scroller.options.bounceEasing))
                }
                this.moved && this.scroller._execEvent("scrollEnd")
            }
        },
        transitionTime: function(t) {
            t = t || 0;
            var i = h.style.transitionDuration;
            if (i && (this.indicatorStyle[i] = t + "ms",
            !t && h.isBadAndroid)) {
                this.indicatorStyle[i] = "0.0001ms";
                var s = this;
                r(function() {
                    "0.0001ms" === s.indicatorStyle[i] && (s.indicatorStyle[i] = "0s")
                })
            }
        },
        transitionTimingFunction: function(t) {
            this.indicatorStyle[h.style.transitionTimingFunction] = t
        },
        refresh: function() {
            this.transitionTime(),
            this.options.listenX && !this.options.listenY ? this.indicatorStyle.display = this.scroller.hasHorizontalScroll ? "block" : "none" : this.options.listenY && !this.options.listenX ? this.indicatorStyle.display = this.scroller.hasVerticalScroll ? "block" : "none" : this.indicatorStyle.display = this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? "block" : "none",
            this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll ? (h.addClass(this.wrapper, "iScrollBothScrollbars"),
            h.removeClass(this.wrapper, "iScrollLoneScrollbar"),
            this.options.defaultScrollbars && this.options.customStyle && (this.options.listenX ? this.wrapper.style.right = "8px" : this.wrapper.style.bottom = "8px")) : (h.removeClass(this.wrapper, "iScrollBothScrollbars"),
            h.addClass(this.wrapper, "iScrollLoneScrollbar"),
            this.options.defaultScrollbars && this.options.customStyle && (this.options.listenX ? this.wrapper.style.right = "2px" : this.wrapper.style.bottom = "2px")),
            h.getRect(this.wrapper),
            this.options.listenX && (this.wrapperWidth = this.wrapper.clientWidth,
            this.options.resize ? (this.indicatorWidth = s.max(s.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8),
            this.indicatorStyle.width = this.indicatorWidth + "px") : this.indicatorWidth = this.indicator.clientWidth,
            this.maxPosX = this.wrapperWidth - this.indicatorWidth,
            "clip" == this.options.shrink ? (this.minBoundaryX = -this.indicatorWidth + 8,
            this.maxBoundaryX = this.wrapperWidth - 8) : (this.minBoundaryX = 0,
            this.maxBoundaryX = this.maxPosX),
            this.sizeRatioX = this.options.speedRatioX || this.scroller.maxScrollX && this.maxPosX / this.scroller.maxScrollX),
            this.options.listenY && (this.wrapperHeight = this.wrapper.clientHeight,
            this.options.resize ? (this.indicatorHeight = s.max(s.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8),
            this.indicatorStyle.height = this.indicatorHeight + "px") : this.indicatorHeight = this.indicator.clientHeight,
            this.maxPosY = this.wrapperHeight - this.indicatorHeight,
            "clip" == this.options.shrink ? (this.minBoundaryY = -this.indicatorHeight + 8,
            this.maxBoundaryY = this.wrapperHeight - 8) : (this.minBoundaryY = 0,
            this.maxBoundaryY = this.maxPosY),
            this.maxPosY = this.wrapperHeight - this.indicatorHeight,
            this.sizeRatioY = this.options.speedRatioY || this.scroller.maxScrollY && this.maxPosY / this.scroller.maxScrollY),
            this.updatePosition()
        },
        updatePosition: function() {
            var t = this.options.listenX && s.round(this.sizeRatioX * this.scroller.x) || 0
              , i = this.options.listenY && s.round(this.sizeRatioY * this.scroller.y) || 0;
            this.options.ignoreBoundaries || (t < this.minBoundaryX ? ("scale" == this.options.shrink && (this.width = s.max(this.indicatorWidth + t, 8),
            this.indicatorStyle.width = this.width + "px"),
            t = this.minBoundaryX) : t > this.maxBoundaryX ? "scale" == this.options.shrink ? (this.width = s.max(this.indicatorWidth - (t - this.maxPosX), 8),
            this.indicatorStyle.width = this.width + "px",
            t = this.maxPosX + this.indicatorWidth - this.width) : t = this.maxBoundaryX : "scale" == this.options.shrink && this.width != this.indicatorWidth && (this.width = this.indicatorWidth,
            this.indicatorStyle.width = this.width + "px"),
            i < this.minBoundaryY ? ("scale" == this.options.shrink && (this.height = s.max(this.indicatorHeight + 3 * i, 8),
            this.indicatorStyle.height = this.height + "px"),
            i = this.minBoundaryY) : i > this.maxBoundaryY ? "scale" == this.options.shrink ? (this.height = s.max(this.indicatorHeight - 3 * (i - this.maxPosY), 8),
            this.indicatorStyle.height = this.height + "px",
            i = this.maxPosY + this.indicatorHeight - this.height) : i = this.maxBoundaryY : "scale" == this.options.shrink && this.height != this.indicatorHeight && (this.height = this.indicatorHeight,
            this.indicatorStyle.height = this.height + "px")),
            this.x = t,
            this.y = i,
            this.scroller.options.useTransform ? this.indicatorStyle[h.style.transform] = "translate(" + t + "px," + i + "px)" + this.scroller.translateZ : (this.indicatorStyle.left = t + "px",
            this.indicatorStyle.top = i + "px")
        },
        _pos: function(t, i) {
            t < 0 ? t = 0 : t > this.maxPosX && (t = this.maxPosX),
            i < 0 ? i = 0 : i > this.maxPosY && (i = this.maxPosY),
            t = this.options.listenX ? s.round(t / this.sizeRatioX) : this.scroller.x,
            i = this.options.listenY ? s.round(i / this.sizeRatioY) : this.scroller.y,
            this.scroller.scrollTo(t, i)
        },
        fade: function(t, i) {
            if (!i || this.visible) {
                clearTimeout(this.fadeTimeout),
                this.fadeTimeout = null;
                var s = t ? 250 : 500
                  , e = t ? 0 : 300;
                t = t ? "1" : "0",
                this.wrapperStyle[h.style.transitionDuration] = s + "ms",
                this.fadeTimeout = setTimeout(function(t) {
                    this.wrapperStyle.opacity = t,
                    this.visible = +t
                }
                .bind(this, t), e)
            }
        }
    },
    e.utils = h,
    "undefined" != typeof module && module.exports ? module.exports = e : "function" == typeof define && define.amd ? define(function() {
        return e
    }) : t.IScroll = e
}(window, document, Math);
