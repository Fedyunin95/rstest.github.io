# FrontEnd


## Installation

### Requirements

Node.js (use brew or install it from [here](https://nodejs.org/))

### Install the dependencies and devDependencies
```
$ npm i
```


## Usage (commands)

### Develop
```
npm run dev
```

### Production
```
npm run build
```

### Build html (convert pug to html)
```
npm run html
```

### Get validation statistic by each template
```
npm run validate
```


## Structure
```
├── src/                           # Source
│   ├── components/                # Components
│   │   └── Component/             # Component
│   │       ├── index.js           # Component scripts
│   │       ├── index.pug          # Component markup
│   │       └── styles.scss        # Component styles
│   ├── data/                      # JSON data
│   ├── containers/                # Pages
│   │   ├── index.pug              # Index page markup (pages list)
│   │   ├── layout.pug             # Layout template
│   │   └── PageMain               # Page component
│   │       ├── data.json          # Page component data
│   │       ├── index.pug          # Page component markup (html)
│   │       └── styles.scss        # Page component styles
│   ├── svg-icons/                 # SVG иконки для генерации векторного спрайта
│   ├── resources/                 # Статические файлы для копирования в dist
│   ├── scripts/                   # Scripts
│   ├── ├── helpers/               # Scripts helpers
│   │   └── index.js               # Main (root) scripts file
│   └── styles/                    # Styles
│       ├── helpers/               # Styles helpers
│       │   ├── _mixins.scss       # Mixins
│       │   └── _variables.scss    # Variables
│       ├── partials/              # Parts
│       └── main.scss              # Main (root) styles file
│
├── index.html                     # Index page (html)
│
├── build/                         # Build files
│   ├── assets/                    # Static assets
│   │   ├── fonts/                 # Fonts
│   │   ├── images/                # Images
│   │   │   └── sprites/           # Sprites (auto)
│   │   ├── scripts/               # Scripts
│   │   └── styles/                # Styles
│   └── page-main.html             # Page component html
│
├── builder/                       # Building managers configuration files
│   ├── index.js                   # Gulp.js configuration
│   ├── server.js                  # Express.js server configuration
│   └── webpack.js                 # Webpack.js configuration
│
├── .babelrc                       # Babel configuration
├── .eslintrc                      # ESLint configuration
├── .gitignore                     # Git's ignored files list
├── .stylelintrc                   # Stylelint configuration
├── browserlist                    # Supporting browsers list
├── package.json                   # Project description file
└── README.md                      # Project documentation
```


## Code style

### Naming convention

### HTML classes
```
kebab-case
```

### JavaScript
```
camelCaseNotation
```

### JavaScript Constants
```
const CONST_VARIABLE = 100500;
```

### JavaScript Class Naming
```
CapitalizedCase
```
