declare module 'download-git-repo'

interface EnumMatch {
  enumName: string,
  constructor: string,
  enumList: {
    id: string;
    str: string;
  }[];
  // 变量
  variables: string[];
}