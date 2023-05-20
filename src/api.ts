import axios from 'axios'
import { truncate } from './util';
import * as crypto from 'crypto-js';
import { Service } from '@volcengine/openapi';

// 拦截全局请求响应
axios.interceptors.response.use((res: { data: any; }) => {
  return res.data;
});

/**
 * 获取模板
 * @returns Promise
 */
export async function getZhuRongRepo() {
  return axios.get("https://api.github.com/orgs/zhurong-cli/repos");
}

/**
 * 获取仓库下的版本
 * @param {string} repo 模板名称
 * @returns Promise
 */
export async function getTagsByRepo(repo: string) {
  return axios.get(`https://api.github.com/repos/zhurong-cli/${repo}/tags`);
}

export async function getTranslate(query: string) {
  const appKey = "2e0ea9dd63eebc8a";
  const fanyiKey = "H2jA0zN9BjQCyIotCCu1YCnVIGPzm09j";
  const salt = new Date().getTime();
  const curtime = Math.round(new Date().getTime() / 1000);
  const str1 = appKey + truncate(query) + salt + curtime + fanyiKey;
  const sign = crypto.SHA256(str1).toString(crypto.enc.Hex);
  const from = "zh-CHS";
  const to = "en";
  return axios.get(`https://openapi.youdao.com/api`, {
    params: {
      q: query.split('\n'),
      appKey: appKey,
      salt: salt,
      from: from,
      to: to,
      sign: sign,
      signType: "v3",
      curtime: curtime,
    }
  });
}

export async function getVolcengineTranslate(query: string) {
  const service = new Service({ serviceName: 'translate' });

  // 设置aksk
  service.setAccessKeyId('AKLTOWJhZmVkZThkZjRiNDcxZmI0MGM1YTNmNTNkNzAzMTA');
  service.setSecretKey('WlRFeVlUSmxabUptWXpVeE5HUXlZemxoWVdVME16QXlNVEJqTVRZNFpqVQ==');
  // 请求预定义的OpenAPI
  const usersResponse = await service.createJSONAPI('TranslateText', {
    "Version": "2020-06-01",
  });
  return usersResponse({
    "TargetLanguage": "en",
    "TextList": [query],
  });
}