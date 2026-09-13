var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/react/cjs/react.production.js
var require_react_production = __commonJS({
  "node_modules/react/cjs/react.production.js"(exports) {
    "use strict";
    var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element");
    var REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal");
    var REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment");
    var REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode");
    var REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler");
    var REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer");
    var REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context");
    var REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref");
    var REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense");
    var REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo");
    var REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy");
    var REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity");
    var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
    function getIteratorFn(maybeIterable) {
      if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
      maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
      return "function" === typeof maybeIterable ? maybeIterable : null;
    }
    var ReactNoopUpdateQueue = {
      isMounted: function() {
        return false;
      },
      enqueueForceUpdate: function() {
      },
      enqueueReplaceState: function() {
      },
      enqueueSetState: function() {
      }
    };
    var assign = Object.assign;
    var emptyObject = {};
    function Component(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    Component.prototype.isReactComponent = {};
    Component.prototype.setState = function(partialState, callback) {
      if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
        throw Error(
          "takes an object of state variables to update or a function which returns an object of state variables."
        );
      this.updater.enqueueSetState(this, partialState, callback, "setState");
    };
    Component.prototype.forceUpdate = function(callback) {
      this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
    };
    function ComponentDummy() {
    }
    ComponentDummy.prototype = Component.prototype;
    function PureComponent(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
    pureComponentPrototype.constructor = PureComponent;
    assign(pureComponentPrototype, Component.prototype);
    pureComponentPrototype.isPureReactComponent = true;
    var isArrayImpl = Array.isArray;
    function noop() {
    }
    var ReactSharedInternals = { H: null, A: null, T: null, S: null };
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function ReactElement(type, key, props) {
      var refProp = props.ref;
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
        ref: void 0 !== refProp ? refProp : null,
        props
      };
    }
    function cloneAndReplaceKey(oldElement, newKey) {
      return ReactElement(oldElement.type, newKey, oldElement.props);
    }
    function isValidElement(object) {
      return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    function escape(key) {
      var escaperLookup = { "=": "=0", ":": "=2" };
      return "$" + key.replace(/[=:]/g, function(match) {
        return escaperLookup[match];
      });
    }
    var userProvidedKeyEscapeRegex = /\/+/g;
    function getElementKey(element, index) {
      return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
    }
    function resolveThenable(thenable) {
      switch (thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
        default:
          switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
            function(fulfilledValue) {
              "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
            },
            function(error) {
              "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
            }
          )), thenable.status) {
            case "fulfilled":
              return thenable.value;
            case "rejected":
              throw thenable.reason;
          }
      }
      throw thenable;
    }
    function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
      var type = typeof children;
      if ("undefined" === type || "boolean" === type) children = null;
      var invokeCallback = false;
      if (null === children) invokeCallback = true;
      else
        switch (type) {
          case "bigint":
          case "string":
          case "number":
            invokeCallback = true;
            break;
          case "object":
            switch (children.$$typeof) {
              case REACT_ELEMENT_TYPE:
              case REACT_PORTAL_TYPE:
                invokeCallback = true;
                break;
              case REACT_LAZY_TYPE:
                return invokeCallback = children._init, mapIntoArray(
                  invokeCallback(children._payload),
                  array,
                  escapedPrefix,
                  nameSoFar,
                  callback
                );
            }
        }
      if (invokeCallback)
        return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
          return c;
        })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
          callback,
          escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
            userProvidedKeyEscapeRegex,
            "$&/"
          ) + "/") + invokeCallback
        )), array.push(callback)), 1;
      invokeCallback = 0;
      var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
      if (isArrayImpl(children))
        for (var i = 0; i < children.length; i++)
          nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
            nameSoFar,
            array,
            escapedPrefix,
            type,
            callback
          );
      else if (i = getIteratorFn(children), "function" === typeof i)
        for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
          nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
            nameSoFar,
            array,
            escapedPrefix,
            type,
            callback
          );
      else if ("object" === type) {
        if ("function" === typeof children.then)
          return mapIntoArray(
            resolveThenable(children),
            array,
            escapedPrefix,
            nameSoFar,
            callback
          );
        array = String(children);
        throw Error(
          "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
        );
      }
      return invokeCallback;
    }
    function mapChildren(children, func, context) {
      if (null == children) return children;
      var result = [], count = 0;
      mapIntoArray(children, result, "", "", function(child) {
        return func.call(context, child, count++);
      });
      return result;
    }
    function lazyInitializer(payload) {
      if (-1 === payload._status) {
        var ctor = payload._result;
        ctor = ctor();
        ctor.then(
          function(moduleObject) {
            if (0 === payload._status || -1 === payload._status)
              payload._status = 1, payload._result = moduleObject;
          },
          function(error) {
            if (0 === payload._status || -1 === payload._status)
              payload._status = 2, payload._result = error;
          }
        );
        -1 === payload._status && (payload._status = 0, payload._result = ctor);
      }
      if (1 === payload._status) return payload._result.default;
      throw payload._result;
    }
    var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
      if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
        var event = new window.ErrorEvent("error", {
          bubbles: true,
          cancelable: true,
          message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
          error
        });
        if (!window.dispatchEvent(event)) return;
      } else if ("object" === typeof process && "function" === typeof process.emit) {
        process.emit("uncaughtException", error);
        return;
      }
      console.error(error);
    };
    var Children = {
      map: mapChildren,
      forEach: function(children, forEachFunc, forEachContext) {
        mapChildren(
          children,
          function() {
            forEachFunc.apply(this, arguments);
          },
          forEachContext
        );
      },
      count: function(children) {
        var n = 0;
        mapChildren(children, function() {
          n++;
        });
        return n;
      },
      toArray: function(children) {
        return mapChildren(children, function(child) {
          return child;
        }) || [];
      },
      only: function(children) {
        if (!isValidElement(children))
          throw Error(
            "React.Children.only expected to receive a single React element child."
          );
        return children;
      }
    };
    exports.Activity = REACT_ACTIVITY_TYPE;
    exports.Children = Children;
    exports.Component = Component;
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.Profiler = REACT_PROFILER_TYPE;
    exports.PureComponent = PureComponent;
    exports.StrictMode = REACT_STRICT_MODE_TYPE;
    exports.Suspense = REACT_SUSPENSE_TYPE;
    exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
    exports.__COMPILER_RUNTIME = {
      __proto__: null,
      c: function(size) {
        return ReactSharedInternals.H.useMemoCache(size);
      }
    };
    exports.cache = function(fn) {
      return function() {
        return fn.apply(null, arguments);
      };
    };
    exports.cacheSignal = function() {
      return null;
    };
    exports.cloneElement = function(element, config, children) {
      if (null === element || void 0 === element)
        throw Error(
          "The argument must be a React element, but you passed " + element + "."
        );
      var props = assign({}, element.props), key = element.key;
      if (null != config)
        for (propName in void 0 !== config.key && (key = "" + config.key), config)
          !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
      var propName = arguments.length - 2;
      if (1 === propName) props.children = children;
      else if (1 < propName) {
        for (var childArray = Array(propName), i = 0; i < propName; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      return ReactElement(element.type, key, props);
    };
    exports.createContext = function(defaultValue) {
      defaultValue = {
        $$typeof: REACT_CONTEXT_TYPE,
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        _threadCount: 0,
        Provider: null,
        Consumer: null
      };
      defaultValue.Provider = defaultValue;
      defaultValue.Consumer = {
        $$typeof: REACT_CONSUMER_TYPE,
        _context: defaultValue
      };
      return defaultValue;
    };
    exports.createElement = function(type, config, children) {
      var propName, props = {}, key = null;
      if (null != config)
        for (propName in void 0 !== config.key && (key = "" + config.key), config)
          hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
      var childrenLength = arguments.length - 2;
      if (1 === childrenLength) props.children = children;
      else if (1 < childrenLength) {
        for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      if (type && type.defaultProps)
        for (propName in childrenLength = type.defaultProps, childrenLength)
          void 0 === props[propName] && (props[propName] = childrenLength[propName]);
      return ReactElement(type, key, props);
    };
    exports.createRef = function() {
      return { current: null };
    };
    exports.forwardRef = function(render) {
      return { $$typeof: REACT_FORWARD_REF_TYPE, render };
    };
    exports.isValidElement = isValidElement;
    exports.lazy = function(ctor) {
      return {
        $$typeof: REACT_LAZY_TYPE,
        _payload: { _status: -1, _result: ctor },
        _init: lazyInitializer
      };
    };
    exports.memo = function(type, compare) {
      return {
        $$typeof: REACT_MEMO_TYPE,
        type,
        compare: void 0 === compare ? null : compare
      };
    };
    exports.startTransition = function(scope) {
      var prevTransition = ReactSharedInternals.T, currentTransition = {};
      ReactSharedInternals.T = currentTransition;
      try {
        var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
        null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
        "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
      } catch (error) {
        reportGlobalError(error);
      } finally {
        null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
      }
    };
    exports.unstable_useCacheRefresh = function() {
      return ReactSharedInternals.H.useCacheRefresh();
    };
    exports.use = function(usable) {
      return ReactSharedInternals.H.use(usable);
    };
    exports.useActionState = function(action, initialState, permalink) {
      return ReactSharedInternals.H.useActionState(action, initialState, permalink);
    };
    exports.useCallback = function(callback, deps) {
      return ReactSharedInternals.H.useCallback(callback, deps);
    };
    exports.useContext = function(Context) {
      return ReactSharedInternals.H.useContext(Context);
    };
    exports.useDebugValue = function() {
    };
    exports.useDeferredValue = function(value, initialValue) {
      return ReactSharedInternals.H.useDeferredValue(value, initialValue);
    };
    exports.useEffect = function(create, deps) {
      return ReactSharedInternals.H.useEffect(create, deps);
    };
    exports.useEffectEvent = function(callback) {
      return ReactSharedInternals.H.useEffectEvent(callback);
    };
    exports.useId = function() {
      return ReactSharedInternals.H.useId();
    };
    exports.useImperativeHandle = function(ref, create, deps) {
      return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
    };
    exports.useInsertionEffect = function(create, deps) {
      return ReactSharedInternals.H.useInsertionEffect(create, deps);
    };
    exports.useLayoutEffect = function(create, deps) {
      return ReactSharedInternals.H.useLayoutEffect(create, deps);
    };
    exports.useMemo = function(create, deps) {
      return ReactSharedInternals.H.useMemo(create, deps);
    };
    exports.useOptimistic = function(passthrough, reducer) {
      return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
    };
    exports.useReducer = function(reducer, initialArg, init) {
      return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
    };
    exports.useRef = function(initialValue) {
      return ReactSharedInternals.H.useRef(initialValue);
    };
    exports.useState = function(initialState) {
      return ReactSharedInternals.H.useState(initialState);
    };
    exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
      return ReactSharedInternals.H.useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
      );
    };
    exports.useTransition = function() {
      return ReactSharedInternals.H.useTransition();
    };
    exports.version = "19.2.8";
  }
});

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports, module) {
    "use strict";
    "production" !== process.env.NODE_ENV && (function() {
      function defineDeprecationWarning(methodName, info) {
        Object.defineProperty(Component.prototype, methodName, {
          get: function() {
            console.warn(
              "%s(...) is deprecated in plain JavaScript React classes. %s",
              info[0],
              info[1]
            );
          }
        });
      }
      function getIteratorFn(maybeIterable) {
        if (null === maybeIterable || "object" !== typeof maybeIterable)
          return null;
        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
        return "function" === typeof maybeIterable ? maybeIterable : null;
      }
      function warnNoop(publicInstance, callerName) {
        publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";
        var warningKey = publicInstance + "." + callerName;
        didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error(
          "Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.",
          callerName,
          publicInstance
        ), didWarnStateUpdateForUnmountedComponent[warningKey] = true);
      }
      function Component(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function ComponentDummy() {
      }
      function PureComponent(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function noop() {
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function cloneAndReplaceKey(oldElement, newKey) {
        newKey = ReactElement(
          oldElement.type,
          newKey,
          oldElement.props,
          oldElement._owner,
          oldElement._debugStack,
          oldElement._debugTask
        );
        oldElement._store && (newKey._store.validated = oldElement._store.validated);
        return newKey;
      }
      function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function escape(key) {
        var escaperLookup = { "=": "=0", ":": "=2" };
        return "$" + key.replace(/[=:]/g, function(match) {
          return escaperLookup[match];
        });
      }
      function getElementKey(element, index) {
        return "object" === typeof element && null !== element && null != element.key ? (checkKeyStringCoercion(element.key), escape("" + element.key)) : index.toString(36);
      }
      function resolveThenable(thenable) {
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
          default:
            switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
              function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
              },
              function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            )), thenable.status) {
              case "fulfilled":
                return thenable.value;
              case "rejected":
                throw thenable.reason;
            }
        }
        throw thenable;
      }
      function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
        var type = typeof children;
        if ("undefined" === type || "boolean" === type) children = null;
        var invokeCallback = false;
        if (null === children) invokeCallback = true;
        else
          switch (type) {
            case "bigint":
            case "string":
            case "number":
              invokeCallback = true;
              break;
            case "object":
              switch (children.$$typeof) {
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                  invokeCallback = true;
                  break;
                case REACT_LAZY_TYPE:
                  return invokeCallback = children._init, mapIntoArray(
                    invokeCallback(children._payload),
                    array,
                    escapedPrefix,
                    nameSoFar,
                    callback
                  );
              }
          }
        if (invokeCallback) {
          invokeCallback = children;
          callback = callback(invokeCallback);
          var childKey = "" === nameSoFar ? "." + getElementKey(invokeCallback, 0) : nameSoFar;
          isArrayImpl(callback) ? (escapedPrefix = "", null != childKey && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
            return c;
          })) : null != callback && (isValidElement(callback) && (null != callback.key && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(
            callback,
            escapedPrefix + (null == callback.key || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(
              userProvidedKeyEscapeRegex,
              "$&/"
            ) + "/") + childKey
          ), "" !== nameSoFar && null != invokeCallback && isValidElement(invokeCallback) && null == invokeCallback.key && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));
          return 1;
        }
        invokeCallback = 0;
        childKey = "" === nameSoFar ? "." : nameSoFar + ":";
        if (isArrayImpl(children))
          for (var i = 0; i < children.length; i++)
            nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if (i = getIteratorFn(children), "function" === typeof i)
          for (i === children.entries && (didWarnAboutMaps || console.warn(
            "Using Maps as children is not supported. Use an array of keyed ReactElements instead."
          ), didWarnAboutMaps = true), children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
            nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if ("object" === type) {
          if ("function" === typeof children.then)
            return mapIntoArray(
              resolveThenable(children),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
          array = String(children);
          throw Error(
            "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
          );
        }
        return invokeCallback;
      }
      function mapChildren(children, func, context) {
        if (null == children) return children;
        var result = [], count = 0;
        mapIntoArray(children, result, "", "", function(child) {
          return func.call(context, child, count++);
        });
        return result;
      }
      function lazyInitializer(payload) {
        if (-1 === payload._status) {
          var ioInfo = payload._ioInfo;
          null != ioInfo && (ioInfo.start = ioInfo.end = performance.now());
          ioInfo = payload._result;
          var thenable = ioInfo();
          thenable.then(
            function(moduleObject) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 1;
                payload._result = moduleObject;
                var _ioInfo = payload._ioInfo;
                null != _ioInfo && (_ioInfo.end = performance.now());
                void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
              }
            },
            function(error) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 2;
                payload._result = error;
                var _ioInfo2 = payload._ioInfo;
                null != _ioInfo2 && (_ioInfo2.end = performance.now());
                void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            }
          );
          ioInfo = payload._ioInfo;
          if (null != ioInfo) {
            ioInfo.value = thenable;
            var displayName = thenable.displayName;
            "string" === typeof displayName && (ioInfo.name = displayName);
          }
          -1 === payload._status && (payload._status = 0, payload._result = thenable);
        }
        if (1 === payload._status)
          return ioInfo = payload._result, void 0 === ioInfo && console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?",
            ioInfo
          ), "default" in ioInfo || console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))",
            ioInfo
          ), ioInfo.default;
        throw payload._result;
      }
      function resolveDispatcher() {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error(
          "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
        );
        return dispatcher;
      }
      function releaseAsyncTransition() {
        ReactSharedInternals.asyncTransitions--;
      }
      function enqueueTask(task) {
        if (null === enqueueTaskImpl)
          try {
            var requireString = ("require" + Math.random()).slice(0, 7);
            enqueueTaskImpl = (module && module[requireString]).call(
              module,
              "timers"
            ).setImmediate;
          } catch (_err) {
            enqueueTaskImpl = function(callback) {
              false === didWarnAboutMessageChannel && (didWarnAboutMessageChannel = true, "undefined" === typeof MessageChannel && console.error(
                "This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."
              ));
              var channel = new MessageChannel();
              channel.port1.onmessage = callback;
              channel.port2.postMessage(void 0);
            };
          }
        return enqueueTaskImpl(task);
      }
      function aggregateErrors(errors) {
        return 1 < errors.length && "function" === typeof AggregateError ? new AggregateError(errors) : errors[0];
      }
      function popActScope(prevActQueue, prevActScopeDepth) {
        prevActScopeDepth !== actScopeDepth - 1 && console.error(
          "You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "
        );
        actScopeDepth = prevActScopeDepth;
      }
      function recursivelyFlushAsyncActWork(returnValue, resolve2, reject) {
        var queue = ReactSharedInternals.actQueue;
        if (null !== queue)
          if (0 !== queue.length)
            try {
              flushActQueue(queue);
              enqueueTask(function() {
                return recursivelyFlushAsyncActWork(returnValue, resolve2, reject);
              });
              return;
            } catch (error) {
              ReactSharedInternals.thrownErrors.push(error);
            }
          else ReactSharedInternals.actQueue = null;
        0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve2(returnValue);
      }
      function flushActQueue(queue) {
        if (!isFlushing) {
          isFlushing = true;
          var i = 0;
          try {
            for (; i < queue.length; i++) {
              var callback = queue[i];
              do {
                ReactSharedInternals.didUsePromise = false;
                var continuation = callback(false);
                if (null !== continuation) {
                  if (ReactSharedInternals.didUsePromise) {
                    queue[i] = callback;
                    queue.splice(0, i);
                    return;
                  }
                  callback = continuation;
                } else break;
              } while (1);
            }
            queue.length = 0;
          } catch (error) {
            queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);
          } finally {
            isFlushing = false;
          }
        }
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {
        isMounted: function() {
          return false;
        },
        enqueueForceUpdate: function(publicInstance) {
          warnNoop(publicInstance, "forceUpdate");
        },
        enqueueReplaceState: function(publicInstance) {
          warnNoop(publicInstance, "replaceState");
        },
        enqueueSetState: function(publicInstance) {
          warnNoop(publicInstance, "setState");
        }
      }, assign = Object.assign, emptyObject = {};
      Object.freeze(emptyObject);
      Component.prototype.isReactComponent = {};
      Component.prototype.setState = function(partialState, callback) {
        if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, partialState, callback, "setState");
      };
      Component.prototype.forceUpdate = function(callback) {
        this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
      };
      var deprecatedAPIs = {
        isMounted: [
          "isMounted",
          "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."
        ],
        replaceState: [
          "replaceState",
          "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."
        ]
      };
      for (fnName in deprecatedAPIs)
        deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
      ComponentDummy.prototype = Component.prototype;
      deprecatedAPIs = PureComponent.prototype = new ComponentDummy();
      deprecatedAPIs.constructor = PureComponent;
      assign(deprecatedAPIs, Component.prototype);
      deprecatedAPIs.isPureReactComponent = true;
      var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference"), ReactSharedInternals = {
        H: null,
        A: null,
        T: null,
        S: null,
        actQueue: null,
        asyncTransitions: 0,
        isBatchingLegacy: false,
        didScheduleLegacyUpdate: false,
        didUsePromise: false,
        thrownErrors: [],
        getCurrentStack: null,
        recentlyCreatedOwnerStacks: 0
      }, hasOwnProperty = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      deprecatedAPIs = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = deprecatedAPIs.react_stack_bottom_frame.bind(
        deprecatedAPIs,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutMaps = false, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
        if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
          var event = new window.ErrorEvent("error", {
            bubbles: true,
            cancelable: true,
            message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
            error
          });
          if (!window.dispatchEvent(event)) return;
        } else if ("object" === typeof process && "function" === typeof process.emit) {
          process.emit("uncaughtException", error);
          return;
        }
        console.error(error);
      }, didWarnAboutMessageChannel = false, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = false, isFlushing = false, queueSeveralMicrotasks = "function" === typeof queueMicrotask ? function(callback) {
        queueMicrotask(function() {
          return queueMicrotask(callback);
        });
      } : enqueueTask;
      deprecatedAPIs = Object.freeze({
        __proto__: null,
        c: function(size) {
          return resolveDispatcher().useMemoCache(size);
        }
      });
      var fnName = {
        map: mapChildren,
        forEach: function(children, forEachFunc, forEachContext) {
          mapChildren(
            children,
            function() {
              forEachFunc.apply(this, arguments);
            },
            forEachContext
          );
        },
        count: function(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        },
        toArray: function(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        },
        only: function(children) {
          if (!isValidElement(children))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return children;
        }
      };
      exports.Activity = REACT_ACTIVITY_TYPE;
      exports.Children = fnName;
      exports.Component = Component;
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.Profiler = REACT_PROFILER_TYPE;
      exports.PureComponent = PureComponent;
      exports.StrictMode = REACT_STRICT_MODE_TYPE;
      exports.Suspense = REACT_SUSPENSE_TYPE;
      exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
      exports.__COMPILER_RUNTIME = deprecatedAPIs;
      exports.act = function(callback) {
        var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;
        actScopeDepth++;
        var queue = ReactSharedInternals.actQueue = null !== prevActQueue ? prevActQueue : [], didAwaitActCall = false;
        try {
          var result = callback();
        } catch (error) {
          ReactSharedInternals.thrownErrors.push(error);
        }
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        if (null !== result && "object" === typeof result && "function" === typeof result.then) {
          var thenable = result;
          queueSeveralMicrotasks(function() {
            didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
              "You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"
            ));
          });
          return {
            then: function(resolve2, reject) {
              didAwaitActCall = true;
              thenable.then(
                function(returnValue) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  if (0 === prevActScopeDepth) {
                    try {
                      flushActQueue(queue), enqueueTask(function() {
                        return recursivelyFlushAsyncActWork(
                          returnValue,
                          resolve2,
                          reject
                        );
                      });
                    } catch (error$0) {
                      ReactSharedInternals.thrownErrors.push(error$0);
                    }
                    if (0 < ReactSharedInternals.thrownErrors.length) {
                      var _thrownError = aggregateErrors(
                        ReactSharedInternals.thrownErrors
                      );
                      ReactSharedInternals.thrownErrors.length = 0;
                      reject(_thrownError);
                    }
                  } else resolve2(returnValue);
                },
                function(error) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(
                    ReactSharedInternals.thrownErrors
                  ), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);
                }
              );
            }
          };
        }
        var returnValue$jscomp$0 = result;
        popActScope(prevActQueue, prevActScopeDepth);
        0 === prevActScopeDepth && (flushActQueue(queue), 0 !== queue.length && queueSeveralMicrotasks(function() {
          didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
            "A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"
          ));
        }), ReactSharedInternals.actQueue = null);
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        return {
          then: function(resolve2, reject) {
            didAwaitActCall = true;
            0 === prevActScopeDepth ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {
              return recursivelyFlushAsyncActWork(
                returnValue$jscomp$0,
                resolve2,
                reject
              );
            })) : resolve2(returnValue$jscomp$0);
          }
        };
      };
      exports.cache = function(fn) {
        return function() {
          return fn.apply(null, arguments);
        };
      };
      exports.cacheSignal = function() {
        return null;
      };
      exports.captureOwnerStack = function() {
        var getCurrentStack = ReactSharedInternals.getCurrentStack;
        return null === getCurrentStack ? null : getCurrentStack();
      };
      exports.cloneElement = function(element, config, children) {
        if (null === element || void 0 === element)
          throw Error(
            "The argument must be a React element, but you passed " + element + "."
          );
        var props = assign({}, element.props), key = element.key, owner = element._owner;
        if (null != config) {
          var JSCompiler_inline_result;
          a: {
            if (hasOwnProperty.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(
              config,
              "ref"
            ).get) && JSCompiler_inline_result.isReactWarning) {
              JSCompiler_inline_result = false;
              break a;
            }
            JSCompiler_inline_result = void 0 !== config.ref;
          }
          JSCompiler_inline_result && (owner = getOwner());
          hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);
          for (propName in config)
            !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
        }
        var propName = arguments.length - 2;
        if (1 === propName) props.children = children;
        else if (1 < propName) {
          JSCompiler_inline_result = Array(propName);
          for (var i = 0; i < propName; i++)
            JSCompiler_inline_result[i] = arguments[i + 2];
          props.children = JSCompiler_inline_result;
        }
        props = ReactElement(
          element.type,
          key,
          props,
          owner,
          element._debugStack,
          element._debugTask
        );
        for (key = 2; key < arguments.length; key++)
          validateChildKeys(arguments[key]);
        return props;
      };
      exports.createContext = function(defaultValue) {
        defaultValue = {
          $$typeof: REACT_CONTEXT_TYPE,
          _currentValue: defaultValue,
          _currentValue2: defaultValue,
          _threadCount: 0,
          Provider: null,
          Consumer: null
        };
        defaultValue.Provider = defaultValue;
        defaultValue.Consumer = {
          $$typeof: REACT_CONSUMER_TYPE,
          _context: defaultValue
        };
        defaultValue._currentRenderer = null;
        defaultValue._currentRenderer2 = null;
        return defaultValue;
      };
      exports.createElement = function(type, config, children) {
        for (var i = 2; i < arguments.length; i++)
          validateChildKeys(arguments[i]);
        i = {};
        var key = null;
        if (null != config)
          for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = true, console.warn(
            "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"
          )), hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key), config)
            hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (i[propName] = config[propName]);
        var childrenLength = arguments.length - 2;
        if (1 === childrenLength) i.children = children;
        else if (1 < childrenLength) {
          for (var childArray = Array(childrenLength), _i = 0; _i < childrenLength; _i++)
            childArray[_i] = arguments[_i + 2];
          Object.freeze && Object.freeze(childArray);
          i.children = childArray;
        }
        if (type && type.defaultProps)
          for (propName in childrenLength = type.defaultProps, childrenLength)
            void 0 === i[propName] && (i[propName] = childrenLength[propName]);
        key && defineKeyPropWarningGetter(
          i,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        var propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return ReactElement(
          type,
          key,
          i,
          getOwner(),
          propName ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports.createRef = function() {
        var refObject = { current: null };
        Object.seal(refObject);
        return refObject;
      };
      exports.forwardRef = function(render) {
        null != render && render.$$typeof === REACT_MEMO_TYPE ? console.error(
          "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))."
        ) : "function" !== typeof render ? console.error(
          "forwardRef requires a render function but was given %s.",
          null === render ? "null" : typeof render
        ) : 0 !== render.length && 2 !== render.length && console.error(
          "forwardRef render functions accept exactly two parameters: props and ref. %s",
          1 === render.length ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."
        );
        null != render && null != render.defaultProps && console.error(
          "forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?"
        );
        var elementType = { $$typeof: REACT_FORWARD_REF_TYPE, render }, ownName;
        Object.defineProperty(elementType, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);
          }
        });
        return elementType;
      };
      exports.isValidElement = isValidElement;
      exports.lazy = function(ctor) {
        ctor = { _status: -1, _result: ctor };
        var lazyType = {
          $$typeof: REACT_LAZY_TYPE,
          _payload: ctor,
          _init: lazyInitializer
        }, ioInfo = {
          name: "lazy",
          start: -1,
          end: -1,
          value: null,
          owner: null,
          debugStack: Error("react-stack-top-frame"),
          debugTask: console.createTask ? console.createTask("lazy()") : null
        };
        ctor._ioInfo = ioInfo;
        lazyType._debugInfo = [{ awaited: ioInfo }];
        return lazyType;
      };
      exports.memo = function(type, compare) {
        null == type && console.error(
          "memo: The first argument must be a component. Instead received: %s",
          null === type ? "null" : typeof type
        );
        compare = {
          $$typeof: REACT_MEMO_TYPE,
          type,
          compare: void 0 === compare ? null : compare
        };
        var ownName;
        Object.defineProperty(compare, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);
          }
        });
        return compare;
      };
      exports.startTransition = function(scope) {
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        currentTransition._updatedFibers = /* @__PURE__ */ new Set();
        ReactSharedInternals.T = currentTransition;
        try {
          var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && (ReactSharedInternals.asyncTransitions++, returnValue.then(releaseAsyncTransition, releaseAsyncTransition), returnValue.then(noop, reportGlobalError));
        } catch (error) {
          reportGlobalError(error);
        } finally {
          null === prevTransition && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn(
            "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
          )), null !== prevTransition && null !== currentTransition.types && (null !== prevTransition.types && prevTransition.types !== currentTransition.types && console.error(
            "We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."
          ), prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
        }
      };
      exports.unstable_useCacheRefresh = function() {
        return resolveDispatcher().useCacheRefresh();
      };
      exports.use = function(usable) {
        return resolveDispatcher().use(usable);
      };
      exports.useActionState = function(action, initialState, permalink) {
        return resolveDispatcher().useActionState(
          action,
          initialState,
          permalink
        );
      };
      exports.useCallback = function(callback, deps) {
        return resolveDispatcher().useCallback(callback, deps);
      };
      exports.useContext = function(Context) {
        var dispatcher = resolveDispatcher();
        Context.$$typeof === REACT_CONSUMER_TYPE && console.error(
          "Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"
        );
        return dispatcher.useContext(Context);
      };
      exports.useDebugValue = function(value, formatterFn) {
        return resolveDispatcher().useDebugValue(value, formatterFn);
      };
      exports.useDeferredValue = function(value, initialValue) {
        return resolveDispatcher().useDeferredValue(value, initialValue);
      };
      exports.useEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useEffect(create, deps);
      };
      exports.useEffectEvent = function(callback) {
        return resolveDispatcher().useEffectEvent(callback);
      };
      exports.useId = function() {
        return resolveDispatcher().useId();
      };
      exports.useImperativeHandle = function(ref, create, deps) {
        return resolveDispatcher().useImperativeHandle(ref, create, deps);
      };
      exports.useInsertionEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useInsertionEffect(create, deps);
      };
      exports.useLayoutEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useLayoutEffect(create, deps);
      };
      exports.useMemo = function(create, deps) {
        return resolveDispatcher().useMemo(create, deps);
      };
      exports.useOptimistic = function(passthrough, reducer) {
        return resolveDispatcher().useOptimistic(passthrough, reducer);
      };
      exports.useReducer = function(reducer, initialArg, init) {
        return resolveDispatcher().useReducer(reducer, initialArg, init);
      };
      exports.useRef = function(initialValue) {
        return resolveDispatcher().useRef(initialValue);
      };
      exports.useState = function(initialState) {
        return resolveDispatcher().useState(initialState);
      };
      exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
        return resolveDispatcher().useSyncExternalStore(
          subscribe,
          getSnapshot,
          getServerSnapshot
        );
      };
      exports.useTransition = function() {
        return resolveDispatcher().useTransition();
      };
      exports.version = "19.2.8";
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module.exports = require_react_production();
    } else {
      module.exports = require_react_development();
    }
  }
});

