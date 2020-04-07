import React, {Component} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import {Button, Pane, Popover, Position, Menu, Badge, Select, option, toaster} from 'evergreen-ui';


export default class DashFloorPlan extends Component {
  componentDidMount() {
    this.svg = d3.select('#floorplan-svg');
    this.poly_start = {};
    this.dragging = false;
    this.drawing = false;
    this.drawChart();
  }

  componentDidUpdate() {
      if ( this.props.update ) {
        this.redrawPolygons();
        this.props.setProps({ update: false});
      }
  }

  drawChart() {
    const component = this;

    const width = component.props.width;
    const height = component.props.height;
    const image = component.props.image;
    const shapes = component.props.shapes;
    const room_data = component.props.data;

    var startPoint;
    var svg = component.svg;
    var points = [], g;

    var drawing = component.drawing;
    var dragging = component.dragging

    component.redrawPolygons();

    svg.on('dblclick', function(){
        if(svg.select('g.drawPoly').empty()) g = svg.append('g').attr('class', 'drawPoly');
        startPoint = [d3.mouse(this)[0], d3.mouse(this)[1]];
        drawing = true;
        points.push(d3.mouse(this));
        for(var i = 0; i < points.length; i++) {
            g.append('circle')
            .attr('cx', points[i][0])
            .attr('cy', points[i][1])
            .attr('r', 4)
            .attr('fill', 'yellow')
            .attr('stroke', '#000')
            .attr('is-handle', 'true')
            .style({cursor: 'pointer'});
        }
    })


    d3.select("body")
        .on("keydown", function() {
            if(d3.event.keyCode == 27) {
                exitDrawing();
                component.props.setProps({ selection: null});
                component.updateOpacity();
            }
            if(d3.event.keyCode == 46 || d3.event.keyCode == 8) {
                component.deletePolygon();
                component.props.setProps({ selection: null});
                component.updateOpacity();
            }
            if(d3.event.keyCode == 67 && d3.event.ctrlKey) {
                component.duplicatePolygon();
                component.updateOpacity();
            }
        });


    function exitDrawing() {
        svg.select('g.drawPoly').remove();
        points = [];
        drawing = false;
    }


    svg.on('mouseup', function(){
        if(dragging) return;
        if(!drawing) return;
        startPoint = [d3.mouse(this)[0], d3.mouse(this)[1]];
        if(svg.select('g.drawPoly').empty()) g = svg.append('g').attr('class', 'drawPoly');
        if(d3.event.target.hasAttribute('is-handle')) {
            closePolygon();
            exitDrawing();
            return;
        };
        points.push(d3.mouse(this));
        g.select('polyline').remove();
        var polyline = g.append('polyline').attr('points', points)
                        .style('fill', 'none')
                        .attr('stroke', '#000');
        for(var i = 0; i < points.length; i++) {
            g.append('circle')
            .attr('cx', points[i][0])
            .attr('cy', points[i][1])
            .attr('r', 4)
            .attr('fill', 'yellow')
            .attr('stroke', '#000')
            .attr('is-handle', 'true')
            .style({cursor: 'pointer'});
        }
        component.updatePolygonData();
        // updatePolygons();
    });


    function closePolygon() {
        var this_poly = {"name": null,
                         "points": points.map(function(p, i) { return {"x": p[0]/width, "y": p[1]/height, "i": i} } ),
                        //  "color": Math.random(),
                         };
        component.makePolygon(this_poly);
    }


    // function updatePolygons() {
    //     const polygons = svg.selectAll('polygon')._groups[0];
    //     var shapes = [];
    //     for (var i = 0; i < polygons.length; i++) {
    //         var points = [];
    //         for (var j = 0; j < polygons[i].points.length; j++) {
    //             var p = polygons[i].points[j];
    //             points.push({"x": p.x/width, "y": p.y/height});
    //         }
    //         var this_poly = {"name": polygons[i].getAttribute('name'),
    //                         "points": points,
    //                         //  "color": parseFloat(polygons[i].getAttribute('color')),
    //                         };
    //         shapes.push(this_poly);
    //     }
    //     component.props.setProps({ shapes: shapes});
    // }

    svg.on('mousemove', function() {
        if(!drawing) return;
        var g = d3.select('g.drawPoly');
        g.select('line').remove();
        var line = g.append('line')
                    .attr('x1', startPoint[0])
                    .attr('y1', startPoint[1])
                    .attr('x2', d3.mouse(this)[0] + 2)
                    .attr('y2', d3.mouse(this)[1])
                    .attr('stroke', '#53DBF3')
                    .attr('stroke-width', 1);
    })

  }


