[![NPM Version](http://img.shields.io/npm/v/dispatchy.svg?style=flat)](https://npmjs.org/package/dispatchy)
[![Build Status](http://img.shields.io/travis/royriojas/dispatchy.svg?style=flat)](https://travis-ci.org/royriojas/dispatchy)

# dispatchy
A jquery like event emitter/dispatcher that could be mixed with other objects to provide emitting capabilities ala jQuery Style

## Install

```bash
npm i --save dispatchy
```

## Usage

`dispatchy` implements the same interface of the jquery events related methods, but for any object.

## Example

```javascript 
var dispatchy = require('dispatchy');

var myObject = dispatchy.create(); // will return a newly fresh dispatchy instance for your use and pleasure

// now you can do

myObject.on('some:event', function (e, args) {
  // do something when the event is fired
  console.log('received', args.some);
});

later you can

myObject.fire('some:event', {
  some: 'data'
});

//and you will see in the console
// received data.
```

## API

**The main methods are:**

- **on**: add event listeners to the dispatcher instance
  ```javascript
  var obj = {};
  var dispatchy = require('dispatchy');
  var extend = require(lodash.merge);
  
  extend(obj, dispatchy);
  
  obj.on('some:event', function(e, args) {
    console.log('handler called for ', e, args);
  });
  
  obj.on('some:event another:event', function(e, args) {
    console.log('handler called for ', e, args);
  });
  
  obj.on('some:event.namespace1 another:event.namespace2', function (e, args) {
    console.log('handler called for ', e, args);
  });
  
  obj.on( {
    'item:action' : function (e, args) {
      console.log('handler called for', e, args);
     },
    'another:action.withNS some:other:here.too': function (e, args) {
      console.log('handler called for', e, args);
    }
  } );
  ```

- **off**: remove event listeners from the dispatcher instance
  ```javascript
  var fn = function(e, args) {
        console.log('handler called for ', e, args);
      };
  // registering the listener
  obj.on('some:event', fn);
  
  // removing it
  obj.off('some:event', fn);
  
  // registering the listener
  obj.on('another:event.withNamespace', function (e) {});
  
  // removing it using the namespace. No need to pass the listener
  obj.off('another:event.withNamespace');
  
  // registering the listeners
  obj.on('another:event.withNamespace', function (e) {});
  obj.on('justonemore:event.withNamespace', function (e) {});
  
  // removing all events with the given namespace. handy to remove all events with the same namespace
  obj.off('.withNamespace');
  ```

- **one**: add an event to the dispatcher instance that will be removed after its execution
  ```javascript
  var obj = {};
  var dispatchy = require('dispatchy');
  var extend = require(lodash.merge);
  
  extend(obj, dispatchy);
  
  obj.one('some:event', function(e, args) {
    console.log('handler called for ', e, args);
  });
  
  obj.one('some:event another:event', function(e, args) {
    console.log('handler called for ', e, args);
  });
  
  obj.one('some:event.namespace1 another:event.namespace2', function (e, args) {
    console.log('handler called for ', e, args);
  });
  
  obj.one( {
    'item:action' : function (e, args) {
      console.log('handler called for', e, args);
     },
    'another:action.withNS some:other:here.too': function (e, args) {
      console.log('handler called for', e, args);
    }
  } );
  ```
- **fire**: fires an event, executing all the listeners added to the particular fired event,
  ```javascript
  var fn = function(e, args) {
    console.log('handler called for ', e, args);
  };
  // registering the listener
  obj.on('some:event', fn);
  
  // executing it
  obj.fire('some:event');
  
  // registering other listener
  obj.on('some:event.withNamespace', function (e) {});
  
  // this will fire the event with the given namespace if found. won't try to fire some:event.
  obj.fire('some:event.withNamespace');
  
  // execute all events of the given namespace
  obj.fire('.withNamespace');
  ```

**Other methods:** This methods are not like the ones in jQuery but can be used to achieve something like
`special events` on the dispatchers. 

- **registerEvent**: Register an event with a given lifecycle, similar to [jQuery Special Events](http://learn.jquery.com/events/event-extensions/#setup-function-data-object-namespaces-eventhandle-function)
  ```javascript
  var customEventLifeCycle = {
    // executed the first time a listener is added for the given event
    setup: function () {},
    // executed every time an event listener is added
    add: function () {},
    // executed every time an event listener is removed
    remove: function () {},
    // execute when the last listener is about to be removed from the dispatcher
    teardown: function () {}
  };
  
  var dispatchy = require('dispatchy').create();
  dispatchy.registerEvent('app:ready', customLifeCycle);
  
  ```

- **registerPersistentEvent**: For a lack of a better name this method register a special event that once is fired
  Any listeners added after will be immediately executed. Is like the jQuery `ready` event.
  ```javascript
  var dispatchy = require('dispatchy');
  dispatchy.registerPersistentEvent('app:ready');
  
  dispatchy.fire('app:ready', { some: 'data' }); // no event listeners added yet.. no problem
  
  // later in the code
  
  dispatchy.on('app:ready', function (e, args) {
    // this will be executed immediately, the args passed to the original event 
    // are also passed to this one so in this case the args will be
    // { some: 'data' } 
  });
  ```