import { len } from "../utils";
import { PartialRoute, Query } from "./type";

/**
 * 解析 url query
 * @param url 
 * @returns 
 */
export function parseQuery(url: string) {
	const query: Record<string, string> = {};
	url.replace(/([^?&=]+)=([^&]+)/g, (_, k, v) => (query[k] = v));
	return query;
}

/**
 * 组装 url query
 * @param query 
 * @returns 
 */
export function stringifyQuery(query: Query) {
	return Object.keys(query)
		.map((key) => `${key}=${query[key]}`)
		.join("&");
}

/**
 * 解析 url
 * @param url 
 * @returns 
 */
export function parseUrl(url: string) {
	const newUrl = new URL('http://0.0.0.0' + url);
  return {
    fullPath: newUrl.href.replace(newUrl.origin, ''),
    path:     newUrl.pathname,
    query:    parseQuery(newUrl.search),
    hash:     newUrl.hash.slice(1),
  }
}

/**
 * 组装 url
 * @param option 
 * @returns 
 */
export function stringifyUrl(option: PartialRoute) {
  let url = '';
  const { path, query, hash } = option;
  path && (url += path);
  len(Object.keys(query)) > 0 && (url += `?${stringifyQuery(query)}`);
  hash && (url += `#${hash}`);
  return url;
}