#! /usr/bin/env node

const program = require("commander");
const chalk = require("chalk");
const figlet = require("figlet");
const { create, translate, generateEnum } = require("../lib");

// 创建项目模版
program
  // 定义命令和参数
  .command("create <app-name>")
  .description("创建一个新的项目")
  // -f or --force 为强制创建，如果创建的目录存在则直接覆盖
  .option("-f, --force", "目标目录已存在，是否覆盖目标目录")
  .option("-t, --type <type>", "创建类型 commands, lib")
  .action((projectName, options) => {
    create(projectName, options);
  });

program
  .command("translate <path>")
  .description("国际化翻译")
  .action((projectName, options) => {
    translate(projectName, options);
  });

// 枚举翻译
program
  .command("enum [enumData]")
  .description("枚举翻译")
  .option("-f, --force", "目标目录已存在，是否覆盖目标目录")
  .option("-t, --translate", "枚举是否使用翻译后的数据")
  .option("-i, --increment", "目标目录已存在，是否增量添加数据")
  .action((enumData, options) => {
    generateEnum(enumData, options);
  });

// 监听 --help 执行
program.on("--help", function () {
  console.log(
    "\r\n" +
      figlet.textSync("zy-cli", {
        font: "3D-ASCII",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 80,
        whitespaceBreak: true,
      })
  );
  // 前后两个空行调整格式，更舒适
  console.log();
  console.log(
    `Run ${chalk.cyan(
      "zc-cli <command> --help"
    )} for detailed usage of given command.`
  );
  console.log();
});

// 配置版本号
program
  // 配置版本号信息
  .version(`v${require("../package.json").version}`)
  .usage("<command> [option]");

program.name("zc-cli").usage(`<command> [option]`);

// 解析用户执行命令传入参数
program.parse(process.argv);
