
/*

1. Fetching data

1.1) d3.json, topojson.feature(t,o).features, gives array of features (map structure)
1.2) d3.json (map data)

2. Drawing the map

2.1) create a path for every array (county) and let geoPath() translate coordinates into "d"

3. Treshold scale

3.1) Set the color range
3.2) set the color domain (calculate interval and add from minimum value)
3.3) make a treshold scale, with color domain and range
3.4) make a linear scale, with same domain (linear doesnt go discrete)
3.5) make x axis, with linear scale (and trheshold domain in tickValues)
3.6) call axis on svg, g
3.7) remove domain (ticks will remain)
3.8) insert rect elements (with data set to color domain), before .tick
3.9) set attributes, with fill as colorRange

*/

const toolTip = d3
    .select("#tooltip-container")
    .append("div")
    .attr("id", "tooltip")
    .style("display", "none");

const urlData = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

const urlGeospatial = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"

let mapStructure;
let mapData;
let degreeExtent;
let colorDomain;
let colorRange;

const drawmap = () => {

    d3.select("#map").append("svg")
        .selectAll("path")
        .data(mapStructure)
        .enter()
        .append("path")
        // "d" defines the path to be drawn in svg. geoPath() translates the coordinates in geojson geometry coordinates (longitude/latitude pairs) into svg path code
        .attr("d", d3.geoPath())
        .attr("class", "county")
        .style("fill", d => {
            let county = mapData.filter( i => i.fips === d.id )
            let bach = county[0].bachelorsOrHigher
            if (bach >= colorDomain[0] && bach < colorDomain[1]) {
                return colorRange[0]
            } else if (bach >= colorDomain[1] && bach < colorDomain[2]) {
                return colorRange[1]
            } else if (bach >= colorDomain[2] && bach < colorDomain[3]) {
                return colorRange[2]
            } else if (bach >= colorDomain[3] && bach < colorDomain[4]){
                return colorRange[3]
            } else if (bach >= colorDomain[4] && bach < colorDomain[5]) {
                return colorRange[4]
            } else if (bach >= colorDomain[5] && bach < colorDomain[6]){
                return colorRange[5] 
            } else {
                return colorRange[6]
            }
        })
        .attr("data-fips", d => {
            let county = mapData.filter( i => i.fips === d.id )
            return county[0].fips
        })
        .attr("data-education", d => {
            let county = mapData.filter( i => i.fips === d.id )
            return county[0].bachelorsOrHigher
        })
        .on("mouseover", () => {
            toolTip
                .style("display", "block")
        })
        .on("mousemove", (ev,d) => {

            let county = mapData
                .filter( i => i.fips == `${d.id}` )
            
                console.log(county[0])

            toolTip
                .html(`
                    <div>
                        <dt>State: </dt>
                        <dd>${county[0].state}</dd>
                    </div>
                    <div>
                        <dt>Area Name: </dt>
                        <dd id="an">${county[0].area_name}</dd>
                    </div>
                    <div>
                        <dt>Bachelor Degree (or higher): </dt>
                        <dd>${county[0].bachelorsOrHigher}</dd>
                    </div>
                    
                    `)
                .attr("data-education", () => {
                    return county[0].bachelorsOrHigher
                })
                .style("top", (ev.pageY)-100 +"px")
                .style("left",(ev.pageX)+20  +"px")
        })
        .on("mouseleave", () => {
            toolTip
                .style("display","none")
        })

}

const drawTreshold = () => {

    // 3.1
    colorRange = ["#EFD6EF", "#DDAFED", "#CC4BE6", "#9C0B9C", "#070471"]

    //3.2
    degreeExtent = d3.extent(mapData.map( b => b.bachelorsOrHigher))

    const colorDomainInterval = Number(((degreeExtent[1] - degreeExtent[0])/(colorRange.length)).toFixed(3))

    colorDomain = colorRange.map( (d,i) => {
        return Number((Number(degreeExtent[0]) + i*Number(colorDomainInterval)).toFixed(3))
    })

    colorDomain.push(degreeExtent[1])
                        	
    //3.3
    const threshold = d3.scaleThreshold()
        .domain(colorDomain)
        .range(colorRange)

    //3.4
    const x = d3.scaleLinear()
        .domain([degreeExtent[0], degreeExtent[1]])
        .range([0, 200])

    //3.5
    const xAxisLegend = d3.axisBottom(x)
        .tickSize(30)
        .tickValues(threshold.domain())
        .tickFormat(d3.format(".1f"))                    

    //3.6
    const description = d3
        .select("#legend")
        .append("svg")
        .attr("width", 400)
        .attr("height", 100)

    description 
        .append("g")
        .attr("class", "desc-g")
        .attr("transform","translate(30)")
        .call(xAxisLegend);

    //3.7
    const g = d3.select(".desc-g")

    g.select(".domain").remove()

    //3.8, 3.9
    g.selectAll("rect")
        .data(colorDomain)
        .enter()
        .insert("rect",".tick")
            .attr("height", 20)
            .attr("width", x(colorDomain[2]) - x(colorDomain[1]))
            .attr("x", d => x(d))
            .attr("fill", (d,i) => colorRange[i])                    
}

// takes json file and return a promise, with json string converted into js object (data)
d3.json(urlGeospatial).then(
    (data,error) => {
        if(error) console.log(error)
        else {
            // d3 requires vector geographic information data for the map in geojson : "topojson.feature" does the convertion, takes "topology" as first argument , and "specified object" (in it) as second. That object contains arcs - which are line segments of the map, to create shapes. Geojson contains of features (features collection), and apart from everything else in geojson this is whats needed (.features)
            mapStructure = topojson.feature(data, data.objects.counties).features

            d3.json(urlData).then(
                (data,error) => {
                    if (error) console.log(error)
                    else {
                        mapData = data
                        drawTreshold()
                        drawmap()
                    }
                }
            )
        }
    }
)













