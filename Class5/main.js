/*d3.csv("../data/movies.csv").then((res) => {
    console.log(res);
    //debugger; 用來抓住區域變數，不然原則上執行完這行，在瀏覽器console裡面res會變成undefined
});*/

//字串處理，將NA換成undefined，其餘則保持原string
const parseNA = string => (string === 'NA' ? "undifined" : string); //匿名函式

//日期處理
const parseDate = string => d3.timeParse("%Y-%m-%d")(string); //匿名函式
//上面相當於下面
/*const parseDate = d3.timeParse("%Y-%m-%d");
parseDate(string);*/

// + 轉換成數字
//轉換資料類型
function type(d){
    const date = parseDate(d.release_date);
    return{
        budget:+d.budget,
        genre:parseNA(d.genre),
        genres:JSON.parse(d.genres).map(d=>d.name),
        homepage:parseNA(d.homepage),
        id:+d.id,imdb_id:parseNA(d.imdb_id),
        original_language:parseNA(d.original_language),
        overview:parseNA(d.overview),
        popularity:+d.popularity,
        poster_path:parseNA(d.poster_path),
        production_countries:JSON.parse(d.production_countries),
        release_date:date,
        release_year:date.getFullYear(),
        revenue:+d.revenue,
        runtime:+d.runtime,
        tagline:parseNA(d.tagline),
        title:parseNA(d.title),
        vote_average:+d.vote_average,
        vote_count:+d.vote_count,
    }
}

//d3.csv的第2個參數可以給定資料預處理方法
//d3.csv("../data/movies.csv",type).then((res) => console.log(res));

//data filter
function filterData(data){
    return data.filter(
        d => {
            return(
                d.release_year > 1999 && d.release_year < 2010 &&
                d.revenue > 0 &&
                d.budget > 0 &&
                d.genre && //不為空值
                d.title //不為空值 
            )
        }
    )
}

//d3.csv("../data/movies.csv",type).then((res) => console.log(filterData(res)));

//Main Function
/*function ready(movies){
    const moviesClean = filterData(movies);
    console.log(moviesClean);
}*/

//資料聚合
//https://github.com/d3/d3-array/blob/v3.2.2/README.md#rollup
//https://observablehq.com/@d3/d3-ascending
//https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/from
function prepareBarChartData(data){
    //console.log(data);
    //rollup是iterable函式會逐筆讀入資料 rollups(values, reduce, ...keys)
    const dataMap = d3.rollup(data,v => d3.sum(v , d=>d.revenue), d => d.genre);
    //將array-like或iterable object轉換成array
    const dataArry = Array.from(dataMap, d => ({genre:d[0], revenue:d[1]}))
    return dataArry;
}

//Main Function
function ready(movies){
    const moviesClean = filterData(movies);
    //barchartData : Array
    const barchartData = prepareBarChartData(moviesClean).sort(
        (a,b) => {
            return d3.descending(a.revenue,b.revenue);//return compare function
        }
    );
    /*下面跟上面的效果相同 https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/sort*/
    /*const barchartData = prepareBarChartData(moviesClean).sort(
        (a,b) => {
            if(a.revenue > b.revenue ){
                return -1;
            }
            if(a.revenue < b.revenue){
                return 1;
            }
            return 0;
        }
    );*/
    console.log(barchartData);
    setupCanvas(barchartData);
}

//load data
d3.csv("../data/movies.csv",type).then(res => {
    ready(res);
})

function setupCanvas(barchartData){
    const svg_width = 400;
    const svg_height = 500;
    const chart_margin = {top:80,right:40,bottom:40,left:80};
    const chart_width = svg_width - (chart_margin.right + chart_margin.left);
    const chart_height = svg_height - (chart_margin.top + chart_margin.bottom);

    const this_svg = d3.select('.bar-chart-container').append('svg')
    .attr('width', svg_width).attr('height', svg_height)
    //Template literals (Template strings)
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
    .append('g').attr('transform',`translate(${chart_margin.left}, ${chart_margin.top})`);
}