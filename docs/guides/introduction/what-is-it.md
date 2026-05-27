# What is Zenith?
Zenith is a framework that sits in the middle ground between something like **Nuxt** and **Wordpress**. 

It ships many basic features needed for most apps like an admin dashboard, authentication, permissions, mail, drive, queues, scheduler but without having the core parts of an app, like posts, products, orders, etc.

The framework is made this way because the end app will came in a format of a plugin or a group of plugins if needed.

Some cases would be:

- `blog`: a plugin that will add posts, categories, tags
- `ecommerce`: a plugin that will add products, categories, orders
- `payments`: a plugin that will add payments, plans, subscriptions
- `backup`: a plugin that will add backup and restore features
- and many more

Of course you could also use an already made plugin and customize it to your needs, for example you could install a plugin for a blog and payments and customize it to be a paid newsletter or something like this.

## The idea

In resume the main goal where these:

- create apps fast 
- javascript/typescript
- vuejs
- have a good DX 
- have a good UI
- common features easily added via plugins
- easy to update plugins
- allow plugins to use npm packages and/or other dependencies 
- allow plugins to have their own database tables and logic 
- allow plugins to have their own UI and routes
- allow communication between plugins
- docker friendly
- and others

Basically I wanted to be able to create a new app easily without any limitations and also be able to create plugins that can be shared and used in other apps without any problem.

## Who is it for?

For now changes are very `WILD` and things break a lot, so I would recommend to only people that are curious about the project and want to see how it evolves
