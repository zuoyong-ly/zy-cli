import { getVolcengineTranslate } from "../api";
import { loading } from "../util";


type ResultEnum = {
  enumValue: string;
  enumId: string;
}


export default async function generatorEnum(enumStr: string, { isOptionFull, enumDesc }: { isOptionFull: boolean, enumDesc: string }, enumValues: EnumMatch): Promise<string | undefined> {

  // 拆分key和value
  const [enumKey, valueStr] = enumStr.split("=[");
  const key = enumKey.trim();
  const values = valueStr.substring(0, valueStr.length - 1);

  const inputEnumList: {
    value: string,
    label: string
  }[] = [];
  let enumValue = ``;
  const query = values
    .split(",")
    .map((item: string, index: number) => {
      const [value, label] = item.split(":");
      inputEnumList[index] = {
        value: value.trim(),
        label,
      };
      return label;
    })
    .join("\n");


  const data: any = await
    loading('🚀 翻译中', getVolcengineTranslate, query)
  if (!data.TranslationList) {
    console.log(`❌ 翻译失败`)
    return;
  }
  // 枚举聚合
  let resultEnumList: ResultEnum[] = [];
  resultEnumList = enumValues.enumList.map((item, index) => {
    return {
      enumValue: `
        /// ch: ${inputEnumList[index].label}
        /// 
        /// en: ${item}
        ///
        ${item.str}
            `,
      enumId: item.id,
    }
  })
  let newEnumList: ResultEnum[] = inputEnumList
    .filter((item) => resultEnumList.every((it) => it.enumId !== item.value))
    .map((item, index) => {
      const enString = data.TranslationList[0].Translation.split("\n")[index];
      return {
        enumValue: `
  /// ch: ${item.label}
  /// 
  /// en: ${enString}
  /// 
  /// [value]: ${inputEnumList[index].value}
  ${enumKey}(${inputEnumList[index].value}, '${inputEnumList[index].label}')
        `,
        enumId: item.value,
      }

    })

  resultEnumList = [...resultEnumList, ...newEnumList];
  resultEnumList.sort((a, b) => {
    return a.enumId.localeCompare(b.enumId);
  });
  console.log(resultEnumList);


  // 翻译枚举
  data.TranslationList.forEach((item: any) => {
    const keyList = item.Translation.split("\n");
    keyList.forEach((item: string, index: number) => {
      const enumEnKey = item.split(' ').map((it: string) => it.toUpperCase()).join('_').replace(/-/g, '_').replace(/\W/g, '');
      const enumKey = isOptionFull ? enumEnKey : enumEnKey.length > 12 ? `ENUM${index}` : enumEnKey
      const curEnum = enumValues.enumList?.find(item => {
        return item.id === inputEnumList[index].value
      })
      if (curEnum && enumValues.enumName === key) {
        enumValue += `
  /// ch: ${inputEnumList[index].label}
  /// 
  /// en: ${item}
  ///
  ${curEnum.str}${keyList.length - 1 == index ? ';' : ','}
      `
      } else {
        enumValue += `
  /// ch: ${inputEnumList[index].label}
  /// 
  /// en: ${item}
  /// 
  /// [value]: ${inputEnumList[index].value}
  ${enumKey}(${inputEnumList[index].value}, '${inputEnumList[index].label}')${keyList.length - 1 == index ? ';' : ','}
            `
      };
    });
  });
  // 生成枚举
  const enumString = `import 'package:get/get.dart';
  
/// ${enumDesc}
enum ${key} {
  ${enumValue}

  ${enumValues.variables.length == 0 || enumValues.enumName !== key ? `final int value;
  final String label;`: `${enumValues.variables.map(item => `  ${item}`).join('\n')}`}
  
  ${enumValues.enumName !== key ? `const ${key}(this.value, this.label);` : `${enumValues.constructor}`}

  static String? valueToLabel(int? value) {
    return ${key}.values.firstWhereOrNull((item) {
      return item.value == value;
    })?.label;
  }

  static ${key}? valueToEnum(int? value) {
    return ${key}.values.firstWhereOrNull((item) {
      return item.value == value;
    });
  }

  static ${key}? labelToEnum(String label) {
    return ${key}.values.firstWhereOrNull((item) {
      return item.label == label;
    });
  }
}
  `;
  return enumString;
}