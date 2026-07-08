---
title: Astro で個人ブログを作った
date: 2026-07-06
---

Astro のテンプレートを使ってブログを立ち上げてみた。
[cirryさん](https://github.com/cirry) の [Astro Theme Yi](https://github.com/cirry/astro-yi) が気に入ったので使わせていただいた。ありがとうございます。

なお、`git clone` した状態では、ページ遷移するとテーマ切り替えボタンが効かなくなっていた。
Claude に原因究明させた結果、`public/toggle-theme.js` において `window.onload` が初回ロード時しか発火せず、ページ遷移すると `init()` が実行されないのでテーマ切り替えボタンがクリックリスナーとして登録されなくなっていたことが分かった。これは `window.onload` を、初回ロード時だけでなくページ遷移時にも発火する `astro:page-load` に置き換えることで解決できる。

修正後の `toggle-theme.js` は以下の通り。

```js title="toggle-theme.js"
const primaryColorScheme = ""; // "light" | "dark"

function getPreferTheme() {
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme) return currentTheme;
  if (primaryColorScheme) return primaryColorScheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

let themeValue = getPreferTheme();

function setPreference() {
  localStorage.setItem("theme", themeValue);
  reflectPreference();
}

function reflectPreference() {
  document.firstElementChild.setAttribute("data-theme", themeValue);
  document.querySelector("#theme-btn")?.setAttribute("aria-label", themeValue);
  document.querySelector("#theme-btn-mobile")?.setAttribute("aria-label", themeValue);
}

// 即時反映(初回・フラッシュ防止)
reflectPreference();

function attachListeners() {
  document.querySelector("#theme-btn")?.addEventListener("click", () => {
    themeValue = themeValue === "light" ? "dark" : "light";
    setPreference();
  });
  document.querySelector("#theme-btn-mobile")?.addEventListener("click", () => {
    themeValue = themeValue === "light" ? "dark" : "light";
    setPreference();
  });
}

// 遷移直後、描画確定前に属性を復元(ちらつき・light固定を防止)
document.addEventListener("astro:after-swap", reflectPreference);

// 初回ロード時 & 遷移後のページロード完了時、両方でボタンにリスナーを再登録
document.addEventListener("astro:page-load", () => {
  reflectPreference();
  attachListeners();
});

// システムのカラースキーム変更に追従
window.matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches: isDark }) => {
    themeValue = isDark ? "dark" : "light";
    setPreference();
  });
```
