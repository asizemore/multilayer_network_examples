// This file originally modified from https://bl.ocks.org/heybignick/3faf257bbbbc7743bb72310d03b86ee8

// Extract constants from html elements and set attributes
const SVGMX= d3.select("#svg-mx"),
    WIDTHMX = +SVGMX.attr("width"),
    HEIGHTMX = +SVGMX.attr("height"),
    arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length;


SVGMX.attr("class", "svg_class")


// Parameters ---- feel free to experiment with these!
const node_radius = 4,  // Size of nodes
    box_buffer = 0.1,   // Controls amount of buffer between network extremes and box
    extent_buffer = 0.01,   // Controls buffer for node placements
    layer_colors = ["#232544", "#516e7a", "#89aa10"],    // Colors for layers (in order)
    edge_colors = ["#232544", "#516e7a", "#89aa10"],     // Colors for edges -- make sure the third color matches the fill attribute of the marker in line 115 of style_lighttheme.css=
    edge_stroke_scale_g1 = d3.scaleLinear().domain([0.000153,0.0045]).range([0.05,3]),    // Scale stroke width for intra-layer edges in g1
    edge_stroke_scale_g2 = d3.scaleLinear().domain([0.000317,0.0475]).range([0.05,3]),    // Scale stroke width for intra-layer edges in g2
    edge_stroke_scale_g3 = d3.scaleLinear().domain([0.000055,0.086]).range([0.05,3]),     // Scale stroke width for intra-layer edges in g3
    edge_stroke_scale_g1g2 = d3.scaleLinear().domain([0.295, 0.508]).range([0.05,3]),    // Scale stroke width for inter-layer edges between g1 and g2
    edge_stroke_scale_g2g3 = d3.scaleLinear().domain([2963, 5078]).range([0.5, 3]);       // Scale stroke width for inter-layer edges between g2 and g3


// Load graph
const GRAPH = JSON.parse(document.getElementById("datadiv").dataset.mxgraph);
  
// Check how we did at loading
console.log("hello")
console.log(GRAPH)

// Calculate number of nodes within one layer and the whole network - Would be better to get the number of unique values in L1 ...
const nodes_in_L1 = d3.extent(GRAPH.nodes, function(d) {return d.L1})
const nNodes = nodes_in_L1[1]+1;
const nNodes_total = d3.extent(GRAPH.nodes, function(d) {return d.id})[1]
  
// Get number of layers - Would be better to get the number of unique values in L2...
const nLayers = d3.extent(GRAPH.nodes, function(d) {return d.L2})[1]+1;

const L1_colormap = d3.scaleSequential(d3.interpolateSpectral).domain(d3.extent(GRAPH.nodes, function(d) {return d.L1}));   // Colormap for coloring by L1


// Retreive coordinates of the first layer of nodes
x_pos = [];
y_pos = [];

for (i = 0; i < nNodes; i++) {
  x_pos.push(GRAPH.nodes[i].x);
  y_pos.push(GRAPH.nodes[i].y)
}
  

//// Box border calculations

// Define the box centers
const box_center=[arrAvg(x_pos), arrAvg(y_pos)];

// Calculate the box radius (distance from center to corner) using max x and y distances from box_center to any point
let diffsx = [],
    diffsy = [];

for (i=0; i < nNodes; i++) {
  diffsx.push(Math.abs(box_center[0] - GRAPH.nodes[i].x))
  diffsy.push(Math.abs(box_center[1] - GRAPH.nodes[i].y))
}
const box_radiusx = Math.max(...diffsx),
    box_radiusy = Math.max(...diffsy);

// Set the box buffer
const boxspan_x = [Math.min(...x_pos), Math.max(...x_pos)],
    boxspan_y = [Math.min(...y_pos), Math.max(...y_pos)];



//// Projection

// Parameters for projections
let x_0 = 10,
    y_0 = -5,
    tilt = 200,
    d_project = 1,
    l_v = 1;

  
    
//// Scales

