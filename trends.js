(function(window, _, d3) {
    'use strict';

    var inputUrl = "https://input.mozilla.org/api/v1/feedback/?happy=0&products=Firefox for Android&locales=en-US&max=10000";

    var stopWords = [
        'able',
        'about',
        'above',
        'across',
        'after',
        'afterwards',
        'again',
        'against',
        'all',
        'almost',
        'alone',
        'along',
        'already',
        'also',
        'although',
        'always',
        'am',
        'among',
        'amongst',
        'amoungst',
        'amount',
        'an',
        'and',
        'another',
        'any',
        'anyhow',
        'anyone',
        'anything',
        'anyway',
        'anywhere',
        'are',
        'around',
        'as',
        'at',
        'back',
        'be',
        'became',
        'because',
        'become',
        'becomes',
        'becoming',
        'been',
        'before',
        'beforehand',
        'behind',
        'being',
        'below',
        'beside',
        'besides',
        'between',
        'beyond',
        'bill',
        'both',
        'bottom',
        'browser',
        'but',
        'by',
        'call',
        'can',
        'can\'t',
        'cannot',
        'co',
        'computer',
        'con',
        'could',
        'couldnt',
        'cry',
        'de',
        'describe',
        'detail',
        'do',
        'does',
        'doesn\'t',
        'don\'t',
        'done',
        'dont',
        'down',
        'due',
        'during',
        'each',
        'eg',
        'eight',
        'either',
        'eleven',
        'else',
        'elsewhere',
        'empty',
        'enough',
        'etc',
        'even',
        'ever',
        'every',
        'everyone',
        'everything',
        'everywhere',
        'except',
        'few',
        'fifteen',
        'fify',
        'fill',
        'find',
        'fire',
        'firefox',
        'first',
        'five',
        'fix',
        'for',
        'former',
        'formerly',
        'forty',
        'found',
        'four',
        'from',
        'front',
        'full',
        'further',
        'get',
        'give',
        'go',
        'had',
        'has',
        'hasnt',
        'have',
        'he',
        'hello',
        'hence',
        'her',
        'here',
        'hereafter',
        'hereby',
        'herein',
        'hereupon',
        'hers',
        'herse',
        'hi',
        'him',
        'himse',
        'his',
        'how',
        'however',
        'hundred',
        'i\'m',
        'ie',
        'if',
        'in',
        'inc',
        'indeed',
        'interest',
        'into',
        'is',
        'it',
        'it\'s',
        'its',
        'itse',
        'just',
        'keep',
        'keeps',
        'last',
        'latter',
        'latterly',
        'least',
        'less',
        'like',
        'ltd',
        'made',
        'make',
        'many',
        'may',
        'me',
        'meanwhile',
        'might',
        'mill',
        'mine',
        'more',
        'moreover',
        'most',
        'mostly',
        'move',
        'much',
        'must',
        'my',
        'myse',
        'name',
        'namely',
        'neither',
        'never',
        'nevertheless',
        'next',
        'nine',
        'no',
        'nobody',
        'none',
        'noone',
        'nor',
        'not',
        'nothing',
        'now',
        'nowhere',
        'of',
        'off',
        'often',
        'on',
        'once',
        'one',
        'only',
        'onto',
        'or',
        'other',
        'others',
        'otherwise',
        'our',
        'ours',
        'ourselves',
        'out',
        'over',
        'own',
        'page',
        'part',
        'per',
        'perhaps',
        'please',
        'problem',
        'put',
        'rather',
        're',
        'same',
        'see',
        'seem',
        'seemed',
        'seeming',
        'seems',
        'serious',
        'several',
        'she',
        'should',
        'show',
        'side',
        'since',
        'sincere',
        'site',
        'six',
        'sixty',
        'so',
        'some',
        'somehow',
        'someone',
        'something',
        'sometime',
        'sometimes',
        'somewhere',
        'still',
        'such',
        'system',
        'take',
        'ten',
        'than',
        'that',
        'the',
        'their',
        'them',
        'themselves',
        'then',
        'thence',
        'there',
        'thereafter',
        'thereby',
        'therefore',
        'therein',
        'thereupon',
        'these',
        'they',
        'thick',
        'thin',
        'third',
        'this',
        'those',
        'though',
        'three',
        'through',
        'throughout',
        'thru',
        'thus',
        'time',
        'times',
        'to',
        'together',
        'too',
        'top',
        'toward',
        'towards',
        'twelve',
        'twenty',
        'two',
        'un',
        'under',
        'until',
        'up',
        'upon',
        'us',
        'use',
        'using',
        'very',
        'via',
        'want',
        'was',
        'way',
        'we',
        'web',
        'well',
        'were',
        'what',
        'whatever',
        'when',
        'whence',
        'whenever',
        'where',
        'whereafter',
        'whereas',
        'whereby',
        'wherein',
        'whereupon',
        'wherever',
        'whether',
        'which',
        'while',
        'whither',
        'who',
        'whoever',
        'whole',
        'whom',
        'whose',
        'why',
        'will',
        'with',
        'within',
        'without',
        'work',
        'would',
        'yet',
        'you',
        'you\'re',
        'your',
        'yours',
        'yourself',
        'yourselves'
    ];

    var synonyms = {
        'crashes': 'crash',
        'crashing': 'crash',
        'tabs': 'tab',
        'videos': 'video'
    };

    var highlightBox = null;

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
                        .style("fill-opacity", 0.4)
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
                        .style("fill-opacity", 0.4)
                        .duration(200);
                }
            });
    }

    function lightenSeries(d) {
        d3.selectAll(".bar rect")
            .each(function (c, i) {
                d3.select(this)
                    .transition()
                    .style("fill-opacity", 0.4)
                    .duration(200);
            });

        d3.selectAll(".legend-item").select("circle")
            .transition()
            .style("fill-opacity", 0.4)
            .duration(200);
    }

    function showFeedback(selected, d) {
        if (highlightBox !== null) {
            d3.select(highlightBox)
                .style("stroke-width", "1px")
                .style("stroke", "#333");
            d3.select('#inputlist').html('');
            d3.select('#listheader').html('');
        }

        if (highlightBox === selected) {
            highlightBox = null;
            d3.select(selected)
                .style("stroke-width", "1px")
                .style("stroke", "#333");
            d3.select('#inputlist').html('');
            d3.select('#listheader').html('');
        } else {
            highlightBox = selected;
            d3.select(selected)
                .style("stroke-width", "2px")
                .style("stroke", "#F00");
            var title = "'" + d.fullname + "' feedback for week of " + d.week + ":";
            d3.select('#listheader').text(title);
            _.forEach(d.verbatims, function (count, t) {
                var text = (count > 1) ? t + " (x" + count + ")" : t;
                d3.select("#inputlist")
                    .append("li").text(text);
            });
        }
    }

    function getWidth(selection) {
        return parseInt(selection.style('width'), 10);
    }

    function getHeight(selection) {
        return parseInt(selection.style('height'), 10);
    }

    function getTop(selection) {
        return selection.node().getBoundingClientRect().top;
    }

    function tokenize(text) {
        var tokens;

        // split the text into tokens
        tokens = text.split(/[\s\?\!,~\(\)\-\\;\*\$\^\|\"<>{}]+/);

        tokens = _(tokens)
            .map(function (token) {
                // Lowercase, trim and apply synonyms
                token = token.toLocaleLowerCase().trim();
                if (synonyms.hasOwnProperty(token)) {
                    token = synonyms[token];
                }
                return token;
            })
            .filter(function (token) {
                // Limit the length, require at least one letter and
                // make sure it's not a stop word.
                return (token.length > 1
                        && token.length < 15
                        && token.search(/[a-z]/) != -1
                        && !_.contains(stopWords, token)
                       );
            })
            .compact()
            .uniq()
            .value();

        return tokens;
    }

    d3.select('#spacer').style('height', (getHeight(d3.select('.chart-header')) + 40) + 'px');

    d3.json(inputUrl, function (error, json) {
        var timeformat = d3.time.format("%Y-%0m-%0dT%H:%M:%S");
        var displayformat = d3.time.format("%-m/%-d");
        var max_day = d3.time.format("%w")(timeformat.parse(json.results[0].created));

        var responses = json.results;

        // Go through and tokenize the description for all the
        // responses.
        responses.forEach(function(item) {
            item.description_tokens = tokenize(item.description);
        });

        responses = _(responses)
            .map(function (item) {
                // Simplify the response structure and throw away the
                // stuff we don't need
                return {
                    "datetime": timeformat.parse(item.created),
                    "version": item.version,
                    "description": item.description,
                    "tokens": item.description_tokens,
                    "text": item.description
                };
            })
            .groupBy(function (item) {
                // Break responses into groups by week
                return timeformat(d3.time.week.floor(item.datetime));
            })
            .map(function (responses, week) {
                // Figure out the important words for each week, figure
                // out counts and associated responses and y values
                var y = 0;
                var wordsThisWeek = _(responses)
                    .map(function(item) {
                        return item.tokens;
                    })
                    .flatten()
                    .countBy()
                    .value();

                // Note: When using lodash map here, it would somehow
                // iterate over undefines. I couldn't figure out why,
                // so I just wrote the equivalent forEach and it works
                // fine now.
                var newWords = [];
                Object.keys(wordsThisWeek).forEach(function (word) {
                    newWords.push({
                        'name': word,
                        'verbatims': [],
                        'fullname': word,
                        'week': displayformat(timeformat.parse(week)),
                        'value': wordsThisWeek[word]
                    });
                });
                wordsThisWeek = newWords;

                wordsThisWeek = _(wordsThisWeek)
                    .sortBy('value')
                    .last(10)
                    .sortBy('name')
                    .forEach(function (item) {
                        item.y0 = y;
                        y += item.value;
                        item.y1 = y;

                        item.p0 = item.y0;
                        item.p1 = item.y1;
                        item.p = item.value;

                        // figure out which verbatims go to this word
                        item.verbatims = _(responses)
                            .filter(function (resp) { return _.contains(resp.tokens, item.name); })
                            .map(function (resp) { return resp.description; })
                            .countBy()
                            .value();
                    })
                    .value();

                return {
                    'week': week,
                    'name': displayformat(timeformat.parse(week)),
                    'words': wordsThisWeek,
                    'responses': responses,
                    'total': y
                };
            })
            .sortBy('week')
            .value();

        // When we pull data from Input, we pull 21 days. However,
        // that's days and not weeks, so there's a granularity mismatch
        // between how we pull data and how we display it. In order to deal
        // with that, we check to see if today is sunday and if not, we
        // drop the oldest week in the array because it's only partial.
        if ((new Date()).getDay() !== 0) {
            responses.shift();
        }

        // The current week is partial, so we mark it (partial).
        responses[responses.length-1].name = responses[responses.length-1].name + ' (partial)';

        var categoryArray = _(responses)
            .map(function (week) {
                return _(week.words)
                    .map(function (word) {
                        return {
                            'name': word.name,
                            'fullname': word.fullname
                        };
                    })
                    .value();
            })
            .flatten()
            .uniq(function (item) {
                return item.name;
            })
            .sortBy('name')
            .value();

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
        y_maxValue = d3.max(responses, function (item) { return item.total; }),
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
        yLabel = "Response count",
        xLabel = "Week of",
        xTooltip = function(d) {
            return null;
        },
        barTooltip = function(d) {
            return null;
        };

        var selection = d3.select("#chart");
        var chartHeader = d3.select('.chart-header');

        // Remove everything under the chart node.
        selection.html("");

        width = getWidth(selection);
        height = width / aspectRatio;
        if (height > window.innerHeight - getHeight(chartHeader) - getTop(chartHeader) - 40) {
            height = Math.max(window.innerHeight - getHeight(chartHeader) - getTop(chartHeader) - 40, 400);
            width = height * aspectRatio;
        }

        xScale.domain(responses.map(function(d) { return d.name; }))
            .rangeRoundBands([margin.left, width - margin.right], 0.1, 0.3);

        yScale.domain([y_minValue, y_maxValue])
            .range([height - margin.bottom, margin.top]);

        // var colorScale = d3.scale.ordinal().range(colorArray)
        //     .domain(_.pluck(categoryArray, "name"));
        var colorScale = d3.scale.category20c()
            .domain(_.pluck(categoryArray, 'name'));

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
            .data(function (d) { return d.words; })
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
            .on("click", function (d) { return showFeedback(this, d); })
            .append("svg:title")
            .text(function(d) {
                return "Word: '" + d.fullname + "' Number of responses: " + d.value;
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
            .data(categoryArray.reverse())
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

}(window, _, d3));
