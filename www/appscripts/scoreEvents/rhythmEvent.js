define(
	["scoreEvents/generalScoreEvent", "../jslibs/vexflow-min.js"],
	function (generalScoreEvent) {

      // For rhythm, the argument to this factory function is an image
      return function (i_arg){

         var m_scoreEvent=generalScoreEvent("rhythmEvent");


         m_scoreEvent.myDraw = function(ctx, x, y){
               //console.log("rhythmTag, arg is " + i_arg);

               ctx.beginPath();
               ctx.fillStyle = 'white';
               ctx.rect(x,this.track.min,70,this.track.max-this.track.min);
               ctx.fill();
               ctx.closePath();

               ctx.fillStyle = 'black';
              
              // The arg is an html element that has already been converted from svg, so this looks like shit
               //ctx.drawImage(i_arg, x, this.track.min, 70, this.track.max-this.track.min);



               //-------------------------------------------------------------------
               var renderer = new Vex.Flow.Renderer(ctx.canvas,
                  Vex.Flow.Renderer.Backends.CANVAS);

                //var ctx = renderer.getContext();
               var stave = new Vex.Flow.Stave(x, 0, 70);
               stave.addClef("treble").setContext(ctx).draw();
 
               //---------------------------------------------------------------------
               

               ctx.beginPath();
               ctx.arc(x,y,1,0,2*Math.PI);
               ctx.closePath();
               ctx.fill();      
         }

         return m_scoreEvent;
      }
});