import React, {Component} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import contextMenu from 'd3-context-menu';
import {Button, Pane} from 'evergreen-ui';

/**
 * ExampleComponent is an example component.
 * It takes a property, `label`, and
 * displays it.
 * It renders an input with the property `value`
 * which is editable by the user.
 */
export default class DashFloorPlan extends Component {
  componentDidMount() {
    this.drawChart();
  }

  drawChart() {
    const component = this;

    const width = component.props.width;
    const height = component.props.height;
    const image = component.props.image;
    var polygons = component.props.data;

    var dragging = false, drawing = false, startPoint;
    var svg = d3.select('body').append('svg')
        .attr('height', height)
        .attr('width', width);
    var myimage = svg.append('image')
        .attr("xlink:href", function() {return image})
        .attr('width',width)
        .attr('height',height);
    var points = [], g;

    var room_data = [
        {name: "WEST BEDROOM", data: 0.1},
        {name: "BATH", data: 0.2},
        {name: "EAST BEDROOM", data: 0.3},
        {name: "TERRACE", data: 0.4},
        {name: "KITCHEN", data: 0.5},
        {name: "FOYER", data: 0.6},
        {name: "LIVING ROOM", data: 0.7}
    ];

    var scale_x = d3.scaleLinear().range([0, width]).domain([0, 1]);
    var unscale_x = d3.scaleLinear().range([0, 1]).domain([0, width]);
    var scale_y = d3.scaleLinear().range([height, 0]).domain([1, 0]);
    var unscale_y = d3.scaleLinear().range([0, 1]).domain([0, height]);
    var scale_c = d3.scaleSequential(d3.interpolateSpectral);

    var drawing = false;

    for(var j = 0; j < polygons.length; j++) {
        makePolygon(polygons[j])
    }

    var polygon_menu = [
        {
            title: 'Delete',
            action: function(elm, d) {
                elm.parentNode.remove();
            }
        },
        {
            title: 'Duplicate',
            action: function(elm, d) {
                var these_points = [...elm.points];
                var w = Math.max(...these_points.map(p => p.x)) - Math.min(...these_points.map(p => p.x));
                var h = Math.max(...these_points.map(p => p.y)) - Math.min(...these_points.map(p => p.y));
                var dupe = {"points": these_points.map(function(p) { return {"x": (p.x+w/2)/width, "y": (p.y+h/2)/height} } ),
                            "color": Math.random()};
                makePolygon(dupe);
            }
        },
        // todo: return to edit mode after polygon built
        {
            title: 'Associate data',
            children: room_data.map(function(room, idx) {
                return {
                    title: room.name,
                    action: function(elm, d) {
                        if(idx < 0 || idx >= room_data.length) {
                            return;
                        }
                        elm.setAttribute("fill", scale_c(room_data[idx].data));
                        // todo: display data
                        console.log(elm, d);
                    }
                }
            })
        }
    ]

    var poly_start;
    function makePolygon(polydata) {
        var g = svg.append('g');
        g.selectAll("polygon")
            .data([polydata])
            .enter().append("polygon")
                .attr("points", function(poly) {
                    return poly.points.map(function(p) { return [scale_x(p.x),scale_y(p.y)].join(","); }).join(" ");
                })
                .attr("fill", function(poly) {
                    return scale_c(poly.color);
                })
                .attr("fill-opacity","0.5")
                .attr("data", polydata)
                .attr("color", polydata.color)
                // .on('click', function(d) { console.log(d.points); })
                .on("contextmenu", function(d) { contextMenu(polygon_menu)(this, d) } );
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
            // .on('click', function() {console.log(this.getAttribute('node-idx'));})
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
                    updatePolygons();
                })
            );
        g.selectAll('polygon')
            .call(d3.drag()
                .on("start", function(d){
                    var poly_points = d3.select(this.parentNode).select('polygon').node().points;
                    poly_start = {"x": d3.event.x, "y": d3.event.y,
                                    "points": [...poly_points].map(function(p) { return {x: p.x, y: p.y}})};
                    // var circles = d3.select(this.parentNode).selectAll('circle')._groups[0];
                })
                .on("drag", function(d) {
                    var delta = {"x": d3.event.x - poly_start.x, "y": d3.event.y - poly_start.y};
                    var points = d3.select(this.parentNode).select('polygon').node().points;
                    for(var i = 0; i < points.length; i++) {
                        points[i].x = poly_start.points[i].x + delta.x;
                        points[i].y = poly_start.points[i].y + delta.y;
                    }
                    var circles = d3.select(this.parentNode).selectAll('circle')._groups[0];
                    for(var i = 0; i < circles.length; i++) {
                        circles[i].setAttribute('cx', points[i].x);
                        circles[i].setAttribute('cy', points[i].y);
                    }
                })
                .on("end", function(d) { updatePolygons(); })
            );
        updatePolygons();
    }


    function makePolygonHandles(g, points) {
        g.selectAll('circle')
            .data(points)
            .enter().append("circle")
                .attr('cx', function(d) { return d.x; })
                .attr('cy', function(d) { return d.y; })
                .attr('r', 4)
                .attr('fill', 'white')
                .attr('stroke', '#000')
                .attr('is-handle', 'true')
                .attr('node-idx', function(d) { return d.i; })
                .style({cursor: 'pointer'})
        g.selectAll('circle')
            .on('click', function() {console.log(this.getAttribute('node-idx'));})
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
                    updatePolygons();
                })
            );
    }


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
            }
        });


    svg.on("contextmenu", function(d, elm, i) { contextMenu(canvas_menu)(d, elm, i) } );

    var canvas_menu = [
        {
            title: 'Test',
            action: function(d, elm, i) {
                console.log(d, elm, i);
            }
        }
    ]


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
        updatePolygons();
    });


    function closePolygon() {
        var this_poly = {"points": points.map(function(p, i) { return {"x": p[0]/width, "y": p[1]/height, "i": i} } ), "color": Math.random()};
        makePolygon(this_poly);
    }


    function updatePolygons() {
        const polygons = svg.selectAll('polygon')._groups[0];
        var data = [];
        for (var i = 0; i < polygons.length; i++) {
            var points = [];
            for (var j = 0; j < polygons[i].points.length; j++) {
                var p = polygons[i].points[j];
                points.push({"x": p.x/width, "y": p.y/height});
            }
            var this_poly = {"points": points, "color": polygons[i].getAttribute('color')};
            data.push(this_poly);
        }
        component.props.setProps({ data: data});
    }


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


    // setInterval(updatePolygons, 1000);  // update the data every 1000 ms


  }

    render() {
        return (
            <div id={this.props.id}>
                <Pane>
                    DashFloorPlan
                </Pane>
            </div>
        );
    }
}

DashFloorPlan.defaultProps = {
data: []
};

DashFloorPlan.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func,

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
    data: PropTypes.array,

    /**
     * Path to image file.
     */
    image: PropTypes.string.isRequired
};
