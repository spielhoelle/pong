# Pong - a network stability and latency tool
Build on couchdb shell script and svelte

## Instalation
- start couch docker container
- insert DB: curl -X PUT http://admin:password@localhost:5984/pong
- install JB: brew install jq
### add to your .bashrc/.zshrc
```

pong(){
  ping $1 | while read pong; do 
  time=$(date +"%s")
  ssid=$(/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -I | awk -F: '/ SSID/{print $2}')  
  JSON_STRING=$( jq -n \
    --arg timestring "$time" \
    --arg ssid "$ssid" \
    --arg pong "$pong" \
    '{_id: $timestring, ssid: $ssid, pong: $pong}' )
    echo $pong
    curl -X POST 'http://admin:password@localhost:5984/pong' -d "$JSON_STRING" -H 'Content-Type: application/json'
    #echo $JSON_STRING >> ~/Downloads/ping.json ; 
  done 
}

```

### Run the pong script:
`pong google.com`

pong now creates every second a couchdb entry which can be historically displayed using the FE



# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
