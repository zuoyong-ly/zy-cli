import {DartIconType} from "./generate";

export default function generatorIcon(iconData: DartIconType[]) {


  const dartIconData = iconData.map(item =>
    `
  /// ${item.desc}
  static const IconData ${item.key} =
      IconData(${item.unicode}, fontFamily: 'oh_icon_100px', matchTextDirection: true);
        `
  ).join('');
console.log(iconData)

  return `import 'package:flutter/material.dart';
/// 该文件由自动生成，请勿手动增加
/// 文档：https://ohmydragon.feishu.cn/wiki/VJTUwjwO6ibwqWklJnxcCe4qn3g
abstract class OhIcon {
${dartIconData}
}
    `
}