(function(window, $, _, d3) {
    'use strict';

    var category_array = [
        { name: "other", fullname: "Other" },
        { name: "disconnected", fullname: "Disconnected" }, 
        { name: "confusing", fullname: "Confusing" }, 
        { name: "video_quality", fullname: "Video Quality" }, 
        { name: "audio_quality", fullname: "Audio Quality" }, 
        { name: "happy", fullname: "Happy" } 
    ];
    
    var highlight_box = null;
    var percent_status = true;

    function darkenSeries(d) {
        d3.selectAll(".legend-item")
            .each(function (c, i) {
                if (c.name == d.name) {
                    d3.select(this).select("circle")
                        .transition()
                        .style("fill-opacity", 1)
                        .duration(200);
                } else {
                    d3.select(this).select("circle")
                        .transition()
                        .style("fill-opacity", 0.6)
                        .duration(200);
                }
            });
        d3.selectAll(".bar rect")
            .each(function (c, i) {
                if (c.name == d.name) {
                    d3.select(this)
                        .transition()
                        .style("fill-opacity", 1)
                        .duration(200);
                } else {
                    d3.select(this)
                        .transition()
                        .style("fill-opacity", 0.6)
                        .duration(200);
                }
            });           
    }
    
    function lightenSeries(d) {
        d3.selectAll(".bar rect")
            .each(function (c, i) {
                d3.select(this)
                    .transition()
                    .style("fill-opacity", 0.6)
                    .duration(200);
            });
        d3.selectAll(".legend-item").select("circle")
            .transition()
            .style("fill-opacity", 0.6)
            .duration(200)            
    }
    
    function showFeedback(d) {
        if (highlight_box !== null) {
            d3.select(highlight_box)
                .style("stroke-width", "1px")
                .style("stroke", "#333");
            $("#inputlist").empty();
            $("#listheader").empty();
        }
        if (highlight_box == this) {
            highlight_box = null;
            d3.select(this)
                .style("stroke-width", "1px")
                .style("stroke", "#333");
            $("#inputlist").empty();
            $("#listheader").empty();
        } else {
            highlight_box = this;
            d3.select(this)
                .style("stroke-width", "2px")
                .style("stroke", "#F00");
            var title = d.fullname + " category feedback for week of " + d.week;
            $("#listheader").text(title);
            _.forEach(d.verbatims, function (n, t) {
                var text = (n > 1)?t + " (x" + n + ")":t;
                d3.select("#inputlist")
                    .append("li").text(text);
            });
        }
    }
    
    $("#spacer").height($(".chart-header").height() + 40);
    
    d3.json("https://input.mozilla.org/api/v1/feedback/?date_delta=70d&products=Loop&max=10000",function (error, json) {
        //d3.json("hellofeedback.json",function (error, json) {
        var timeformat = d3.time.format("%Y-%0m-%0dT%H:%M:%S");
        var displayformat = d3.time.format("%-m/%-d");
        var max_day = d3.time.format("%w")(timeformat.parse(json.results[0].created));
        console.log(max_day); // TODO: make weeks dynamic
        var responses = _(json.results)
            .map(function (i) {
                var datetime = timeformat.parse(i.created);
                var category = i.happy ? "happy" : (i.category == "" ? "other" : i.category); // TODO: not hardcode categories
                return { 
                    "datetime": datetime, 
                    "category": category, 
                    "text": i.description
                };
            })
            .groupBy(function (item) { return timeformat(d3.time.week.floor(item.datetime)); })
            .map(function (value, key) { 
                var y = 0;
                var categories = _(value)
                    .groupBy("category")
                    .map( function (v,k) { 
                        var i = _.findIndex(category_array, {"name": k});
                        var verb = _.countBy(v, "text");
                        return { 
                            "name": k, 
                            "verbatims": verb,
                            "category_id": i,
                            "fullname": category_array[i].fullname,
                            "value": v.length,
                            "week": displayformat(timeformat.parse(key))
                        };
                    })
                    .sortBy("category_id")
                    .forEach( function (i) {
                        i.y0 = y;
                        y += i.value;
                        i.y1 = y;
                    })
                    .forEach( function (i) {
                        i.p0 = i.y0 / y * 100;
                        i.p1 = i.y1 / y * 100;
                        i.p = i.value / y * 100;
                    });
                return { 
                    "week": key, 
                    "name": displayformat(timeformat.parse(key)),
                    "categories": categories.value(), 
                    "total": y
                };
            })
            .sortBy("week")
            .filter( function (i) { return i.total > 50; })
            .value();
        console.log(responses);
        
        // HORRAY CHART
        
        var margin = {
            top: 20,
            right: 100,
            bottom: 40,
            left: 30
        },
        width = null,
        height = null,
        aspectRatio = 1.3, // not even setable, I'm lazy yo #TODO
        fillColor = "#c13832",
        y_minValue = 0,
        y_maxValue = 100, // default height
        xScale = d3.scale.ordinal(),
        yScale = d3.scale.linear(),
        xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 0),
        yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10),
        xValue = function(d, i) {
            return i;
        },
        yValue = function(d) {
            return d;
        },
        yLabel = "Percentage",
        xLabel = "Week of",
        xTooltip = function(d) {
            return null;
        },
        barTooltip = function(d) {
            return null;
        },
        colorArray = [
            'rgb(120,120,120)', // other
            'rgb(231,60,65)', // disconnected
            'rgb(117,112,179)', // confusing
            'rgb(217,95,2)', // video
            'rgb(230,201,2)', // audio
            'rgb(102,166,30)', // happy
        ];
    
        var selection = d3.select("#chart");
        var $selection = $(selection[0]);
        $selection.empty();
        width = $selection.width();
        height = width / aspectRatio;
        if (height > $(window).height() - $(".chart-header").height() - $(".chart-header").offset().top - 40) {
            height = Math.max($(window).height() - $(".chart-header").height() - $(".chart-header").offset().top - 40, 400);
            width = height * aspectRatio;
        }
        xScale.domain(responses.map(function(d) {
            return d.name;
        }))
            .rangeRoundBands([margin.left, width - margin.right], 0.1, 0.3);
        
        yScale.domain([y_minValue, y_maxValue])
            .range([height - margin.bottom, margin.top]);
        
        var colorScale = d3.scale.ordinal().range(colorArray)
            .domain(_.pluck(category_array, "name"));
        
        var svg = selection.append('svg');
        var g = svg.append('g');
        g.append("g").attr("class", "x axis");
        g.append("g").attr("class", "y axis");
        g.append("g").attr("class", "bars");
        
        svg.attr("width", width)
            .attr("height", height);
        
        g.select(".x.axis")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(xAxis)
            .append("text")
            .style("text-anchor", "middle")
            .text(xLabel)
            .classed("axis-label", true)
            .attr("y", 5)
            .attr("transform", "translate(" + ((margin.left + width - margin.right) / 2) + "," + 30 + ")");
        
        g.select(".y.axis")
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(yAxis)
            .append("text")
            .classed("axis-label", true)
            .attr("transform", "rotate(-90) translate(" + -margin.top + ",0)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(yLabel);
        
        var bar = g.select(".bars")
            .selectAll(".bar")
            .data(responses)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) {
                return "translate(" + xScale(d.name) + ",0)";
            });
        bar.selectAll(".box")
            .data(function (d) { return d.categories; })
            .enter()
            .append("rect")
            .attr("width", xScale.rangeBand())
            .attr("y", function(d) {
                return yScale(d.p1);
            })
            .attr("height", function(d) {
                return yScale(d.p0) - yScale(d.p1);
            })
            .style("stroke", "#333")
            .style("stroke-width", "1px")
            .style("fill", function (d) { return colorScale(d.name); })
            .style("fill-opacity", 0.6)
            .on("mouseenter", darkenSeries)
            .on("mouseleave", lightenSeries)
            .on("click", showFeedback)
            .append("svg:title")
            .text(function(d) {
                return "Category: " + d.fullname + " " + d.value 
                    + " users (" + Math.round(d.p) + "%)";
            });
        
        g.selectAll(".axis path")
            .style("fill", "none")
            .style("stroke", "#000");
        
        g.selectAll(".y.axis line")
            .style("fill", "none")
            .style("stroke", "#000");
        
        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (width - margin.right + 5) + ", " + (margin.top + 10) + ")");
        
        var legend_item = legend.selectAll(".legend-item")
            .data(category_array.reverse())
            .enter()
            .append("g")
            .attr("class", "legend-item");
        legend_item.append("text")
            .text(function(d) {
                return d.fullname;
            })
            .attr("dy", function(d, i) {
                return i * 2 + "em";
            })
            .attr("dx", "1em");
        
        legend_item.append("circle")
            .attr("cy", function(d, i) {
                return (i * 2 - 0.25) + "em";
            })
            .attr("cx", 0)
            .attr("r", "0.4em")
            .style("fill", function(d) {
                return colorScale(d.name);
            })
            .style("fill-opacity", 0.6)
            .style("stroke", "#999")
            .style("stroke-width", "1px");
        
        legend_item.on("mouseenter", darkenSeries).on("mouseleave", lightenSeries);
    });
    
    // function togglePercent () {
    //     if (percent_status) {
    //         d3.selectAll(".bar rect")
    //             .transition()
    //             .attr("y", function(d) {
    //                 return yScale(d.y1);
    //             })
    //             .attr("height", function(d) {
    //                 return yScale(d.y0) - yScale(d.y1);
    //             })
    //             .duration(500);
    //         percent_status = false;
    //     } else {
    //         d3.selectAll(".bar rect")
    //             .transition()
    //             .attr("y", function(d) {
    //                 return yScale(d.p1);
    //             })
    //             .attr("height", function(d) {
    //                 return yScale(d.p0) - yScale(d.p1);
    //             })
    //             .duration(500);
    //         percent_status = true;
    //     }
    // }
}(window, jQuery, _, d3));
