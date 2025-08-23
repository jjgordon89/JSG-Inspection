---
sidebar_position: 1
sidebar_label: CLI
title: CLI tool
description: The SurrealDB command-line tool can be used to export a dataset as SurrealQL from a local or remote SurrealDB database, import SurrealQL data into a local or remote database, and start a single SurrealDB instance or distributed cluster.
---

# CLI tool

The SurrealDB command-line tool uses a single command for functionality such as [starting a single SurrealDB instance](/docs/surrealdb/cli/start), [exporting a dataset as a `.surql` file](/docs/surrealdb/cli/export), [importing SurrealQL](/docs/surrealdb/cli/import) into a local or remote database, [upgrading](/docs/surrealdb/cli/upgrade) to a new version of SurrealDB, or [opening a REPL](/docs/surrealdb/cli/sql) to make queries on a running instance.

>[!IMPORTANT]
>Before using the CLI, you will need to [install SurrealDB](/docs/surrealdb/installation). To experiment with SurrealDB before installing, see the [Surrealist sandbox](https://app.surrealdb.com/).

## Getting Started

The CLI allows you to use the `surreal` command from your terminal or command prompt. This documentation provides detailed information on each command, including usage examples and options.

When starting with the CLI, the most commonly used commands are [`surreal start`](/docs/surrealdb/cli/start) to start the server, along with [`surreal sql`](/docs/surrealdb/cli/sql) to open up an interactive shell to make queries. Other common commands are [`surreal upgrade`](/docs/surrealdb/cli/upgrade) to switch between versions of SurrealDB, and [`surreal import`](/docs/surrealdb/cli/import) and [`surreal export`](/docs/surrealdb/cli/export) to import and export your data.


For a quickstart, [`surreal start`](/docs/surrealdb/cli/start) and [`surreal sql`](/docs/surrealdb/cli/sql) will be enough to get you started.

```bash
surreal start --user root --pass secret
```
Unless you specify otherwise, the CLI will start a database in memory that serves at `127.0.0.1:8000 or (http://localhost:8000)`. This database has a single root user named `root` and a password `root`.

In another window, you can then open up an interactive shell to make queries using the  `surreal sql` command.

```bash
surreal sql --namespace ns --database db --username root --password root --pretty
```

> [!WARNING]
> Using generic usernames and passwords is not recommended for production use. Please replace the authentication credentials with your own.

This will start an interactive shell to make queries. Since you are logged in as the root user inside a namespace called `ns` and a database called `db`, with pretty (easily readable) output per query.

You can then try out a few queries and see the output.

```bash
ns/db> CREATE person SET age = 20;
ns/db> CREATE person SET age = 30;
ns/db> SELECT * FROM person WHERE age > 25;
```

```bash title="Output"
[
	{
		age: 20,
		id: person:6jodx8xv39jsxdgykt0t
	}
]

[
	{
		age: 30,
		id: person:10bcq2owseyqqoinjgxl
	}
]

[
	{
		age: 30,
		id: person:10bcq2owseyqqoinjgxl
	}
]
```

Alternatively, you can start a local database in memory with the command below. The `--endpoint memory` flag will start a database in memory, while the other arguments will connect to a single namespace called `test` and a database called `test`. Please replace the username and password with your own. 

```bash
surreal sql --endpoint memory --namespace test --database test --username username --password password
```

>[!WARNING]
> The above command will start a database in memory with a single namespace called `test` and a database called `test` and allow root access to the database. Using generic usernames and passwords is not recommended for production use.

We hope that the SurrealDB CLI simplifies your interactions with SurrealDB and empowers you to efficiently manage your databases and clusters. Let's dive into the CLI section and explore its capabilities!

---
sidebar_position: 2
sidebar_label: Start command
title: Start command | CLI tool
description: A command that begins a running instance of a SurrealDB server with arguments to set the storage backend, authentication and more.
---
import Since from '@components/shared/Since.astro'
import Label from "@components/shared/Label.astro";
import Tabs from "@components/Tabs/Tabs.astro";
import TabItem from "@components/Tabs/TabItem.astro";

# Start command

The start command starts a SurrealDB server in memory, on disk, or in a distributed setup.

> [!NOTE: BEFORE YOU START]
> Make sure you’ve [installed SurrealDB](/docs/surrealdb/installation) — it should only take a second!

## Command options

<Tabs groupId="surreal-start">

<TabItem value="V1" label="V1.x" >
<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th>Description</th>
        </tr>
    </thead>  
    <tbody>
        <tr>
            <td colspan="2">
                `-b` / `--bind`
               <Label label="optional" />
            </td>
            <td>
            Sets the hostname or IP address to listen for connections on
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-l` / `--log`
               <Label label="optional" />
            </td>
            <td>
                Sets the logging level for the database server
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-u` / `--user`
               <Label label="optional" />
            </td>
            <td>
                Sets master username for the database
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-p` / `--pass`
               <Label label="optional" />
            </td>
            <td>
                Sets master password for the database
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--allow-experimental`
               <Label label="optional" />
            </td>
            <td>
                Enable experimental capabilities
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--auth`
               <Label label="optional" />
            </td>
            <td>
                Sets authentication to enabled
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--no-identification-headers`
               <Label label="optional" />
            </td>
            <td>
                Whether to suppress the server name and version headers
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-s` / `--strict`
               <Label label="optional" />
            </td>
            <td>
                Sets whether strict mode is enabled on this database instance
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

<TabItem value="V2" label="V2.x" >
<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2">
                `-b` / `--bind`
               <Label label="optional" />
            </td>
            <td>
            Sets the hostname or IP address to listen for connections on
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--import-file`
               <Label label="optional" />
            </td>
            <td>
            Path to a SurrealQL (`.surql`) file that will be imported when starting the server
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-l` / `--log`
               <Label label="optional" />
            </td>
            <td>
                Sets the logging level for the database server
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-u` / `--user`
               <Label label="optional" />
            </td>
            <td>
                Sets master username for the database
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-p` / `--pass`
               <Label label="optional" />
            </td>
            <td>
                Sets master password for the database
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--unauthenticated`
               <Label label="optional" />
            </td>
            <td>
                Whether to allow unauthenticated access
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--no-identification-headers`
               <Label label="optional" />
            </td>
            <td>
                Whether to suppress the server name and version headers
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-s` / `--strict`
               <Label label="optional" />
            </td>
            <td>
                Sets whether strict mode is enabled on this database instance
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--temporary-directory`
               <Label label="optional" />
            </td>
            <td>
                Sets the directory for storing temporary database files
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--allow-experimental`
               <Label label="optional" />
            </td>
            <td>
                Sets the experimental capabilities to the experimental capabilities you want to allow.
            </td>
        </tr>
    </tbody>
</table>
</TabItem>

</Tabs>

## Positional argument

In the `surreal start` command, the path argument is used to specify the location of the database. If no argument is given, the default of `memory` for non-persistent storage in memory is assumed. 

When using a path argument with SurrealDB, we recommend not using the `file://` prefix. Instead, please use [`surrealkv://`](/docs/surrealkv) or [`rocksdb://`](/docs/surrealdb/cli/start#rocksdb) as the path argument. If you are using the `file://` prefix, the database will start with the following warning:

```bash 
file:// is deprecated, please use surrealkv:// or rocksdb://
```

<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th>Description</th>
        </tr>
    </thead>  
    <tbody>
        <tr>
            <td colspan="2">
                `path`
               <Label label="optional" />
            </td>
            <td>
                Sets the path for storing data. If no argument is given, the default of `memory` for non-persistent storage in memory is assumed.
                
                <br/>
                Arguments for persistent backends are a combination of the backend name, a `:` or `://`, and an address or filename.
                
                <br/>
                Examples: `surrealkv://mydb` or `rocksdb:database`.

                <br/>
                <ul>
                    <li>`rocksdb` for RocksDB</li>
                    <li>`fdb` for FoundationDB</li>
                    <li>`indxdb` for IndexedDB</li>
                    <li>`memory` (or no argument) for in-memory storage</li>
                    <li>`surrealkv` for SurrealKV without versioning (as of SurrealDB 2.1.1)</li>
                    <li>`surrealkv+versioned` for SurrealKV with versioning (as of SurrealDB 2.1.1)</li>
                    <li>`tikv` for TiKV</li>
                </ul>
            </td>
        </tr>
    </tbody>
</table>

> [!NOTE]
> Be sure not to use multiple storage backends in the same location, such as `rocksdb://path/to/database` followed by `surrealkv://path/to/database`. As storage is entirely delegated to the backend, the CLI is not aware of the structure of the data itself. While each backend uses its own file names and directory structure to store data, it is possible that data overwrite or other issues may occur.

## Getting started

This example will show how to host a SurrealDB server with the `surreal start` command, and then access the Surreal DB server using the [`surreal sql` command](/docs/surrealdb/cli/sql).

To start a SurrealDB server, run the `surreal start` command, using the options below. This example stores the database in memory, with a username and password, hosted at `127.0.0.1:8000` (the default location).

```bash
surreal start memory --user my_username --pass my_password
```

The server is actively running, and can be left alone until you want to stop hosting the SurrealDB server.

> [!NOTE]
> The message "Started web server on 127.0.0.1:8000", indicates where the server is being hosted and can be accessed by clients. The location `127.0.0.1:8000` is the default, and can be manually changed by specifying the `--bind` option of the `surreal start` command.

The `surreal start` command starts the server as a whole without regard to individual namespaces or databases.

To access the SurrealDB server that you have started hosting, open a new terminal which will act as the "client", while the previous terminal is still running the `surreal start` command described above. This is done using a separate [`surreal sql` command](/docs/surrealdb/cli/sql). A particular namespace and database can be specified using the `surreal sql` command, as seen below.

```bash
surreal sql --endpoint http://127.0.0.1:8000 --namespace my_namespace --database my_database --username my_username --password my_password
```

Ensure that the hosting location indicated by the output of the `surreal start` command is passed to the `--endpoint` argument, and that you specify the same `--username` and `--password` as in the `surreal start` command.

The above example also selects a namespace and database so that you can immediately start entering queries if you wish. See the documentation of the [`surreal sql` command](/docs/surrealdb/cli/sql) for more information.

## Strict mode

SurrealDB supports the ability to startup in strict mode. When running in strict mode, no `NAMESPACE`, `DATABASE`, or `TABLE` definitions will be enacted automatically when data is inserted. Instead, if the selected namespace, database, or table has not been specifically defined, then the query will return an error.

```bash
surreal start --strict --log debug memory
```

## RocksDB

To start a SurrealDB instance with RocksDB as the storage engine include the `rocksdb://` prefix in the path argument. 

```bash
surreal start -u root -p root rocksdb://mydb
```

## SurrealKV (Beta)

<Since v="v2.0.0" />

To start a SurrealDB instance with SurrealKV as the storage engine, include the `surrealkv://` prefix in the path argument.

```bash
surreal start -u root -p root surrealkv://mydb
```

While SurrealKV supports historical/temporal querying using the `VERSION` clause when [selecting](/docs/surrealql/statements/select#the-version-clause) or [creating](/docs/surrealql/statements/create#version) data, you must explicitly opt in to this using the `surrealkv+versioned://` prefix in the path argument.

```bash
surreal start -u root -p root surrealkv+versioned://mydb
```

You can learn more about SurrealKV and how it compares to RocksDB in the [SurrealKV documentation](/docs/surrealkv). 

## Authentication

When starting a SurrealDB instance, authentication is enabled by default, and your user credentials will be required to connect. If you are starting a new instance, the user credentials you use to run the `start` command will [define a new root user](/docs/surrealql/statements/define/user#roles) with the[`OWNER`](/docs/surrealql/statements/define/user#roles) role.

```bash
surreal start -user root -password root
```

## Enabling capabilities

> [!NOTE]
> If using Surreal Cloud, capabilities can be set using the [Configure Instance](/docs/cloud/advanced-topics/configure-an-instance) panel on Surrealist.

Capabilities arguments such as `allow-scripting` or `deny-net` can also be passed into the `surreal start` command. These arguments, the order in which they are evaluated, and other notes on security are presented in detail in a [separate page on capabilities](/docs/surrealdb/security/capabilities).

A production-oriented example of the `surreal start` command that begins with the `--deny-all` flag and only thereafter sets which capabilities will be allowed:

```
surreal start --deny-all --allow-funcs "array, string, crypto::argon2, http::get" --allow-net api.example.com:443
```

## Unauthenticated mode

<Since v="v2.0.0" />

Using the `--unauthenticated` flag, you can also start a SurrealDB instance in unauthenticated mode. By doing so, authentication will be disabled. In this mode, any guest user is considered to have the same permissions as a root user with the [`OWNER`](/docs/surrealql/statements/define/user#roles) role.

> [!NOTE]
> We recommend enabling authentication when running SurrealDB in production or in publicly exposed ways. Failure to do so may result in unauthorized access.

To start a SurrealDB instance in unauthenticated mode, run the following command:

```bash
surreal start --unauthenticated
```

## Identification headers

<Since v="v2.0.0" />

By default, SurrealDB includes headers in the HTTP response that identify the server name and version. You can suppress these headers by using the `--no-identification-headers` flag.

```bash
surreal start --no-identification-headers
```

## Experimental capabilities

<Since v="v2.2.0" />

To use experimental capabilities, set the `SURREAL_CAPS_ALLOW_EXPERIMENTAL` [environment variable](/docs/surrealdb/cli/env) to the experimental capability you want to allow. 

For example, to use record references, set the `SURREAL_CAPS_ALLOW_EXPERIMENTAL` environment variable to `record_references`.

<table>
    <thead>
        <tr>
            <th>Feature</th>
            <th>Tag</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><a href="/docs/surrealdb/querying/graphql/surrealist">GraphQL</a></td>
            <td><code>graphql</code></td>
        </tr>
        <tr>
            <td><a href="/docs/surrealql/statements/define/access/bearer">DEFINE ACCESS ... TYPE BEARER</a></td>
            <td><code>bearer_access</code></td>
        </tr>
        <tr>
            <td><a href="/docs/surrealql/statements/define/config">DEFINE CONFIG API</a> and <a href="/docs/surrealql/statements/define/api">DEFINE API</a></td>
            <td><code>define_api</code></td>
        </tr>
        <tr>
            <td><a href="/docs/surrealql/statements/define/bucket">DEFINE BUCKET</a></td>
            <td><code>files</code></td>
        </tr>
    </tbody>
</table>

```bash
SURREAL_CAPS_ALLOW_EXPERIMENTAL="record_references,graphql" surreal start  
```

or, using the `--allow-experimental` flag:

```bash
surreal start --allow-experimental record_references 
```
Multiple experimental capabilities can be enabled by separating them with a comma.

```bash
SURREAL_CAPS_ALLOW_EXPERIMENTAL="record_references, graphql, define_api" surreal start
surreal start --allow-experimental record_references,graphql,define_api
```

> [!NOTE]
> The experimental capability is completely hidden in the CLI help command, and `--allow-all` will not enable the experimental capabilities by default.

## Further examples

As `surreal start` is the command with by far the largest number of options, a few more examples will help give an idea of what sort of configurations are available.

An instance with a single root user, able to connect to the internet but unable to use three functions:

```bash
surreal start --user root --pass secret --allow-net --deny-funcs "crypto::md5, http::post, http::delete"
```

An instance with more verbose logging that uses RocksDB as its storage engine:

```bash
surreal start --log debug rocksdb:mydatabase.db
```

An instance with all capabilities denied except a few functions and a single endpoint:

```bash
surreal start --deny-all --allow-funcs "array, string, crypto::argon2, http::get" --allow-net api.example.com:443
```

An instance with a different default address, less verbose logging level, and ability to use JavaScript functions:

```bash
surreal start --bind 0.0.0.0:2218 --log warn --allow-scripting
```

## Using environment variables

When using the `surreal start` command, you can also use environment variables to set the values for the command-line flags. This is useful when you want to set the values for the command-line flags without having to pass them directly on the command line.

>[!IMPORTANT]
> Most of the flags mentioned in the command output above also mention a corresponding [environment variables](/docs/surrealdb/cli/env#command-environment-variables). 
>
> For example, the `--temporary-directory` flag can be configured with the `SURREAL_TEMPORARY_DIRECTORY` environment variable instead. 

For more on the environment variables available for CLI commands or SurrealDB instances in general, see the [environment variables](/docs/surrealdb/cli/env#command-environment-variables) page.

## Command help

To see the help information and usage instructions, in a terminal run the `surreal start --help` command without any further arguments. This command gives general information on the arguments, inputs, and additional options for the `start` command.

```bash
surreal start --help
```

The output of the above command:

```
Start the database server

Usage: surreal start [OPTIONS] [PATH]

Arguments:
  [PATH]
          Database path used for storing data
          
          [env: SURREAL_PATH=]
          [default: memory]

Options:
      --no-banner
          Whether to hide the startup banner
          
          [env: SURREAL_NO_BANNER=]

  -h, --help
          Print help (see a summary with '-h')

Database:
      --node-membership-refresh-interval <NODE_MEMBERSHIP_REFRESH_INTERVAL>
          The interval at which to refresh node registration information
          
          [env: SURREAL_NODE_MEMBERSHIP_REFRESH_INTERVAL=]
          [default: 3s]

      --node-membership-check-interval <NODE_MEMBERSHIP_CHECK_INTERVAL>
          The interval at which process and archive inactive nodes
          
          [env: SURREAL_NODE_MEMBERSHIP_CHECK_INTERVAL=]
          [default: 15s]

      --node-membership-cleanup-interval <NODE_MEMBERSHIP_CLEANUP_INTERVAL>
          The interval at which to process and cleanup archived nodes
          
          [env: SURREAL_NODE_MEMBERSHIP_CLEANUP_INTERVAL=]
          [default: 300s]

      --changefeed-gc-interval <CHANGEFEED_GC_INTERVAL>
          The interval at which to perform changefeed garbage collection
          
          [env: SURREAL_CHANGEFEED_GC_INTERVAL=]
          [default: 10s]

  -s, --strict
          Whether strict mode is enabled on this database instance
          
          [env: SURREAL_STRICT=]

      --query-timeout <QUERY_TIMEOUT>
          The maximum duration that a set of statements can run for
          
          [env: SURREAL_QUERY_TIMEOUT=]

      --transaction-timeout <TRANSACTION_TIMEOUT>
          The maximum duration that any single transaction can run for
          
          [env: SURREAL_TRANSACTION_TIMEOUT=]

Authentication:
  -u, --username <USERNAME>
          The username for the initial database root user. Only if no other root user exists
          
          [env: SURREAL_USER=]
          [aliases: user]

  -p, --password <PASSWORD>
          The password for the initial database root user. Only if no other root user exists
          
          [env: SURREAL_PASS=]
          [aliases: pass]

      --unauthenticated
          Whether to allow unauthenticated access
          
          [env: SURREAL_UNAUTHENTICATED=]

Datastore connection:
      --kvs-ca <KVS_CA>
          Path to the CA file used when connecting to the remote KV store
          
          [env: SURREAL_KVS_CA=]

      --kvs-crt <KVS_CRT>
          Path to the certificate file used when connecting to the remote KV store
          
          [env: SURREAL_KVS_CRT=]

      --kvs-key <KVS_KEY>
          Path to the private key file used when connecting to the remote KV store
          
          [env: SURREAL_KVS_KEY=]

HTTP server:
      --web-crt <WEB_CRT>
          Path to the certificate file for encrypted client connections
          
          [env: SURREAL_WEB_CRT=]

      --web-key <WEB_KEY>
          Path to the private key file for encrypted client connections
          
          [env: SURREAL_WEB_KEY=]

      --client-ip <CLIENT_IP>
          The method of detecting the client's IP address
          
          [env: SURREAL_CLIENT_IP=]
          [default: socket]

          Possible values:
          - none:             Don't use client IP
          - socket:           Raw socket IP
          - CF-Connecting-IP: Cloudflare connecting IP
          - Fly-Client-IP:    Fly.io client IP
          - True-Client-IP:   Akamai, Cloudflare true client IP
          - X-Real-IP:        Nginx real IP
          - X-Forwarded-For:  Industry standard header used by many proxies

  -b, --bind <LISTEN_ADDRESSES>
          The hostname or IP address to listen for connections on
          
          [env: SURREAL_BIND=]
          [default: 127.0.0.1:8000]

      --no-identification-headers
          Whether to suppress the server name and version headers
          
          [env: SURREAL_NO_IDENTIFICATION_HEADERS=]

Capabilities:
  -A, --allow-all
          Allow all capabilities except for those more specifically denied
          
          [env: SURREAL_CAPS_ALLOW_ALL=]

      --allow-scripting
          Allow execution of embedded scripting functions
          
          [env: SURREAL_CAPS_ALLOW_SCRIPT=]

      --allow-guests
          Allow guest users to execute queries
          
          [env: SURREAL_CAPS_ALLOW_GUESTS=]

      --allow-funcs [<ALLOW_FUNCS>...]
          Allow execution of all functions except for functions that are specifically denied. Alternatively, you can provide a comma-separated list of function names to
          allow
          Specifically denied functions and function families prevail over any other allowed function execution.
          Function names must be in the form <family>[::<name>]. For example:
           - 'http' or 'http::*' -> Include all functions in the 'http' family
           - 'http::get' -> Include only the 'get' function in the 'http' family
          
          
          [env: SURREAL_CAPS_ALLOW_FUNC=]

      --allow-arbitrary-query [<ALLOW_ARBITRARY_QUERY>...]
          Allow execution of arbitrary queries by certain user groups except when specifically denied. Alternatively, you can provide a comma-separated list of user groups to allow
          Specifically denied user groups prevail over any other allowed user group.
          User groups must be one of "guest", "record" or "system".
          
          
          [env: SURREAL_CAPS_ALLOW_ARBITRARY_QUERY=]

      --allow-net [<ALLOW_NET>...]
          Allow all outbound network connections except for network targets that are specifically denied. Alternatively, you can provide a comma-separated list of network targets to allow
          Specifically denied network targets prevail over any other allowed outbound network connections.
          Targets must be in the form of <host>[:<port>], <ipv4|ipv6>[/<mask>]. For example:
           - 'surrealdb.com', '127.0.0.1' or 'fd00::1' -> Match outbound connections to these hosts on any port
           - 'surrealdb.com:80', '127.0.0.1:80' or 'fd00::1:80' -> Match outbound connections to these hosts on port 80
           - '10.0.0.0/8' or 'fd00::/8' -> Match outbound connections to any host in these networks
          
          
          [env: SURREAL_CAPS_ALLOW_NET=]

      --allow-rpc [<ALLOW_RPC>...]
          Allow all RPC methods to be called except for routes that are specifically denied. Alternatively, you can provide a comma-separated list of RPC methods to
          allow.
          
          [env: SURREAL_CAPS_ALLOW_RPC=]
          [default: ]

      --allow-http [<ALLOW_HTTP>...]
          Allow all HTTP routes to be requested except for routes that are specifically denied. Alternatively, you can provide a comma-separated list of HTTP routes to allow.
          
          [env: SURREAL_CAPS_ALLOW_HTTP=]
          [default: ]

  -D, --deny-all
          Deny all capabilities except for those more specifically allowed
          
          [env: SURREAL_CAPS_DENY_ALL=]

      --deny-scripting
          Deny execution of embedded scripting functions
          
          [env: SURREAL_CAPS_DENY_SCRIPT=]

      --deny-guests
          Deny guest users to execute queries
          
          [env: SURREAL_CAPS_DENY_GUESTS=]

      --deny-funcs [<DENY_FUNCS>...]
          Deny execution of all functions except for functions that are specifically allowed. Alternatively, you can provide a comma-separated list of function names to deny.
          Specifically allowed functions and function families prevail over a general denial of function execution.
          Function names must be in the form <family>[::<name>]. For example:
           - 'http' or 'http::*' -> Include all functions in the 'http' family
           - 'http::get' -> Include only the 'get' function in the 'http' family
          
          
          [env: SURREAL_CAPS_DENY_FUNC=]

      --deny-arbitrary-query [<DENY_ARBITRARY_QUERY>...]
          Deny execution of arbitrary queries by certain user groups except when specifically allowed. Alternatively, you can provide a comma-separated list of user groups to deny.
          Specifically allowed user groups prevail over a general denial of user group.
          User groups must be one of "guest", "record" or "system".
          
          
          [env: SURREAL_CAPS_DENY_ARBITRARY_QUERY=]

      --deny-net [<DENY_NET>...]
          Deny all outbound network connections except for network targets that are specifically allowed. Alternatively, you can provide a comma-separated list of network targets to deny.
          Specifically allowed network targets prevail over a general denial of outbound network connections.
          Targets must be in the form of <host>[:<port>], <ipv4|ipv6>[/<mask>]. For example:
           - 'surrealdb.com', '127.0.0.1' or 'fd00::1' -> Match outbound connections to these hosts on any port
           - 'surrealdb.com:80', '127.0.0.1:80' or 'fd00::1:80' -> Match outbound connections to these hosts on port 80
           - '10.0.0.0/8' or 'fd00::/8' -> Match outbound connections to any host in these networks
          
          
          [env: SURREAL_CAPS_DENY_NET=]

      --deny-rpc [<DENY_RPC>...]
          Deny all RPC methods from being called except for methods that are specifically allowed. Alternatively, you can provide a comma-separated list of RPC methods to deny.
          
          [env: SURREAL_CAPS_DENY_RPC=]

      --deny-http [<DENY_HTTP>...]
          Deny all HTTP routes from being requested except for routes that are specifically allowed. Alternatively, you can provide a comma-separated list of HTTP routes to deny.
          
          [env: SURREAL_CAPS_DENY_HTTP=]

      --temporary-directory <TEMPORARY_DIRECTORY>
          Sets the directory for storing temporary database files
          
          [env: SURREAL_TEMPORARY_DIRECTORY=]

      --import-file <IMPORT_FILE>
          Path to a SurrealQL file that will be imported when starting the server
          
          [env: SURREAL_IMPORT_FILE=]

Logging:
  -l, --log <LOG>
          The logging level for the command-line tool
          
          [env: SURREAL_LOG=]
          [default: info]
          [possible values: none, full, error, warn, info, debug, trace]

      --log-file-level <LOG_FILE_LEVEL>
          Override the logging level for file output
          
          [env: SURREAL_LOG_FILE_LEVEL=]
          [possible values: none, full, error, warn, info, debug, trace]

      --log-otel-level <LOG_OTEL_LEVEL>
          Override the logging level for OpenTelemetry
          
          [env: SURREAL_LOG_OTEL_LEVEL=]
          [possible values: none, full, error, warn, info, debug, trace]

      --log-file-enabled
          Whether to enable log file output
          
          [env: SURREAL_LOG_FILE_ENABLED=]

      --log-file-path <LOG_FILE_PATH>
          The directory where log files will be stored
          
          [env: SURREAL_LOG_FILE_PATH=]
          [default: logs]

      --log-file-name <LOG_FILE_NAME>
          The name of the log file
          
          [env: SURREAL_LOG_FILE_NAME=]
          [default: surrealdb.log]

      --log-file-rotation <LOG_FILE_ROTATION>
          The log file rotation interval
          
          [env: SURREAL_LOG_FILE_ROTATION=]
          [default: daily]
          [possible values: daily, hourly, never]
```

---
sidebar_position: 3
sidebar_label: SQL command
title: SQL command | CLI tool
description: A command that starts a command-line REPL to make SurrealQL to a local or remote SurrealDB database server.
---
import Since from '@components/shared/Since.astro'
import Label from "@components/shared/Label.astro";

# SQL command

The SQL command starts a REPL for running or piping SurrealQL queries to a local or remote SurrealDB database server.

> [!NOTE: BEFORE YOU START]
> Make sure you’ve [installed SurrealDB](/docs/surrealdb/installation) — it should only take a second!

## Command options

<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th>Description</th>
        </tr>
    </thead>  
    <tbody>
        <tr>
            <td colspan="2">
                `-e` / `--endpoint` / `--conn`
               <Label label="optional" />
            </td>
            <td>
            Sets the url of the database server to connect to
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-u` / `--user`
                <Label label="required" />
            </td>
            <td>
                Sets master username for the database
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-p` / `--pass`
                <Label label="required" />
            </td>
            <td>
                Sets master password for the database
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--allow-experimental`
               <Label label="optional" />
            </td>
            <td>
                Enable experimental capabilities
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--ns`
               <Label label="optional" />
            </td>
            <td>
                Sets the desired namespace in which to import data
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--db`
               <Label label="optional" />
            </td>
            <td>
                Sets the desired database into which to import data
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--auth-level`
               <Label label="optional" />
            </td>
            <td>
                The authentication level to use when connecting to the server.
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-t` / `--token`
               <Label label="optional" />
            </td>
            <td>
                Sets the authentication token to use when connecting to the server. Connect to SurrealDB using a JWT instead of user credentials
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--pretty`
               <Label label="optional" />
            </td>
            <td>
                Sets whether database responses should be pretty printed
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--json`
               <Label label="optional" />
            </td>
            <td>
                Sets whether to emit results in JSON
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--multi`
               <Label label="optional" />
            </td>
            <td>
                Sets whether omitting semicolon causes a newline 
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-h` / `--help`
               <Label label="optional" />
            </td>
            <td>
                Prints help
            </td>
        </tr>
    </tbody>
</table>


## `--auth-level` option

<Since v="v2.0.0" />

The `--auth-level` option sets the authentication level to use when connecting to the database. The option has three possible values: `root`, `namespace`, and `database`. The `root` value is the highest level of authentication, while the `namespace` and `database` values are used for authenticating as users defined on a specific namespace or database. 

There are a few things to keep in mind when using the `--auth-level` option:

- The `root` value is used to access the database server as a root user, and if not specified is the default value.

```bash
surreal sql --endpoint http://localhost:8000 --namespace test --database test --auth-level root --username username --password password
```

- The `namespace` value is used for accessing a specific namespace and all databases within that namespace. When this level is specified, a namespace must be provided via `--namespace`.

```bash
surreal sql --endpoint http://localhost:8000 --namespace test --database test --auth-level namespace --username username --password password
```

- The `database` value is used for accessing a specific database within a namespace. When this level is specified, a namespace and a database must be provided via `--namespace` and `--database`.

```bash
surreal sql --endpoint http://localhost:8000 --namespace test --database test --auth-level database --username username --password password
```

## `--token` option

<Since v="v2.0.0" />

The `--token` option sets the authentication token to use when connecting to the server. This option allows you to connect to SurrealDB using a JWT instead of user credentials. The token is used to authenticate the user and provide access to the database server which means it cannot be provided at the same time as `--username`, `--password` or `--auth-level`.

```bash
surreal sql --endpoint http://localhost:8000 --namespace test --database test --token <token>
```

### Experimental capabilities

<Since v="v2.2.1" />

To use experimental capabilities, set the `SURREAL_CAPS_ALLOW_EXPERIMENTAL` [environment variable](/docs/surrealdb/cli/env) to the experimental capability you want to allow. 

For example, to use record references, set the `SURREAL_CAPS_ALLOW_EXPERIMENTAL` environment variable to `record_references`.

For [graphql](/docs/surrealdb/querying/graphql/surrealist), use `graphql` and for [bearer access](/docs/surrealql/statements/define/access/bearer), use `bearer_access`.

```bash
SURREAL_CAPS_ALLOW_EXPERIMENTAL="record_references" surreal sql ... 
```

or, using the `--allow-experimental` flag:

```bash
surreal sql -e [CONNECTION_STRING] --allow-experimental record_references 
```

Multiple experimental capabilities can be enabled by separating them with a comma.

```bash
SURREAL_CAPS_ALLOW_EXPERIMENTAL="record_references, graphql" surreal sql ...

-- OR 

surreal sql -e [CONNECTION_STRING] --allow-experimental record_references,graphql
```

> [!NOTE]
> The experimental capability is completely hidden in the CLI help command, and `--allow-all` will not enable the experimental capabilities by default.

## Example usage

To start a REPL and run or pipe queries to a local or remote SurrealDB database, run the `surreal sql` command in a terminal with the required arguments.

Once you see the `>` character you can type your SurrealQL query, followed by the `enter` key. The command has support for `↑` and `↓` arrows for selecting previous SQL statements, and stores the statement history in a `history.txt` file. To exit the REPL, use the `ctrl + c` or `ctrl + d` key combinations.

```bash
surreal sql --endpoint http://localhost:8000 --namespace test --database test --auth-level root --username username --password password
```

It is also possible to pipe a set of statements to a remote database. This functionality is only designed for submitting a small number of queries to the database server. For a large number of queries, use the [import command](/docs/surrealdb/cli/import).

```bash
cat myfile.surql | surreal sql --endpoint http://localhost:8000 --username root --password root --namespace test --database test
```

## Using environment variables

When using the `surreal sql` command, you can also use environment variables to set the values for the command-line flags. 

>[!IMPORTANT]
> Most of the flags mentioned in the command output above also mention a corresponding [environment variables](/docs/surrealdb/cli/env#command-environment-variables). 
>
> For example, the `--database` flag can be configured with the `SURREAL_DATABASE` environment variable instead. 

For more on the environment variables available for CLI commands or SurrealDB instances in general, see the [environment variables](/docs/surrealdb/cli/env#command-environment-variables) page.

## Command help
To see the help information and usage instructions, in a terminal run the `surreal sql --help` command without any further arguments. This command gives general information on the arguments, inputs, and additional options for the `sql` command.

```bash
surreal sql --help
```

The output of the above command:

```
Start an SQL REPL in your terminal with pipe support

Usage: surreal sql [OPTIONS]

Options:
  -e, --endpoint <ENDPOINT>
          Remote database server url to connect to
          
          [default: ws://localhost:8000]
          [aliases: conn]

  -u, --username <USERNAME>
          Database authentication username to use when connecting
          
          [env: SURREAL_USER=]
          [aliases: user]

  -p, --password <PASSWORD>
          Database authentication password to use when connecting
          
          [env: SURREAL_PASS=]
          [aliases: pass]

  -t, --token <TOKEN>
          Authentication token in JWT format to use when connecting
          
          [env: SURREAL_TOKEN=]

      --auth-level <AUTH_LEVEL>
          Level on which the authenticating user is defined
          
          [env: SURREAL_AUTH_LEVEL=]
          [default: root]
          [possible values: root, namespace, ns, database, db]

      --namespace <NAMESPACE>
          The selected namespace
          
          [env: SURREAL_NAMESPACE=]
          [aliases: ns]

      --database <DATABASE>
          The selected database
          
          [env: SURREAL_DATABASE=]
          [aliases: db]

      --pretty
          Whether database responses should be pretty printed

      --json
          Whether to emit results in JSON

      --multi
          Whether omitting semicolon causes a newline

      --hide-welcome
          Whether to show welcome message
          
          [env: SURREAL_HIDE_WELCOME=]

  -l, --log <LOG>
          The logging level for the command-line tool
          
          [env: SURREAL_LOG=]
          [default: info]
          [possible values: none, full, error, warn, info, debug, trace]

  -h, --help
          Print help (see a summary with '-h')

Capabilities:
  -A, --allow-all
          Allow all capabilities except for those more specifically denied
          
          [env: SURREAL_CAPS_ALLOW_ALL=]

      --allow-scripting
          Allow execution of embedded scripting functions
          
          [env: SURREAL_CAPS_ALLOW_SCRIPT=]

      --allow-guests
          Allow guest users to execute queries
          
          [env: SURREAL_CAPS_ALLOW_GUESTS=]

      --allow-funcs [<ALLOW_FUNCS>...]
          Allow execution of all functions except for functions that are specifically denied. Alternatively, you can provide a comma-separated list of function names to allow
          Specifically denied functions and function families prevail over any other allowed function execution.
          Function names must be in the form <family>[::<name>]. For example:
           - 'http' or 'http::*' -> Include all functions in the 'http' family
           - 'http::get' -> Include only the 'get' function in the 'http' family
          
          
          [env: SURREAL_CAPS_ALLOW_FUNC=]

      --allow-arbitrary-query [<ALLOW_ARBITRARY_QUERY>...]
          Allow execution of arbitrary queries by certain user groups except when specifically denied. Alternatively, you can provide a comma-separated list of user groups to allow
          Specifically denied user groups prevail over any other allowed user group.
          User groups must be one of "guest", "record" or "system".
          
          
          [env: SURREAL_CAPS_ALLOW_ARBITRARY_QUERY=]

      --allow-net [<ALLOW_NET>...]
          Allow all outbound network connections except for network targets that are specifically denied. Alternatively, you can provide a comma-separated list of network targets to allow
          Specifically denied network targets prevail over any other allowed outbound network connections.
          Targets must be in the form of <host>[:<port>], <ipv4|ipv6>[/<mask>]. For example:
           - 'surrealdb.com', '127.0.0.1' or 'fd00::1' -> Match outbound connections to these hosts on any port
           - 'surrealdb.com:80', '127.0.0.1:80' or 'fd00::1:80' -> Match outbound connections to these hosts on port 80
           - '10.0.0.0/8' or 'fd00::/8' -> Match outbound connections to any host in these networks
          
          
          [env: SURREAL_CAPS_ALLOW_NET=]

      --allow-rpc [<ALLOW_RPC>...]
          Allow all RPC methods to be called except for routes that are specifically denied. Alternatively, you can provide a comma-separated list of RPC methods to allow.
          
          [env: SURREAL_CAPS_ALLOW_RPC=]
          [default: ]

      --allow-http [<ALLOW_HTTP>...]
          Allow all HTTP routes to be requested except for routes that are specifically denied. Alternatively, you can provide a comma-separated list of HTTP routes to allow.
          
          [env: SURREAL_CAPS_ALLOW_HTTP=]
          [default: ]

  -D, --deny-all
          Deny all capabilities except for those more specifically allowed
          
          [env: SURREAL_CAPS_DENY_ALL=]

      --deny-scripting
          Deny execution of embedded scripting functions
          
          [env: SURREAL_CAPS_DENY_SCRIPT=]

      --deny-guests
          Deny guest users to execute queries
          
          [env: SURREAL_CAPS_DENY_GUESTS=]

      --deny-funcs [<DENY_FUNCS>...]
          Deny execution of all functions except for functions that are specifically allowed. Alternatively, you can provide a comma-separated list of function names to deny.
          Specifically allowed functions and function families prevail over a general denial of function execution.
          Function names must be in the form <family>[::<name>]. For example:
           - 'http' or 'http::*' -> Include all functions in the 'http' family
           - 'http::get' -> Include only the 'get' function in the 'http' family
          
          
          [env: SURREAL_CAPS_DENY_FUNC=]

      --deny-arbitrary-query [<DENY_ARBITRARY_QUERY>...]
          Deny execution of arbitrary queries by certain user groups except when specifically allowed. Alternatively, you can provide a comma-separated list of user groups to deny
          Specifically allowed user groups prevail over a general denial of user group.
          User groups must be one of "guest", "record" or "system".
          
          
          [env: SURREAL_CAPS_DENY_ARBITRARY_QUERY=]

      --deny-net [<DENY_NET>...]
          Deny all outbound network connections except for network targets that are specifically allowed. Alternatively, you can provide a comma-separated list of network targets to deny.
          Specifically allowed network targets prevail over a general denial of outbound network connections.
          Targets must be in the form of <host>[:<port>], <ipv4|ipv6>[/<mask>]. For example:
           - 'surrealdb.com', '127.0.0.1' or 'fd00::1' -> Match outbound connections to these hosts on any port
           - 'surrealdb.com:80', '127.0.0.1:80' or 'fd00::1:80' -> Match outbound connections to these hosts on port 80
           - '10.0.0.0/8' or 'fd00::/8' -> Match outbound connections to any host in these networks
          
          
          [env: SURREAL_CAPS_DENY_NET=]

      --deny-rpc [<DENY_RPC>...]
          Deny all RPC methods from being called except for methods that are specifically allowed. Alternatively, you can provide a comma-separated list of RPC methods to deny.
          
          [env: SURREAL_CAPS_DENY_RPC=]

      --deny-http [<DENY_HTTP>...]
          Deny all HTTP routes from being requested except for routes that are specifically allowed. Alternatively, you can provide a comma-separated list of HTTP routes to deny.
          
          [env: SURREAL_CAPS_DENY_HTTP=]
```

---
sidebar_position: 4
sidebar_label: Help command
title: Help command | CLI tool
description: A command to display all possible top-level commands and arguments used in the the SurrealDB binary.
---

# Help command

The help command displays help information and instructions on the command-line tool and its arguments.

> [!NOTE: BEFORE YOU START]
> Make sure you’ve [installed SurrealDB](/docs/surrealdb/installation) — it should only take a second!

## Show the command-line help information

To see the general help information for the command-line tool, in a terminal run the `surreal help` command without any further arguments. This command gives general information on the other functionality which can be run with the command-line tool.

```bash
surreal help
```

The output of the above command:

```bash
 .d8888b.                                             888 8888888b.  888888b.
d88P  Y88b                                            888 888  'Y88b 888  '88b
Y88b.                                                 888 888    888 888  .88P
 'Y888b.   888  888 888d888 888d888  .d88b.   8888b.  888 888    888 8888888K.
    'Y88b. 888  888 888P'   888P'   d8P  Y8b     '88b 888 888    888 888  'Y88b
      '888 888  888 888     888     88888888 .d888888 888 888    888 888    888
Y88b  d88P Y88b 888 888     888     Y8b.     888  888 888 888  .d88P 888   d88P
 'Y8888P'   'Y88888 888     888      'Y8888  'Y888888 888 8888888P'  8888888P'


To get started using SurrealDB, and for guides on connecting to and building applications
on top of SurrealDB, check out the SurrealDB documentation (https://surrealdb.com/docs).

If you have questions or ideas, join the SurrealDB community (https://surrealdb.com/community).

If you find a bug, submit an issue on GitHub (https://github.com/surrealdb/surrealdb/issues).

We would love it if you could star the repository (https://github.com/surrealdb/surrealdb).

----------

Usage: surreal [OPTIONS] <COMMAND>

Commands:
  start     Start the database server
  import    Import a SurrealQL script into an existing database
  export    Export an existing database as a SurrealQL script
  version   Output the command-line tool and remote server version information
  upgrade   Upgrade to the latest stable version
  sql       Start an SQL REPL in your terminal with pipe support
  ml        Manage SurrealML models within an existing database
  is-ready  Check if the SurrealDB server is ready to accept connections [aliases: isready]
  validate  Validate SurrealQL query files
  fix       Fix database storage issues
  help      Print this message or the help of the given subcommand(s)

Options:
  -l, --log <LOG>             The logging level for the command-line tool [env: SURREAL_LOG=] [default: info] [possible values: none, full, error, warn, info, debug, trace]
      --online-version-check  Whether to allow web check for client version upgrades at start [env: SURREAL_ONLINE_VERSION_CHECK=]
  -h, --help                  Print help
  -V, --version               Print version
```

## Getting help on individual commands

For individual commands, such as `surreal start` and `surreal sql`, a help prompt can be displayed by adding the `--help` flag. This flag overrides all other flags, and thus can be added to the end of any command regardless of length.

```bash
surreal start --help
surreal start --user root --pass secret --strict --help
```

---
sidebar_position: 5
sidebar_label: Export command
title: Export command | CLI tool
description: A command to export data from a SurrealDB database server into a SurrealQL file format.
---

import Label from "@components/shared/Label.astro";

# Export command

The export command exports a SurrealQL script file from a local or remote SurrealDB database server.

> [!NOTE: BEFORE YOU START]
> Make sure you’ve [installed SurrealDB](/docs/surrealdb/installation) — it should only take a second!

## Syntax 

```bash title="Export a database as a SurrealQL script"
surreal export [OPTIONS] --namespace <NAMESPACE> --database <DATABASE> [FILE]
```

## Command options 

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
                `-e` / `--endpoint` / `--conn`
               <Label label="optional" />
            </td>
            <td>
            Sets the url of the database server to connect to. Defaults to http://127.0.0.1:8000 if not specified
            </td>
        </tr>
        <tr>
            <td>
                `-u` / `--user`
                <Label label="required" />
            </td>
            <td>
                Sets master username for the database
            </td>
        </tr>
        <tr>
            <td>
                `-p` / `--pass`
                <Label label="required" />
            </td>
            <td>
                Sets master password for the database
            </td>
        </tr>
        <tr>
            <td>
                `-t` / `--token`
               <Label label="optional" />
            </td>
            <td>
                Sets the authentication token to use when connecting to the server. Connect to SurrealDB using a JWT instead of user credentials
            </td>
        </tr>
        <tr>
            <td>
                `--ns`
                <Label label="required" />
            </td>
            <td>
                Sets the desired namespace in which to export data
            </td>
        </tr>
        <tr>
            <td>
                `--db`
                <Label label="required" />
            </td>
            <td>
                Sets the desired database into which to export data
            </td>
        </tr>
    </tbody>
</table>

## Export options 

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
                `--only`
                <Label label="optional" />
            </td>
            <td>
                Whether only specific resources should be exported. When provided, only the resources specified will be exported.
            </td>
        </tr>
        <tr>
            <td>
                `--users`
                <Label label="optional" />
            </td>
            <td>
                Whether system users should be exported [possible values: true, false].
            </td>
        </tr>
        <tr>
            <td>
                `--accesses`
                <Label label="optional" />
            </td>
            <td>
                Whether access methods (Record or JWT) should be exported [possible values: true, false]
            </td>
        </tr>
        <tr>
            <td>
                `--params`
                <Label label="optional" />
            </td>
            <td>
                Whether databases parameters should be exported [possible values: true, false]
            </td>
        </tr>
        <tr>
            <td>
                `--functions`
                <Label label="optional" />
            </td>
            <td>
                Whether functions should be exported [possible values: true, false]
            </td>
        </tr>
        <tr>
            <td>
                `--analyzers`
                <Label label="optional" />
            </td>
            <td>
                Whether analyzers should be exported [possible values: true, false]
            </td>
        </tr>
        <tr>
            <td>
                `--tables [tables]`
                <Label label="optional" />
            </td>
            <td>
                Whether tables should be exported, optionally providing a list of tables
            </td>
        </tr>
        <tr>
            <td>
                `--versions`
                <Label label="optional" />
            </td>
            <td>
                Whether SurrealKV versioned records should be exported [possible values: true, false]
            </td>
        </tr>
        <tr>
            <td>
                `--records`
                <Label label="optional" />
            </td>
            <td>
                Whether records should be exported [possible values: true, false]
            </td>
        </tr>
                <tr>
            <td>
                `-l` / `--log`
                <Label label="optional" />
            </td>
            <td>
                The logging level for the command-line tool [default: info] [possible values: none, full, error, warn, info, debug, trace]
            </td>
        </tr>
    </tbody>
</table>

## Positional argument

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
                `file`
                <Label label="optional" />
            </td>
            <td>
                Sets the path to the file which should be exported. If not provided, export data will be printed to stdout (and can thus be redirected using `>`).
            </td>
        </tr>
    </tbody>
</table>

## Example usage

To perform a SurrealQL database export into a local file, in a terminal run the `surreal export` command with the required arguments.

```bash
surreal export --conn http://localhost:8000 --user root --pass secret --ns test --db test export.surql
```

Using token-based authentication

```bash
surreal export --conn http://localhost:8000 --token <token> --ns test --db test export.surql
```

## OPTION IMPORT keyword

The output of a database export includes a line that contains the keywords `OPTION IMPORT`. This command is used internally to ensure that side effects do not run when the data is imported, such as [events](/docs/surrealql/statements/define/event) and [table views](/docs/surrealql/statements/define/table#pre-computed-table-views).

## Using environment variables

When using the `surreal export` command, you can also use environment variables to set the values for the command-line flags. 
>[!IMPORTANT]
> Most of the flags mentioned in the command output above also mention a corresponding [environment variables](/docs/surrealdb/cli/env#command-environment-variables). 
>
> For example, the `--username` flag can be configured with the `SURREAL_USER` environment variable instead. 

For more on the environment variables available for CLI commands or SurrealDB instances in general, see the [environment variables](/docs/surrealdb/cli/env#command-environment-variables) page.

## Command help

To see the help information and usage instructions, in a terminal run the `surreal export --help` command without any further arguments. This command gives general information on the arguments, inputs, and additional options for the export command.

```bash
surreal export --help
```

The output of the above command :

```
Export an existing database as a SurrealQL script

Usage: surreal export [OPTIONS] --namespace <NAMESPACE> --database <DATABASE> [FILE]

Arguments:
  [FILE]  Path to the SurrealQL file to export. Use dash - to write into stdout. [default: -]

Options:
  -e, --endpoint <ENDPOINT>      Remote database server url to connect to [default: ws://localhost:8000] [aliases: conn]
  -u, --username <USERNAME>      Database authentication username to use when connecting [env: SURREAL_USER=] [aliases: user]
  -p, --password <PASSWORD>      Database authentication password to use when connecting [env: SURREAL_PASS=] [aliases: pass]
  -t, --token <TOKEN>            Authentication token in JWT format to use when connecting [env: SURREAL_TOKEN=]
      --auth-level <AUTH_LEVEL>  Level on which the authenticating user is defined [env: SURREAL_AUTH_LEVEL=] [default: root] [possible values: root, namespace, ns, database, db]
      --namespace <NAMESPACE>    The namespace selected for the operation [env: SURREAL_NAMESPACE=] [aliases: ns]
      --database <DATABASE>      The database selected for the operation [env: SURREAL_DATABASE=] [aliases: db]
      --only                     Whether only specific resources should be exported
      --users [<USERS>]          Whether users should be exported [possible values: true, false]
      --accesses [<ACCESSES>]    Whether access methods should be exported [possible values: true, false]
  -l, --log <LOG>                The logging level for the command-line tool [env: SURREAL_LOG=] [default: info] [possible values: none, full, error, warn, info, debug, trace]
      --params [<PARAMS>]        Whether params should be exported [possible values: true, false]
      --functions [<FUNCTIONS>]  Whether functions should be exported [possible values: true, false]
      --analyzers [<ANALYZERS>]  Whether analyzers should be exported [possible values: true, false]
      --tables [<TABLES>]        Whether tables should be exported, optionally providing a list of tables
      --versions [<VERSIONS>]    Whether versions should be exported [possible values: true, false]
      --records [<RECORDS>]      Whether records should be exported [possible values: true, false]
  -h, --help                     Print help
```

---
sidebar_position: 6
sidebar_label: Fix command
title: Fix command | CLI tool
description: A command to convert SurrealDB version 1.x data into a usable format for versions 2.0 and above.
---

import Label from "@components/shared/Label.astro";

# Fix command

The fix command converts SurrealDB version 1.x data into a format that can be used in SurrealDB 2.x.

> [!NOTE: BEFORE YOU START]
> Make sure you’ve [installed SurrealDB](/docs/surrealdb/installation) — it should only take a second!

## Command options 

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
                `-e` / `--log`
               <Label label="optional" />
            </td>
            <td>
            Sets the logging level during the command
            </td>
        </tr>
    </tbody>
</table>

## Positional argument

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
                `file`
            </td>
            <td>
                Sets the path to the existing data to convert to 2.x storage format
            </td>
        </tr>
    </tbody>
</table>

## Example usage

To perform a fix from SurrealDB 1.x to 2.x storage, run the `surreal fix` command in a terminal with the path to the stored data.

```bash
surreal fix surrealkv://mydatabase.db

surreal fix rocksdb:somedatabase
```

## Using environment variables

When using the `surreal fix` command, you can also use environment variables to set the values for the command-line flags. 
>[!IMPORTANT]
> Most of the flags mentioned in the command output above also mention a corresponding [environment variables](/docs/surrealdb/cli/env#command-environment-variables). 
>
> For example, the `--log` flag can be configured with the `SURREAL_LOG` environment variable instead. 

For more on the environment variables available for CLI commands or SurrealDB instances in general, see the [environment variables](/docs/surrealdb/cli/env#command-environment-variables) page.

## Command help

To see the help information and usage instructions, in a terminal run the `surreal fix --help` command without any further arguments. This command gives general information on the arguments, inputs, and additional options for the export command.

```bash
surreal fix --help
```

The output of the above command:

```
Fix database storage issues

Usage: surreal fix [OPTIONS] [PATH]

Arguments:
  [PATH]  Database path used for storing data [env: SURREAL_PATH=] [default: memory]

Options:
  -l, --log <LOG>  The logging level for the command-line tool [env: SURREAL_LOG=] [default: info] [possible values: none, full, error, warn, info, debug, trace]
  -h, --help       Print help
```

---
sidebar_position: 7
sidebar_label: Import command
title: Import command | CLI tool
description: A command that imports a file in SurrealQL format into a local or remote SurrealDB database server.
---

import Label from "@components/shared/Label.astro";

# Import command

The import command imports a SurrealQL script file into a local or remote SurrealDB database server.

> [!NOTE: BEFORE YOU START]
> Make sure you’ve [installed SurrealDB](/docs/surrealdb/installation) — it should only take a second!

## Command options 

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
                `-e` / `--endpoint` / `--conn`
               <Label label="optional" />
            </td>
            <td>
                Sets the url of the database server to connect to. Defaults to http://127.0.0.1:8000 if not specified
            </td>
        </tr>
        <tr>
            <td>
                `-u` / `--user`
                <Label label="required" />
            </td>
            <td>
                Sets master username for the database
            </td>
        </tr>
        <tr>
            <td>
                `-p` / `--pass`
                <Label label="required" />
            </td>
            <td>
                Sets master password for the database
            </td>
        </tr>
        <tr>
            <td>
                `-t` / `--token`
               <Label label="optional" />
            </td>
            <td>
                Sets the authentication token to use when connecting to the server. Connect to SurrealDB using a JWT instead of user credentials
            </td>
        </tr>
        <tr>
            <td>
                `--ns`
                <Label label="required" />
            </td>
            <td>
                Sets the desired namespace in which to import data
            </td>
        </tr>
        <tr>
            <td>
                `--db`
                <Label label="required" />
            </td>
            <td>
                Sets the desired database into which to import data
            </td>
        </tr>
    </tbody>
</table>

## Positional argument

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
                `file`
                <Label label="required" />
            </td>
            <td>
            Sets the path to the file which should be imported
            </td>
        </tr>
    </tbody>
</table>

## Example usage

To perform a SurrealQL database import from a local file, in a terminal run the `surreal import` command with the required arguments.

```bash
surreal import --conn http://localhost:8000 --user root --pass secret --ns test --db test downloads/surreal_deal_v1.surql
```

Using token-based authentication:

```bash 
surreal import --conn http://localhost:8000 --token <token> --ns test --db test downloads/surreal_deal_v1.surql
```

> [!NOTE]
> If you are using Surrealist, you can import files into your database by using the `Import database` button in the Explorer view. See the [Surrealist documentation](/docs/surrealist/concepts/explore-database-records) for more information.

## OPTION IMPORT

The output of a database export includes a line that contains the keywords `OPTION IMPORT`. This command is used internally to ensure that side effects do not run when the data is imported, such as [events](/docs/surrealql/statements/define/event) and [table views](/docs/surrealql/statements/define/table#pre-computed-table-views).

## Using environment variables

When using the `surreal import` command, you can also use environment variables to set the values for the command-line flags. 

>[!IMPORTANT]
> Most of the flags mentioned in the command output above also mention a corresponding [environment variables](/docs/surrealdb/cli/env#command-environment-variables). 
>
> For example, the `--username` flag can be configured with the `SURREAL_USER` environment variable instead. 

For more on the environment variables available for CLI commands or SurrealDB instances in general, see the [environment variables](/docs/surrealdb/cli/env#command-environment-variables) page.

## Command help

To see the help information and usage instructions, in a terminal run the `surreal import --help` command without any further arguments. This command gives general information on the arguments, inputs, and additional options for the `import` command.

```bash
surreal import --help
```

The output of the above command:

```
Import a SurrealQL script into an existing database

Usage: surreal import [OPTIONS] --namespace <NAMESPACE> --database <DATABASE> <FILE>

Arguments:
  <FILE>  Path to the SurrealQL file to import

Options:
  -e, --endpoint <ENDPOINT>      Remote database server url to connect to [default: ws://localhost:8000] [aliases: conn]
  -u, --username <USERNAME>      Database authentication username to use when connecting [env: SURREAL_USER=] [aliases: user]
  -p, --password <PASSWORD>      Database authentication password to use when connecting [env: SURREAL_PASS=] [aliases: pass]
  -t, --token <TOKEN>            Authentication token in JWT format to use when connecting [env: SURREAL_TOKEN=]
      --auth-level <AUTH_LEVEL>  Level on which the authenticating user is defined [env: SURREAL_AUTH_LEVEL=] [default: root] [possible values: root, namespace, ns, database, db]
      --namespace <NAMESPACE>    The namespace selected for the operation [env: SURREAL_NAMESPACE=] [aliases: ns]
      --database <DATABASE>      The database selected for the operation [env: SURREAL_DATABASE=] [aliases: db]
  -l, --log <LOG>                The logging level for the command-line tool [env: SURREAL_LOG=] [default: info] [possible values: none, full, error, warn, info, debug, trace]
  -h, --help                     Print help
```

---
sidebar_position: 8
sidebar_label: Isready command
title: Isready command | CLI tool
description: A command that determines whether a SurrealDB server has started and is able to accept connections.
---
import Label from "@components/shared/Label.astro";

# Isready command

The isready command attempts to connect to a remote SurrealDB server to detect if it has successfully started and is ready to accept connections.

> [!NOTE: BEFORE YOU START]
> Make sure you’ve [installed SurrealDB](/docs/surrealdb/installation) — it should only take a second!

## Command options

<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th>Description</th>
        </tr>
    </thead>  
    <tbody>
        <tr>
            <td colspan="2">
                `-e` / `--endpoint` / `--conn `
               <Label label="optional" />
            </td>
            <td>
        Sets the url of the database server to connect to
            </td>
        </tr>
    </tbody>
</table>

## Example usage

To display the current command-line tool version, along with the platform and architecture, in a terminal run the surreal version command without any further arguments.

```bash 
surreal isready --conn http://localhost:8000
```

## Command help

To see the help information and usage instructions, in a terminal run the `surreal isready --help` command without any further arguments. This command gives general information on the arguments, inputs, and additional options for the export command.

```bash
surreal isready --help
```

The output of the above command:

```bash
Check if the SurrealDB server is ready to accept connections

Usage: surreal is-ready [OPTIONS]

Options:
  -e, --endpoint <ENDPOINT>  Remote database server url to connect to [default: ws://localhost:8000] [aliases: conn]
  -l, --log <LOG>            The logging level for the command-line tool [env: SURREAL_LOG=] [default: info] [possible values: none, full, error, warn, info, debug, trace]
  -h, --help                 Print help
```

---
sidebar_position: 1
sidebar_label: ML Commands
title: ML | CLI tool
description: The ML commands can be used to import and export machine learning models.
---

# ML commands

The ML commands can be used to import and export machine learning models.


> [!NOTE: Before you begin]
> Make sure you’ve [installed SurrealDB](/docs/surrealdb/installation) — it should only take a second!


## ML Command help
To see the help information and usage instructions, in a terminal run the `surreal ml --help` command without any further arguments. This command gives general information on the arguments, inputs, and additional options for the `ml` command.

```bash
surreal ml --help
```

The output of the above command :


```
Manage SurrealML models within an existing database

Usage: surreal ml <COMMAND>

Commands:
  import  Import a SurrealML model into an existing database
  export  Export a SurrealML model from an existing database
  help    Print this message or the help of the given subcommand(s)

Options:
  -h, --help  Print help
```

<br />

---
sidebar_position: 2
sidebar_label: Import command
title: Import command | ML | CLI tool
description: The CLI ML import command is used to import a new machine learning model into SurrealDB.
---

import Label from "@components/shared/Label.astro";

# Import command

The ML import command is used to import a new machine learning model into SurrealDB.


> [!NOTE: BEFORE YOU START]
> Make sure you’ve [installed SurrealDB](/docs/surrealdb/installation) — it should only take a second!

## Command arguments

<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th>Description</th>
        </tr>
    </thead>  
    <tbody>
        <tr>
            <td colspan="2">
                `-e, --endpoint / --conn`
               <Label label="optional" />
            </td>
            <td>
            Sets the url of the database server to connect to
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-u / --user`
                <Label label="required" />
            </td>
            <td>
                Sets master username for the database
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-p / --pass`
                <Label label="required" />
            </td>
            <td>
                Sets master password for the database
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--ns`
                <Label label="required" />
            </td>
            <td>
                Sets the desired namespace in which to import data
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-t` / `--token`
               <Label label="optional" />
            </td>
            <td>
                Sets the authentication token to use when connecting to the server. Connect to SurrealDB using a JWT instead of user credentials
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--db`
                <Label label="required" />
            </td>
            <td>
                Sets the desired database into which to import data
            </td>
        </tr>
    </tbody>
</table>

## Positional argument

<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th>Description</th>
        </tr>
    </thead>  
    <tbody>
        <tr>
            <td colspan="2">
                `file`
                <Label label="required" />
            </td>
            <td>
            Sets the path to the file which should be imported
            </td>
        </tr>
    </tbody>
</table>

## Example usage
To perform a SurrealQL database import from a local file, in a terminal run the `surreal import` command with the required arguments.

```bash
surreal ml import --conn http://localhost:8000 --user root --pass secret --ns test --db test my-surrealml-model.surml
```

Using token-based authentication:

```bash 
surreal import --conn http://localhost:8000 --token <token> --ns test --db test my-surrealml-model.surml
```


## Command help
To see the help information and usage instructions, in a terminal run the `surreal ml import --help` command without any further arguments. This command gives general information on the arguments, inputs, and additional options for the `ml import` command.

```bash
surreal ml import --help
```

The output of the above command :


```
Import a SurrealML model into an existing database

Usage: surreal ml import [OPTIONS] --namespace <NAMESPACE> --database <DATABASE> <FILE>

Arguments:
  <FILE>  Path to the SurrealML file to import

Options:
  -e, --endpoint <ENDPOINT>      Remote database server url to connect to [default: ws://localhost:8000] [aliases: conn]
  -u, --username <USERNAME>      Database authentication username to use when connecting [env: SURREAL_USER=] [aliases: user]
  -p, --password <PASSWORD>      Database authentication password to use when connecting [env: SURREAL_PASS=] [aliases: pass]
      --auth-level <AUTH_LEVEL>  Authentication level to use when connecting
                                 Must be enabled in the server and uses the values of '--namespace' and '--database'
                                  [env: SURREAL_AUTH_LEVEL=] [default: root] [possible values: root, namespace, ns, database, db]
      --namespace <NAMESPACE>    The namespace selected for the operation [env: SURREAL_NAMESPACE=] [aliases: ns]
      --database <DATABASE>      The database selected for the operation [env: SURREAL_DATABASE=] [aliases: db]
  -h, --help                     Print help
```

<br />

---
sidebar_position: 3
sidebar_label: Export command
title: Export command | ML | CLI tool
description: The CLI ML export command is used to export a machine learning model from SurrealDB.
---

import Label from "@components/shared/Label.astro";

# Export command

The ML export command is used to export an existing machine learning model from SurrealDB.

> [!NOTE: BEFORE YOU START]
> Make sure you’ve [installed SurrealDB](/docs/surrealdb/installation) — it should only take a second!

## Command arguments

<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th>Description</th>
        </tr>
    </thead>  
    <tbody>
        <tr>
            <td colspan="2">
                `-e,--endpoint/--conn`
               <Label label="optional" />
            </td>
            <td>
            Sets the url of the database server to connect to
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-u / --user`
                <Label label="required" />
            </td>
            <td>
                Sets master username for the database
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-p / --pass`
                <Label label="required" />
            </td>
            <td>
                Sets master password for the database
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `-t` / `--token`
               <Label label="optional" />
            </td>
            <td>
                Sets the authentication token to use when connecting to the server. Connect to SurrealDB using a JWT instead of user credentials
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--ns`
                <Label label="required" />
            </td>
            <td>
                Sets the desired namespace in which to import data
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--db`
                <Label label="required" />
            </td>
            <td>
                Sets the desired database into which to import data
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--name`
                <Label label="required" />
            </td>
            <td>
                Represents the name of the model that you want to export
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--version`
                <Label label="required" />
            </td>
            <td>
                Represents the version of the model that you want to export
            </td>
        </tr>
    </tbody>
</table>

## Positional argument

<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th>Description</th>
        </tr>
    </thead>  
    <tbody>
        <tr>
            <td colspan="2">
                `file`
                <Label label="required" />
            </td>
            <td>
            Sets the path to the file which should be exported
            </td>
        </tr>
    </tbody>
</table>

## Example usage
To perform a SurrealQL database import from a local file, in a terminal run the `surreal import` command with the required arguments.

```bash
surreal ml export --conn http://localhost:8000 --user root --pass secret --ns test --db test --name my-surrealml-model --version 1.0.0 my-surrealml-model.surml
```

Using token-based authentication:

```bash
surreal ml export --conn http://localhost:8000 --token <token> --ns test --db test --name my-surrealml-model --version 1.0.0 my-surrealml-model.surml
```

## Command help
To see the help information and usage instructions, in a terminal run the `surreal ml export --help` command without any further arguments. This command gives general information on the arguments, inputs, and additional options for the `ml export` command.

```bash
surreal ml export --help
```

The output of the above command :


```
Export a SurrealML model from an existing database

Usage: surreal ml export [OPTIONS] --name <NAME> --version <VERSION> --namespace <NAMESPACE> --database <DATABASE> [FILE]

Arguments:
  [FILE]  Path to the SurrealML file to export. Use dash - to write into stdout. [default: -]

Options:
      --name <NAME>              The name of the model [env: SURREAL_NAME=]
      --version <VERSION>        The version of the model [env: SURREAL_VERSION=]
  -e, --endpoint <ENDPOINT>      Remote database server url to connect to [default: ws://localhost:8000] [aliases: conn]
  -u, --username <USERNAME>      Database authentication username to use when connecting [env: SURREAL_USER=] [aliases: user]
  -p, --password <PASSWORD>      Database authentication password to use when connecting [env: SURREAL_PASS=] [aliases: pass]
    -t, --token <TOKEN>            Authentication token in JWT format to use when connecting [env: SURREAL_TOKEN=]
      --auth-level <AUTH_LEVEL>  Authentication level to use when connecting
                                 Must be enabled in the server and uses the values of '--namespace' and '--database'
                                  [env: SURREAL_AUTH_LEVEL=] [default: root] [possible values: root, namespace, ns, database, db]
      --namespace <NAMESPACE>    The namespace selected for the operation [env: SURREAL_NAMESPACE=] [aliases: ns]
      --database <DATABASE>      The database selected for the operation [env: SURREAL_DATABASE=] [aliases: db]
  -h, --help                     Print help
```

<br />

---
sidebar_position: 10
sidebar_label: Upgrade command
title: Upgrade command | CLI tool
description: A command to change the current version of SurrealDB to another one, including the latest version, specified version, or nightly.
---

import Since from '@components/shared/Since.astro'
import Label from "@components/shared/Label.astro";

# Upgrade command

The upgrade command upgrades SurrealDB to the latest version, nightly or a specified version.


> [!NOTE: BEFORE YOU START]
> Make sure you’ve [installed SurrealDB](/docs/surrealdb/installation) — it should only take a second!

## Command options

<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th>Description</th>
        </tr>
    </thead>  
    <tbody>
        <tr>
            <td colspan="2">
                `--nightly`
               <Label label="optional" />
            </td>
            <td>
            installs the latest nightly version of SurrealDB
            </td>
        </tr>
                <tr>
            <td colspan="2">
                `--alpha`
               <Label label="optional" />
            </td>
            <td>
            installs the latest alpha version of SurrealDB
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--beta`
               <Label label="optional" />
            </td>
            <td>
            installs the latest beta version of SurrealDB
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--version`
               <Label label="optional" />
            </td>
            <td>
                installs a specific version of SurrealDB
            </td>
        </tr>
        <tr>
            <td colspan="2">
                `--dry-run`
               <Label label="optional" />
            </td>
            <td>
                Does not actually replace the currently installed version of SurrealDB.
            </td>
        </tr>
    </tbody>
</table>

## Example usage

This example shows how you can use the upgrade command to upgrade to the latest version of SurrealDB.

```bash
surreal upgrade
```

## Global install

If SurrealDB is installed globally on your system, you might need to run the upgrade command with elevated permissions, such as `sudo` on Unix-based systems or with administrator privileges in Windows.

```bash
sudo surreal upgrade
```

## Install specific version

Use the `--version` flag to upgrade to a specific version of SurrealDB.

```bash
surreal upgrade --version [VERSION]

-- example
surreal upgrade --version 2.2.1
```

For a list of available versions and their release notes, see the [releases](/releases) page.

## Install the alpha release

<Since v="v1.5.3" />

Use the `--alpha` flag to upgrade to the latest alpha version of SurrealDB.

```bash
surreal upgrade --alpha
```

## Install the beta release

<Since v="v1.1.0" />

Use the `--beta` flag to upgrade to the latest beta version of SurrealDB.

```bash
surreal upgrade --beta
```

## Install the nightly release 

Use the `--nightly` flag to upgrade to the latest nightly version of SurrealDB.

```bash
surreal upgrade --nightly
```

## Command help

To see the help information and usage instructions, in a terminal run the `surreal upgrade --help` command without any further arguments. This command gives general information on the arguments, inputs, and additional options for the `upgrade` command.

```bash
surreal upgrade --help
```

The output of the above command:

```
Upgrade to the latest stable version

Usage: surreal upgrade [OPTIONS]

Options:
      --nightly            Install the latest nightly version
      --alpha              Install the latest alpha version
      --beta               Install the latest beta version
      --version <VERSION>  Install a specific version
      --dry-run            Don't actually replace the executable
  -l, --log <LOG>          The logging level for the command-line tool [env: SURREAL_LOG=] [default: info] [possible values: none, full, error, warn, info, debug, trace]
  -h, --help               Print help
```

---
sidebar_position: 11
sidebar_label: Validate command
title: Validate command | CLI tool
description: A command to confirm whether one or more SurrealQL files are valid or not.
---
import Label from "@components/shared/Label.astro";

# Validate command

The validate command validates one or many SurrealQL (`.surql`) language files.

> [!NOTE: BEFORE YOU START]
> Make sure you’ve [installed SurrealDB](/docs/surrealdb/installation) — it should only take a second!

## Command options

<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th>Description</th>
        </tr>
    </thead>  
    <tbody>
        <tr>
            <td colspan="2">
                <code>[PATTERNS] </code>
            </td>
            <td>
        Glob pattern for the files to validate [default: "**/*.surql"]
            </td>
        </tr>
    </tbody>
</table>


## Example usage

To perform validation on a SurrealQL local file, in a terminal run the `surreal validate` command with the required argument.

Using the command on its own will validate all the `.surql` files in the current directory.

```bash
surreal validate
user1.surql: OK
user2.surql: OK
user3.surql: OK
```

You can perform validation on a single file, regardless of extension.

```bash
surreal validate user.surql
surreal validate user.txt
```

You can also perform validation on multiple files using a single glob pattern:

```bash
# equivalent to "surreal validate"
surreal validate **/*.surql
```

Finally, you can also perform validation on multiple files using multiple paths/patterns:

```bash
surreal validate index.surql schemas/*.surql queries/*.surql
surreal validate *.(txt|surql)
```

If any files are invalid, the command will abort at this point and return an error.

```bash
surreal validate
user1.surql: OK
user2.surql: KO
Parse error: Unexpected token `an identifier`, expected Eof
 --> [1:15]
  |
1 | CREATE person SE name = "Billy";
  |               ^^ 
```

## Command help

To see the help information and usage instructions, in a terminal run the `surreal validate --help` command without any further arguments. This command gives general information on the arguments, inputs, and additional options for the `validate` command.

```bash
surreal validate --help
```

The output of the above command:

```
Validate SurrealQL query files

Usage: surreal validate [OPTIONS] [PATTERNS]...

Arguments:
  [PATTERNS]...  Glob pattern for the files to validate [default: **/*.surql]

Options:
  -l, --log <LOG>  The logging level for the command-line tool [env: SURREAL_LOG=] [default: info] [possible values: none, full, error, warn, info, debug, trace]
  -h, --help       Print help
```

---
sidebar_position: 12
sidebar_label: Version command
title: Version command | CLI tool
description: A command to output the current version of the SurrealDB binary along with the machine architecture.
---
import Since from '@components/shared/Since.astro'
import Label from "@components/shared/Label.astro";

# Version command

The version command outputs the current version of the installed command-line tool, and the machine architecture.

> [!NOTE: BEFORE YOU START]
> Make sure you’ve [installed SurrealDB](/docs/surrealdb/installation) — it should only take a second!

## Command options

<table>
    <thead>
        <tr>
            <th colspan="2">Arguments</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2">
                `-e` / `--endpoint`
               <Label label="optional" />
            </td>
            <td>
            Remote database server url to connect to [aliases: conn]
            </td>
        </tr>
    </tbody>
</table>

## Example usage

To display the current command-line tool version, along with the platform and architecture, in a terminal run the `surreal version` command without any further arguments.

```bash
surreal version
```

Sample output:

```
2.2.1 for macos on aarch64
```

If an endpoint is specified, only the version number will be displayed.

```bash
surreal version --endpoint http://localhost:8000
```

Output:

```
2.2.1
```

### Check version with CLI flags

<Since v="v1.2.0" />

```bash
surreal -V
```

```bash
surreal --version
```

Sample output:

```
SurrealDB command-line interface and server 2.2.1 for macos on aarch64
```

## Command help

To see the help information and usage instructions, in a terminal run the `surreal version --help` command without any further arguments. This command gives general information on the arguments, inputs, and additional options for the `version` command.

```bash
surreal version --help
```
The output of the above command:

```
Output the command-line tool and remote server version information

Usage: surreal version [OPTIONS]

Options:
  -e, --endpoint <ENDPOINT>  Remote database server url to connect to [aliases: conn]
  -l, --log <LOG>            The logging level for the command-line tool [env: SURREAL_LOG=] [default: info] [possible values: none, full, error, warn, info, debug, trace]
  -h, --help                 Print help
```

---
sidebar_position: 13
sidebar_label: Environment variables
title: Environment variables used for SurrealDB
description: A list of the available environment variables used when running SurrealDB.
---

import Tabs from "@components/Tabs/Tabs.astro";
import TabItem from "@components/Tabs/TabItem.astro";
import Since from "@components/shared/Since.astro";

# Environment variables

Environment variables can be used to tailor the behaviour of a running SurrealDB instance.

## SurrealDB environment variables

<table>
  <thead>
    <tr>
      <th scope="col" style={{width: '50%'}}>Environment variable</th>
      <th scope="col" style={{width: '20%'}}>Default value</th>
      <th scope="col" style={{width: '30%'}}>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_BUCKET_FOLDER_ALLOWLIST</code></td>
      <td scope="row" data-label="Default">empty</td>
      <td scope="row" data-label="Notes">Specifies a list of paths in which files can be accessed.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_BUILD_METADATA</code></td>
      <td scope="row" data-label="Default">false</td>
      <td scope="row" data-label="Notes">The version identifier of this build. Defaults to the CARGO_PKG_VERSION environment variable if not specified.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_CHANGEFEED_GC_INTERVAL</code></td>
      <td scope="row" data-label="Default">10s</td>
      <td scope="row" data-label="Notes">The interval at which to perform changefeed garbage collection.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_COUNT_BATCH_SIZE</code></td>
      <td scope="row" data-label="Default">10,000</td>
      <td scope="row" data-label="Notes"><Since v="v2.2.0" /> The maximum number of keys that should be scanned at once for count queries.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_DATASTORE_CACHE_SIZE</code></td>
      <td scope="row" data-label="Default">1,000</td>
      <td scope="row" data-label="Notes"><Since v="v2.1.0" /> The number of definitions which can be cached across transactions.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_EXPERIMENTAL_BEARER_ACCESS</code></td>
      <td scope="row" data-label="Default">false</td>
      <td scope="row" data-label="Notes">Enable experimental bearer access and stateful access grant management. Still under active development. Using this experimental feature may introduce risks related to breaking changes and security issues.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_EXPERIMENTAL_GRAPHQL</code></td>
      <td scope="row" data-label="Default">false</td>
      <td scope="row" data-label="Notes">Enables experimental graphql integration. Still under active development. Using this experimental feature may introduce risks related to breaking changes and security issues.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_EXPORT_BATCH_SIZE</code></td>
      <td scope="row" data-label="Default">1000</td>
      <td scope="row" data-label="Notes">The maximum number of keys that should be scanned at once for export queries.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_EXTERNAL_SORTING_BUFFER_LIMIT</code></td>
      <td scope="row" data-label="Default">50000</td>
      <td scope="row" data-label="Notes">Specifies the buffer limit for external sorting.</td>
    </tr>
     <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_FILE_ALLOWLIST</code></td>
      <td scope="row" data-label="Default">20</td>
      <td scope="row" data-label="Notes"><Since v="v2.1.5" /> Limits file access for the mapper filter to only the specified allowed file paths. The paths must be provided as absolute paths, separated by a colon (:) on Unix-like systems or a semicolon (;) on Windows.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_FUNCTION_ALLOCATION_LIMIT</code></td>
      <td scope="row" data-label="Default">20</td>
      <td scope="row" data-label="Notes">Used to limit allocation for builtin functions.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_GLOBAL_BUCKET</code></td>
      <td scope="row" data-label="Default">None</td>
      <td scope="row" data-label="Notes">Specifies the name of a global bucket for file data.</td>
    </tr>
     <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_GENERATION_ALLOCATION_LIMIT</code></td>
      <td scope="row" data-label="Default">20</td>
      <td scope="row" data-label="Notes">Limits memory allocation for certain built-in functions (e.g., string::replace) to avoid uncontrolled memory usage. default is 1,048,576 bytes (computed as 2^20).</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_GLOBAL_BUCKET_ENFORCED</code></td>
      <td scope="row" data-label="Default">false</td>
      <td scope="row" data-label="Notes">Whether to enforce a global bucket for file data.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_HTTP_MAX_API_BODY_SIZE</code></td>
      <td scope="row" data-label="Default">1 MiB</td>
      <td scope="row" data-label="Notes">The maximum HTTP body size of the HTTP /api endpoint.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_HTTP_MAX_IMPORT_BODY_SIZE</code></td>
      <td scope="row" data-label="Default">4398046511104 (4 GiB)</td>
      <td scope="row" data-label="Notes">Maximum HTTP body size of the HTTP /import endpoints</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_HTTP_MAX_KEY_BODY_SIZE</code></td>
      <td scope="row" data-label="Default">16384 (16 KiB)</td>
      <td scope="row" data-label="Notes">Maximum HTTP body size of the HTTP /key endpoints</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_HTTP_MAX_ML_BODY_SIZE</code></td>
      <td scope="row" data-label="Default">4398046511104 (4 GiB)</td>
      <td scope="row" data-label="Notes">Maximum HTTP body size of the HTTP /ml endpoints</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_HTTP_MAX_RPC_BODY_SIZE</code></td>
      <td scope="row" data-label="Default">4194304 (4 MiB)</td>
      <td scope="row" data-label="Notes">Maximum HTTP body size of the HTTP /rpc endpoint.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_HTTP_MAX_SQL_BODY_SIZE</code></td>
      <td scope="row" data-label="Default">1048576 (1 MiB)</td>
      <td scope="row" data-label="Notes">Maximum HTTP body size of the HTTP /sql endpoint</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_HTTP_MAX_SIGNIN_BODY_SIZE</code></td>
      <td scope="row" data-label="Default">1024 (1 KiB)</td>
      <td scope="row" data-label="Notes">The maximum HTTP body size of the HTTP /signin endpoints</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_HTTP_MAX_SIGNUP_BODY_SIZE</code></td>
      <td scope="row" data-label="Default">1024 (1 KiB)</td>
      <td scope="row" data-label="Notes">Maximum HTTP body size of the HTTP /signup endpoint.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_IDIOM_RECURSION_LIMIT</code></td>
      <td scope="row" data-label="Default">256</td>
      <td scope="row" data-label="Notes">The maximum recursive idiom path depth allowed.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_IMPORT_FILE</code></td>
      <td scope="row" data-label="Default">None</td>
      <td scope="row" data-label="Notes">Path to a SurrealQL file that will be imported when starting the server.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_INDEXING_BATCH_SIZE</code></td>
      <td scope="row" data-label="Default">250</td>
      <td scope="row" data-label="Notes">The maximum number of keys to scan at once per concurrent indexing batch.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_INSECURE_FORWARD_ACCESS_ERRORS</code></td>
      <td scope="row" data-label="Default">false</td>
      <td scope="row" data-label="Notes">Forward all signup/signin/authenticate query errors to a client performing authentication. Do not use in production.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_MAX_COMPUTATION_DEPTH</code></td>
      <td scope="row" data-label="Default">120</td>
      <td scope="row" data-label="Notes">/// Specifies how deep recursive computation will go before erroring.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_MAX_CONCURRENT_TASKS</code></td>
      <td scope="row" data-label="Default">64</td>
      <td scope="row" data-label="Notes">Specifies how many concurrent jobs can be buffered in the worker channel.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_MAX_HTTP_REDIRECTS</code></td>
      <td scope="row" data-label="Default">10</td>
      <td scope="row" data-label="Notes"><Since v="v2.0.5" /> The maximum number of HTTP redirects allowed within http functions.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_MAX_OBJECT_PARSING_DEPTH</code></td>
      <td scope="row" data-label="Default">10</td>
      <td scope="row" data-label="Notes">Specifies how deep the parser will parse nested objects and arrays in a query.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_MAX_ORDER_LIMIT_PRIORITY_QUEUE_SIZE</code></td>
      <td scope="row" data-label="Default">1000</td>
      <td scope="row" data-label="Notes"><Since v="v2.2.0" /> The maximum size of the priority queue triggering usage of the priority queue for the result collector.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_MAX_QUERY_PARSING_DEPTH</code></td>
      <td scope="row" data-label="Default">20</td>
      <td scope="row" data-label="Notes">Specifies how deep the parser will parse recursive queries (queries within queries).</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_MAX_STREAM_BATCH_SIZE</code></td>
      <td scope="row" data-label="Default">1000</td>
      <td scope="row" data-label="Notes">The maximum number of keys that should be fetched when streaming range scans in a Scanner.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_MEMORY_THRESHOLD</code></td>
      <td scope="row" data-label="Default"> </td>
      <td scope="row" data-label="Notes"><Since v="v2.1.5" /> Configuring the memory threshold which can be used across the programme to check if the amount of memory available to the programme is lower than required. The value can be specified as bytes (b, or without any suffix), kibibytes (k, kb, or kib), mebibytes (m, mb, or mib), or gibibytes (g, gb, or gib). If the environment variable is not specified, then the threshold is not used, and no memory limit is enabled.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_NET_MAX_CONCURRENT_REQUESTS</code></td>
      <td scope="row" data-label="Default">1,048,576 concurrent requests</td>
      <td scope="row" data-label="Notes">Adds a global limit for concurrent server requests, and introduces a new environment variable</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_NODE_MEMBERSHIP_CHECK_INTERVAL</code></td>
      <td scope="row" data-label="Default">15s</td>
      <td scope="row" data-label="Notes">The interval at which to process and archive inactive nodes.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_NODE_MEMBERSHIP_CLEANUP_INTERVAL</code></td>
      <td scope="row" data-label="Default">300s</td>
      <td scope="row" data-label="Notes">The interval at which to process and cleanup archived nodes.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_NODE_MEMBERSHIP_REFRESH_INTERVAL</code></td>
      <td scope="row" data-label="Default">3s</td>
      <td scope="row" data-label="Notes">The interval at which to refresh node registration information.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_NORMAL_FETCH_SIZE</code></td>
      <td scope="row" data-label="Default">500</td>
      <td scope="row" data-label="Notes">The maximum number of keys that should be scanned at once in general queries.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_REGEX_CACHE_SIZE</code></td>
      <td scope="row" data-label="Default">100</td>
      <td scope="row" data-label="Notes">The number of computed regexes which can be cached in the engine.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_REGEX_SIZE_LIMIT</code></td>
      <td scope="row" data-label="Default">10,485,760</td>
      <td scope="row" data-label="Notes"><Since v="v2.1.5" /> Limits the maximum allowed size (in bytes) for compiled regular expressions. This prevents excessive memory consumption when building complex or very large regex patterns.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_RUNTIME_MAX_BLOCKING_THREADS</code></td>
      <td scope="row" data-label="Default">512</td>
      <td scope="row" data-label="Notes">Number of threads which can be started for blocking operations.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_RUNTIME_STACK_SIZE</code></td>
      <td scope="row" data-label="Default">10485760 (10 MiB)</td>
      <td scope="row" data-label="Notes">Runtime thread memory stack size. Stack size is doubled if compiled from source in Debug mode.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_RUNTIME_WORKER_THREADS</code></td>
      <td scope="row" data-label="Default">Number of CPU cores (minimum 4)</td>
      <td scope="row" data-label="Notes">Number of runtime worker threads used to start.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_SCRIPTING_MAX_MEMORY_LIMIT</code></td>
      <td scope="row" data-label="Default">2097152 (2 MiB)</td>
      <td scope="row" data-label="Notes">Maximum memory limit of the JavaScript function runtime.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_SCRIPTING_MAX_STACK_SIZE</code></td>
      <td scope="row" data-label="Default">262144 (256 KiB)</td>
      <td scope="row" data-label="Notes">Maximum stack size of the JavaScript function runtime.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_SCRIPTING_MAX_TIME_LIMIT</code></td>
      <td scope="row" data-label="Default">5000 (5000 milliseconds or 5 seconds)</td>
      <td scope="row" data-label="Notes"><Since v="v2.0.5" /> Maximum allowed time that a JavaScript function is allowed to run for.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_SURREALCS_CONNECTION_POOL_SIZE</code></td>
      <td scope="row" data-label="Default">Number of CPUs on the current device</td>
      <td scope="row" data-label="Notes"><Since v="v2.0.2" /> Size of the SurrealCS connection pool.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_TELEMETRY_DISABLE_METRICS</code></td>
      <td scope="row" data-label="Default">false</td>
      <td scope="row" data-label="Notes"><Since v="v2.1.3" /> Disables sending metrics to the GRPC OTEL collector.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_TELEMETRY_DISABLE_TRACING</code></td>
      <td scope="row" data-label="Default">false</td>
      <td scope="row" data-label="Notes"><Since v="v2.1.3" /> Disables sending traces to the GRPC OTEL collector.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_TELEMETRY_NAMESPACE</code></td>
      <td scope="row" data-label="Default">None</td>
      <td scope="row" data-label="Notes">If set then use this as value for the namespace label when sending telemetry</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_TELEMETRY_PROVIDER</code></td>
      <td scope="row" data-label="Default">None</td>
      <td scope="row" data-label="Notes">If set to "otlp" then telemetry is sent to the GRPC OTEL collector.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_TEMPORARY_DIRECTORY</code></td>
      <td scope="row" data-label="Default">None</td>
      <td scope="row" data-label="Notes">Sets the directory for storing temporary database files.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_TRANSACTION_CACHE_SIZE</code></td>
      <td scope="row" data-label="Default">10000</td>
      <td scope="row" data-label="Notes">Specifies the number of items which can be cached within a single transaction.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_WEBSOCKET_MAX_CONCURRENT_REQUESTS</code></td>
      <td scope="row" data-label="Default">4 times the number of CPU cores, minimum 12</td>
      <td scope="row" data-label="Notes">Maximum concurrent tasks that can be handled on each WebSocket.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_WEBSOCKET_MAX_FRAME_SIZE</code></td>
      <td scope="row" data-label="Default">16777216 (16 MiB)</td>
      <td scope="row" data-label="Notes">Maximum WebSocket frame size.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_WEBSOCKET_MAX_MESSAGE_SIZE</code></td>
      <td scope="row" data-label="Default">134217728 (128 MiB)</td>
      <td scope="row" data-label="Notes">Maximum WebSocket message size.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_WEBSOCKET_RESPONSE_BUFFER_SIZE</code></td>
      <td scope="row" data-label="Default">0</td>
      <td scope="row" data-label="Notes">How many responses can be buffered when delivering to the client.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_WEBSOCKET_RESPONSE_CHANNEL_SIZE</code></td>
      <td scope="row" data-label="Default">100</td>
      <td scope="row" data-label="Notes">Configuring the WebSocket buffer size and the WebSocket response queue size.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_WEBSOCKET_RESPONSE_FLUSH_PERIOD</code></td>
      <td scope="row" data-label="Default">3</td>
      <td scope="row" data-label="Notes">How often (in milliseconds) any buffered responses are flushed to the WebSocket client.</td>
    </tr>
  </tbody>
</table>

## Command environment variables

Many of the arguments passed into [the CLI](/docs/surrealdb/cli/start) can be set using the above environment variables instead.

As each of these environment variables correspond to a flag passed into a command, it is good practice to put together a command that matches the environment variables you wish to set. Once the database server conforms to your expected behaviour, you can then pull out the values passed into each flag for your environment variables.

For example, take the following command to start the database.

```bash
surreal start --user root --pass root --allow-net --deny-funcs "crypto::md5, http::post, http::delete"
```

If we now wanted to use environment variables instead of the `--allow-net` and `--deny-funcs` flags, we would use the `SURREAL_CAPS_ALLOW_NET` and `SURREAL_CAPS_DENY_FUNC` environment variables.

As the `--allow-net` flag was passed in without a following value, the same will be the case with the `SURREAL_CAPS_ALLOW_NET` environment variable, becoming `SURREAL_CAPS_ALLOW_NET=`. The `--deny-funcs` flag can also be used on its own to deny execution of all functions, but in this case is followed by a string to indicate which exact functions are not allowed to be executed. As such, the `SURREAL_CAPS_DENY_FUNC` environment variable must also be followed by a string, becoming `SURREAL_CAPS_DENY_FUNC="crypto::md5, http::post, http::delete"`.

The command would then look like the following:

<Tabs groupId="start-command">

<TabItem value="bash" label="Bash" >
```bash
SURREAL_CAPS_ALLOW_NET
SURREAL_CAPS_DENY_FUNC="crypto::md5, http::post, http::delete"
surreal start --user root --pass root
```
</TabItem>

<TabItem value="powershell" label="PowerShell" >
```powershell
$env:SURREAL_CAPS_ALLOW_NET
$env:SURREAL_CAPS_DENY_FUNC="crypto::md5, http::post, http::delete"
surreal start --user root --pass root
```
</TabItem>
</Tabs>

<table>
  <thead>
    <tr>
      <th scope="col" style={{width: '30%'}}>Environment variable</th>
      <th scope="col" style={{width: '20%'}}>For command(s)</th>
      <th scope="col" style={{width: '10%'}}>arg</th>
      <th scope="col" style={{width: '30%'}}>Details</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_AUTH_LEVEL</code></td>
      <td scope="row" data-label="Command">surreal export, import, sql</td>
      <td scope="row" data-label="Argument">auth-level</td>
      <td scope="row" data-label="Details">Authentication level to use when connecting.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_BIND</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">bind</td>
      <td scope="row" data-label="Details">The hostname or IP address(es) to listen for connections on.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_CAPS_ALLOW_ALL</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">allow-all</td>
      <td scope="row" data-label="Details">Allow all capabilities.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_CAPS_ALLOW_ARBITRARY_QUERY</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">allow-arbitrary-query</td>
      <td scope="row" data-label="Details">Allows arbitrary queries to be used by user groups. Possible user groups are: 'guest', 'record', and 'system'.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_CAPS_ALLOW_EXPERIMENTAL</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">allow-experimental</td>
      <td scope="row" data-label="Details">Allow execution of experimental features.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_CAPS_ALLOW_FUNC</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">allow-funcs</td>
      <td scope="row" data-label="Details">Allow execution of all or certain functions.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_CAPS_ALLOW_GUESTS</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">allow-guests</td>
      <td scope="row" data-label="Details">Allow guest users to execute queries.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_CAPS_ALLOW_NET</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">allow-net</td>
      <td scope="row" data-label="Details">Allow all or certain outbound network access.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_CAPS_ALLOW_SCRIPT</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">allow-scripting</td>
      <td scope="row" data-label="Details">Allow execution of embedded scripting functions.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_CAPS_DENY_ALL</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">deny-all</td>
      <td scope="row" data-label="Details">Deny all capabilities.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_CAPS_DENY_FUNC</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">deny-funcs</td>
      <td scope="row" data-label="Details">Deny execution of all or certain functions.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_CAPS_DENY_GUESTS</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">deny-guests</td>
      <td scope="row" data-label="Details">Deny guest users to execute queries.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_CAPS_DENY_NET</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">deny-net</td>
      <td scope="row" data-label="Details">Deny all or certain outbound access paths.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_CAPS_DENY_SCRIPT</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">deny-scripting</td>
      <td scope="row" data-label="Details">Deny execution of embedded scripting functions.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_CLIENT_IP</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">client-ip</td>
      <td scope="row" data-label="Details">The method of detecting the client's IP address.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_DATABASE</code></td>
      <td scope="row" data-label="Command">surreal export, import, sql</td>
      <td scope="row" data-label="Argument">database</td>
      <td scope="row" data-label="Details">The database selected for the operation.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_HIDE_WELCOME</code></td>
      <td scope="row" data-label="Command">surreal sql</td>
      <td scope="row" data-label="Argument">hide-welcome</td>
      <td scope="row" data-label="Details">Whether to show welcome message.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_KEY</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">key</td>
      <td scope="row" data-label="Details">Encryption key to use for on-disk encryption.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_KVS_CA</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">kvs-ca</td>
      <td scope="row" data-label="Details">Path to the CA file used when connecting to the remote KV store.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_KVS_CERT</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">kvs-cert</td>
      <td scope="row" data-label="Details">Path to the certificate file used when connecting to the remote KV store.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_KVS_KEY</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">kvs-key</td>
      <td scope="row" data-label="Details">Path to the private key file used when connecting to the remote KV store.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_LOG</code></td>
      <td scope="row" data-label="Command">surreal fix, start</td>
      <td scope="row" data-label="Argument">log</td>
      <td scope="row" data-label="Details">The logging level for the database server.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_LOG_FILE_ENABLED</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">log-file-enabled</td>
      <td scope="row" data-label="Details"><Since v="v2.4.0" /> Toggles file output (default: false)</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_LOG_FILE_LEVEL</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">log-file-level</td>
      <td scope="row" data-label="Details"><Since v="v2.4.0" /> Override the logging level for file output</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_LOG_FILE_NAME</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">log-file-name</td>
      <td scope="row" data-label="Details"><Since v="v2.4.0" /> Filename for logs (default: `surrealdb.log`)</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_LOG_FILE_PATH</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">log-file-path</td>
      <td scope="row" data-label="Details"><Since v="v2.4.0" /> Sets the directory for logs (default: `./logs`)</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_LOG_FILE_ROTATION</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">log-file-rotation</td>
      <td scope="row" data-label="Details"><Since v="v2.4.0" /> Sets the directory for logs (one of `daily`, `hourly`, `never`; default: `daily`)</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_LOG_OTEL_LEVEL</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">log-otel-level</td>
      <td scope="row" data-label="Details"><Since v="v2.4.0" /> Override the logging level for OpenTelemetry</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_NAME</code></td>
      <td scope="row" data-label="Command">surreal ml export</td>
      <td scope="row" data-label="Argument">name</td>
      <td scope="row" data-label="Details">The name of the model.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_NAMESPACE</code></td>
      <td scope="row" data-label="Command">surreal export, import, sql</td>
      <td scope="row" data-label="Argument">namespace</td>
      <td scope="row" data-label="Details">The namespace selected for the operation.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_NO_BANNER</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">no-banner</td>
      <td scope="row" data-label="Details">Whether to hide the startup banner.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_NO_IDENTIFICATION_HEADERS</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">no-identification-headers</td>
      <td scope="row" data-label="Details">Whether to suppress the server name and version headers.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_PASS</code></td>
      <td scope="row" data-label="Command">surreal export, import, sql, start</td>
      <td scope="row" data-label="Argument">password, pass</td>
      <td scope="row" data-label="Details">Database authentication password to use when connecting.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_PATH</code></td>
      <td scope="row" data-label="Command">surreal fix, start</td>
      <td scope="row" data-label="Argument">path</td>
      <td scope="row" data-label="Details">Database path used for storing data.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_QUERY_TIMEOUT</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">query-timeout</td>
      <td scope="row" data-label="Details">The maximum duration that a set of statements can run for.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_STRICT</code></td>
      <td scope="row" data-label="Command">start</td>
      <td scope="row" data-label="Argument">strict</td>
      <td scope="row" data-label="Details">Whether strict mode is enabled on this database instance.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_TEMPORARY_DIRECTORY</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">temporary-directory</td>
      <td scope="row" data-label="Details">Sets the directory for storing temporary database files</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_TOKEN</code></td>
      <td scope="row" data-label="Command">surreal export, import, sql</td>
      <td scope="row" data-label="Argument">token</td>
      <td scope="row" data-label="Details">Authentication token in JWT format to use when connecting.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_TRANSACTION_TIMEOUT</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">transaction-timeout</td>
      <td scope="row" data-label="Details">The maximum duration that any single transaction can run for.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_UNAUTHENTICATED</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">unauthenticated</td>
      <td scope="row" data-label="Details">Whether to allow unauthenticated access.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_USER</code></td>
      <td scope="row" data-label="Command">surreal export, import, sql, start</td>
      <td scope="row" data-label="Argument">username, user</td>
      <td scope="row" data-label="Details">Database authentication username to use when connecting.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_VERSION</code></td>
      <td scope="row" data-label="Command">surreal ml export</td>
      <td scope="row" data-label="Argument">name</td>
      <td scope="row" data-label="Details">The version of the model.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_WEB_CRT</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">web-crt</td>
      <td scope="row" data-label="Details">Path to the certificate file for encrypted client connections.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_WEB_KEY</code></td>
      <td scope="row" data-label="Command">surreal start</td>
      <td scope="row" data-label="Argument">web-key</td>
      <td scope="row" data-label="Details">Path to the private key file for encrypted client connections.</td>
    </tr>
  </tbody>
</table>

## Environment variables by storage backend

These environment variables are used to configure the storage backend for SurrealDB.

### FoundationDB environment variables

<table>
  <thead>
    <tr>
      <th scope="col">Environment variable</th>
      <th scope="col">Default value</th>
      <th scope="col">Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_FOUNDATIONDB_TRANSACTION_MAX_RETRY_DELAY</code></td>
      <td scope="row" data-label="Default">500</td>
      <td scope="row" data-label="Notes">The maximum delay between transaction retries in milliseconds.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_FOUNDATIONDB_TRANSACTION_RETRY_LIMIT</code></td>
      <td scope="row" data-label="Default">5</td>
      <td scope="row" data-label="Notes">The maximum number of times a transaction can be retried.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_FOUNDATIONDB_TRANSACTION_TIMEOUT</code></td>
      <td scope="row" data-label="Default">5000</td>
      <td scope="row" data-label="Notes">The maximum transaction timeout in milliseconds.</td>
    </tr>
  </tbody>
</table>


### RocksDB environment variables

Many RocksDB environment variables pertain to memory use. The default configuration results in the following rough estimates of RocksDB memory use on different instances:

| Instance memory size  | Estimate
| ------------- |:-------------:|
| 512 MiB | ~ 80MiB |
| 1 GiB | ~ 80MiB
| 2 GiB | ~ 640MiB
| 4 GiB | ~ 1.25GiB
| 8 GiB | ~ 3.25GiB
| 24 GiB | ~ 12GiB
| 128 GiB | ~ 67GiB

The available environment variables for configuring a RocksDB instance are:

<table>
  <thead>
    <tr>
      <th scope="col" style={{width: '50%'}}>Environment variable</th>
      <th scope="col" style={{width: '20%'}}>Default value</th>
      <th scope="col" style={{width: '30%'}}>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_BACKGROUND_FLUSH</code></td>
      <td scope="row" data-label="Default">false</td>
      <td scope="row" data-label="Notes">Whether to enable background WAL file flushing.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_BACKGROUND_FLUSH_INTERVAL</code></td>
      <td scope="row" data-label="Default">200</td>
      <td scope="row" data-label="Notes">The interval in milliseconds between background flushes.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_BLOCK_CACHE_SIZE</code></td>
      <td scope="row" data-label="Default">Dynamic from 16MiB to ~45% of total machine memory</td>
      <td scope="row" data-label="Notes">RocksDB <a href="https://github.com/facebook/rocksdb/wiki/memory-usage-in-rocksdb">block cache size</a> in bytes</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_BLOCK_SIZE</code></td>
      <td scope="row" data-label="Default">64 KiB</td>
      <td scope="row" data-label="Notes">The size of each uncompressed data block in bytes.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_COMPACTION_READAHEAD_SIZE</code></td>
      <td scope="row" data-label="Default">Dynamic from 4 MiB to 16 MiB depending on total system memory</td>
      <td scope="row" data-label="Notes">The readahead buffer size used during compaction.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_COMPACTION_STYLE</code></td>
      <td scope="row" data-label="Default">"level"</td>
      <td scope="row" data-label="Notes"><Since v="v2.0.3" /> Use to specify the database compaction style.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_DELETION_FACTORY_DELETION_COUNT</code></td>
      <td scope="row" data-label="Default">50</td>
      <td scope="row" data-label="Notes"><Since v="v2.0.3" /> The number of deletions to track in the window.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_DELETION_FACTORY_RATIO</code></td>
      <td scope="row" data-label="Default">0.5</td>
      <td scope="row" data-label="Notes"><Since v="v2.0.3" /> The ratio of deletions to track in the window.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_DELETION_FACTORY_WINDOW_SIZE</code></td>
      <td scope="row" data-label="Default">1000</td>
      <td scope="row" data-label="Notes"><Since v="v2.0.3" /> The size of the window used to track deletions.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_ENABLE_BLOB_FILES</code></td>
      <td scope="row" data-label="Default">true</td>
      <td scope="row" data-label="Notes">Whether to enable separate key and value file storage.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_ENABLE_MEMORY_MAPPED_READS</code></td>
      <td scope="row" data-label="Default">false</td>
      <td scope="row" data-label="Notes">Whether to enable memory-mapped reads.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_ENABLE_MEMORY_MAPPED_WRITES</code></td>
      <td scope="row" data-label="Default">false</td>
      <td scope="row" data-label="Notes">Whether to enable memory-mapped writes.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_ENABLE_PIPELINED_WRITES</code></td>
      <td scope="row" data-label="Default">true</td>
      <td scope="row" data-label="Notes">Whether to use separate queues for WAL writes and memtable writes.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_FILE_COMPACTION_TRIGGER</code></td>
      <td scope="row" data-label="Default">4</td>
      <td scope="row" data-label="Notes">The number of files needed to trigger level 0 compaction.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_JOBS_COUNT</code></td>
      <td scope="row" data-label="Default">Number of CPUs * 2</td>
      <td scope="row" data-label="Notes"><Since v="v2.0.3" /> The maximum number of threads to use for flushing and compaction.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_KEEP_LOG_FILE_NUM</code></td>
      <td scope="row" data-label="Default">10</td>
      <td scope="row" data-label="Notes">The maximum number of information log files to keep.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_MAX_CONCURRENT_SUBCOMPACTIONS</code></td>
      <td scope="row" data-label="Default">4</td>
      <td scope="row" data-label="Notes">The maximum number threads which will perform compactions.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_MAX_OPEN_FILES</code></td>
      <td scope="row" data-label="Default">1024</td>
      <td scope="row" data-label="Notes">The maximum number of open files which can be opened by RocksDB.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_MAX_WRITE_BUFFER_NUMBER</code></td>
      <td scope="row" data-label="Default">Dynamic from 2 to 32 depending on total system memory</td>
      <td scope="row" data-label="Notes">The maximum number of write buffers which can be used.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_MIN_BLOB_SIZE</code></td>
      <td scope="row" data-label="Default">4096</td>
      <td scope="row" data-label="Notes">The minimum size of a value for it to be stored in blob files.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_MIN_WRITE_BUFFER_NUMBER_TO_MERGE</code></td>
      <td scope="row" data-label="Default">2</td>
      <td scope="row" data-label="Notes">The minimum number of write buffers to merge before writing to disk.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_STORAGE_LOG_LEVEL</code></td>
      <td scope="row" data-label="Default">"warn"</td>
      <td scope="row" data-label="Notes">The information log level of the RocksDB library.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_TARGET_FILE_SIZE_BASE</code></td>
      <td scope="row" data-label="Default">64 MiB</td>
      <td scope="row" data-label="Notes">The target file size for compaction in bytes.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_TARGET_FILE_SIZE_MULTIPLIER</code></td>
      <td scope="row" data-label="Default">2</td>
      <td scope="row" data-label="Notes">The target file size multiplier for each compaction level.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_THREAD_COUNT</code></td>
      <td scope="row" data-label="Default">Number of CPUs on machine</td>
      <td scope="row" data-label="Notes">The number of threads to start for flushing and compaction.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_WAL_SIZE_LIMIT</code></td>
      <td scope="row" data-label="Default">0 MB</td>
      <td scope="row" data-label="Notes">The write-ahead-log size limit in MiB.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_ROCKSDB_WRITE_BUFFER_SIZE</code></td>
      <td scope="row" data-label="Default">Dynamic from 32 MiB to 128 MiB depending on total system memory</td>
      <td scope="row" data-label="Notes">The amount of data each write buffer can build up in memory.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_SYNC_DATA</code></td>
      <td scope="row" data-label="Default">false</td>
      <td scope="row" data-label="Notes">Controls the behaviour of RocksDB and SurrealKV. Allows data durability configuration, ensuring that the database can be configured for writes to be synced to disk before transactions are confirmed to be completed.</td>
    </tr>
  </tbody>
</table>

### SurrealKV environment variables

<table>
  <thead>
    <tr>
      <th scope="col" style={{width: '50%'}}>Environment variable</th>
      <th scope="col" style={{width: '20%'}}>Default value</th>
      <th scope="col" style={{width: '30%'}}>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_SURREALKV_MAX_SEGMENT_SIZE</code></td>
      <td scope="row" data-label="Default">512 MiB</td>
      <td scope="row" data-label="Notes">The maximum size of a single data file segment.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_SURREALKV_MAX_VALUE_CACHE_SIZE</code></td>
      <td scope="row" data-label="Default">Whichever is larger of "System total memory / 2 - 1GiB" and "16 MiB"</td>
      <td scope="row" data-label="Notes">The size of the in-memory value cache for SurrealKV.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_SURREALKV_MAX_VALUE_THRESHOLD</code></td>
      <td scope="row" data-label="Default">64</td>
      <td scope="row" data-label="Notes">The size in bytes to store values in the tree, or a separate log file.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_SYNC_DATA</code></td>
      <td scope="row" data-label="Default">false</td>
      <td scope="row" data-label="Notes">Controls the behaviour of RocksDB and SurrealKV. Allows data durability configuration, ensuring that the database can be configured for writes to be synced to disk before transactions are confirmed to be completed.</td>
    </tr>
  </tbody>
</table>

### TiKV environment variables

<table>
  <thead>
    <tr>
      <th scope="col" style={{width: '50%'}}>Environment variable</th>
      <th scope="col" style={{width: '20%'}}>Default value</th>
      <th scope="col" style={{width: '30%'}}>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_TIKV_API_VERSION</code></td>
      <td scope="row" data-label="Default">1</td>
      <td scope="row" data-label="Notes">Which TiKV cluster API version to use.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_TIKV_ASYNC_COMMIT</code></td>
      <td scope="row" data-label="Default">true</td>
      <td scope="row" data-label="Notes">Whether to use asynchronous transactions.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_TIKV_KEYSPACE</code></td>
      <td scope="row" data-label="Default">None</td>
      <td scope="row" data-label="Notes">A string specifying the keyspace identifier for data isolation.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_TIKV_GRPC_MAX_DECODING_MESSAGE_SIZE</code></td>
      <td scope="row" data-label="Default">4194304 (4 MiB)</td>
      <td scope="row" data-label="Notes"><Since v="v2.1.8" />Sets the maximum decoding size of a gRPC message.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_TIKV_ONE_PHASE_COMMIT</code></td>
      <td scope="row" data-label="Default">true</td>
      <td scope="row" data-label="Notes">Whether to use one-phase transaction commit.</td>
    </tr>
    <tr>
      <td scope="row" data-label="Env var"><code>SURREAL_TIKV_REQUEST_TIMEOUT</code></td>
      <td scope="row" data-label="Default">10</td>
      <td scope="row" data-label="Notes">The duration in seconds for requests before they time out.</td>
    </tr>
  </tbody>
</table>

## Command environment variables

Many of the arguments passed into [the CLI](/docs/surrealdb/cli/start) can be set using the above environment variables instead.

As each of these environment variables correspond to a flag passed into a command, it is good practice to put together a command that matches the environment variables you wish to set. Once the database server conforms to your expected behaviour, you can then pull out the values passed into each flag for your environment variables.

For example, take the following command to start the database.

```bash
surreal start --user root --pass secret --allow-net --deny-funcs "crypto::md5, http::post, http::delete"
```

If we now wanted to use environment variables instead of the `--allow-net` and `--deny-funcs` flags, we would use the `SURREAL_CAPS_ALLOW_NET` and `SURREAL_CAPS_DENY_FUNC` environment variables.

As the `--allow-net` flag was passed in without a following value, the same will be the case with the `SURREAL_CAPS_ALLOW_NET` environment variable, becoming `SURREAL_CAPS_ALLOW_NET=`. The `--deny-funcs` flag can also be used on its own to deny execution of all functions, but in this case is followed by a string to indicate which exact functions are not allowed to be executed. As such, the `SURREAL_CAPS_DENY_FUNC` environment variable must also be followed by a string, becoming `SURREAL_CAPS_DENY_FUNC="crypto::md5, http::post, http::delete"`.

The command would then look like the following:

<Tabs groupId="start-command">

<TabItem value="bash" label="Bash" >
```bash
SURREAL_CAPS_ALLOW_NET
SURREAL_CAPS_DENY_FUNC="crypto::md5, http::post, http::delete"
surreal start --user root --pass secret
```
</TabItem>

<TabItem value="powershell" label="PowerShell" >
```powershell
$env:SURREAL_CAPS_ALLOW_NET
$env:SURREAL_CAPS_DENY_FUNC="crypto::md5, http::post, http::delete"
surreal start --user root --pass secret
```
</TabItem>
</Tabs>

## Surreal Cloud environment variables

Instances on Surreal Cloud are not started with a CLI command or environment variables. Instead, they can be set on the [Configure Instance](/docs/cloud/advanced-topics/configure-an-instance) panel.

