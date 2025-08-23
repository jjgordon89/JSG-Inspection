---
sidebar_position: 1
sidebar_label: Reference guides
title: Reference guides
description: In this section, you will find reference guides for SurrealDB and its features.
---

# Reference Guides

In this section, you will find reference guides for SurrealDB and its features.

## Introduction

The purpose of this section is to help you connect the dots between different concepts explained in the documentation. 

It will help you understand how different features and concepts are related to each other and how you can use them together to build powerful applications.

If you are new to SurrealDB, we recommend that you start with the [Getting Started](/docs/surrealdb/introduction/start) section of the documentation or the [SurrealQL](/docs/surrealql).

This section will provide you with a solid foundation of the core concepts and features of SurrealDB.

## Reference Guides

Within this section, you will find a collection of "Reference" guides that cover a wide range of topics related to SurrealDB.

These guides will help you dig deeper into some of the core concepts and features of SurrealDB.

To get started, select a guide from the sidebar or use the search functionality to find a specific topic of interest.

-  [Full-Text Search](/docs/surrealdb/reference-guide/full-text-search)
-  [Graph Relations](/docs/surrealdb/reference-guide/graph-relations)
-  [Observability](/docs/surrealdb/reference-guide/observability)
-  [Security Best Practices](/docs/surrealdb/reference-guide/security-best-practices)
-  [Vector Search](/docs/surrealdb/reference-guide/vector-search)
-  [Performance Best Practices](/docs/surrealdb/reference-guide/performance-best-practices)


---
sidebar_position: 2
sidebar_label: Full Text Search
title: Full Text Search reference guide | Reference guides
description: SurrealDB offers a large variety of ways to work with text, including equality and contains operators, fuzzy searching, and full-text search.
---

# Full Text Search

SurrealDB offers a large variety of ways to work with text, from simple operators to fuzzy searching, customized ordering, full-text search and more. In this guide, we will cover comparing and sorting text, contains functions and operators, equality and fuzzy equality, regex matching, string functions, and full-text search. 

This will give you a comprehensive overview of the different ways to work with text in SurrealDB and which one to use in your specific use case.

## Comparing and sorting text

### In `SELECT` queries

The following example shows a few records created from an array of strings in an order that is sorted to the human eye: lowest to highest numbers, then A to Z.

```surql
FOR $word IN ['1', '2', '11', 'Ábaco', 'kitty', 'Zoo'] {
	CREATE data SET val = $word;
};
```

Inside a `SELECT` query, an `ORDER BY` clause can be used to order the output by one or more field names. For the above data, an ordered `SELECT` query looks like this.

```surql
SELECT VALUE val FROM data ORDER BY val;
```

However, in the case of strings, sorting is done by Unicode rank which often leads to output that seems out of order to the human eye. The output of the above query shows the following:

```surql title="Output"
[ '1', '11', '2', 'Zoo', 'kitty', 'Ábaco' ]
```

This is because:

