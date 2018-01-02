/**
 * Super tiny implementation of a jQuery like event pub sub functionality
 *
 * @class dispatchy
 * @static
 */

var trim = function ( str ) {
  return ((str || '').toString()).trim();
};

var typeOf = function ( obj ) {
  return Object.prototype.toString.call( obj ).replace( /^\[object (.+)\]$/, '$1' ).toLowerCase();
};

var isObject = function ( obj ) {
  return typeOf( obj ) === 'object';
};

var isNull = require( 'is-null-like' );

var isNullOrEmpty = function ( arg ) {
  return isNull( arg ) || arg === '';
};

var dispatchy = {
  /**
   * Register a listener for given type
   *
   * @method on
   * @chainable
   * @param type {Object|String} the type of the event.
   * If the type is an Object the string keys represent one or more space-separated event types and optional
   * namespaces, and the values represent a handler function to be called for the event(s).
   * If the type is a String it could be list of events separated by spaces, like :
   * `'some:event', 'some:event another:event', 'some:event.namespace1 another:event.namespace2'`
   *
   * @param [fn] {Function} the listener to be executed when the event of the given type is executed. If the `type`
   * parameter is an object then this parameter is expected to be
   * @param [justOnce=false] {Boolean} if true the listener will be removed after executed. It is for internal use only,
   * to execute a function only once use `one`.
   * @return {Object} the thisObj object where this utility is mixed at.
   @example

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

   */
  on: function ( type, fn, justOnce ) {
    var me = this;

    if ( isObject( type ) ) {
      Object.keys( type ).forEach( function ( key ) {
        me.on( key, type[ key ], justOnce );
      } );
      return me;
    }

    me._parseTypes( type, function ( args ) {
      args.listener = fn;
      args.justOnce = justOnce;
      me._on( args );
    } );
    return me;
  },

  /**
   * Whether the dispatching of event handlers is disabled or not
   * @property {Boolean} __dispatcherDisabled
   * @default false
   */
  __dispatcherDisabled: false,

  /**
   * Register a listener for given type. The listener will be executed only once.
   *
   * @method one
   * @chainable
   * @param type {Object|String} the type of the event.
   * If the type is an Object the string keys represent one or more space-separated event types and optional
   * namespaces, and the values represent a handler function to be called for the event(s).
   * If the type is a String it could be list of events separated by spaces, like :
   * `'some:event', 'some:event another:event', 'some:event.namespace1 another:event.namespace2'`
   *
   * @param [fn] {Function} the listener to be executed when the event of the given type is executed. If the `type`
   * parameter is an object then this parameter is expected to be
   * @return {Object} the thisObj object where this utility is mixed at.
   *
   @example

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

   */
  one: function ( type, fn ) {
    return this.on( type, fn, true );
  },

  /**
   * Removes a listener for a given type. If no listener is passed all the listeners for the given type will be removed.
   * @method off
   * @chainable
   * @param type {String} A list of events separated by spaces, like :
   * `'some:event', 'some:event another:event', 'some:event.namespace1 another:event.namespace2'`
   * @param fn {Function} the listener to be registered on the given type
   * @return {Object} the thisObj object where this utility is mixed at.
   * @example

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
   */
  off: function ( type, fn ) {
    var me = this;
    me._parseTypes( type, function ( args ) {
      args.listener = fn;
      me._off( args );
    } );
    return me;
  },

  /**
   * Execute the listeners for the events registered for the given type.
   * @method fire
   * @param type {String} A list of events separated by spaces, like :
   * `'some:event', 'some:event another:event', 'some:event.namespace1 another:event.namespace2'`. If the string contains
   * the namespace it will fire only that particular instance.
   * @param args {Object} the payload for the event
   * @return {Object} the thisObj object where this utility is mixed at.
   * @chainable
   *
   * @example
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
   *
   */
  fire: function ( type, args ) {
    var me = this;

    if ( me.__dispatcherDisabled ) {
      return me;
    }

    me._parseTypes( type, function ( opts ) {
      opts.args = args;
      me._trigger( opts );
    } );
    return me;
  },
  _parseTypes: function ( type, cb ) {
    type = trim( type );
    var events = type.split( /\s+/g );

    events.forEach( function ( evt ) {
      var parts = evt.split( '.' );

      var eventName = parts.shift();

      cb && cb( { type: eventName, namespace: parts } );

    } );
  },
  _on: function ( args ) {
    var me = this,
      type = args.type,
      listener = args.listener,
      namespace = args.namespace,
      justOnce = !!args.justOnce;

    if ( typeof listener !== 'function' ) {
      throw new TypeError( 'listener is not a function' );
    }
    var listeners = me.__listeners = (me.__listeners || { }),
      listenersOfType = listeners[ type ] = (listeners[ type ] || []);

    var entry = {
      type: type,
      listener: listener,
      namespace: namespace,
      justOnce: justOnce
    };

    me.__customEvents = me.__customEvents || { };

    var customEvent = me.__customEvents[ type ];

    if ( customEvent ) {
      if ( listenersOfType.length === 0 ) {
        customEvent.setup && customEvent.setup( entry );
      }
      customEvent.add && customEvent.add( entry );
    }

    listenersOfType.push( entry );
  },
  _off: function ( args ) {
    var me = this,
      type = args.type,
      listener = args.listener,
      namespace = trim( args.namespace );

    var typeDefined = !isNullOrEmpty( type ),
      listenerDefined = !isNull( listener ),
      nsDefined = !isNullOrEmpty( namespace );

    var listeners = me.__listeners = (me.__listeners || { });

    var operateOnType = function ( aType ) {
      var listenersOfType = listeners[ aType ];

      if ( !listenersOfType ) {
        return;
      }

      me.__customEvents = me.__customEvents || { };
      var customEvent = me.__customEvents[ type ];

      if ( !listenerDefined && !nsDefined ) {

        if ( customEvent ) {

          var length = listenersOfType.length;
          /* istanbul ignore else */
          if ( length > 0 ) {
            listenersOfType.forEach( function ( entry ) {
              customEvent.remove && customEvent.remove( entry );
            } );

            customEvent.teardown && customEvent.teardown( listenersOfType[ length - 1 ] );
          }
        }

        listeners[ aType ] = null;
        return;
      }

      listeners[ aType ] = listenersOfType.filter( function ( entry ) {
        var sameListener = entry.listener === listener,
          sameNamespace = nsDefined && (entry.namespace.filter( function ( ns ) {
                return ns === namespace;
              } ).length > 0);

        var shouldBeRemoved = ((listenerDefined && !nsDefined && sameListener) || (listenerDefined && nsDefined && sameListener && sameNamespace) || (!listenerDefined && nsDefined && sameNamespace));

        if ( shouldBeRemoved ) {
          if ( customEvent ) {
            customEvent.remove && customEvent.remove( entry );
          }
        }
        return !shouldBeRemoved;
      } );

      if ( customEvent ) {
        var len = listenersOfType.length;
        if ( len > 0 && listeners[ aType ].length === 0 ) {
          var lastEntry = listenersOfType[ len - 1 ];
          customEvent.teardown && customEvent.teardown( lastEntry );
        }
      }
    };

    if ( typeDefined ) {
      operateOnType( type );
      return;
    }

    Object.keys( listeners ).forEach( function ( aType ) {
      operateOnType( aType );
    } );
  },
  _trigger: function ( opts ) {

    var type = opts.type,
      typeDefined = !isNullOrEmpty( type ),
      namespace = trim( opts.namespace ),
      nsDefined = !isNullOrEmpty( namespace ),
      args = opts.args;

    if ( !typeDefined && !nsDefined ) {
      return;
    }

    var me = this,
      listeners = me.__listeners = (me.__listeners || { });

    var operateOnType = function ( aType ) {
      var listenersOfType = listeners[ aType ];
      if ( !listenersOfType ) {
        return;
      }

      if ( listenersOfType.length > 0 ) {
        listeners[ aType ] = listenersOfType.filter( function ( entry ) {

          var entryNamespace = entry.namespace;
          var isFound = nsDefined && (entryNamespace.filter( function ( ns ) {
                return ns === namespace;
              } ).length > 0);

          if ( (!nsDefined || isFound) && entry.listener ) {
            entry.listener( { type: aType, namespace: namespace }, args );
            return !entry.justOnce;
          }
          return true;
        } );
      }
    };

    if ( typeDefined ) {
      operateOnType( type );
      return;
    }

    Object.keys( listeners ).forEach( function ( aType ) {
      operateOnType( aType );
    } );
  },

  /**
   * Register a kind of special event that will have some hooks executed during its life cycle
   *
   * @method registerEvent
   * @param evt {String} the event name to register
   * @param lifeCycle {Object} the custom lifecyle object
   * @param lifeCycle.setup {Function} callback to be executed the first time an eventListener is added for this event
   * @param lifeCycle.add {Function} callback to be executed each time an eventListener is added for this event
   * @param lifeCycle.remove {Function} callback to be executed each time an eventListener is removed for this event
   * @param lifeCycle.teardown {Function} callback to be executed each time an eventListener is teardown for this event
   */
  registerEvent: function ( evt, lifeCycle ) {
    var me = this;
    me.__customEvents = me.__customEvents || { };
    me.__customEvents[ evt ] = lifeCycle;
  },

  /**
   * Register a special event that, once it is fired, any callback added to it will be always fired with the same arguments
   * as the original event
   *
   * @method registerPersistentEvent
   * @param eventName
   */
  registerPersistentEvent: function ( eventName ) {
    var me = this;
    var args;

    me.registerEvent( eventName, {
      add: function ( evtArgs ) {

        var oldHandler = evtArgs.listener;

        if ( args ) {
          oldHandler && oldHandler.apply( null, args );
          return;
        }

        evtArgs.listener = function () {
          if ( !args ) {
            args = arguments;
          }

          return oldHandler && oldHandler.apply( null, args );
        };
      }
    } );

    me.one( eventName, Function.prototype );
  },

  /***
   * Creates an instance of the dispatchy
   * @method create
   * @return {dispatchy} a dispatchy instance
   */
  create: function () {
    return Object.create( this );
  }
};

module.exports = dispatchy;
