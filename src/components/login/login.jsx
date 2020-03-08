import React, { Component } from 'react';
import { Input, Button, message } from 'antd';
import { postJSON, getAJAX } from '../ADS.js';
import { URI } from '../../data/data.js';
import './login.css';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
        }
    }
    inputChange(e) {
        const { name, value } = e.target;
        this.setState((prevState) => {
            prevState[name] = value;
            return prevState
        })
    }
    loginSubmit = (e) => {
        //account/adminLogin  密码登录
        let url = URI + "/account/adminLogin";
        postJSON(url, { "username": this.state.username, "passwordl": this.state.password }, (res) => {
            if (res.data.msg === "OK") {
                if (res.data.data.status === 1) {
                    message.success("登录成功!");
                    sessionStorage.setItem("token", res.data.data.token);
                    sessionStorage.setItem("userId", res.data.data._key);
                    let adminUrl = URI + "/admin/detail";
                    let adminHomeData = {
                        "userId": sessionStorage.getItem("userId")
                    }
                    getAJAX(adminUrl, adminHomeData, (res) => {
                        if (res.result.length > 0 && res.result[0]) {
                            sessionStorage.setItem("username", res.result[0].username);
                            sessionStorage.setItem("roleName", res.result[0].roleName);
                            let roleUrl = URI + "/role/detail";
                            let roleHomeData = {
                                "token": sessionStorage.getItem("token"),
                                "roleId": res.result[0].roleId
                            }
                            getAJAX(roleUrl, roleHomeData, (res) => {
                                res.data[0].roleArray.sort(function (a, b) {
                                    return a - b
                                })
                                sessionStorage.setItem("roleArr", res.data[0].roleArray);
                                if (res.data[0].roleArray.indexOf("0") !== -1) {
                                    this.props.history.push("./admin");
                                } else if (res.data[0].roleArray.indexOf("1") !== -1) {
                                    this.props.history.push("./user");
                                } else if (res.data[0].roleArray.indexOf("2") !== -1) {
                                    this.props.history.push("./role");
                                } else if (res.data[0].roleArray.indexOf("3") !== -1) {
                                    this.props.history.push("./data");
                                } else if (res.data[0].roleArray.indexOf("4") !== -1) {
                                    this.props.history.push("./datacheck");
                                } else if (res.data[0].roleArray.indexOf("5") !== -1) {
                                    this.props.history.push("./news");
                                } else if (res.data[0].roleArray.indexOf("6") !== -1) {
                                    this.props.history.push("./advice");
                                } else if (res.data[0].roleArray.indexOf("7") !== -1) {
                                    this.props.history.push("./reply");
                                } else if (res.data[0].roleArray.indexOf("8") !== -1) {
                                    this.props.history.push("./validword");
                                } else if (res.data[0].roleArray.indexOf("9") !== -1) {
                                    this.props.history.push("./report");
                                } else if (res.data[0].roleArray.indexOf("10") !== -1) {
                                    this.props.history.push("./given");
                                }
                            });
                        }
                    });
                } else {
                    message.error("该账号已被冻结,请咨询管理员解冻!")
                }
            } else {
                message.error(res.data.msg)
            }
        });
    }
    render() {
        return (<div className="login-container">
            <div className="login-bg"><img src="/images/background.png" style={{ height: "100%", width: "100%" }} alt=""></img></div>

            <div className="login-form">
                <div className="login-title"><img src="/images/title.png" alt=""></img></div>
                <div className="login-input">
                    <Input type="text" placeholder="请输入账号" name="username" onChange={(e) => { this.inputChange(e) }} style={{ width: "100%" }} autoComplete="off" />
                </div>
                <div className="login-input">
                    <Input type="password" placeholder="请输入密码" name="password" onChange={(e) => { this.inputChange(e) }} style={{ width: "100%" }} autoComplete="off" />
                </div>
                <div>
                    {/* <Checkbox className="login-checkbox">记住我</Checkbox> */}
                    <Button style={{ background: "#22BAA0", color: "#fff", border: "0" }} className="login-button" onClick={() => { this.loginSubmit() }}>
                        登录
                    </Button>
                </div>
                <div className="login-bottom">© Copyright 中华寻根网 All Rights Reserved</div>
            </div>
        </div>)
    }
}
export default Login