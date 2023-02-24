// const ora = require("ora");
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';

/**
 * 睡觉函数
 * @param {Number} n 睡眠时间
 */
function sleep(n: number) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, n);
  });
}

/**
 * loading加载效果
 * @param {String} message 加载信息
 * @param {Function} fn 加载函数
 * @param {Array<any>} args fn 函数执行的参数
 * @returns 异步调用返回值
 */
export async function loading(message: string, fn: Function, ...args: Array<any>): Promise<any> {
  const spinner = ora(message);
  spinner.start(); // 开启加载
  try {
    let executeRes = await fn(...args);
    spinner.succeed();
    return executeRes;
  } catch (error) {
    spinner.fail("request fail, reTrying");
    await sleep(1000);
    return loading(message, fn, ...args);
  }
}

export function traverseFile(root: string) {
  let res: string[] = [];
  const files = fs.readdirSync(root);
  files.forEach((filename) => {
    //获取当前文件的绝对路径
    const file = path.join(root, filename);
    const start = fs.statSync(file);
    if (start.isDirectory()) {
      res = [...res, ...traverseFile(file)];
    }
    else {
      res.push(file)
    }
  });
  return res
}

export function truncate(q: string) {
  var len = q.length;
  if (len <= 20) return q;
  return q.substring(0, 10) + len + q.substring(len - 10, len);
}