// x_scale, y_scale will take the node coordinates (or a transform of them) and scale them so that they will appropriately fill the svg.
let y_scale = d3.scaleLinear().range([50 + 30*(5-nLayers), HEIGHTMX-50 - 30*(5-nLayers)]),
    x_scale = d3.scaleLinear().range([150, WIDTHMX-150]);
  
y_scale.domain(d3.extent(GRAPH.nodes, function(d) {return project_y(d.x, d.y, d.z, d_project, y_0, tilt); }));

// node_extent helps to calculate a projection-specific domain for x_scale.
let nodes_extent = d3.extent(GRAPH.nodes, function(d) {return project_x(d.x, d.y, d.z, d_project, x_0, tilt); });
x_scale.domain([nodes_extent[0] - extent_buffer, nodes_extent[1] + extent_buffer]);




    

//// Draw multilayer network
  

// Draw border boxes first (so that they are in the back of the figure)
let boxes = SVGMX.append("g");
  
  
// Attach data to each layer
for (i=nLayers-1; i>-1; i--) {

  boxes.append("path")
    .attr("d",box_path(boxspan_x, boxspan_y, box_buffer, i, x_0, y_0, d_project, tilt))
    .attr("class", "boxes")
    .attr("id", `box${i}`)
    .attr("fill", function(d) {return layer_colors[GRAPH.nodes.filter(function(n){return n.L2 == i;})[0].L2]})
    .attr("stroke", function(d) {return layer_colors[GRAPH.nodes.filter(function(n){return n.L2 == i;})[0].L2]});

}


// Draw edges
let link = SVGMX.append("g")
      .selectAll("line")
      .data(GRAPH.links)
      .enter().append("path")
        .attr("d", function(d) {return edge_line(d,x_0, y_0, d_project, tilt)})
        .attr("class", edge_class)
        .attr("stroke-width", get_stroke_width)
        .attr("stroke", get_stroke_color);

// Update links to add arrows (function also adapted from https://stackoverflow.com/questions/52075326/d3-v4-add-arrows-to-force-directed-GRAPH)
link.filter(d => edge_class(d) === "intra-layer" && get_source_node(d).L2 === 2)
  .attr("d",edge_line_2)  // edge_line_2 crops off the last bit of the line so there is room for the arrow
  .attr("marker-end", "url(#arrow)");


// Draw nodes
// Attach data to nodes
let node = SVGMX.append("g")
  .attr("class","nodes")
  .selectAll("g")
  .data(GRAPH.nodes)
  .enter().append("g")
  .on("mouseover", mouseover)
  .on("mouseout", mouseout);

// Draw the node circle
node.append("circle")
  .attr("r", node_radius)
  .attr("cx", function(d) {return x_scale(project_x(d.x, d.y, d.z, d_project, x_0, tilt))})
  .attr("cy", function(d) {return y_scale(project_y(d.x, d.y, d.z, d_project, y_0, tilt))})
  .attr("fill", function(d) {console.log(d.L2); return layer_colors[d.L2]})
  .attr("class", "nodes_circles")
  .attr("id", function(d) {return d.id});

// Draw the node strokes (easier to modify opacity settings as a separate object)
node.append("circle")
  .attr("r", node_radius)
  .attr("cx", function(d) {return x_scale(project_x(d.x, d.y, d.z, d_project, x_0, tilt))})
  .attr("cy", function(d) {return y_scale(project_y(d.x, d.y, d.z, d_project, y_0, tilt))})
  .attr("class", "nodes_strokes")
  .attr("id", function(d) {return d.id});






//// Interactivity


