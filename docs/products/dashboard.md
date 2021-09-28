New Project

```js
// normal project example
{
  id: uuid
  type: "normal",
  features: {},
  projects: [{
    path: "/Users/kee/xx/admin-system"
  }]
}

// monorepo exmaple
{  
  id: uuid,
  type: "monorepo",
  features: {},
  projects: [{
  	path: "/Users/kee/xx/projects/entry-front"
  }, {
    path: "/Users/kee/xx/projects/bi-front"
  }, {
    path: "/Users/kee/xx/projects/ai-front"
  }, {
    path: "/Users/kee/xx/projects/di-front"
  }]
}

// monorepo with module federation example
{
  id: uuid,
  type: "monorepo",
  features: {
    moduleFederation: true
  },
  projects: [{
  	path: "/Users/kee/xx/projects/entry-front"
  }, {
    path: "/Users/kee/xx/projects/bi-front"
  }, {
    path: "/Users/kee/xx/projects/ai-front"
  }, {
    path: "/Users/kee/xx/projects/di-front"
  }]
}

// pipeline.config
[{
  path: "bi-front",
  tag: '',
  gitUrl: "",
  env: {
    
  },
}, {
  path: "ai-front",
  tag: 2,
  gitUrl: "",
}]

// nr11
// rett-project.json
{
  id: "/Users/BBB",
  projects: [{
    
  }]
}

[{
  path: "di-front",
  tag: '',
  gitUrl: "",
  env: {
    
  },
}, {
  path: "dm-front",
  tag: 1,
  gitUrl: "",
}]

```