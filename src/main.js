/*
 * BouyomiCraft v1.0.0
 *  Minecraftのチャットを棒読みちゃんで読み上げるソフト
 *  Author: prince(MinecraftID: prince_0203)
 *  制作開始: 2016/01/29
 */

/*jshint esnext: true*/

const electron = require('electron');

const app = electron.app;

const BrowserWindow = electron.BrowserWindow;

const path = require('path');

var mainWindow = null;

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin')
    app.quit();
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false
  });

  mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));

  mainWindow.webContents.on('dom-ready', function() {
    mainWindow.show();
  });

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