// node_modules/react/cjs/react-jsx-runtime.production.js
var require_react_jsx_runtime_production = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.production.js"(exports) {
    "use strict";
    var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element");
    var REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment");
    function jsxProd(type, config, maybeKey) {
      var key = null;
      void 0 !== maybeKey && (key = "" + maybeKey);
      void 0 !== config.key && (key = "" + config.key);
      if ("key" in config) {
        maybeKey = {};
        for (var propName in config)
          "key" !== propName && (maybeKey[propName] = config[propName]);
      } else maybeKey = config;
      config = maybeKey.ref;
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
        ref: void 0 !== config ? config : null,
        props: maybeKey
      };
    }
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsx = jsxProd;
    exports.jsxs = jsxProd;
  }
});

// node_modules/react/cjs/react-jsx-runtime.development.js
var require_react_jsx_runtime_development = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.development.js"(exports) {
    "use strict";
    "production" !== process.env.NODE_ENV && (function() {
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children)
          if (isStaticChildren)
            if (isArrayImpl(children)) {
              for (isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)
                validateChildKeys(children[isStaticChildren]);
              Object.freeze && Object.freeze(children);
            } else
              console.error(
                "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
              );
          else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
          children = getComponentNameFromType(type);
          var keys = Object.keys(config).filter(function(k) {
            return "key" !== k;
          });
          isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
          didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error(
            'A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />',
            isStaticChildren,
            children,
            keys,
            children
          ), didWarnAboutKeySpread[children + isStaticChildren] = true);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
          maybeKey = {};
          for (var propName in config)
            "key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(
          maybeKey,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        return ReactElement(
          type,
          children,
          maybeKey,
          getOwner(),
          debugStack,
          debugTask
        );
      }
      function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      var React = require_react(), REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity"), REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      React = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(
        React,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutKeySpread = {};
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.jsx = function(type, config, maybeKey) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return jsxDEVImpl(
          type,
          config,
          maybeKey,
          false,
          trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports.jsxs = function(type, config, maybeKey) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return jsxDEVImpl(
          type,
          config,
          maybeKey,
          true,
          trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
    })();
  }
});

