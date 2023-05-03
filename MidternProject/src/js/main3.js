// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/pie-chart
function PieChart(
  data,
  {
    name = ([x]) => x, // given d in data, returns the (ordinal) label
    value = ([, y]) => y, // given d in data, returns the (quantitative) value
    title, // given d in data, returns the title text
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    innerRadius = 0, // inner radius of pie, in pixels (non-zero for donut)
    outerRadius = Math.min(width, height) / 2, // outer radius of pie, in pixels
    labelRadius = innerRadius * 0.2 + outerRadius * 0.8, // center radius of labels
    format = ",", // a format specifier for values (in the label)
    names, // array of names (the domain of the color scale)
    colors, // array of colors for names
    stroke = innerRadius > 0 ? "none" : "white", // stroke separating widths
    strokeWidth = 1, // width of stroke separating wedges
    strokeLinejoin = "round", // line join of stroke separating wedges
    padAngle = stroke === "none" ? 1 / outerRadius : 0, // angular separation between wedges
  } = {}
) {
  // Compute values.
  const N = d3.map(data, name);
  const V = d3.map(data, value);
  const I = d3.range(N.length).filter((i) => !isNaN(V[i]));

  // Unique the names.
  if (names === undefined) names = N;
  names = new d3.InternSet(names);

  // Chose a default color scheme based on cardinality.
  if (colors === undefined) colors = d3.schemeSpectral[names.size];
  if (colors === undefined)
    colors = d3.quantize(
      (t) => d3.interpolateSpectral(t * 0.8 + 0.1),
      names.size
    );

  // Construct scales.
  const color = d3.scaleOrdinal(names, colors);

  // Compute titles.
  if (title === undefined) {
    const formatValue = d3.format(format);
    title = (i) => `${N[i]}\n${formatValue(V[i])}`;
  } else {
    const O = d3.map(data, (d) => d);
    const T = title;
    title = (i) => T(O[i], i, data);
  }

  // Construct arcs.
  const arcs = d3
    .pie()
    .padAngle(padAngle)
    .sort(null)
    .value((i) => V[i])(I);
  const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
  const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);

  const svg = d3.select(".pie_chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg
    .append("g")
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth)
    .attr("stroke-linejoin", strokeLinejoin)
    .selectAll("path")
    .data(arcs)
    .join("path")
    .attr("fill", (d) => color(N[d.data]))
    .attr("d", arc)
    .append("title")
    .text((d) => title(d.data));

  svg
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 14)
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(arcs)
    .join("text")
    .attr("transform", (d) => `translate(${arcLabel.centroid(d)})`)
    .selectAll("tspan")
    .data((d) => {
      const lines = `${title(d.data)}`.split(/\n/);
      return d.endAngle - d.startAngle > 0.25 ? lines : lines.slice(0, 1);
    })
    .join("tspan")
    .attr("x", 0)
    .attr("y", (_, i) => `${i * 1.1}em`)
    .attr("font-weight", (_, i) => (i ? null : "bold"))
    .text((d) => d);

  return Object.assign(svg.node(), { scales: { color } });
}

/*chart = PieChart(animationClean, {
    name: (d) => d["Title"],
    value: (d) => d["Favorites"],
    width: 500,
    height: 500,
  });*/

//資料聚合
//https://github.com/d3/d3-array/blob/v3.2.2/README.md#rollup
//https://observablehq.com/@d3/d3-ascending
//https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/from
function preparePieChartData(data) {
    //console.log(data);
    //rollup是iterable函式會逐筆讀入資料 rollups(values, reduce, ...keys)
    const dataMap = d3.rollup(data, v => d3.count(v, d => d["Score"]), d => d["Genre"]);
    //將array-like或iterable object轉換成array
    const dataArry = Array.from(dataMap, d => ({ Genre: d[0], Count: d[1] }));
    const data_sort = dataArry.sort( (a,b) => b["Count"] - a["Count"]);
    let data_other_sumation = 0;
    data_sort.slice(5,).forEach(e=>{ //統計除前4大類型動畫外的數量
        data_other_sumation += e["Count"];
    })
    dataArry.push({"Genre":"Other","Count":data_other_sumation});
    const pie_data = dataArry.sort( (a,b) => b["Count"] - a["Count"]).filter((d, i) => i < 5);
    return pie_data;
}

//d3.csv的第2個參數可以給定資料預處理方法
d3.csv("./dataset/dataanime.csv", type).then((res) => {
  const animationClean = filterData(res);
  const final_pieData = preparePieChartData(animationClean);

  chart = PieChart(final_pieData, {
    name: (d) => d["Genre"],
    value: (d) => d["Count"],
    width: 500,
    height: 500,
  });
});
