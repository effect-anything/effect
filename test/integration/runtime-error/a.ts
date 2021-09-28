// throw new Error("asd")

function a() {
  function b() {
    import("./nest/two").then((res) => {
      console.log(res)
      throw new Error("asd")
    })
    // console.log(asd)
  }
  b()
}

a()

export {}
