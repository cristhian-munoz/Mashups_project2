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
}
window.onload = main();