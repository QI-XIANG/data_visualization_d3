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

//choose specific data
function choose_data(metric, animationClean) {
    const thisData = animationClean.sort((a, b) => b[metric] - a[metric]).filter((d, i) => i < 15);
    return thisData;
}

function formatTicks(d) {
    /*d3.format("s")(1500);  // "1.50000k"
      d3.format("~s")(1500); // "1.5k"*/
    return d3.format('~s')(d)
        .replace('M', 'M') //字串取代
        .replace('k', 'K')
        .replace('G', 'G')
        .replace('T', 'T')
}

function cutText(string) {
    return string.length < 35 ? string : string.substring(0, 35) + "...";
}

//barchartData: 實際繪圖需要的資料
function setupCanvas2(barChartData, animationClean) {

    let metric = "Favorites"

    function click() {
        metric = this.dataset.name;
        console.log(metric);
        const thisData = choose_data(metric, animationClean);
        //console.log(this.innerHTML);
        document.querySelector('.bar-chart2-title').innerHTML = `Bar Chart 2 : Animations by ${this.innerHTML}`;
        update(thisData,this.innerHTML);
    }

    d3.selectAll('.controls button').on('click', click);

    function update(data,titleChange) {
        console.log(data);

        xMax = d3.max(data, d => d[metric]);
        X_scale = d3.scaleLinear([0, xMax], [0, barchart_width])

        Y_scale = d3.scaleBand().domain(data.map(d => d["Title"]))
            .rangeRound([0, barchart_height]).paddingInner(0.25);

        const defaultDelay = 1000;
        const transitionDelay = d3.transition().duration(defaultDelay);

        //Update axis
        xAxisDraw.transition(transitionDelay).call(xAxis.scale(X_scale));
        yAxisDraw.transition(transitionDelay).call(yAxis.scale(Y_scale));

        yAxisDraw.selectAll('text').attr('dx', "-0.6em");
        yAxisDraw.selectAll('text').attr('font-size', "1.1em");

        //Update Header
        header.select('tspan').text(`Top 15 Animations by ${titleChange}`);

        //Update Bar 
        bars.selectAll('.bar2').data(data, d => d["Title"]).join(
            enter => {
                enter.append('rect').attr('class', 'bar2').attr("x", 0)
                    .attr('y', d => Y_scale(d['Title'])).attr("height", Y_scale.bandwidth())
                    .style('fill', 'dodgerblue').transition(transitionDelay)
                    .delay((d, i) => i * 20).attr('width', d => X_scale(d[metric])).style('dodgerblue');
            },
            update => {
                update.transition(transitionDelay).delay((d, i) => i * 20)
                    .attr('y', d => Y_scale(d["Title"])).attr("width", d => X_scale(d[metric]));
            },
            exit => {
                exit.transition().duration(defaultDelay / 2).style('fill-opacity', 0).remove();
            }

        )

        //tooltip
        const tip = d3.select('.tooltip');

        function mouseoverTip(e) {
            //get data
            const thisBarData = d3.select(this).data()[0];
            const detailData = [
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


            tip.style('left', (e.clientX + 18) + 'px')
                .style('top', e.clientY + 'px')
                .transition().style('opacity', 0.98);

            tip.select('h3').html(`${thisBarData['Title']}, ${thisBarData['Start_Year']}`);

            d3.select('.tip-body').selectAll('p').data(detailData)
                .join('p').attr('class', 'tip-info').html(d => `${d[0]} : ${d[1]}`);
        }

        function mousemoveTip(e) {
            tip.style('left', (e.clientX + 18) + 'px')
                .style('top', e.clientY + 'px')
                .style('opacity', 0.98);
        }

        function mousemoutTip(e) {
            tip.transition().style('opacity', 0);
        }



        //interactive 新增監聽
        d3.selectAll('.bar2').on('mouseover', mouseoverTip)
            .on('mousemove', mousemoveTip)
            .on('mouseout', mousemoutTip);

    }

    const svg_width = 1000;
    const svg_height = 650;
    const barchart_margin = { top: 100, right: 80, bottom: 40, left: 200 };
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

    update(barChartData,"Favorites");

}

d3.csv("dataanime.csv", type).then((res) => {
    const animationClean = filterData(res)
    let barChartData = choose_data("Favorites", animationClean);
    console.log(choose_data("favorites", animationClean));
    setupCanvas2(barChartData, animationClean);
});

/*載入中圖示*/
let preloader = document.querySelector("#preloader");
let footer = document.querySelector(".footer");
let controls = document.querySelector(".controls");
let table_container = document.querySelector(".table-container");
if (preloader) {
    window.addEventListener("load", () => {
        preloader.remove();
        footer.style.opacity = "1.0";
        controls.style.opacity = "1.0";
        table_container.style.opacity = "1.0";
    });
}