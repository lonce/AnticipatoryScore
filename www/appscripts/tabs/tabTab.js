
define(
	["utils"],
	function (utils) {
		return function(){
 			var docDiv="radioSelectDiv"; // already on index.html
 			var k_inputElmtName="tabTab";
 			var radioButtonArray = document.getElementsByName(k_inputElmtName); 
 			var numRows=2;
 			var numCols=3;
 			var k_labels=["Tempo", "Pitch", "Chord", "Key", "Rhythm", "Dynamics" ];
			var k_tabPane=["tempoTab", "pitchTab",  "chordTab", "keyTab", "rhythmTab", "dynamicsTab"];


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
				radioButtonArray[pnum].checked = true;
				m_currentSelectionIndex=pnum; 

				setTab(k_tabPane[pnum]);  // make the corresponding pane visible

			}


			myInterface.handleClick = function(object){
				myInterface.SelectRadio(object.target.value, object);

				console.log("YAYA");
				myInterface.fire(object);

			}

			myInterface.currentSelection = function(){
				return k_labels[m_currentSelectionIndex];
			};

			myInterface.label = function(id){
				return k_labels[id];
			};
			
			myInterface.currentIndex = function(){
				return m_currentSelectionIndex;
			};

			// show the right pane
			var setTab=function(showTab){
				//console.log("in setTab, function arg is  " + showTab);
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


			utils.eventuality(myInterface);
			return myInterface;
		}
	}
	)