// Dropdown/selection effects (changing colors)
d3.select("select").on("change",function(d){

    let selected = d3.select("#color-dropdown").node().value;

    if (selected == "L1"){
      node.selectAll("circle")
        .attr("fill",function(d) {return L1_colormap(d[selected])})
        .style("mix-blend-mode", "none");

      d3.selectAll(".boxes")
        .attr("fill", "white")
        .attr("stroke", "white")
        .style("fill-opacity", 0.04)
        .style("stroke-opacity", 0.2);

    } else if (selected == "L2") {
      node.selectAll("circle")
        .attr("fill", function(d) {return layer_colors[d[selected]]});

      for (i=nLayers-1; i>-1; i--) {
        d3.selectAll(`#box${i}`)
          .attr("fill", function(d) {return layer_colors[GRAPH.nodes.filter(function(n){return n.L2 == i;})[0].L2]})
          .attr("stroke", function(d) {return layer_colors[GRAPH.nodes.filter(function(n){return n.L2 == i;})[0].L2]})
          .style("fill-opacity", 0.1)
          .style("stroke-opacity", 0.5);
      }

    }

});

  
// Buttons!

// Save mx button
d3.select('#mx-button').on('click', function() {
  var config = {
    filename: 'mx',
  }
  d3_save_svg.save(d3.select('#svg-mx').node(), config);

  // DOM.download(() => serialize(d3.select('#svg-mx')), "test", "Save as SVG")
});



// Rotate button
let angle = 0;
d3.select("#rotate-button").on("click", function() {

  angle += 90
  d3.select("#svg-mx")
    .style("transform", "rotate(" + angle + "deg)");

});
  
    
  
// Listen to the slider
d3.select("#slider-x0").on("input", function(d){
  selectedValue = this.value
  x_0 = this.value
  changex0(x_0, y_0, d_project, tilt)

});

d3.select("#slider-tilt").on("input", function(d){
  tilt = this.value
  changex0(x_0,y_0,d_project,tilt)
});
  
  





//// Functions

// Generally helpful functions
function get_source_node(d) {
  source_node = GRAPH.nodes.filter(function(n){return n.id == d.source;})[0];
  return source_node
}

function get_target_node(d) {
  target_node = GRAPH.nodes.filter(function(n){return n.id == d.target;})[0];
  return target_node
}

// Projection functions

function project_x(x_coord, y_coord, z_coord, d_project, x_0, tilt) {

  // first from python to 3d using OP
  x_3d = y_coord;
  z_3d = x_coord + d_project;

  // next project from 3d to 2d window
  x_proj = x_0 + (x_3d-x_0)*(d_project/z_3d)
  return x_proj
};

function project_y(x_coord, y_coord, z_coord, d_project, y_0, tilt) {

  // first from python to 3d using //
  y_3d = tilt;
  z_3d = x_coord + d_project;

  // next project from 3d to 2d
  y_proj = (-1)*(y_0 + (y_3d-y_0)*(d_project/z_3d)) + z_coord

  return y_proj
};



// Box functions

function box_path(boxspan_x, boxspan_y, box_buffer, layer, x_0, y_0, d_project, tilt) {

  // Project to appropriate location, then scale using x_scale, y_scale functions
  let z_value = GRAPH.nodes.filter(function(n){return n.L2 == layer;})[0].z;


  let x1p = x_scale(project_x(boxspan_x[0] - box_buffer, boxspan_y[1] + box_buffer, z_value, d_project, x_0, tilt));
  let y1p = y_scale(project_y(boxspan_x[0] - box_buffer, boxspan_y[1] + box_buffer, z_value, d_project, y_0, tilt));
  let x2p = x_scale(project_x(boxspan_x[1] + box_buffer, boxspan_y[1] + box_buffer, z_value, d_project, x_0, tilt));
  let y2p = y_scale(project_y(boxspan_x[1] + box_buffer, boxspan_y[1] + box_buffer, z_value, d_project, y_0, tilt));
  let x3p = x_scale(project_x(boxspan_x[1] + box_buffer, boxspan_y[0] - box_buffer, z_value, d_project, x_0, tilt));
  let y3p = y_scale(project_y(boxspan_x[1] + box_buffer, boxspan_y[0] - box_buffer, z_value, d_project, y_0, tilt));
  let x4p = x_scale(project_x(boxspan_x[0] - box_buffer, boxspan_y[0] - box_buffer, z_value, d_project, x_0, tilt));
  let y4p = y_scale(project_y(boxspan_x[0] - box_buffer, boxspan_y[0] - box_buffer, z_value, d_project, y_0, tilt));

  return `M ${x1p},${y1p} L ${x2p},${y2p} L ${x3p} ${y3p} L ${x4p} ${y4p} L ${x1p} ${y1p}`;

};



