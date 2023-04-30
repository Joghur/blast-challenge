# Challenge

This is a react project parsing and showing results from a CSGO match.

Add new parser features in the [src/utils/**patterns.ts**](src/utils/patterns.ts) file

To make a new parser feature, add three parts:

1.  PatternCase - Name of feature in type PatternCase
2.  patterns - Add regex pattern
3.  updateMatch - Add the logic to add found values to match object
4.  Update type to accommodate the new/updated property

Afterwards use updated match object in react component

## Setup

### Create file **src/sources/dataSource.ts**

Add this

    export const logSource = '<URL TO CSGO LOG>';

## Initialization

### `npm i`

## Run

### `npm start`

## Showcase
![Parser example](public/csgoparser.png 'Parser')
