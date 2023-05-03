// + 轉換成數字
//轉換資料類型
function type(d) {
    const year = parseDate(d["Start airing"]);
    return {
        Broadcast_time: parseWeek(d["Broadcast time"]),
        Description: parseNA(d["Description"]),
        Duration: parseNA(d["Duration"]),
        Episodes: +d["Episodes"],
        Favorites: +d["Favorites"],
        Genre: parseGenres(d["Genres"])[0],
        Genres: parseGenres(d["Genres"]),
        Licensors: parseNA(d["Licensors"]),
        Members: +d["Members"],
        Producers: parseNA(d["Producers"]),
        Rating: parseNA(d["Rating"]),
        Score: +d["Score"],
        Scored_by: +d["Scored by"],
        Sources: parseNA(d["Sources"]),
        Start_Year: year,
        Start_Season: parseNA(d["Starting season"]),
        Status: parseNA(d["Status"]),
        Studios: parseNA(d["Studios"]),
        Title: parseNA(d["Title"]),
        Type: parseNA(d["Type"]),
    }
}


//data filter
function filterData(data) {
    return data.filter(
        d => {
            return (
                d["Start_Year"] >= 2000 && d["Start_Year"] <= 2018 &&
                d["Genre"] && d["Title"] //不為空值 
            )
        }
    )
}

//上面的2個方法都與main.js中的方法相同

//choose specific data，僅選擇依特定權重排列的最前面15筆資料
function choose_data(metric, animationClean) {
    const thisData = animationClean.sort((a, b) => b[metric] - a[metric]).filter((d, i) => i < 15);
    return thisData;
}

//調整刻度顯示的單位表示方式
function formatTicks(d) {
    /*d3.format("s")(1500);  // "1.50000k"
      d3.format("~s")(1500); // "1.5k"*/
    return d3.format('~s')(d)
        .replace('M', 'M') //字串取代
        .replace('k', 'K')
        .replace('G', 'G')
        .replace('T', 'T')
}

//調整過長的字串
function cutText(string) {
    return string.length < 35 ? string : string.substring(0, 35) + "...";
}

