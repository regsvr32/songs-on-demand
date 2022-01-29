import { stringify } from "query-string"
import merge from "deepmerge"

async function httpRequest(url, options) {
  const resp = await fetch(url, options)
  if (resp.redirected) {
    window.location.href = resp.url
    return true
  }
  if (!resp.ok) { throw resp }
  switch ((resp.headers.get("Content-Type") || "").split(";")[0].toLocaleLowerCase()) {
    case "":
      return true;
    case "application/json":
      return await resp.json();
    case "text/plain":
      return await resp.text();
    case "application/x-www-form-urlencoded":
    case "multipart/form-data":
      return Object.fromEntries(await resp.formData());
    default:
      return await resp.blob();
  }
}

export function httpGet(path, params = null, options = {}) {
  if (params) {
    path += "?" + stringify(params)
  }
  return httpRequest(path, options)
}

export function httpPost(path, body, options = {}) {
  const init = { method: "POST" }
  if (typeof body != "string") {
    init.headers = { "content-type": "application/json" },
    body = JSON.stringify(body)
  }
  init.body = body
  return httpRequest(path, merge(init, options))
}