/*jshint esnext: true*/

const packager = require('electron-packager');
const config = require('./package.json');
const fse = require('fs-extra');

const obj = {
  dir: './',
  out: './electron-packager-dist',
  platform: 'win32',
  arch: 'ia32',
  icon: './app-icon/icon.ico',
  overwrite: true,

  'app-bundle-id': 'io.github.prince-0203',

  'app-version': config.version,
  'app-copyright': '(c) prince 2016',
  'helper-bundle-id': 'io.github.prince-0203',
  overwrite: true,
  asar: true,
  prune: true,
  ignore: 'electron-build\\.js$|README\\.md$|\\.gitignore$|electron-packager-dist($|/)|app-icon($|/)|Assets($|/)',

  'version-string': {
    CompanyName: 'prince',
    FileDescription: 'BouyomiCraft',
    OriginalFilename: 'bouyomi-craft.exe',
    ProductName: 'BouyomiCraft',
    InternalName: 'BouyomiCraft'
  }
};
packager(obj, function done(err, appPath) {
  if(err) {
    throw new Error(err);
  } else {
    console.log('Copying assets...');

    var settings = JSON.parse(fse.readFileSync('./Assets/settings.json'));
    settings.minecraftFolder = null;
    fse.writeFileSync('./Assets/settings.json', JSON.stringify(settings, null, '  ') + '\n');

    fse.copySync('./Assets', obj.out + '/' + config.name + '-win32-ia32/Assets');

    console.log('Done.');
  }
});
