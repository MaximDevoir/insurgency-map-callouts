# Map Callouts

> A package that simplifies the many steps that go into creating a map overviews
> texture mod for the Steam Workshop.

You can view the progress for map callouts on the
[milestone](https://github.com/MaximDevoir/insurgency-map-callouts/milestone/1)
page.

If you want to create callouts for a map, view our [contributing](#contributing)
documentation and see which maps [still need
callouts](https://github.com/MaximDevoir/insurgency-map-callouts/issues?q=is%3Aopen+is%3Aissue+label%3Acallouts).

View the released mod at the
[Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=1690177643)

## Getting Started

### Installation

**Note**: Before installing or "git cloning", please ensure sure you have all
the [`prerequisites`](#prerequisites) and have set your
[`GAME_LOCATION`](#game_location) environment variable.

To begin working on the maps, run:

```bash
npm install      # Will take several minutes

npm start        # Initializes your map overviews
```

That's it!

You can now view any `.svg` file from `source/maps` in your [web browser](#web-browser).

### Building

When you are ready to generate a Steam Workshop
[VPK](https://developer.valvesoftware.com/wiki/VPK) file, run the following
commands:

```bash
npm start

npm run build
```

The generated `vpk` file in your `build` folder.

### Prerequisites

Before using the software, ensure you have all the prerequisite software on your
system.

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

* [Node](https://nodejs.org/en/download/), LTS version `>=10.15.1, < 11.0.0`
  recommended.

#### Yarn (optional)

* [Yarn](https://yarnpkg.com/lang/en/docs/install/), while **not required**, is
  recommended if you decide to contribute to the software.

## Environment Variables

Environment variables are variables that are set the project's `.env` file.

### GAME_LOCATION

The `GAME_LOCATION` variable is the folder of your Insurgency game. This
variable is not automatically generated. However, during `npm start`, the
software will detect if the folder appears to be correct.

Example of `GAME_LOCATION`:

```env
GAME_LOCATION=C:\Program Files\Steam\steamapps\common\insurgency2
```

### MOD_NAME

The `MOD_NAME` variable is the name of the mod. This variable may only contain
characters that are legal in a Windows filename. Example, characters like `*`,
`/`, and `?` are illegal and the software will fail.

### GITHUB_REPO

The `GITHUB_REPO` variable is the path pointing to the where the project's
source code is hosted at.

### VTF_CMD

The `VTF_CMD` variable is the path to your `VTFCmd.exe` file. This variable will
be automatically generated, during `npm start`, if the path does not point to a
valid point and you choose to download the VTFLib binaries.

## Adapting to Other Games

This software was built in mind with adapting it to other Source engine games be
as easy as possible. For games that store their map overview textures in
`root/materials/overviews`, such as [Day of
Infamy](https://store.steampowered.com/app/447820/Day_of_Infamy/), less than 5
lines of code need to be changed. And with a little more tweaking, it can be adapted
to other games as well.

## Contributing

Thank you for your interest. Yes, contributions are welcome. Please read below
to understand when and how to contribute.

## Submitting Your Contribution

Before you submit your contribution, run `yarn start` (assuming you have Yarn
from the [prerequisites](#prerequisites)), and commit any changes.

## Guidelines

Before contributing, read below to understand if your contribution aligns with
the goals of the project.

### Callouts

Callout contributions are welcomed provided that:

* the callout is clean and friendly
* the callout makes logical sense
* the source code for the callout follows the standards in place
* the callout is for the ambush game mode. 
  * **Question:** Can I submit a callout for another game mode? 
  * **Answer:** Yes. Provided that it does not overlap with a callout for the
    ambush game mode.

Callout contributions **will not be accepted** for:

* night maps.  
  * **Question:** Why?
  * **Answer:** To discourage the use of maintaining the same callouts for two
    maps. If you have a callout, please submit it to only the daytime map. In
    the future, night map callouts will automatically be generated from the
    callouts given in the daytime map.

### Logic

Before making big changes to the `js` files, or the logic in the software,
please file a [GitHub Issue](./issue) describing the idea.

All `js` files should meet the standards set by `.eslintrc.json`.

## Copyright and Licensing

See [LICENSE.md](LICENSE.md) for license terms.
