'use strict';

function validEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validPhone(phone) {
  var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  return re.test(phone);
}

function validPostalCode(postalCode) {
  var re = /^[a-z0-9][a-z0-9\- ]{0,10}[a-z0-9]$/;
  return re.test(postalCode);
}

function isNumber(number) {
  var re = /^\d+$/;
  return re.test(number);
}

module.exports = {validEmail, validPhone, isNumber, validPostalCode};
