"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const util_1 = require("util");
const migration_file_1 = require("./migration-file");
const readDir = util_1.promisify(fs.readdir);

const isValidFile = (fileName) => /\.(sql|js)$/gi.test(fileName);

const isDirectory = pathName => fs.statSync(pathName).isDirectory();
const getDirectories = pathName =>
  fs.readdirSync(pathName).map(name => path.join(pathName, name)).filter(isDirectory);

const isFile = pathName => fs.statSync(pathName).isFile();  
const getFiles = pathName =>
  fs.readdirSync(pathName).map(name => path.join(pathName, name)).filter(isFile);

const getFilesRecursively = (pathName) => {
  let dirs = getDirectories(pathName);
  let files = dirs
    .map(dir => getFilesRecursively(dir)) // go through each directory
    .reduce((a,b) => a.concat(b), []);    // map returns a 2d array (array of file arrays) so flatten
  return files.concat(getFiles(pathName));
};

exports.load = async (directory, log) => {
  log(`Loading migrations from: ${directory}`);
  const fileNames = await readDir(directory);

  log(`Found migration files: ${fileNames}`);
  if (fileNames != null) {
    const pathNames = [
      path.join(__dirname, "migrations/0_create-migrations-table.sql"),
      ...fileNames.map(fileName => path.resolve(directory, fileName)),
    ];

    let migrationFiles = [];
    pathNames.forEach(pathName => {
      if (fs.lstatSync(pathName).isDirectory()){
        return migrationFiles = migrationFiles.concat(getFilesRecursively(pathName));
      }
      else {
        if (!isValidFile(pathName)) throw new Error("Invalid file name");
        return migrationFiles.push(pathName);
      }
    });

    const unorderedMigrations = await Promise.all(migrationFiles.map(migration_file_1.load));
    // Arrange in ID order
    return unorderedMigrations.sort((a, b) => a.id - b.id);
  }
  return [];
};
