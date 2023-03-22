//座標的初始值原本就為0，故有些時候可以省略不寫

//在body新增svg畫布(500*500)
const svg = d3.select('body').append("svg").attr("width",500).attr("height",300)

//產生男生群組
const height_male = svg.append("g").attr("transform","translate(100,100)")

//畫線
height_male.append("line").attr("x1",0).attr("x2",173.5).style("stroke","black")
//畫圓
height_male.append("circle").attr("cx",0).attr("cy",0).attr("r",3)
//標記文字
height_male.append("text").attr("x",0).attr("y",20).text("台灣男生平均身高 173.5 cm")

//產生女生群組
const height_female = svg.append("g").attr("transform","translate(100,180)")

//畫線
height_female.append("line").attr("x1",0).attr("x2",161.5).style("stroke","black")
//畫圓
height_female.append("circle").attr("cx",0).attr("cy",0).attr("r",3)
//標記文字
height_female.append("text").attr("x",0).attr("y",20).text("台灣女生平均身高 161.5 cm")

