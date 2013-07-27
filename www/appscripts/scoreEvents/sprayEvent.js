define(
	["soundbank", "config", "scoreEvents/generalScoreEvent"],
	function (soundbank, config, generalScoreEvent) {
      return function (){

         var m_scoreEvent=generalScoreEvent("mouseEventGesture");

         m_scoreEvent.draw = function(ctx, time2Px, nowishP){

               var dispPx;

               for(var n=0;n<this.d.length;n++){    
                  dispPx=time2Px(this.d[n][0]);  

                  if (nowishP(this.d[n][0])){
                     this.snd=this.soundbank.getSnd();
                     this.snd && this.snd.setParamNorm("Carrier Frequency", 1-this.d[n][1]/ctx.canvas.height);
                     this.snd && this.snd.setParamNorm("Modulation Index", 1-this.d[n][2]);
                     this.snd.play();
                     this.snd.release();
                     this.snd && this.soundbank.releaseSnd(this.snd);     
                     //explosion(dispPx, this.d[n][1], 5, "#FF0000", 3, "#FFFFFF")  
                  }

                  // Display the element
                  ctx.fillStyle = this.color;
                  ctx.fillText(this.s, dispPx, this.d[n][1]);

                  ctx.beginPath();
                  ctx.arc(dispPx,this.d[n][1],1,0,2*Math.PI);
                  ctx.closePath();
                  ctx.fill();
               }
            } 

 
         return m_scoreEvent;
      };
});