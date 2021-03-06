/* This application does simple "event chat". Here, events are mouse clicks on a canvas. 
	There is also a metronome tick that comes the server (totally unrelated to the event chat functionality).
	We register for the following messages:
		init - sent by the server after the client connects. Data returned is an id that the server and other clients will use to recognizes messages from this client.
		mouseContourGesture - sent when another chatroom member generates a mouse click. Data is x, y of their mouse position on their canvas.
		metroPulse - sent by the server evdispPxery second to all chatroom members. Data is the server Date.now.
		startTime  - sent when another chatroom member requests a new time origin. Data is the server Date.now.
*/

require.config({
	paths: {
		//"jsaSound": "http://animatedsoundworks.com:8001" // for have sound served from animatedsoundworks
		//"jsaSound": ".." // if al jsaSound project directories (jsaOpCodes, jsaCore, jsaModels) are local
	}
});
require(
	["require", "comm", "utils", "touch2Mouse", "canvasSlider2",   "scoreEvents/rhythmEvent",   "scoreEvents/snakeEvent",  "tabs/tabTab",  "tabs/rhythmTab",  "tabs/keyTab", "tabs/snakeTab", "tabs/genericTab", "config"],

	function (require, comm, utils, touch2Mouse, canvasSlider,   rhythmEvent,  snakeEvent,   tabTab, rhythmTabFactory,  keyTabFactory, snakeTabFactory, genericTabFactory, config) {

/*
		if(config.webketAudioEnabled){
			soundbank.create(12); // max polyphony 
		}
*/
        var myrequestAnimationFrame = utils.getRequestAnimationFrameFunc();

        var time = {
        	serverTimeOrigin: 0,
        	serverTimeSinceOrigin: 0,
        	localClockTime: 0, // at last Frame Tiick
        	sinceOrigin: 0,    // accumulated, and adjusted to track server time if connected.
        	deltaTime: 0, // difference between server and localAccumulated at last server tick

        	init: function(stime){
         		console.log ("initializing time");

	       		this.serverTimeOrigin=stime || 0;
				this.serverTimeSinceOrigin=0;

        		this.localClockTime=Date.now();
        		this.sinceOrigin=0;
        		this.deltaTime=0;
        	},

        	update: function(){
        		var now = Date.now()
        		var interval=now-this.localClockTime;  // interval to add to current time.sinceOrigin
				this.localClockTime=now;
				// adjust slightly to slowly track server time (to keep clients in synch)
				this.sinceOrigin = this.sinceOrigin + interval*(1+this.deltaTime/10000);
        	}
        }


		var myID=0;
		var myRoom='';
		var displayElements = [];  // list of all items to be displayed on the score
		var colorIDMap=[]; // indexed by client ID
		var current_remoteEvent=[]; // indexed by client ID

		var m_lastDisplayTick=0;
		var m_tickCount=0;
		var k_timeDisplayElm=window.document.getElementById("timeDisplayDiv");

		var current_mgesture=undefined;
		var last_mousemove_event; // holds the last known position of the mouse over the canvas (easier than getting the position of a mouse that hasn't moved even though the score underneath it has....)
		var current_mgesture_2send=undefined; // used to send line segments being drawn before they are completed by mouse(finger) up. 

		var lastSendTimeforCurrentEvent=0; 
		var sendCurrentEventInterval=100;  //can't wait till done drawing to send contour segments

		var k_minLineThickness=1;
		var k_maxLineThickness=16; // actually, max will be k_minLineThickness + k_maxLineThickness

		var leftSlider = canvasSlider("slidercanvas1");


		// Create the tabPanes
		var m_pTab=genericTabFactory("pitchTab", "pradio", ["c#", "d#", "f", "g#", "a#" ]);
		var m_rTab=rhythmTabFactory();
		//var m_cTab=chordTabFactory();
		var m_cTab=genericTabFactory("chordTab", "cradio", ["I", "ii", "IV", "V", "vi"]);
		var m_oTab=genericTabFactory("orchTab", "oradio", ["00", "1", "2", "3", "4", "5", "6", "7", "8", "9", "1/A", "2/A", "3/A", "4/A", "All"]);
		var m_kTab=keyTabFactory();

		var m_tabTab=tabTab(); // the tabs for the panes


		//---------------------------------------------------------------------------
		// init is called just after a client navigates to the web page
		// 	data[0] is the client number we are assigned by the server.
		comm.registerCallback('init', function(data) {
			//pong.call(this, data[1]);
			myID=data[0];
			console.log("Server acknowledged, assigned me this.id = " + myID);
			colorIDMap[myID]="#00FF00";

		});
		//---------------------------------------------------------------------------
		// data is [timestamp (relative to "now"), x,y] of mouseGesture, and src is the id of the clicking client
		comm.registerCallback('mouseGesture', function(data, src) {
			console.log("got mouse contour gesture from the net");
			//console.log("got mouseGesture event from source " + src + " ....  e: " + data[data.length-1][0]);
			//console.log("  ...   data is " + data.prettyString());
			//console.log("  ...   current_remoteEvent[src].d is " + current_remoteEvent[src].d.prettyString());
			current_remoteEvent[src].d = current_remoteEvent[src].d.concat(data);
			if (data.length === 0) console.log("Got contour event with 0 length data!");
			current_remoteEvent[src].updateMinTime();
			current_remoteEvent[src].updateMaxTime();
			//current_remoteEvent[src].e=data[data.length-1][0];
			//console.log(" ... after concatenation, oteEvent[src].d is " + current_remoteEvent[src].d.prettyString());

			//---displayElements.push({type: 'mouseGesture', b: data[0][0], e: data[data.length-1][0], d: data, s: src});
		});
		
		//---------------------------------------------------------------------------
		// data is [timestamp (relative to "now"), x,y] of mouseContourGesture, and src is the id of the clicking client
		comm.registerCallback('beginMouseTempoContour', function(data, src) {
			console.log("received tempo event message from source " + current_remoteEvent[src]); 
			current_remoteEvent[src]=snakeEvent();  // no label since no tab
			current_remoteEvent[src].d=data.d;
			current_remoteEvent[src].s=src;

			current_remoteEvent[src].track=m_track[m_trackNum[data.trackName]];
			current_remoteEvent[src].head=data.head;
			current_remoteEvent[src].tail=data.tail;

			current_remoteEvent[src].updateMinTime();
			current_remoteEvent[src].updateMaxTime();
			displayElements.push(current_remoteEvent[src]);
		});

		//---------------------------------------------------------------------------
		// data is [timestamp (relative to "now"), x,y] of mouseContourGesture, and src is the id of the clicking client
		comm.registerCallback('beginMouseDynamicsContour', function(data, src) {
			console.log("received Dynamics event message from source " + current_remoteEvent[src]); 
			current_remoteEvent[src]=snakeEvent();  // no label since no tab
			current_remoteEvent[src].d=data.d;
			current_remoteEvent[src].s=src;

			current_remoteEvent[src].track=m_track[m_trackNum[data.trackName]];
			current_remoteEvent[src].head=data.head;
			current_remoteEvent[src].tail=data.tail;

			current_remoteEvent[src].updateMinTime();
			current_remoteEvent[src].updateMaxTime();
			displayElements.push(current_remoteEvent[src]);
		});



		//------------------------------------------------------------------------------------
		comm.registerCallback("chordEvent", function(data, src) {
			//current_remoteEvent[src]={type: 'mouseEventSpray', b: data[0][0], e: data[data.length-1][0], d: data, s: src};

			console.log("received snake event message from source " + current_remoteEvent[src]); 
			current_remoteEvent[src]=snakeEvent(m_cTab.label(data.i));
			current_remoteEvent[src].d=data.d;
			current_remoteEvent[src].s=src;

			current_remoteEvent[src].track=m_track[m_trackNum[data.trackName]];
			current_remoteEvent[src].head=data.head;
			current_remoteEvent[src].tail=data.tail;

			current_remoteEvent[src].updateMinTime();
			current_remoteEvent[src].updateMaxTime();
			displayElements.push(current_remoteEvent[src]);
		});

		//------------------------------------------------------------------------------------
		comm.registerCallback("keyEvent", function(data, src) {
			//current_remoteEvent[src]={type: 'mouseEventSpray', b: data[0][0], e: data[data.length-1][0], d: data, s: src};

			console.log("received key event message from source " + current_remoteEvent[src]); 
			current_remoteEvent[src]=snakeEvent(m_kTab.label(data.i));
			current_remoteEvent[src].d=data.d;
			current_remoteEvent[src].s=src;

			current_remoteEvent[src].track=m_track[m_trackNum[data.trackName]];
			current_remoteEvent[src].head=data.head;
			current_remoteEvent[src].tail=data.tail;

			current_remoteEvent[src].updateMinTime();
			current_remoteEvent[src].updateMaxTime();
			displayElements.push(current_remoteEvent[src]);
		});

		//------------------------------------------------------------------------------------
		comm.registerCallback("orchEvent", function(data, src) {
			//current_remoteEvent[src]={type: 'mouseEventSpray', b: data[0][0], e: data[data.length-1][0], d: data, s: src};
			console.log("received orch event message from source " + current_remoteEvent[src]); 
			current_remoteEvent[src]=snakeEvent(m_oTab.label(data.i));
			current_remoteEvent[src].d=data.d;
			current_remoteEvent[src].s=src;

			current_remoteEvent[src].track=m_track[m_trackNum[data.trackName]];
			current_remoteEvent[src].head=data.head;
			current_remoteEvent[src].tail=data.tail;

			current_remoteEvent[src].updateMinTime();
			current_remoteEvent[src].updateMaxTime();
			displayElements.push(current_remoteEvent[src]);
		});

		//------------------------------------------------------------------------------------
		comm.registerCallback("pitchEvent", function(data, src) {
			//current_remoteEvent[src]={type: 'mouseEventSpray', b: data[0][0], e: data[data.length-1][0], d: data, s: src};

			console.log("received pitch event message from source " + current_remoteEvent[src]); 
			current_remoteEvent[src]=snakeEvent(m_pTab.label(data.i));
			current_remoteEvent[src].d=data.d;
			current_remoteEvent[src].s=src;

			current_remoteEvent[src].track=m_track[m_trackNum[data.trackName]];
			current_remoteEvent[src].head=data.head;
			current_remoteEvent[src].tail=data.tail;

			current_remoteEvent[src].updateMinTime();
			current_remoteEvent[src].updateMaxTime();
			displayElements.push(current_remoteEvent[src]);
		});

		//------------------------------------------------------------------------------------
		comm.registerCallback("rhythmEvent", function(data, src) {

			console.log("received rhythm event message from source with data.i = " + data.i); 
			current_remoteEvent[src]=snakeEvent(m_rTab.label(data.i));
			current_remoteEvent[src].d=data.d;
			current_remoteEvent[src].s=src;

			current_remoteEvent[src].track=m_track[m_trackNum[data.trackName]];
			current_remoteEvent[src].head=data.head;
			current_remoteEvent[src].tail=data.tail;

			current_remoteEvent[src].updateMinTime();
			current_remoteEvent[src].updateMaxTime();
			displayElements.push(current_remoteEvent[src]);

		});


		//---------------------------------------------------------------------------
		comm.registerCallback('metroPulse', function(data, src) {
			time.serverTimeSinceOrigin=data-time.serverTimeOrigin;

			time.update();
			time.deltaTime = time.serverTimeSinceOrigin - time.sinceOrigin;
			console.log("Difference between server and local accumulated time = " + time.deltaTime);

		});
		//---------------------------------------------------------------------------
		comm.registerCallback('startTime', function(data) {
			console.log("server startTime = " + data[0] );
			lastSendTimeforCurrentEvent= -Math.random()*sendCurrentEventInterval; // so time-synched clients don't all send their countour chunks at the same time. 
			m_lastDisplayTick=0;
			displayElements=[];		

			time.init(data[0]);
		});
		//---------------------------------------------------------------------------
		// Just make a color for displaying future events from the client with the src ID
		comm.registerCallback('newmember', function(data, src) {
			console.log("new member : " + src);
			colorIDMap[src]=utils.getRandomColor1(100,255,0,120,100,255);
		});
		//---------------------------------------------------------------------------
		// src is meaningless since it is this client
		comm.registerCallback('roommembers', function(data, src) {
			if (data.length > 1) 
					console.log("there are other members in this room!");
			for(var i=0; i<data.length;i++){
				if (data[i] != myID){
					colorIDMap[data[i]]=utils.getRandomColor1(100,255,0,120,100,255);
				}
			}
		});



		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// Client activity
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		var theCanvas = document.getElementById("score");
		var context = theCanvas.getContext("2d");
		var mouseX;
		var mouseY;
		context.font="9px Arial";

		var scoreWindowTimeLength=40000; //ms
		var basePixelShiftPerMs=theCanvas.width/(scoreWindowTimeLength);
		var pixelShiftPerMs=theCanvas.width/(scoreWindowTimeLength);
		//var pxPerSec=pixelShiftPerMs*1000;
		var nowLinePx=theCanvas.width/4;
		config.nowLinePx=nowLinePx;

		console.log("CONFIG NOWLINE IS " + config.nowLinePx);

		var pastLinePx=0; // after which we delete the display elements

		var sprocketHeight=2;
		var sprocketWidth=1;
		var sprocketInterval=1000; //ms


		var m_trackName=["Tempo", "Pitch", "Chord", "Key", "Rhythm", "Dynamics", "Orchestration" ];
		var numTracks = m_trackName.length;
		var trackHeight=theCanvas.height / numTracks;

		m_trackNum={}; // map name to number


		var m_track =[]; // array of {min: max:} values (in pixels) that devide each track on the score
		for (var i=0;i<numTracks;i++){
			m_track[i]={};
			m_track[i].min=i*trackHeight;
			m_track[i].max=(i+1)*trackHeight;
			m_track[i].state=null;
			m_track[i].name=m_trackName[i];
			//--------------------------
			m_trackNum[m_trackName[i]]=i;
		}


		var m_currentTrackSelection=null;

		var getPixelTrackNum = function(y) {
			for (var i=0;i<numTracks;i++){
				if (y< m_track[i].max){
					return i;
				}
			}
		}



		var time2PxOLD=function(t, elapsedTime){ // time measured since timeOrigin
			return nowLinePx+(t-elapsedTime)*pixelShiftPerMs;
		}
		var time2Px=function(t){ // time measured since timeOrigin
			return nowLinePx+(t-time.sinceOrigin)*pixelShiftPerMs;
		}
		var px2Time=function(px){  // relative to the now line
			return (px-nowLinePx)/pixelShiftPerMs;
		}

		var lastDrawTime=0;

		var nowishP = function(t){
			if ((t > lastDrawTime) && (t <= time.sinceOrigin)) return true;
		}


		theCanvas.addEventListener("mousedown", onMouseDown, false);
		theCanvas.addEventListener("mouseup", onMouseUp, false);
		theCanvas.addEventListener("mousemove", onMouseMove, false);

		theCanvas.addEventListener("touchstart", touch2Mouse.touchHandler, true);
      	theCanvas.addEventListener("touchmove", touch2Mouse.touchHandler, true);
      	theCanvas.addEventListener("touchend", touch2Mouse.touchHandler, true);
      	theCanvas.addEventListener("touchcancel", touch2Mouse.touchHandler, true);    


      	time.init();
		drawScreen(0);

		var dispElmt;

		function drawScreen(elapsedtime) {
			//console.log("drawscreen at etime = " + elapsedtime);

			context.clearRect(0, 0, theCanvas.width, theCanvas.height);

			// Add to currently-in-progress mouse gesture if any drawing is going on ------------------
			if (current_mgesture) {
				var m = utils.getCanvasMousePosition(theCanvas, last_mousemove_event);
				var tx=elapsedtime + px2Time(m.x);
				var ypix=m.y;

				if (current_mgesture.type === 'mouseContourGesture'){
					// bound to track limits in the y direction
					//ypix=Math.min(current_mgesture.max, Math.max(current_mgesture.min, ypix));
					ypix = utils.bound(ypix, current_mgesture.track.min, current_mgesture.track.max);
					// drawn contours must only go up in time
					if (tx > current_mgesture.d[current_mgesture.d.length-1][0]){
						current_mgesture.d.push([tx, ypix, k_minLineThickness + k_maxLineThickness*leftSlider.value]);
						current_mgesture_2send.d.push([tx, ypix, k_minLineThickness + k_maxLineThickness*leftSlider.value]);
					}
				} 

				if (current_mgesture.type === 'pitchEvent'){
					// pitch events do not extend in time...
				}
			}
			//---------------------------------------------------------------
 
			if (m_currentTrackSelection != null) {
				context.fillStyle = "#330033";
				context.fillRect(0,m_track[m_currentTrackSelection].min,theCanvas.width,m_track[m_currentTrackSelection].max-m_track[m_currentTrackSelection].min);
			}

			//------------
			//draw track lines
			context.strokeStyle = "#555555";	
			context.lineWidth =1;
				context.textBaseline="middle"; 
				context.fillStyle = "#303030";
				context.font = "20px Arial"
				context.textAlign="right";
			
			for (var i=0;i<numTracks;i++){
					context.fillText(m_track[i].name, theCanvas.width, (m_track[i].max+m_track[i].min)/2);
				context.beginPath();
				context.moveTo(0, m_track[i].min);
				context.lineTo(theCanvas.width, m_track[i].min);
				context.stroke();
				context.closePath();
			}


 			// Draw scrolling sprockets--
 			context.fillStyle = "#999999";
 			var sTime = (elapsedtime+scoreWindowTimeLength*(3/4))- (elapsedtime+scoreWindowTimeLength*(3/4))%sprocketInterval;
			var sPx= time2Px(sTime);
			while(sPx > 0){ // loop over sprocket times within score window
				context.fillRect(sPx,0,sprocketWidth,sprocketHeight);
				context.fillRect(sPx,theCanvas.height-sprocketHeight,sprocketWidth,sprocketHeight);
				sPx-=pixelShiftPerMs*sprocketInterval;
			}

			//------------		
			// Draw the musical display elements 
			var p_beg; 
			var dispe;	
			for(dispElmt=displayElements.length-1;dispElmt>=0;dispElmt--){ // run through in reverse order so we can splice the array to remove long past elements
				dispe = displayElements[dispElmt];	

				// If element is just crossing the "now" line, create little visual explosion
				if (nowishP(dispe.b)){					
					explosion(time2Px(dispe.b), dispe.d[0][1], 5, "#FF0000", 3, "#FFFFFF");

					dispe.track.state = dispe;
					console.log("track " + dispe.track + " has a new state element");
				} 

				// If its moved out of our score window, delete it from the display list
				p_beg=time2Px(displayElements[dispElmt].b);

				// if you are not the current play state element of your type
				if ((p_beg < nowLinePx) && (dispe.track.state != displayElements[dispElmt])){
					// remove event from display list
					displayElements.splice(dispElmt,1);
					console.log("removing element from display list because p_beg is " + p_beg + "and nowx is " + nowLinePx);
				}
				else{
					//console.log("draw event of type " + dispe.type);				
					dispe.draw(context, time2Px, nowishP);
				}
			}

			// draw the "now" line
			context.strokeStyle = "#FF0000";	
			context.lineWidth =1;
			context.beginPath();					
			context.moveTo(nowLinePx, 0);
			context.lineTo(nowLinePx, theCanvas.height);
			context.closePath();
			context.stroke();
			// dots to separate tracks
			context.fillStyle = "#FF0000";	
			for (var i=1;i<numTracks;i++){
				context.beginPath();
				context.arc(nowLinePx, m_track[i].min, 2 ,0,2*Math.PI);
				context.closePath();
				context.fill();
			}



			lastDrawTime=elapsedtime;

		}


		function explosion(x, y, size1, color1, size2, color2) {
			var fs=context.fillStyle;
			var ss = context.strokeStyle;

			context.beginPath();
			context.fillStyle=color1;
			context.arc(x,y,size1,0,2*Math.PI);
			context.closePath();
			context.fill();
									
			context.beginPath();
			context.strokeStyle=color2;
			context.lineWidth = size2;
			context.arc(x,y,size1,0,2*Math.PI);
			context.stroke();
			context.lineWidth = 1;

			context.fillStyle=fs;
			context.strokeStyle=ss;
		}


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		function initiateScoreGesture(x, y){
			var z = k_minLineThickness + k_maxLineThickness*leftSlider.value;
			// time at the "now" line + the distance into the future or past 		
			time.update();
			var t = time.sinceOrigin + px2Time(x);	

			var radioSelection=m_tabTab.currentSelection();
			

			if (radioSelection==="Tempo"){
				y = utils.bound(y, m_track[m_trackNum["Tempo"]].min, m_track[m_trackNum["Tempo"]].max);
				current_mgesture=snakeEvent();

				current_mgesture.head=false;
				current_mgesture.tail=true;
				current_mgesture.color="#00FF00";  // local color is always this

				comm.sendJSONmsg("beginMouseTempoContour", {"d":[[t,y,z]], "i":null, "trackName":radioSelection, "head":current_mgesture.head, "tail": current_mgesture.tail  });
				current_mgesture_2send={type: 'mouseContourGesture', d: [], s: myID}; // do I need to add the source here??

			} 

			if (radioSelection==="Dynamics"){
				y = utils.bound(y, m_track[m_trackNum["Dynamics"]].min, m_track[m_trackNum["Dynamics"]].max);
				current_mgesture=snakeEvent();

				current_mgesture.head=false;
				current_mgesture.tail=true;
				current_mgesture.color="#00FF00";  // local color is always this
				comm.sendJSONmsg("beginMouseDynamicsContour", {"d":[[t,y,z]], "i":null, "trackName":radioSelection, "head":current_mgesture.head, "tail": current_mgesture.tail  });
				current_mgesture_2send={type: 'mouseContourGesture', d: [], s: myID}; // do I need to add the source here??
			} 


			if (radioSelection==="Pitch"){
				y = (m_trackNum["Pitch"] && (m_track[m_trackNum["Pitch"]].min + m_track[m_trackNum["Pitch"]].max)/2) || y;
				current_mgesture=snakeEvent(m_pTab.currentSelection());
				//comm.sendJSONmsg("pitchEvent", {"d":[[t,y,z]], "i":m_pTab.currentIndex()});
				current_mgesture.head="circle";
				current_mgesture.tail=true;
				current_mgesture.color="#00FF00";  // local color is always this
				comm.sendJSONmsg("pitchEvent", {"d":[[t,y,z]], "i":m_pTab.currentIndex(), "trackName":radioSelection, "head":current_mgesture.head, "tail": current_mgesture.tail  });
				current_mgesture_2send={type: 'mouseContourGesture', d: [], s: myID}; // do I need to add the source here??
			}

			if (radioSelection==="Rhythm"){
				y = (m_trackNum["Rhythm"] && (m_track[m_trackNum["Rhythm"]].min + m_track[m_trackNum["Rhythm"]].max)/2) || y;
				current_mgesture=snakeEvent(m_rTab.currentSelection());
				current_mgesture.head="image";
				current_mgesture.tail=true;
				current_mgesture.color="#00FF00";  // local color is always this
				comm.sendJSONmsg("rhythmEvent", {"d":[[t,y,z]], "i":m_rTab.currentIndex(), "trackName":radioSelection, "head":current_mgesture.head, "tail": current_mgesture.tail  });
				current_mgesture_2send={type: 'mouseContourGesture', d: [], s: myID}; // do I need to add the source here??
			}

			if (radioSelection==="Chord"){
				y = (m_trackNum["Chord"] && (m_track[m_trackNum["Chord"]].min + m_track[m_trackNum["Chord"]].max)/2) || y;
				current_mgesture=snakeEvent(m_cTab.currentSelection());

				current_mgesture.head="diamond";
				current_mgesture.tail=false;
				current_mgesture.color="#00FF00";  // local color is always this

				comm.sendJSONmsg("chordEvent", {"d":[[t,y,z]], "i":m_cTab.currentIndex(), "trackName":radioSelection, "head":current_mgesture.head, "tail": current_mgesture.tail  });
				current_mgesture_2send={type: 'mouseContourGesture', d: [], s: myID}; // do I need to add the source here??

			}

			if (radioSelection==="Key"){
				y = (m_trackNum["Key"] && (m_track[m_trackNum["Key"]].min + m_track[m_trackNum["Key"]].max)/2) || y;
				current_mgesture=snakeEvent(m_kTab.currentSelection());

				current_mgesture.head="rectangle";
				current_mgesture.tail=false;
				current_mgesture.color="#00FF00";  // local color is always this

				comm.sendJSONmsg("keyEvent", {"d":[[t,y,z]], "i":m_kTab.currentIndex(), "trackName":radioSelection, "head":current_mgesture.head, "tail": current_mgesture.tail  });
				current_mgesture_2send={type: 'mouseContourGesture', d: [], s: myID}; // do I need to add the source here??
			}

			if (radioSelection==="Orchestration"){
				y = (m_trackNum["Orchestration"] && (m_track[m_trackNum["Orchestration"]].min + m_track[m_trackNum["Orchestration"]].max)/2) || y;
				current_mgesture=snakeEvent(m_oTab.currentSelection());

				current_mgesture.head="rectangle";
				current_mgesture.tail=false;
				current_mgesture.color="#FF00FF";  // local color is always this
				current_mgesture.font="16px Arial";

				comm.sendJSONmsg("orchEvent", {"d":[[t,y,z]], "i":m_oTab.currentIndex(), "trackName":radioSelection, "head":current_mgesture.head, "tail": current_mgesture.tail  });
				current_mgesture_2send={type: 'mouseContourGesture', d: [], s: myID}; // do I need to add the source here??
			}


			current_mgesture.d=[[t,y,z]];
			current_mgesture.s=myID;

			current_mgesture.track=m_track[m_trackNum[radioSelection]];
			current_mgesture.updateMinTime();
			current_mgesture.updateMaxTime();

			displayElements.push(current_mgesture);

		}

		function endContour(){
			//console.log("current event is " + current_mgesture + " and the data length is " + current_mgesture.d.length);
			current_mgesture.updateMinTime(current_mgesture.d[0][0]);
			//current_mgesture.e=current_mgesture.d[current_mgesture.d.length-1][0];
			current_mgesture.updateMaxTime(current_mgesture.d[current_mgesture.d.length-1][0]);
			
			if (myRoom != '') {
				console.log("sending event");
				if (current_mgesture_2send){
					if (current_mgesture_2send.d.length > 0){
						comm.sendJSONmsg("mouseGesture", current_mgesture_2send.d);
					}
					//comm.sendJSONmsg("endMouseEventSpray", []);
				}	
			}
			current_mgesture=undefined;
			current_mgesture_2send=undefined;
		}
	
		// Record the time of the mouse event on the scrolling score
		function onMouseDown(e){
			event.preventDefault();
			var m = utils.getCanvasMousePosition(theCanvas, e);
			var x = m.x;
			var y = m.y;

			var clickedTrack=getPixelTrackNum(y);
			console.log("clicked track " + clickedTrack + " and current tabTab index is " + m_tabTab.currentIndex());

			if (clickedTrack === Number(m_tabTab.currentIndex())){
				initiateScoreGesture(x, y);				
			} else{
				console.log("selecting new track");
				m_currentTrackSelection=clickedTrack;
				m_tabTab.SelectRadio(m_currentTrackSelection);
			}

			last_mousemove_event=e;
		}


		m_tabTab.on('click', function(){console.log("YOYO"); m_currentTrackSelection =m_tabTab.currentIndex(); }); // Crockford's eventuality

		function onMouseUp(e){
			current_mgesture && endContour();
		}

		function onMouseMove(e){
			last_mousemove_event=e;
		}


		//	++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

		var timerLoop = function(){

			time.update();
			var t_sinceOrigin = time.sinceOrigin;
			
			drawScreen(t_sinceOrigin);

			// create a display clock tick every 1000 ms
			while ((t_sinceOrigin-m_lastDisplayTick)>1000){  // can tick more than once if computer went to sleep for a while...
				m_tickCount++;
				k_timeDisplayElm.innerHTML=Math.floor(m_lastDisplayTick/1000);
				m_lastDisplayTick += 1000;
			}

			//-----------  if an event is in the middle of being drawn, send it every sendCurrentEventInterval
			// send current event data periodically (rather than waiting until it is complete)
			//console.log("time since origin= " + t_sinceOrigin + ", (t_sinceOrigin-lastSendTimeforCurrentEvent) = "+ (t_sinceOrigin-lastSendTimeforCurrentEvent));
			if ((current_mgesture_2send!=undefined) && ((t_sinceOrigin-lastSendTimeforCurrentEvent) > sendCurrentEventInterval)){
				//console.log("tick " + t_sinceOrigin);
				if (myRoom != '') {
					//console.log("sending event");
					if (current_mgesture_2send.d.length > 0)
						comm.sendJSONmsg("mouseGesture", current_mgesture_2send.d);
				}
				current_mgesture_2send.d=[];
 				lastSendTimeforCurrentEvent=t_sinceOrigin;
			}
			
			//--------------------------------------------------------

			myrequestAnimationFrame(timerLoop);
		};

		timerLoop();  // fire it up

		//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// callback from html
		//var roomselect = app.querySelector('#roomList');
		var roomselect = document.getElementById('roomList');
		//console.log("roomselect = " + roomselect);

		var favBrowser = function(){
			var mylist=document.getElementById("myList");
			document.getElementById("current_room").value=mylist.options[mylist.selectedIndex].text;
		}

		roomselect.addEventListener('change', function(e) {

			if (myRoom != '') comm.sendJSONmsg("unsubscribe", [myRoom]);

        	myRoom  = e.currentTarget.value;
        	//document.getElementById("current_room").value=mylist.options[mylist.selectedIndex].text;
        	document.getElementById("current_room").value=myRoom;

			if (myRoom != '') {
        		// just choose a default room (rather than getting a list from the server and choosing)
				comm.sendJSONmsg("subscribe", [myRoom]);
				// Tell everybody in the room to restart their timers.
				comm.sendJSONmsg("startTime", []);
			} 
   		 })

	}
);