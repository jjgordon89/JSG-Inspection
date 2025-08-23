---
sidebar_position: 1
sidebar_label: Embedding
title: Embedding SurrealDB
description: In this section, you will find detailed instructions on how to embed SurrealDB into your application depending on your programming language.
---

# Embedding SurrealDB

In this section, you will find detailed instructions on how to embed SurrealDB into your application depending on your programming language.

The purpose of this section is to guide you through the process of embedding SurrealDB, ensuring that you have all the necessary dependencies and configurations in place to start using SurrealDB effectively.

Whether you are a beginner getting started with SurrealDB or an experienced user looking to set up SurrealDB in a new environment, this section will provide you with step-by-step instructions and best practices to ensure a smooth embedding process.

## Embedding languages

The following languages are supported:

- [Rust](/docs/surrealdb/embedding/rust)
- [JavaScript](/docs/surrealdb/embedding/javascript)
- [Python](/docs/surrealdb/embedding/python)



---
sidebar_position: 2
sidebar_label: Embedding SurrealDB in Rust
title: Embedding SurrealDB in Rust
description: In Rust, SurrealDB can be run as an in-memory database, it can persist data using a file-based storage engine, or on a distributed cluster.
---

import Image from "@components/Image.astro";
import LightLogo from "@img/icon/light/rust.png";
import DarkLogo from "@img/icon/dark/rust.png";
import Label from "@components/shared/Label.astro";

<div class="flag-title">
	<Image
		alt="Rust"
		width={42}
		height={42}
		src={{
			light: LightLogo,
			dark: DarkLogo,
		}}
	/>
	# Embedding in Rust
</div>

SurrealDB is designed to be run in many different ways, and environments. Due to the [separation of the storage and API layers](/docs/surrealdb/introduction/architecture), SurrealDB can be run in embedded mode, from within a number of different language environments. In Rust, SurrealDB can be run as an in-memory database, it can persist data using a file-based storage engine, or on a distributed cluster.

## Install the SDK

First, create a new project using `cargo new` and add the SurrealDB crate to your dependencies, enabling the key-value store you need:

```sh
# For an in memory database
cargo add surrealdb --features kv-mem

# For a RocksDB file
cargo add surrealdb --features kv-rocksdb

# For FoundationDB cluster (FoundationDB must be installed and the appropriate version selected)
cargo add surrealdb --features kv-fdb-7_1

# For a TiKV cluster (TiKV and other dependencies must be installed)
cargo add surrealdb --features kv-tikv
```

You will need to add the following additional dependencies:

```bash
cargo add serde --features derive
cargo add tokio --features macros,rt-multi-thread
```

<br />

## Connect to SurrealDB

Open `src/main.rs` and replace everything in there with the following code to try out some basic operations using the SurrealDB SDK with an embedded database. Look at [integrations to connect to a database](/docs/sdk/rust).

```rust
use serde::{Deserialize, Serialize};
use surrealdb::RecordId;
use surrealdb::Surreal;

// For an in memory database
use surrealdb::engine::local::Mem;

// For a RocksDB file
// use surrealdb::engine::local::RocksDb;

#[derive(Debug, Serialize)]
struct Name<'a> {
    first: &'a str,
    last: &'a str,
}

#[derive(Debug, Serialize)]
struct Person<'a> {
    title: &'a str,
    name: Name<'a>,
    marketing: bool,
}

#[derive(Debug, Serialize)]
struct Responsibility {
    marketing: bool,
}

#[derive(Debug, Deserialize)]
struct Record {
    #[allow(dead_code)]
    id: RecordId,
}

#[tokio::main]
async fn main() -> surrealdb::Result<()> {
    // Create database connection in memory
    let db = Surreal::new::<Mem>(()).await?;
    
    // Create database connection using RocksDB
    // let db = Surreal::new::<RocksDb>("path/to/database-folder").await?;

    // Select a specific namespace / database
    db.use_ns("test").use_db("test").await?;

    // Create a new person with a random id
    let created: Option<Record> = db
        .create("person")
        .content(Person {
            title: "Founder & CEO",
            name: Name {
                first: "Tobie",
                last: "Morgan Hitchcock",
            },
            marketing: true,
        })
        .await?;
    dbg!(created);

    // Update a person record with a specific id
    let updated: Option<Record> = db
        .update(("person", "jaime"))
        .merge(Responsibility { marketing: true })
        .await?;
    dbg!(updated);

    // Select all people records
    let people: Vec<Record> = db.select("person").await?;
    dbg!(people);

    // Perform a custom advanced query
    let groups = db
        .query("SELECT marketing, count() FROM type::table($table) GROUP BY marketing")
        .bind(("table", "person"))
        .await?;
    dbg!(groups);

    Ok(())
}
```

Run your program from the command line with:

```sh
cargo run
```

<br />

## SDK methods

The Rust SDK comes with a number of built-in functions.

<table>
    <thead>
        <tr>
            <th scope="col">Function</th>
            <th scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td scope="row" data-label="Function"><a href="#init"><code>Surreal::init()</code></a></td>
            <td scope="row" data-label="Description">Initialises a static database engine</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#connect"><code>db.connect(endpoint)</code></a></td>
            <td scope="row" data-label="Description">Connects to a specific database endpoint, saving the connection on the static client</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#new"><code>{"Surreal::new::<T>(endpoint)"}</code></a></td>
            <td scope="row" data-label="Description">Connects to a local or remote database endpoint</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#use-ns-db"><code>db.use_ns(namespace).use_db(database)</code></a></td>
            <td scope="row" data-label="Description">Switch to a specific namespace and database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#signup"><code>db.signup(credentials)</code></a></td>
            <td scope="row" data-label="Description">Signs up a user using a specific record access method</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#signin"><code>db.signin(credentials)</code></a></td>
            <td scope="row" data-label="Description">Signs this connection in using a specific access method or system user</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#invalidate"><code>db.invalidate()</code></a></td>
            <td scope="row" data-label="Description">Invalidates the authentication for the current connection</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#authenticate"><code>db.authenticate(token)</code></a></td>
            <td scope="row" data-label="Description">Authenticates the current connection with a JSON Web Token</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#set"><code>db.set(key, val)</code></a></td>
            <td scope="row" data-label="Description">Assigns a value as a parameter for this connection</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#query"><code>db.query(sql)</code></a></td>
            <td scope="row" data-label="Description">Runs a set of SurrealQL statements against the database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#select"><code>db.select(resource)</code></a></td>
            <td scope="row" data-label="Description">Selects all records in a table, or a specific record</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#create"><code>db.create(resource).content(data)</code></a></td>
            <td scope="row" data-label="Description">Creates a record in the database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#update-content"><code>db.update(resource).content(data)</code></a></td>
            <td scope="row" data-label="Description">Updates all records in a table, or a specific record</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#update-merge"><code>db.update(resource).merge(data)</code></a></td>
            <td scope="row" data-label="Description">Modifies all records in a table, or a specific record</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#update-patch"><code>db.update(resource).patch(data)</code></a></td>
            <td scope="row" data-label="Description">Applies JSON Patch changes to all records in a table, or a specific record</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#delete"><code>db.delete(resource)</code></a></td>
            <td scope="row" data-label="Description">Deletes all records, or a specific record</td>
        </tr>
    </tbody>
</table>

<br />

## `.init()` {#init}

The DB static singleton ensures that a single database instance is available across very large or complicated applications. With the singleton, only one connection to the database is instantiated, and the database connection does not have to be shared across components or controllers.

```rust title="Method Syntax"
Surreal::init()
```

### Example usage
```rust
static DB: LazyLock<Surreal<Client>> = LazyLock::new(Surreal::init);

#[tokio::main]
async fn main() -> surrealdb::Result<()> {
    // Connect to the database
    DB.connect::<Wss>("cloud.surrealdb.com").await?;
    // Select a namespace + database
    DB.use_ns("test").use_db("test").await?;
    // Create or update a specific record
    let tobie: Option<Record> = DB
        .update(("person", "tobie"))
        .content(Person { name: "Tobie" })
        .await?;
    Ok(())
}
```

<br />

## `.connect()` {#connect}

Connects to a local or remote database endpoint.

```rust title="Method Syntax"
db.connect(endpoint)
```

### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2">Argument</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Argument">
                <code>endpoint</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The database endpoint to connect to.
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```rust
// Connect to a local endpoint
DB.connect::<Ws>("127.0.0.1:8000").await?;
// Connect to a remote endpoint
DB.connect::<Wss>("cloud.surrealdb.com").await?;
```

<br />

## `.new()` {#new}

Connects to a local or remote database endpoint.

```rust title="Method Syntax"
Surreal::new::<T>(endpoint)
```

### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>endpoint</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The database endpoint to connect to.
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```rust
let db = Surreal::new::<Ws>("127.0.0.1:8000").await?;
```

<br />

## `.use_ns()` and `.use_db()` {#use-ns-db}

Switch to a specific namespace and database.

```rust title="Method Syntax"
db.use_ns(ns).use_db(db)
```

### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Switches to a specific namespace.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Switches to a specific database.
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```rust
db.use_ns("test").use_db("test").await?;
```

<br />

## `.signup()` {#signup}

Signs up using a specific record access method.

```rust title="Method Syntax"
db.signup(credentials)
```

### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>credentials</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Variables used in a signup query.
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```rust
use serde::Serialize;
use surrealdb::opt::auth::Scope;

#[derive(Serialize)]
struct Credentials<'a> {
    email: &'a str,
    pass: &'a str,
}

let jwt = db.signup(Scope {
    namespace: "test",
    database: "test",
    access: "user",
    params: Credentials {
        email: "info@surrealdb.com",
        pass: "123456",
    },
}).await?;

// ⚠️: It is important to note that the token should be handled securely and protected from unauthorized access.
let token = jwt.as_insecure_token();
```

<br />

## `.signin()` {#signin}

Signs in using a specific access method or system user.

```rust title="Method Syntax"
db.signin(credentials)
```

### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>credentials</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Variables used in a signin query.
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```rust
use serde::Serialize;
use surrealdb::opt::auth::Scope;

#[derive(Serialize)]
struct Credentials<'a> {
    email: &'a str,
    pass: &'a str,
}

let jwt = db.signin(Scope {
    namespace: "test",
    database: "test",
    access: "user",
    params: Credentials {
        email: "info@surrealdb.com",
        pass: "123456",
    },
}).await?;

// ⚠️: It is important to note that the token should be handled securely and protected from unauthorized access.
let token = jwt.as_insecure_token();
```

<br />

## `.invalidate()` {#invalidate}

Invalidates the authentication for the current connection.

```rust title="Method Syntax"
db.invalidate(credentials)
```

### Example usage
```surql
db.invalidate().await?;
```

<br />

## `.authenticate()` {#authenticate}

Authenticates the current connection with a JWT token.

```rust title="Method Syntax"
db.authenticate(token)
```

### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>token</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The JWT authentication token.
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```rust
db.authenticate(jwt).await?;
```

<br />

## `.set()` {#set}

Assigns a value as a parameter for this connection.

```rust title="Method Syntax"
db.set(key, val)
```

### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>key</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Specifies the name of the variable.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>val</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Assigns the value to the variable name.
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```rust
// Assign the variable on the connection
db.set("name", Name {
    first: "Tobie",
    last: "Morgan Hitchcock",
}).await?;
// Use the variable in a subsequent query
db.query("CREATE person SET name = $name").await?;
// Use the variable in a subsequent query
db.query("SELECT * FROM person WHERE name.first = $name.first").await?;
```

<br />

## `.query()` {#query}

Runs a set of SurrealQL statements against the database.

```rust title="Method Syntax"
db.query(sql).bind(vars)
```

### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th colspan="2">Description</th>
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

### Example usage
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

<br />

## `.select()` {#select}

Selects all records in a table, or a specific record, from the database.

```rust title="Method Syntax"
db.select(resource)
```

### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>resource</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The table name or a record ID to select.
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```rust
// Select all records from a table
let people: Vec<Person> = db.select("person").await?;
// Select a specific record from a table
let person: Option<Person> = db.select(("person", "h5wxrf2ewk8xjxosxtyc")).await?;
```

### Translated query
This function will run the following query in the database:

```surql
SELECT * FROM $resource;
```

<br />

## `.create()` {#create}

Creates a record in the database.

```rust title="Method Syntax"
db.create(resource).content(data)
```

### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>resource</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The table name or the specific record ID to create.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>data</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The document / record data to insert.
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```rust
// Create a record with a random ID
let person: Option<Person> = db.create("person").await?;
// Create a record with a specific ID
let record: Record = db
    .create(("person", "tobie"))
    .content(Person {
        name: "Tobie",
        settings: {
            active: true,
            marketing: true,
       },
    }).await?;
```

### Translated query
This function will run the following query in the database:

```surql
CREATE $resource CONTENT $data;
```

<br />

## `.update().content()` {#update-content}

Updates all records in a table, or a specific record, in the database.

```rust title="Method Syntax"
db.update(resource).content(data)
```

> [!NOTE]
> This function replaces the current document / record data with the specified data.

### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>resource</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The table name or the specific record ID to create.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>data</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The document / record data to insert.
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```rust
// Update all records in a table
let people: Vec<Person> = db.update("person").await?;
// Update a record with a specific ID
let person: Option<Person> = db
    .update(("person", "tobie"))
    .content(Person {
        name: "Tobie",
        settings: {
            active: true,
            marketing: true,
        },
    }).await?;
```

### Translated query
This function will run the following query in the database:

```surql
UPDATE $resource CONTENT $data;
```

<br />

## `.update().merge()` {#update-merge}

Modifies all records in a table, or a specific record, in the database.

```rust title="Method Syntax"
db.update(resource).merge(data)
```

