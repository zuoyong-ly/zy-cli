declare module 'download-git-repo'

interface enumMatch {
  enumName: string,
  constructor: string,
  enumList: {
    value: string;
    str: string;
  }[];
  variables: string[];
}