var w = 900;
var h = 500;

var sliceH = 71;
var chartH = 50;

var svg = d3.select('svg')
	.attr('width', w)
	.attr('height', h)

var props = [];

var dsv = d3.dsv(';');

dsv('nutrition.csv', function(err, data){

	// type coercion from strin to number
	data.forEach(function(d){
		for(var k in d){
			if(k != 'Name'){
				d[k] = +d[k];
			}
		}
	})

	var units = {
		Energy: 'kCal',
		Fats: 'g',
		Carbs: 'g',
		Proteins: 'g',
		Fiber: 'g',
		Sugars: 'g',
		Water: 'g'
	}

	var colors = {
		Energy: '#DF7869',
		Fats: '#E09F78',
		Carbs: '#444442',
		Proteins: '#ACB4A9',
		Fiber: '#BAB6AA',
		Sugars: '#BFCBCB',
		Water: '#31394D'
	}

	// create the main dataset using the property name list from the first item in array
	for(var k in data[0]){
		if(k != 'Name'){
			props.push({key:k, values:data, unit:units[k]});
		}
	}
	
	
	

	// create the group containers, one for each chart
	var groups = svg.selectAll('.props')
		.data(props)
		.enter()
		.append('g')
		.classed('props', true)
		.attr('transform', function(d, i){
			return 'translate(0, ' + (i*sliceH) + ')';
		})

	// just a rect as background
	groups.append('rect')
		.attr('width', w)
		.attr('height', sliceH)
		.style('fill', 'white')

	

	// the limit line for each chart
	groups.append('line')
		.attr('x1', 0)
		.attr('x2', w)
		.attr('y1', 20)
		.attr('y2', 20)
		.style('stroke', '#ddd')


	// function for the area generator
	// each needs its own scales and some calculations
	function templateLine(src){

		var arr = src.values;
		var k = src.key;

		var max = d3.max(arr, function(d){
			return d[k];
		})

		src.max = max;

		var scaleX = d3.scale.linear()	
			.domain([0, data.length])
			.range([0, w])

		var scaleY = d3.scale.linear()	
			.domain([0, max])
			.range([chartH, 0])


		var area = d3.svg.area()
				.x(function(d, i){
					return scaleX(i)
				})
				.y1(function(d, i){
					return scaleY(d[k])
				})
				.y0(function(d, i){
					return chartH
				})
				//.interpolate('basis')

		return area(arr);
	}

	
	
	// the paths for the area chart
	var paths = groups.append('g')
		.attr('transform', 'translate(0, 21)')
		.append('path')
		.attr('d', function(d, i){
			return templateLine(d)
		})
		.style('fill', function(d, i){
			return colors[d.key]
		})
		.style('stroke', 'none')

	// the label for each
	groups.append('text')
		.text(function(d){
			return d.key + ' '+ d.max + ' ' + d.unit + ''
		})
		.attr('dy', 16)
		.attr('dx', 5)
		.classed('label', true)

	// the bottom line for each chart
	groups.append('line')
		.attr('x2', w)
		.attr('y1', sliceH)
		.attr('y2', sliceH)
		.style('stroke', '#555')
		.style('strokeWidth', 2)

	var current;

	// on click we are going to change the background color
	groups.on('click', function(d){
		if(current){
			current.select('rect')
				.transition()
				.style('fill', 'white')
		}

		current = d3.select(this);
		current.select('rect')
				.transition()
				.style('fill', '#eee')

		changeSort(d);
	})

	// this function change the sorting of the main array
	// then we update the area chart with the new values
	function changeSort(d){

		data.sort(function(a, b){
			return d3.descending(a[d.key], b[d.key])
		})

		paths.transition()
			.duration(300)
			.delay(function(d, i){
				return i*150;
			})
			.attr('d', function(d, i){
				return templateLine(d)
			})
	}


})