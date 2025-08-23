---
sidebar_position: 1
sidebar_label: Overview
title: SurrealQL | Query Language 
description: In this section, you will explore SurrealQL, a powerful database query language that closely resembles traditional SQL but comes with unique differences and improvements.
no_page_headings: true
---

import Image from "@components/Image.astro";
import LightLogo from "@img/icon/light/ql-light.png";
import DarkLogo from "@img/icon/dark/surrealql.png";

<div class="flag-title">
	<Image
		class="size-11 my-auto"
		alt="SurrealQL"
		width={300}
		src={{
			light: LightLogo,
    		dark: DarkLogo,
		}}
	/>
	# SurrealQL
</div>

SurrealQL is a powerful and intuitive database query language that closely resembles traditional SQL but comes with unique differences and improvements.

SurrealQL is designed to provide developers with a seamless and intuitive way to interact with SurrealDB. It offers a familiar syntax and supports various statement types, allowing you to perform complex database operations efficiently.

While SurrealQL shares similarities with traditional SQL, it introduces enhancements and optimizations that make it well-suited for working with SurrealDB's advanced features and data models. Whether you are querying data, modifying records, or managing database structures, SurrealQL provides a comprehensive set of capabilities to meet your needs.

## Key Features

SurrealQL offers several key features that make it a powerful tool for working with SurrealDB:

- **Familiar Syntax**: SurrealQL adopts a syntax similar to traditional SQL, making it easy for developers familiar with SQL to transition to SurrealDB seamlessly.

- **Advanced Querying**: SurrealQL supports a wide range of querying capabilities, including filtering, sorting, aggregating, and joining data from multiple tables.

- **Data Manipulation**: With SurrealQL, you can easily insert, update, and delete records in your SurrealDB database, allowing you to manage your data effectively.

- **Graph relationships**: SurrealQL supports graph relationships, allowing you to define and query relationships between records in your database.

- **Schema Management**: SurrealQL provides features for creating and modifying database schemas, allowing you to define the structure of your data and enforce data integrity.

- **Performance Optimization**: SurrealQL incorporates optimizations specific to SurrealDB, ensuring efficient execution of queries and minimizing resource usage.

## Getting Started

To start using [SurrealQL](/docs/surrealql/statements/begin), refer to the documentation on the various statement types and their syntax. The statements page provides comprehensive examples and explanations for each statement type, helping you understand how to construct queries and interact with SurrealDB effectively.

We hope that SurrealQL empowers you to leverage the full potential of SurrealDB and enables you to build robust and scalable applications. Let's dive into the world of SurrealQL and unlock the capabilities of SurrealDB together!

## Resources

To learn more about SurrealQL and how to use it effectively, check out the following resources:

- [Select Statement](/docs/surrealql/statements/select): Learn how to retrieve data from your SurrealDB database using the `SELECT` statement and explore various querying options:

<iframe width="100%" src="https://www.youtube.com/embed/TyX45cyZ-W0?si=S9M59afDEiqxeC5d" style={{ aspectRatio: 1.7, paddingTop: '20px' }} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

---
sidebar_position: 2
sidebar_label: Demo data
title: Demo data | SurrealQL
description: To quickly test out SurrealDB and SurrealQL functionality, we've included demo data which you can download and import into SurrealDB.
---

import Image from "@components/Image.astro";
import SurrealistMini from "@components/SurrealistMini.astro";

import LightOverview from "@img/image/light/surreal-deal-store-light.png";
import LightSchema from "@img/image/light/surreal_deal_light.png";

import DarkOverview from "@img/image/dark/surreal-deal-store.png";
import DarkSchema from "@img/image/dark/surreal_deal_dark.png";

# Demo data

To quickly test out SurrealDB and SurrealQL functionality, we've included two demo datasets here in `.surql` files which you can download and [`import`](/docs/surrealdb/cli/import) into SurrealDB using the CLI

## Surreal Deal Store - there is a lot in store for you!

