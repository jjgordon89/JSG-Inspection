---
sidebar_position: 1
sidebar_label: Querying
title: Querying | SurrealQL | GraphQL
description: In this section, you will explore methods to query data in SurrealDB using SurrealQL, GraphQL or any of the available SDKs. This allows you to retrieve, filter, and manipulate data efficiently and effectively and in the best way for your use case.
---

import Since from '@components/shared/Since.astro';
import Image from "@components/Image.astro";
import LightQl from "@img/icon/light/surrealql.png";
import DarkQl from "@img/icon/dark/surrealql.png";
import LightGql from "@img/icon/light/gql.png";
import DarkGql from "@img/icon/dark/gql.png";

# Querying Data in SurrealDB

In this section, you will explore some of the ways you can query data in SurrealDB using [SurrealQL](/docs/surrealdb/querying/surrealql), [GraphQL](/docs/surrealdb/querying/graphql) or via any of the [available SDKs](/docs/surrealdb/querying/sdks). Regardless of the method you choose, SurrealDB provides powerful querying capabilities that allow you to retrieve, filter, and manipulate data efficiently and effectively.

Now, let's explore the different methods to query data in SurrealDB.

<div class="flag-title mt-14">
	<Image
		alt="SurrealQL"
		width={42}
		height={42}
		src={{
			light: LightQl,
			dark: DarkQl,
		}}
	/>
	# SurrealQL
</div>

[SurrealQL](/docs/surrealql) is our powerful database query language that closely resembles traditional SQL but comes with unique differences and improvements.

Designed to provide developers with a seamless and intuitive way to interact with SurrealDB, SurrealQL offers a familiar syntax and supports various statement types, allowing you to perform complex database operations efficiently.

To get started with SurrealQL, explore the [SurrealQL documentation](/docs/surrealql) to learn about the [statements](/docs/surrealql/statements) available. These statements enable you to perform a wide range of database operations, from querying data to modifying records and managing database structures.

Additionally, SurrealQL provides a rich set of [database functions](/docs/surrealql/functions/database) that enhance its capabilities. These functions allow you to perform advanced operations and leverage the full potential of SurrealDB's features. Whether you are working with data retrieval, manipulation, or complex computations, SurrealQL's functions offer the tools you need to build robust and scalable applications.


### Getting Started

