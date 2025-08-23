---
sidebar_position: 1
sidebar_label: Functions
title: SurrealQL functions
description: SurrealDB allows for advanced functions with complicated logic, by allowing embedded functions to be written in JavaScript.
---

# Functions

SurrealDB offers a number of functions that can be used to perform complex logic. These functions are grouped into the following categories:

- [Database functions](/docs/surrealql/functions/database)
- [JavaScript functions](/docs/surrealql/functions/script)
- [SurrealML functions](/docs/surrealql/functions/ml)

---
sidebar_position: 1
sidebar_label: Database Functions
title: Database Functions | SurrealQL
description: SurrealDB comes with a large number of in-built functions for checking, manipulating, and working with many different types of data.
---

import Since from '@components/shared/Since.astro'
import Table from '@components/shared/Table.astro'

# Database Functions

SurrealDB has many built-in functions designed to handle many common database tasks and work with SurrealDB's various data types, grouped into modules based on their purpose and the data types they are designed to work with. The table below lists all of SurrealDB's function modules, with descriptions and links to their own detailed documentation.

<Table>
  <thead>
    <tr>
      <th scope="col" style={{width: '20%'}}>Function</th>
      <th scope="col" style={{width: '80%'}}>Description and Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/array"><code>Array</code></a></td>
      <td scope="row" data-label="Description and Example">These functions can be used when working with, and manipulating arrays of data.<br/>Example: <code>array::len([1,2,3])</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/bytes"><code>Bytes</code></a></td>
      <td scope="row" data-label="Description and Example">These functions can be used when working with bytes in SurrealQL.<br/>Example: <code>bytes::len("SurrealDB".to_bytes());</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/count"><code>Count</code></a></td>
      <td scope="row" data-label="Description and Example">This function can be used when counting field values and expressions.<br/>Example: <code>count([1,2,3])</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/crypto"><code>Crypto</code></a></td>
      <td scope="row" data-label="Description and Example">These functions can be used when hashing data, encrypting data, and for securely authenticating users into the database.<br/>Example: <code>crypto::argon2::generate("MyPaSSw0RD")</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/duration"><code>Duration</code></a></td>
      <td scope="row" data-label="Description and Example">These functions can be used when converting between numeric and duration data.<br/>Example: <code>duration::days(90h30m)</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/encoding"><code>Encoding</code></a></td>
      <td scope="row" data-label="Description and Example">These functions can be used to encode and decode data in <code>base64</code>.<br/>Example: <code>encoding::base64::decode("aGVsbG8")</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/geo"><code>Geo</code></a></td>
      <td scope="row" data-label="Description and Example">These functions can be used when working with and analysing geospatial data.<br/>Example: <code>geo::distance((-0.04, 51.55), (30.46, -17.86))</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/http"><code>HTTP</code></a></td>
      <td scope="row" data-label="Description and Example">These functions can be used when opening and submitting remote web requests, and webhooks.<br/>Example: `http::get('https://surrealdb.com')`</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/math"><code>Math</code></a></td>
      <td scope="row" data-label="Description and Example">These functions can be used when analysing numeric data and numeric collections.<br/>Example: <code>math::max([ 26.164, 13.746189, 23, 16.4, 41.42 ])</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/meta"><code>Meta</code></a></td>
      <td scope="row" data-label="Description and Example">These functions can be used to retrieve specific metadata from a SurrealDB Record ID. As of version 2.0, these functions are deprecated and replaced with SurrealDB's <code>record</code> functions.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/not"><code>Not</code></a></td>
      <td scope="row" data-label="Description and Example">This function reverses the truthiness of a value.<br/>Example: <code>not(true)</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/object"><code>Object</code></a></td>
      <td scope="row" data-label="Description and Example">These functions can be used when working with, and manipulating data objects.<br/>Example: <code>object::from_entries([[ "a", 1 ],[ "b", true ]])</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/parse"><code>Parse</code></a></td>
      <td scope="row" data-label="Description and Example">These functions can be used when parsing email addresses and URL web addresses.<br/>Example: <code>parse::url::domain("http://127.0.0.1/index.html")</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/rand"><code>Rand</code></a></td>
      <td scope="row" data-label="Description and Example">These functions can be used when generating random data values.<br/>Example: <code>rand::enum('one', 'two', 3, 4.15385, 'five', true)</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/record"><code>Record</code></a></td>
      <td scope="row" data-label="Description and Example">These functions can be used to retrieve specific metadata from a SurrealDB Record ID.<br/>Example: <code>record::id(person:tobie)</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/search"><code>Search</code></a></td>
      <td scope="row" data-label="Description and Example">These functions are used in conjunction with the <code>@@</code> operator (the 'matches' operator) to either collect the relevance score or highlight the searched keywords within the content.<br/>Example: <code>SELECT search::score(1) AS score FROM book WHERE title @1@ 'rust web'</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/session"><code>Session</code></a></td>
      <td scope="row" data-label="Description and Example">These functions return information about the current SurrealDB session.<br/>Example: <code>session::db()</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/sleep"><code>Sleep</code></a></td>
      <td scope="row" data-label="Description and Example">This function can be used to introduce a delay or pause in the execution of a query or a batch of queries for a specific amount of time.<br/>Example: <code>sleep(900ms)</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/string"><code>String</code></a></td>
      <td scope="row" data-label="Description and Example">These functions can be used when working with and manipulating text and string values.<br/>Example: <code>string::reverse('emosewa si 0.2 BDlaerruS')</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/time"><code>Time</code></a></td>
      <td scope="row" data-label="Description and Example">These functions can be used when working with and manipulating datetime values.<br/>Example: <code>time::timezone()</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/type"><code>Type</code></a></td>
      <td scope="row" data-label="Description and Example">These functions can be used for generating and coercing data to specific data types.<br/>Example: <code>type::is::number(500)</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/value"><code>Value</code></a></td>
      <td scope="row" data-label="Description and Example">This module contains several miscellaneous functions that can be used with values of any type.<br/>Example: <code>value::diff([true, false], [true, true])</code></td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="/docs/surrealql/functions/database/vector"><code>Vector</code></a></td>
      <td scope="row" data-label="Description and Example">A collection of essential vector operations that provide foundational functionality for numerical computation, machine learning, and data analysis.<br/>Example: <code>vector::add([1, 2, 3], [1, 2, 3])</code></td>
    </tr>
  </tbody>
</Table>

## How to use database functions

### Classic syntax

Functions in SurrealDB can always be called using their full path names beginning with the package names indicated above, followed by the function arguments.

```surql
string::split("SurrealDB 2.0 is on its way!", " ");
array::len([1,2,3]);
type::is::number(10);
type::thing("cat", "mr_meow");
```

```surql title="Response"
-------- Query --------

[
	'SurrealDB',
	'2.0',
	'is',
	'on',
	'its',
	'way!'
]

-------- Query --------

3

-------- Query --------

true

-------- Query --------

cat:mr_meow
```

### Method syntax

<Since v="v2.0.0" />

Functions that are called on an existing value can be called using method syntax, using the `.` (dot) operator. When using method syntax, be sure to convert `::` in the regular function signature to `_` (an underscore).

The following functions will produce the same output as the classic syntax above. `type::thing()` cannot be called with method syntax because it is used to outright create a record ID from nothing, rather than being called on an existing value.

```surql
"SurrealDB 2.0 is on its way!".split(" ");
[1,2,3].len();
10.is_number();
```

The method syntax is particular useful when calling a number of functions inside a single query.

```surql
array::len(array::windows(array::distinct(array::flatten([[1,2,3],[1,4,6],[4,2,4]])), 2));
```

Readability before `2.0` could be improved to a certain extent by moving a query of this type over multiple lines.

```surql
array::len(
    array::clump(
        array::distinct(
            array::flatten([[1,2,3],[1,4,6],[4,2,4]])
        )
    , 2)
);
```

However, method chaining syntax allows queries of this type to be read from left to right in a functional manner. This is known as method chaining. As each of the methods below except the last return an array, further array methods can thus be called by using the `.` operator. The final method then returns an integer.

```surql
[[1,2,3],[1,4,6],[4,2,4],2].flatten().distinct().windows(2).len();
```

This can be made even more readable by splitting over multiple lines.

```surql
[[1,2,3],[1,4,6],[4,2,4]]
    .flatten()
    .distinct()
    .windows(2)
    .len();
```

### Mathematical constants

The page on mathematical functions also contains a number of mathematical constants. They are used in a similar way to functions except that their paths point to hard-coded values instead of a function pointer and thus do not need parentheses.

```surql
RETURN [math::pi, math::tau, math::e];
```

```surql title="Response"
[
	3.141592653589793f,
	6.283185307179586f,
	2.718281828459045f
]
```

## Anonymous functions

<Since v="v2.0.0" />

SurrealDB also allows for the creation of anonymous functions (also known as closures) that do not need to be defined on the database. See [the page on closures](/docs/surrealql/datamodel/closures) for more details.

---
sidebar_position: 2
sidebar_label: API functions
title: API functions | SurrealQL
description: These functions can be used with the DEFINE API or DEFINE CONFIG statements.
---

# API functions

