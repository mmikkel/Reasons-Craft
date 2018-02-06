# Reasons v. 1.0.11 for Craft CMS ![Craft 2.5](https://img.shields.io/badge/craft-2.5-red.svg?style=flat-square)

## Update June 22nd, 2017: [Statement regarding Reasons 2, Matrix support and Craft 3](https://github.com/mmikkel/Reasons-Craft/wiki/Statement-on-Reasons-2,-Matrix-and-Craft-3) (TL;DR: active development on Reasons has been retired)  

_Supercharge your field layouts with conditionals._  

![Using a Lightswitch to toggle between two different fields](http://g.recordit.co/nYxQIkpK0j.gif)  

Inspired by Advanced Custom Fields for WordPress, Reasons adds simple conditionals to field layouts – making it possible to hide or display fields on the fly, as content is being edited. This makes it fun and easy to create flexible, dynamic and usable field layouts in Craft CMS.  

_Big props to [Benjamin Fleming](https://github.com/benjamminf) for some good ideas that I stole, and helpful chatting on Slack. Thanks!_  

## Recent updates
* Support for [Button Box](http://plugins.supercooldesign.co.uk/plugin/button-box) custom FieldTypes as toggle fields
* Support for all native relational fields (Entries, Assets, Categories, Tags and Users) as toggle fields
* Support for [Solspace Calendar](https://solspace.com/craft/calendar)

## Requirements

**Reasons now requires Craft 2.5 or newer. Running Craft 2.4 or below? Don't attempt to install or update to Reasons 1.x – an older version supporting Craft 2.4 and 2.3 is available in the [legacy branch](https://github.com/mmikkel/Reasons-Craft/tree/legacy).**  

## Installation

* Download and unzip
* Move the `/reasons` folder to your `/craft/plugins` folder
* Install from the Control Panel (`/admin/settings/plugins`)

## Usage and common questions

![Setting up conditionals using the built-in field layout designer](http://g.recordit.co/R7Ti1xpL9Q.gif)  

To create or edit conditionals for a certain field, go to the settings for the appropriate element source (i.e. the Entry Type, Category Group, Tag Group, Global Set or Asset source), click the little cogwheel next to the field in the Field Layout Designer and choose "Edit conditionals".  

Note that for element sources that support tabbed field layouts, Reasons is designed to work on a "per-tab" basis.  

### What's a toggle field?

A _toggle field_ in Reasons is a field that can be used to "toggle" another field (the _target field_) on or off (show or hide, as it were).  

The following stock FieldTypes can be used as toggle fields:  

* Lightswitch
* Dropdown
* Checkboxes
* Multi-select
* Radio Buttons
* Number
* Position Select
* Plain Text
* Entries
* Categories
* Tags
* Assets
* Users

The following custom FieldTypes are also supported:  

* [Solspace Events](https://solspace.com/craft/calendar)
* [Button Box](http://plugins.supercooldesign.co.uk/plugin/button-box) (Buttons, Colours, Stars, Text Size and Width)

### Where does it work?

Reasons currently works for

* Entries
* Categories
* Tags
* Assets
* Users
* Tag Manager
* [Solspace Calendar Events](https://solspace.com/craft/calendar)

Reasons also works in Live Preview and Element Editor modals.  

Unfortunately, Reasons does _not_ work inside Matrix blocks. Matrix support is hopefully coming in the future.  

### A note on required fields

Be careful not to add conditionals to a _required_ field – **even if a required field is hidden, it'll still be required** by Craft; making your content impossible to save. I might add functionality to Reasons making it impossible to add conditionals to a required field, or possibly look at ways to override/avoid the `required` property if a field is hidden – but no promises :)

### What Reasons _doesn't_ do – or a disclaimer of sorts

It's important to realize that Reasons is _strictly about increasing editorial workflow usability_. It works as a thin layer on top of Craft's CP UI, using JavaScript to show and hide fields as content is edited.  

_Reasons does absolutely nothing to your content, nor does it affect your fields or field layouts in any way_. This is in line with how conditionals in ACF (which inspired Reasons) work, but there's another, much more important reason (heh) I've decided to go this route.  

First, a bit of history: When P&T opened up their feedback site in March 2015, I submitted a [a feature request for field layout conditionals](http://feedback.buildwithcraft.com/forums/285221-feature-requests/suggestions/7185745-conditionals-in-field-layouts). The request proved quite popular (it has in fact been the number one request since day one), and I decided to build Reasons to prove that this functionality would be both doable and worthwhile to add to Craft core.  

As Craft doesn't really expose an API for modifying the Control Panel, Reasons is dependant on markup/classnames, Javascript workarounds and undocumented features in order to do its thing. This means that if P&T ever changes certain aspects of Craft (like they recently did with the CP redesign in Craft 2.5), Reasons is likely to break.  

Also, I'm pretty sure Craft will have field layout conditionals in core one day – considering the feature request's popularity – and at that point, Reasons would be made redundant and I would stop working on it.  

Considering the above, it's my opinion that _if_ Reasons ever stops working (or is made obsolete), it should die gracefully – not taking your content down with it. This is why Reasons will never add attributes to field models, wipe "hidden" fields' content or expose some sort of frontend layer.  

My advice is to be smart about how you design your field layouts; always keeping in mind that the layouts may render without conditionals one day. Use Reasons sparingly – if you find yourself creating a lot of complex conditionals, consider using Entry Types or Matrix fields instead.  

...and most importantly: [Vote for the feature request](http://feedback.buildwithcraft.com/forums/285221-feature-requests/suggestions/7185745-conditionals-in-field-layouts)! We'd all love to see field layout conditionals in Craft core.  

## Roadmap

_Note: Development on Reasons has been retired – see [this statement](https://github.com/mmikkel/Reasons-Craft/wiki/Statement-on-Reasons-2,-Matrix-and-Craft-3) for more info._  

* Matrix support (in progress)
* Craft Commerce support
* Better handling of required fields

## Disclaimer, bugs, feature request, support etc.

This plugin is provided free of charge and you can do whatever you want with it. Reasons is unlikely to mess up your stuff, but just to be clear: the author is not responsible for data loss or any other problems resulting from the use of this plugin.  

Please report any bugs, feature requests or other issues [here](https://github.com/mmikkel/Reasons-Craft/issues). Note that this is a hobby project and no promises are made regarding response time, feature implementations or bug fixes.  

**Pull requests are extremely welcome**  

### Changelog

#### 1.0.11 (02.06.2018)

* [Fixed] Fixes an issue where Reasons would not work in Craft 2.6.3007 or newer

#### 1.0.10 (26.06.2017)

* [Fixed] Fixes issue where Reasons would not work with drafts/entry revisions

#### 1.0.9 (26.06.2017)

* [Fixed] Fixes issue where Reasons would leak configuration data on the login screen
* [Fixed] Fixes support for Solspace Calendar newer than 1.7.0

#### 1.0.8 (19.11.2016)

* [Fixed] Fixes issue with AND conditionals not working as expected

#### 1.0.7 (10.01.2016)

* [Fixed] Fixes minor JavaScript bug (thanks @benf!)

#### 1.0.6 (07.10.2016)

* [Added] Support for the Button Box plugin fieldtypes as toggle fields
* [Improved] Changed position and label for "Manage conditionals" in FLD
* [Fixed] Lightswitch toggles now work when using the space key

#### 1.0.5 (07.06.2016)

* [Added] Support for Entries, Assets, Tags, Users and Categories fieldtypes as toggle fields
* [Added] Support for Solspace Calendar Events fieldtype as toggle fields
* [Added] Full support for Solspace Calendar
* [Improved] Reasons will no longer cache conditionals if devMode is enabled
* [Improved] Hidden fields are no longer tabbable/focusable

#### 1.0.4 (05.25.2016)

* [Fixed] Fixes a rare issue where Reasons would hide fields inside Matrix blocks

#### 1.0.3 (03.02.2016)

* [Fixed] Fixed an issue where conditionals would not work in Live Preview

#### 1.0.2 (01.19.2016)

* [Fixed] Fixed an issue where conditionals would not re-render when the Entry Type was changed inside an element editor modal

#### 1.0.1 (01.18.2016)

* [Fixed] Fixed an issue where conditionals would not refresh when the Entry Type was changed (thanks to Benjamin Fleming for the quick bug report!)

#### 1.0 (01.18.2016)

* [Added] Support for Asset sources
* [Added] Support for Category groups
* [Added] Support for Tag groups (bonus: also works with Tag Manager)
* [Added] Support for Global sets
* [Added] Support for Users
* [Added] Support element edit modals (all native element types)
* [Fixed] Fixed an issue where Redactor II fields would not initialize if they were initially hidden

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
