define(
	["soundbank", "config", "scoreEvents/generalScoreEvent"],
	function (soundbank, config, generalScoreEvent) {
      return function (i_arg){

         var m_scoreEvent=generalScoreEvent("mouseContourGesture");

         var m_nowVal=null;

         m_scoreEvent.draw = function(ctx, time2Px, nowishP){

               var dispPx=time2Px(this.d[0][0]);
               ctx.fillStyle = this.color;


 /*
               if (nowishP(this.d[0][0])){
                  //console.log("contour start, get a new snd")
                  this.snd=this.soundbank.getSnd();
                  this.snd && this.snd.play();
               } 
 */

               // Display the element
               if (this.head){
                  drawHead(ctx, dispPx);
               }

               if (this.drawID){

                  ctx.fillText(this.s, dispPx, this.d[0][1]);

                  ctx.beginPath();
                  ctx.arc(dispPx,this.d[0][1],1,0,2*Math.PI);
                  ctx.closePath();
                  ctx.fill();
               }

               if (this.tail){
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


                  // "Stick" to the now line
                  //var stickto = config.nowLinePx;
                  /*
                  var stickto=10;
                  if (time2Px(this.d[n-1][0]) < stickto){
                     ctx.lineTo(stickto, this.d[n-1][1]);
                     ctx.lineTo(stickto, this.track.max);
                  }
                  */

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



                  if (time2Px(this.d[this.d.length-1][0]) < config.nowLinePx){
                        ctx.beginPath();
                        ctx.rect(config.nowLinePx-6, this.d[this.d.length-1][1], 12, this.track.max-this.d[this.d.length-1][1]);
                        ctx.closePath();
                        ctx.stroke();  
                        ctx.globalAlpha = 0.25;
                        ctx.fill(); 
                        ctx.globalAlpha = 1;
                  }
                  
                  // draw cross-hair on now line of last value to cross it              
                  if (m_nowVal != null){
                        //ctx.strokeStyle = "#FF0000"; 
                        ctx.lineWidth =1;
                        ctx.beginPath();             
                        ctx.moveTo(config.nowLinePx-6, m_nowVal);
                        ctx.lineTo(config.nowLinePx+6, m_nowVal);
                        ctx.stroke();
                        ctx.closePath();
                  }    
                  
               }
            };



            var drawHead = function (ctx, x){
               var x=Math.max(x,0);

               var h=m_scoreEvent.track.max-m_scoreEvent.track.min;
               var r = h/2;
               var w=1.2*h;
               var y=(m_scoreEvent.track.max+m_scoreEvent.track.min)/2;

               ctx.fillStyle = m_scoreEvent.color;
               ctx.strokeStyle = m_scoreEvent.color;
               ctx.font = m_scoreEvent.font;
               ctx.textAlign="center";
               ctx.textBaseline="middle"; 

               if (m_scoreEvent.head === "rectangle"){
                  ctx.beginPath();
                  ctx.rect(x,m_scoreEvent.track.min,w,m_scoreEvent.track.max-m_scoreEvent.track.min);
                  ctx.stroke();
                  ctx.closePath();
                  ctx.fillText(i_arg, x+w/2, (m_scoreEvent.track.max+m_scoreEvent.track.min)/2);
               } else if (m_scoreEvent.head === "diamond"){
                  ctx.beginPath();
                  ctx.moveTo(x, y);
                  ctx.lineTo(x+w/2, y+h/2);
                  ctx.lineTo(x+w, y);
                  ctx.lineTo(x+w/2, y-h/2);
                  ctx.lineTo(x, y);
                  ctx.stroke();
                  ctx.closePath();
                  ctx.fillText(i_arg, x+w/2, (m_scoreEvent.track.max+m_scoreEvent.track.min)/2);
               } else if (m_scoreEvent.head === "circle"){
                  ctx.beginPath();
                  ctx.arc(x+r,y,r,0,2*Math.PI);
                  ctx.stroke();
                  ctx.closePath();
                  ctx.fillText(i_arg, x+w/2, (m_scoreEvent.track.max+m_scoreEvent.track.min)/2);
               } else if (m_scoreEvent.head === "image"){
                  ctx.beginPath();
                  ctx.fillStyle = 'white';
                  ctx.rect(x,m_scoreEvent.track.min,70,m_scoreEvent.track.max-m_scoreEvent.track.min);
                  ctx.fill();
                  ctx.closePath();
                  ctx.fillStyle = 'black';
                  // The arg is an html element that has already been converted from svg, so this looks like shit
                  ctx.drawImage(i_arg, x, m_scoreEvent.track.min, 70, m_scoreEvent.track.max-m_scoreEvent.track.min);
           }

               ctx.beginPath();
               ctx.arc(x,(m_scoreEvent.track.max+m_scoreEvent.track.min)/2 ,1,0,2*Math.PI);
               ctx.closePath();
               ctx.fill();            
         }

   		return m_scoreEvent;
      }
});