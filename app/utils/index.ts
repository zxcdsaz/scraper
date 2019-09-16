// import * as R from 'ramda';
import fs from 'fs-extra';
import path from 'path';
import { message } from 'antd';

const request = require('request');

export const generateFileTree = (paths: Array<string>): string[] => {
  const result = [];
  let fileCount = 0;
  function walk(wpath, key) {
    let walkRes = {
      title: '',
      ext: '',
      isDir: false,
      key,
      children: [],
      wpath: null
    };
    if (isDir(wpath)) {
      walkRes.title = path.basename(wpath);
      walkRes.isDir = true;
      const wpaths = fs.readdirSync(wpath);
      wpaths.forEach((dpath, index) => {
        const ddpath = path.join(wpath, dpath);
        const child = walk(ddpath, `${key}-${index}`);
        if (child) {
          walkRes.children.push(child);
        }
      });
    } else if (/(.mp4|.rmvb|.avi|.wmv)$/.test(wpath)) {
      const name = path.basename(wpath).split('.');
      walkRes = {
        title: name[0],
        ext: name[1],
        key,
        isDir: false,
        children: null,
        wpath: `${path.dirname(wpath)}/`
      };
      fileCount += 1;
    } else {
      walkRes = null;
    }

    return walkRes;
  }
  paths.forEach((spath, index) => {
    result.push(walk(spath, `0-${index}`));
  });
  if (fileCount === 0) {
    message.error('no media file');
    throw new Error('no media file');
  }
  return result;
};
export function isDir(spath: string) {
  const stats = fs.statSync(spath);
  return stats.isDirectory();
}

export function flatTrees(trees: Object[]): Object {
  const result = {};
  function walk(arr) {
    arr.forEach(node => {
      result[node.key] = node;
      if (node.children) {
        walk(node.children);
      }
    });
  }
  walk(trees);
  return result;
}

export const sleep = time =>
  new Promise(resolve => {
    // 成功执行
    try {
      setTimeout(() => {
        resolve();
      }, time);
    } catch (err) {
      console.log(err);
    }
  });

export const downloadImg = (url, ipath) =>
  new Promise((resolve, reject) => {
    request(url)
      .pipe(fs.createWriteStream(ipath))
      .on('finish', () => {
        resolve(ipath);
      })
      .on('error', e => {
        reject(e);
      });
  });