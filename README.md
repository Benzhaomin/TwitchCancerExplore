# TwitchCancerExplore

Angular website to display chat cancer data coming from [TwitchCancer](https://github.com/Benzhaomin/TwitchCancer).

Live (beta) instance at https://cancerino.info.

## Build & development

- `git clone git@github.com:Benzhaomin/TwitchCancerExplore.git`
- `cd TwitchCancerExplore`
- `npm install`
- `bower install`
- `grunt serve` to preview
- `grunt` to build

## Quotes

Quotes (mostly fake) can be contextually displayed around the website. Simply put
a list of quotes inside `/quotes.json`, following this format:

```
{
  "quote": "text",
  "author": "text",
  "channel": "channel page or nothing to disable",
  "tags": ["contextual", "tags"]
}
```

The list of quotes used by http://cancerino.info is at https://gist.github.com/Benzhaomin/253fa3ee8ac3da029bce

## Testing

Running `grunt test` will run the unit tests with karma.

# License

> TwitchCancerExplore, an Angular website to display chat cancer data coming from TwitchCancer.
> Copyright (C) 2015 Benjamin Maisonnas

> This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License version 3 as published by
the Free Software Foundation.

> This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

> You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/gpl-3.0.en.html>.
