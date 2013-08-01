define(
	["scoreEvents/generalScoreEvent", "canvg/rgbcolor", "canvg/StackBlur","canvg/canvg"],
	function (generalScoreEvent) {

      // For rhythm, the argument to this factory function is an image
      return function (i_arg){

         var m_scoreEvent=generalScoreEvent("rhythmEvent");


         m_scoreEvent.myDraw = function(ctx, x, y){
               //console.log("rhythmTag, arg is " + i_arg);

               ctx.beginPath();
               ctx.fillStyle = 'white';
               ctx.rect(x,this.min,70,this.max-this.min);
               ctx.fill();
               ctx.closePath();

               ctx.fillStyle = 'black';
              
              // The arg is an html element that has already been converted from svg, so this looks like shit
               ctx.drawImage(i_arg, x, this.min, 70, this.max-this.min);
               
               // This takes too long to load, and looks better, but not great.
               //ctx.drawSvg("https://upload.wikimedia.org/wikipedia/commons/a/ac/Musical_notes.svg", x, y, 74, 32);

               // This also takes too long to load / render
               //ctx.drawSvg("images/test.svg", x, y, 74, 32);

               // This doesn't load from file, but still takes too much CPU to render
               /*
               ctx.drawSvg("<svg id=\"svg2\" xmlns=\"http://www.w3.org/2000/svg\" height=\"300\" width=\"400\" version=\"1.0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"> <path id=\"path2796\" d=\"m226.86 138.73l92.58-12v88.12c-8.65-2.05-21.03-2.05-30.52 5.89-19.01 15.9-2.33 33.78 19.43 24.91 12.38-5.05 16.51-13.15 16.51-25.38v-109.54l-103.42 12v109.73c-8.65-2.05-21.03-2.04-30.52 5.9-19.01 15.9-2.33 33.78 19.43 24.91 12.38-5.05 16.51-13.16 16.51-25.39v-99.15z\"/>\
 <path id=\"path2810\" d=\"m8.5 87.5h381.12\" stroke=\"#000\" stroke-width=\"3.75\" fill=\"none\"/>\
 <use id=\"use2812\" xlink:href=\"#path2810\" transform=\"translate(0 36.03)\" height=\"300\" width=\"400\" y=\"0\" x=\"0\"/>\
 <use id=\"use2814\" xlink:href=\"#path2810\" transform=\"translate(0 72.061)\" height=\"300\" width=\"400\" y=\"0\" x=\"0\"/>\
 <use id=\"use2816\" xlink:href=\"#path2810\" transform=\"translate(0 108.09)\" height=\"300\" width=\"400\" y=\"0\" x=\"0\"/>\
 <use id=\"use2818\" xlink:href=\"#path2810\" transform=\"translate(0 144.12)\" height=\"300\" width=\"400\" y=\"0\" x=\"0\"/>\
 <path id=\"path2820\" d=\"m389.62 89.289v140.46\" stroke=\"#000\" stroke-linecap=\"square\" stroke-width=\"7.5\" fill=\"none\"/>\
 <path id=\"path1981\" d=\"m69.5 269c40-31.26-37.238-44.91-13.5 3 5.182 10.46 55.5 36.51 55.5-40 0-57.5-35-130.5-35-159.5s23-44.5 23-6-56.5 71.5-56.5 111.5c0 66.03 90.5 67.03 90.5 18 0-45.5-42.327-46.9-56-35.5-19.514 16.27-12.443 47.9 10.5 50-33.656-43.11 31.7-54.41 36-18 4.73 40.03-69.5 41.16-69.5-7.5 0-38.5 61.27-77.6 58.5-115.5-4-54.691-39.861-71.599-44-5-2.91 46.32 34.83 105.02 36.5 170.5 1.07 41.81-30.318 52.85-36 34z\"/>\
</svg>", x, y, 74, 32);
               */

               // This uses images loaded from svg files into the dom. Amazingly, the size you create
               // on the dom has no effect on the display quality on the canvas. 
               //ctx.drawImage(document.getElementById("testimg"), x, y, 74, 32);





               ctx.beginPath();
               ctx.arc(x,y,1,0,2*Math.PI);
               ctx.closePath();
               ctx.fill();      
         }

         return m_scoreEvent;
      }
});