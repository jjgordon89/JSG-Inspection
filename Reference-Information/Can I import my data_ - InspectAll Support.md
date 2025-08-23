Can I import my data?

To help you get started, an Administrator for your Account can email an Excel file to our Support Team to create

records for your:

Users

Accounts

Locations

Areas

Contacts

Assets

Download Import Template

(https://s3.amazonaws.com/helpscout.net/docs/assets/564a7e7890336002f86de0be/attachments/564a8cf49033600

2f86de0f3/InspectAllImportSheetWeb.xlsx)

Download and add your information to the Import Template above and email it to our <%= mail_to

"support@inspectall.com", "support team" %> to get started. Please allow up to 48 hours for import. Please note,

you cannot import your Billing Details, Logo, User Permissions, Asset Statuses, Folder Settings, or Forms with our

import.  The option to have imports completed is part of a paid set up package.

*Historical data and image files cannot be imported into InspectAll. Form templates cannot be imported,

however, you are able to build form templates as an Admin in Form Builder on the website. We also offer

form building as a professional service if you can provide us with the form templates that you want created.

The information we are able to imported is detailed below.

Working with the Import Template

After you've downloaded the Import Template, we suggest opening it in Excel. The Import Template has (7)

worksheets, and we suggest familiarizing yourself with each sheet before beginning. The first worksheet (Tab 1) of

the Import Template is the Read Me - which is your guide to all of the fields that you are able to update with the

import.

You can perform multiple data imports by filling out specific tabs and submitting them to our support team.

Common examples of imports include:

8/23/25, 5:42 AM Can I import my data? - InspectAll Support

https://docs.inspectall.com/article/135-can-i-import-my-data 1/6


---

Account Imports

Account, Location and Area Imports

Asset Imports

User Imports

Contacts Imports

To find the appropriate Worksheets, use the Tabs in Excel to navigate appropriately (see image below).

As you are using the worksheets, do not rename or delete the worksheets or column names.

Understanding the Tabs

As you navigate between Tabs, you'll be able to add import data that is either required or optional. Required fields

must be included for a record, or row, to be created in the database. Optional fields can be added when needed to

be included on a record.

For example, if you're trying to add a User on Tab 2, you must include the Email, First Name, and Last Name for the

User; else, the import record will be ignored.

8/23/25, 5:42 AM Can I import my data? - InspectAll Support

https://docs.inspectall.com/article/135-can-i-import-my-data 2/6


---

Tabs Required Fields Optional Fields

Read Me (Tab 1) None None

Users (Tab 2) Email

First Name

Last Name

Password

Teams (up to 3)

Accounts (Tab 3) CustNum (Account ID)

CustName (Account Name)

Address, City, State, Zip, Country

Teams (up to 3)

Reference Fields (up to 3)

Locations (Tab 4) CustNum (Account ID)

Location ID

Location Name

Address, City, State, Zip, Country

Teams (up to 3)

Reference Fields (up to 3)

Areas (Tab 5) CustNum (Account ID)

Location ID

Area Name

Contacts (Tab 6) CustNum (Account ID)

First Name

Last Name

Location ID

Phone, Mobile Phone

Email

Title, Department

Address, City, State, Zip, Country

Notes

Reference Fields (up to 3)

8/23/25, 5:42 AM Can I import my data? - InspectAll Support

https://docs.inspectall.com/article/135-can-i-import-my-data 3/6


---

Tabs Required Fields Optional Fields

Assets (Tab 7) CustNum (Account ID)

Location ID

Type

Area

ID1, ID2

Description

Urgent Note

Status

Attributes (up to 20)

Reference Fields (up to 3)

Definitions for Import

Required Fields: The required fields must contain a value. Make sure you do not leave the required fields blank

in the import file. For instance, when you are importing user information, each user record must include an

Email.

Unique Fields: Fields marked as unique cannot contain duplicate data. For instance, you cannot have two

users with the same Email. If two user’s are imported with the same email, the second user’s data with overwrite

the first user’s data.

Reference Fields: A general reference field for any additional data you may want to import. For example, you

may want to add Phone Numbers for each Account. You would add each phone number as a Reference Field

under the Account.

Column Names: Make sure the first row of data in the import file contains the column headings or field names

