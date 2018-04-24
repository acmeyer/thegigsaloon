'use strict';
/* global Parse */

Parse.Cloud.define('test_push', function(request, response) {
  Parse.Cloud.useMasterKey();

  var query = new Parse.Query(Parse.Installation);

  var data;
  if (request.params.url === 'link') {
    data = {
      alert: 'Hey, look at this great website',
      url: 'https://www.fbf8.com/',
      background_data: true
    };
  } else {
    data = {
      alert: 'Test notification',
      background_data: true
   };
  }

  data.badge = 'Increment';

  Parse.Push.send({
    where: query,
    push_time: new Date(Date.now() + 3000),
    badge: 'Increment',
    data: data,
  }, {useMasterKey: true}).then(
    function() { response.success([]); },
    function(error) { response.error(error); }
  );
});
