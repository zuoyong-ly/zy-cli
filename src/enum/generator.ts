import { getTranslate } from "../api";
import { loading } from "../util";

export default async function generatorEnum(enumStr: string, { isOptionFull }: { isOptionFull: boolean }): Promise<string | undefined> {

  // 拆分key和value
  const [key, valueStr] = enumStr.split("=[");
  const values = valueStr.substring(0, valueStr.length - 1);

  const map: {
    [key: number]: {
      value: string,
      label: string
    }
  } = {};
  let enumValue = ``;
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


  const data: any = await
    loading('🚀 翻译中', getTranslate, query)
  if (data.errorCode !== '0') {
    console.log(`❌ 翻译失败，错误码：${data.errorCode}`)
    return;
  }

  // 翻译枚举
  data.translation.forEach((item: any) => {
    const keyList = item.split("\n");
    keyList.forEach((item: string, index: number) => {
      const enumEnKey = item.split(' ').map((it: string) => it.toUpperCase()).join('_').replace(/-/g, '_').replace(/\W/g, '');
      const enumKey = isOptionFull ? enumEnKey : enumEnKey.length > 12 ? `ENUM${index}` : enumEnKey
      enumValue += `
  /// ch: ${map[index].label}
  /// 
  /// en: ${item}
  /// 
  /// value: ${map[index].value}
  ${enumKey}(${map[index].value}, '${map[index].label}')${keyList.length - 1 == index ? ';' : ','}
      `;
    });
  });
  // 生成枚举
  const enumString = `import 'package:get/get.dart';

enum ${key} {
  ${enumValue}

  final int value;
  final String label;

  const ${key}(this.value, this.label);

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
}
  `;
  return enumString;
}