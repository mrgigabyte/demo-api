# Abstrct Api
Made using hapi.js and uses mysql as database.

## How to Run?

* *npm install*
* *npm install mocha -g* 

**Run**
* *gulp build* (build ts files)
* *gulp develop* (losks for any file changes and rebuilds the project)
* *gulp tslint* (run tslint)
* *gulp test* (run tests and builds)
* *gulp watch* (watch ts files)
* *npm run start* (start the application)
* *npm run watch* (restart the application when files change)

## Documentation

### Nginx
We are using `nginx` for proxying `localhost:5000` to `localhost/api`.
You need to configure your `nginx` first. The nginx config can be found in `src/config/nginx.dev.config`.

### Swagger-Docs
When the code is running, documentation is accessible at `localhost/api/docs`.

## Our Git Workflow

### Main Branches
1. `master` is our holy grail. `master` and only `master` will ever be deployed to production environment.
2. `staging` is our staging branch (after we have perfected our code). We will create a pull request from `dev` to `staging` after perfecting the code in the `dev` branch.
3. We will always write code in the `dev` branch . After finishing the code for a particular feature we will create a pull request from `dev` to `staging`. 

### Workflow
1. All the development will take place in `dev` branch. When starting a new branch, pull the new branch from `staging` branch which will have the most stable code.
2. Create a pull request from the `dev` to `staging` which will be reviewed before merging.
3. After being merged into `staging`, we will deploy it to staging environment.

*We will make sure to have frequent merges from `staging` to `master` and release stuff into production*

`I have never met a man so ignorant that I couldn't learn something from him. ~ Galileo`
