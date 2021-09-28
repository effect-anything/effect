const a = () => {
  console.log("123 a call fff")
  throw new Error("asd")
}

console.log(a())

export { a }
