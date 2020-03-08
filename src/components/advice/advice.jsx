import React, { Component } from 'react';
import { Menu, Icon, Input, Button, DatePicker, message, Modal, Select } from 'antd';
import { postJSON, getAJAX } from '../ADS.js';
import { URI } from '../../data/data.js';
import Page from '../common/page/page';
import Table from '../common/table/table';
import Home from '../home/home';
import './advice.css';
const { RangePicker } = DatePicker;
const Option = Select.Option;
class Advice extends Component {
    constructor(props) {
        super(props);
        this.state = {
            adviceNameArr: ["状态", "标题", "类型", "用户", "时间", "操作"],
            adviceArr: [],
            visible: false,
            adviceidArr: [],
            length: 10,
            pageNum: 0,
            totalNum: 0,
            status: "6",
            startTime: "",
            endTime: "",
            keyword: "",
            content: [],
            index: 0,
            key: 0,
            checkArr: [],
            checkAll: false,
            SelectIndex: "0",
            current: 1,
            validwordArr: []
        }
        this.updateData = this.updateData.bind(this);
        this.flashData = this.flashData.bind(this);
        this.changeNum = this.changeNum.bind(this);
        this.checkItem = this.checkItem.bind(this);
    }
    componentDidMount() {
        let validwordUrl = URI + "/dict/list";
        let validwordData = {
            "dictType": "敏感词"
        }
        getAJAX(validwordUrl, validwordData, (res) => {
            if (res.msg === "OK") {
                this.setState({
                    validwordArr: res.result[0].value
                })
                this.flashData(1, this.state.length);
            } else if (res.msg === "null") {
                let dictUrl = URI + "/dict";
                let dictData = {
                    "dictType": "敏感词",
                    "value": []
                }
                postJSON(dictUrl, dictData, (response) => {
                    if (response.data.msg === "OK") {
                        this.setState({
                            validwordArr: []
                        })
                        this.flashData(this.state.current, this.state.length, "6");
                    }
                })
            }
        })
    }
    flashData(page, limit, type) {
        this.setState({
            status: type
        })
        isNaN(this.state.startTime) ? this.state.startTime = null : null;
        isNaN(this.state.endTime) ? this.state.endTime = null : null;
        let url = URI + "/questions/list";
        let adviceData = {
            // "token": sessionStorage.getItem("token"),
            "page": page,
            "limit": limit,
            "startTime": this.state.startTime,
            "endTime": this.state.endTime,
            "search": this.state.keyword
        }
        if (type !== "6") {
            adviceData.status = type
        }
        getAJAX(url, adviceData, this.getData.bind(this));
    }
    getData(res) {
        if (res.msg === "OK") {
            //this.state.adminArr=[];
            let [arr1, arr2, arr3, arr4] = [[], [], [], []];
            res.data.map((item, index) => {
                if (this.state.validwordArr.length > 0) {
                    this.state.validwordArr.map((i, j) => {
                        item.title = item.title.replace(new RegExp(i, 'g'), "<span style='color:red;font-style:italic'>" + i + "</span>");
                        item.content = item.content.replace(new RegExp(i, 'g'), "<span style='color:red;font-style:italic'>" + i + "</span>")
                    })
                }
                arr1.push({
                    status: {
                        value:
                            item.status === 0 ? "待审核"
                                : item.status === 1 ? "待指派"
                                    : item.status === 2 ? "已指派"
                                        : item.status === 3 ? "已回复"
                                            : item.status === -1 ? "已拒绝"
                                                : item.status === -2 ? "已删除"
                                                    : null, visible: true
                    },
                    title: { value: item.title, visible: true },
                    tag: {
                        value: item.tag === 0 ? "家谱"
                            : item.tag === 1 ? "寻根"
                                : item.tag === 2 ? "委托查询"
                                    : item.tag === 3 ? "文献复制"
                                        : item.tag === 4 ? "阅读服务"
                                            : null, visible: true
                    },
                    username: { value: item.username, visible: true },
                    createTime: { value: new Date(item.createTime).toLocaleString(), visible: true },
                    state: { visible: true }
                })
                arr2.push(item._key);
                arr3.push({ content: item.content, email: item.email, phone: item.phone, type: item.type, images: item.images });
                arr4.push(false);
            })
            this.setState({
                adviceArr: arr1,
                adviceidArr: arr2,
                pageNum: res.pages,
                totalNum: res.totals,
                content: arr3,
                checkArr: arr4,
                checkAll: false,
                length: this.state.length,
                current: this.state.current
            });
        }
    }

