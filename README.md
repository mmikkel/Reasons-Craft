# Reasons v. 1.0 for Craft CMS

_Supercharge your field layouts with conditionals._  

Inspired by the Advanced Custom Fields plugin for WordPress, Reasons adds simple conditionals to field layouts – making it possible to hide or display fields on the fly, as content is being edited. This makes it fun and easy to create flexible, dynamic and usable field layouts in Craft CMS.  

**New: Reasons now works for _all native element types_, in Live Preview and element editor modals!**  

![Using a Lightswitch to toggle between two different fields](http://g.recordit.co/nYxQIkpK0j.gif)  

![Setting up conditionals using the built-in field layout designer](http://g.recordit.co/R7Ti1xpL9Q.gif)  

## Installation

**Important: Reasons requires Craft 2.5+.** Need Craft 2.4 or 2.3 support? Check out the [legacy branch](https://github.com/mmikkel/Reasons-Craft/tree/legacy).  

* Download and unzip
* Move the `/reasons` folder to your `/craft/plugins` folder
* Install from the Control Panel (`/admin/settings/plugins`)

## Usage and common questions

To create or edit conditionals for a certain field, go to the settings for the appropriate element source (i.e. the Entry Type, Category Group, Tag Group, Global Set or Asset source), click the little cogwheel next to the field in the Field Layout Designer and choose "Manage conditionals".  

Note that for element sources that support tabbed field layouts, Reasons is designed to work on a "per-tab" basis.  

### What's a toggle field?

A _toggle field_ in Reasons is a field that can be used to "toggle" another field (the _target field_) on or off (show or hide, as it were). This works by comparing the value of the toggle field declared inside the Field Layout Designer, to the current value of that same field when the content is edited.  

The following FieldTypes can be used as toggle fields:  

* Lightswitch
* Dropdown
* Checkboxes
* Multi-select
* Radio Buttons
* Number
* Position Select
* Plain Text

All FieldTypes (even custom ones) can be target fields.  

### Does Reasons work inside Matrix fields?

Nope, not yet. Work is underway for Matrix block type support, but it's pretty difficult and there's no ETA, unfortunately.

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

* Support for Matrix fields
* Support for Super Table fields
* Better handling of required fields

## Disclaimer, bugs, feature request, support etc.

This plugin is provided free of charge and you can do whatever you want with it. Reasons is unlikely to mess up your stuff, but just to be clear: the author is not responsible for data loss or any other problems resulting from the use of this plugin.  

Please report any bugs, feature requests or other issues [here](https://github.com/mmikkel/Reasons-Craft/issues). Note that this is a hobby project and no promises are made regarding response time, feature implementations or bug fixes.  

**Pull requests are extremely welcome**  

### Changelog

#### 1.0 (01.18.2016)

* [Added] Support for Asset sources",
* [Added] Support for Category groups",
* [Added] Support for Tag groups (also works with Tag Manager!)",
* [Added] Support for Global sets",
* [Added] Support for Users",
* [Added] Support element edit modals (all native element types)",
* [Fixed] Fixed an issue where Redactor II fields would not initialize if they were initially hidden"

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
