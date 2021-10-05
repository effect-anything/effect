```js
babel({
  input: sources.glob("./src"),
  output: output.path("./dist", {
    deleteDirOnStart: true,
  }),
  options: {
    configFile: "",
  },
})
```

```js
babel({
  input: source("./src"),
  output: output("./lib/_esm", {
    deleteDirOnStart: true,
  }),
  options: {
    configFile: "",
    esm: true,
  },
})
```

```typescript
typescript({
  input: source("./src"),
  output: output("./lib/types", {
    deleteDirOnStart: true,
  }),
  options: {
    configFile: "tsconfig.types.json",
  },
})
```
