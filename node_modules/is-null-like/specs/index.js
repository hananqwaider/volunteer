describe( 'is-null-like', function () {
  it( 'should return true in case of null', function () {
    var isNullLike = require( '../' );

    expect( isNullLike( null ) ).to.be.true;
  } );
  it( 'should return true in case of undefined', function () {
    var isNullLike = require( '../' );
    var nodef;

    expect( isNullLike( nodef ) ).to.be.true;
  } );

  it( 'should return false if the value passed is an object or primitive', function () {
    var isNullLike = require( '../' );

    expect( isNullLike( 3 ) ).to.be.false;
    expect( isNullLike( { } ) ).to.be.false;
  } );
} );
