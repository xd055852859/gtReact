import React, { Component } from 'react';
import { Menu, Icon, Input, Button, DatePicker, Modal, message } from 'antd';
import { postJSON, getAJAX } from '../ADS.js';
import { URI } from '../../data/data.js';
import Page from '../common/page/page';
import Table from '../common/table/table';
import Home from '../home/home';
import Editor from '../common/editor/editor';
import BraftEditor from 'braft-editor'
import 'braft-editor/dist/braft.css'

import './reply.css';
const { RangePicker } = DatePicker;

const { TextArea } = Input;
class Reply extends Component {
    constructor(props) {
        super(props);
        this.state = {
            replyNameArr: ["状态", "标题", "类型", "用户", "时间", "操作"],
            replyArr: [],
            visible: false,
            replyidArr: [],
            length: 10,
            pageNum: 0,
            totalNum: 0,
            isComment: "2",
            startTime: null,
            endTime: null,
            keyword: "",
            content: [],
            index: 0,
            key: 0,
            checkArr: [],
            checkAll: false,
            text: "",
            url: [],
            number: 0,
            validwordArr: [],
            current: 1
        }
        this.updateData = this.updateData.bind(this);
        this.flashData = this.flashData.bind(this);
        this.changeNum = this.changeNum.bind(this);
        this.saveReply = this.saveReply.bind(this);
        this.hideModal = this.hideModal.bind(this);
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
                this.flashData(1, this.state.length, this.state.isComment);
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
                    }
                    this.flashData(1, this.state.length, this.state.isComment);
                })                
            }
        })
    }
    flashData(page, limit, type) {
        isNaN(this.state.startTime) ? this.state.startTime = null : null;
        isNaN(this.state.endTime) ? this.state.endTime = null : null;
        let url = URI + "/questions/list";
        let replyData = {
            // "token": sessionStorage.getItem("token"),
            "page": page,
            "limit": limit,
            "startTime": this.state.startTime,
            "endTime": this.state.endTime,
            "search": this.state.keyword,
            "status": type
        }
        getAJAX(url, replyData, this.getData.bind(this));
    }
    getData(res) {
        if (res.msg === "OK") {
            //this.state.adminArr=[];
            let [arr1, arr2, arr3, arr4] = [[], [], [], []];
            res.data.map((item, index) => {
                if (item.status === 2 || item.status === 3) {
                    arr1.push({
                        isComment: {
                            value:
                                item.status === 2 ? "未回复"
                                    : "已回复", visible: true
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
                    arr3.push({ content: item.content, email: item.email, phone: item.phone, type: item.type, comments: item.comments ? item.comments.content : null });
                    arr4.push(false);
                }
            })
            this.setState({
                replyArr: arr1,
                replyidArr: arr2,
                pageNum: res.pages,
                totalNum: res.totals,
                content: arr3,
                startTime: this.state.startTime,
                endTime: this.state.endTime,
                length: this.state.length,
                current: this.state.current
            });
        }
    }

    updateData(key, index) {
        this.state.replyArr[this.state.index].isComment.value === "未回复" ? this.state.text = "" : null;
        //message.success("已有敏感词: " + this.state.validwordArr)
        this.setState({
            visible: true,
            index: index,
            key: key,
            number: key,
            text: this.state.text
        })
    }

    inputChange(e) {
        const { name, value, type, checked } = e.target;
        this.setState((prevState) => {
            prevState[name] = value;
            return prevState
        })
    }
    //替换方法
    changeUrl(arr, str) {
        arr.map((item, index) => {
            str = str.replace(/<img src=\"(blob:||data:)+.*?(?:>|\/>)/, item)
        })
        this.state.text = str;
        this.setState({
            text: str
        })
    }
    //分页修改page条数
    changeNum(length, page) {
        this.setState({
            length: length,
            current: page
        })
    }
    updateComment(value) {
        this.state.content[this.state.index].type = value;
        this.setState({
            content: this.state.content
        })
        let url = URI + "/questions/update";
        let data = {
            id: this.state.key,
            operate: value
            // token: sessionStorage.getItem("token"),
            // userId: key
        }
        postJSON(url, data, (response) => {

            if (response.data.msg === "OK") {

            }
        })
    }
    saveReply(text) {
        this.state.text = text
        if (this.state.validwordArr.some((item, index) => {
            let str = this.state.text.replace(/<\/?.+?\/?>/g, "").replace(/\s+/g, "");
            if (str.indexOf(item) != -1) {
                message.error("回复中第" + (str.indexOf(item) + 1) + "个字到第" + (str.indexOf(item) + item.length) + "个字为敏感词--" + item + ",请修改")
                return true;
            }
        })) {
            return;
        }

        let url = URI + "/questions/submit";
        let data = {
            id: this.state.key,
            comments: this.state.text,
            // token: sessionStorage.getItem("token"),
            adminId : sessionStorage.getItem("userId")
        }
        postJSON(url, data, (response) => {

            if (response.data.msg === "OK") {
                message.success("保存成功")
                this.setState({
                    visible: false,
                    current:1
                })
                this.flashData(1, this.state.length, this.state.isComment);
            }else{
                message.error("保存失败");
                this.setState({
                    visible: false
                })
            }
        })
    }

    hideModal() {
        this.setState({
            visible: false,
            text: "",
            title: ""
        })
    }
    componentWillUnmount () {
        this.setState = (state,callback)=>{
          return;
        };
    }
    render() {
        return (
            <div>
                <Home chooseIndex="7" />
                <div className="right-container">
                    <div className="admin-container">
                        <div className="admin-title">专家咨询回复</div>
                        <Menu onClick={(e) => { this.setState({ isComment: e.key,current:1 }); this.flashData(1, this.state.length, e.key) }} selectedKeys={[this.state.isComment]} mode="vertical" style={{ float: "left", width: "20%", border: "0px" }}>
                            <Menu.Item key="2"><Icon type="appstore" />未回复</Menu.Item>
                            <Menu.Item key="3"><Icon type="appstore" />已回复</Menu.Item>
                        </Menu>


                        <div className="admin-div reply-div">
                            <div style={{ display: "flex", lineHeight: "32px", textalign: "center" }}>
                                <RangePicker onChange={(date, dateString) => { this.setState({ startTime: Date.parse(date[0]) - 86400 * 1000, endTime: Date.parse(date[1]) }) }} style={{ width: "400px", height: "32px" }} allowClear="true" />
                                <Input type="text" autoComplete="off" placeholder="请输入标题栏关键字" style={{ width: "190px", height: "32px", marginLeft: "10px" }} name="keyword" value={this.state.keyword} onChange={(e) => { this.inputChange(e) }} />
                                <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.state.current=1;this.flashData(1, this.state.length, this.state.isComment) }}>查询</Button>
                                {this.state.keyword !== "" ? <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => {  this.state.current=1;this.state.keyword = ""; this.state.startTime = null; this.state.endTime = null, this.flashData(1, this.state.length, this.state.isComment) }}>显示全部</Button> : null}

                            </div>


                            {/* <Table dataSource={this.state} columns={columns} /> */}
                            <Table arr={this.state.replyArr} arrName={this.state.replyNameArr} id={this.state.replyidArr} updateData={this.updateData} parentType="7" />
                            <Page page={this.state.current} totalNum={this.state.totalNum} pageNum={this.state.pageNum} flashData={this.flashData} changeNum={this.changeNum} type={this.state.isComment} />
                        </div>

                    </div>
                </div>
                {this.state.replyArr.length > 0 ?
                    <Modal maskClosable={false}  title="编辑信息" footer={null} visible={this.state.visible} onOk={() => { this.saveAdmin() }} onCancel={() => { this.setState({ visible: false }) }}
                        bodyStyle={{ minHeight: "300px" }} okText="确定" cancelText="取消" width="1000px">
                        <div style={{ marginTop: "5px", fontWeight: "bolder", fontSize: "20px" }}>
                            标题:{this.state.replyArr[this.state.index].title.value}  <span style={{ color: "red" }}>({this.state.replyArr[this.state.index].isComment.value}) </span>
                        </div>
                        <div style={{ marginTop: "15px" }}>
                            <span style={{ fontWeight: "bolder", fontSize: "15px" }}>用户名: </span>{this.state.replyArr[this.state.index].username.value}
                            <span style={{ fontWeight: "bolder", fontSize: "15px", marginLeft: "20px" }}>咨询类型: </span>{this.state.replyArr[this.state.index].tag.value}
                            <span style={{ fontWeight: "bolder", fontSize: "15px", marginLeft: "20px" }}>咨询时间: </span>{this.state.replyArr[this.state.index].createTime.value}
                        </div>
                        <div style={{ marginTop: "15px" }}>
                            <span style={{ fontWeight: "bolder", fontSize: "15px" }}>联系电话: </span>{this.state.content[this.state.index].phone}
                            <span style={{ fontWeight: "bolder", fontSize: "15px", marginLeft: "20px" }}>邮箱地址: </span>{this.state.content[this.state.index].email}
                        </div>
                        <div style={{ marginTop: "40px", backgroundColor: "#F6F6F6", padding: "10px", boxSizing: "border-box" }} dangerouslySetInnerHTML={{ __html: this.state.content[this.state.index].content }}>
                        </div>
                        {
                            this.state.replyArr[this.state.index].isComment.value === "已回复" ?
                                // <div dangerouslySetInnerHTML={{ __html: this.state.content[this.state.index].comments }} style={{ marginTop: "20px" }}></div>
                                <Editor id="editor" content={this.state.content[this.state.index].comments} save={this.saveReply} hideModal={this.hideModal} />
                                : <Editor id="editor" content={this.state.text} save={this.saveReply} hideModal={this.hideModal} />
                        }
                    </Modal> : null
                }
            </div>
        )
    }
}
export default Reply