> [!NOTE]
> This function merges the current document / record data with the specified data.

### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>resource</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The table name or the specific record ID to create.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>data</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The document / record data to insert.
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```rust
// Update all records in a table
let people: Vec<Person> = db.update("person")
    .merge(Document {
        updated_at: Datetime::default(),
    })
    .await?;
// Update a record with a specific ID
let person: Option<Person> = db.update(("person", "tobie"))
    .merge(Document {
        updated_at: Datetime::default(),
        settings: Settings {
            active: true,
        },
    })
    .await?;
```

### Translated query
This function will run the following query in the database:

```surql
UPDATE $resource MERGE $data;
```

<br />

## `.update().patch()` {#update-patch}

Applies JSON Patch changes to all records, or a specific record, in the database.

```rust title="Method Syntax"
db.update(resource).patch(data)
```

> [!NOTE]
> This function patches the current document / record data with the specified JSON Patch data.

### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>resource</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The table name or the specific record ID to modify.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>data</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The JSON Patch data with which to modify the records.
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```rust
// Update all records in a table
let people: Vec<Person> = db.update("person")
    .patch(PatchOp::replace("/created_at", Datetime::default()))
    .await?;

// Update a record with a specific ID
let person: Option<Person> = db.update(("person", "tobie"))
    .patch(PatchOp::replace("/settings/active", false))
    .patch(PatchOp::add("/tags", &["developer", "engineer"]))
    .patch(PatchOp::remove("/temp"))
    .await?;
```

### Translated query
This function will run the following query in the database:

```surql
UPDATE $resource PATCH $data;
```

<br />

## `.delete()` {#delete}

Deletes all records in a table, or a specific record, from the database.

```rust title="Method Syntax"
db.delete(resource)
```

### Arguments
<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Arguments">
                <code>resource</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The table name or a record ID to select.
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```rust
// Delete all records from a table
let people: Vec<Person> = db.delete("person").await?;
// Delete a specific record from a table
let person: Option<Person> = db.delete(("person", "h5wxrf2ewk8xjxosxtyc")).await?;
```

### Translated query
This function will run the following query in the database:

```surql
DELETE FROM $resource RETURN BEFORE;
```


---
sidebar_position: 3
sidebar_label: Embedding SurrealDB in JavaScript
title: Embedding SurrealDB in JavaScript
description: The documentation for embedding SurrealDB within JavaScript has not yet been released.
---

import Image from "@components/Image.astro";
import LightLogo from "@img/icon/light/javascript.png";
import DarkLogo from "@img/icon/dark/javascript.png";

<div class="flag-title">
	<Image
		alt="JavaScript"
		width={42}
		height={42}
		src={{
			light: LightLogo,
			dark: DarkLogo,
		}}
	/>
	# Embedding in JavaScript
</div>

SurrealDB is designed to be run in many different ways, and environments. Due to the [separation of the storage and compute](/docs/surrealdb/introduction/architecture) layers, SurrealDB can be run in embedded mode, from within your JavaScript environments. 

You can embed SurrealDB in both browser and server environments. In browser environments using the [Wasm engine](/docs/sdk/javascript/engines/wasm), SurrealDB can be run as an in-memory database, or it can persist data using IndexedDB. In server environments using the [Node.js engine](/docs/sdk/javascript/engines/node), SurrealDB can be run as an embedded database, backed by either an in-memory engine or [SurrealKV](/docs/surrealkv).

In this document, we will cover how to embed SurrealDB in both browser and server environments.

## Browser
In browser environments, using the [Wasm engine](/docs/sdk/javascript/engines/wasm), you can run SurrealDB in-memory or with IndexedDB persistence.

For more information on how to embed SurrealDB in browser environments, please see the [Wasm engine](/docs/sdk/javascript/engines/wasm) documentation.

## Server

In server environments, you can use the [Node.js engine](/docs/sdk/javascript/engines/node) to run SurrealDB as an embedded database. 

For more information on how to embed SurrealDB in server environments, please see the [Node.js engine](/docs/sdk/javascript/engines/node) documentation.

---
sidebar_position: 3
sidebar_label: Embedding SurrealDB in JavaScript
title: Embedding SurrealDB in JavaScript
description: The documentation for embedding SurrealDB within JavaScript has not yet been released.
---

import Image from "@components/Image.astro";
import LightLogo from "@img/icon/light/javascript.png";
import DarkLogo from "@img/icon/dark/javascript.png";

<div class="flag-title">
	<Image
		alt="JavaScript"
		width={42}
		height={42}
		src={{
			light: LightLogo,
			dark: DarkLogo,
		}}
	/>
	# Embedding in JavaScript
</div>

SurrealDB is designed to be run in many different ways, and environments. Due to the [separation of the storage and compute](/docs/surrealdb/introduction/architecture) layers, SurrealDB can be run in embedded mode, from within your JavaScript environments. 

You can embed SurrealDB in both browser and server environments. In browser environments using the [Wasm engine](/docs/sdk/javascript/engines/wasm), SurrealDB can be run as an in-memory database, or it can persist data using IndexedDB. In server environments using the [Node.js engine](/docs/sdk/javascript/engines/node), SurrealDB can be run as an embedded database, backed by either an in-memory engine or [SurrealKV](/docs/surrealkv).

In this document, we will cover how to embed SurrealDB in both browser and server environments.

## Browser
In browser environments, using the [Wasm engine](/docs/sdk/javascript/engines/wasm), you can run SurrealDB in-memory or with IndexedDB persistence.

For more information on how to embed SurrealDB in browser environments, please see the [Wasm engine](/docs/sdk/javascript/engines/wasm) documentation.

## Server

In server environments, you can use the [Node.js engine](/docs/sdk/javascript/engines/node) to run SurrealDB as an embedded database. 

For more information on how to embed SurrealDB in server environments, please see the [Node.js engine](/docs/sdk/javascript/engines/node) documentation.

---
sidebar_position: 6
sidebar_label: Embedding SurrealDB in Python
title: Embedding SurrealDB in Python
description: The documentation for embedding SurrealDB within Python has not yet been released.
---

import Image from "@components/Image.astro";
import LightLogo from "@img/icon/light/python.png";
import DarkLogo from "@img/icon/dark/python.png";

<div class="flag-title">
	<Image
		alt="Python"
		width={42}
		height={42}
		src={{
			light: LightLogo,
			dark: DarkLogo,
		}}
	/>
	# Embedding in Python
</div>

SurrealDB is designed to be run in many different ways, and environments. Due to the [separation of the storage and compute](/docs/surrealdb/introduction/architecture) layers, SurrealDB can be run in embedded mode, from within a number of different language environments. 

In Python, SurrealDB can be run as an in-memory database, or it can persist data using a file-based storage engine.

> [!IMPORTANT]
> The current version of the SurrealDB Python SDK does not support embedding. In the meantime, please refer to the [Python client SDK](/docs/sdk/python) documentation to get started with connecting to SurrealDB from Python.

---
sidebar_position: 7
sidebar_label: Embedding SurrealDB in .NET
title: Embedding SurrealDB in .NET
description: The documentation for embedding SurrealDB within .NET has not yet been released.
---

import Image from "@components/Image.astro";
import LightLogo from "@img/icon/light/dotnet.png";
import DarkLogo from "@img/icon/dark/dotnet.png";

import Tabs from "@components/Tabs/Tabs.astro";
import TabItem from "@components/Tabs/TabItem.astro";

<div class="flag-title">
	<Image
		alt=".NET"
		width={42}
		height={42}
		src={{
			light: LightLogo,
			dark: DarkLogo,
		}}
	/>
	# Embedding in .NET
</div>

