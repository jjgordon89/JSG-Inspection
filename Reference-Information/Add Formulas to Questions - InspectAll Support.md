Add Formulas to Questions

Introduction

Formulas can be created by you and added to a form in the form builder. Formulas will automatically perform an

operation on any number values entered on the mobile app when the form is filled out.

How to add a formula to a question

1. Within the Form Builder in the web app (https://app.inspectall.com), click into the form you want to work in.
2. Drag or click on the "Formula" field to add it to your form. For example, you may add the following questions:
"How many technicians attended the meeting?"

"How many managers attended the meeting?"

3. Add the number question that will calculate the answers of the value questions entered. For example, you may
add the following question:

"How many total people attended the meeting?"

4. Within the  Default  field of the last number question (#3 in above example), enter your calculation using the
fxID  of the value questions (this can be found on the question beside the files link). For example, you may

type:

={33250}+{33251}

5. Click  Save  .
Question Types which can be part of a formula

The following question types can be in a formula's expression.

Question Type Formula Value

Single Select The value of the "Score" setup for the selection will be used as the formula value.

Multi Select The sum of the values of the "Score" for all of the selections made will be used as the formula

value.

8/23/25, 6:00 AM Add Formulas to Questions - InspectAll Support

https://docs.inspectall.com/article/151-add-formulas-to-questions 1/3


---

Question Type Formula Value

Number/Short

Text

The value entered will be converted to a number and used as the formula value.  For Short

Text a non-number would obviously break the formula.  For example what's 2 + hotdog?  Right

our algorithms don't know either.

Date The formula value will be expressed as the number of days since the first day of the year.

Time The formula value will be expressed as the number of minutes since midnight in the users local

time.

Formula Behaviors on Question Types

The following question types can have their answer set:

Question Type Behavior

Single Select/Multi

Select

The formula will automatically select the selection with a "Score" value closest to the result

of the formula.  If 2 selections are equi-distant from the result, the first selection of the 2 are

chosen.

Number/Short Text The formula will automatically enter the result of the formula as the answer to the question

Date The formula's result will be in "day" units.  This result will be added to the "now" date/time.

Then the time portion of the date/time will be stripped.

Time The formula's result will be in "minute" units.  This result will be added to the "now"

date/time.  Then the date portion of the date/time will be stripped.

Formulas relating to other formula questions

When using a formula based on another question with a formula, instead of using the "Formula" question type, use

a "Number" question type. Fill in the formula in the "Default" field.

Formula Operators

Order of operations will be honored. Please Contact us (mailto:support@inspectall.com) to ask about more complex

operations, we may already support it!

=  equal

+  add

*  subtract
8/23/25, 6:00 AM Add Formulas to Questions - InspectAll Support

https://docs.inspectall.com/article/151-add-formulas-to-questions 2/3


---

© InspectAll (http://www.inspectall.com) 2025. Powered by Help Scout (https://www.helpscout.com/docs-refer/?

co=InspectAll&utm_source=docs&utm_medium=footerlink&utm_campaign=Docs+Branding)

Last updated on January 24, 2024

*  multiply
/  divide

Some other things to know about formulas.

All  fxID  need to be wrapped in curly braces:  {}  . Note that this is not parenthesis:  ()

The  fxID  will never change for a question, so if you move it around or delete it - it's consistent and unique to

that question.

Formulas will only work if there is a value entered in every question that is included in the formula

calculation.

We find that it's easiest to create a form in its entirety before making the formulas.

Formulas can be tricky - so be patient and make sure to double-check your work.

 Still need help? Contact Us (#)

8/23/25, 6:00 AM Add Formulas to Questions - InspectAll Support

https://docs.inspectall.com/article/151-add-formulas-to-questions 3/3