//barchartData: 實際繪圖需要的資料
//設定資料呈現的畫布，決定圖表該如何呈現
function setupCanvas2(barChartData, animationClean) {

    let metric = "Favorites" //用來決定排序依據的初始權重屬性

    //定義事件處理方法
    function click() {
        metric = this.dataset.name; //取得網頁元素上的自訂屬性
        console.log(metric); //偵錯
        //選出依權重屬性排列的前15筆資料
        const thisData = choose_data(metric, animationClean);
        //console.log(this.innerHTML);
        //動態修改當前段落標題
        document.querySelector('.bar-chart2-title').innerHTML = `Bar Chart 2 : Animations by ${this.innerHTML}`;
        //動態更新網頁上顯示的圖表
        update(thisData,this.innerHTML);
    }

    //在controls的按鈕上註冊事件監聽器
    d3.selectAll('.controls button').on('click', click);

    //定義重新繪製(更新)圖表的方法
    function update(data,titleChange) {
        console.log(data);//偵錯

        xMax = d3.max(data, d => d[metric]);//計算x軸的最大值
        X_scale = d3.scaleLinear([0, xMax], [0, barchart_width])

        Y_scale = d3.scaleBand().domain(data.map(d => d["Title"]))
            .rangeRound([0, barchart_height]).paddingInner(0.25);

        const defaultDelay = 1000;//漸變的時間
        const transitionDelay = d3.transition().duration(defaultDelay);

        //Update axis
        xAxisDraw.transition(transitionDelay).call(xAxis.scale(X_scale));
        yAxisDraw.transition(transitionDelay).call(yAxis.scale(Y_scale));

        //座標軸文字的位置、大小設定
        yAxisDraw.selectAll('text').attr('dx', "-0.6em");
        yAxisDraw.selectAll('text').attr('font-size', "1.1em");

        //Update Header
        header.select('tspan').text(`Top 15 Animations by ${titleChange}`);

        //Update Bar 
        bars.selectAll('.bar2').data(data, d => d["Title"]).join(
            enter => { //初始資料進入
                enter.append('rect').attr('class', 'bar2').attr("x", 0)
                    .attr('y', d => Y_scale(d['Title'])).attr("height", Y_scale.bandwidth())
                    .style('fill', 'dodgerblue').transition(transitionDelay)
                    .delay((d, i) => i * 20).attr('width', d => X_scale(d[metric])).style('dodgerblue');
            },
            update => { //新資料進入
                update.transition(transitionDelay).delay((d, i) => i * 20)
                    .attr('y', d => Y_scale(d["Title"])).attr("width", d => X_scale(d[metric]));
            },
            exit => { //有資料離開
                exit.transition().duration(defaultDelay / 2).style('fill-opacity', 0).remove();
            }

        )

        //tooltip 資訊窗
        const tip = d3.select('.tooltip');

        //滑鼠進入Bar會顯示特定的動畫詳細資訊
        function mouseoverTip(e) {
            //get data
            const thisBarData = d3.select(this).data()[0];
            const detailData = [ //定義顯示的動畫詳細資訊要呈現的資料
                ['Broadcast Time', thisBarData['Broadcast_time']],
                ['Duration', thisBarData['Duration']],
                ['Episodes', thisBarData['Episodes']],
                ['Genre', thisBarData['Genre']],
                ['Producers', cutText(thisBarData['Producers'])],
                ['Licensors', cutText(thisBarData['Licensors'])],
                ['Favorites', thisBarData['Favorites']],
                ['Members', thisBarData['Members']],
                ['Rating', thisBarData['Rating']],
                ['Score', thisBarData['Score']],
                ['Scored By', thisBarData['Scored_by']],
                ['Sources', thisBarData['Sources']],
                ['Start Season', thisBarData['Start_Season']],
                ['Studios', cutText(thisBarData['Studios'])],
                ['Type', thisBarData['Type']],
            ]

            //動畫詳細資訊的一些格式設定
            tip.style('left', (e.clientX + 18) + 'px')
                .style('top', e.clientY + 'px')
                .transition().style('opacity', 0.98);

            tip.select('h3').html(`${thisBarData['Title']}, ${thisBarData['Start_Year']}`);

            d3.select('.tip-body').selectAll('p').data(detailData)
                .join('p').attr('class', 'tip-info').html(d => `${d[0]} : ${d[1]}`);
        }

        //滑鼠在Bar上移動的事件處理
        function mousemoveTip(e) {
            tip.style('left', (e.clientX + 18) + 'px')
                .style('top', e.clientY + 'px')
                .style('opacity', 0.98);
        }

        //滑鼠離開Bar的事件處理
        function mousemoutTip(e) {
            tip.transition().style('opacity', 0);
        }


        //interactive 新增事件監聽處理器(顯示動畫詳細資訊)
        d3.selectAll('.bar2').on('mouseover', mouseoverTip)
            .on('mousemove', mousemoveTip)
            .on('mouseout', mousemoutTip);

    }

    //畫布尺寸
    const svg_width = 1000; 
    const svg_height = 650;
    const barchart_margin = { top: 100, right: 80, bottom: 40, left: 200 };
    //圖表實際尺寸
    const barchart_width = svg_width - (barchart_margin.left + barchart_margin.right);
    const barchart_height = svg_height - (barchart_margin.top + barchart_margin.bottom);
    const this_svg = d3.select('.bar-chart-container2')
        .append('svg').attr('width', svg_width)
        .attr('height', svg_height).append('g')
        .attr('transform', `translate(${barchart_margin.left},${barchart_margin.top})`);
    
    let xMax = d3.max(barChartData, d => d[metric]);
    let X_scale = d3.scaleLinear([0, xMax], [0, barchart_width])

    let Y_scale = d3.scaleBand().domain(barChartData.map(d => d["Title"]))
        .rangeRound([0, barchart_height]).paddingInner(0.25);

    const bars = this_svg.append('g').attr('class', 'bars2');

    //Draw header
    let header = this_svg.append('g').attr('class', 'bar-header2')
        .attr('transform', `translate(0,${-barchart_margin.top / 2})`).append('text');
    header.append('tspan').text('Top 15 XXX Animations');
    header.append('tspan').text('Years: 2000-2018')
        .attr('x', 0).attr('y', 20).style('font-size', '0.8em').style('fill', '#555');

    let xAxis = d3.axisTop(X_scale).ticks(5).tickFormat(formatTicks).tickSizeInner(-barchart_height).tickSizeOuter(0);
    let xAxisDraw = this_svg.append('g').attr('class', 'x axis2')

    let yAxis = d3.axisLeft(Y_scale).tickSize(0);
    let yAxisDraw = this_svg.append('g').attr('class', 'y axis2')

    update(barChartData,"Favorites");//繪製初始權重的圖表

}

//載入資料(包含資料前處理)並繪製圖表
d3.csv("./dataset/dataanime.csv", type).then((res) => {
    const animationClean = filterData(res)
    let barChartData = choose_data("Favorites", animationClean);
    console.log(choose_data("favorites", animationClean));
    setupCanvas2(barChartData, animationClean);
});