# Demo Api
Made using hapi.js and uses mysql as database.

## How to Run?

* *npm install* 

**Run**
* *gulp build* (build ts files)
* *gulp tslint* (run tslint)
* *gulp watch* (watch ts files)
* *npm run start* (start the application)
* *npm run watch* (restart the application when files change)

## Documentation
When the code is running, documentation is accessible at `localhost:5000/docs`.

## Our Git Workflow

### Main Branches
1. `master` is our holy grail. `master` and only `master` will ever be deployed to production environment.
2. `dev` is our staging branch (after we have perfected our code). We will create a pull request from `dev` to `master` after perfecting the code in lets say `xyz` branch.
3. We will always write code in a branch other than `dev` and `master`. After finishing the code for a particular feature we will create a pull request from that branch to `dev`. 

### Workflow
1. All the development will take place in `issue/feature` specific branches. When starting a new branch, pull the new branch from `dev` branch which will have the most stable code.
2. Create a pull request from the `issue specific branch` into `dev` which will be approved by someone who has the relevant access before being merged into `dev`.
3. After being merged into `dev`, we will deploy it to staging environment.

*We will make sure to have frequent merges from `dev` into `master` and release stuff into production*

`I have never met a man so ignorant that I couldn't learn something from him. ~ Galileo`