// node_modules/react/jsx-runtime.js
var require_jsx_runtime = __commonJS({
  "node_modules/react/jsx-runtime.js"(exports, module) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module.exports = require_react_jsx_runtime_production();
    } else {
      module.exports = require_react_jsx_runtime_development();
    }
  }
});

// tools/lint.ts
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

// src/core/cardParser.ts
var DASHES = /[−–—―‐‑‒－﹣]/g;
function normalizeDashes(s) {
  return s.replace(DASHES, "-");
}
var ND_ZEROS = [
  48,
  1632,
  1776,
  1984,
  2406,
  2534,
  2662,
  2790,
  2918,
  3046,
  3174,
  3302,
  3430,
  3558,
  3664,
  3792,
  3872,
  4160,
  4240,
  6112,
  6160,
  6470,
  6608,
  6784,
  6800,
  6992,
  7088,
  7232,
  7248,
  42528,
  43216,
  43264,
  43472,
  43504,
  43600,
  44016,
  65296,
  66720,
  68912,
  68928,
  69734,
  69872,
  69942,
  70096,
  70384,
  70736,
  70864,
  71248,
  71360,
  71376,
  71386,
  71472,
  71904,
  72016,
  72688,
  72784,
  73040,
  73120,
  73552,
  90416,
  92768,
  92864,
  93008,
  93552,
  118e3,
  120782,
  120792,
  120802,
  120812,
  120822,
  123200,
  123632,
  124144,
  124401,
  125264,
  130032
];
function digitValue(cp) {
  let lo = 0;
  let hi = ND_ZEROS.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (ND_ZEROS[mid] <= cp) {
      found = ND_ZEROS[mid];
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (found < 0) return void 0;
  const v = cp - found;
  return v >= 0 && v <= 9 ? v : void 0;
}
function asciiDigits(s) {
  return s.replace(/\p{Nd}/gu, (c) => {
    const v = digitValue(c.codePointAt(0));
    return v === void 0 ? c : String(v);
  });
}
var DIGIT = /\p{Nd}/u;
function headingText(line) {
  if (!line.startsWith("##")) return null;
  const rest = line.slice(2);
  if (rest.length === 0 || !/^\s/.test(rest)) return null;
  const text = rest.trim();
  return text === "" ? null : text;
}
var ID_COMMENT_RE = /^\s*<!--\s*id:\s*([0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26})\s*-->\s*$/;
var ULID_RE = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
function isULID(s) {
  return ULID_RE.test(s);
}
function blockID(lines) {
  for (const line of lines) {
    const m = ID_COMMENT_RE.exec(line);
    if (m) return m[1].toUpperCase();
  }
  return null;
}
var ID_PROBLEM_RE = /^第\p{Nd}+問-\p{Nd}+[A-Za-z]?/u;
var ID_NATIVE_RE = /^.+?-\p{Nd}+[A-Za-z]?(?=[　：:【（([]|\s|$)/u;
var SEPARATORS = /* @__PURE__ */ new Set(["\u3000", "\uFF1A", ":"]);
function cardID(heading) {
  const normalized = normalizeDashes(heading);
  const m = ID_PROBLEM_RE.exec(normalized) ?? ID_NATIVE_RE.exec(normalized);
  if (m) {
    return heading.slice(0, m[0].length).trim();
  }
  let end = 0;
  for (const c of heading) {
    if (SEPARATORS.has(c)) break;
    end += c.length;
  }
  return heading.slice(0, end).trim();
}
function cardTitle(heading, cid) {
  const strip = (c) => SEPARATORS.has(c) || c === " ";
  let rest = heading.slice(cid.length);
  while (rest.length > 0 && strip(rest[0])) rest = rest.slice(1);
  while (rest.length > 0 && strip(rest[rest.length - 1])) rest = rest.slice(0, -1);
  const title = rest.trim();
  return title === "" ? cid : title;
}
var NUMERIC_ID = /^[0-9]{2,}[A-Za-z]?$/;
function isCardID(cid) {
  const c = normalizeDashes(cid);
  const chars = [...c];
  const hyphen = chars.indexOf("-");
  if (hyphen < 0) return false;
  if (DIGIT.test(c)) return true;
  if (/\s/.test(c) || c.includes("--")) return false;
  return hyphen >= 1 && hyphen <= 3 && hyphen < chars.length - 1;
}
function isNumericCardID(cid, basename) {
  if (!NUMERIC_ID.test(cid)) return false;
  return basename === `${cid}.md` || basename.startsWith(`${cid}_`);
}
function isCardHeading(cid, basename) {
  if (isCardID(cid)) return true;
  if (basename === void 0) return false;
  return isNumericCardID(cid, basename);
}
function basenameOf(relativePath) {
  const parts = relativePath.split("/");
  return parts[parts.length - 1] ?? "";
}
function parseID(cid) {
  const c = normalizeDashes(cid);
  const pad = (s) => String(parseInt(asciiDigits(s), 10) || 0).padStart(2, "0");
  const problem = /^第(\p{Nd}+)問-(\p{Nd}+)([A-Za-z]?)$/u.exec(c);
  if (problem) {
    const n = String(parseInt(asciiDigits(problem[1]), 10) || 0);
    const serial = pad(problem[2]) + problem[3];
    return { display: `${n.padStart(2, "0")}-${serial}`, group: `\u7B2C${n}\u554F`, serial };
  }
  const native = /^(.+?)-(\p{Nd}+)([A-Za-z]?)$/u.exec(c);
  if (native) {
    const serial = pad(native[2]) + native[3];
    return { display: `${native[1]}-${serial}`, group: native[1], serial };
  }
  return { display: c, group: c, serial: "" };
}
function isCardFilename(basename) {
  if (!basename.endsWith(".md")) return false;
  if (basename === "INDEX.md") return false;
  if (basename.startsWith("_")) return false;
  if (basename.endsWith("_\u6587\u5B57\u8D77\u3053\u3057.md")) return false;
  return true;
}
function splitLines(text) {
  return text.split(/\r\n|\r|\n/);
}
function allCardBlocks(text, basename) {
  const blocks = [];
  let current = [];
  for (const line of splitLines(text)) {
    const heading = headingText(line);
    if (heading !== null && isCardHeading(cardID(heading), basename)) {
      if (current.length > 0) blocks.push(current);
      current = [line];
      continue;
    }
    if (current.length > 0) current.push(line);
  }
  if (current.length > 0) blocks.push(current);
  return blocks;
}
var JA_FRONT_LABELS = ["**\u8868\u9762\uFF1A**", "**\u8868\u9762:**"];
var JA_BACK_LABELS = ["**\u88CF\u9762\uFF1A**", "**\u88CF\u9762:**"];
var JA_NOTE_LABELS = ["**\u88DC\u8DB3\uFF1A**", "**\u88DC\u8DB3:**"];
var EN_FRONT_LABELS = ["**Front\uFF1A**", "**Front:**"];
var EN_BACK_LABELS = ["**Back\uFF1A**", "**Back:**"];
var EN_NOTE_LABELS = ["**Note\uFF1A**", "**Note:**"];
function labelRest(line, japanese, english) {
  for (const label of japanese) {
    if (line.startsWith(label)) return line.slice(label.length).trim();
  }
  for (const label of english) {
    if (line === label) return "";
  }
  return null;
}
function trimBlankEdges(lines) {
  const out = [...lines];
  while (out.length > 0 && out[0].trim() === "") out.shift();
  while (out.length > 0 && out[out.length - 1].trim() === "") out.pop();
  return out;
}
function faces(block) {
  const f = { front: [], back: [], note: [], hint: [], rubric: [] };
  let region = null;
  for (const line of block) {
    const s = line.trim();
    const front = labelRest(s, JA_FRONT_LABELS, EN_FRONT_LABELS);
    if (front !== null) {
      region = "front";
      if (front !== "") f.front.push(front);
      continue;
    }
    const back = labelRest(s, JA_BACK_LABELS, EN_BACK_LABELS);
    if (back !== null) {
      region = "back";
      if (back !== "") f.back.push(back);
      continue;
    }
    const note = labelRest(s, JA_NOTE_LABELS, EN_NOTE_LABELS);
    if (note !== null) {
      region = "note";
      if (note !== "") f.note.push(note);
      continue;
    }
    if (s.startsWith("\u{1F4A1}")) {
      region = "hint";
      f.hint.push(s);
      continue;
    }
    if (s.startsWith("\u{1F3AF}")) {
      region = "rubric";
      f.rubric.push(s);
      continue;
    }
    if (s === "---" || s === "***" || s === "___") {
      region = null;
      continue;
    }
    if (region !== null) f[region].push(line);
  }
  f.front = trimBlankEdges(f.front);
  f.back = trimBlankEdges(f.back);
  f.note = trimBlankEdges(f.note);
  f.hint = trimBlankEdges(f.hint);
  f.rubric = trimBlankEdges(f.rubric);
  return f;
}
var FRONTMATTER = "---";
var MARKER_BACK = "<!-- back -->";
var MARKER_HINT = "<!-- hint -->";
var MARKER_NOTE = "<!-- note -->";
var ID_SLUG_RE = /^[A-Za-z0-9][A-Za-z0-9-]{2,63}$/;
function isValidCardID(s) {
  return ID_SLUG_RE.test(s);
}
function cardFormat(text) {
  const first = text.split("\n")[0] ?? "";
  return first.trim() === FRONTMATTER ? "v2" : "v1";
}
function splitFrontmatter(lines) {
  if ((lines[0] ?? "").trim() !== FRONTMATTER) return null;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === FRONTMATTER) {
      return { head: lines.slice(1, i), body: lines.slice(i + 1) };
    }
  }
  return null;
}
function scalar(raw) {
  let v = raw;
  for (const q of ['"', "'"]) {
    if (v.length >= 2 && v.startsWith(q) && v.endsWith(q)) v = v.slice(1, -1);
  }
  return v.trim();
}
function inlineList(raw) {
  if (!raw.startsWith("[") || !raw.endsWith("]")) return [];
  return raw.slice(1, -1).split(",").map((x) => scalar(x.trim())).filter((x) => x.length > 0);
}
function parseFrontmatter(lines) {
  const fm = { id: null, deck: null, tags: [], ask: true };
  for (const line of lines) {
    const s = line.trim();
    if (s.length === 0 || s.startsWith("#")) continue;
    const colon = s.indexOf(":");
    if (colon < 0) continue;
    const key = s.slice(0, colon).trim();
    const raw = s.slice(colon + 1).trim();
    if (key === "id") fm.id = scalar(raw);
    else if (key === "deck") fm.deck = scalar(raw);
    else if (key === "tags") fm.tags = inlineList(raw);
    else if (key === "ask") fm.ask = scalar(raw).toLowerCase() !== "false";
  }
  return fm;
}
function titleV2(body) {
  for (const line of body) {
    const s = line.trim();
    if (!s.startsWith("# ")) continue;
    const title = s.slice(1).trim();
    return title.length === 0 ? null : title;
  }
  return null;
}
function facesV2(body) {
  const f = { front: [], back: [], note: [], hint: [], rubric: [] };
  let region = "front";
  let sawTitle = false;
  for (const line of body) {
    const s = line.trim();
    if (s === MARKER_BACK) {
      region = "back";
      continue;
    }
    if (s === MARKER_HINT) {
      region = "hint";
      continue;
    }
    if (s === MARKER_NOTE) {
      region = "note";
      continue;
    }
    if (!sawTitle && region === "front" && s.startsWith("# ")) {
      sawTitle = true;
      continue;
    }
    f[region].push(line);
  }
  f.front = trimBlankEdges(f.front);
  f.back = trimBlankEdges(f.back);
  f.hint = trimBlankEdges(f.hint);
  f.note = trimBlankEdges(f.note);
  return f;
}
function deckFromFrontmatter(raw) {
  const parts = raw.split("/").map((x) => x.trim()).filter((x) => x.length > 0);
  const subject = parts[0];
  if (subject === void 0) return null;
  const rest = parts.slice(1).join("/");
  return { subject, deck: rest.length === 0 ? subject : rest };
}
function cardsFromV2(text, deck, relativePath) {
  const lines = text.split("\n");
  const split = splitFrontmatter(lines);
  if (split === null) return [];
  const fm = parseFrontmatter(split.head);
  if (fm.id === null || !isValidCardID(fm.id)) return [];
  const base = basenameOf(relativePath);
  const resolvedDeck = (fm.deck === null ? null : deckFromFrontmatter(fm.deck)) ?? deck;
  const stem = base.endsWith(".md") ? base.slice(0, -3) : base;
  const title = titleV2(split.body) ?? stem;
  const parsed = parseID(fm.id);
  return [{
    format: "v2",
    ulid: isULID(fm.id) ? fm.id : null,
    deck: resolvedDeck,
    cid: fm.id,
    heading: title,
    title,
    displayID: parsed.display,
    group: parsed.group,
    relativePath,
    faces: facesV2(split.body),
    block: lines,
    tags: fm.tags,
    ask: fm.ask
  }];
}
function isV1CardPath(relativePath) {
  return relativePath.split("/").length === 3;
}
function cardsFrom(text, deck, relativePath) {
  if (cardFormat(text) === "v2") return cardsFromV2(text, deck, relativePath);
  if (!isV1CardPath(relativePath)) return [];
  const out = [];
  const base = basenameOf(relativePath);
  for (const block of allCardBlocks(text, base)) {
    const head = block[0];
    const heading = head === void 0 ? null : headingText(head);
    if (heading === null) continue;
    const cid = cardID(heading);
    if (!isCardHeading(cid, base)) continue;
    const parsed = parseID(cid);
    out.push({
      format: "v1",
      ulid: blockID(block),
      deck,
      cid,
      heading,
      title: cardTitle(heading, cid),
      displayID: parsed.display,
      group: parsed.group,
      relativePath,
      faces: faces(block),
      block
    });
  }
  return out;
}

// src/i18n.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function detectLocale() {
  try {
    const override = localStorage.getItem("anchor-locale");
    if (override === "ja" || override === "en") return override;
  } catch {
  }
  return typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("ja") ? "ja" : "en";
}
var locale = detectLocale();

