var admin = require("firebase-admin");
var path = require('path');

// for debug messages of firebase
//admin.database.enableLogging(true);

if (process.argv.length < 4) {
  console.log('Usage: node index.js <command> <project_id> <credential_json_path>');
  process.exit(1);
}

// init firebase
var serviceAccount = require(path.resolve(process.argv[4]));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://" + process.argv[3] + ".firebaseio.com"
});

switch (process.argv[2]) {
  case 'add_child-and-value':
    addChildAndValue();
    break;
  default:
    console.log('invalid command')
    process.exit(1);
}

function addChildAndValue() {
  // DB reference for example data
  var db = admin.database();
  var ref = db.ref("firebase-example/data");

  var cities = [
    { city_name: "Shibuya", prefecture: "Tokyo" },
    { city_name: "Tokorozawa", prefecture: "Saitama" },
    { city_name: "Ichikawa", prefecture: "Chiba" },
    { city_name: "Kawagoe", prefecture: "Saitama" },
    { city_name: "Shinjuku", prefecture: "Tokyo" },
    { city_name: "Toshima", prefecture: "Tokyo" },
    { city_name: "Chiba", prefecture: "Chiba" }
  ]
  // clear data
  ref.set({})
  .then(function() {
    // set example data
    Promise.all(
      cities.map(function(elem, idx) { return ref.child("data" + idx).set(elem) })
    )
  })
  .then(function() {
    console.log('example data saved.')
  })
  .then(function() {
    var tokyoQuery = ref.orderByChild('prefecture').equalTo('Tokyo');
    tokyoQuery.on('child_added', function(snapshot) {
      console.log('child_added: ', snapshot.val());
    })
    tokyoQuery.once('value', function(snapshot) {
      console.log('value', snapshot.val());
    })
  })
  .catch(function(e) {
    console.log('failed to save example data.', e)
    process.exit(1)
  });
}
