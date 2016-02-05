/*jshint esnext: true*/

const packager = require('electron-packager');
const config = require('./package.json');
const fse = require('fs-extra');

const obj = {
  dir: './',
  out: './electron-packager-dist',
  name: config.name,
  platform: 'win32',
  arch: 'all',
  icon: './app-icon/icon.ico',
  version: '0.36.7',

  'app-bundle-id': 'io.github.prince-0203',

  'app-version': config.version,
  'helper-bundle-id': 'io.github.prince-0203',
  overwrite: true,
  asar: true,
  prune: true,
  ignore: 'build\\.js$|README\\.md$|\\.gitignore|electron-packager-dist($|/)|app-icon($|/)|Assets($|/)',
  'version-string': {
    CompanyName: config.author,
    FileDescription: config.description,
    OriginalFilename: config.name,
    FileVersion: config.version,
    ProductVersion: config.version,
    ProductName: config.name,
    InternalName: config.name
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

    fse.copySync('./Assets', obj.out + '/' + config.name + '-win32-x64/Assets');
    fse.copySync('./Assets', obj.out + '/' + config.name + '-win32-ia32/Assets');

    console.log('Done.');
  }
});
