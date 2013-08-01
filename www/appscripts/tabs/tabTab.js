
define(
	["utils"],
	function (utils) {
		return function(){
 			var docDiv="radioSelectDiv"; // already on index.html
 			var k_inputElmtName="tabTab";
 			var radioButtonArray = document.getElementsByName(k_inputElmtName); 
 			var numRows=2;
 			var numCols=3;
 			var k_labels=["Spray",     "Dynamics",    "Tempo",    "Pitch",    "Rhythm",     "Chord" ];
			var k_tabPane=["sprayTab", "dynamicsTab", "tempoTab", "pitchTab", "rhythmTab",  "chordTab" ];


 			var myInterface={};
 			var m_currentSelectionIndex;

			// Create HTML for this Tab -------------------------------------
			var i,j, tindex;

			var thisTab=document.getElementById(docDiv);
			var tableElmt = document.createElement("div");
			tableElmt.setAttribute("border", "1");

			tindex=0;
			for(j=0;j<numRows;j++){
				var rowElmt=document.createElement("tr");
				if (tindex >= k_labels.length) break;									
				for(i=0;i<numCols;i++){
					if (tindex >= k_labels.length) break;
					var cellElmt = document.createElement("td");
					var inputElmt = document.createElement("input");
					var uid=utils.uid();

					inputElmt.setAttribute("type", "radio");
					inputElmt.setAttribute("name", k_inputElmtName );    // used for styling
					inputElmt.setAttribute("value", tindex );
					//inputElmt.setAttribute("value", k_labels[tindex] );
					inputElmt.setAttribute("id", uid);  

					cellElmt.appendChild(inputElmt);

					var labelElmt=document.createElement("label");
					labelElmt.setAttribute("for" , uid);
					labelElmt.innerHTML=k_labels[tindex];

					cellElmt.appendChild(labelElmt);

					rowElmt.appendChild(cellElmt);

					tindex=tindex+1;
				}

				tableElmt.appendChild(rowElmt);
			}

			thisTab.appendChild(tableElmt);


			//----------------------------------------------------------------
			// Interface methods

			myInterface.SelectRadio = function(pnum){
				console.log("pnum is " + pnum + ", and k_inputElmtName = " + k_inputElmtName);
				radioButtonArray[pnum].checked = true;
				m_currentSelectionIndex=pnum; 

				setTab(k_tabPane[pnum]);  // make the corresponding pane visible
			}

			myInterface.handleClick = function(object){
				console.log("in handleClick and  object is " + object + ", and pitch button has value " + object.target.value);
				myInterface.SelectRadio(object.target.value);
			}

			myInterface.currentSelection = function(){
				return k_labels[m_currentSelectionIndex];
			};


			// show the right pane
			var setTab=function(showTab){
				console.log("in setTab, function arg is  " + showTab);
				for(var i=0;i<k_tabPane.length;i++){
					window.document.getElementById(k_tabPane[i]).style.display="none";
				}
				window.document.getElementById(showTab).style.display="inline-block";
			}


			//----------------------------------------------------------------
			// Initialization

			myInterface.SelectRadio(1);

			for(var i=0;i<radioButtonArray.length;i++){
				console.log("assigning " + radioButtonArray[i] + " a handler")
				radioButtonArray[i].onclick=myInterface.handleClick;
			};


			return myInterface;
		}
	}
	)