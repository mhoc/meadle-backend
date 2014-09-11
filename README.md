
See the wiki for detailed information on the format of our api.

Pre-Reqs
========

1. `brew install node`

2. `brew install mongo`


Setting It Up
=============

1. `git clone` repository

2. `npm install`

3. In a separate terminal, run `mongo`


Running
=======

1. `node server.js`

2. Visit `localhost:3000` to confirm it works


Deploying Changes
=================

Right now we are deploying to heroku.

1. `git remote add heroku git@heroku.com:meadle.git`

2. Ask Michael to add you as a contributor to the heroku project

3. `git push heroku master`

Alternatively, if you don't want to set up a heroku account, just push your changes to github and ping Michael/Kyle on slack to deploy for you.

Then, visit meadle.herokuapp.com:80 to see the app. 