    updateData(key, index) {
        this.setState({
            visible: true,
            index: index,
            key: key
        })
    }

    //全选和单选
    checkItem(type, key, index) {
        if (type === 1) {
            this.state.checkArr[index] = this.state.checkArr[index] ? false : true;
        } else {
            this.state.checkAll = this.state.checkAll ? false : true;
            this.state.checkArr = this.state.checkArr.map((item, index) => {
                return item = this.state.checkAll;
            })
        }
        this.setState({
            checkArr: this.state.checkArr
        })
    }

    //审核数据
    changeStatus(status, type) {
        let url = URI + "/questions/batch";
        let data = {};
        data.ids = ""
        data.status = parseInt(status);
        if (type === 1) {
            data.ids = this.state.key;
        } else {
            this.state.checkArr.map((item, index) => {
                data.ids += item ? this.state.adviceidArr[index] + "," : ""
            })
            data.ids.substr(0, data.ids.length - 1)
        }
        if (data.ids.length !== 0) {
            postJSON(url, data, (response) => {
                if (response.data.msg === "OK") {
                    message.success("更新状态成功!");
                    this.setState({
                        index: 0,
                        key: 0
                    })
                    this.flashData(this.state.current, this.state.length, this.state.status);
                } else {
                    message.error("更新状态失败!")
                }
                this.setState({
                    visible: false
                })
            })
        } else {
            message.error("请选择需要修改状态的数据!")
        }
    }
    inputChange(e) {
        const { name, value, type, checked } = e.target;
        this.setState((prevState) => {
            prevState[name] = value;
            return prevState
        })
    }
    //搜索
    // searchData() {
    //     let url = URI + "/questions/list";
    //     let adviceData = {
    //         // "token": sessionStorage.getItem("token"),
    //         "page": 1,
    //         "limit": this.state.length,
    //         "startTime": this.state.startTime,
    //         "endTime": this.state.endTime,
    //         "search": this.state.keyword
    //     }
    //     if (this.state.status !== "6") {
    //         adviceData.status = this.state.status;
    //     }
    //     getAJAX(url, adviceData, this.getData.bind(this));
    // }
    //分页修改page条数
    changeNum(length, page) {
        this.setState({
            length: length,
            current: page
        })
    }
    updateOperate(value) {
        this.state.content[this.state.index].type = value;
        this.setState({
            content: this.state.content,
        })
        let url = URI + "/questions/update";
        let data = {
            id: this.state.key,
            operate: value
            // token: sessionStorage.getItem("token"),
            // userId: key
        }
        postJSON(url, data, (response) => {
            console.log(response)
            // if (response.data.msg === "OK") {
            // }
        })
    }
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }
    render() {
        return (
            <div>
                <Home chooseIndex="6" />
                <div className="right-container">
                    <div className="admin-container">
                        <div className="admin-title">专家咨询管理</div>
                        {/* <Menu onClick={(e) => { this.setState({ status: e.key }); this.flashData(1, this.state.length, e.key) }} selectedKeys={[this.state.status]} mode="vertical" style={{ float: "left", width: "20%", border: "0px" }}>
                            <Menu.Item key="6"> <Icon type="mail" />全部</Menu.Item>
                            <Menu.Item key="0"><Icon type="appstore" />未审核</Menu.Item>
                            <Menu.Item key="1"><Icon type="appstore" />未指派</Menu.Item>
                            <Menu.Item key="2"> <Icon type="appstore" />已指派</Menu.Item>
                            <Menu.Item key="3"><Icon type="appstore" />已回复</Menu.Item>
                            <Menu.Item key="-1"><Icon type="appstore" />已拒绝</Menu.Item>
                            <Menu.Item key="-2"> <Icon type="appstore" />已删除</Menu.Item>
                        </Menu> */}
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>
                                <img src="./images/nav.png" alt="map" useMap="#map" />
                                <map name="map">
                                    <area shape="rect" coords="205,173,302,215" onClick={() => { this.setState({ status: "0", current: 1 }); this.flashData(1, this.state.length, "0") }} />
                                    <area shape="rect" coords="205,440,302,485" onClick={() => { this.setState({ status: "1", current: 1 }); this.flashData(1, this.state.length, "1") }} />
                                    <area shape="rect" coords="205,528,302,571" onClick={() => { this.setState({ status: "2", current: 1 }); this.flashData(1, this.state.length, "2") }} />
                                    <area shape="rect" coords="205,604,302,646" onClick={() => { this.setState({ status: "3", current: 1 }); this.flashData(1, this.state.length, "3") }} />
                                    <area shape="rect" coords="99,312,198,355" onClick={() => { this.setState({ status: "-2", current: 1 }); this.flashData(1, this.state.length, "-2") }} />
                                    <area shape="rect" coords="99,382,198,425" onClick={() => { this.setState({ status: "-1", current: 1 }); this.flashData(1, this.state.length, "-1") }} />
                                </map>
                            </div>
                            <div className="admin-div reply-div">
                                <div style={{ display: "flex", lineHeight: "32px", textalign: "center" }}>
                                    <RangePicker onChange={(date, dateString) => { this.setState({ startTime: Date.parse(date[0]) - 86400 * 1000, endTime: Date.parse(date[1]) }) }} style={{ width: "400px", height: "32px" }} allowClear="true" />
                                    <Input type="text" autoComplete="off" placeholder="请输入标题栏关键字" style={{ width: "190px", height: "32px", marginLeft: "10px" }} name="keyword" value={this.state.keyword} onChange={(e) => { this.inputChange(e) }} />
                                    <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.state.current = 1; this.flashData(1, this.state.length, this.state.status) }}>查询</Button>
                                    {this.state.keyword !== "" ? <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.state.current = 1; this.state.keyword = ""; this.state.startTime = "", this.state.endTime = ""; this.flashData(1, this.state.length, this.state.status) }}>显示全部</Button> : null}

                                    {this.state.status === "0" ?
                                        <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#1DB198", color: "#fff" }} onClick={() => { this.changeStatus("1", 2) }}>批量通过</Button>
                                        : null
                                    }
                                    {this.state.status === "0" ?
                                        <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#D95232", color: "#fff" }} onClick={() => { this.changeStatus("-1", 2) }}>批量拒绝</Button>
                                        : null
                                    }
                                    {this.state.status === "1" ?
                                        <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#D95232", color: "#fff" }} onClick={() => { this.changeStatus("2", 2) }}>批量指派</Button>
                                        : null
                                    }
                                    {this.state.status !== "0" && this.state.status !== "2" && this.state.status !== "3" && this.state.status !== "6" ?
                                        <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#3B5998", color: "#fff" }} onClick={() => { this.changeStatus("0", 2) }}>批量撤销</Button>
                                        : null
                                    }

                                    {this.state.status !== "6" && this.state.status !== "-2" ?
                                        <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#e8bf40", color: "#fff" }} onClick={() => { this.changeStatus("-2", 2) }}>批量删除</Button>
                                        : null
                                    }
                                </div>


                                {/* <Table dataSource={this.state} columns={columns} /> */}
                                <Table checkboxState={true} checkArr={this.state.checkArr} checkAll={this.state.checkAll} arr={this.state.adviceArr} arrName={this.state.adviceNameArr} id={this.state.adviceidArr} updateData={this.updateData} checkItem={this.checkItem} parentType="7" />
                                <Page page={this.state.current} totalNum={this.state.totalNum} pageNum={this.state.pageNum} flashData={this.flashData} changeNum={this.changeNum} type={this.state.status} />
                            </div>

                        </div>
                    </div>
                </div>
                {this.state.adviceArr.length > 0 ?
                    <Modal maskClosable={false} title="编辑信息" footer={null} visible={this.state.visible} onCancel={() => { this.setState({ visible: false, index: 0 }) }}
                        bodyStyle={{ minHeight: "300px" }} >
                        <div style={{ marginTop: "5px", fontWeight: "bolder", fontSize: "20px" }}>
                            标题:<span dangerouslySetInnerHTML={{ __html: this.state.adviceArr[this.state.index].title.value }}></span><span style={{ color: "red" }}>({this.state.adviceArr[this.state.index].status.value}) </span>
                        </div>
                        <div style={{ marginTop: "15px" }}>
                            <span style={{ fontWeight: "bolder", fontSize: "15px" }}>用户名: </span>{this.state.adviceArr[this.state.index].username.value}
                        </div>
                        <div style={{ marginTop: "15px" }}>
                            <span style={{ fontWeight: "bolder", fontSize: "15px" }}>咨询类型: </span>{this.state.adviceArr[this.state.index].tag.value}
                        </div>
                        <div style={{ marginTop: "15px" }}>
                            <span style={{ fontWeight: "bolder", fontSize: "15px" }}>咨询时间: </span>{this.state.adviceArr[this.state.index].createTime.value}
                        </div>
                        <div style={{ marginTop: "15px" }}>
                            <span style={{ fontWeight: "bolder", fontSize: "15px" }}>联系电话: </span>{this.state.content[this.state.index].phone}
                        </div>
                        <div style={{ marginTop: "15px" }}>
                            <span style={{ fontWeight: "bolder", fontSize: "15px" }}>邮箱地址: </span>{this.state.content[this.state.index].email}
                        </div>
                        <div style={{ marginTop: "20px" }}>
                            <span style={{ fontWeight: "bolder", fontSize: "15px" }}>问题类型:</span> <Select value={this.state.content[this.state.index].type} style={{ marginLeft: "20px", minWidth: "200px" }} placeholder="请选择" onChange={(value) => { this.updateOperate(value) }}>
                                <Option value="primary">普通问题</Option>
                                <Option value="normal">常见问题</Option>
                                <Option value="hot">热门问题</Option>
                            </Select>
                        </div>
                        <div style={{ marginTop: "40px", backgroundColor: "#F6F6F6", minHeight: "150px", padding: "10px", boxSizing: "border-box" }}>
                            {this.state.content[this.state.index].images ? <img style={{ width: "100%", height: "100%" }} src={URI + "/upload?fileName=" + this.state.content[this.state.index].images} /> : null}

                            <div dangerouslySetInnerHTML={{ __html: this.state.content[this.state.index].content }}></div>
                        </div>
                        <div style={{ marginTop: "50px" }}>
                            <Button style={{ height: "32px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.setState({ visible: false }) }}>确认</Button>
                            {this.state.adviceArr[this.state.index].status.value === "待审核" ?
                                <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#22BAA0", color: "#fff" }} onClick={() => { this.changeStatus("1", 1) }}>通过审核</Button>
                                : null
                            }
                            {this.state.adviceArr[this.state.index].status.value === "待指派" ?
                                <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#22BAA0", color: "#fff" }} onClick={() => { this.changeStatus("2", 1) }}>指派</Button>
                                : null
                            }
                            {this.state.adviceArr[this.state.index].status.value === "待审核" || this.state.adviceArr[this.state.index].status.value === "待指派" ?
                                <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#E0745B", color: "#fff" }} onClick={() => { this.changeStatus("-1", 1) }}>拒绝</Button>
                                : null
                            }
                            {this.state.adviceArr[this.state.index].status.value !== "已删除" ?
                                <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#e8bf40", color: "#fff" }} onClick={() => { this.changeStatus("-2", 1) }}>删除</Button>
                                : null
                            }
                            {this.state.adviceArr[this.state.index].status.value !== "待审核" ?
                                <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#3B5998", color: "#fff" }} onClick={() => { this.changeStatus("0", 1) }}>撤销</Button>
                                : null
                            }
                        </div>
                    </Modal> : null
                }
            </div>
        )
    }
}
export default Advice