Surreal Deal Store is our new and improved demo dataset based on our [SurrealDB Store](https://surrealdb.store/).
The dataset is made up of 12 tables using both [graph relations](/docs/surrealql/statements/relate) and [record links](/docs/surrealql/datamodel/records).

In the diagram below, the nodes in pink are the [standard tables](/docs/surrealql/statements/define/table), the ones in purple represent the [edge tables](/docs/surrealql/statements/relate) which shows relationships between records and SurrealDB as a graph database. While the nodes in gray are the [pre-computed table views](/docs/surrealql/statements/define/table).

<Image
  alt="Surreal Deal Data Model"
  src={{
    light: LightOverview,
    dark: DarkOverview,
  }}
/>


### Download

| Dataset                                                                          | URL                                                       |
| -------------------------------------------------------------------------------- | --------------------------------------------------------- |
| [Surreal Deal Store](https://datasets.surrealdb.com/surreal-deal-store.surql)             | https://datasets.surrealdb.com/surreal-deal-store.surql      |
| [Surreal Deal Store (mini)](https://datasets.surrealdb.com/surreal-deal-store-mini.surql) | https://datasets.surrealdb.com/surreal-deal-store-mini.surql |

### Import

First, download any of the [available datasets](#download).

Secondly, [start the server](/docs/surrealdb/cli/start).

```bash
# Create a new in-memory server
surreal start --user root --pass secret --allow-all
```

Lastly, use the [import command](/docs/surrealdb/cli/import) to add the dataset.

Use the command below to import the [surreal deal store dataset](https://datasets.surrealdb.com/surreal-deal-store.surql):

```bash
surreal import --conn http://localhost:8000 --user root --pass secret --ns test --db test surreal-deal-store.surql
```

To import the surreal downloaded the [Surreal Deal store (mini)](https://datasets.surrealdb.com/surreal-deal-store-mini.surql) use the command below:

```bash
surreal import --conn http://localhost:8000 --user root --pass secret --ns test --db test surreal-deal-store-mini.surql
```

Please be aware that the import process might take a few seconds.


### Using Curl

First, start the surrealdb server

```bash
# Create a new in-memory server
surreal start --user root --pass secret --allow-all
```

Then, download the file and load it into the database

```bash
# Download the file
curl -L "https://datasets.surrealdb.com/surreal-deal-store.surql" -o surreal-deal-store.surql

# Load the file into the database using the rest endpoint
curl -v -X POST -u "root:root" -H "NS: test" -H "DB: test" -H "Accept: application/json" --data-binary @surreal-deal-store.surql http://localhost:8000/import
```

If you want to use the mini version:

```bash
# Download the file
curl -L "https://datasets.surrealdb.com/surreal-deal-store-mini.surql" -o surreal-deal-store-mini.surql

# Load the file into the database using the rest endpoint
curl -v -X POST -u "root:root" -H "NS: test" -H "DB: test" -H "Accept: application/json" --data-binary @surreal-deal-store-mini.surql http://localhost:8000/import
```

### Sample queries

Here are some sample queries you can run on the Surreal Deal Store dataset. We've also included a [Surrealist Mini](https://app.surrealdb.com/mini) below to help you run these queries.

> [!NOTE]
> The query results below have been limited to 4 rows for brevity. If you remove the `LIMIT 4` clause from the queries, you'll see the full results.



<SurrealistMini url='https://app.surrealdb.com/mini?query=--+Query+1%3A+Using+record+links+to+select+from+the+seller+table+%0ASELECT%0A++name%2C%0A++seller.name%0AFROM+product+LIMIT+4%3B%0A%0A%0A--+Query+2%3A+Using+graph+relations+to+select+from+the+person+and+product+table%0ASELECT%0A++++time.created_at as order_date%2C%0A++++product_name%2C%0A++++%3C-person.name+as+person_name%2C%0A++++-%3Eproduct.details%0AFROM+order+LIMIT+4%3B%0A%0A%0A--+Query+3%3A+Conditional+filtering+based+on+an+embedded+object+property.%0ASELECT+%0A++name%2C%0A++email+%0AFROM+person+%0AWHERE+address.country+%3F%3D+%22England%22+LIMIT+4%3B%09%0A%0A%0A--+Query+4%3A+Conditional+filtering+using+relationships.%0ASELECT+*+FROM+review%0AWHERE+-%3Eproduct.sub_category+%3F%3D+%22Activewear%22+LIMIT+4%3B%0A%0A%0A--+Query+5%3A+Count+orders+based+on+order+status%0ASELECT+count%28%29+FROM+order%0AWHERE+order_status+IN+%5B+%22processed%22%2C+%22shipped%22%5D%0AGROUP+ALL+LIMIT+4%3B%0A%0A%0A--+Query+6%3A+Get+a+deduplicated+list+of+products+that+were+ordered%0ASELECT+%0A++++array%3A%3Adistinct%28product_name%29+as+ordered_products%0AFROM+order%0AGROUP+ALL+LIMIT+4%3B%0A%0A%0A--+Query+7%3A+Get+the+average+price+per+product+category%0ASELECT+%0A++++-%3Eproduct.category+AS+product_category%2C%0A++++math%3A%3Amean%28price%29+AS+avg_price%0AFROM+order%0AGROUP+BY+product_category%0AORDER+BY+avg_price+DESC+LIMIT+4%3B%0A%0A%0A--+Query+8%3A+encapsulating+logic+in+a+function%0ARETURN+fn%3A%3Anumber_of_unfulfilled_orders%28%29%3B%0A%0A%0A--+Query+9%3A+using+a+custom+fuction+for+currency+conversion%0ASELECT+%0A++++product_name%2C%0A++++fn%3A%3Apound_to_usd%28price%29+AS+price_usd%0AFROM+order+LIMIT+4%3B&dataset=surreal-deal-store&orientation=horizontal'/>

---
sidebar_position: 3
sidebar_label: Operators
title: Operators | SurrealQL
description: A variety of operators in SurrealQL allow for complex manipulation of data, and advanced logic.
---
import Since from '@components/shared/Since.astro'

# Operators

A variety of operators in SurrealQL allow for complex manipulation of data, and advanced logic.

<table>
  <thead>
    <tr>
      <th scope="col">Operator</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Operator"><a href="#and"><code>&&</code> or <code>AND</code></a></td>
      <td scope="row" data-label="Description">Checks whether both of two values are truthy</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#or"><code>||</code> or <code>OR</code></a></td>
      <td scope="row" data-label="Description">Checks whether either of two values is truthy</td>
    </tr>
    <tr>
        <td scope="row" data-label="Operator"><a href="#not"><code>!</code></a></td>
        <td scope="row" data-label="Description">Reverses the truthiness of a value</td>
    </tr>
    <tr>
        <td scope="row" data-label="Operator"><a href="#not_not"><code>!!</code></a></td>
        <td scope="row" data-label="Description">Determines the truthiness of a value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#nco"><code>??</code></a></td>
      <td scope="row" data-label="Description">Check whether either of two values are truthy and not NULL</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#tco"><code>?:</code></a></td>
      <td scope="row" data-label="Description">Check whether either of two values are truthy</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#equal"><code>=</code> or <code>IS</code></a></td>
      <td scope="row" data-label="Description">Check whether two values are equal</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#notequal"><code>!=</code> or <code>IS NOT</code></a></td>
      <td scope="row" data-label="Description">Check whether two values are not equal</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#exact"><code>==</code></a></td>
      <td scope="row" data-label="Description">Check whether two values are exactly equal</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#anyequal"><code>?=</code></a></td>
      <td scope="row" data-label="Description">Check whether any value in a set is equal to a value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#allequal"><code>*=</code></a></td>
      <td scope="row" data-label="Description">Check whether all values in a set are equal to a value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#match"><code>~</code></a></td>
      <td scope="row" data-label="Description">Compare two values for equality using fuzzy matching</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#notmatch"><code>!~</code></a></td>
      <td scope="row" data-label="Description">Compare two values for inequality using fuzzy matching</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#anymatch"><code>?~</code></a></td>
      <td scope="row" data-label="Description">Check whether any value in a set is equal to a value using fuzzy matching</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#allmatch"><code>*~</code></a></td>
      <td scope="row" data-label="Description">Check whether all values in a set are equal to a value using fuzzy matching</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#lessthan"><code>&lt;</code></a></td>
      <td scope="row" data-label="Description">Check whether a value is less than another value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#lessthanorequal"><code>&lt;=</code></a></td>
      <td scope="row" data-label="Description">Check whether a value is less than or equal to another value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#greaterthan"><code>&gt;</code></a></td>
      <td scope="row" data-label="Description">Check whether a value is greater than another value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#greaterthanorequal"><code>&gt;=</code></a></td>
      <td scope="row" data-label="Description">Check whether a value is greater than or equal to another value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#add"><code>+</code></a></td>
      <td scope="row" data-label="Description">Add two values together</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#sub"><code>-</code></a></td>
      <td scope="row" data-label="Description">Subtract a value from another value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#mul"><code>*</code> or <code>×</code></a></td>
      <td scope="row" data-label="Description">Multiply two values together</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#div"><code>/</code> or <code>÷</code></a></td>
      <td scope="row" data-label="Description">Divide a value by another value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#pow"><code>**</code></a></td>
      <td scope="row" data-label="Description">Raises a base value by another value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#inside"><code>IN</code></a></td>
      <td scope="row" data-label="Description">Checks whether a value is contained within another value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#notinside"><code>NOT IN</code></a></td>
      <td scope="row" data-label="Description">Checks whether a value is not contained within another value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#contains"><code>CONTAINS</code> or <code>∋</code></a></td>
      <td scope="row" data-label="Description">Checks whether a value contains another value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#containsnot"><code>CONTAINSNOT</code> or <code>∌</code></a></td>
      <td scope="row" data-label="Description">Checks whether a value does not contain another value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#containsall"><code>CONTAINSALL</code> or <code>⊇</code></a></td>
      <td scope="row" data-label="Description">Checks whether a value contains all other values</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#containsany"><code>CONTAINSANY</code> or <code>⊃</code></a></td>
      <td scope="row" data-label="Description">Checks whether a value contains any other value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#containsnone"><code>CONTAINSNONE</code> or <code>⊅</code></a></td>
      <td scope="row" data-label="Description">Checks whether a value contains none of the following values</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#inside"><code>INSIDE</code> or <code>∈</code></a></td>
      <td scope="row" data-label="Description">Checks whether a value is contained within another value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#notinside"><code>NOTINSIDE</code> or <code>NOT IN</code> or <code>∉</code></a></td>
      <td scope="row" data-label="Description">Checks whether a value is not contained within another value</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#allinside"><code>ALLINSIDE</code> or <code>⊆</code></a></td>
      <td scope="row" data-label="Description">Checks whether all values are contained within other values</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#anyinside"><code>ANYINSIDE</code> or <code>⊂</code></a></td>
      <td scope="row" data-label="Description">Checks whether any value is contained within other values</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#noneinside"><code>NONEINSIDE</code> or <code>⊄</code></a></td>
      <td scope="row" data-label="Description">Checks whether no value is contained within other values</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#outside"><code>OUTSIDE</code></a></td>
      <td scope="row" data-label="Description">Checks whether a geometry type is outside of another geometry type</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#intersects"><code>INTERSECTS</code></a></td>
      <td scope="row" data-label="Description">Checks whether a geometry type intersects another geometry type</td>
    </tr>
    <tr>
      <td scope="row" data-label="Operator"><a href="#matches"><code>@@</code> or <code>@[ref]@</code></a></td>
      <td scope="row" data-label="Description">Checks whether the terms are found in a full-text indexed field</td>
    </tr>
      <tr>
    <td scope="row" data-label="Operator"><a href="#knn"><code> &lt;|4|&gt; </code> or <code>&lt;|3,HAMMING| &gt;</code></a></td>
    <td scope="row" data-label="Description">Performs a K-Nearest Neighbors (KNN) search to find a specified number of records closest to a given data point, optionally using a defined distance metric. Supports customizing the number of results and choice of distance calculation method.</td>
  </tr>
  </tbody>
</table>

## `&&` or `AND` {#and}

Checks whether both of two values are [truthy](/docs/surrealql/datamodel/values#values-and-truthiness).

```surql
SELECT * FROM 10 AND 20 AND 30;

30
```

<br />

## `||` or `OR` {#or}

Checks whether either of two values are [truthy](/docs/surrealql/datamodel/values#values-and-truthiness).

```surql
SELECT * FROM 0 OR false OR 10;

10
```

<br />

## `!` {#not}

Reverses the truthiness of a value.

```surql
SELECT * FROM !(TRUE OR FALSE)

false

SELECT * FROM !"Has a value";

false
```

<br />

## `!!` {#not_not}

Determines the truthiness of a value (simply an application of the `!` operator twice).

```surql
SELECT * FROM !!"Has a value";

true
```

## `??` {#nco}

Check whether either of two values are [truthy](/docs/surrealql/datamodel/values#values-and-truthiness) and not `NULL`.

```surql
SELECT * FROM NULL ?? 0 ?? false ?? 10;

0
```

<br />

## `?:` {#tco}

Check whether either of two values are [truthy](/docs/surrealql/datamodel/values#values-and-truthiness).

```surql
SELECT * FROM NULL ?: 0 ?: false ?: 10;

10
```

<br />

## `=` or `IS` {#equal}

Check whether two values are equal.

```surql
SELECT * FROM true = "true";

false
```
```surql
SELECT * FROM 10 = "10";

false
```
```surql
SELECT * FROM 10 = 10.00;

true
```
```surql
SELECT * FROM 10 = "10.3";

false
```
```surql
SELECT * FROM [1, 2, 3] = [1, 2, 3];

true
```
```surql
SELECT * FROM [1, 2, 3] = [1, 2, 3, 4];

false
```
```surql
SELECT * FROM { this: "object" } = { this: "object" };

true
```
```surql
SELECT * FROM { this: "object" } = { another: "object" };

false
```

<br />

## `!=` or `IS NOT` {#notequal}

Check whether two values are equal.

```surql
SELECT * FROM 10 != "15";

true
```
```surql
SELECT * FROM 10 != "test";

true
```
```surql
SELECT * FROM [1, 2, 3] != [3, 4, 5];

true
```

<br />

## `==` {#exact}

Check whether two values are exact. This operator also checks that each value has the same type.

```surql
SELECT * FROM 10 == 10;

true
```
```surql
SELECT * FROM 10 == "10";

false
```
```surql
SELECT * FROM true == "true";

false
```

<br />

## `?=` {#anyequal}

Check whether any value in an array equals another value.

```surql
SELECT * FROM [10, 15, 20] ?= 10;

true
```

<br />

## `*=` {#allequal}

Check whether all values in an array equals another value.

```surql
SELECT * FROM [10, 10, 10] *= 10;

true
```

<br />

## `~` {#match}

Compare two values for equality using fuzzy matching.

```surql
SELECT * FROM "test text" ~ "Test";

true
```
```surql
SELECT * FROM "true" ~ true;

false
```
```surql
SELECT * FROM ["test", "thing"] ~ "test";

false
```

<br />

## `!~` {#notmatch}

Compare two values for inequality using fuzzy matching.

```surql
SELECT * FROM "other text" !~ "test";

true
```
```surql
SELECT * FROM "test text" !~ "Test";

false
```

<br />

## `?~` {#anymatch}

Check whether any value in a set is equal to a value using fuzzy matching.

```surql
SELECT * FROM ["true", "test", "text"] ?~ true;

false
```
```surql
SELECT * FROM [1, 2, 3] ?~ "2";

false
```

<br />

## `*~` {#allmatch}

Check whether all values in a set are equal to a value using fuzzy matching.

```surql
SELECT * FROM ["TRUE", true, "true", "TrUe"] *~ true;

false
```
```surql
SELECT * FROM ["TEST", "test", "text"] *~ "test";

false
```

<br />

## `<` {#lessthan}

Check whether a value is less than another value.

```surql
SELECT * FROM 10 < 15;

true
```

<br />

## `<=` {#lessthanorequal}

Check whether a value is less than or equal to another value.

```surql
SELECT * FROM 10 <= 15;

true
```

<br />

## `>` {#greaterthan}

Check whether a value is less than another value.

```surql
SELECT * FROM 15 > 10;

true
```

<br />

## `>=` {#greaterthanorequal}

Check whether a value is less than or equal to another value.

```surql
SELECT * FROM 15 >= 10;

true
```

<br />

## `+` {#add}

Add two values together.

```surql
SELECT * FROM 10 + 10;

20
```
```surql
SELECT * FROM "test" + " " + "this";

"test this"
```
```surql
SELECT * FROM 13h + 30m;

"13h30m"
```

<br />

## `-` {#sub}

Subtracts a value from another value.

```surql
SELECT * FROM 20 - 10;

10
```
```surql
SELECT * FROM 2m - 1m;

"1m"
```

<br />

## `*` or `×` {#mul}

Multiplies a value by another value.

```surql
SELECT * FROM 20 * 2;

40
```

<br />

## `/` or `÷` {#div}

Divides a value with another value.

```surql
SELECT * FROM 20 / 2;

10
```

<br />

## `**` {#pow}

Raises a base value by another value.

```surql
SELECT * FROM 20 ** 3;

8000
```

<br />

## `CONTAINS` or `∋` {#contains}

Check whether a value contains another value.

```surql
SELECT * FROM [10, 20, 30] CONTAINS 10;

true
```
```surql
SELECT * FROM "this is some text" CONTAINS "text";

true
```
```surql
SELECT * FROM {
	type: "Polygon",
	coordinates: [[
		[-0.38314819, 51.37692386], [0.1785278, 51.37692386],
		[0.1785278, 51.61460570], [-0.38314819, 51.61460570],
		[-0.38314819, 51.37692386]
	]]
} CONTAINS (-0.118092, 51.509865);

true
```

<br />

## `CONTAINSNOT` or `∌` {#containsnot}

Check whether a value does not contain another value.

```surql
SELECT * FROM [10, 20, 30] CONTAINSNOT 15;

true
```
```surql
SELECT * FROM "this is some text" CONTAINSNOT "other";

true
```
```surql
SELECT * FROM {
	type: "Polygon",
	coordinates: [[
		[-0.38314819, 51.37692386], [0.1785278, 51.37692386],
		[0.1785278, 51.61460570], [-0.38314819, 51.61460570],
		[-0.38314819, 51.37692386]
	]]
} CONTAINSNOT (-0.518092, 53.509865);

true
```

<br />

## `CONTAINSALL` or `⊇` {#containsall}

Check whether a value contains all of multiple values.

```surql
SELECT * FROM [10, 20, 30] CONTAINSALL [10, 20, 10];

true
```

<br />

## `CONTAINSANY` or `⊃` {#containsany}

Check whether a value contains any of multiple values.

```surql
SELECT * FROM [10, 20, 30] CONTAINSANY [10, 15, 25];

true
```

<br />

## `INSIDE` or `∈` or `IN` {#inside}

Check whether a value is contained within another value.

```surql
SELECT * FROM 10 INSIDE [10, 20, 30];

true
```
```surql
SELECT * FROM "text" INSIDE "this is some text";

true
```
```surql
SELECT * FROM (-0.118092, 51.509865) INSIDE {
	type: "Polygon",
	coordinates: [[
		[-0.38314819, 51.37692386], [0.1785278, 51.37692386],
		[0.1785278, 51.61460570], [-0.38314819, 51.61460570],
		[-0.38314819, 51.37692386]
	]]
};

true
```

<Since v="v2.1.0" />

This operator can also be used to check for the existence of a key inside an [object](/docs/surrealql/datamodel/objects). To do so, precede `IN` with the field name as a string.

```surql
"name" IN {
    name: "Riga",
    country: "Latvia"
};

-- true
```

`IN` can also be used with a record ID as long as the ID is expanded to include the fields. Both of the following queries will return `true`.

```surql
CREATE city:riga SET name = "Riga", country = "Latvia", population = 605273;

"name" IN city:riga.*;
"name" IN city:riga.{ name, country };
```

<br />

## `NOTINSIDE` or `∉` or `NOT IN` {#notinside}

Check whether a value is not contained within another value.

```surql
SELECT * FROM 15 NOTINSIDE [10, 20, 30];

true
```
```surql
SELECT * FROM "other" NOTINSIDE "this is some text";

true
```
```surql
SELECT * FROM (-0.518092, 53.509865) NOTINSIDE {
	type: "Polygon",
	coordinates: [[
		[-0.38314819, 51.37692386], [0.1785278, 51.37692386],
		[0.1785278, 51.61460570], [-0.38314819, 51.61460570],
		[-0.38314819, 51.37692386]
	]]
};

true
```

<br />

## `ALLINSIDE` or `⊆` {#allinside}

Check whether all of multiple values are contained within another value.

```surql
SELECT * FROM [10, 20, 10] ALLINSIDE [10, 20, 30];

true
```

<br />

## `ANYINSIDE` or `⊂` {#anyinside}

Check whether any of multiple values are contained within another value.

```surql
SELECT * FROM [10, 15, 25] ANYINSIDE [10, 20, 30];

true
```

<br />

## `NONEINSIDE` or `⊄` {#noneinside}

Check whether none of multiple values are contained within another value.

```surql
SELECT * FROM [15, 25, 35] NONEINSIDE [10, 20, 30];

true
```

<br />

## `OUTSIDE` {#outside}
Check whether a geometry value is outside another geometry value.

```surql
SELECT * FROM (-0.518092, 53.509865) OUTSIDE {
	type: "Polygon",
	coordinates: [[
		[-0.38314819, 51.37692386], [0.1785278, 51.37692386],
		[0.1785278, 51.61460570], [-0.38314819, 51.61460570],
		[-0.38314819, 51.37692386]
	]]
};

true
```

<br />

## `INTERSECTS` {#intersects}
Check whether a geometry value intersects another geometry value.

```surql
SELECT * FROM {
	type: "Polygon",
	coordinates: [[
		[-0.38314819, 51.37692386], [0.1785278, 51.37692386],
		[0.1785278, 51.61460570], [-0.38314819, 51.61460570],
		[-0.38314819, 51.37692386]
	]]
} INTERSECTS {
	type: "Polygon",
	coordinates: [[
		[-0.11123657, 51.53160074], [-0.16925811, 51.51921169],
		[-0.11466979, 51.48223813], [-0.07381439, 51.51322956],
		[-0.11123657, 51.53160074]
	]]
};

true
```

<br />

## `MATCHES` {#matches}
Checks whether the terms are found in a full-text indexed field.

```surql
SELECT * FROM book WHERE title @@ 'rust web';


[
	{
		id: book:1,
		title: 'Rust Web Programming'
	}
]

```
Using the matches operator with a reference checks whether the terms are found, highlights the searched terms, and computes the full-text score.

```surql
SELECT id,
		search::highlight('<b>', '</b>', 1) AS title,
		search::score(1) AS score
FROM book
WHERE title @1@ 'rust web'
ORDER BY score DESC;

[
	{
		id: book:1,
		score: 0.9227996468544006f,
		title: '<b>Rust</b> <b>Web</b> Programming'
	}
]
```

## `KNN`

<Since v="v1.3.0" />

K-Nearest Neighbors (KNN) is a fundamental algorithm used for classifying or regressing based on the closest data points in the feature space, with its performance and scalability critical in applications involving large datasets.

In practice, the efficiency and scalability of the KNN algorithm are crucial, especially when dealing with large datasets. Different implementations of KNN are tailored to optimize these aspects without compromising the accuracy of the results.

SurrealDB supports different K-Nearest Neighbors methods to perform KNN searches, each with unique requirements for syntax.
Below are the details for each method, including how to format your query with examples:

### Brute Force Method

Best for smaller datasets or when the highest accuracy is required.

```syntax title="SurrealQL Syntax"
<|K,DISTANCE_METRIC|>
```

- K: The number of nearest neighbors to retrieve.
- DISTANCE_METRIC: The metric used to calculate distances, such as EUCLIDEAN or MANHATTAN.

```surql
CREATE pts:3 SET point = [8,9,10,11];
SELECT id FROM pts WHERE point <|2,EUCLIDEAN|> [2,3,4,5];
```

### MTREE Index Method

<Since v="v1.3.0" />

Ideal for larger datasets where performance is crucial, and a consistent distance metric can be predefined.

```syntax title="SurrealQL Syntax"
<|K|>
```

- K: The number of nearest neighbors. The distance metric is predefined in the index, simplifying the syntax.

```surql
CREATE pts:3 SET point = [8,9,10,11];
DEFINE INDEX mt_pts ON pts FIELDS point MTREE DIMENSION 4 DIST EUCLIDEAN;
SELECT id FROM pts WHERE point <|2|> [2,3,4,5];
```

### HNSW Method

<Since v="v1.5.0" />

Recommended for very large datasets where speed is essential and some loss of accuracy is acceptable.

```syntax title="SurrealQL Syntax"
<|K,EF|>
```

- K: The number of nearest neighbors.
- EF: The size of the dynamic candidate list during the search, affecting the search's accuracy and speed.

```surql
CREATE pts:3 SET point = [8,9,10,11];
DEFINE INDEX mt_pts ON pts FIELDS point HNSW DIMENSION 4 DIST EUCLIDEAN EFC 150 M 12;
SELECT id FROM pts WHERE point <|10,40|> [2,3,4,5];
```
<br /><br />

## Types of operators, order of operations and binding power

To determine which operator is executed first, a concept called "binding power" is used. Operators with greater binding power will operate directly on their neighbours before those with lower binding power. The following is a list of all operator types from greatest to lowest binding power.

<table>
    <thead>
    <tr>
        <th scope="col">Operator name</th>
        <th scope="col">Description</th>
    </tr>
    </thead>
    <tbody>
        <tr>
            <td scope="row" data-label="Type">`Unary`</td>
            <td scope="row" data-label="Description">The `Unary` operators are `!`, `+`, and `-`.</td>
        </tr>
        <tr>
            <td scope="row" data-label="Type">`Nullish`</td>
            <td scope="row" data-label="Description">The `Nullish` operators are `?:` and `??`.</td>
        </tr>
        <tr>
            <td scope="row" data-label="Type">`Range`</td>
            <td scope="row" data-label="Description">The `Range` operator is `..`.</td>
        </tr>
        <tr>
            <td scope="row" data-label="Type">`Cast`</td>
            <td scope="row" data-label="Description">The `Cast` operator is `<type_name>`, with `type_name` a stand in for the type to cast into. For example, `<string>` or `<number>`.</td>
        </tr>
        <tr>
            <td scope="row" data-label="Type">`Power`</td>
            <td scope="row" data-label="Description">The only `Power` operator is `**`.</td>
        </tr>
        <tr>
            <td scope="row" data-label="Type">`MulDiv`</td>
            <td scope="row" data-label="Description">The `MulDiv` (multiplication and division) operators are `*`, `/`, `÷`, and `%`.</td>
        </tr>
        <tr>
            <td scope="row" data-label="Type">`AddSub`</td>
            <td scope="row" data-label="Description">The `AddSub` (addition and subtraction) operators are `+` and `-`.</td>
        </tr>
        <tr>
            <td scope="row" data-label="Type">`Relation`</td>
            <td scope="row" data-label="Description">The `Relation` operators are `<=`, `>=`, `∋`, `CONTAINS`, `∌`, `CONTAINSNOT`, `∈`, `INSIDE`, `∉`, `NOTINSIDE`, `⊇`, `CONTAINSALL`, `⊃`, `CONTAINSANY`, `⊅`, `CONTAINSNONE`, `⊆`, `ALLINSIDE`, `⊂`, `ANYINSIDE`, `⊄`, `NONEINSIDE`, `OUTSIDE`, `INTERSECTS`, `NOT`, and `IN`.</td>
        </tr>
        <tr>
            <td scope="row" data-label="Type">`Equality`</td>
            <td scope="row" data-label="Description">The `Equality` operators are `=`, `IS`, `==`, `!=`, `*=`, `?=`, `~`, `!~`, `*~`, `?~`, and `@`.</td>
        </tr>
        <tr>
            <td scope="row" data-label="Type">`And`</td>
            <td scope="row" data-label="Description">The `And` operators are `&&` and `AND`.</td>
        </tr>
        <tr>
            <td scope="row" data-label="Type">`Or`</td>
            <td scope="row" data-label="Description">The `Or` operators are `||` and `OR`.</td>
        </tr>
    </tbody>
</table>

## Examples of binding power

The following samples show examples of basic operations of varying binding power. The original example is followed by the same example with the parts with higher binding power in parentheses, then the final expression after the first bound portion is calculated, and finally the output.

```surql title="MulDiv first, then AddSub"
1 + 3 * 4;
1 + (3 * 4);
-- Final expression
1 + 12;
-- Output
13
```

```surql title="Power first, then MulDiv"
2**3 * 3;
(2**3) * 3;
-- Final expression
8*3;
-- Output
24
```

```surql title="Unary first, then cast"
<string>-4;
<string>(-4);
-- Output
"-4"
```

```surql title="Cast first, then Power"
<number>"9"**9;
(<number>"9")**9;
-- Final expression
9**9;
-- Output
387420489
```

```surql title="AddSub first, then Relation"
"c" + "at" IN "cats";
("c" + "at") IN "cats";
-- Final expression
"cat" IN "cats";
-- Output
true
```

```surql title="And first, then Or"
true AND false OR true;
(true AND false) OR true;
-- Final expression
false OR true;
-- Output
true
```

```surql title="Unary, then Cast, then Power, then AddSub"
<decimal>-4**2+4;
((<decimal>(-4))**2)+4;
-- Output
20
```

## $param = value

If the database encounters a statement composed of a parameter name followed by `=` and a value, it will be considered to be part of a `LET` statement as opposed to the equality operator.

```surql
$name = "Trevor";
-- Binds "Trevor" to $name and returns `NONE`
-- Does not return `true`
$name = "Trevor";
```

To compare for equality in this case, the statement order can be reversed or the `==` operator can be used.

```surql
$name = "Trevor";
-- Both return `true`
"Trevor" = $name;
$name == "Trevor";
```

