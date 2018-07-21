import { app, Menu, BrowserWindow, shell, session } from 'electron';

import * as path from 'path';
import * as url from 'url';

import { JsonFile } from './lib/stump';
import { createDarwinMenuTemplate, createWinMenuTemplate } from './lib/stump';

import { defaultConfig } from './default_config';

// Squirrel
function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command: any, args: any) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args: any) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      spawnUpdate(['--createShortcut', exeName]);
      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      spawnUpdate(['--removeShortcut', exeName]);
      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      app.quit();
      return true;
  }
}

let mainWindow: Electron.BrowserWindow | null = null;
const configJsonPath: string = path.join(app.getPath("userData"), 'config.json');

interface WindowConfig {
  width: number | undefined,
  height: number | undefined,
  x: number | undefined,
  y: number | undefined
}

function createWindow() {
  const configJson: JsonFile = new JsonFile(configJsonPath, defaultConfig);
  const windowConfig: WindowConfig = configJson.has('windowConfig') ? configJson.get('windowConfig') : defaultConfig.windowConfig;

  // 通信ヘッダにOriginを加える。
  session.defaultSession!.webRequest.onBeforeSendHeaders((details: any, callback: any) => {
    details.requestHeaders['Origin'] = 'electron://whiteflag';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  // メニュー。winとmacで振り分け。
  const menuTemplate = process.platform === 'darwin' ? createDarwinMenuTemplate(app.getName()) : createWinMenuTemplate();
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow = new BrowserWindow({
    width: windowConfig.width,
    height: windowConfig.height,
    x: windowConfig.x,
    y: windowConfig.y,
    backgroundColor: '#282C2D'
  });

  // 外部リンクはブラウザで開く
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // index.htmlを読み込む。
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // ウィンドウを閉じた時にウィンドウ設定を保存する。
  mainWindow.on('close', function () {
    if(mainWindow !== null) {
      configJson.set('windowConfig', mainWindow.getBounds());
      configJson.writeJsonFile();
    }
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}


if (!handleSquirrelEvent()) {
  app.on('ready', createWindow);

  app.on('window-all-closed', function () {
    // macOSではウィンドウを全部閉じても終了しないのが慣例。
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', function () {
    if (mainWindow === null) {
      createWindow();
    }
  });
}
