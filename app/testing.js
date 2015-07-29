var k = require('./queries');
k.getSubwayWeight([
   {
      "lat":"40.8680723323",
      "lng":"-73.9198990008",
      "id":"256",
      "name":"Inwood - 207th St"
   },
   {
      "lat":"40.8654913316",
      "lng":"-73.9272709991",
      "id":"432",
      "name":"Dyckman St"
   },
   {
      "lat":"40.8590223313",
      "lng":"-73.9341799994",
      "id":"398",
      "name":"190th St"
   },
   {
      "lat":"40.8516953317",
      "lng":"-73.9379690016",
      "id":"397",
      "name":"181st St"
   },
   {
      "lat":"40.847391333",
      "lng":"-73.9397039967",
      "id":"135",
      "name":"175th St"
   },
   {
      "lat":"40.8407193325",
      "lng":"-73.9395609999",
      "id":"133",
      "name":"168th St"
   }], 500)
   .then(function(sum) {
     console.log(sum);
   })
   .catch(function(err) {
     console.log(err);
   });
