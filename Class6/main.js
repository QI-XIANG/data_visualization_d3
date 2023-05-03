const friends = { /*object*/
    john: ['Apple', 'Orange', 'Lemon'],
    marry: ['Apple', 'Orange'],
    ryan: ['Apple', 'Cherry', 'Peach', 'Orange']
};

//console.log(friends.john) /*friends['john] also can work*/

const thisSVG = d3.select('svg');
/*Handling Events -> selection.on - add or remove event listeners.*/
d3.selectAll('button').on('click', click) //在button上註冊click事件的監聽器

function click() {
    //在這裡 this 代表觸發事件的那個 button element
    //dataset -> get custom data attributes (data-*) dataset.name -> data-name
    const thisFruitList = friends[this.dataset.name];
    update(thisFruitList);
}

//hoisting
//selection.transition - schedule a transition for the selected elements. 漸層效果
//selection.join - enter, update or exit elements based on data.
function update(data) {
    thisSVG.selectAll('text')
        .data(data, d => d)
        .join(
            enter => { //當資料進入
                enter.append('text')
                .text(d => d)
                .attr('x', -100) //x座標初始位置 //(d,i) => (data,index of data) default join-by-index
                .attr('y', (d, i) => 50 + i * 30)
                .style('fill', 'green')
                .transition().attr('x', 30);
            },
            update => { //當資料需要更新(與之前相比需要添加資料)
                update
                .transition().style('fill','red')
                .attr('y', (d, i) => 50 + i * 30); //不加這行會無法動態調整清單的排列長度
            },
            exit => { //當資料需要更新(與之前相比需要減少資料)
                //位移並變色後離開 (清除element)
                exit.transition() 
                .attr('x',150)
                .style('fill','yellow')
                .remove();
            }

        )

}

//套用資料更新於Bar Chart 

