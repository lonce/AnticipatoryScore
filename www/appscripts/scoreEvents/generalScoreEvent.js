define(
   [],
   function () {
      return function (i_type){
 

         var genEvent={
            type: i_type || null,
            d: null,
            s: null,
            b: 999999999999999999999999999,
            e: -999999999999999999999999999,

            color: "FFFFFF",

            updateMinTime: function(i_arg){
               if (i_arg){
                  genEvent.b=Math.min(i_arg, genEvent.b);
               } else{
                  for (var i=0;i<genEvent.d.length;i++)
                     genEvent.b=Math.min(genEvent.b, genEvent.d[i][0]);
               }
               return genEvent.b;
           },


            updateMaxTime: function(i_arg){
             if (i_arg){
                  genEvent.e=Math.max(i_arg, genEvent.e);
               } else{
                  for (var i=0;i<genEvent.d.length;i++)
                     genEvent.e=Math.max(genEvent.e, genEvent.d[i][0]);
               }
               return genEvent.e;
            }, 

            draw: function(ctx, time2Px){
               //var dispPx=time2Px(this.d[0][0]);
               this.myDraw(ctx, time2Px(this.d[0][0])  , this.d[0][1] );
               // Display the element
            },


            drawAtPixel: function(ctx, xval){
               this.myDraw(ctx, xval, this.d[0][1]);
            },


            // typically overridden by derivative objects
            myDraw: function (ctx, x, y){
            }

         };
         
         return genEvent;
      }
});