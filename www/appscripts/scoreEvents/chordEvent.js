define(
   ["scoreEvents/generalScoreEvent"],
   function (generalScoreEvent) {
      return function (i_arg){
 
         var m_scoreEvent=generalScoreEvent("chordEvent");

         m_scoreEvent.myDraw = function(ctx, x, y){
               ctx.fillStyle = m_scoreEvent.color;
               ctx.strokeStyle = m_scoreEvent.color;

               ctx.beginPath();
               ctx.rect(x,this.min,40,this.max-this.min);
               ctx.stroke();
               ctx.closePath();

               ctx.fillText(i_arg, x+15, y);


               ctx.beginPath();
               ctx.arc(x,y,1,0,2*Math.PI);
               ctx.closePath();
               ctx.fill();
         }


         return m_scoreEvent;
      }
});