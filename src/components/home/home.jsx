import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from "react-router-dom";
import { message, Button } from 'antd';
import { Icon } from 'antd';
import './home.css';
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chooseIndex: 0,
            roleArr: sessionStorage.getItem("roleArr") ? sessionStorage.getItem("roleArr") : [],
            username: ""
        }
    }
    componentDidMount() {
        this.setState({
            chooseIndex: parseInt(this.props.chooseIndex, 10) ? parseInt(this.props.chooseIndex, 10) : parseInt(sessionStorage.getItem("roleArr")[0], 10)
        })
        if (!sessionStorage.getItem("token")) {
            message.error("请先登录");
            this.props.history.push("/");
            return;
        }
    }
    logOut() {
        sessionStorage.clear();
        this.props.history.push('/');
    }
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }
    render() {
        return (<div className="left-container">
            <div className="user-container">
                <div className="user-div">
                    <img src="./images/logo.jpg" alt="logo" className="user-avatar" />
                    <span className="user-nickName">{sessionStorage.getItem("roleName")}</span>
                    <span className="user-type">{sessionStorage.getItem("username")}</span>
                    <span className="user-text">欢迎您回来</span>
                </div>
            </div>
            <ul className="user-nav">

                {this.state.roleArr.indexOf("0") !== -1 ?
                    <li onClick={() => { this.setState({ chooseIndex: 0 }) }} className={this.state.chooseIndex === 0 ? "activeClass" : ""}>
                        <Icon type="appstore" style={{ color: "#fff", marginRight: "5px" }} />
                        <Link to="/admin" style={{ height: "100%", width: "100%", lineHeight: "40px" }}>系统账号</Link>
                        <div className={this.state.chooseIndex === 0 ? "whiteDiv" : ""}></div>
                    </li>
                    : null
                }
                {this.state.roleArr.indexOf("2") !== -1 ?
                    <li onClick={() => { this.setState({ chooseIndex: 2 }) }} className={this.state.chooseIndex === 2 ? "activeClass" : ""}>
                        <Icon type="setting" style={{ color: "#fff", marginRight: "5px" }} />
                        <Link to="/role" style={{ height: "100%", width: "100%", lineHeight: "40px" }}>系统角色</Link>
                        <div className={this.state.chooseIndex === 2 ? "whiteDiv" : ""}></div>
                    </li>
                    : null
                }
                {this.state.roleArr.indexOf("1") !== -1 ?
                    <li onClick={() => { this.setState({ chooseIndex: 1 }) }} className={this.state.chooseIndex === 1 ? "activeClass" : ""}>
                        <Icon type="idcard" style={{ color: "#fff", marginRight: "5px" }} />
                        <Link to="/user" style={{ height: "100%", width: "100%", lineHeight: "40px" }}>用户账号</Link>
                        <div className={this.state.chooseIndex === 1 ? "whiteDiv" : ""}></div>
                    </li>
                    : null
                }

                {this.state.roleArr.indexOf("3") !== -1 ?
                    <li onClick={() => { this.setState({ chooseIndex: 3 }) }} className={this.state.chooseIndex === 3 ? "activeClass" : ""}>
                        <Icon type="table" style={{ color: "#fff", marginRight: "5px" }} />
                        <Link to="/data" style={{ height: "100%", width: "100%", lineHeight: "40px" }}>家谱资源</Link>
                        <div className={this.state.chooseIndex === 3 ? "whiteDiv" : ""}></div>
                    </li>
                    : null
                }
                {this.state.roleArr.indexOf("4") !== -1 ?
                    <li onClick={() => { this.setState({ chooseIndex: 4 }) }} className={this.state.chooseIndex === 4 ? "activeClass" : ""}>
                        <Icon type="safety" style={{ color: "#fff", marginRight: "5px" }} />
                        <Link to="/datacheck" style={{ height: "100%", width: "100%", lineHeight: "40px" }}>文章审核</Link>
                        <div className={this.state.chooseIndex === 4 ? "whiteDiv" : ""}></div>
                    </li>
                    : null
                }
                {this.state.roleArr.indexOf("5") !== -1 ?
                    <li onClick={() => { this.setState({ chooseIndex: 5 }) }} className={this.state.chooseIndex === 5 ? "activeClass" : ""}>
                        <Icon type="camera" style={{ color: "#fff", marginRight: "5px" }} />
                        <Link to="/news" style={{ height: "100%", width: "100%", lineHeight: "40px" }}>新闻展览</Link>
                        <div className={this.state.chooseIndex === 5 ? "whiteDiv" : ""}></div>
                    </li>
                    : null
                }
                {this.state.roleArr.indexOf("6") !== -1 ?
                    <li onClick={() => { this.setState({ chooseIndex: 6 }) }} className={this.state.chooseIndex === 6 ? "activeClass" : ""}>
                        <Icon type="team" style={{ color: "#fff", marginRight: "5px" }} />
                        <Link to="/advice" style={{ height: "100%", width: "100%", lineHeight: "40px" }}>专家咨询</Link>
                        <div className={this.state.chooseIndex === 6 ? "whiteDiv" : ""}></div>
                    </li>
                    : null
                }
                {this.state.roleArr.indexOf("7") !== -1 ?
                    <li onClick={() => { this.setState({ chooseIndex: 7 }) }} className={this.state.chooseIndex === 7 ? "activeClass" : ""}>
                        <Icon type="message" style={{ color: "#fff", marginRight: "5px" }} />
                        <Link to="/reply" style={{ height: "100%", width: "100%", lineHeight: "40px" }}>专家回复</Link>
                        <div className={this.state.chooseIndex === 7 ? "whiteDiv" : ""}></div>
                    </li>
                    : null
                }
                {this.state.roleArr.indexOf("8") !== -1 ?
                    <li onClick={() => { this.setState({ chooseIndex: 8 }) }} className={this.state.chooseIndex === 8 ? "activeClass" : ""}>
                        <Icon type="close-square" style={{ color: "#fff", marginRight: "5px" }} />
                        <Link to="/validword" style={{ height: "100%", width: "100%", lineHeight: "40px" }}>网络安全</Link>
                        <div className={this.state.chooseIndex === 8 ? "whiteDiv" : ""}></div>
                    </li>
                    : null
                }
                {this.state.roleArr.indexOf("9") !== -1 ?
                    <li onClick={() => { this.setState({ chooseIndex: 9 }) }} className={this.state.chooseIndex === 9 ? "activeClass" : ""}>
                        <Icon type="area-chart" style={{ color: "#fff", marginRight: "5px" }} />
                        <Link to="/report" style={{ height: "100%", width: "100%", lineHeight: "40px" }}>数据统计</Link>
                        <div className={this.state.chooseIndex === 9 ? "whiteDiv" : ""}></div>
                    </li>
                    : null
                }
                {this.state.roleArr.indexOf("10") !== -1 ?
                    <li onClick={() => { this.setState({ chooseIndex: 10 }) }} className={this.state.chooseIndex === 10 ? "activeClass" : ""}>
                        <Icon type="pay-circle-o" style={{ color: "#fff", marginRight: "5px" }} />
                        <Link to="/given" style={{ height: "100%", width: "100%", lineHeight: "40px" }}>家谱捐赠</Link>
                        <div className={this.state.chooseIndex === 10 ? "whiteDiv" : ""}></div>
                    </li>
                    : null
                }
                {/* {this.state.roleArr.indexOf("11") !== -1 ?
                    <li onClick={() => { this.setState({ chooseIndex: 11 }) }} className={this.state.chooseIndex === 11 ? "activeClass" : ""}>
                        <Icon type="video-camera" style={{ color: "#fff", marginRight: "5px" }} />
                        <Link to="/audios" style={{ height: "100%", width: "100%", lineHeight: "40px" }}>影像文件</Link>
                        <div className={this.state.chooseIndex === 11 ? "whiteDiv" : ""}></div>
                    </li>
                    : null
                } */}
            </ul>
            <div className="user-logout">
                <Button style={{ border: "0px", borderRadius: "0px", width: "100%", height: "47px", backgroundColor: "#1DB198", color: "#fff" }} onClick={() => { this.logOut() }}><Icon type="logout" /> 退出</Button>
            </div>
        </div>)
    }
}
export default withRouter(Home)