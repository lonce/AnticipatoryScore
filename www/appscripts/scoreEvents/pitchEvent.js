define(
	[],
	function () {
      return function (i_arg){
 
         var dispThing = i_arg;

         var myDraw = function(ctx, x, y){
            var h=30;
            var w=40;

               ctx.fillStyle = pitchEvent.color;
               ctx.strokeStyle = pitchEvent.color;

               //ctx.rect(x,y,40,30);

               ctx.beginPath();
               ctx.moveTo(x, y+h/2);
               ctx.lineTo(x+w/2, y);
               ctx.lineTo(x+w, y+h/2);
               ctx.lineTo(x+w/2, y+h);
               ctx.lineTo(x, y+h/2);
               ctx.stroke();
               ctx.closePath();


               //ctx.stroke();
               ctx.fillText(pitchEvent.dispThing, x+15, y+20);

               ctx.beginPath();
               ctx.arc(x,y+h/2,1,0,2*Math.PI);
               ctx.closePath();
               ctx.fill();
         }


         var pitchEvent={
            type: "pitchEvent",
            d: null,
            s: null,

            color: "FFFFFF",
            //legalValues: k_pitches,
            dispThing: i_arg,

            //setPitch: function(pval){dispThing=pval;},
 
            // args: 
            //  ctx - 2D canvax drawing contex
            //  time2Px = function for translating the time sampls on these objects to pixel for drawing
            draw: function(ctx, time2Px){
               //var dispPx=time2Px(this.d[0][0]);
               myDraw(ctx, time2Px(this.d[0][0])  , this.d[0][1] );
               // Display the element
            },


            drawAtPixel: function(ctx, xval){
               myDraw(ctx, xval, this.d[0][1]);
            }

         };
         
   		return pitchEvent;
      }
});