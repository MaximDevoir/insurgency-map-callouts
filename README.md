# Map Callouts

> A package that simplifies the many steps that go into creating a map overviews
> texture mod for the Steam Workshop.

View the released mod at the
[Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=1776249479)

## Getting Started

### Installation

**Note**: Ensure you have all the [`prerequisites`](#prerequisites) and have set
your [`GAME_LOCATION`](#game_location) environment variable.

To begin working on the maps, run:

```bash
npm install      # Will take several minutes

npm start        # Initializes your map overviews
```

That's it!

You can now edit any `.json` file from `source/maps`.

To view your saved changes, open the `.svg` file from `source/external/maps` in
your [web browser](#web-browser).

### Building

When you are ready to generate a Steam Workshop
[VPK](https://developer.valvesoftware.com/wiki/VPK) file, run the following
commands:

```bash
npm start # Exit process after all maps have a built .svg file.

npm run build
```

The generated `vpk` file will be in your `build` folder.

### Prerequisites

Before using the software, ensure you have all the prerequisite software on your
system.

#### Windows

#### Web Browser

* The most recent version of popular web browser.

#### Python 2.7+

* [Python](https://www.python.org/downloads/), recommended `>=3.7.0`.
* Rossen Georgiev's [VPK](https://pypi.org/project/vpk/) package from
  [PyPI](https://pypi.org/).

#### Insurgency

* New World Interactive's
  [Insurgency](https://store.steampowered.com/app/222880/Insurgency/) game.

#### Node

* [Node](https://nodejs.org/en/download/), LTS version `>=10.15.1, < 11.0.0` or
  LTS/dubnium recommended.

#### Yarn (optional)

* [Yarn](https://yarnpkg.com/lang/en/docs/install/), while **not required**, is
  recommended if you decide to contribute to the software.

## Environment Variables

Environment variables are variables that are set the project's `.env` file.

#### GAME_LOCATION

The `GAME_LOCATION` variable is the folder of your Insurgency game. This
variable is not automatically generated. However, during `npm start`, the
software will detect if the folder appears to be correct.

Example of `GAME_LOCATION`:

```env
GAME_LOCATION=C:\Program Files\Steam\steamapps\common\insurgency2
```

#### MOD_NAME

The `MOD_NAME` variable is the name of the mod. This variable may only contain
characters that are legal in a Windows filename. Example, characters like `*`,
`/`, and `?` are illegal and the software will fail.

#### GITHUB_REPO

The `GITHUB_REPO` variable is the path pointing to the where the project's
source code is hosted at.

#### VTF_CMD

The `VTF_CMD` variable is the path to your `VTFCmd.exe` file. This variable will
be automatically generated, during `npm start`, if the path does not point to a
valid point and you choose to download the VTFLib binaries.

#### BUILD_FOR_PRODUCTION

The `BUILD_FOR_PRODUCTION` variable tells the software if maps should be
generated in production mode. When set to `false`, maps will have a development
notice in the corners of each map. Additionally,callouts that are hidden, or
callouts that would otherwise not be rendered in production mode, will be shown
\- usually in red.

This should only be set to `true` before you [build](#Building) the mod.

## Adapting to Other Games

This software was built in mind with adapting it to other Source engine games be
as easy as possible. For games that store their map overview textures in
`root/materials/overviews`, such as [Day of
Infamy](https://store.steampowered.com/app/447820/Day_of_Infamy/), less than 5
lines of code need to be changed. And with a little more tweaking, it can be
adapted to other games as well.

## Directory Structure

```bash
TODO: Add directory structure and information regarding directories.
```

## Contributing

Thank you for your interest. Yes, contributions are welcome. Please read below
to understand when and how to contribute.

Callouts are stored in `.json` files under `source/maps`.

### Callouts for an Existing Map

To create a callout for a new map, add an `object` to the `callouts` array.

Annotated callout object:

```json
{
  "classNames": ["callout", <fontSizeClass>, <anchorClass>, ...], # `callout` class is required. Each element is its own class. Order of class names is not important.
  "active_gamemodes": ["ALL", "ambush"],
  "exclude_gamemodes": [],
  "translate": "0 0", # Required
  "translate": "570 280", # Absolute coordinates of callout
  "styleString": "", # Manually input styles into callout. Not recommended.
  "rotate": "", # Required but may be left as empty string.
  "rotate": "25", # Rotation of callout, Leave as empty string for default rotation of `0`.
  "day_only": boolean, # Optional. Whether or not the callout should only be rendered for day time maps.
  "night_only": boolean, # Optional. Whether or not the callout should only be rendered for night time maps.
  "callout": { # A callout with the default language is required
    "en": [], # A lang-code and an array of strings
    "en": ["Example", "Callout"], # Lang code is `en` for English. Every element is its own line.
    "es": ["Texto de", "Ejemplo"],
  },
  "night": {
    "translate": "", # Optional
    "translate": "r20 r-50", # example using relative translation to the callouts regular translate value.
    "translate": "590 230", # example using absolute translate coordinates.
    "fontSizeClass": "<fontSizeClass>", # Optional. If set, will override the day time font size.
    "fontSizeClass": "medium-regular", # Value must be one of fontSizeClass
  }
}
```

#### fontSizeClass

The default font class is `regular`.

A font size class is any of

* `extra-small`
* `small`
* `regular`
* `medium-regular`
* `medium`
* `large`

#### anchorClass

The default anchor class is `anchor-left`.

An anchor class is any of

* `anchor-left`
* `anchor-middle`
* `anchor-right`

### Submitting Your Contribution

Before you submit your contribution, run `yarn start` (assuming you have Yarn
from the [prerequisites](#prerequisites)), and commit any changes.

## Guidelines

Before contributing, read below to understand if your contribution aligns with
the goals of the project.

### Callout Guidelines

Callout contributions are welcomed provided that:

* the callout is clean and friendly
* the callout makes logical sense
* the source code for the callout follows the standards in place
* the callout is for the ambush game mode.
  * **Question:** Can I submit a callout for another game mode?
  * **Answer:** Yes. Provided that it does not overlap with a callout for the
    ambush game mode.

### Logic

Before making big changes to the `js` files, or the logic in the software,
please file a [GitHub Issue](/issues) describing the idea.

All `js` files should meet the standards set by `.eslintrc.json`.

## Contributors

A special thanks to those who contributed to the development of this mod and the
naming of callouts. These are the wonderful people who contributed:

* [|VIP| GOD](https://steamcommunity.com/id/thealmightyabove/)
* [Wolfskopf 🐺](https://steamcommunity.com/id/wolfskopf-vip/)
* [Dr. Mikhail](#Contributors)
* [Planetesimal <img src="https://steamcommunity-a.akamaihd.net/economy/emoticon/insfist"/>](https://steamcommunity.com/profiles/76561198015347912/)

Additional thanks to the [VIP Gaming Community](https://vipgc.org).

## Copyright and Licensing

See [LICENSE](LICENSE).