* '11' is ordered before '2', because the first character in the string '2' is greater than the first character in the string '1'.
* 'Zoo' is ordered before 'kitty', because the first character in the string 'Zoo' is 'Z', number 0059 in the [list of Unicode characters](https://en.wikipedia.org/wiki/List_of_Unicode_characters#Basic_Latin). A lowercase 'k' is 0076 on the list and thus "greater", while the 'Á', registered as the "Latin Capital letter A with acute", is 0129 on the list.

To sort strings in a more natural manner to the human eye, the keywords [`NUMERIC` and `COLLATE` (or both) can be used](/docs/surrealql/statements/select#sort-records-using-the-order-by-clause). `NUMERIC` will instruct strings that parse into numbers to be treated as such.

```surql
SELECT VALUE val FROM data ORDER BY val NUMERIC;
```

```surql title="Numberic strings now sorted as numbers"
[ '1', '2', '11', 'Zoo', 'kitty', 'Ábaco' ]
```

`COLLATE` instructs unicode strings to sort by alphabetic order, rather than Unicode order.

```surql
SELECT VALUE val FROM data ORDER BY val COLLATE;
```

```surql title="Output"
[ '1', '11', '2', 'Ábaco', 'kitty', 'Zoo' ]
```

And for the data in this example, `COLLATE NUMERIC` is likely what will be desired.

```surql
SELECT VALUE val FROM data ORDER BY val COLLATE NUMERIC;
```

```surql title="Output"
[ '1', '2', '11', 'Ábaco', 'kitty', 'Zoo' ]
```

### Sorting functions

As of SurrealDB `2.2.2`, the functions [`array::sort_natural()`, `array::sort_lexical()`, and `array::sort_lexical_natural()`](/docs/surrealql/functions/database/array) can be used on ad-hoc data to return the same output as the `COLLATE` and `NUMERIC` clauses in a [`SELECT` statement](/docs/surrealql/statements/select).

## Contains functions and operators

The most basic way to see if one string is contained inside another is to use the `IN` operator, or the [`string::contains()` function](/docs/surrealql/functions/database/string#stringcontains).

```surql
-- false
"Umple" IN "Rumplestiltskin";
string::contains("Rumplestiltskin", "Umple");
-- Same function using method syntax
"Rumplestiltskin".contains("Umple");

-- true
"umple" IN "Rumplestiltskin";
string::contains("Rumplestiltskin", "umple");
"Rumplestiltskin".contains("umple");
```

SurrealDB has a number of [operators](/docs/surrealql/operators) to determine if all or some of the values of one array are contained in another, such as `CONTAINSALL` and `CONTAINSANY`, or `ALLINSIDE` and `ANYINSIDE`. The operators with `CONTAINS` and `INSIDE` perform the same behaviour, just in the opposite order.

```surql
-- If 1,2,3 contains each item in 1,2...
[1,2,3] CONTAINSALL [1,2];
-- then each item in 1,2 is inside 1,2,3
[1,2] ALLINSIDE [1,2,3];
```

Because strings are essentially arrays of characters, these operators work with strings as well. 

> [!NOTE]
> The above capability was added in SurrealDB version `2.2.2`.

Both of these queries will return `true`.

```surql
"Rumplestiltskin" CONTAINSALL ["umple", "kin"];
"kin" ALLINSIDE "Rumplestiltskin";
["kin", "someotherstring"] ANYINSIDE "Rumplestiltskin";
```

## Equality and fuzzy equality

While strings can be compared for strict equality in the same way as with other values, fuzzy searching can also be used to return `true` if two strings are approximately equal. The fuzzy operators are:

* `~` to check if two strings have fuzzy equality
* `!~` to check if two strings do not have fuzzy equality
* `?~` to check if any strings have fuzzy equality
* `*~` to check if all strings have fuzzy equality

All of the following will return true.

```surql
"big" ~ "Big";
"big" !~ "small";
["Big", "small"] ?~ "big";
["Big", "big"] *~ "big";
```

Fuzzy matching is based on [the Smith-Waterman algorithm](https://en.wikipedia.org/wiki/Smith%E2%80%93Waterman_algorithm) that requires some time to understand. It is a convenient option due to the `~` operator, but can sometimes produce surprising results.

```surql
 -- true
"United Kingdom" ~ "United kingdom";
-- true (second string entirely contained in first)
"United Kingdom" ~ "ited";
-- Also true!
"United Kingdom" ~ "i";
-- false
"United Kingdom" ~ "United Kingdóm";
```

The [`string::similarity::fuzzy` function](/docs/surrealql/functions/database/string#stringsimilarityfuzzy) can be useful in this case, as it returns a number showing the similarity between strings, not just whether they count as a fuzzy match. In the following example, while the strings `ited` and `i` do have a similarity score above 0, they are ranked much lower than the better matches `United kingdom` and `United Kingdom`.

```surql
SELECT 
    $this AS word, 
    string::similarity::fuzzy("United Kingdom", $this) AS similarity
FROM ["United Kingdom", "United kingdom", "ited", "United Kingdóm", "i"]
ORDER BY similarity DESC;
```

```surql title="Output"
[
	{
		similarity: 295,
		word: 'United Kingdom'
	},
	{
		similarity: 293,
		word: 'United kingdom'
	},
	{
		similarity: 75,
		word: 'ited'
	},
	{
		similarity: 15,
		word: 'i'
	},
	{
		similarity: 0,
		word: 'United Kingdóm'
	}
]
```

### Other similarity and distance functions

SurrealDB offers quite a few other algorithms inside the [string functions module](/docs/surrealql/functions/database/string) for distance or similarity comparison. They are:

* `string::distance::damerau_levenshtein()`
* `string::distance::normalized_damerau_levenshtein()`
* `string::distance::hamming()`
* `string::distance::levenshtein()`
* `string::distance::normalized_levenshtein()`
* `string::distance::osa_distance()`

* `string::similarity::jaro()`
* `string::similarity::jaro_winkler()`

Which of these functions to choose depends on your personal use case.

For example, fuzzy similarity and distance scores are not a measure of absolute equality and ordered similarity scores should only be used in comparisons against the same string. Take the following queries for example which return the score for the string "United" and "Unite":

```surql
-- return 131 and 111
string::similarity::fuzzy("United Kingdom", "United");
string::similarity::fuzzy("United Kingdom", "Unite");

-- also return 131 and 111
string::similarity::fuzzy("United", "United");
string::similarity::fuzzy("United", "Unite");
```

While the word "Unite" is clearly closer to the word "United" than it is to "United Kingdom", the algorithm used for this function only considers how much of the second string is found in the first string.

However, the `string::similarity::jaro()` function returns an output that approaches 1 if two strings are equal, making it a more apt solution when the first and second string may be entirely different. Using the same input strings as above shows that "Unite" is clearly the most similar of the strings that are not outright equal to "United".

```surql
-- 0.8095238095238096f
string::similarity::jaro("United Kingdom", "United");
-- 0.7857142857142857f
string::similarity::jaro("United Kingdom", "Unite");
-- 1
string::similarity::jaro("United", "United");
-- 0.9444444444444445f
string::similarity::jaro("United", "Unite");
```

Another example of the large difference between algorithms is the Hamming distance algorithm, which only compares strings of equal length.

```surql
-- Error: strings have different length
string::distance::hamming("United Kingdom", "United");
-- Returns 0
string::distance::hamming("United", "United");
-- Returns 1
string::distance::hamming("United", "Unitéd");
-- Returns 6
string::distance::hamming("United", "uNITED");
```

## Regex matching

The `string::matches()` function can be used to perform regex matching on a string.

```surql
-- true
string::matches("Cat", "[HC]at");
-- Also true
string::matches("Hat", "[HC]at");
```

## Other string functions

SurrealDB has a large number of [string functions](/docs/surrealql/functions/database/string) that can be used manually to refine string searching, such as `string::lowercase()`, `string::starts_with()`, and `string::ends_with()`.

```surql
SELECT 
    $this AS word, 
    $this.lowercase() = "sleek" AS is_sleek
FROM ["sleek", "SLEEK", "Sleek", "sleeek"];
```

```surql title="Output"
[
	{
		is_sleek: true,
		word: 'sleek'
	},
	{
		is_sleek: true,
		word: 'SLEEK'
	},
	{
		is_sleek: true,
		word: 'Sleek'
	},
	{
		is_sleek: false,
		word: 'sleeek'
	}
]
```

For more customized text searching, full-text search can be used.

## Full-text search

Full-Text search supports text matching, proximity searches, result ranking, and keyword highlighting, making it a much more comprehensive solution when precise text searching is required.

It is also [ACID-compliant](https://en.wikipedia.org/wiki/ACID), which ensures data integrity and reliability.

### Defining an analyzer

The first step to using full-text search is to [define an analyzer](/docs/surrealql/statements/define/analyzer) using a `DEFINE ANALYZER` statement. An analyzer is not defined on a table, but a set of tokenizers (to break up text) and filters (to modify text).

The `DEFINE ANALYZER` page contains a detailed explanation of each type of tokenizer and analyzer to choose from. To define the analyzer that most suits your needs, it is recommended to use the [`search::analyze`](/docs/surrealql/functions/database/search#searchanalyze) function which returns the output of an analyzer for an input string.

Take the following analyzer for example, which uses `blank` to split a string by whitespace, and `edgengram(3, 10)` to output all of the instances of the first three to ten letters of a word.

```surql
DEFINE ANALYZER blank_edgengram TOKENIZERS blank FILTERS edgengram(3, 10);
search::analyze("blank_edgengram", "The Wheel of Time turns, and Ages come and pass, leaving memories that become legend.");
```

The output includes strings like 'turns,' and 'legend.', which include punctuation marks.

```surql title="Output"
['The', 'Whe', 'Whee', 'Wheel', 'Tim', 'Time', 'tur', 'turn', 'turns', 'turns,', 'and', 'Age', 'Ages', 'com', 'come', 'and', 'pas', 'pass', 'pass,', 'lea', 'leav', 'leavi', 'leavin', 'leaving', 'mem', 'memo', 'memor', 'memori', 'memorie', 'memories', 'tha', 'that', 'bec', 'beco', 'becom', 'become', 'leg', 'lege', 'legen', 'legend', 'legend.']
```

If this is not desired, some looking through the `DEFINE ANALYZER` page will turn up another tokenizer called `punct` that can be included, now creating an analyzer that splits on whitespace as well as punctuation.

```surql
DEFINE ANALYZER blank_edgengram TOKENIZERS blank, punct FILTERS edgengram(3, 10);
search::analyze("blank_edgengram", "The Wheel of Time turns, and Ages come and pass, leaving memories that become legend.");
```

```surql title="Output"
['The', 'Whe', 'Whee', 'Wheel', 'Tim', 'Time', 'tur', 'turn', 'turns', 'and', 'Age', 'Ages', 'com', 'come', 'and', 'pas', 'pass', 'lea', 'leav', 'leavi', 'leavin', 'leaving', 'mem', 'memo', 'memor', 'memori', 'memorie', 'memories', 'tha', 'that', 'bec', 'beco', 'becom', 'become', 'leg', 'lege', 'legen', 'legend']
```

#### Tokenizers and filters

The available tokenizers and filters are as follows:

* Tokenizers `blank`, `camel`, `punct` to split by whitespace, camelcase, and punctuation. The `class` tokenizer splits when a class change is detected, such as letter to number, space to letter, punctuation to letter, and so on.
* Filters `ascii`, `lowercase`, `uppercase` to change to ASCII, lowercase, and uppercase.

The `ngram` filter is similar to the `edgengram` filter above in that it takes a minimum and maximum length, but instead moves from character to character inside a string as it attempts to find all the possible outputs in between these two lengths.

```surql
DEFINE ANALYZER example_analyzer FILTERS ngram(1,4);
search::analyze("example_analyzer", "cars!");
```

Here is the output modified slightly to show the output of the `ngram` filter at each step of the way.

```surql title="Output"
[
	'c', 'ca', 'car', 'cars',
	'a', 'ar', 'ars', 'ars!',
	'r', 'rs', 'rs!',
	's', 's!',
	'!'
]
```

The `snowball` and `mapper` filters are the most complex and versatile.

#### The `snowball` filter

The snowball filter is used to perform stemming: the reduction of a word to as basic and universal a form as possible. It is available for the languages Arabic, Danish, Dutch, English, Finnish, French, German, Greek, Hungarian, Italian, Norwegian, Portuguese, Romanian, Russian, Spanish, Swedish, Tamil, and Turkish.

Stemming involves using an algorithm to reduce a word, but is unable to incorporate complex changes like the plural and verbal vowel changes in English.

```surql
DEFINE ANALYZER snowball_test TOKENIZERS blank,punct FILTERS snowball(english);
search::analyze("snowball_test", "
    manager managing management
    running ran 
    foot feet
    introspective
    introspection
    introspected
");
```

```surql title="Output"
[
	'manag',
	'manag',
	'manag',
	'run',
	'ran',
	'foot',
	'feet',
	'introspect',
	'introspect',
	'introspect'
]
```

Stemming is particularly useful in languages with complex but regular declension, such as Finnish. In the following example, the snowball filter is able to turn all declined forms of the word "talo" (house) into its root form.

```surql
DEFINE ANALYZER snowball_test TOKENIZERS blank,punct FILTERS snowball(finnish);
search::analyze("snowball_test", "talo talon taloa talossa talostani taloonsa talolla talolta talolle talona taloksi taloin talotta taloineen");
```

```surql title="Output"
['talo', 'talo', 'talo', 'talo', 'talo', 'talo', 'talo', 'talo', 'talo', 'talo', 'talo', 'talo', 'talot', 'talo']
```

#### The `mapper` filter

The `mapper` filter is the most customizable of all, involving a list of strings and the strings they are to be mapped to. This filter requires a path to a text file, inside which each base form is followed by a word to map to it, separated by a tab.

```text title="mapper.txt"
run	ran
foot	feet
```

In the case of the above example, the `mapper` will allow the output to show the base forms of the words "ran" and "feet".

```surql
DEFINE ANALYZER mapper TOKENIZERS blank FILTERS snowball(english),mapper('mapper.txt');
search::analyze("mapper", "
    manager managing management
    running ran 
    foot feet
    introspective
    introspection
    introspected
");
```

```surql
[
	'manag',
	'manag',
	'manag',
	'run',
	'run',
	'foot',
	'foot',
	'introspect',
	'introspect',
	'introspect'
]
```

The word `mapper` was intentionally chosen to be ambiguous, as this feature can be used to map any string to another string. It could be used for example to map cities to provinces, planets to stars, hieroglyphs to English words, and so on.

```text title="mapper.txt"
seated_man	𓀀
man_with_hand_to_mouth	𓀁
seated_woman	𓁐
goddess_with_feather	𓁦
```

```surql
DEFINE ANALYZER mapper TOKENIZERS blank FILTERS mapper('mapper.txt');
search::analyze("mapper", "𓀀 𓁦");
```

```surql title="Output"
[
	'seated_man',
	'goddess_with_feather'
]
```

### Defining a Full-Text index

Once a search analyzer is defined, it can be applied to the fields of a table to make them searchable by [defining an index](/docs/surrealql/statements/define/indexes#full-text-search-index) that uses the `SEARCH ANALYZER` clause. Having a full-text index in place makes it possible to use the `@@` operator (the `MATCHES` operator).

```surql
DEFINE ANALYZER my_analyzer
  TOKENIZERS class
  FILTERS lowercase, ascii;

DEFINE INDEX body_index ON TABLE article FIELDS body SEARCH ANALYZER my_analyzer;
DEFINE INDEX title_index ON TABLE article FIELDS title SEARCH ANALYZER my_analyzer;

CREATE article SET title = "Machine Learning!", body = "Machine learning, or ML, is all the rage these days. Developers are...";
CREATE article SET title = "History of machines", body = "The earliest 'machine' used by our ancestors was a simple sharpened stone tool. It was...";

SELECT body, title FROM article WHERE body @@ "machine" OR title @@ "machine";
```

```surql title="Output"
[
	{
		body: 'Machine learning, or ML, is all the rage these days. Developers are...',
		title: 'Machine Learning!'
	},
	{
		body: "The earliest 'machine' used by our ancestors was a simple sharpened stone tool. It was...",
		title: 'History of machines'
	}
]
```

To use highlighting and best match scoring on searches, the `BM25` and `HIGHLIGHTS` clauses can be added to the `DEFINE INDEX` statement. These enable you use the [`search::highlight`](/docs/surrealql/functions/database/search#searchhighlight) and [`search::score`](/docs/surrealql/functions/database/search#searchscore) functions.

Inside a query, the `@@` operator takes a number that is matched with the same number passed into one of these functions. In the example below, the `WHERE text @0@ "night"` part of the query will match with `search::highlight("->", "<-", 0)` and `search::score(0) AS text_score`, while `title @1@ "hound"` will match with `search::score(1) AS title_score`.

```surql
DEFINE ANALYZER my_analyzer TOKENIZERS class, blank FILTERS lowercase, ascii;
DEFINE INDEX text_index ON TABLE article FIELDS text SEARCH ANALYZER my_analyzer BM25 HIGHLIGHTS;
DEFINE INDEX title_index ON TABLE article FIELDS title SEARCH ANALYZER my_analyzer BM25 HIGHLIGHTS;

INSERT INTO article (title, text) VALUES
    ("A Study in Scarlet", "IN the year 1878 I took my degree of Doctor of Medicine of the University of London, and proceeded to Netley to go through the course prescribed for surgeons in the army."),
    ("A Study in Scarlet", "Having completed my studies there, I was duly attached to the Fifth Northumberland Fusiliers as Assistant Surgeon."),
    ("The Sign of the Four", "SHERLOCK HOLMES took his bottle from the corner of the mantel-piece and his hypodermic syringe from its neat morocco case."),
    ("The Hound of the Baskervilles", "MR. SHERLOCK HOLMES, who was usually very late in the mornings, save upon those not infrequent occasions when he was up all night, was seated at the breakfast table."),
    ("The Hound of the Baskervilles", "I stood upon the hearth-rug and picked up the stick which our visitor had left behind him the night before.");

SELECT
    text,
    title,
    search::highlight("->", "<-", 0) AS title,
    search::score(0) AS text_score,
    search::score(1) AS title_score
FROM article
WHERE
    text  @0@ "night" OR
    title @1@ "hound";
```

```surql title="Output"
[
	{
		text: 'MR. SHERLOCK HOLMES, who was usually very late in the mornings, save upon those not infrequent occasions when he was up all night, was seated at the breakfast table.',
		text_score: 0.30209195613861084f,
		title: 'MR. SHERLOCK HOLMES, who was usually very late in the mornings, save upon those not infrequent occasions when he was up all ->night<-, was seated at the breakfast table.',
		title_score: 0.32491400837898254f
	},
	{
		text: 'I stood upon the hearth-rug and picked up the stick which our visitor had left behind him the night before.',
		text_score: 0.35619309544563293f,
		title: 'I stood upon the hearth-rug and picked up the stick which our visitor had left behind him the ->night<- before.',
		title_score: 0.32491400837898254f
	}
]
```

## See also

* [Using SurrealDB as a Full Text Search Database](/docs/surrealdb/models/full-text-search)
* [SurrealDB search functions](/docs/surrealql/functions/database/search)
* [SurrealDB operators](/docs/surrealql/operators)
* Blog post: [Create a Search Engine with SurrealDB Full-Text Search
](/blog/create-a-search-engine-with-surrealdb-full-text-search)

---
sidebar_position: 2
sidebar_label: Graph Relations
title: Graph relations | Reference guides
description: This guide outlines when and when not to use graph relations, and some tips and recommended patterns for using and understanding them in practice.
---

# Graph relations

In SurrealDB, one record can be linked to another via a graph edge, namely a table that stands in between the two that has its own ID and properties. This page teaches how to determine whether this is the ideal way to link records in your project, and best practices for doing so.

## When to use graph relations

The first item to take into account when using graph relations is whether they are the right solution in the first place, because graph edges are not the only way to link one record to another.

SurrealDB has two main ways to create relations between one record and another: record links, and graph relations.

A record link is a simple pointer from one record to another, a link that exists any time a record holds the record ID of another record. Record links are extremely efficient because record IDs are direct pointers to the data of a record, and do not require a table scan.

Take the following example that creates one `user` who has written two `comment`s.

```surql
LET $new_user = CREATE ONLY user SET name = "User McUserson";
-- Create a new comment, use the output to update the user
UPDATE $new_user SET comments += (CREATE ONLY comment SET 
    text = "I learned something new!", 
    created_at = time::now())
    .id;
UPDATE $new_user SET comments += (CREATE ONLY comment SET
    text = "I don't get it, can you explain?",
    created_at = time::now())
    .id;
```

Querying a record link is easy as the link by default is unidirectional with nothing in between. In this case, the linked comments are simply a field on a `user` record and accessing them is as simple as any other field on a `user` record.

```surql
SELECT 
    name, 
    comments.{ created_at, text }
FROM user;
```

```surql title="Output"
[
	{
		comments: [
			{
				created_at: d'2024-12-12T02:39:07.644Z',
				text: 'I learned something new!'
			},
			{
				created_at: d'2024-12-12T02:39:07.645Z',
				text: "I don't get it, can you explain?"
			}
		],
		name: 'User McUserson'
	}
]
```

Until SurrealDB version 2.2.0, record links were strictly unidirectional. The only way to query in the other direction was by using a subquery, which made graph edges the only easy option for bidirectional links.

```surql
SELECT 
    *,
    -- Check the `user` table's `comments` field
    -- for the id of the current comment
    (SELECT id, name FROM user WHERE $parent.id IN comments) AS author
FROM comment;

-- Equivalent graph query is much easier
-- to read and write
SELECT 
	*,
	<-wrote<-author
FROM comment;
```

```surql
[
	{
		author: [
			{
				id: user:f3t90z8uvns76sr3nxrd,
				name: 'User McUserson'
			}
		],
		created_at: d'2024-12-12T02:39:07.645Z',
		id: comment:gj1vtsd9d19z9afrc14j,
		text: "I don't get it, can you explain?"
	},
	{
		author: [
			{
				id: user:f3t90z8uvns76sr3nxrd,
				name: 'User McUserson'
			}
		],
		created_at: d'2024-12-12T02:39:07.644Z',
		id: comment:zhnbfopxspekknsi6vx6,
		text: 'I learned something new!'
	}
]
```

Since version 2.2.0, a record link can be bidirectional by [defining a field](/docs/surrealql/statements/define/field) with the `REFERENCE` clause, allowing referenced records to define a field or use the `.refs()` method to track incoming references.

```surql
DEFINE FIELD comments ON user TYPE option<array<record<comment>>> REFERENCE;
DEFINE FIELD author ON comment TYPE references;

LET $new_user = CREATE ONLY user SET name = "User McUserson";
-- Create a new comment, use the output to update the user
UPDATE $new_user SET comments += (CREATE ONLY comment:one SET 
    text = "I learned something new!", 
    created_at = time::now())
    .id;
UPDATE $new_user SET comments += (CREATE ONLY comment:two SET
    text = "I don't get it, can you explain?",
    created_at = time::now())
    .id;

-- 'author' field is populated with the 'user' who wrote the comment
SELECT * FROM ONLY comment:one;
-- Or use .refs() to grab the references
comment:one.refs();
```

```surql title="Output"
-------- Query --------

{
	author: [
		user:ie8yc8woe0rwo5cgln57
	],
	created_at: d'2024-12-31T04:51:47.504Z',
	id: comment:one,
	text: 'I learned something new!'
}

-------- Query --------

[
	user:ie8yc8woe0rwo5cgln57
]
```

If your use case involves bidirectional links, consider the following items to make a decision.

Record links are preferred if:

* Performance is of the utmost importance.
* You don't need to put complex queries together.
* You want to specify in the schema what behaviour should take place when a linked record is deleted (cascade delete, refuse to delete, ignore, etc.).

Graph links are preferred if:

* You want to quickly create links without touching the database schema, or among multiple record types. For example, a single `RELATE person:one->wrote->[blog:one, book:one, comment:one]` is enough to create links between a `person` and three other record types, whereas using record links may be a more involved process involving several `DEFINE FIELD` statements.
* You want to put together complex queries that take advantage of SurrealQL's expressive arrow syntax, like `->wrote->comment<-wrote<-person->wrote->comment FROM person`.
* You want to visualize your schema using Surrealist's designer view.

Finally, graph links are not just preferred but almost certainly necessary if you need to keep metadata about the context in which a link is created. Take the following metadata for the examples above involving a user and its comments which contains information about a user's current location, operating system, and mood. Where does this data belong?

```surql
{
    location: "Arizona",
    os: "Windows 11",
    current_mood: "Happy"
}
```

This metadata isn't information about the user as a whole, nor the comment itself. It's information about the moment in time in which the `user` and `comment` were linked, and thus is best stored in a separate table.

Or you might have some information about the link itself, which would also belong nowhere else but inside a graph table.

```surql
{
	friends_since: d'2024-12-31T06:43:21.981Z',
	friendship_strength: 0.4
}
```

Graph links also excel when it comes to weighting relations. This can be done through a field on the graph table...

```surql
-- Create 4 'npc' records
CREATE |npc:1..4|;

FOR $npc IN SELECT * FROM npc {
    -- Give each npc 20 random interactions
    FOR $_ IN 0..20 {
      -- Looks for a random NPC, use array::complement to filter out self
      LET $counterpart = rand::enum(array::complement((SELECT * FROM npc), [$npc]));
      -- See if they have a relation yet
      LET $existing = SELECT * FROM knows WHERE in = $npc.id AND out = $counterpart.id;
      -- If relation exists, increase 'greeted' by one
      IF !!$existing {
        UPDATE $existing SET greeted += 1;
      -- Otherwise create the relation and set 'greeted' to 1
      } ELSE {
        RELATE $npc->knows->$counterpart SET greeted = 1;
      }  
    };
};

SELECT 
	id, 
	->knows.{ like_strength: greeted, with: out } AS relations
	FROM npc;
```

```surql title="Which NPC each NPC likes the most"
[
	{
		id: npc:1,
		relations: [
			{
				like_strength: 8,
				with: npc:3
			},
			{
				like_strength: 8,
				with: npc:4
			},
			{
				like_strength: 4,
				with: npc:2
			}
		]
	},
	{
		id: npc:2,
		relations: [
			{
				like_strength: 10,
				with: npc:1
			},
			{
				like_strength: 4,
				with: npc:3
			},
			{
				like_strength: 6,
				with: npc:4
			}
		]
	},
	{
		id: npc:3,
		relations: [
			{
				like_strength: 6,
				with: npc:2
			},
			{
				like_strength: 3,
				with: npc:4
			},
			{
				like_strength: 11,
				with: npc:1
			}
		]
	},
	{
		id: npc:4,
		relations: [
			{
				like_strength: 7,
				with: npc:1
			},
			{
				like_strength: 6,
				with: npc:3
			},
			{
				like_strength: 7,
				with: npc:2
			}
		]
	}
]
```

...or through counting the number of edges.

```surql
-- Create 4 'npc' records
CREATE |npc:1..4|;

FOR $npc IN SELECT * FROM npc {
    -- Give each npc 20 random interactions
    FOR $_ IN 0..20 {
      -- Looks for a random NPC, use array::complement to filter out self
      LET $counterpart = rand::enum(array::complement((SELECT * FROM npc), [$npc]));
      RELATE $npc->greeted->$counterpart;
    };
};

SELECT 
	count() AS like_strength, 
	in AS npc, 
	out AS counterpart
FROM greeted
GROUP BY npc, counterpart;
```

```surql title="Which NPC each NPC likes the most"
[
	{
		counterpart: npc:2,
		like_strength: 6,
		npc: npc:1
	},
	{
		counterpart: npc:3,
		like_strength: 9,
		npc: npc:1
	},
	{
		counterpart: npc:4,
		like_strength: 5,
		npc: npc:1
	},
	{
		counterpart: npc:1,
		like_strength: 9,
		npc: npc:2
	},
	{
		counterpart: npc:3,
		like_strength: 6,
		npc: npc:2
	},
	{
		counterpart: npc:4,
		like_strength: 5,
		npc: npc:2
	},
	{
		counterpart: npc:1,
		like_strength: 10,
		npc: npc:3
	},
	{
		counterpart: npc:2,
		like_strength: 7,
		npc: npc:3
	},
	{
		counterpart: npc:4,
		like_strength: 3,
		npc: npc:3
	},
	{
		counterpart: npc:1,
		like_strength: 6,
		npc: npc:4
	},
	{
		counterpart: npc:2,
		like_strength: 4,
		npc: npc:4
	},
	{
		counterpart: npc:3,
		like_strength: 10,
		npc: npc:4
	}
]
```

If this sort of metadata or weighting is necessary, then a graph table is the ideal solution.

## Creating a graph relation

The following example is similar to the one above, except that this time the `user` record does not have a `comments` field, leaving it seemingly separate from the `comment` created on the next line. Instead, this time a `RELATE` statement is used to create a graph edge called `wrote` joining the two of them, and this is the table that holds the metadata mentioned above.

```surql
LET $new_user = CREATE ONLY user SET name = "User McUserson";
LET $new_comment = CREATE ONLY comment SET 
    text = "I learned something new!", 
    created_at = time::now();

RELATE $new_user->wrote->$new_comment SET
	location = "Arizona",
	os = "Windows 11",
	mood = "happy";
```

Now that a graph edge has been established, the arrow operator can be used to traverse this path. The versatility of this operator is one of the key advantages of using graph edges, as they can be traversed forward, backward, recursively, and more.

```surql
-- Go through each user and find comment(s) it wrote
SELECT ->wrote->comment FROM user;
-- Go through each comment and find the user(s) that wrote it
SELECT <-wrote<-user FROM comment;
-- Go through each comment, find the user(s) that wrote it,
-- and then find all of their comments
SELECT <-wrote<-user->wrote->comment FROM comment;
```

## Other sources on querying graph relations

The arrow operator used to traverse graph edges is an intuitive way to visualize the direction(s) in which a query is traversing. As this page is devoted to an overview of when and how best to use graph relations, it does not go into the details of queries themselves. Many reference pages already exist in the SurrealDB documentation to learn this, including:

* The [`RELATE` statement](/docs/surrealql/statements/relate#querying-graphs)
* The [page on idioms](/docs/surrealql/datamodel/idioms)
* The [SurrealDB Fundamentals course](/learn/fundamentals)
* [Aeon's Surreal Renaissance](/learn/book), chapters 5 to 8 in particular

## Tips and best practices with graph relations

The following sections detail some tips and best practices when using graph relations.

### Define a table as a relation for better type safety and visual output

Defining a table as `TYPE RELATION` ensures that it can only be created in the context of a relation between two records.

Adding `TYPE RELATION` to a `DEFINE TABLE` statement is enough to ensure this behaviour.

```surql
DEFINE TABLE likes TYPE RELATION;
```

Specifying the record types at the `in` and `out` fields of a graph table will ensure that no other records can be joined to each other in this way.

```surql
DEFINE TABLE likes TYPE RELATION IN person OUT blog_post | book;
```

One other advantage to strictly defining a relation table is that this information can be picked up by [Surrealist](/docs/surrealist) to be displayed in its Designer view.

Take the following queries that create some records and relate them to each other.

```surql
CREATE person:one, book:one, blog_post:one;
RELATE person:one->likes->book:one;
RELATE person:one->likes->blog_post:one;
```

As the `likes` table is not yet defined as a relation, Surrealist is unable to determine anything about the table besides the fact that it exists, leading to the following view.

![alt text](schema1.png)

Defining the table as a `TYPE RELATION` will improve the layout somewhat by making it clear that `likes` is a graph table.

```surql
DEFINE TABLE likes TYPE RELATION;
CREATE person:one, book:one, blog_post:one;
RELATE person:one->likes->book:one;
RELATE person:one->likes->blog_post:one;
```

![alt text](schema2.png)

If the `in` and `out` fields are specified, however, Surrealist will now be able to graphically display the relation between all these records through the `likes` table.

```surql
DEFINE TABLE likes 
	TYPE RELATION
	IN person 
	OUT blog_post | book;
CREATE person:one, book:one, blog_post:one;
RELATE person:one->likes->book:one;
RELATE person:one->likes->blog_post:one;
```

![alt text](schema3.png)

### Create a unique index if the graph relation is between equals

While most examples involve a clear subject and object relation, sometimes a graph edge represents a relation such as friendship, a partnership, sister cities, etc. in which this is not clear.

```surql
CREATE person:one, person:two;

-- Relate them like this?
RELATE person:one->friends_with->person:two;
-- Or like this?
RELATE person:two->friends_with->person:one;
```

To ensure that this relation cannot be established more than once, define a field made of the sorted `in` and `out` fields of the graph table, and define an index on it with a unique constraint.

```surql
DEFINE FIELD key ON TABLE friends_with VALUE <string>array::sort([in, out]);
DEFINE INDEX only_one_friendship ON TABLE friends_with FIELDS key UNIQUE;
```

With this constraint in place, no second `friends_with` can be initiated from the other side.

```surql
CREATE person:one, person:two;
RELATE person:one->friends_with->person:two;
RELATE person:two->friends_with->person:one;
```

```surql title="Output of RELATE statements"
-------- Query --------

[
	{
		id: friends_with:dblidwpc44qqz5bvioiu,
		in: person:one,
		key: '[person:one, person:two]',
		out: person:two
	}
]

-------- Query --------

"Database index `only_one_friendship` already contains '[person:one, person:two]',
with record `friends_with:dblidwpc44qqz5bvioiu`"
```

### Querying a graph relation between equals

In a relation between equals like in the example above, it is never certain whether a specific `person` is friends with another due to a `RELATE` statement where it is the subject of the statement, or the object of the statement.

The `<->` operator can be used in this case to traverse both the `in` and `out` fields of the `friends_with` table.

```surql
SELECT *, <->friends_with<->person AS friends FROM person;
```

This will now show each of the records involved in the relation, regardless of whether they are located at the `in` or `out` field of the `friends_with` graph table.

```surql
[
	{
		friends: [
			person:one,
			person:two
		],
		id: person:one
	},
	{
		friends: [
			person:one,
			person:two
		],
		id: person:two
	}
]
```

To complete this query to ensure that a record's own ID does not show up inside the list of `friends`, the [`array::complement()`](/docs/surrealql/functions/database/array#arraycomplement) function can be used.

```surql
SELECT *, array::complement(<->friends_with<->person, [id]) AS friends FROM person;
```

```surql title="Output"
[
	{
		friends: [
			person:two
		],
		id: person:one
	},
	{
		friends: [
			person:one
		],
		id: person:two
	}
]
```

For further details on this pattern, see [this section](/docs/surrealql/statements/relate#bidirectional-relation-querying) in the page on the `RELATE` statement and [this section](/learn/book/chapter-07#bidirectional-querying-when-a-relationship-is-equal) of Chapter 7 of Aeon's Surreal Renaissance.

### Traverse directly from a record instead of using SELECT

As graph traversal takes place between records, the same syntax can be used directly from one or more record IDs without needing to use a `SELECT` statement. Take the following setup that once again creates a record linked to a comment:

```surql
CREATE ONLY user:mcuserson SET name = "User McUserson";
CREATE ONLY comment:one SET 
    text = "I learned something new!", 
    created_at = time::now();
CREATE ONLY cat:pumpkin SET name = "Pumpkin";

RELATE user:mcuserson->wrote->comment:one SET
	location = "Arizona",
	os = "Windows 11",
	mood = "happy";

RELATE user:mcuserson->likes->cat:pumpkin;
```

These graph edges can be traversed simply using the record name and the arrow syntax.

```surql
-- Equivalent to:
-- SELECT VALUE <-wrote<-user FROM ONLY comment:one;
comment:one<-wrote<-user;

-- Equivalent to:
-- SELECT VALUE ->likes->cat FROM ONLY user:mcuserson;
user:mcuserson->likes->cat;
```

```surql title="Output"
-------- Query --------

[
	user:mcuserson
]

-------- Query --------

[
	cat:pumpkin
]
```

To include various fields in a query that begins from a record ID, the destructuring operator can be used.

```surql
-- Equivalent to:
-- SELECT name, ->likes->cat AS cats FROM ONLY user:mcuserson;
user:mcuserson.{ name, cats: ->likes->cat };
```

### Graph paths in schemas

While most examples in the documentation show how to traverse graph paths inside a `SELECT` statement, they can just as easily be defined as a field on a table.

```surql
DEFINE FIELD employers ON TABLE person VALUE SELECT VALUE <-employs<-company FROM ONLY $this;

CREATE person:1, person:2, company:1;
RELATE company:1->employs->person:1;
person:1.*;
```

However, note that the output of the query above shows an empty array for the `employers` field, as it was calculated at the point that `person:1` was created, not when the `RELATE` statement was executed. The `VALUE` clause will only recalculate if a record is updated.

```surql
UPDATE person:1;
```

```surql title="Output"
[
	{
		employers: [
			company:1
		],
		id: person:1
	}
]
```

A [`future`](/docs/surrealql/datamodel/futures) makes more sense in this case, as a future is calculated each time a record is queried, not just whenever it is created or updated.

```surql
DEFINE FIELD employers ON TABLE person VALUE <future> { RETURN SELECT VALUE <-employs<-company FROM ONLY $this };

CREATE person:1, person:2, company:1;
RELATE company:1->employs->person:1;
person:1.*;
```

```surql title="Output"
{
	employers: [
		company:1
	],
	id: person:1
}
```

### Using Surrealist to understand graph edges

Surrealist has an [Explorer view](/docs/surrealist/concepts/explore-database-records) that allows users to not just view records and their fields, but also traverse their relations one step at a time. This can be an effective tool to understand the internals of graph edges and queries on them.

Take the following example similar to the ones above, except that the `user` this time has two graph relations instead of one.

```surql
CREATE user:mcuserson SET name = "User McUserson";
CREATE comment:one SET 
    text = "I learned something new!", 
    created_at = time::now();
CREATE cat:pumpkin SET name = "Pumpkin";

RELATE user:mcuserson->wrote->comment:one SET
	location = "Arizona",
	os = "Windows 11",
	mood = "happy";

RELATE user:mcuserson->likes->cat:pumpkin;
```

The Explorer view inside Surrealist can then be used to understand a query like `SELECT ->wrote->comment FROM user` and what the database sees at each and every step of the way.

* Click on `user` (this is the `FROM user` part), then the individual `user:mcuserson` record.
* Click on the `Relations` tab. This has two outgoing relations, outgoing being the `->` direction.
* The path in the query above then goes into `wrote`, so click on that to move into the single `wrote` record.
* At its Outgoing relations is a `comment`, which matches the `->comment` part of the path.
* Clicking on this will lead to the `comment` the user wrote, finishing the query.

Reversing the process by beginning with the Explorer view is a good way to build up a query one step at a time when you are still getting used to the syntax.

### RELATE can be used before records to relate exist

One characteristic of graph tables is that they can be created before the two records in question exist.

```surql
-- Works fine
RELATE person:one->likes->person:two;
-- Returns []
person:one->likes->person;
-- Finally create the 'person' records
CREATE person:one, person:two;
-- Now it returns [ person:two ]
person:one->likes->person;
```

If this is not desirable, the `ENFORCED` keyword can be added to a `DEFINE TABLE` statement.

```surql
DEFINE TABLE likes TYPE RELATION IN person OUT person ENFORCED;
```

```surql title="Output"
"The record 'person:one' does not exist"
```

However, certain patterns might make it desirable to use `RELATE` before creating a record. For example, a street in a city might have a set of addresses registered with a predictable record ID (such as an ID composed of a street number and name) but no houses at the location yet. A `DEFINE FIELD` statement can be used here that contains the path from the `house` to the `street` that will be calculated once the `house` is finally created.

```surql
DEFINE FIELD street ON house VALUE $this<-contains<-street;
CREATE street:frankfurt_road;
RELATE street:frankfurt_road->contains->[
    house:["Frankfurt Road", 200], 
    house:["Frankfurt Road", 205],
    house:["Frankfurt Road", 210],
];

-- Twelve months later once the house is built and size is known...
CREATE house:["Frankfurt Road", 200] SET sq_m = 110.5;
```

```surql title="Output"
[
	{
		id: house:[
			'Frankfurt Road',
			200
		],
		sq_m: 110.5f,
		street: [
			street:frankfurt_road
		]
	}
]
```

### Using recursive queries

[Recursive queries](/docs/surrealql/datamodel/idioms#recursive-paths) allow traversal of a path down to a specific depth.

Take the following `person` records that are connected to each other via the `child_of` path.

```surql
CREATE |person:1..15|;
-- parents of person:1
RELATE person:1->child_of->[person:2, person:3];
-- grandparents of person:1
RELATE person:2->child_of->[person:4, person:5];
RELATE person:3->child_of->[person:6, person:7];
-- great-grandparents of person:1
RELATE person:4->child_of->[person:8, person:9];
RELATE person:5->child_of->[person:10, person:11];
RELATE person:6->child_of->[person:12, person:13];
RELATE person:7->child_of->[person:14, person:15];
```

Following the `person:1` record down three depths (parents, grandparents, great-grandparents) can be done manually by repeating the `->child_of->person` path as many times as required.

```surql
SELECT 
    ->child_of->person AS parents,
    ->child_of->person->child_of->person AS grandparents,
    ->child_of->person->child_of->person->child_of->person AS great_grandparents
FROM ONLY person:1;
```

The recursive syntax can be used in this case to repeat a path as many times as desired instead of manually typing.

```surql
SELECT 
    @.{1}->child_of->person AS parents,
    @.{2}->child_of->person AS grandparents,
    @.{3}->child_of->person AS grandparents
FROM ONLY person:1;
```

However, the recursive syntax goes beyond simply saving keystrokes on a regular graph query. It can also be used to return a single nested object that recurses a number of times as instructed down an indicated path.

```surql
-- Range to start at a depth of one, try to go down to depth of three
SELECT @.{3}.{
    id,
	-- At each depth, use this path to reach the next one
    parents: ->child_of->person.@
} FROM person:1;
```

```surql
person:1.{3}.{
    id,
    parents: ->child_of->person.@
};
```

While developed for graph relations in particular, this path can be used in any context.

For more details on SurrealDB's recursive syntax, see the following pages:

* [Idioms: recursive paths](/docs/surrealql/datamodel/idioms#recursive-paths)
* [Chapter 8 of Aeon's Surreal Renaissance](/learn/book/chapter-08#longer-relational-queries)

### When links are deleted

As mentioned above, record links since version 2.2.0 have the ability to specify what behaviour should take place when a referencing link is deleted. Graph links have a simpler behaviour in which they will be deleted if at least of the linked records is deleted.

```surql
-- likes record created without problems
RELATE person:one->likes->person:two;
CREATE person:one, person:two;
DELETE person:one;
-- 'likes' record is now gone
SELECT * FROM likes;
```

A record link allows for more complex behaviour such as the following in which a linked record is removed from the `comments` field if it is deleted, but also adds the record ID to a field called `deleted_comments` for record keeping. For more information on these `ON DELETE` clauses, see the [page on record references](/docs/surrealql/datamodel/references).

```surql
DEFINE FIELD comments ON person TYPE option<array<record<comment>>> REFERENCE ON DELETE THEN {
    UPDATE $this SET
        deleted_comments += $reference,
        comments -= $reference;
};
```

---
sidebar_position: 4
sidebar_label: Observability
title: Observability | Reference guides
description: In SurrealDB, metrics and traces are available if enabled⁠.
---

# Observability
SurrealDB can be monitored by enabling the built in observability.

## Enable observability
To enable observability, the `SURREAL_TELEMETRY_PROVIDER` environment variable has to be set to `otlp`. If set to anything else, no observability will be available.

If enabled, SurrealDB will send metrics and/or traces to an [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/).  Configuration of the collector is done via [environment variables](https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/). The most important one is [OTEL_EXPORTER_OTLP_ENDPOINT](https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_endpoint). By default this is set to localhost. It should be set to the GRPC endpoint of your OTEL collector. For example if your OTEL collector named `my-collector` is running in Kubernetes in the `monitoring` namespace the following can be used: 

```
OTEL_EXPORTER_OTLP_ENDPOINT="http://my-collector.monitoring.svc.cluster.local:4317"
```

Metrics can be disabled (even if `SURREAL_TELEMETRY_PROVIDER` is set to `otlp`) by setting the `SURREAL_TELEMETRY_DISABLE_METRICS` environment variable to `true`. Similarly traces can be disabled by setting `SURREAL_TELEMETRY_DISABLE_TRACING` to `true`.

## Metrics

Metrics are gathered every minute and sent to the collector. The following metrics are present:

<table>
    <thead>
        <tr>
            <th colspan="1" scope="col">Name</th>
            <th colspan="1" scope="col">[Instrument](https://opentelemetry.io/docs/concepts/signals/metrics/#metric-instruments)</th>
            <th colspan="1" scope="col">Explanation</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="1" scope="row" data-label="Metric name">
                rpc.server.duration
            </td>
            <td colspan="1" scope="row" data-label="Type">
                histogram
            </td>
            <td colspan="1" scope="row" data-label="Explanation">
                Measures duration of inbound RPC requests in milliseconds
            </td>
        </tr>
        <tr>
            <td colspan="1" scope="row" data-label="Metric name">
                rpc.server.active_connections
            </td>
            <td colspan="1" scope="row" data-label="Type">
                counter
            </td>
            <td colspan="1" scope="row" data-label="Explanation">
                The number of active WebSocket connections
            </td>
        </tr>
        <tr>
            <td colspan="1" scope="row" data-label="Metric name">
                rpc.server.response.size
            </td>
            <td colspan="1" scope="row" data-label="Type">
                histogram
            </td>
            <td colspan="1" scope="row" data-label="Explanation">
                Measures the size of HTTP response messages
            </td>
        </tr>
        <tr>
            <td colspan="1" scope="row" data-label="Metric name">
                http.server.duration
            </td>
            <td colspan="1" scope="row" data-label="Type">
                histogram
            </td>
            <td colspan="1" scope="row" data-label="Explanation">
                The HTTP server duration in milliseconds
            </td>
        </tr>
        <tr>
            <td colspan="1" scope="row" data-label="Metric name">
                http.server.active_requests
            </td>
            <td colspan="1" scope="row" data-label="Type">
                counter
            </td>
            <td colspan="1" scope="row" data-label="Explanation">
                The number of active HTTP requests
            </td>
        </tr>
        <tr>
            <td colspan="1" scope="row" data-label="Metric name">
                http.server.request.size
            </td>
            <td colspan="1" scope="row" data-label="Type">
                histogram
            </td>
            <td colspan="1" scope="row" data-label="Explanation">
                Measures the size of HTTP request messages
            </td>
        </tr>
        <tr>
            <td colspan="1" scope="row" data-label="Metric name">
                http.server.response.size
            </td>
            <td colspan="1" scope="row" data-label="Type">
                histogram
            </td>
            <td colspan="1" scope="row" data-label="Explanation">
                Measures the size of HTTP response messages
            </td>
        </tr>
    </tbody>
</table>

The metrics are shown here in the form required by the [OpenTelemetry Metrics Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/general/metrics/) with a `.` separator. When ingested into Prometheus the `.` separator will be [replaced](https://prometheus.io/blog/2024/03/14/commitment-to-opentelemetry/#support-utf-8-metric-and-label-names) with an `_`. For example `rpc.server.active.connections` will be transformed into `rpc_server_active_connections`.

---
sidebar_position: 5
sidebar_label: Security Best Practices
title: Security Best Practices | Reference guides
description: This guide outlines some key security best practices for using SurrealDB 2.0. While SurrealDB offers powerful and flexible features to support you in meeting your desired security standards, the use that you make of those features will ultimately determine whether or not you meet them.
---
import SurrealistMini from "@components/SurrealistMini.astro";

# Security Best Practices

This guide outlines some key security best practices for using SurrealDB `v2.x.x`. While SurrealDB offers powerful and flexible features to help you meet your desired security standards, your use of those features will ultimately determine whether or not you meet them.

The following is a non-exhaustive list of security best practices you should consider when building services and applications with SurrealDB to help you address common security challenges while preventing frequent pitfalls.

## Capabilities

When running a SurrealDB server, you can configure the [capabilities](/docs/surrealdb/security/capabilities) for your SurrealQL queries. Most of these capabilities are disabled by default to expose as little attack surface as possible to malicious actors.

For the strongest security, we recommend denying all capabilities by default and only allowing the specific capabilities necessary for your service, following an allowlisting approach. We strongly discourage running SurrealDB with all capabilities allowed.

### Example: Deny all capabilities with some exceptions

```bash
# Allow SurrealDB to call any functions from the array and string families, generate and compare Argon2 hashes
# and make HTTP GET requests over HTTPS to the address of a specific API.
surreal start --deny-all --allow-funcs "array, string, crypto::argon2, http::get" --allow-net api.example.com:443
```

When you need to enable a capability, we recommend doing it specifically instead of generally. For example, suppose you know that your queries need to be able to parse emails using functions. In that case, we recommend you run SurrealDB with the `--allow-funcs "parse::email::*"` flag instead of allowing all functions with `--allow-funcs` without arguments. Doing this can help mitigate the performance impact that users can have when using certain functions and ensures that your SurrealDB instance will not be affected by vulnerabilities in the code of any other functions that a malicious actor could leverage to attack SurrealDB.

In the case where it is absolutely necessary to generally allow a capability, we recommend carefully reviewing the scope of that capability and denying any specific instances where it may introduce unacceptable risks. This is especially important in the case of the network capability, which allows SurrealDB to perform network requests such as those required by the [`http::*`](/docs/surrealql/functions/database/http) functions. Allowing untrusted users to perform network requests from your SurrealDB instance can allow them access to its local network or services that specifically allow network access from the SurrealDB server.

### Example Anti-Pattern: Allow all outgoing network connections with some exceptions

```bash
// highlight-next-line
# Avoid doing this:
# Allow SurrealDB to make outgoing HTTP GET and POST request to any address except to some known private CIDR blocks.
surreal start --deny-all --allow-funcs "http::get, http::post" --allow-net --deny-net "10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16"
```

Following a denylisting approach as described above should only be used as a last resort, since it is common to miss some risky cases (e.g. [169.254.169.254](https://book.hacktricks.xyz/pentesting-web/ssrf-server-side-request-forgery/cloud-ssrf)), which in that case would become allowed by default.

Additionally, SurrealDB currently does not perform reverse DNS lookups to prevent http functions directly accessing an IP address, even when the hostname that resolves to that IP address is listed within `--deny-net`. This is an issue when SurrealDB is configured with allow network access by default e.g `--allow-net --deny-net www.google.com`.

It is **strongly recommended** that you deny by default by defining specific `--allow-net` targets and using additional layers of network security within your infrastructure.

## Passwords

If you require storing passwords for your users, do not rely on table or field permissions to keep them private. In the event that your application or database is compromised, these passwords would become known by the attacker. Instead, use the [password hashing functions](/docs/surrealql/functions/database/crypto) provided by SurrealDB such  as `crypto::argon2::*`, `crypto::bcrypt::*`, `crypto::pbkdf2::*` and  `crypto::scrypt::*` . These functions ensure that irreversible cryptographic hashes are stored instead of the original passwords, so that the passwords from your users remain safe even in the event of a compromise.

Do not use other cryptographic hash functions (e.g. `crypto::md5`, `crypto::sha1`, `crypto::sha512`) for hashing passwords, even if you do use an additional salt. These functions are designed to be efficient in computing, which will benefit an attacker that sets out to crack any hashes that they may have obtained from the compromise of your application. Hash functions intended for password hashing already incorporate a salt as well as other mechanisms to prevent hash cracking by making the computation of such hashes less efficient. This mitigates password cracking at scale at the small cost of adding a few milliseconds delay while checking credentials for legitimate users.

Even if you only store password hashes, it is a good practice to additionally use field permissions to prevent unauthorised access to the password hashes, which could allow an attacker to perform inefficient but potentially effective attacks such as testing candidate passwords against a specific hash. For even better security, you may store passwords in a separate table and use table permissions to disallow all access to that table. Due to their internal implementation, table permissions provide additional security compared to field permissions.

### Example: Securely hash user passwords

```surql
DEFINE TABLE user SCHEMAFULL
  -- Only allow users to query their own record, including their password.
	PERMISSIONS
		FOR select, update, delete WHERE id = $auth.id;

DEFINE FIELD name ON user TYPE string;
DEFINE FIELD email ON user TYPE string ASSERT string::is::email($value);
DEFINE FIELD password ON user TYPE string;

DEFINE INDEX email ON user FIELDS email UNIQUE;

DEFINE ACCESS user ON DATABASE TYPE RECORD
	SIGNUP (
		CREATE user CONTENT {
			name: $name,
			email: $email,
			password: crypto::argon2::generate($password) -- Use Argon2 to generate the hash.
		}
	)
	SIGNIN (
		SELECT * FROM user WHERE email = $email AND
		  crypto::argon2::compare(password, $password) -- Use Argon2 to compare the hashes.
	);
```

## Expiration

When defining [users](/docs/surrealql/statements/define/user) and [access methods](/docs/surrealql/statements/define/access), ensure that you set a specific [session and token duration](/docs/surrealdb/security/authentication#expiration) whenever possible using the `DURATION` clause.

Default values provided by SurrealDB are intended to support cases where SurrealDB is used as a traditional backend database, which is why sessions do not expire by default. Suppose you build an application where your end users directly connect with SurrealDB. In that case, we strongly encourage setting a session expiration that is as short as possible (typically a few hours) to provide a good experience to your users without compromising security.

Expiring user sessions ensures that a user cannot remain authenticated long after their access has been revoked. This cannot be done on demand, as user sessions do not persist in the database. However, unlike tokens, user sessions are not typically susceptible to being stolen, as they exist only in the context of an established WebSocket connection.

### Example: Set a session duration

```surql
DEFINE USER username ON DATABASE PASSWORD 'CHANGE_THIS' DURATION FOR SESSION 5d;
```

```surql
DEFINE ACCESS account ON DATABASE TYPE RECORD
	SIGNUP ( CREATE user SET email = $email, pass = crypto::argon2::generate($pass) )
	SIGNIN ( SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(pass, $pass) )
	DURATION FOR SESSION 12h
;
```

Tokens, however, are usually stored in the client (e.g. a web browser) and may be stolen by client-side attacks such as a cross-site scripting vulnerability in your application. For this reason, we strongly recommend reducing the token duration from the default one hour to the minimum amount of time that your use case can tolerate. Ideally, a token should only be valid for as long as the client needs to use it to establish a session, which can be as little as a few seconds.

### Example: Set a token duration

```surql
DEFINE USER username ON DATABASE PASSWORD 'CHANGE_THIS' DURATION FOR TOKEN 15m;
```

```surql
DEFINE ACCESS account ON DATABASE TYPE RECORD
	SIGNUP ( CREATE user SET email = $email, pass = crypto::argon2::generate($pass) )
	SIGNIN ( SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(pass, $pass) )
	DURATION FOR TOKEN 5s
;
```

## Query Safety

When using SurrealDB as a traditional backend database, your application will usually build SurrealQL queries that may need to contain some untrusted input, such as that provided by the users of your application. To do so, SurrealDB offers [`bind`](/docs/sdk/rust/setup#query) as a method to `query` (implemented in other SDKs as [the `vars` argument to `query`](/docs/sdk/javascript/core/data-maniplulation)), which should always be used when including untrusted input into queries. Otherwise, SurrealDB will be unable to separate the actual query syntax from the user input, resulting in the well-known [SQL injection](https://en.wikipedia.org/w/index.php?title=SQL_injection&oldid=1234729055) vulnerabilities. This practice is known as [prepared statements or parameterised queries](https://en.wikipedia.org/w/index.php?title=Prepared_statement&oldid=1195122133).

Binding parameters ensure that untrusted data is passed to SurrealDB as SurrealQL parameters, which are independent of the query syntax, preventing SQL injection attacks.

### Example: Bind parameters in the provided SDKs

import Tabs from "@components/Tabs/Tabs.astro";
import TabItem from "@components/Tabs/TabItem.astro";

<Tabs groupId="language-sdk">
  <TabItem value="rust" label="Rust" default>

```rust
// Do this:
let name = "tobie"; // User-controlled input.
let mut result = db
    .query("CREATE person CONTENT name = $name;")
    .bind(("name", name))
    .await?;
```

```rust
// highlight-next-line
// Do NOT do this:
let name = "tobie"; // User-controlled input.
let mut result = db
    .query(format!("CREATE person CONTENT name = {name};"))
    .await?;
```

  </TabItem>
  <TabItem value="js" label="JavaScript">

```jsx
// Do this:
const name = "tobie"; // User-controlled input.
const result = await db.query(
	'CREATE person CONTENT name = $name;',
	{ name }
);
```

```jsx
// highlight-next-line
// Do NOT do this:
const name = "tobie"; // User-controlled input.
const result = await db.query(`CREATE person CONTENT name = "${name}";`);
```

  </TabItem>
  <TabItem value="csharp" label=".NET (C#)">

```csharp
// Do this:
string name = "tobie"; // User-controlled input.
var result = await db.Query($"CREATE person CONTENT name = {name};");

// Translated as "CREATE person CONTENT name = $p0;"
// with the parameter $p0 having the value "tobie"
```

```csharp
// highlight-next-line
// Do NOT do this:
string name = "tobie"; // User-controlled input.
var result = await db.RawQuery($"CREATE person CONTENT name = "{name}";");
```

  </TabItem>
</Tabs>

### Example: Bind parameters in the HTTP REST API

<Tabs groupId="http-sql">
<TabItem value="V2" label="V2.x" default>
```bash title="Request"
curl -X POST -u "root:root" -H "surreal-ns: mynamespace" -H "surreal-db: mydatabase" -H "Accept: application/json" \
-d 'SELECT * FROM person WHERE age > $age' http://localhost:8000/sql?age=18
```
</TabItem>
<TabItem value="V1" label="V1.x">
```bash title="Request"
curl -X POST -u "root:root" -H "ns: mynamespace" -H "db: mydatabase" -H "Accept: application/json" \
  -d 'SELECT * FROM person WHERE age > $age' http://localhost:8000/sql?age=18
```
</TabItem>

</Tabs>

## Content Safety

Content generated by users and other untrusted parties will often be stored in SurrealDB and later rendered in an HTML page to be displayed. Regardless of SurrealDB, rendering untrusted content is the source of some dangerous pitfalls which can lead to [cross-site scripting](https://en.wikipedia.org/w/index.php?title=Cross-site_scripting&oldid=1232455342) attacks and other client-side code injection issues like [site defacement](https://en.wikipedia.org/w/index.php?title=Website_defacement&oldid=1231310592) or [clickjacking](https://en.wikipedia.org/w/index.php?title=Clickjacking&oldid=1227193298).

When retrieving content that may be rendered in an HTML document, we strongly recommend that you use the [`string::html::encode`](/docs/surrealql/functions/database/string#stringhtmlencode) function, which will encode any characters that have special meaning in HTML syntax (e.g. `<`, `>`, `&`...) into HTML entities (e.g. `&lt;`, `&gt;`, `&amp;`...) that will be rendered as the actual original character instead of interpreted as HTML syntax.

### Example: Encode HTML content

```surql
RETURN string::html::encode("<h1>Safe Title</h1><script>alert('XSS')</script><p>Safe paragraph. Not safe <span onload='logout()'>event</span>.</p>");

['&lt;h1&gt;Safe&#32;Title&lt;&#47;h1&gt;&lt;script&gt;alert(&apos;XSS&apos;)&lt;&#47;script&gt;&lt;p&gt;Safe&#32;paragraph.&#32;Not&#32;safe&#32;&lt;span&#32;onload&#61;&apos;logout()&apos;&gt;event&lt;&#47;span&gt;.&lt;&#47;p&gt;']
```

If you absolutely require user-generated content to be rendered as HTML but still want to prevent users from injecting dangerous HTML into your page, you can use the [`string::html::sanitize`](/docs/surrealql/functions/database/string#stringhtmlsanitize) function instead, which will keep all characters intact, so that the content can be interpreted as HTML syntax, while removing the specific syntax that is deemed dangerous. It is important to note that, although the set of accepted syntax is very conservative, sanitization is less safe that encoding and could potentially be bypassed due to a flaw in the function.

### Example: Sanitize HTML content

```surql

RETURN string::html::sanitize("<h1>Safe Title</h1><script>alert('XSS')</script><p>Safe paragraph. Not safe <span onload='logout()'>event</span>.</p>");

['<h1>Safe Title</h1><p>Safe paragraph. Not safe <span>event</span>.</p>']
```

## JSON Web Tokens

When configuring how [JSON Web Tokens](https://datatracker.ietf.org/doc/html/rfc7519) are verified before authenticating a [system](/docs/surrealdb/security/authentication#system-users) or [record](/docs/surrealdb/security/authentication#record-users) user with [`DEFINE ACCESS ... TYPE JWT`](/docs/surrealql/statements/define/access/jwt) or [`DEFINE ACCESS ... TYPE RECORD ... WITH JWT`](/docs/surrealql/statements/define/access/record#with-json-web-token), we recommend using an asymmetric algorithm (i.e. `PSXXX`,  `RSXXX` , `ECXXX`) when only a mechanism for token verification is being defined. This ensures that the only key stored by SurrealDB is a public key that does not represent a threat in the event of a compromise.

On the other hand, symmetric algorithms (i.e., HSXXX) use the same key for signature and verification, which the attacker could use to issue tokens that SurrealDB would trust.

### Example: Define a JWT access method

```surql
DEFINE ACCESS token ON DATABASE TYPE RECORD WITH JWT
ALGORITHM RS256 KEY "-----BEGIN PUBLIC KEY-----
MUO52Me9HEB4ZyU+7xmDpnixzA/CUE7kyUuE0b7t38oCh+sQouREqIjLwgHhFdhh3cQAwr6GH07D
ThioYrZL8xATJ3Youyj8C45QnZcGUif5PkpWXDi0HJSoMFekbW6Pr4xuqIqb2LGxGDVJcLZwJ2AS
Gtu2UAfPXbBD3ffiad393M22g1iHM80YaNi+xgswG7qtXE4lR/Lt4s0MeKKX7stdWI1VIsoB+y3i
r/OWUvJPjjDNbAsyy8tQmxydv+FUnLEP9TNT4AhN4DXcJ+XsDtW7OWt4EdSVDeKpGbIMvIrh1Pe+
Nilj8UHNyNDHa2AjK3seMo6CMvaIQJKj5o4xGFblFGwvvPD03SbuQLs1FdRjsZCeWLdYeQ3JDHE9
sFG7DCXlpMJcaYT1mf4XHJ0gPekNLQyewTY3Vxf7FgV3GCNjV20kcDFgJA2+iVW2wSrb+txD1ycE
kbi8jh0pedWwE40VQWaTh/8eAvX7IHWya/AEro25mq+m6vktNZLbvLphhp586kJK3Tdt3YjpkPre
M3nkFWOWurIyKbtIV9JemfwCgt89sNV45dTlnEDEZFFGnIgDnWgx3CUo4XmhICEQU8+tklw9jJYx
iCTjhbIDEBHySSSc/pQ4ftHQmhToTlQeOdEy4LYiaEIgl1X+hzRH1hBYvWlNKe4EY1nMCKcjgt0=
-----END PUBLIC KEY-----";
```

Additionally, we recommend using [JSON Web Key Sets](https://datatracker.ietf.org/doc/html/rfc7517) to configure the verification algorithm and key from a remote authoritative source using the `URL` clause instead of providing them directly to SurrealDB using the `ALGORITHM` and `KEY` clauses. This ensures that the original token issuer will be able to rotate keys in the event of a compromise to prevent potentially compromised tokens to be used with your application without affecting the availability of your service.

### Example: Define a JWT access method with JWKS

```surql
DEFINE ACCESS token ON DATABASE TYPE RECORD WITH JWT
URL "https://example.com/.well-known/jwks.json";
```

## Network Exposure

When deploying SurrealDB, we recommend limiting the attack surface as much as possible in order to minimise the risk of attacks or information gathering from unauthorised parties. If your database should only be available to other internal services, we suggest that you expose SurrealDB exclusively to the internal network instead of deploying the service with a publicly addressable network interface that is accessible from the internet, regardless of whether or not allowlisting has been applied at the networking or application level.

If you must publish SurrealDB to the internet (e.g. if your users directly connect to SurrealDB), you may want to monitor and prevent unwanted connections using tools such as a network [intrusion prevention system](https://en.wikipedia.org/w/index.php?title=Intrusion_detection_system&oldid=1223972754#Intrusion_prevention) or a [web application firewall](https://en.wikipedia.org/w/index.php?title=Web_application_firewall&oldid=1234730173). If you do so, ensure that these systems are appropriately tuned and do not interfere with the regular use of SurrealDB.

In cases where SurrealDB is publicly exposed in environments where any sort of information leakage is unacceptable, the `--no-identification-headers` flag can be enabled, which will result in the SurrealDB server no longer responding to HTTP requests with headers that identify the product or its current version to prevent passive fingerprinting and metadata indexing. Note that this will not prevent active fingerprinting such as directly querying the `/version` endpoint if available or directly attempting to exploit a known security vulnerability without regard for compatibility. On the other hand, consider whether or not enabling this feature is compatible with your clients, which may rely on these headers in order to identify the version of SurrealDB running on the server.

### Example: Start SurrealDB with identification headers

```bash
$ surreal start &
$ curl -vvv "127.0.0.1:8000"
*   Trying 127.0.0.1:8000...
* Connected to 127.0.0.1 (127.0.0.1) port 8000 (#0)
> GET / HTTP/1.1
> Host: 127.0.0.1:8000
> User-Agent: curl/7.81.0
> Accept: */*
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 307 Temporary Redirect
< location: https://surrealdb.com/app
< access-control-allow-origin: *
< vary: origin
< vary: access-control-request-method
< vary: access-control-request-headers
# highlight-start
< surreal-version: surrealdb-2.0.0+20240612.2184e80f
< server: SurrealDB
# highlight-end
< x-request-id: 157413ce-7cc4-41a1-a93b-0940bf87874c
< content-length: 0
< date: Mon, 17 Jun 2024 15:47:29 GMT
<
* Connection #0 to host 127.0.0.1 left intact
```

### Example: Start SurrealDB without identification headers

```bash
$ surreal start --no-identification-headers &
$ curl -vvv "127.0.0.1:8000"
*   Trying 127.0.0.1:8000...
* Connected to 127.0.0.1 (127.0.0.1) port 8000 (#0)
> GET / HTTP/1.1
> Host: 127.0.0.1:8000
> User-Agent: curl/7.81.0
> Accept: */*
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 307 Temporary Redirect
< location: https://surrealdb.com/app
< access-control-allow-origin: *
< vary: origin
< vary: access-control-request-method
< vary: access-control-request-headers
< x-request-id: deec3301-e930-4389-a0da-b2a336bd2631
< content-length: 0
< date: Mon, 17 Jun 2024 15:49:43 GMT
<
* Connection #0 to host 127.0.0.1 left intact
```

## Least Privilege

When defining [system users](/docs/surrealdb/security/authentication#system-users) in SurrealDB, you may assign them [roles](/docs/surrealql/statements/define/user#roles) that will limit the actions they can perform inside the level where they are defined. Ensure that you employ the principle of least privilege and create users at the lowest level possible and with the minimum role in order to be able to perform their duties inside of SurrealDB. This will mitigate some of the risk in the case where credentials for that user are ever compromised.

### Example: Define users with specific roles

A user who only needs to query the database:

```surql
DEFINE USER db_viewer ON DATABASE PASSWORD 'CHANGE_THIS' ROLES VIEWER;
```

A user who only needs to manage content in any databases on the same namespace:

```surql
DEFINE USER ns_editor ON NAMESPACE PASSWORD 'CHANGE_THIS' ROLES EDITOR;
```

## Encryption in Transit

Encryption in transit is recommended, especially when deploying SurrealDB on a server in a different network than its clients. This mitigates the impact of man-in-the-middle attacks and provides confidentiality and integrity guarantees with regard to the data being exchanged. Encryption in transit can be achieved by using the SurrealDB server to serve its interfaces through HTTPS by providing the `--web-crt` and `--web-key` arguments when calling [the `start` subcommand in the CLI](/docs/surrealdb/cli/start#command-help). For production deployments, we recommend that TLS termination be performed by a load balancer or reverse proxy, which will often provide additional guarantees to the process.

### Example: Start SurrealDB with TLS

```bash
# If you want to serve TLS directly with SurrealDB:
surreal start --web-crt "cert.pem" --web-key "key.pem"
```

## Encryption at Rest

Encryption at rest is recommended especially when storing sensitive data in a location where you cannot guarantee the security of the storage media. If encryption at rest is not used, physical access to the storage media may result in the complete compromise of the data stored. It is important to note that most kinds of encryption at rest will not prevent logical attacks from resulting in compromise of the data, as such attacks will often access the data using the compromised system as a [confused deputy](https://en.wikipedia.org/w/index.php?title=Confused_deputy_problem&oldid=1230222963) in order to leverage its ability to access data after it is already decrypted.

Encryption at rest can be achieved by ensuring that the data is stored encrypted using a disk encryption solution such as [LUKS](https://en.wikipedia.org/w/index.php?title=Linux_Unified_Key_Setup&oldid=1225491340) or [BitLocker](https://en.wikipedia.org/w/index.php?title=BitLocker&oldid=1232782210) in Linux and Windows systems respectively and, in the case where you are hosting SurrealDB in a cloud provider, by leveraging their storage encryption solutions in the volume or disk that will store your data.

You might consider additional encryption for your datastore in some specific scenarios. This can provide increased security when your database servers, storage media and their corresponding encryption keys are managed in different security contexts, where the storage media and its keys may be compromised without also compromising the datastore servers. Encryption at rest at the datastore level can be achieved by using a datastore backend that offers transparent encryption such as [TiKV (≥4.0)](https://docs.pingcap.com/tidb/stable/encryption-at-rest#tikv-encryption-at-rest) or [FoundationDB (≥7.2)](https://github.com/apple/foundationdb/blob/main/design/encryption-data-at-rest.md). This encryption is independent from SurrealDB.

It is important to note that, even in this scenario, physical or logical access to the SurrealDB server will result in access to the data, as SurrealDB must receive decrypted data from the datastore in order to perform any sort of queries.

## Untrusted Queries

Due to the powerful SurrealQL language and the addition of functions, scripting and network capabilities, running untrusted queries in SurrealDB as a [system user](/docs/surrealdb/security/authentication#system-users) should be treated similarly to running untrusted software in any system. When copying queries or importing datasets from sources that you do not trust, make sure to review their contents to ensure that they do not contain any malicious code intended to perform unauthorized changes, computations or network requests.

## Session Isolation

One of the interfaces to SurrealDB is [RPC through WebSockets](/docs/surrealdb/integration/rpc). This interface is usually used by the official [SDKs](/docs/surrealdb/integration/sdks) and offers performance benefits over the [HTTP REST API](/docs/surrealdb/integration/http), which requires establishing a new connection for every operation. The RPC interface can either be directly exposed to end users or used internally from your backend to communicate with SurrealDB.

In the later scenario, some developers may choose to still authenticate each user individually (e.g. using [`signin`](/docs/surrealdb/integration/rpc#signin) or [`authenticate`](/docs/surrealdb/integration/rpc#authenticate) in the WebSockets [session](/docs/surrealdb/security/authentication#sessions) as opposed to using a single service user for their backend. This could be done by calling [`invalidate`](/docs/surrealdb/integration/rpc#invalidate) or just authenticating a new user in the same connection and may provide some performance benefits over establishing a new WebSocket connection for each user. However, we recommend using separate WebSocket sessions or connections for different users. Consider terminating the connection and establishing a new one for every individual user.

WebSocket connections offer an additional degree of isolation between users that may become relevant in the event where some session information for previous users who were using the same connection was not properly cleared. Additionally, even if successfully isolated from the security perspective, some resources associated with users are freed by SurrealDB only when the connection is terminated. Sharing the same WebSockets connection between several users may cause these unused resources to grow indefinitely.

## Token Storage

In some instances, applications may need to store some of the authentication tokens issued by SurrealDB. Even when token expiration has been configured to be as low as possible, tokens may potentially be stolen as a result of attacks against the application. To mitigate this risk, it is important to take steps to protect tokens in storage from being stolen as a result of these attacks. This is specially relevant in web applications, which usually expose additional attack vectors compared to other client applications.

The best way to protect tokens against stealing is to not store them at all. If your use case supports it, use the token in memory to [`authenticate`](/docs/sdk/javascript/methods/authenticate) a persistent session using the WebSocket protocol and destroy the token from memory after the session is established. When the session expires, ask your users to sign in again with their credentials and establish a new authenticated session with SurrealDB. Your use case may even support not using a token at all by directly authenticating the session with user credentials using [`signin`](/docs/sdk/javascript/methods/signin).

However, if you must store the authentication token (e.g. you want authentication to persist across browser tabs or restarts), our recommendation for most use cases is that you store tokens using browser storage primitives such as local storage and that you take steps to protect your web application from script injection attacks by taking measures including the following:

- Encode or at least sanitize all [untrusted input](/docs/surrealdb/reference-guide/security-best-practices#content-safety) before showing it on the page.
- Implement a [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) to prevent unauthorized scripts from executing.
- Implement [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) to verify authorized external scripts.
- Use modern frontend frameworks that are designed to prevent content injection.

Understand that an attacker who is ultimately able to inject scripts into your web application or compromise the devices of your users will still be able to steal their tokens. These recomendations are intended to prevent this script injection from taking place. There is very little you can do to protect your users if you application is vulnerable to script injection attacks regardless of storage method. The impact of this actually happening can be mitigated by ensuring that token expiration is short to minimize the chance of an attacker capturing a valid token and reduce the window of oportunity to exploit it otherwise.

#### Why not cookies?

SurrealDB does not support authenticating via cookies. Although cookies with the `secure` and `HttpOnly` flags are often cited as the superior choice for token storage, this is [not always the case](https://portswigger.net/research/web-storage-the-lesser-evil-for-session-tokens). This is specially not true in the case of generic backend services such as SurrealDB, where protecting against [Cross-Site Request Forgery (CRSF)](https://owasp.org/www-community/attacks/csrf) attacks is not trivial without additional control of the frontend application. These attacks are possible because of how cookies work and would allow attackers to force users to make unauthorized requests to SurrealDB using their own valid cookies. Additionally, cookies are limited to a 4KB size, making them unsuitable for storing certain JWT payloads.

The proposed benefits of using cookies would be that [Cross-Site Scripting (XSS)](https://owasp.org/www-community/attacks/xss/) attacks could not be used to directly read the contents of the token as long as cookies were configure with the `HttpOnly` flag. Although this is true, XSS attacks could still be used to take control of the browser session and impersonate the user using their own cookies to perform any authenticated actions that the token could be used for. This is essentially as bad as the token being stolen because an attacker is not interested in the token itself but rather in what the token can be used for. Most modern attacks against cookies with `HttpOnly` will lead to essentially the same results as those against cookies without it.

In our opinion, the CSRF attacks made possible by cookies would be an unmitigated threat to applications built on SurrealDB. Additionally, XSS attacks are still a threat when using cookies with the `HttpOnly` flag. On the other hand, significant advances have been made by modern browsers and frontend frameworks to prevent XSS attacks, whereas CSRF attacks are not possible to mitigate without the frontend and backend services working together in a way that would not be trivial to implement between SurrealDB and self-developed frontend applications.

## Vulnerabilities

When SurrealDB is part of your service or application, vulnerabilities that affect SurrealDB may also impact your environment. Due to this fact, we highly recommend that you track [vulnerabilities published for SurrealDB](https://github.com/surrealdb/surrealdb/security/advisories) so that you become aware of any updates that address vulnerabilities that you may be affected by. This can be done most effectively by leveraging automation tools that will consume the [Github Advisory Database](https://github.com/advisories?query=surrealdb). These automations will usually also warn of vulnerabilities in dependencies used by SurrealDB, which may also have an impact in your environment. Keeping up to date with the latest releases of SurrealDB is, in general, a good practice.

If you identify a vulnerability in SurrealDB that has not been published yet, we encourage you to [create a security advisory report](https://github.com/surrealdb/surrealdb/security/advisories/new) on Github so that the SurrealDB team can privately look into it in order to identify and work on a solution that can benefit you as well as the rest of the users.

---
sidebar_position: 6
sidebar_label: Vector Search
title: Vector Search | Reference guides
description: Vector Search in SurrealDB is introduced to support efficient and accurate searching of high-dimensional data. This guide covers the essentials of working with vectors in SurrealDB, from storing vectors in embeddings to performing computations and optimising searches with different indexing strategies.
---
import Image from "@components/Image.astro";
import SurrealistMini from "@components/SurrealistMini.astro";

import ImageLead from "@img/lead.png";

import LightImageVc from "@img/image/light/VC.png";
import LightDistanceMetrics from "@img/image/light/distance-metrics.png";

import DarkImageVc from "@img/image/dark/VC.png";
import DarkDistanceMetrics from "@img/image/dark/distance-metrics.png";

# Vector Search

SurrealDB supports [Full-Text Search](/docs/surrealdb/models/full-text-search) and Vector Search. Full-Text search(FTS) involves indexing documents using the [FTS index](/docs/surrealql/statements/define/indexes#full-text-search-index) and breaking down the content of the document into smaller tokens with the help of [analyzers](/docs/surrealql/statements/define/analyzer) and [tokenizers](/docs/surrealql/statements/define/analyzer#tokenizers).

Vector Search in SurrealDB is introduced to support efficient and accurate searching of high-dimensional data. This guide will walk you through the essentials of working with vectors in SurrealDB, from storing vectors in embeddings to performing computations and optimizing searches with various indexing strategies.

## What is Vector Search

Vector search is a search mechanism that goes beyond traditional keyword matching and text-based search methods to capture deeper characteristics and similarities between data.

It converts data such as text, images, or sounds into numerical vectors, called vector embeddings.

You can think of Vector embeddings as cells. Like how cells form the basic structural and biological unit of all known living organisms, vector embeddings serve as the basic units of data representation in vector search.

Vector search isn't new to the world of data science. [Gerard Salton](https://en.wikipedia.org/wiki/Gerard_Salton), known as the Father of Information Retrieval, introduced the Vector Space Model, cosine similarity, and TF-IDF  for information retrieval around 1960.

If you’re interested in understanding Vector search in depth, checkout this academic paper on [Vector Retrieval](https://arxiv.org/abs/2401.09350) written by Sebastian Bruch.


## Vector Search Cheat Sheet

- M-Tree: when you need the exact nearest neighbour
- HNSW: efficient approximation for high dimensions or large datasets
- Brute force: when you don’t define an index, or you want exact nearest neighbours, or when you provide a distance function to the query

### M-Tree Index

| Parameter     | Default   | Options                 | Description   |
| ------------- | --------- | ----------------------- | ------------- |
| DIMENSION     |           |                         | Size of the vector
| DIST          | EUCLIDEAN | EUCLIDEAN, COSINE, MANHATTAN | Distance function
| TYPE          | F64       | F64, F32, I64, I32, I16 | Vector type
| CAPACITY      | 40        |                         | Max number of records that can be stored in the index
| DOC_IDS_ORDER | 100       |                         |
| DOC_IDS_CACHE | 100       |                         |
| MTREE_CACHE   | 100       |                         |

Examples:

```surql
-- User statement:
DEFINE INDEX mt_idx ON pts FIELDS point MTREE DIMENSION 3;
-- Defaults to:
DEFINE INDEX mt_idx ON pts FIELDS point MTREE DIMENSION 3 DIST EUCLIDEAN TYPE F64 CAPACITY 40 DOC_IDS_ORDER 100 DOC_IDS_CACHE 100 MTREE_CACHE 100;
```

### HNSW Index

| Parameter     | Default   | Options                 | Description   |
| ------------- | --------- | ----------------------- | ------------- |
| DIMENSION     |           |                         | Size of the vector
| DIST          | EUCLIDEAN | EUCLIDEAN, COSINE, MANHATTAN | Distance function
| TYPE          | F64       | F64, F32, I64, I32, I16 | Vector type
| EFC           | 150       |                         | EF construction
| M             | 12        |                         | Max connections per element
| M0            | 24        |                         | Max connections in the lowest layer
| LM            | 0.40242960438184466f |              | Multiplier for level generation. This value is automatically calculated with a value considered as optimal.

Examples:

```surql
-- User statement:
DEFINE INDEX hnsw_idx ON pts FIELDS point HNSW DIMENSION 4;
-- Defaults to:
DEFINE INDEX hnsw_idx ON pts FIELDS point HNSW DIMENSION 4 DIST EUCLIDEAN TYPE F64 EFC 150 M 12 M0 24 LM 0.40242960438184466f;
-- Users are strongly suggested not to set an LM value, as it is computed based on other parameters. Only users completely versed in the field should manually set it
```

More details in [`DEFINE INDEX` statement](/docs/surrealql/statements/define/indexes#hnsw-hierarchical-navigable-small-world).

### Querying

```surql
DEFINE INDEX hnsw_idx ON pts FIELDS point HNSW DIMENSION 4;

LET $vector = [2,3,4];
SELECT
    id,
    vector::distance::knn() as dist  -- distance from $vector
                                     -- knn reuses the value computed during
                                     -- the query, in this case the euclidean
                                     -- distance
FROM pts
WHERE point
    <|2|>  -- return 2, in this case using the distance function defined in the
           -- index: euclidean
    $vector;
```

| SELECT Functions                                 |     |
| ------------------------------------------------ | --- |
| `vector::distance::knn()`                        | reuses the value computed during the query
| `vector::distance::chebyshev(point, $vector)`    |
| `vector::distance::euclidean(point, $vector)`    |
| `vector::distance::hamming(point, $vector)`      |
| `vector::distance::manhattan(point, $vector)`    |
| `vector::distance::minkowski(point, $vector, 3)` | third param is [𝑝](#notes)
| `vector::similarity::cosine(point, $vector)`     |
| `vector::similarity::jaccard(point, $vector)`    |
| `vector::similarity::pearson(point, $vector)`    |

**WHERE statement**

| Query                   | M-tree index           | HNSW index |
| ----------------------- | ---------------------- | ---------- |
| `<\|2\|>`               | uses distance function defined in index | same
| `<\|2, EUCLIDEAN\|>`    | brute force methood    | same
| `<\|2, COSINE\|>`       | brute force method     | same
| `<\|2, MANHATTAN\|>`    | brute force method     | same
| `<\|2, MINKOWSKI, 3\|>` | brute force method (third param is [𝑝](#notes)) | same
| `<\|2, CHEBYSHEV\|>`    | brute force method     | same
| `<\|2, HAMMING\|>`      | brute force method     | same
| `<\|2, 10\|>`           | invalid, only for HNSW | second param is effort*

*effort: Tells HNSW how far to go in trying to find the exact response. HNSW is approximate, and may miss some vectors.

### Notes

- Verify index utilization in queries using the [`EXPLAIN FULL` clause](/docs/surrealql/statements/select#the-explain-clause). E.g: `SELECT id FROM pts WHERE point <|10|> [2,3,4,5] EXPLAIN FULL;`
- 𝑝 values: (more about 𝑝 in [Minkowski distance](https://en.wikipedia.org/wiki/Minkowski_distance))
  - 2<sup>0</sup> = 1 → manhattan/diamond ◇
  - 2<sup>1</sup> = 2 → euclidean/circle ○
  - 2<sup>2</sup> = 4 → squircle ▢
  - 2<sup>∞</sup> = ∞ → square □


## Vector Search vs Full-Text Search

<Image
    alt="Google search for the word 'lead'"
    src={ImageLead}
/>

The image above is a Google search for the word “lead”. The search has pulled up different definitions of the word “lead”.
Lead can mean `taking initiative`, as well as the chemical element with the symbol `Pb`.

Now let’s add some context to the word. Consider a database of liquid samples which note down harmful chemicals that are found in them.

In the example below, we have a table called `liquids` with a `sample` field and a `content` field.  Next, we can do a [Full-Text index](/docs/surrealql/statements/define/indexes#full-text-search-index) on the `content` field by first defining an analyzer called `liquid_analyzer`. We can then [Define an index](/docs/surrealql/statements/define/indexes) on the content field in the liquid table and set our [custom analyzer](/docs/surrealql/statements/define/analyzer) (`liquid_analyzer`)to search through the index.

Then, using the select statement to retrieve all the samples containing the chemical lead will also bring up samples that mention the word `lead`.

<SurrealistMini
	url="https://app.surrealdb.com/mini?query=--+Insert+a+sample+%26+content+field+into+a+liquids+table%0A%0AINSERT+INTO+liquids+%5B%0A++++%7Bsample%3A%27Sea+water%27%2C+content%3A+%27The+sea+water+contains+some+amount+of+lead%27%7D%2C%0A++++%7Bsample%3A%27Tap+water%27%2C+content%3A+%27The+team+lead+by+Dr.+Rose+found+out+that+the+tap+water+in+was+potable%27%7D%2C%0A++++%7Bsample%3A%27Sewage+water%27%2C+content%3A+%27High+amounts+of+a+were+found+in+Sewage+water%27%7D%0A%5D%3B%0A%0A--+Define+an+analyzer+for+the+liquid+table+and+an+index+on+the+content+field+with+the+analyzer%0A%0ADEFINE+ANALYZER+liquid_analyzer+TOKENIZERS+blank%2Cclass%2Ccamel%2Cpunct+FILTERS+snowball%28english%29%3B%0ADEFINE+INDEX+liquid_content+ON+liquids+FIELDS+content+SEARCH+ANALYZER+liquid_analyzer+BM25+HIGHLIGHTS%3B%0A%0A--+Retrieve+all+the+samples+containing+the+chemical+lead+will+also+bring+up+samples+that+simply+mention+the+word+lead%0A%0ASELECT%0A++sample%2C%0A++content%0AFROM+liquids%0AWHERE+content+%400%40+%27lead%27%3B&orientation=horizontal"
/>

If you read through the content of the tap water sample, you’ll notice that it does not contain any lead in it but it has the mention of the word `lead` under “The team lead by Dr. Rose…” which means that the team was guided by Dr. Rose.

The search pulled up both the records although the tap water sample had no lead in it. This example shows us that while [Full-Text Search](/docs/surrealdb/models/full-text-search) does a great job at matching query terms with indexed documents, it may not be the best solution for use cases where the query terms have deeper context and scope for ambiguity.

## Vector Search in SurrealDB

<Image
  alt="What is Vector Search"
  src={{
    light: LightImageVc,
    dark: DarkImageVc,
  }}
/>

The Vector Search feature of SurrealDB will help you do more and dig deeper into your data.

For example, still using the same `liquids` table, you can store the chemical composition of the liquid samples in a vector format.

```surql
-- Insert a sample & content field into a liquids table
INSERT INTO liquidsVector [
    {sample:'Sea water', content: 'The sea water contains some amount of lead', embedding: [0.1, 0.2, 0.3, 0.4] },
    {sample:'Tap water', content: 'The team lead by Dr. Rose found out that the tap water in was potable', embedding:[1.0, 0.1, 0.4, 0.3]},
    {sample:'Sewage water', content: 'High amounts of a were found in Sewage water', embedding : [0.4, 0.3, 0.2, 0.1]}
];
```
Notice that we have added an `embedding` field to the table. This field will store the vector embeddings of the content field so we can perform vector searches on it.

You have the option of using 3 different approaches for performing Vector search.

- [Bruteforce](/docs/surrealql/operators#brute-force-method)
- [Hierarchical navigable small world(HNSW)](/docs/surrealql/statements/define/indexes#hnsw-hierarchical-navigable-small-world)
- [M-Tree](/docs/surrealql/statements/define/indexes#m-tree-index)

As you want to perform a nearest neighbour search and not an exact search, you would typically use an index like [HNSW](/docs/surrealql/statements/define/indexes#hnsw-hierarchical-navigable-small-world) or [M-Tree](/docs/surrealql/statements/define/indexes#m-tree-index).



<SurrealistMini url="https://app.surrealdb.com/mini?setup=--+Insert+a+sample+%26+content+field+into+a+liquids+table%0AINSERT+INTO+liquidsVector+%5B%0A++++%7Bsample%3A%27Sea+water%27%2C+content%3A+%27The+sea+water+contains+some+amount+of+lead%27%2C+embedding%3A+%5B0.1%2C+0.2%2C+0.3%2C+0.4%5D+%7D%2C%0A++++%7Bsample%3A%27Tap+water%27%2C+content%3A+%27The+team+lead+by+Dr.+Rose+found+out+that+the+tap+water+in+was+potable%27%2C+embedding%3A%5B1.0%2C+0.1%2C+0.4%2C+0.3%5D%7D%2C%0A++++%7Bsample%3A%27Sewage+water%27%2C+content%3A+%27High+amounts+of+a+were+found+in+Sewage+water%27%2C+embedding+%3A+%5B0.4%2C+0.3%2C+0.2%2C+0.1%5D%7D%0A%5D%3B&query=--+Add+embeddings+for+what+lead+as+a+harmful+substance+should+be.+%0ALET+%24lead_harmful+%3D+%5B0.15%2C+0.25%2C+0.35%2C+0.45%5D%3B%0A%0A--+Define+a+vector+index+on+the+liquidsVector+table+for+embedding+field+%0ADEFINE+INDEX+mt_pts+ON+liquidsVector+FIELDS+embedding+MTREE+DIMENSION+4+DIST+COSINE+TYPE+F32%3B%0A%0A--+Select+the+sample+and+content+from+the+liquids+table+with+cosine+similarity+%0ASELECT+sample%2C+content%2C+vector%3A%3Asimilarity%3A%3Acosine%28embedding%2C+%24lead_harmful%29+AS+dist+FROM+liquidsVector+WHERE+embedding+%3C%7C2%7C%3E+%24lead_harmful%3B&orientation=horizontal"/>


In the example above you can see that the results are more accurate. The search pulled up only the `Sea water` sample which contains the harmful substance `lead` in it. This is the advantage of using Vector Search over Full-Text Search.

Another use-case for Vector Search is in the field of facial recognition. For example, if you wanted to search for an actor or actress who looked like you from an extensive dataset of movie artists, you would first use an ML model to convert the artist's images and details into vector embeddings and then use SurrealQL to find the artist with the most resemblance to your face vector embeddings. The more characteristics you decide to include in your vector embeddings, the higher the dimensionality of your vector will be, potentially improving the accuracy of the matches but also increasing the complexity of the vector search.

Now that you know how to handle a vector search query in SurrealDB, let's take a step back and understand some of its terms and concepts.

### How to store vector embeddings

To store vectors in SurrealDB, you typically define a field within your data schema dedicated to holding the vector data. These vectors represent space data points and can be used for various applications, from recommendation systems to image recognition. Below is an example of how to create records with vector embeddings:

```surql
CREATE Document:1 CONTENT {
  "items": [
    {
      "content": "apple",
      "embedding": [0.00995, -0.02680, -0.01881, -0.08697]
    }
  ]
};
```

The vector is represented as an array of floating-point numbers.

There are no strict rules or limitations regarding the length of the embeddings, and they can be as large as needed. Just keep in mind that larger embeddings lead to more data to process and that can affect performance and query times based on your physical hardware.

## Computation on Vectors: "vector::" Package of Functions

SurrealDB provides [Vector Functions](/docs/surrealql/functions/database/vector) for most of the major numerical computations done on vectors. They include functions for element-wise addition, division and even normalisation.

They also include similarity and distance functions, which help in understanding how similar or dissimilar two vectors are.
Usually, the vector with the smallest distance or the largest cosine similarity value (closest to 1) is deemed the most similar to the item you are trying to search for.

<Image
  alt="Vector functions available in SurrealDB"
  src={{
    light: LightDistanceMetrics,
    dark: DarkDistanceMetrics,
  }}
/>

The choice of distance or similarity function depends on the nature of your data and the specific requirements of your application.

In the liquids examples, we assumed that the embeddings represented the harmfulness of lead (as a substance). We used the [`vector::similarity::cosine`](/docs/surrealql/functions/database/vector#vectorsimilaritycosine) function because cosine similarity is typically preferred when absolute distances are less important, but proportions and direction matter more.

## Vector Indexes

When it comes to search, you can always use brute force.
In SurrealDB, you can use the [Brute force approach](/docs/surrealql/statements/define/indexes#brute-force-method) to search through your vector embeddings and data.

Brute force search compares a query vector against all vectors in the dataset to find the closest match. As this is a brute-force approach, you do not create an index for this approach.

The brute force approach for finding the nearest neighbour is generally preferred in the following use cases:

- Small Datasets / Limited Query vectors: For applications with small datasets, the overhead of building and maintaining an index might outweigh its benefits. In such cases, the brute force approach is optimal.

- Guaranteed Accuracy: Since the brute force method compares the query vector against every vector in the dataset, it guarantees finding the exact nearest vectors based on the chosen distance metric (like Euclidean, Manhattan, etc.).

- Benchmarking Models: The Brute force approach can be used as a reference, and help benchmark the performance of other approximate alternatives like HNSW

While brute force can give you exact results, it's computationally expensive for large datasets.

In most cases, you do not need a 100% exact match, and you can give it up for faster, high-dimensional searches to find the approximate nearest neighbour to a query vector.

This is where Vector indexes come in.

In SurrealDB, you can perform a vector search using the two primary indexes:

1. M-Tree Index:
    - The [M-Tree index](/docs/surrealql/statements/define/indexes#m-tree-index) is a metric tree-based index suitable for similarity search in metric spaces.
    - The M-Tree index can be configured with parameters such as the distance function to compare the vectors.
2. Hierarchical Navigable Small World (HNSW) Index:
    - [HNSW](https://en.wikipedia.org/wiki/Hierarchical_navigable_small_world) (Hierarchical Navigable Small World) is a state-of-the-art algorithm for approximate nearest neighbour search in high-dimensional spaces. It offers a balance between search efficiency and accuracy.
    - The [HNSW index](/docs/surrealql/statements/define/indexes#hnsw-hierarchical-navigable-small-world) is a proximity graph-based index.

By design, HNSW currently operates as an "in-memory" structure. Introducing persistence to this feature, while beneficial for retaining index states, is an ongoing area of development. Our goal is to balance the speed of data ingestion with the advantages of persistence.

You can also use the  [`REBUILD` statement](/docs/surrealql/statements/rebuild), which allows for the manual rebuilding of indexes as needed. This approach ensures that while we explore persistence options, we maintain the optimal performance that users expect from HNSW and MTree, providing flexibility and control over the indexing process.

Both indexes are designed to handle the challenges of searching in spaces where traditional indexing methods become inefficient. The choice between HNSW and M-Tree would depend on the application's specific requirements, such as the need for an exact versus approximate nearest neighbour search, the distance metric used, and the nature of the data.

## Filtering through Vector Search

The [`vector::distance::knn()`](/docs/surrealql/functions/database/vector#vectordistanceknn) function from SurrealDB returns the distance computed between vectors by the KNN operator. This operator can be used to avoid recomputation of the distance in every `select` query.

Consider a scenario where you’re searching for actors who look like you but they should have won an Oscar. You set a flag, which is true for actors who’ve won the golden trophy.

Let’s create a dataset of actors and define an HNSW index on the embeddings field.


> [!IMPORTANT]
> You need to be running SurrealDB version 2.0.0 or higher to use the `vector::distance::knn()` function.

```surql
-- Create a dataset of actors with embeddings and flags
CREATE actor:1 SET name = 'Actor 1', embedding = [0.1, 0.2, 0.3, 0.4], flag = true;
CREATE actor:2 SET name = 'Actor 2', embedding = [0.2, 0.1, 0.4, 0.3], flag = false;
CREATE actor:3 SET name = 'Actor 3', embedding = [0.4, 0.3, 0.2, 0.1], flag = true;
CREATE actor:4 SET name = 'Actor 4', embedding = [0.3, 0.4, 0.1, 0.2], flag = true;

-- Define an embbedding to represent a face
LET $person_embedding = [0.15, 0.25, 0.35, 0.45];

-- Define an HNSW index on the actor table
DEFINE INDEX hnsw_pts ON actor FIELDS embedding HNSW DIMENSION 4;

-- Select actors who look like you and have won an Oscar
SELECT id, flag, vector::distance::knn() AS distance FROM actor WHERE flag = true AND embedding <|2,40|> $person_embedding ORDER BY distance;
```

```surql
[
	[
		{
			distance: 0.09999999999999998f,
			flag: true,
			id: actor:1
		},
		{
			distance: 0.412310562561766f,
			flag: true,
			id: actor:4
		}
	]
];
```

`actor:1` and `actor:2` have the closest resemblance with your query vector and also have won an Oscar.

## Conclusion

Vector Search does not need to be complicated and overwhelming. Once you have your embeddings available, you can try out different vector functions in combination with your query vector to see what works best for your use case. As discussed in the reference guide, you have 3 options to perform Vector Search in SurrealDB. Based on the complexity of your data and accuracy expectations, you can choose between them. You can design your `select` statements to query your search results along with filters and conditions. In order to avoid recalculation of the KNN distance for every single query, you also have the [`vector::distance::knn()`](/docs/surrealql/functions/database/vector#vectordistanceknn).

Due to [GenAI](https://en.wikipedia.org/wiki/Generative_artificial_intelligence), most applications today deal with intricate data with layered meanings and characteristics. Vector search plays a big role in analyzing such data to find what you’re looking for or to make informed decisions.

You can start using Vector Search in SurrealDB by [installing SurrealDB](/docs/surrealdb/installation) on your machines or by using [Surrealist](/surrealist). And if you’re looking for a [quick video explaining Vector Search](https://www.youtube.com/watch?v=MqddPmgKSCs), check out our [YouTube channel](https://www.youtube.com/@SurrealDB).


---
sidebar_position: 7
sidebar_label: Performance Best Practices
title: Performance Best Practices | Reference guides
description: This guide outlines some key performance best practices for using SurrealDB 2.0. While SurrealDB offers powerful and flexible features to support you in meeting your desired performance standards, the use that you make of those features will ultimately determine whether or not you meet them.
---

# Performance Best Practices

This guide outlines some key performance best practices for using SurrealDB `v2.x.x`. While SurrealDB offers powerful and flexible features to help you meet your desired performance standards, your use of those features will ultimately determine whether or not you meet them.

To achieve the best performance from SurrealDB, there are a number of configuration options and runtime design choices to be considered which can improve and affect the performance of the database.

The following is a non-exhaustive list of performance best practices you should consider when building services and applications with SurrealDB to help you address common performance challenges while preventing frequent pitfalls.


## SurrealDB architecture

While SurrealDB is a [multi-model database](/blog/what-are-multi-model-databases), at its core, SurrealDB stores data in documents on transactional key-value stores.

This means that SurrealDB is a general-purpose databases optimised for a combination of various workloads such as operational, AI and real-time workloads.

While SurrealDB can perform well with real-time and advanced analytical workloads, its architecture is not columnar based. Therefore its not optimised for large ad-hoc analytical queries in the same way as specialised columnar data warehouses.

SurrealDB is built using a layered approach, with compute separated from the storage. This allows us, if necessary, to scale up the compute layer, and the storage layer independently from each other.

Read more about the [architecture of SurrealDB and the supported storage engines.](/docs/surrealdb/introduction/architecture)

## Running SurrealDB

### Using Surreal Cloud

The easiest way to run SurrealDB is using Surreal Cloud, which allows you to focus on building great products while we take care of running and maintaining it in the most performant and scalable way.

Read more about running SurrealDB [using Surreal Cloud](/cloud).

### Running SurrealDB as a server

When starting the SurrealDB server, it is important to run the server using the correct configuration options and
settings. For production environments or for performance benchmarking, the `--log` command-line argument or the
`SURREAL_LOG` environment variable should be set to `error`, `warn`, or `info` (the default option when not specified).

> [!NOTE]
>Other log verbosity levels (such as `debug`, `trace`, or `full`) are only for use in debugging, testing, or development scenarios. The verbosity of the log level impacts the performance by increasing the amount of information being logged for each single operation.

When starting up the SurrealDB binary ensure that the `--log` argument is omitted, or specifically set to the correct
log verbosity level. Additionally, ensure that the `rocksdb` storage engine is used to store data.

```sh
surreal start --log info rocksdb://path/to/mydatabase
```

When starting up the SurrealDB Docker container ensure that the `--log` argument is omitted, or specifically set to the
correct log verbosity level.

```sh
docker run --rm --pull always -p 8000:8000 surrealdb/surrealdb:latest start --log info rocksdb://path/to/mydatabase
```

Read more about running SurrealDB as a [single-node server](/docs/surrealdb/installation/running/file) or [multi-node cluster](/docs/surrealdb/installation/running/tikv).

### Running SurrealDB embedded in Rust

When running SurrealDB as an embedded database within Rust, using the correct release profile and memory allocator can
greatly improve the performance of the database core engine. In addition using an optimised asynchronous runtime
configuration can help speed up concurrent queries and increase database throughput.

In your project's `Cargo.toml` file, ensure that the release profile uses the following configuration:

```toml
[profile.release]
lto = true
strip = true
opt-level = 3
panic = 'abort'
codegen-units = 1
```

In your project's `Cargo.toml` file, ensure that the `allocator` feature is enabled on the `surrealdb` dependency:

```toml
surrealdb = { version = "2", features = ["allocator", "storage-mem", "storage-surrealkv", "storage-rocksdb", "protocol-http", "protocol-ws", "rustls"] }
```

When running SurrealDB within your Rust code, ensure that the asynchronous runtime is configured correctly, making use
of multiple threads, an increased stack size, and an optimised number of threads:

```toml
tokio = { version = "1.41.1", features = ["sync", "rt-multi-thread"] }
```

```rs
fn main() {
	tokio::runtime::Builder::new_multi_thread()
    .enable_all()
    .thread_stack_size(10 * 1024 * 1024) // 10MiB
    .build()
    .unwrap()
    .block_on(async {
      // Your application code
    })
}
```

Read more about [running SurrealDB embedded in Rust.](/docs/surrealdb/embedding/rust)

### Running SurrealDB embedded in Tauri

When running SurrealDB as an embedded database within Rust, default options of Tauri can make SurrealDB run slower, as
it processes and outputs the database information logs. Configuring Tauri correctly, can result in much improved
performance with the core database engine and any queries which are run on SurrealDB.

When building a desktop application with Tauri, ensure that the Tauri plugin log is disabled by configuring the
`tauri.conf.json` file:

```json
{
	"plugins": {
		"logger": {
			"enabled": false
			}
	}
}
```

Alternatively you can disable logs at compile time when building your Tauri app:

```bash
TAURI_LOG_LEVEL=off cargo tauri build
```

## Performing queries

### Selecting single records

Certain queries in SurrealDB can be more efficiently written in certain ways which ensure that full table scans or indexes are not necessary when executing the query.

In traditional SQL, the following query can be used to query for a particular row from a table:

```surql
SELECT *
FROM user
WHERE id = 19374837491;
```

However, currently in SurrealDB this query will perform a scan to find the record, although this is not necessary and you don't need to index the id field when using SurrealDB. Instead the following query can be used to select the specific record without needing to perform any scan:

```surql
SELECT *
FROM user:19374837491;
```

### Selecting multiple records

In traditional SQL, the following queries can be used to query for getting particular rows from a table:

```surql
-- Selecting individual IDs
SELECT *
FROM user
WHERE id = 19374837491
   OR id = 12647931632;
```

```surql
-- Selecting a range of IDs
SELECT *
FROM user
WHERE id >= 12647931632
   AND id <= 19374837491;
```

However, currently in SurrealDB this query will perform a scan to find the record, although this is not necessary and you don't need to index the id field when using SurrealDB. Instead the following query can be used to select the specific record without needing to perform any scan:

```surql
-- Selecing indiviudal IDs
SELECT *
FROM user:19374837491, user:12647931632;
```

```surql
-- Selecting a range of IDs
SELECT *
FROM user:12647931632..=19374837491;
```

### Simplifying logic in `WHERE` clauses

If a `WHERE` clause cannot be avoided, performance can still be improved by optimizing the portion after the `WHERE` clause. As a boolean check is the simplest possible operation, having a boolean field that can be used in a `WHERE` clause can significantly improve performance.

```surql
-- Fill up the database a bit with 10,000 records
CREATE |person:10000| SET
    random_data = rand::string(1000),
    data_length = random_data.len(),
    is_short = data_length < 10 RETURN NONE;
-- Add one outlier
CREATE person:one SET
    random_data = "HI!",
    data_length = random_data.len(),
    is_short = data_length < 10 RETURN NONE;

-- Function call + compare operation: slowest
SELECT * FROM person WHERE random_data.len() < 10;
-- Compare operation: much faster
SELECT * FROM person WHERE data_length < 10;
-- Boolean check: even faster
SELECT * FROM person WHERE is_short;
-- Direct record access: almost instantaneous
SELECT * FROM person:one;
```

## Using indexes

SurrealDB has native built-in support for a number of different index types, without leveraging external libraries or
implementations.

With native support for indexes in the core database engine, SurrealDB leverages indexes where possible within the SurrealQL query language, without pushing queries down to a separate indexing engine. 

In addition, data is indexed in the same way for embedded systems, single-node database servers, and multi-node highly-available clusters, ensuring that the same indexing functionality is available regardless of the SurrealDB deployment model. 

Indexing support in SurrealDB is in active development, with work focusing on increased support for additional operators, compound indexes, additional index types, and overall improved index performance.

> [!NOTE]
> Currently no indexes are used when performing `UPDATE` or `DELETE` queries on large table, even where indexes are defined.
> We'll be adding support for indexes within `UPDATE`, `UPSERT`, and `DELETE` statements in SurrealDB release `v2.3.0`.

In the meantime, you can improve the performance of `UPDATE` and `DELETE` statements by combining these with a `SELECT` statement.

To improve the performance of an `UPDATE` statement, use a `SELECT` statement within a subquery, selecting only the `id`
field. This will use any defined indexes:

```surql
UPDATE (SELECT id FROM user WHERE age < 18)
SET adult = false;
```

To improve the performance of an `DELETE` statement, use a `SELECT` statement within a subquery, selecting only the `id`
field. This will use any defined indexes:

```surql
DELETE (SELECT id FROM user WHERE age < 18);
```

### Index strategies explained

When using `SELECT`, SurrealDB uses a query planner whose role is to identify if it can use the index to speed the
execution of the query.

Without indexes, SurrealDB will operate a `SELECT` query on a table by using the table iterator. It mainly scans every
record of a given table. If there is a condition (`WHERE ...`), an ordering (`ORDER BY ...`), or an aggregation (`GROUP
BY ...`), it will load the value in memory and execute the operation. This process is commonly called a "table full
scan".

```surql
SELECT *
FROM user
WHERE age < 18
EXPLAIN;
```

```surql title="Output"
[
	{
		detail: {
			table: 'user'
		},
		operation: 'Iterate Table'
	},
	{
		detail: {
			type: 'Memory'
		},
		operation: 'Collector'
	}
]
```

Under certain conditions, if an index exists, and the condition or ordering involves exclusively fields that are
indexed, the query planner will suggest an execution plan that involves one or multiple indexes to achieve these
potential optimisations:

- Only collect records that match the condition(s), as opposed to performing a table full scan.
- As the index already stores the records in order, the scanning collects the records pre-ordered, sparing an additional ordering phase.

```surql
DEFINE INDEX idx_user_age ON user FIELDS age;

SELECT age
FROM user
WHERE age > 18
EXPLAIN;
```

```surql title="Output"
[
	{
		detail: {
			plan: {
				from: {
					inclusive: false,
					value: 18
				},
				index: 'idx_user_age',
				to: {
					inclusive: false,
					value: NONE
				}
			},
			table: 'user'
		},
		operation: 'Iterate Index'
	},
	{
		detail: {
			type: 'Memory'
		},
		operation: 'Collector'
	}
]
```

If there are several clauses separated with `OR` operators, the query planner may do several index-based iterations:

```surql
SELECT age
FROM user
WHERE age < 7
   OR age > 77
EXPLAIN;
```

```surql title="Output"
[
	{
		detail: {
			plan: {
				from: {
					inclusive: false,
					value: NONE
				},
				index: 'idx_user_age',
				to: {
					inclusive: false,
					value: 7
				}
			},
			table: 'user'
		},
		operation: 'Iterate Index'
	},
	{
		detail: {
			plan: {
				from: {
					inclusive: false,
					value: 77
				},
				index: 'idx_user_age',
				to: {
					inclusive: false,
					value: NONE
				}
			},
			table: 'user'
		},
		operation: 'Iterate Index'
	},
	{
		detail: {
			type: 'Memory'
		},
		operation: 'Collector'
	}
]
```

### Use `UPSERT` to take advantage of unique indexes

`UPSERT` statements have a unique performance advantage when paired with a unique index.

A unique index on its own is used to prevent more than one record from containing the same data, such as a name or email address.

```surql
DEFINE INDEX email_index ON user FIELDS email UNIQUE;

CREATE user SET email = "bob@bob.com";
CREATE user SET email = "bob@bob.com";
```

```surql title="Output"
"Database index `email_index` already contains 'bob@bob.com', with record `user:g7s070gqvh3lj7fdp26w`"
```

An `UPSERT` statement works like a `CREATE` statement in this case as well, except that if the value for `email` is already present, it will modify the existing record instead of creating a new one. An `UPSERT` will only fail in this case if a user attempts to upsert to a certain record ID (like `user:bob` instead of just the `user` table) when another record holds this value.

The key point here is that in either case, `UPSERT` is using the index to find the record instead of a table scan.

```surql
DEFINE INDEX email_index ON user FIELDS email UNIQUE;

CREATE user SET email = "bob@bob.com";

-- Checks index, finds existing user via email "bob@bob.com", modifies it
UPSERT user SET email = "bob@bob.com", name = "Bob Bobson";

-- Checks index, fails as a new `user:bob` cannot be created with the same email
UPSERT user:bob SET email = "bob@bob.com", name = "Bob Bobson";
```

As such, when updating a single record on a table that contains a unique index, `UPSERT` is much more performant than `UPDATE`.

```surql
DEFINE INDEX email_index ON user FIELDS email UNIQUE;

-- Create 50,000 users to fill up the database
CREATE |user:50000| RETURN NONE;

-- Create Bob
CREATE user SET email = "bob@bob.com";

-- Don't do this: full table scan to find and update a record
UPDATE user SET name = "Bob Bobson" WHERE email = "bob@bob.com";

-- Do this instead: use the index instead to go directly to the record, no table scan
UPSERT user SET name = "Bob Bobson", email = "bob@bob.com";
```

### Index lookup on remote fields

SurrealDB document record IDs store both the table name and the record identifier. This design provides a
straightforward and consistent way to reference records across the database. One particularly powerful feature is the
ability to filter a table based on conditions that relate to a referenced table.

Here is a concrete example, where the statement `SELECT * FROM access WHERE user.role = 'admin'` will retrieve records
from the `access` table for which the referenced record in the `user` table has the `name` field set to 'admin'.

Consider the following example:

```surql
DEFINE FIELD user ON TABLE access TYPE record<user>;

CREATE user:1 SET name = 'foo', role = 'admin';
CREATE user:2 SET name = 'bar', role = 'admin';

CREATE access:A SET user = user:1;
CREATE access:B SET user = user:2;

SELECT *
FROM access
WHERE user.role = 'admin'
```

The query retrieves records from the `access` table whose associated record in the `user` table has the role `field` set
to 'admin'.

```surql title="Output"
[
	{
		id: access:A,
		user: user:1
	},
	{
		id: access:B,
		user: user:2
	}
]
```

To optimize this query, you can create indexes on both the `user.role` field and the `access.user` field.
With these indexes, the query planner can leverage an index-based join strategy:

```surql
DEFINE INDEX idx_user_role ON TABLE user COLUMNS role;
DEFINE INDEX idx_access_user ON TABLE access COLUMNS user;

SELECT *
FROM access
WHERE user.role = 'admin' 
EXPLAIN;
```

```surql title="Output"
[
	{
		detail: {
			plan: {
				index: 'idx_access_user',
				joins: [
					{
						index: 'idx_user_role',
						operator: '=',
						value: 'admin'
					}
				],
				operator: 'join'
			},
			table: 'access'
		},
		operation: 'Iterate Index'
	},
	{
		detail: {
			type: 'Memory'
		},
		operation: 'Collector'
	}
]
```

---
sidebar_position: 8
sidebar_label: Sample Industry Schemas
title: Simple sample schemas by industry to get started
description: Find a sample schema or two for your industry to copy and paste and modify to your own needs.
---

# Sample schemas by industry

This page contains a number of sample schemas, each about 50 lines in length, that can be used to get started on a schema of your own for your own industry.

Have a request for an industry not yet in this page? [Get in touch](/contact) and let us know.

### Adding to this page

Have a sample schema of your own that you'd like to add? If it's about 50 lines in length then feel free to [make a PR](https://github.com/surrealdb/docs.surrealdb.com/edit/main/src/content/doc-surrealdb/reference-guide/sample-industry-schemas.mdx) and we'll credit the addition with a link to your profile on a code hosting platform (e.g. GitHub, GitLab, Codeberg).

## Energy and manufacturing

### Project planning

A comprehensive project management schema that demonstrates activity scheduling, milestone tracking, and dependency management using [graph relationships](/docs/surrealdb/models/graph). This schema shows how to model complex project workflows with interdependent tasks and progress tracking using [futures](/docs/surrealql/statements/define/field#futures) for calculated fields.

```surql
-- Activities in a project schedule
DEFINE TABLE activity SCHEMAFULL;
DEFINE FIELD name         ON activity TYPE string;
DEFINE FIELD description  ON activity TYPE option<string>;
DEFINE FIELD start        ON activity TYPE datetime;
DEFINE FIELD end          ON activity TYPE datetime;
DEFINE FIELD duration     ON activity VALUE <future> { end - start };
DEFINE FIELD progress     ON activity TYPE float ASSERT $value IN 0.0..=1.0;
DEFINE FIELD assigned_to  ON activity TYPE option<record<employee>>;
DEFINE FIELD followed_by  ON activity VALUE <future> { <-depends_on<-activity };

-- Milestones
DEFINE TABLE milestone SCHEMAFULL;
DEFINE FIELD project      ON milestone TYPE record<project>;
DEFINE FIELD activities   ON milestone TYPE array<record<activity>>;
DEFINE FIELD name         ON milestone TYPE string;
DEFINE FIELD last_updated ON milestone VALUE time::now();
DEFINE FIELD progress     ON milestone VALUE <future> { math::mean(activities.progress) };
DEFINE FIELD is_complete  ON milestone VALUE <future> { activities.all(|$a| $a.progress > 0.95) };

-- Graph-style dependency links
DEFINE TABLE depends_on SCHEMAFULL TYPE RELATION IN activity OUT activity;
DEFINE TABLE activity_of SCHEMAFULL TYPE RELATION IN activity OUT project;

CREATE project:one;

CREATE activity:one SET name = "Project kickoff", start = time::now(), end = time::now() + 2d, progress = 1.0, project = project:one;
CREATE activity:two SET name = "Pour concrete", start = time::now() + 90d, end = time::now() + 100d, progress = 0.0, project = project:one;
CREATE activity:three SET name = "Dry concrete", start = time::now() + 100d, end = time::now() + 107d, progress = 0.0, project = project:two;
CREATE activity:four SET name = "Build on top of concrete", start = time::now() + 107d, end = time::now() + 150d, progress = 0.0, project = project:two;

RELATE activity:two->depends_on->activity:one;
RELATE activity:three->depends_on->activity:two;
RELATE activity:four->depends_on->activity:three;
RELATE [activity:one,activity:two,activity:three, activity:four]->activity_of->project:one;

CREATE milestone:one SET project = project:one, activities = [activity:one], name = "Project start";
CREATE milestone:two SET project = project:one, activities = [activity:two, activity:three, activity:four], name = "Initial construction";

-- See all graph connections between activity and project records
SELECT *, ->?, <-? FROM activity, project;

-- View the current milestones
SELECT * FROM milestone;
```

### SCADA (Oil and Gas)

Industrial monitoring and control system schema for oil and gas operations. Demonstrates real-time sensor data collection, automated alert generation using [events](/docs/surrealql/statements/define/event), and [time-series data management](/docs/surrealdb/models/time-series) with composite keys. Shows how to handle flexible external data integration and [live query monitoring](/docs/surrealql/statements/live).

```surql
DEFINE TABLE sensor SCHEMAFULL;
DEFINE FIELD type ON sensor TYPE array<string> ASSERT $value ALLINSIDE ["pressure", "temperature", "flow", "level"];
DEFINE FIELD location         ON sensor TYPE point;

DEFINE TABLE reading SCHEMAFULL;
DEFINE FIELD id               ON reading TYPE [record<sensor>, datetime];
DEFINE FIELD pressure         ON reading TYPE float;
-- Optional telemetry values
DEFINE FIELD temperature      ON reading TYPE option<float>;
DEFINE FIELD humidity         ON reading TYPE option<float>;
-- Flexible object for weather or external data
DEFINE FIELD weather          ON reading TYPE option<object> FLEXIBLE;

DEFINE TABLE alert SCHEMAFULL;
DEFINE FIELD equipment    ON alert TYPE record<sensor>;
DEFINE FIELD severity     ON alert TYPE string ASSERT $value IN ["critical", "high", "medium", "low", "info"];
DEFINE FIELD message      ON alert TYPE string;
DEFINE FIELD triggered_at ON alert TYPE datetime;

-- Create a sensor
CREATE sensor:one SET type = ["temperature", "pressure"], location = (50.0, 50.0);
-- And a reading for the sensor
CREATE reading:[sensor:one, time::now()] SET 
    pressure = 600,
    -- JSON object sourced from somewhere else, `weather` field is FLEXIBLE so can be any object format
    weather = { "temperature": 17.4, "humidity": 52.0, "wind_speed": 12.8 };

-- Set up event to generate alerts
DEFINE EVENT alert_from_create ON reading WHEN $event = "CREATE" THEN {
    LET $source = $after.id[0];
    LET $time = $after.id[1];
    -- Select everything over the past 15 minutes up to but not including the present reading
    LET $recents_average = math::mean(SELECT VALUE pressure FROM reading:[$source, $time - 15m]..[$source, $time]);
    LET $drop = $recents_average - $after.pressure;
    IF $drop > 15 {
      CREATE alert SET
            equipment = $source,
            severity = "high",
            message = "Pressure drop over 15 PSI: drop of " + <string>$drop,
            triggered_at = time::now();
    };
};

-- Some readings with good values
FOR $_ IN 0..10 {
    -- Sleep to keep timestamp in IDs unique, consider a ULID instead if timestamps may not be unique
    sleep(10ns);
    CREATE reading:[sensor:one, time::now()] SET pressure = 600;
};
-- Pressure has suddenly dropped
CREATE reading:[sensor:one, time::now()] SET pressure = 500;

-- See the alert
SELECT * FROM alert;
-- Or use a LIVE SELECT for alerts: https://surrealdb.com/docs/surrealql/statements/live
LIVE SELECT * FROM alert;
```

### Risk management

Project risk assessment and mitigation tracking schema. Features temporal risk modeling with active/inactive periods, probability-impact calculations, and automated risk scoring using [futures](/docs/surrealql/statements/define/field#futures). Demonstrates [unique constraints](/docs/surrealql/statements/define/indexes#unique-indexes) and complex mathematical aggregations across related records.

```surql
DEFINE TABLE risk SCHEMAFULL;
DEFINE FIELD project        ON risk TYPE record<project>;
DEFINE FIELD description    ON risk TYPE string;
DEFINE FIELD category       ON risk TYPE string; -- e.g. "technical", "commercial", "regulatory"
DEFINE FIELD likelihood     ON risk TYPE float ASSERT $value IN 0.0..=1.0;
DEFINE FIELD maximum_impact ON risk TYPE int; -- in dollars, etc.
DEFINE FIELD start          ON risk TYPE datetime;
DEFINE FIELD end            ON risk TYPE datetime;
-- Use a future to calculate value on each SELECT
DEFINE FIELD active         ON risk VALUE <future> { time::now() IN start..=end };
-- Ensure no duplicate `risk` records exist for each project
DEFINE INDEX risk_name      ON risk FIELDS project, description UNIQUE;

-- See all total_impact
DEFINE FIELD total_risk_impact ON project VALUE <future> {
    math::sum((SELECT * FROM risk WHERE project = $parent.id).map(|$risk| $risk.maximum_impact * $risk.likelihood))
};

-- See risks at the current date
DEFINE FIELD current_risk_impact ON project VALUE <future> {
    math::sum((SELECT * FROM risk WHERE project = $parent.id).filter(|$r| $r.active).map(|$risk| $risk.maximum_impact * $risk.likelihood))
};

CREATE project:one;

CREATE risk SET
    project = project:one,
    description = "Migratory elk",
    category = "regulatory",
    likelihood = 0.9,
    start = d'2025-10-01',
    end = d'2025-12-15',
    maximum_impact = 1000000;

CREATE risk SET
    project = project:one,
    description = "Wildfires",
    category = "technical",
    likelihood = 0.5,
    start = d'2025-06-01',
    end =d'2025-10-15',
    maximum_impact = 10000000;

SELECT * FROM project;
```

### Supply chain and contract management

Vendor relationship and contract lifecycle management schema. Covers contract value tracking with change orders, deliverable management, and automated total commitment calculations using [futures](/docs/surrealql/statements/define/field#futures). Demonstrates complex financial calculations and status tracking across multiple related entities.

```surql
-- Vendors who supply goods or services
DEFINE TABLE vendor SCHEMAFULL;
DEFINE FIELD name ON vendor TYPE string;

-- Contracts awarded under a project
DEFINE TABLE contract SCHEMAFULL;
DEFINE FIELD project        ON contract TYPE record<project>;
DEFINE FIELD vendor         ON contract TYPE record<vendor>;
DEFINE FIELD title          ON contract TYPE string;
DEFINE FIELD original_value ON contract TYPE int;
DEFINE FIELD total_value    ON contract VALUE <future> { 
    original_value + math::sum(SELECT VALUE amount FROM change_order WHERE contract = $parent.id)
};
DEFINE FIELD currency ON contract TYPE "dollars" | "euro";
DEFINE FIELD start   ON contract TYPE datetime;
DEFINE FIELD end     ON contract TYPE datetime;

-- Deliverables expected under a contract
DEFINE TABLE deliverable SCHEMAFULL;
DEFINE FIELD contract    ON deliverable TYPE record<contract>;
DEFINE FIELD description ON deliverable TYPE string;
DEFINE FIELD due_date    ON deliverable TYPE datetime;
DEFINE FIELD received    ON deliverable TYPE option<datetime>;
DEFINE FIELD status      ON deliverable VALUE <future> { IF $parent.received { "complete" } ELSE { "pending" } };

-- Change orders during a project
DEFINE TABLE change_order SCHEMAFULL;
DEFINE FIELD contract    ON change_order TYPE record<contract>;
DEFINE FIELD amount      ON change_order TYPE int;
DEFINE FIELD description ON change_order TYPE string;
DEFINE FIELD signed_on   ON change_order TYPE option<datetime>;

-- Total committed value of a project (sum of all contract values)
DEFINE FIELD total_commitment ON project VALUE <future> {
  math::sum((SELECT VALUE value FROM contract WHERE project = $parent.id))
};

CREATE project:one;
CREATE vendor:one SET name = "Good vendor";
    CREATE contract:one SET project = project:one, currency = "euro", start = d'2025-12-01', end = d'2026-01-01', original_value = 1000, title = "Services for so-and-so project", vendor = vendor:one;
CREATE change_order SET contract = contract:one, amount = 500, description = "Highway wasn't set up yet";
SELECT * FROM contract;
```

### HSSE (Health, Safety, Security, Environment) incidents

Incident reporting and investigation schema using [graph relationships](/docs/surrealdb/models/graph). Models safety events as edges between employees and projects with severity classification and role identification. Demonstrates graph-style data modeling for complex incident tracking and analysis.

```surql
-- Projects and employees (nodes)
DEFINE TABLE project SCHEMAFULL;
DEFINE TABLE employee SCHEMAFULL;

-- Edges: incident links employee → project
DEFINE TABLE incident SCHEMAFULL TYPE RELATION IN project OUT employee;

DEFINE FIELD severity     ON incident TYPE string ASSERT $value IN ["minor", "moderate", "major", "fatal"];
DEFINE FIELD type         ON incident TYPE string ASSERT $value IN ["safety", "environment", "security", "health"];
DEFINE FIELD description  ON incident TYPE string;
DEFINE FIELD occurred_at  ON incident TYPE datetime;
DEFINE FIELD role         ON incident TYPE string ASSERT $value IN ["witness", "injured", "involved"];

-- Create nodes
CREATE employee:one SET name = "John Doe";
CREATE employee:two SET name = "Sally Lee";
CREATE project:one  SET name = "Pad 3 Expansion";

-- Create incidents as edges with properties
RELATE employee:one->incident->project:one SET 
  severity = "moderate", 
  type = "safety",
  description = "Pinched hand during pipe fitting",
  occurred_at = time::now() - 5d,
  role = "injured";

RELATE employee:two->incident->project:one SET 
  severity = "moderate",
  type = "safety",
  description = "Pinched hand during pipe fitting",
  occurred_at = time::now() - 5d,
  role = "witness";

SELECT id, <-incident[WHERE severity = "moderate"]<-employee FROM project;
```


## Finance

### General bank schema (graph schema)

Multi-currency banking system using [graph relationships](/docs/surrealdb/models/graph). Demonstrates polymorphic account types (JPY, EUR, CAD, USD) with different field structures, customer-bank relationships, and [unique constraint enforcement](/docs/surrealql/statements/define/indexes#unique-indexes). Shows how to model complex financial relationships with type-specific behaviors.

```surql
DEFINE TABLE bank SCHEMAFULL;
DEFINE FIELD name     ON bank TYPE string;

DEFINE TABLE customer SCHEMAFULL;
DEFINE FIELD name ON customer TYPE string;

DEFINE TABLE customer_of TYPE RELATION IN customer OUT bank;
DEFINE FIELD since ON customer_of TYPE datetime VALUE time::now() READONLY;

DEFINE TABLE jpy SCHEMAFULL;
DEFINE FIELD amount ON jpy TYPE int DEFAULT 0;
DEFINE FIELD cent ON jpy TYPE int READONLY VALUE 0;

DEFINE TABLE eur SCHEMAFULL;
DEFINE FIELD amount ON eur TYPE int DEFAULT 0;
DEFINE FIELD cent   ON eur TYPE int ASSERT $value IN 0..=99;
DEFINE FIELD total  ON eur VALUE amount + (<float>$parent.cent / 100);

DEFINE TABLE cad SCHEMAFULL;
DEFINE FIELD amount ON cad TYPE int DEFAULT 0;
DEFINE FIELD cent   ON cad TYPE int ASSERT $value IN 0..=99;
DEFINE FIELD total  ON cad VALUE $parent.amount + (<float>$parent.cent / 100);

DEFINE TABLE usd SCHEMAFULL;
DEFINE FIELD amount ON usd TYPE int DEFAULT 0;
DEFINE FIELD cent   ON usd TYPE int ASSERT $value IN 0..=99;
DEFINE FIELD total  ON usd VALUE $parent.amount + (<float>$parent.cent / 100);

DEFINE TABLE account TYPE RELATION IN customer OUT jpy|eur|cad|usd;
DEFINE FIELD since ON account TYPE datetime VALUE time::now() READONLY;

-- stop the same customer opening two wallets in the same currency
DEFINE INDEX unique_wallet ON account FIELDS in, out UNIQUE;

CREATE bank:one SET name = "Central Bank";
CREATE customer:one SET name = "Billy";
RELATE customer:one->customer_of->bank:one;
RELATE customer:one->account->(CREATE ONLY eur SET amount = 100, cent = 50);
RELATE customer:one->account->(CREATE ONLY jpy SET amount = 10000);

SELECT ->account->eur.total FROM customer:one;
```

### Other bank-customer schema

Traditional bank-customer schema with advanced features including [record references](/docs/surrealql/datamodel/records#record-references), automated cent handling through [events](/docs/surrealql/statements/define/event), and historical interest rate tracking. Demonstrates event-driven data validation, [parameter usage](/docs/surrealql/statements/define/param), and complex relationship management with reference fields.

```surql
DEFINE PARAM $CURRENCIES VALUE ["EUR", "JPY", "USD", "CAD"];

DEFINE TABLE account SCHEMAFULL;
DEFINE FIELD customer ON account TYPE record<customer> REFERENCE;
DEFINE FIELD currency ON account TYPE string ASSERT $value IN $CURRENCIES;
DEFINE FIELD amount   ON account TYPE int;
DEFINE FIELD cent     ON account TYPE option<int>;

DEFINE TABLE bank SCHEMAFULL;
DEFINE FIELD name         ON bank TYPE string;
DEFINE FIELD code         ON bank TYPE string;  -- e.g., BIC or internal short code
DEFINE FIELD swift        ON bank TYPE option<string>;
DEFINE FIELD supported_currencies ON bank TYPE set<string> ASSERT $value ALLINSIDE $CURRENCIES;
DEFINE FIELD interest_rate ON bank TYPE float DEFAULT 0.0;
DEFINE FIELD historical_interest_rates ON bank TYPE array<{ rate: float, set_at: datetime }> DEFAULT [];
DEFINE FIELD customers ON bank TYPE references<customer>;

DEFINE TABLE customer SCHEMAFULL;
DEFINE FIELD bank     ON customer TYPE record<bank> REFERENCE;

-- No assert for cent field, but event to update when > 100 or < 0
DEFINE EVENT update_cents ON account WHEN $event = "UPDATE" THEN {
    IF cent > 99 {
        UPDATE $after SET cent -= 100, amount += 1;
    } ELSE IF cent < 0 {
        UPDATE $after SET cent += 100, amount -= 1;
    }
};

-- No assert for cent field, but event to update when > 100 or < 0
DEFINE EVENT update_interest_rate ON bank WHEN $event = "UPDATE" THEN {
    IF $before.interest_rate != $after.interest_rate {
        UPDATE $this SET historical_interest_rates += { rate: $after.interest_rate, set_at: time::now() };
    }
};

CREATE bank:one SET name = "Bank of One", code = "ONEBANK", supported_currencies = ["EUR", "JPY"];
UPDATE bank:one SET interest_rate = 5.0;
CREATE customer:one SET bank = bank:one;
CREATE account:one SET customer = customer:one, bank = bank:one, currency = "JPY", amount = 10000;

SELECT * FROM bank FETCH customers;
```

### Customers and money transfers

Secure money transfer system with credit-based limits and transaction logging. Features [custom functions](/docs/surrealql/statements/define/function) for atomic transfers, credit level enforcement, and comprehensive audit trails. Demonstrates transaction safety, business rule enforcement, and financial data integrity.

```surql
DEFINE TABLE customer SCHEMAFULL;
-- trusted customers can have greater negative amounts
DEFINE FIELD amount ON customer ASSERT $value >= -1000 * credit_level;
DEFINE FIELD credit_level ON customer TYPE int ASSERT $value IN 0..=5;

-- Logs for money transfers
DEFINE TABLE transfer SCHEMAFULL;
DEFINE FIELD from     ON transfer TYPE record<customer>;
DEFINE FIELD to       ON transfer TYPE record<customer>;
DEFINE FIELD amount   ON transfer TYPE int;
DEFINE FIELD ts       ON transfer TYPE datetime DEFAULT time::now();

DEFINE FUNCTION fn::send_money($from: record<customer>, $to: record<customer>, $amount: int) {
-- Use manual transaction for all statements so all changes are rolled back
-- if something is wrong
    BEGIN;
    If $amount < 1 {
        THROW "Can't send less than 1 ";
    };
    UPDATE $from SET amount -= $amount;
    UPDATE $to SET amount += $amount;
    CREATE transfer SET from = $from, to = $to, amount = $amount;
    COMMIT;
};

CREATE customer:one SET amount = 100, credit_level = 0;
CREATE customer:two SET amount = 500, credit_level = 5;

-- customer:one has bad credit, can't be negative
fn::send_money(customer:one, customer:two, 500);
-- but customer:two can
fn::send_money(customer:two, customer:one, 1000);

SELECT * FROM customer;
SELECT * FROM transfer;
```

### Loans and repayments

Loan management system with automated interest calculations and repayment scheduling. Features [parameterized loan terms](/docs/surrealql/statements/define/param), mathematical payment calculations using [custom functions](/docs/surrealql/statements/define/function), and status tracking. Demonstrates complex financial formulas, temporal data management, and regulatory compliance constraints.

```surql
-- Some government-set maximum term for loans
DEFINE PARAM $MAX_TERM VALUE 84;

DEFINE TABLE loan SCHEMAFULL;
DEFINE FIELD customer      ON loan TYPE record<customer>;
DEFINE FIELD principal     ON loan TYPE int; -- Total borrowed, in cents
DEFINE FIELD interest_rate ON loan TYPE float; -- e.g., 5.5 for 5.5%
DEFINE FIELD issued_at     ON loan TYPE datetime;
-- loans issuable at units of 6 months each
DEFINE FIELD term_months   ON loan TYPE int ASSERT $value % 6 = 0 AND $value <= $MAX_TERM;
DEFINE FIELD balance       ON loan TYPE int; -- Remaining amount to repay
DEFINE FIELD status        ON loan TYPE string ASSERT $value IN ["active", "paid", "defaulted"];

DEFINE TABLE repayment SCHEMAFULL;
DEFINE FIELD loan       ON repayment TYPE record<loan>;
DEFINE FIELD due_date   ON repayment TYPE datetime;
DEFINE FIELD amount     ON repayment TYPE int;
DEFINE FIELD paid       ON repayment TYPE bool DEFAULT false;
DEFINE FIELD paid_at    ON repayment TYPE option<datetime>;
DEFINE FIELD method     ON repayment TYPE option<string>; -- e.g., "auto", "manual"

FOR $loan IN SELECT * FROM loan {
    LET $update_rate = 1 + ($loan.interest_rate / 365);
    UPDATE $loan SET amount = amount * $update_rate;
};

DEFINE FUNCTION fn::repayment_amount($loan: record<loan>) {
    LET $P = $loan.principal;
    LET $annual = $loan.interest_rate / 100;
    LET $r = $annual / 12;              -- Monthly interest rate
    LET $n = $loan.term_months;

    math::round(
        $P * $r / (1 - math::pow(1 + $r, -$n))
    );
};

CREATE customer:one;
CREATE loan:one SET customer = customer:one, principal = 5000000, interest_rate = 5.0, issued_at = time::now(), term_months = 12, balance = 5000000, status = "active";
UPDATE loan:one SET balance -= fn::repayment_amount(loan:one);
```

### Fraud prevention patterns

Anti-fraud detection system using [events](/docs/surrealql/statements/define/event) and temporal analysis. Implements velocity checks, new account restrictions, and suspicious transaction pattern detection. Demonstrates real-time fraud prevention, temporal constraints, and complex business rule enforcement through database events.

```surql
DEFINE FIELD created_at ON account VALUE time::now() READONLY;
DEFINE EVENT cancel_high_volume ON TABLE sends WHEN $event = "CREATE" THEN {
    IF $after.amount > 1000 AND time::now() - $after.in.created_at < 1d {
        THROW "New accounts can only send up to $1000 per transaction";
    }
};

DEFINE FIELD sent_at ON TABLE sends VALUE time::now() READONLY;

DEFINE EVENT cancel_high_volume ON TABLE sends WHEN $event = "CREATE" THEN {
    LET $sender = $after.in;
    LET $receiver = $after.out;
    -- Disallow more than two transactions within a 5 minute period
    LET $recents = 
        $sender->sends[WHERE out = $receiver]
        .filter(|$tx| time::now() - $tx.sent_at < 5m);
    IF $recents.len() > 2 {
        THROW "Can't send that many times within a short period of time";
    };
};
```

### Using Surrealist's graph visualization to see fraudulent activities

For more on these queries and their visual output, see [this dedicated blog post](/blog/fraud-detection-with-surrealdb).

Star pattern: one card used to pay large number of accounts:

```surql
DEFINE FIELD paid_at ON pays DEFAULT time::now();

-- sketchy cards
FOR $card IN CREATE |card:10| {
    FOR $_ IN 0..rand::int(5, 15) {
        LET $payee = UPSERT ONLY account;
        RELATE $card->pays->$payee SET amount = rand::int(100, 1000);    
    };
};

-- regular card
CREATE card:normal;
FOR $_ IN 0..rand::int(5, 15) {
    LET $payee = UPSERT ONLY account;
    RELATE card:normal->pays->$payee SET amount = rand::int(100, 1000), paid_at = time::now() - rand::duration(1d, 100d);
};

SELECT id, ->pays.filter(|$payment| time::now() - $payment.paid_at < 1d).out FROM card;
```

Tight communities that interact mostly among themselves:

```surql
-- Regular community of 200
CREATE |account:200|;
-- Smaller community that interacts among itself
CREATE |account:5| SET is_sketchy = true;

-- The sketchy community interacts only between itself
-- the regular community has more general interactions
-- and sometimes sends money to the sketchy accounts
FOR $account IN SELECT * FROM account {
    FOR $_ IN 0..10 {
        LET $counterpart = IF $account.is_sketchy {
            rand::enum(SELECT * FROM account WHERE is_sketchy)
        } ELSE {
            rand::enum(SELECT * FROM account)
        };
        RELATE $account->sends_to->$counterpart SET amount = rand::int(100, 1000);
    }
};

SELECT id, ->sends_to->account FROM account;
```

Circles showing loops of money returning to its origin:

```surql
CREATE |account:50|;
CREATE |account:1..15| SET is_sketchy = true;

FOR $sketchy IN SELECT * FROM account WHERE is_sketchy {
    LET $counterpart = rand::enum(SELECT * FROM account WHERE is_sketchy AND !<-sent);
    RELATE $sketchy->sent->$counterpart SET amount = rand::int(100, 1000);
};

LET $normal = SELECT * FROM account WHERE !is_sketchy;
FOR $account IN SELECT * FROM account WHERE !is_sketchy {
    LET $counterpart = rand::enum(SELECT * FROM $normal);
    RELATE $account->sent->$counterpart SET amount = rand::int(100, 1000);
};

SELECT id, ->sent->account FROM account;
```

## Gaming

### Characters and quests

RPG game system with character progression, inventory management, and quest tracking. Features polymorphic item effects, character statistics, and complex game state management. Demonstrates flexible data modeling for gaming applications with rich object structures and [relationship tracking](/docs/surrealdb/models/graph).

```surql
-- Characters controlled by players
DEFINE TABLE character SCHEMAFULL;
DEFINE FIELD name     ON character TYPE string;
DEFINE FIELD level    ON character TYPE int DEFAULT 1;
DEFINE FIELD xp       ON character TYPE int DEFAULT 0;
DEFINE FIELD class    ON character TYPE string ASSERT $value IN ["warrior", "mage", "rogue"];
DEFINE FIELD stats    ON character TYPE { str: int, dex: int, int: int };

-- Items in the game world
DEFINE TABLE item SCHEMAFULL;
DEFINE FIELD name     ON item TYPE string;
DEFINE FIELD type     ON item TYPE string ASSERT $value IN ["weapon", "armor", "potion"];
DEFINE FIELD rarity   ON item TYPE string ASSERT $value IN ["common", "rare", "epic", "legendary"];
DEFINE FIELD effects  ON item TYPE array<{ str: int } | { heal: int }>; // etc.

-- Items possessed by characters
DEFINE TABLE owns TYPE RELATION IN character OUT item;
DEFINE FIELD equipped ON owns TYPE bool DEFAULT false;

-- Quests available in the world
DEFINE TABLE quest SCHEMAFULL;
DEFINE FIELD name      ON quest TYPE string;
DEFINE FIELD required_level ON quest TYPE int DEFAULT 1;
DEFINE FIELD rewards   ON quest TYPE { exp: int, items: array<record<item>> };

-- Character quest progress
DEFINE TABLE quest_log TYPE RELATION IN character OUT quest;
DEFINE FIELD status       ON quest_log TYPE string ASSERT $value IN ["active", "completed"];
DEFINE FIELD started_at   ON quest_log TYPE datetime DEFAULT time::now();
DEFINE FIELD completed_at ON quest_log TYPE option<datetime>;

-- Events
DEFINE TABLE character_event SCHEMAFULL;
DEFINE FIELD character  ON character_event TYPE record<character>;
DEFINE FIELD details    ON character_event TYPE 
    { type: "combat", exp: int, against: string, summary: string } |
    { type: "item_used", item: record<item>, summary: string } |
    { type: "quest_update", summary: string };
DEFINE FIELD ts         ON character_event TYPE datetime DEFAULT time::now();

-- Create a new character
CREATE character:aria SET name = "Aria", class = "mage", stats = { str: 4, dex: 6, int: 12 };

-- Give Aria an item
RELATE character:aria->owns->(CREATE ONLY item SET name = "Wand of Sparks", type = "weapon", rarity = "rare", effects = { int: 2 });

-- Start a quest
RELATE character:aria->quest_log->quest:slime_hunt SET status = "active";
```

## Aerospace and astronomy

### Telescopes and observations

Astronomical observation tracking system with instrument management and data collection. Features geospatial telescope locations, flexible observation metadata, and scientific data URL management. Demonstrates [point data types](/docs/surrealql/datamodel/geometries#point), complex temporal relationships, and scientific data organization patterns.

```surql
-- Telescopes (instruments)
DEFINE TABLE telescope SCHEMAFULL;
DEFINE FIELD name        ON telescope TYPE string;
DEFINE FIELD location    ON telescope TYPE point;
DEFINE FIELD aperture_mm ON telescope TYPE int; -- e.g. 200 for 8" scope

-- Astronomical targets
DEFINE TABLE target SCHEMAFULL;
DEFINE FIELD name        ON target TYPE string;
DEFINE FIELD type        ON target TYPE string ASSERT $value IN ["star", "planet", "nebula", "galaxy", "asteroid"];

-- Observation logs
DEFINE TABLE observed SCHEMAFULL TYPE RELATION IN telescope OUT target;
DEFINE FIELD observer        ON observed TYPE record<person>;
DEFINE FIELD observed_at     ON observed TYPE datetime;
DEFINE FIELD observed_until  ON observed TYPE option<datetime>;
DEFINE FIELD exposure_length ON observed VALUE IF observed_until { observed_until - observed_at } ELSE { 0ns };
DEFINE FIELD notes           ON observed TYPE option<string>;
DEFINE FIELD filter          ON observed TYPE option<string> ASSERT $value IN ["B", "V", "R", "I", "H-alpha", "OIII", "IR"];
DEFINE FIELD sky_conditions  ON observed TYPE option<string> ASSERT $value IN ["clear", "thin cloud", "hazy", "overcast"];
DEFINE FIELD data_url        ON observed TYPE option<string>; -- e.g. to FITS file, rendered image, or DOI

CREATE telescope:one SET name = "The one telescope", location = (-68.44, -29.14), aperture_mm = 200;
CREATE target:venus SET type = "planet", name = "Venus";
CREATE person:one;

RELATE telescope:one->observed->target:venus SET 
    observer = person:one,
    observed_at = time::now(),
    observed_until = time::now() + 1h,
    filter = "R",
    seeing = 0.7,
    sky_conditions = "clear",
    data_url = "https://astro.example.org/data/venus-2025.fits";

```

### Launch telemetry

Space launch monitoring system with real-time telemetry data collection. Features component-level tracking, [time-series data management](/docs/surrealdb/models/time-series) with composite keys, and launch lifecycle status tracking. Demonstrates high-frequency data ingestion, temporal range queries, and [live data streaming](/docs/surrealql/statements/live).

```surql
-- A specific launch instance (e.g., Falcon 9 Flight 100)
DEFINE TABLE launch SCHEMAFULL;
DEFINE FIELD name         ON launch TYPE string;
DEFINE FIELD vehicle_name ON launch TYPE option<string>;
DEFINE FIELD scheduled_at ON launch TYPE datetime;
DEFINE FIELD liftoff_at   ON launch TYPE option<datetime>;
DEFINE FIELD status       ON launch TYPE string ASSERT $value IN ["scheduled", "launched", "scrubbed", "failed", "success"] DEFAULT "scheduled";
DEFINE FIELD completed    ON launch TYPE option<datetime>;
 
-- Components involved in the launch
DEFINE TABLE component SCHEMAFULL;
DEFINE FIELD launch     ON component TYPE record<launch>;
DEFINE FIELD name       ON component TYPE string; -- e.g., "first_stage", "engine_1"
DEFINE FIELD type       ON component TYPE string ASSERT $value IN ["stage", "engine", "payload", "fairing"];

-- Time-series telemetry linked to a component
DEFINE TABLE telemetry SCHEMAFULL;
DEFINE FIELD id            ON telemetry TYPE [record<component>, datetime]; -- [component, ulid]
DEFINE FIELD altitude_m    ON telemetry TYPE option<float>;
DEFINE FIELD velocity_mps  ON telemetry TYPE option<float>;
DEFINE FIELD thrust_kN     ON telemetry TYPE option<float>;
DEFINE FIELD pressure_kPa  ON telemetry TYPE option<float>;
DEFINE FIELD temperature_C ON telemetry TYPE option<float>;
DEFINE FIELD status        ON telemetry TYPE option<string>;

CREATE launch:one SET name = "Launch 1", vehicle_name = "Fire rocket", scheduled_at = time::now() - 5s, liftoff_at = time::now() - 1s;
CREATE component:one SET launch = launch:one, name = "Engine 1", type = "engine";
CREATE component:two SET launch = launch:one, name = "Engine 2", type = "engine";

-- Add durations to all datetimes below to simulate passage of time
CREATE telemetry:[component:one, time::now()] SET temperature_c = 30.5, status = "good";
CREATE telemetry:[component:one, time::now() + 1s] SET temperature_c = 30.7, status = "good";
CREATE telemetry:[component:one, time::now() + 2s] SET temperature_c = 30.9, status = "good";
CREATE telemetry:[component:one, time::now() + 3s] SET temperature_c = 35.0, status = "good";
CREATE telemetry:[component:two, time::now()] SET temperature_c = 30.5, status = "good";
CREATE telemetry:[component:two, time::now() + 1s] SET temperature_c = 30.7, status = "good";
CREATE telemetry:[component:two, time::now() + 2s] SET temperature_c = 30.9, status = "good";
CREATE telemetry:[component:two, time::now() + 3s] SET temperature_c = 35.0, status = "good";

UPDATE launch:one SET completed = time::now() + 5s;

-- Get all telemetry for component:two during launch:one
SELECT * FROM telemetry:[component:two, launch:one.liftoff_at]..=[component:two, launch:one.completed];

-- Or LIVE SELECT during the flight
LIVE SELECT * FROM telemetry WHERE id[0] = component:two;
```

## Defense / mission operations

### Missions and tasks

Military mission management system with unit tracking and operational logging. Features hierarchical command structure, real-time status updates, and comprehensive audit trails. Demonstrates complex organizational modeling, [geospatial tracking](/docs/surrealql/datamodel/geometries#point), and mission-critical data management patterns.

```surql
-- Mission-level directive
DEFINE TABLE operation SCHEMAFULL;
DEFINE FIELD name        ON operation TYPE string;
DEFINE FIELD status      ON operation TYPE string ASSERT $value IN ["planned", "active", "complete", "aborted"] DEFAULT "planned";
DEFINE FIELD commander   ON operation TYPE option<record<person>>;
DEFINE FIELD start_time  ON operation TYPE option<datetime>;
DEFINE FIELD end_time    ON operation TYPE option<datetime>;

DEFINE TABLE unit SCHEMAFULL;
DEFINE FIELD members     ON unit TYPE array<record<person>>;
DEFINE FIELD operation   ON unit TYPE record<operation>;
DEFINE FIELD name        ON unit TYPE string; -- e.g., "drone-2", "squad-a"
DEFINE FIELD type        ON unit TYPE string ASSERT $value IN ["drone", "vehicle", "infantry", "support"];
DEFINE FIELD status      ON unit TYPE string ASSERT $value IN ["ready", "deployed", "engaged", "inactive"];

-- Time-stamped unit log (e.g., movement, engagement, report)
DEFINE TABLE log SCHEMAFULL;
DEFINE FIELD id          ON log TYPE [record<unit>, datetime]; -- [unit, timestamp]
DEFINE FIELD message     ON log TYPE string;
DEFINE FIELD status      ON log TYPE option<string>; -- e.g., "engaged", "moving", "waiting"
DEFINE FIELD lonlat      ON log TYPE option<point>;
DEFINE FIELD visibility  ON log TYPE option<string> ASSERT $value IN ["clear", "obscured", "night"];

-- Tasks assigned within a mission
DEFINE TABLE task SCHEMAFULL;
DEFINE FIELD operation   ON task TYPE record<operation>;
DEFINE FIELD name        ON task TYPE string;
DEFINE FIELD objective   ON task TYPE string;
DEFINE FIELD assigned_to ON task TYPE option<array<record<unit>>>;
DEFINE FIELD priority    ON task TYPE string ASSERT $value IN ["high", "medium", "low"];
DEFINE FIELD completed   ON task TYPE bool DEFAULT false;

CREATE operation:alpha SET name = "Operation Alpha", commander = person:one, start_time = time::now();

CREATE unit:squad1 SET operation = operation:alpha, name = "squad-1", type = "infantry", status = "deployed", members = [person:one, person:two];
CREATE unit:drone1 SET operation = operation:alpha, name = "drone-1", type = "drone", status = "ready", members = [person:three, person:four];

CREATE task SET 
  operation = operation:alpha, 
  name = "Secure Ridge", 
  objective = "Clear hilltop sector", 
  assigned_to = [unit:squad1], 
  priority = "high";

-- Log messages (simulate time with + durations)
CREATE log:[unit:squad1, time::now()] SET message = "Entered zone", status = "moving", lonlat = (44.2, 6.3);
CREATE log:[unit:squad1, time::now() + 3m] SET message = "Engaged hostiles", status = "engaged", visibility = "clear";
CREATE log:[unit:drone1, time::now()] SET message = "Recon sweep complete", status = "waiting", lonlat = (44.3, 6.2);
```

## Retail

### People, products and commerce

E-commerce platform schema with customer profiles, product catalog, and shopping cart management. Features flexible address storage, multi-currency support, and comprehensive timestamp tracking. Demonstrates modern e-commerce data modeling with [flexible objects](/docs/surrealql/datamodel/objects#flexible-objects) and relationship management.

```surql
-- Person / customer profile
DEFINE TABLE person SCHEMAFULL;
DEFINE FIELD name     ON person TYPE string;
DEFINE FIELD email    ON person TYPE string ASSERT string::is::email($value);
DEFINE FIELD address  ON person FLEXIBLE TYPE object;
DEFINE FIELD time     ON person TYPE object;
DEFINE FIELD time.created_at ON person TYPE datetime DEFAULT time::now();
DEFINE FIELD time.updated_at ON person TYPE datetime VALUE time::now();

-- Payment method linked to person
DEFINE TABLE payment_details SCHEMAFULL;
DEFINE FIELD person          ON payment_details TYPE record<person>;
DEFINE FIELD stored_cards    ON payment_details FLEXIBLE TYPE array<object>;
DEFINE FIELD time            ON payment_details TYPE object;
DEFINE FIELD time.created_at ON payment_details TYPE datetime DEFAULT time::now();
DEFINE FIELD time.updated_at ON payment_details TYPE datetime VALUE time::now();

-- Seller profile
DEFINE TABLE seller SCHEMAFULL;
DEFINE FIELD name            ON seller TYPE string;
DEFINE FIELD email           ON seller TYPE string ASSERT string::is::email($value);
DEFINE FIELD time            ON seller TYPE object;
DEFINE FIELD time.created_at ON seller TYPE datetime DEFAULT time::now();
DEFINE FIELD time.updated_at ON seller TYPE datetime VALUE time::now();

-- Product listings
DEFINE TABLE product SCHEMAFULL;
DEFINE FIELD name            ON product TYPE string;
DEFINE FIELD price           ON product TYPE number;
DEFINE FIELD currency        ON product TYPE string ASSERT $value IN ["USD", "GBP", "CAD"];
DEFINE FIELD category        ON product TYPE string;
DEFINE FIELD seller          ON product TYPE record<seller>;
DEFINE FIELD time            ON product TYPE object;
DEFINE FIELD time.created_at ON product TYPE datetime DEFAULT time::now();
DEFINE FIELD time.updated_at ON product TYPE datetime VALUE time::now();

-- Wishlist links (person -> product)
DEFINE TABLE wishlist TYPE RELATION FROM person TO product SCHEMAFULL;
DEFINE FIELD colour ON wishlist TYPE string;
DEFINE FIELD size   ON wishlist TYPE string;
DEFINE FIELD time   ON wishlist TYPE object;
DEFINE FIELD time.created_at ON wishlist TYPE datetime DEFAULT time::now();
DEFINE FIELD time.deleted_at ON wishlist TYPE option<datetime>;

-- Cart links (person -> product)
DEFINE TABLE cart TYPE RELATION FROM person TO product SCHEMAFULL;
DEFINE FIELD quantity ON cart TYPE number;
DEFINE FIELD price    ON cart TYPE number;
DEFINE FIELD currency ON cart TYPE string ASSERT $value IN ["CAD", "EUR", "USD"];
DEFINE FIELD time     ON cart TYPE object;
DEFINE FIELD time.created_at ON cart TYPE datetime DEFAULT time::now();
DEFINE FIELD time.updated_at ON cart TYPE datetime VALUE time::now();
```

### Orders, reviews, reports

Order processing and analytics system with review management and business intelligence. Features order lifecycle tracking, automated analytics tables, and [full-text search](/docs/surrealql/statements/define/analyzer) capabilities. Demonstrates complex aggregations, [materialized views](/docs/surrealql/statements/define/table#pre-computed-table-views), and search optimization for e-commerce applications.

```surql

-- Orders placed (person -> product)
DEFINE TABLE order TYPE RELATION FROM person TO product SCHEMAFULL;
DEFINE FIELD quantity          ON order TYPE number;
DEFINE FIELD price             ON order TYPE number;
DEFINE FIELD currency          ON order TYPE string;
DEFINE FIELD order_status      ON order TYPE string ASSERT $value IN ["pending", "processed", "shipped", "cancelled"];
DEFINE FIELD shipping_address  ON order FLEXIBLE TYPE object;
DEFINE FIELD payment_method    ON order TYPE string;
DEFINE FIELD time              ON order TYPE object;
DEFINE FIELD time.created_at   ON order TYPE datetime DEFAULT time::now();
DEFINE FIELD time.updated_at   ON order TYPE datetime VALUE time::now();
DEFINE FIELD time.processed_at ON order TYPE option<datetime>;
DEFINE FIELD time.shipped_at   ON order TYPE option<datetime>;

-- Product reviews
DEFINE TABLE review TYPE RELATION FROM person TO product SCHEMAFULL;
DEFINE FIELD rating       ON review TYPE number ASSERT $value IN 0..=5;
DEFINE FIELD review_text  ON review TYPE string;
DEFINE FIELD time         ON review TYPE object;
DEFINE FIELD time.created_at ON review TYPE datetime DEFAULT time::now();
DEFINE FIELD time.updated_at ON review TYPE datetime VALUE time::now();

-- Indexes and analytics
DEFINE FUNCTION fn::number_of_unfulfilled_orders() {
  RETURN (SELECT count() FROM order WHERE order_status NOTINSIDE ["processed", "shipped"] GROUP ALL);
};

-- Monthly order summary
DEFINE TABLE monthly_sales TYPE NORMAL SCHEMAFULL AS 
  SELECT 
    count() AS number_of_orders, 
    time::format(time.created_at, '%Y-%m') AS month, 
    math::sum(price * quantity) AS sum_sales, 
    currency 
  FROM order 
  GROUP BY month, currency;

-- Average product rating
DEFINE TABLE avg_product_review TYPE NORMAL SCHEMAFULL AS 
  SELECT 
    count() AS number_of_reviews, 
    math::mean(<float> rating) AS avg_review, 
    ->product.id AS product_id, 
    ->product.name AS product_name 
  FROM review 
  GROUP BY product_id, product_name;

-- Full-text search
DEFINE ANALYZER blank_snowball TOKENIZERS blank FILTERS lowercase, snowball(english);
DEFINE INDEX review_content ON review FIELDS review_text SEARCH ANALYZER blank_snowball BM25 HIGHLIGHTS;
```

## Medical

### Patient records and encounters

Healthcare management system with patient records, encounter tracking, and clinical data management. Features vital signs [time-series data](/docs/surrealdb/models/time-series), medication tracking, and automated encounter lifecycle management using [events](/docs/surrealql/statements/define/event). Demonstrates healthcare data modeling with temporal data, clinical workflows, and medical record compliance patterns.

```surql
-- Patient record
DEFINE TABLE patient SCHEMAFULL;
DEFINE FIELD name      ON patient TYPE string;
DEFINE FIELD dob       ON patient TYPE datetime;
DEFINE FIELD gender    ON patient TYPE string ASSERT $value IN ["male", "female", "other", "uncertain"];
DEFINE FIELD email     ON patient TYPE option<string> ASSERT string::is::email($value);
DEFINE FIELD created_at ON patient TYPE datetime DEFAULT time::now();

-- One healthcare visit
DEFINE TABLE encounter SCHEMAFULL;
DEFINE FIELD patient     ON encounter TYPE record<patient>;
DEFINE FIELD occurred_at ON encounter TYPE datetime DEFAULT time::now();
DEFINE FIELD type        ON encounter TYPE string ASSERT $value IN ["checkup", "emergency", "followup", "consult"];
DEFINE FIELD reason      ON encounter TYPE option<string>;
DEFINE FIELD location    ON encounter TYPE option<string>;
DEFINE FIELD ongoing    ON encounter TYPE bool DEFAULT true;
DEFINE FIELD ended_at   ON encounter TYPE option<datetime>;

DEFINE EVENT close_encounter ON encounter WHEN $event = "UPDATE" THEN {
    IF $before.ongoing = true AND $after.ongoing = false {
        UPDATE $this SET ended_at = time::now();
    }
};

-- Vital signs time-series (per encounter)
DEFINE TABLE vital_signs SCHEMAFULL;
DEFINE FIELD id        ON vital_signs TYPE [record<encounter>, datetime];
DEFINE FIELD heart_rate     ON vital_signs TYPE option<int> ASSERT $value IN 20..=300;
DEFINE FIELD bp_systolic    ON vital_signs TYPE option<int> ASSERT $value IN 40..=300;
DEFINE FIELD bp_diastolic   ON vital_signs TYPE option<int> ASSERT $value IN 20..=200;
DEFINE FIELD temp_c         ON vital_signs TYPE option<float> ASSERT $value IN 25.0..=45.0;
DEFINE FIELD notes     ON vital_signs TYPE option<string>;

-- Diagnoses made during encounter
DEFINE TABLE diagnosis SCHEMAFULL;
DEFINE FIELD encounter ON diagnosis TYPE record<encounter>;
DEFINE FIELD code      ON diagnosis TYPE string; -- e.g., ICD-10
DEFINE FIELD label     ON diagnosis TYPE string;
DEFINE FIELD confirmed ON diagnosis TYPE bool DEFAULT true;

-- Medications prescribed
DEFINE TABLE medication SCHEMAFULL;
DEFINE FIELD encounter ON medication TYPE record<encounter>;
DEFINE FIELD name      ON medication TYPE string;
DEFINE FIELD dose_mg   ON medication TYPE float;
DEFINE FIELD frequency ON medication TYPE string; -- e.g., "2x daily"
DEFINE FIELD duration  ON medication TYPE string; -- e.g., "7 days"
DEFINE FIELD prn       ON medication TYPE bool DEFAULT false; -- "as needed"

-- Notes written by practitioner
DEFINE TABLE note SCHEMAFULL;
DEFINE FIELD id      ON note TYPE [record<encounter>, datetime];
DEFINE FIELD author  ON note TYPE string;
DEFINE FIELD content ON note TYPE string;
DEFINE FIELD tags    ON note TYPE option<array<string>>;

CREATE patient:one SET name = "Alex Quinn", dob = d'1988-06-12', gender = "male";
CREATE encounter:one SET patient = patient:one, type = "checkup", reason = "Routine annual";

-- Vital signs log
CREATE vital_signs:[encounter:one, time::now()] SET heart_rate = 72, bp_systolic = 120, bp_diastolic = 80, temp_c = 36.8;

-- Diagnosis
CREATE diagnosis SET encounter = encounter:one, code = "E66.9", label = "Obesity, unspecified";

-- Medication
CREATE medication SET encounter = encounter:one, name = "Metformin", dose_mg = 500, frequency = "2x daily", duration = "30 days";

-- Progress note
CREATE note:[encounter:one, time::now()] SET author = "Dr. Leung", content = "Patient reports improved energy since last visit.";
```

## Related SurrealQL statements

- [DEFINE TABLE](/docs/surrealql/statements/define/table)
- [DEFINE FIELD](/docs/surrealql/statements/define/field)
- [RELATE](/docs/surrealql/statements/relate)
- [DEFINE INDEX](/docs/surrealql/statements/define/indexes)
- [DEFINE FUNCTION](/docs/surrealql/statements/define/function)
- [DEFINE EVENT](/docs/surrealql/statements/define/event)
- [DEFINE PARAM](/docs/surrealql/statements/define/param)
- [DEFINE ANALYZER](/docs/surrealql/statements/define/analyzer)

---
sidebar_position: 9
sidebar_label: Schema Best Practices
title: Schema creation best practices
description: Best practices for creating schemas in SurrealDB.
---

# Schema creation best practices

With SurrealDB, you can create a schema that is as simple or as complex as you need it to be. This page contains a number of best practices for creating schemas that are both easy to understand and easy to maintain.



### Use a `set` for an array of distinct items

The lowly [`set`](/docs/surrealql/datamodel/sets) is a subtype of `array` that doesn't get a great deal of attention, but has the convenience of holding no duplicate items.

```surql
DEFINE FIELD ordered_unique ON stuff TYPE set VALUE $value.sort();

CREATE ONLY stuff SET ordered_unique = [8,7,8,8,8,8,6,45,3] RETURN VALUE ordered_unique;
-- Returns this:
[ 3, 6, 7, 8, 45 ]
```



As the query above shows, a `set` is just a subtype and not its own type so you can pass in an `array` into anything expecting a `set`. The only difference is that it will never hold a duplicate item.

### Define arrays and sets with a type and maximum size

In addition to a type, both arrays and sets can have a maximum number of items built into the type definition itself. The definition below pairs this with an assertion using the [`array::all()`](/docs/surrealql/functions/database/array#arrayall) function to also  ensure that every item in the `bytes` field is between 0 and 255.

```surql
DEFINE FIELD bytes ON data TYPE array<int, 640> ASSERT $value.all(|$int| $int IN 0..=255);
```

Learn more about [database functions](/docs/surrealql/functions/database).

### Define nested indexes

Even the individual indexes of an array can be defined. This is useful for data types like RGB colours that can must be exactly three items in length. This time the schema uses an `ASSERT value.len() = 3` instead of `array<3>` to ensure that the array is an exact length instead of a maximum length. 

```surql
DEFINE FIELD rgb ON colour TYPE array ASSERT $value.len() = 3;
DEFINE FIELD rgb[0] ON colour TYPE int ASSERT $value IN 0..=255;
DEFINE FIELD rgb[1] ON colour TYPE int ASSERT $value IN 0..=255;
DEFINE FIELD rgb[2] ON colour TYPE int ASSERT $value IN 0..=255;

CREATE colour SET rgb = [0, 2, 30];
```

[Learn more about assertions in `DEFINE FIELD`](/docs/surrealql/statements/define/field#assertions)



###  Use `FLEXIBLE` objects and defined fields in `SCHEMAFULL` tables

The documentation mentions that a `SCHEMAFULL` table requires objects to have the `FLEXIBLE` keyword in order to treat them as free-form objects. Without this keyword, a `TYPE object` only tells the database that an object is to be expected but a `SCHEMAFULL` table disallows any field that hasn't been defined yet.

```surql
DEFINE TABLE user SCHEMAFULL;
DEFINE FIELD name ON user TYPE string;
DEFINE FIELD metadata ON user TYPE object;

-- Returns {} for `metadata`
CREATE user SET name = "Billy", metadata = {
    created_at: time::now(),
    age: 5
};
```



With the `FLEXIBLE` keyword the `metadata` field will now work, accepting any and all input.

```surql
DEFINE FIELD metadata ON user TYPE object FLEXIBLE;

CREATE user SET name = "Billy", metadata = {
    created_at: time::now(),
    age: 5
};
```



However, you can also simply define each field of an object in the same way you would with the field of a table. This allows the `metadata` field to hold these fields and ignore all other data used during a `CREATE` or `INSERT` statement.

```surql
DEFINE TABLE user SCHEMAFULL;
DEFINE FIELD name ON user TYPE string;
DEFINE FIELD metadata ON user TYPE object;
DEFINE FIELD metadata.created_at ON user TYPE datetime;
DEFINE FIELD metadata.age ON user TYPE int;

CREATE user SET name = "Billy", metadata = {
    created_at: time::now(),
    age: 5,
    wrong_field: "WRONG DATA"
};
```



### Use `THROW` to add more detailed error messages to `ASSERT` clauses

A `DEFINE FIELD` statement allows an `ASSERT` clause to be added in order to ensure that the value, which here is represented as the parameter `$value`, meets certain expectations. A simple example here makes sure that the `name` field on the `person` table is under 20 characters in length.

```surql
DEFINE FIELD name ON person TYPE string ASSERT $value.len() < 20;

CREATE person SET name = "Mr. Longname who has much too long a name";
```



In this case, the default error message is pretty good.

```surql
"Found 'Mr. Longname who has much too long a name' for field `name`, with record `person:2gpvut914k1qfysqs3lc`, but field must conform to: $value.len() < 20"
```



However, `ASSERT` only expects a truthy value at the end and otherwise isn't concerned at all with what happens before. This means that you can outright customize the logic, including a custom error message. Let's give this a try.

```surql
DEFINE FIELD name ON person TYPE string ASSERT {
    IF $value.len() >= 20 {
        THROW "`" + <string>$value + "` too long, must be under 20 characters. Up to `" + $value.slice(0,19) + "` is acceptable";
    } ELSE {
       RETURN true;
    }
};

CREATE person SET name = "Mr. Longname who has much too long a name";
```



Not bad!

```surql
'An error occurred: `Mr. Longname who has much too long a name` too long, must be under 20 characters.
Up to `Mr. Longname who ha` is acceptable'
```



### Use formatters on internal datetimes for strings with alternative formats

A lot of legacy systems require datetimes to be displayed in a format that doesn't quite match a `datetime`.

That doesn't mean that you have to give up the precision of a `datetime` though. By using the [`time::format()`](/docs/surrealql/datamodel/formatters) function, you can keep the actual stored date as a precise SurrealQL `datetime` and then use that to output a string in any format you like.

```surql
DEFINE FIELD created_at ON user VALUE time::now() READONLY;
DEFINE FIELD since ON user VALUE time::format(created_at, "%Y-%m-%d");

CREATE user RETURN id, since;
```

```surql title="Output"
[
	{
		id: user:50s2riya8fm3cdbrhwpe,
		since: '2025-06-12'
	}
]
```



### Use `!!$value` in `DEFINE` statements

As the `!` operator reverses the truthiness of a value, using it twice in a row as `!!` returns a value's truthiness. As empty and default values (such as 0 for numbers) are considered to be non-truthy, this operator is handy if you want to ensure that a value is both present and not empty.

```surql
DEFINE FIELD name ON character TYPE string;
DEFINE FIELD metadata ON character TYPE object;
-- Works because "" is of type string
CREATE character SET name = "", metadata = {};

DEFINE FIELD OVERWRITE name ON character TYPE string ASSERT !!$value;
-- Now returns an error because "" and {} are non-truthy
CREATE character SET name = "", metadata = {};
```



### Use `DEFINE PARAM` for clarity

If you find that parts of your table- or field-specific code are getting a bit long, it might be time to think about moving parts of it to a [database-wide parameter](/docs/surrealql/statements/define/param).

```surql
DEFINE FIELD month_published ON book TYPE string ASSERT $value IN ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
```



Doing so not only makes the code cleaner, but makes it easy to reuse in other parts of the schema as well.

```surql
DEFINE PARAM $MONTHS VALUE ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

DEFINE FIELD month_published ON book TYPE string ASSERT $value IN $MONTHS;
DEFINE FUNCTION fn::do_something_with_month($input: string) {
    IF !($input IN $MONTHS) {
        THROW "Some error about wrong input";
    } ELSE {
        // do something with months here
    }
};
```



### Use literals to return rich error output

Error types in programming languages often take the form of a long list of possible things that could go wrong. SurrealQL's [literal](/docs/surrealql/datamodel/literals) type allows you to specify a list of all possible forms it could take, making it the perfect type for error logic.

```surql
DEFINE PARAM $ERROR_CODES VALUE [200, 300, 400, 500];

DEFINE FUNCTION fn::return_response($input: 
    { type: "internal_error", message: string } |
    { type: "bad_request", message: string } | 
    { type: "invalid_date", got: any, expected: "YYYY-MM-DD" } |
    int) {
    IF $input.is_int() {
        IF $input IN $ERROR_CODES {
            RETURN $input
        } ELSE {
            THROW "Input must be one of " + <string>$ERROR_CODES;
        }
    } ELSE {
        RETURN $input
    }
};

fn::return_response(500);
fn::return_response({ type: "internal_error", message: "You can't do that"});
```



### Use graph queries in the schema

While graph queries are usually seen in `SELECT` statements in the documentation, they can live inside your database schema just like any other datatype or expression. In the schema below for a family tree, any inserted record must either have a parent (via the `<-parent_of<-person` path) or be `first_generation`.

```surql
DEFINE FIELD parents ON person ASSERT <-parent_of<-person OR first_generation;

CREATE person:one SET first_generation = true;
CREATE person:two;

RELATE person:one->parent_of->person:two;
CREATE person:two;
```



By the way, this pattern is possible because `RELATE` statements can be used before the records to relate exist. To disallow this, you can add the [`ENFORCED`](/docs/surrealql/statements/define/table#using-enforced-to-ensure-that-related-records-exist) clause to a `DEFINE TABLE table_name TYPE RECORD` definition.


