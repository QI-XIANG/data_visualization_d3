
//字串處理，將-換成undefined，其餘則保持原string
const parseNA = string => (string === '-' ? "undefined" : string); //匿名函式

//放送星期處理
const parseWeek = string => ((string === '-' | string === "Not scheduled once per week") ? "undefined" : String(string).split(" ")[0]); //匿名函式

//日期處理
const parseDate = string => (string === '-' ? "undefined" : String(string).split("-")[0]); //匿名函式

//上面相當於下面
/*const parseDate = d3.timeParse("%Y-%m-%d");
parseDate(string);*/

//類型處理，原始的資料類型是以,連接而成的長字串，所以需要將其分割成Array
const parseGenres = string => String(string).split(",");

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
        //剛剛被切割的長字串類型Array的第1個類型(index 0)，
        //會被當作主要類型，並以Genre代稱
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


//data filter，定義資料過濾器
//在本次的作業，我們只使用介於2000~2018年的動畫資料
//總共會涵蓋近1300筆資料
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

//資料聚合
//https://github.com/d3/d3-array/blob/v3.2.2/README.md#rollup
//https://observablehq.com/@d3/d3-ascending
//https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/from
function prepareBarChartData(data) {
    //console.log(data);
    //rollup是iterable函式會逐筆讀入資料 rollups(values, reduce, ...keys)
    //統計各年份的動畫數量
    const dataMap = d3.rollup(data, v => d3.count(v, d => d["Score"]), d => d["Start_Year"]);
    //將array-like或iterable object轉換成array
    //將統計出的各年度動數量轉換成Array的資料型態
    const dataArry = Array.from(dataMap, d => ({ Start_Year: d[0], Count: d[1] }))
    return dataArry;
}

//設定資料呈現的畫布，決定圖表該如何呈現
function setupCanvas1(barchartData) {
    const svg_width = 800; //畫布寬度
    const svg_height = 600; //畫布高度
    const chart_margin = { top: 80, right: 40, bottom: 40, left: 80 }; //畫布離邊緣的距離
    const chart_width = svg_width - (chart_margin.right + chart_margin.left); //圖表寬度
    const chart_height = svg_height - (chart_margin.top + chart_margin.bottom); //圖表長度

    const this_svg = d3.select('.bar-chart-container').append('svg') //在.bar-chart-container裡面建立svg元素
        .attr('width', svg_width).attr('height', svg_height) //修改svg的尺寸
        //Template literals (Template strings) -> 可在字串中呼叫、使用參數，而非以+進行串聯
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
        .append('g').attr('transform', `translate(${chart_margin.left}, ${chart_margin.top})`);//建立圖表的群組

    //scale 決定水平、鉛直座標軸的分布範圍
    const X_scale = d3.scaleBand().range([0, chart_width]).padding(0.4)//padding排版
    const Y_scale = d3.scaleLinear().range([chart_height, 0]);
    const xMax = d3.max(barchartData, d => d.Count); // 找到資料當中的最大值

    X_scale.domain(barchartData.map(d => d.Start_Year));
    Y_scale.domain([0, xMax]);


    //const xScale_v3 = d3.scaleLinear([0, xMax], [0, chart_width]);

    //決定鉛直方向座標軸的分布範圍
    //d3.scaleBand() 設定bar的寬度和總共要有幾個bar //domain 有幾個bar 
    //rangeRound 計算每條bar的寬度並無條件捨去小數點 //paddingInner 在bar跟bar之間設定間隔
    //map(d => d. Start_Year) 產生新陣列
    //const yScale = d3.scaleBand().domain(barchartData.map(d => d.Start_Year)).rangeRound([0, chart_height]).paddingInner(0.25);

    //draw bars 實際繪製出所有的bar
    /*selection.data - bind elements to data 將資料與元素綁定，按照資料的比數建立對應個數的element
    selection.enter - get the enter selection (data missing elements) 將資料數值放入element*/
    const bars = this_svg.selectAll('.bar')
        .data(barchartData)
        .enter()
        .append('g')
        .attr('class', 'group')
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => X_scale(d.Start_Year))
        .attr('y', d => Y_scale(d.Count))
        .attr('width', X_scale.bandwidth())
        .attr('height', d => chart_height - Y_scale(d.Count))//bandwidth() 取得bar的寬度
        .style('fill', 'dodgerblue'); //決定bar的顏色
     
    this_svg.selectAll(".group")
    .append('text')
    .attr('class', 'count')
    .text(d => d.Count)
    .attr("x", d => X_scale(d.Start_Year)+2)
    .attr("y", d => Y_scale(d.Count)-5)
    .attr("font-size","0.7em")
        
    //Draw header 新增圖表的標題
    const header = this_svg.append('g').attr('class', 'bar-header')
        .attr('transform', `translate(0,${-(chart_margin.top / 2)})`)
        .append('text');
    header.append('tspan').text('Number of Animations by Year');
    header.append('tspan').text('Year: 2000-2018')
        .attr('x', 0).attr('y', 20).style('font-size', '0.8em').style('fill', '#555');

    const defaultDelay = 1000;
    const transitionDelay = d3.transition().duration(defaultDelay);

    //新增刻度
    //axisBottom 產生圖表底部的刻度
    const xAxis = d3.axisBottom(X_scale);

    //selection.call - call a function with this selection
    //實際畫出x軸座標
    const xAxisDraw = this_svg.append('g').attr('class', 'x axis')
        .attr("transform", "translate(0," + chart_height + ")")
        .call(xAxis)
        .append("text")
        .attr("x",chart_width/2)
        .attr("y",chart_height-440)
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .attr("font-size","0.9rem")
        .text("Year");
    
    //set the size of the ticks 同時設定 tickSizeInner tickSizeOuter
    xAxisDraw.selectAll('text').attr('font-size', '1em')
    
    const yAxis = d3.axisLeft(Y_scale);
    const yAxisDraw = this_svg.append('g')//實際畫出y軸座標
        .attr('class', 'y axis')
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x",-150)
        .attr("y",-50)
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .attr("font-size","0.9rem")
        .text("Number of Animations");
    //The dx attribute indicates a shift along the x-axis on the position of an element or its content.
    yAxisDraw.selectAll('text').attr('dx', '-0.6em')

}

//Main Function
function ready(animation) {
    const animationClean = filterData(animation);
    console.log(animationClean);//用來檢視資料前處理是否有錯誤
    console.log(prepareBarChartData(animationClean));//用來檢視資料前處理是否有錯誤
    const barchartData = prepareBarChartData(animationClean).sort( //將Array的資料進行排序(由大到小)
        (a, b) => {
            return d3.ascending(a.Start_Year, b.Start_Year);//return compare function 用來比較a、b大小的函數
        }
    );
    setupCanvas1(barchartData);
}

//d3.csv的第2個參數可以給定資料預處理方法
d3.csv("./dataset/dataanime.csv", type).then((res) => {
    console.log(res);
    ready(res);
});