SurrealDB is designed to be run in many different ways, and environments.
Due to the [separation of the storage and compute](/docs/surrealdb/introduction/architecture) layers, SurrealDB can be run in embedded mode, from within a number of different language environments.
In .NET, SurrealDB can be run as an [in-memory database](#memory-provider), or it can persist data using a [file-based storage engine](#file-providers). 

## Memory provider

The memory provider is a simple in-memory database that is useful in some contexts.
It can be extremely useful for testing scenarios, or for small applications that do not require persistence.

```bash
dotnet add package SurrealDb.Embedded.InMemory
```

### Consume the provider as-is

The simplest way to use an in-memory database instance of SurrealDB is to create an instance of the `SurrealDbMemoryClient` class.

```csharp
// highlight-next-line
using var db = new SurrealDbMemoryClient();

const string TABLE = "person";

var person = new Person
{
    Title = "Founder & CEO",
    Name = new() { FirstName = "Tobie", LastName = "Morgan Hitchcock" },
    Marketing = true
};
var created = await db.Create(TABLE, person);
Console.WriteLine(ToJsonString(created));
```

### Consume the provider via Dependency Injection

Following the .NET Dependency Injection pattern, you can register the in-memory provider using the `AddInMemoryProvider` extension method.
This will allow the `SurrealDbClient` to resolve the `mem://` endpoint.

```csharp
var builder = WebApplication.CreateBuilder(args);

var services = builder.Services;
var configuration = builder.Configuration;

// highlight-start
services
  .AddSurreal("Endpoint=mem://")
  .AddInMemoryProvider();
// highlight-end
```

Learn more about [Dependency Injection with SurrealDB in .NET](/docs/sdk/dotnet/core/dependency-injection) in the SDK documentation.


Once the memory provider is configured, you can use the .NET SDK the same way you would with a remote database.
Please refer to the [.NET client SDK](/docs/sdk/dotnet) documentation to get started with SurrealDB for .NET.

## File providers

The file provider is a more advanced storage engine that can be used to persist data to disk.

<Tabs groupId="file-embedded-modes">
  <TabItem value="rocksdb" label="RocksDB" default>

```bash
dotnet add package SurrealDb.Embedded.RocksDb
```

  </TabItem>
  <TabItem value="surrealkv" label="SurrealKV">

```bash
dotnet add package SurrealDb.Embedded.SurrealKv
```

  </TabItem>
</Tabs>

### Consume the provider as-is

<Tabs groupId="file-embedded-modes">
  <TabItem value="rocksdb" label="RocksDB" default>

The simplest way to use a file-backed database instance of SurrealDB is to create an instance of the `SurrealDbRocksDbClient` class.
Note that the `path` to the storage is mandatory.

```csharp
// highlight-next-line
using var db = new SurrealDbRocksDbClient("data.db");

const string TABLE = "person";

var person = new Person
{
    Title = "Founder & CEO",
    Name = new() { FirstName = "Tobie", LastName = "Morgan Hitchcock" },
    Marketing = true
};
var created = await db.Create(TABLE, person);
Console.WriteLine(ToJsonString(created));
```

  </TabItem>
  <TabItem value="surrealkv" label="SurrealKV">

The simplest way to use a file-backed database instance of SurrealDB is to create an instance of the `SurrealDbKvClient` class.
Note that the `path` to the storage is mandatory.

```csharp
// highlight-next-line
using var db = new SurrealDbKvClient("data.db");

const string TABLE = "person";

var person = new Person
{
    Title = "Founder & CEO",
    Name = new() { FirstName = "Tobie", LastName = "Morgan Hitchcock" },
    Marketing = true
};
var created = await db.Create(TABLE, person);
Console.WriteLine(ToJsonString(created));
```

  </TabItem>
</Tabs>

### Consume the provider via Dependency Injection

<Tabs groupId="file-embedded-modes">
  <TabItem value="rocksdb" label="RocksDB" default>

Following the .NET Dependency Injection pattern, you can register the file provider using the `AddRocksDbProvider` extension method.
This will allow the `SurrealDbClient` to resolve the `rocksdb://` endpoint.

```csharp
var builder = WebApplication.CreateBuilder(args);

var services = builder.Services;
var configuration = builder.Configuration;

// highlight-start
services
  .AddSurreal("Endpoint=rocksdb://data.db")
  .AddRocksDbProvider();
// highlight-end
```

  </TabItem>
  <TabItem value="surrealkv" label="SurrealKV">

Following the .NET Dependency Injection pattern, you can register the file provider using the `AddSurrealKvProvider` extension method.
This will allow the `SurrealDbClient` to resolve the `surrealkv://` endpoint.

```csharp
var builder = WebApplication.CreateBuilder(args);

var services = builder.Services;
var configuration = builder.Configuration;

// highlight-start
services
  .AddSurreal("Endpoint=surrealkv://data.db")
  .AddSurrealKvProvider();
// highlight-end
```

  </TabItem>
</Tabs>

Learn more about [Dependency Injection with SurrealDB in .NET](/docs/sdk/dotnet/core/dependency-injection) in the SDK documentation.

### Next step

Once the file provider is configured, you can use the .NET SDK the same way you would with a remote database.
Please refer to the [.NET client SDK](/docs/sdk/dotnet) documentation to get started.

---
sidebar_position: 1
sidebar_label: Integration
title: Integration
description: In this section, you will explore the various integration options and techniques available to seamlessly incorporate SurrealDB into your existing development ecosystem.
---

# Integration

In this section, you will explore the various integration options and techniques available to seamlessly incorporate SurrealDB into your existing development ecosystem.

## Introduction

SurrealDB is designed to be flexible and compatible with a wide range of technologies and frameworks. This section will guide you through the process of integrating SurrealDB into your projects, whether you are working directly from code, or integrating with one of our supported network protocols.

## API Reference

To facilitate the integration process, SurrealDB provides a comprehensive API reference that documents the available methods, classes, and interfaces. This reference will serve as a valuable resource when working with SurrealDB in your code, providing you with detailed information on how to interact with the database and utilize its features.

## Community Support

If you encounter any challenges or have questions during the integration process, we encourage you to reach out to the SurrealDB community on [Discord](https://discord.gg/surrealdb). The SurrealDB community is a vibrant and supportive community of developers who are eager to help and share their experiences. You can find resources such as forums, chat channels, and documentation feedback options to connect with the community and get the assistance you need.

---
sidebar_position: 2
sidebar_label: SDKs
title: SDKs | Integration
description: SurrealDB supports a number of methods for connecting to the database and performing data queries.
---

import Boxes from "@components/boxes/Boxes.astro";
import IconBox from "@components/boxes/IconBox.astro";
import Image from "@components/Image.astro";

import LightDotnet from "@img/icon/light/dotnet.png";
import LightGolang from "@img/icon/light/golang.png";
import LightJava from "@img/icon/light/java.png";
import LightJavaScript from "@img/icon/light/javascript.png";
import LightNodejs from "@img/icon/light/nodejs.png";
import LightPhp from "@img/icon/light/php.png";
import LightPython from "@img/icon/light/python.png";
import LightRust from "@img/icon/light/rust.png";
import LightTypescript from "@img/icon/light/typescript.png";
import LightWasm from "@img/icon/light/webassembly.png";

import DarkDotnet from "@img/icon/dark/dotnet.png";
import DarkGolang from "@img/icon/dark/golang.png";
import DarkJava from "@img/icon/dark/java.png";
import DarkJavaScript from "@img/icon/dark/javascript.png";
import DarkNodejs from "@img/icon/dark/nodejs.png";
import DarkPhp from "@img/icon/dark/php.png";
import DarkPython from "@img/icon/dark/python.png";
import DarkRust from "@img/icon/dark/rust.png";
import DarkTypescript from "@img/icon/dark/typescript.png";
import DarkWasm from "@img/icon/dark/webassembly.png";

# SDKs

SurrealDB supports numerous client SDKs for connecting to the database and performing data queries. These SDKs are designed to simplify the integration process and provide developers with the tools they need to interact with SurrealDB from their preferred programming languages.

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
        href="/docs/sdk/javascript"
        icon={{
                light: LightJavaScript,
                dark: DarkJavaScript,
        }}
    />
    <IconBox
        title="TypeScript"
        status="available"
        href="/docs/sdk/javascript"
        icon={{
                light: LightTypescript,
                dark: DarkTypescript,
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
        title="WebAssembly"
        status="available"
        href="/docs/sdk/javascript/engines/wasm"
        icon={{
                light: LightWasm,
                dark: DarkWasm,
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
        title="Golang"
        status="available"
        href="/docs/sdk/golang"
        icon={{
                light: LightGolang,
                dark: DarkGolang,
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
        title=".NET"
        status="available"
        href="/docs/sdk/dotnet"
        icon={{
                light: LightDotnet,
                dark: DarkDotnet,
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

---
sidebar_position: 3
sidebar_label: HTTP & Rest
title: HTTP Protocol | Integration
description: The HTTP endpoints enable selection and modification of data, along with custom SurrealQL queries, using traditional RESTful HTTP endpoints.
---

import Since from '@components/shared/Since.astro';
import Tabs from "@components/Tabs/Tabs.astro";
import TabItem from "@components/Tabs/TabItem.astro";
import Label from "@components/shared/Label.astro";

# HTTP & Rest

The HTTP endpoints exposed by SurrealDB instances provide a simple way to interact with the database over a traditional RESTful interface. This includes selecting and modifying one or more records, executing custom SurrealQL queries, and managing SurrealML models. 

The endpoints are designed to be simple and easy to use in stateless environments, making them ideal for lightweight applications where a persistent database connection is not required.

## Querying via Postman

The most convenient way to access these endpoints is via SurrealDB's Postman Collection. To do so, follow these steps:

1. Open Postman
2. Clone the [SurrealDB Postman Collection](https://postman.com/surrealdb/workspace/surrealdb/collection/19100500-3da237f3-588b-4252-8882-6d487c11116a)
2. Select the appropriate HTTP method (`GET /health`, `DEL /key/:table`, etc.).
3. Enter the endpoint URL.
4. If the endpoint requires any parameters or a body, make sure to include those in your request.

> [!IMPORTANT]
> Ensure that your URL is set correctly, if running locally, the URL should be `http://localhost:8000`.By default, the URL is set to local. Start your server using the [`surreal start`](/docs/surrealdb/cli/start) command in the CLI or through Surrealist's [local database serving](/docs/surrealist/concepts/local-database-serving) functionality, before querying the endpoints.


## Supported methods

You can use the HTTP endpoints to perform the following actions:

<br />

<table>
    <thead>
        <tr>
            <th scope="col">Function</th>
            <th scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td scope="row" data-label="Function"><a href="#status"><code>GET /status</code></a></td>
            <td scope="row" data-label="Description">Checks whether the database web server is running</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#health"><code>GET /health</code></a></td>
            <td scope="row" data-label="Description">Checks the status of the database server and storage engine</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#version"><code>GET /version</code></a></td>
            <td scope="row" data-label="Description">Returns the version of the SurrealDB database server</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#import"><code>POST /import</code></a></td>
            <td scope="row" data-label="Description">Imports data into a specific Namespace and Database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#export"><code>POST /export</code></a></td>
            <td scope="row" data-label="Description">Exports all data for a specific Namespace and Database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#signup"><code>POST /signup</code></a></td>
            <td scope="row" data-label="Description">Signs-up as a record user using a specific record access method</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#signin"><code>POST /signin</code></a></td>
            <td scope="row" data-label="Description">Signs-in as a root, namespace, database, or record user</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#get-table"><code>GET /key/:table</code></a></td>
            <td scope="row" data-label="Description">Selects all records in a table from the database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#post-table"><code>POST /key/:table</code></a></td>
            <td scope="row" data-label="Description">Creates a record in a table in the database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#put-table"><code>PUT /key/:table</code></a></td>
            <td scope="row" data-label="Description">Updates all records in a table in the database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#patch-table"><code>PATCH /key/:table</code></a></td>
            <td scope="row" data-label="Description">Modifies all records in a table in the database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#delete-table"><code>DELETE /key/:table</code></a></td>
            <td scope="row" data-label="Description">Deletes all records in a table from the database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#get-record"><code>GET /key/:table/:id</code></a></td>
            <td scope="row" data-label="Description">Selects the specific record from the database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#post-record"><code>POST /key/:table/:id</code></a></td>
            <td scope="row" data-label="Description">Creates the specific record in the database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#put-record"><code>PUT /key/:table/:id</code></a></td>
            <td scope="row" data-label="Description">Updates the specified record in the database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#patch-record"><code>PATCH /key/:table/:id</code></a></td>
            <td scope="row" data-label="Description">Modifies the specified record in the database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#delete-record"><code>DELETE /key/:table/:id</code></a></td>
            <td scope="row" data-label="Description">Deletes the specified record from the database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#sql"><code>POST /sql</code></a></td>
            <td scope="row" data-label="Description">Allows custom SurrealQL queries</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#graphql"><code>POST /graphql</code></a></td>
            <td scope="row" data-label="Description">Allows custom GraphQL queries</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#ml-import"><code>POST /ml/import</code></a></td>
            <td scope="row" data-label="Description">Import a SurrealML model into a specific Namespace and Database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#ml-export"><code>GET /ml/export/:name/:version</code></a></td>
            <td scope="row" data-label="Description">Export a SurrealML model from a specific Namespace and Database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#custom"><code>/api/:namespace/:database/:endpoint</code></a></td>
            <td scope="row" data-label="Description">Create a custom API endpoint for any number of HTTP methods (GET, POST, etc.)</td>
        </tr>
    </tbody>
</table>

<br />

## `GET /status` {#status}

This HTTP RESTful endpoint checks whether the database web server is running, returning a 200 status code.

### Example usage

```bash title="Request"
curl -I http://localhost:8000/status
```

```bash title="Sample output"
HTTP/1.1 200 OK
content-length: 0
vary: origin, access-control-request-method, access-control-request-headers
access-control-allow-origin: *
surreal-version: surrealdb-2.0.0+20240910.8f30ee08
server: SurrealDB
x-request-id: 3dedcc96-4d8a-451e-b60d-4eaac14fa3f8
date: Wed, 11 Sep 2024 00:52:49 GMT
```

<br />

## `GET /health` {#health}

This HTTP RESTful endpoint checks whether the database server and storage engine are running.

The endpoint returns a `200` status code on success and a `500` status code on failure.

```bash title="Request"
curl -I http://localhost:8000/health
```

```bash title="Sample output"
HTTP/1.1 200 OK
content-length: 0
vary: origin, access-control-request-method, access-control-request-headers
access-control-allow-origin: *
surreal-version: surrealdb-2.0.0+20240910.8f30ee08
server: SurrealDB
x-request-id: 24a1e675-af50-4676-b8ff-6eee18e9a077
date: Wed, 11 Sep 2024 00:53:22 GMT
```

<br />

## `GET /version` {#version}

This HTTP RESTful endpoint returns the version of the SurrealDB database server.

### Example usage

```bash title="Request"
curl http://localhost:8000/version
```

```bash title="Sample output"
surrealdb-2.0.0+20240910.8f30ee08
```


<br />

## `POST /import` {#import}

This HTTP RESTful endpoint imports a set of SurrealQL queries into a specific Namespace and Database.

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
                <Label label="optional" >OPTIONAL</Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the root, namespace, or database authentication data
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Accept</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Header">
                Sets the desired content-type of the response
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Header">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Header">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" >
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
                <Label label="optional" >OPTIONAL</Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the root, namespace, or database authentication data
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Accept</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Header">
                Sets the desired content-type of the response
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Header">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Header">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>

</TabItem>
</Tabs>

### Example usage

> [!NOTE]
> The `-u` in the example below is a shorthand used by curl to send an Authorization header.


<Tabs groupId="http-sql">
<TabItem value="V1" label="V1.x">
```bash title="Request"
curl -X POST -u "root:root" \
  -H "ns: mynamespace" \
  -H "db: mydatabase" \
  -H "Accept: application/json" \
  -d path/to/file.surql \
  http://localhost:8000/import
```
</TabItem>
<TabItem value="V2" label="V2.x" default>
```bash title="Request"
curl -X POST -u "root:root" \
  -H "Surreal-NS: mynamespace" \
  -H "Surreal-DB: mydatabase" \
  -H "Accept: application/json" \
  -d path/to/file.surql \
  http://localhost:8000/import
```
</TabItem>

</Tabs>


<br />

## `POST /export` {#export}

This HTTP RESTful endpoint exports all data for a specific Namespace and Database.

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
                <Label label="optional" >OPTIONAL</Label>
            </td>
            <td colspan="2" scope="row" data-label="Header">
                Sets the root, namespace, or database authentication data
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Header">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Header">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" >
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
                <Label label="optional" >OPTIONAL</Label>
            </td>
            <td colspan="2" scope="row" data-label="Header">
                Sets the root, namespace, or database authentication data
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Header">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Header">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>

#### Export options 

<table>
    <thead>
        <tr>
            <th>Arguments</th>
            <th>Description</th>
        </tr>
    </thead>  
    <tbody>
        <tr>
            <td>
                `only`
                <Label label="optional" />
            </td>
            <td>
                Whether only specific resources should be exported. When provided, only the resources specified will be exported.
            </td>
        </tr>
        <tr>
            <td>
                `users`
                <Label label="optional" />
            </td>
            <td>
                Whether system users should be exported [possible values: true, false].
            </td>
        </tr>
        <tr>
            <td>
                `accesses`
                <Label label="optional" />
            </td>
            <td>
                Whether access methods (Record or JWT) should be exported [possible values: true, false]
            </td>
        </tr>
        <tr>
            <td>
                `params`
                <Label label="optional" />
            </td>
            <td>
                Whether databases parameters should be exported [possible values: true, false]
            </td>
        </tr>
        <tr>
            <td>
                `functions`
                <Label label="optional" />
            </td>
            <td>
                Whether functions should be exported [possible values: true, false]
            </td>
        </tr>
        <tr>
            <td>
                `analyzers`
                <Label label="optional" />
            </td>
            <td>
                Whether analyzers should be exported [possible values: true, false]
            </td>
        </tr>
        <tr>
            <td>
                `tables [tables]`
                <Label label="optional" />
            </td>
            <td>
                Whether tables should be exported, optionally providing a list of tables
            </td>
        </tr>
        <tr>
            <td>
                `versions`
                <Label label="optional" />
            </td>
            <td>
                Whether SurrealKV versioned records should be exported [possible values: true, false]
            </td>
        </tr>
        <tr>
            <td>
                `records`
                <Label label="optional" />
            </td>
            <td>
                Whether records should be exported [possible values: true, false]
            </td>
        </tr>
    </tbody>
</table>

</TabItem>

</Tabs>



### Example usage

> [!NOTE]
> The `-u` in the example below is a shorthand used by curl to send an Authorization header, while `-o` allows the output to be written to a file.

<Tabs groupId="http-sql">

<TabItem value="V1" label="V1.x">
```bash title="Request"
curl -X GET \
  -u "root:root" \
  -H "ns: mynamespace" \
  -H "db: mydatabase" \
  -H "Accept: application/json" \
  -o path/to/file.surql \
  http://localhost:8000/export
```
</TabItem>

<TabItem value="V2" label="V2.x" default>
```bash title="Request"
curl -X GET \
  -u "root:root" \
  -H "Surreal-NS: mynamespace" \
  -H "Surreal-DB: mydatabase" \
  -H "Accept: application/json" \
  -o path/to/file.surql \
  http://localhost:8000/export
```

```bash title="Exporting specific parameters"
curl -X POST \
  -u "root:root" \
  -H "Surreal-NS: mynamespace" \
  -H "Surreal-DB: mydatabase" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -o path/to/file.surql \
  -d '{
        "users": true,
        "accesses": false,
        "params": false,
        "functions": false,
        "analyzers": false,
        "versions": false,
        "tables": ["usersTable", "ordersTable"],
        "records": true
      }' \
  http://localhost:8000/export
```
</TabItem>

</Tabs>

<br />

## `POST /signin` {#signin}

```json title="Method and URL"
POST /signin
```

This HTTP RESTful endpoint is used to access an existing account inside the SurrealDB database server.

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
                    <code>Accept</code>
                    <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the desired content-type of the response
            </td>
        </tr>
    </tbody>
</table>

### Data

<table>
    <thead>
        <tr>
            <th colspan="2">Data</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
    <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>ns</code>
                <Label label="required">REQUIRED FOR DB & RECORD</Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The namespace to sign in to this is required FOR DB & RECORD users
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required">REQUIRED FOR RECORD</Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The database to sign in to required for RECORD users
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>ac</code>
                <Label label="required">REQUIRED FOR RECORD USER</Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The record access method to use for signing in. required for RECORD users
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>user</code>
                <Label label="required">REQUIRED FOR ROOT, NS & DB</Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The username of the database user required for ROOT, NS & DB users
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>pass</code>
                <Label label="required">REQUIRED FOR ROOT, NS & DB</Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The password of the database user required for ROOT, NS & DB users
            </td>
        </tr>
    </tbody>
</table>


> [!IMPORTANT]
> The `ac` parameter is only required if you are signing in using an [access method](/docs/surrealql/statements/define/access) as a record user. For system users on the database, namespace, and root level, this parameter can be omitted.

### Example with a Record user

```bash title="Request"
curl -X POST -H "Accept: application/json" -d '{"ns":"test","db":"test","ac":"users","user":"john.doe","pass":"123456"}' http://localhost:8000/signin
```

```json title="Response"
{
	"code": 200,
	"details": "Authentication succeeded",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

### Example with Namespace user

```bash title="Request"
curl -X POST -H "Accept: application/json" -d '{"ns":"test","user":"john.doe","pass":"123456"}' http://localhost:8000/signin
```

```json title="Response"
{
	"code": 200,
	"details": "Authentication succeeded",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

### Example with Root user

```bash title="Request"
curl -X POST -H "Accept: application/json" -d '{"user":"john.doe","pass":"123456"}' http://localhost:8000/signin
```

```json title="Response"
{
	"code": 200,
	"details": "Authentication succeeded",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

### Example usage via Postman

After you have defined the users permissions for the record user, you can use the `POST /signin` endpoint to sign in as a user.

Using the [user credentials](/docs/surrealdb/security/authentication#record-users) created add the following to the request body:
```json
{
    "ns": "test",
    "db": "test",
    "ac": "account",
    "email": "",
    "pass": "123456"
}
```



<br />

## `POST /signup` {#signup}

This HTTP RESTful endpoint is used to create an account inside the SurrealDB database server.

### Header

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
                <code>Accept</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the desired content-type of the response
            </td>
        </tr>
    </tbody>
</table>

### Data

<table>
    <thead>
        <tr>
            <th colspan="2">Data</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>ns</code>
                <Label label="required"></Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The namespace to sign up to. This data is `REQUIRED FOR DB & RECORD`
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required"></Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The database to sign up to. This data is `REQUIRED FOR RECORD`
            </td>
        </tr>
                <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>access</code>
                <Label label="required"></Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The record access method to use for signing up. This data is `REQUIRED FOR RECORD`
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>user</code>
                <Label label="required"></Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The username of the database user. This data is `REQUIRED FOR ROOT, NS & DB`
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>pass</code>
                <Label label="required"></Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The password of the database user. This data is `REQUIRED FOR ROOT, NS & DB`
            </td>
        </tr>
    </tbody>
</table>

### Example usage

```bash title="Request"
curl -X POST -H "Accept: application/json" -d '{"ns":"test","db":"test","ac":"users","user":"john.doe","pass":"123456"}' http://localhost:8000/signup
```

```json title="Response"
{
	"code": 200,
	"details": "Authentication succeeded",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```
### Example usage via Postman

Before you sign up a new [record user](/docs/surrealdb/security/authentication#record-users), you must first [define a record access method](/docs/surrealql/statements/define/access/record) for the user. To do so, follow these steps:

> [!NOTE]
> You can also define [system users](/docs/surrealdb/security/authentication#system-users) and [user](/docs/surrealql/statements/define/user) credentials using the [`POST /sql`](/docs/surrealdb/integration/http#sql) endpoint.

1. Navigate to the `POST /sql` endpoint in Postman.
2. Enter the following query in the body of the request:
```surql
-- Enable authentication directly against a SurrealDB record
DEFINE ACCESS account ON DATABASE TYPE RECORD
    SIGNUP ( CREATE user SET email = $email, pass = crypto::argon2::generate($pass) )
    SIGNIN ( SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(pass, $pass) )
    DURATION FOR SESSION 24h
;
```
The above query defines a record access method called `account` that allows users to sign up and sign in. The access method also defines the session duration to be 24 hours.

3. Click `Send` to send the request to the SurrealDB database server.
4. Navigate to the `POST /signup` endpoint in Postman.
5. Enter the following query in the body of the request:
```json
{
    "ns": "test",
    "db": "test",
    "ac": "account",
    "email": "",
    "pass": "123456"
}
```
6. In the header of the request, set the following key-value pairs:
    - `Accept: application/json`
    - namespace: `test`
    - database: `test`
    - access: `account`
6. Click `Send` to send the request to the SurrealDB database server. You will get back a

```json
{
    "code": 200,
    "details": "Authentication succeeded",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE3MDY2MTA4MDMsIm5iZiI6MTcwNjYxMDgwMywiZXhwIjoxNzA2Njk3MjAzLCJpc3MiOiJTdXJyZWFsREIiLCJOUyI6InRlc3QiLCJEQiI6InRlc3QiLCJBQyI6Imh1bWFuIiwiSUQiOiJ1c2VyOjZsOTl1OWI0bzVoa3h0NnY3c3NzIn0.3jR8PHgS8iLefZDuPHBFcdUFNfuB3OBNqQtqxLVVzxAIxVj1RAkD5rCEZHH2QaPV-D2zNwYO5Fh_a8jD1l_cqQ"
}
```


<br />

## `GET /key/:table` {#get-table}

This HTTP RESTful endpoint selects all records in a specific table in the database.

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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" >
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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
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


### Translated query
```surql
SELECT * FROM type::table($table);
```
<br />

## `POST /key/:table` {#post-table}

This HTTP RESTful endpoint creates a record in a specific table in the database.

> [!NOTE]
> This HTTP endpoint expects the HTTP body to be a JSON or SurrealQL `object`.

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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" >
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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
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

### Translated query
```surql
CREATE type::table($table) CONTENT $body;
```

<br />

## `PUT /key/:table` {#put-table}

This HTTP RESTful endpoint updates all records in a specific table in the database.

> [!NOTE]
> This HTTP endpoint expects the HTTP body to be a JSON or SurrealQL object.

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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" >
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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
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

### Translated query
```surql
UPDATE type::table($table) CONTENT $body;
```

<br />

## `PATCH /key/:table` {#patch-table}

This HTTP RESTful endpoint modifies all records in a specific table in the database.

> [!NOTE]
> This HTTP endpoint expects the HTTP body to be a JSON or SurrealQL object.

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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" >
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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
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

### Translated query
```surql
UPDATE type::table($table) MERGE $body;
```

<br />

## `DELETE /key/:table` {#delete-table}

This HTTP RESTful endpoint deletes all records from the specified table in the database.

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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" >
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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
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

### Translated query
```surql
DELETE FROM type::table($table);
```

<br />

## `GET /key/:table/:id` {#get-record}

This HTTP RESTful endpoint selects a specific record from the database.

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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" >
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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
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

### Translated query
```surql
SELECT * FROM type::thing($table, $id);
```

<br />

## `POST /key/:table/:id` {#post-record}

This HTTP RESTful endpoint creates a specific record in a table in the database.

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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" >
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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
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

### Translated query
```surql
CREATE type::thing($table, $id) CONTENT $body;
```

<br />

## `PUT /key/:table/:id` {#put-record}

This HTTP RESTful endpoint updates a specific record in a table in the database.

> [!NOTE]
> This HTTP endpoint expects the HTTP body to be a JSON or SurrealQL object.

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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" >
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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
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

### Translated query
```surql
UPDATE type::thing($table, $id) CONTENT $body;
```

<br />

## `PATCH /key/:table/:id` {#patch-record}

This HTTP RESTful endpoint modifies a specific record in a table in the database.

> [!NOTE]
> This HTTP endpoint expects the HTTP body to be a JSON or SurrealQL object.

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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" >
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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
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

### Translated query
```surql
UPDATE type::thing($table, $id) MERGE $body;
```

<br />

## `DELETE /key/:table/:id` {#delete-record}

This HTTP RESTful endpoint deletes a single specific record from the database.

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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" >
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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
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

### Translated query
```surql
DELETE FROM type::thing($table, $id);
```

<br />

## `POST /sql` {#sql}

The SQL endpoint enables use of SurrealQL queries.

> [!NOTE]
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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" >
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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
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


### Parameters

Query parameters can be provided via URL query parameters. These parameters will securely replace any parameters that are present in the query. This practise is known as prepared statements or parameterised queries, and [should be used](/docs/surrealdb/reference-guide/security-best-practices#query-safety) whenever untrusted inputs are included in a query to prevent injection attacks.

### Example usage

> [!NOTE]
> The `-u` in the example below is a shorthand used by curl to send an Authorization header.

<Tabs groupId="http-sql">

<TabItem value="V1" label="V1.x">
```bash title="Request"
curl -X POST -u "root:root" -H "ns: mynamespace" -H "db: mydatabase" -H "Accept: application/json" \
  -d 'SELECT * FROM person WHERE age > $age' http://localhost:8000/sql?age=18
```
</TabItem>

<TabItem value="V2" label="V2.x" default>
```bash title="Request"
curl -X POST -u "root:root" -H "Surreal-NS: mynamespace" -H "Surreal-DB: mydatabase" -H "Accept: application/json" \
  -d 'SELECT * FROM person WHERE age > $age' http://localhost:8000/sql?age=18
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

<br />

## `POST /graphql` {#graphql}

<Since v="v2.0.0" />

The GraphQL endpoint enables use of GraphQL queries to interact with your data.

> [!NOTE]
> This HTTP endpoint expects the HTTP body to be a GraphQL query.

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
                <Label label="optional" >OPTIONAL</Label>
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
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries
            </td>
        </tr>
    </tbody>
</table>

### Example usage

> [!NOTE]
> The `-u` in the example below is a shorthand used by curl to send an Authorization header.

<Tabs groupId="http-sql">

<TabItem value="V2" label="V2.x" default>
```bash title="Request"
curl -X POST \
  -u "root:root" \
  -H "Surreal-NS: mynamespace" \
  -H "Surreal-DB: mydatabase" \
  -H "Accept: application/json" \
  -d '{
    "query": "{ 
      person(filter: {age: {age_gt: 18}}) {
        id
        name
        age
      }
    }"
  }' \
  http://localhost:8000/graphql
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

<br />

## `POST /ml/import` {#ml-import}

This HTTP RESTful endpoint imports a SurrealML machine learning model into a specific Namespace and Database. It expects the file to be a SurrealML file packaged in the `.surml` file format. As machine learning files can be large, the endpoint expects a chunked HTTP request.

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
                <Label label="optional" >OPTIONAL</Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
            Sets the root, namespace, database, or record authentication data
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" >
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
                <Label label="optional" >OPTIONAL</Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
            Sets the root, namespace, database, or record authentication data
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
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

> [!NOTE]
> The `-u` in the example below is a shorthand used by curl to send an Authorization header.

<Tabs groupId="http-sql">

<TabItem value="V1" label="V1.x">
```bash title="Request"
curl -X POST \
  -u "root:root" \
  -H "ns: mynamespace" \
  -H "db: mydatabase" \
  -H "Accept: application/json" \
  -d path/to/file.surml \
  http://localhost:8000/ml/import
```
</TabItem>

<TabItem value="V2" label="V2.x" default>
```bash title="Request"
curl -X POST \
  -u "root:root" \
  -H "Surreal-NS: mynamespace" \
  -H "Surreal-DB: mydatabase" \
  -H "Accept: application/json" \
  -d path/to/file.surml \
  http://localhost:8000/ml/import
```
</TabItem>

</Tabs>

### Usage in Python

When using Python, the [surreaml](https://github.com/surrealdb/surrealml) package can be used to upload the model with the following code:

```python
from surrealml import SurMlFile

url = "http://0.0.0.0:8000/ml/import"
SurMlFile.upload("./linear_test.surml", url, 5)
```

<br />

## `GET /ml/export/:name/:version` {#ml-export}

This HTTP RESTful endpoint exports a SurrealML machine learning model from a specific Namespace and Database. The output file with be a SurrealML file packaged in the `.surml` file format. As machine learning files can be large, the endpoint outputs a chunked HTTP response.

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
                <Label label="optional" >OPTIONAL</Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the root, namespace, or database authentication data
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>ns</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>db</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" >
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
                <Label label="optional" >OPTIONAL</Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the root, namespace, or database authentication data
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
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

> [!NOTE]
<em> Note: </em> The `-u` in the example below is a shorthand used by curl to send an Authorization header, while `-o` allows the output to be written to a file.


<Tabs groupId="http-sql">

<TabItem value="V1" label="V1.x">
```bash title="Request"
curl -X GET \
  -u "root:root" \
  -H "ns: mynamespace" \
  -H "db: mydatabase" \
  -H "Accept: application/json" \
  -o path/to/file.surml \
  http://localhost:8000/ml/export/prediction/1.0.0
```
</TabItem>

<TabItem value="V2" label="V2.x" default>
```bash title="Request"
curl -X GET \
  -u "root:root" \
  -H "Surreal-NS: mynamespace" \
  -H "Surreal-DB: mydatabase" \
  -H "Accept: application/json" \
  -o path/to/file.surml \
  http://localhost:8000/ml/export/prediction/1.0.0
```
</TabItem>

</Tabs>

## Custom endpoint at `/api/:ns/:db/:endpoint` {#custom}

<Since v="v2.2.0" />
> [!CAUTION]
> Currently, this is an experimental feature as such, it may be subject to breaking changes and may present unidentified security issues. Do not rely on this feature in production applications. To enable this, set the `SURREAL_CAPS_ALLOW_EXPERIMENTAL` [environment variable](/docs/surrealdb/cli/start) to `define_api`.


A custom endpoint can be set using a [`DEFINE API`](/docs/surrealql/statements/define/api) statement. The possible HTTP methods (GET, PUT, etc.) are set using the statement itself. The path begins with `/api`, continues with the namespace and database, and ends with a custom endpoint that can include both static and dynamic path segments.

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
                <Label label="optional" >OPTIONAL</Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the root, namespace, or database authentication data
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Header">
                <code>Surreal-DB</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries.
            </td>
        </tr>
    </tbody>
</table>

### Example usage

```bash title="Request"
curl http://localhost:8000/api/my_namespace/my_database/test_endpoint \
  -H "Surreal-NS: ns" -H "Surreal-DB: db" \
  -H "Accept: application/json"
```

---
sidebar_position: 4
sidebar_label: RPC Protocol
title: RPC Protocol | Integration
description: The RPC protocol allows for easy bidirectional communication with SurrealDB.
---

import Since from '@components/shared/Since.astro'
import Label from "@components/shared/Label.astro";
import Tabs from "@components/Tabs/Tabs.astro";
import TabItem from "@components/Tabs/TabItem.astro";

# RPC Protocol

The RPC protocol allows for network-protocol agnostic communication with SurrealDB. It is used internally by our client SDKs, and supports both HTTP and WebSocket based communication. Combined with the power of our [CBOR protocol](./cbor) specification, the RPC protocol provides a fully type-safe and efficient way to interact with SurrealDB over the network.

> [!NOTE]
>Version 2 of the RPC protocol significantly enhances data manipulation and retrieval methods by adding an optional object parameter. This enables direct control over statement clauses like [`WHERE`](/docs/surrealql/clauses/where), [`LIMIT`](/docs/surrealql/clauses/limit), [`TIMEOUT`](/docs/surrealql/statements/select#the-timeout-clause), and more, previously only available through direct SQL execution.

> [!IMPORTANT]
> **Method Consolidation:**  The `merge`, `patch`, and `insert_relation` methods from version 1 have been consolidated into the `update` and `insert` methods respectively.

## Session Variables 

SurrealDB's session variables provide a robust mechanism for managing session-specific data. Think of them as temporary storage tied directly to a user's active connection, ideal for tasks like maintaining application state, storing user preferences, or holding temporary data relevant only to the current session.

A key characteristic of session variables is their scope: they are strictly confined to the individual connection. This isolation ensures that one user's session data remains private and does not interfere with others, allowing for personalized experiences within a multi-user environment.
You can interact with session variables in the following ways:

1.  **Explicit Session-Wide Management:**
    *   Use the [`let`](#let-) method to define a new variable or update an existing one within the current session. This variable will persist for the duration of the connection.
    *   Use the [`unset`](#unset-) method to remove a previously defined variable from the session.
    *   The [`reset`](#reset) method, in addition to its other functions, clears *all* currently defined session variables, restoring the session's variable state.

2.  **Implicit Request-Scoped Management:** 
    *   Methods [`query`](#query), [`select`](#select), [`insert`](#insert), [`create`](#create), [`upsert`](#upsert), [`update`](#update), [`relate`](#relate), and [`delete`](#delete), accept an optional `vars` parameter. This parameter is an object containing key-value pairs, where each key represents the variable name (without the leading `$`) and the value is the data to be assigned.
    *   Variables passed via this parameter are defined *only* for the execution context of that specific method call. They temporarily override any session-wide variable with the same name for that request but do not permanently alter the session state. These variables are automatically discarded once the method execution completes.

To utilize a session variable within a query or method, prefix its name with a dollar sign (`$`), for example, `$user_id`.
## Supported methods

You can use the RPC protocol to perform the following actions:

<table>
    <thead>
        <tr>
            <th scope="col">Function</th>
            <th scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td scope="row" data-label="Function"><a href="#authenticate"><code>authenticate [ token ]</code></a></td>
            <td scope="row" data-label="Description">Authenticate a user against SurrealDB with a token</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#create"><code>create [ thing, data ]</code></a></td>
            <td scope="row" data-label="Description">Create a record with a random or specified ID</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#delete"><code>delete [ thing ]</code></a></td>
            <td scope="row" data-label="Description">Delete either all records in a table or a single record</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#graphql"><code>graphql [ query, options? ]</code></a></td>
            <td scope="row" data-label="Description">Execute GraphQL queries against the database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#info"><code>info</code></a></td>
            <td scope="row" data-label="Description">Returns the record of an authenticated record user</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#insert"><code>insert [ thing, data ]</code></a></td>
            <td scope="row" data-label="Description">Insert one or multiple records in a table</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#insert_relation"><code>insert_relation [ table, data ]</code></a></td>
            <td scope="row" data-label="Description">Insert a new relation record into a specified table or infer the table from the data</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#invalidate"><code>invalidate</code></a></td>
            <td scope="row" data-label="Description">Invalidate a user's session for the current connection</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#kill-"><code>kill [ queryUuid ]</code></a></td>
            <td scope="row" data-label="Description">Kill an active live query</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#let-"><code>let [ name, value ]</code></a></td>
            <td scope="row" data-label="Description">Define a variable on the current connection</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#live-"><code>live [ table, diff ]</code></a></td>
            <td scope="row" data-label="Description">Initiate a live query</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#merge"><code>merge [ thing, data ]</code></a></td>
            <td scope="row" data-label="Description">Merge specified data into either all records in a table or a single record</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#patch"><code>patch [ thing, patches, diff ]</code></a></td>
            <td scope="row" data-label="Description">Patch either all records in a table or a single record with specified patches</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#ping"><code>ping</code></a></td>
            <td scope="row" data-label="Description">Sends a ping to the database</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#query"><code>query [ sql, vars ]</code></a></td>
            <td scope="row" data-label="Description">Execute a custom query with optional variables</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#relate"><code>relate [ in, relation, out, data? ]</code></a></td>
            <td scope="row" data-label="Description"> Create graph relationships between created records </td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#reset"><code>reset</code></a></td>
            <td scope="row" data-label="Description">Resets all attributes for the current connection</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#run"><code>run [ func_name, version, args ]</code></a></td>
            <td scope="row" data-label="Description">Execute built-in functions, custom functions, or machine learning models with optional arguments.</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#select"><code>select [ thing ]</code></a></td>
            <td scope="row" data-label="Description">Select either all records in a table or a single record</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#signin"><code>signin [NS, DB, AC, ... ]</code></a></td>
            <td scope="row" data-label="Description">Signin a root, NS, DB or record user against SurrealDB</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#signup"><code>signup [ NS, DB, AC, ... ]</code></a></td>
            <td scope="row" data-label="Description">Signup a user using the SIGNUP query defined in a record access method</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#unset-"><code>unset [ name ]</code></a></td>
            <td scope="row" data-label="Description">Remove a variable from the current connection</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#update"><code>update [ thing, data ]</code></a></td>
            <td scope="row" data-label="Description">Modify either all records in a table or a single record with specified data if the record already exists</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#upsert"><code>upsert [ thing, data ]</code></a></td>
            <td scope="row" data-label="Description">Replace either all records in a table or a single record with specified data</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#use"><code>use [ ns, db ]</code></a></td>
            <td scope="row" data-label="Description">Specifies or unsets the namespace and/or database for the current connection</td>
        </tr>
        <tr>
            <td scope="row" data-label="Function"><a href="#version"><code>version</code></a></td>
            <td scope="row" data-label="Description">Returns version information about the database/server</td>
        </tr>
    </tbody>
</table>

<br />

## `authenticate`
This method allows you to authenticate a user against SurrealDB with a token.

<Tabs>
<TabItem label="RPC v1 & v2">
```json title="Method Syntax"
authenticate [ token ]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>token</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The token that authenticates the user
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "authenticate",
    "params": [ "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJTdXJyZWFsREIiLCJpYXQiOjE1MTYyMzkwMjIsIm5iZiI6MTUxNjIzOTAyMiwiZXhwIjoxODM2NDM5MDIyLCJOUyI6InRlc3QiLCJEQiI6InRlc3QiLCJTQyI6InVzZXIiLCJJRCI6InVzZXI6dG9iaWUifQ.N22Gp9ze0rdR06McGj1G-h2vu6a6n9IVqUbMFJlOxxA" ]
}
```

```json title="Response"
{
    "id": 1,
    "result": null
}
```
</TabItem>
</Tabs>

<br />

## `create`

This method creates a record either with a random or specified ID.

<Tabs>
<TabItem label="RPC v1">
```json title="Method Syntax"
create [ thing, data ]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>thing</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The thing (Table or Record ID) to create. Passing just a table will result in a randomly generated ID
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>data</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The content of the record
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "create",
    "params": [
        "person",
        {
            "name": "Mary Doe"
        }
    ]
}
```

```json title="Response"
{
    "id": 1,
    "result": [
        {
            "id": "person:s5fa6qp4p8ey9k5j0m9z",
            "name": "Mary Doe"
        }
    ]
}
```
</TabItem>

<TabItem label="RPC v2">
```json title="Method Syntax"
create [ 
    thing, 
    data?, 
    {
        only?: boolean, 
        output?: "none" | "null"| "diff" | "before" | "after",
        timeout?: duration, 
        version?: datetime, 
        vars?: object
    }?
]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>thing</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>data</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>only</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`ONLY`](/docs/surrealql/statements/create#only) of the `CREATE` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>output</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`RETURN`](/docs/surrealql/statements/create#return-values) of the `CREATE` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>timeout</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`TIMEOUT`](/docs/surrealql/statements/create#timeout) of the `CREATE` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>version</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`VERSION`](/docs/surrealql/statements/create#version) of the `CREATE` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>vars</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                [`Session Variables`](#session-variables)
            </td>
        </tr>
    </tbody>
</table>

### Example usage

This section is under development. The functionality is closely aligned with the `CREATE` statement. For more details, refer to the [`CREATE` statement documentation](/docs/surrealql/statements/create).
</TabItem>
</Tabs>

<br />

## `delete`

This method deletes either all records in a table or a single record.

<Tabs>
<TabItem label="RPC v1">

```json title="Method Syntax"
delete [ thing ]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>thing</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The thing (Table or Record ID) to delete
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "delete",
    "params": [ "person:8s0j0bbm3ngrd5c9bx53" ]
}
```

Notice how the deleted record is being returned here

```json title="Response"
{
    "id": 1,
    "result": {
        "active": true,
        "id": "person:8s0j0bbm3ngrd5c9bx53",
        "last_updated": "2023-06-16T08:34:25Z",
        "name": "John Doe"
    }
}
```
</TabItem>

<TabItem label="RPC v2">
```json title="Method Syntax"
create [ 
    thing,
    {
        only?: boolean, 
        output?: "none" | "null"| "diff" | "before" | "after",
        timeout?: duration, 
        vars?: object
    }? 
]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>thing</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>only</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
               A boolean, stating where we want to select or affect only a single record.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>output</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                By default, the delete method returns nothing. To change what is returned, we can use the output option, specifying either "none", "null", "diff", "before", "after".
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>timeout</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`TIMEOUT`](/docs/surrealql/statements/delete#using-timeout-duration-records-based-on-conditions) of the `DELETE` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>vars</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                [`Session Variables`](#session-variables)
            </td>
        </tr>
    </tbody>
</table>

### Example usage

This section is under development. The functionality is closely aligned with the `DELETE` statement. For more details, refer to the [`DELETE` statement documentation](/docs/surrealql/statements/delete).
</TabItem>

</Tabs>

<br />

## `graphql`

<Since v="v2.0.0" />

This method allows you to execute GraphQL queries against the database.

<Tabs>
<TabItem label="RPC v1 & v2">
```json title="Method Syntax"
graphql [ query, options? ]
```

### Parameters

<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>query</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                A GraphQL query string or an object containing the query, variables, and operation name.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>options</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                An object specifying options such as the output format and pretty-printing.
            </td>
        </tr>
    </tbody>
</table>

#### `query` Parameter

The `query` parameter can be either:

- A **string** containing the GraphQL query. For example:

```json
{ "query": "{ author { id name } }" }
```

- An **object** with the following fields:
  - `query` (**required**): The GraphQL query string.
  - `variables` or `vars` (**optional**): An object containing variables for the query.
  - `operationName` or `operation` (**optional**): The name of the operation to execute.

**Example:**
```json
{
    "query": "query GetUser($id: ID!) { user(id: $id) { id name } }",
    "variables": { "id": "user:1" },
    "operationName": "GetUser"
}
```

#### `options` Parameter

The `options` parameter is an object that may include:

- `pretty` (**optional**, default `false`): A boolean indicating whether the output should be pretty-printed.
- `format` (**optional**, default `"json"`): The response format. Currently, only `"json"` is supported.

**Example:**
```json
{
    "pretty": true,
    "format": "json"
}
```

### Example Usage

#### Executing a Simple GraphQL Query

```json title="Request"
{
    "id": 1,
    "method": "graphql",
    "params": [ "{ users { id name } }" ]
}
```

```json title="Response"
{
    "id": 1,
    "result": {
        "data": {
            "users": [
                { "id": "user:1", "name": "Alice" },
                { "id": "user:2", "name": "Bob" }
            ]
        }
    }
}
```

#### Executing a GraphQL Query with Variables and Operation Name

```json title="Request"
{
    "id": 1,
    "method": "graphql",
    "params": [
        {
            "query": "query GetUser($id: ID!) { user(id: $id) { id name } }",
            "variables": { "id": "user:1" },
            "operationName": "GetUser"
        }
    ]
}
```

```json title="Response"
{
    "id": 1,
    "result": {
        "data": {
            "user": { "id": "user:1", "name": "Alice" }
        }
    }
}
```

#### Executing a GraphQL Query with Options

```json title="Request"
{
    "id": 1,
    "method": "graphql",
    "params": [
        "{ users { id name } }",
        { "pretty": true }
    ]
}
```

```json title="Response"
{
    "id": 1,
    "result": "{\n    \"data\": {\n        \"users\": [\n            { \"id\": \"user:1\", \"name\": \"Alice\" },\n            { \"id\": \"user:2\", \"name\": \"Bob\" }\n        ]\n    }\n}"
}
```

### Notes

- **GraphQL Support:** This method requires GraphQL support to be enabled in the database configuration. If not enabled, you will receive a `MethodNotFound` error.
- **Format Options:** Currently, only the `"json"` format is supported. Using `"cbor"` will result in an error.
- **Pretty Output:** Setting `pretty` to `true` formats the JSON response with indentation for readability.

> [!IMPORTANT]
> Ensure that your GraphQL queries and variables are correctly formatted to avoid parsing errors.

</TabItem>
</Tabs>

<br />

## `info`

This method returns the record of an authenticated record user.

<Tabs>
<TabItem label="RPC v1 & v2">

```json title="Method Syntax"
info
```

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "info"
}
```

The result property of the response is likely different depending on your schema and the authenticated user. However, it does represent the overall structure of the responding message.

```json title="Response"
{
    "id": 1,
    "result": {
        "id": "user:john",
        "name": "John Doe"
    }
}
```

</TabItem>
</Tabs>

<br />

## `insert`

This method creates a record either with a random or specified ID.

<Tabs>
<TabItem label="RPC v1">

```json title="Method Syntax"
insert [ thing, data ]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>thing</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The table to insert in to
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>data</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            One or multiple record(s)
            </td>
        </tr>
    </tbody>
</table>

### Example usage

```json title="Request"
{
    "id": 1,
    "method": "insert",
    "params": [
        "person",
        {
            "name": "Mary Doe"
        }
    ]
}
```

```json title="Response"
{
    "id": 1,
    "result": [
        {
            "id": "person:s5fa6qp4p8ey9k5j0m9z",
            "name": "Mary Doe"
        }
    ]
}
```

### Bulk insert

```json title="Request"
{
    "id": 1,
    "method": "insert",
    "params": [
        "person",
        [
            {
                "name": "Mary Doe"
            },
            {
                "name": "John Doe"
            }
        ]
    ]
}
```

```json title="Response"
{
    "id": 1,
    "result": [
        {
            "id": "person:s5fa6qp4p8ey9k5j0m9z",
            "name": "Mary Doe"
        },
        {
            "id": "person:xtbbojcm82a97vus9x0j",
            "name": "John Doe"
        }
    ]
}
```
</TabItem>

<TabItem label="RPC v2">

```text title="Method Syntax"
insert [ 
    thing, 
    data, 
    {
        data_expr?: "content" | "single",
        relation?: boolean, 
        output?: "none" | "null"| "diff" | "before" | "after",
        timeout?: duration, 
        version?: datetime, 
        vars?: object
    }?
]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>thing</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>data</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>data_expr</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Specifies how the `data` parameter is interpreted.
                <ul>
                    <li><code>content</code> (default): The `data` parameter should be a single object representing one record, or an array of objects representing multiple records.</li>
                     <li><code>single</code>: The `data` parameter should be a object where keys represent field names and values are arrays of the same length. The records are constructed by combining the elements at the same index from each array.</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>relation</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                A boolean indicating whether the inserted records are relations.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>output</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`RETURN`](/docs/surrealql/statements/insert#return-values) of the `INSERT` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>timeout</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                A duration, stating how long the statement is run within the database before timing out.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>version</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                If you are using SurrealKV as the storage engine with versioning enabled, when creating a record you can specify a version for each record.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>vars</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                [`Session Variables`](#session-variables)
            </td>
        </tr>
    </tbody>
</table>

### Example usage

This section is under development. The functionality is closely aligned with the `INSERT` statement. For more details, refer to the [`INSERT` statement documentation](/docs/surrealql/statements/insert).
</TabItem>
</Tabs>

<br />

## `insert_relation`

This method inserts a new relation record into the database. You can specify the relation table to insert into and provide the data for the new relation.

```json title="Method Syntax"
insert_relation [ table, data ]
```

### Parameters

<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>table</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The name of the relation table to insert into. If `null` or `none`, the table is determined from the `id` field in the `data`.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>data</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            An object containing the data for the new relation record, including `in`, `out`, and any additional fields.
            </td>
        </tr>
    </tbody>
</table>

### Example Usage

**Inserting a Relation into a Specified Table**

```json title="Request"
{
    "id": 1,
    "method": "insert_relation",
    "params": [
        "likes",                   // (relation table)
        {                          // data
            "in": "user:alice",
            "out": "post:123",
            "since": "2024-09-15T12:34:56Z"
        }
    ]
}
```

```json title="Response"
{
    "id": 1,
    "result": {
        "id": "likes:user:alice:post:123",
        "in": "user:alice",
        "out": "post:123",
        "since": "2024-09-15T12:34:56Z"
    }
}
```

**Inserting a Relation Without Specifying the Table**

If you do not specify the `table` parameter (i.e., set it to `null` or `none`), the relation table is inferred from the `id` field within the `data`.

```json title="Request"
{
    "id": 2,
    "method": "insert_relation",
    "params": [
        null,                      // relation table is null
        {                          // data
            "id": "follows:user:alice:user:bob",
            "in": "user:alice",
            "out": "user:bob",
            "since": "2024-09-15T12:34:56Z"
        }
    ]
}
```

```json title="Response"
{
    "id": 2,
    "result": {
        "id": "follows:user:alice:user:bob",
        "in": "user:alice",
        "out": "user:bob",
        "since": "2024-09-15T12:34:56Z"
    }
}
```

### Notes

- **`table` Parameter:**
  - Specifies the relation table into which the new relation record will be inserted.
  - If `table` is `null` or `none`, the method expects the `data` to contain an `id` from which it can infer the relation table.

- **`data` Parameter:**
  - Must include at least the `in` and `out` fields, representing the starting and ending points of the relation.
  - Can include additional fields to store more information within the relation.

- **Relation IDs:**
  - If an `id` is provided in the `data`, it will be used as the identifier for the new relation record.
  - If no `id` is provided, the system may generate one based on the `table`, `in`, and `out` fields.

- **Single vs. Multiple Inserts:**
  - The method primarily handles single relation inserts.
  - The `one` variable in the code determines if the `table` parameter refers to a single item.

### Error Handling

- **Invalid Parameters:**
  - If you provide fewer than two parameters or incorrect parameter types, you will receive an `InvalidParams` error.
  - The method expects exactly two parameters: `table` and `data`.

**Example of Invalid Parameters:**

```json title="Request with missing parameters"
{
    "id": 3,
    "method": "insert_relation",
    "params": [
        "likes"  // Missing the data parameter
    ]
}
```

```json title="Response"
{
    "id": 3,
    "error": {
        "code": -32602,
        "message": "Invalid parameters"
    }
}
```

### Best Practices

- **Include `in` and `out` Fields:**
  - Always provide the `in` and `out` fields in your `data` to define the relation endpoints.

- **Specifying the Relation Table:**
  - If possible, specify the `table` parameter to clearly indicate the relation table.
  - If not specified, ensure that the `id` in `data` correctly reflects the desired relation table.

- **Providing an `id` in `data`:**
  - If you want to control the `id` of the relation, include it in the `data`.
  - This is especially important when `table` is `null` or `none`.

### Additional Examples

**Inserting a Relation with Auto-Generated ID**

```json title="Request"
{
    "id": 4,
    "method": "insert_relation",
    "params": [
        "friendship",              // table (relation table)
        {                          // data
            "in": "user:alice",
            "out": "user:bob",
            "since": "2024-09-15"
        }
    ]
}
```

```json title="Response"
{
    "id": 4,
    "result": {
        "id": "friendship:user:alice:user:bob",
        "in": "user:alice",
        "out": "user:bob",
        "since": "2024-09-15"
    }
}
```

**Notes:**

- The `id` is generated based on the `table`, `in`, and `out` fields.
- The relation is inserted into the `friendship` table.

The `insert_relation` method is a powerful way to insert new relation records into your database, allowing you to specify the relation table and include detailed data for each relation. By understanding the parameters and how the method operates, you can effectively manage relationships between records in your database.

> [!NOTE]
> This method is particularly useful in databases that support graph-like relations, enabling complex data modeling and querying capabilities.

<br />

## `invalidate`

This method will invalidate the user's session for the current connection.

<Tabs>
<TabItem label="RPC v1 & v2">
```json title="Method Syntax"
invalidate
```

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "invalidate"
}
```

```json title="Response"
{
    "id": 1,
    "result": null
}
```
</TabItem>
</Tabs>

<br />

<Tabs>
<TabItem label="RPC v1 & v2">

## `kill` <Label label="websocket only" />

This method kills an active live query

```json title="Method Syntax"
kill [ queryUuid ]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>queryUuid</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The UUID of the live query to kill
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "kill",
    "params": [ "0189d6e3-8eac-703a-9a48-d9faa78b44b9" ]
}
```

```json title="Response"
{
    "id": 1,
    "result": null
}
```

</TabItem>
</Tabs>

<br />

## `let` <Label label="websocket only" />

This method stores a variable on the current connection.

```json title="Method Syntax"
let [ name, value ]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>name</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The name for the variable without a prefixed $ character
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>value</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The value for the variable
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "let",
    "params": [ "website", "https://surrealdb.com/" ]
}
```

```json title="Response"
{
    "id": 1,
    "result": null
}
```

<br />

## `live` <Label label="websocket only" />

This methods initiates a live query for a specified table name.

<Tabs>
<TabItem label="RPC v1 & v2">

```json title="Method Syntax"
live[ table ]
```

> [!IMPORTANT]
> For more advanced live queries where filters are needed, use the Query method to initiate a custom live query.

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>table</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The table to initiate a live query for
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>diff</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                If set to true, live notifications will contain an array of [JSON Patches](https://jsonpatch.com) instead of the entire record
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "live",
    "params": [ "person" ]
}
```

```json title="Response"
{
    "id": 1,
    "result": "0189d6e3-8eac-703a-9a48-d9faa78b44b9"
}
```

### Live notification
For every creation, update or deletion on the specified table, a live notification will be sent. Live notifications do not have an ID attached, but rather include the Live Query's UUID in the result object.

```json
{
    "result": {
        "action": "CREATE",
        "id": "0189d6e3-8eac-703a-9a48-d9faa78b44b9",
        "result": {
            "id": "person:8s0j0bbm3ngrd5c9bx53",
            "name": "John"
        }
    }
}
```

</TabItem>
</Tabs>

<br />

## `merge`

This method merges specified data into either all records in a table or a single record.

```json title="Method Syntax"
merge [ thing, data ]
```

> [!NOTE]
> This function merges the current document / record data with the specified data. If no merge data is passed it will simply trigger an update.

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>thing</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The thing (Table or Record ID) to merge into
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>data</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The content of the record
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "merge",
    "params": [
        "person",
        {
            "active": true
        }
    ]
}
```

```json title="Response"
{
  "id": 1,
  "result": [
      {
          "active": true,
          "id": "person:8s0j0bbm3ngrd5c9bx53",
          "name": "John Doe"
      },
      {
          "active": true,
          "id": "person:s5fa6qp4p8ey9k5j0m9z",
          "name": "Mary Doe"
      }
  ]
}
```

<br />

## `patch`

This method patches either all records in a table or a single record with specified patches.

```json title="Method Syntax"
patch [ thing, patches, diff ]
```

> [!NOTE]
> This function patches the current document / record data with the specified [JSON Patch](https://jsonpatch.com) data.

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>thing</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The thing (Table or Record ID) to patch
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>patches</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            An array of patches following the [JSON Patch specification](https://jsonpatch.com)
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>diff</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            A boolean representing if just a diff should be returned.
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "patch",
    "params": [
        "person",
        [
            { "op": "replace", "path": "/last_updated", "value": "2023-06-16T08:34:25Z" }
        ]
    ]
}
```

```json title="Response"
{
    "id": 1,
    "result": [
        [
            {
                "op": "add",
                "path": "/last_updated",
                "value": "2023-06-16T08:34:25Z"
            }
        ],
        [
            {
                "op": "add",
                "path": "/last_updated",
                "value": "2023-06-16T08:34:25Z"
            }
        ]
    ]
}
```

<br />

## `ping`

<Tabs>
<TabItem label="RPC v2">
```json title="Method Syntax"
ping
```

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "ping",
}
```

```json title="Response"
{
  "id": 1,
  "result": null
}
```
</TabItem>
</Tabs>

<br />

## `query`

This methods sends a custom SurrealQL query.

<Tabs>
<TabItem label="RPC v1 & v2">

```json title="Method Syntax"
query [ sql, vars ]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2">Parameter</th>
            <th colspan="2">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>sql</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The query to execute against SurrealDB
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>vars</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                A set of variables used by the query
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "query",
    "params": [
        "CREATE person SET name = 'John'; SELECT * FROM type::table($tb);",
        {
            "tb": "person"
        }
    ]
}
```

```json title="Response"
{
  "id": 1,
  "result": [
      {
          "status": "OK",
          "time": "152.5µs",
          "result": [
              {
                  "id": "person:8s0j0bbm3ngrd5c9bx53",
                  "name": "John"
              }
          ]
      },
      {
          "status": "OK",
          "time": "32.375µs",
          "result": [
              {
                  "id": "person:8s0j0bbm3ngrd5c9bx53",
                  "name": "John"
              }
          ]
      }
  ]
}
```

</TabItem>
</Tabs>

## `relate`

<Since v="v1.5.0" />
This method relates two records with a specified relation.

<Tabs>
<TabItem label="RPC v1">

```json title="Method Syntax"
relate [ in, relation, out, data? ]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>in</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The record to relate to
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>relation</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The relation table
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>out</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The record to relate from
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>data</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The content of the record
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "relate",
    "params": [
        "person:12s0j0bbm3ngrd5c9bx53",
        "knows",
        "person:8s0j0bbm3ngrd5c9bx53"
    ]
}
```

```json title="Response"
{
    "id": 1,
    "result": {
        "id": "knows:12s0j0bbm3ngrd5c9bx53:8s0j0bbm3ngrd5c9bx53",
        "in": "person:12s0j0bbm3ngrd5c9bx53",
        "out": "person:8s0j0bbm3ngrd5c9bx53"
    }
}
```

### Creating a Relation With Additional Data

```json title="Request"
{
    "id": 2,
    "method": "relate",
    "params": [
        "person:john_doe",          // in
        "knows",                    // relation
        "person:jane_smith",        // out
        { "since": "2020-01-01" }   // data
    ]
}
```

```json title="Response"
{
    "id": 2,
    "result": {
        "id": "knows:person:john_doe:person:jane_smith",
        "in": "person:jane_smith",
        "out": "person:john_doe",
        "since": "2020-01-01"
    }
}
```

</TabItem>

<TabItem label="RPC v2">

```json title="Method Syntax"
relate [
    in,
    relation,
    out,
    data?,
    {
        unique?: boolean,
        only?: boolean,
        output?: "none" | "null"| "diff" | "before" | "after",
        timeout?: duration,
        version:? datetime,
        vars?: object
    }?
]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>in</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The record to relate from
            </td>
        </tr>
         <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>relation</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The relation table
            </td>
        </tr>
         <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>out</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The record to relate to
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>data</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>unique</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                A boolean, stating wether the relation we are inserting needs to be unique.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>only</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`ONLY`](/docs/surrealql/statements/relate#creating-a-single-relation-with-the-only-keyword) of the `RELATE` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>output</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`RETURN`](/docs/surrealql/statements/relate#modifying-output-with-the-return-clause) of the `RELATE` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>timeout</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`TIMEOUT`](/docs/surrealql/statements/relate#using-the-timeout-clause) of the `RELATE` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>vars</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                [`Session Variables`](#session-variables)
            </td>
        </tr>
    </tbody>
</table>

### Example usage

This section is under development. The functionality is closely aligned with the `RELATE` statement. For more details, refer to the [`RELATE` statement documentation](/docs/surrealql/statements/relate).

</TabItem>
</Tabs>

<br />

## `reset`

This method will reset all attributes for the current connection. reset your authentication (much like invalidate) unsets the selected NS/DB, unsets any defined connection params, and aborts any active live queries.

<Tabs>
<TabItem label="RPC v1 & v2">
```json title="Method Syntax"
reset
```

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "reset"
}
```

```json title="Response"
{
    "id": 1,
    "result": null
}
```
</TabItem>
</Tabs>

<br />

## `run`

This method allows you to execute built-in functions, custom functions, or machine learning models with optional arguments.

<Tabs>
<TabItem label="RPC v1 & v2">
```json title="Method Syntax"
run [ func_name, version?, args? ]
```

### Parameters

<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>func_name</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The name of the function or model to execute. Prefix with `fn::` for custom functions or `ml::` for machine learning models.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>version</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The version of the function or model to execute.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>args</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The arguments to pass to the function or model.
            </td>
        </tr>
    </tbody>
</table>


### Executing a built-in function

```json title="Request"
{
    "id": 1,
    "method": "run",
    "params": [ "time::now" ]
}
```

```json title="Response"
{
    "id": 1,
    "result": "2024-09-15T12:34:56Z"
}
```

### Executing a custom function

```json title="Request"
{
    "id": 1,
    "method": "run",
    "params": [ "fn::calculate_discount", null, [ 100, 15 ] ]
}
```

```json title="Response"
{
    "id": 1,
    "result": 85
}
```

### Executing a machine learning model

```json title="Request"
{
    "id": 1,
    "method": "run",
    "params": [ "ml::image_classifier", "v2.1", [ "image_data_base64" ] ]
}
```

```json title="Response"
{
    "id": 1,
    "result": "cat"
}
```

> [!IMPORTANT]
> When using a machine learning model (prefixed with `ml::`), the `version` parameter is **required**.

</TabItem>
</Tabs>

<br />

## `select`

This method selects either all records in a table or a single record.

<Tabs>
<TabItem label="RPC v1">

```json title="Method Syntax"
select [ thing ]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>thing</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The thing (Table or Record ID) to select
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "select",
    "params": [ "person" ]
}
```

```json title="Response"
{
    "id": 1,
    "result": [
        {
            "id": "person:8s0j0bbm3ngrd5c9bx53",
            "name": "John"
        }
    ]
}
```
</TabItem>

<TabItem label="RPC v2">

```json title="Method Syntax"
select [ 
    thing,  
    {
        fields?: string,
        only?: boolean, 
        start?: number,
        limit?: number,
        cond?: string,
        timeout?: duration, 
        version?: datetime, 
        vars?: object
    }?
]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>thing</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>fields</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                
            </td>
        </tr>
         <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>only</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`ONLY`](/docs/surrealql/statements/select#the-only-clause) of the `SELECT` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>start</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                A number, stating how many records to skip in a selection.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>limit</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`LIMIT`](/docs/surrealql/statements/select#the-limit-clause) of the `SELECT` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>cond</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`WHERE`](/docs/surrealql/statements/select#numeric-ranges-in-a-where-clause) of the `SELECT` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>timeout</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`TIMEOUT`](/docs/surrealql/statements/select#the-timeout-clause) of the `SELECT` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>version</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`VERSION`](/docs/surrealql/statements/select#the-version-clause) of the `SELECT` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>vars</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                [`Session Variables`](#session-variables)
            </td>
        </tr>
    </tbody>
</table>

### Example usage

This section is under development. The functionality is closely aligned with the `SELECT` statement. For more details, refer to the [`SELECT` statement documentation](/docs/surrealql/statements/select).

</TabItem>
</Tabs>

<br />

## `signin`

This method allows you to sign in as a root, namespace, or database user, or with a record access method.

> [!IMPORTANT]
> Unlike v1, v2 returns an object containing a `token` property and an optional `refresh` property.

<Tabs>
<TabItem label="RPC v1 & v2">
```json title="Method Syntax"
signin [ NS, DB, AC, ... ]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>NS</code>
                <Label label="required"></Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The namespace to sign in to. Only required for `DB & RECORD` authentication
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>DB</code>
                <Label label="required"></Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The database to sign in to. Only required for `RECORD` authentication
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>AC</code>
                <Label label="required"></Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Specifies the access method. Only required for `RECORD` authentication
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>user</code>
                <Label label="required">REQUIRED FOR ROOT, NS & DB</Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
            	The username of the database user. Only required for `ROOT, NS & DB` authentication
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>pass</code>
                <Label label="required">REQUIRED FOR ROOT, NS & DB</Label>
            </td>
            <td colspan="2" scope="row" data-label="Description">
            	The password of the database user. Only required for `ROOT, NS & DB` authentication
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>...</code>
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Specifies any variables to pass to the `SIGNIN` query. Only relevant for `RECORD` authentication
            </td>
        </tr>
    </tbody>
</table>

### Example with Root user

```json title="Request"
{
    "id": 1,
    "method": "signin",
    "params": [
        {
            "user": "tobie",
            "pass": "3xtr3m3ly-s3cur3-p@ssw0rd"
        }
    ]
}
```

```json title="Response"
{
    "id": 1,
    "result": null
}
```

### Example with Record user

```json title="Request"
{
    "id": 1,
    "method": "signin",
    "params": [
        {
            "NS": "surrealdb",
            "DB": "docs",
            "AC": "commenter",

            "username": "johndoe",
            "password": "SuperStrongPassword!"
        }
    ]
}
```

```json title="Response"
{
    "id": 1,
    "result": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJTdXJyZWFsREIiLCJpYXQiOjE1MTYyMzkwMjIsIm5iZiI6MTUxNjIzOTAyMiwiZXhwIjoxODM2NDM5MDIyLCJOUyI6InRlc3QiLCJEQiI6InRlc3QiLCJTQyI6InVzZXIiLCJJRCI6InVzZXI6dG9iaWUifQ.N22Gp9ze0rdR06McGj1G-h2vu6a6n9IVqUbMFJlOxxA"
}
```

</TabItem>
</Tabs>

<br />

## `signup`

This method allows you to sign a user up using the `SIGNUP` query defined in a record access method.

> [!IMPORTANT]
> Unlike v1, v2 returns an object containing an optional `token` property and an optional `refresh` property.

<Tabs>
<TabItem label="RPC v1 & v2">

```json title="Method Syntax"
signup [ NS, DB, AC, ... ]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Specifies the namespace of the record access method
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>DB</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Specifies the database of the record access method
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>AC</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Specifies the access method
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>...</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Specifies any variables used by the SIGNUP query of the record access method
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "signup",
    "params": [
        {
            "NS": "surrealdb",
            "DB": "docs",
            "AC": "commenter",

            "username": "johndoe",
            "password": "SuperStrongPassword!"
        }
    ]
}
```

```json title="Response"
{
  "id": 1,
  "result": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJTdXJyZWFsREIiLCJpYXQiOjE1MTYyMzkwMjIsIm5iZiI6MTUxNjIzOTAyMiwiZXhwIjoxODM2NDM5MDIyLCJOUyI6InRlc3QiLCJEQiI6InRlc3QiLCJTQyI6InVzZXIiLCJJRCI6InVzZXI6dG9iaWUifQ.N22Gp9ze0rdR06McGj1G-h2vu6a6n9IVqUbMFJlOxxA"
}
```

</TabItem>
</Tabs>

<br />

## `unset` <Label label="websocket only" />

This method removes a variable from the current connection.

<Tabs>
<TabItem label="RPC v1 & v2">

```json title="Method Syntax"
unset [ name ]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>name</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                The name of the variable without a prefixed $ character
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "unset",
    "params": [ "website" ]
}
```

```json title="Response"
{
    "id": 1,
    "result": null
}
```

</TabItem>
</Tabs>

<br />

## `update`

This method replaces either all records in a table or a single record with specified data.

```json title="Method Syntax"
update [ thing, data ]
```

> [!NOTE]
> This function replaces the current document / record data with the specified data if that document / record has already been created. If no document has been created this will return an empty array. Also, if no replacement data is passed it will simply trigger an update.

<Tabs>
<TabItem label="RPC v1">

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>thing</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The thing (Table or Record ID) to update
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>data</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The content of the record
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "update",
    "params": [
        "person:8s0j0bbm3ngrd5c9bx53",
        {
            "name": "John Doe"
        }
    ]
}
```

