# Lazy,

![](https://cagatay.js.org/lazy.png)

## AI chat bot service.

[![Backers on Open Collective](https://opencollective.com/lazy-bot/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/lazy-bot/sponsors/badge.svg)](#sponsors)

<p>Lazy allows you create awesome chat bot with no longer know ai!</p>
<p>Just teach lazy 4 your phase case!</p>
<p>Let him answer you instead!</p>

You can try in telegram already: Lets chat with @LazyAIBot, my Turkish friends already teached somethings like as greetings.
If you want host on your own, go ahead do this!

[Create telegram bot](https://core.telegram.org/bots#6-botfather)

[Telegram Bot Deploy](https://github.com/cagataycali/lazy-telegram):
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/cagataycali/lazy-telegram)

[Express HTTP Endpoint Deploy](https://github.com/cagataycali/lazy-telegram):
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/cagataycali/lazy-express)

[Nodejs Example Usages](https://github.com/cagataycali/lazy-examples)

Chat with lazy online in Turkish [lazy](https://lazy.cagatay.me) 


---

### Node Usage

```bash
# Or npm install --save lazy.ai
$> yarn add lazy.ai
```

```javascript

const Lazy = require('lazy.ai');

async function start() {
  const lazy = new Lazy();

  // Learn ..
  await lazy.learn({phrase: 'hello', category: 'greetings'})
  await lazy.learn({phrase: 'hi', category: 'greetings'})
  await lazy.learn({phrase: 'Hello there!', category: 'greetings'})

  // Maybe add action ..
  await lazy.addAction({category: 'greetings', actions: 'http://localhost:3000/'})
  // Or add usual response ..
  await lazy.addResponse({category: 'greetings', response: 'Hi there!'})

  // Query.
  await lazy.query({phrase: "hello dude!"})

  // Helpers..
  await lazy.getResponses({category: 'greetings'})
  await lazy.getCategories()

}
// Dont forget start your function :)
start();

```


### Ruby Usage

```bash
# Or Gemfile --> gem 'lazy.ai', '~> 0.0.1'
$> gem install lazy.ai
```

```ruby
require 'lazy.ai'

# Change with a valid lazy chatbot server url.
lazy = Lazy.new(host: "lazy.herokuapp.com")

puts lazy.learn(phrase: "hello", category: "greetings")

puts lazy.add_response(response: "Hello there", category: "greetings")

puts lazy.query(phrase: "hello dude!")

puts lazy.get_responses(category: "greetings")

puts lazy.get_categories()

puts lazy.save()

puts lazy.load()
```

### Python Usage

```bash
# Or python setup.py install
$> pip install lazy-ai
```

```python
import lazyai

# Change with a valid lazy chatbot server url.
lazy = lazyai.Lazy()

lazy.learn("hello", "greetings")

lazy.add_response("greetings", "Hello world!")

lazy.query("hello dude!")

lazy.get_responses("greetings")

lazy.get_categories()

lazy.save()

lazy.load()
```



---

[![See in action](https://asciinema.org/a/9fnkllfe8pkddzddkem7iiq8t.png)](https://asciinema.org/a/9fnkllfe8pkddzddkem7iiq8t)

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

## Express HTTP Endpoint Usage

<details>

### BASE URL: https://YOURAPPNAME.herokuapp.com/</yourappname>

### Train sended data (phrase, category)

```
POST /learn
```

### Forget trained data (phrase, category)

```
POST /forget
```

### Add response in category (category, response)

```
POST /response
```

### Add action in category (category, actions)

```
POST /action
```

### Do query in trained data and response random response text.

```
POST /query
```

### Get all trained categories (-)

```
GET /categories
```

### Save trained data.

```
GET /save
```

### Load already trained and saved data.

```
GET /load
```

### Get responses order by category.

```
GET /responses/:category
```

</details>

<br>


## Contributors

This project exists thanks to all the people who contribute. [[Contribute]](CONTRIBUTING.md).
<a href="graphs/contributors"><img src="https://opencollective.com/lazy-bot/contributors.svg?width=890" /></a>


## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/lazy-bot#backer)]

<a href="https://opencollective.com/lazy-bot#backers" target="_blank"><img src="https://opencollective.com/lazy-bot/backers.svg?width=890"></a>


## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/lazy-bot#sponsor)]

<a href="https://opencollective.com/lazy-bot/sponsor/0/website" target="_blank"><img src="https://opencollective.com/lazy-bot/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/lazy-bot/sponsor/1/website" target="_blank"><img src="https://opencollective.com/lazy-bot/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/lazy-bot/sponsor/2/website" target="_blank"><img src="https://opencollective.com/lazy-bot/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/lazy-bot/sponsor/3/website" target="_blank"><img src="https://opencollective.com/lazy-bot/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/lazy-bot/sponsor/4/website" target="_blank"><img src="https://opencollective.com/lazy-bot/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/lazy-bot/sponsor/5/website" target="_blank"><img src="https://opencollective.com/lazy-bot/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/lazy-bot/sponsor/6/website" target="_blank"><img src="https://opencollective.com/lazy-bot/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/lazy-bot/sponsor/7/website" target="_blank"><img src="https://opencollective.com/lazy-bot/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/lazy-bot/sponsor/8/website" target="_blank"><img src="https://opencollective.com/lazy-bot/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/lazy-bot/sponsor/9/website" target="_blank"><img src="https://opencollective.com/lazy-bot/sponsor/9/avatar.svg"></a>



## License & Contributors

[Special thanks for ruby client @Yengas](https://github.com/Yengas)
<br>
[Special thanks for python client @ahmetkotan](https://github.com/ahmetkotan)

MIT © [cagataycali](https://cagatay.me)
