import inquirer from "inquirer";
import { getTranslate } from "../api";
import { loading } from "../util";
import { exec } from 'child_process'
// import iconv from 'iconv-lite';

async function generationEnum(enumData: string, options: { full: boolean }) {
  let enumStr = enumData
  let isOptionFull = options.full;
  if (!enumData) {
    const { enumString } = await inquirer.prompt([
      {
        name: "enumString",
        type: "input",
        message: "请输入运营系统中的枚举",
      },
    ]);
    enumStr = enumString
  }
  try {


    const [key, valueStr] = enumStr.split("=[");
    const values = valueStr.substring(0, valueStr.length - 1);
    const map: {
      [key: number]: {
        value: string,
        label: string
      }
    } = {};
    const query = values
      .split(",")
      .map((item: string, index: number) => {
        const [value, label] = item.split(":");
        map[index] = {
          value,
          label,
        };
        return label;
      })
      .join("\n");
    let enumValue = ``;
    const data: any = await
      loading('🚀 翻译中', getTranslate, query)
    if (data.errorCode !== '0') {
      console.log(`❌ 翻译失败，错误码：${data.errorCode}`)
      return;
    }
    if (options.full) {
      const { isFull } = await inquirer.prompt([
        {
          name: "isFull",
          type: "list",
          message: "枚举是否使用翻译后的数据作为枚举key",
          choices: ["否", "是"],
          default: 0,
        },
      ]);
    
      isOptionFull = isFull
    }

    data.translation.forEach((item: any) => {
      const keyList = item.split("\n");
      keyList.forEach((item: string, index: number) => {
        const enumEnKey = item.split(' ').map((it: string) => it.toUpperCase()).join('_');
        const enumKey = isOptionFull ? enumEnKey : enumEnKey.length > 12 ? `ENUM${index}` : enumEnKey
        enumValue += `
        /// ch: ${map[index].label}
        /// en: ${item}
       ${enumKey}(${map[index].value}, '${map[index].label}')${keyList.length - 1 == index ? ';' : ','}
        `;
      });
    });
    const resString = `enum ${key} {
      ${enumValue}

      final int value;
      final String label;

      const ${key}(this.value, this.label);
    }
    `;
    exec("pbcopy").stdin?.end(resString);
    console.log('✅ 已经复制到剪切板了')
  } catch (error) {
    console.log(error)
    console.log('😱 出错了，请检查数据')
  }
}
export default generationEnum;