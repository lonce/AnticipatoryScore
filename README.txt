
If you have a good internet connection, just have the ensemble members point their browsers (Chrome is best) to:
animatedsoundworks.com:8005

----------------------------------------------------------------------------

If you don't have a good internet connection, this computer can function as the server locally:

 1) Run (double click on) "Run_Anticipatory_Score"

 2) Have ensemble members connect their computers to the wireless network you named (e.g. "Anticipatory Score")

 3) Open a cmd window (click on the Windows icon and type "cmd" into the text-box)
	a) In the cmd window, type "ipconfig"
	b) Look for the IPv4 Address that comes up (having a pattern something like:  172.23.37.178)

 4) Have ensemble members point their browsers to:
	ip-address:8005   (will look something like: 172.23.37.178:8005)

	(----------------------------------------------------------------------)


If for some reason, the AnticiaptoryScore network isn't visible to people, you might have to
set up an ad hoc net before doing the above steps:


0)  Open Network and Sharing Center
     a) Setup a new connection or network
     b) Set up a wireless ad hoc (computer-to-computer) network
     c) next
     d) Type in network name, (eg "AnticipatoryScore")
     e) set Security Type to "No authentification (Open)"


----------------------------------------------------------------------------
To get the latest code for Anticiaptory Score:
0) make sure you are connected to the internet
1) Open a cmd window
2) navigate to the AnticipatoryScore directory
3) type > git pull