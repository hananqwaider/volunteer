describe( 'base/dispatcher', function () {

  var dispatcherF;
  var sinon = require( 'sinon' );

  beforeEach( function () {
    dispatcherF = require( '../index' );
    var me = this;

    me.sandbox = sinon;

    me.dispatcher = dispatcherF.create();
    me.fn1 = me.sandbox.spy();
    me.fn2 = me.sandbox.spy();

    me.fn3 = me.sandbox.spy();
    me.fn4 = me.sandbox.spy();

  } );

  it( 'should disable the entire dispatching of events', function () {
    var me = this;
    var testObj = me.dispatcher;

    var fn1 = me.fn1;
    var fn2 = me.fn2;

    testObj.on( 'some:event.namespace1', fn1 );
    testObj.on( 'some:event.namespace2', fn2 );

    testObj.__dispatcherDisabled = true;
    testObj.fire( 'some:event' );

    expect( fn1 ).to.not.have.been.called;
    expect( fn2 ).to.not.have.been.called;

    testObj.__dispatcherDisabled = false;
    testObj.fire( 'some:event' );

    expect( fn1 ).to.have.been.called;
    expect( fn2 ).to.have.been.called;
  } );

  it( 'should register listeners using an object notation', function () {
    var me = this;

    var testObj = me.dispatcher;

    var fn1 = me.fn1;
    var fn2 = me.fn2;

    testObj.on( { 'some:event': fn1 } );

    testObj.on( { 'some:event': fn2 } );

    testObj.fire( 'some:event' );

    expect( fn1 ).to.have.been.called;
    expect( fn2 ).to.have.been.called;
  } );

  it( 'should allow an object to register listeners for events', function () {
    var me = this;
    var testObj = me.dispatcher;

    var fn1 = me.fn1;
    var fn2 = me.fn2;

    testObj.on( 'some:event', fn1 );
    testObj.on( 'some:event', fn2 );

    testObj.fire( 'some:event' );

    expect( fn1 ).to.have.been.called;
    expect( fn2 ).to.have.been.called;

  } );

  it( 'should allow an object to remove listeners after adding them', function () {
    var me = this;
    var testObj = me.dispatcher;

    var fn1 = me.fn1;
    var fn2 = me.fn2;

    testObj.on( 'some:event', fn1 );

    testObj.on( 'some:event', fn2 );

    // remove the listener using the event name and the listener
    testObj.off( 'some:event', fn1 );

    // TODO: move this to a method so we don't expose the __listeners property
    expect( testObj.__listeners[ 'some:event' ].length ).to.equal( 1 );

    testObj.fire( 'some:event' );

    expect( fn1 ).to.not.have.been.called;
    expect( fn2 ).to.have.been.called;
  } );

  it( 'should allow an object to remove listeners after adding them using a namespace', function () {
    var me = this;
    var testObj = me.dispatcher;

    var fn1 = me.fn1;
    var fn2 = me.fn2;

    testObj.on( 'some:event.ns', fn1 );

    testObj.on( 'some:event', fn2 );

    // remove the listener using the event name and the listener
    testObj.off( 'some:event.ns' );

    expect( testObj.__listeners[ 'some:event' ].length ).to.equal( 1 ); //, 'this object only have one listener' );
    testObj.fire( 'some:event' );

    expect( fn1 ).to.not.have.been.called;
    expect( fn2 ).to.have.been.called;

  } );

  it( 'should allow dispatch events by namespace', function () {
    var me = this;
    var testObj = me.dispatcher;

    var fn1 = me.fn1;
    var fn2 = me.fn2;

    var fn3 = me.fn3;

    testObj.on( 'some:event.ns', fn1 );
    testObj.on( 'another:event.ns', fn2 );

    testObj.on( 'yet:another:event.ns2', fn3 );

    testObj.fire( '.ns' );

    expect( fn1 ).to.have.been.called;
    expect( fn2 ).to.have.been.called;
    expect( fn3 ).to.not.have.been.called;

  } );
  it( 'should set event to be fired only once', function () {
    var me = this;
    var testObj = me.dispatcher;

    var fn1 = me.fn1;

    testObj.one( 'some:event.ns', fn1 );

    testObj.fire( 'some:event' );
    testObj.fire( 'some:event' );

    expect( fn1.callCount ).to.equal( 1 );

  } );

  it( 'should allow events to receive a payload when fired', function () {
    var me = this;
    var testObj = me.dispatcher;

    var fn1 = me.sandbox.spy( function ( e, args ) {
      args.someFlag = false;
    } );

    testObj.one( 'some:event.ns', fn1 );

    var someData = { aNumber: 1, aString: 'string', someFlag: true };

    testObj.fire( 'some:event', someData );

    expect( fn1.args[ 0 ][ 1 ] ).to.equal( someData );
    expect( someData.someFlag ).to.equal( false );
  } );

  it( 'should allow an object to remove all listeners after adding them', function () {
    var me = this;
    var testObj = me.dispatcher;

    var fn1 = me.fn1;
    var fn2 = me.fn2;

    testObj.on( 'some:event', fn1 );

    testObj.on( 'some:event', fn2 );

    var data = testObj.__listeners[ 'some:event' ];

    expect( data.length ).to.equal( 2 );

    testObj.off( 'some:event' );

    data = testObj.__listeners[ 'some:event' ];

    expect( data ).to.be.null;

    testObj.fire( 'some:event' );

    expect( fn1 ).to.not.have.been.called;
    expect( fn2 ).to.not.have.been.called;

  } );

  it( 'should allow listeners to be bound to several events and be fired the same way', function () {
    var me = this;
    var testObj = me.dispatcher;

    var fn1 = me.fn1;

    testObj.on( 'some:event.ns1 another:event.ns2', fn1 );

    testObj.fire( 'some:event another:event' );

    expect( fn1.callCount ).to.equal( 2 );
  } );

  it( 'should allow to remove event listeners using the namespace', function () {

    var me = this;
    var testObj = me.dispatcher;

    var fn1 = me.fn1;
    var fn2 = me.fn2;
    var fn3 = me.fn3;

    testObj.on( 'some:event.ns', fn1 );
    testObj.on( 'another:event.ns', fn2 );
    testObj.on( 'yet:another:event.ns', fn3 );

    //remove all eventListeners by namespace
    testObj.off( '.ns' );

    testObj.fire( '.ns' );

    expect( fn1 ).to.not.have.been.called;
    expect( fn2 ).to.not.have.been.called;
    expect( fn3 ).to.not.have.been.called;

  } );

  it( 'should throw an exception if trying to add a non function listener', function () {
    var me = this;
    var testObj = me.dispatcher;

    expect( function () {
      testObj.on( { 'some:event': null } );
    } ).to.
      throw();
  } );

  it( 'should do nothing when removing a listener that does not exist', function () {
    var me = this;
    var testObj = me.dispatcher;

    expect( function () {
      testObj.off( 'some:event' );
    } ).to.not.
      throw();

  } );

  it( 'should do nothing when triggering an empty event ', function () {
    var me = this;
    var testObj = me.dispatcher;

    expect( function () {
      testObj.fire( '' );
    } ).to.not.
      throw();

  } );

  it( 'should not fail when firing an event before registering something ', function () {
    var me = this;
    var testObj = me.dispatcher;

    expect( function () {
      testObj.fire( 'myNotExistingEvent' );
    } ).to.not.
      throw();

  } );

  it( 'should allow an event to have multiple namespaces', function () {
    var me = this;

    var obj = me.dispatcher;

    var fn1 = me.fn1;
    var fn2 = me.fn2;

    obj.on( 'some:event.namespace1.namespace2', fn1 );
    obj.on( 'some:other:event.namespace2.namespace1', fn2 );

    expect( obj.__listeners[ 'some:event' ].length ).to.equal( 1 );
    expect( obj.__listeners[ 'some:other:event' ].length ).to.equal( 1 );

    var rand = require( 'lodash.random' );

    obj.off( rand( 0, 1 ) ? '.namespace1' : '.namespace2' );

    expect( obj.__listeners[ 'some:event' ].length ).to.equal( 0 ); // 'events can be removed using any of the namespaces added' );
    expect( obj.__listeners[ 'some:other:event' ].length ).to.equal( 0 ); // 'events can be removed using any of the namespaces added' );
  } );

  it( 'should allow an eventhandler to be unbound using the function event name and namespace', function () {
    var me = this;
    var obj = me.dispatcher;

    var fn1 = me.fn1;
    var fn2 = me.fn2;

    obj.on( 'some:event.namespace1.namespace2', fn1 );
    obj.on( 'some:event.namespace2.namespace1', fn2 );

    expect( obj.__listeners[ 'some:event' ].length ).to.equal( 2 );

    obj.off( 'some:event.namespace1', fn1 );

    expect( obj.__listeners[ 'some:event' ].length ).to.equal( 1 );

    obj.fire( 'some:event' );

    expect( fn2 ).to.have.been.called;
    expect( fn1 ).to.not.have.been.called;
  } );

  describe( 'customEvents', function () {

    it( 'should set customEvents to empty object if none is provided', function () {
      var me = this;
      var dispatcher = me.dispatcher;
      var callBack = me.sandbox.spy();

      dispatcher.on( 'app:ready', callBack );
      dispatcher.__customEvents = null;
      dispatcher.off( 'app:ready' );

      expect( dispatcher.__customEvents ).to.deep.equal( { } );
    } );

    it( 'should register a custom event', function () {

      var me = this;
      var obj = me.dispatcher;
      var customEventLifeCycle = {
        setup: function () {},
        add: function () {},
        remove: function () {},
        teardown: function () {}
      };

      var setupSpy = me.sandbox.spy( customEventLifeCycle, 'setup' );
      var addSpy = me.sandbox.spy( customEventLifeCycle, 'add' );
      var removeSpy = me.sandbox.spy( customEventLifeCycle, 'remove' );
      var teardownSpy = me.sandbox.spy( customEventLifeCycle, 'teardown' );

      obj.registerEvent( 'app:ready', customEventLifeCycle );

      obj.on( 'app:ready', me.fn1 );
      obj.on( 'app:ready', me.fn2 );
      obj.on( 'app:ready', me.fn3 );

      obj.fire( 'app:ready' );

      obj.off( 'app:ready', me.fn1 );
      obj.off( 'app:ready', me.fn2 );
      obj.off( 'app:ready', me.fn3 );

      expect( setupSpy ).to.have.been.calledWith( sinon.match.object );
      expect( setupSpy.callCount ).to.equal( 1 );
      expect( addSpy ).to.have.been.calledWith( sinon.match.object );
      expect( addSpy.callCount ).to.equal( 3 );
      expect( removeSpy ).to.have.been.calledWith( sinon.match.object );
      expect( removeSpy.callCount ).to.equal( 3 );
      expect( teardownSpy ).to.have.been.calledWith( sinon.match.object );
      expect( teardownSpy.callCount ).to.equal( 1 );

    } );

    it( 'should remove a registered custom event', function () {

      var me = this;
      var dispatcher = me.dispatcher;

      var customEventLifeCycle = {
        setup: function () {},
        add: function () {},
        remove: function () {},
        teardown: function () {}
      };

      // var setupSpy = me.sandbox.stub( customEventLifeCycle, 'setup' );
      // var addSpy = me.sandbox.stub( customEventLifeCycle, 'add' );
      // var removeSpy = me.sandbox.stub( customEventLifeCycle, 'remove' );
      // var teardownSpy = me.sandbox.stub( customEventLifeCycle, 'teardown' );

      dispatcher.registerEvent( 'application:ready', customEventLifeCycle );

      dispatcher.on( 'application:ready', me.fn1 );

      dispatcher.off( 'application:ready' );

      dispatcher.fire( 'application:ready' );

      expect( me.fn1 ).to.not.have.been.called;
    } );

  } );

  describe( 'persistentEvent', function () {
    it( 'should add listeners to the queue while the event is not fired', function () {
      var me = this;

      var dispatcher = me.dispatcher;
      dispatcher.registerPersistentEvent( 'component:ready' );

      dispatcher.on( 'component:ready', me.fn1 );
      dispatcher.on( 'component:ready', me.fn2 );
      dispatcher.on( 'component:ready', me.fn3 );
      dispatcher.on( 'component:ready', me.fn4 );

      expect( me.fn1 ).to.not.have.been.called;
      expect( me.fn2 ).to.not.have.been.called;
      expect( me.fn3 ).to.not.have.been.called;
      expect( me.fn4 ).to.not.have.been.called;

      var listenersLength = dispatcher.__listeners[ 'component:ready' ].length;

      // registerPersistentEvent adds a dummy event to ensure the event will work as expected
      // and avoid the event being fired before the first listener is added.
      expect( listenersLength ).to.equal( 5 );

    } );

    it( 'should execute any listeners added immediately if the event already fired', function () {
      var me = this;
      var dispatcher = me.dispatcher;
      dispatcher.registerPersistentEvent( 'component:ready' );

      dispatcher.on( 'component:ready', me.fn1 );

      dispatcher.fire( 'component:ready' );

      expect( me.fn1 ).to.have.been.called;

      dispatcher.on( 'component:ready', function () {
        me.fn2();
      } );
      dispatcher.on( 'component:ready', function () {
        me.fn3();
      } );
      dispatcher.on( 'component:ready', function () {
        me.fn4();
      } );

      expect( me.fn2 ).to.have.been.called;
      expect( me.fn3 ).to.have.been.called;
      expect( me.fn4 ).to.have.been.called;

    } );
  } );

} );
