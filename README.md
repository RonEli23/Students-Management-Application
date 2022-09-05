# Foobar

Foobar is a Python library for dealing with word pluralization.

## Installation

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install foobar.

```bash
pip install foobar
```

## Usage

```python
import foobar

# returns 'words'
foobar.pluralize('word')

# returns 'geese'
foobar.pluralize('goose')

# returns 'phenomenon'
foobar.singularize('phenomena')
```

| Name | Description |
| ------------------------ | --------------------------------------------------------------------------------------------- | 
| **node_modules**         | Contains the installed packages: express, mongoose, pug, dotenv and the devDependencies: eslint and readme-md-generator                                                                                                        |
| **src**                  | Contains the source code                                                                      |
| **src/models**           | Includes student model file and log model file                                                |
| **src/public**           | Includes the main CSS file                                                                    |
| **views**                | Views define how your app renders on the client. In this case we're using pug                 |
| .env.example             | API keys, tokens, passwords, database URI. Clone this, but don't check it in to public repos. |
| .travis.yml              | Used to configure Travis CI build                                                             |
| .copyStaticAssets.ts     | Build script that copies images, fonts, and JS libs to the dist folder                        |
| jest.config.js           | Used to configure Jest running tests written in TypeScript                                    |
| package.json             | File that contains npm dependencies as well as [build scripts]                                |
| tsconfig.json            | Config settings for compiling server code written in TypeScript                               |
| tsconfig.tests.json      | Config settings for compiling tests written in TypeScript                                     |
| .eslintrc                | Config settings for ESLint code style checking                                                |
| .eslintignore            | Config settings for paths to exclude from linting                                             |

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)