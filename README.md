# TwitchCancerExplore

Angular website to display chat cancer data coming from [TwitchCancer](https://github.com/Benzhaomin/TwitchCancer).

Live instance at https://cancerino.info.

## Build & development

### Requirements

- node / npm
- compass (Ruby gem)

### Commands

- `npm install` to download all modules
- `grunt serve` to preview a dev version
- `grunt serve:dist` to preview a prod version
- `grunt` to test and build
- `docker-compose up -d` to build and then serve the full app from a container

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

# License

> TwitchCancerExplore, an Angular website to display chat cancer data coming from TwitchCancer.
> Copyright (C) 2016 Benjamin Maisonnas

> This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License version 3 as published by
the Free Software Foundation.

> This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

> You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/gpl-3.0.en.html>.
