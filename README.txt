
The "Anticipatory Score" is a shared "dynamic" score based on a scrolling piano roll model. 
Visitors to the webpage make musical notations visible to all others. Notation are made "in the future", and scroll towards the "now" line. After crossing the now line, the notations represent
the current state and stay on screen until replaced by other notation crossing into the now.  

The architecture is essentially a "chat room" running on a node.js server. 
Clients are kept roughly in synch by server clock ticks that are tracked by clients. 

----------------------------------------------------------------------------

