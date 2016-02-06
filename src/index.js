/*jshint esnext: true*/

const electron = require('electron');

const BrowserWindow = electron.remote.BrowserWindow;

const win = BrowserWindow.getAllWindows()[0];

// ダイアログ
const dialog = electron.remote.dialog;

// 棒読みちゃんで読み上げ
const sendBouyomi = require('./sendBouyomi');

// ファイルシステム
const fs = require('fs');

// パス
const path = require('path');

// 文字コード変換
const iconvLite = require('iconv-lite');

// HTMLエスケープ
const escapeHtml = require('./escapeHtml');

const errorDialog = require('./errorDialog');

var settings = JSON.parse(fs.readFileSync('./Assets/settings.json'));

var RegExps = [];

var chatLogs = '';

const logChatRegExp = /^\[Client thread\/INFO\]: \[CHAT\] ([\s\S]*)[\n\r]$/;

Mousetrap.bind('ctrl+r', function() {
  win.reload();
});
Mousetrap.bind('ctrl+shift+i', function() {
  win.toggleDevTools();
});

$(function() {
  // Minecraft ゲームフォルダの設定を確認
  if(!settings.minecraftFolder) {
    settings.minecraftFolder = process.env.appdata + '\\.minecraft';
    fs.writeFileSync('./Assets/settings.json', JSON.stringify(settings, null, '  '));
    win.reload();
  }
  $('#minecraftFolder').val(settings.minecraftFolder);

  // 正規表現ファイルのリスト
  fs.readdir('./Assets/RegExps', function(err, files){
    if (err) throw err;
    files.filter(function(file){
        return fs.statSync('./Assets/RegExps/' + file).isFile() && /.*\.json$/.test(file); //絞り込み
    }).forEach(function (file) {
        $('#RegExpList').append('<tr><th>' + path.basename(file, '.json') +
          '</th><td><input type="checkbox"' + (settings.RegExpFiles.indexOf(file) >= 0 ? ' checked="checked"' : '') + '></td></tr>');
    });

    // 正規表現リストを読み込み
    $.each(settings.RegExpFiles, function(index, RegExpFile) {
      $('#RegExpList > tr').each(function() {
        if(RegExpFile == $(this).children('th').text()) {
          $(this).children('td').children('input').prop('checked', true);
        }
      });
      RegExps = RegExps.concat(JSON.parse(fs.readFileSync('./Assets/RegExps/' + RegExpFile + '.json')));
    });

    // 正規表現リストを更新・設定を保存
    function updateRegExps() {
      RegExps = [];
      settings.RegExpFiles = [];
      $('#RegExpList > tr').each(function() {
        if($(this).children('td').children('input').prop('checked')) {
          RegExps = RegExps.concat(JSON.parse(fs.readFileSync('./Assets/RegExps/' + $(this).children('th').text() + '.json')));
          settings.RegExpFiles.push($(this).children('th').text());
        }
      });
      fs.writeFileSync('./Assets/settings.json', JSON.stringify(settings, null, '  ') + '\n');
    }
    $('#RegExpList').on('change', 'tr > td > input', updateRegExps);
    updateRegExps();
  });

  // 設定の「参照」
  $('#minecraftFolderSelect').click(function() {
    dialog.showOpenDialog(win, {
      defaultPath: settings.minecraftFolder,
      properties: ['openDirectory']
    }, function(path) {
      if(path) {
        settings.minecraftFolder = path[0];
        $('#minecraftFolder').val(path[0]);
      }
    });
  });

  // 設定の「保存してアプリをリロード」
  $('#saveAndReload').click(function() {
    fs.writeFileSync('./Assets/settings.json', JSON.stringify(settings, null, '  ') + '\n');
    win.reload();
  });

  // ログファイルを開く
  fs.open(path.join(settings.minecraftFolder, 'logs/latest.log'), 'r', function(e, fd) {
    if(e) {
      errorDialog(win, 'ログを読み込めませんでした', 'ログを読み込めませんでした。アプリのリロードをお試しください。');
    } else {
      fs.watchFile(path.join(settings.minecraftFolder, 'logs/latest.log'), { persistent: true, interval: 100 }, function (curr, prev) {
          const position = prev.size;
          const size = curr.size - position;

          if(size > 0) {
            // ログが更新された
            var buf = new Buffer(size);
            fs.read(fd, buf, 0, size, position, function(e) {
              // 新しいログを読み込み
              if(e) {
                errorDialog(win, 'ログを読み込めませんでした', 'ログを読み込めませんでした。アプリのリロードをお試しください。');
              } else {
                // 配列に変換
                var newLogs = iconvLite.decode(buf, 'Shift_JIS').split(/\[\d{2}:\d{2}:\d{2}\] /);
                newLogs.shift();
                var newChats = '';
                $.each(newLogs, function() {
                  // チャットログのみを抽出
                  const newChatMatch = this.match(logChatRegExp);
                  if(newChatMatch) {
                    newChats += newChatMatch[1] + '\n';
                  }
                });
                if(newChats) {
                  // 新しいチャットログがあった場合

                  // 装飾コードを削除
                  newChats = newChats.replace(/§./g, '');

                  chatLogs += newChats;
                  $('#log').html(escapeHtml(chatLogs).replace(/\n/g, '<br />\n'));

                  var sendText = newChats;
                  $.each(RegExps, function() {
                    sendText = newChats.replace(new RegExp(this.search, (this.caseInsensitive ? '' : 'i')), this.replace);
                    if(sendText !== newChats) {
                      return false;
                    }
                  });
                  if($('#isReadEnable').prop('checked')) {
                    sendBouyomi(sendText, '50001', function(e) {
                      if(e) {
                        errorDialog(win, '棒読みちゃんに接続できませんでした', '棒読みちゃんに接続できませんでした。棒読みちゃんが起動しているかお確かめください。');
                      }
                    });
                  }
                }
              }
            });
          }
      });
    }
  });

  $('[data-toggle="tooltip"]').tooltip();
  $('.top-nav-btn').tooltip();
});
