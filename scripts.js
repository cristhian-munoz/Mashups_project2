var art, uv, grass; //These variables hold the objects returned by the get forecast ajax calls
var locationKey = 115295; //This is the location key of San José, CR. Gets updated if user requests it.

//This function extracts the Categories (Forecast description) of the object returned by the Ajax calls and converts them into arrays
function makeCatArray(data) {
	var val = [];
	for (i=0;i<5;i++){
		val.push(data[i].Category);
	}
	return val;
}
//This function extracts the values of the object returned by the Ajax calls and converts them into arrays
function makeValArray(data) {
	var val = [];
	for (i=0;i<5;i++){
		val.push(data[i].Value);
	}
	return val;
}

//This function retrieves the location key of the city we are searching for.
function getLocationKey (city){
	var locationURL = 'https://dataservice.accuweather.com//locations/v1/search?apikey=xTHYAI2t6JF0YFftdoE70JSFwkQC6tLd=' + city;
	return $.ajax({
		url: locationURL,
		type: 'GET',
		dataType: 'jsonp',
	});	
}

//This function retrieves a 5-day Forecast of the specific index requested
function getForecast (index) {
	var forecastURL = 'https://dataservice.accuweather.com/indices/v1/daily/5day/' + locationKey + '/' + index;
	var accuKEY = '?apikey=' + 'xTHYAI2t6JF0YFftdoE70JSFwkQC6tLd';
	console.log(forecastURL+accuKEY);
	return $.ajax({
		url: forecastURL + accuKEY,
		type: 'GET',
		dataType: 'jsonp',
	});
}

//Transforms the day numbers into words
function makeDayStr(day) {
	switch (day) {
    case 0:
        return "Sunday";
    case 1:
        return "Monday";
    case 2:
        return "Tuesday";
    case 3:
        return "Wednesday";
    case 4:
        return "Thursday";
    case 5:
        return "Friday";
    case 6:
        return "Saturday";
	}
}

//This array holds the x axis of the graph. The next three days will get appended after retrieving the correct dates.
var xScale = ["Today","Tomorrow"]; 

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}		

//Initializer function
function main () {
				//init canvas
				var canvas = document.getElementById("canvas");
				var ctx = canvas.getContext('2d');
				
				//Dimensions
				var w = window.innerWidth;
				var h = window.innerHeight;

				canvas.height = h;
				canvas.width = w;

				//drops
				var md = 2000; //max # of drops
				var drops = []; //array of objects

				for (var i=0; i<md; i++){
					drops.push ({
						x : Math.random() * w,
						y : Math.random() * h,
						r : Math.random() * 0.2 + 1,
						d : Math.random() * md  //Density, helps correct how close the drops are to each other
					});
				}
				
				//Drawer
				function draw() {
					ctx.clearRect (0,0,w,h);
					ctx.fillStyle = "#2C4770"; //Color of the drops
					ctx.beginPath();

					for (var i=0; i<md;i++){
						var drop = drops[i];
						ctx.moveTo(drop.x,drop.y);
						ctx.arc(drop.x,drop.y,drop.r,0,Math.PI * 2, true);
					}
					ctx.fill();
					update();
				}			
				


				//This variables makes the drops fall in a certain angle, the angle changes direction eventually
				var angle = 0;
				
				//update the movements
				function update () {
					angle += 0.02;
					for (var i =0; i<md;i++) {
						var drop = drops[i];
						
						//The cos and sin helps changing the direction of the angle from positive to negative,
						//so that the drop changes direction eventually. On the other hand elements like drop.r*20 are just to increase the magnitude of the operation.
						drop.y += Math.cos(angle + drop.d) + 1 + drop.r*20 / 2 ; 
						drop.x += Math.sin(angle) * 2;

						//send back to the top when they exis the screen
						if (drop.x> w+7 || drop.x < -7 || drop.y > h) {
							if (i%9 > 0) {
								//11.11% of the drops will come back from the top
								drops[i] = {x : Math.random() * w , 
									y : -10 , 
									r : drop.r,
									d : drop.d};
							}
							else {
								//exited from the right, enter from the left
								if (Math.sin(angle)>0) {
									var min1 = Math.ceil(-20);
  									var max1 = Math.floor(-2);
  									var ran1 = Math.floor(Math.random() * (max1 - min1 + 1)) + min1;

									drops[i] = { x: ran1 ,
										y : Math.random()*h,
										r : drop.r,
										d : drop.d };
								} else {
									//all others enter from the right

  									var min2 = Math.ceil(2);
  									var max2 = Math.floor(20);
  									var ran2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;

									drops[i] = { x: w + ran2 ,
										y : Math.random()*h,
										r : drop.r,
										d : drop.d };
								}
							}
						} 
					}
				}
				setInterval(draw,2);

				//Loads the Lawn Mower and animates it recursively
				function loadLawn () {
				    var img = $("#lawn"),
				    width = img.get(0).width,
				    screenWidth = $(window).width(),
				    duration = 10000;
				
					function animateLawn() {
					    img.css("right", -width)
					    .animate({
					    "right": screenWidth
						}, duration, animateLawn);
					}
					img.css('display','block');
				    animateLawn();
				}

				//Now we are ready to start retrieving information
				//Wait for the there forecasts ajax calls to be performed.
				$.when(art=getForecast(21), uv=getForecast(-15), grass=getForecast(28)).done(function(art,uv,grass) {
					var art_cat, uv_cat, grass_cat;
					var art_val, uv_val, grass_val;

					//Complete the x-axis of the graph depending on the dates.
					for (var i=2;i<5;i++) {
						var utcSeconds = art[0][i].EpochDateTime;
						var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
						d.setUTCSeconds(utcSeconds);
						xScale.push(makeDayStr(d.getDay()));
					}	
					//Wait for the information to be splitted into arrays for easier use
					$.when(art_cat=makeCatArray(art[0]), uv_cat=makeCatArray(uv[0]), grass_cat=makeCatArray(grass[0]),
						art_val=makeValArray(art[0], uv_val=makeValArray(uv[0]), grass_val=makeValArray(grass[0]))
						).done(function() {
						//Make the chart and then display the lawn Mower
						$.when(makeD3Chart(art_val, uv_val, grass_val, art_cat, uv_cat, grass_cat)).done(function (a) {
							loadLawn();
							$('#grassCutting').css('display','block');
						});

					});
				});
}
window.onload = main();

