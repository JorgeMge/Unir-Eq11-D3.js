const draw = async (el = "#graf") => {
  // Selección de gráfica
  const graf = d3.select("#graf")

  // Carga del dataset
  let dataset = await d3.csv("csv/vehiculos.csv", d3.autoType)
  //dataset = dataset.filter((d) => d.income > 0 && d.life_exp > 0)

  // Dimensiones
  const anchoTotal = +graf.style("width").slice(0, -2)
  const altoTotal = anchoTotal * 0.38

  const margins = { top: 20, right: 20, bottom: 75, left: 180 }

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
    .range([0, ancho])
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
    .attr("width", ancho)
    .attr("height", alto)
    .attr("class", "backdrop")

  svg
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", ancho)
    .attr("height", alto)

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`)

  // Variables
  const yearMin = d3.min(dataset, (d) => d.mesid)
  const yearMax = d3.max(dataset, (d) => d.mesid)
  let year = 200801//Math.floor((yearMax - yearMin) / 2) + yearMin
  let yearInterval
  let running = false
  const play = d3.select("#play")
  //let filtroContinente = "todos"

  /*const yearLayer = chart
    .append("g")
    .append("text")
    .attr("x", ancho / 2)
    .attr("y", alto / 2)
    .classed("year", true)
    .text(year)*/

  const step = (year) => {
    //let newDataset = dataset.filter((d) => d.mesid == year)

    /*if (filtroContinente != "todos") {
      newDataset = newDataset.filter((d) => d.tipo == filtroContinente)
    }*/

    // Dibujar los puntos
    const circles = chart
      .selectAll("circle")
      .data(dataset)
      //.data(newDataset)
      .join("circle")
      .attr("cx", (d) => x(xAccessor(d)))
      .attr("cy", (d) => y(yAccessor(d)))
      .attr("r", (d) => 4)
      //.attr("r", (d) => Math.sqrt(r(rAccessor(d) / Math.PI)))
      .attr("fill", (d) => color(d.tipo))
      .attr("stroke", "#999")
      .attr("opacity", 0.6)
      .attr("clip-path", "url(#clip)")

    //yearLayer.text(year)
  }

  step(year)

  d3.select("#ant").on("click", () => {
    year--
    year = year < yearMin ? yearMin : year
    step(year)
  })
  
  d3.select("#sig").on("click", () => {
    year++
    year = year > yearMax ? yearMax : year
    step(year)
  })

  play.on("click", () => {
    if (running) {
      clearInterval(yearInterval)
      play.classed("btn-success", true).classed("btn-danger", false)
    } else {
      yearInterval = setInterval(() => {
        year++
        year = year > yearMax ? yearMin : year
        step(year)
      }, 1000)
      play.classed("btn-success", false).classed("btn-danger", true)
    }
    running = !running
  })

  /*selcon.on("change", () => {
    filtroContinente = selcon.node().value
    step(year)
  })*/

  // Ejes
  const xAxis = d3
    .axisBottom(x)
    .ticks(9)
    .tickFormat((d) => d.toLocaleString())
  const yAxis = d3.axisLeft(y)

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
    .text("Mes ID")

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
