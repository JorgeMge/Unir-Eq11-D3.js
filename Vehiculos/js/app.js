const draw = async (el = "#graf") => {

  var width = 500;
  var height = 300;
  var margin = 50;
  var duration = 250;

  var lineOpacity = "0.25";
  var lineOpacityHover = "0.85";
  var otherLinesOpacityHover = "0.1";
  var lineStroke = "1.5px";
  var lineStrokeHover = "2.5px";

  var circleOpacity = '0.85';
  var circleOpacityOnLineHover = "0.25"
  var circleRadius = 3;
  var circleRadiusHover = 6;

  // Selección de gráfica
  const graf = d3.select("#graf")
  const icono = d3.select("#icono")

  // Carga del dataset
  let dataset = await d3.csv("csv/vehiculos.csv", d3.autoType)
  //dataset = dataset.filter((d) => d.income > 0 && d.life_exp > 0)

  // Dimensiones
  const anchoTotal = +graf.style("width").slice(0, -2)
  const altoTotal = anchoTotal * 0.38

  const margins = { top: 20, right: 60, bottom: 75, left: 120 }

  const alto = altoTotal - margins.top - margins.bottom
  const ancho = anchoTotal - margins.left - margins.right

  // Accessors
  const xAccessor = (d) => d.mesid
  const yAccessor = (d) => d.valor
  //const rAccessor = (d) => d.population

  // Tipo
  const tipo = Array.from(new Set(dataset.map((d) => d.tipo)))
  /*const selcon = d3.select("#continent")

  let cont = ["todos"]
  continents.forEach((c) => {
    cont.push(c)
  })

  selcon
    .selectAll("option")
    .data(cont)
    .join("option")
    .attr("value", (d) => d)
    .text((d) => d)*/

  // Escaladores
  const color = d3.scaleOrdinal().domain(tipo).range(d3.schemeTableau10)
  const x = d3
    //.scaleLog()
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, ancho * 1.1])
  const y = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([alto, 0])
    .nice()
  /*const r = d3
    .scaleLinear()
    .domain(d3.extent(dataset, rAccessor))
    .range([25, 25000])
    .nice()*/

  // Espacio de gráfica
  const svg = graf
    .append("svg")
    .classed("graf", true)
    .attr("width", anchoTotal)
    .attr("height", altoTotal)

  svg
    .append("g")
    .append("rect")
    .attr("transform", `translate(${margins.left}, ${margins.top})`)
    .attr("width", ancho * 1.05)
    .attr("height", alto)
    .attr("class", "backdrop")

  svg
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", ancho * 1.05)
    .attr("height", alto)

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`)

  // Variables
  const yearMin = d3.min(dataset, (d) => d.mesid)
  const yearMax = d3.max(dataset, (d) => d.mesid)
  //let mes = "ENERO"//Math.floor((yearMax - yearMin) / 2) + yearMin
  const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
  let mes = 0
  let mesInterval
  let running = false
  const play = d3.select("#play")
  //let filtroContinente = "todos"

  const mesLayer = chart
    .append("g")
    .append("text")
    .attr("x", ancho / 2)
    .attr("y", alto / 2)
    .classed("mes", true)
    .text(meses[mes])

  const step = (mes) => {
    let newDataset = dataset.filter((d) => d.mes == mes+1)

    /*if (filtroContinente != "todos") {
      newDataset = newDataset.filter((d) => d.tipo == filtroContinente)
    }*/

    // Dibujar los puntos
    /*const circles = chart
      .selectAll("circle")
      .data(newDataset)
      //.data(newDataset)
      .join("circle")
      .attr("cx", (d) => x(xAccessor(d)))
      .attr("cy", (d) => y(yAccessor(d)))
      .attr("r", (d) => 4)
      //.attr("r", (d) => Math.sqrt(r(rAccessor(d) / Math.PI)))
      .attr("fill", (d) => color(d.tipo))
      .attr("stroke", "#999")
      .attr("opacity", 0.6)
      .attr("clip-path", "url(#clip)")*/


    /* Add line into SVG */
var line = d3.line()
  .x((d) => x(xAccessor(d)))
  .y((d) => y(yAccessor(d)));

let lines = chart.append('g')
  .attr('class', 'lines');

lines.selectAll('.line-group')
  .data(newDataset).enter()
  .append('g')
  .attr('class', 'line-group')  
  .on("mouseover", function(d, i) {
      chart.append("text")
        .attr("class", "title-text")
        .style("fill", color(i))        
        .text(d.tipo)
        .attr("text-anchor", "middle")
        .attr("x", (width-margin)/2)
        .attr("y", 5);
    })
  .on("mouseout", function(d) {
      chart.select(".title-text").remove();
    })
  .append('path')
  .attr('class', 'line')  
  .attr('d', d => line(d.valor))
  .style('stroke', (d, i) => color(i))
  .style('opacity', lineOpacity)
  .on("mouseover", function(d) {
      d3.selectAll('.line')
          .style('opacity', otherLinesOpacityHover);
      d3.selectAll('.circle')
          .style('opacity', circleOpacityOnLineHover);
      d3.select(this)
        .style('opacity', lineOpacityHover)
        .style("stroke-width", lineStrokeHover)
        .style("cursor", "pointer");
    })
  .on("mouseout", function(d) {
      d3.selectAll(".line")
          .style('opacity', lineOpacity);
      d3.selectAll('.circle')
          .style('opacity', circleOpacity);
      d3.select(this)
        .style("stroke-width", lineStroke)
        .style("cursor", "none");
    });


/* Add circles in the line */
lines.selectAll("circle-group")
  .data(newDataset).enter()
  .append("g")
  .style("fill", (d, i) => color(i))
  .selectAll("circle")
  .data(d => d.valor).enter()
  .append("g")
  .attr("class", "circle")  
  .on("mouseover", function(d) {
      d3.select(this)     
        .style("cursor", "pointer")
        .append("text")
        .attr("class", "text")
        .text(`${d.valor}`)
        .attr("x", d => xScale(d.anio) + 5)
        .attr("y", d => yScale(d.valor) - 10);
    })
  .on("mouseout", function(d) {
      d3.select(this)
        .style("cursor", "none")  
        .transition()
        .duration(duration)
        .selectAll(".text").remove();
    })
  .append("circle")
  .attr("cx", d => xScale(d.date))
  .attr("cy", d => yScale(d.price))
  .attr("r", circleRadius)
  .style('opacity', circleOpacity)
  .on("mouseover", function(d) {
        d3.select(this)
          .transition()
          .duration(duration)
          .attr("r", circleRadiusHover);
      })
    .on("mouseout", function(d) {
        d3.select(this) 
          .transition()
          .duration(duration)
          .attr("r", circleRadius);  
      });


    mesLayer.text(meses[mes])
  }

  step(mes)

  d3.select("#ant").on("click", () => {
    mes--
    mes = mes < 0 ? 11 : mes
    step(mes)
  })
  
  d3.select("#sig").on("click", () => {
    mes++
    mes = mes > 11 ? 0 : mes
    step(mes)
  })

  play.on("click", () => {
    if (running) {
      clearInterval(mesInterval)
      play.classed("btn-success", true).classed("btn-danger", false)
      icono.classed("fa-play", true).classed("fa-pause", false)
    } else {
      mesInterval = setInterval(() => {
        mes++
        mes = mes > 11 ? 0 : mes
        step(mes)
      }, 1000)
      play.classed("btn-success", false).classed("btn-danger", true)
      icono.classed("fa-play", false).classed("fa-pause", true)
    }
    running = !running
  })

  /*selcon.on("change", () => {
    filtroContinente = selcon.node().value
    step(year)
  })*/

  const FormatX = (d) => {
    return d/100
  }

  const FormatY = (d) => {
    return d/1000000 + " M"
  }

  // Ejes
  const xAxis = d3
    .axisBottom(x)
    .ticks(10)
    //.tickFormat((d) => d.toLocaleString())
    .tickSize(-alto)
    .tickFormat(FormatX)

  const yAxis = d3.axisLeft(y)
    .tickSize(-ancho * 1.05)
    .tickFormat(FormatY)
                  
  const xAxisGroup = chart
    .append("g")
    .attr("transform", `translate(0, ${alto})`)
    .call(xAxis)
    //.attr("transform", "rotate(-30)")
    .classed("axis", true)
  const yAxisGroup = chart.append("g").call(yAxis).classed("axis", true)

  xAxisGroup
    .append("text")
    .attr("x", ancho / 2)
    .attr("y", margins.bottom - 10)
    .attr("fill", "black")
    .text("Año")

  yAxisGroup
    .append("text")
    .attr("x", -alto / 2)
    .attr("y", -margins.left + 30)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .style("transform", "rotate(270deg)")
    .text("Valor")
}

draw()