// src/core/refExpander.ts
var REF_RE = /^📌\s*\*\*([^*\n]{1,24})\*\*\s*[:：]\s*\[([^\]]+)\]\(([^)#]+\.md)(?:#[^)]*)?\)/;
function parseRef(line) {
  const m = REF_RE.exec(line.trim());
  if (!m) return null;
  const kind = m[1].trim();
  if (kind === "") return null;
  return { kind, label: m[2], relativeLink: m[3] };
}
function resolveRefPath(sourceRelativePath, link) {
  const stack = sourceRelativePath.split("/").slice(0, -1);
  for (const component of link.split("/")) {
    if (component === "" || component === ".") continue;
    if (component === "..") {
      if (stack.length === 0) return null;
      stack.pop();
      continue;
    }
    stack.push(component);
  }
  return stack.length === 0 ? null : stack.join("/");
}
var WIKI_REF_RE = /\[\[([A-Za-z0-9][A-Za-z0-9-]{2,63})\]\]/g;
function wikiRefIDs(line) {
  return [...line.matchAll(new RegExp(WIKI_REF_RE.source, "g"))].map((m) => m[1]);
}

// src/core/types.ts
function deckKey(d) {
  return `${d.subject}::${d.deck}`;
}
function cardKey(c) {
  return `${deckKey(c.deck)}::${c.cid}`;
}
function cardLogID(c) {
  if (c.format === "v2") return c.cid;
  return c.ulid ?? cardKey(c);
}

// src/core/lint.ts
var MAX_BACK_LINES = 12;
var MAX_REFS = 2;
var NOUN_PHRASE_CHARS = 20;
var SENTENCE_ENDINGS = ["\u3002", "\uFF1F", "?", "\uFF01", "!", "\uFF1A", ":"];
var SOURCE_HINTS = ["\u51FA\u5178", "http://", "https://", "Source", "source", "\u53C2\u7167\u6761\u6587"];
function nonBlank(lines) {
  return lines.filter((l) => l.trim().length > 0);
}
function lineOf(lines, needle) {
  const want = needle.trim();
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === want) return i + 1;
  }
  return 0;
}
function deckFromPath(relativePath) {
  const dirs = relativePath.split("/").slice(0, -1);
  const subject = dirs[0] ?? "";
  const rest = dirs.slice(1).join("/");
  return { subject, deck: rest.length === 0 ? subject : rest };
}
function lintVault(texts2, options = {}) {
  const findings2 = [];
  const add = (level, rule, file, line, message) => {
    findings2.push({ level, rule, file, line, message });
  };
  const cards = [];
  const knownIDs = /* @__PURE__ */ new Set();
  for (const [rel, text] of texts2) {
    for (const c of cardsFrom(text, deckFromPath(rel), rel)) {
      cards.push(c);
      knownIDs.add(cardLogID(c));
      if (c.ulid !== null) knownIDs.add(c.ulid);
    }
  }
  const firstSeenAt = /* @__PURE__ */ new Map();
  for (const c of cards) {
    const id = cardLogID(c);
    const first = firstSeenAt.get(id);
    if (first === void 0) {
      firstSeenAt.set(id, c.relativePath);
    } else if (first !== c.relativePath) {
      add(
        "error",
        "duplicate-id",
        c.relativePath,
        0,
        `\u5B66\u7FD2\u30ED\u30B0\u306E\u9375 \`${id}\` \u304C ${first} \u3068\u91CD\u8907\u3057\u3066\u3044\u307E\u3059\u3002\u7D22\u5F15\u306F\u5148\u52DD\u3061\u306A\u306E\u3067\u3001\u3044\u307E\u3053\u306E2\u679A\u306F\u540C\u3058\u5B66\u7FD2\u5C65\u6B74\u3092\u5171\u6709\u3057\u3066\u3044\u307E\u3059\u3002`
      );
    }
  }
  for (const [rel, text] of texts2) {
    const lines = text.split("\n");
    const own = cards.filter((c) => c.relativePath === rel);
    if (own.length === 0) {
      checkUnreadable(add, rel, text, lines);
      continue;
    }
    for (const card of own) {
      checkCard(add, card, rel, lines, texts2, knownIDs, options);
      if (card.format === "v2") checkV2(add, card, rel, lines);
    }
  }
  if (options.longBackBaseline) {
    const stillLong = new Set(
      findings2.filter((f) => f.rule === "long-back").map((f) => f.file)
    );
    const fileOf = new Map(cards.map((c) => [cardLogID(c), c.relativePath]));
    for (const id of options.longBackBaseline) {
      const file = fileOf.get(id);
      if (file === void 0) continue;
      if (stillLong.has(file)) continue;
      add(
        "info",
        "long-back-baseline-stale",
        file,
        0,
        `\u6291\u6B62\u30EA\u30B9\u30C8\u306E \`${id}\` \u306F\u3082\u304612\u884C\u3092\u8D85\u3048\u3066\u3044\u307E\u305B\u3093\u3002tools/lint/baseline-long-back.txt \u304B\u3089\u6D88\u3057\u3066\u304F\u3060\u3055\u3044\uFF08\u30EA\u30B9\u30C8\u306F\u6E1B\u308B\u65B9\u5411\u306B\u3060\u3051\u52D5\u304B\u3059\uFF09\u3002`
      );
    }
  }
  const order = { error: 0, warn: 1, info: 2 };
  return findings2.sort(
    (a, b) => order[a.level] - order[b.level] || a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule)
  );
}
function checkUnreadable(add, file, text, lines) {
  if (cardFormat(text) !== "v2") {
    add(
      "info",
      "no-card",
      file,
      0,
      "\u30AB\u30FC\u30C9\u304C1\u679A\u3082\u53D6\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002v1 \u306F `## <ID><\u533A\u5207\u308A><\u30BF\u30A4\u30C8\u30EB>` \u306E\u898B\u51FA\u3057\u304C\u8981\u308A\u307E\u3059\u3002"
    );
    return;
  }
  const split = splitFrontmatter(lines);
  if (split === null) {
    add(
      "error",
      "unterminated-frontmatter",
      file,
      1,
      "frontmatter \u304C `---` \u3067\u9589\u3058\u3066\u3044\u307E\u305B\u3093\u3002\u3069\u3053\u307E\u3067\u304C\u69CB\u6587\u304B\u6C7A\u307E\u3089\u306A\u3044\u306E\u3067\u3001\u30AB\u30FC\u30C9\u3068\u3057\u3066\u8AAD\u3081\u307E\u305B\u3093\u3002"
    );
    return;
  }
  const fm = parseFrontmatter(split.head);
  if (fm.id === null) {
    add(
      "error",
      "missing-id",
      file,
      1,
      "`id` \u304C\u3042\u308A\u307E\u305B\u3093\u3002\u5B66\u7FD2\u5C65\u6B74\u3068\u7D50\u3076\u9375\u306A\u306E\u3067\u3001\u3053\u308C\u304C\u7121\u3044\u30AB\u30FC\u30C9\u306F\u51FA\u984C\u3067\u304D\u307E\u305B\u3093\u3002"
    );
  } else if (!isValidCardID(fm.id)) {
    add(
      "error",
      "invalid-id",
      file,
      lineOf(lines, `id: ${fm.id}`),
      `\`id: ${fm.id}\` \u306F\u5F62\u304C\u9055\u3044\u307E\u3059\uFF08\`[A-Za-z0-9][A-Za-z0-9-]{2,63}\`\uFF09\u3002`
    );
  }
}
function checkCard(add, card, file, fileLines, texts2, knownIDs, options) {
  const back = nonBlank(card.faces.back);
  if (back.length === 0) {
    add(
      "error",
      "empty-back",
      file,
      0,
      card.format === "v2" ? "\u88CF\u9762\u304C\u7A7A\u3067\u3059\u3002`<!-- back -->` \u3092\u7F6E\u3044\u3066\u3001\u305D\u306E\u4E0B\u306B\u7B54\u3048\u3092\u66F8\u304D\u307E\u3059\u3002" : "\u88CF\u9762\u304C\u7A7A\u3067\u3059\u3002`**\u88CF\u9762\uFF1A**` \u3092\u7F6E\u3044\u3066\u3001\u305D\u306E\u4E0B\u306B\u7B54\u3048\u3092\u66F8\u304D\u307E\u3059\u3002"
    );
  }
  if (back.length > MAX_BACK_LINES) {
    const baseline2 = options.longBackBaseline;
    const known = baseline2 === void 0 || baseline2.has(cardLogID(card));
    add(
      known ? "warn" : "error",
      "long-back",
      file,
      0,
      `\u88CF\u9762\u304C ${back.length} \u884C\u3042\u308A\u307E\u3059\uFF08${MAX_BACK_LINES} \u884C\u307E\u3067\uFF09\u3002\u30D5\u30E9\u30C3\u30B7\u30E5\u30AB\u30FC\u30C9\u3067\u306F\u306A\u304F\u5C0F\u8AD6\u6587\u306B\u306A\u3063\u3066\u3044\u307E\u3059\u3002\u30AB\u30FC\u30C9\u30922\u679A\u306B\u5272\u308A\u307E\u3059\u3002` + (known ? "" : "\uFF08\u65B0\u3057\u304F\u5F53\u305F\u3063\u305F\u30AB\u30FC\u30C9\u3067\u3059\u3002\u6291\u6B62\u30EA\u30B9\u30C8\u306B\u8DB3\u3055\u305A\u306B\u76F4\u3057\u3066\u304F\u3060\u3055\u3044\uFF09")
    );
  }
  let refs = 0;
  for (const line of card.faces.back) {
    const pin = parseRef(line);
    if (pin !== null) {
      refs += 1;
      const path = resolveRefPath(card.relativePath, pin.relativeLink);
      if (path === null || !texts2.has(path)) {
        add(
          "error",
          "broken-ref",
          file,
          lineOf(fileLines, line),
          `\u{1F4CC} \u306E\u53C2\u7167\u5148\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093: ${pin.relativeLink}`
        );
      }
    }
    if (card.format !== "v2") continue;
    for (const id of wikiRefIDs(line)) {
      refs += 1;
      if (!knownIDs.has(id)) {
        add(
          "error",
          "broken-ref",
          file,
          lineOf(fileLines, line),
          `[[${id}]] \u306E\u53C2\u7167\u5148\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002`
        );
      }
    }
  }
  if (refs > MAX_REFS) {
    add(
      "warn",
      "many-refs",
      file,
      0,
      `\u53C2\u7167\u304C ${refs} \u672C\u3042\u308A\u307E\u3059\uFF08${MAX_REFS} \u672C\u307E\u3067\uFF09\u3002\u5168\u90E8\u5C55\u958B\u3055\u308C\u308B\u306E\u3067\u3001\u88CF\u9762\u304C\u7B54\u3048\u6570\u679A\u3076\u3093\u306B\u81A8\u3089\u307F\u307E\u3059\u3002`
    );
  }
  const front = nonBlank(card.faces.front);
  if (front.length === 1) {
    const s = front[0].trim();
    if (s.length <= NOUN_PHRASE_CHARS && !SENTENCE_ENDINGS.some((e) => s.includes(e))) {
      add(
        "warn",
        "front-not-a-question",
        file,
        lineOf(fileLines, front[0]),
        `\u8868\u9762\u304C\u300C${s}\u300D\u3060\u3051\u3067\u3059\u3002\u3053\u308C\u306F\u4E3B\u984C\u3067\u3042\u3063\u3066\u554F\u3044\u306B\u306A\u3063\u3066\u3044\u307E\u305B\u3093\u3002\u8868\u9762\u3060\u3051\u3067\u7B54\u3048\u3089\u308C\u308B\u5F62\u306B\u3057\u307E\u3059\u3002`
      );
    }
  }
  const note = nonBlank(card.faces.note);
  if (note.length > 0 && !note.some((l) => SOURCE_HINTS.some((h) => l.includes(h)))) {
    add(
      "info",
      "note-without-source",
      file,
      0,
      "\u88DC\u8DB3\u306B\u51FA\u5178\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u8FBF\u308C\u306A\u3044\u4E8B\u5B9F\u306F\u5F8C\u304B\u3089\u691C\u8A3C\u3067\u304D\u307E\u305B\u3093\u3002"
    );
  }
}
function checkV2(add, card, file, lines) {
  const split = splitFrontmatter(lines);
  if (split === null) return;
  const fm = parseFrontmatter(split.head);
  if (fm.deck === null) {
    add(
      "error",
      "missing-deck",
      file,
      1,
      "`deck` \u304C\u3042\u308A\u307E\u305B\u3093\u3002\u3044\u307E\u306F\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA\u304B\u3089\u88DC\u3063\u3066\u3044\u307E\u3059\u304C\u3001\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA\u3092\u52D5\u304B\u3059\u3068\u30C7\u30C3\u30AD\u304C\u5909\u308F\u308A\u307E\u3059\u3002"
    );
  }
  if (titleV2(split.body) === null) {
    add(
      "warn",
      "missing-title",
      file,
      0,
      `\`# \u30BF\u30A4\u30C8\u30EB\` \u304C\u3042\u308A\u307E\u305B\u3093\u3002\u3044\u307E\u306F\u30D5\u30A1\u30A4\u30EB\u540D\uFF08${card.title}\uFF09\u3067\u4EE3\u7528\u3057\u3066\u3044\u307E\u3059\u3002`
    );
  }
}
function summarize(findings2) {
  const s = { error: 0, warn: 0, info: 0 };
  for (const f of findings2) s[f.level] += 1;
  return s;
}
var MARK = { error: "\u2716", warn: "\u25B2", info: "\xB7" };
function formatFinding(f) {
  const where = f.line > 0 ? `${f.file}:${f.line}` : f.file;
  return `${MARK[f.level]} ${where} [${f.rule}] ${f.message}`;
}