// Edge functions (drawing and others)

function edge_line(d, x_0, y_0, d_project, tilt) {
  
  // Draw a line from source node to target node. Line/arc depends on layer

  const source_node = get_source_node(d); 
  const target_node = get_target_node(d); 
  const y1 = y_scale(project_y(source_node.x, source_node.y, source_node.z, d_project, y_0, tilt));
  const x1 = x_scale(project_x(source_node.x, source_node.y, source_node.z, d_project, x_0, tilt));
  const y2 = y_scale(project_y(target_node.x, target_node.y, target_node.z, d_project, y_0, tilt));
  const x2 = x_scale(project_x(target_node.x, target_node.y, target_node.z, d_project, x_0, tilt));

  let d_path;
  if (edge_class(d) === "intra-layer") {

    // If the edge is within either undirected graph (g1, g2, or L2 = 0, 1), make it a line
    if (source_node.L2 === 2) {

      // Draw curves to connect nodes
      // This beautiful solution adapted from https://stackoverflow.com/questions/52075326/d3-v4-add-arrows-to-force-directed-graph

      let dx = x2 - x1,
          dy = y2 - y1,
          dr = Math.sqrt(dx*dx + dy*dy);

      // If nodes are too close together, we have to draw their arc using the larger part of the ellipse
      if (dr < 2*node_radius + 2) {

        d_path = "M" + x1 + "," + y1 + "A" + dr + "," + dr + " 0 1,0 " + x2 + "," + y2;
        
      } else {

        d_path = "M" + x1 + "," + y1 + "A" + dr + "," + dr + " 0 0,1 " + x2 + "," + y2;
        
      }

    } else {

      // Then we know both nodes are in g1 or g2
      d_path = "M" + x1 + "," + y1 + "L" + x2 + "," + y2;

    }

  } else {

    d_path = `M ${x1},${y1} 
          L ${x2},${y2}`;

  }

  return d_path;

}


function edge_line_2(d) {
  // Takes in an edge, looks at its current path, and if the edge is within g3 will cut the path prematurely so the arrow fits.

  // Get length of current path
  let pl = this.getTotalLength(),

  // Define radius of circle around node
  r = node_radius + 2,

  // Set the new end point close to where path intercepts circle	
  m = this.getPointAtLength(pl - r);    
  
  // Get coordinates of nodes
  let source_node = get_source_node(d) //GRAPH.nodes.filter(function(n){return n.id == d.source;})[0],
   target_node = get_target_node(d) //GRAPH.nodes.filter(function(n){return n.id == d.target;})[0],
   y1 = y_scale(project_y(source_node.x, source_node.y, source_node.z, d_project, y_0, tilt)),
   x1 = x_scale(project_x(source_node.x, source_node.y, source_node.z, d_project, x_0, tilt)),
   x2 = x_scale(project_x(target_node.x, target_node.y, target_node.z, d_project, x_0, tilt));

  // Calculate the change in x, y between new start and end positions
  let dx = m.x - x1,
      dy = m.y - y1,
      dr = Math.sqrt(dx * dx + dy * dy);

  // Draw new curved edge. If the nodes are too close, draw a larger loop instead.
  if (dr < 2*node_radius + 2) {

    return "M" + x1 + "," + y1 + "A" + dr + "," + dr + " 0 1,0 " + m.x + "," + m.y;
    
  } else {

    return "M" + x1 + "," + y1 + "A" + dr + "," + dr + " 0 0,1 " + m.x + "," + m.y;
    
  }

};




function edge_class(d) {
  // Determine within layer or between layer edges

  let node_source_L2 = get_source_node(d).L2,
      node_target_L2 = get_target_node(d).L2;

  if (node_source_L2 == node_target_L2) {
    edge_class_id = "intra-layer"
  } else {
    edge_class_id = "inter-layer"
  }

  return edge_class_id

};


