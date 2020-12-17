import * as $ from "jquery";

export const $banner = $("<div style=\"position: absolute;bottom:0;left:0;background-color: beige;z-index: 999;padding: 10px;border: 1px solid darkorange;\"></div>");

export function showResult(text) {
  $banner.html(text);
}