```json title="Response"
{
    "id": 1,
    "result": {
        "id": "person:8s0j0bbm3ngrd5c9bx53",
        "name": "John Doe"
    }
}
```

</TabItem>

<TabItem label="RPC v2">

```json title="Method Syntax"
insert [ 
    thing, 
    data?, 
    {
        data_expr?: "content" | "merge" | "replace" | "patch",
        only?: boolean,
        cond?: string,
        output?: "none" | "null"| "diff" | "before" | "after",
        timeout?: duration, 
        vars?: object
    }? 
]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>thing</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>data</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>data_expr</code>
                <Label label="optional" />
            </td>
            <td>
                <ul>
                    <li><code>content</code>: corresponds to [`CONTENT`](/docs/surrealql/statements/update#content-clause) of the `UPDATE` statement</li>
                    <li><code>merge</code>: corresponds to [`MERGE`](/docs/surrealql/statements/update#merge-clause) of the `UPDATE` statement</li>
                    <li><code>replace</code>: corresponds to [`REPLACE`](/docs/surrealql/statements/update#replace-clause) of the `UPDATE` statement</li>
                    <li><code>patch</code>: corresponds to [`PATCH`](/docs/surrealql/statements/update#patch-clause) of the `UPDATE` statement</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>only</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                A boolean, stating where we want to select or affect only a single record.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>cond</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`WHERE`](/docs/surrealql/statements/update#conditional-update-with-where-clause) of the `UPDATE` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>output</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`RETURN`](/docs/surrealql/statements/update#alter-the-return-value) of the `UPDATE` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>timeout</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`TIMEOUT`](/docs/surrealql/statements/update#using-a-timeout) of the `UPDATE` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>vars</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                [`Session Variables`](#session-variables)
            </td>
        </tr>
    </tbody>
</table>

### Example usage
This section is under development. The functionality is closely aligned with the `UPDATE` statement. For more details, refer to the [`UPDATE` statement documentation](/docs/surrealql/statements/update).

</TabItem>

</Tabs>

<br />

## `upsert`

<Tabs>
<TabItem label="RPC v1">

```json title="Method Syntax"
upsert [ thing, data ]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>thing</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The thing (Table or Record ID) to upsert
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>data</code>
               <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
            The content of the record
            </td>
        </tr>
    </tbody>
