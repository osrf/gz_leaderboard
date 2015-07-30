(function(document) {
  'use strict';

  document.addEventListener('polymer-ready', function() {
    // Perform some behaviour
    console.log('polymer-ready');
    var tmpl = document.querySelector("#tmpl")
    tmpl.title = "Gazebo course leaderboard"
    tmpl.selected = "leaders"
  })

  setInterval(function () {
     let leaderboard = document.querySelector("#leaderboard")
     try {
      leaderboard.refresh()  
     }
     catch(e)
     {
       console.log('error refresh ', e)
     }
     
  }, 5000)

  
// wrap document so it plays nice with other libraries
// http://www.polymer-project.org/platform/shadow-dom.html#wrappers
})(wrap(document))
