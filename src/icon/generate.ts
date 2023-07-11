import path from "path";
import fs from "fs";
import axios from "axios";
import COS from 'cos-nodejs-sdk-v5';
import inquirer from "inquirer";
import generatorIcon from "./generator";


interface IconData {
    "id": string,
    "name": string,
    "font_class": string,
    "font_family": string,
    "url": string
    "icons_count": number,
    "icons": IconItemData[]
}

interface IconItemData {
    id: string;
    name: string;
    svg: string;
    class_name: string;
    unicode: string;
    unicode_decimal: number;
    section: string;
}

export interface DartIconType {
    key: string;
    unicode: string;
    desc?: string;
}

export default async function generateIcon() {
    const cwd = process.cwd();

    const iconDirectory = path.join(cwd, 'fonts', 'iconfont.json');
    const iconBytesRead = fs.readFileSync(iconDirectory, 'utf-8');
    const iconData = JSON.parse(iconBytesRead) as IconData;

    const ohIconDirectory = path.join(cwd, 'component/oh_design/lib/widgets/oh_icon', 'oh_icon.dart');
    const ohIconBytesRead = fs.readFileSync(ohIconDirectory, 'utf-8');
    // const ICON_DATA_REGEX = /\bstatic const IconData (\w+)\s*=\s*IconData\((0x\w+),/gs;
    const ICON_DATA_REGEX = /\/\/\/\s*([^{}]+?)\s*\n\s*static const IconData (\w+)\s*=\s*IconData\((0x\w+),/gs;
    let matches = Array.from(ohIconBytesRead.matchAll(ICON_DATA_REGEX));
    let output: DartIconType[] = matches.map(([_, desc, key, data]) => ({
        key: key.trim(),
        desc: desc.trim(),
        unicode: data.trim()
    }));

    // 已有icon
    const oldIconList: DartIconType[] = [];
    const newAddIconList: IconItemData[] = [];
    iconData.icons.forEach((item) => {
        const icon = output.find(it => `0x${item.unicode}` == it.unicode)
        if (icon) {
            oldIconList.push(icon);
        } else {
            newAddIconList.push(item);
        }
    });
    const delIconList: { unicode: string; key: string }[] = output.filter(item => {
        return !oldIconList.some(it => `${it.unicode}` == (item.unicode))
    });

    // console.log('delIcon', delIcon);
    console.log('新增icon：', newAddIconList.map(item => ({
        key: item.name,
        className: item.class_name,
        unicode: item.unicode
    })));

    const newAddDartIcon: DartIconType[] = []
    for await (const item of newAddIconList) {
        const newAddIcon: DartIconType = {
            desc: undefined,
            key: '',
            unicode: `0x${item.unicode}`
        };
        const message = `请输入新增icon(${item.name})的注释和变量名,请用;分隔`;
        const {inputDesc} = await inquirer.prompt([
            {
                name: "inputDesc",
                type: "input",
                default: `${item.name};${item.class_name}`,
                message: message,
            },
        ]);
        const [dartDesc, dartKey] = inputDesc.split(';');
        newAddIcon.desc = dartDesc;
        newAddIcon.key = dartKey;
        newAddDartIcon.push(newAddIcon)
    }
    const iconString = generatorIcon([...oldIconList, ...newAddDartIcon]);
    fs.writeFileSync(ohIconDirectory, iconString);
    // const ohIcon1Directory = path.join(cwd, 'component/oh_design/lib/widgets/oh_icon', 'oh_icon1.dart');

    // fs.writeFileSync(ohIcon1Directory, iconString);
    console.log(`✅ 已经成功创建文件 ${ohIconDirectory}`);
    console.log('删除icon：', delIconList);
    fs.unlinkSync(iconDirectory);
}