// src/core/syncPolicy.ts
function isSafeComponent(c) {
  return c !== "" && c !== "." && c !== ".." && !c.startsWith(".");
}
function isContentDirectory(name) {
  return isSafeComponent(name) && !name.startsWith("_");
}

// tools/lint.ts
function cardFiles(root2) {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        if (isContentDirectory(name)) walk(full);
      } else if (dir !== root2 && isCardFilename(name)) {
        out.push(full);
      }
    }
  };
  walk(root2);
  return out;
}
var root = process.argv[2];
if (root === void 0) {
  console.error("\u4F7F\u3044\u65B9: bash apps/anchor/tools/lint/run.sh <vault \u306E\u30D1\u30B9>");
  process.exit(2);
}
var texts = /* @__PURE__ */ new Map();
for (const full of cardFiles(root)) {
  const rel = relative(root, full).split(sep).join("/");
  texts.set(rel, readFileSync(full, "utf8"));
}
var BASELINE_PATH = process.env.ANCHOR_LINT_BASELINE ?? resolve(process.cwd(), "../tools/lint/baseline-long-back.txt");
function readBaseline() {
  if (!existsSync(BASELINE_PATH)) return void 0;
  return new Set(
    readFileSync(BASELINE_PATH, "utf8").split("\n").map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith("#"))
  );
}
var baseline = readBaseline();
var findings = lintVault(texts, { longBackBaseline: baseline });
var counts = summarize(findings);
if (process.argv.includes("--update-baseline")) {
  const long = new Set(
    lintVault(texts, { longBackBaseline: void 0 }).filter((f) => f.rule === "long-back").map((f) => f.file)
  );
  const idsOfLongFiles = /* @__PURE__ */ new Set();
  for (const [rel, text] of texts) {
    if (!long.has(rel)) continue;
    for (const c of cardsFrom(text, deckFromPath(rel), rel)) idsOfLongFiles.add(cardLogID(c));
  }
  const next = baseline === void 0 ? [...idsOfLongFiles] : [...baseline].filter((id) => idsOfLongFiles.has(id));
  const removed = baseline === void 0 ? 0 : baseline.size - next.length;
  writeFileSync(
    BASELINE_PATH,
    "# long-back\uFF08\u88CF\u9762\u304C12\u884C\u8D85\uFF09\u306E\u6291\u6B62\u30EA\u30B9\u30C8\u3002SPEC \xA72.8\u3002\n# \u{1F534} \u3053\u306E\u30EA\u30B9\u30C8\u306F**\u6E1B\u308B\u65B9\u5411\u306B\u3057\u304B\u52D5\u304B\u3055\u306A\u3044**\u3002\n#   \u3053\u3053\u306B\u7121\u3044\u30AB\u30FC\u30C9\u3067 long-back \u304C\u5F53\u305F\u308B\u3068 error \u306B\u306A\u308B\uFF08\uFF1D\u65B0\u3057\u3044\u6BB5\u843D\u5316\u3092\u6B62\u3081\u308B\u6539\u672D\uFF09\u3002\n#   \u30AB\u30FC\u30C9\u3092\u5272\u3063\u305F\u3089 `--update-baseline` \u3067\u884C\u3092\u6D88\u3059\u3002\u8DB3\u3057\u305F\u3044\u3068\u304D\u306F\u3001\u5272\u308B\u306E\u304C\u6B63\u3057\u3044\u3002\n# \u5024\u306F\u5B66\u7FD2\u30ED\u30B0\u306E\u9375\uFF08v1 \u306F ULID / v2 \u306F frontmatter \u306E id\uFF09\u3002\n" + [...next].sort().join("\n") + "\n",
    "utf8"
  );
  console.log(`\u6291\u6B62\u30EA\u30B9\u30C8\u3092\u66F4\u65B0: ${next.length} \u4EF6\uFF08${removed} \u4EF6\u524A\u9664\uFF09`);
  process.exit(0);
}
if (process.env.ANCHOR_LINT_QUIET !== "1") {
  for (const f of findings) console.log(formatFinding(f));
  if (findings.length > 0) console.log("");
}
var byRule = /* @__PURE__ */ new Map();
for (const f of findings) byRule.set(f.rule, (byRule.get(f.rule) ?? 0) + 1);
var breakdown = [...byRule.entries()].sort((a, b) => b[1] - a[1]).map(([rule, n]) => `${rule} ${n}`).join(" / ");
console.log(
  `${texts.size} \u30D5\u30A1\u30A4\u30EB / ${findings.length} \u4EF6 \u2014 error ${counts.error} / warn ${counts.warn} / info ${counts.info}`
);
if (breakdown.length > 0) console.log(`  ${breakdown}`);
process.exit(counts.error > 0 ? 1 : 0);
/*! Bundled license information:

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.development.js:
  (**
   * @license React
   * react-jsx-runtime.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
