define(
	["scoreEvents/generalScoreEvent"],
	function (generalScoreEvent) {
      return function (i_arg){
 

         var m_scoreEvent=generalScoreEvent("pitchEvent");

         m_scoreEvent.myDraw = function(ctx, x, y){
            var h=30;
            var w=40;

               ctx.fillStyle = m_scoreEvent.color;
               ctx.strokeStyle = m_scoreEvent.color;

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
               ctx.fillText(i_arg, x+15, y+20);

               ctx.beginPath();
               ctx.arc(x,y+h/2,1,0,2*Math.PI);
               ctx.closePath();
               ctx.fill();
         }

         
   		return m_scoreEvent;
      }
});