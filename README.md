# Reasons
## v. 0.2.1

_Supercharge your field layouts with conditionals._  

![Using a Lightswitch to toggle between two different fields](http://g.recordit.co/nYxQIkpK0j.gif)

**What does Reasons do?**  

Reasons makes it possible to add simple conditionals in order to hide or show fields based on other fields' values. Its implementation is very much inspired by Advanced Custom Fields for Wordpress.

![Setting up conditionals using the built-in field layout designer](http://g.recordit.co/R7Ti1xpL9Q.gif)

**Why? What about Entry Types and Matrix fields?**

Sure, I hear ya. When it comes to flexible content, Craft is pretty powerful – and the ability to create separate Entry Types or define a layout with Matrix fields is often the best way to go. Reasons basically offers a third and different option, but I'd recommend to only use it for the fairly simple cases.  

Compared to Entry Types and Matrix, Reasons is _purely_ about increasing usability in the editorial workflow. It works as a thin layer on top of Crafts UI, basically using Javascript to hide and show fields in the entry form as the editor edits her content. _Reasons does absolutely nothing to your data, and it doesn't affect the frontend or the way your fields work in any way_. In some cases, that's all you need.

**What's a toggle field?**

A _toggle field_ in Reasons is a field that can be used to "toggle" another field on or off (show or hide, as it were). This works by comparing the value of the toggle field (i.e. "1") defined in the Field Layout Designer, to the current value of the same field in the edit entry form.  

The following field types can be used as toggle fields:  

* Lightswitch
* Dropdown
* Checkboxes
* Multi-select
* Radio Buttons
* Number
* Position Select
* Plain Text

## Installation and setup

* Download & unzip
* Move the /reasons folder to craft/plugins
* Install

## Usage

Add a field to the Field Layout Designer, click the little cogwheel and choose "Manage conditionals".

### Roadmap

Look for the following in coming updates:

* Support for Categories, Users and Assets
* Conditionals inside Matrix fields

## Disclaimer, bugs, feature request, support etc.

This plugin is provided free of charge. The author is not responsible for any data loss or other problems resulting from the use of this plugin.  

Please report any bugs, feature requests or other issues [here](https://github.com/mmikkel/Reasons-Craft/issues). Note that this is a hobby project and no promises are made regarding response time, feature implementations or bug amendments.  

**Pull requests are very welcome!**

### Changelog

#### 0.2.1

* Fixes #7. Thanks @owldesign!

#### 0.2

* Minor refactor to JS
* Fixes for issues #3 and #5, where Radio Buttons, Checkboxes and Multi-select fields did not work as intended

#### 0.1.3

* Custom field type bugfix

#### 0.1.2

* Bugfix

#### 0.1.1

* Fixed _undefined index_ related bug

#### 0.1

* Initial public release
