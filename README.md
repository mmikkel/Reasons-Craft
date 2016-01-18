# Reasons
## v. 0.2.2

_Supercharge your field layouts with conditionals._  

**NOTE: This is the legacy branch for Reasons. This version supports Craft 2.3 through 2.5, but is behind the current version's featureset and will not receive further updates.**  

For the current version, which supports Craft 2.5 only, please see the [master branch](https://github.com/mmikkel/Reasons-Craft).

![Using a Lightswitch to toggle between two different fields](http://g.recordit.co/nYxQIkpK0j.gif)  

**What does Reasons do?**  

Reasons makes it possible to add simple conditionals in order to hide or show fields based on other fields' values. Its implementation is very much inspired by Advanced Custom Fields for Wordpress.  

![Setting up conditionals using the built-in field layout designer](http://g.recordit.co/R7Ti1xpL9Q.gif)  

_Please note that Reasons currently only works with Entries._  

**What's a toggle field?**  

A _toggle field_ in Reasons is a field that can be used to "toggle" another field on or off (show or hide, as it were). This works by comparing the value of the toggle field declared inside the Field Layout Designer, to the current value of that same field when the content is edited.  

The following FieldTypes can be used as toggle fields:  

* Lightswitch
* Dropdown
* Checkboxes
* Multi-select
* Radio Buttons
* Number
* Position Select
* Plain Text

**What Reasons doesn't do – or _a disclaimer of sorts_**  

It's important to realize that Reasons is _strictly about increasing editorial workflow usability_. It works as a thin layer on top of Craft's CP UI, using JavaScript to show and hide fields as content is edited.  

_Reasons does absolutely nothing to your content, nor does it affect your fields or field layouts in any way_. This is in line with how conditionals in ACF work, but there's another, much more important reason (heh) I've decided to go this route.  

First: A bit of history. When P&T opened up their feedback site in March 2015, I submitted a [a feature request for field layout conditionals](http://feedback.buildwithcraft.com/forums/285221-feature-requests/suggestions/7185745-conditionals-in-field-layouts). The request proved quite popular (it has in fact been the number one request since day one), and I decided to build Reasons to prove that this functionality would be both doable and worthwhile to add to Craft core.  

As Craft doesn't really expose an API for modifying the Control Panel, Reasons is dependant on markup/classnames, Javascript workarounds and undocumented Craft features in order to do its stuff. This means that if P&T ever redesigns certain aspects of the Control Panel (like they just did with Craft 2.5), Reasons is likely to break. Also – keeping the popularity of the FR and this plugin in mind – I'm very positive that Craft will have field layout conditionals in core one day, which would make Reasons redundant – and at that point I would stop working on it.  

As such, I like to consider Reasons as a _high risk_ plugin. However, if it ever fails (or is made obsolete), it should die gracefully – not taking your content down with it. This is why, for example, Reasons will never add attributes to field models or wipe "hidden" fields' content (as some have requested).  

_My advice is to be smart about how you design your field layouts; always keeping in mind that the layouts may render without conditionals one day._ Use Reasons sparingly – if you find yourself creating a lot of conditionals, consider using Entry Types or Matrix fields instead.  

...and most importantly: [Vote for the feature request!](http://feedback.buildwithcraft.com/forums/285221-feature-requests/suggestions/7185745-conditionals-in-field-layouts)

## Roadmap

### In development
* **Support for element editors (i.e. when an entry is edited from an index table)**
* **Support for all built-in main Element Types (Categories, Assets, Tags, Global Sets, Users)**

### Going forward
* Support for Matrix fields
* Support for Super Table fields

## Installation and setup

* Download & unzip
* Move the /reasons folder to craft/plugins
* Install

## Usage

Add a field to the Field Layout Designer, click the little cogwheel and choose "Manage conditionals".  

## Disclaimer, bugs, feature request, support etc.

This plugin is provided free of charge and you can do whatever you want with it. Reasons is unlikely to mess up your stuff, but just to be clear: the author is not responsible for any data loss or other problems resulting from the use of this plugin.  

Please report any bugs, feature requests or other issues [here](https://github.com/mmikkel/Reasons-Craft/issues). Note that this is a hobby project and no promises are made regarding response time, feature implementations or bug fixes.  

**Pull requests are extremely welcome**  

### Changelog

#### 0.2.2

* Reasons now works in Craft 2.5
* Reasons now works in Live Preview
* Implemented release feeds (Craft 2.5 only)
* Updated README and roadmap
* Fixed an issue where conditionals would not re-render when a toggle field was removed from a tab in the FLD
* Fixed an issue where conditionals would be cleared when fields were reordered in the FLD

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