</table>

### Example usage
```json title="Request"
{
    "id": 1,
    "method": "upsert",
    "params": [
        "person:12s0j0bbm3ngrd5c9bx53",
        {
            "name": "John Doe",
            "job": "Software developer",
        }
    ]
}
```

```json title="Response"
{
    "id": 1,
    "result": {
        "id": "person:12s0j0bbm3ngrd5c9bx53",
        "name": "John Doe",
        "job": "Software developer"
    }
}
```

</TabItem>

<TabItem label="RPC v2">

```json title="Method Syntax"
upsert [ 
    thing, 
    data?, 
    {
        data_expr?: "content" | "merge" | "replace" | "patch",
        only?: boolean,
        cond?: string,
        output?: "none" | "null"| "diff" | "before" | "after",
        timeout?: duration, 
        vars?: object
    } 
]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>thing</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>data</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>data_expr</code>
                <Label label="optional" />
            </td>
            <td>
                <ul>
                    <li><code>content</code>: corresponds to [`CONTENT`](/docs/surrealql/statements/upsert#content-clause) of the `UPSERT` statement</li>
                    <li><code>merge</code>: corresponds to [`MERGE`](/docs/surrealql/statements/upsert#merge-clause) of the `UPSERT` statement</li>
                    <li><code>replace</code>: corresponds to [`REPLACE`](/docs/surrealql/statements/upsert#replace-clause) of the `UPSERT` statement</li>
                    <li><code>patch</code>: corresponds to [`PATCH`](/docs/surrealql/statements/upsert#patch-clause) of the `UPSERT` statement</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>only</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`ONLY`](/docs/surrealql/statements/upsert#using-the-only-clause) of the `UPSERT` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>cond</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`WHERE`](/docs/surrealql/statements/upsert#using-the-where-clause) of the `UPSERT` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>output</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                corresponds to [`RETURN`](/docs/surrealql/statements/upsert#alter-the-return-value) of the `UPSERT` statement
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>timeout</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                A duration, stating how long the statement is run within the database before timing out.
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Parameter">
                <code>vars</code>
                <Label label="optional" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                [`Session Variables`](#session-variables)
            </td>
        </tr>
    </tbody>
</table>

### Example usage
This section is under development. The functionality is closely aligned with the `UPSERT` statement. For more details, refer to the [`UPSERT` statement documentation](/docs/surrealql/statements/upsert).

</TabItem>

</Tabs>

<br />

## `use`

This method specifies or unsets the namespace and/or database for the current connection.

<Tabs>
<TabItem label="RPC v1 & v2">

```json title="Method Syntax"
use [ ns, db ]
```

### Parameters
<table>
    <thead>
        <tr>
            <th colspan="2" scope="col">Parameter</th>
            <th colspan="2" scope="col">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2" scope="row" data-label="Function">
                <code>NS</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Namespace for queries
            </td>
        </tr>
        <tr>
            <td colspan="2" scope="row" data-label="Function">
                <code>DB</code>
                <Label label="required" />
            </td>
            <td colspan="2" scope="row" data-label="Description">
                Sets the selected Database for queries
            </td>
        </tr>
    </tbody>
</table>

### Accepted values

For either the namespace or database, a string will change the value, `null` will unset the value, and `none` will cause the value to not be affected.

### Example usage

```json title="Request"
{
    "id": 1,
    "method": "use",
    "params": [ "surrealdb", "docs" ]
}
```

```json title="Response"
{
    "id": 1,
    "result": null
}
```

```surql title="Example Combinations"
[none, none]     -- Won't change ns or db
["test", none]   -- Change ns to test
[none, "test"]   -- Change db to test
["test", "test"] -- Change ns and db to test