The easiest way to get started with SurrealQL is to use [Surrealist](https://app.surrealdb.com/). This interactive environment allows you to experiment with SurrealQL statements and see the results in a tabular format. You can either set up a sandbox instance, a remote or local instance.



You can use Surrealist to learn about the syntax and features of SurrealQL and to develop your queries and scripts.

To familiarize yourself with SurrealQL, explore the various [statement](/docs/surrealql/statements) and their syntax. The statements pages provides comprehensive examples and explanations for each statement type, helping you understand how to construct queries and interact with SurrealDB effectively.

SurrealQL empowers you to leverage the full potential of SurrealDB and enables you to build robust and scalable applications. Let's dive into the world of SurrealQL and unlock the capabilities of SurrealDB together!

### Querying Options

When using SurrealQL, there are several options available to interact with your database instance depending on your environment and needs.

- **Surrealist (Recommended)**: [Surrealist](https://app.surrealdb.com/) is an interactive environment that allows you to experiment with SurrealQL statements and see the results in a tabular format. It is a great tool for learning about the syntax and features of SurrealQL and for developing your queries and scripts.

- **CLI**: The SurrealDB Command Line Interface (CLI) provides a powerful way to [interact with the database directly from your terminal](/docs/surrealdb/cli). You can execute SurrealQL queries, manage database structures, and perform administrative tasks using the CLI.

- **WebSocket**: SurrealDB supports WebSocket connections, allowing you to execute SurrealQL queries in real-time. This option is ideal for applications that require low-latency communication and real-time updates.

- **HTTP**: You can send HTTP requests to the [`/sql` endpoint](/docs/surrealdb/integration/http#sql) to execute SurrealQL queries. This method is useful for integrating SurrealDB with web applications and services that communicate over HTTP.
  - **Postman**: Using [Postman](https://www.postman.com/) or any other HTTP client, you can send a `POST` request to the `/sql` endpoint with your SurrealQL query in the body. This method provides flexibility and can be useful for testing and automation purposes.

- **RPC**: SurrealDB also supports RPC, allowing you to interact with the database programmatically over a network.

#### Using RPC

SurrealDB also supports RPC, allowing you to interact with the database programmatically over a network.

1. **Set up an RPC client**: Depending on your programming language, you can use various libraries to create an RPC client. Here is an example using JavaScript with the `node-fetch` library:

   ```javascript
   const fetch = require('node-fetch');

   async function querySurrealDB() {
     // Create a new person record
     await fetch('http://localhost:8000/rpc', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         method: 'query',
         params: ['CREATE person SET name = "John Doe"; SELECT * FROM person;'],
       }),
     });

     const data = await response.json();
   }

   querySurrealDB();
   ```

2. **Execute the RPC call**: Run your script to send the RPC request and receive the response from SurrealDB.

<div class="flag-title mt-14">
	<Image
		alt="GraphQL"
		width={42}
		height={42}
		src={{
			light: LightGql,
			dark: DarkGql,
		}}
	/>
	# GraphQL
</div>

<Since v="v2.0.0" />

SurrealDB also supports GraphQL, allowing you to interact with the database using the familiar syntax. Currently, you can use the [GraphQL integration via Surrealist](/docs/surrealdb/querying/graphql/surrealist), our intuitive user interface specifically designed for SurrealDB, or [over HTTP](/docs/surrealdb/querying/graphql/http) via a GraphQL Client such as [GraphiQL](https://github.com/graphql/graphiql) or [Postman](/docs/surrealdb/querying/graphql/http#postman) at the `localhost:8000/graphql` endpoint.

With Surrealist, you can easily connect to any SurrealDB instance, execute queries in real time, explore your tables, and design your schemas - all in one place.

The GraphQL view allows you to define and retrieve only the data you need, giving you more control and efficiency in how you interact with your database.

### Getting Started

To get started with GraphQL, you can use the GraphQL integration in Surrealist. Once you have connected to your SurrealDB instance, you can explore your tables, execute queries, and manage your data in a user-friendly interface.

### Querying Options

When using GraphQL, there are several options available to interact with your database instance depending on your environment and needs.

- **Surrealist**: [Surrealist](https://app.surrealdb.com/) is an interactive environment that allows you to experiment with SurrealQL statements and see the results in a tabular format. It is a great tool for learning about the syntax and features of SurrealQL and for developing your queries and scripts.

- **HTTP**: You can [send HTTP requests to the `/graphql` endpoint](/docs/surrealdb/querying/graphql/http) to execute GraphQL queries. This method is useful for integrating SurrealDB with web applications and services that communicate over HTTP.


## SDKs

Another way to interact with SurrealDB is to use one of the available SDKs. The SDKs provide a convenient way to query data, insert records, and manage database operations programmatically.

SurrealDB offers a variety of SDKs that allow you to interact with the database programmatically. These SDKs provide a convenient and efficient way to query data, insert records, and manage database operations using your preferred programming language.

### Available SDKs

SurrealDB supports SDKs for several popular programming languages, including:

- **JavaScript/TypeScript**: The [JavaScript/TypeScript SDK](/docs/sdk/javascript/core/create-a-new-connection) allows you to interact with SurrealDB from web applications, Node.js environments, and other JavaScript-based platforms. It provides a comprehensive set of methods to perform queries, manage records, and handle database transactions.

- **Python**: The [Python SDK](/docs/sdk/python) offers a seamless way to integrate SurrealDB with your Python applications. Whether you are building web applications, data analysis tools, or automation scripts, the Python SDK provides the necessary functions to interact with the database efficiently.

- **.NET**: The [.NET SDK](/docs/sdk/dotnet) allows you to interact with SurrealDB using the .NET framework. It provides a comprehensive set of methods to perform queries, manage records, and handle database transactions, making it suitable for building robust and scalable applications.

- **Rust**: The [Rust SDK](/docs/sdk/rust/setup) leverages the safety and performance features of the Rust programming language. It allows you to interact with SurrealDB in a type-safe manner, ensuring that your database operations are both efficient and reliable.

### Getting Started with SDKs

To get started with any of the SDKs, you need to install the appropriate package for your programming language. Once installed, you can initialize the SDK and connect to your SurrealDB instance. Here is an example of how to get started with the JavaScript SDK:

```javascript
import { Surreal } from 'surrealdb';

const db = new Surreal('http://localhost:8000');

await db.connect('root', 'root');

type Person = {
	id: string;
	name: string;
};

// Assign the variable on the connection
const result = await db.query<[Person[], Person[]]>(
	'CREATE person SET name = "John"; SELECT * FROM type::table($tb);',
	{ tb: 'person' }
);

// Get all of the results from the second query
const people = result[1].result;
```

## Learn More

To learn more about the available options for querying data in SurrealDB, explore the following resources:

- [SurrealQL documentation](/docs/surrealql)
- [Surrealist documentation](/docs/surrealist)

---
sidebar_position: 3
sidebar_label: Querying via SDKs
title: SurrealQL via SDKs
description: In this section, you will explore SurrealQL, a powerful database query language that closely resembles traditional SQL but comes with unique differences and improvements.
---

import Tabs from "@components/Tabs/Tabs.astro";
import TabItem from "@components/Tabs/TabItem.astro";
import Boxes from "@components/boxes/Boxes.astro";
import IconBox from "@components/boxes/IconBox.astro";
import Image from "@components/Image.astro";

import LightRust from "@img/icon/light/rust.png";
import LightJavaScript from "@img/icon/light/javascript.png";
import LightTypescript from "@img/icon/light/typescript.png";
import LightPython from "@img/icon/light/python.png";
import LightNodejs from "@img/icon/light/nodejs.png";
import LightDotnet from "@img/icon/light/dotnet.png";
import LightGolang from "@img/icon/light/golang.png";
import LightJava from "@img/icon/light/java.png";
import LightPhp from "@img/icon/light/php.png";

import DarkRust from "@img/icon/dark/rust.png";
import DarkJavaScript from "@img/icon/dark/javascript.png";
import DarkTypescript from "@img/icon/dark/typescript.png";
import DarkPython from "@img/icon/dark/python.png";
import DarkNodejs from "@img/icon/dark/nodejs.png";
import DarkDotnet from "@img/icon/dark/dotnet.png";
import DarkGolang from "@img/icon/dark/golang.png";
import DarkJava from "@img/icon/dark/java.png";
import DarkPhp from "@img/icon/dark/php.png";
import Label from "@components/shared/Label.astro";

# Querying via SDKs

SurrealDB supports a number of methods for connecting to the database and performing data queries. Each SDK has its own set of methods for connecting to the database and performing data queries.

In each SDK, you can connect to the database using a local or remote connection. Once you are connected, you can start performing data queries. Here is a list of all the Supported SDKs:

<Boxes>
    <IconBox
        title="Rust"
        status="available"
        href="/docs/sdk/rust"
        icon={{
                light: LightRust,
                dark: DarkRust,
        }}
    />
    <IconBox
        title="JavaScript"
        status="available"
        href="/docs/sdk/javascript/core/create-a-new-connection"
        icon={{
                light: LightJavaScript,
                dark: DarkJavaScript,
        }}
    />
    <IconBox
        title="TypeScript"
        status="available"
        href="/docs/sdk/javascript/core/create-a-new-connection"
        icon={{
                light: LightTypescript,
                dark: DarkTypescript,
        }}
    />
    <IconBox
        title="Python"
        status="available"
        href="/docs/sdk/python"
        icon={{
                light: LightPython,
                dark: DarkPython,
        }}
    />
    <IconBox
        title="Node.js"
        status="available"
        href="/docs/sdk/javascript/engines/node"
        icon={{
                light: LightNodejs,
                dark: DarkNodejs,
        }}
    />
    <IconBox
        title=".NET"
        status="available"
        href="/docs/sdk/dotnet"
        icon={{
                light: LightDotnet,
                dark: DarkDotnet,
        }}
    />
    <IconBox
        title="Golang"
        status="available"
        href="/docs/sdk/golang"
        icon={{
                light: LightGolang,
                dark: DarkGolang,
        }}
    />
    <IconBox
        title="Java"
        status="available"
        href="/docs/sdk/java"
        icon={{
                light: LightJava,
                dark: DarkJava,
        }}
    />
    <IconBox
        title="PHP"
        status="available"
        href="/docs/sdk/php"
        icon={{
                light: LightPhp,
                dark: DarkPhp,
        }}
    />
</Boxes>

## Writing SurrealQL queries in SDKs

While you can use the other methods provided by the SDKs to perform data queries, you can use the `query` method to run [SurrealQL statements](/docs/surrealql) against the database.


<Tabs groupId="query-methods">
  <TabItem value="JS" label="Javascript" default>

```ts title="Method Syntax"
async db.query<T>(query, vars)
```

#### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Arguments</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>query</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Specifies the SurrealQL statements.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>vars</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Assigns variables which can be used in the query.
            </td>
        </tr>
    </tbody>
</table>

#### Example usage
```ts
type Person = {
	id: string;
	name: string;
};

// Assign the variable on the connection
const result = await db.query<[Person[], Person[]]>(
	'CREATE person SET name = "John"; SELECT * FROM type::table($tb);',
	{ tb: 'person' }
);

// Get the first result from the first query
const created = result[0].result[0];

// Get all of the results from the second query
const people = result[1].result;
```

`.query_raw()`

With `.query_raw()`, you will get back the raw RPC response. In contrast to the `.query()` method, this will not throw errors that occur in individual queries, but will rather give those back as a string, and this will include the time it took to execute the individual queries.


</TabItem>
<TabItem value="PHP" label="PHP">

```php title="Method Syntax"
$db->query($query, $vars)
```

#### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Arguments</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>$query</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Specifies the SurrealQL statements.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>$vars</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Assigns variables which can be used in the query.
            </td>
        </tr>
    </tbody>
</table>

#### Example usage
```php
// Assign the variable on the connection
$result = db->query(
	'CREATE person SET name = "John"; SELECT * FROM type::table($tb);',
	[ "tb" => "person" ]
);

// Get the first result from the first query
$created = $result[0]->result[0];

// Get all of the results from the second query
$people = $result[1]->result;
```
</TabItem>
<TabItem value="Python" label="Python">

```python title="Method Syntax"
db.query(sql, vars)
```

#### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Arguments</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>sql</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Specifies the SurrealQL statements.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>vars</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Assigns variables which can be used in the query.
            </td>
        </tr>
    </tbody>
</table>

#### Example usage
```python
# Assign the variable on the connection
result = await db.query('CREATE person; SELECT * FROM type::table($tb)', {
	'tb': 'person',
})
# Get the first result from the first query
result[0]['result'][0]
# Get all of the results from the second query
result[1]['result']
```

</TabItem>
<TabItem value="Dotnet" label=".NET">

```csharp title="Method Syntax"
await db.Query(sql)
```

#### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Arguments</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="col" data-label="Arguments">
                <code>sql</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="col" data-label="Description">
                Specifies the SurrealQL statements.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="col" data-label="Arguments">
                <code>cancellationToken</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="col" data-label="Description">
                The cancellationToken enables graceful cancellation of asynchronous operations.
            </td>
        </tr>
    </tbody>
</table>
<br/>

#### Example usage

```csharp
// Execute query with params
const string table = "person";
var result = await db.Query($"CREATE person; SELECT * FROM type::table({table});");

// Get the first result from the first query
var created = result.GetValue<Person>(0);

// Get all of the results from the second query
var people = result.GetValue<List<Person>>(1);
```

<br />

`.RawQuery()` : Runs a set of SurrealQL statements against the database, based on a raw SurrealQL query.

```csharp title="Method Syntax"
await db.RawQuery(sql, params)
```

#### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Arguments</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="col" data-label="Arguments">
                <code>sql</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="col" data-label="Description">
                Specifies the SurrealQL statements.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="col" data-label="Arguments">
                <code>params</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="col" data-label="Description">
                Assigns variables which can be used in the query.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="col" data-label="Arguments">
                <code>cancellationToken</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="col" data-label="Description">
                The cancellationToken enables graceful cancellation of asynchronous operations.
            </td>
        </tr>
    </tbody>
</table>

#### Example usage
```csharp
// Assign the variable on the connection
var @params = new Dictionary<string, object> { { "table", "person" } };
var result = await db.RawQuery("CREATE person; SELECT * FROM type::table($table);", @params);

// Get the first result from the first query
var created = result.GetValue<Person>(0);

// Get all of the results from the second query
var people = result.GetValue<List<Person>>(1);
```

</TabItem>
<TabItem value="Golang" label="Golang">

```go title="Method Syntax"
db.Query(sql, vars)
```

#### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Arguments</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>sql</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Specifies the SurrealQL statements.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>vars</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Assigns variables which can be used in the query.
            </td>
        </tr>
    </tbody>
</table>

#### Example usage
```go
// Assign the variable on the connection
result, err := db.Query("CREATE person; SELECT * FROM type::table($tb);", map[string]string{
	"tb": "person"
});
```
</TabItem>
<TabItem value="Rust" label="Rust">

```rust title="Method Syntax"
db.query(sql).bind(vars)
```

#### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Arguments</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>sql</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Specifies the SurrealQL statements.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>vars</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Assigns variables which can be used in the query.
            </td>
        </tr>
    </tbody>
</table>

#### Example usage
```rust
// Run some queries
let sql = "
    CREATE person;
    SELECT * FROM type::table($table);
";
let mut result = db
    .query(sql)
    .bind(("table", "person"))
    .await?;
// Get the first result from the first query
let created: Option<Person> = result.take(0)?;
// Get all of the results from the second query
let people: Vec<Person> = result.take(1)?;
```

</TabItem>
</Tabs>

## Learn more

Learn more about the [SurrealQL query language](/docs/surrealql).

Method Syntax
db.query(sql, vars)
Arguments
Arguments	Description
sqlrequired	
Specifies the SurrealQL statements.

varsoptional	
Assigns variables which can be used in the query.

Example usage
# Assign the variable on the connection
result = await db.query('CREATE person; SELECT * FROM type::table($tb)', {
	'tb': 'person',
})
# Get the first result from the first query
result[0]['result'][0]
# Get all of the results from the second query
result[1]['result']

Method Syntax
await db.Query(sql)
Arguments
Arguments	Description
sqlrequired	
Specifies the SurrealQL statements.

cancellationTokenoptional	
The cancellationToken enables graceful cancellation of asynchronous operations.


Example usage
// Execute query with params
const string table = "person";
var result = await db.Query($"CREATE person; SELECT * FROM type::table({table});");

// Get the first result from the first query
var created = result.GetValue<Person>(0);

// Get all of the results from the second query
var people = result.GetValue<List<Person>>(1);

.RawQuery() : Runs a set of SurrealQL statements against the database, based on a raw SurrealQL query.

Method Syntax
await db.RawQuery(sql, params)
Arguments
Arguments	Description
sqlrequired	
Specifies the SurrealQL statements.

paramsoptional	
Assigns variables which can be used in the query.

cancellationTokenoptional	
The cancellationToken enables graceful cancellation of asynchronous operations.

Example usage
// Assign the variable on the connection
var @params = new Dictionary<string, object> { { "table", "person" } };
var result = await db.RawQuery("CREATE person; SELECT * FROM type::table($table);", @params);

// Get the first result from the first query
var created = result.GetValue<Person>(0);

// Get all of the results from the second query
var people = result.GetValue<List<Person>>(1);

Method Syntax
db.Query(sql, vars)
Arguments
Arguments	Description
sqlrequired	
Specifies the SurrealQL statements.

varsoptional	
Assigns variables which can be used in the query.

Example usage
// Assign the variable on the connection
result, err := db.Query("CREATE person; SELECT * FROM type::table($tb);", map[string]string{
	"tb": "person"
});

Method Syntax
db.query(sql).bind(vars)
Arguments
Arguments	Description
sqlrequired	
Specifies the SurrealQL statements.

varsoptional	
Assigns variables which can be used in the query.

Example usage
// Run some queries
let sql = "
    CREATE person;
    SELECT * FROM type::table($table);
";
let mut result = db
    .query(sql)
    .bind(("table", "person"))
    .await?;
// Get the first result from the first query
let created: Option<Person> = result.take(0)?;
// Get all of the results from the second query
let people: Vec<Person> = result.take(1)?;

---
sidebar_position: 2
sidebar_label: GraphQL
title: GraphQL
description: In this section, you will explore GraphQL, an industry-wide recognised protocol for interacting with your data, allowing you to query your data using any preferred method which offers precision and efficiency in data retrieval.
---

import Image from "@components/Image.astro";
import LightGql from "@img/icon/light/gql.png";
import DarkGql from "@img/icon/dark/gql.png";

<div class="flag-title">
	<Image
		alt="GraphQL"
		width={42}
		height={42}
		src={{
			light: LightGql,
			dark: DarkGql,
		}}
	/>
	# GraphQL
</div>

In this section, you will explore [GraphQL](https://graphql.org/), an industry-wide recognised protocol for interacting with your data, allowing you to query your data using any preferred method which offers precision and efficiency in data retrieval. And in combination with Surrealist, you can now manage your data in a user-friendly environment to simplify complex operations.

In SurrealDB, you can use GraphQL to query your data in Surrealist, a user-friendly interface specifically designed for SurrealDB.

## Key Features

GraphQL offers a number of key features that make it a powerful tool for working with SurrealDB:

- **Declarative Data Fetching**: GraphQL allows you to request exactly the data you need, no more and no less. This reduces over-fetching and under-fetching of data, leading to more efficient queries.

- **Strongly Typed Schema**: GraphQL uses a strong type system to define the capabilities of an API. This schema serves as a contract between the client and the server, ensuring that queries are valid before execution.

- **Hierarchical Structure**: GraphQL queries mirror the shape of the data they return, making it intuitive to work with nested data structures.

- **Single Endpoint**: When using GraphQL over HTTP, it typically uses a single endpoint, simplifying API architecture and reducing network overhead.

- **Ecosystem and Tools**: GraphQL has a rich ecosystem of tools for development, testing, and monitoring, including GraphiQL for query exploration and Apollo Client for state management.


## Getting Started

To start using [GraphQL](https://www.graphql.com/), we recommend using [Surrealist](https://app.surrealdb.com/), our interactive environment that allows you to experiment with GraphQL queries and see the results immediately in the UI.

If you prefer using a GraphQL Client such as GraphiQL or Postman, you can use the GraphQL integration at the `localhost:8000/graphql` endpoint.

---
sidebar_position: 1
sidebar_label: GraphQL via Surrealist
title: GraphQL via Surrealist | GraphQL
description: In this section, you will explore interating with your SurrealDB instance using GraphQL queries using Surrealist, the official query editor for SurrealDB. Surrealist is a powerful tool that allows you to write, execute, and visualize GraphQL queries in real-time.
---

import Tabs from "@components/Tabs/Tabs.astro";
import TabItem from "@components/Tabs/TabItem.astro";
import Image from "@components/Image.astro";

import ImageConnection from "@img/image/surrealist/connection.png";
import ImageQuerying from "@img/image/surrealist/graphql-querying-fields.png";
import ImageTypeInference from "@img/image/surrealist/graphql-type-inference.png";


# GraphQL via Surrealist

In this section, you will explore writing GraphQL queries in [Surrealist](https://app.surrealdb.com/query). The GraphQL query view in Surrealist provides a rich set of features, including syntax highlighting, query validation, and query execution. You can see the results of your queries in JSON structure returned by GraphQL.

## Getting Started

Before you can start making queries, you need to start SurrealDB with the GraphQL module enabled. You can do this by setting the `SURREAL_CAPS_ALLOW_EXPERIMENTAL` [environment variable](/docs/surrealdb/cli/env) to `graphql` and starting a new instance of SurrealDB with the [`surreal start` command](/docs/surrealdb/cli/start).

<Tabs groupId="start-surreal">
<TabItem value="macOS" label="MacOS">
```bash
# From greater than or equal to V2.2.0
SURREAL_CAPS_ALLOW_EXPERIMENTAL=graphql surreal start --log debug --user root --password root

# From versions lower than V2.2.0
SURREAL_EXPERIMENTAL_GRAPHQL = "true" surreal start --log debug --user root --password root
```
</TabItem>
<TabItem value="Windows" label="Windows">
```bash
# From greater than or equal to V2.2.0
$env:SURREAL_CAPS_ALLOW_EXPERIMENTAL=graphql surreal start --log debug --user root --password root

# From versions lower than V2.2.0
$env:SURREAL_EXPERIMENTAL_GRAPHQL = "true" surreal start --log debug --user root --password root
```
</TabItem>
</Tabs>

> [!WARNING]
> By running SurrealDB with the GraphQL module enabled, you are opting into an experimental feature. While the GraphQL module is fully functional, it is still considered experimental and may not be as stable as the core SurrealQL module which means we cannot guarantee that it will provide the same security guarantees. It is not recommended for production use. We welcome your feedback and contributions to help improve the feature and make it more robust.

After starting the SurrealDB instance, you can navigate to the Surrealist to start a new connection.

### Start a new connection

In the top left corner of the Surrealist, start a new connection. Ensure that the connection information is the same as the one you used to start the SurrealDB instance. In the example above we have set the user to `root` and the password to `root`.

> [!IMPORTANT]
> In the Surrealist sandbox, querying via GraphQL is not supported.


Learn more about starting a connection in the [Surrealist documentation](/docs/surrealist/getting-started).

### Setting a namespace and database

Before you can start writing queries, you need to set the [namespace](/docs/surrealdb/introduction/concepts/namespace) and [database](/docs/surrealdb/introduction/concepts/database) you want to use. For example you can set the namespace to `test` and the database to `test`. This will set the namespace and database for the current connection.

Additionally, you can start [a serving in Surrealist](/docs/surrealist/concepts/local-database-serving) which also enables GraphQL automatically, which starts a server on `http://localhost:8000` by default for a root user with username and password `root`.

<Image
  alt="Surrealist connection settings"
  src={ImageConnection}
/>

### Preparing your database

Next, use the [SurrealQL query editor](/docs/surrealist/concepts/sending-queries) to create some data. For example, you can create a new `user` table with fields for `firstName`, `lastName`, and `email` and add a new user to the database.

In order to allow querying the created table using GraphQL, you will need to explicitly enable GraphQL using the [`DEFINE CONFIG`](/docs/surrealql/statements/define/config) statement. This will allow you to query the table using GraphQL on a per-database basis.

```surql title="Creating a user table"

DEFINE TABLE user SCHEMAFULL;

-- Enable GraphQL for the user table.
DEFINE CONFIG GRAPHQL AUTO;

-- Define some fields.
DEFINE FIELD firstName ON TABLE user TYPE string;
DEFINE FIELD lastName ON TABLE user TYPE string;
DEFINE FIELD email ON TABLE user TYPE string
  ASSERT string::is::email($value);
DEFINE INDEX userEmailIndex ON TABLE user COLUMNS email UNIQUE;

-- Create a new User
CREATE user CONTENT {
    firstName: 'Jon',
    lastName: 'Doe',
    email: 'Jon.Doe@surrealdb.com',
};
```

> [!IMPORTANT]
> You can only use GraphQL to query data from explicitly defined resources for a given table. That is, you must use the [`DEFINE TABLE` statement](/docs/surrealql/statements/define/table) to define the table, and [`DEFINE FIELD` statement](/docs/surrealql/statements/define/field) to define the fields for the table. As such, in schemaless mode, since the fields are not explicitly defined, you cannot query them using GraphQL.

## Write your first GraphQL query

After you have created some data, you can start writing GraphQL queries. You can use the [Surrealist GraphQL editor](https://app.surrealdb.com/graphql) to write your GraphQL queries.

For example, to query the `person` table for all records, you can write the following GraphQL query:

```graphql
{
    user {
        firstName
        lastName
        email
    }
}
```

<Image
  alt="Surrealist GraphQL query"
  src={ImageQuerying}
/>

and to get the person with the email "Jon.Doe@surrealdb.com", you can write the following GraphQL query:

```graphql
{
    user(filter: {email: {eq: "Jon.Doe@surrealdb.com"}}) {
        firstName
        lastName
    }
}
```

Surrealist will automatically validate the query and provide you with the results.

## Introspection

Surrealist also supports introspection with GraphQL. This means that you can query the database and Surrealist will automatically infer the type of the data you are querying. For example, if you query the `user` table for all records, Surrealist will automatically infer the type of the data to be `user`.

<Image
  alt="Surrealist GraphQL type inference"
  src={ImageTypeInference}
/>

## Learn more

To learn more about the GraphQL view in Surrealist, check out the [Surrealist documentation](/docs/surrealist).

---
sidebar_position: 2
sidebar_label: GraphQL via HTTP
title: GraphQL via HTTP | GraphQL
description: In this section, you will explore querying SurrealDB using the GraphQL HTTP endpoint. The HTTP API is designed to be simple and intuitive, with any interface that provides a consistent way to interact with the database.
---

import Tabs from "@components/Tabs/Tabs.astro";
import TabItem from "@components/Tabs/TabItem.astro";
import Since from '@components/shared/Since.astro';
import Label from "@components/shared/Label.astro";

# GraphQL via HTTP

SurrealDB provides a powerful HTTP API that allows you to interact with the database programmatically. This API can be used to perform a wide range of database operations, from querying data to modifying records and managing database structures.

The HTTP API is designed to be simple and intuitive, with a RESTful interface that provides a consistent way to interact with the database. You can use the API to perform a wide range of database operations, from querying data to modifying records and managing database structures.

## Starting a new connection

Before you can start making queries, you need to start SurrealDB with the GraphQL module enabled. You can do this by setting the `SURREAL_CAPS_ALLOW_EXPERIMENTAL` [environment variable](/docs/surrealdb/cli/env) to `graphql` and starting a new instance of SurrealDB with the [`surreal start` command](/docs/surrealdb/cli/start).


<Tabs groupId="start-surreal">
<TabItem value="macOS" label="MacOS">
```bash
# From greater than or equal to V2.2.0
SURREAL_CAPS_ALLOW_EXPERIMENTAL=graphql surreal start --log debug --user root --password root

# From versions lower than V2.2.0
SURREAL_EXPERIMENTAL_GRAPHQL = "true" surreal start --log debug --user root --password root
```
</TabItem>
<TabItem value="Windows" label="Windows">
```bash
# From greater than or equal to V2.2.0
$env:SURREAL_CAPS_ALLOW_EXPERIMENTAL=graphql surreal start --log debug --user root --password root

# From versions lower than V2.2.0
$env:SURREAL_EXPERIMENTAL_GRAPHQL = "true" surreal start --log debug --user root --password root
```
</TabItem>
</Tabs>

In order to allow querying the created table using GraphQL, you will need to explicitly enable GraphQL using the [`DEFINE CONFIG`](/docs/surrealql/statements/define/config) statement. This will allow you to query the table using GraphQL on a per-database basis.

> [!WARNING]
> By running SurrealDB with the GraphQL module enabled, you are opting into an experimental feature. While the GraphQL module is fully functional, it is still considered experimental and may not be as stable as the core SurrealQL module which means we cannot guarantee that it will provide the same security guarantees. It is not recommended for production use. We welcome your feedback and contributions to help improve the feature and make it more robust.


## `POST /sql`

To use the GraphQL API, you first need to enable it using the `DEFINE CONFIG` statement. This will allow you to query the table using GraphQL on a per-database basis.

To do this, you can send a `POST` request to the `/sql` endpoint with a RAW body containing the `DEFINE CONFIG` statement. For example:

```surrealql title="Enabling GraphQL"
DEFINE CONFIG GRAPHQL AUTO;
```


## `POST /graphql`

<Since v="v2.0.0" />

To use the GraphQL API, you can send a `POST` request to the `/graphql` endpoint with a JSON body containing the GraphQL query. For example, to query the `person` table for all records, you can send the following request:

```json
{
  "query": "{ person { name } }"
}
```

You can access this endpoint at `http://localhost:8000/graphql` via Postman or any other HTTP client.



The GraphQL endpoint enables use of GraphQL queries to interact with your data.

### Headers
<table>
    <thead>
        <tr>
            <th colspan="2">Header</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Authorization</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            Sets the root, namespace, database, or record authentication data
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Accept</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the desired content-type of the response
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>surreal-ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>surreal-db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```bash title="Request"
curl -X POST -u "root:root" -H "surreal-ns: mynamespace" -H "surreal-db: mydatabase" -H "Accept: application/json" -d '{"query": "{ person(filter: {age: {age_gt: 18}}) { id name age } }"}' http://localhost:8000/graphql
```

```json title="Response"
[
	{
		"time": "14.357166ms",
		"status": "OK",
		"result": [
			{
				"age": "23",
				"id": "person:6r7wif0uufrp22h0jr0o"
				"name": "Simon",
			},
			{
				"age": "28",
				"id": "person:6r7wif0uufrp22h0jr0o"
				"name": "Marcus",
			},
		]
	}
]
```

---
sidebar_position: 1
sidebar_label: SurrealQL
title: SurrealQL
description: In this section, you will explore using SurrealQL, a powerful database query language that closely resembles traditional SQL but comes with unique differences and improvements to query data in SurrealDB.
---

import Image from "@components/Image.astro";
import LightLogo from "@img/icon/light/surrealql.png";
import DarkLogo from "@img/icon/dark/surrealql.png";
import ImageSurrealist from "@img/image/surrealist/query-new.png";

<div class="flag-title">
	<Image
		alt="SurrealQL"
		width={42}
		height={42}
		src={{
			light: LightLogo,
			dark: DarkLogo,
		}}
	/>
	# SurrealQL
</div>

In this section, you will explore [SurrealQL](/docs/surrealql), a powerful database query language that closely resembles traditional SQL but comes with unique differences and improvements.

[SurrealQL](/docs/surrealql) is designed to provide developers with a seamless and intuitive way to interact with SurrealDB. It offers a familiar syntax and supports various statement types, allowing you to perform complex database operations efficiently.

While SurrealQL shares similarities with traditional SQL, it introduces enhancements and optimizations that make it well-suited for working with SurrealDB's advanced features. Whether you are querying data, modifying records, or managing database structures, SurrealQL provides a comprehensive set of capabilities to meet your needs.


## Getting Started

To start using SurrealQL, [refer to the documentation on the various statement types and their syntax](/docs/surrealql/statements). The statements page provides comprehensive examples and explanations for each statement type, helping you understand how to construct queries and interact with SurrealDB effectively.

We hope that SurrealQL empowers you to leverage the full potential of SurrealDB and enables you to build robust and scalable applications. Let's dive into the world of SurrealQL and unlock the capabilities of SurrealDB together!

## Key Features

SurrealQL offers several key features that make it a powerful tool for working with SurrealDB:

- **Familiar Syntax**: SurrealQL adopts a syntax similar to traditional SQL, making it easy for developers familiar with SQL to transition to SurrealDB seamlessly.

- **Advanced Querying**: SurrealQL supports a wide range of querying capabilities, including filtering, sorting, aggregating, and joining data from multiple tables.

- **Data Manipulation**: With SurrealQL, you can easily insert, update, and delete records in your SurrealDB database, allowing you to manage your data effectively.

- **Graph relationships**: SurrealQL supports graph relationships, allowing you to define and query relationships between records in your database.

- **Schema Management**: SurrealQL provides features for creating and modifying database schemas, allowing you to define the structure of your data and enforce data integrity.

- **Performance Optimization**: SurrealQL incorporates optimizations specific to SurrealDB, ensuring efficient execution of queries and minimizing resource usage.

<Image
  alt="Surrealist query view"
  src={ImageSurrealist}
/>

## Resources

To learn more about SurrealQL and how to use it effectively, check out the following resources:

- [SurrealQL documentation](/docs/surrealql)
- [SurrealQL statements](/docs/surrealql/statements)
- [SurrealQL database functions](/docs/surrealql/functions/database)
- [SurrealQL operators](/docs/surrealql/operators)

---
sidebar_position: 1
sidebar_label: SurrealQL via Surrealist
title: SurrealQL via Surrealist | SurrealQL
description: In this section, you will explore SurrealQL queries using Surrealist, the official query editor for SurrealDB. Surrealist is a powerful tool that allows you to write, execute, and visualize SurrealQL queries in real-time.
---

# SurrealQL via Surrealist

In this section, you will explore writing [SurrealQL](/docs/surrealql) queries using [Surrealist](https://app.surrealdb.com/query), the official query editor for SurrealDB. Surrealist is a powerful tool that allows you to write, execute, and visualize SurrealQL queries in real-time.

The Surrealist query editor provides a rich set of features, including syntax highlighting, query validation, and query execution. You can also view the query results in a tabular format, making it easy to analyze and visualize the data.


> [!IMPORTANT]
> Learn more about SurrealQL by exploring the [SurrealQL documentation](/docs/surrealql).

## Getting Started

To get started with SurrealQL in Surrealist, go to the [Surrealist Query Editor](https://app.surrealdb.com/query) and start writing your SurrealQL queries. You can use the query editor to write queries, execute them, and view the results in real-time.


### Setting up a connection

In order to interact with a SurrealDB database you must first create a connection. Connections store the details required to connect to a database, such as the endpoint, namespace, database, and authentication details. When you select an active connection in Surrealist, you will connect to the database and be able to interact with it using the available interface views.

After opening a connection, you can switch to another connection at any time by pressing the connection name in the top left of the interface. This will open the connection list allowing you to switch to another connection, or create a new one.

Within the connection list you will also find a special connection called Sandbox, which is always available and allows you to test and experiment without storing data persistently. This connection is useful for learning SurrealQL, testing queries, and more. The Sandbox connection is designed for simple testing and not for evaluating performance, as it is limited to a single thread within the browser's WebAssembly engine.

You can also create a new custom connection, this will allow you to connect to a remote SurrealDB instance, or a local instance this will also require you to set the namespace and database.


### Setting a namespace and database for connections.

If you are using a connection (local or remote), before you can start writing queries, you need to set the [namespace](/docs/surrealdb/introduction/concepts/namespace) and [database](/docs/surrealdb/introduction/concepts/database) for the connection.

For example you can set the namespace to `test` and the database to `test`. This will set the namespace and database for the current connection.

### Writing a query

Once you have a connection open you can use the SurrealQL query editor to create some data. For example, you can create a new record in the person table.

```surql
CREATE person SET name = "John", age = 30;
```

In the query editor, you can use syntax highlighting, code completion, and validation to help you write your queries more efficiently. To execute a query, press the run query button at the bottom of the query editor.


## Learn more

To learn more about SurrealQL and how to write queries using Surrealist, check out the [Surrealist documentation](/docs/surrealist).

---
sidebar_position: 2
sidebar_label: SurrealQL via HTTP
title: SurrealQL via HTTP | SurrealQL
description: In this section, you will explore querying SurrealDB using HTTP. The HTTP API is designed to be simple and intuitive, with a RESTful interface that provides a consistent way to interact with the database.
---

import Tabs from "@components/Tabs/Tabs.astro";
import TabItem from "@components/Tabs/TabItem.astro";
import Label from "@components/shared/Label.astro";

# SurrealQL via HTTP

SurrealDB provides a powerful HTTP API that allows you to interact with the database programmatically. This API can be used to perform a wide range of database operations, from querying data to modifying records and managing database structures.

The HTTP API is designed to be simple and intuitive, with a RESTful interface that provides a consistent way to interact with the database. You can use the API to perform a wide range of database operations, from querying data to modifying records and managing database structures.




## Using curl `POST /sql`

The `/sql` endpoint enables use of SurrealQL queries.


> [!IMPORTANT]
> This HTTP endpoint expects the HTTP body to be a set of SurrealQL statements.

### Headers

<Tabs groupId="http-sql">

<TabItem value="V1" label="V1.x" >
<table>
    <thead>
        <tr>
            <th colspan="2">Header</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Authorization</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            Sets the root, namespace, database, or record authentication data
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Accept</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the desired content-type of the response
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>DB</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" default>
<table>
    <thead>
        <tr>
            <th colspan="2">Header</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Authorization</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            Sets the root, namespace, database, or record authentication data
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Accept</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the desired content-type of the response
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>surreal-ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>surreal-db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>
</Tabs>


### Example usage


> [!IMPORTANT]
> The `-u` in the example below is a shorthand used by curl to send an Authorization header.

<Tabs groupId="http-sql">
  <TabItem value="V1" label="V1.x">

```bash title="Request"
curl -X POST -u "root:root" -H "NS: mynamespace" -H "DB: mydatabase" -H "Accept: application/json" -d "SELECT * FROM person WHERE age > 18" http://localhost:8000/sql
```

</TabItem>
<TabItem value="V2" label="V2.x" default>
```bash title="Request"
curl -X POST -u "root:root" -H "surreal-ns: mynamespace" -H "surreal-db: mydatabase" -H "Accept: application/json" -d "SELECT * FROM person WHERE age > 18" http://localhost:8000/sql
```
</TabItem>
</Tabs>


```json title="Response"
[
	{
		"time": "14.357166ms",
		"status": "OK",
		"result": [
			{
				"age": "23",
				"id": "person:6r7wif0uufrp22h0jr0o"
				"name": "Simon",
			},
			{
				"age": "28",
				"id": "person:6r7wif0uufrp22h0jr0o"
				"name": "Marcus",
			},
		]
	}
]
```

## Using Postman

Postman is a popular tool for testing APIs. You can use it to send HTTP requests to your SurrealDB instance and perform various database operations.

1. **Set up Postman**: Download and install Postman from the [official website](https://www.postman.com/).

2. **Create a new request**: Open Postman and create a new HTTP request.

3. **Configure the request**:
   - Set the request method to `POST`.
   - Enter the URL of your SurrealDB instance, e.g., `http://localhost:8000/sql`.
   - In the [headers section](#headers), add a `Content-Type` header with the value `application/json`.
   - In the Body section, select `raw` and set the type to `Text`. Enter your SQL query, for example:

     ```json
     INFO for db
     ```

4. **Send the request**: Click the `Send` button to execute the query. You will see the response from SurrealDB in the lower section of the Postman interface.

## Learn more

Learn more about other [HTTP Endpoints](/docs/surrealdb/integration/http) available in SurrealDB. For a more detailed tutorial on using Postman with SurrealDB, refer to the [working with SurrealDB over HTTP via Postman tutorial](/docs/tutorials/working-with-surrealdb-over-http-via-postman).

---
sidebar_position: 3
sidebar_label: SurrealQL via CLI
title: SurrealQL via CLI | SurrealQL
description: In this section, you will explore SurrealQL queries using the SurrealDB CLI. The SurrealDB CLI provides a powerful command-line interface for writing, executing, and visualizing SurrealQL queries in real-time.
---
import Image from "@components/Image.astro";
import ImageStart from "@img/terminal-start.png";
import ImageSql from "@img/terminal-sql.png";

# SurrealQL via CLI

In this section, you will explore writing [SurrealQL](/docs/surrealql) queries using the SurrealDB CLI. To get started, you will need to install the SurrealDB CLI on your local machine. You can do this by following the instructions in the [installation section](/docs/surrealdb/cli).

The CLI provides allows you to write, execute, and visualize [SurrealQL](/docs/surrealql) queries in real-time.

## Getting Started

After installing the SurrealDB CLI, you can start writing SurrealQL queries by running the [`surreal start`](/docs/surrealdb/cli/start) command in your terminal. You can also add the `--help` flag to view the available options and commands.

To start a SurrealDB server, run the surreal start command, using the options below. This example serves the database at the default location (http://localhost:8000), with a username and password.

```bash
surreal start --endpoint http://localhost:8000 --user root --pass secret
```

The server is actively running, and should be left alone until you want to stop hosting the SurrealDB server.

<Image
    alt="Terminal start"
    src={{
        light: ImageStart,
        dark: ImageStart,
    }}
/>

## Running Queries

To run a SurrealQL query, In the new terminal, run the [`surreal sql`](/docs/surrealdb/cli/sql) command followed by the query you would like to execute. For example, to run a simple `SELECT` query, you can run the following command:

```bash title="Start a SurrealDB Shell with local endpoint"
surreal sql --endpoint http://localhost:8000 --ns test --db test
```

```bash title="Start a SurrealDB Shell with memory endpoint"
## Run query in memory
surreal sql --endpoint memory --ns test --db test
```
<Image
    alt="Terminal SQL"
    src={{
        light: ImageSql,
        dark: ImageSql,
    }}
/>

## Learn more

Learn more about the available commands and options in the [SurrealDB CLI documentation](/docs/surrealdb/cli).
