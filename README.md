# Lazy,

![](https://cagatay.js.org/lazy.png)

## AI telegram chat bot.

[Create telegram bot.](https://core.telegram.org/bots#6-botfather)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/cagataycali/lazy)

# Programmatic Usage

```bash
# Or npm install --save lazy.ai
yarn add lazy.ai
```

```javascript
var Lazy = require('lazy.ai');

async function start() {
  var lazy = new Lazy();
  // Learn ..
  console.log(await lazy.learn({phrase: 'hello', category: 'greetings'}));
  console.log(await lazy.learn({phrase: 'hi', category: 'greetings'}));
  console.log(await lazy.learn({phrase: 'Hello there!', category: 'greetings'}));
  // Result ..
  console.log(await lazy.query({phrase: "hello dude!"}));
  // Helpers..
  console.log(await lazy.addResponse({category: 'greetings', response: 'Hi there!'}));
  console.log(await lazy.getResponses({category: 'greetings'}));
  console.log(await lazy.getCategories());
}
// Dont forget start your function :)
start();
```

## Telegram Bot Usage

<details>

### Learn something..

```
/learn hi - greeting
```

### Add some greeting message..

```
/add greeting - Hello there!
/add greeting - Hello buddy!
```

### Show categories

```
/categories
```

### Show responses

```
/responses greeting
```

### Just quiet

```
/quiet
```

### Save trained output

```
/save
```

### Load trained output

```
/load
```
</details>

## License

MIT © [cagataycali](https://cagatay.me)