  makePolygon(polydata) {
      const component = this;
      const width = component.props.width;
      const height = component.props.height;
      const image = component.props.image;
      const shapes = component.props.shapes;
      const room_data = component.props.data;
    var scale_x = d3.scaleLinear().range([0, width]).domain([0, 1]);
    var scale_y = d3.scaleLinear().range([height, 0]).domain([1, 0]);
    var scale_c = d3.scaleSequential(d3.interpolateSpectral);
    var svg = component.svg;
    var g = svg.append('g');
    g.selectAll("polygon")
        .data([polydata])
        .enter().append("polygon")
            .attr("points", function(poly) {
                return poly.points.map(function(p) { return [scale_x(p.x),scale_y(p.y)].join(","); }).join(" ");
            })
            .attr("color", function(poly) {
                var color = room_data[polydata.name];
                if(typeof(color) == 'undefined') {
                    return null;
                } else {
                    return scale_c(color);
                }
            })
            .attr("fill", function(poly) {
                var color = room_data[polydata.name];
                if(typeof(color) == 'undefined') {
                    return null;
                } else {
                    return scale_c(color);
                }
            })
            .attr("fill-opacity","0.33")
            .attr("data", polydata)
            .attr("name", polydata.name)
            .attr("idx", svg.selectAll('polygon')._groups[0].length - 1)
            .on('click', function(d) {
                component.props.setProps({ selection: this.getAttribute("idx")});
                component.updateOpacity();
            })
    for(var i = 0; i < polydata.points.length; i++) {
        g.append('circle')
            .attr('cx', scale_x(polydata.points[i].x))
            .attr('cy', scale_y(polydata.points[i].y))
            .attr('r', 4)
            .attr('fill', 'white')
            .attr('stroke', '#000')
            .attr('is-handle', 'true')
            .attr('node-idx', i)
            .style({cursor: 'pointer'})
    }
    g.selectAll('circle')
        .call(d3.drag()
            .on("start", function(){
                dragging = true;
            })
            .on("drag", function(d) {
                d3.select(this)
                    .attr("cx", d3.event.x)
                    .attr("cy", d3.event.y);
                var points = d3.select(this.parentNode).select('polygon').node().points;
                var idx = this.getAttribute('node-idx');
                points[idx].x = d3.event.x;
                points[idx].y = d3.event.y;
            })
            .on("end", function(){
                dragging = false;
                component.updatePolygonData();
    // updatePolygons();
            })
        );
    g.selectAll('polygon')
        .call(d3.drag()
            .on("start", function(d){
                var poly_points = d3.select(this.parentNode).select('polygon').node().points;
                component.poly_start = {"x": d3.event.x, "y": d3.event.y,
                                "points": [...poly_points].map(function(p) { return {x: p.x, y: p.y}})};
                // var circles = d3.select(this.parentNode).selectAll('circle')._groups[0];
                component.props.setProps({ selection: this.getAttribute("idx")});
                component.updateOpacity();
            })
            .on("drag", function(d) {
                var delta = {"x": d3.event.x - component.poly_start.x, "y": d3.event.y - component.poly_start.y};
                var points = d3.select(this.parentNode).select('polygon').node().points;
                for(var i = 0; i < points.length; i++) {
                    points[i].x = component.poly_start.points[i].x + delta.x;
                    points[i].y = component.poly_start.points[i].y + delta.y;
                }
                var circles = d3.select(this.parentNode).selectAll('circle')._groups[0];
                for(var i = 0; i < circles.length; i++) {
                    circles[i].setAttribute('cx', points[i].x);
                    circles[i].setAttribute('cy', points[i].y);
                }
            })
            .on("end", function(d) {
                component.updatePolygonData();
    // updatePolygons();
            })
        );
        component.updatePolygonData();
        // updatePolygons();
}

    redrawPolygons() {
        const component = this;
        // clear existing polygons
        const polygons = d3.selectAll('polygon')._groups[0];
        for (var i = 0; i < polygons.length; i++) {
            polygons[i].parentNode.remove();
        }
        // draw new data state
        const shapes = component.props.shapes;
        for(var j = 0; j < shapes.length; j++) {
            component.makePolygon(shapes[j])
        }
        toaster.notify('Updated polygons.', {id: 'draw-update'})
    }


  updatePolygonData() {
    const component = this;
    const width = component.props.width;
    const height = component.props.height;
    const svg = component.svg; // d3.select('svg')._groups[0];
    const polygons = d3.selectAll('polygon')._groups[0];
    var shapes = [];
    for (var i = 0; i < polygons.length; i++) {
        var points = [];
        for (var j = 0; j < polygons[i].points.length; j++) {
            var p = polygons[i].points[j];
            points.push({"x": p.x/width, "y": p.y/height});
        }
        var this_poly = {"name": polygons[i].getAttribute('name'),
                        "points": points,
                        //  "color": parseFloat(polygons[i].getAttribute('color')),
                        };
        shapes.push(this_poly);
    }
    component.props.setProps({ shapes: shapes});
}


  updatePolygonNames(event) {
    const component = this;
    var scale_c = d3.scaleSequential(d3.interpolateSpectral);
    // update the polygons in svg
    const svg = d3.select('svg')._groups[0];
    const polygons = d3.selectAll('polygon')._groups[0];
    const idx = parseInt(component.props.selection);
    const p = polygons[idx];
    p.setAttribute("name", event.target.value);
    p.setAttribute("color", scale_c(component.props.data[event.target.value]));
    p.setAttribute("fill", scale_c(component.props.data[event.target.value]));
    // also update the data in props
    component.updatePolygonData();
  }


