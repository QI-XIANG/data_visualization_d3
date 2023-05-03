const friends = {
    john:['Apple','Orange','Lemon'],
    mary:['Apple','Orange'],
    ryan:['Apple','Cherry','Peach','Orange']
}

const thisSVG = d3.select("svg");
d3.selectAll("button").on("click",click);

function click(){
    //dataset -> data-name or data-*
    //console.log(this.dataset.name);
    //console.log("click");
    const thisFruitList = friends[this.dataset.name];
    update(thisFruitList);
}

function update(data){ //data(data,d=>d) -> 尋訪每一筆資料
    thisSVG.selectAll("text").data(data,d=>d).join(
        enter => { //初始資料進入
            enter.append("text").text(d=>d) //(d,i) => i 是 index 類似 object enumeration
            .attr('x',-100).attr('y',(d,i)=>50+i*30).style('fill','green')
            .transition().attr('x',30); //從初始位置移動
        },
        update =>{ //新資料進入(須更新)
            update.transition().style('fill','red').attr('y',(d,i)=>50+i*30);
        },
        exit =>{ //不需要的資料離開
            exit.transition().attr('x',50).style('fill','yellow').remove(); //要有remove才能移除element
        }
    )
}