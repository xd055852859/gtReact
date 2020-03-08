import React, { Component } from 'react';
import { Icon, Input, Button, Modal, message, Checkbox, Tabs } from 'antd';
import { postJSON, patchJSON, getAJAX } from '../ADS.js';
import { URI } from '../../data/data.js';


import Home from '../home/home';
import './validword.css';
const TabPane = Tabs.TabPane;
class Validword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            validwordArr: [],
            validwordKey: 0,
            validword: "",
            visible: false,
            safeTabArr: ["敏感词", "ip黑名单"],
            tableKey: "0",
            checkZeroed: false,
            checkZeroKey: 0,
            checkOneed: false,
            checkOneKey: 0,
            checkTwoed: false,
            checkTwoKey: 0,
            user: 0,
            unKownUser: 0,
            dictType: '',
        }
    }
    componentDidMount() {
        this.flashData(1, this.state.length, "0");
    }

    flashData(page, limit, tableKey) {
        let url = URI + "/dict/list";
        getAJAX(url, { "dictType": "特殊时期状态" }, (res) => {
            if (res.msg === "OK") {
                this.setState({
                    checkZeroed: res.result[0].value,
                    checkZeroKey: res.result[0]._key,
                })
            }
        });
        getAJAX(url, { "dictType": "允许家谱树下载" }, (res) => {
            if (res.msg === "OK") {
                this.setState({
                    checkOneed: res.result[0].value,
                    checkOneKey: res.result[0]._key,
                })
            }
        });
        getAJAX(url, { "dictType": "显示姓氏源流" }, (res) => {
            if (res.msg === "OK") {
                this.setState({
                    checkTwoed: res.result[0].value,
                    checkTwoKey: res.result[0]._key,
                })
            }
        });
        getAJAX(url, { "dictType": "阅读限制" }, (res) => {
            if (res.msg === "OK") {
                this.setState({
                    unKownUser: res.result[0].value[0],
                    user: res.result[0].value[1]
                })
            } else {
                if (res.msg === "null") {
                    let dictUrl = URI + "/dict";
                    let dictData = {
                        "dictType": "阅读限制",
                        "value": [0, 0]
                    }
                    postJSON(dictUrl, dictData, (response) => {
                        if (response.data.msg === "OK") {
                            console.log("success");
                        }
                    })
                }
            }
        })
        if (tableKey === "0") {
            this.state.dictType = "敏感词"
        } else if (tableKey === "1") {
            this.state.dictType = "黑名单ip"
        }
        let safeData = {
            "dictType": this.state.dictType
        }
        getAJAX(url, safeData, this.getSafeData.bind(this));

    }
    getSafeData(res) {
        if (res.msg === "OK") {
            this.setState({
                validwordArr: res.result[0].value,
                validwordKey: res.result[0]._key
            })
        } else if (res.msg === "null") {
            let dictUrl = URI + "/dict";
            let dictData = {
                "dictType": this.state.dictType,
                "value": []
            }
            postJSON(dictUrl, dictData, (response) => {
                if (response.data.msg === "OK") {
                    this.setState({
                        validwordArr: [],
                        validwordKey: response.data.result
                    })
                }
            })
        }
    }
    changeTab(key) {
        this.state.length = 10
        this.setState({
            tableKey: key,
            pageNum: 0,
            totalNum: 0,
            length: 10,
        })
        this.flashData(1, this.state.length, key);
    }
    updateValidWord(type, arr) {
        let url = URI + "/dict/update";
        let dictData = {
            "dictKey": this.state.validwordKey,
            "dictType": this.state.dictType,
            "value": arr
        }
        postJSON(url, dictData, (response) => {
            if (response.data.msg === "OK") {
                if (type === 1) {
                    message.success("新增成功!");
                } else {
                    message.success("删除成功!");
                }
                this.setState({
                    visible: false,
                    validwordArr: this.state.validwordArr,
                    validword: ""
                })
                this.flashData(1, this.state.length, this.state.tableKey);
            } else {
                message.error("新增失败!")
            }
        })
    }
    inputChange(e) {
        const { name, value } = e.target;
        this.setState((prevState) => {
            prevState[name] = value;
            return prevState
        })
    }
    saveValidword() {
        let str = this.state.validword.replace(/[,|，]/g, "&");
        let arr = str.split("&");
        if (arr.some((item, index) => { return item.trim() === "" })) {
            message.error("请输入内容");
            return
        }
        arr.map((item, index) => {
            if (this.state.validwordArr.indexOf(item) == -1) {
                this.state.validwordArr.push(item);
            }
        })
        this.updateValidWord(1, this.state.validwordArr)
    }
    changeTime(e, name) {
        let value = false;
        let dictType = '';
        let dictKey = 0;
        console.log(this.state.checkZeroKey);
        console.log(this.state.checkOneKey);
        console.log(this.state.checkTwoKey);
        switch (name) {
            case 'checkZeroed':
                dictType = "特殊时期状态";
                dictKey = this.state.checkZeroKey;
                break;
            case 'checkOneed':
                dictType = "允许家谱树下载";
                dictKey = this.state.checkOneKey;
                break;
            case 'checkTwoed':
                dictType = "显示姓氏源流";
                dictKey = this.state.checkTwoKey;
                break;
            default: null;
        }
        if (e.target.checked) {
            value = true
        }
        console.log("key", dictKey);
        this.setState((prevState) => {
            prevState[name] = value;
            return prevState
        })
        let dictUrl = URI + "/dict/update";
        let dictData = {
            "dictKey": dictKey,
            "dictType": dictType,
            "value": value
        }
        postJSON(dictUrl, dictData, (response) => {
            if (response.data.msg === "OK") {
                message.success("切换成功");
            }
        })

    }
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }
    setRead() {
        let url = URI + "/dict/list";
        let value = false;
        let readData = {
            "dictType": "阅读限制"
        }
        getAJAX(url, readData, (res) => {
            if (res.msg === "OK") {
                let dictUrl = URI + "/dict/update";
                let dictData = {
                    "dictKey": res.result[0]._key,
                    "dictType": "阅读限制",
                    "value": [parseInt(this.state.unKownUser), parseInt(this.state.user)]
                }
                postJSON(dictUrl, dictData, (response) => {
                    if (response.data.msg === "OK") {
                        message.success("设置成功");
                    }
                })
            }
        });
    }
    render() {
        return (
            <div>
                <Home chooseIndex="8" />
                <div className="right-container">
                    <div className="admin-container">
                        <div className="admin-title">网络管理</div>
                        <div className="admin-div">
                            <div><Checkbox checked={this.state.checkZeroed ? true : false} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }} onChange={(e) => { this.changeTime(e, 'checkZeroed') }}>特殊时期使用 (相应栏目隐藏)</Checkbox></div>
                            <div><Checkbox checked={this.state.checkOneed ? true : false} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }} onChange={(e) => { this.changeTime(e, 'checkOneed') }}>家谱树支持下载</Checkbox></div>
                            <div><Checkbox checked={this.state.checkTwoed ? true : false} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }} onChange={(e) => { this.changeTime(e, 'checkTwoed') }}>姓氏源流</Checkbox></div>
                            <div>
                                <div style={{ marginBottom: "10px" }}>匿名用户读取
                                    <Input placeholder={"请输入页数"} style={{ width: "200px", height: "32px", margin: "5px 10px 5px 10px" }} name="unKownUser" value={this.state.unKownUser} onChange={(e) => { this.inputChange(e) }} autoComplete="off" />
                                    页后需要验证
                                    </div>
                                <div style={{ marginBottom: "10px" }}>注册用户读取
                                    <Input placeholder={"请输入页数"} style={{ width: "200px", height: "32px", margin: "5px 10px 5px 10px" }} name="user" value={this.state.user} onChange={(e) => { this.inputChange(e) }} autoComplete="off" />
                                    页后需要验证
                                    </div>
                                <Button style={{ height: "32px", backgroundColor: "#3B5998", color: "#fff" }} onClick={() => { this.setRead() }}>确认</Button>
                            </div>

                        </div>
                        <Tabs activeKey={this.state.tableKey} onChange={(key) => { this.changeTab(key) }} style={{ padding: "0px 20px 0px 20px", boxSizing: "border-box" }}>
                            {this.state.safeTabArr.map((value, key) => {
                                return (<TabPane tab={value} key={key + ""}>
                                    <div style={{ marginBottom: "25px", marginTop: "15px", width: "100%" }}>
                                        <Button style={{ height: "32px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.setState({ visible: true }) }}>新增{this.state.dictType}</Button>
                                    </div>
                                    <div style={{ display: "flex" }}>
                                        {
                                            this.state.validwordArr.map((item, index) => {
                                                return (<div key={index} className="validword-span">{item}<Icon type="close" style={{ marginLeft: "5px" }} onClick={() => { this.state.validwordArr.splice(index, 1); this.updateValidWord(2, this.state.validwordArr) }} /></div>)
                                            })
                                        }
                                    </div>
                                </TabPane>)
                            })
                            }
                        </Tabs>
                    </div>
                    <Modal maskClosable={false} title={"增加" + this.state.dictType} visible={this.state.visible} onOk={() => { this.saveValidword() }} onCancel={() => { this.setState({ visible: false, validword: "" }) }}
                        okText="确定" cancelText="取消" >
                        <div style={{ marginTop: "10px" }}>
                            <Input placeholder={"请输入" + this.state.dictType} name="validword" value={this.state.validword} onChange={(e) => { this.inputChange(e) }} autoComplete="off" />
                        </div>
                    </Modal>
                </div>
            </div>
        )
    }
}
export default Validword