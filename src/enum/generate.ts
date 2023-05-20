import { exec } from "child_process";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import generatorEnum from "./generator";
import { loading } from "../util";
import humps from 'humps';

const CREATE_LIST = ["是", "否"];
const FULL_LIST = ["是", "否"];
const OVERWRITE_LIST = ["覆盖", "增量", "取消"];

export default async function generateEnum(
  enumData: string,
  options: { translate: boolean; force: boolean, increment: boolean }
) {
  let enumStr = enumData;
  let isOptionFull = options.translate;
  if (!enumData) {
    const { enumString } = await inquirer.prompt([
      {
        name: "enumString",
        type: "input",
        message: "请输入运营系统中的枚举",
      },
    ]);
    enumStr = enumString;
  }

  const key = enumStr.split("=[")[0].trim();
  const { enumDesc } = await inquirer.prompt([
    {
      name: "enumDesc",
      type: "input",
      message: "请输入枚举描述",
      default: key
    },
  ]);
  try {
    const fileName = humps.decamelize(key).replace('_enum', '');

    if (!options.translate) {
      const { isFull } = await inquirer.prompt([
        {
          name: "isFull",
          type: "list",
          message: "枚举是否使用翻译后的数据作为枚举key",
          choices: FULL_LIST,
          default: 0,
        },
      ]);

      isOptionFull = isFull === FULL_LIST[0];
    }

    const { isNotCreate } = await inquirer.prompt([
      {
        name: "isNotCreate",
        type: "list",
        message: "是否创建dart文件?",
        choices: CREATE_LIST,
        default: 0,
      },
    ]);
    const isCreate = isNotCreate === CREATE_LIST[0];

    // 获取当前工作目录
    const cwd = process.cwd();
    const rootEnumPath = './lib/enum';
    let targetFile = '';
    let targetDirectory = cwd;

    let enumValues: enumMatch = {
      enumList: [],
      enumName: '',
      constructor: '',
      variables: []
    };


    if (isCreate) {
      const { targetPath } = await inquirer.prompt([
        {
          name: "targetPath",
          type: "input",
          message: `请输入路径（${rootEnumPath}下的文件）`,
        },
      ]);
      let target = targetPath;
      // 拼接得到项目目录
      targetDirectory = path.join(cwd, rootEnumPath, target);

      targetFile = path.join(targetDirectory, `${fileName}.dart`);

      if (fs.existsSync(targetFile)) {
        if (options.increment) {
          enumValues = await matchEnum(targetFile, fileName)
        } else if (!options.force) {
          const { overwrite } = await inquirer.prompt([
            {
              name: "overwrite",
              type: "list",
              message: "目标文件已存在，请选择操作",
              choices: OVERWRITE_LIST,
              default: 0,
            },
          ]);
          if (overwrite === OVERWRITE_LIST[0]) {
            await loading(`删除 ${fileName}.dart中, 请稍等`, fs.remove, targetFile);
          } else if (overwrite === OVERWRITE_LIST[1]) {
            enumValues = await matchEnum(targetFile, fileName);
          } else {
            return;
          }
        } else {
          await loading(`删除 ${fileName}.dart中, 请稍等`, fs.remove, targetFile);
        }
      }
    }

    const enumString = await generatorEnum(enumStr, { isOptionFull, enumDesc }, enumValues);
    if (!enumString) {
      return;
    }
    if (isCreate) {
      // 创建文件夹
      if (fs.existsSync(targetDirectory)) {
        fs.writeFileSync(targetFile, enumString);
      } else {
        await fs.mkdirSync(targetDirectory);
        fs.writeFileSync(targetFile, enumString);
      }
      console.log(`✅ 已经成功创建文件 ${targetFile}`);
    } else {
      exec("pbcopy").stdin?.end(enumString);
      console.log("✅ 已经复制到剪切板了");
    }
  } catch (error) {
    console.log(error);
    console.log("😱 出错了，请检查数据");
  }
}


async function matchEnum(targetFile: string, fileName: string): Promise<enumMatch> {
  const str = await loading(`读取 ${fileName}.dart中, 请稍等`, fs.readFile, targetFile, 'utf-8')
  const values = str.match(/\/\/\/ \[value\]: [\w\W]*?\)/g);
  const variables = str.match(/final\s.*?;/g);
  const enumName = str.match(/(?<=enum\s+)\w+(?=\s*\{)/g)[0];
  const constructor = str.match(/const\s[\w\W]*?;/g)[0]

  return {
    enumName,
    constructor: constructor,
    enumList: values?.map((item: string) => ({
      value: item.match(/\/\/\/\s\[value\]:\s*(\d+)/g)![0].split(":")[1].trim(),
      str: item,
    })),
    variables: variables
  }



}