  updatePolygonIdx() {
    const component = this;
    // update the polygons in svg
    const polygons = d3.selectAll('polygon')._groups[0];
    for ( var i = 0; i < polygons.length; i++ ) {
        polygons[i].setAttribute("idx", i);
    }
    // also update the data in props
    component.updatePolygonData();
  }


  deletePolygon() {
    const component = this;
    const polygons = d3.selectAll('polygon')._groups[0];
    const idx = component.props.selection;
    const p = polygons[parseInt(idx)];
    if (typeof(p) !== 'undefined' ) {
        p.parentNode.remove();
        // update indices
        component.updatePolygonIdx();
    }
  }


  duplicatePolygon() {
    const component = this;
    const height = component.props.height;
    const width = component.props.width;
    const polygons = d3.selectAll('polygon')._groups[0];
    const idx = component.props.selection;
    const p = polygons[parseInt(idx)];
    if (typeof(p) !== 'undefined' ) {
        var these_points = [...p.points];
        var w = Math.max(...these_points.map(p => p.x)) - Math.min(...these_points.map(p => p.x));
        var h = Math.max(...these_points.map(p => p.y)) - Math.min(...these_points.map(p => p.y));
        var dupe = {"points": these_points.map(function(p) { return {"x": (p.x+w/2)/width, "y": (p.y+h/2)/height} } ),
                    // "color": elm.getAttribute('color'),
                    "name": null};
        component.makePolygon(dupe);
    }
    component.updatePolygonIdx();
  }


  updateOpacity() {
    const component = this;
    const polygons = d3.selectAll('polygon')._groups[0];
    for ( var i = 0; i < polygons.length; i++ ) {
        var sel = parseInt(component.props.selection) == i;
        var op = 0.33 * (1 + sel);
        polygons[i].setAttribute("fill-opacity", op);
    }
  }


    render() {
        const component = this;
        var rooms = this.props.shapes.map( it => it.name );        
        var room_names = Object.entries(this.props.data).map( ([key, value]) => key);
        var room_badges = room_names.map(function(key) {
                                if ( rooms.includes(key) ) {
                                    return <Badge margin={8} color='green'>{key}</Badge>
                                } else {
                                    return <Badge margin={8} color='red'>{key}</Badge>
                                }
                            });

        
        var shape = component.props.shapes[parseInt(component.props.selection)];
        var shape_name = null;
        if (typeof(shape) !== 'undefined') {
            shape_name = shape.name;
        }
        room_names.unshift(null); // allow for empty option
        // room options are all the room names provided
        var room_options = room_names.map(function(key) {
            if ( key == null || !rooms.includes(key) || key == shape_name ) {
                if ( key == shape_name ) {
                    return <option value={key} selected>{key}</option>
                } else {
                    return <option value={key}>{key}</option>
                }
            }
        });

        return (
            <div id={this.props.id}>
                <Pane>
                    Rooms: {room_badges}
                </Pane>
                <Pane>
                    Selection:
        <Badge marginLeft={8} marginRight={16}>{this.props.selection}</Badge>
            Name:
        <Select onChange={event => this.updatePolygonNames(event)} marginLeft={8} marginRight={16}>
            {room_options}
        </Select>
                <Popover
                    position={Position.BOTTOM_LEFT}
                    content={
                        <Menu>
                        <Menu.Group>
                            <Menu.Item
                            onSelect={() => component.duplicatePolygon()}
                            >
                            Duplicate
                            </Menu.Item>
                            <Menu.Item
                            onSelect={() => component.deletePolygon()}
                            intent="danger"
                            >
                            Delete
                            </Menu.Item>
                        </Menu.Group>
                        </Menu>
                    }
                    >
                    <Button marginRight={16}>Menu</Button>
                </Popover>
                {/* <Button marginRight={16} onClick={() => component.redrawPolygons()}>Redraw polygons</Button> */}
                </Pane>
                <svg height={this.props.height} width={this.props.width} id={'floorplan-svg'}>
                    <image href={this.props.image} x="0" y="0" height={this.props.height} width={this.props.width}/>
                </svg>
            </div>
        );
    }
}


DashFloorPlan.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string.isRequired,

    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func,

    /**
     * Currently selected polygon.
     */
    selection: PropTypes.any,

    /**
     * Flag to trigger update from Dash.
     */
    update: PropTypes.bool.isRequired,

    /**
     * Height of the svg panel in pixels.
     */
    height: PropTypes.number.isRequired,

    /**
     * Width of the svg panel in pixels.
     */
    width: PropTypes.number.isRequired,

    /**
     * Array of polygons to display over image.
     */
    shapes: PropTypes.array.isRequired,

    /**
     * Dict of data to associated with the polygons.
     */
    data: PropTypes.object.isRequired,

    /**
     * Path to image file.
     */
    image: PropTypes.string.isRequired
};
