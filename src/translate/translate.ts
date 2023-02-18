import babelTraverse from "@babel/traverse";
import * as babelParser from "@babel/parser";
import fs from 'fs-extra';
import path from "path";
import { traverseFile } from "../util";
import * as  babelTypes from "@babel/types";

function translate(projectName: string) {
  // 获取当前工作目录
  const cwd = process.cwd();
  // 拼接得到项目目录
  const targetDirectory = path.join(cwd, projectName);
  // console.log(targetDirectory)
  const filerPath = traverseFile(targetDirectory);
  const fileRegex = /\.(ts|js|tsx|jsx)$/;
  const ignoreRegex = [/(.d.ts)$/];
  const localeRegex = /locale\//;
  const pageFileList = filerPath.filter(item =>
    !ignoreRegex.every(it => it.test(item)) && fileRegex.test(item) && !localeRegex.test(item)
  );
  console.log(pageFileList)

  pageFileList.filter((it,i)=>i === 0).forEach(filePath => {
    const file: string = fs.readFileSync(filePath, 'utf-8')
    try {
      const ast = babelParser.parse(file, {
        sourceType: "module", plugins: [
          // 'estree',
          'jsx',
          'typescript',
        ]
      })
      babelTraverse(ast, {
        enter(path) {
          const node = path.node
          console.log(path)

        }
      });
    console.log(filePath)

    } catch (error: any) {
      if (error.loc) {
        console.log(`${filePath}:${error.loc.line},${error.loc.column}`)
      } else {
        console.log('---------')
        console.log(error)
        console.log('---------')
      }

    }

  })


}
export default translate;