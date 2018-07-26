const electronInstaller = require('electron-winstaller');

resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: './bin/Whiteflag-win32-x64',
  outputDirectory: './release/whiteflag-win/',
  authors: 'Koto Furumiya',
  exe: 'Whiteflag.exe',
  version: require('./package').version
});

resultPromise.then(
  () => console.log('It worked!'),
  (e) => console.log(`No dice: ${e.message}`)
);
