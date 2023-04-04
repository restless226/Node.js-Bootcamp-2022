// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({1:[function(require,module,exports) {
'use strict';

var _this = undefined;

require('@babel/polyfill');

var _mapbox = require('./mapbox');

var _login = require('./login');

var _updateSettings = require('./updateSettings');

var _stripe = require('./stripe');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* eslint-disable */


// DOM ELEMENTS
var mapBox = document.getElementById('map');
var loginForm = document.querySelector('.form--login');
var logOutBtn = document.querySelector('.nav__el--logout');
var userDataForm = document.querySelector('.form-user-data');
var userPasswordForm = document.querySelector('.form-user-password');
var bookBtn = document.getElementById('book-tour');

var filetag = document.querySelector('#photo');
var preview = document.querySelector('.form__user-photo');

var readURL = function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      preview.setAttribute('src', e.target.result);
    };

    reader.readAsDataURL(input.files[0]);
  }
};

if (filetag && preview) {
  filetag.addEventListener('change', function () {
    readURL(this);
  });
}

// DELEGATION
if (mapBox) {
  var locations = JSON.parse(mapBox.dataset.locations);
  (0, _mapbox.displayMap)(locations);
}

if (loginForm) loginForm.addEventListener('submit', function (e) {
  e.preventDefault();
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  (0, _login.login)(email, password);
});

if (logOutBtn) logOutBtn.addEventListener('click', _login.logout);

if (userDataForm) userDataForm.addEventListener('submit', function (e) {
  e.preventDefault();
  var form = new FormData();
  form.append('name', document.getElementById('name').value);
  form.append('email', document.getElementById('email').value);
  form.append('photo', document.getElementById('photo').files[0]);
  console.log({ form: form });

  (0, _updateSettings.updateSettings)(form, 'data');
});

if (userPasswordForm) userPasswordForm.addEventListener('submit', function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(e) {
    var passwordCurrent, password, passwordConfirm;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            e.preventDefault();
            document.querySelector('.btn--save-password').textContent = 'Updating...';

            passwordCurrent = document.getElementById('password-current').value;
            password = document.getElementById('password').value;
            passwordConfirm = document.getElementById('password-confirm').value;
            _context.next = 7;
            return (0, _updateSettings.updateSettings)({ passwordCurrent: passwordCurrent, password: password, passwordConfirm: passwordConfirm }, 'password');

          case 7:

            document.querySelector('.btn--save-password').textContent = 'Save password';
            document.getElementById('password-current').value = '';
            document.getElementById('password').value = '';
            document.getElementById('password-confirm').value = '';

          case 11:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, _this);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());

if (bookBtn) bookBtn.addEventListener('click', function (e) {
  e.target.textContent = 'Processing...';
  var tourId = e.target.dataset.tourId;

  (0, _stripe.bookTour)(tourId);
});
},{}]},{},[1], null)
//# sourceMappingURL=bundle.map