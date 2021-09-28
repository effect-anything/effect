import "./index.scss"
// import { a } from "./nest/two"
// import { a } from "./a"

function a() {
  import("./a").then((x) => {
    console.log(x)
  })
}

a()
