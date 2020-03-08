import React, { Component } from 'react';
import { Button, DatePicker, message, Modal } from 'antd';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import { postJSON, getAJAX } from '../ADS.js';
import { URI } from '../../data/data.js';
import Page from '../common/page/page';
import Table from '../common/table/table';
import Home from '../home/home';
import './given.css';
const { RangePicker } = DatePicker;

class Given extends Component {
    constructor(props) {
        super(props);
        this.state = {
            givenNameArr: ["家谱名", "上传日期", "下载链接", "捐赠人", "手机", "邮箱", "状态", "操作"],
            givenArr: [],
            totalNum: 0,
            pageNum: 0,
            visible: false,
            length: 10,
            givenidArr: [],
            key: 0,
            index: 0,
            startTime: "",
            endTime: "",
            checkArr: [],
            checkAll: false,
            current: 1,
            realName:[]
        }
        this.delData = this.delData.bind(this);
        this.updateData = this.updateData.bind(this);
        this.flashData = this.flashData.bind(this);
        this.changeNum = this.changeNum.bind(this);
        this.checkItem = this.checkItem.bind(this);
    }
    componentDidMount() {
        this.flashData(1, this.state.length);
    }

    flashData(page, limit) {
        isNaN(this.state.startTime) ? this.state.startTime = null : null;
        isNaN(this.state.endTime) ? this.state.endTime = null : null;
        let url = URI + "/gdonate/list";
        let givenData = {
            //"token": sessionStorage.getItem("token"),
            "startTime": this.state.startTime,
            "endTime": this.state.endTime,
            "page": 1,
            "limit": 10,
            "type": 1,
        }
        getAJAX(url, givenData, this.getData.bind(this));
    }
    getData(res) {
        if (res.msg === "OK") {
            //this.state.adminArr=[];
            let arr1 = [];
            let arr2 = [];
            let arr3 = [];
            let arr4 = [];
            res.data.map((item, index) => {
                arr1.push({
                    gname: { value: item.gname, visible: true },
                    createTime: { value: new Date(item.createTime).toLocaleString(), visible: true },
                    filePath: { value: item.filePath, visible: true,fileState:true},
                    creator: { value: item.creator, visible: true },
                    mobile: { value: item.mobile, visible: true },
                    email: { value: item.email, visible: true },
                    status: { value: item.status === 0 ? "待审核" : item.status === 1 ? "审核通过" : item.status === -1 ? "审核未通过" : "发放证书", visible: true },
                    state: { visible: true }
                })
                arr2.push(item._key);
                arr3.push(false);
                arr4.push(item.realName);
            })
            this.setState({
                givenArr: arr1,
                givenidArr: arr2,
                pageNum: res.pages,
                totalNum: res.totals,
                checkArr: arr3,
                checkAll: false,
                length: this.state.length,
                current: this.state.current,
                realName:arr4
            });
        }
    }

    delData(key, index) {
        ///gdonate/delete
        let url = URI + "/gdonate/delete";
        postJSON(url, { userId: sessionStorage.getItem("userId"), id: key }, (response) => {
            if (response.data.msg === "OK") {
                message.success("删除成功!");
                this.flashData(this.state.current, this.state.length);
            } else {
                message.error("删除失败!")
            }
        })
    }

    updateData(key, index, type) {
        this.state.key = [key];
        this.setState({
            visible: true,
            key: key,
            index: index
        })

    }
    changeStatus(type) {
        ///gdonate/check  
        let url = URI + "/gdonate/check";
        let data = {
            ids: this.state.key,
            status: type
            // token: sessionStorage.getItem("token"),
            // userId: key
        }
        postJSON(url, data, (response) => {
            if (response.data.msg === "OK") {
                message.success("更新状态成功!");
                this.flashData(this.state.current, this.state.length);
            } else {
                message.error("更新状态失败!")
            }
            this.setState({
                visible: false
            })
        })
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
    //     let url = URI + "/gdonate/list";
    //     let searchData = {
    //         //"token": sessionStorage.getItem("token"),
    //         "startTime": this.state.startTime,
    //         "endTime": this.state.endTime,
    //         "page": 1,
    //         "limit": 10,
    //         "type": 1,
    //     }
    //     getAJAX(url, searchData, this.getData.bind(this));
    // }
    //分页修改page条数
    changeNum(length, page) {
        this.setState({
            length: length,
            current: page
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
    reviewData(type) {
        let ids = "";
        this.state.checkArr.map((item, index) => {
            ids += item ? this.state.givenidArr[index] + "," : ""
        })
        if (ids.length !== 0) {
            let url = URI + "/gdonate/check";
            let data = {
                ids: ids.substr(0, ids.length - 1),
                status: type
                // token: sessionStorage.getItem("token"),
                // userId: key
            }
            postJSON(url, data, (response) => {
                if (response.data.msg === "OK") {
                    message.success("更新状态成功!");
                    this.flashData(this.state.current, this.state.length);
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
    componentWillUnmount () {
        this.setState = (state,callback)=>{
          return;
        };
    }
    render() {
        return (
            <div>
                <Home chooseIndex="10" />
                <div className="right-container">
                    <div className="admin-container">
                        <div className="admin-title">家谱捐赠管理</div>
                        <div className="admin-div">
                            <div style={{ display: "flex", lineHeight: "32px", textalign: "center" }}>
                                <RangePicker locale={locale} onChange={(date, dateString) => { this.setState({ startTime: Date.parse(date[0]) - 86400 * 1000, endTime: Date.parse(date[1]) }) }} style={{ width: "400px", height: "32px" }} allowClear="true" />
                                <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.state.current = 1; this.flashData(1, this.state.length) }}>查询</Button>
                                <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.state.current = 1; this.state.startTime = ""; this.state.endTime = ""; this.flashData(1, this.state.length) }}>重置</Button>
                                <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#22BAA0", color: "#fff" }} onClick={() => { this.reviewData(1) }}>批量通过</Button>
                                <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#E0745B", color: "#fff" }} onClick={() => { this.reviewData(-1) }}>批量拒绝</Button>
                            </div>
                            {/* <Table dataSource={this.state} columns={columns} /> */}
                            <Table checkboxState={true} checkArr={this.state.checkArr} checkAll={this.state.checkAll} arr={this.state.givenArr} arrName={this.state.givenNameArr} id={this.state.givenidArr} delData={this.delData} updateData={this.updateData} checkItem={this.checkItem} realName={this.state.realName} parentType="2" />
                            <Page page={this.state.current} totalNum={this.state.totalNum} pageNum={this.state.pageNum} flashData={this.flashData} changeNum={this.changeNum} />
                        </div>

                    </div>
                </div>
                <Modal maskClosable={false}  title="修改状态" footer={null} visible={this.state.visible} onCancel={() => { this.setState({ visible: false }) }}>
                    <Button style={{ height: "32px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.changeStatus(1) }}>审核通过</Button>
                    <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.changeStatus(-1) }}>审核未通过</Button>
                    <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#22BAA0", color: "#fff" }} onClick={() => { this.changeStatus(2) }}>发放证书</Button>
                </Modal>
            </div>
        )
    }
}
export default Given