function get_stroke_color(d) {
  // Let the CSS recolor the inter-layer edges. 
  return edge_colors[get_source_node(d).L2];

}
  
  
function get_stroke_width(d) {
  // Given edge data, determine the stroke width

  let stroke_width
  let source_L2 = GRAPH.nodes.filter(x => {return x.id == d.source})[0].L2;
  let target_L2 = GRAPH.nodes.filter(x => {return x.id == d.target})[0].L2;


  if (edge_class(d) === "intra-layer") {


    if (source_L2 === 2) {

      stroke_width = edge_stroke_scale_g3(d.weight);
      
    } else if (source_L2 === 1) {

      stroke_width = edge_stroke_scale_g2(d.weight);
      
    } else {

      stroke_width = edge_stroke_scale_g1(d.weight);

    }

  } else {


    if ([0, 1].includes(source_L2) && [0, 1].includes(target_L2)) {

      
      stroke_width = edge_stroke_scale_g1g2(d.weight);
    } else if ([1, 2].includes(source_L2) && [1, 2].includes(target_L2)) {


      stroke_width = edge_stroke_scale_g2g3(d.weight);

    } else {
      stroke_width = 10;
    }

  }

  return stroke_width

}
  



// Interactivity

// Slider functions
function changex0(selectedValuex, selectedValuey, selected_value_d, selected_tilt) {
  // Changes multilayer network rendering based on slider value

  x_0 = Number(selectedValuex);
  y_0 = Number(selectedValuey);
  d_project = Number(selected_value_d);
  tilt = Number(selected_tilt);

  console.log(x_0,y_0,d_project,tilt)   // This helps to know EXACTLY which coordinates were used in case you need to remake the figure.

  // Recalculate the x_scale domain
  let nodes_extent1 = d3.extent(GRAPH.nodes, function(d) {return project_x(d.x, d.y, d.z, d_project, x_0, tilt)});
  x_scale.domain([nodes_extent1[0] - extent_buffer, nodes_extent1[1] + extent_buffer]);

  // And recalculate y_scale
  y_scale.domain(d3.extent(GRAPH.nodes, function(d) {return project_y(d.x, d.y, d.z, d_project, y_0, tilt); }));

  // Recalculate node position
  d3.selectAll(".nodes_circles")
    .attr("cx", function(d) {return x_scale(project_x(d.x, d.y, d.z, d_project, x_0, tilt))})
    .attr("cy", function(d) {return y_scale(project_y(d.x, d.y, d.z, d_project, y_0, tilt))})

  d3.selectAll(".nodes_strokes")
    .attr("cx", function(d) {return x_scale(project_x(d.x, d.y, d.z, d_project, x_0, tilt))})
    .attr("cy", function(d) {return y_scale(project_y(d.x, d.y, d.z, d_project, y_0, tilt))})

  // Recalculate edge postitions
  d3.selectAll(".intra-layer")
    .attr("d", function(d) {return edge_line(d,x_0, y_0, d_project, tilt)});

  d3.selectAll(".intra-layer").filter(d => get_source_node(d).L2 === 2)
    .attr("d",edge_line_2);

  d3.selectAll(".inter-layer")
    .attr("d", function(d) {return edge_line(d,x_0, y_0, d_project, tilt)});

  // Recalculate box postitions
  for (i=nLayers-1; i>-1; i--) {
    d3.selectAll(`#box${i}`)
      .attr("d",function(d) {return box_path(boxspan_x, boxspan_y, box_buffer, i, x_0, y_0, d_project, tilt)})
  }

};


// Mouseover and Mouseouts
function mouseover() {
  d3.select(this).selectAll("circle").transition()
    .duration(100)
    .attr("r",node_radius*2)


  let selected_node_id = d3.select(this).select("circle").attr("id");
  console.log(selected_node_id)

  


};

function mouseout() {
  d3.select(this).selectAll("circle").transition()
    .duration(100)
    .attr("r",node_radius)

 
};
  
  
  

  
  