# How to run me
`yarn start`

Wait for the `Connected to http://...` message. It finds the speaker prior to starting socket connection to the bot.

## TODO:
- Reconnect if hubot restarts

## In the office
We set this up with [`pm2`](http://pm2.keymetrics.io/docs/usage/quick-start/#setup-startup-script) to daemonize it on the mac mini in our closet.  Let's see how it works out for us!

```sh
yarn                   # installs this app
yarn global add pm2     # installs the daemonizer
pm2 start ./server.js --name sonos_proxy  # assumes you're in this app's folder, starts the daemon
pm2 save               # saves the running process as a daemon that will be auto-restarted even after reboots
```
