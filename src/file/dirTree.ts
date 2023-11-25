import humps from "humps";
import inquirer from "inquirer";
import * as http from "http";
import * as https from "https";
import axios from "axios";

const fs = require('fs');
const path = require('path');
import xlsx from 'node-xlsx'

interface FileInfo {
  path: any,
  name: any,
  dartClass: string,
  type?: string,
  children?: string
}

let fileList: FileInfo[] = [];

function dirTree(filename: any) {

  const stats = fs.lstatSync(filename);
  const info: FileInfo = {
    path: filename,
    name: path.basename(filename),
    dartClass: humps.pascalize(path.basename(filename).replace('.dart', '')),
  };

  if (stats.isDirectory()) {
    info.type = 'directory';
    info.children = fs.readdirSync(filename).map((child: any) => {
      return dirTree(path.join(filename, child));
    });
  } else {
    info.type = 'file';
    fileList.push(info);
  }
  return info;
}

function getRoutes() {
  let routeLineRegex = /\/\/\/[ ]*(.*)(?:\r\n|\r|\n)[ ]*static const[ ]*(\w+)[ ]*=[ ]*(\w+.\w+)/gm;
  let matches;
  let result = [];
  const cwd = process.cwd();

  const RoutersDirectory = path.join(cwd, 'lib/routes', 'oh_routes.dart');
  const codeString1 = fs.readFileSync(RoutersDirectory, 'utf-8');
  while ((matches = routeLineRegex.exec(codeString1)) !== null) {
    // matches[1] 为捕获的注释，matches[2] 为捕获的键名
    result.push({
      desc: matches[1],
      key: matches[2],
      path: matches[3]
    });
  }
  console.log(result.length);
  fs.writeFile(
    'data.json',
    // @ts-ignore
    JSON.stringify(result.map(it => ({
      ...it,
      path: it.path.replace('_OhPaths', 'OhRoutes')
    })), null, '\t'),
    {},
    () => {
    }
  );
  return result;

}

async function getPages() {
  const cwd = process.cwd();

  let regex = /GetPage<([\s\S]*?)>\(([\s\S]*?)\),/gm;
  let getNameRegex = /name:\s*([\w\.]+)/g;


  const PagesDirectory = path.join(cwd, 'lib/routes', 'oh_pages.dart');
  const PagesBytesRead = fs.readFileSync(PagesDirectory, 'utf-8');
  const pagesFileData: string[] = PagesBytesRead.match(regex);
  const routesList = getRoutes();
  const data = fileList.filter((item: FileInfo) => {
    return item.path?.endsWith('page.dart') || item.path?.endsWith('view.dart');
  })
    .map((data: FileInfo) => {
      const getPage = pagesFileData.find((it: string) => {
        return it.includes(data.dartClass);
      })
      let getName: string = '';
      let desc = '';
      if (getPage) {
        getName = getPage?.match(getNameRegex)![0].split('name: ')[1];
        desc = routesList.find((it: any) => {
          return it.key === getName?.replace('OhRoutes.', '');
        })?.desc || '';
      }

      return {
        ...data,
        getPage,
        getName,
        desc,
      }
    })
  const excelData = data.map((item) => {
    return [item.desc, item.getName, item.path]
  })
  // console.log(data)
  var buffer = xlsx.build([
    {name: 'mySecondSheet', data: excelData, options: {}},
  ]);
  fs.writeFileSync('./the_content.xlsx', buffer, {'flag': 'w'});//生成excel the_content是excel的名字，大家可以随意命名

  // for await (const item of data) {
  //     setTimeout(async () => {
  //         console.log(item.path);
  //         await axios.post('https://www.feishu.cn/flow/api/trigger-webhook/17a6dc06e9035622325df529903840df', item).catch((err) => {
  //                 fs.writeFile(
  //                     'error.json',
  //                     // @ts-ignore
  //                     JSON.stringify(err, '', '\t'),
  //                     {},
  //                     () => {
  //                     }
  //                 );
  //             }
  //         );
  //     }, 1000)
  // }

  console.log('执行完成');
}

export default function writeFile(filename: string) {
  fileList = [];
  dirTree(filename);
  getPages();
  // fs.writeFile(
  //     'test.json',
  //     // @ts-ignore
  //     JSON.stringify(directoryTree, '', '\t'),
  //     {},
  //     () => {
  //     }
  // );

}
