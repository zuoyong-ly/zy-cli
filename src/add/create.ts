import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer'
import Creator from './creator'
import { loading } from '../util'

const OVERWRITE_TYPE = ["Overwrite", "Cancel"];

async function create(projectName: string, options: { force: boolean; type: any }) {
  // 获取当前工作目录
  const cwd = process.cwd();
  // 拼接得到项目目录
  const targetDirectory = path.join(cwd, projectName);
  // 判断目录是否存在
  if (fs.existsSync(targetDirectory)) {
    // 判断是否使用 --force 参数
    if (options.force) {
      // 删除重名目录(remove是个异步方法)
      await fs.remove(targetDirectory);
    } else {
      const { overwrite } = await inquirer.prompt([
        // 返回值为promise
        {
          // 用于获取后的属性名
          name: "overwrite",
          // 交互方式为列表单选
          type: "list",
          // 提示信息
          message: "目标目录已存在，请选择操作",
          // 选项列表
          choices: OVERWRITE_TYPE,
          // 默认值，这里是索引下标
          default: 0,
        },
      ]);
      const isOverwrite = overwrite === OVERWRITE_TYPE[0];
      // 选择 Cancel
      if (!isOverwrite) {
        return;
      } else {
        // 选择 Overwirte ，先删除掉原有重名目录
        // console.log("\r\nRemoving");
        await loading(
          `删除 ${projectName}, 请稍等`,
          fs.remove,
          targetDirectory
        );
      }
    }
  }
  // 创建项目
  const creator = new Creator(projectName, targetDirectory);

  creator.create();
};

export default create;