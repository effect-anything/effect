const stringToCode = (strArr: any[], levelMap: any, childrenMap: { [x: string]: any[] }) => {
  const tmpSet = new Set<any>([])
  const levelLength = Object.keys(levelMap).length

  strArr.forEach((v: string) => {
    let partition = v.split(":")
    partition = partition.concat(Array(levelLength - partition.length).fill("*"))
    const level = partition.indexOf("*") === -1 ? partition.length : partition.indexOf("*")

    const codes = stringToCodeMiddleware(partition, level, levelMap)

    // console.log(codes, strArr);
    codes.forEach((v: string | number) => {
      tmpSet.add(v)
      childrenMap[v].forEach((v: any) => {
        tmpSet.add(v)
      })
    })
  })

  // console.log("StringToCode: ", Array.from(tmpSet));
  return Array.from(tmpSet)
}

const stringToCodeMiddleware = (partition: string | any[], level: number, levelMap: { [x: string]: any[] }) => {
  if (!level) return levelMap[`level_${level + 1}`].map((v: { moduleCode: any }) => String(v.moduleCode))
  let pre = ""
  if (partition.length !== 3) {
    console.log("stringToCodeMiddleware : partition 长度不为 3", partition)
  }

  for (let i = 1; i <= level; i++) {
    const tmp = levelMap[`level_${i}`].filter((item: { module: any; moduleCode: any }) => {
      const flag = item.module === partition[i - 1]
      const code = String(item.moduleCode)

      if (pre) {
        const len = pre.length
        return flag && code.slice(0, len) === pre
      } else {
        return flag
      }
    })

    pre = String(tmp[0].moduleCode).slice(0, i * 2)
  }

  return [pre.padEnd(partition.length * 2, "0")]
}

const formatLevelMap = (arr: string | any[]) => {
  if (arr.length === 0) return {}
  const level = String(arr[0].moduleCode).length / 2
  const obj: any = {}
  let setArr: any = arr.slice()

  for (let i = 1; i < level + 1; i++) {
    const tmpSet = new Set(setArr)
    const reg = `^\\w{${i * 2}}${"00".repeat(level - i)}$`
    const data: any[] = []

    setArr.forEach((v: any) => {
      if (RegExp(reg).test(String(v.moduleCode))) {
        data.push(v)
        tmpSet.delete(v)
      }
    })
    obj[`level_${i}`] = data
    setArr = Array.from(tmpSet)
  }

  return obj
}

const formatRenderData = (arr: string | any[]) => {
  if (arr.length === 0) return arr
  const level = String(arr[0].moduleCode).length / 2
  const obj = formatLevelMap(arr)
  let renderData = []

  const format = (currentLevel: number, code: string | any[]) => {
    const tmpLen = currentLevel - 1
    const surplus = (level - currentLevel) * 2
    const reg = `^${code.slice(0, tmpLen * 2)}(\\w[^0]|[^0]\\w)0{${surplus}}$`
    const newArr = obj[`level_${currentLevel}`].filter((v: { moduleCode: any }) =>
      RegExp(reg).test(String(v.moduleCode))
    )

    if (currentLevel === level) {
      return newArr.map((v: { moduleCode: any }) => {
        return { value: String(v.moduleCode), children: [] }
      })
    }
    return newArr.map((v: { moduleCode: any }) => {
      return { value: String(v.moduleCode), children: format(currentLevel + 1, String(v.moduleCode)) }
    })
  }
  renderData = obj.level_1.map((v: { moduleCode: any }) => {
    const code = String(v.moduleCode)
    return { value: code, children: format(2, code) }
  })

  return renderData
}

const formatValueLabelMap = (arr: any[]) => {
  const obj: any = {}

  arr.forEach((v: { moduleCode: any; moduleName: any }) => {
    obj[String(v.moduleCode)] = v.moduleName
  })

  return obj
}

const formatChildrenMap = (arr: any[]) => {
  const reg = /.{1,2}/g
  const tmpObj: any = {}

  const findChildren = (pool: any[], reg: RegExp) => {
    return pool.map((v: { moduleCode: any }) => String(v.moduleCode)).filter((v: any) => reg.test(v))
  }

  arr.forEach((v: { moduleCode: any }) => {
    const code = String(v.moduleCode)
    const tmpArr: any = code.match(reg)
    const head = tmpArr.filter((v: any) => v !== "00").join("")
    const subReg = RegExp(head + `\\w{${code.length - head.length}}`)

    tmpObj[code] = tmpArr.includes("00")
      ? findChildren(
          arr.filter((val: { moduleCode: any }) => val.moduleCode !== v.moduleCode),
          subReg
        )
      : []
  })

  return tmpObj
}

// Format Cluster
const formatMethod = (arr: any) => {
  return {
    renderData: formatRenderData(arr),
    valueLabelMap: formatValueLabelMap(arr),
    childrenMap: formatChildrenMap(arr),
    levelMap: formatLevelMap(arr),
  }
}

export const getPower = (data: any, perms: string[]) => {
  const formatObj = formatMethod(data)
  const { levelMap, childrenMap, valueLabelMap } = formatObj
  const strArr = perms || []

  const powerPool = stringToCode(strArr, levelMap, childrenMap)

  const tmpSet = new Set<number>() // 原数组不能兼顾父级权限，顾再处理一遍

  powerPool.forEach((v) => {
    const partition = v.match(/.{1,2}/g)

    const len = partition.length * 2

    partition.forEach((val: any, i: number) => {
      const idx = i + 1
      const code = partition.slice(0, idx).join("") + "0".repeat(len - idx * 2)

      tmpSet.add(parseInt(code))
    })
  })

  const newPool = Array.from(tmpSet).sort()

  return {
    powerPool: newPool,
    powerMap: valueLabelMap,
  }
}
