[![NPM Version](http://img.shields.io/npm/v/is-null-like.svg?style=flat)](https://npmjs.org/package/is-null-like)
[![Build Status](http://img.shields.io/travis/royriojas/is-null-like.svg?style=flat)](https://travis-ci.org/royriojas/is-null-like)

# is-null-like
A simple javascript function that will return true if the value is null like (aka undefined or null)

## Installation

```bash
npm i --save is-null-like
```

## Overview

```javascript
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
    expect( isNullLike( {} ) ).to.be.false;
  } );
} );
```

## License

[MIT](./LICENSE)

## Changelog

[changelog](./changelog.md)

