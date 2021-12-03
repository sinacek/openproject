# OpenProject development Setup on Mac OS X

To develop OpenProject a setup similar to that for using OpenProject in production is needed.

This guide assumes that you have a Mac OS X installation with administrative rights.
OpenProject will be installed with a PostgreSQL database.

**Please note**: This guide is NOT suitable for a production setup, but only for developing with it!

If you find any bugs or you have any recommendations for improving this tutorial, please, feel free to send a pull request or comment in the [OpenProject forums](https://community.openproject.org/projects/openproject/boards).

# Prepare your environment

We'll use [homebrew](https://brew.sh/) to install most of our requirements. Please install that first using the guide on their homepage.

## Install Ruby

Use [rbenv](https://github.com/rbenv/rbenv) and [ruby-build](https://github.com/rbenv/ruby-build#readme) to install Ruby. We always require the latest ruby versions, and you can check which version is required by [checking the Gemfile](https://github.com/opf/openproject/blob/dev/Gemfile#L31) for the `ruby "~> X.Y"` statement. At the time of writing, this version is "2.6"

### Install rbenv and ruby-build

rbenv is a ruby version manager that lets you quickly switch between ruby versions.
ruby-build is an addon to rbenv that installs ruby versions.

```bash
# Install
$ brew install rbenv ruby-build
# Initialize rbenv
$ rbenv init
```

### Installing ruby-3.0

With both installed, we can now install the actual ruby version 3.0. You can check available ruby versions with `rbenv install --list`.
At the time of this writing, the latest stable version is `3.0.3`, which we also require.

We suggest you install the version we require in the [Gemfile](https://github.com/opf/openproject/blob/dev/Gemfile). Search for the `ruby '~> X.Y.Z'` line
and install that version.

```bash
# Install the required version as read from the Gemfile
rbenv install 3.0.3
```

This might take a while depending on whether ruby is built from source. After it is complete, you need to tell rbenv to globally activate this version

```bash
rbenv global 3.0.3
```

You also need to install [bundler](https://github.com/bundler/bundler/), the ruby gem bundler.

```bash
gem install bundler
```

## Setup PostgreSQL database

Next, install a PostgreSQL database. If you wish to use a MySQL database instead and have installed one, skip these steps.

```bash
# Install postgres database
$ brew install postgres

# Create the database instance
$ postgres -D /usr/local/var/postgres
```

Then, create the OpenProject database user and accompanied database.

```bash
$ createuser -d -P openproject
```
You will be prompted for a password, for the remainder of these instructions, we assume its `openproject-dev-password`.

Now, create the database `openproject_dev` and `openproject_test` owned by the previously created user.

```bash
$ createdb -O openproject openproject_dev
$ createdb -O openproject openproject_test
```

## Install Node.js

We will install the latest LTS version of Node.js via [nodenv](https://github.com/nodenv/nodenv). This is basically the same steps as for rbenv:

### Install nodenv and node-build

```bash
# Install
$ brew install nodenv node-build
# Initialize nodenv
$ nodenv init
```

### Install latest LTS node version

You can find the latest LTS version here: https://nodejs.org/en/download/

At the time of writing this is v14.17.0. Install and activate it with:

```bash
nodenv install 14.17.0
nodenv global 14.17.0
```

### Update NPM to the latest version

```bash
npm install npm@latest -g
```

## Verify your installation

You should now have an active ruby and node installation. Verify that it works with these commands.

```bash
$ ruby --version
ruby 3.0.3p157 (2021-11-24 revision 3fb7d2cadc) [x86_64-darwin20]

$ bundler --version
Bundler version 2.1.4

node --version
v14.17.0

npm --version
7.15.1
```

# Install OpenProject

```bash
# Download the repository
git clone https://github.com/opf/openproject.git
cd openproject
```

Note that we have checked out the `dev` branch of the OpenProject repository. Development in OpenProject happens in the `dev` branch (there is no `master` branch).
So, if you want to develop a feature, create a feature branch from a current `dev` branch.

## Configure OpenProject

Create and configure the database configuration file in `config/database.yml` (relative to the openproject-directory.

```bash
vim config/database.yml
```

Now edit the `config/database.yml` file and insert your database credentials.
It should look like this (just with your database name, username, and password):

```
default: &default
  adapter: postgresql
  encoding: unicode
  host: localhost
  username: openproject
  password: openproject-dev-password

development:
  <<: *default
  database: openproject_dev

test:
  <<: *default
  database: openproject_test
```

## Finish the Installation of OpenProject

Install code dependencies, link plugin modules and export translation files.
- gem dependencies (If you get errors here, you're likely missing a development dependency for your distribution)
- node_modules
- link plugin frontend modules
- and export frontend localization files

```bash
bin/setup_dev
```

Now, run the following tasks to migrate and seed the dev database, and prepare the test setup for running tests locally.

```bash
RAILS_ENV=development bin/rails db:seed
```
1
## Run OpenProject through foreman

You can run all required workers of OpenProject through `foreman`, which combines them in a single tab. This is useful for starting out,
however most developers end up running the tasks in separate shells for better understanding of the log output, since foreman will combine all of them.

```bash
gem install foreman
foreman start -f Procfile.dev
```
The application will be available at `http://127.0.0.1:5000`. To customize bind address and port copy the `.env.example` provided in the root of this
project as `.env` and [configure values][foreman-env] as required.

By default a worker process will also be started. In development asynchronous execution of long-running background tasks (sending emails, copying projects,
etc.) may be of limited use. To disable the worker process:

echo "concurrency: web=1,assets=1,worker=0" >> .foreman

For more information refer to Foreman documentation section on [default options][foreman-defaults].

You can access the application with the admin-account having the following credentials:

    Username: admin
    Password: admin

## Run OpenProject manually

To run OpenProject manually, you need to run the rails server and the webpack frontend bundler to:

### Rails web server

```bash
RAILS_ENV=development bin/rails server
```

This will start the development server on port `3000` by default.

### Angular frontend

To run the frontend server, please run

```bash
RAILS_ENV=development npm run serve
```

This will watch for any changes within the `frontend/` and compile the application javascript bundle on demand. You will need to watch this tab for the compilation output,
should you be working on the TypeScript / Angular frontend part.

You can then access the application either through `localhost:3000` (Rails server) or through the frontend proxied `http://localhost:4200`, which will provide hot reloading for changed frontend code.


## Start Coding

Please have a look at [our development guidelines](../code-review-guidelines) for tips and guides on how to start coding. We have advice on how to get your changes back into the OpenProject core as smooth as possible.
Also, take a look at the `doc` directory in our sources, especially the [how to run tests](https://github.com/opf/openproject/blob/dev/docs/development/running-tests) documentation (we like to have automated tests for every new developed feature).

## Troubleshooting

The OpenProject logfile can be found in `log/development.log`.

If an error occurs, it should be logged there (as well as in the output to STDOUT/STDERR of the rails server process).

## Questions, Comments, and Feedback

If you have any further questions, comments, feedback, or an idea to enhance this guide, please tell us at the appropriate community.openproject.org [forum](https://community.openproject.org/projects/openproject/boards/9).
[Follow OpenProject on twitter](https://twitter.com/openproject), and follow [the news](https://www.openproject.org/blog) to stay up to date.

[foreman-defaults]:http://ddollar.github.io/foreman/#DEFAULT-OPTIONS
[foreman-env]:http://ddollar.github.io/foreman/#ENVIRONMENT
