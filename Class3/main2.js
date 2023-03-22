//載入CSV檔案
d3.csv("../data/harry_potter.csv").then((res) =>
  console.log("Local CSV:", res)
);
//載入JSON檔案
d3.json("../data/harry_potter.json").then((res) =>
  console.log("Local JSON:", res)
);

//載入CSV檔案
const potter = d3.csv("../data/harry_potter.csv");
const lord = d3.csv("../data/lord_of_the_rings.csv");
Promise.all([potter, lord]).then((res) => {
  //等到2個CSV檔都完成載入，才會執行console.log方法 (非同步)
  console.log("Potter:", res[0]);
  console.log("Lord of the Rings:", res[1]);
});

//合併多個CSV檔案資料
Promise.all([potter, lord]).then((res) => {
  //等到2個CSV檔都完成載入，才會執行console.log方法 (非同步)
  //JavaScript ES6 Spread Syntax
  //...res[]將內部元素展開 (...代表資料來源) 
  console.log("Concat:", [...res[0], ...res[1]]);
});

//參考資料
//https://medium.com/%E4%B8%80%E5%80%8B%E5%B0%8F%E5%B0%8F%E5%B7%A5%E7%A8%8B%E5%B8%AB%E7%9A%84%E9%9A%A8%E6%89%8B%E7%AD%86%E8%A8%98/javascript-es6-spread-syntax-%E5%B1%95%E9%96%8B%E8%AA%9E%E6%B3%95-e95f8ea66aa1

//遠端載入檔案
d3.json(
  "https://api.chucknorris.io/jokes/search?query=dog"
).then((res) => {
  console.log("Remote:", res.result);
  console.log("Remote[0]:",res.result[0].value);
});