> [!NOTE]
> API middleware functions such as `api::req::max_body` cannot be used in an ad-hoc manner, such as via Surrealist or the CLI. Instead, they are passed in to a [`DEFINE API`](/docs/surrealql/statements/define/api) or [`DEFINE CONFIG API`](/docs/surrealql/statements/define/config) statement to be used as middleware when a request is received. The only function that can be run at any time is [`api::invoke`](#apiinvoke) which is used to test API endpoints.


> [!CAUTION]
> Currently, this is an experimental feature as such, it may be subject to breaking changes and may present unidentified security issues. Do not rely on this feature in production applications. To enable this, set the `SURREAL_CAPS_ALLOW_EXPERIMENTAL` [environment variable](/docs/surrealdb/cli/start) to `define_api`.
<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#apiinvoke"><code>api::invoke()</code></a></td>
      <td scope="row" data-label="Description">Invokes an `/api` endpoint and returns the result</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#apitimeout"><code>api::timeout()</code></a></td>
      <td scope="row" data-label="Description">Sets a timeout for requests made to a defined API endpoint</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#apireqmax_body"><code>api::req::max_body()</code></a></td>
      <td scope="row" data-label="Description">Sets the maximum body size in bytes for requests made to a defined API endpoint</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#apireqraw_body"><code>api::req::raw_body()</code></a></td>
      <td scope="row" data-label="Description">Sets whether to only take a raw (bytes or string) request body at a defined API endpoint</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#apiresheader"><code>api::res::header()</code></a></td>
      <td scope="row" data-label="Description">Adds a single header to an API endpoint response</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#apiresheaders"><code>api::res::headers()</code></a></td>
      <td scope="row" data-label="Description">Adds multiple headers to an API endpoint response</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#apiresraw_body"><code>api::res::raw_body()</code></a></td>
      <td scope="row" data-label="Description">Sets whether to only return an API endpoint response in bytes or a string</td>
    </tr>
  </tbody>
</table>

## `api::invoke`

```surql title="API DEFINITION"
api::invoke($path: string, $options: option<object>) -> object
```

The `api::invoke` function invokes a custom `/api` endpoint defined using a `DEFINE API` statement. While a `DEFINE API` statement creates an API endpoint at the `/api/:namespace/:database/:endpoint` path, this function is called when a namespace and database have already been decided, necessitating only the final path (such as `"/test"`) for it to be invoked.

The following two examples of the function assume that this `DEFINE API` statement has been used to set up the `"/test"` endpoint.

```surql title="Define API endpoint"
DEFINE API "/test"
    FOR get 
        MIDDLEWARE
            api::req::raw_body(false)
        THEN {
            RETURN {
                status: 404,
                body: $request.body,
                headers: { the_time_is_now: time::now() }
            };
        };
```

Calling the `api::invoke` function with just a path:

```surql title="Use defined endpoint"
api::invoke("/test");
```

```surql title="Output"
{
	body: NONE,
	headers: {
		the_time_is_now: '2025-02-25T11:49:30.732Z'
	},
	raw: false,
	status: 404
}
```

Calling the `api::invoke` function with a path and an object containing a body and headers:

```surql
api::invoke("/test", {
    body: <bytes> '{ "a": true }',
    headers: {
        "Content-Type": "application/json",
        Accept: "application/cbor",
    }
});
```

```surql title="Output"
{
	body: encoding::base64::decode("eyAiYSI6IHRydWUgfQ"),
	headers: {
		the_time_is_now: '2025-02-25T11:51:18.910Z'
	},
	raw: false,
	status: 404
}
```

For more information and examples, see the page for the `DEFINE API` statement.

## `api::timeout`

The `api::timeout` function sets the maximum timeout for a request.

```surql title="API DEFINITION"
api::timeout(duration)
```

```surql title="Example"
DEFINE API "/test"
    FOR get 
        MIDDLEWARE
            api::timeout(1s)
        THEN {
            RETURN {
                headers: {
                    "requested-at": time::now()
                },
                body: SELECT * FROM person
            };
        };
```

## `api::req::max_body`

The `api::req::max_body` function sets the maximum allowed body size in bytes for a request made.

```surql title="API DEFINITION"
api::req::max_body(string)
```

The string argument for this function must be a number followed by the type of unit: `b`, `kb`, `mb`, `gb`, `tb`, or `pb`.

```surql title="Example"
DEFINE API "/test"
    FOR get 
        MIDDLEWARE
            api::req::max_body("1000b")
        THEN {
            RETURN {
                headers: {
                    "requested-at": time::now()
                },
                body: SELECT * FROM person
            };
        };
```

## `api::req::raw_body`

The `api::req::raw_body` function sets whether to only accept a raw body composed of bytes, a setting which is normally set to `false`. If this function is caled with no argument, it will be set to `true`.

```surql title="API DEFINITION"
api::req::raw_body(option<bool>)
```

```surql title="Example"
DEFINE API "/test"
    FOR get 
        MIDDLEWARE
            api::req::raw_body(true)
        THEN {
            RETURN {
                headers: {
                    "requested-at": time::now()
                },
                body: SELECT * FROM person
            };
        };

-- Now must be invoked with a body in bytes
api::invoke("/test", {
    body: <bytes>"Hi plz send the information"
});
```

## `api::res::header`

The `api::res::header` function sets a single header for a response.

```surql title="API DEFINITION"
api::res::header($header_name: string, $val: value)
```

```surql title="Example"
DEFINE API "/test"
    FOR get 
        MIDDLEWARE
            api::res::header("country-origin", "CA")
        THEN {
            RETURN {
                headers: {
                    "requested-at": time::now()
                },
                body: SELECT * FROM person
            };
        };
```

## `api::res::headers`

The `api::res::headers` function takes an object to set the headers for a response.

```surql title="API DEFINITION"
api::res::headers(object)
```

```surql title="Example"
DEFINE API "/test"
    FOR get 
        MIDDLEWARE
            api::res::headers({
                "country-origin": "CA",
                "language": "FR"
            })
        THEN {
            RETURN {
                headers: {
                    "requested-at": time::now()
                },
                body: SELECT * FROM person
            };
        };
```

## `api::res::raw_body`

The `api::res::raw_body` function sets whether to send a raw body composed of bytes, a setting which is normally set to `false`. If this function is caled with no argument, it will be set to `true`.

```surql title="API DEFINITION"
api::res::raw_body(option<bool>)
```

```surql title="Example"
DEFINE API "/test"
    FOR get 
        MIDDLEWARE
            api::res::raw_body(true)
        THEN {
            RETURN {
                headers: {
                    "requested-at": time::now()
                },
                body: SELECT * FROM person
            };
        };
```

---
sidebar_position: 3
sidebar_label: Array functions
title: Array functions | SurrealQL
description: These functions can be used when working with, and manipulating arrays of data.
---
import Since from '@components/shared/Since.astro'
import Tabs from "@components/Tabs/Tabs.astro";
import TabItem from "@components/Tabs/TabItem.astro";

# Array functions

These functions can be used when working with, and manipulating arrays of data.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayadd"><code>array::add()</code></a></td>
      <td scope="row" data-label="Description">Adds an item to an array if it doesn't exist</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayall"><code>array::all()</code></a></td>
      <td scope="row" data-label="Description">Checks whether all array values are truthy, or equal to a condition</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayany"><code>array::any()</code></a></td>
      <td scope="row" data-label="Description">Checks whether any array value is truthy, or equal to a condition</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayat"><code>array::at()</code></a></td>
      <td scope="row" data-label="Description">Returns value for X index, or in reverse for a negative index</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayappend"><code>array::append()</code></a></td>
      <td scope="row" data-label="Description">Appends an item to the end of an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayboolean_and"><code>array::boolean_and()</code></a></td>
      <td scope="row" data-label="Description">Perform the <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND">AND</a><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND"> </a><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND">bitwise operations</a> on two arrays</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayboolean_or"><code>array::boolean_or()</code></a></td>
      <td scope="row" data-label="Description">Perform the <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR">OR</a><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR"> </a><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR">bitwise operations</a> on two arrays</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayboolean_xor"><code>array::boolean_xor()</code></a></td>
      <td scope="row" data-label="Description">Perform the <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_XOR">XOR</a><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_XOR"> </a><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_XOR">bitwise operations</a> on two arrays</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayboolean_not"><code>array::boolean_not()</code></a></td>
      <td scope="row" data-label="Description">Perform the <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_NOT">NOT</a><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_NOT"> </a><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_NOT">bitwise operations</a> on an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraycombine"><code>array::combine()</code></a></td>
      <td scope="row" data-label="Description">Combines all values from two arrays together</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraycomplement"><code>array::complement()</code></a></td>
      <td scope="row" data-label="Description">Returns the complement of two arrays</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayclump"><code>array::clump()</code></a></td>
      <td scope="row" data-label="Description">Returns the original array split into multiple arrays of X size</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayconcat"><code>array::concat()</code></a></td>
      <td scope="row" data-label="Description">Returns the merged values from two arrays</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraydifference"><code>array::difference()</code></a></td>
      <td scope="row" data-label="Description">Returns the difference between two arrays</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraydistinct"><code>array::distinct()</code></a></td>
      <td scope="row" data-label="Description">Returns the unique items in an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayfill"><code>array::fill()</code></a></td>
      <td scope="row" data-label="Description">Fills an existing array of the same value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayfilter"><code>array::filter()</code></a></td>
      <td scope="row" data-label="Description">Filters out values that do not match a pattern</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayfilter_index"><code>array::filter_index()</code></a></td>
      <td scope="row" data-label="Description">Returns the indexes of all occurrences of all matching X value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayfind"><code>array::find()</code></a></td>
      <td scope="row" data-label="Description">Returns the first matching value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayfind_index"><code>array::find_index()</code></a></td>
      <td>Returns the index of the first occurrence of X value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayfirst"><code>array::first()</code></a></td>
      <td scope="row" data-label="Description">Returns the first item in an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayflatten"><code>array::flatten()</code></a></td>
      <td scope="row" data-label="Description">Flattens multiple arrays into a single array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayfold"><code>array::fold()</code></a></td>
      <td scope="row" data-label="Description">Applies an operation on an initial value plus every element in the array, returning the final result.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraygroup"><code>array::group()</code></a></td>
      <td scope="row" data-label="Description">Flattens and returns the unique items in an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayinsert"><code>array::insert()</code></a></td>
      <td scope="row" data-label="Description">Inserts an item at the end of an array, or in a specific position</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayintersect"><code>array::intersect()</code></a></td>
      <td scope="row" data-label="Description">Returns the values which intersect two arrays</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayis_empty"><code>array::is_empty()</code></a></td>
      <td scope="row" data-label="Description">Checks if an array is empty</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayjoin"><code>array::join()</code></a></td>
      <td scope="row" data-label="Description">Returns concatenated value of an array with a string in between.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraylast"><code>array::last()</code></a></td>
      <td scope="row" data-label="Description">Returns the last item in an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraylen"><code>array::len()</code></a></td>
      <td scope="row" data-label="Description">Returns the length of an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraylogical_and"><code>array::logical_and()</code></a></td>
      <td scope="row" data-label="Description">Performs the <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND">AND</a><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND"> </a><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND">logical operations</a> on two arrays</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraylogical_or"><code>array::logical_or()</code></a></td>
      <td scope="row" data-label="Description">Performs the <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR">OR</a><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR"> </a><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR">logical operations</a> on two arrays</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraylogical_xor"><code>array::logical_xor()</code></a></td>
      <td scope="row" data-label="Description">Performs the <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR">XOR</a><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR"> </a><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR">logical operations</a> on two arrays</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraymap"><code>array::map()</code></a></td>
      <td scope="row" data-label="Description">Applies an operation to every item in an array and passes it on</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraymax"><code>array::max()</code></a></td>
      <td scope="row" data-label="Description">Returns the greatest item from an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraymatches"><code>array::matches()</code></a></td>
      <td scope="row" data-label="Description">Returns an array of booleans indicating which elements of the input array contain a specified value.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraymin"><code>array::min()</code></a></td>
      <td scope="row" data-label="Description">Returns the least item from an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraypop"><code>array::pop()</code></a></td>
      <td scope="row" data-label="Description">Returns the last item from an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayprepend"><code>array::prepend()</code></a></td>
      <td scope="row" data-label="Description">Prepends an item to the beginning of an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraypush"><code>array::push()</code></a></td>
      <td scope="row" data-label="Description">Appends an item to the end of an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayrange"><code>array::range()</code></a></td>
      <td scope="row" data-label="Description">Creates a number array from a range (start to end)</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayreduce"><code>array::reduce()</code></a></td>
      <td scope="row" data-label="Description">Applies an operation on every element in the array, returning the final result.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayremove"><code>array::remove()</code></a></td>
      <td scope="row" data-label="Description">Removes an item at a specific position from an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayrepeat"><code>array::repeat()</code></a></td>
      <td scope="row" data-label="Description">Creates an array a given size with a specified value used for each element.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayreverse"><code>array::reverse()</code></a></td>
      <td scope="row" data-label="Description">Reverses the sorting order of an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayshuffle"><code>array::shuffle()</code></a></td>
      <td scope="row" data-label="Description">Randomly shuffles the contents of an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayslice"><code>array::slice()</code></a></td>
      <td scope="row" data-label="Description">Returns a slice of an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraysort"><code>array::sort()</code></a></td>
      <td scope="row" data-label="Description">Sorts the values in an array in ascending or descending order</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraysort_lexical"><code>array::sort_lexical()</code></a></td>
      <td scope="row" data-label="Description">Sorts the values in an array, with strings sorted lexically</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraysort_natural"><code>array::sort_natural()</code></a></td>
      <td scope="row" data-label="Description">Sorts the values in an array, with numeric strings sorted numerically</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraysort_natural_lexical"><code>array::sort_natural_lexical()</code></a></td>
      <td scope="row" data-label="Description">Sorts the values in an array, applying both natural numeric and lexical ordering to strings</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraysortasc"><code>array::sort::asc()</code></a></td>
      <td scope="row" data-label="Description">Sorts the values in an array in ascending order</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraysortdesc"><code>array::sort::desc()</code></a></td>
      <td scope="row" data-label="Description">Sorts the values in an array in descending order</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayswap"><code>array::swap()</code></a></td>
      <td scope="row" data-label="Description">Swaps two items in an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraytranspose"><code>array::transpose()</code></a></td>
      <td scope="row" data-label="Description">Performs 2d array transposition on arrays</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arrayunion"><code>array::union()</code></a></td>
      <td scope="row" data-label="Description">Returns the unique merged values from two arrays</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#arraywindows"><code>array::windows()</code></a></td>
      <td scope="row" data-label="Description">Returns a number of arrays of length `size` created by moving one index at a time down the original array</td>
    </tr>
  </tbody>
</table>

## `array::add`

The `array::add` function adds an item to an array only if it doesn't exist.

```surql title="API DEFINITION"
array::add(array, value) -> array
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::add(["one", "two"], "three");

["one", "two", "three"]
```

<br />

## `array::all`

When called on an array without any extra arguments, the `array::all` function checks whether all array values are [truthy](/docs/surrealql/datamodel/values#values-and-truthiness).

```surql title="API DEFINITION"
array::all(array) -> bool
array::all(array, value) -> bool
array::all(array, @closure) -> bool
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::all([ 1, 2, 3, NONE, 'SurrealDB', 5 ]);
-- false

RETURN ["all", "clear"].all();
-- true
```

The `array::all` function can also be followed with a value or a [closure](/docs/surrealql/datamodel/closures) to check if all elements conform to a condition.

```surql
RETURN ["same", "same", "same"].all("same");
-- true

[
  "What's",
  "it",
  "got",
  "in",
  "its",
  "pocketses??"
].all(|$s| $s.len() > 1);
-- true

[1, 2, "SurrealDB"].all(|$var| $var.is_string());
-- false
```

The `array::all` function can also be called using its alias `array::every`.

```surql
[1, 2, 3].every(|$num| $num > 0);
-- true
```

<br />

## `array::any`

The `array::any` function checks whether any array values are [truthy](/docs/surrealql/datamodel/values#values-and-truthiness).

```surql title="API DEFINITION"
array::any(array) -> bool
array::any(array, value) -> bool
array::any(array, @closure) -> bool
```

When called on an array without any extra arguments, the `array::any` function checks whether any array values are [truthy](/docs/surrealql/datamodel/values#values-and-truthiness).

```surql
RETURN array::any([ 1, 2, 3, NONE, 'SurrealDB', 5 ]);
-- true

["", 0, NONE, NULL, [], {}].any();
-- false
```

The `array::any` function can also be followed with a value or a [closure](/docs/surrealql/datamodel/closures) to check if any elements conform to a condition.

```surql
RETURN ["same", "same?", "Dude, same!"].any("same");
-- true

[
  "What's",
  "it",
  "got",
  "in",
  "its",
  "pocketses??"
].any(|$s| $s.len() > 15);
-- false

[1, 2, "SurrealDB"].any(|$var| $var.is_string());
-- true
```

The `array::any` function can also be called using the aliases `array::some` and `array::includes`.

```surql
[1, 2, 3].some(|$num| $num > 2);
-- true

[1999, 2001, 2002].includes(2000);
-- false
```

<br />

## `array::at`

The `array::at` function returns the value at the specified index, or in reverse for a negative index.

```surql title="API DEFINITION"
array::at(array, index: int) -> any
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::at(['s', 'u', 'r', 'r', 'e', 'a', 'l'], 2);

"r"
```
You can also pass a negative index. This will perform the lookup in reverse:
```surql
RETURN array::at(['s', 'u', 'r', 'r', 'e', 'a', 'l'], -3);

"e"
```

<br />

## `array::append`

The `array::append` function appends a value to the end of an array.

```surql title="API DEFINITION"
array::append(array, value) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::append([1, 2, 3, 4], 5);

[ 1, 2, 3, 4, 5 ]
```

<br />

## `array::boolean_and`

The `array::boolean_and` function performs the [`AND` `bitwise operations`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND) on the input arrays per-element based on the element's truthiness.
If one array is shorter than the other it is considered null and thus false.

```surql title="API DEFINITION"
array::boolean_and(lh: array, rh: array)
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::boolean_and(["true", "false", 1, 1], ["true", "true", 0, "true"]);

[true, true, false, true]
```
For those that take two arrays, missing elements (if one array is shorter than the other) are considered `null` and thus false.

```surql
RETURN array::boolean_and([true, true], [false])

[ false, false ]
```

<br />

## `array::boolean_or`

The `array::boolean_or` function performs the [OR bitwise operations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR) on the input arrays per-element based on the element's truthiness.
It takes two arrays and if one array is shorter than the other or missing, the output is considered null and thus false.

```surql title="API DEFINITION"
array::boolean_or(lh: array, rh: array)
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::boolean_or([false, true, false, true], [false, false, true, true])

[ false, true, true, true ]
```

<br />

## `array::boolean_xor`

The `array::boolean_xor` function performs the [XOR bitwise operations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR).

```surql title="API DEFINITION"
array::boolean_xor(lh: array, rh: array)
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::boolean_xor([false, true, false, true], [false, false, true, true]);

[ false, true, true, false ]
```

<br />

## `array::boolean_not`

The `array::boolean_not` function performs the [`NOT bitwise operations`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_NOT) on the input array(s) per-element based on the element's truthiness.
It takes in one array and it returns false if its single operand can be converted to true.

```surql title="API DEFINITION"
array::boolean_not(array)
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::boolean_not([ false, true, 0, 1 ]);

[ true, false, true, false ]
```

<br />

## `array::combine`

The `array::combine` function combines all values from two arrays together, returning an array of arrays.

```surql title="API DEFINITION"
array::combine(array, array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::combine([1, 2], [2, 3]);

[ [1, 2], [1, 3], [2, 2], [2, 3] ]
```

<br />

## `array::complement`

The `array::complement` function returns the complement of two arrays, returning a single array containing items which are not in the second array.

```surql title="API DEFINITION"
array::complement(array, array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::complement([1, 2, 3, 4], [3, 4, 5, 6]);

[ 1, 2 ]
```

<br />

## `array::concat`

The `array::concat` function merges two arrays together, returning an array which may contain duplicate values. If you want to remove duplicate values from the resulting array, then use the [`array::union()`](/docs/surrealql/functions/database/array#arrayunion) function or cast it to a set using `<set>`.

```surql title="API DEFINITION"
array::concat(array, array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::concat([1, 2, 3, 4], [3, 4, 5, 6]);

[ 1, 2, 3, 4, 3, 4, 5, 6 ]
```

As of SurrealDB 3.0.0-alpha.3, the behaviour of this function can also be achieved using the `+` operator.

```surql
RETURN [1, 2, 3, 4] + [3, 4, 5, 6];

[ 1, 2, 3, 4, 3, 4, 5, 6 ]
```

<br />

## `array::clump`

The `array::clump` function returns the original array split into sub-arrays of `size`. The last sub-array may have a length less than the length of `size` if `size` does not divide equally into the original array.

```surql title="API DEFINITION"
array::clump(array, size: int) -> array
```
The following examples show this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
LET $array = [1, 2, 3, 4];
RETURN array::clump($array, 2);
RETURN array::clump($array, 3);
```

```surql title="Response"
[ [ 1, 2], [3, 4] ]
[ [1, 2, 3], [4] ]
```

<br />

## `array::difference`

The `array::difference` function determines the difference between two arrays, returning a single array containing items which are not in both arrays.

```surql title="API DEFINITION"
array::difference(array, array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::difference([1, 2, 3, 4], [3, 4, 5, 6]);

[ 1, 2, 5, 6 ]
```

<br />

## `array::distinct`

The `array::distinct` function calculates the unique values in an array, returning a single array.

```surql title="API DEFINITION"
array::distinct(array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::distinct([ 1, 2, 1, 3, 3, 4 ]);

[ 1, 2, 3, 4 ]
```

<br />

## `array::fill`

<Since v="v2.0.0" />

The `array::fill` function replaces all values of an array with a new value.

```surql title="API DEFINITION"
array::fill(array, any) -> array
```

The function also accepts a third and a fourth parameter which allows you to replace only a portion of the source array.

```surql title="API DEFINITION"
array::fill(array, any, start: int, end: int) -> array
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::fill([ 1, 2, 3, 4, 5 ], 10);

[ 10, 10, 10, 10, 10 ]
```

The following example shows how you can use this function with a starting position, and an ending position, which in this example will replace one item from the array:

```surql
RETURN array::fill([ 1, NONE, 3, 4, 5 ], 10, 1, 2);

[ 1, 10, 3, 4, 5 ]
```

The following example shows how you can use this function with starting and ending negative positions, which in this example will replace one item from the array:

```surql
RETURN array::fill([ 1, 2, NONE, 4, 5 ], 10, -3, -2);

[ 1, 2, 10, 4, 5 ]
```

<br />

## `array::filter`

The `array::filter` function filters out values in an array that do not match a pattern, returning only the ones that do match.

```surql title="API DEFINITION"
array::filter(array, value) -> array
array::filter(array, @closure) -> array
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::filter([ 1, 2, 1, 3, 3, 4 ], 1);
-- [ 1, 1 ]

RETURN [true, false, false, false, true, true].filter(true);
-- [ true, true, true ]
```

The `array::filter` function can also take a [closure](/docs/surrealql/datamodel/closures) for more customized filtering.

```surql
 [
    { importance: 10, message: "I need some help with this query..." },
    { importance: 0, message: "TEST Is this thing on?" },
    { importance: 5, message: "I have an idea. What if we..."},
    { importance: 100, message: "Stuck on an island with two hours of battery life left. Can you..."}
].filter(|$v| $v.importance > 5);
```

```surql title="Response"
[
	{
		importance: 10,
		message: 'I need some help with this query...'
	},
	{
		importance: 100,
		message: 'Stuck on an island with two hours of battery life left. Can you...'
	}
]
```

Note that the function checks whether the output of the inner closure [is truthy](/docs/surrealql/datamodel/values#values-and-truthiness), as opposed to only expecting a `bool`. As any and all values can be checked for truthiness, simply passing the closure argument as its output is enough to filter out values that are not truthy, such as `NONE` values and empty arrays.

```surql
[1,2,3,NONE,0,"",{},[]].filter(|$v| $v);
```

```surql title="Response"
[1,2,3]
```

A more real-life example of this pattern in which only the `person` records that have been seen by another are returned:

```surql
CREATE person:one, person:two;
RELATE person:one->sees->person:two;

(SELECT 
  id, 
  <-sees<-person AS is_seen_by
FROM person)
    .filter(|$person| $person.is_seen_by);
```

```surql title="Response"
[
	{
		id: person:two,
		is_seen_by: [
			person:one
		]
	}
]
```

<br />

## `array::filter_index`

The `array::filter_index` function returns the indexes of all occurrences of all matching values.

```surql title="API DEFINITION"
array::filter_index(array, value) -> array
array::filter_index(array, @closure) -> array
```

The following examples show this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::filter_index(['a', 'b', 'c', 'b', 'a'], 'b');
-- [ 1, 3 ]

RETURN [0, 0, 1, 0, 0, 5, 1].filter_index(0);
-- [ 0, 1, 3, 4 ]
```

The `array::filter_index` function can also take a [closure](/docs/surrealql/datamodel/closures) for more customized filtering.

```surql
 [
    { importance: 10, message: "I need some help with this query..." },
    { importance: 0, message: "TEST Is this thing on?" },
    { importance: 5, message: "I have an idea. What if we..."},
    { importance: 100, message: "Stuck on an island with two hours of battery life left. Can you..."}
].filter_index(|$v| $v.importance > 5);
```

```surql title="Response"
[0, 3 ]
```

<br />

## `array::find`

The `array::find` function returns the first occurrence of `value` in the array or `NONE` if `array` does not contain `value`.

```surql title="API DEFINITION"
array::find(array, value) -> value | NONE
array::find(array, @closure) -> value | NONE
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::find(['a', 'b', 'c', 'b', 'a'], 'b');
-- b

RETURN [1, 2, 3].find(4);
-- [NONE]
```

The `array::find` function is most useful when a [closure](/docs/surrealql/datamodel/closures) is passed in which allows for customized searching.


```surql
-- Find a number 3 or greater
RETURN [1, 2, 3].find(|$num| $num > 3);

-- Find the first adventurer good enough for the task
[
    { strength: 15, intelligence: 6,  name: "Dom the Magnificent" },
    { strength: 10, intelligence: 15, name: "Mardine"             },
    { strength: 20, intelligence: 3,  name: "Gub gub"             },
    { strength: 10, intelligence: 18, name: "Lumin695"            }
].find(|$c| $c.strength > 9 AND $c.intelligence > 9);
```

```surql title="Response"
-------- Query --------

NONE

-------- Query --------

{
	intelligence: 15,
	name: 'Mardine',
	strength: 10
}
```

<br />

## `array::find_index`

The `array::find_index` function returns the index of the first occurrence of `value` in the array or `NONE` if `array` does not contain `value`.

```surql title="API DEFINITION"
array::find_index(array, value) -> number | NONE
array::find_index(array, @closure) -> number | NONE
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::find_index(['a', 'b', 'c', 'b', 'a'], 'b');
-- 1

RETURN [1, 2, 3].find_index(4);
-- NONE
```

The `array::find_index` function can also take a [closure](/docs/surrealql/datamodel/closures) for more customized searching.

```surql
RETURN [1, 2, 3].find_index(|$num| $num > 3);
-- NONE
```

The `array::find_index` function also be called using the alias `array::index_of`.

```surql
["cat", "badger", "dog", "octopus"].index_of("octopus");
-- 3
```

<br />

## `array::first`

The `array::first` function returns the first value from an array.

```surql title="API DEFINITION"
array::first(array) -> any
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::first([ 's', 'u', 'r', 'r', 'e', 'a', 'l' ]);

"s"
```

<br />

## `array::flatten`

The `array::flatten` function flattens an array of arrays, returning a new array with all sub-array elements concatenated into it.

```surql title="API DEFINITION"
array::flatten(array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::flatten([ [1, 2], [3, 4], 'SurrealDB', [5, 6, [7, 8]] ]);
```

```surql title="Response"
[ 1, 2, 3, 4, 'SurrealDB', 5, 6, [7, 8] ]
```

<br />

## `array::fold`

<Since v="v2.1.0" />

The `array::fold` function returns a final value from the elements of an array by allowing an operation to be performed at each step of the way as each subsequent item in the array is encountered. To use `array::fold`, pass in an initial value, followed by parameter names for the current value and the next value and an operation to perform on them. If you only want to perform an operation on each item and do not need an initial value, use the [`array::reduce`](/docs/surrealql/functions/database/array#arrayreduce) function instead.

```surql title="API DEFINITION"
array::fold(array, initial_value, @closure) -> value
```

This function is commonly used to sum or subtract the items in an array from an initial value. 

```surql
-- Returns 53
[10,12,10,15].fold(100, |$a, $b| $a - $b);
```

The function will then perform the following operation for each step of the way.

* `$a` = 100 (initial value), `$b` = 10 (first item in the array). Operation `$a - $b` = 90. 90 is passed on.
* `$a` = 90, `$b` = 12. Operation `$a - $b` = 78. 78 is passed on.
* `$a` = 84, `$b` = 10. Operation `$a - $b` = 74. 68 is passed on.
* `$a` = 74, `$b` = 15. Operation `$a - $b` = 53. No more items to operate on in the array, 53 is returned.

Another example showing `array::fold()` used to reverse a `string`:

```surql
"I am a forwards string"
  .split('')
  .fold("", |$one, $two| $two + $one);
```

```surql title="Output"
'gnirts sdrawrof a ma I'
```

Or to modify a string in some other way.

```surql
"I don't like whitespace"
  .split(" ")
  .fold("", |$one, $two| $one + "_" + $two);
```

```surql title="Output"
"_I_don't_like_whitespace"
```

As the output above shows, it is often nice to know which item of the array one is working with. This function allows a third parameter to be passed in that keeps track of the index of the current item.

```surql
"I don't like whitespace"
  .split(" ")
  .fold("", |$one, $two, $index| IF $index = 0 { $one + $two } ELSE { $one + "_" + $two });
```

```surql title="Output"
"I_don't_like_whitespace"
```

The `array::fold()` function can be used to generate an array of values that can then be passed on to statements like [`INSERT`](/docs/surrealql/statements/insert) for bulk insertion.

```surql
INSERT INTO person (
  -- Create 1000 objects with a random ULID and incrementing number
    (<array>0..1000).fold([], |$v, $_, $i| {
    $v.append( { 
      id: rand::ulid(),
      person_num: $i
      });
    })
);
```

This function is also useful for aggregating the results of graph queries. The following shows a graph table called `to` that holds the distance from one city to another. The `array::fold()` function can then be used to pass an object along that tracks the first and last city, while accumulating the distance and number of trips along the way.

```surql
CREATE city:one, city:two, city:three;
RELATE city:one -> to -> city:two SET distance = 25.5;
RELATE city:two -> to -> city:three SET distance = 4.1;
[
	city:one,
	city:two,
	city:three
].map(|$v| { {
	city: $v,
	distance: 0,
	from: NONE,
	to: NONE,
	trips: 0
} }).fold({
	city: NONE,
	distance: 0,
	from: NONE,
	to: NONE,
	trips: 0
}, |$acc, $val, $i| {
	RETURN IF $i = 0 {
		{
			city: $val.city,
			distance: 0,
			from: $val.city,
			to: NONE,
			trips: $acc.trips + 1
		}
  }
	ELSE {
		{
			city: $val.city,
			distance: (SELECT VALUE distance FROM ONLY to WHERE in = $acc.city AND out = $val.city LIMIT 1) + $acc.distance,
			from: $acc.from,
			to: $val.city,
			trips: $acc.trips + 1
		}
  };
}).chain(|$v| { {
	distance: $v.distance,
	from: $v.from,
	to: $v.to,
	trips: $v.trips
} });
```

Final result:

```surql
{
	distance: 29.6f,
	from: city:one,
	to: city:three,
	trips: 3
}
```

## `array::group`

The `array::group` function flattens and returns the unique items in an array.

```surql title="API DEFINITION"
array::group(array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::group([1, 2, 3, 4, [3, 5, 6], [2, 4, 5, 6], 7, 8, 8, 9]);

[ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
```

<br />

## `array::insert`

The `array::insert` function inserts a value into an array at a specific position. A negative index can be provided to specify a position relative to the end of the array.

```surql title="API DEFINITION"
array::insert(array, value, number) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::insert([1, 2, 3, 4], 5, 2);

[ 1, 2, 5, 3, 4 ]
```

<br />

## `array::intersect`

The `array::intersect` function calculates the values which intersect two arrays, returning a single array containing the values which are in both arrays.

```surql title="API DEFINITION"
array::intersect(array, array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::intersect([1, 2, 3, 4], [3, 4, 5, 6]);

[ 3, 4 ]
```

<br />

## `array::is_empty`

<Since v="v2.0.0" />

The `array::is_empty` function checks whether the array contains values.

```surql title="API DEFINITION"
array::is_empty(array) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql title="An array that contain values"
RETURN array::is_empty([1, 2, 3, 4]);

false
```

```surql title="An empty array"
RETURN array::is_empty([]);

true
```

<br />

## `array::join`

The `array::join` function takes an array and a string as parameters and returns a concatenated string.

```surql title="API DEFINITION"
array::join(array, string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::join(["again", "again", "again"], " and ");

"again and again and again"
```

<br />

## `array::last`

The `array::last` function returns the last value from an array.

```surql title="API DEFINITION"
array::last(array) -> any
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::last([ 's', 'u', 'r', 'r', 'e', 'a', 'l' ]);

"l"
```

<br />

## `array::len`

The `array::len` function calculates the length of an array, returning a number. This function includes all items when counting the number of items in the array. If you want to only count [truthy](/docs/surrealql/datamodel/values#values-and-truthiness) values, then use the [count()](/docs/surrealql/functions/database/count) function.

```surql title="API DEFINITION"
array::len(array) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::len([ 1, 2, 1, null, "something", 3, 3, 4, 0 ]);

9
```

<br />

## `array::logical_and`

The `array::logical_and` function performs the [`AND` logical operation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND) element-wise between two arrays.
The resulting array will have a length of the longer of the two input arrays, where each element is the result of the logical `AND` operation performed between an element from the left hand side array and an element from the right hand side array.

When both of the compared elements are truthy, the resulting element will have the type and value of one of the two truthy values, prioritizing the value and type of the element from the left hand side (the first array).

When one or both of the compared elements are not truthy, the resulting element will have the type and value of one of the non-truthy value(s), prioritizing the value and type of the element from the left hand side (the first array).

```surql title="API DEFINITION"
array::logical_and(lh: array, rh: array)
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::logical_and([true, false, true, false], [true, true, false, false]);

[ true, false, false, false ]
```
For those that take two arrays, missing elements (if one array is shorter than the other) are considered `null` and thus false

```surql
RETURN array::logical_and([0, 1], [])

[ 0, null ]
```

<br />

## `array::logical_or`

The `array::logical_or` function performs the [`OR` logical operations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR) element-wise between two arrays.

The resulting array will have a length of the longer of the two input arrays, where each element is the result of the logical `OR` operation performed between an element from the left hand side array and an element from the right hand side array.

When one or both of the compared elements are truthy, the resulting element will have the type and value of one of the two truthy value(s), prioritizing the value and type of the element from the left hand side (the first array).

When both of the compared elements are not truthy, the resulting element will have the type and value of one of the non-truthy values, prioritizing the value and type of the element from the left hand side (the first array).

```surql title="API DEFINITION"
array::logical_or(lh: array, rh: array)
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::logical_or([true, false, true, false], [true, true, false, false]);

[ true, true, true, false ]
```
If one of the array is empty, the first array is returned.

```surql
RETURN array::logical_or([0, 1], []);

[ 0, 1 ]
```

<br />

## `array::logical_xor`

The `array::logical_xor` function performs the [`XOR` logical operations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR) element-wise between two arrays.

The resulting array will have a length of the longer of the two input arrays, where each element is the result of the logical `XOR` operation performed between an element from the left hand side array and an element from the right hand side array.

When exactly one of the compared elements is truthy, the resulting element will have the type and value of the truthy value.

When both of the compared elements are truthy, the resulting element will be the `bool` value `false`.

When neither of the compared elements are truthy, the resulting element will have the type and value of one of the non-truthy values, prioritizing the value and type of the element from the left hand side (the first array).

```surql title="API DEFINITION"
array::logical_xor(lh: array, rh: array)
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::logical_xor([true, false, true, false], [true, true, false, false]);

[ false, true, true, false ]
```
If one of the array is empty, the first array is returned.
```surql
RETURN array::logical_xor([0, 1], [])

[ 0, 1 ]
```

<br />

## `array::map`

The `array::map` function allows the user to call an [anonymous function](/docs/surrealql/datamodel/closures) (closure) that is performed on every item in the array before passing it on.

```surql title="API DEFINITION"
array::map(array, @closure) -> array;
```

The most basic use of `array::map` involves choosing a parameter name for each item in the array and a desired output. The following example gives each item the parameter name `$v`, which can then be used to double the value.

```surql
[1, 2, 3].map(|$v| $v * 2);
```

```surql title="Response"
[
  2,
  4,
  6
]
```

An example of a longer operation that uses `{}` to allow the closure to take multiple lines of code:

```surql
["1", "2", "3"].map(|$val| {
  LET $num = <number>$val;
  LET $is_even = IF $num % 2 = 0 { true } ELSE { false };
  {
    value: $num,
    is_even: $is_even
  }
});
```

```surql title="Response"
[
	{
		is_even: false,
		value: 1
	},
	{
		is_even: true,
		value: 2
	},
	{
		is_even: false,
		value: 3
	}
]

```

The types for the closure arguments and output can be annotated for extra type safety. Take the following simple closure:

```surql
[1, 2, 3].map(|$num| $num + 1.1);
```

The output is `[2.1f, 3.1f, 4.1f]`.

However, if the `1.1` inside the function was actually a typo and should have been the integer 11, the following would have prevented it from running.

```surql
[1, 2, 3].map(|$num: int| -> int { $num + 1.1 });
```

```surql title="Response"
'There was a problem running the ANONYMOUS function. Expected this function to return a value of type int, but found 2.1f'
```

The `array::map` function also allows access to the index of each item if a second parameter is added.

```surql
[
  ": first used in the year 876",
  ": the number of moons in the sky",
  ": also called a pair"
]
  .map(|$item, $index| <string>$index + $item);
```

```surql title="Response"
[
	'0: first used in the year 876',
	'1: the number of moons in the sky',
	'2: also called a pair'
]
```

The `array::map()` function can be used to generate an array of values that can then be passed on to statements like [`INSERT`](/docs/surrealql/statements/insert) for bulk insertion.

```surql
-- Create 1000 objects with a random ULID
INSERT INTO person ((<array>0..=1000).map(|| {id: rand::ulid()}));
```

For a similar function that allows using a closure on entire values instead of each item in an array, see the [chain](/docs/surrealql/functions/database/value#chain) method.

## `array::max`

The `array::max` function returns the greatest value from an array of values.

```surql title="API DEFINITION"
array::max(array<any>) -> any
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::max([0, 1, 2]);

2
```

As any value can be compared with another value, the array can be an array of any SurrealQL value.

```surql
array::max([NONE, NULL, 9, 9.9]);

9.9f
```

See also:

* [`math::max`](/docs/surrealql/functions/database/math#mathmax), which extracts the greatest number from an array of numbers
* [`time::max`](/docs/surrealql/functions/database/time#timemax), which extracts the greatest datetime from an array of datetimes
* [How values are compared and ordered in SurrealDB](/docs/surrealql/datamodel/values#comparing-and-ordering-values)

## `array::matches`

The `array::matches` function returns an array of booleans indicating which elements of the input array contain a specified value.


```surql title="API DEFINITION"
array::matches(array, value) -> array<bool>
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::matches([0, 1, 2], 1);

[false, true, false]
```
The following example shows this function when the array contains objects.

```surql
RETURN array::matches([{id: r"ohno:0"}, {id: r"ohno:1"}], {id: r"ohno:1"});

[ false, true ]
```

<br />

## `array::min`

The `array::min` function returns the least value from an array of values.

```surql title="API DEFINITION"
array::min(array<any>) -> any
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::min([0, 1, 2]);

0
```

As any value can be compared with another value, the array can be an array of any SurrealQL value.

```surql
array::min([NONE, NULL, 9, 9.9]);

NONE
```

See also:

* [`math::min`](/docs/surrealql/functions/database/math#mathmin), which extracts the least number from an array of numbers
* [`time::min`](/docs/surrealql/functions/database/time#timemin), which extracts the least datetime from an array of datetimes
* [How values are compared and ordered in SurrealDB](/docs/surrealql/datamodel/values#comparing-and-ordering-values)

## `array::pop`

The `array::pop` function removes a value from the end of an array and returns it. If the array is empty, NONE is returned.


```surql title="API DEFINITION"
array::pop(array) -> value
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::pop([ 1, 2, 3, 4 ]);

4
```

<br />

## `array::prepend`

The `array::prepend` function prepends a value to the beginning of an array.


```surql title="API DEFINITION"
array::prepend(array, value) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::prepend([1, 2, 3, 4], 5);

[ 5, 1, 2, 3, 4 ]
```

<br />

## `array::push`

The `array::push` function prepends a value to the end of an array.


```surql title="API DEFINITION"
array::push(array, value) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::push([1, 2, 3, 4], 5);

[ 1, 2, 3, 4, 5 ]
```

<br />

## `array::range`

<Since v="v2.0.0" />

The `array::range` function creates an array of numbers from a given range.

```surql title="API DEFINITION"
array::range(start: int, count: int) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::range(1, 10);

[ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
```

```surql
RETURN array::range(3, 2);

[ 3, 4 ]
```

<br />

## `array::reduce`

<Since v="v2.1.0" />

The `array::reduce` function reduces the elements of an array to a single final value by allowing an operation to be performed at each step of the way as each subsequent item in the array is encountered. To use `array::reduce`, pass in parameter names for the current value and the next value and an operation to perform on them. If you need an initial value to pass in before the other items are operated on, use the [`array::fold`](/docs/surrealql/functions/database/array#arrayfold) function instead.

```surql title="API DEFINITION"
array::reduce(array, @closure) -> value
```

This function is commonly used to sum or perform some other mathematical operation on the items in an array.

```surql
[10,20,30,40].reduce(|$a, $b| $a + $b);
```

The function will then perform the following operation for each step of the way.

* `$a` = 10, `$b` = 20. Operation `$a + $b` = 30. 30 is passed on.
* `$a` = 30, `$b` = 30. Operation `$a + $b` = 60. 60 is passed on.
* `$a` = 60, `$b` = 40. Operation `$a + $b` = 100. No more items to operate on in the array, 100 is returned.

Another example showing `array::reduce()` used to reverse a `string`:

```surql
"I am a forwards string"
  .split('')
  .reduce(|$one, $two| $two + $one);
```

```surql title="Output"
'gnirts sdrawrof a ma I'
```

Or to modify a string in some other way.

```surql
"I don't like whitespace"
  .split(" ")
  .reduce(|$one, $two| $one + "_" + $two);
```

```surql title="Output"
"I_don't_like_whitespace"
```

It is often nice to know which item of the array one is working with. The following example shows a reduce operation performed on an array, but only up to index 2. For any further indexes, the value is simply passed on.

```surql
[
    {
        name: "Daughter",
        money: 100
    },
    {
        name: "Father",
        money: 1000
    },
    {
        name: "Grandfather",
        money: 550
    },
    {
        name: "Great-grandmother",
        money: 10000
    }
].reduce(|$one, $two, $index| IF $index > 2 { $one } ELSE {
    {
        name: $one.name + " and " + $two.name,
        money: $one.money + $two.money
    }
});
```

```surql title="Output"
{
	money: 1650,
	name: 'Daughter and Father and Grandfather'
}
```

## `array::remove`

The `array::remove` function removes an item from a specific position in an array. A negative index can be provided to specify a position relative to the end of the array.


```surql title="API DEFINITION"
array::remove(array, number) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::remove([1, 2, 3, 4, 5], 2);

[ 1, 2, 4, 5 ]
```

The following examples shows this function using a negative index.
```surql
RETURN array::remove([1, 2, 3, 4, 5], -2);

[ 1, 2, 3, 5 ]
```

<br />

## `array::repeat`

<Since v="v2.0.0" />

The `array::repeat` function creates an array of a given size contain the specified value for each element.

```surql title="API DEFINITION"
array::repeat(any, count: int) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::repeat(1, 10);

[ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]
```

```surql
RETURN array::repeat("hello", 2);

[ "hello", "hello" ]
```

<br />

## `array::reverse`

The `array::reverse` function reverses the sorting order of an array.


```surql title="API DEFINITION"
array::reverse(array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::reverse([ 1, 2, 3, 4, 5 ]);

[ 5, 4, 3, 2, 1 ]
```

<br />

## `array::shuffle`

<Since v="v2.0.0" />

The `array::shuffle` function randomly shuffles the items of an array.

```surql title="API DEFINITION"
array::shuffle(array) -> array
```

The following example shows this function, and its possible output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::shuffle([ 1, 2, 3, 4, 5 ]);

[ 2, 1, 4, 3, 5 ]
```

<br />

## `array::slice`

The `array::slice` function returns a slice of an array, based on a starting position, and a length or negative position.


```surql title="API DEFINITION"
array::slice(array, start: int, len: int) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::slice([ 1, 2, 3, 4, 5 ], 1, 2);

[2, 3]
```

The following example shows how you can use this function with a starting position, and a negative position, which will slice off the first and last element from the array:

```surql
RETURN array::slice([ 1, 2, 3, 4, 5 ], 1, -1);

[ 2, 3, 4 ]
```
The following example shows how you can use this function with just a starting position, which will only slice from the beginning of the array:

```surql
RETURN array::slice([ 1, 2, 3, 4, 5 ], 2);

[ 3, 4, 5 ]
```

The following example shows how you can use this function with just a negative position, which will only slice from the end of the array:

```surql
RETURN array::slice([ 1, 2, 3, 4, 5 ], -2);

[ 4, 5 ]
```
The following example shows how you can use this function with a negative position, and a length of the slice:

```surql
RETURN array::slice([ 1, 2, 3, 4, 5 ], -3, 2);

[ 3, 4 ]
```

<br />

## `array::sort`

The `array::sort` function sorts the values in an array in ascending or descending order.


```surql title="API DEFINITION"
array::sort(array) -> array
```

The function also accepts a second boolean parameter which determines the sorting direction. The second parameter can be `true` for ascending order, or `false` for descending order.

```surql title="API DEFINITION"
array::sort(array, bool) -> array
```
The function also accepts a second string parameter which determines the sorting direction. The second parameter can be `'asc'` for ascending order, or `'desc'` for descending order.

```surql title="API DEFINITION"
array::sort(array, string) -> array
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::sort([ 1, 2, 1, null, "something", 3, 3, 4, 0 ]);

[ null, 0, 1, 1, 2, 3, 3, 4, "something" ]
```
```surql
RETURN array::sort([1, 2, 1, null, "something", 3, 3, 4, 0], false);

[ "something", 4, 3, 3, 2, 1, 1, 9, null ]
```
```surql
RETURN array::sort([1, 2, 1, null, "something", 3, 3, 4, 0], "asc");

[ null, 0, 1, 1, 2, 3, 3, 4, "something" ]
```
```surql
RETURN array::sort([1, 2, 1, null, "something", 3, 3, 4, 0], "desc");

[ "something", 4, 3, 3, 2, 1, 1, 9, null ]
```

## `array::sort_lexical`

> [!NOTE]
> Only available in nightly, will be available in the next release. 

The `array::sort_natural_lexical` function sorts the values in an array in ascending or descending order, with alphabetical strings sorted in lexical order instead of unicode list order.

```surql title="API DEFINITION"
array::sort_lexical(array) -> array
```

The function also accepts a second boolean parameter which determines the sorting direction. The second parameter can be `true` for ascending order, or `false` for descending order.

```surql title="API DEFINITION"
array::sort_lexical(array, bool) -> array
```
The function also accepts a second string parameter which determines the sorting direction. The second parameter can be `'asc'` for ascending order, or `'desc'` for descending order.

```surql title="API DEFINITION"
array::sort_lexical(array, string) -> array
```

The following example shows that `array::sort_lexical` will sort strings in lexical (alphabetical) order instead of Unicode list order. As an accented 'Á' is listed later in Unicode than regular ASCII letters, the function `array::sort` will show the name 'Álvares' listed after the word 'senhor', but `array::sort_lexical` will show the name at the front of the array instead.

```surql
['Obrigado', 'senhor', 'Álvares'].sort();
['Obrigado', 'senhor', 'Álvares'].sort_lexical();
```

```surql title="Output"
-------- Query 1 (443.209µs) --------

[ 'Obrigado', 'senhor', 'Álvares' ]

-------- Query 2 (457.542µs) --------

[ 'Álvares', 'Obrigado', 'senhor' ]
```

## `array::sort_natural`

> [!NOTE]
> Only available in nightly, will be available in the next release. 

The `array::sort_natural` function sorts the values in an array in ascending or descending order, with numeric strings sorted in numeric order instead of regular string order.

```surql title="API DEFINITION"
array::sort_natural(array) -> array
```

The function also accepts a second boolean parameter which determines the sorting direction. The second parameter can be `true` for ascending order, or `false` for descending order.

```surql title="API DEFINITION"
array::sort_natural(array, bool) -> array
```
The function also accepts a second string parameter which determines the sorting direction. The second parameter can be `'asc'` for ascending order, or `'desc'` for descending order.

```surql title="API DEFINITION"
array::sort_natural(array, string) -> array
```

The following example shows that `array::sort_natural` will sort numeric strings as if they were numbers. The `array::sort` function, on the other hand, treats a string like '3' as greater than '11' due to the first character in '3' being greater than '1'.

Note that strings sorted in numeric order will still appear after actual numbers, as [a string will always be greater than a number](/docs/surrealql/datamodel/values).

```surql
[8, 9, 10, '3', '2.2', '11'].sort();
[8, 9, 10, '3', '2.2', '11'].sort_natural();
```

```surql title="Output"
-------- Query --------

[ 8, 9, 10, '11', '2.2', '3' ]

-------- Query 2 (332.667µs) --------

[ 8, 9, 10, '2.2', '3', '11' ]
```

## `array::sort_natural_lexical`

> [!NOTE]
> Only available in nightly, will be available in the next release. 


The `array::sort_natural_lexical` function sorts the values in an array in ascending or descending order, while sorting numeric strings in numeric order and alphabetical strings in lexical order.

```surql title="API DEFINITION"
array::sort_natural_lexical(array) -> array
```

The function also accepts a second boolean parameter which determines the sorting direction. The second parameter can be `true` for ascending order, or `false` for descending order.

```surql title="API DEFINITION"
array::sort_natural_lexical(array, bool) -> array
```
The function also accepts a second string parameter which determines the sorting direction. The second parameter can be `'asc'` for ascending order, or `'desc'` for descending order.

```surql title="API DEFINITION"
array::sort_natural_lexical(array, string) -> array
```

The following example shows that `array::sort_natural_lexical` will sort numeric strings as if they were numbers, and alphabetical strings in lexical order instead of Unicode order. The `array::sort` function, on the other hand, treats a string like '3' as greater than '11' due to the first character in '3' being greater than '1', and sorts the name 'Álvares' after the string 'senhor' because the 'Á' character comes after regular ASCII characters in Unicode.

```surql
['Obrigado', 'senhor', 'Álvares', 8, 9, 10, '3', '2.2', '11'].sort();
['Obrigado', 'senhor', 'Álvares', 8, 9, 10, '3', '2.2', '11'].sort_natural_lexical();
```

```surql title="Output"
-------- Query --------

[ 8, 9, 10, '11', '2.2', '3', 'Obrigado', 'senhor', 'Álvares' ]

-------- Query 2 (332.667µs) --------

[ 8, 9, 10, '2.2', '3', '11', 'Álvares', 'Obrigado', 'senhor' ]
```

## `array::sort::asc`

The `array::sort::asc` function is a shorthand convenience function for the `array::sort` function, to sort values in an array in ascending order.


```surql title="API DEFINITION"
array::sort::asc(array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::sort::asc([ 1, 2, 1, null, "something", 3, 3, 4, 0 ]);

[ null, 0, 1, 1, 2, 3, 3, 4, "something" ]
```

<br />

## `array::sort::desc`

The `array::sort::desc` function is a shorthand convenience function for the `array::sort` function, to sort values in an array in descending order.


```surql title="API DEFINITION"
array::sort::desc(array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::sort::desc([ 1, 2, 1, null, "something", 3, 3, 4, 0 ]);

[ "something", 4, 3, 3, 2, 1, 1, 9, null ]
```

<br />

## `array::swap`

<Since v="v2.0.0" />

The `array::swap` function swaps two values of an array based on indexes.


```surql title="API DEFINITION"
array::swap(array, from: int, to: int) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::swap(["What's", "its", "got", "in", "it", "pocketses?"], 1, 4);
```

```surql title="Output"
[
	"What's",
	'it',
	'got',
	'in',
	'its',
	'pocketses?'
]
```

The following example shows how you can use this function with a positive index, and a negative index, which will swap the first and last element from the array:

```surql
RETURN array::swap([ 1, 2, 3, 4, 5 ], 0, -1);

[ 5, 2, 3, 4, 1 ]
```

An error will be returned if any of the indexes are invalid that informs of range of possible indexes that can be used.

```surql
RETURN array::swap([0, 1], 100, 1000000);
```

```surql title="Output"
'Incorrect arguments for function array::swap(). Argument 1 is out of range. Expected a number between -2 and 2'
```

<br />

## `array::transpose`

The `array::transpose` function is used to perform 2d array transposition but its behavior in cases of arrays of differing sizes can be best described as taking in multiple arrays and 'layering' them on top of each other.


```surql title="API DEFINITION"
array::transpose(array<array>) -> array<array>
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::transpose([[0, 1], [2, 3]]);

[ [0, 2], [1, 3] ]
```

The layering of the above example can be visualized as follows.

```
0 1
2 3
↓ ↓ 
0 1   
2 3
```

Imagining a Rubik's Cube is another easy way to conceptualize this function.

```surql
RETURN array::transpose([
    ['🟦', '🟥', '🟩'],
    ['⬜', '🟦', '🟨'],
    ['🟧', '🟧', '🟥']
]);
```

The output shows the same blocks, but lined up top to bottom instead of left to right.

```surql
[
	[
		'🟦',
		'⬜',
		'🟧'
	],
	[
		'🟥',
		'🟦',
		'🟧'
	],
	[
		'🟩',
		'🟨',
		'🟥'
	]
]
```

Another example of the function used for the statistics of two people:

```surql
[["Name", "Age"], ["Billy", 25], ["Alice", 30]].transpose();
```

```surql title="Output"
[
	[
		'Name',
		'Billy',
		'Alice'
	],
	[
		'Age',
		25,
		30
	]
]
```

The logic of this function for arrays of differing length was improved in SurrealDB 2.2, in which `NONE` is now added at points in which no item is found at an index. Take the following movies for example, in which one — Groundhog Day — does not have a bad guy.

```surql
[
    ['Movie', 'Bad guy'], 
    ['Avengers: Infinity War', 'Thanos'], 
    ['Groundhog Day'],
    ['Star Wars', 'Palpatine']
].transpose();
```

<Tabs>
  <TabItem label="Output since 2.2" default>

```surql
[
	[
		'Movie',
		'Avengers: Infinity War',
		'Groundhog Day',
		'Star Wars'
	],
	[
		'Bad guy',
		'Thanos',
		NONE,
		'Palpatine'
	]
]
```
  </TabItem>

  <TabItem label="Output before 2.2" default>
```surql
[
	[
		'Movie',
		'Avengers: Infinity War',
		'Groundhog Day',
		'Star Wars'
	],
	[
		'Bad guy',
		'Thanos',
		'Palpatine'
	]
]
```
  </TabItem>
</Tabs>

This new behaviour allows transposed arrays to be transposed once more to restore the original output, except with `NONE` added in all the indexes that lack in any array.

```surql
[
	[
		'Movie',
		'Bad guy'
	],
	[
		'Avengers: Infinity War',
		'Thanos'
	],
	[
		'Groundhog Day'
	],
	[
		'Star Wars',
		'Palpatine'
	]
].transpose().transpose();
```

```surql title="Output"
[
	[
		'Movie',
		'Bad guy'
	],
	[
		'Avengers: Infinity War',
		'Thanos'
	],
	[
		'Groundhog Day',
		NONE
	],
	[
		'Star Wars',
		'Palpatine'
	]
]
```

## `array::union`

The `array::union` function combines two arrays together, removing duplicate values, and returning a single array.


```surql title="API DEFINITION"
array::union(array, array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN array::union([1, 2, 1, 6], [1, 3, 4, 5, 6]);

[ 1, 2, 6, 3, 4, 5 ]
```

<br /><br />

## `array::windows`

<Since v="v2.0.0" />

```surql title="API DEFINITION"
array::windows(array, size: int) -> array
```

The `array::windows` function returns a number of arrays of length `size` created by moving one index at a time down the original array. The arrays returned are guaranteed to be of length `size`. As a result, the function will return an empty array if the length of the original array is not large enough to create a single output array.

The following examples show this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
LET $array = [1, 2, 3, 4];
RETURN array::windows($array, 2);
RETURN array::windows($array, 5);
```

```surql title="Response"
[ [1, 2], [2, 3], [3, 4] ];
[];
```

An example of the same function used in a `RELATE` statement:

```surql
CREATE person:grandfather, person:father, person:son;

FOR $pair IN array::windows(["grandfather", "father", "son"], 2) {
    LET $first = type::thing("person", $pair[0]);
    LET $second = type::thing("person", $pair[1]);
    RELATE $first->father_of->$second;
};

SELECT id, ->father_of->person, ->father_of->father_of->person FROM person;
```

## Method chaining

<Since v="v2.0.0" />

Method chaining allows functions to be called using the `.` dot operator on a value of a certain type instead of the full path of the function followed by the value.

```surql
-- Traditional syntax
array::push(["Again", "again"], "again");

-- Method chaining syntax
["Again", "again"].push("again");
```

```surql title="Response"
["Again", "again", "again"]
```

This is particularly useful for readability when a function is called multiple times.

```surql
-- Traditional syntax
array::join(array::push(["Again", "again"], "again"));

-- Method chaining syntax
["Again", "again"].push("again").join(" and ");
```

```surql title="Response"
"Again and again and again"
```

---
sidebar_position: 4
sidebar_label: Bytes functions
title: Bytes functions | SurrealQL
description: These functions can be used when working with bytes.
---

# Bytes functions

These functions can be used when working with bytes in SurrealQL.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#byteslen"><code>bytes::len()</code></a></td>
      <td scope="row" data-label="Description">Gives the length in bytes</td>
    </tr>
  </tbody>
</table>

## `bytes::len`

The `bytes::len` function returns the length in bytes of a `bytes` value.


```surql title="API DEFINITION"
bytes::len(bytes) -> int
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql 
RETURN [
    bytes::len(<bytes>"Simple ASCII string"),
    bytes::len(<bytes>"οὐ γὰρ δυνατόν ἐστιν ἔτι καθεύδειν"),
    bytes::len(<bytes>"청춘예찬 靑春禮讚")
];
```

---
sidebar_position: 5
sidebar_label: Count function
title: Count function | SurrealQL
description: This function can be used when counting field values and expressions.
---

# Count function

This function can be used when counting field values and expressions.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#count"><code>count()</code></a></td>
      <td scope="row" data-label="Description">Counts a row, or whether a given value is truthy</td>
    </tr>
  </tbody>
</table>

## `count`

The count function counts the number of times that the function is called. This is useful for returning the total number of rows in a SELECT statement with a `GROUP BY` clause.

```surql title="API DEFINITION"
count() -> 1
```
If a value is given as the first argument, then this function checks whether a given value is [truthy](/docs/surrealql/datamodel/values#values-and-truthiness). This is useful for returning the total number of rows, which match a certain condition, in a [`SELECT`](/docs/surrealql/statements/select) statement, with a GROUP BY clause.

```surql title="API DEFINITION"
count(any) -> number
```

If an array is given, this function counts the number of items in the array which are [truthy](/docs/surrealql/datamodel/values#values-and-truthiness). If, instead, you want to count the total number of items in the given array, then use the [`array::len()`](/docs/surrealql/functions/database/array#arraylen) function.

```surql title="API DEFINITION"
count(array) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql 
RETURN count();

1
```
```surql
RETURN count(true);

1
```
```surql
RETURN count(10 > 15);

0
```
```surql
RETURN count([ 1, 2, 3, null, 0, false, (15 > 10), rand::uuid() ]);

5
```
The following examples show this function being used in a [`SELECT`](/docs/surrealql/statements/select) statement with a GROUP clause: 

```surql
SELECT 
	count() 
FROM [
	{ age: 33 }, 
	{ age: 45 }, 
	{ age: 39 }
] 
GROUP ALL;
```
```json
[{ count: 3 }]
```

```surql
SELECT 
	count(age > 35) 
FROM [
	{ age: 33 }, 
	{ age: 45 }, 
	{ age: 39 }
] 
GROUP ALL;
```
```json
[{ count: 2 }]
```

An advanced example of the count function can be seen below:

```surql
SELECT
	country,
	count(age > 30) AS total
FROM [
	{ age: 33, country: 'GBR' },
	{ age: 45, country: 'GBR' },
	{ age: 39, country: 'USA' },
	{ age: 29, country: 'GBR' },
	{ age: 43, country: 'USA' }
]
GROUP BY country;
```
```json
[
	{
		country: 'GBR',
		total: 2
	},
	{
		country: 'USA',
		total: 2
	}
]
```

<br /><br />

---
sidebar_position: 6
sidebar_label: Crypto functions
title: Crypto functions | SurrealQL
description: These functions can be used when hashing data, encrypting data, and for securely authenticating users into the database.
---

import Since from '@components/shared/Since.astro'

# Crypto functions

These functions can be used when hashing data, encrypting data, and for securely authenticating users into the database.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#cryptoblake3"><code>crypto::blake3()</code></a></td>
      <td scope="row" data-label="Description">Returns the blake3 hash of a value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#cryptomd5"><code>crypto::md5()</code></a></td>
      <td scope="row" data-label="Description">Returns the md5 hash of a value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#cryptosha1"><code>crypto::sha1()</code></a></td>
      <td scope="row" data-label="Description">Returns the sha1 hash of a value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#cryptosha256"><code>crypto::sha256()</code></a></td>
      <td scope="row" data-label="Description">Returns the sha256 hash of a value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#cryptosha512"><code>crypto::sha512()</code></a></td>
      <td scope="row" data-label="Description">Returns the sha512 hash of a value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#cryptoargon2compare"><code>crypto::argon2::compare()</code></a></td>
      <td scope="row" data-label="Description">Compares an argon2 hash to a password</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#cryptoargon2generate"><code>crypto::argon2::generate()</code></a></td>
      <td scope="row" data-label="Description">Generates a new argon2 hashed password</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#cryptobcryptcompare"><code>crypto::bcrypt::compare()</code></a></td>
      <td scope="row" data-label="Description">Compares an bcrypt hash to a password</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#cryptobcryptgenerate"><code>crypto::bcrypt::generate()</code></a></td>
      <td scope="row" data-label="Description">Generates a new bcrypt hashed password</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#cryptopbkdf2compare"><code>crypto::pbkdf2::compare()</code></a></td>
      <td scope="row" data-label="Description">Compares an pbkdf2 hash to a password</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#cryptopbkdf2generate"><code>crypto::pbkdf2::generate()</code></a></td>
      <td scope="row" data-label="Description">Generates a new pbkdf2 hashed password</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#cryptoscryptcompare"><code>crypto::scrypt::compare()</code></a></td>
      <td scope="row" data-label="Description">Compares an scrypt hash to a password</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#cryptoscryptgenerate"><code>crypto::scrypt::generate()</code></a></td>
      <td scope="row" data-label="Description">Generates a new scrypt hashed password</td>
    </tr>
  </tbody>
</table>

## `crypto::blake3`

<Since v="v2.0.0" />

The `crypto::blake3` function returns the blake3 hash of the input value.

```surql title="API DEFINITION"
crypto::blake3(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN crypto::blake3("tobie");

'85052e9aab1b67b6622d94a08441b09fd5b7aca61ee360416d70de5da67d86ca'
```

<br />

## `crypto::md5`

The `crypto::md5` function returns the md5 hash of the input value.

```surql title="API DEFINITION"
crypto::md5(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN crypto::md5("tobie");

"4768b3fc7ac751e03a614e2349abf3bf"
```

<br />

## `crypto::sha1`

The `crypto::sha1` function returns the sha1 hash of the input value.

```surql title="API DEFINITION"
crypto::sha1(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN crypto::sha1("tobie");

"c6be709a1b6429472e0c5745b411f1693c4717be"
```

<br />

## `crypto::sha256`

The `crypto::sha256` function returns the sha256 hash of the input value.

```surql title="API DEFINITION"
crypto::sha256(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN crypto::sha256("tobie");

"33fe1859daba927ea5674813adc1cf34b9e2795f2b7e91602fae19c0d0c493af"
```

<br />

## `crypto::sha512`

The `crypto::sha512` function returns the sha512 hash of the input value.

```surql title="API DEFINITION"
crypto::sha512(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN crypto::sha512("tobie");

"39f0160c946c4c53702112d6ef3eea7957ea8e1c78787a482a89f8b0a8860a20ecd543432e4a187d9fdcd1c415cf61008e51a7e8bf2f22ac77e458789c9cdccc"
```

<br />

## `crypto::argon2::compare`

The `crypto::argon2::compare` function compares a hashed-and-salted argon2 password value with an unhashed password value.

```surql title="API DEFINITION"
crypto::argon2::compare(string, string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
LET $hash = "$argon2id$v=19$m=4096,t=3,p=1$pbZ6yJ2rPJKk4pyEMVwslQ$jHzpsiB+3S/H+kwFXEcr10vmOiDkBkydVCSMfRxV7CA";
LET $pass = "this is a strong password";
RETURN crypto::argon2::compare($hash, $pass);


true
```

<br />

## `crypto::argon2::generate`

The `crypto::argon2::generate` function hashes and salts a password using the argon2 hashing algorithm.

> [!IMPORTANT]
> At this time, there is no way to customize the parameters for this function. This applies to: memory, iterations and parallelism.

```surql title="API DEFINITION"
crypto::argon2::generate(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN crypto::argon2::generate("this is a strong password");

"$argon2id$v=19$m=4096,t=3,p=1$pbZ6yJ2rPJKk4pyEMVwslQ$jHzpsiB+3S/H+kwFXEcr10vmOiDkBkydVCSMfRxV7CA"
```

<br />

## `crypto::bcrypt::compare`

The `crypto::bcrypt::compare` function compares a hashed-and-salted bcrypt password value with an unhashed password value.

```surql title="API DEFINITION"
crypto::bcrypt::compare(string, any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
LET $hash = "$2b$12$OD7hrr1Hycyk8NUwOekYY.cogCICpUnwNvDZ9NiC1qCPHzpVAQ9BO";
LET $pass = "this is a strong password";
RETURN crypto::bcrypt::compare($hash, $pass);

true
```

<br />

## `crypto::bcrypt::generate`

The `crypto::bcrypt::generate` function hashes and salts a password using the bcrypt hashing algorithm.

> [!IMPORTANT]
> At this time, there is no way to customize the work factor for bcrypt.

```surql title="API DEFINITION"
crypto::bcrypt::generate(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN crypto::bcrypt::generate("this is a strong password");

"$2b$12$OD7hrr1Hycyk8NUwOekYY.cogCICpUnwNvDZ9NiC1qCPHzpVAQ9BO"
```

<br />

## `crypto::pbkdf2::compare`

The `crypto::pbkdf2::compare` function compares a hashed-and-salted pbkdf2 password value with an unhashed password value.

```surql title="API DEFINITION"
crypto::pbkdf2::compare(string, string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
LET $hash = "$pbkdf2-sha256$i=10000,l=32$DBURRPJODKEt0IId1Lqe+w$Ve8Z00mibHDSKLbyKTceEBBcDpGoK0AEUl7QzDTIec4";
LET $pass = "this is a strong password";
RETURN crypto::pbkdf2::compare($hash, $pass);


true
```

<br />

## `crypto::pbkdf2::generate`

The `crypto::pbkdf2::generate` function hashes and salts a password using the pbkdf2 hashing algorithm.

> [!IMPORTANT]
> At this time, there is no way to customize the number of iterations for pbkdf2.

```surql title="API DEFINITION"
crypto::pbkdf2::generate(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN crypto::pbkdf2::generate("this is a strong password");

"$pbkdf2-sha256$i=10000,l=32$DBURRPJODKEt0IId1Lqe+w$Ve8Z00mibHDSKLbyKTceEB"
```

<br />

## `crypto::scrypt::compare`

The `crypto::scrypt::compare` function compares a hashed-and-salted scrypt password value with an unhashed password value.

```surql title="API DEFINITION"
crypto::scrypt::compare(string, string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
LET $hash = "$scrypt$ln=15,r=8,p=1$8gl7bipl0FELTy46YJOBrw$eRcS1qR22GI8VHo58WOXn9JyfDivGo5yTJFvpDyivuw";
LET $pass = "this is a strong password";
RETURN crypto::scrypt::compare($hash, $pass);


true
```

<br />

## `crypto::scrypt::generate`

The `crypto::scrypt::generate` function hashes and salts a password using the scrypt hashing algorithm.

> [!IMPORTANT]
> At this time, there is no way to customize the parameters for this function. This applies to: cost parameter, block size and parallelism.

```surql title="API DEFINITION"
crypto::scrypt::generate(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN crypto::scrypt::generate("this is a strong password");

"$scrypt$ln=15,r=8,p=1$8gl7bipl0FELTy46YJOBrw$eRcS1qR22GI8VHo58WOXn9JyfDivGo5yTJFvpDyivuw"
```

<br /><br />

```surql title="Output"
[ 19, 67, 25 ]
```

---
sidebar_position: 7
sidebar_label: Duration functions
title: Duration functions | SurrealQL
description: These functions can be used when converting between numeric and duration data.
---

import Since from '@components/shared/Since.astro'

# Duration functions

These functions can be used when converting between numeric and duration data.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationdays"><code>duration::days()</code></a></td>
      <td scope="row" data-label="Description">Counts how many days fit in a duration</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationhours"><code>duration::hours()</code></a></td>
      <td scope="row" data-label="Description">Counts how many hours fit in a duration</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationmax"><code>duration::max</code></a></td>
      <td scope="row" data-label="Description">Constant representing the greatest possible duration</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationmicros"><code>duration::micros()</code></a></td>
      <td scope="row" data-label="Description">Counts how many microseconds fit in a duration</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationmillis"><code>duration::millis()</code></a></td>
      <td scope="row" data-label="Description">Counts how many milliseconds fit in a duration</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationmins"><code>duration::mins()</code></a></td>
      <td scope="row" data-label="Description">Counts how many minutes fit in a duration</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationnanos"><code>duration::nanos()</code></a></td>
      <td scope="row" data-label="Description">Counts how many nanoseconds fit in a duration</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationsecs"><code>duration::secs()</code></a></td>
      <td scope="row" data-label="Description">Counts how many seconds fit in a duration</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationweeks"><code>duration::weeks()</code></a></td>
      <td scope="row" data-label="Description">Counts how many weeks fit in a duration</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationyears"><code>duration::years()</code></a></td>
      <td scope="row" data-label="Description">Counts how many years fit in a duration</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationfromdays"><code>duration::from::days()</code></a></td>
      <td scope="row" data-label="Description">Converts a numeric amount of days into a duration that represents days</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationfromhours"><code>duration::from::hours()</code></a></td>
      <td scope="row" data-label="Description">Converts a numeric amount of hours into a duration that represents hours</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationfrommicros"><code>duration::from::micros()</code></a></td>
      <td scope="row" data-label="Description">Converts a numeric amount of microseconds into a duration that represents microseconds</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationfrommillis"><code>duration::from::millis()</code></a></td>
      <td scope="row" data-label="Description">Converts a numeric amount of milliseconds into a duration that represents milliseconds</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationfrommins"><code>duration::from::mins()</code></a></td>
      <td scope="row" data-label="Description">Converts a numeric amount of minutes into a duration that represents minutes</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationfromnanos"><code>duration::from::nanos()</code></a></td>
      <td scope="row" data-label="Description">Converts a numeric amount of nanoseconds into a duration that represents nanoseconds</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationfromsecs"><code>duration::from::secs()</code></a></td>
      <td scope="row" data-label="Description">Converts a numeric amount of seconds into a duration that represents seconds</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#durationfromweeks"><code>duration::from::weeks()</code></a></td>
      <td scope="row" data-label="Description">Converts a numeric amount of weeks into a duration that represents weeks</td>
    </tr>
  </tbody>
</table>

## `duration::days`

The `duration::days` function counts how many days fit into a duration.

```surql title="API DEFINITION"
duration::days(duration) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::days(3w);

21
```

<br />

## `duration::hours`

The `duration::hours` function counts how many hours fit into a duration.


```surql title="API DEFINITION"
duration::hours(duration) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::hours(3w);

504
```

<br />

## `duration::max`

<Since v="v2.3.0" />

The `duration::max` constant represents the greatest possible duration that can be used.


```surql title="API DEFINITION"
duration::max -> duration
```

Some examples of the constant in use:

```surql
duration::max;

duration::max + 1ns;

100y IN 0ns..duration::max
```

```surql title="Output"
-------- Query 1 --------

584942417355y3w5d7h15s999ms999µs999ns

-------- Query 2 --------
'Failed to compute: "584942417355y3w5d7h15s999ms999µs999ns + 1ns", as the operation results in an arithmetic overflow.'

-------- Query 3 --------
true
```

<br />

## `duration::micros`

The `duration::micros` function counts how many microseconds fit into a duration.


```surql title="API DEFINITION"
duration::micros(duration) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::micros(3w);

1814400000000
```

<br />

## `duration::millis`

The `duration::millis` function counts how many milliseconds fit into a duration.


```surql title="API DEFINITION"
duration::millis(duration) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::millis(3w);

1814400000
```

<br />

## `duration::mins`

The `duration::mins` function counts how many minutes fit into a duration.


```surql title="API DEFINITION"
duration::mins(duration) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::mins(3w);

30240
```

<br />

## `duration::nanos`

The `duration::nanos` function counts how many nanoseconds fit into a duration.


```surql title="API DEFINITION"
duration::nanos(duration) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::nanos(3w);

1814400000000000
```

<br />

## `duration::secs`

The `duration::secs` function counts how many seconds fit into a duration.

```surql title="API DEFINITION"
duration::secs(duration) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::secs(3w);

1814400
```

<br />

## `duration::weeks`

The `duration::weeks` function counts how many weeks fit into a duration.

```surql title="API DEFINITION"
duration::weeks(duration) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::weeks(3w);

3
```

<br />

## `duration::years`

The `duration::years` function counts how many years fit into a duration.

```surql title="API DEFINITION"
duration::years(duration) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::years(300w);

5
```

<br />

## `duration::from::days`

The `duration::from::days` function counts how many years fit into a duration.

```surql title="API DEFINITION"
duration::from::days(number) -> duration
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::from::days(3);

3d
```

<br />

## `duration::from::hours`

The `duration::from::hours` function converts a numeric amount of hours into a duration that represents hours.

```surql title="API DEFINITION"
duration::from::hours(number) -> duration
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::from::hours(3);

3h
```

<br />

## `duration::from::micros`

The `duration::from::micros` function converts a numeric amount of microseconds into a duration that represents microseconds.

```surql title="API DEFINITION"
duration::from::micros(number) -> duration
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::from::micros(3);

3μs
```

<br />

## `duration::from::millis`

The `duration::from::millis` function converts a numeric amount of milliseconds into a duration that represents milliseconds.

```surql title="API DEFINITION"
duration::from::millis(number) -> duration
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::from::millis(3);

3ms
```

<br />

## `duration::from::mins`

The `duration::from::mins` function converts a numeric amount of minutes into a duration that represents minutes.

```surql title="API DEFINITION"
duration::from::mins(number) -> duration
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::from::mins(3);

3m
```

<br />

## `duration::from::nanos`

The `duration::from::nanos` function converts a numeric amount of nanoseconds into a duration that represents nanoseconds.

```surql title="API DEFINITION"
duration::from::nanos(number) -> duration
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::from::nanos(3);

3ns
```

<br />

## `duration::from::secs`

The `duration::from::secs` function converts a numeric amount of seconds into a duration that represents seconds.

```surql title="API DEFINITION"
duration::from::secs(number) -> duration
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::from::secs(3);

3s
```

<br />

## `duration::from::weeks`

The `duration::from::weeks` function converts a numeric amount of weeks into a duration that represents weeks.

```surql title="API DEFINITION"
duration::from::weeks(number) -> duration
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN duration::from::weeks(3);

3w
```

<br /><br />


## Method chaining

<Since v="v2.0.0" />

Method chaining allows functions to be called using the `.` dot operator on a value of a certain type instead of the full path of the function followed by the value.

```surql
-- Traditional syntax
duration::mins(2d6h);

-- Method chaining syntax
2d6h.mins();
```

```surql title="Response"
3240
```

This is particularly useful for readability when a function is called multiple times.

```surql
-- Traditional syntax
duration::mins(duration::from::millis(98734234));

-- Method chaining syntax
duration::from::millis(98734234).mins();
```

```surql title="Response"
1645
```

---
sidebar_position: 8
sidebar_label: Encoding functions
title: Encoding functions | SurrealQL
description: These functions can be used to encode and decode data in base64. It is particularly used when that data needs to be stored and transferred over media that are designed to deal with text. This encoding and decoding helps to ensure that the data remains intact without modification during transport.
---
import Since from '@components/shared/Since.astro'

import Tabs from "@components/Tabs/Tabs.astro";
import TabItem from "@components/Tabs/TabItem.astro";

# Encoding functions

These functions can be used to encode and decode data into other formats, such as `base64` and [`CBOR`](/docs/surrealdb/integration/cbor) (Concise Binary Object Representation). It is particularly used when that data needs to be stored and transferred over media that are designed to deal with text. This encoding and decoding helps to ensure that the data remains intact without modification during transport.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#encodingbase64decode"><code>encoding::base64::decode()</code></a></td>
      <td scope="row" data-label="Description">This function is used to decode data.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#encodingbase64encode"><code>encoding::base64::encode()</code></a></td>
      <td scope="row" data-label="Description"> This function is used to encode data with optionally padded output.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#encodingbase64decode"><code>encoding::base64::decode()</code></a></td>
      <td scope="row" data-label="Description">This function is used to decode base64 data.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#encodingcbordecode"><code>encoding::cbor::decode()</code></a></td>
      <td scope="row" data-label="Description">This function is used to decode data.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#encodingcborencode"><code>encoding::cbor::encode()</code></a></td>
      <td scope="row" data-label="Description">This function is used to encode data.</td>
    </tr>
  </tbody>
</table>

<br></br>

## `encoding::base64::encode()`

The `encoding::base64::encode()` function encodes a bytes to base64 with optionally padded output.

<Tabs>

<TabItem label="API DEFINITION (before 2.3.0)">
```surql
encoding::base64::encode(bytes) -> string
```

</TabItem>

<TabItem label="API DEFINITION (after 2.3.0)">
```surql
encoding::base64::encode(bytes, option<bool>) -> string
```

</TabItem>

</Tabs>

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN encoding::base64::encode(<bytes>"");

""
```

```surql
RETURN encoding::base64::encode(<bytes>"2323");

-- 'MjMyMw'
```

```surql
RETURN encoding::base64::encode(<bytes>"hello");

-- 'aGVsbG8'
```

As of version 2.3.0, you can pass `true` as the second argument to enable padded base64 outputs:
```surql
RETURN encoding::base64::encode(<bytes>"", true);

""
```

```surql
RETURN encoding::base64::encode(<bytes>"2323", true);

"MjMyMw=="
```

```surql
RETURN encoding::base64::encode(<bytes>"hello", true);

"aGVsbG8="
```

<br />

## `encoding::base64::decode()`

The `encoding::base64::decode()` function decodes a string into bytes.

```surql title="API DEFINITION"
encoding::base64::decode(string) -> bytes
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN encoding::base64::decode("MjMyMw");

-- encoding::base64::decode("MjMyMw")
```

You can also verify that the output of the encoded value matches the original value. 

```surql
RETURN encoding::base64::decode("aGVsbG8") = <bytes>"hello";

-- true
```

<br /><br />

## `encoding::cbor::decode()`

<Since v="v3.0.0-alpha.1" />

The `encoding::cbor::decode()` function decodes bytes in valid CBOR format into a SurrealQL value.

```surql title="API DEFINITION"
encoding::cbor::decode(string) -> any
```

```surql
LET $some_bytes = encoding::base64::decode("omRjYm9yaGVuY29kaW5nYmlza3ByZXR0eSBuZWF0");
encoding::cbor::decode($some_bytes);
```

```surql title="Output"
{
	cbor: 'encoding',
	is: 'pretty neat'
}
```

<br /><br />

## `encoding::cbor::encode()`

<Since v="v3.0.0-alpha.1" />

The `encoding::cbor::encode()` function encodes any SurrealQL value into bytes in CBOR format.

```surql title="API DEFINITION"
encoding::cbor::encode(any) -> bytes
```

```surql
encoding::cbor::encode({
    cbor: "encoding",
    is: "pretty neat"
});
```

```surql title="Output"
encoding::base64::decode("omRjYm9yaGVuY29kaW5nYmlza3ByZXR0eSBuZWF0")
```

---
sidebar_position: 9
sidebar_label: File functions
title: File functions | SurrealQL
description: These functions can be used to work with files.
---

import Since from '@components/shared/Since.astro';

# File functions

These functions can be used to work with files.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#filebucket"><code>file::bucket()</code></a></td>
      <td scope="row" data-label="Description">Returns the bucket path from a file pointer</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#filecopy"><code>file::copy()</code></a></td>
      <td scope="row" data-label="Description">Copies the contents of a file</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#filecopy_if_not_exists"><code>file::copy_if_not_exists()</code></a></td>
      <td scope="row" data-label="Description">Copies the contents of a file to a new file if the name is available</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#filedelete"><code>file::delete()</code></a></td>
      <td scope="row" data-label="Description">Deletes a file</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#fileexists"><code>file::exists()</code></a></td>
      <td scope="row" data-label="Description">Checks if a file already exists</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#fileget"><code>file::get()</code></a></td>
      <td scope="row" data-label="Description">Loads a file</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#filehead"><code>file::head()</code></a></td>
      <td scope="row" data-label="Description">Returns the metadata of a file</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#filekey"><code>file::key()</code></a></td>
      <td scope="row" data-label="Description">Returns the key (the portion following the bucket) from a file pointer</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#filelist"><code>file::list()</code></a></td>
      <td scope="row" data-label="Description">Returns a list of files inside a bucket</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#fileput"><code>file::put()</code></a></td>
      <td scope="row" data-label="Description">Writes bytes to a file</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#fileput_if_not_exists"><code>file::put_if_not_exists()</code></a></td>
      <td scope="row" data-label="Description">Attempts to write bytes to a file</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#filerename"><code>file::rename()</code></a></td>
      <td scope="row" data-label="Description">Renames a file</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#filerename_if_available"><code>file::rename_if_not_exists()</code></a></td>
      <td scope="row" data-label="Description">Renames a file if the new name is not already in use</td>
    </tr>
  </tbody>
</table>

<Since v="v3.0.0-alpha.1" />

## `file::bucket`

```surql title="API DEFINITION"
file::bucket(file) -> string
```

The `file::bucket` function returns the name of the bucket in which a file is located.

```surql
file::bucket(f"my_bucket:/file_name");

DEFINE PARAM $SOME_DATABASE_FILE VALUE f"my_bucket:/file_name";
file::bucket($SOME_DATABASE_FILE);
```

```surql title="Output"
'my_bucket'
```

The counterpart to this function is `file::key`, which returns the latter part of a file pointer.

## `file::copy`

The `file::copy` function copies the contents of a file to a new file, overwriting any existing file that has the same name as the new file.

```surql title="API DEFINITION"
file::copy(string)
```

Example of a file `my_book.txt` being copied to a new location `lion_witch_wardrobe.txt`:

```surql
f"my_bucket:/my_book.txt".copy("lion_witch_wardrobe.txt");
```

<br></br>

## `file::copy_if_not_exists`

The `file::copy_if_not_exists` function copies the contents of a file to a new file, returning an error if a file already exists that has the same name as that of the intended copy.

```surql title="API DEFINITION"
file::copy_if_not_exists(string)
```

Example of a file `my_book.txt` attempting to copy to a new location `lion_witch_wardrobe.txt`:

```surql
DEFINE BUCKET my_bucket BACKEND "memory";

f"my_bucket:/lion_witch_wardrobe.txt".put("Once there were four children whose names were Peter, Susan...");
f"my_bucket:/other_book.txt".put("Um meine Geschichte zu erzählen, muß ich weit vorn anfangen.");
f"my_bucket:/other_book.txt".copy_if_not_exists("lion_witch_wardrobe.txt");
```

```surql title="Output"
'Operation for bucket `my_bucket` failed: Object at location lion_witch_wardrobe.txt already exists:
Object already exists at that location: lion_witch_wardrobe.txt'
```

<br></br>

## `file::delete`

The `file::delete` function deletes a file.

```surql title="API DEFINITION"
file::delete(string)
```

Example of a file `my_book.txt` being deleted:

```surql
f"my_bucket:/my_book.txt".delete();
```

<br></br>

## `file::exists`

The `file::exists` function checks to see if a file exists at the path and file name indicated.

```surql title="API DEFINITION"
file::exists(string) -> bool
```

Example of an `IF` else `STATEMENT` used to check if a file exists before writing content to the location:

```surql
IF f"my_bucket:/my_book.txt".exists() {
    THROW "Whoops, already there!"
} ELSE {
    f"my_bucket:/my_book.txt".put("Some content")
};
```

<br></br>

## `file::get`

The `file::get` function retrieves a file for use.

```surql title="API DEFINITION"
file::get(string) -> bytes
```

A retrieved file will display as bytes. If valid text, these can be cast into a `string`.

```surql
f"my_bucket:/my_book.txt".get();
<string>f"my_bucket:/my_book.txt".get();
```

```surql title="Output"
-------- Query --------

b"536F6D6520636F6E74656E74"

-------- Query --------

'Once there were four children whose names were Peter, Susan...'
```

<br></br>

## `file::head`

The `file::head` function returns the metadata for a file.

```surql title="API DEFINITION"
file::head() -> object
```

If a file is found, the metadata will be returned as an object with the following fields:

* `e_data` (`option<string>`): the unique identifier for the file.
* `last_modified` (`datetime`)
* `location` (`string`)
* `size` (`int`)
* `version` (`option<string>`)

An example of this function and its output:

```surql
f"my_bucket:/my_book.txt".head();
```

```surql title="Output"
{
	e_tag: '1',
	key: 'my_book.txt',
	last_modified: d'2025-03-26T06:29:18.988Z',
	size: 78,
	version: NONE
}
```

<br></br>

## `file::key`

```surql title="API DEFINITION"
file::key(file) -> string
```

The `file::key` function returns the key of a file: the part of a file pointer following the bucket name.

```surql
file::key(f"my_bucket:/file_name");

DEFINE PARAM $SOME_DATABASE_FILE VALUE f"my_bucket:/file_name";
file::key($SOME_DATABASE_FILE);
```

```surql title="Output"
'/file_name'
```

The counterpart to this function is `file::bucket`, which returns the bucket name of a file pointer.

## `file::list`

```surql title="API DEFINITION"
file::list(string, list_options: option<object>) -> array<object>
```

The `file::list` returns the metadata for the files inside a certain bucket. The output is an array of objects, each containing the following fields:

* `file`: the pointer to the file.
* `size` (`int`): the file size in bytes.
* `updated` (`datetime`): the last time a change was made to the file.

```surql
DEFINE BUCKET my_bucket BACKEND "memory";

f"my_bucket:/some_book".put("Once upon a time...");
f"my_bucket:/some_book".rename("awesome_book");
f"my_bucket:/some_book".put("In a hole in the ground lived a Hobbit.");
file::list("my_bucket");
```

```surql title="Output"
[
	{
		file: f"my_bucket:/awesome_book",
		size: 19,
		updated: d'2025-04-08T03:28:20.530511Z'
	},
	{
		file: f"my_bucket:/some_book",
		size: 39,
		updated: d'2025-04-08T03:28:20.530704Z'
	}
]
```

To modify the output, a second argument can be passed in that contains a single object with up to three fields:

* `limit` (`int`): the maximum number of files to display.
* `start` (`string`): displays files ordered after `start`.
* `prefix` (`string`): displays files whose names begin with `prefix`.

Some examples of the function containing the second object and their responses:

```surql
file::list("my_bucket", { limit: 1 });
file::list("my_bucket", { limit: 0 });
```

```surql title="Output"
-------- Query --------
[
	{
		file: f"my_bucket:/awesome_book",
		size: 19,
		updated: d'2025-04-15T05:35:40.913221Z'
	}
]

-------- Query --------
[]
```

```surql
file::list("my_bucket", { prefix: "some" });
file::list("my_bucket", { prefix: "someBOOOEOEOK" });
```

```surql title="Output"
-------- Query --------
[
	{
		file: f"my_bucket:/some_book",
		size: 39,
		updated: d'2025-04-15T05:35:40.913554Z'
	}
]

-------- Query --------
[]
```

```surql
file::list("my_bucket", { start: "a" });
file::list("my_bucket", { start: "m" });
```

```surql title="Output"
-------- Query --------
[
	{
		file: f"my_bucket:/awesome_book",
		size: 19,
		updated: d'2025-04-15T05:55:41.973869Z'
	},
	{
		file: f"my_bucket:/some_book",
		size: 39,
		updated: d'2025-04-15T05:55:41.974370Z'
	}
]

-------- Query --------
[
	{
		file: f"my_bucket:/some_book",
		size: 39,
		updated: d'2025-04-15T05:55:41.974370Z'
	}
]
```

```surql
file::list("my_bucket", { prefix: "some", start: "a", limit: 1 });
```

```surql title="Output"
[
	{
		file: f"my_bucket:/some_book",
		size: 39,
		updated: d'2025-04-15T05:35:40.913554Z'
	}
]
```

## `file::put`

The `file::put` function adds data into a file, overwriting any existing data.

```surql title="API DEFINITION"
file::put()
```

An example of this function followed by `file::get()` to display the contents:

```surql
DEFINE BUCKET my_bucket BACKEND "memory";

f"my_bucket:/my_book.txt".put("Once there were four children whose names were Peter, Susan...");
f"my_bucket:/my_book.txt".put("Or were there? I don't quite remember.");
<string>f"my_bucket:/my_book.txt".get();
```

```surql title="Output"
"Or were there? I don't quite remember."
```

<br></br>

## `file::put_if_not_exists`

The `file::put` function adds data into a file, unless a file of the same name already exists.

```surql title="API DEFINITION"
file::put_if_not_exists()
```

An example of this function followed by `file::get()` to display the contents:

```surql
DEFINE BUCKET my_bucket BACKEND "memory";

-- Creates file and adds data
f"my_bucket:/my_book.txt".put_if_not_exists("Once there were four children whose names were Peter, Susan...");
-- Does nothing
f"my_bucket:/my_book.txt".put_if_not_exists("Or were there? I don't quite remember.");
<string>f"my_bucket:/my_book.txt".get();
```

```surql title="Output"
'Once there were four children whose names were Peter, Susan...'
```

<br></br>

## `file::rename`

The `file::rename` function renames a file, overwriting any existing file that has the same name as the target name.

```surql title="API DEFINITION"
file::rename()
```

An example of a file being renamed over an existing file:

```surql
DEFINE BUCKET my_bucket BACKEND "memory";

f"my_bucket:/my_book.txt".put("Once there were four children whose names were Peter, Susan...");
f"my_bucket:/other_book.txt".put("Or were there? I don't quite remember.");
-- Rename to my_book.txt, overwriting existing file of the same name
f"my_bucket:/other_book.txt".rename("my_book.txt");
<string>f"my_bucket:/my_book.txt".get();
```

```surql title="Output"
"Or were there? I don't quite remember."
```

<br></br>

## `file::rename_if_not_exists`

The `file::rename_if_not_exists` function renames a file, returning an error if a file already exists that has the same name as the target name.

```surql title="API DEFINITION"
file::rename_if_not_exists()
```

```surql title="Output"
-------- Query --------

'Operation for bucket `my_bucket` failed: Object at location my_book.txt already exists:
Object already exists at that location: my_book.txt'

-------- Query --------

'Once there were four children whose names were Peter, Susan...
```
---
sidebar_position: 10
sidebar_label: Geo functions
title: Geo functions | SurrealQL
description: These functions can be used when working with and analysing geospatial data.
---
import Image from "@components/Image.astro";

import LightBearing from "@img/image/light/geo-bearing.png";
import LightCentroid from "@img/image/light/geo-centroid.png";
import LightLondon from "@img/image/light/geo-london.png";
import LightParis from "@img/image/light/geo-paris.png";
import LightWyoming from "@img/image/light/geo-wyoming.png";

import DarkBearing from "@img/image/dark/geo-bearing.png";
import DarkCentroid from "@img/image/dark/geo-centroid.png";
import DarkLondon from "@img/image/dark/geo-london.png";
import DarkParis from "@img/image/dark/geo-paris.png";
import DarkWyoming from "@img/image/dark/geo-wyoming.png";

# Geo functions

These functions can be used when working with and analysing geospatial data.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#geoarea"><code>geo::area()</code></a></td>
      <td scope="row" data-label="Description">Calculates the area of a geometry</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#geobearing"><code>geo::bearing()</code></a></td>
      <td scope="row" data-label="Description">Calculates the bearing between two geolocation points</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#geocentroid"><code>geo::centroid()</code></a></td>
      <td scope="row" data-label="Description">Calculates the centroid of a geometry</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#geodistance"><code>geo::distance()</code></a></td>
      <td scope="row" data-label="Description">Calculates the distance between two geolocation points</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#geohashdecode"><code>geo::&#8203;hash::decode()</code></a></td>
      <td scope="row" data-label="Description">Decodes a geohash into a geometry point</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#geohashencode"><code>geo::&#8203;hash::encode()</code></a></td>
      <td scope="row" data-label="Description">Encodes a geometry point into a geohash</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#geoisvalid"><code>geo::is::valid()</code></a></td>
      <td scope="row" data-label="Description">Determines if a geometry type is a geography type</td>
    </tr>
  </tbody>
</table>

## Point and geometry

* A `point` is composed of two floats that represent the longitude (east/west) and latitude (north/south) of a location.
* A `geometry` is a type of object defined in the [GeoJSON](https://en.wikipedia.org/wiki/GeoJSON) spec, of which Polygon is the most common. They can be passed in to the geo functions as objects that contain a "type" (such as "Polygon") and "coordinates" (an array of points).

## `geo::area`

The `geo::area` function calculates the area of a geometry in square metres.

```surql title="API DEFINITION"
geo::area(geometry) -> number
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement for four approximate points found on a map for the US state of Wyoming which has an area of 253,340 km<sup>2</sup> and a mostly rectangular shape. Note: the doubled square brackets are because the function takes an array of an array to allow for more complex types such as MultiPolygon.


<Image
  alt="A map of Wyoming in the United States with four approximate points on each corner used to approximate its total surface area in SurrealDB's geo area function."
  src={{
    light: LightWyoming,
    dark: DarkWyoming,
  }}
/>

```surql
RETURN geo::area({
  type: "Polygon",
  coordinates: [[
    [-111.0690, 45.0032],
    [-104.0838, 44.9893],
    [-104.0910, 40.9974],
    [-111.0672, 40.9862]
  ]]
});
```

```surql title="Response"
253317731850.3478f
```
If the argument is not a geometry type, then an [`EMPTY`](/docs/surrealql/datamodel/none-and-null) value will be returned:

```surql
RETURN geo::area(12345);

null
```

<br />

## `geo::bearing`

The `geo::bearing` function calculates the bearing between two geolocation points. Bearing begins at 0 degrees to indicate north, increasing clockwise into positive values and decreasing counterclockwise into negative values that converge at 180 degrees.

<Image
  alt="A circle showing how bearing is defined from 0 degrees to 360 degrees."
  src={{
    light: LightBearing,
    dark: DarkBearing,
  }}
/>

```surql title="API DEFINITION"
geo::bearing(point, point) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
-- LET used here for readability
LET $paris = (2.358058597411099, 48.861109346459536);
LET $le_puy_en_velay = (3.883428431947686, 45.04383588468415);
RETURN geo::bearing($paris, $le_puy_en_velay);
```

```surql title="Response"
164.18154786094604
```

<Image
  alt="A map showing the path from Paris, the capital of France, to a French town called Le Puy En Velay. The bearing is south southeast."
  src={{
    light: LightParis,
    dark: DarkParis,
  }}
/>

If either argument is not a geolocation point, then an [`EMPTY`](/docs/surrealql/datamodel/none-and-null) value will be returned:

```surql
RETURN geo::bearing(12345, true);

null
```

<br />

## `geo::centroid`

The `geo::centroid` function calculates the centroid between multiple geolocation points.

```surql title="API DEFINITION"
geo::centroid(geometry) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement. Note: the doubled square brackets are because the function takes an array of an array to allow for more complex types such as MultiPolygon.

```surql
RETURN geo::centroid({
  type: "Polygon",
  coordinates: [[
    [-0.03921743611083, 51.88106875736589], -- London
    [30.48112752349519, 50.68377089794912], -- Kyiv
    [23.66174524001544, 42.94500782833793], -- Sofia
    [ 1.92481534361859, 41.69698118125476] -- Barcelona
  ]]
});
```

The return value is a mountainous region somewhere in Austria:

```surql title="Response"
(13.483896437936192, 47.07117241195589)
```

<Image
  alt="A map showing the centroid between four points in Europe: London, Kyiv, Sofia, and Barcelona. The centroid itself is located in Austria."
  src={{
    light: LightCentroid,
    dark: DarkCentroid,
  }}
/>

If either argument is not a geometry type, then an [`EMPTY`](/docs/surrealql/datamodel/none-and-null) value will be returned:

```surql
RETURN geo::centroid(12345);

null
```

<br />

## `geo::distance`

The `geo::distance` function calculates the haversine distance, in metres, between two geolocation points.

```surql title="API DEFINITION"
geo::distance(point, point) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
let $london = (-0.04592553673505285, 51.555282574465764);
let $harare = (30.463880214538577, -17.865161568822085);
RETURN geo::distance($london, $harare);
```

```surql title="Response"
8268604.251890702f
```

<Image
  alt="A map showing the distance in a straight line from London, the capital of the United Kingdom, to Harare, the capital of Zimbabwe"
  src={{
    light: LightLondon,
    dark: DarkLondon,
  }}
/>

If either argument is not a geolocation point, then an [`EMPTY`](/docs/surrealql/datamodel/none-and-null) value will be returned:

```surql
RETURN geo::distance(12345, true);

null
```

<br />

## `geo::hash::decode`

The `geo::hash::decode` function converts a geohash into a geolocation point.

```surql title="API DEFINITION"
geo::hash::decode(point) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN geo::hash::decode("mpuxk4s24f51");
```

```surql title="Response"
(51.50986494496465, -0.11809204705059528)
```
If the argument is not a geolocation point, then an [`EMPTY`](/docs/surrealql/datamodel/none-and-null) value will be returned:

```surql
RETURN geo::hash::decode(12345);

null
```

<br />

## `geo::hash::encode`

The `geo::hash::encode` function converts a geolocation point into a geohash.

```surql title="API DEFINITION"
geo::hash::encode(point) -> string
```
The function accepts a second argument, which determines the accuracy and granularity of the geohash.

```surql title="API DEFINITION"
geo::hash::encode(point, number) -> string
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN geo::hash::encode( (51.509865, -0.118092) );

"mpuxk4s24f51"
```
The following example shows this function with two arguments, and its output, when used in a select statement:

```surql
RETURN geo::hash::encode( (51.509865, -0.118092), 5 );

"mpuxk"
```
If the first argument is not a geolocation point, then an [`EMPTY`](/docs/surrealql/datamodel/none-and-null) value will be returned:

```surql
RETURN geo::hash::encode(12345);

null
```

<br />

## `geo::is::valid`

The `geo::is::valid` function determines if a geometry type is a geography type.
Geography types are used to store geolocation data in a [Geographic Coordinate System (GCS)](https://en.wikipedia.org/wiki/Geographic_coordinate_system), 
whereas geometry types can store geolocation data in any coordinate system, including GCS, mathematical planes, board game layouts, etc...

A geography type add the following constraint: 
each `Point` coordinates are in the range of -180° to 180° for longitude and -90° to 90° for latitude.

```surql title="API DEFINITION"
geo::is::valid(geometry) -> bool
```
The following examples show this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql title="A valid geography point"
RETURN geo::is::valid( (51.509865, -0.118092) );

true
```

```surql title="Out of range geometry point"
RETURN geo::is::valid( (-181.0, -0.118092) );

false
```

<br /><br />

---
sidebar_position: 11
sidebar_label: HTTP functions
title: HTTP functions | SurrealQL
description: These functions can be used when opening and submitting remote web requests, and webhooks.
---
import Since from '@components/shared/Since.astro';

# HTTP functions

These functions can be used when opening and submitting remote web requests, and webhooks.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#httphead"><code>http::head()</code></a></td>
      <td scope="row" data-label="Description">Perform a remote HTTP HEAD request</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#httpget"><code>http::get()</code></a></td>
      <td scope="row" data-label="Description">Perform a remote HTTP GET request</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#httpput"><code>http::put()</code></a></td>
      <td scope="row" data-label="Description">Perform a remote HTTP PUT request</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#httppost"><code>http::post()</code></a></td>
      <td scope="row" data-label="Description">Perform a remote HTTP POST request</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#httppatch"><code>http::patch()</code></a></td>
      <td scope="row" data-label="Description">Perform a remote HTTP PATCH request</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#httpdelete"><code>http::delete()</code></a></td>
      <td scope="row" data-label="Description">Perform a remote HTTP DELETE request</td>
    </tr>
  </tbody>
</table>


## Before you begin

<Since v="v2.2.0" />

From version `2.2` of SurrealDB, the HTTP functions have been improved to provide a more consistent and user-friendly experience. These improvements include:

- **Enhanced HTTP error messages**: The server provides more descriptive error responses, including relevant HTTP status codes and detailed error information when available.

- **Raw SurrealQL data encoding**: Data types are preserved more faithfully in responses through improved encoding.
  - SurrealQL **byte values** are now sent as raw bytes (not base64-encoded or JSON-encoded).  
  - SurrealQL **string values** are sent as raw strings.  
  - All other SurrealQL values (numbers, arrays, objects, booleans, etc.) are automatically JSON-encoded.

- **Manual Header Configuration**: SurrealDB no longer automatically adds `Content-Type: application/octet-stream` to responses when the body contains SurrealQL byte values. If you need this header, you can set it manually.

## `http::head`

The `http::head` function performs a remote HTTP `HEAD` request. The first parameter is the URL of the remote endpoint. If the response does not return a `2XX` status code, then the function will fail and return the error.

```surql title="API DEFINITION"
http::head(string) -> null
```
If an object is given as the second argument, then this can be used to set the request headers.

```surql title="API DEFINITION"
http::head(string, object) -> null
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN http::head('https://surrealdb.com');

null
```

To specify custom headers with the HTTP request, pass an object as the second argument:

```surql
RETURN http::head('https://surrealdb.com', {
	'x-my-header': 'some unique string'
});

null
```

<br />

## `http::get`

The `http::get` function performs a remote HTTP `GET` request. The first parameter is the URL of the remote endpoint. If the response does not return a 2XX status code, then the function will fail and return the error. 

If the remote endpoint returns an `application/json content-type`, then the response is parsed and returned as a value, otherwise the response is treated as text.

```surql title="API DEFINITION"
http::get(string) -> value
```
If an object is given as the second argument, then this can be used to set the request headers.

```surql title="API DEFINITION"
http::get(string, object) -> value
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN http::get('https://surrealdb.com');

-- The HTML code is returned
```

To specify custom headers with the HTTP request, pass an object as the second argument:

```surql
RETURN http::get('https://surrealdb.com', {
	'x-my-header': 'some unique string'
});

-- The HTML code is returned
```

<br />

## `http::put`

The `http::put` function performs a remote HTTP `PUT` request. The first parameter is the URL of the remote endpoint, and the second parameter is the value to use as the request body, which will be converted to JSON. If the response does not return a `2XX` status code, then the function will fail and return the error. If the remote endpoint returns an `application/json` content-type, then the response is parsed and returned as a value, otherwise the response is treated as text.

```surql title="API DEFINITION"
http::put(string, object) -> value
```
If an object is given as the third argument, then this can be used to set the request headers.

```surql title="API DEFINITION"
http::put(string, object, object) -> value
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql title="Request without headers"
RETURN http::put('https://dummyjson.com/comments', {
  "id": 1,
  "body": "This is some awesome thinking!",
  "postId": 100,
  "user": {
    "id": 63,
    "username": "eburras1q"
  }
});
```

```surql title="Request with headers"
RETURN http::put('https://dummyjson.com/comments', {
  "id": 1,
  "body": "This is some awesome thinking!",
  "postId": 100,
  "user": {
    "id": 63,
    "username": "eburras1q"
  }
}, {
  'Authorization': 'Bearer your-token-here',
  'Content-Type': 'application/json',
  'x-custom-header': 'custom-value'
});
```

```surql title="Response"
{
  "id": 1,
  "body": "This is some awesome thinking!",
  "postId": 100,
  "user": {
    "id": 63,
    "username": "eburras1q"
  }
}
```

<br />

## `http::post`

The `http::post` function performs a remote HTTP `POST` request. The first parameter is the URL of the remote endpoint, and the second parameter is the value to use as the request body, which will be converted to JSON. If the response does not return a `2XX` status code, then the function will fail and return the error. If the remote endpoint returns an `application/json` content-type, then the response is parsed and returned as a value, otherwise the response is treated as text.

```surql title="API DEFINITION"
http::post(string, object) -> value
```
If an object is given as the third argument, then this can be used to set the request headers.

```surql title="API DEFINITION"
http::post(string, object, object) -> value
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql title="Request without headers"
RETURN http::post('https://dummyjson.com/comments/1', {
  "id": 1,
  "body": "This is some awesome thinking!",
  "postId": 100,
  "user": {
    "id": 63,
    "username": "eburras1q"
  }
});
```

```surql title="Request with headers"
RETURN http::post('https://dummyjson.com/comments/1', {
  "id": 1,
  "body": "This is some awesome thinking!",
  "postId": 100,
  "user": {
    "id": 63,
    "username": "eburras1q"
  }
}, {
  'Authorization': 'Bearer your-token-here',
  'Content-Type': 'application/json',
  'x-custom-header': 'custom-value'
});
```

```surql title="Response"
{
  "id": 1,
  "body": "This is some awesome thinking!",
  "postId": 100,
  "user": {
    "id": 63,
    "username": "eburras1q"
  }
}
```

<br />

## `http::patch`

The `http::patch` function performs a remote HTTP `PATCH` request. The first parameter is the URL of the remote endpoint, and the second parameter is the value to use as the request body, which will be converted to JSON. If the response does not return a `2XX` status code, then the function will fail and return the error. If the remote endpoint returns an `application/json` content-type, then the response is parsed and returned as a value, otherwise the response is treated as text.

```surql title="API DEFINITION"
http::patch(string, object) -> value
```
If an object is given as the third argument, then this can be used to set the request headers.

```surql title="API DEFINITION"
http::patch(string, object, object) -> value
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql title="Request without headers"
RETURN http::patch('https://dummyjson.com/comments/1', {
  "id": 1,
  "body": "This is some awesome thinking!",
  "postId": 100,
  "user": {
    "id": 63,
    "username": "eburras1q"
  }
});
```

```surql title="Setting the request headers"
RETURN http::patch('https://dummyjson.com/comments/1', {
  "id": 1,
  "body": "This is some awesome thinking!",
  "postId": 100,
  "user": {
    "id": 63,
    "username": "eburras1q"
  }
}, {
  'Authorization': 'Bearer your-token-here',
  'Content-Type': 'application/json',
  'x-custom-header': 'custom-value'
});
```

```surql title="RESPONSE"
{
  "id": 1,
  "body": "This is some awesome thinking!",
  "postId": 100,
  "user": {
    "id": 63,
    "username": "eburras1q"
  }
}
```

<br />

## `http::delete`

The `http::delete` function performs a remote HTTP `DELETE` request. The first parameter is the URL of the remote endpoint, and the second parameter is the value to use as the request body, which will be converted to JSON. If the response does not return a `2XX` status code, then the function will fail and return the error. If the remote endpoint returns an `application/json` content-type, then the response is parsed and returned as a value, otherwise the response is treated as text.

```surql title="API DEFINITION"
http::delete(string) -> value
```
If an object is given as the second argument, then this can be used to set the request headers.

```surql title="API DEFINITION"
http::delete(string, object) -> value
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN http::delete('https://dummyjson.com/comments/1');

null
```
To specify custom headers with the HTTP request, pass an object as the second argument:

```surql
RETURN http::delete('https://dummyjson.com/comments/1', {
	'x-my-header': 'some unique string'
});

null
```

<br /><br />

---
sidebar_position: 12
sidebar_label: Math functions
title: Math functions | SurrealQL
description: These functions can be used when analysing numeric data and numeric collections.
---
import Since from '@components/shared/Since.astro'

# Math functions

These functions can be used when analysing numeric data and numeric collections.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathabs"><code>math::abs()</code></a></td>
      <td scope="row" data-label="Description">Returns the absolute value of a number</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathacos"><code>math::acos()</code></a></td>
      <td scope="row" data-label="Description">Computes the arccosine (inverse cosine) of a value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathacot"><code>math::acot()</code></a></td>
      <td scope="row" data-label="Description">Computes the arccotangent (inverse cotangent) of an angle given in radians</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathasin"><code>math::asin()</code></a></td>
      <td scope="row" data-label="Description">Computes the arcsine (inverse sine) of a value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathatan"><code>math::atan()</code></a></td>
      <td scope="row" data-label="Description">Computes the arctangent (inverse tangent) of a value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathbottom"><code>math::bottom()</code></a></td>
      <td scope="row" data-label="Description">Returns the bottom X set of numbers in a set of numbers</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathceil"><code>math::ceil()</code></a></td>
      <td scope="row" data-label="Description">Rounds a number up to the next largest integer</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathclamp"><code>math::clamp()</code></a></td>
      <td scope="row" data-label="Description">Clamps a value between a specified minimum and maximum</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathcos"><code>math::cos()</code></a></td>
      <td scope="row" data-label="Description">Computes the cosine of an angle given in radians</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathcot"><code>math::cot()</code></a></td>
      <td scope="row" data-label="Description">Computes the cotangent of an angle given in radians</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathdeg2rad"><code>math::deg2rad()</code></a></td>
      <td scope="row" data-label="Description">Converts an angle from degrees to radians</td>
    </tr>
    <tr>
      <td scope="row" data-label="Constant"><a href="#mathe"><code>math::e</code></a></td>
      <td scope="row" data-label="Description">Constant representing the base of the natural logarithm (Euler's number)</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathfixed"><code>math::fixed()</code></a></td>
      <td scope="row" data-label="Description">Returns a number with the specified number of decimal places</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathfloor"><code>math::floor()</code></a></td>
      <td scope="row" data-label="Description">Rounds a number down to the nearest integer</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathfrac_1_pi"><code>math::frac_1_pi</code></a></td>
      <td scope="row" data-label="Description">Constant representing the fraction 1/π</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathfrac_1_sqrt_2"><code>math::frac_1_sqrt_2</code></a></td>
      <td scope="row" data-label="Description">Constant representing the fraction 1/sqrt(2)</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathfrac_2_pi"><code>math::frac_2_pi</code></a></td>
      <td scope="row" data-label="Description">Constant representing the fraction 2/π</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathfrac_2_sqrt_pi"><code>math::frac_2_sqrt_pi</code></a></td>
      <td scope="row" data-label="Description">Constant representing the fraction 2/sqrt(π)</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathfrac_pi_2"><code>math::frac_pi_2</code></a></td>
      <td scope="row" data-label="Description">Constant representing the fraction π/2</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathfrac_pi_3"><code>math::frac_pi_3</code></a></td>
      <td scope="row" data-label="Description">Constant representing the fraction π/3</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathfrac_pi_4"><code>math::frac_pi_4</code></a></td>
      <td scope="row" data-label="Description">Constant representing the fraction π/4</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathfrac_pi_6"><code>math::frac_pi_6</code></a></td>
      <td scope="row" data-label="Description">Constant representing the fraction π/6</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathfrac_pi_8"><code>math::frac_pi_8</code></a></td>
      <td scope="row" data-label="Description">Constant representing the fraction π/8</td>
    </tr>
    <tr>
      <td scope="row" data-label="Constant"><a href="#mathinf"><code>math::inf</code></a></td>
      <td scope="row" data-label="Description">Constant representing positive infinity</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathinterquartile"><code>math::interquartile()</code></a></td>
      <td scope="row" data-label="Description">Returns the interquartile of an array of numbers</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathlerp"><code>math::lerp()</code></a></td>
      <td scope="row" data-label="Description">Linearly interpolates between two values based on a factor</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathlerpangle"><code>math::lerpangle()</code></a></td>
      <td scope="row" data-label="Description">Linearly interpolates between two angles in degrees</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathln"><code>math::ln()</code></a></td>
      <td scope="row" data-label="Description">Computes the natural logarithm (base e) of a value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathln_10"><code>math::ln_10</code></a></td>
      <td scope="row" data-label="Description">Constant representing the natural logarithm (base e) of 10</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathln_2"><code>math::ln_2</code></a></td>
      <td scope="row" data-label="Description">Constant representing the natural logarithm (base e) of 2</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathlog"><code>math::log()</code></a></td>
      <td scope="row" data-label="Description">Computes the logarithm of a value with the specified base</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathlog10"><code>math::log10()</code></a></td>
      <td scope="row" data-label="Description">Computes the base-10 logarithm of a value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathlog10_2"><code>math::log10_2</code></a></td>
      <td scope="row" data-label="Description">Constant representing the base-10 logarithm of 2</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathlog10_e"><code>math::log10_e</code></a></td>
      <td scope="row" data-label="Description">Constant representing the base-10 logarithm of e, the base of the natural logarithm (Euler’s number)</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathlog2"><code>math::log2()</code></a></td>
      <td scope="row" data-label="Description">Computes the base-2 logarithm of a value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathlog2_10"><code>math::log2_10</code></a></td>
      <td scope="row" data-label="Description">Constant representing the base-2 logarithm of 10</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathlog2_e"><code>math::log2_e</code></a></td>
      <td scope="row" data-label="Description">Constant representing the base-2 logarithm of e, the base of the natural logarithm (Euler’s number)</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathmax"><code>math::max()</code></a></td>
      <td scope="row" data-label="Description">Returns the greatest number from an array of numbers</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathmean"><code>math::mean()</code></a></td>
      <td scope="row" data-label="Description">Returns the mean of a set of numbers</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathmedian"><code>math::median()</code></a></td>
      <td scope="row" data-label="Description">Returns the median of a set of numbers</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathmidhinge"><code>math::midhinge()</code></a></td>
      <td scope="row" data-label="Description">Returns the midhinge of a set of numbers</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathmin"><code>math::min()</code></a></td>
      <td scope="row" data-label="Description">Returns the least number from an array of numbers</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathmode"><code>math::mode()</code></a></td>
      <td scope="row" data-label="Description">Returns the value that occurs most often in a set of numbers</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathnearestrank"><code>math::nearestrank()</code></a></td>
      <td scope="row" data-label="Description">Returns the nearest rank of an array of numbers</td>
    </tr>
    <tr>
      <td scope="row" data-label="Constant"><a href="#mathneg_inf"><code>math::neg_inf</code></a></td>
      <td scope="row" data-label="Description">Constant representing negative infinity</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathpercentile"><code>math::percentile()</code></a></td>
      <td scope="row" data-label="Description">Returns the value below which a percentage of data falls</td>
    </tr>
    <tr>
      <td scope="row" data-label="Constant"><a href="#mathpi"><code>math::pi</code></a></td>
      <td scope="row" data-label="Description">Constant representing the mathematical constant π.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Constant"><a href="#mathpow"><code>math::pow()</code></a></td>
      <td scope="row" data-label="Description">Returns a number raised to a power</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathproduct"><code>math::product()</code></a></td>
      <td scope="row" data-label="Description">Returns the product of a set of numbers</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathrad2deg"><code>math::rad2deg()</code></a></td>
      <td scope="row" data-label="Description">Converts an angle from radians to degrees</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathround"><code>math::round()</code></a></td>
      <td scope="row" data-label="Description">Rounds a number up or down to the nearest integer</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathsign"><code>math::sign()</code></a></td>
      <td scope="row" data-label="Description">Returns the sign of a value (-1, 0, or 1)</td>
    </tr>
     <tr>
      <td scope="row" data-label="Function"><a href="#mathsin"><code>math::sin()</code></a></td>
      <td scope="row" data-label="Description">Computes the sine of an angle given in radians</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathspread"><code>math::spread()</code></a></td>
      <td scope="row" data-label="Description">Returns the spread of an array of numbers</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathsqrt"><code>math::sqrt()</code></a></td>
      <td scope="row" data-label="Description">Returns the square root of a number</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathsqrt_2"><code>math::sqrt_2</code></a></td>
      <td scope="row" data-label="Description">Constant representing the square root of 2</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathstddev"><code>math::stddev()</code></a></td>
      <td scope="row" data-label="Description">Calculates how far a set of numbers are away from the mean</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathsum"><code>math::sum()</code></a></td>
      <td scope="row" data-label="Description">Returns the total sum of a set of numbers</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathtan"><code>math::tan()</code></a></td>
      <td scope="row" data-label="Description">Computes the tangent of an angle given in radians.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Constant"><a href="#mathtau"><code>math::tau()</code></a></td>
      <td scope="row" data-label="Description">Represents the mathematical constant τ, which is equal to 2π</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathtop"><code>math::top()</code></a></td>
      <td scope="row" data-label="Description">Returns the top X set of numbers in a set of numbers</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathtrimean"><code>math::trimean()</code></a></td>
      <td scope="row" data-label="Description">The weighted average of the median and the two quartiles</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#mathvariance"><code>math::variance()</code></a></td>
      <td scope="row" data-label="Description">Calculates how far a set of numbers are spread out from the mean</td>
    </tr>
  </tbody>
</table>

## `math::abs`

The `math::abs` function returns the absolute value of a number.

```surql title="API DEFINITION"
math::abs(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::abs(-13.746189);

13.746189
```

<br />

## `math::acos`

<Since v="v2.0.0" />

The `math::acos` function returns the arccosine (inverse cosine) of a number, which must be in the range -1 to 1. The result is expressed in radians.

```surql title="API DEFINITION"
math::acos(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::acos(0.5);

1.0471975511965979
```

<br />

## `math::acot`

<Since v="v2.0.0" />

The `math::acot` function returns the arccotangent (inverse cotangent) of a number. The result is expressed in radians.

```surql title="API DEFINITION"
math::acot(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::acot(1);

0.7853981633974483
```

## `math::asin`

<Since v="v2.0.0" />

The `math::asin` function returns the arcsine (inverse sine) of a number, which must be in the range -1 to 1. The result is expressed in radians.

```surql title="API DEFINITION"
math::asin(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::asin(0.5);

0.5235987755982989
```

<br />

## `math::atan`

<Since v="v2.0.0" />

The `math::atan` function returns the arctangent (inverse tangent) of a number. The result is expressed in radians.

```surql title="API DEFINITION"
math::atan(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::atan(1);

0.7853981633974483
```

<br />

## `math::bottom`

The `math::bottom` function returns the bottom X set of numbers in a set of numbers.

```surql title="API DEFINITION"
math::bottom(array<number>, number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::bottom([1, 2, 3], 2);

[ 2, 1 ]
```

<br />

## `math::ceil`

The `math::ceil` function rounds a number up to the next largest integer.

```surql title="API DEFINITION"
math::ceil(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::ceil(13.146572);

14
```

<br />

## `math::clamp`

<Since v="v2.0.0" />

The `math::clamp` function constrains a number within the specified range, defined by a minimum and a maximum value. If the number is less than the minimum, it returns the minimum. If it is greater than the maximum, it returns the maximum.

```surql title="API DEFINITION"
math::clamp(number, min, max) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::clamp(1, 5, 10);

5
```

<br />

## `math::cos`

<Since v="v2.0.0" />

The `math::cos` function returns the cosine of a number, which is assumed to be in radians. The result is a value between -1 and 1.

```surql title="API DEFINITION"
math::cos(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::cos(1);

0.5403023058681398
```

<br />

## `math::cot`

<Since v="v2.0.0" />

The `math::cot` function returns the cotangent of a number, which is assumed to be in radians. The cotangent is the reciprocal of the tangent function.

```surql title="API DEFINITION"
math::cot(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::cot(1);

0.6420926159343306
```

<br />

## `math::deg2rad`

<Since v="v2.0.0" />

The `math::deg2rad` function converts an angle from degrees to radians.

```surql title="API DEFINITION"
math::deg2rad(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::deg2rad(180);

3.141592653589793
```

<br />

## `math::e`

The `math::e` constant represents the base of the natural logarithm (Euler’s number).

```surql title="API DEFINITION"
math::e -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::e;

2.718281828459045f
```

<br />

## `math::fixed`

The `math::fixed` function returns a number with the specified number of decimal places.

```surql title="API DEFINITION"
math::fixed(number, number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::fixed(13.146572, 2);

13.15
```

<br />

## `math::floor`

The `math::floor` function rounds a number down to the nearest integer.

```surql title="API DEFINITION"
math::floor(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::floor(13.746189);

13
```

<br />

## `math::frac_1_pi`

The `math::frac_1_pi` constant represents the fraction 1/π.

```surql title="API DEFINITION"
math::frac_1_pi -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::frac_1_pi;

0.3183098861837907f
```

<br />

## `math::frac_1_sqrt_2`

The `math::frac_1_sqrt_2` constant represents the fraction 1/sqrt(2).

```surql title="API DEFINITION"
math::frac_1_sqrt_2 -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::frac_1_sqrt_2;

0.7071067811865476f
```

<br />

## `math::frac_2_pi`

The `math::frac_2_pi` constant represents the fraction 2/π.

```surql title="API DEFINITION"
math::frac_2_pi -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::frac_2_pi;

0.6366197723675814f
```

<br />

## `math::frac_2_sqrt_pi`

The `math::frac_2_sqrt_pi` constant represents the fraction 2/sqrt(π).

```surql title="API DEFINITION"
math::frac_2_sqrt_pi -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::frac_2_sqrt_pi;

1.1283791670955126f
```

<br />

## `math::frac_pi_2`

The `math::frac_pi_2` constant represents the fraction π/2.

```surql title="API DEFINITION"
math::frac_pi_2 -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::frac_pi_2;

1.5707963267948966f
```

<br />

## `math::frac_pi_3`

The `math::frac_pi_3` constant represents the fraction π/3.

```surql title="API DEFINITION"
math::frac_pi_3 -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::frac_pi_3;

1.0471975511965979f
```

<br />

## `math::frac_pi_4`

The `math::frac_pi_4` constant represents the fraction π/4.

```surql title="API DEFINITION"
math::frac_pi_4 -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::frac_pi_4;

0.7853981633974483f
```

<br />

## `math::frac_pi_6`

The `math::frac_pi_6` constant represents the fraction π/6.

```surql title="API DEFINITION"
math::frac_pi_6 -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::frac_pi_6;

0.5235987755982989f
```

<br />

## `math::frac_pi_8`

The `math::frac_pi_8` constant represents the fraction π/8.

```surql title="API DEFINITION"
math::frac_pi_8 -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::frac_pi_8;

0.39269908169872414f
```

<br />


## `math::inf`

The `math::inf` constant represents positive infinity.

```surql title="API DEFINITION"
math::inf -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::inf;

inf
```

<br />

## `math::interquartile`

The `math::interquartile` function returns the interquartile of an array of numbers.

```surql title="API DEFINITION"
math::interquartile(array<number>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::interquartile([ 1, 40, 60, 10, 2, 901 ]);

51
```

<br />

## `math::lerp`

<Since v="v2.0.0" />

The `math::lerp` function performs a linear interpolation between two numbers (a and b) based on a given fraction (t). The fraction t should be between 0 and 1, where 0 returns a and 1 returns b.

```surql title="API DEFINITION"
math::lerp(a, b, t) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::lerp(0, 10, 0.5);

5
```

<br />

## `math::lerpangle`

<Since v="v2.0.0" />

The `math::lerpangle` function interpolates between two angles (a and b) by the given fraction (t). This is useful for smoothly transitioning between angles.

```surql title="API DEFINITION"
math::lerpangle(a, b, t) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::lerpangle(0, 180, 0.5);

90
```

<br />

## `math::ln`

<Since v="v2.0.0" />

The `math::ln` function returns the natural logarithm (base e) of a number.

```surql title="API DEFINITION"
math::ln(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::ln(10);

2.302585092994046
```

<br />

## `math::ln_10`

The `math::ln_10` constant represents the natural logarithm (base e) of 10.

```surql title="API DEFINITION"
math::ln_10 -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::ln_10;

2.302585092994046f
```

<br />

## `math::ln_2`

The `math::ln_2` constant represents the natural logarithm (base e) of 2.

```surql title="API DEFINITION"
math::ln_2 -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::ln_2;

0.6931471805599453f
```

<br />

## `math::log`

<Since v="v2.0.0" />

The `math::log` function returns the logarithm of a number with a specified base.

```surql title="API DEFINITION"
math::log(number, base) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::log(100, 10);

2
```

<br />

## `math::log10`
<Since v="v2.0.0" />

The `math::log10` function returns the base-10 logarithm of a number.

```surql title="API DEFINITION"
math::log10(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::log10(1000);

3
```

<br />

## `math::log10_2`

The `math::log10_2` constant represents the base-10 logarithm of 2.

```surql title="API DEFINITION"
math::log10_2 -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::log10_2;

0.3010299956639812f
```

<br />

## `math::log10_e`

The `math::log10_e` constant represents the base-10 logarithm of e, the base of the natural logarithm (Euler’s number).

```surql title="API DEFINITION"
math::log10_e -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::log10_e;

0.4342944819032518f
```

<br />

## `math::log2`
<Since v="v2.0.0" />

The `math::log2` function returns the base-2 logarithm of a number.

```surql title="API DEFINITION"
math::log2(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::log2(8);

3
```

<br />

## `math::log2_10`

The `math::log2_10` constant represents the base-2 logarithm of 10.

```surql title="API DEFINITION"
math::log2_10 -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::log2_10;

3.321928094887362f
```

<br />

## `math::log2_e`

The `math::log2_e` constant represents the base-2 logarithm of e, the base of the natural logarithm (Euler’s number).

```surql title="API DEFINITION"
math::log2_e -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::log2_e;

1.4426950408889634f
```

<br />

## `math::max`

The `math::max` function returns the greatest number from an array of numbers.

```surql title="API DEFINITION"
math::max(array<number>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::max([ 26.164, 13.746189, 23, 16.4, 41.42 ]);

41.42
```

See also:

* [`array::max`](/docs/surrealql/functions/database/array#arraymax), which extracts the greatest value from an array of values
* [`time::max`](/docs/surrealql/functions/database/time#timemax), which extracts the greatest datetime from an array of datetimes

## `math::mean`

The `math::mean` function returns the mean of a set of numbers.

```surql title="API DEFINITION"
math::mean(array<number>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::mean([ 26.164, 13.746189, 23, 16.4, 41.42 ]);

24.1460378
```

<br />

## `math::median`

The `math::median` function returns the median of a set of numbers.

```surql title="API DEFINITION"
math::median(array<number>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::median([ 26.164, 13.746189, 23, 16.4, 41.42 ]);

23
```

<br />

## `math::midhinge`

The `math::midhinge` function returns the midhinge of an array of numbers.

```surql title="API DEFINITION"
math::midhinge(array<number>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::midhinge([ 1, 40, 60, 10, 2, 901 ]);

29.5
```

<br />

## `math::min`

The `math::min` function returns the least number from an array of numbers.

```surql title="API DEFINITION"
math::min(array<number>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::min([ 26.164, 13.746189, 23, 16.4, 41.42 ]);

13.746189
```

See also:

* [`array::min`](/docs/surrealql/functions/database/array#arraymin), which extracts the least value from an array of values
* [`time::min`](/docs/surrealql/functions/database/time#timemin), which extracts the least datetime from an array of datetimes

## `math::mode`

The `math::mode` function returns the value that occurs most often in a set of numbers. In case of a tie, the highest one is returned.

```surql title="API DEFINITION"
math::mode(array<number>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::mode([ 1, 40, 60, 10, 2, 901 ]);

901
```

<br />

## `math::nearestrank`

The `math::nearestrank` function returns the nearestrank of an array of numbers.

```surql title="API DEFINITION"
math::nearestrank(array<number>, number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::nearestrank([1, 40, 60, 10, 2, 901], 50);

40
```

<br />

## `math::neg_inf`

The `math::neg_inf` constant represents negative infinity.

```surql title="API DEFINITION"
math::neg_inf -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::neg_inf;

-inf
```

<br />

## `math::percentile`

The `math::percentile` function returns the value below which a percentage of data falls.

```surql title="API DEFINITION"
math::percentile(array<number>, number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::percentile([1, 40, 60, 10, 2, 901], 50);

25
```

<br />

## `math::pi`

The `math::pi` constant represents the mathematical constant π.

```surql title="API DEFINITION"
math::pi -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::pi;

3.141592653589793f
```

<br />

## `math::pow`

The `math::pow` function returns a number raised to the power of a second number.

```surql title="API DEFINITION"
math::pow(number, number) -> number
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::pow(1.07, 10);

1.9671513572895665f
```

<br />

## `math::product`

The `math::product` function returns the product of a set of numbers.

```surql title="API DEFINITION"
math::product(array<number>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::product([ 26.164, 13.746189, 23, 16.4, 41.42 ]);

5619119.004884841504
```

<br />

## `math::rad2deg`

<Since v="v2.0.0" />

The `math::rad2deg` function converts an angle from radians to degrees.

```surql title="API DEFINITION"
math::rad2deg(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::rad2deg(3.141592653589793);

180
```

<br />

## `math::round`

The `math::round` function rounds a number up or down to the nearest integer.

```surql title="API DEFINITION"
math::round(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::round(13.53124);

14
```

<br />

## `math::sign`

<Since v="v2.0.0" />

The `math::sign` function returns the sign of a number, indicating whether the number is positive, negative, or zero.
It returns 1 for positive numbers, -1 for negative numbers, and 0 for zero.

```surql title="API DEFINITION"
math::sign(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::sign(-42);

-1
```

<br />

## `math::sin`

<Since v="v2.0.0" />

The `math::sin` function returns the sine of a number, which is assumed to be in radians.

```surql title="API DEFINITION"
math::sin(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::sin(1);

0.8414709848078965
```

<br />

## `math::spread`

The `math::spread` function returns the spread of an array of numbers.

```surql title="API DEFINITION"
math::spread(array<number>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::spread([ 1, 40, 60, 10, 2, 901 ]);

900
```

<br />

## `math::sqrt`

The `math::sqrt` function returns the square root of a number.

```surql title="API DEFINITION"
math::sqrt(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::sqrt(15);

3.872983346207417
```

<br />

## `math::sqrt_2`

The `math::sqrt_2` constant represents the square root of 2.

```surql title="API DEFINITION"
math::sqrt_2 -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::sqrt_2;

1.4142135623730951f
```

<br />

## `math::stddev`

The `math::stddev` function calculates how far a set of numbers are away from the mean.

```surql title="API DEFINITION"
math::stddev(array<number>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::stddev([ 1, 40, 60, 10, 2, 901 ]);

359.37167389765153
```

<br />

## `math::sum`

The `math::sum`  function returns the total sum of a set of numbers.

```surql title="API DEFINITION"
math::sum(array<number>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::sum([ 26.164, 13.746189, 23, 16.4, 41.42 ]);

120.730189
```

<br />

## `math::tan`

<Since v="v2.0.0" />

The `math::tan` function returns the tangent of a number, which is assumed to be in radians.

```surql title="API DEFINITION"
math::tan(number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::tan(1);

1.5574077246549023
```

<br />

## `math::tau`

The `math::tau` constant represents the mathematical constant τ, which is equal to 2π.

```surql title="API DEFINITION"
math::tau -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::tau;

6.283185307179586f
```

<br />

## `math::top`

The `math::top` function returns the top of an array of numbers.

```surql title="API DEFINITION"
math::top(array<number>, number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::top([1, 40, 60, 10, 2, 901], 3);

[ 40, 901, 60 ]
```

<br />

## `math::trimean`

The `math::trimean` function returns the trimean of an array of numbers.

```surql title="API DEFINITION"
math::trimean(array<number>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::trimean([ 1, 40, 60, 10, 2, 901 ]);

27.25
```

<br />

## `math::variance`

The `math::variance` function returns the variance of an array of numbers.

```surql title="API DEFINITION"
math::variance(array<number>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN math::variance([ 1, 40, 60, 10, 2, 901 ]);

129148
```

<br /><br />

---
sidebar_position: 13
sidebar_label: Meta functions
title: Meta functions | SurrealQL
description: These functions can be used to retrieve specific metadata from a SurrealDB Record ID.
---

import Since from '@components/shared/Since.astro'

# Meta functions

> [!NOTE]
> As of version 2.0, these functions are now part of SurrealDB's [record](/docs/surrealql/functions/database/record) functions.


These functions can be used to retrieve specific metadata from a SurrealDB Record ID.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#metaid"><code>meta::id()</code></a></td>
      <td scope="row" data-label="Description">Extracts and returns the identifier from a SurrealDB Record ID</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#metatb"><code>meta::tb()</code></a></td>
      <td scope="row" data-label="Description">Extracts and returns the table name from a SurrealDB Record ID</td>
    </tr>
  </tbody>
</table>

## `meta::id`

The `meta::id` function extracts and returns the identifier from a SurrealDB Record ID.

```surql title="API DEFINITION"
meta::id(record) -> value
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN meta::id(person:tobie);

"tobie"
```

<br />

## `meta::tb`

The `meta::tb` function extracts and returns the table name from a SurrealDB Record ID.

```surql title="API DEFINITION"
meta::tb(record) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN meta::tb(person:tobie);

"person"
```

This function can also be called using the path `meta::table`.

```surql
RETURN meta::table(person:tobie);

"person"
```

<br /><br />


---
sidebar_position: 14
sidebar_label: Not function
title: Not function | SurrealQL
description: This function can be used to reverse the truthiness of a value.
---

# Not function

This function can be used to reverse the truthiness of a value.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#not"><code>not()</code></a></td>
      <td scope="row" data-label="Description">Reverses the truthiness of a value.</td>
    </tr>
  </tbody>
</table>

## `not`

The `not` function reverses the truthiness of a value. It is functionally identical to `!`, the [NOT](/docs/surrealql/operators#not) operator.

```surql title="API DEFINITION"
not(any) -> bool
```

```surql 
RETURN not("I speak the truth");

false
```

A value is not [truthy](/docs/surrealql/datamodel/values#values-and-truthiness) if it is NONE, NULL, false, empty, or has a value of 0. As such, all the following return `true`.

```surql
RETURN [
    not(""),
    not(false),
    not([]),
    not({}),
    not(0)
];
```

Similarly, the function can be used twice to determine whether a value is truthy or not. As each item in the example below is truthy, calling `not()` twice will return the value `true` for each.

```surql
RETURN [
    not(not("I have value")),
    not(not(true)),
    not(not(["value!"])),
    not(not({i_have: "value"})),
    not(not(100))
];
```

Doubling the `!` operator is functionally identical to the above and is a more commonly seen pattern.

```surql
RETURN [
    !!"I have value",
    !!true,
    !!["value!"],
    !!{i_have: "value"},
    !!100
];
```

<br /><br />

---
sidebar_position: 15
sidebar_label: Object functions
title: Object functions | SurrealQL
description: These functions can be used when working with, and manipulating data objects.
---
import Since from '@components/shared/Since.astro'

# Object functions

These functions can be used when working with, and manipulating data objects.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#objectentries"><code>object::entries()</code></a></td>
      <td scope="row" data-label="Description">Transforms an object into an array with arrays of key-value combinations.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#objectextend"><code>object::extend()</code></a></td>
      <td scope="row" data-label="Description">Extends an object with the content of another one.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#objectfrom_entries"><code>object::from_entries()</code></a></td>
      <td scope="row" data-label="Description">Transforms an array with arrays of key-value combinations into an object.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#objectis_empty"><code>object::is_empty()</code></a></td>
      <td scope="row" data-label="Description">Checks if an object is empty</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#objectkeys"><code>object::keys()</code></a></td>
      <td scope="row" data-label="Description">Returns an array with all the keys of an object.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#objectlen"><code>object::len()</code></a></td>
      <td scope="row" data-label="Description">Returns the amount of key-value pairs an object holds.</td>
    </tr>
<tr>
      <td scope="row" data-label="Function"><a href="#objectremove"><code>object::remove()</code></a></td>
      <td scope="row" data-label="Description">Removes one or more fields from an object.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#objectvalues"><code>object::values()</code></a></td>
      <td scope="row" data-label="Description">Returns an array with all the values of an object.</td>
    </tr>
  </tbody>
</table>

## `object::entries`

<Since v="v1.1.0" />

The `object::entries` function transforms an object into an array with arrays of key-value combinations.

```surql title="API DEFINITION"
object::entries(object) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN object::entries({
  a: 1,
  b: true
});

[
  [ "a", 1 ],
  [ "b", true ],
]
```

<br />

## `object::extend`

<Since v="v3.0.0-alpha.3" />

The `object::extend` function extends an object with the fields and values of another one, essentially adding the two together.

```surql title="API DEFINITION"
object::extend(object, object) -> object
```

An example of the function, resulting in one new field (`gold`) and one updated field (`last_updated`) in the final output.

```surql
{ name: "Mat Cauthon", last_updated: d'2013-01-08'}.extend( 
{ gold: 100, last_updated: time::now() });
```

```surql title="Output"
{
	gold: 100,
	last_updated: d'2025-05-07T06:15:00.768Z',
	name: 'Mat Cauthon'
}
```

Note: the same behaviour can also be achieved using the `+` operator.

```surql
{ name: "Mat Cauthon", last_updated: d'2013-01-08'} + 
{ gold: 100, last_updated: time::now() };
```

<br />

## `object::from_entries`

<Since v="v1.1.0" />

The `object::from_entries` function transforms an array with arrays of key-value combinations into an object.

```surql title="API DEFINITION"
object::from_entries(array) -> object
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN object::from_entries([
  [ "a", 1 ],
  [ "b", true ],
]);

{
  a: 1,
  b: true
}
```

## `object::is_empty`

<Since v="v2.2.0" />

The `object::is_empty` function checks whether the object contains values.

```surql title="API DEFINITION"
object::is_empty(object) -> bool
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql title="An object that contain values"
RETURN {
  name: "Aeon",
  age: 20
}.is_empty();

false
```

```surql title="An empty object"
RETURN object::is_empty({});

true
```

Example of `.is_empty()` being used in a [`DEFINE FIELD`](/docs/surrealql/statements/define/field#asserting-rules-on-fields) statement to disallow empty objects:

```surql
DEFINE FIELD metadata
  ON house
  TYPE object
  ASSERT !$value.is_empty();
CREATE house SET metadata = {};
CREATE house SET metadata = { floors: 5 };
```

```surql title="Output"
-------- Query --------

'Found {  } for field `metadata`, with record `house:aei2fms2jccm46ceib8l`, but field must conform to: !$value.is_empty()'

-------- Query --------

[
	{
		id: house:g126ct3m0scbkockq32u,
		metadata: {
			floors: 5
		}
	}
]
```

## `object::keys`

<Since v="v1.1.0" />

The `object::keys` function returns an array with all the keys of an object.

```surql title="API DEFINITION"
object::keys(object) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN object::keys({
  a: 1,
  b: true
});

[ "a", "b" ]
```

<br />

## `object::len`

<Since v="v1.1.0" />

The `object::len` function returns the amount of key-value pairs an object holds.

```surql title="API DEFINITION"
object::len(object) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN object::len({
  a: 1,
  b: true
});

2
```

## `object::remove`

<Since v="v3.0.0-alpha.3" />

The `object::remove` function removes one or more fields from an object.

```surql title="API DEFINITION"
object::remove(object, string|array<string>) -> object
```

A single string can be used to remove a single field from an object, while an array of strings can be used to remove one or more fields at a time.

```surql
{ name: "Mat Cauthon", last_updated: d'2013-01-08', gold: 100 }.remove("gold");
{ name: "Mat Cauthon", last_updated: d'2013-01-08', gold: 100 }.remove(["gold", "last_updated"]);
```

```surql title="Output"
-------- Query 1 --------

{
	last_updated: d'2013-01-08T00:00:00Z',
	name: 'Mat Cauthon'
}

-------- Query 2 --------

{
	name: 'Mat Cauthon'
}
```

## `object::values`

<Since v="v1.1.0" />

The `object::values` function returns an array with all the values of an object.

```surql title="API DEFINITION"
object::values(object) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN object::values({
  a: 1,
  b: true
});

[ 1, true ]
```

<br /><br />

## Method chaining

<Since v="v2.0.0" />

Method chaining allows functions to be called using the `.` dot operator on a value of a certain type instead of the full path of the function followed by the value.

```surql
-- Traditional syntax
object::values({
  a: 1,
  b: true
});

-- Method chaining syntax
{
  a: 1,
  b: true
}.values();
```

```surql title="Response"
[
  1,
  true
]
```

This is particularly useful for readability when a function is called multiple times.

```surql
-- Traditional syntax
array::max(object::values(object::from_entries([["a", 1], ["b", 2]])));

-- Method chaining syntax
object::from_entries([["a", 1], ["b", 2]]).values().max();
```

```surql title="Response"
2
```

---
sidebar_position: 16
sidebar_label: Parse functions
title: Parse functions | SurrealQL
description: These functions can be used when parsing email addresses and URL web addresses.
---

# Parse functions

These functions can be used when parsing email addresses and URL web addresses.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#parseemailhost"><code>parse::&#8203;email::host()</code></a></td>
      <td scope="row" data-label="Description">Parses and returns an email host from an email address</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#parseemailuser"><code>parse::&#8203;email::user()</code></a></td>
      <td scope="row" data-label="Description">Parses and returns an email username from an email address</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#parseurldomain"><code>parse::url::domain()</code></a></td>
      <td scope="row" data-label="Description">Parses and returns the domain from a URL</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#parseurlfragment"><code>parse::url::fragment()</code></a></td>
      <td scope="row" data-label="Description">Parses and returns the fragment from a URL</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#parseurlhost"><code>parse::url::host()</code></a></td>
      <td scope="row" data-label="Description">Parses and returns the hostname from a URL</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#parseurlpath"><code>parse::url::path()</code></a></td>
      <td scope="row" data-label="Description">Parses and returns the path from a URL</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#parseurlport"><code>parse::url::port()</code></a></td>
      <td scope="row" data-label="Description">Parses and returns the port number from a URL</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#parseurlscheme"><code>parse::url::scheme()</code></a></td>
      <td scope="row" data-label="Description">Parses and returns the scheme from a URL</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#parseurlquery"><code>parse::url::query()</code></a></td>
      <td scope="row" data-label="Description">Parses and returns the query string from a URL</td>
    </tr>
  </tbody>
</table>

## `parse::email::host`

The `parse::email::host` function parses and returns an email host from a valid email address.

```surql title="API DEFINITION"
parse::email::host(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN parse::email::host("info@surrealdb.com");

"surrealdb.com"
```

<br />

## `parse::email::user`

The `parse::email::user` function parses and returns an email username from a valid email address.

```surql title="API DEFINITION"
parse::email::user(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN parse::email::user("info@surrealdb.com");

"info"
```

<br />

## `parse::url::domain`

The `parse::url::domain` function parses and returns domain from a valid URL.
This function is similar to `parse::url::host` only that it will return `null` if the URL is an IP address.

```surql title="API DEFINITION"
parse::url::domain(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN parse::url::domain("https://surrealdb.com:80/features?some=option#fragment");
RETURN parse::url::domain("http://127.0.0.1/index.html");
```

```surql title="Response"
"surrealdb.com"

null
```

<br />

## `parse::url::fragment`

The `parse::url::fragment` function parses and returns the fragment from a valid URL.

```surql title="API DEFINITION"
parse::url::fragment(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN parse::url::fragment("https://surrealdb.com:80/features?some=option#fragment");

"fragment"
```

<br />

## `parse::url::host`

The `parse::url::host` function parses and returns the hostname from a valid URL.

```surql title="API DEFINITION"
parse::url::host(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN parse::url::host("https://surrealdb.com:80/features?some=option#fragment");
RETURN parse::url::host("http://127.0.0.1/index.html");
```

```surql title="Response"
"surrealdb.com"

"127.0.0.1"
```

<br />

## `parse::url::path`

The `parse::url::path`  function parses and returns the path from a valid URL.

```surql title="API DEFINITION"
parse::url::path(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN parse::url::path("https://surrealdb.com:80/features?some=option#fragment");

"/features"
```

<br />

## `parse::url::port`

The `parse::url::port` function parses and returns the port from a valid URL.

```surql title="API DEFINITION"
parse::url::port(string) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN parse::url::port("https://surrealdb.com:80/features?some=option#fragment");

80
```

<br />

## `parse::url::scheme`

The `parse::url::scheme` function parses and returns the scheme from a valid URL, in lowercase, as an ASCII string without the ':' delimiter.

```surql title="API DEFINITION"
parse::url::scheme(string) -> string
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN parse::url::scheme("https://surrealdb.com:80/features?some=option#fragment");

'https'
```

<br />

## `parse::url::query`

The `parse::url::query` function parses and returns the query from a valid URL.

```surql title="API DEFINITION"
parse::url::query(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN parse::url::query("https://surrealdb.com:80/features?some=option#fragment");

"some=option"
```

<br /><br />


---
sidebar_position: 17
sidebar_label: Rand functions
title: Rand functions | SurrealQL
description: These functions can be used when generating random data values.
---
import Since from '@components/shared/Since.astro'

# Rand functions

These functions can be used when generating random data values.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#rand"><code>rand()</code></a></td>
      <td scope="row" data-label="Description">Generates and returns a random floating point number</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#randbool"><code>rand::bool()</code></a></td>
      <td scope="row" data-label="Description">Generates and returns a random boolean</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#randduration"><code>rand::duration()</code></a></td>
      <td scope="row" data-label="Description">Generates and returns a random duration</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#randenum"><code>rand::enum()</code></a></td>
      <td scope="row" data-label="Description">Randomly picks a value from the specified values</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#randfloat"><code>rand::float()</code></a></td>
      <td scope="row" data-label="Description">Generates and returns a random floating point number</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#randguid"><code>rand::guid()</code></a></td>
      <td scope="row" data-label="Description">Generates and returns a random guid</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#randint"><code>rand::int()</code></a></td>
      <td scope="row" data-label="Description">Generates and returns a random integer</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#randstring"><code>rand::string()</code></a></td>
      <td scope="row" data-label="Description">Generates and returns a random string</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#randtime"><code>rand::time()</code></a></td>
      <td scope="row" data-label="Description">Generates and returns a random datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#randuuid"><code>rand::uuid()</code></a></td>
      <td scope="row" data-label="Description">Generates and returns a random UUID</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#randuuidv4"><code>rand::uuid::v4()</code></a></td>
      <td scope="row" data-label="Description">Generates and returns a random Version 4 UUID</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#randuuidv7"><code>rand::uuid::v7()</code></a></td>
      <td scope="row" data-label="Description">Generates and returns a random Version 7 UUID</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#randulid"><code>rand::ulid()</code></a></td>
      <td scope="row" data-label="Description">Generates and returns a random ULID</td>
    </tr>
  </tbody>
</table>

## `rand`

The rand function generates a random [`float`](/docs/surrealql/datamodel/numbers#floating-point-numbers), between 0 and 1.

```surql title="API DEFINITION"
rand() -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN rand();

0.7062321084863658
```
The following example shows this function being used in a [`SELECT`](/docs/surrealql/statements/select) statement with an `ORDER BY` clause:

```surql
SELECT * FROM [{ age: 33 }, { age: 45 }, { age: 39 }] ORDER BY rand();


[
	{
		age: 45
	},
	{
		age: 39
	},
	{
		age: 33
	}
]
```

<br />

## `rand::bool`

The rand::bool function generates a random [`boolean`](/docs/surrealql/datamodel/booleans) value.

```surql title="API DEFINITION"
rand::bool() -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN rand::bool();

true
```

<br />

## `rand::duration`

<Since v="v2.3.0" />

The rand::duration function generates a random [`duration`](/docs/surrealql/datamodel/datetimes#durations-and-datetimes) value between two `duration` arguments.

```surql title="API DEFINITION"
rand::bool(duration, duration) -> duration
```

Some examples of the function in use:

```surql
rand::duration(1ns, 1ms);

rand::duration(0ns, duration::max);
```

```surql title="Output"
-------- Query 1 --------
435µs884ns

-------- Query 2 --------
405337457164y36w2d5h54m8s16ms76µs191ns
```

<br />

## `rand::enum`

The `rand::enum` function generates a random value, from a multitude of values.



```surql title="API DEFINITION"
rand::enum(value...) -> any
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN rand::enum('one', 'two', 3, 4.15385, 'five', true);

"five"
```

<br />

## `rand::float`

The `rand::float` function generates a random [`float`](/docs/surrealql/datamodel/numbers#floating-point-numbers), between `0` and `1`.



```surql title="API DEFINITION"
rand::float() -> float
```
If two numbers are provided, then the function generates a random [`float`](/docs/surrealql/datamodel/numbers#floating-point-numbers), between two numbers.

```surql title="API DEFINITION"
rand::float(number, number) -> float
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN rand::float();

0.7812733136200293
```
```surql
RETURN rand::float(10, 15);

11.305355983514927
```

<br />

## `rand::guid`

The `rand::guid` function generates a 20-characters random guid.

```surql title="API DEFINITION"
rand::guid() -> string
```
If a number is provided, then the function generates a random guid, with a specific length.

```surql title="API DEFINITION"
rand::guid(number) -> string
```

If a second number is provided, then the function will generate a random guid, with a length between the two numbers.

```surql title="API DEFINITION"
rand::guid(min, max) -> string
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql title="A 20-chars random guid"
RETURN rand::guid();

"4uqmrmtjhtjeg77et0dl"
```
```surql title="A 10-chars random guid"
RETURN rand::guid(10);

"f3b6cjh0nt"
```
```surql title="A random guid with a length between 5 and 15 chars"
RETURN rand::guid(5, 15);

"894bqt4lp"
```

<br />

## `rand::int`

The `rand::int`  function generates a random int.



```surql title="API DEFINITION"
rand::int() -> int
```
If two numbers are provided, then the function generates a random int, between two numbers.

```surql title="API DEFINITION"
rand::int(number, number) -> int
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN rand::int();

6841551695902514727
```
```surql
RETURN rand::int(10, 15);

13
```

<br />

## `rand::string`

The `rand::string` function generates a random string, with 32 characters.

```surql title="API DEFINITION"
rand::string() -> string
```
The `rand::string` function generates a random string, with a specific length.

```surql title="API DEFINITION"
rand::string(number) -> string
```

If two numbers are provided, then the function generates a random string, with a length between two numbers.

```surql title="API DEFINITION"
rand::string(number, number) -> string
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN rand::string();

"N8Q86mklN6U7kv0A2XCRh5UlpQMSvdoT"
```
```surql
RETURN rand::string(15);

"aSCtrfJj4pSJ7Xq"
```
```surql
RETURN rand::string(10, 15);

"rEUWFUMcx0YH"
```

<br />

## `rand::time`

The `rand::time` function generates a random [`datetime`](/docs/surrealql/datamodel/datetimes).

```surql title="API DEFINITION"
rand::time() -> datetime
rand::time(datetime|number, datetime|number) -> datetime
```

The rand::time function generates a random [`datetime`](/docs/surrealql/datamodel/datetimes), either a completely random datetime when no arguments are passed in, or between two unix timestamps.

```surql
RETURN rand::time();

-- d'1327-07-12T01:00:32Z'

RETURN rand::time(198371, 1223138713);

-- d'1991-01-13T23:27:17Z'
```

<Since v="v2.2.0" />

This function can take two datetimes, returning a random datetime in between the least and greatest of the two.

```surql
RETURN rand::time(d'1970-01-01', d'2000-01-01');

-- d'1999-05-29T17:02:16Z"
```

<Since v="v2.3.0" />

Either of the arguments of this function can now be either a number or a datetime.

```surql
RETURN rand::time(0, d'1990-01-01');

-- d'1986-11-17T15:06:01Z'
```

As of this version, this function returns a datetime between 0000-01-01T00:00:00Z and 9999-12-31T23:59:59Z. Before this, the function returned a random datetime between 1970-01-01T00:00:00Z (0 seconds after the UNIX epoch) and +262142-12-31T23:59:59Z (the maximum possible value for a `datetime`).

## `rand::uuid`

The `rand::uuid` function generates a random UUID. You can also generate uuids from datetime values.

```surql title="API DEFINITION"
rand::uuid() -> uuid
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN rand::uuid();

[u"e20b2836-e689-4643-998d-b17a16800323"]
```

### `rand::uuid` from timestamp

<Since v="v2.0.0" />

The `rand::uuid` function generates a random UUID from a datetime type.

```surql title="API DEFINITION"
rand::uuid(datetime) -> uuid
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN rand::uuid(d"2021-09-07T04:27:53Z");
```

```surql
CREATE ONLY test:[rand::uuid()] SET created = time::now(), num = 1;
SLEEP 100ms;

LET $rec = CREATE ONLY test:[rand::uuid()] SET created = time::now(), num = 2;
SLEEP 100ms;
CREATE ONLY test:[rand::uuid()] SET created = time::now(), num = 3;
-- Select the value of the record created before the current record in the table
SELECT VALUE num FROM test:[rand::uuid($rec.created - 100ms)]..;
  ```

<br />

## `rand::uuid::v4`

The `rand::uuid::v4` function generates a random version 4 UUID.

```surql title="API DEFINITION"
rand::uuid::v4() -> uuid
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN rand::uuid::v4();

[u"4def23a5-a847-4934-8dad-c64ccc48921b"]
```

### `rand::uuid::v4` from timestamp

<Since v="v2.0.0" />

The `rand::uuid::v4` function generates a random version 4 UUID from a datetime type.

```surql title="API DEFINITION"
rand::uuid::v4(datetime) -> uuid
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN rand::uuid::v4(d"2021-09-07T04:27:53Z");
```

```surql
CREATE ONLY test:[rand::uuid::v4()] SET created = time::now(), num = 1;
SLEEP 100ms;

LET $rec = CREATE ONLY test:[rand::uuid::v4()] SET created = time::now(), num = 2;
SLEEP 100ms;
CREATE ONLY test:[rand::uuid::v4()] SET created = time::now(), num = 3;
-- Select the value of the record created before the current record in the table
SELECT VALUE num FROM test:[rand::uuid::v4($rec.created - 100ms)]..;
  ```

<br />

## `rand::uuid::v7`

The `rand::uuid::v7` function generates a random Version 7 UUID.

```surql title="API DEFINITION"
rand::uuid::v7() -> uuid
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN rand::uuid::v7();

[u'0190d9df-c6cd-7e8a-aae2-aa3a162507ed']
```

### `rand::uuid::v7` from timestamp

<Since v="v2.0.0" />

The `rand::uuid::v7` function generates a random  Version 7  UUID from a datetime type.

```surql title="API DEFINITION"
rand::uuid::v7(datetime) -> uuid
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN rand::uuid::v7(d"2021-09-07T04:27:53Z");
```

```surql
CREATE ONLY test:[rand::uuid::v7()] SET created = time::now(), num = 1;
SLEEP 100ms;

LET $rec = CREATE ONLY test:[rand::uuid::v7()] SET created = time::now(), num = 2;
SLEEP 100ms;
CREATE ONLY test:[rand::uuid::v7()] SET created = time::now(), num = 3;
-- Select the value of the record created before the current record in the table
SELECT VALUE num FROM test:[rand::uuid::v7($rec.created - 100ms)]..;
  ```

To enable `rand::uuid::v7` in [embedded mode](/docs/surrealdb/embedding/rust) you need to add the following to your `.cargo/config.toml` file in your project

```toml
[build]
rustflags = ["--cfg", "uuid_unstable"]
```

<br />

## `rand::ulid`

The `rand::ulid` function generates a random ULID.

```surql title="API DEFINITION"
rand::ulid() -> ulid
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN rand::ulid();

[u"01H9QDG81Q7SB33RXB7BEZBK7G"]
```

### `rand::ulid` from timestamp

<Since v="v2.0.0" />

The `rand::ulid` function generates a random ULID from a datetime type.

```surql title="API DEFINITION"
rand::ulid(datetime) -> uuid
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN rand::ulid(d"2021-09-07T04:27:53Z");
```

```surql
CREATE ONLY test:[rand::ulid()] SET created = time::now(), num = 1;
SLEEP 100ms;

LET $rec = CREATE ONLY test:[rand::ulid()] SET created = time::now(), num = 2;
SLEEP 100ms;
CREATE ONLY test:[rand::ulid()] SET created = time::now(), num = 3;
-- Select the value of the record created before the current record in the table
SELECT VALUE num FROM test:[rand::ulid($rec.created - 100ms)]..;
  ```


<br /><br />


---
sidebar_position: 18
sidebar_label: Record functions
title: Record functions | SurrealQL
description: These functions can be used to retrieve specific metadata from a SurrealDB Record ID.
---

import Since from '@components/shared/Since.astro'

# Record functions

> [!NOTE]
> Record functions before SurrealDB 2.0 were located inside the module [meta](/docs/surrealql/functions/database/meta). Their behaviour has not changed.

These functions can be used to retrieve specific metadata from a SurrealDB Record ID.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#recordexists"><code>record::exists()</code></a></td>
      <td scope="row" data-label="Description">Checks to see if a SurrealDB Record ID exists</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#recordid"><code>record::id()</code></a></td>
      <td scope="row" data-label="Description">Extracts and returns the identifier from a SurrealDB Record ID</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#recordtb"><code>record::tb()</code></a></td>
      <td scope="row" data-label="Description">Extracts and returns the table name from a SurrealDB Record ID</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#recordrefs"><code>record::refs()</code></a></td>
      <td scope="row" data-label="Description">Extracts and returns the record IDs of any records that have a record link along with a `REFERENCES` clause</td>
    </tr>
  </tbody>
</table>

## `record::exists`

The `record::exists` function checks to see if a given record exists.

```surql title="API DEFINITION"
record::exists(record) -> bool
```

A simple example showing the output of this function when a record does not exist and when it does:

```surql
RETURN record::exists(r"person:tobie");
-- false

CREATE person:tobie;
RETURN record::exists(r"person:tobie");
-- true
```

A longer example of `record::exists` using method syntax:

```surql
FOR $person IN ["Haakon_VII", "Ferdinand_I", "Manuel_II", "Wilhelm_II", "George_I", "Albert_I", "Alfonso_XIII", "George_V", "Frederick_VIII"] {
    LET $record_name = type::thing("person", $person.lowercase());
    IF !$record_name.exists() {
        CREATE $record_name;
    }
}
```

## `record::id`

The `record::id` function extracts and returns the identifier from a SurrealDB Record ID.

```surql title="API DEFINITION"
record::id(record) -> value
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN record::id(person:tobie);

"tobie"
```

## `record::tb`

The `record::tb` function extracts and returns the table name from a SurrealDB Record ID.

```surql title="API DEFINITION"
record::tb(record) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN record::tb(person:tobie);

"person"
```

<br /><br />

## `record::refs`

<Since v="v2.2.0" />

The `record::refs` function returns the record IDs of any records that have a [record link](/docs/surrealql/datamodel/records) along with a `REFERENCES` clause.

```surql title="API DEFINITION"
record::refs(record) -> array<record>
record::refs(record, $table_name: string) -> array<record>
record::refs(record, $table_name: string, $field_name: string) -> array<record>
```

This function can be used on its own to return all references to a single record.

```surql
DEFINE FIELD best_friend ON person TYPE option<record<person>> REFERENCE;

-- Both Billy and Bobby think Gaston is their best friend
CREATE person:billy, person:bobby SET best_friend = person:gaston;
-- But not Gaston
CREATE person:gaston SET best_friend = NONE;

person:gaston.refs();
```

```surql title="Output"
[
	person:billy,
	person:bobby
]
```

It can be followed by a single string to filter references to only include those from a certain table.

```surql
DEFINE FIELD located_in ON city TYPE option<record<country>> REFERENCE;
DEFINE FIELD located_in ON state TYPE option<record<country>> REFERENCE;

CREATE country:germany;
CREATE state:bavaria, city:munich SET located_in = country:germany;

country:germany.refs('city');
country:germany.refs('state');
```

```surql title="Output"
-------- Query --------

[
	city:munich
]

-------- Query --------

[
	state:bavaria
]
```

If followed by a second string, it will filter references by table name as well as field name.

```surql
DEFINE FIELD owner ON dog TYPE option<record<person>> REFERENCE;
DEFINE FIELD acquaintances ON dog TYPE option<array<record<person>>> REFERENCE;
DEFINE FIELD roommates ON cat TYPE option<record<person>> REFERENCE;
DEFINE FIELD acquaintances ON cat TYPE option<array<record<person>>> REFERENCE;

CREATE person:one, person:two, person:three;
CREATE dog:mr_bark SET owner = person:one, acquaintances = [person:two, person:three];
CREATE cat:mr_meow SET roommates = [person:one], acquaintances = [person:two, person:three];

-- All the dogs that consider person:one the owner
person:one.refs('dog', 'owner');
-- All the cats that consider person:one the roommate
person:one.refs('cat', 'roommate');
-- All the dogs acquainted with person:two
person:two.refs('dog', 'acquaintances');
```

```surql title="Output"
-------- Query --------

[
	dog:mr_bark
]

-------- Query  --------

[
	cat:mr_meow
]

-------- Query --------

[
	dog:mr_bark
]
```

## Method chaining

<Since v="v2.0.0" />

Method chaining allows functions to be called using the `.` dot operator on a value of a certain type instead of the full path of the function followed by the value.

```surql
-- Traditional syntax
record::id(r"person:aeon");

-- Method chaining syntax
r"person:aeon".id();
```

```surql title="Response"
'aeon'
```

This is particularly useful for readability when a function is called multiple times.

```surql
-- Traditional syntax
record::table(array::max([r"person:aeon", r"person:landevin"]));

-- Method chaining syntax
[r"person:aeon", r"person:landevin"].max().table();
```

```surql title="Response"
'person'
```

---
sidebar_position: 19
sidebar_label: Search functions
title: Search functions | SurrealQL
description: These functions are used in conjunction with the 'matches' operator to either collect the relevance score or highlight the searched keywords within the content.
---

# Search functions

These functions are used in conjunction with the [`@@` operator (the 'matches' operator)](/docs/surrealql/operators#matches) to either collect the relevance score or highlight the searched keywords within the content.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#searchanalyze"><code>search::analyze()</code></a></td>
      <td scope="row" data-label="Description">Returns the output of a defined search analyzer</td>
    </tr>
      <td scope="row" data-label="Function"><a href="#searchhighlight"><code>search::highlight()</code></a></td>
      <td scope="row" data-label="Description">Highlights the matching keywords</td>
    <tr>
      <td scope="row" data-label="Function"><a href="#searchoffsets"><code>search::offsets()</code></a></td>
      <td scope="row" data-label="Description">Returns the position of the matching keywords</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#searchscore"><code>search::score()</code></a></td>
      <td scope="row" data-label="Description">Returns the relevance score</td>
    </tr>
  </tbody>
</table>

<br/>
The examples below assume the following queries:

```surql
CREATE book:1 SET title = "Rust Web Programming";
DEFINE ANALYZER book_analyzer TOKENIZERS blank, class, camel, punct FILTERS snowball(english);
DEFINE INDEX book_title ON book FIELDS title SEARCH ANALYZER book_analyzer BM25;
```

## `search::analyze`

The `search_analyze` function returns the outut of a defined search analyzer on an input string.

```surql title="API DEFINITION"
search::analyze(analyzer, string) -> array<string>
```

First define the analyzer using the [`DEFINE ANALYZER`](/docs/surrealql/statements/define/analyzer) statement 

```surql title="Define book analyzer"
DEFINE ANALYZER book_analyzer TOKENIZERS blank, class, camel, punct FILTERS snowball(english); 
```

Next you can pass the analyzer to the `search::analyze`function. The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN search::analyze("book_analyzer", "A hands-on guide to developing, packaging, and deploying fully functional Rust web applications");
```

```surql title="Output"
[
	'a',
	'hand',
	'-',
	'on',
	'guid',
	'to',
	'develop',
	',',
	'packag',
	',',
	'and',
	'deploy',
	'fulli',
	'function',
	'rust',
	'web',
	'applic'
]
```

## `search::score`

The `search::score` function returns the relevance score corresponding to the given 'matches' predicate reference numbers.

```surql title="API DEFINITION"
search::score(number) -> number
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
SELECT id, title, search::score(1) AS score FROM book
	WHERE title @1@ 'rust web'
	ORDER BY score DESC;
```

```surql title="Output"
[
	{
		id: book:1,
		score: 0.9227996468544006,
		title: [ 'Rust Web Programming' ],
	}
]
```

<br />

## `search::highlight`

The `search::highlight` function highlights the matching keywords for the predicate reference number.

```surql title="API DEFINITION"
search::highlight(string, string, number, [boolean]) -> string | string[]
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
SELECT id, search::highlight('<b>', '</b>', 1) AS title
	FROM book WHERE title @1@ 'rust web';
```

```surql title="Output"
[
	{
		id: book:1,
		title: [ '<b>Rust</b> <b>Web</b> Programming' ]
	}
]
```

The optional Boolean parameter can be set to `true` to explicitly request that the whole found term be highlighted,
or set to `false` to highlight only the sequence of characters we are looking for. This must be used with an `edgengram` or `ngram` filter.
The default value is true.

<br />

## `search::offsets`

The `search::offsets` function returns the position of the matching keywords for the predicate reference number.

```surql title="API DEFINITION"
search::offsets(number, [boolean]) -> object
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
SELECT id, title, search::offsets(1) AS title_offsets
	FROM book WHERE title @1@ 'rust web';
```

```surql title="Output"
[
	{
		id: book:1,
		title: [ 'Rust Web Programming' ],
		title_offsets: {
			0: [
				{ e: 4, s: 0 },
				{ e: 8, s: 5 }
			]
		}
	}
]
```

The output returns the start `s` and end `e` positions of each matched term found within the original field.

The full-text index is capable of indexing both single strings and arrays of strings. In this example, the key `0` indicates that we're highlighting the first string within the `title` field, which contains an array of strings.

The optional Boolean parameter can be set to `true` to explicitly request that the whole found term be highlighted,
or set to `false` to highlight only the sequence of characters we are looking for. This must be used with an `edgengram` or `ngram` filter.
The default value is true.

<br /><br />

---
sidebar_position: 20
sidebar_label: Sequence functions
title: Sequence functions | SurrealQL
description: Functions to work with sequences.
---

import Since from '@components/shared/Since.astro'

# Sequence functions

<Since v="v3.0.0-alpha.2" />

These functions can be used to work with [sequences](/docs/surrealql/statements/define/sequence).

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#sequencenext"><code>sequence::next()</code></a></td>
      <td scope="row" data-label="Description">Returns the next value in a sequence.</td>
    </tr>
  </tbody>
</table>

## `sequence::next`

The `sequence::next` function returns the next value in a sequence.

```surql title="API DEFINITION"
sequence::next(sequence_name) -> int
```

```surql 
DEFINE SEQUENCE mySeq2 BATCH 1000 START 100 TIMEOUT 5s;
sequence::nextval('mySeq2');

-- 100
```

---
sidebar_position: 21
sidebar_label: Session functions
title: Session functions | SurrealQL
description: These functions return information about the current SurrealDB session.
---
import Since from '@components/shared/Since.astro'

# Session functions

These functions return information about the current SurrealDB session.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#sessionac"><code>session::ac()</code></a></td>
      <td scope="row" data-label="Description">Returns the current user's access method</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#sessiondb"><code>session::db()</code></a></td>
      <td scope="row" data-label="Description">Returns the currently selected database</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#sessionid"><code>session::id()</code></a></td>
      <td scope="row" data-label="Description">Returns the current user's session ID</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#sessionip"><code>session::ip()</code></a></td>
      <td scope="row" data-label="Description">Returns the current user's session IP address</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#sessionns"><code>session::ns()</code></a></td>
      <td scope="row" data-label="Description">Returns the currently selected namespace</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#sessionorigin"><code>session::origin()</code></a></td>
      <td scope="row" data-label="Description">Returns the current user's HTTP origin</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#sessionrd"><code>session::rd()</code></a></td>
      <td scope="row" data-label="Description">Returns the current user's record authentication data</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#sessiontoken"><code>session::token()</code></a></td>
      <td scope="row" data-label="Description">Returns the current user's authentication token</td>
    </tr>
  </tbody>
</table>

## `session::ac`

<Since v="v2.0.0" />

> [!NOTE]
> This function was known as `session::sc` in versions of SurrrealDB before 2.0. The behaviour has not changed.

The `session::ac` function returns the current user's access method.

```surql title="API DEFINITION"
session::ac() -> string
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN session::ac();

"user"
```

<br /><br />

## `session::db`

The `session::db` function returns the currently selected database.

```surql title="API DEFINITION"
session::db() -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN session::db();

"my_db"
```

<br />

## `session::id`

The `session::id` function returns the current user's session ID.

```surql title="API DEFINITION"
session::id() -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN session::id();

"I895rKuixHwCNIduyBIYH2M0Pga7oUmWnng5exEE4a7EB942GVElGrnRhE5scF5d"
```

<br />

## `session::ip`

The `session::ip` function returns the current user's session IP address.

```surql title="API DEFINITION"
session::ip() -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN session::ip();

"2001:db8:3333:4444:CCCC:DDDD:EEEE:FFFF"
```

<br />

## `session::ns`

The `session::ns` function returns the currently selected namespace.

```surql title="API DEFINITION"
session::ns() -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN session::ns();

"my_ns"
```

<br />

## `session::origin`

The `session::origin` function returns the current user's HTTP origin.

```surql title="API DEFINITION"
session::origin() -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN session::origin();

"http://localhost:3000"
```

<br />

## `session::rd`

<Since v="v2.0.0" />

The `session::rd` function returns the current user's record authentication.

```surql title="API DEFINITION"
session::rd() -> string
```

## `session::token`

The `session::token` function returns the current authentication token.

```surql title="API DEFINITION"
session::token() -> string
```

<br />


---
sidebar_position: 22
sidebar_label: Sleep function
title: Sleep function | SurrealQL
description: This function can be used to introduce a delay or pause in the execution of a query or a batch of queries for a specific amount of time.
---

# Sleep function

This function can be used to introduce a delay or pause in the execution of a query or a batch of queries for a specific amount of time.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#sleep"><code>sleep()</code></a></td>
      <td scope="row" data-label="Description">Delays or pauses in the execution of a query or a batch of queries.</td>
    </tr>
  </tbody>
</table>

## `sleep`

The `sleep` function delays or pauses the execution of a query or a set of statements.

```surql title="API DEFINITION"
sleep(duration) -> none
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN sleep(1s);
RETURN sleep(500ms);
```

SurrealDB also has a [SLEEP statement](/docs/surrealql/statements/sleep) statement that accepts a datetime; however, the `sleep` function can be used in more dynamic ways such as the following example that simulates a 100ms delay between each record in a query.

```surql
-- Create 3 `person` records
CREATE |person:3|;

LET $now = time::now();

SELECT *, 
  sleep(100ms) AS _, 
  time::now() - $now AS elapsed
FROM person;
```

```surql title="Response"
[
	{
		_: NONE,
		elapsed: 101ms457µs,
		id: person:fkgvriz1kl2tcgv6yqfq
	},
	{
		_: NONE,
		elapsed: 203ms599µs,
		id: person:lgibwdgtvx4v8ck60guk
	},
	{
		_: NONE,
		elapsed: 305ms728µs,
		id: person:pr0uby896y1az2p44wtw
	}
]
```

## SLEEP during parallel operations

The `sleep()` function does not interfere with operations that are underway in the background, such as a [`DEFINE INDEX`](/docs/surrealql/statements/define/indexes) statement using the `CONCURRENTLY` clause.

```surql
CREATE |user:50000| SET name = id.id() RETURN NONE;
DEFINE INDEX unique_name ON TABLE user FIELDS name UNIQUE CONCURRENTLY;
INFO FOR INDEX unique_name ON TABLE user;√
RETURN sleep(50ms);
INFO FOR INDEX unique_name ON TABLE user;
RETURN sleep(50ms);
INFO FOR INDEX unique_name ON TABLE user;
RETURN sleep(50ms);
INFO FOR INDEX unique_name ON TABLE user;
```

```surql title="Possible output"
-------- Query 1 --------
{ 
    building: {
        initial: 0,
        pending: 0,
        status: 'indexing', 
        updated: 0
    }
}

-------- Query 2 --------
{ 
    building: {
        initial: 100,
        pending: 20,
        status: 'indexing', 
        updated: 0
    }
}

-------- Query 3 --------
{ 
    building: {
        initial: 100,
        pending: 4,
        status: 'indexing', 
        updated: 16
    }
}

-------- Query 4 --------
{
    building: {
        status: 'ready'
    }
}
```

## Use cases

Putting a database to sleep can be useful in a small number of situations, such as:

* Testing and debugging: can be used to understand how concurrent transactions interact, test how systems handle timeouts and delays, simulate behaviour in more distant regions with longer latency
* Throttling: can be used to throttle the execution of operations to prevent the database from being overwhelmed by too many requests at once
* Security measures: can be used to slow down the response rate of login attempts to mitigate the risk of brute force attacks


---
sidebar_position: 23
sidebar_label: String functions
title: String functions | SurrealQL
description: These functions can be used when working with and manipulating text and string values.
---

import Since from '@components/shared/Since.astro'
import Table from '@components/shared/Table.astro'
import Tabs from "@components/Tabs/Tabs.astro";
import TabItem from "@components/Tabs/TabItem.astro";

# String Functions

These functions can be used when working with and manipulating text and string values.

<Table>
  <thead>
    <tr>
      <th >Function</th>
      <th >Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td ><a href="#stringconcat"><code>string::concat()</code></a></td>
      <td>Concatenates strings together</td>
    </tr>
    <tr>
      <td  ><a href="#stringcontains"><code>string::contains()</code></a></td>
      <td  >Checks whether a string contains another string</td>
    </tr>
    <tr>
      <td  ><a href="#stringends_with"><code>string::ends_with()</code></a></td>
      <td  >Checks whether a string ends with another string</td>
    </tr>
    <tr>
      <td  ><a href="#stringjoin"><code>string::join()</code></a></td>
      <td  >Joins strings together with a delimiter</td>
    </tr>
    <tr>
      <td  ><a href="#stringlen"><code>string::len()</code></a></td>
      <td  >Returns the length of a string</td>
    </tr>
    <tr>
      <td  ><a href="#stringlowercase"><code>string::lowercase()</code></a></td>
      <td  >Converts a string to lowercase</td>
    </tr>
    <tr>
      <td  ><a href="#stringmatches"><code>string::matches()</code></a></td>
      <td  >Performs a regex match on a string</td>
    </tr>
    <tr>
      <td  ><a href="#stringrepeat"><code>string::repeat()</code></a></td>
      <td  >Repeats a string a number of times</td>
    </tr>
    <tr>
      <td  ><a href="#stringreplace"><code>string::replace()</code></a></td>
      <td  >Replaces an occurrence of a string with another string</td>
    </tr>
    <tr>
      <td  ><a href="#stringreverse"><code>string::reverse()</code></a></td>
      <td  >Reverses a string</td>
    </tr>
    <tr>
      <td  ><a href="#stringslice"><code>string::slice()</code></a></td>
      <td  >Extracts and returns a section of a string</td>
    </tr>
    <tr>
      <td  ><a href="#stringslug"><code>string::slug()</code></a></td>
      <td  >Converts a string into human and URL-friendly string</td>
    </tr>
    <tr>
      <td  ><a href="#stringsplit"><code>string::split()</code></a></td>
      <td  >Divides a string into an ordered list of substrings</td>
    </tr>
    <tr>
      <td  ><a href="#stringstarts_with"><code>string::starts_with()</code></a></td>
      <td  >Checks whether a string starts with another string</td>
    </tr>
    <tr>
      <td  ><a href="#stringtrim"><code>string::trim()</code></a></td>
      <td  >Removes whitespace from the start and end of a string</td>
    </tr>
    <tr>
      <td  ><a href="#stringuppercase"><code>string::uppercase()</code></a></td>
      <td  >Converts a string to uppercase</td>
    </tr>
    <tr>
      <td  ><a href="#stringwords"><code>string::words()</code></a></td>
      <td  >Splits a string into an array of separate words</td>
    </tr>
    <tr>
      <td  ><a href="#stringdistancedameraulevenshtein"><code>string::distance::damerau_levenshtein()</code></a></td>
      <td  >Returns the Damerau–Levenshtein distance between two strings</td>
    </tr>
    <tr>
      <td  ><a href="#stringdistancenormalizeddameraulevenshtein"><code>string::distance::normalized_damerau_levenshtein()</code></a></td>
      <td  >Returns the normalized Damerau–Levenshtein distance between two strings</td>
    </tr>    
    <tr>
      <td  ><a href="#stringdistancehamming"><code>string::distance::hamming()</code></a></td>
      <td  >Returns the Hamming distance between two strings</td>
    </tr>
    <tr>
      <td  ><a href="#stringdistancelevenshtein"><code>string::distance::levenshtein()</code></a></td>
      <td  >Returns the Levenshtein distance between two strings</td>
    </tr>
    <tr>
      <td  ><a href="#stringdistancenormalizedlevenshtein"><code>string::distance::normalized_levenshtein()</code></a></td>
      <td  >Returns the normalized Levenshtein distance between two strings</td>
    </tr>
    <tr>
      <td  ><a href="#stringdistanceosadistance"><code>string::distance::osa_distance()</code></a></td>
      <td  >Returns the OSA (Optimal String Alignment) distance between two strings</td>
    </tr>
    <tr>
      <td  ><a href="#stringhtmlencode"><code>string::html::encode()</code></a></td>
      <td  >Encodes special characters into HTML entities to prevent HTML injection</td>
    </tr>
    <tr>
      <td  ><a href="#stringhtmlsanitize"><code>string::html::sanitize()</code></a></td>
      <td  >Sanitizes HTML code to prevent the most dangerous subset of HTML injection</td>
    </tr>
    <tr>
      <td  ><a href="#stringisalphanum"><code>string::is::alphanum()</code></a></td>
      <td  >Checks whether a value has only alphanumeric characters</td>
    </tr>
    <tr>
      <td  ><a href="#stringisalpha"><code>string::is::alpha()</code></a></td>
      <td  >Checks whether a value has only alpha characters</td>
    </tr>
    <tr>
      <td  ><a href="#stringisascii"><code>string::is::ascii()</code></a></td>
      <td  >Checks whether a value has only ascii characters</td>
    </tr>
    <tr>
      <td  ><a href="#stringisdatetime"><code>string::is::datetime()</code></a></td>
      <td  >Checks whether a string representation of a date and time matches a specified format</td>
    </tr>
    <tr>
      <td  ><a href="#stringisdomain"><code>string::is::domain()</code></a></td>
      <td  >Checks whether a value is a domain</td>
    </tr>
    <tr>
      <td  ><a href="#stringisemail"><code>string::is::email()</code></a></td>
      <td  >Checks whether a value is an email</td>
    </tr>
    <tr>
      <td  ><a href="#stringishexadecimal"><code>string::is::hexadecimal()</code></a></td>
      <td  >Checks whether a value is hexadecimal</td>
    </tr>
    <tr>
      <td  ><a href="#stringisip"><code>string::is::ip()</code></a></td>
      <td  >Checks whether a value is an IP address</td>
    </tr>
    <tr>
      <td  ><a href="#stringisipv4"><code>string::is::ipv4()</code></a></td>
      <td  >Checks whether a value is an IP v4 address</td>
    </tr>
    <tr>
      <td  ><a href="#stringisipv6"><code>string::is::ipv6()</code></a></td>
      <td  >Checks whether a value is an IP v6 address</td>
    </tr>
    <tr>
      <td  ><a href="#stringislatitude"><code>string::is::latitude()</code></a></td>
      <td  >Checks whether a value is a latitude value</td>
    </tr>
    <tr>
      <td  ><a href="#stringislongitude"><code>string::is::longitude()</code></a></td>
      <td  >Checks whether a value is a longitude value</td>
    </tr>
    <tr>
      <td  ><a href="#stringisnumeric"><code>string::is::numeric()</code></a></td>
      <td  >Checks whether a value has only numeric characters</td>
    </tr>
    <tr>
      <td  ><a href="#stringisrecord"><code>string::is::record()</code></a></td>
      <td  >Checks whether a string is a Record ID, optionally of a certain table</td>
    </tr>
    <tr>
      <td  ><a href="#stringissemver"><code>string::is::semver()</code></a></td>
      <td  >Checks whether a value matches a semver version</td>
    </tr>
    <tr>
      <td  ><a href="#stringisulid"><code>string::is::ulid()</code></a></td>
      <td  >Checks whether a string is a ULID</td>
    </tr>
    <tr>
      <td  ><a href="#stringisurl"><code>string::is::url()</code></a></td>
      <td  >Checks whether a value is a valid URL</td>
    </tr>
    <tr>
      <td  ><a href="#stringisuuid"><code>string::is::uuid()</code></a></td>
      <td  >Checks whether a string is a UUID</td>
    </tr>
    <tr>
      <td  ><a href="#stringsemvercompare"><code>string::semver::compare()</code></a></td>
      <td  >Performs a comparison between two semver strings</td>
    </tr>
    <tr>
      <td  ><a href="#stringsemvermajor"><code>string::semver::major()</code></a></td>
      <td  >Extract the major version from a semver string</td>
    </tr>
    <tr>
      <td  ><a href="#stringsemverminor"><code>string::semver::minor()</code></a></td>
      <td  >Extract the minor version from a semver string</td>
    </tr>
    <tr>
      <td  ><a href="#stringsemverpatch"><code>string::semver::patch()</code></a></td>
      <td  >Extract the patch version from a semver string</td>
    </tr>
    <tr>
      <td  ><a href="#stringsemverincmajor"><code>string::semver::inc::major()</code></a></td>
      <td  >Increment the major version of a semver string</td>
    </tr>
    <tr>
      <td  ><a href="#stringsemverincminor"><code>string::semver::inc::minor()</code></a></td>
      <td  >Increment the minor version of a semver string</td>
    </tr>
    <tr>
      <td  ><a href="#stringsemverincpatch"><code>string::semver::inc::patch()</code></a></td>
      <td  >Increment the patch version of a semver string</td>
    </tr>
    <tr>
      <td  ><a href="#stringsemversetmajor"><code>string::semver::set::major()</code></a></td>
      <td  >Set the major version of a semver string</td>
    </tr>
    <tr>
      <td  ><a href="#stringsemversetminor"><code>string::semver::set::minor()</code></a></td>
      <td  >Set the minor version of a semver string</td>
    </tr>
    <tr>
      <td  ><a href="#stringsemversetpatch"><code>string::semver::set::patch()</code></a></td>
      <td  >Set the patch version of a semver string</td>
    </tr>
    <tr>
      <td  ><a href="#stringsimilarityfuzzy"><code>string::similarity::fuzzy()</code></a></td>
      <td  >Return the similarity score of fuzzy matching strings</td>
    </tr>
    <tr>
      <td  ><a href="#stringsimilarityjaro"><code>string::similarity::jaro()</code></a></td>
      <td  >Returns the Jaro similarity between two strings</td>
    </tr>
    <tr>
      <td  ><a href="#stringsimilarityjarowinkler"><code>string::similarity::jaro_winkler()</code></a></td>
      <td  >Return the Jaro-Winkler similarity between two strings</td>
    </tr>
  </tbody>
</Table>

## `string::concat`

The `string::concat` function concatenates strings together.

```surql title="API DEFINITION"
string::concat(string, ...) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::concat('this', ' ', 'is', ' ', 'a', ' ', 'test');

"this is a test"
```

<br />

## `string::contains`

The `string::contains`  function checks whether a string contains another string.

```surql title="API DEFINITION"
string::contains(string, string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::contains('abcdefg', 'cde');

true
```

<br />

## `string::ends_with`

<Since v="v2.0.0" />

> [!NOTE]
> This function was known as `string::endsWith` in versions of SurrrealDB before 2.0. The behaviour has not changed.

The `string::ends_with` function checks whether a string ends with another string.

```surql title="API DEFINITION"
string::ends_with(string, string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::ends_with('some test', 'test');

true
```

<br />

## `string::join`

The `string::join` function joins strings together with a delimiter.
If you want to join an array of strings use [`array::join`](/docs/surrealql/functions/database/array#arrayjoin).

```surql title="API DEFINITION"
string::join(string, string...) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::join(', ', 'a', 'list', 'of', 'items');

"a, list, of, items"
```

<br />

## `string::len`

The `string::len` function returns the length of a given string.

```surql title="API DEFINITION"
string::len(string) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::len('this is a test');

14
```

<br />

## `string::lowercase`

The `string::lowercase` function converts a string to lowercase.

```surql title="API DEFINITION"
string::lowercase(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::lowercase('THIS IS A TEST');

"this is a test"
```

<br />

## `string::matches`

The `string::matches` function performs a regex match on a string.

```surql title="API DEFINITION"
string::matches(string, string) -> bool
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN [
  string::matches("grey", "gr(a|e)y"),
  string::matches("gray", "gr(a|e)y")
];

[ true, true ]
```

<br />

## `string::repeat`

The `string::repeat`  function repeats a string a number of times.

```surql title="API DEFINITION"
string::repeat(string, number) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::repeat('test', 3);

"testtesttest"
```

<br />

## `string::replace`

The `string::replace`  function replaces an occurrence of a string with another string.

<Tabs>
  <TabItem label="Before 2.3" default>

```surql title="API DEFINITION"
string::replace(string, string, string) -> string
```

  </TabItem>

  <TabItem label="After 2.3" default>
```surql title="API DEFINITION"
string::replace(string, string|regex, string) -> string
```
  </TabItem>
</Tabs>

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::replace('this is a test', 'a test', 'awesome');

"this is awesome"
```

With [`regexes`](/docs/surrealql/datamodel/regex) added as a data type in version 2.3, the second argument can also be a regex instead of a string.

```surql
RETURN string::replace('Many languages only use consonants in their writing', <regex>'a|e|i|o|u', '');
```

```surql title="Output"
'Mny lnggs nly s cnsnnts n thr wrtng'
```

<br />

## `string::reverse`

The `string::reverse`  function reverses a string.

```surql title="API DEFINITION"
string::reverse(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::reverse('this is a test');

"tset a si siht"
```

<br />

## `string::slice`

The `string::slice` function extracts and returns a section of a string.

```surql title="API DEFINITION"
string::slice(string, number, number) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::slice('this is a test', 10, 4);

"test"
```

<br />

## `string::slug`

The `string::slug`  function converts a string into a human and URL-friendly string.

```surql title="API DEFINITION"
string::slug(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::slug('SurrealDB has launched #database #awesome');

"surrealdb-has-launched-database-awesome"
```

<br />

## `string::split`

The `string::split` function splits a string by a given delimiter.

```surql title="API DEFINITION"
string::split(string, string) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::split('this, is, a, list', ', ');

["this", "is", "a", "list"]
```

<br />

## `string::starts_with`

<Since v="v2.0.0" />

> [!NOTE]
> This function was known as `string::startsWith` in versions of SurrrealDB before 2.0. The behaviour has not changed.

The `string::starts_with` function checks whether a string starts with another string.

```surql title="API DEFINITION"
string::starts_with(string, string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::starts_with('some test', 'some');

true
```

<br />

## `string::trim`

The `string::trim` function removes whitespace from the start and end of a string.

```surql title="API DEFINITION"
string::trim(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::trim('    this is a test    ');

"this is a test"
```

<br />

## `string::uppercase`

The `string::uppercase` function converts a string to uppercase.

```surql title="API DEFINITION"
string::uppercase(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::uppercase('this is a test');

"THIS IS A TEST"
```

## `string::words`

The `string::words` function splits a string into an array of separate words.

```surql title="API DEFINITION"
string::words(string) -> array
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::words('this is a test');

["this", "is", "a", "test"]
```

## `string::distance::damerau_levenshtein`

<Since v="v2.1.0" />

The `string::distance::damerau_levenshtein` function returns the Damerau-Levenshtein distance between two strings.

```surql title="API DEFINITION"
string::distance::damerau_levenshtein(string, string) -> int
```

The following examples shows this function, and its output in comparison with a number of strings.

```surql
LET $first     = "In a hole in the ground there lived a hobbit";
LET $same      = "In a hole in the ground there lived a hobbit";
LET $close     = "In a hole in the GROUND there lived a Hobbit";
LET $different = "A narrow passage holds four hidden treasures";
LET $short     = "Hi I'm Brian";

-- Returns 0
string::distance::damerau_levenshtein($first, $same);
-- Returns 7
string::distance::damerau_levenshtein($first, $close);
-- Returns 34
string::distance::damerau_levenshtein($first, $different);
-- Returns 38
string::distance::damerau_levenshtein($first, $short);
```

## `string::distance::normalized_damerau_levenshtein`

<Since v="v2.1.0" />

The `string::distance::normalized_damerau_levenshtein` function returns the normalized Damerau-Levenshtein distance between two strings. Normalized means that identical strings will return a score of 1, with less similar strings returning lower numbers as the distance grows.

```surql title="API DEFINITION"
string::distance::normalized_damerau_levenshtein(string, string) -> float
```

The following examples shows this function, and its output in comparison with a number of strings.

```surql
LET $first     = "In a hole in the ground there lived a hobbit";
LET $same      = "In a hole in the ground there lived a hobbit";
LET $close     = "In a hole in the GROUND there lived a Hobbit";
LET $different = "A narrow passage holds four hidden treasures";
LET $short     = "Hi I'm Brian";

-- Returns 1
string::distance::normalized_damerau_levenshtein($first, $same);
-- Returns 0.8409090909090909f
string::distance::normalized_damerau_levenshtein($first, $close);
-- Returns 0.2272727272727273f
string::distance::normalized_damerau_levenshtein($first, $different);
-- Returns 0.13636363636363635f
string::distance::normalized_damerau_levenshtein($first, $short);
```

## `string::distance::hamming`

<Since v="v2.1.0" />

The `string::distance::hamming` function returns the Hamming distance between two strings of equal length.

```surql title="API DEFINITION"
string::distance::hamming(string, string) -> int
```

The following examples shows this function, and its output in comparison with a number of strings.

```surql
LET $first     = "In a hole in the ground there lived a hobbit";
LET $same      = "In a hole in the ground there lived a hobbit";
LET $close     = "In a hole in the GROUND there lived a Hobbit";
LET $different = "A narrow passage holds four hidden treasures";
LET $short     = "Hi I'm Brian";

-- Returns 0
string::distance::hamming($first, $same);
-- Returns 7
string::distance::hamming($first, $close);
-- Returns 40
string::distance::hamming($first, $different);
-- Error: strings must be of equal length
string::distance::hamming($first, $short);
```

## `string::distance::levenshtein`

<Since v="v2.1.0" />

The `string::distance::levenshtein` function returns the Levenshtein distance between two strings.

```surql title="API DEFINITION"
string::distance::levenshtein(string, string) -> int
```

The following examples shows this function, and its output in comparison with a number of strings.

```surql
LET $first     = "In a hole in the ground there lived a hobbit";
LET $same      = "In a hole in the ground there lived a hobbit";
LET $close     = "In a hole in the GROUND there lived a Hobbit";
LET $different = "A narrow passage holds four hidden treasures";
LET $short     = "Hi I'm Brian";

-- Returns 0
string::distance::levenshtein($first, $same);
-- Returns 7
string::distance::levenshtein($first, $close);
-- Returns 35
string::distance::levenshtein($first, $different);
-- Returns 38
string::distance::levenshtein($first, $short);
```

## `string::distance::normalized_levenshtein`

<Since v="v2.1.0" />

The `string::distance::normalized_levenshtein` function returns the normalized Levenshtein distance between two strings. Normalized means that identical strings will return a score of 1, with less similar strings returning lower numbers as the distance grows.

```surql title="API DEFINITION"
string::distance::normalized_levenshtein(string, string) -> float
```

The following examples shows this function, and its output in comparison with a number of strings.

```surql
LET $first     = "In a hole in the ground there lived a hobbit";
LET $same      = "In a hole in the ground there lived a hobbit";
LET $close     = "In a hole in the GROUND there lived a Hobbit";
LET $different = "A narrow passage holds four hidden treasures";
LET $short     = "Hi I'm Brian";

-- Returns 1
string::distance::normalized_levenshtein($first, $same);
-- Returns 0.8409090909090909f
string::distance::normalized_levenshtein($first, $close);
-- Returns 0.20454545454545459f
string::distance::normalized_levenshtein($first, $different);
-- Returns 0.13636363636363635f
string::distance::normalized_levenshtein($first, $short);
```

## `string::distance::osa_distance`

<Since v="v2.1.0" />

The `string::distance::osa_distance` function returns the OSA (Optimal String Alignment) distance between two strings.

```surql title="API DEFINITION"
string::distance::normalized_levenshtein(string, string) -> int
```

The following examples shows this function, and its output in comparison with a number of strings.

```surql
LET $first     = "In a hole in the ground there lived a hobbit";
LET $same      = "In a hole in the ground there lived a hobbit";
LET $close     = "In a hole in the GROUND there lived a Hobbit";
LET $different = "A narrow passage holds four hidden treasures";
LET $short     = "Hi I'm Brian";

-- Returns 0
string::distance::osa_distance($first, $same);
-- Returns 7
string::distance::osa_distance($first, $close);
-- Returns 34
string::distance::osa_distance($first, $different);
-- Returns 38
string::distance::osa_distance($first, $short);
```

## `string::html::encode`

<Since v="v2.0.0" />

The `string::html::encode` function encodes special characters into HTML entities to prevent HTML injection. It is recommended to use this function in most cases when retrieving any untrusted content that may be rendered inside of an HTML document. You can learn more about its behavior from the [original implementation](https://docs.rs/ammonia/latest/ammonia/fn.clean_text.html).

```surql title="API DEFINITION"
string::html::encode(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::html::encode("<h1>Safe Title</h1><script>alert('XSS')</script><p>Safe paragraph. Not safe <span onload='logout()'>event</span>.</p>");

['&lt;h1&gt;Safe&#32;Title&lt;&#47;h1&gt;&lt;script&gt;alert(&apos;XSS&apos;)&lt;&#47;script&gt;&lt;p&gt;Safe&#32;paragraph.&#32;Not&#32;safe&#32;&lt;span&#32;onload&#61;&apos;logout()&apos;&gt;event&lt;&#47;span&gt;.&lt;&#47;p&gt;']
```

<br />

## `string::html::sanitize`

<Since v="v2.0.0" />

The `string::html::sanitize` function sanitizes HTML code to prevent the most dangerous subset of HTML injection that can lead to attacks like cross-site scripting, layout breaking or clickjacking. This function will keep any other HTML syntax intact in order to support user-generated content that needs to contain HTML styling. It is only recommended to rely on this function if you want to allow the creators of the content to have some control over its HTML styling. You can learn more about its behavior from the [original implementation](https://docs.rs/ammonia/latest/ammonia/fn.clean.html).

```surql title="API DEFINITION"
string::html::sanitize(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::html::sanitize("<h1>Safe Title</h1><script>alert('XSS')</script><p>Safe paragraph. Not safe <span onload='logout()'>event</span>.</p>");

['<h1>Safe Title</h1><p>Safe paragraph. Not safe <span>event</span>.</p>']
```
<br />

## `string::is::alphanum`

The `string::is::alphanum` function checks whether a value has only alphanumeric characters.

```surql title="API DEFINITION"
string::is::alphanum(string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::alphanum("ABC123");

true
```

<br />

## `string::is::alpha`

The `string::is::alpha` function checks whether a value has only alpha characters.

```surql title="API DEFINITION"
string::is::alpha(string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::alpha("ABCDEF");

true
```

<br />

## `string::is::ascii`

The `string::is::ascii` function checks whether a value has only ascii characters.

```surql title="API DEFINITION"
string::is::ascii(string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::ascii("ABC123");

true
```

<br />

## `string::is::datetime`

The `string::is::datetime` function checks whether a string representation of a date and time matches a specified format.

```surql title="API DEFINITION"
string::is::datetime(string, string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::datetime("2015-09-05 23:56:04", "%Y-%m-%d %H:%M:%S");
```

```surql title="Response"
true
```

This can be useful when validating datetimes obtained from other sources that do not use the ISO 8601 format.

```surql
RETURN string::is::datetime("5sep2024pm012345.6789", "%d%b%Y%p%I%M%S%.f");
```

```surql title="Response"
true
```

```surql
RETURN string::is::datetime("23:56:00 2015-09-05", "%Y-%m-%d %H:%M");
```

```surql title="Response"
false
```

[View all format options](/docs/surrealql/datamodel/formatters)

<br />

## `string::is::domain`

The `string::is::domain` function checks whether a value is a domain.

```surql title="API DEFINITION"
string::is::domain(string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::domain("surrealdb.com");

true
```

<br />

## `string::is::email`

The `string::is::email` function checks whether a value is an email.

```surql title="API DEFINITION"
string::is::email(string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::email("info@surrealdb.com");

true
```

<br />

## `string::is::hexadecimal`

The `string::is::hexadecimal` function checks whether a value is hexadecimal.

```surql title="API DEFINITION"
string::is::hexadecimal(string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::hexadecimal("ff009e");

true
```

<br />

## `string::is::ip`

<Since v="v2.0.0" />

The `string::is::ip` function checks whether a value is an IP address.

```surql title="API DEFINITION"
string::is::ip(string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::ip("192.168.0.1");

true
```

<br />

## `string::is::ipv4`

<Since v="v2.0.0" />

The `string::is::ipv4` function checks whether a value is an IP v4 address.

```surql title="API DEFINITION"
string::is::ipv4(string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::ipv4("192.168.0.1");

true
```

<br />

## `string::is::ipv6`

<Since v="v2.0.0" />

The `string::is::ipv6` function checks whether a value is an IP v6 address.

```surql title="API DEFINITION"
string::is::ipv6(string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::ipv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334");

true
```

<br />

## `string::is::latitude`

The `string::is::latitude` function checks whether a value is a latitude value.

```surql title="API DEFINITION"
string::is::latitude(string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::latitude("-0.118092");

true
```

<br />

## `string::is::longitude`

The `string::is::longitude` function checks whether a value is a longitude value.

```surql title="API DEFINITION"
string::is::longitude(string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::longitude("51.509865");

true
```

<br />

## `string::is::numeric`

The `string::is::numeric`function checks whether a value has only numeric characters.

```surql title="API DEFINITION"
string::is::numeric(string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::numeric("1484091748");

true
```

<br />

## `string::is::semver`

The `string::is::semver` function checks whether a value matches a semver version.

```surql title="API DEFINITION"
string::is::semver(string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::semver("1.0.0");

true
```

<br />

## `string::is::ulid`

The `string::is::ulid` function checks whether a string is a ULID.

```surql title="API DEFINITION"
string::is::ulid(string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::ulid("01JCJB3TPQ50XTG32WM088NKJD");

true
```

<br />

## `string::is::url`

The `string::is::url` function checks whether a value is a valid URL.

```surql title="API DEFINITION"
string::is::url(string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::url("https://surrealdb.com");

true
```

<br />

## `string::is::record`

The `string::is::record` function checks whether a string is a Record ID.

```surql title="API DEFINITION"
string::is::record(string, option<string | table>) -> bool
```
> [!NOTE]
> The second argument is optional and can be used to specify the table name that the record ID should belong to. If the table name is provided, the function will check if the record ID belongs to that table only.

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::record("person:test");           -- true
RETURN string::is::record("person:test", "person"); -- true
RETURN string::is::record("person:test", "other");  -- false
RETURN string::is::record("not a record id");       -- false
```

<br />

## `string::is::uuid`

The `string::is::uuid` function checks whether a string is a UUID.

```surql title="API DEFINITION"
string::is::uuid(string) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::is::uuid("018a6680-bef9-701b-9025-e1754f296a0f");

true
```

<br />

## `string::semver::compare`
<Since v="v1.2.0" />

The `string::semver::compare` function performs a comparison on two semver strings and returns a number.
A value of `-1` indicates the first version is lower than the second, `0` indicates both versions are
equal, and `1` indicates the first version is higher than the second.

```surql title="API DEFINITION"
string::semver::compare(string, string) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::semver::compare("1.0.0", "1.3.5");

-1
```

<br />

## `string::semver::major`

<Since v="v1.2.0" />

The `string::semver::major` function extracts the major number out of a semver string.

```surql title="API DEFINITION"
string::semver::major(string) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::semver::major("3.2.6");

3
```

<br />

## `string::semver::minor`

<Since v="v1.2.0" />

The `string::semver::minor` function extracts the minor number out of a semver string.

```surql title="API DEFINITION"
string::semver::minor(string) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::semver::minor("3.2.6");

2
```

<br />

## `string::semver::patch`

<Since v="v1.2.0" />

The `string::semver::patch` function extracts the patch number out of a semver string.

```surql title="API DEFINITION"
string::semver::patch(string) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::semver::patch("3.2.6");

6
```

<br />

## `string::semver::inc::major`

<Since v="v1.2.0" />

The `string::semver::inc::major` function increments the major number of a semver string. As a result, the minor and patch numbers are reset to zero.

```surql title="API DEFINITION"
string::semver::inc::major(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::semver::inc::major("1.2.3");

"2.0.0"
```

<br />

## `string::semver::inc::minor`

<Since v="v1.2.0" />

The `string::semver::inc::minor` function increments the minor number of a semver string. As a result, the patch number is reset to zero.

```surql title="API DEFINITION"
string::semver::inc::minor(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::semver::inc::minor("1.2.3");

"1.3.0"
```

<br />

## `string::semver::inc::patch`

<Since v="v1.2.0" />

The `string::semver::inc::patch` function increments the patch number of a semver string.

```surql title="API DEFINITION"
string::semver::inc::patch(string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::semver::inc::patch("1.2.3");

"1.2.4"
```

<br />

## `string::semver::set::major`

<Since v="v1.2.0" />

The `string::semver::set::major` function sets the major number of a semver string without changing the minor and patch numbers.

```surql title="API DEFINITION"
string::semver::set::major(string, number) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::semver::set::major("1.2.3", 9);

"9.2.3"
```

<br />

## `string::semver::set::minor`

<Since v="v1.2.0" />

The `string::semver::set::minor` function sets the minor number of a semver string without changing the major and patch numbers.

```surql title="API DEFINITION"
string::semver::set::minor(string, number) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::semver::set::minor("1.2.3", 9);

"1.9.3"
```

<br />

## `string::semver::set::patch`
<Since v="v1.2.0" />

The `string::semver::set::patch` function sets the patch number of a semver string without changing the major and minor numbers.

```surql title="API DEFINITION"
string::semver::set::patch(string, number) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN string::semver::set::patch("1.2.3", 9);

"1.2.9"
```

<br />

## `string::similarity::fuzzy`

```surql title="API DEFINITION"
string::similarity::fuzzy(string, string) -> int
```

While [the ~ operator](/docs/surrealql/operators#match) is a quick go-to to see if two strings are a fuzzy match, it returns a boolean that does not indicate relative similarity.

```surql
RETURN "SurrealDB" ~ "db";
-- true
RETURN "SurrealDB" ~ "surrealdb"
-- true
```

The `string::similarity::fuzzy` function allows a comparison of similarity to be made. Any value that is greater than 0 is considered a fuzzy match.

```surql
-- returns 51
RETURN string::similarity::fuzzy("DB", "DB");
-- returns 47
RETURN string::similarity::fuzzy("DB", "db");
```

The similarity score is not based on a single score such as 1 to 100, but is built up over the course of the algorithm used to compare one string to another and will be higher for longer strings. As a result, similarity can only be compared from a single string to a number of possible matches, but not multiple strings to a number of possible matches.

While the first two uses of the function in the following example compare identical strings, the longer string returns a much higher fuzzy score.

```surql
-- returns 51
RETURN string::similarity::fuzzy("DB", "DB");
-- returns 2997
RETURN string::similarity::fuzzy(
  "Surreal Cloud Beta is now live! We are excited to announce that we are inviting users from the waitlist to join. Stay tuned for your invitation!", "Surreal Cloud Beta is now live! We are excited to announce that we are inviting users from the waitlist to join. Stay tuned for your invitation!"
);
-- returns 151 despite nowhere close to exact match
RETURN string::similarity::fuzzy(
  "Surreal Cloud Beta is now live! We are excited to announce that we are inviting users from the waitlist to join. Stay tuned for your invitation!", "Surreal"
);
```

A longer example showing a comparison of similarity scores to one another:

```surql
LET $original = "SurrealDB";
LET $strings = ["SurralDB", "surrealdb", "DB", "Surreal", "real", "basebase", "eel", "eal"];

FOR $string IN $strings {
    LET $score = string::similarity::fuzzy($original, $string);
    IF $score > 0 {
        CREATE comparison SET of = $original + '\t' + $string,
        score = $score
    };
};

SELECT of, score FROM comparison ORDER BY score DESC;
```

```surql title="Response"
[
	{
		of: 'SurrealDB	surrealdb',
		score: 187
	},
	{
		of: 'SurrealDB	SurralDB',
		score: 165
	},
	{
		of: 'SurrealDB	Surreal',
		score: 151
	},
	{
		of: 'SurrealDB	real',
		score: 75
	},
	{
		of: 'SurrealDB	eal',
		score: 55
	},
	{
		of: 'SurrealDB	DB',
		score: 41
	}
]
```

## `string::similarity::jaro`

<Since v="v2.1.0" />

The `string::similarity::jaro` function returns the Jaro similarity between two strings. Two strings that are identical have a score of 1, while less similar strings will have lower scores as the distance between them increases.

```surql title="API DEFINITION"
string::similarity::jaro(string, string) -> float
```

The following examples shows this function, and its output in comparison with a number of strings.

```surql
LET $first     = "In a hole in the ground there lived a hobbit";
LET $same      = "In a hole in the ground there lived a hobbit";
LET $close     = "In a hole in the GROUND there lived a Hobbit";
LET $different = "A narrow passage holds four hidden treasures";
LET $short     = "Hi I'm Brian";

-- Returns 1
string::similarity::jaro($first, $same);
-- Returns 0.8218673218673219f
string::similarity::jaro($first, $close);
-- Returns 0.6266233766233765f
string::similarity::jaro($first, $different);
-- Returns 0.4379509379509379f
string::similarity::jaro($first, $short);
```

## `string::similarity::jaro_winkler`

<Since v="v2.1.0" />

The `string::similarity::jaro_winkler` function returns the Jaro-Winkler similarity between two strings. Two strings that are identical have a score of 1, while less similar strings will have lower scores as the distance between them increases.

```surql title="API DEFINITION"
string::similarity::jaro_winkler(string, string) -> float
```

The following examples shows this function, and its output in comparison with a number of strings.

```surql
LET $first     = "In a hole in the ground there lived a hobbit";
LET $same      = "In a hole in the ground there lived a hobbit";
LET $close     = "In a hole in the GROUND there lived a Hobbit";
LET $different = "A narrow passage holds four hidden treasures";
LET $short     = "Hi I'm Brian";

-- Returns 0
string::similarity::jaro_winkler($first, $same);
-- Returns 0.8931203931203932f
string::similarity::jaro_winkler($first, $close);
-- Returns 0.6266233766233765f
string::similarity::jaro_winkler($first, $different);
-- Returns 0.4379509379509379f
string::similarity::jaro_winkler($first, $short);
```

## Method chaining

<Since v="v2.0.0" />

Method chaining allows functions to be called using the `.` dot operator on a value of a certain type instead of the full path of the function followed by the value.

```surql
-- Traditional syntax
string::is::alphanum("MyStrongPassword123");

-- Method chaining syntax
"MyStrongPassword123".is_alphanum();
```

```surql title="Response"
true
```

This is particularly useful for readability when a function is called multiple times.

```surql
-- Traditional syntax
string::concat(
  string::uppercase(
    string::replace(
      string::replace("I'll send you a check for the catalog", "ck", "que")
    , "og", "ogue")
  )
, "!!!!");

-- Method chaining syntax
"I'll send you a check for the catalog"
  .replace("ck", "que")
  .replace("og", "ogue")
  .uppercase()
  .concat("!!!!");
```

```surql title="Response"
'I'LL SEND YOU A CHEQUE FOR THE CATALOGUE!!!!'
```

---
sidebar_position: 24
sidebar_label: Time functions
title: Time functions | SurrealQL
description: These functions can be used when working with and manipulating datetime values.
---
import Since from '@components/shared/Since.astro'

# Time Functions

These functions can be used when working with and manipulating [datetime](/docs/surrealql/datamodel/datetimes) values.

Many time functions take an `option<datetime>` in order to return certain values from a datetime such as its hours, minutes, day of the year, and so in. If no argument is present, the current datetime will be extracted and used. As such, all of the following function calls are valid and will not return an error.

```surql
time::hour(d'2024-09-04T00:32:44.107Z');
time::hour();

time::minute(d'2024-09-04T00:32:44.107Z');
time::minute();

time::yday(d'2024-09-04T00:32:44.107Z');
time::yday();
```

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#timeceil"><code>time::ceil()</code></a></td>
      <td scope="row" data-label="Description">Rounds a datetime up to the next largest duration</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timeday"><code>time::day()</code></a></td>
      <td scope="row" data-label="Description">Extracts the day as a number from a datetime or current datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timefloor"><code>time::floor()</code></a></td>
      <td scope="row" data-label="Description">Rounds a datetime down by a specific duration</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timeformat"><code>time::format()</code></a></td>
      <td scope="row" data-label="Description">Outputs a datetime according to a specific format</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timegroup"><code>time::group()</code></a></td>
      <td scope="row" data-label="Description">Groups a datetime by a particular time interval</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timehour"><code>time::hour()</code></a></td>
      <td scope="row" data-label="Description">Extracts the hour as a number from a datetime or current datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timemax"><code>time::max()</code></a></td>
      <td scope="row" data-label="Description">Returns the greatest datetime from an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timemaximum"><code>time::maximum</code></a></td>
      <td scope="row" data-label="Description">Constant representing the greatest possible datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timemicros"><code>time::micros()</code></a></td>
      <td scope="row" data-label="Description">Extracts the microseconds as a number from a datetime or current datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timemillis"><code>time::millis()</code></a></td>
      <td scope="row" data-label="Description">Extracts the milliseconds as a number from a datetime or current datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timemin"><code>time::min()</code></a></td>
      <td scope="row" data-label="Description">Returns the least datetime from an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timeminimum"><code>time::minimum</code></a></td>
      <td scope="row" data-label="Description">Constant representing the least possible datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timeminute"><code>time::minute()</code></a></td>
      <td scope="row" data-label="Description">Extracts the minutes as a number from a datetime or current datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timemonth"><code>time::month()</code></a></td>
      <td scope="row" data-label="Description">Extracts the month as a number from a datetime or current datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timenano"><code>time::nano()</code></a></td>
      <td scope="row" data-label="Description">Returns the number of nanoseconds since the UNIX epoch until a datetime or current datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timenow"><code>time::now()</code></a></td>
      <td scope="row" data-label="Description">Returns the current datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timeround"><code>time::round()</code></a></td>
      <td scope="row" data-label="Description">Rounds a datetime to the nearest multiple of a specific duration</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timesecond"><code>time::second()</code></a></td>
      <td scope="row" data-label="Description">Extracts the second as a number from a datetime or current datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timetimezone"><code>time::timezone()</code></a></td>
      <td scope="row" data-label="Description">Returns the current local timezone offset in hours</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timeunix"><code>time::unix()</code></a></td>
      <td scope="row" data-label="Description">Returns the number of seconds since the UNIX epoch</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timewday"><code>time::wday()</code></a></td>
      <td scope="row" data-label="Description">Extracts the week day as a number from a datetime or current datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timeweek"><code>time::week()</code></a></td>
      <td scope="row" data-label="Description">Extracts the week as a number from a datetime or current datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timeyday"><code>time::yday()</code></a></td>
      <td scope="row" data-label="Description">Extracts the yday as a number from a datetime or current datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timeyear"><code>time::year()</code></a></td>
      <td scope="row" data-label="Description">Extracts the year as a number from a datetime or current datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timeisleap_year"><code>time::is::leap_year()</code></a></td>
      <td scope="row" data-label="Description">Checks if given datetime is a leap year</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timefrommicros"><code>time::from::micros()</code></a></td>
      <td scope="row" data-label="Description">Calculates a datetime based on the microseconds since January 1, 1970 0:00:00 UTC.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timefrommillis"><code>time::from::millis()</code></a></td>
      <td scope="row" data-label="Description">Calculates a datetime based on the milliseconds since January 1, 1970 0:00:00 UTC.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timefromnanos"><code>time::from::nanos()</code></a></td>
      <td scope="row" data-label="Description">Calculates a datetime based on the nanoseconds since January 1, 1970 0:00:00 UTC.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timefromsecs"><code>time::from::secs()</code></a></td>
      <td scope="row" data-label="Description">Calculates a datetime based on the seconds since January 1, 1970 0:00:00 UTC.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timefromunix"><code>time::from::unix()</code></a></td>
      <td scope="row" data-label="Description">Calculates a datetime based on the seconds since January 1, 1970 0:00:00 UTC.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timefromulid"><code>time::from::ulid()</code></a></td>
      <td scope="row" data-label="Description">Calculates a datetime based on the ULID.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#timefromuuid"><code>time::from::uuid()</code></a></td>
      <td scope="row" data-label="Description">Calculates a datetime based on the UUID.</td>
    </tr>
  </tbody>
</table>

## `time::ceil`

The `time::ceil` function rounds a datetime up to the next largest duration.

```surql title="API DEFINITION"
time::ceil(datetime, duration) -> datetime
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
LET $now = d'2024-08-30T02:22:50.231631Z';

RETURN [
  time::ceil($now, 1h),
  time::ceil($now, 1w)
];
```

```surql title="Output"
[
	d'2024-08-30T03:00:00Z',
	d'2024-09-05T00:00:00Z'
]
```

## `time::day`

The `time::day` function extracts the day as a number from a datetime, or from the current date if no datetime argument is present.

```surql title="API DEFINITION"
time::day(option<datetime>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::day(d"2021-11-01T08:30:17+00:00");

1
```

<br />

## `time::floor`

The `time::floor` function rounds a datetime down by a specific duration.

```surql title="API DEFINITION"
time::floor(datetime, duration) -> datetime
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::floor(d"2021-11-01T08:30:17+00:00", 1w);

d"2021-10-28T00:00:00Z"
```

<br />

## `time::format`

The `time::format` function outputs a datetime as a string according to a specific format.

```surql title="API DEFINITION"
time::format(datetime, string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::format(d"2021-11-01T08:30:17+00:00", "%Y-%m-%d");
```

```surql output="Response"
d"2021-11-01"
```

[View all format options](/docs/surrealql/datamodel/formatters)

<br />

## `time::group`

The `time::group` function reduces and rounds a datetime down to a particular time interval. The second argument must be a string, and can be one of the following values: `year`, `month`, `day`, `hour`, `minute`, `second`.

```surql title="API DEFINITION"
time::group(datetime, string) -> datetime
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::group(d"2021-11-01T08:30:17+00:00", "year");

d"2021-01-01T00:00:00Z"
```

<br />

## `time::hour`

The `time::hour` function extracts the hour as a number from a datetime, or from the current date if no datetime argument is present.

```surql title="API DEFINITION"
time::hour(option<datetime>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::hour(d"2021-11-01T08:30:17+00:00");

8
```

<br />

## `time::max`

The `time::max` function returns the greatest datetime from an array of datetimes.

```surql title="API DEFINITION"
time::max(array<datetime>) -> datetime
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::max([ d"1987-06-22T08:30:45Z", d"1988-06-22T08:30:45Z" ])

d"1988-06-22T08:30:45Z"
```

See also:

* [`array::max`](/docs/surrealql/functions/database/array#arraymax), which extracts the greatest value from an array of values
* [`math::max`](/docs/surrealql/functions/database/math#mathmax), which extracts the greatest number from an array of numbers

<br />

## `time::maximum`

<Since v="v2.3.0" />

The `time::max` constant returns the greatest possible datetime that can be used.

```surql title="API DEFINITION"
time::maximum -> datetime
```

Some examples of the constant in use:

```surql
time::maximum;

time::maximum + 1ns;

time::now() IN time::minimum..time::maximum;
```

```surql title="Output"
-------- Query 1 --------

d'+262142-12-31T23:59:59.999Z'

-------- Query 2 --------

"Failed to compute: \"1ns + d'+262142-12-31T23:59:59.999999999Z'\", as the operation results in an arithmetic overflow."

-------- Query 3 --------

true
```

<br />

## `time::micros`

<Since v="v1.1.0" />

The `time::micros` function extracts the microseconds as a number from a datetime, or from the current date if no datetime argument is present.

```surql title="API DEFINITION"
time::micros(option<datetime>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::micros(d"1987-06-22T08:30:45Z");

551349045000000
```

<br />

## `time::millis`

<Since v="v1.1.0" />

The `time::millis` function extracts the milliseconds as a number from a datetime, or from the current date if no datetime argument is present.

```surql title="API DEFINITION"
time::millis(option<datetime>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::millis(d"1987-06-22T08:30:45Z");

551349045000
```

<br />

## `time::min`

The `time::min` function returns the least datetime from an array of datetimes.

```surql title="API DEFINITION"
time::min(array<datetime>) -> datetime
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::min([ d"1987-06-22T08:30:45Z", d"1988-06-22T08:30:45Z" ])

d"1987-06-22T08:30:45Z"
```

See also:

* [`array::min`](/docs/surrealql/functions/database/array#arraymin), which extracts the least value from an array of values
* [`math::min`](/docs/surrealql/functions/database/math#mathmin), which extracts the least number from an array of numbers

<br />

## `time::minimum`

<Since v="v2.3.0" />

The `time::minimum` constant returns the least possible datetime that can be used.

```surql title="API DEFINITION"
time::minimum -> datetime
```

Some examples of the constant in use:

```surql
time::minimum;

time::now() IN time::minimum..time::maximum;
```

```surql title="Output"
-------- Query 1 --------

d'-262143-01-01T00:00:00Z'

-------- Query 2 --------

true
```

<br />

## `time::minute`

The `time::minute` function extracts the minutes as a number from a datetime, or from the current date if no datetime argument is present.

```surql title="API DEFINITION"
time::minute(option<datetime>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::minute(d"2021-11-01T08:30:17+00:00");

30
```

<br />

## `time::month`

The `time::month` function extracts the month as a number from a datetime, or from the current date if no datetime argument is present.

```surql title="API DEFINITION"
time::month(option<datetime>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::month(d"2021-11-01T08:30:17+00:00");

11
```

<br />

## `time::nano`

The `time::nano`function returns a datetime as an integer representing the number of nanoseconds since the UNIX epoch until a datetime, or the current date if no datetime argument is present.

```surql title="API DEFINITION"
time::nano(option<datetime>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::nano(d"2021-11-01T08:30:17+00:00");

1635755417000000000
```

<br />

## `time::now`

The `time::now` function returns the current datetime as an ISO8601 timestamp.

```surql title="API DEFINITION"
time::now() -> datetime
```

<br />

## `time::round`

The `time::round` function rounds a datetime up by a specific duration.

```surql title="API DEFINITION"
time::round(datetime, duration) -> datetime
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::round(d"2021-11-01T08:30:17+00:00", 1w);

d"2021-11-04T00:00:00Z"
```

<br />

## `time::second`

The `time::second` function extracts the second as a number from a datetime, or from the current date if no datetime argument is present.

```surql title="API DEFINITION"
time::second(option<datetime>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::second(d"2021-11-01T08:30:17+00:00");

17
```

<br />

## `time::timezone`

The `time::timezone` function returns the current local timezone offset in hours.

```surql title="API DEFINITION"
time::timezone() -> string
```

<br />

## `time::unix`

The `time::unix` function returns a datetime as an integer representing the number of seconds since the UNIX epoch until a certain datetime, or from the current date if no datetime argument is present.

```surql title="API DEFINITION"
time::unix(option<datetime>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::unix(d"2021-11-01T08:30:17+00:00");

1635755417
```

<br />

## `time::wday`

The `time::wday` function extracts the week day as a number from a datetime, or from the current date if no datetime argument is present.

```surql title="API DEFINITION"
time::wday(option<datetime>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::wday(d"2021-11-01T08:30:17+00:00");

1
```

<br />

## `time::week`

The `time::week` function extracts the week as a number from a datetime, or from the current date if no datetime argument is present.

```surql title="API DEFINITION"
time::week(option<datetime>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::week(d"2021-11-01T08:30:17+00:00");

44
```

<br />

## `time::yday`

The `time::yday` function extracts the day of the year as a number from a datetime, or from the current date if no datetime argument is present.

```surql title="API DEFINITION"
time::yday(option<datetime>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::yday(d"2021-11-01T08:30:17+00:00");

305
```

<br />

## `time::year`

The `time::year` function extracts the year as a number from a datetime, or from the current date if no datetime argument is present.

```surql title="API DEFINITION"
time::year(option<datetime>) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::year(d"2021-11-01T08:30:17+00:00");

2021
```

<br />

## `time::is::leap_year()`

The `time::is::leap_year()` function Checks if given datetime is a leap year.

```surql title="API DEFINITION"
time::is::leap_year(datetime) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
-- Checks with current datetime if none is passed
RETURN time::is::leap_year();

RETURN time::is::leap_year(d"1987-06-22T08:30:45Z");
[false]

RETURN time::is::leap_year(d"1988-06-22T08:30:45Z");
[true]

-- Using function via method chaining
RETURN d'2024-09-03T02:33:15.349397Z'.is_leap_year();
[true]
```

## `time::from::micros`

<Since v="v1.1.0" />

The `time::from::micros` function calculates a datetime based on the microseconds since January 1, 1970 0:00:00 UTC.

```surql title="API DEFINITION"
time::from::micros(number) -> datetime
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::from::micros(1000000);

d"1970-01-01T00:00:01Z"
```

<br />

## `time::from::millis`

The `time::from::millis` function calculates a datetime based on the milliseconds since January 1, 1970 0:00:00 UTC.

```surql title="API DEFINITION"
time::from::millis(number) -> datetime
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::from::millis(1000);

d"1970-01-01T00:00:01Z"
```

<br />

## `time::from::nanos`

<Since v="v1.1.0" />

The `time::from::nanos` function calculates a datetime based on the nanoseconds since January 1, 1970 0:00:00 UTC.

```surql title="API DEFINITION"
time::from::nanos(number) -> datetime
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::from::nanos(1000000);

d"1970-01-01T00:00:00.001Z'
```

<br />

## `time::from::secs`

The `time::from::secs` function calculates a datetime based on the seconds since January 1, 1970 0:00:00 UTC.

```surql title="API DEFINITION"
time::from::secs(number) -> datetime
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::from::secs(1000);

d"1970-01-01T00:16:40Z"
```

<br />

## `time::from::unix`

The `time::from::unix` function calculates a datetime based on the seconds since January 1, 1970 0:00:00 UTC.

```surql title="API DEFINITION"
time::from::unix(number) -> datetime
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::from::unix(1000);

d"1970-01-01T00:16:40Z"
```

<br />

## `time::from::ulid`

The `time::from::ulid` function calculates a datetime based on the ULID.

```surql title="API DEFINITION"
time::from::ulid(ulid) -> datetime
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::from::ulid("01JH5BBTK9FKTGSDXHWP5YP9TQ");

d'2025-01-09T10:57:03.593Z'
```

<br />

## `time::from::uuid`

The `time::from::uuid` function calculates a datetime based on the UUID.

```surql title="API DEFINITION"
time::from::uuid(uuid) -> datetime
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN time::from::uuid(u'01944ab6-c1e5-7760-ab6a-127d37eb1b94');

d'2025-01-09T10:57:58.757Z'
```

<br />


---
sidebar_position: 25
sidebar_label: Type functions
title: Type functions | SurrealQL
description: These functions can be used for generating and coercing data to specific data types.
---

import Since from '@components/shared/Since.astro'
import Tabs from "@components/Tabs/Tabs.astro";
import TabItem from "@components/Tabs/TabItem.astro";

# Type Functions

These functions can be used for generating and coercing data to specific data types. These functions are useful when accepting input values in client libraries, and ensuring that they are the desired type within SQL statements.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#typearray"><code>type::array()</code></a></td>
      <td scope="row" data-label="Description">Converts a value into an array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typebool"><code>type::bool()</code></a></td>
      <td scope="row" data-label="Description">Converts a value into a boolean</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typebytes"><code>type::bytes()</code></a></td>
      <td scope="row" data-label="Description">Converts a value into bytes</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typedatetime"><code>type::datetime()</code></a></td>
      <td scope="row" data-label="Description">Converts a value into a datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typedecimal"><code>type::decimal()</code></a></td>
      <td scope="row" data-label="Description">Converts a value into a decimal</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeduration"><code>type::duration()</code></a></td>
      <td scope="row" data-label="Description">Converts a value into a duration</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typefield"><code>type::field()</code></a></td>
      <td scope="row" data-label="Description">Projects a single field within a SELECT statement</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typefields"><code>type::fields()</code></a></td>
      <td scope="row" data-label="Description">Projects a multiple fields within a SELECT statement</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typefloat"><code>type::float()</code></a></td>
      <td scope="row" data-label="Description">Converts a value into a floating point number</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeint"><code>type::int()</code></a></td>
      <td scope="row" data-label="Description">Converts a value into an integer</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typenumber"><code>type::number()</code></a></td>
      <td scope="row" data-label="Description">Converts a value into a number</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typepoint"><code>type::point()</code></a></td>
      <td scope="row" data-label="Description">Converts a value into a geometry point</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typestring"><code>type::string()</code></a></td>
      <td scope="row" data-label="Description">Converts a value into a string</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typetable"><code>type::table()</code></a></td>
      <td scope="row" data-label="Description">Converts a value into a table</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typething"><code>type::thing()</code></a></td>
      <td scope="row" data-label="Description">Converts a value into a record pointer</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typerange"><code>type::range()</code></a></td>
      <td scope="row" data-label="Description">Converts a value into a range</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typerecord"><code>type::record()</code></a></td>
      <td scope="row" data-label="Description">Converts a value into a record</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeuuid"><code>type::uuid()</code></a></td>
      <td scope="row" data-label="Description">Converts a value into a UUID</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisarray"><code>type::is::array()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type array</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisbool"><code>type::is::bool()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type bool</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisbytes"><code>type::is::bytes()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type bytes</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeiscollection"><code>type::is::collection()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type collection</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisdatetime"><code>type::is::datetime()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type datetime</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisdecimal"><code>type::is::decimal()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type decimal</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisduration"><code>type::is::duration()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type duration</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisfloat"><code>type::is::float()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type float</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisgeometry"><code>type::is::geometry()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type geometry</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisint"><code>type::is::int()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type int</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisline"><code>type::is::line()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type line</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisnone"><code>type::is::none()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type none</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisnull"><code>type::is::null()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type null</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeismultiline"><code>type::is::multiline()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type multiline</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeismultipoint"><code>type::is::multipoint()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type multipoint</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeismultipolygon"><code>type::is::multipolygon()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type multipolygon</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisnumber"><code>type::is::number()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type number</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisobject"><code>type::is::object()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type object</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeispoint"><code>type::is::point()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type point</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeispolygon"><code>type::is::polygon()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type polygon</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeispolygon"><code>type::is::range()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type range</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisrecord"><code>type::is::record()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type record</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisstring"><code>type::is::string()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type string</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#typeisuuid"><code>type::is::uuid()</code></a></td>
      <td scope="row" data-label="Description">Checks if given value is of type uuid</td>
    </tr>
  </tbody>
</table>

## `type::array`

The `type::array` function converts a value into an array.

```surql title="API DEFINITION"
type::array(array | range) -> bool
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::array(1..=3);

[1, 2, 3]
```

This is the equivalent of using [`<array>`](/docs/surrealql/datamodel/casting#array) to cast a value to an array.

## `type::bool`

The `type::bool` function converts a value into a boolean.

```surql title="API DEFINITION"
type::bool(bool | string) -> bool
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::bool("true");

true
```

This is the equivalent of using [`<bool>`](/docs/surrealql/datamodel/casting#bool) to cast a value to a boolean.

<br />

## `type::bytes`

The `type::bytes` function converts a value into bytes.

```surql title="API DEFINITION"
type::bytes(bytes | string) -> bool
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::bytes("A few bytes");

-- b"4120666577206279746573"
```

This is the equivalent of using [`<bytes>`](/docs/surrealql/datamodel/casting) to cast a value to bytes.

<br />

## `type::datetime`

The `type::datetime` function converts a value into a datetime.

```surql title="API DEFINITION"
type::datetime(datetime | string) -> datetime
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::datetime("2022-04-27T18:12:27+00:00");

d"2022-04-27T18:12:27Z"
```

This is the equivalent of using [`<datetime>`](/docs/surrealql/datamodel/casting#datetime) to cast a value to a datetime.

<br />

## `type::decimal`

The `type::decimal` function converts a value into a decimal.

```surql title="API DEFINITION"
type::decimal(decimal | float | int | number | string) -> decimal
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::decimal("12345");

12345.00
```

This is the equivalent of using [`<decimal>`](/docs/surrealql/datamodel/casting#decimal) to cast a value to a decimal.

<br />

## `type::duration`

The `type::duration` function converts a value into a duration.

```surql title="API DEFINITION"
type::duration(duration | string) -> duration
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::duration("4h");

4h
```

This is the equivalent of using [`<duration>`](/docs/surrealql/datamodel/casting#duration) to cast a value to a duration.

<br />

## `type::field`

The `type::field` function projects a single field within a SELECT statement.

```surql title="API DEFINITION"
type::field($field)
```
The following example shows this function, and its output:

```surql
CREATE person:test SET title = 'Mr', name.first = 'Tobie', name.last = 'Morgan Hitchcock';

LET $param = 'name.first';

SELECT type::field($param), type::field('name.last') FROM person;

SELECT VALUE { 'firstname': type::field($param), lastname: type::field('name.last') } FROM person;

SELECT VALUE [type::field($param), type::field('name.last')] FROM person;


[
	{
		id: person:test,
		title: 'Mr',
		name: {
			first: 'Tobie',
			last: 'Morgan Hitchcock',
	    }
	}
]
```

<br />

## `type::fields`

The `type::fields` function projects one or more fields within a SELECT statement.

```surql title="API DEFINITION"
type::fields($fields)
```
The following example shows this function, and its output:

```surql
CREATE person:test SET title = 'Mr', name.first = 'Tobie', name.last = 'Morgan Hitchcock';

LET $param = ['name.first', 'name.last'];

SELECT type::fields($param), type::fields(['title']) FROM person;

SELECT VALUE { 'names': type::fields($param) } FROM person;

SELECT VALUE type::fields($param) FROM person;


[
	{
		id: person:test,
		title: 'Mr',
		name: {
			first: 'Tobie',
			last: 'Morgan Hitchcock',
		}
	}
]
```

<br />

## `type::file`

<Since v="v3.0.0-alpha.1" />

The `type::file` function converts two strings representing a bucket name and a key into a [file pointer](/docs/surrealql/datamodel/files).

```surql title="API DEFINITION"
type::file(bucket: string, key: string) -> file
```

An example of a file pointer created using this function:

```surql
type::file("my_bucket", "file_name")
```

```surql title="Output"
f"my_bucket:/file_name"
```

The following query shows the equivalent file pointer when created using the `f` prefix:

```surql
type::file("my_bucket", "file_name") == f"my_bucket:/file_name";

-- true
```

Once a [bucket has been defined](/docs/surrealql/statements/define/indexes), operations using one of the [file functions](/docs/surrealql/functions/database/file) can be performed on the file pointer.

```surql
DEFINE BUCKET my_bucket BACKEND "memory";

type::file("my_bucket", "file_name").put("Some data inside");
type::file("my_bucket", "file_name").get();
```

```surql title="Output"
b"536F6D65206461746120696E73696465"
```

<br />

## `type::float`

The `type::float` function converts a value into a float.

```surql title="API DEFINITION"
type::float(decimal | float | int | number | string) -> float
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::float("12345");

12345.0
```
This is the equivalent of using [`<float>`](/docs/surrealql/datamodel/casting#float) to cast a value to a float.

<br />

## `type::int`

The `type::int` function converts a value into an integer.

```surql title="API DEFINITION"
type::int(decimal | float | int | number | string) -> int
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::int("12345");

12345
```
This is the equivalent of using [`<int>`](/docs/surrealql/datamodel/casting#int) to cast a value to a int.

<br />

## `type::number`

The `type::number` function converts a value into a number.

```surql title="API DEFINITION"
type::number(decimal | float | int | number | string) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::number("12345");

12345
```
This is the equivalent of using [`<number>`](/docs/surrealql/datamodel/casting#number) to cast a value to a number.

<br />

## `type::point`

The `type::point` function converts a value into a geometry point.

```surql title="API DEFINITION"
type::point(array | point) -> point
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::point([ 51.509865, -0.118092 ]);

-- (51.509865, -0.118092)
```

<br />

## `type::range`

<Since v="v2.0.0" />

The `type::range` function converts a value into a [range](docs/surrealql/datamodel/ranges). It accepts a single argument, either a range or an array with two values. If the argument is an array, it will be converted into a range, similar to [casting](/docs/surrealql/datamodel/casting).

```surql title="API DEFINITION"
type::range(range | array) -> range<record>
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::range([1, 2]);

[1..2]

RETURN type::range(1..10)

[1..10]

RETURN type::range([1,9,4]);

['Expected a range but cannot convert [1, 9, 4] into a range']
```

<br />

## `type::record`

<Since v="v2.0.0" />

The `type::record` function converts a value into a record.

```surql title="API DEFINITION"
type::record(record | string, option<string>) -> record
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::record("cat:one");

cat:one
```

The optional second argument can be used to ensure that the output is of a certain record type.

```surql
LET $good_input = "person:one";
LET $bad_input = "purrson:one";

RETURN type::record($good_input, "person");
RETURN type::record($bad_input, "person");
```

```surql title="Output"
-------- Query 1 --------

person:one

-------- Query 2 --------

"Expected a record<person> but cannot convert 'purrson:one' into a record<person>"
```

<br />

## `type::string`

The `type::string` function converts any value except `NONE`, `NULL`, and `bytes` into a string.

```surql title="API DEFINITION"
type::string(any) -> string
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::string(12345);

"12345"
```
This is the equivalent of using [`<string>`](/docs/surrealql/datamodel/casting#string) to cast a value to a string.

<br />

## `type::string_lossy`

<Since v="v3.0.0-alpha.1" />

The `type::string_lossy` function converts any value except `NONE`, `NULL`, and `bytes` into a string. In the case of bytes, it will not return an error if the bytes are not valid UTF-8. Instead, invalid bytes will be replaced with the character `�` (`U+FFFD REPLACEMENT CHARACTER`, used in Unicode to represent a decoding error).

```surql title="API DEFINITION"
type::string(any) -> string
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
-- Contains some invalid bytes
type::string_lossy(<bytes>[83, 117, 114, 255, 114, 101, 97, 254, 108, 68, 66]);
-- valid bytes
type::string_lossy(<bytes>[ 83, 117, 114, 114, 101, 97, 108, 68, 66 ]);
```

```surql title="Output"
-------- Query --------

'Sur�rea�lDB'

-------- Query --------

'SurrealDB'
```

This is similar to using [`<string>`](/docs/surrealql/datamodel/casting#string) to cast a value to a string, except that an input of bytes will not fail.

<br />

## `type::table`

The `type::table` function converts a value into a table name.

```surql title="API DEFINITION"
type::table(record | string) -> string
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN [
  type::table("person"),
  type::table(cat:one)
];

[ person, cat ]
```

As of version 2.0, SurrealDB no longer eagerly parses strings into record IDs. As such, the output of the last item ("dog:two") in the following example will differ. In version 1.x, it will be eagerly parsed into a record ID after which the `dog` table name will be returned, while in version 2.x it will be treated as a string and converted into the table name `dog:two`.

```surql
RETURN [
  type::table(55),
  type::table(cat:one),
  type::table("dog"),
  type::table("dog:two"),
];
```

<Tabs groupId="function-output">

<TabItem value="V1" label="V1.x" >

```surql title="Output (V1.x)"
[
	`55`,
	cat,
	dog,
	dog
]
```

</TabItem>

<TabItem value="V2" label="V2.x" >

```surql title="Output (V2.x)"
[
	`55`,
	cat,
	dog,
	`dog:two`
]
```

</TabItem>
</Tabs>

<br />

## `type::thing`

The `type::thing` function converts a value into a record pointer definition.

```surql title="API DEFINITION"
type::thing(any, any) -> record
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
LET $tb = "person";
LET $id = "tobie";
RETURN type::thing($tb, $id);
```

An example of this function being used to turn an array of objects into records to be created or upserted:

```surql
FOR $data IN [
	{
		id: 9,
		name: 'Billy'
	},
	{
		id: 10,
		name: 'Bobby'
	}
] {
	UPSERT type::thing('person', $data.id) CONTENT $data;
};
```

An example of the same except in which the `num` field is to be used as the record's ID. In this case, it can be mapped with the [`array::map()`](/docs/surrealql/functions/database/array#arraymap) function to rename `num` as `id` so that the following `CONTENT` clause does not create both a `num` and an `id` with the same value.

```surql
FOR $data IN [
	{
		name: 'Billy',
		num: 9
	},
    {
		name: 'Bobby',
		num: 10
	},
].map(|$o| {
    id: $o.num,
    name: $o.name
}) {
    UPSERT type::thing('person', $data.id) CONTENT $data;
};
```

If the second argument passed into `type::thing` is a record ID, the latter part of the ID (the record identifier) will be extracted and used.

```surql
type::thing("person", person:mat);

-- person:mat
```

The output of the above function call will thus be `person:mat`, not `person:person:mat`.

## `type::uuid`

The `type::uuid` function converts a value into a UUID.

```surql title="API DEFINITION"
type::uuid(string | uuid) -> uuid
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::uuid("0191f946-936f-7223-bef5-aebbc527ad80");

u'0191f946-936f-7223-bef5-aebbc527ad80'
```
<br />

## `type::is::array`

The `type::is::array` function checks if the passed value is of type `array`.

```surql title="API DEFINITION"
type::is::array(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::array([ 'a', 'b', 'c' ]);

true
```

<br />

## `type::is::bool`

The `type::is::bool` function checks if the passed value is of type `bool`.

```surql title="API DEFINITION"
type::is::bool(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::bool(true);

true
```

<br />

## `type::is::bytes`

The `type::is::bytes` function checks if the passed value is of type `bytes`.

```surql title="API DEFINITION"
type::is::bytes(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::bytes("I am not bytes");

false
```

<br />

## `type::is::collection`

The `type::is::collection` function checks if the passed value is of type `collection`.

```surql title="API DEFINITION"
type::is::collection(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::collection("I am not a collection");

false
```

<br />

## `type::is::datetime`

The `type::is::datetime` function checks if the passed value is of type `datetime`.

```surql title="API DEFINITION"
type::is::datetime(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::datetime(time::now());

true
```

<br />

## `type::is::decimal`

The `type::is::decimal` function checks if the passed value is of type `decimal`.

```surql title="API DEFINITION"
type::is::decimal(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::decimal(<decimal> 13.5719384719384719385639856394139476937756394756);

true
```

<br />

## `type::is::duration`

The `type::is::duration` function checks if the passed value is of type `duration`.

```surql title="API DEFINITION"
type::is::duration(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::duration('1970-01-01T00:00:00');

false
```

<br />

## `type::is::float`

The `type::is::float` function checks if the passed value is of type ` float`.

```surql title="API DEFINITION"
type::is::float(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::float(<float> 41.5);

true
```

<br />

## `type::is::geometry`

The `type::is::geometry` function checks if the passed value is of type `geometry`.

```surql title="API DEFINITION"
type::is::geometry(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::geometry((-0.118092, 51.509865));

true
```

<br />

## `type::is::int`

The `type::is::int` function checks if the passed value is of type `int`.

```surql title="API DEFINITION"
type::is::int(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::int(<int> 123);

true
```

<br />

## `type::is::line`

The `type::is::line` function checks if the passed value is of type `line`.

```surql title="API DEFINITION"
type::is::line(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::line("I am not a line");

false
```

<br />

## `type::is::none`

<Since v="v1.1.0" />

The `type::is::none` function checks if the passed value is of type `none`.

```surql title="API DEFINITION"
type::is::none(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::none(NONE);

true
```

<br />

## `type::is::null`

The `type::is::null` function checks if the passed value is of type `null`.

```surql title="API DEFINITION"
type::is::null(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::null(NULL);

true
```

<br />

## `type::is::multiline`

The `type::is::multiline` function checks if the passed value is of type `multiline`.

```surql title="API DEFINITION"
type::is::multiline(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::multiline("I am not a multiline");

false
```

<br />

## `type::is::multipoint`

The `type::is::multipoint` function checks if the passed value is of type `multipoint`.

```surql title="API DEFINITION"
type::is::multipoint(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::multipoint("I am not a multipoint");

false
```

<br />

## `type::is::multipolygon`

The `type::is::multipolygon` function checks if the passed value is of type `multipolygon`.

```surql title="API DEFINITION"
type::is::multipolygon(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::multipolygon("I am not a multipolygon");

false
```

<br />

## `type::is::number`

The `type::is::number` function checks if the passed value is of type `number`.

```surql title="API DEFINITION"
type::is::number(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::number(123);

true
```

<br />

## `type::is::object`

The `type::is::object` function checks if the passed value is of type `object`.

```surql title="API DEFINITION"
type::is::object(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::object({ hello: 'world' });

true
```

<br />

## `type::is::point`

The `type::is::point` function checks if the passed value is of type `point`.

```surql title="API DEFINITION"
type::is::point(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::point((-0.118092, 51.509865));

true
```

<br />

## `type::is::polygon`

The `type::is::polygon` function checks if the passed value is of type `polygon`.

```surql title="API DEFINITION"
type::is::polygon(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::polygon("I am not a polygon");

false
```
## `type::is::range`

The `type::is::range` function checks if the passed value is of type `range`.

```surql title="API DEFINITION"
type::is::range(any) -> bool
```

```surql
type::is::range(0..1);
true
// method syntax
(0..1).is_range();

true
```

## `type::is::record`

The `type::is::record` function checks if the passed value is of type `record`.

```surql title="API DEFINITION"
type::is::record(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::record(user:tobie);

true
```


### Validate a table

<Since v="v1.1.0" />

```surql title="Check if user:tobie is a record on the test table"
RETURN type::is::record(user:tobie, 'test');

false
```

<br />

## `type::is::string`

The `type::is::string` function checks if the passed value is of type `string`.

```surql title="API DEFINITION"
type::is::string(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::string("abc");

true
```

<br />

## `type::is::uuid`

The `type::is::uuid` function checks if the passed value is of type `uuid`.

```surql title="API DEFINITION"
type::is::uuid(any) -> bool
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN type::is::uuid(u"018a6680-bef9-701b-9025-e1754f296a0f");

true
```

<br /><br />

## Method chaining

<Since v="v2.0.0" />

Method chaining allows functions to be called using the `.` dot operator on a value of a certain type instead of the full path of the function followed by the value.

```surql
-- Traditional syntax
type::is::record(r"person:aeon", "cat")

-- Method chaining syntax
r"person:aeon".is_record("cat");
```

```surql title="Response"
false
```


---
sidebar_position: 26
sidebar_label: Value functions
title: Value functions | SurrealQL
description: This module contains several miscellaneous functions that can be used with values of any type.
---

import Since from '@components/shared/Since.astro'

# Value functions

This module contains several miscellaneous functions that can be used with values of any type.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#chain"><code>.chain()</code></a></td>
      <td scope="row" data-label="Description">Allows an anonymous function to be called on a value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#valuediff"><code>value::diff()</code></a></td>
      <td scope="row" data-label="Description">Returns the operation required for one value to equal another</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#valuepatch"><code>value::patch()</code></a></td>
      <td scope="row" data-label="Description">Applies JSON Patch operations to a value</td>
    </tr>
  </tbody>
</table>

## `.chain()`

<Since v="v2.0.0" />

The `.chain()` method takes the output of an expression upon which the user can call an [anonymous function](/docs/surrealql/datamodel/closures) (closure).

```surql title="API DEFINITION"
value.chain(|$val_name| @closure_body) -> value;
```

Any value can be followed with the `.chain()` syntax, after which an anonymous function (closure) can be written to perform an operation on it.

```surql
'SurrealDB'.chain(|$n| $n + ' 2.0');
-- 'SurrealDB 2.0'
```

The function is only called using the `.` operator (method syntax) and, as the name implies, works well within a chain of methods.

```surql
{ company: 'SurrealDB', latest_version: '2.0' }
    .chain(|$name| <string>$name)
    .replace('SurrealDB', 'SURREALDB!!!!!');
```

```surql title="Response"
"{ company: 'SURREALDB!!!!!', latest_version: '2.0' }"
```

For a similar function that allows using a closure on each item in an array instead of a value as a whole, see [array::map](/docs/surrealql/functions/database/array#arraymap).

## `value::diff`

<Since v="v2.0.0" />

The `value::diff` function returns an object that shows the [JSON Patch](https://jsonpatch.com/) operation(s) required for the first value to equal the second one.

```surql title="API DEFINITION"
value::diff(value, value) -> array<object>
```

The following is an example of the `value::diff` function used to display the changes required to change one string into another. Note that the JSON Patch spec requires an array of objects, and thus an array will be returned even if only one patch is needed between two values.

```surql
RETURN 'tobie'.diff('tobias');
```

```surql title="Output"
[
	{
		op: 'change',
		path: '/',
		value: '@@ -1,5 +1,6 @@
 tobi
-e
+as
'
	}
]
```

An example of the output when the diff output includes more than one operation:

```surql
{ company: 'SurrealDB' }.diff({ company: 'SurrealDB!!', latest_version: '2.0', location: city:london });
```

```surql title="Response"
[
	{
		op: 'change',
		path: '/company',
		value: '@@ -2,8 +2,10 @@
 urrealDB
+!!
'
	},
	{
		op: 'add',
		path: '/latest_version',
		value: '2.0'
	},
	{
		op: 'add',
		path: '/location',
		value: city:london
	}
]
```

## `value::patch`

<Since v="v2.0.0" />

The `value::patch` function applies an array of JSON Patch operations to a value.

```surql title="API DEFINITION"
value::patch(value, patch: array<object>) -> value
```

```surql
LET $company = {
    company: 'SurrealDB',
    latest_version: '1.5.4'
};

$company.patch([{
		'op': 'replace',
		'path': 'latest_version',
		'value': '2.0'
}]);
```

```surql title="Response"
{
	company: 'SurrealDB',
	version: '2.0'
}
```


---
sidebar_position: 27
sidebar_label: Vector functions
title: Vector functions | SurrealQL
description: A collection of essential vector operations that provide foundational functionality for numerical computation, machine learning, and data analysis.
---
import Since from '@components/shared/Since.astro'

# Vector functions

A collection of essential vector operations that provide foundational functionality for numerical computation, machine learning, and data analysis. These operations include distance measurements, similarity coefficients, and other basic and complex operations related to vectors. Through understanding and implementing these functions, we can perform a wide variety of tasks ranging from data processing to advanced statistical analyses.

<table>
  <thead>
    <tr>
      <th scope="col">Function</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectoradd"><code>vector::add()</code></a></td>
      <td scope="row" data-label="Description">Performs element-wise addition of two vectors</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectorangle"><code>vector::angle()</code></a></td>
      <td scope="row" data-label="Description">Computes the angle between two vectors</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectorcross"><code>vector::cross()</code></a></td>
      <td scope="row" data-label="Description">Computes the cross product of two vectors</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectordivide"><code>vector::divide()</code></a></td>
      <td scope="row" data-label="Description">Performs element-wise division between two vectors</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectordot"><code>vector::dot()</code></a></td>
      <td scope="row" data-label="Description">Computes the dot product of two vectors</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectormagnitude"><code>vector::magnitude()</code></a></td>
      <td scope="row" data-label="Description">Computes the magnitude (or length) of a vector</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectormultiply"><code>vector::multiply()</code></a></td>
      <td scope="row" data-label="Description">Performs element-wise multiplication of two vectors</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectornormalize"><code>vector::normalize()</code></a></td>
      <td scope="row" data-label="Description">Computes the normalization of a vector</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectorproject"><code>vector::project()</code></a></td>
      <td scope="row" data-label="Description">Computes the projection of one vector onto another</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectorscale"><code>vector::scale()</code></a></td>
      <td scope="row" data-label="Description">Multiplies each item in a vector</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectorsubtract"><code>vector::subtract()</code></a></td>
      <td scope="row" data-label="Description">Performs element-wise subtraction between two vectors</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectordistancechebyshev"><code>vector::distance::chebyshev()</code></a></td>
      <td scope="row" data-label="Description">Computes the Chebyshev distance</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectordistanceeuclidean"><code>vector::distance::euclidean()</code></a></td>
      <td scope="row" data-label="Description">Computes the Euclidean distance between two vectors</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectordistancehamming"><code>vector::distance::hamming()</code></a></td>
      <td scope="row" data-label="Description">Computes the Hamming distance between two vectors</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectordistanceknn"><code>vector::distance::knn()</code></a></td>
      <td scope="row" data-label="Description">Returns the distance computed during the query</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectordistancemanhattan"><code>vector::distance::manhattan()</code></a></td>
      <td scope="row" data-label="Description">Computes the Manhattan distance between two vectors</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectordistanceminkowski"><code>vector::distance::minkowski()</code></a></td>
      <td scope="row" data-label="Description">Computes the Minkowski distance between two vectors</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectorsimilaritycosine"><code>vector::similarity::cosine()</code></a></td>
      <td scope="row" data-label="Description">Computes the Cosine similarity between two vectors</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectorsimilarityjaccard"><code>vector::similarity::jaccard()</code></a></td>
      <td scope="row" data-label="Description">Computes the Jaccard similarity between two vectors</td>
    </tr>
    <tr>
      <td scope="row" data-label="Function"><a href="#vectorsimilaritypearson"><code>vector::similarity::pearson()</code></a></td>
      <td scope="row" data-label="Description">Computes the Pearson correlation coefficient between two vectors</td>
    </tr>
  </tbody>
</table>

## `vector::add`

The `vector::add` function performs element-wise addition of two vectors, where each element in the first vector is added to the corresponding element in the second vector.

```surql title="API DEFINITION"
vector::add(array, array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::add([1, 2, 3], [1, 2, 3]);

[2, 4, 6]
```

<br />

## `vector::angle`

The `vector::angle` function computes the angle between two vectors, providing a measure of the orientation difference between them.

```surql title="API DEFINITION"
vector::angle(array, array) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::angle([5, 10, 15], [10, 5, 20]);

0.36774908225917935f
```

<br />

## `vector::cross`

The `vector::cross` function computes the cross product of two vectors, which results in a vector that is orthogonal (perpendicular) to the plane containing the original vectors.

```surql title="API DEFINITION"
vector::cross(array, array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::cross([1, 2, 3], [4, 5, 6]);

[-3, 6, -3]
```

<br />

## `vector::divide`

The `vector::divide` function performs element-wise division between two vectors, where each element in the first vector is divided by the corresponding element in the second vector.

```surql title="API DEFINITION"
vector::divide(array, array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::divide([10, -20, 30, 0], [0, -1, 2, -3]);

[NaN, 20, 15, 0]
```

<br />

## `vector::dot`

The `vector::dot` function computes the dot product of two vectors, which is the sum of the products of the corresponding entries of the two sequences of numbers.

```surql title="API DEFINITION"
vector::dot(array, array) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::dot([1, 2, 3], [1, 2, 3]);

14
```

<br />

## `vector::magnitude`

The `vector::magnitude` function computes the magnitude (or length) of a vector, providing a measure of the size of the vector in multi-dimensional space.

```surql title="API DEFINITION"
vector::magnitude(array) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::magnitude([ 1, 2, 3, 3, 3, 4, 5 ]);

8.54400374531753f
```

<br />

## `vector::multiply`

The `vector::multiply` function performs element-wise multiplication of two vectors, where each element in the first vector is multiplied by the corresponding element in the second vector.

```surql title="API DEFINITION"
vector::multiply(array, array) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::multiply([1, 2, 3], [1, 2, 3]);

[1, 4, 9]
```

<br />

## `vector::normalize`

The `vector::normalize` function computes the normalization of a vector, transforming it to a unit vector (a vector of length 1) that maintains the original direction.

```surql title="API DEFINITION"
vector::normalize(array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::normalize([ 4, 3 ]);

[0.8f, 0.6f]
```

<br />

## `vector::project`

The `vector::project` function computes the projection of one vector onto another, providing a measure of the shadow of one vector on the other. The projection is obtained by multiplying the magnitude of the given vectors with the cosecant of the angle between the two vectors.


```surql title="API DEFINITION"
vector::project(array, array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::project([1, 2, 3], [4, 5, 6]);

[1.6623376623376624f, 2.077922077922078f, 2.4935064935064934f]
```

<br />

## `vector::scale`

<Since v="v2.0.0" />

The `vector::scale` function multiplies each item in a vector by a number.


```surql title="API DEFINITION"
vector::scale(array, number) -> array
```

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::scale([3, 1, 5, -3, 7, 2], 5);

[	15,	5, 25, -15, 35, 10 ]
```

<br />

## `vector::subtract`

The `vector::subtract` function performs element-wise subtraction between two vectors, where each element in the second vector is subtracted from the corresponding element in the first vector.

```surql title="API DEFINITION"
vector::subtract(array, array) -> array
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::subtract([4, 5, 6], [3, 2, 1]);

[1, 3, 5]
```

<br />

## `vector::distance::chebyshev`

The `vector::distance::chebyshev` function computes the Chebyshev distance (also known as maximum value distance) between two vectors, which is the greatest of their differences along any coordinate dimension.

```surql title="API DEFINITION"
vector::distance::chebyshev(array, array) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::distance::chebyshev([2, 4, 5, 3, 8, 2], [3, 1, 5, -3, 7, 2]);

6f
```

<br />

## `vector::distance::euclidean`

The `vector::distance::euclidean` function computes the Euclidean distance between two vectors, providing a measure of the straight-line distance between two points in a multi-dimensional space.

```surql title="API DEFINITION"
vector::distance::euclidean(array, array) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::distance::euclidean([10, 50, 200], [400, 100, 20]);

432.43496620879307f
```

<br />

## `vector::distance::hamming`

The `vector::distance::hamming` function computes the Hamming distance between two vectors, measuring the minimum number of substitutions required to change one vector into the other, useful for comparing strings or codes.

```surql title="API DEFINITION"
vector::distance::hamming(array, array) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::distance::hamming([1, 2, 2], [1, 2, 3]);

1
```

<br />

## `vector::distance::knn`

The `vector::distance::knn` function returns the distance computed during the query by the Knn operator (avoiding recomputation).

```surql title="API DEFINITION"
vector::distance::knn() -> number
```
The following example shows this function, and its output, when used in a [`SELECT`](/docs/surrealql/statements/select) statement:

```surql
CREATE pts:1 SET point = [1,2,3,4];
CREATE pts:2 SET point = [4,5,6,7];
CREATE pts:3 SET point = [8,9,10,11];
SELECT id, vector::distance::knn() AS dist FROM pts WHERE point <|2,EUCLIDEAN|> [2,3,4,5];

[
			{
				id: pts:1,
				dist: 2f
			},
			{
				id: pts:2,
				dist: 4f
			}
]
```

<br />

## `vector::distance::manhattan`

The `vector::distance::manhattan`  function computes the Manhattan distance (also known as the L1 norm or Taxicab geometry) between two vectors, which is the sum of the absolute differences of their corresponding elements.

```surql title="API DEFINITION"
vector::distance::manhattan(array, array) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::distance::manhattan([10, 20, 15, 10, 5], [12, 24, 18, 8, 7]);

13
```

<br />

## `vector::distance::minkowski`

The `vector::distance::minkowski` function computes the Minkowski distance between two vectors, a generalization of other distance metrics such as Euclidean and Manhattan when parameterized with different values of p.


```surql title="API DEFINITION"
vector::distance::minkowski(array, array, number) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::distance::minkowski([10, 20, 15, 10, 5], [12, 24, 18, 8, 7], 3);

4.862944131094279f
```

<br />

## `vector::similarity::cosine`

The `vector::similarity::cosine` function computes the Cosine similarity between two vectors, indicating the cosine of the angle between them, which is a measure of how closely two vectors are oriented to each other.


```surql title="API DEFINITION"
vector::similarity::cosine(array, array) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::similarity::cosine([10, 50, 200], [400, 100, 20]);

0.15258215962441316f
```

<br />

## `vector::similarity::jaccard`

The `vector::similarity::jaccard` function computes the Jaccard similarity between two vectors, measuring the intersection divided by the union of the datasets represented by the vectors.


```surql title="API DEFINITION"
vector::similarity::jaccard(array, array) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::similarity::jaccard([0,1,2,5,6], [0,2,3,4,5,7,9]);

0.3333333333333333f
```

<br />

## `vector::similarity::pearson`

The `vector::similarity::pearson` function Computes the Pearson correlation coefficient between two vectors, reflecting the degree of linear relationship between them.


```surql title="API DEFINITION"
vector::similarity::pearson(array, array) -> number
```
The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql
RETURN vector::similarity::pearson([1,2,3], [1,5,7]);

0.9819805060619659f
```

<br />

<br /><br />


---
sidebar_position: 1
sidebar_label: Scripting functions
title: Embedded scripting functions | SurrealQL
description: SurrealDB allows for advanced functions with complicated logic, by allowing embedded functions to be written in JavaScript.
---

# Embedded scripting functions

SurrealDB allows for advanced functions with complicated logic, by allowing embedded functions to be written in JavaScript. These functions support the ES2020 JavaScript specification.

## Simple function

Embedded JavaScript functions within SurrealDB support all functionality in the ES2020 specification including async / await functions, and generator functions. Any value from SurrealDB is converted into a JavaScript type automatically, and the return value from the JavaScript function is converted to a SurrealDB value.

```surql
CREATE person SET scores = function() {
	return [1,2,3].map(v => v * 10);
};
```

---
sidebar_position: 2
sidebar_label: Arguments
title: Arguments | Embedded scripting functions | SurrealQL
description: Additional arguments can be passed in to the function from SurrealDB, and these are accessible as an array using the arguments object within the JavaScript function.
---

# Arguments

Additional arguments can be passed in to the function from SurrealDB, and these are accessible as an array using the `arguments` object within the JavaScript function.

```surql 
-- Create a new parameter
LET $val = "SurrealDB";
-- Create a new parameter
LET $words = ["awesome", "advanced", "cool"];
-- Pass the parameter values into the function
CREATE article SET summary = function($val, $words) {
	const [val, words] = arguments;
	return `${val} is ${words.join(', ')}`;
};
```

---
sidebar_position: 3
sidebar_label: Built-in functions
title: Built-in functions | Embedded scripting functions | SurrealQL
description: Besides basic JavaScript utilities and classes for SurrealQL types, there are a handful of utilities built into the embedded scripting functions.
---

import Label from "@components/shared/Label.astro";

# Built-in functions

Besides basic JavaScript utilities and [classes for SurrealQL types](/docs/surrealql/functions/script/type-conversion), there are a handful of utilities built into the embedded scripting functions.

<table>
  <thead>
    <tr>
      <th>Function</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="#fetch"><code>async fetch(resource, options)</code></a></td>
      <td>Full fledged fetch implementation closely matching the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API">official specification</a>.</td>
    </tr>
    <tr>
      <td><a href="#query"><code>async query(surql)</code></a></td>
      <td>Run SurrealQL subqueries from within the embedded scripting functions.</td>
    </tr>
    <tr>
      <td><a href="#value"><code>async value(variable)</code></a></td>
      <td>Retrieve values for SurrealQL variables from within the embedded scripting functions.</td>
    </tr>
  </tbody>
</table>

## `async fetch(resource, options)` {#fetch}

Full fledged fetch implementation closely matching the [official specification](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

> [!NOTE]
> For complete documentation, please refer to the MDN documentation.

<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>  
    <tbody>
        <tr>
            <td colspan="2">
                <code>resource</code>
                <Label label="required" />
            </td>
            <td colspan="2">
                Accepts either a url in a string, or a URL or Request object.
            </td>
        </tr>
         <tr>
            <td colspan="2">
                <code>options</code>
            </td>
            <td colspan="2">
                Accepts various options related to the request. Refer to MDN docs for a full reference.
            </td>
        </tr>
    </tbody>
</table>

```surql
RETURN function() {
	// List all posts
	const posts = fetch('https://jsonplaceholder.typicode.com/posts');

	// Update post with ID 1
	const updated = fetch('https://jsonplaceholder.typicode.com/posts/1', {
		method: 'PUT',
		body: JSON.stringify({
			id: 1,
			title: 'foo',
			body: 'bar',
			userId: 1,
		}),
		headers: {
			'Content-type': 'application/json; charset=UTF-8',
		},
	});

	return { posts, updated };
}
```

<br />

## `async query(surql)` {#query}

Run SurrealQL subqueries from within the embedded scripting functions.

> [!NOTE]
> Only subqueries can be executed with the query() function. This means that only a single query can currently be executed, and that only CRUD operations are allowed.

<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>  
    <tbody>
        <tr>
            <td colspan="2">
                <code>surql</code>
                <Label label="required" />
            </td>
            <td colspan="2">
                Accepts a single SurrealQL query, which is limited to a CRUD operation.
            </td>
        </tr>
    </tbody>
</table>

```surql
CREATE user:john, user:mary;

RETURN function() {
	// Select all users
	const users = await surrealdb.query("SELECT * FROM user");

	// Prepared query
	const query = new surrealdb.Query("SELECT * FROM $id", {
		id: new Record('user', 'mary')
	});

	// Execute prepared query
	const mary = (await surrealdb.query(query))[0];

	// Assign variables later to prepared query
	query.bind('id', new Record('user', 'john'));

	// Execute prepared query
	const john = (await surrealdb.query(query))[0];

	return { john, mary };
}
```

<br />

## `async value(variable)` {#value}

Retrieve values for SurrealQL variables from within the embedded scripting functions.

<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>  
    <tbody>
        <tr>
            <td colspan="2">
                <code>variable</code>
                <Label label="required" />
            </td>
            <td colspan="2">
                Accepts the path to a variable
            </td>
        </tr>
    </tbody>
</table>

```surql
LET $something = 123;
LET $obj = {
	nested: 456
};

LET $arr = [
	{ value: 1 },
	{ value: 2 },
	{ value: 3 },
	{ value: 4 },
	{ value: 5 },
	{ value: 6 },
];

RETURN function() {
	// Get the value for a variable
	const something = await surrealdb.value("$something");

	// Get the value for a nested property
	const nested = await surrealdb.value("$obj.nested");

	// Filter properties from an array
	const fromArray = await surrealdb.value("$arr[WHERE value > 3].value");

	return { something, nested, fromArray };
}
```

<br /><br />

---
sidebar_position: 4
sidebar_label: Function context
title: Function context | Embedded scripting functions | SurrealQL
description: Embedded scripting functions inherit the context in which they are ran in. The this context of every embedded function is automatically set to the current document on every invocation.
---

# Function context

Embedded scripting functions inherit the context in which they are ran in. The this context of every embedded function is automatically set to the current document on every invocation. This allows the function to access the properties and fields of the current record being accessed / modified.

```surql
CREATE film SET
	ratings = [
		{ rating: 6, user: user:bt8e39uh1ouhfm8ko8s0 },
		{ rating: 8, user: user:bsilfhu88j04rgs0ga70 },
	],
	featured = function() {
		return this.ratings.filter(
			({ rating }) => rating >= 7
		).map(({ rating, ...data }) => {
			return {
				...data,
				rating: rating * 10
			};
		});
	}
;
```

---
sidebar_position: 5
sidebar_label: Type conversion
title: Type conversion | Embedded scripting functions | SurrealQL
description: Any value from SurrealDB is converted into a JavaScript type automatically, and the return value from the JavaScript function is converted to a SurrealQL value.
---

# Type conversion

Any value from SurrealDB is converted into a JavaScript type automatically, and the return value from the JavaScript function is converted to a SurrealQL value. Boolean values, Integers, Floats, Strings, Arrays, Objects, and Date objects are all converted automatically to and from SurrealQL values.

```surql
CREATE user:test SET created_at = function() {
	return new Date();
};
```

In addition, a number of special classes are included within the JavaScript functions for the additional types which are not built into JavaScript. These enable the creation of [`duration`](/docs/surrealql/datamodel/datetimes#durations-and-datetimes) values, [`record`](/docs/surrealql/datamodel/ids) ids, and [`UUID`](/docs/surrealql/datamodel/strings#uuid) values from within JavaScript.

Any values of these types passed into embedded scripting functions are also represented with these special classes.

```surql
CREATE user:test SET
	session_timeout = function() {
		return new Duration('1w');
	},
	best_friend = function() {
		return new Record('user', 'joanna');
	},
	identifier = function() {
		return new Uuid('03412258-988f-47cd-82db-549902cdaffe');
	}
;
```

---
sidebar_position: 6
sidebar_label: SurrealQL functions
title: SurrealQL functions | Embedded scripting functions | SurrealQL
description: Embedded scripting functions have access to native SurrealQL functions, allowing for complex and performant operations otherwise not possible.
---

# SurrealQL functions

Embedded scripting functions have access to native SurrealQL functions, allowing for complex and performant operations otherwise not possible. SurrealQL functions are published under the `surrealdb.functions` variable. Custom functions are not available within the embedded JavaScript function at the moment.

```surql
RETURN function() {
	// Using the rand::uuid::v4() function
	const uuid = surrealdb.functions.rand.uuid.v4();
};
```

---
sidebar_position: 1
sidebar_label: ML functions
title: Machine Learning functions | SurrealQL
description: SurrealDB offers machine learning functions to help you build and deploy machine learning models.
---

# Machine Learning functions

SurrealDB offers machine learning functions to help you build and deploy machine learning models.

Currently, SurrealDB supports the following machine learning functions:

- [Trained models](/docs/surrealql/functions/ml/functions)

---
sidebar_position: 2
sidebar_label: Machine learning functions
title: Machine learning functions | SurrealQL
description: These functions can be used when calculating outputs from a trained machine learning model that has been uploaded to the database.
---

# Machine Learning functions

These functions can be used when calculating outputs from a trained machine learning model that has been uploaded to the database.

<table>
	<thead>
		<tr>
			<th scope="col">Function</th>
			<th scope="col">Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td scope="row" data-label="Function">
				<a href="#mlname-of-modelversion">
					<code>
						ml::name-of-model&lt;version&gt;()
					</code>
				</a>
			</td>
			<td scope="row" data-label="Description">Computes a value from a trained machine learning model</td>
		</tr>
	</tbody>
</table>

## `ml::name-of-model<version>()`

Once a model has been uploaded to the database, the model can be called with inputs resulting in a calculation
from the trained ml model. We can do a basic raw computation with the following call:

```surql title="API DEFINITION"
ml::house-price-prediction<0.0.1>(500.0, 1.0);
```
In the above example, the model we are calling is called `house-price-prediction` with the version `0.0.1`. We
then pass in a raw vector of `[ [500.0, 1.0] ]` Depending on the model, the name and version of the model will vary as well
as the inputs. The name and version of the model will be defined in the `.surml` file which will defined when uploading the
model to the database. We can also perform a "buffered compute" with the code below:

```surql title="API DEFINITION"
ml::house-price-prediction<0.0.1>({squarefoot: 500.0, num_floors: 1.0});
```
Here, we are using the key mappings in the header of the `.surml` file uploaded to the database to map the fields defined
in the object passed into the `ml::` function in the correct order. If there are any normalisation parameters in the header
of the `.surml` file, these will also be applied.

The following example shows this function, and its output, when used in a [`RETURN`](/docs/surrealql/statements/return) statement:

```surql 
RETURN ml::house-price-prediction<0.0.1>({squarefoot: 500.0, num_floors: 1.0});

250000
```

Seeing as the ML is integrated into our surql, we can infer entire columns using the ml function. We can demonstrate this with a simple
example of house prices. We can define some basic table with the following surql:

```surql
CREATE house_listing SET squarefoot_col = 500.0, num_floors_col = 1.0;
CREATE house_listing SET squarefoot_col = 1000.0, num_floors_col = 2.0;
CREATE house_listing SET squarefoot_col = 1500.0, num_floors_col = 3.0;
```

We can then get all the rows with the imputed price prediction with the surql below:

```surql
SELECT 
	*, 
	ml::house-price-prediction<0.0.1>({ squarefoot: squarefoot_col, num_floors: num_floors_col }) AS price_prediction 
FROM house_listing;
```

This would statement gives us the following result:

```json
[
	{
		"id": "house_listing:7bo0f35tl4hpx5bymq5d",
		"num_floors_col": 3,
		"price_prediction": 406534.75,
		"squarefoot_col": 1500
	},
	{
		"id": "house_listing:8k2ttvhp2vh8v7skwyie",
		"num_floors_col": 2,
		"price_prediction": 291870.5,
		"squarefoot_col": 1000
	},
	{
		"id": "house_listing:vnlv3nzr21oi5o23kydw",
		"num_floors_col": 1,
		"price_prediction": 177206.21875,
		"squarefoot_col": 500
	}
]
```

We can see that our price prediction is calculated in the query. We can build on the previous surql to filter based on the computed
price prediction with the surql below:

```surql
SELECT * FROM (
		SELECT 
			*, 
			ml::house-price-prediction<0.0.1>({ squarefoot: squarefoot_col, num_floors: num_floors_col }) AS price_prediction 
		FROM house_listing
	) 
	WHERE price_prediction > 177206.21875;
```

This gives us the following result:

```json
[
	{
		"id": "house_listing:7bo0f35tl4hpx5bymq5d",
		"num_floors_col": 3,
		"price_prediction": 406534.75,
		"squarefoot_col": 1500
	},
	{
		"id": "house_listing:8k2ttvhp2vh8v7skwyie",
		"num_floors_col": 2,
		"price_prediction": 291870.5,
		"squarefoot_col": 1000
	}
]
```


<br /><br />

---
sidebar_position: 6
sidebar_label: Parameters
title: Parameters | SurrealQL
description: Parameters can be used like variables to store a value which can then be used in a subsequent query.
---

import Since from '@components/shared/Since.astro'
import Label from "@components/shared/Label.astro";
import Tabs from "@components/Tabs/Tabs.astro";
import TabItem from "@components/Tabs/TabItem.astro";

# Parameters

Parameters can be used like variables to store a value which can then be used in subsequent queries. To define a parameter in SurrealQL, use the [`LET`](../surrealql/statements/let) statement. The name of the parameter should begin with a `$` character.

## Defining parameters within SurrealQL

```surql
-- Define the parameter
LET $suffix = "Morgan Hitchcock";
-- Use the parameter
CREATE person SET name = "Tobie " + $suffix;
-- (Another way to do the same)
CREATE person SET name = string::join(" ", "Jaime", $suffix);
```

```surql title="Response"
[
    {
        "id": "person:3vs17lb9eso9m7gd8mml",
        "name": "Tobie Morgan Hitchcock"
    }
]

[
    {
        "id": "person:xh4zbns5mgmywe6bo1pi",
        "name": "Jaime Morgan Hitchcock"
    }
]
```

A parameter can store any value, including the result of a query.

```surql
-- Assuming the CREATE statements from the previous example
LET $founders = (SELECT * FROM person);
RETURN $founders.name;
```

```surql title="Response"
[
    "Tobie Morgan Hitchcock",
    "Jaime Morgan Hitchcock"
]
```

Parameters persist across the current connection, and thus can be reused between different namespaces and databases. In the example below, a created `person` record assigned to a parameter is reused in a query in a completely different namespace and database.

```surql
LET $billy = CREATE ONLY person:billy SET name = "Billy";
-- Fails as `person:billy` already exists
CREATE person CONTENT $billy;

USE NAMESPACE other_namespace;
USE DATABASE other_database;
-- Succeeds as `person:billy` does not yet exist in this namespace and database
CREATE person CONTENT $billy;
```

Parameters can be defined using SurrealQL as shown above, or can be passed in using the client libraries as request variables.

## Redefining and shadowing parameters

Parameters in SurrealQL are immutable. The same parameter can be redefined using a `LET` statement.

```surql
LET $my_name = "Alucard";
LET $my_name = "Sypha";
RETURN $my_name;
```

```surql title="Output"
'Sypha'
```

Before SurrealDB 3.0, the `=` on its own was used as syntactic sugar for a `LET` statement. This has since been deprecated in order to make it clearer that parameters can be redeclared, but not modified.

<Tabs>
  <TabItem label="Before 3.X" default>
```surql
LET $my_name = "Alucard";
$my_name = "Sypha";
RETURN $my_name;
```

```surql title="Output"
'Sypha'
```
</TabItem>
  <TabItem label="Since 3.X">
```surql
LET $my_name = "Alucard";
$my_name = "Sypha";
RETURN $my_name;
```

```surql title="Output"
'There was a problem with the database: Parse error: Variable declaration without `let` is deprecated
 --> [4:1]
  |
4 | $my_name = "Sypha";
  | ^^^^^^^^^^^^^^^^^^^ replace with `let $my_name = ..`
'
```
  </TabItem>
</Tabs>

If the parameter is redefined inside another scope, the original value will be shadowed. Shadowing refers to when a value is temporarily obstructed by a new value of the same name until the new scope has completed.

```surql
LET $nums = [
    [1,2],
    [3,4]
];

{
    LET $nums = $nums.flatten();
    -- Flattened into a single array,
    -- so $nums is shadowed as [1,2,3,4]
    RETURN $nums;
};

-- Returns original unflattened $nums:
-- [[1,2], [3,4]]
RETURN $nums;
```

Even a parameter defined using a [`DEFINE PARAM`](/docs/surrealql/statements/define/param) statement can be shadowed.

```surql
DEFINE PARAM $USERNAME VALUE "user@user.com";

$USERNAME = "some other email";
```

However, the parameter `$USERNAME` in this case is still defined as its original value, as can be seen via an [`INFO FOR DB`](/docs/surrealql/statements/info) statement.

```surql
{
	accesses: {},
	analyzers: {},
	apis: {},
	configs: {},
	functions: {},
	models: {},
	params: {
		USERNAME: "DEFINE PARAM $USERNAME VALUE 'user@user.com' PERMISSIONS FULL"
	},
	tables: {},
	users: {}
}
```

As the shadowed `$USERNAME` parameter will persist over the length of the connection, the parameter `$USERNAME` will once again show up as its original defined value if the connection is discontinued and restarted.

## Defining parameters within client libraries
SurrealDB's client libraries allow parameters to be passed in as JSON values, which are then converted to SurrealDB data types when the query is run. The following example show a variable being used within a SurrealQL query from the JavaScript library.

```javascript
let people = await surreal.query("SELECT * FROM article WHERE status INSIDE $status", {
	status: ["live", "draft"],
});
```

## Reserved variable names

SurrealDB automatically predefines certain variables depending on the type of operation being performed. For example, `$this` and `$parent` are automatically predefined for subqueries so that the fields of one can be compared to another if necessary. In addition, the predefined variables `$access`, `$auth`, `$token`, and `$session` are protected variables used to give access to parts of the current database configuration and can never be overwritten.

```surql
LET $access = true;
LET $auth = 10;
LET $token = "Mytoken";
LET $session = rand::int(0, 100);
```

```surql title="Output"
-------- Query 1 --------

"'access' is a protected variable and cannot be set"

-------- Query 2 --------

"'auth' is a protected variable and cannot be set"

-------- Query 3 --------

"'token' is a protected variable and cannot be set"

-------- Query 4 --------

"'session' is a protected variable and cannot be set"
```

Other predefined variables listed below are not specifically protected, but should not be used in order to avoid unexpected behaviour.

### $before, $after

Represent the values before and after a mutation on a field.

```surql
CREATE cat SET name = "Mr. Meow", nicknames = ["Mr. Cuddlebun"];
UPDATE cat SET nicknames += "Snuggles" WHERE name = "Mr. Meow" RETURN $before, $after;
```

```surql title="Response"
[
    {
        "after": {
            "id": "cat:6p71csv2zqianixf0dkz",
            "name": "Mr. Meow",
            "nicknames": [
                "Mr. Cuddlebun",
                "Snuggles"
            ]
        },
        "before": {
            "id": "cat:6p71csv2zqianixf0dkz",
            "name": "Mr. Meow",
            "nicknames": [
                "Mr. Cuddlebun"
            ]
        }
    }
]
```

### $auth

Represents the currently authenticated record user.

```surql
DEFINE TABLE user SCHEMAFULL
    PERMISSIONS
        FOR select, update, delete WHERE id = $auth.id;
```

### $event

Represents the type of table event triggered on an event. This parameter will be one of either `"CREATE"`, `"UPDATE"`, or `"DELETE"`.

```surql
DEFINE EVENT user_created ON TABLE user WHEN $event = "CREATE" THEN (
    CREATE log SET table = "user", event = $event, created_at = time::now()
);
```

### $input

Represents the initially inputted value in a field definition, as the value clause could have modified the $value variable.

```surql
CREATE city:london SET
    population = 8900000,
    year = 2019,
    historical_data = [];

INSERT INTO city [
    { id: "london", population: 9600000, year: 2023 }
]
ON DUPLICATE KEY UPDATE
-- Stick old data into historical_data
historical_data += {
    year: year,
    population: population
},
-- Then update current record with the new input using $input
population = $input.population,
year = $input.year;
```

```surql output="Response"
[
    {
        "historical_data": [
            {
                "population": 8900000,
                "year": 2019
            }
        ],
        "id": "city:london",
        "population": 9600000,
        "year": 2023
    }
]
```

### $parent, $this

`$this` represents the current record in a subquery, and `$parent` its parent.

```surql
CREATE user SET name = "User1", member_of = "group1";
CREATE user SET name = "User2", member_of = "group1";
CREATE user SET name = "User3", member_of = "group1";
SELECT name, 
    (SELECT VALUE name FROM user WHERE member_of = $parent.member_of)
    AS group_members
    FROM user
    WHERE name = "User1";
```

```surql title="Response"
[
    {
        "group_members": [
            "User1",
            "User3",
            "User2"
        ],
        "name": "User1"
    }
]
```

```surql
INSERT INTO person (name) VALUES ("John Doe"), ("John Doe"), ("Jane Doe");
SELECT 
    *,
    (SELECT VALUE id FROM person WHERE $this.name = $parent.name) AS 
    people_with_same_name
    FROM person;
```

```surql title="Response"
[
    {
        "id": "person:hwffcckiv61ylwiw43yf",
        "name": "John Doe",
        "people_with_same_name": [
            "person:hwffcckiv61ylwiw43yf",
            "person:tmscoy7bjj20xki0fld5"
        ]
    },
    {
        "id": "person:tmscoy7bjj20xki0fld5",
        "name": "John Doe",
        "people_with_same_name": [
            "person:hwffcckiv61ylwiw43yf",
            "person:tmscoy7bjj20xki0fld5"
        ]
    },
    {
        "id": "person:y7mdf3912rf5gynvxc7q",
        "name": "Jane Doe",
        "people_with_same_name": [
            "person:y7mdf3912rf5gynvxc7q"
        ]
    }
]
```

### $access

Represents the name of the access method used to authenticate the current session.

```surql
IF $access = "admin" THEN
    ( SELECT * FROM account )
ELSE IF $access = "user" THEN
    ( SELECT * FROM $auth.account )
ELSE
    []
END
```

### $session

Represents values from the session functions as an object.

You can learn more about those values from the [security parameters](/docs/surrealdb/security/authentication#session) section.

```surql
CREATE user SET 
    name = "Some User",
    on_database = $session.db;
```

```surql title="Response"
[
    {
        "id": "user:wa3ajflozlqoyurc4i4v",
        "name": "Some User",
        "on_database": "database"
    }
]
```

### $token

Represents values held inside the JWT token used for the current session.

You can learn more about those values from the [security parameters](/docs/surrealdb/security/authentication#token) section.

```surql
DEFINE TABLE user SCHEMAFULL
  PERMISSIONS FOR select, update, delete, create
  WHERE $access = "users"
  AND email = $token.email;
```

### $value

Represents the value after a mutation on a field (identical to $after in the case of an event).

```surql
DEFINE EVENT email ON TABLE user WHEN $before.email != $after.email THEN (
    CREATE event SET 
        user = $value.id,
        time = time::now(),
        value = $after.email,
        action = 'email_changed'
);
```


### $request

<Since v="v2.0.0" />

This parameter represents the value of a request to a custom API defined using the [`DEFINE API`](/docs/surrealql/statements/define/api) statement.

```surql
DEFINE API OVERWRITE "/test"
    FOR get, post 
        MIDDLEWARE
            api::req::raw_body(false)
        THEN {
            RETURN {
                status: 404,
                body: $request.body,
                headers: {
                    'bla': '123'
                }
            };
        };
```

The `$request` parameter may contain values at the following fields: `body`, `headers`, `method`, `query`, and `params`.

---
sidebar_position: 7
sidebar_label: Transactions
title: Transactions | SurrealQL
description: Each statement within SurrealDB is run within its own transaction, or within client defined transactions that can contain multiple statements.
---

# Transactions

Each statement within SurrealDB is run within its own transaction by default. If a set of changes need to be made together, then groups of statements can be run together as a single transaction. If all of the statements within a transaction succeed, and the transaction is successful, then all of the data modifications made during the transaction are committed and become a permanent part of the database. If a transaction encounters errors and must be cancelled or rolled back, then any data modification made within the transaction is rolled back, and will not become a permanent part of the database.

## Starting a transaction

The `BEGIN` or `BEGIN TRANSACTION` statement starts a transaction in which multiple statements can be run together.

```surql title="Starting a transaction"
BEGIN [ TRANSACTION ];
```

The following query shows example usage of this statement.

```surql title="Example usage of BEGIN TRANSACTION"
-- Start a new database transaction. Transactions are a way to ensure multiple operations
-- either all succeed or all fail, maintaining data integrity.
BEGIN TRANSACTION;

-- Create a new account with the ID 'one' and set its initial balance to 135605.16
CREATE account:one SET balance = 135605.16;

-- Create another new account with the ID 'two' and set its initial balance to 91031.31
CREATE account:two SET balance = 91031.31;

-- Update the balance of account 'one' by adding 300.00 to the current balance.
-- This could represent a deposit or other form of credit on the balance property.
UPDATE account:one SET balance += 300.00;

-- Update the balance of account 'two' by subtracting 300.00 from the current balance.
-- This could represent a withdrawal or other form of debit on the balance property.
UPDATE account:two SET balance -= 300.00;

-- Finalize the transaction. This will apply the changes to the database. If there was an error
-- during any of the previous steps within the transaction, all changes would be rolled back and
-- the database would remain in its initial state.
COMMIT TRANSACTION;
```

## Committing a transaction

The [COMMIT](/docs/surrealql/statements/commit) statement is used to commit a set of statements within a transaction, ensuring that all data modifications become a permanent part of the database.

```surql title="Committing a transaction"
COMMIT [ TRANSACTION ];
```
The following query shows example usage of this statement.

```surql title="Example usage of COMMIT TRANSACTION"
BEGIN TRANSACTION;

-- Setup accounts
CREATE account:one SET balance = 135605.16;
CREATE account:two SET balance = 91031.31;

-- Move money
UPDATE account:one SET balance += 300.00;
UPDATE account:two SET balance -= 300.00;

-- Finalise all changes
COMMIT TRANSACTION;
```

## Cancelling a transaction

The [CANCEL](/docs/surrealql/statements/cancel) statement can be used to cancel a set of statements within a transaction, reverting or rolling back any data modification made within the transaction as a whole.

```surql title="Cancelling a transaction"
CANCEL [ TRANSACTION ];
```

The following query shows example usage of this statement.

```surql title="Example usage of CANCEL TRANSACTION"
BEGIN TRANSACTION;

-- Setup accounts
CREATE account:one SET balance = 135605.16;
CREATE account:two SET balance = 91031.31;

-- Move money
UPDATE account:one SET balance += 300.00;
UPDATE account:two SET balance -= 300.00;

-- Rollback all changes
CANCEL TRANSACTION;
```

## THROW to conditionally cancel a transaction

While transactions are automatically rolled back if an error occurs in any of its statements, [THROW](/docs/surrealql/statements/throw) can also be used to explicitly break out of a transaction at any point. `THROW` can be followed by any value which serves as the error message, usually a string.

```surql
BEGIN TRANSACTION;

CREATE account:one SET dollars =  100;
CREATE account:two SET dollars =  100;

LET $transfer_amount = 150;
UPDATE account:one SET dollars -= $transfer_amount;
UPDATE account:two SET dollars += $transfer_amount;
IF account:one.dollars < 0 {
    THROW "Insufficient funds, would have $" + <string>account:one.dollars + " after transfer"
};
COMMIT TRANSACTION;
SELECT * FROM account;
```

```surql title="Output when $transfer_amount set to 150"
'An error occurred: Insufficient funds, would have $-50 after transfer'
```

```surql title="Output when $transfer_amount set to 50"
[
	{
		dollars: 50,
		id: account:one
	},
	{
		dollars: 150,
		id: account:two
	}
]
```

## Using transactions to test code for errors

As failed transactions automatically roll back any changes made, a transaction with a final `THROW` statement can be used as a confirmation that no errors have taken place inside a group of queries.

Take the following example that creates a unique index and then inserts some records to make sure that the database logic is functioning as expected. However, as names are not necessarily unique, the index soon gives an error and cancels the transaction before `THROW` can be reached.

```surql
BEGIN TRANSACTION;
DEFINE INDEX unique_name ON TABLE person FIELDS name UNIQUE;

INSERT INTO person [
    { name: 'Agatha Christie', born: d'1890-09-15' },
    { name: 'Billy Billerson', born: d'1979-09-11' },
	-- Pretend there are is 10,000 more objects here
    { name: 'Agatha Christie', born: d'1955-05-15' },
];

THROW "Reached the end";
COMMIT TRANSACTION;
```

The output is not the expected 'An error occurred: Reached the end' message, showing that not all queries were successful.

```surql title="Output"
"Database index `unique_name` already contains 'Agatha Christie', with record `person:qs4bpvl96sf9x40b3567`"
```

If the index is redefined to be less strict, the statetements will work and the expected output will be reached, confirming that no errors occurred during the test.

```surql
BEGIN TRANSACTION;
DEFINE INDEX OVERWRITE unique_person ON TABLE person FIELDS name, born UNIQUE;

INSERT INTO person [
    { name: 'Agatha Christie', born: d'1890-09-15' },
    { name: 'Billy Billerson', born: d'1979-09-11' },
    { name: 'Agatha Christie', born: d'1955-05-15' },
];

THROW "Reached the end";
COMMIT TRANSACTION;
```

```surql title="Expected output"
'An error occurred: Reached the end'
```

---
sidebar_position: 8
sidebar_label: Comments
title: Comments | SurrealQL
description: In SurrealQL, comments can be written in a number of different ways.
---

# Comments

In SurrealQL, comments can be written in a number of different ways.

```surql
/*
In SurrealQL, comments can be written as single-line
or multi-line comments, and comments can be used and
interspersed within statements.
*/

SELECT * FROM /* get all users */ user;

# There are a number of ways to use single-line comments
SELECT * FROM user;

// Alternatively using two forward-slash characters
SELECT * FROM user;

-- Another way is to use two dash characters
SELECT * FROM user;
```