rather than the actual data values. Do not rename the column headings. These heading column names help

identify the data during import.

Asset Imports

Below you will find information on what each column in the Asset Import worksheet represents.

Asset:  Upload Assets for an Account

CustNum - Unique, Required, 50 character. Must match the Account ID for the account where the asset belongs

LocationName- Required, 50 character.  Must match the Location Name for the account where the asset belongs.

If you haven't created a location in the account yet, you can also import Locations (using the location tab).

AreaName- Optional, 100 character, New areas found in this column are created in the given location

8/23/25, 5:42 AM Can I import my data? - InspectAll Support

https://docs.inspectall.com/article/135-can-i-import-my-data 4/6


---

Type - Required, 100 character, Must match the Asset  "Class" in Form Builder EXACTLY.  What is the asset class

(//docs.inspectall.com/article/148-organize-with-categories-and-classes)?

Identifier- (Is your ID1 for the asset class). Optional, 50 character, Sometimes referred to as "Serial", but can be

renamed per Asset Class. Recommended to be unique across the assets in this location.

TagID - (Is your ID2 for the asset class) Optional, 50 character

Description - Optional, 100 character

UrgentNote- Optional, 500 character

Status- Optional, 50 character, Must match a status you have setup for your account or leave empty.

Attribute1 - Attribute 20- Optional, 200 character, The attribute value fields match up with the attributes assigned

to the Asset Class.

Enter them in the order the attributes are currently setup for each class. IE. if "Color" is the first attribute on this

asset, then enter Blue in Attribute 1 column...

Reference-1-3 - 256 character, A general reference  field for any additional data you may want to import.  This

reference field does NOT show up on the user interface, and is used on back end reporting only.

Any changes you need to make to the class of assets, ID1 or ID2, or the attribute lists can be found in Form Builder

in the Admin Menu. For more information about setting up your asset classes and attributes, click here

(//docs.inspectall.com/article/91-enter-forms-for-assets).

Finishing Up and Submitting Your Data

Once you've finished updating the worksheets on the Import Template, we'd suggest taking a few final steps:

1. Double-Check Your Data
2. Confirm that all Tab for the workbook are properly named
3. Confirm that all Columns for the workbook are properly named
4. Save your Import Worksheet as a .XLS file and include a version
5. Email InspectAll support with your completed Import Template
FAQs Regarding Imports

How can I get help with an Import?

We're happy to help you with an import. Imports are based on InspectAll's professional services rates.  More

information on professional services including pricing, can be found by clicking here

(//docs.inspectall.com/article/335-professional-services).

8/23/25, 5:42 AM Can I import my data? - InspectAll Support

https://docs.inspectall.com/article/135-can-i-import-my-data 5/6


---

© InspectAll (http://www.inspectall.com) 2025. Powered by Help Scout (https://www.helpscout.com/docs-refer/?

co=InspectAll&utm_source=docs&utm_medium=footerlink&utm_campaign=Docs+Branding)

Last updated on May 15, 2025

Can I send InspectAll my own, specially-formatted file and have you upload it?

Yes, our professional services team will help you with an import. Feel free to contact our sales or support teams with

your file and we will provide an estimate.

What formats do you support for import?

XLS, XLSX

Is there a limit to the number of Users, Accounts, Locations, Areas, Contacts, or

Assets I can import?

No. Although the number of users you are importing for your company should remain within the allowed number of

user’s in your company's user plan.

Is there a limit on the file size for import?

Yes. 10MB

What happens if duplicate records are found?

The later duplicate row found will override the previous row's data. For example, if there are 2 Accounts with the ID

of "123", the second Account on the import sheet will be the data that is saved for Account ID "123".  Assets,

however, will be imported as second time.  So ensure that you don't provide an import that has assets that are

already built into your account.

Is there a cost for this service?

Data imports are typically included in your set-up or implementation package pricing.  However, if you need an

import after your implementation period, or you did not choose this service as part of your set up, we can do it for

you under professional services.  More information on professional services including pricing, can be found by

clicking here (//docs.inspectall.com/article/335-professional-services).

 Still need help? Contact Us (#)

8/23/25, 5:42 AM Can I import my data? - InspectAll Support

https://docs.inspectall.com/article/135-can-i-import-my-data 6/6

