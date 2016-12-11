# Reasons v. 2.0.0 for Craft CMS ![Craft 2.5](https://img.shields.io/badge/craft-2.5-red.svg?style=flat-square)

_Supercharge your field layouts with conditionals._  

![Using a Lightswitch to toggle between two different fields](http://g.recordit.co/nYxQIkpK0j.gif)  

Reasons for Craft CMS adds conditionals to field layouts, making it possible to hide or show fields based on other fields' values – all while you're typin', selectin' and togglin' away at your content.  

Since 2.0, Reasons works pretty much across the board (yes, even inside Matrix blocks). Craft Commerce is also fully supported.  

_Big props to [Benjamin Fleming](https://github.com/benjamminf) for some good ideas that I stole, and helpful chatting on Slack. Thanks!_  

## Requirements

**Reasons requires Craft 2.5 or newer. Running Craft 2.4 or below? An older version supporting Craft 2.4 and 2.3 is available in the [legacy branch](https://github.com/mmikkel/Reasons-Craft/tree/legacy).**  

Upgrading from Reasons 1.x to 2.x? No worries, it's seamless.  

## Installation

* Download and unzip
* Move the `/reasons` folder to your `/craft/plugins` folder
* Install from the Control Panel (`/admin/settings/plugins`)

## Usage and common questions

![Setting up conditionals using the built-in field layout designer](http://g.recordit.co/R7Ti1xpL9Q.gif)  

To create or edit conditionals, go to the settings for the appropriate element source, click the little cogwheel next to the field in the Field Layout Designer and choose "Edit conditionals".  

In Matrix blocks, you'll find the conditional builder snuggled away below the field settings panel.  

### What's a toggle field?

A _toggle field_ in Reasons is a field that can be used to "toggle" another field on or off (show or hide, as it were). Most stock FieldTypes can be used as toggle fields.

### Where does it work?

Reasons works for all stock element types (including Matrix blocks), Craft Commerce, Tag Manager and Solspace Calendar. Live Preview, drafts and Element Editor modals are also fully supported.

### Why does Craft even need conditionals?

Because sometimes, one field's value (or lack of a value) may render a different field redundant. Being able to hide redundant fields reduces cognitive strain for your content editors.  

### I don't get it.

The primary thing to understand about Reasons is that it's strictly about improving the content editing experience in Craft's Control Panel. It works as a thin layer on top of the CP UI, using JavaScript to show and hide fields as content is being edited.  

Reasons does absolutely nothing to your content, nor does it affect your fields or field layouts in any way, shape or form. There is no front end layer.  

### A fair warning

It's important to know that Reasons is basically one huge hack (or rather, a collection of many small hacks). As Craft doesn't really expose an API for modifying the Control Panel, Reasons is dependent on markup/classnames, JavaScript workarounds and undocumented features in order to do its thing – which means that if P&T ever changes certain aspects of the Craft core or the CP UI, there's a chance Reasons will break.  



First, a bit of history: When P&T opened up their feedback site in March 2015, I submitted a [a feature request for field layout conditionals](http://feedback.buildwithcraft.com/forums/285221-feature-requests/suggestions/7185745-conditionals-in-field-layouts). The request proved quite popular (it has in fact been the number one request since day one), and I decided to build Reasons to prove that this functionality would be both doable and worthwhile to add to Craft core.  



Also, I'm pretty sure Craft will have field layout conditionals in core one day – considering the feature request's popularity – and at that point, Reasons would be made redundant and I would stop working on it.  

Considering the above, it's my opinion that _if_ Reasons ever stops working (or is made obsolete), it should die gracefully – not taking your content down with it. This is why Reasons will never add attributes to field models, wipe "hidden" fields' content or expose some sort of frontend layer.  

My advice is to be smart about how you design your field layouts; always keeping in mind that the layouts may render without conditionals one day. Use Reasons sparingly – if you find yourself creating a lot of complex conditionals, consider using Entry Types or Matrix fields instead.  

...and most importantly: [Vote for the feature request](http://feedback.buildwithcraft.com/forums/285221-feature-requests/suggestions/7185745-conditionals-in-field-layouts)! We'd all love to see field layout conditionals in Craft core.  

## Roadmap

* Something you want to see? [Add a feature request](https://github.com/mmikkel/Reasons-Craft/issues)!

## Disclaimer, bugs, feature request, support etc.

This plugin is provided free of charge and you can do whatever you want with it. Reasons is unlikely to mess up your stuff, but just to be clear: the author is not responsible for data loss or any other problems resulting from the use of this plugin.  

Please report any bugs, feature requests or other issues [here](https://github.com/mmikkel/Reasons-Craft/issues). Note that this is a hobby project and no promises are made regarding response time, feature implementations or bug fixes.  

**Pull requests are extremely welcome**  

### Changelog

#### 2.0.0 (09.10.2016)

* [Added] Support for Matrix
* [Added] Support for Craft Commerce (including variants)
* [Added] Support for the Preparse custom FieldType by @aelvan
* [Added] Hook for custom FieldTypes to register themselves as toggle fields
* [Added] Conditionals can now be added to tabs
* [Added] Additional, contextual operators added (e.g. "larger than", "contains")
* [Improved] Conditionals are no longer confined to tabs
* [Improved] Tabs with no visible fields are hidden
* [Improved] More or less rewrote the whole thing, for a faster, better experience
* [Improved] It's no longer possible to add conditionals to required fields
* [Improved] Various minor bug fixes and improvements
* [Fixed] Reasons now works with drafts

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
