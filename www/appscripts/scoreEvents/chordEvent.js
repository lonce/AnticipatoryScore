define(
   [],
   function () {
      return function (i_arg){
 
         var dispThing = i_arg;

         var myDraw = function(ctx, x, y){
               ctx.fillStyle = pitchEvent.color;
               ctx.strokeStyle = pitchEvent.color;

               ctx.beginPath();
               ctx.rect(x,y,40,30);
               ctx.stroke();
               ctx.closePath();

               ctx.fillText(pitchEvent.dispThing, x+15, y+20);


               ctx.beginPath();
               ctx.arc(x,y,1,0,2*Math.PI);
               ctx.closePath();
               ctx.fill();
         }


         var pitchEvent={
            type: "chordEvent",
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