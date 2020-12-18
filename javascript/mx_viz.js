// <!-- begin javascript -->
// <!-- <script> -->

    // This file originally modified from https://bl.ocks.org/heybignick/3faf257bbbbc7743bb72310d03b86ee8
    var svgmx= d3.select("#svg-mx"),
        widthmx = +svgmx.attr("width"),
        heightmx = +svgmx.attr("height");
    
    
    svgmx.attr("class", "svg_class")
    
    // Change filename here
    // d3.json("data/mx_2layers2.json", function(error, graph) {
    //   if (error) throw error;
    var graph = JSON.parse(document.getElementById("datadiv").dataset.mxgraph);
    console.log(graph)
    console.log("hello")

    
    
      // need to know how many nodes in layer 1
      // Would be better to get the number of unique values in L1 ...
      var nodes_in_L1 = d3.extent(graph.nodes, function(d) {return d.L1})
    
      var nNodes = nodes_in_L1[1]+1;

      var nNodes_total = d3.extent(graph.nodes, function(d) {return d.id})[1]
    
    
      // Get number of layers
      // Would be better to get the number of unique values in L2.
      var nLayers = d3.extent(graph.nodes, function(d) {return d.L2})[1]+1
    
      // Get coordinates of the first layer of nodes
      x_pos = [];
      y_pos = [];
    
      for (i = 0; i < nNodes; i++) {
        x_pos.push(graph.nodes[i].x);
        y_pos.push(graph.nodes[i].y)
      }
    
      // Define the center of our box
    
      const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length
      box_center=[arrAvg(x_pos), arrAvg(y_pos)]
    
      // find the max x and y distances from box_center to any point
      var diffsx = [];
      var diffsy = [];
      for (i=0; i < nNodes; i++) {
        diffsx.push(Math.abs(box_center[0] - graph.nodes[i].x))
        diffsy.push(Math.abs(box_center[1] - graph.nodes[i].y))
      }
      box_radiusx = Math.max(...diffsx)
      box_radiusy = Math.max(...diffsy)
    
      var xs = [];
      var ys = [];
      for (i=0; i< nNodes; i++) {
        xs.push(graph.nodes[i].x)
        ys.push(graph.nodes[i].y)
      }
    
      // Set the box buffer
    
      boxspan_x = [Math.min(...xs), Math.max(...xs)]
      boxspan_y = [Math.min(...ys), Math.max(...ys)]
      console.log(boxspan_x,boxspan_y)
    
    
    
      // Projection functions
      var x_0 = 10;
      var y_0 = -5;
      var tilt = 200;
    
    
      function project_x(x_coord, y_coord, z_coord, d_project, x_0, tilt) {
        // x_proj = x_coord*Math.cos(2*Math.PI*(alpha/360)) // cos takes radians
        // first from python to 3d using OP
        x_3d = y_coord;
        z_3d = x_coord + d_project;
    
        // next project from 3d to 2d window
        x_proj = x_0 + (x_3d-x_0)*(d_project/z_3d)
        return x_proj
      }
    
      function project_y(x_coord, y_coord, z_coord, d_project, y_0, tilt) {
        // y_proj = y_coord*Math.sin(2*Math.PI*(alpha/360)) + l_v;
        // first from python to 3d using //
        y_3d = tilt;
        z_3d = x_coord + d_project;
    
        // next project from 3d to 2d
        y_proj = (-1)*(y_0 + (y_3d-y_0)*(d_project/z_3d)) + z_coord
    
        return y_proj
      }
    
      var d_project = 1, l_v = 1
      // Define box path
      function box_path(boxspan_x, boxspan_y, box_buffer, layer, x_0, y_0, d_project, tilt) {
    
        // need to project, then scale the projection
            var z_value = graph.nodes.filter(function(n){return n.L2 == layer;})[0].z
    
    
            const x1p = x_scale(project_x(boxspan_x[0] - box_buffer, boxspan_y[1] + box_buffer, z_value, d_project, x_0, tilt));
            const y1p = y_scale(project_y(boxspan_x[0] - box_buffer, boxspan_y[1] + box_buffer, z_value, d_project, y_0, tilt));
            const x2p = x_scale(project_x(boxspan_x[1] + box_buffer, boxspan_y[1] + box_buffer, z_value, d_project, x_0, tilt));
            const y2p = y_scale(project_y(boxspan_x[1] + box_buffer, boxspan_y[1] + box_buffer, z_value, d_project, y_0, tilt));
            const x3p = x_scale(project_x(boxspan_x[1] + box_buffer, boxspan_y[0] - box_buffer, z_value, d_project, x_0, tilt));
            const y3p = y_scale(project_y(boxspan_x[1] + box_buffer, boxspan_y[0] - box_buffer, z_value, d_project, y_0, tilt));
            const x4p = x_scale(project_x(boxspan_x[0] - box_buffer, boxspan_y[0] - box_buffer, z_value, d_project, x_0, tilt));
            const y4p = y_scale(project_y(boxspan_x[0] - box_buffer, boxspan_y[0] - box_buffer, z_value, d_project, y_0, tilt));
            //
    
            return `M ${x1p},${y1p} L ${x2p},${y2p} L ${x3p} ${y3p} L ${x4p} ${y4p} L ${x1p} ${y1p}`;
          }
    
    // Define necessary functions for nodes
    
    
      var node_radius = 4;
    
      if (nLayers < 5) {
    
        var y_scale = d3.scaleLinear()
          .range([50 + 30*(5-nLayers), heightmx-50 - 30*(5-nLayers)])
    
    
      } else {
    
        var y_scale = d3.scaleLinear()
          .range([50, heightmx-50])
      }
    
      y_scale.domain(d3.extent(graph.nodes, function(d) {return project_y(d.x, d.y, d.z, d_project, y_0, tilt); }));
    
    
      var x_scale = d3.scaleLinear()
        .range([150, widthmx-150])
    
    
      var box_buffer = 0.1;
      var nodes_extent = d3.extent(graph.nodes, function(d) {return project_x(d.x, d.y, d.z, d_project, x_0, tilt); });
      var extent_buffer = 0.01 
      x_scale.domain([nodes_extent[0] - extent_buffer, nodes_extent[1] + extent_buffer]);
      console.log([nodes_extent[0] - extent_buffer, nodes_extent[1]])
      // need to define extent first then subtract cause im not projecting rn
    
      console.log(d3.extent(graph.nodes, function(d) {return project_x(d.x, d.y, d.z, d_project, x_0, tilt); }))
    
      var node_colors = ["#58c3be","#7dbf6d","#d95f02", "#cc0062","#6f08a5"];
    
      if (nLayers < 6) {
        var node_colormap = d3.scaleOrdinal(node_colors).domain(d3.extent(graph.nodes, function(d) {return d.L2}));
        console.log(node_colormap(0))
        console.log(node_colormap(1))
        console.log(node_colormap(2))
        console.log(node_colormap(3))
        console.log(node_colormap(4))
        console.log(node_colors)
      } else {
        var node_colormap = d3.scaleOrdinal(d3.schemeAccent).domain(d3.extent(graph.nodes, function(d) {return d.L2}));
      }
      

      const L1_colormap = d3.scaleSequential(d3.interpolateSpectral).domain(d3.extent(graph.nodes, function(d) {return d.L1}));
      const edge_stroke_scale_g12 = d3.scaleLinear().domain([0.000098,0.0045]).range([0,2]);
      const edge_stroke_scale_g3 = d3.scaleLinear().domain([0.000055,0.086]).range([0,2]);
    

    
      d3.select("select")
        .on("change",function(d){
          var selected = d3.select("#color-dropdown").node().value;
          // color = {
          //   return d => color_scale();
          // }
    
          if (selected == "L1"){
            node.selectAll("circle")
              .attr("fill",function(d) {return L1_colormap(d[selected])})
              .style("mix-blend-mode", "none")
    
            d3.selectAll(".boxes")
              .attr("fill", "white")
              .attr("stroke", "white")
              .style("fill-opacity", 0.04)
              .style("stroke-opacity", 0.2)
    
            
          }
    
          if (selected == "L2"){
            node.selectAll("circle")
              .attr("fill", function(d) {return node_colormap(d[selected])});
    
            for (i=nLayers-1; i>-1; i--) {
              d3.selectAll(`#box${i}`)
                .attr("fill", function(d) {return node_colormap(graph.nodes.filter(function(n){return n.L2 == i;})[0].L2)})
                .attr("stroke", function(d) {return node_colormap(graph.nodes.filter(function(n){return n.L2 == i;})[0].L2)})
                .style("fill-opacity", 0.1)
                .style("stroke-opacity", 0.5)
            }
    
          }
          // console.log(d3.scaleLinear(graph.nodes[selected]));
        })
    
    // functions and info for edges
      function edge_line(d, x_0, y_0, d_project, tilt) {
            const source_node = graph.nodes.filter(function(n){return n.id == d.source;})[0]
            const target_node = graph.nodes.filter(function(n){return n.id == d.target;})[0]
            const y1 = y_scale(project_y(source_node.x, source_node.y, source_node.z, d_project, y_0, tilt));
            const x1 = x_scale(project_x(source_node.x, source_node.y, source_node.z, d_project, x_0, tilt));
            const y2 = y_scale(project_y(target_node.x, target_node.y, target_node.z, d_project, y_0, tilt));
            const x2 = x_scale(project_x(target_node.x, target_node.y, target_node.z, d_project, x_0, tilt));

            let d_path;
            if (edge_class(d) === "intra-layer") {

              // Then we need to calculate a quatratic bezier curve from node1 to node2
              // Our curve parameters will depend on the location of nodes1 and 2.
              const k = 20;
              let xm;
              let ym;

              if (x2 >= x1 && y2 >= y1) {

                xm = x1 + k
                ym = y1 + k
                
              } else if (x2 >= x1 && y2 < y1) {

                xm = x1 + k
                ym = y1 - k
                
              } else if (x2 < x1 && y2 >= y1) {

                xm = x1 - k
                ym = y1 + k

              } else if (x2 < x1 && y2 < y1) {

                xm = x1 - k
                ym = y1 - k

              }

              d_path = `M ${x1},${y1} 
                   Q ${xm},${ym},${x2},${y2}`;

            } else {

              d_path = `M ${x1},${y1} 
                   L ${x2},${y2}`;

            }
            return d_path;
          }
    
      function edge_class(d) {
        // Determine within layer or between layer edges
        node_source_L2 = graph.nodes.filter(function(n){return n.id == d.source;})[0].L2
        node_target_L2 = graph.nodes.filter(function(n){return n.id == d.target;})[0].L2
    
        if (node_source_L2 == node_target_L2) {
          edge_class_id = "intra-layer"
        } else {
          edge_class_id = "inter-layer"
        }
    
        return edge_class_id
      }
    
    
      // Draw!!
    
      var boxes = svgmx.append("g")
    
    
      // Can create an array of layers and then attach that data instead
      // of using a for loop
      for (i=nLayers-1; i>-1; i--) {
        boxes.append("path")
          .attr("d",box_path(boxspan_x, boxspan_y, box_buffer, i, x_0, y_0, d_project, tilt))
          .attr("class", "boxes")
          .attr("id", `box${i}`)
          .attr("fill", function(d) {return node_colormap(graph.nodes.filter(function(n){return n.L2 == i;})[0].L2)})
          .attr("stroke", function(d) {return node_colormap(graph.nodes.filter(function(n){return n.L2 == i;})[0].L2)})
        }
    
    
      var link = svgmx.append("g")
        .selectAll("line")
        .data(graph.links)
        .enter().append("path")
          .attr("d", function(d) {return edge_line(d,x_0, y_0, d_project, tilt)})
          .attr("class", edge_class)
          .attr("stroke-width", function(d) {
              let this_layer = graph.nodes.filter(x => {return x.id == d.source})[0].L2;
              let stroke_width;
              if (this_layer === 2) {

                stroke_width = edge_stroke_scale_g3(d.weight);
                
              } else {

                stroke_width = edge_stroke_scale_g12(d.weight);
                
              }

              return stroke_width});

      console.log(graph.nodes)
    
    
    
    
      var node = svgmx.append("g")
        .attr("class","nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
    
    
      node.append("circle")
        .attr("r", node_radius)
        .attr("cx", function(d) {return x_scale(project_x(d.x, d.y, d.z, d_project, x_0, tilt))})
        .attr("cy", function(d) {return y_scale(project_y(d.x, d.y, d.z, d_project, y_0, tilt))})
        .attr("fill", function(d) {console.log(d.L2); return node_colormap(d.L2)})
        .attr("class", "nodes_circles")
        .attr("id", function(d) {return d.id})
    
      node.append("circle")
        .attr("r", node_radius)
        .attr("cx", function(d) {return x_scale(project_x(d.x, d.y, d.z, d_project, x_0, tilt))})
        .attr("cy", function(d) {return y_scale(project_y(d.x, d.y, d.z, d_project, y_0, tilt))})
        .attr("class", "nodes_strokes")
        .attr("id", function(d) {return d.id})
    
    
    
    
    
    
    
    // buttons!
      d3.select('#mx-button').on('click', function() {
        var config = {
          filename: 'mx',
        }
        d3_save_svg.save(d3.select('#svg-mx').node(), config);

        // DOM.download(() => serialize(d3.select('#svg-mx')), "test", "Save as SVG")
      });
    
      d3.select('#sadj-button').on('click', function() {
        var config = {
          filename: 'sadj',
        }
        d3_save_svg.save(d3.select('#svg-sadj').node(), config);
      });
    
    
      var angle = 0;
      d3.select("#rotate-button").on("click", function() {
    
        angle += 90
        d3.select("#svg-mx")
          .style("transform", "rotate(" + angle + "deg)");
      })
    
      // Slider functions
      function changex0(selectedValuex, selectedValuey, selected_value_d, selected_tilt) {
        x_0 = Number(selectedValuex);
        y_0 = Number(selectedValuey);
        d_project = Number(selected_value_d);
        tilt = Number(selected_tilt);

        console.log(x_0,y_0,d_project,tilt)
    
        // Need to recalculate the x_scale domain each time
        extent_buffer = 0.01
        // x_scale.domain(d3.extent(graph.nodes, function(d) {return project_x(d.x, d.y, d.z, d_project, x_0, tilt); }));
        var nodes_extent1 = d3.extent(graph.nodes, function(d) {return project_x(d.x, d.y, d.z, d_project, x_0, tilt)});
        x_scale.domain([nodes_extent1[0] - extent_buffer, nodes_extent1[1] + extent_buffer]);
    
    
        // And y scale
        y_scale.domain(d3.extent(graph.nodes, function(d) {return project_y(d.x, d.y, d.z, d_project, y_0, tilt); }));
    
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
    
        d3.selectAll(".inter-layer")
          .attr("d", function(d) {return edge_line(d,x_0, y_0, d_project, tilt)});
    
        // Recalculate box postitions
        for (i=nLayers-1; i>-1; i--) {
          d3.selectAll(`#box${i}`)
            .attr("d",function(d) {return box_path(boxspan_x, boxspan_y, box_buffer, i, x_0, y_0, d_project, tilt)})
            // .attr("fill", function(d) {return node_colormap(graph.nodes.filter(function(n){return n.L2 == i;})[0].L2)})
            // .attr("stroke", function(d) { return node_colormap(graph.nodes.filter(function(n){return n.L2 == i;})[0].L2)})
        }
    
    
    
    
      }
    
      // Listen to the slider
      d3.select("#slider-x0").on("input", function(d){
        selectedValue = this.value
        x_0 = this.value
        changex0(x_0, y_0, d_project, tilt)
    
      })
    
    
      d3.select("#slider-tilt").on("input", function(d){
        //   selectedValue = this.value
        tilt = this.value
        changex0(x_0,y_0,d_project,tilt)
      })
    
    
    
    
      // Plotting the supra-adjacency matrix
        //
        function get_source_node(d) {
          source_node = graph.nodes.filter(function(n){return n.id == d.source;})[0];
          return source_node
        }
    
        function get_target_node(d) {
          target_node = graph.nodes.filter(function(n){return n.id == d.target;})[0];
          return target_node
        }
        //
        // // Edge weight colormap
        //
        var edge_colormap = d3.scaleSequential(d3.interpolateGreys).domain([d3.extent(graph.links, function(d) {return d.weight})[1], 0]);
        console.log([0, d3.extent(graph.links, function(d) {return d.weight})[1]])
        //
        var svgsadj= d3.select("#svg-sadj"),
            widthsadj = +svgsadj.attr("width"),
            heightsadj = +svgsadj.attr("height");
    
        svgsadj.attr("class", "svg_class")
    
        var y_scale2 = d3.scaleLinear()
          .range([20, heightsadj-20])
    
        y_scale2.domain(d3.extent(graph.nodes, function(d) {return d.id; }));
    
        var x_scale2 = d3.scaleLinear()
          .range([20, widthsadj-20]);
        x_scale2.domain(d3.extent(graph.nodes, function(d) {return d.id; }))
    
        var rect_r = (widthsadj-40)/graph.nodes.length;
    
    
        // draw box for heatmap
        svgsadj.append("rect")
          .attr("x", 20)
          .attr("y", 20)
          .attr("height", heightsadj-40 + rect_r)
          .attr("width", widthsadj-40+ rect_r)
          .style("stroke", "white")
          .style("stroke-width", 0.25)
    
    
    
    
        var boxes_lower = svgsadj.append("g")
          .selectAll("rect")
          .data(graph.links)
          .enter().append("rect")
            .attr("x", function(d) {return x_scale2(get_source_node(d).id)})
            .attr("y", function(d) {return y_scale2(get_target_node(d).id)})
            .style("fill", function(d) {return edge_colormap(d.weight)})
            .attr("height", rect_r)
            .attr("width", rect_r)
            .attr("class", "heatmap")
    
        var boxes_upper = svgsadj.append("g")
          .selectAll("rect")
          .data(graph.links)
          .enter().append("rect")
            .attr("x", function(d) {return x_scale2(get_target_node(d).id)})
            .attr("y", function(d) {return y_scale2(get_source_node(d).id)})
            .style("fill", function(d) {return edge_colormap(d.weight)})
            .attr("height", rect_r)
            .attr("width", rect_r)
            .attr("class", "heatmap")
    
    
    
        var lines_lower = svgsadj.append("g")
          .selectAll("line")
          .data(graph.nodes)
          .enter().append("line")
            .attr("x1", function(d) {return x_scale2(d.id)})
            .attr("y1", 5)
            .attr("x2", function(d) {return x_scale2(d.id)+rect_r})
            .attr("y2", 5)
            .style("stroke", function(d) {return node_colormap(d.L2)})
            .style("stroke-width", 8)
    
        var lines_upper = svgsadj.append("g")
          .selectAll("line")
          .data(graph.nodes)
          .enter().append("line")
            .attr("x1", 5)
            .attr("y1", function(d) {return y_scale2(d.id)})
            .attr("x2", 5)
            .attr("y2", function(d) {return y_scale2(d.id)+rect_r})
            .style("stroke", function(d) {return node_colormap(d.L2)})
            .style("stroke-width", 8)

        var col_highlight = svgsadj.append("rect")
          .attr("x",function() {return x_scale2(0)})
          .attr("y",function() {return y_scale2(0)})
          .attr("width", rect_r-1)
          .attr("height", y_scale2.range()[1] - y_scale2.range()[0] + rect_r)
          .style("opacity", 0)
          .attr("class", "highlights")

        var row_highlight = svgsadj.append("rect")
          .attr("x", function() {return x_scale2(0)})
          .attr("y", function() {return y_scale2(0)})
          .attr("width", x_scale2.range()[1] - x_scale2.range()[0] + rect_r)
          .attr("height", rect_r-1)
          .style("opacity", 0)
          .attr("class", "highlights")


        // Mouseover and Mouseouts
        function mouseover() {
          d3.select(this).selectAll("circle").transition()
            .duration(100)
            .attr("r",node_radius*2)

          // Perhaps highlight any edges from this node?

          // Now highlight on the adj matrix

          var selected_node_id = d3.select(this).select("circle").attr("id");
          console.log(selected_node_id)

          // Move col_highlight to appropriate spot and then show it!
          col_highlight
            .attr("x", function() {return x_scale2(selected_node_id)})
            .style("opacity", 1);

          row_highlight
            .attr("y", function() {return y_scale2(selected_node_id)})
            .style("opacity", 1);



        }

        function mouseout() {
          d3.select(this).selectAll("circle").transition()
            .duration(100)
            .attr("r",node_radius)

          col_highlight
            .style("opacity", 0);

          row_highlight
            .style("opacity", 0);
        }
    
    
    
    
    
    
    
    // });
    
    