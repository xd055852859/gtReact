import React, { Component } from 'react';
import { Input, Button, DatePicker, Select, message, Modal } from 'antd';
import { postJSON, getAJAX } from '../ADS.js';
import { URI } from '../../data/data.js';
import Page from '../common/page/page';
import Table from '../common/table/table';
import Home from '../home/home';
import './datacheck.css';
const { RangePicker } = DatePicker;
const Option = Select.Option;
class DataCheck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataCheckNameArr: ["编号", "标题", "类别", "发布人", "发布时间", "状态", "操作"],
            dataCheckArr: [],
            dataCheckidArr: [],
            visible: false,
            value: "blog",
            length: 10,
            type: "blog",
            pageNum: 0,
            totalNum: 0,
            startTime: "",
            endTime: "",
            keyword: "",
            key: 0,
            index: 0,
            content: [],
            img: [],
            current: 1,
            isPublic: [],
            filePath: []
        }
        this.delData = this.delData.bind(this);
        this.updateData = this.updateData.bind(this);
        this.flashData = this.flashData.bind(this);
        this.changeNum = this.changeNum.bind(this);
    }
    componentDidMount() {
        this.flashData(1, this.state.length, this.state.type);
    }

    flashData(page, limit, type) {
        isNaN(this.state.startTime) ? this.state.startTime = null : null;
        isNaN(this.state.endTime) ? this.state.endTime = null : null;
        let url = ""
        let dataCheckData = {
            //"token": sessionStorage.getItem("token"),
            "page": page,
            "limit": limit,
            "search": this.state.keyword,
            "startTime": this.state.startTime,
            "endTime": this.state.endTime
        }
        if (type === "blog") {
            url = URI + "/blog/list";
        } else if (type === "picture") {
            url = URI + "/picture/list";
        } else {
            url = URI + "/gdonate/list";
            dataCheckData.type = 2
        }

        getAJAX(url, dataCheckData, this.getData.bind(this));
    }
    getData(res) {
        if (res.msg === "OK") {
            //this.state.adminArr=[];
            let arr1 = [];
            let arr2 = [];
            let arr3 = [];
            let arr4 = [];
            let arr5 = [];
            let arr6 = [];
            if (!res.result) {
                res.result = res.data
            }
            res.result.map((item, index) => {
                arr1.push({
                    id: { value: item._key, visible: true },
                    title: { value: this.state.type === "catalog" ? item.gname : item.title, visible: true },
                    tag: { value: this.state.type === "blog" ? "个人日志" : this.state.type === "picture" ? "家庭照片" : "家族族谱", visible: true },
                    nickname: { value:  item.nickname, visible: true },
                    createTime: { value: new Date(item.createTime).toLocaleString(), visible: true },
                })
                arr2.push(item._key);
                arr5.push(item.isPublic === 1 ? false : true);

                if (this.state.type === "blog" || this.state.type === "catalog") {
                    arr3.push(item.content);
                    this.state.dataCheckNameArr = ["编号", "标题", "类别", "发布人", "发布时间", "状态", "操作"];
                    arr1[index].status = { value: item.status === 1 || item.isPublic === 1 ? "审核通过" : item.status === 0 ? "待审核" : "审核未通过", visible: true }
                    arr6.push({ value: URI + "/upload?fileName=" + item.filePath, name: item.filePath });
                }
                else {
                    //api+'upload?fileName='+response.filePath
                    arr4.push(URI + "/upload?fileName=" + item.photoPath);
                    arr1[index].img = { value: URI + "/upload?fileName=" + item.photoPath, visible: true, imgState: true },
                        this.state.dataCheckNameArr = ["编号", "标题", "类别", "发布人", "发布时间", "预览图", "状态", "操作"];
                }
                arr1[index].status = { value: item.status === 1 || item.isPublic === 1 ? "审核通过" : item.status === 0 ? "待审核" : "审核未通过", visible: true }
                arr1[index].state = { visible: true }
                console.log(arr6);
            })
            this.setState({
                dataCheckArr: arr1,
                dataCheckNameArr: this.state.dataCheckNameArr,
                dataCheckidArr: arr2,
                pageNum: res.pages,
                totalNum: res.totals,
                content: arr3,
                img: arr4,
                visible: false,
                length: this.state.length,
                current: this.state.current,
                isPublic: arr5,
                filePath: arr6
            });

        }
    }

    //blog/list  get
    delData() {
        let dataCheckData = {};
        let url = ""
        if (this.state.type === "blog") {
            url = URI + "/blog/delete";
            dataCheckData = {
                userId: sessionStorage.getItem("userId"),
                id: this.state.key
            }
        } else if (this.state.type === "picture") {
            url = URI + "/picture/delete";
            dataCheckData = {
                id: this.state.key
            }
        } else {
            url = URI + "/gdonate/delete";
            dataCheckData = {
                userId: sessionStorage.getItem("userId"),
                id: this.state.key
            }
        }
        postJSON(url, dataCheckData, (response) => {
            if (response.data.msg === "OK") {
                message.success("删除成功!");
                if (this.state.type === "blog" || this.state.type === "catalog") {
                    this.flashData(this.state.current, this.state.length, this.state.type);
                } else {
                    let msgAddUrl = URI + "/message/add";
                    let msgAddData = {
                        //token: sessionStorage.getItem("token"),
                        userId: this.state.userId,
                        type: 4
                    }
                    postJSON(msgAddUrl, msgAddData, (response) => {
                        message.success("已通知用户!");
                        this.flashData(this.state.current, this.state.length, this.state.type);
                    })
                }
            } else {
                message.error("删除失败!")
            }
        })
    }
    updateData(key, index) {
        this.setState({
            key: key,
            index: index,
            visible: true
        })
    }

    changeData(value) {
        switch (value) {
            case "blog":
                this.setState({ type: "blog" })
                break;
            case "picture":
                this.setState({ type: "picture" })
                break;
            case "catalog":
                this.setState({ type: "catalog" })
                break;
            default: null
        }
        this.setState({
            current: 1
        })
        this.flashData(1, this.state.length, value);
    }

    inputChange(e) {
        const { name, value } = e.target;
        this.setState((prevState) => {
            prevState[name] = value;
            return prevState
        })
    }
    //搜索
    // searchData() {
    //     let url = ""
    //     if (this.state.type === "blog") {
    //         url = URI + "/blog/list";           
    //     }
    //     else {
    //         url= URI + "/picture/list";
    //     } 
    //     let dataCheckData = {
    //         "page": 1,
    //         "limit": this.state.length,
    //         "search": this.state.keyword,
    //         "startTime": this.state.startTime,
    //         "endTime": this.state.endTime
    //     }
    //     getAJAX(url, dataCheckData, this.getData.bind(this));
    // }
    changeStatus(type) {
        let dataCheckData = {};
        let url = ""
        if (this.state.type === "blog") {
            url = URI + "/blog/checkStatus";
            dataCheckData = {
                "userId": sessionStorage.getItem("userId"),
                "ids": this.state.key + "",
                "status": type
            }
        }
        else if (this.state.type === "catalog") {
            url = URI + "/gdonate/check";
            dataCheckData = {
                "ids": this.state.key,
                "status": type
            }
        } else {
            url = URI + "/picture/update";
            dataCheckData = {
                "id": this.state.key,
                "status": type
            }
        }
        postJSON(url, dataCheckData, (response) => {
            if (response.data.msg === "OK") {
                message.success("更新成功!");
                this.flashData(this.state.current, this.state.length, this.state.type);
            } else {
                message.error("更新失败!");
            }
        })
    }
    //分页修改page条数
    changeNum(length, page) {
        this.setState({
            length: length,
            current: page
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
                <Home chooseIndex="4" />
                <div className="right-container">
                    <div className="admin-container">
                        <div className="admin-title">用户文章审核</div>
                        <div className="admin-div">
                            <div style={{ display: "flex", lineHeight: "32px", textalign: "center" }}>
                                <RangePicker onChange={(date, dateString) => { this.setState({ startTime: Date.parse(date[0]) - 86400 * 1000, endTime: Date.parse(date[1]) }) }} style={{ width: "400px", height: "32px" }} allowClear="true" />
                                <Input type="text" autoComplete="off" placeholder="请输入标题栏关键字" style={{ width: "190px", height: "32px", marginLeft: "10px" }} name="keyword" value={this.state.keyword} onChange={(e) => { this.inputChange(e) }} />
                                <Select defaultValue={this.state.value} style={{ marginLeft: "20px", minWidth: "200px" }} placeholder="请选择" onChange={(value) => { this.changeData(value) }}>
                                    <Option value="blog">个人日志</Option>
                                    <Option value="picture">家庭照片</Option>
                                    <Option value="catalog">个人家谱</Option>
                                </Select>
                                <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.state.current = 1; this.flashData(1, this.state.length, this.state.type) }}>查询</Button>
                                <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.state.current = 1; this.state.keyword = ""; this.state.startTime = ""; this.state.endTime = ""; this.flashData(1, this.state.length, this.state.type) }}>重置</Button>
                            </div>


                            {/* <Table dataSource={this.state} columns={columns} /> */}
                            <Table arr={this.state.dataCheckArr} arrName={this.state.dataCheckNameArr} id={this.state.dataCheckidArr} updateData={this.updateData} parentType="4" type={this.state.value} />
                            <Page page={this.state.current} totalNum={this.state.totalNum} pageNum={this.state.pageNum} flashData={this.flashData} changeNum={this.changeNum} type={this.state.type} />
                        </div>
                    </div>
                </div>
                <Modal maskClosable={false} title="数据内容" footer={null} visible={this.state.visible} onOk={() => { this.saveAdmin() }} onCancel={() => { this.setState({ visible: false }) }}>
                    {this.state.type !== "catalog" ? <React.Fragment>
                        <div dangerouslySetInnerHTML={{ __html: this.state.content[this.state.index] }} ></div>
                        <div><img src={this.state.img[this.state.index]} style={{ height: "100%", width: "100%" }} alt="" /></div>
                    </React.Fragment>
                        : <div><a href={this.state.filePath.length > 0 ? this.state.filePath[this.state.index].value : null} target="_blank" >{this.state.filePath.length > 0 ? this.state.filePath[this.state.index].name : null}</a></div>
                    }
                    <div style={{ marginTop: "20px" }}>
                        <Button style={{ height: "32px", backgroundColor: "#E0745B", color: "#fff" }} onClick={() => { this.delData() }}>删除</Button>
                        {this.state.isPublic[this.state.index] ? <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.changeStatus(1) }}>审核通过</Button> : null}
                        {this.state.isPublic[this.state.index] ? <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.changeStatus(-1) }}>审核未通过</Button> : null}
                    </div>
                </Modal>
            </div>
        )
    }
}
export default DataCheck