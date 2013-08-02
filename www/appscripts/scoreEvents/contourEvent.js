define(
	["soundbank", "config", "scoreEvents/generalScoreEvent"],
	function (soundbank, config, generalScoreEvent) {
      return function (){

         var m_scoreEvent=generalScoreEvent("mouseContourGesture");

         var m_nowVal=null;

         m_scoreEvent.draw = function(ctx, time2Px, nowishP){

               var dispPx=time2Px(this.d[0][0]);


 /*
               if (nowishP(this.d[0][0])){
                  //console.log("contour start, get a new snd")
                  this.snd=this.soundbank.getSnd();
                  this.snd && this.snd.play();
               } 
 */

               // Display the element
               ctx.fillStyle = this.color;
               ctx.fillText(this.s, dispPx, this.d[0][1]);

               ctx.beginPath();
               ctx.arc(dispPx,this.d[0][1],1,0,2*Math.PI);
               ctx.closePath();
               ctx.fill();

               // DRAW ONE BIG POLYGON
               // One line all the way to the end
               ctx.beginPath();
               ctx.strokeStyle = this.color;
               ctx.moveTo(dispPx,this.d[0][1]);
               ctx.lineWidth = 1;
               //console.log("drawing - datalenght = " + this.d.length+ ", color = " + ctx.strokeStyle + ", px = "+ dispPx + ", " + this.d[0][1]);
               for(var n=0;n<this.d.length;n++){
                  
                  if (nowishP(this.d[n][0])){
                     m_nowVal=this.d[n][1];
                     //this.snd && this.snd.setParamNorm("Carrier Frequency", 1-this.d[n][1]/ctx.canvas.height);
                     //this.snd && this.snd.setParamNorm("Modulation Index", 1-this.d[n][2]);
                  }
                 // ctx.lineTo(time2Px(this.d[n][0]), this.d[n][1]+ this.d[n][2]/2);
                  ctx.lineTo(time2Px(this.d[n][0]), this.d[n][1]);
               }
/*
               if (nowishP(this.d[n-1][0])){
                  //console.log("contour end across now, and this.snd is " + this.snd);
                  this.snd && this.snd.release();
                  this.snd && this.soundbank.releaseSnd(this.snd); 
               }
*/
               // "turn around" the end
               //ctx.lineTo(time2Px(this.d[n-1][0]), this.d[n-1][1]-this.d[n-1][2]/2);
               ctx.lineTo(time2Px(this.d[n-1][0]), this.d[n-1][1]);
               // go backwards at the line width
               for(var n=this.d.length-1;n>=0; n--){
                  //ctx.lineTo(time2Px(this.d[n][0]), this.d[n][1]-this.d[n][2]/2);
                  ctx.lineTo(time2Px(this.d[n][0]), this.track.max);
               }
               // close and fill the whole shape as one big plygon
               ctx.closePath();

               ctx.stroke();  
               ctx.globalAlpha = 0.25;
               ctx.fill(); 
               ctx.globalAlpha = 1;  


               // draw cross-hair on now line of last value to cross it              
               if (m_nowVal != null){

                     //ctx.strokeStyle = "#FF0000"; 
                     ctx.lineWidth =1;
                     ctx.beginPath();             
                     ctx.moveTo(config.nowLinePx-4, m_nowVal);
                     ctx.lineTo(config.nowLinePx+4, m_nowVal);
                     ctx.stroke();
                     ctx.closePath();

               }    
            };

 
            // just draw cross hair on now line at the value of end of contour...
            m_scoreEvent.drawAtPixel =  function(ctx, xval){
               if (m_nowVal != null){
                     ctx.strokeStyle = this.color;
                     ctx.lineWidth =1;
                     ctx.beginPath();             
                     ctx.moveTo(config.nowLinePx-4, m_nowVal);
                     ctx.lineTo(config.nowLinePx+4, m_nowVal);
                     ctx.stroke();
                     ctx.closePath();
               }    
            };

         
   		return m_scoreEvent;
      }
});