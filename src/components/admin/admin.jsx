import React, { Component } from 'react';
import { Icon, Input, Button, Select, Modal, message } from 'antd';
import { postJSON, getAJAX } from '../ADS.js';
import { URI } from '../../data/data.js';
import Page from '../common/page/page';
import Table from '../common/table/table';
import Home from '../home/home';
import { socketConnect } from 'socket.io-react';
import './admin.css';
const Option = Select.Option;
let children = [];
for (let i = 10; i < 36; i++) {
    children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}
class Admin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            adminNameOriArr: ["账号名称", "角色", "状态", "操作"],
            adminNameArr: ["账号名称", "角色", "状态", "操作"],
            roleAdminArr: [],
            adminArr: [],
            visible: false,
            username: "",
            password: "",
            roleId: "0",
            keyword: "",
            adminidArr: [],
            totalNum: 0,
            pageNum: 0,
            value: ["username0", "roleId1", "status2", "state3"],
            length: 10,
            roleAdminNameArr: {},
            usernameArr: [],
            current: 1,
            lockArr: [],
            index: 0,
            key: 0,
            saveState: 0
        }
        this.delData = this.delData.bind(this);
        this.updateData = this.updateData.bind(this);
        this.flashData = this.flashData.bind(this);
        this.changeNum = this.changeNum.bind(this);
        this.updatePasswordData = this.updatePasswordData.bind(this);
    }
    componentDidMount() {
        let url = URI + "/role/list";
        let roleData = {
            "token": sessionStorage.getItem("token"),
            "page": 1,
            "limit": 1000,
        }
        getAJAX(url, roleData, (res) => {
            let [arr, obj] = [[], {}]
            res.result.roleList.map((item, index) => {
                arr.push({
                    roleName: item.roleName,
                    roleId: item._key
                })
                obj[item._key] = item.roleName;

            })
            this.setState({
                roleAdminArr: arr,
                roleAdminNameArr: obj,
                roleId: arr[0].roleId
            })
            this.flashData(this.state.current, this.state.length);
        });
    }
    flashData(page, limit) {
        let url = URI + "/admin/list";
        let adminData = {
            "token": sessionStorage.getItem("token"),
            "page": page,
            "limit": limit,
            "sort": "roleId",
            "key": this.state.keyword
        }
        getAJAX(url, adminData, this.getData.bind(this));
    }

    //创建账号
    saveAdmin() {
        let url = URI + "/admin/add";
        if (this.state.usernameArr.indexOf(this.state.username) !== -1) {
            message.error("用户名重复,请修改用户名");
            return;
        }
        if (this.state.username === "") {
            message.error("请输入用户名");
            return;
        }
        if (this.state.password === "") {
            this.state.password = "123456";
        }
        postJSON(url, { username: this.state.username, password: this.state.password, roleId: parseInt(this.state.roleId) }, (response) => {
            if (response.data.msg === "OK") {
                message.success("新建成功!");
                this.setState({
                    visible: false,
                    username: "",
                    password: "",
                    roleId: this.state.roleAdminArr[0].roleId,
                    saveState: 0,
                    current:1
                })
                this.flashData(1, this.state.length);
            } else {
                message.error("新建失败!")
            }
        })
    }

    getData(res) {
        if (res.msg === "OK") {
            //this.state.adminArr=[];
            let [arr1, arr2, arr3, arr4, arr5] = [[], [], [], [], []];
            res.result.adminList.map((item, index) => {
                arr1.push({
                    username: { value: item.username, visible: true },
                    roleId: { value: this.state.roleAdminNameArr[item.roleId + ""], visible: true },
                    status: { value: item.status === 0 ? "冻结" : "正常", visible: true },
                    state: { visible: true }
                })
                arr2.push(item._key)
                arr3.push(item.username);
                arr4.push(item.status === 0 ? true : false);
            })
            this.setState({
                adminArr: arr1,
                adminidArr: arr2,
                pageNum: res.result.pageNum,
                totalNum: res.result.totalNum,
                usernameArr: arr3,
                lockArr: arr4,
                length: this.state.length,
                current: this.state.current
            });
            this.changeData(this.state.value)
        }
    }

    delData(key, index) {
        let url = URI + "/admin/delete";
        if (key === sessionStorage.getItem("userId")) {
            message.error("请勿删除当前登录的账号");
            return;
        }
        if(this.state.adminArr[index].username.value ===  "admin"){
            message.error("默认超级管理员账号无法被删除");
            return;
        }
        postJSON(url, { token: sessionStorage.getItem("token"), targetId: key }, (response) => {
            if (response.data.msg === "OK") {
                message.success("删除成功!");
                this.flashData(this.state.current, this.state.length);
            } else {
                message.error("删除失败!")
            }
        })
    }
    updatePasswordData(key, index) {
        this.setState({
            visible: true,
            username: this.state.adminArr[index].username.value,
            password: "",
            roleId: this.state.adminArr[index].roleId.value,
            index: index,
            key: key,
            saveState: 1          
        })
    }
    updateData(key, index, type) {
        let url = URI + "/admin/update";
        let data = {
            token: sessionStorage.getItem("token"),
            userId: key
        }
        if (type === "password") {
            this.state.password = this.state.password === "" ? "123456" : this.state.password
            data.password = this.state.password
        } else if (type === "status") {
            if (key === sessionStorage.getItem("userId")) {
                message.error("请勿冻结当前登录的账号");
                return;
            } else {
                data.status = this.state.adminArr[index].status.value === "冻结" ? 1 : 0
            }
        }
        postJSON(url, data, (response) => {
            if (response.data.msg === "OK") {
                message.success("更新成功!");
                this.setState({
                    visible: false,
                    username: "",
                    password: "",
                    roleId: "0",
                    saveState: 0,
                })
                this.flashData(this.state.current, this.state.length);
            } else {
                message.error("更新失败!")
            }
        })
    }


    //选中展现的内容
    changeTable(value) {
        this.setState({
            value: value
        })
        this.changeData(value);
    }
    //处理数据
    changeData(value) {
        let arr = [];
        let arr1 = [];
        value.map((item, index) => {
            arr.push(parseInt(item.replace(/[^0-9]/ig, "")))
            arr1.push(item.replace(/[0-9]/ig, ""))
        })
        this.state.adminNameArr = [];
        this.state.adminNameOriArr.map((item, index) => {
            if (arr.indexOf(index) !== -1) {
                this.state.adminNameArr.push(item);
            }
        })
        this.state.adminArr.map((item, index) => {
            for (let i in item) {
                if (arr1.indexOf(i) === -1) {
                    item[i].visible = false
                } else {
                    item[i].visible = true
                }
            }
        })
        this.setState({
            adminNameArr: this.state.adminNameArr,
            adminArr: this.state.adminArr
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
    componentWillUnmount () {
        this.setState = (state,callback)=>{
          return;
        };
    }
    render() {
        return (
            <div>
                <Home chooseIndex="0" type="0" />
                <div className="right-container">
                    <div className="admin-container">
                        <div className="admin-title">系统账户管理</div>
                        <div className="admin-div">
                            <div style={{ display: "flex", lineHeight: "32px", textalign: "center" }}>
                                <Button style={{ height: "32px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.setState({ visible: true });console.log("socket",this.props.socket);}}>创建系统账户</Button>
                                <Input type="text" autoComplete="off" placeholder="搜索" style={{ width: "190px", height: "32px", marginLeft: "10px" }} name="keyword" value={this.state.keyword} onChange={(e) => { this.inputChange(e) }} />
                                <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => {this.state.current=1;this.flashData(1, this.state.length); }}>搜索</Button>
                                {this.state.keyword !== "" ? <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.state.keyword = ""; this.state.current=1;this.flashData(1, this.state.length); }}>显示全部</Button> : null}
                            </div>


                            {/* <Table dataSource={this.state} columns={columns} /> */}
                            <Table updatePasswordData={this.updatePasswordData} arr={this.state.adminArr} arrName={this.state.adminNameArr} id={this.state.adminidArr} delData={this.delData} updateData={this.updateData} parentType="1" lockArr={this.state.lockArr} />
                            <Page page={this.state.current} totalNum={this.state.totalNum} pageNum={this.state.pageNum} flashData={this.flashData} changeNum={this.changeNum} />
                        </div>

                    </div>
                </div>
                <Modal maskClosable={false}  title={this.state.saveState === 0 ?"创建系统账户":"密码重置"} visible={this.state.visible} onOk={() => { this.state.saveState === 0 ? this.saveAdmin() : this.updateData(this.state.key, this.state.index, "password") }} onCancel={() => { this.setState({ visible: false, username: "", password: "", saveState: 0 }) }}
                    bodyStyle={{ height: "250px" }} okText="确定" cancelText="取消">
                    <div style={{ marginTop: "10px" }}>
                        <Input disabled={this.state.saveState === 0 ? false : true} prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="请输入账号名称" name="username" value={this.state.username} onChange={(e) => { this.inputChange(e) }} autoComplete="off" />
                    </div>
                    <div style={{ marginTop: "10px" }}>
                        <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="请输入账号密码" name="password" value={this.state.password} onChange={(e) => { this.inputChange(e) }} autoComplete="off" />
                    </div>
                    <div style={{ marginTop: "10px" }}>密码为空时，会自动分配初始密码123456给该账号。</div>
                    <Select value={this.state.roleId}  disabled={this.state.saveState === 0 ? false : true} style={{ marginTop: "40px", width: "100%" }} placeholder="请选择" onChange={(value) => { this.setState({ roleId: value }) }}>
                        {this.state.roleAdminArr.map((item, index) => {
                            return (<Option value={item.roleId} key={index}>{item.roleName}</Option>)
                        })
                        }
                    </Select>
                </Modal>
            </div>
        )
    }
}
export default socketConnect(Admin);