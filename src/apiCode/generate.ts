import inquirer from "inquirer";
import {exec} from "child_process";


export default async function generateApiCode(
  apis: string,
  options: {}
) {
  let apisStr = apis;
  if (!apisStr) {
    const {apiString} = await inquirer.prompt([
      {
        name: "apiString",
        type: "input",
        message: "请输入api列表",
      },
    ]);
    apisStr = apiString;
  }

  let apiList = [];
  try {
    apiList = JSON.parse(apisStr);
    if (Object.prototype.toString.call(apiList) !== '[object Array]') {
      console.log("😱 出错了2，请检查数据是否为数组");
      return;
    }
  } catch (e) {
    console.log("😱 出错了1，请检查数据是否为数组");
    console.log(e)
    return;
  }

  const apiCode = `
  await loadModule('https://cdn.bootcdn.net/ajax/libs/axios/1.5.0/axios.min.js');
let r = await axios.get(
    'http://127.0.0.1:4523/export/openapi?projectId=3654070&version=3.0'
);
async function main() {
    const table = await bitable.base.getActiveTable();
    const apis = [${apiList.map((i: string)=>{return `"${i}"`}).join(',')}];
    const addFields = apis.map((item) => {
        const apifoxInfo = r.data.paths[item].post;
        let model = {
            id: 'optbIJVsGx',
            name: 'APP',
        };
        if (!apifoxInfo['x-apifox-folder'].startsWith('移动端')) {
            model = {
                id: 'opt4NA1Vh5',
                name: 'MOSS',
            };
        }
        let isNewApi = {
            id: 'opt1trnvYA',
            name: '是',
        };
        if (apifoxInfo['summary'].includes('老接口')) {
            isNewApi = {
                id: 'opthaK0Woj',
                name: '否',
            };
        }
        return {
            fields: {
                fldlJpPYPA: item,
                fldWjvGvp9: apifoxInfo.summary,
                fldLjBt4ap: apifoxInfo['x-run-in-apifox'].replace('-run', ''),
                fldmxbkdYD: {
                    id: 'optwagMv6X',
                    name: '开发中',
                },
                fldYcrt78i: model,
                fldk9mLlZ8: isNewApi,
            },
        };
    });
    await table.addRecords(addFields);
    console.log('添加成功');
}
  `
  exec("pbcopy").stdin?.end(apiCode);
  console.log("✅ 已经复制到剪切板了");
}