[none, null]     -- Will only unset the database
[null, none]     -- Will throw an error, you cannot unset only the database
[null, null]     -- Will unset both ns and db
["test", null]   -- Change ns to test and unset db
```

</TabItem>
</Tabs>

<br />

## `version`

This method returns version information about the database/server.

<Tabs>
<TabItem label="RPC v1 & v2">

```json title="Method Syntax"
version
```

### Parameters

This method does not accept any parameters.

### Example Usage

```json title="Request"
{
    "id": 1,
    "method": "version"
}
```

```json title="Response"
{
    "id": 1,
    "result": {
        "version": "2.0.0-beta.2",
        "build": "abc123",
        "timestamp": "2024-09-15T12:34:56Z"
    }
}
```

### Notes

- **Parameters:** Providing any parameters will result in an `InvalidParams` error.
- **Result Fields:**
  - `version`: The version number of the database/server.
  - `build`: The build identifier.
  - `timestamp`: The timestamp when the version was built or released.


> [!NOTE]
> The actual values in the response will depend on your specific database/server instance.

</TabItem>
</Tabs>

<br />


---
sidebar_position: 5
sidebar_label: CBOR Protocol
title: CBOR Protocol| Integration 
description: SurrealDB supports a number of methods for connecting to the database and performing data queries.
---

# CBOR Protocol

SurrealDB extends the [CBOR](https://www.rfc-editor.org/rfc/rfc8949.html) protocol with a number of custom tags to support the full range of data types available in SurrealDB. This document provides an overview of the custom tags and their respective values.

## References:
- CBOR Protocol - [RFC 8949](https://www.rfc-editor.org/rfc/rfc8949.html)
- CBOR Official Tags - [Iana](https://www.iana.org/assignments/cbor-tags/cbor-tags.xhtml)

## Custom tags

<table>
    <thead>
        <tr>
            <th scope="col">Tag</th>
            <th scope="col">Value</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 0](#tag-0)
            </td>
            <td scope="row" data-label="Value">
                [Datetime](/docs/surrealql/datamodel/datetimes) ([ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) string)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 6](#tag-6)
            </td>
            <td scope="row" data-label="Value">
                [`NONE`](/docs/surrealql/datamodel/none-and-null#none-values)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 7](#tag-7)
            </td>
            <td scope="row" data-label="Value">
                Table name
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 8](#tag-8)
            </td>
            <td scope="row" data-label="Value">
                [Record ID](/docs/surrealql/datamodel/ids)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 9](#tag-9)
            </td>
            <td scope="row" data-label="Value">
                [UUID](/docs/surrealql/datamodel/uuid) (string)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 10](#tag-10)
            </td>
            <td scope="row" data-label="Value">
                [Decimal](/docs/surrealql/datamodel/numbers#decimal-numbers) (string)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 12](#tag-12)
            </td>
            <td scope="row" data-label="Value">
                [Datetime](/docs/surrealql/datamodel/datetimes) (compact)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 13](#tag-13)
            </td>
            <td scope="row" data-label="Value">
                [Duration](/docs/surrealql/datamodel/datetimes#durations-and-datetimes) (string)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 14](#tag-14)
            </td>
            <td scope="row" data-label="Value">
                [Duration](/docs/surrealql/datamodel/datetimes#durations-and-datetimes) (compact)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 15](#tag-15)
            </td>
            <td scope="row" data-label="Value">
                [Future](/docs/surrealql/datamodel/futures) (compact)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 37](#tag-37)
            </td>
            <td scope="row" data-label="Value">
                [UUID](/docs/surrealql/datamodel/uuid) (binary)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 49](#tag-49)
            </td>
            <td scope="row" data-label="Value">
                [Range](/docs/surrealql/datamodel/ranges)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 50](#tag-50)
            </td>
            <td scope="row" data-label="Value">
                [Included Bound](/docs/surrealql/datamodel/ranges)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 51](#tag-51)
            </td>
            <td scope="row" data-label="Value">
                [Excluded Bound](/docs/surrealql/datamodel/ranges)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 88](#tag-88)
            </td>
            <td scope="row" data-label="Value">
                [Geometry Point](/docs/surrealql/datamodel/geometries#point)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 89](#tag-89)
            </td>
            <td scope="row" data-label="Value">
                [Geometry Line](/docs/surrealql/datamodel/geometries#linestring)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 90](#tag-90)
            </td>
            <td scope="row" data-label="Value">
                [Geometry Polygon](/docs/surrealql/datamodel/geometries#polygon)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 91](#tag-91)
            </td>
            <td scope="row" data-label="Value">
                [Geometry MultiPoint](/docs/surrealql/datamodel/geometries#multipoint)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 92](#tag-92)
            </td>
            <td scope="row" data-label="Value">
                [Geometry MultiLine](/docs/surrealql/datamodel/geometries#multilinestring)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 93](#tag-93)
            </td>
            <td scope="row" data-label="Value">
                [Geometry MultiPolygon](/docs/surrealql/datamodel/geometries#multipolygon)
            </td>
        </tr>
        <tr>
            <td scope="row" data-label="Tag">
                [Tag 94](#tag-94)
            </td>
            <td scope="row" data-label="Value">
                [Geometry Collection](/docs/surrealql/datamodel/geometries)
            </td>
        </tr>
    </tbody>
</table>

### Tag 0

A [datetime](/docs/surrealql/datamodel/datetimes) represented in an [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) string.

Adopted from the [Iana Specification](https://www.iana.org/assignments/cbor-tags/cbor-tags.xhtml).

**Note:** [Tag 12](#tag-12) is preferred and always sent back by SurrealDB.

### Tag 6

Represents a [`NONE`](/docs/surrealql/datamodel/none-and-null#none-values) value. The value passed to the tagged value is `null`, as it cannot be empty.

### Tag 7

A table name, represented as a string.

### Tag 8

A [Record ID](/docs/surrealql/datamodel/ids), represented as an two-value array, containing a table part (string) and an id part (string, number, object or array).

Instead of an two-value array, SurrealDB also accepts a string with a string-formatted Record ID. A string Record ID will never be sent back from SurrealDB, however.

### Tag 9

A [UUID](/docs/surrealql/datamodel/uuid) represented in a string format.

**Note:** [Tag 37](#tag-37) is preferred and always sent back by SurrealDB.

### Tag 10

A [Decimal](/docs/surrealql/datamodel/numbers#decimal-numbers) represented in a string format.

### Tag 12

A [Datetime](/docs/surrealql/datamodel/datetimes) represented in a two-value array, containing seconds (number) and optionally nanoseconds (number).

### Tag 13

A [Duration](/docs/surrealql/datamodel/datetimes#durations-and-datetimes) represented in a string format.

**Note:** [Tag 14](#tag-14) is preferred and always sent back by SurrealDB.

### Tag 14

A [Duration](/docs/surrealql/datamodel/datetimes#durations-and-datetimes) repesented in a two-value array, containing optionally seconds (number) and optionally nanoseconds (number). An empty array will be considered a duration of 0.

### Tag 15

A [Future](/docs/surrealql/datamodel/futures) represented as a string containing the uncomputed SurrealQL query or expression. The value transported needs to be returned in an `Object` in a `{}`,  this will also be the format you receive it in from SurrealDB this will allow for it to be computed when accedded or used within a query.

### Tag 37

A [UUID](/docs/surrealql/datamodel/uuid) represented in a binary format. Please reference (https://docs.rs/uuid/latest/uuid/struct.Uuid.html#method.as_bytes).

Adopted from the [Iana Specification](https://www.iana.org/assignments/cbor-tags/cbor-tags.xhtml).

### Tag 49

A [Range](/docs/surrealql/datamodel/ranges) represented as a two-value array containing optional bounds. Each bound can be either null (for unbounded), or a tagged value using either Tag 50 (included bound) or Tag 51 (excluded bound). 

The bounds follow SurrealQL's range syntax where `..` represents a range, `>..` represents an excluded lower bound, and `..=` represents an included upper bound.

### Tag 50

An included bound value used within [Range](/docs/surrealql/datamodel/ranges) bounds. The tagged value represents an inclusive boundary (equivalent to `..=` for upper bounds in SurrealQL range syntax).

### Tag 51

An excluded bound value used within [Range](/docs/surrealql/datamodel/ranges) bounds. The tagged value represents an exclusive boundary (equivalent to `>..` for lower bounds in SurrealQL range syntax).

### Tag 88

A [Geometry Point](/docs/surrealql/datamodel/geometries#point) represented by a two-value array containing a longitude (float) and latitude (float). 

### Tag 89

A [Geometry Line](/docs/surrealql/datamodel/geometries#linestring) represented by an array with two or more points ([Tag 88](#tag-88)).

### Tag 90

A [Geometry Polygon](/docs/surrealql/datamodel/geometries#polygon) represented by an array with one or more closed lines ([Tag 89](#tag-89)).

If the lines are not closed, meaning that the first and last point are equal, then SurrealDB will automatically suffix the line with it's first point.

### Tag 91

A [Geometry MultiPoint](/docs/surrealql/datamodel/geometries#multipoint) represented by an array with one or more points ([Tag 88](#tag-88)).

### Tag 92

A [Geometry MultiLine](/docs/surrealql/datamodel/geometries#multilinestring) represented by an array with one or more lines ([Tag 89](#tag-89)).

### Tag 93

A [Geometry MultiPolygon](/docs/surrealql/datamodel/geometries#multipolygon) represented by an array with one or more polygons ([Tag 90](#tag-90)).

### Tag 94

A [Geometry Collection](/docs/surrealql/datamodel/geometries) represented by an array with one or more geometry values ([Tag 88](#tag-88), [Tag 89](#tag-89), [Tag 90](#tag-90), [Tag 91](#tag-91), [Tag 92](#tag-92), [Tag 93](#tag-93) or [Tag 94](#tag-94)).
