/*jshint esnext: true*/

// ダイアログ
const dialog = require('electron').remote.dialog;

module.exports = function errorDialog(win, message, detail) {
  dialog.showMessageBox(win, {
    type: 'error',
    buttons: ['OK'],
    title: 'Error - BouyomiCraft',
    message: message,
    detail: detail
  });
};
