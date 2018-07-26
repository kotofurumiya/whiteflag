export function createWinMenuTemplate(): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: '編集',
      submenu: [
        { label: '元に戻す', role: 'undo' },
        { label: 'やり直す', role: 'redo' },
        { type: 'separator' },
        { label: '切り取り', role: 'cut' },
        { label: 'コピー', role: 'copy' },
        { label: '貼り付け', role: 'paste' },
        { label: '貼り付けてスタイルを合わせる', role: 'pasteandmatchstyle' },
        { label: '削除', role: 'delete' },
        { label: '全てを選択', role: 'selectall' }
      ]
    },
    {
      label: '表示',
      submenu: [
        { label: 'リロード', role: 'reload' },
        { label: '強制的にリロード', role: 'forcereload' },
        { label: 'デベロッパーツール', role: 'toggledevtools' },
        { type: 'separator' },
        { label: '実際のサイズ', role: 'resetzoom' },
        { label: '拡大', role: 'zoomin' },
        { label: '縮小', role: 'zoomout' },
        { type: 'separator' },
        { label: 'フルスクリーン', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'ウィンドウ',
      role: 'window',
      submenu: [{ label: '最小化', role: 'minimize' }, { label: '閉じる', role: 'close' }]
    }
  ];
}

export function createDarwinMenuTemplate(
  appName: string
): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: appName,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { label: 'サービス', role: 'services', submenu: [] },
        { type: 'separator' },
        { label: '隠す', role: 'hide' },
        { label: '他を隠す', role: 'hideothers' },
        { label: '表示', role: 'unhide' },
        { type: 'separator' },
        { label: '終了', role: 'quit' }
      ]
    },

    {
      label: '編集',
      submenu: [
        { label: '元に戻す', role: 'undo' },
        { label: 'やり直す', role: 'redo' },
        { type: 'separator' },
        { label: '切り取り', role: 'cut' },
        { label: 'コピー', role: 'copy' },
        { label: '貼り付け', role: 'paste' },
        { label: '貼り付けてスタイルを合わせる', role: 'pasteandmatchstyle' },
        { label: '削除', role: 'delete' },
        { label: '全てを選択', role: 'selectall' },
        { type: 'separator' },
        {
          label: 'スピーチ',
          submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }]
        }
      ]
    },
    {
      label: '表示',
      submenu: [
        { label: 'リロード', role: 'reload' },
        { label: '強制的にリロード', role: 'forcereload' },
        { label: 'デベロッパーツール', role: 'toggledevtools' },
        { type: 'separator' },
        { label: '実際のサイズ', role: 'resetzoom' },
        { label: '拡大', role: 'zoomin' },
        { label: '縮小', role: 'zoomout' },
        { type: 'separator' },
        { label: 'フルスクリーン', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'ウィンドウ',
      role: 'window',
      submenu: [
        { label: '閉じる', role: 'close' },
        { label: 'しまう', role: 'minimize' },
        { label: '拡大/縮小', role: 'zoom' },
        { type: 'separator' },
        { label: '手前に移動', role: 'front' }
      ]
    }
  ];
}
