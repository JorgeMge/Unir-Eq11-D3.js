const draw = async (el = "#graf") => {
  // Selección de gráfica
  const graf = d3.select("#graf")
  const icono = d3.select("#icono")

  // Carga del dataset
  let dataset = await d3.csv("csv/vehiculos.csv", d3.autoType)

  // Dimensiones
  const anchoTotal = +graf.style("width").slice(0, -2)
  const altoTotal = anchoTotal * 0.38

  const margins = { top: 20, right: 20, bottom: 75, left: 120 }

  const alto = altoTotal - margins.top - margins.bottom 
  const ancho = anchoTotal - margins.left - margins.right

  // Accessors
  const xAccessor = (d) => d.anio
  const yAccessor = (d) => d.valor

  // Tipo
  const tipo = Array.from(new Set(dataset.map((d) => d.tipo)))

  // Colores
  const color = d3.scaleOrdinal().domain(tipo).range(d3.schemeSet1)

  // Escaladores
  const x = d3
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, ancho])

  const y = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([alto, 0])
    .nice()

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

  //Formato de ejes
  const FormatX = (d) => {
    return d
  }

  const FormatY = (d) => {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
        roundingIncrement: 5,
      }).format(d/1000000) + " M"
  }

  // Ejes
  const xAxis = d3
    .axisBottom(x)
    .ticks(20)
    .tickSize(-alto)
    .tickFormat(FormatX)

  const yAxis = d3.axisLeft(y)
    .tickSize(-ancho)
    .tickFormat(FormatY)
                  
  const xAxisGroup = chart
    .append("g")
    .attr("transform", `translate(0, ${alto})`)
    .call(xAxis)
    .classed("axis", true)

  const yAxisGroup = chart
    .append("g")
    .call(yAxis)
    .classed("axis", true)

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

  // Variables
  const yearMin = d3.min(dataset, (d) => d.anio) //Año minimo en el dataset
  const yearMax = d3.max(dataset, (d) => d.anio) //Año máximo en el dataset
  let ban = 1   // Bandera para crear las lineas en la primera iteración
  let linesi // Filtro de importaciones   
  let linese // Filtro de exportaciones  

  // Arreglo de meses para mostrar el nombre
  const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
  let mes = 0   // Mes incial
  let mesInterval
  let running = false
  const play = d3.select("#play")

  //Texto de mes
  const mesLayer = chart
    .append("g")
    .append("text")
    .attr("x", ancho / 2)
    .attr("y", alto / 2)
    .classed("mes", true)
    .text(meses[mes])

  //Función para iterar
  const step = (mes) => {
    //Filtrado
    let ds = dataset.filter((d) => d.mes == mes+1)
    let dsi = ds.filter((d) => d.tipo == "Importaciones")
    let dse = ds.filter((d) => d.tipo == "Exportaciones")

    // Dibujar los puntos
    const circles = chart
      .selectAll("circle")
      .data(ds)
      .join("circle")
      .transition() 
      .duration(1000)
      .attr("cx", (d) => x(d.anio))
      .attr("cy", (d) => y(d.valor))
      .attr("r", (d) => 7)
      .attr("fill", (d) => color(d.tipo))
      .attr("stroke", "#999")
      .attr("clip-path", "url(#clip)")

    //Dibujar líneas
    if(ban==1){
      ban=0;
      linesi = chart
      .append("path")
      .attr("class","linei")
      .datum(dsi)
      .transition() 
      .duration(1000)
      .attr("fill", "none")
      .attr("stroke", (d) => color(d.tipo))
      .attr("stroke-width", 1)
      .attr("d", d3.line()
          .x((d) => x(d.anio))
          .y((d) => y(d.valor))
        );

      linese = chart
      .append("path")
      .attr("class","linee")
      .datum(dse)
      .transition() 
      .duration(1000)
      .attr("fill", "none")
      .attr("stroke", (d) => color(d.tipo))
      .attr("stroke-width", 1)
      .attr("d", d3.line()
          .x((d) => x(d.anio))
          .y((d) => y(d.valor))
        );
    }else{
      chart.select("path.linei") // selecciona la línea existente en el gráfico
        .datum(dsi) // reemplaza los datos asociados con los nuevos datos
        .transition() 
        .duration(1000) // opcional, si quieres mantener la animación
        .attr("d", d3.line()
          .x((d) => x(d.anio))
          .y((d) => y(d.valor))
        );

        chart.select("path.linee") // selecciona la línea existente en el gráfico
        .datum(dse) // reemplaza los datos asociados con los nuevos datos
        .transition() 
        .duration(1000) // opcional, si quieres mantener la animación
        .attr("d", d3.line()
          .x((d) => x(d.anio))
          .y((d) => y(d.valor))
        );
    }

    //Etiqueta de valores
    const etiqueta = chart
      .selectAll("text.etiqueta")
      .data(ds)
      .join("text")
      .classed("etiqueta", true)
      .transition() 
      .duration(1000)
      .attr("x", (d) => x(d.anio))
      .attr("y", (d) => y(d.valor)-10)
      .text((d) => new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
        roundingIncrement: 5,
      }).format(d.valor/1000000) + " M")
      .attr("clip-path", "url(#clip)");

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
}

draw()