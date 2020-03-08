import React, { Component } from 'react';
import { Icon, Input, Button, Checkbox, Modal, Row, Col, Select, message } from 'antd';
import { postJSON, getAJAX } from '../ADS.js';
import { URI } from '../../data/data.js';
import Page from '../common/page/page';
import Table from '../common/table/table';
import Home from '../home/home';
import './role.css';
const Option = Select.Option;
class Role extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roleNameArr: ["角色名称", "操作"],
            roleArr: [],
            visible: false,
            roleArray: [],
            roleName: "",
            keyword: "",
            roleidArr: [],
            totalNum: 0,
            pageNum: 0,
            length: 10,
            saveState: 0,
            roleId: 0,
            adminRoleArr: [],
            current:1
        }
        this.delData = this.delData.bind(this);
        this.updateData = this.updateData.bind(this);
        this.flashData = this.flashData.bind(this);
        this.changeNum=this.changeNum.bind(this);
    }
    componentDidMount() {
        let url = URI + "/admin/list";
        let adminData = {
            "token": sessionStorage.getItem("token"),
            "page": 0,
            "limit": 1000,
            "sort": "roleId",
            "key": ""
        }
        getAJAX(url, adminData, (res) => {
            if (res.msg === "OK") {
                //this.state.adminArr=[];
                let arr1 = [];
                res.result.adminList.map((item, index) => {
                    arr1.push(item.roleId);
                })
                this.setState({
                    adminRoleArr: arr1
                })
                this.flashData(1, this.state.length);
            }
        });

    }
    flashData(page, limit) {
        let url = URI + "/role/list";
        let roleData = {
            "token": sessionStorage.getItem("token"),
            "page": page,
            "limit": limit,
            "sort": "_key",
            "key": this.state.keyword
        }
        getAJAX(url, roleData, this.getData.bind(this));


    }

    //创建账号
    saveRole() {
        if (this.state.roleName == "") {
            message.error("请输入权限名称");
            return;
        }
        if (this.state.roleArray.length == 0) {
            message.error("请至少选择一种权限");
            return;
        }

        if (this.state.saveState === 0) {
            let url = URI + "/role/add";
            postJSON(url, { roleName: this.state.roleName, roleArray: this.state.roleArray }, (response) => {
                if (response.data.msg === "OK") {
                    message.success("新建成功!");
                    this.setState({
                        visible: false,
                        roleName: "",
                        roleArray: [],
                        current:1
                    })
                    this.flashData(1, this.state.length);
                } else {
                    message.error("新建失败!")
                }
            })
        } else if (this.state.saveState === 1) {
            let url = URI + "/role/update";
            let data = {
                token: sessionStorage.getItem("token"),
                roleId: this.state.roleId,
                roleName: this.state.roleName,
                roleArray: this.state.roleArray
            }
            postJSON(url, data, (response) => {
                if (response.data.msg === "OK") {
                    message.success("更新成功!");
                    this.setState({
                        visible: false,
                        saveState: 0
                    })
                    this.flashData(this.state.current, this.state.length);
                } else {
                    message.error("更新失败!")
                }
            })
        }
    }

    getData(res) {
        if (res.msg === "OK") {
            //this.state.adminArr=[];
            let arr1 = [];
            let arr2 = [];
            res.result.roleList.map((item, index) => {
                arr1.push({
                    roleName: { value: item.roleName, visible: true },
                    state: { visible: true }
                })
                arr2.push(item._key)
            })
            this.setState({
                roleArr: arr1,
                roleidArr: arr2,
                pageNum: res.result.pageNum,
                totalNum: res.result.totalNum,
                length: this.state.length,
                current: this.state.current
            });
        }
    }

    delData(key, index) {
        if (this.state.adminRoleArr.indexOf(parseInt(key)) !== -1) {
            message.error("该权限已关联用户,无法删除");
            return;
        }
        let url = URI + "/role/delete";
        postJSON(url, { token: sessionStorage.getItem("token"), roleId: key }, (response) => {
            if (response.data.msg === "OK") {
                message.success("删除成功!");
                this.flashData(this.state.current, this.state.length);
            } else {
                message.error("删除失败!")
            }
        })
    }

    updateData(key, index, type) {
        this.setState({
            visible: true
        })
        let url = URI + "/role/detail";
        let roleData = {
            "token": sessionStorage.getItem("token"),
            "roleId": key
        }
        getAJAX(url, roleData, (res) => {
            this.setState({
                roleName: res.data[0].roleName,
                roleArray: res.data[0].roleArray,
                roleId: key,
                saveState: 1
            })
        });
    }

    //分页修改page条数
    changeNum(length, page) {
        this.setState({
            length: length,
            current: page
        })
    }

    inputChange(e) {
        const { name, value } = e.target;
        this.setState((prevState) => {
            prevState[name] = value;
            return prevState
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
                <Home chooseIndex="2" />
                <div className="right-container">
                    <div className="admin-container">
                        <div className="admin-title">系统角色管理</div>
                        <div className="admin-div">
                            <div style={{ display: "flex", lineHeight: "32px", textalign: "center" }}>
                                <Button style={{ height: "32px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.setState({ visible: true, roleName: "", roleArray: [] }) }}>创建角色</Button>
                                {/* <Select mode="multiple" defaultValue={["role", "state"]} style={{ marginLeft: "20px", minWidth: "200px" }} placeholder="请选择" >
                                    <Option value="role" disabled>角色名称</Option>
                                    <Option value="state" disabled>操作</Option>
                                </Select> */}
                                <Input type="text" placeholder="搜索" style={{ width: "190px", height: "32px", marginLeft: "10px" }} name="keyword" value={this.state.keyword} onChange={(e) => { this.inputChange(e) }} autoComplete="off" />
                                <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.state.current=1;this.flashData(1, this.state.length); }}>搜索</Button>
                                {this.state.keyword !== "" ? <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.state.current=1;this.state.keyword = ""; this.flashData(1, this.state.length); }}>显示全部</Button> : null}

                            </div>


                            {/* <Table dataSource={this.state} columns={columns} /> */}
                            <Table arr={this.state.roleArr} arrName={this.state.roleNameArr} id={this.state.roleidArr} delData={this.delData} updateData={this.updateData} parentType="2" />
                            <Page page={this.state.current}  totalNum={this.state.totalNum} pageNum={this.state.pageNum} flashData={this.flashData} changeNum={this.changeNum} />
                        </div>

                    </div>
                </div>
                <Modal maskClosable={false}  title={this.state.saveState === 0 ?"创建角色":"编辑角色权限"} visible={this.state.visible} onOk={() => { this.saveRole() }} onCancel={() => { this.setState({ visible: false, saveState: 0 }) }}
                    bodyStyle={{ height: "250px" }} okText="确定" cancelText="取消">
                    <div style={{ marginTop: "10px" }}>
                        <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="请输入角色名称" name="roleName" value={this.state.roleName} onChange={(e) => { this.inputChange(e) }} autoComplete="off" />
                    </div>
                    <Checkbox.Group style={{ width: '100%', marginTop: "30px" }} value={this.state.roleArray} onChange={(value) => { this.setState({ roleArray: value }) }}>
                        <Row>
                            <Col span={8}><Checkbox value="0">系统账号</Checkbox></Col>
                            <Col span={8}><Checkbox value="2">系统角色</Checkbox></Col>
                            <Col span={8}><Checkbox value="1">用户账号</Checkbox></Col>                           
                            <Col span={8}><Checkbox value="3">家谱资源</Checkbox></Col>
                            <Col span={8}><Checkbox value="4">文章审核</Checkbox></Col>
                            <Col span={8}><Checkbox value="5">新闻展览</Checkbox></Col>
                            <Col span={8}><Checkbox value="6">专家咨询</Checkbox></Col>
                            <Col span={8}><Checkbox value="7">专家回复</Checkbox></Col>
                            <Col span={8}><Checkbox value="8">敏感词库</Checkbox></Col>
                            <Col span={8}><Checkbox value="9">数据统计</Checkbox></Col>
                            <Col span={8}><Checkbox value="10">家谱捐赠</Checkbox></Col>
                        </Row>
                    </Checkbox.Group>,
                </Modal>
                {/* <div className="admin-create">
                    <div className="admin-create-container"></div>
                </div>                 */}
            </div>
        )
    }
}
export default Role