```react
const CustomButton = ({ref}) => {
  console.log(ref)

 	return <button>
        上传列表
    </button>
}

module.exports = {
    "filters": [
        {
            type: "select",
            key: "key1",
            label: "类型",
            defaultValue: "默认值",
            // 下拉框数据
          	data: fetchSelectOptions,
            onChange: (ref) => {

            }
        },
        {
            type: "input",
            key: "key2",
            label: "用户名称",
            onChange: (ref) => {
              
            }
        },
        {
          type: "radio",
          key: "key3",
          label: "单选",
          data: [{name: "1", value: "0"}, {name: "2", value: "1"}, {name: "3", value: "2"}]
        },
    ],
    // 自定义按钮区域
    "actions": [
        {
            type: "button",
            content: "批量下载",
            onClick: (ref) => {
                ref.getRowSelected();

                ref.clearRowSelected();

                ref.refresh({
                    clear: true
                })
            }
        },
        {
            type: "component",
            content: CustomButton
        }
    ]
}
```

权限

![img](https://camo.githubusercontent.com/aee237f6349dfb932d927e5a58b8fabb157e2446/68747470733a2f2f7374617469632d322e6c6f6163672e636f6d2f6f70656e2f7374617469632f6769746875622f7065726d697373696f6e732e706e67)

