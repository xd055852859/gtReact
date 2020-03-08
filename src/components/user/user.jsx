import React, { Component } from 'react';
import { Input, Button, Select, message, Modal, Table, Tabs } from 'antd';
import { postJSON, patchJSON, getAJAX } from '../ADS.js';
import { URI } from '../../data/data.js';
import Page from '../common/page/page';
import Tables from '../common/table/table';
import Home from '../home/home';
import './user.css';
const Option = Select.Option;
const TabPane = Tabs.TabPane;
class User extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userNameOriArr: ["ID", "用户名", "姓氏", "名字", "邮箱", "性别", "生日", "昵称", "手机号码", "查阅家谱", "创建时间", "最新登录时间", "状态", "操作"],
            userNameArr: [],
            avatar: "",
            userArr: [],
            useridArr: [],
            createState: false,
            keyword: "",
            userNum: 0,
            pageNum: 0,
            //value: ["username0", "surname1", "realname2", "email3", "sex4", "birthday5", "nickname6", "phone7", "createTime8", "updateTime9", "status10", "state11"],
            length: 10,
            visible: false,
            delVisible: false,
            userId: 0,
            index: 0,
            userStatusArr: [],
            current: 1,
            logVisible: false,
            logNameArr: [
                { title: '序号', dataIndex: 'key', key: 'key' },
                { title: '谱名', dataIndex: 'genealogyName', key: 'genealogyName' },
                { title: '文件大小', dataIndex: 'imageSize', key: 'imageSize' },
                { title: '查看时间', dataIndex: 'createTime', key: 'createTime' },
                { title: '查看卷数', dataIndex: 'volume', key: 'volume' },
                { title: '查看页码', dataIndex: 'page', key: 'page' },
            ],
            logArr: [],
            totals: 0,
            pages: 0,
            key: 0,
            index: 0,
            tableKey: "0",
            tabLength: [10, 10]
        }
        this.updateData = this.updateData.bind(this);
        this.flashData = this.flashData.bind(this);
        this.changeNum = this.changeNum.bind(this);
        this.showAvatar = this.showAvatar.bind(this);
        this.userLogList = this.userLogList.bind(this);
    }
    componentDidMount() {
        this.flashData(1, this.state.length, this.state.tableKey);
    }
    flashData(page, limit, key) {
        if (key === "0") {
            let url = URI + "/account/userList";
            let userData = {
                //"token": sessionStorage.getItem("token"),
                "curPage": page,
                "perPage": limit,
                "keyWord": this.state.keyword
            }
            getAJAX(url, userData, this.getData.bind(this));
        } else {
            let url = URI + "/account/anonymousUserList";
            let userData = {
                //"token": sessionStorage.getItem("token"),
                "curPage": page,
                "perPage": limit,
            }
            getAJAX(url, userData, this.getData.bind(this));
        }
    }

    getData(res) {
        if (res.msg === "OK") {

            let arr1 = [];
            let arr2 = [];
            let arr3 = [];
            let arr4 = [];
            if (this.state.tableKey === "0") {
                arr4 = ["ID", "用户名", "姓氏", "名字", "邮箱", "性别", "生日", "昵称", "手机号码", "查阅家谱", "创建时间", "最新登录时间", "状态", "操作"];
                res.result.userList.map((item, index) => {
                    arr1.push({
                        userId: { value: item._key, visible: true },
                        username: { value: item.username, visible: true },
                        avatar: { value: item.avatar ? URI + '/upload?fileName=' + item.avatar : "", visible: true },
                        surname: { value: item.surname, visible: true },
                        realname: { value: item.realname, visible: true },
                        email: { value: item.email, visible: true },
                        sex: { value: parseInt(item.sex) === 0 ? "男" : parseInt(item.sex) === 1 ? "女" : "", visible: true },
                        birthday: { value: item.birthday, visible: true },
                        nickname: { value: item.nickname, visible: true },
                        phone: { value: item.phone, visible: true },
                        readNum: { value: item.readNum, visible: true },
                        createTime: { value: new Date(item.createTime).toLocaleString(), visible: true },
                        updateTime: { value: new Date(item.updateTime).toLocaleString(), visible: true },
                        status: { value: item.status === 0 ? "冻结" : "正常", visible: true },
                        state: { visible: true },
                    })
                    arr2.push(item._key);
                    arr3.push(item.status);
                })
            } else {
                arr4 = ["IP地址", "密匙", "阅读数量"];
                res.result.userList.map((item, index) => {
                    arr1.push({
                        ip: { value: item.ip, visible: true },
                        token: { value: item.token, visible: true },
                        readNum: { value: item.readNum ? item.readNum : 0, visible: true },
                        // status: { value: item.status === 0 ? "冻结" : "正常", visible: true },
                        // state: { visible: true },
                    })
                    arr2.push(item._key);
                    arr3.push(item.status);
                })
            }
            this.setState({
                userArr: arr1,
                useridArr: arr2,
                pageNum: res.result.pageNum,
                userNum: res.result.userNum,
                userStatusArr: arr3,
                length: this.state.length,
                current: this.state.current,
                userNameArr: arr4
            });
            //this.changeData(this.state.value)
        }
    }


    updateData(key, index, type) {
        let url = URI + "/account/userStatus";
        let data = {
            //token: sessionStorage.getItem("token"),
            userKey: key
        }
        if (type === "status") {
            data.status = this.state.userStatusArr[index] === 0 ? 1 : 0
        }
        postJSON(url, data, (response) => {
            if (response.data.msg === "OK") {
                message.success("更新成功!");
                this.flashData(this.state.current, this.state.length, this.state.tableKey);
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
        this.state.userNameArr = [];
        this.state.userNameOriArr.map((item, index) => {
            if (arr.indexOf(index) !== -1) {
                this.state.userNameArr.push(item);
            }
        })
        this.state.userArr.map((item, index) => {
            for (let i in item) {
                if (arr1.indexOf(i) === -1) {
                    item[i].visible = false
                } else {
                    item[i].visible = true
                }
            }
        })
        this.setState({
            userNameArr: this.state.userNameArr,
            userArr: this.state.userArr
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
    //     let url = URI + "/account/userList";
    //     let userData = {
    //         //"token": sessionStorage.getItem("token"),
    //         "curPage": 1,
    //         "perPage": this.state.length,

    //     }
    //     getAJAX(url, userData, this.getData.bind(this));
    // }
    //分页修改page条数
    changeNum(length, page) {
        this.state.tabLength[parseInt(this.state.tableKey)] = parseInt(length)
        this.setState({
            length: length,
            current: page,
            tabLength: this.state.tabLength,
        })
    }
    //
    showAvatar(userId, avatar, index) {
        this.setState({
            userId: userId,
            avatar: avatar,
            visible: true,
            index: index
        })
    }
    delAvatar() {
        this.setState({
            delVisible: false
        })
        let url = URI + "/account/userStatus";
        let data = {
            //token: sessionStorage.getItem("token"),
            userKey: this.state.userId,
            avatar: ""
        }
        postJSON(url, data, (response) => {
            if (response.data.msg === "OK") {
                message.success("删除成功!");
                let msgAddUrl = URI + "/message/add";
                let msgAddData = {
                    //token: sessionStorage.getItem("token"),
                    userId: this.state.userId,
                    type: 4
                }
                postJSON(msgAddUrl, msgAddData, (response) => {
                    message.success("已通知用户!");
                    this.state.userArr[this.state.index].avatar.value = "";
                    this.setState({
                        userArr: this.state.userArr
                    })
                })
            } else {
                message.error("删除失败!")
            }
        })
    }
    //用户详情列表
    userLogList(key, index, current) {
        this.setState({
            logVisible: true,
            key: key,
            index: index
        })
        let url = URI + "/account/read/detail";
        let data = {
            //token: sessionStorage.getItem("token"),
            curPage: current,
            perPage: 10,
            userId: key
        }
        getAJAX(url, data, (res) => {
            if (res.msg === "OK") {
                let arr = []
                res.data.map((item, index) => {
                    arr.push({
                        key: (current - 1) * 10 + index + 1,
                        genealogyName: item.genealogyName,
                        imageSize: item.imageSize + " kb",
                        createTime: new Date(item.createTime).toLocaleString(),
                        volume: item.volume,
                        page: item.page
                    })
                })
                this.setState({
                    logArr: arr,
                    totals: res.totals,
                    pages: res.pages
                })
            }
        });
    }

    changeTab(key) {
        this.setState({
            tableKey: key,
            pageNum: 0,
            totalNum: 0,
            length: this.state.tabLength[parseInt(this.state.tableKey)]
        })
        this.flashData(1, this.state.tabLength[parseInt(key)], key);
    }
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }
    render() {
        const that = this
        return (
            <div>
                <Home chooseIndex="1" />
                <div className="right-container">
                    <div className="admin-container">
                        <div className="admin-title">用户账户管理</div>
                        <div className="admin-div">
                            <Tabs activeKey={this.state.tableKey} onChange={(key) => { this.changeTab(key) }} style={{ padding: "0px 20px 0px 20px", boxSizing: "border-box" }}>
                                <TabPane tab="注册用户" key="0" style={{ width: "100%", overflow: "auto" }}>
                                    <div style={{ display: "flex", lineHeight: "32px", textalign: "center" }}>
                                        {/* <Select mode="multiple" defaultValue={this.state.value} placeholder="请选择" onChange={(value) => { this.changeTable(value) }}>
                                    <Option value="username0" disabled>用户名</Option>
                                    <Option value="surname1">姓氏</Option>
                                    <Option value="realname2">名字</Option>
                                    <Option value="email3">邮箱</Option>
                                    <Option value="sex4">性别</Option>
                                    <Option value="birthday5">生日</Option>
                                    <Option value="nickname6">昵称</Option>
                                    <Option value="phone7">手机号码</Option>
                                    <Option value="createTime8">创建时间</Option>
                                    <Option value="updateTime9">最新登录时间</Option>
                                    <Option value="status10" disabled>状态</Option>
                                    <Option value="state11" disabled>操作</Option>
                                </Select> */}
                                        <Input type="text" placeholder="搜索" style={{ width: "190px", height: "32px", marginLeft: "10px" }} name="keyword" value={this.state.keyword} onChange={(e) => { this.inputChange(e) }} autoComplete="off" />
                                        <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.state.current = 1; this.flashData(1, this.state.length, this.state.tableKey); }}>搜索</Button>
                                        {this.state.keyword !== "" ? <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.state.current = 1; this.state.keyword = ""; this.flashData(1, this.state.length, this.state.tableKey); }}>显示全部</Button> : null}

                                    </div>

                                    <Tables arr={this.state.userArr} arrName={this.state.userNameArr} id={this.state.useridArr} updateData={this.updateData} showAvatar={this.showAvatar} userLogList={this.userLogList} parentType="3" lockArr={this.state.userStatusArr} />
                                    <Page page={this.state.current} totalNum={this.state.userNum} pageNum={this.state.pageNum} flashData={this.flashData} changeNum={this.changeNum} type={this.state.tableKey} />
                                </TabPane>
                                <TabPane tab="匿名用户" key="1" style={{ width: "100%", overflow: "auto" }}>
                                    <Tables arr={this.state.userArr} arrName={this.state.userNameArr} id={this.state.useridArr} updateData={this.updateData} showAvatar={this.showAvatar} userLogList={this.userLogList} parentType="3" lockArr={this.state.userStatusArr} />
                                    <Page page={this.state.current} totalNum={this.state.userNum} pageNum={this.state.pageNum} flashData={this.flashData} changeNum={this.changeNum} type={this.state.tableKey} />
                                </TabPane>
                            </Tabs>
                            <Modal maskClosable={false} title="用户头像" visible={this.state.visible} onOk={() => { this.setState({ delVisible: true, visible: false }) }} onCancel={() => { this.setState({ visible: false }) }} okText="删除头像" cancelText="取消">
                                <img src={this.state.avatar} style={{ width: "100%", height: "100%" }} />
                            </Modal>
                            <Modal maskClosable={false}
                                title="删除头像"
                                visible={this.state.delVisible}
                                onOk={() => { this.delAvatar() }}
                                onCancel={() => { this.setState({ delVisible: false }) }}
                                okText="确认"
                                cancelText="取消"
                            >
                                <p>是否确认删除该用户头像</p>
                            </Modal>
                            <Modal maskClosable={false}
                                title="查看家谱记录"
                                footer={null}
                                visible={this.state.logVisible}
                                onCancel={() => { this.setState({ logVisible: false }) }}
                                width="700px"
                            >
                                <Table dataSource={that.state.logArr} columns={that.state.logNameArr}
                                    pagination={{  //分页
                                        total: that.state.totals, //数据总数量
                                        defaultPageSize: 10, //默认显示几条一页                                 
                                        onChange(current) {  //点击改变页数的选项时调用函数，current:将要跳转的页数
                                            that.userLogList(that.state.key, that.state.index, current);
                                        },
                                        showTotal: function () {  //设置显示一共几条数据                                     
                                            return '共 ' + that.state.totals + ' 条数据';
                                        }
                                    }}
                                />
                            </Modal>
                        </div>
                    </div>
                </div>
                {/* <div className="admin-create">
                    <div className="admin-create-container"></div>
                </div>                 */}
            </div>
        )
    }
}
export default User