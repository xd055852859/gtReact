import React, { Component } from 'react';
import { Input, Button, message } from 'antd';
import { postJSON, getAJAX } from '../ADS.js';
import { URI } from '../../data/data.js';
import Page from '../common/page/page';
import Table from '../common/table/table';
import Home from '../home/home';
import './audios.css';

class Audios extends Component {
    constructor(props) {
        super(props);
        this.state = {
            audiosNameArr: ["标题", "类别", "卷数", "总页数", "发布人", "发布时间", "操作"],
            audiosArr: [],
            length: 10,
            pageNum: 0,
            totalNum: 0,
            current: 1
        }
        this.delData = this.delData.bind(this);
        this.changeNum = this.changeNum.bind(this);
    }
    componentDidMount() {
        this.flashData(1, this.state.length);
    }

    flashData(page, limit) {
        let url = URI + "/data/imageList";
        let audioData = {
            "curPage": 1,
            "perPage": this.state.length,
            "keyWord": this.state.keyword
        }
        getAJAX(url, audioData, this.getData.bind(this));
    }
    getData(res) {
        if (res.msg === "OK") {
            //this.state.adminArr=[];
            let arr1 = [];
            let arr2 = [];
            res.result.list.map((item, index) => {
                arr1.push({
                    geaName: { value: item.genealogyName, visible: true },
                    title: { value: item.form, visible: true },
                    tag: { value: item.volumes, visible: true },
                    total: { value: item.total, visible: true },
                    username: { value: item.admin, visible: true },
                    createTime: { value: new Date(item.createTime).toLocaleString(), visible: true },
                    state: { visible: true }
                })
                arr2.push(item._key);
            })
            this.setState({
                audiosArr: arr1,
                audiosidArr: arr2,
                pageNum: res.result.pageNum,
                totalNum: res.result.totalNum,
                length: this.state.length,
                current: this.state.current
            });
        }
    }

    delData(key, index) {
        let url = URI + "/data/image";
        postJSON(url, { catalogKey: key }, (response) => {
            if (response.data.msg === "OK") {
                message.success("删除成功!");
                this.flashData(this.state.current, this.state.length);
            } else {
                message.error("删除失败!")
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
    //分页修改page条数
    changeNum(length, page) {
        this.setState({
            length: length,
            current: page
        })
    }
    //搜索
    // searchData() {
    //     let url = URI + "/data/imageList";
    //     let adminData = {
    //         "curPage": 1,
    //         "perPage": this.state.length,
    //         "keyWord": this.state.keyword
    //     }
    //     getAJAX(url, adminData, this.getData.bind(this));
    // }
    componentWillUnmount () {
        this.setState = (state,callback)=>{
          return;
        };
    }
    render() {
        return (
            <div>
                <Home chooseIndex="11" />
                <div className="right-container">
                    <div className="admin-container">
                        <div className="admin-title">影像文件管理</div>
                        <div className="admin-div">
                            <div style={{ display: "flex", lineHeight: "32px", textalign: "center" }}>
                                <Input type="text" autoComplete="off" placeholder="请输入标题栏关键字" style={{ width: "190px", height: "32px" }} name="keyword" value={this.state.keyword} onChange={(e) => { this.inputChange(e) }} />
                                <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.state.current = 1;this.flashData(1, this.state.length); }}>查询</Button>
                                <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.state.current = 1;this.state.keyword = ""; this.flashData(1, this.state.length); }}>重置</Button>
                            </div>
                            {/* <Table dataSource={this.state} columns={columns} /> */}
                            <Table arr={this.state.audiosArr} arrName={this.state.audiosNameArr} id={this.state.audiosidArr} delData={this.delData} parentType="6" />
                            <Page page={this.state.current}  totalNum={this.state.totalNum} pageNum={this.state.pageNum} flashData={this.flashData} changeNum={this.changeNum} />
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}
export default Audios