function makeD3Chart(art_val, uv_val, grass_val, art_cat, uv_cat, grass_cat){

	//Big part of the code is borrowed from the Professor's exercise. I didn't modify the comments of such lines.

	//Clear the page each time a new chart is made
	$('#chart').html('');
	$('#chart').css('display','block');

	var w = $('#chart').width();
	var h = 330;

	var barPadding = 2;

	//Create SVG element
	var svg = d3.select("#chart")
		.append("svg")
		.attr("width", w)
		.attr("height", h);

	//Make a background for the svg
	svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "blue")
    .attr('opacity',0.5);

	//Get min and max value from dataset
	var array = art_val.concat(uv_val, grass_val);
	var dataMin=d3.min(array);
	var dataMax=d3.max(array);

	//Initialize the y-scale using the min and max temp values
	var yScale = d3.scale.linear()
		.domain([dataMin, dataMax])
		.range([75,h - 75]);

	//Computes the positions of the path.
	var lineFunc = d3.svg.line()
	  .x(function(d, i) {
	    return i * (w / uv_val.length) + 100;
	  })
	  .y(function(d) {
	    return h - yScale(d);
	  });

	//Append the line paths of the graph
	svg.append('svg:path')
	  .attr('d', lineFunc(art_val))
	  .attr('stroke', 'blue')
	  .attr('stroke-width', 2)
	  .attr('fill', 'none');

	svg.append('svg:path')
	  .attr('d', lineFunc(uv_val))
	  .attr('stroke', 'green')
	  .attr('stroke-width', 2)
	  .attr('fill', 'none');

	svg.append('svg:path')
	  .attr('d', lineFunc(grass_val))
	  .attr('stroke', 'red')
	  .attr('stroke-width', 2)
	  .attr('fill', 'none');

	//Create g 'groups' for the different types of circles
	//Groups allow for separating data

	var artV = svg.append("g")
		.attr("class", "artV");
	var uvV = svg.append("g")
		.attr("class", "uvV");
	var grassV = svg.append("g")
		.attr("class", "grassV");

	//Define the x-axis using the elements of the array of the x-axis
	var x = d3.scale.ordinal().rangeRoundBands([0, w]);
	var xAxis = d3.svg.axis().scale(x).orient("bottom");
	x.domain(xScale.map(function(d) { return d; }));
	
	//Create the x-axis
    var margins = {top: h-30, bottom: 50, left: 0, right: 10};
    svg.append("svg:g")
    	.style("fill", "black")
    	.attr('transform', 'translate(' + [margins.left, margins.top] + ')')
        .call(xAxis);

	var text;
	//Create circles for Arthritis Pain Forecast
	artV.selectAll("circle")
		.data(art_val)
		.enter()
		.append("circle")
		.attr("cx", function(d, i) {
			return i * (w / art_val.length) + 100;
		})
		.attr("cy", function(d) {
			return h - yScale(d);
		})
		.attr("r", 6)
		//Create the message Boxes
		.on("mouseover", function(d, i){
                    svg.append("foreignObject")
                        .attr("class", "externalObject")
                         .attr("x", function () {
                   			var xcor;
                        	xcor = i * (w / grass_val.length) + 120 ;//+ "px";
                        	if ((xcor + 100) < w ) { return xcor + "px";}
                        	 else { return (xcor - 200) + "px";}
                        	})
                        .attr("y", function () {
                        	var ycor = h - yScale(d) + 5;
                        	if ((ycor + 100) < h ) {return ycor + "px";}
                        	else { return (ycor-50) + "px";}
                        })                       
                        .attr("width", 200)
                        .attr("height", 100)
                        .style("fill", "red")
                        .append("xhtml:div")
                        .html("Arthritis Pain Forecast" +
								"<ul>" + 
								"<li><strong>Forecast:</strong> <span style='color:red'>" + art_cat[i] + "</span></li>" +
								"<li><strong>Value:</strong> <span style='color:red'>" + d + "</span></li> " + 
								"</ul>"
                        	);})
		.on("mouseout", function(){ $(".externalObject").remove();
		});

	//Create the circles for UV index values and its text boxes
	uvV.selectAll("circle")
		.data(uv_val)
		.enter()
		.append("circle")
		.attr("cx", function(d, i) {
			return i * (w / uv_val.length) + 100;
		})
		.attr("cy", function(d) {
			return h - yScale(d);
		})
		.attr("r", 6)
		.on("mouseover", function(d, i){
                    svg.append("foreignObject")
                        .attr("class", "externalObject")
                         .attr("x", function () {
                   			var xcor;
                        	xcor = i * (w / grass_val.length) + 120 ;//+ "px";
                        	if ((xcor + 100) < w ) { return xcor + "px"; }
                        	 else { return (xcor - 200) + "px"; }
                        	})
                        .attr("y", function () {
                        	var ycor = h - yScale(d) + 5;
                        	if ((ycor + 100) < h ) {return ycor + "px";}
                        	else { return (ycor-50) + "px";}
                        })
                        .attr("width", 200)
                        .attr("height", 100)
                        .style("fill", "yellow")
                        .append("xhtml:div")
                        .html("UV Value Index" +
								"<ul>" + 
								"<li><strong>Forecast:</strong> <span style='color:red'>" + uv_cat[i] + "</span></li>" +
								"<li><strong>Value:</strong> <span style='color:red'>" + d + "</span></li> " + 
								"</ul>"
                        	);})
		.on("mouseout", function(){ $(".externalObject").remove();
		});

	//Create the circles for Grass Cutting forecast values and its text boxes
	grassV.selectAll("circle")
		.data(grass_val)
		.enter()
		.append("circle")
		.attr("cx", function(d, i) {
			return i * (w / grass_val.length) + 100;
		})
		.attr("cy", function(d) {
			return h - yScale(d);
		})
		.attr("r", 6)
		.on("mouseover", function(d, i){
                    svg.append("foreignObject")
                        .attr("class", "externalObject")
                        .attr("x", function () {
                   			var xcor;
                        	xcor = i * (w / grass_val.length) + 120 ;//+ "px";
                        	if ((xcor + 100) < w ) { return xcor + "px"; }
                        	 else { return (xcor - 200) + "px"; }
                        	})
                        .attr("y", function () {
                        	var ycor = h - yScale(d) + 5;
                        	if ((ycor + 100) < h ) {return ycor + "px";}
                        	else { return (ycor-50) + "px";}
                        })
                        .attr("width", 200)
                        .attr("height", 100)
                        .style("fill", "yellow")
                        .append("xhtml:div")
                        .html("Weather for Lawn Mowing" +
								"<ul>" + 
								"<li><strong>Forecast:</strong> <span style='color:red'>" + grass_cat[i] + "</span></li>" +
								"<li><strong>Value:</strong> <span style='color:red'>" + d + "</span></li> " + 
								"</ul>"
                        	);})
		.on("mouseout", function(){ $(".externalObject").remove();		
		});

	setTimeout(function(){
    	return 1; }, 2000);
}

//This button hold the city the user is interested in
$("#goButton").click(function (){
	var locationStr = $('#location-input').val();
    $.when(locationStr = getLocationKey(locationStr)).done( function (a) {
    	//Retrieve the location key
    	locationKey = locationStr.responseJSON[0].Key;
    	$("#location").html("");
    	$("#location").html(locationStr.responseJSON[0].LocalizedName + ", "+locationStr.responseJSON[0].Country.LocalizedName);
    	//Recompute everything
    	main();
    });
    
});
