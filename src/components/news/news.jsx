import React, { Component } from 'react';
import { TreeSelect, Tabs, Input, Button, Modal, Radio, message, Spin } from 'antd';
import { postJSON, getAJAX } from '../ADS.js';
import { URI } from '../../data/data.js';
import Page from '../common/page/page';
import Table from '../common/table/table';
import Editor from '../common/editor/editor';
import Home from '../home/home';
import BraftEditor from 'braft-editor'
import 'braft-editor/dist/braft.css'
import './news.css';
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const { TextArea } = Input;
var E = require('wangeditor');
const treeData = [{
    title: '谱牒学',
    value: '谱牒学',
    key: '0',
    children: [{
        title: '谱牒学',
        value: '谱牒学-谱牒学',
        key: '0-1',
    }, {
        title: '谱牒学家',
        value: '谱牒学-谱牒学家',
        key: '0-2'
    }, {
        title: '研究机构',
        value: '谱牒学-研究机构',
        key: '0-3',
    }]
},
{
    title: '姓氏',
    value: '姓氏',
    key: '1',
    children: [
        {
            title: '姓氏',
            value: '姓氏-姓氏',
            key: '1-1',
        }, {
            title: '姓氏渊源',
            value: '姓氏-姓氏渊源',
            key: '1-2'
        }, {
            title: '研究机构',
            value: '姓氏-研究机构',
            key: '1-3',
        },
        {
            title: '姓氏演变',
            value: '姓氏-姓氏演变',
            key: '1-4',
        }, {
            title: '姓氏专书',
            value: '姓氏-姓氏专书',
            key: '1-5'
        }, {
            title: '郡望',
            value: '姓氏-郡望',
            key: '1-6',
        },
    ]
},
{
    title: '谱牒',
    value: '谱牒',
    key: '2',
    children: [
        {
            title: '谱牒',
            value: '谱牒-谱牒',
            key: '2-1',
        }, {
            title: '世系',
            value: '谱牒-世系',
            key: '2-2'
        }, {
            title: '世系图表',
            value: '谱牒-世系图表',
            key: '2-3',
        },
        {
            title: '字辈',
            value: '谱牒-字辈',
            key: '2-4',
        }, {
            title: '堂号',
            value: '谱牒-堂号',
            key: '2-5'
        }, {
            title: '五服图',
            value: '谱牒-五服图',
            key: '2-6',
        },
    ]
},
{
    title: '寻根',
    value: '寻根',
    key: '3',
    children: [{
        title: '寻根',
        value: '寻根-寻根',
        key: '3-1',
    }, {
        title: '寻谱',
        value: '寻根-寻谱',
        key: '3-2'
    }]
},
{
    title: '宗族',
    value: '宗族',
    key: '4',
    children: [
        {
            title: '宗族',
            value: '宗族-宗族',
            key: '4-1',
        }, {
            title: '宗法',
            value: '宗族-宗法',
            key: '4-2'
        }, {
            title: '宗祠',
            value: '宗族-宗祠',
            key: '4-3',
        },
        {
            title: '宗亲会',
            value: '宗族-宗亲会',
            key: '4-4',
        }, {
            title: '祭祖',
            value: '宗族-祭祖',
            key: '4-5'
        }, {
            title: '继嗣',
            value: '宗族-继嗣',
            key: '4-6',
        },
    ]
}, {
    title: '其它',
    value: '其它',
    key: '5',
    children: [{
        title: '其它',
        value: '其它-其它',
        key: '5-1',
    }]
},
];
class News extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newsNameArr: ["标题", "类别", "发布人", "发布时间", "状态", "操作"],
            baikeNameArr: [],
            newsKey: sessionStorage.getItem("newsKey") ? sessionStorage.getItem("newsKey") : "0",
            tabLength: [10, 10],
            length: 10,
            keyword: "",
            secType: "",
            mainType: "",
            secAddType: "",
            mainAddType: "",
            baikeValue: "",
            baikeAddValue: "",
            newsTabArr: ["新闻", "百科"],
            newsArr: [],
            visible: false,
            length: 10,
            radioValue: "0",
            text: "",
            urlText: "",
            newsidArr: [],
            pageNum: 0,
            totalNum: 0,
            newsId: 0,
            saveState: 0,
            newsVisible: false,
            validwordArr: [],
            textArr: [],
            number: 0,
            url: [],
            current: 1,
            base64StringArr: [],
            expendNameArr: [],
            lockArr: [],
            flag: false,
            updateValue: "",
            loading: false,
            uploadValue: "",
            fileState: false
        }
        // You can also pass a Quill Delta here
        this.delData = this.delData.bind(this);
        this.updateData = this.updateData.bind(this);
        this.flashData = this.flashData.bind(this);
        this.changeNum = this.changeNum.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
        this.saveNews = this.saveNews.bind(this);
        this.hideModal = this.hideModal.bind(this);
    }

    componentDidMount() {
        this.flashData(1, this.state.length, this.state.newsKey);
    }
    flashData(page, limit, type) {
        sessionStorage.setItem("newsKey", type);
        let url = "";
        let newsData = {};
        console.log(type);
        if (type === "0") {
            url = URI + "/news/list";
            newsData = {
                "search": this.state.keyword,
                "page": page,
                "limit": limit,
            }
        } else {
            url = URI + "/baike/list";
            newsData = {
                //"token": sessionStorage.getItem("token"),
                "adminId": sessionStorage.getItem("userId"),
                "page": page,
                "limit": limit,
                "search": this.state.keyword,
                "secType": this.state.secType,
                "mainType": this.state.mainType,
            }
        }
        getAJAX(url, newsData, this.getData.bind(this));
    }
    getData(res) {
        if (res.msg === "OK") {
            let arr1 = [];
            let arr2 = [];
            let arr3 = [];
            res.data.map((item, index) => {
                arr1.push({
                    title: { value: item.title, visible: true },
                })
                if (this.state.newsKey === "0") {
                    this.state.newsNameArr = ["标题", "类别", "发布人", "发布时间", "状态", "操作"];
                    arr1[index].tag = { value: item.newType === 0 ? "新闻" : "展览", visible: true };
                } else {
                    this.state.newsNameArr = ["标题", "一级分类", "二级分类", "发布人", "发布时间", "状态", "操作"];
                    arr1[index].mainType = { value: item.mainType, visible: true };
                    arr1[index].secType = { value: item.secType, visible: true };
                }
                arr1[index].username = { value: "admin", visible: true };
                arr1[index].createTime = { value: new Date(item.createTime).toLocaleString(), visible: true };
                arr1[index].status = { value: item.isPublish === 0 ? "待发布" : item.isPublish === 1 ? "已发布" : "已冻结", visible: true };
                arr1[index].state = { visible: true };
                arr2.push(item._key);
                arr3.push(item.isPublish !== 1 ? false : true);
            })
            this.setState({
                newsArr: arr1,
                newsidArr: arr2,
                pageNum: res.pages,
                totalNum: res.totals,
                number: this.state.number++,
                length: this.state.length,
                current: this.state.current,
                lockArr: arr3,
                newsNameArr: this.state.newsNameArr
            });
        }
    }
    changeTab(key) {
        this.setState({
            newsKey: key,
            keyword: "",
            secType: "",
            mainType: "",
            pageNum: 0,
            totalNum: 0,
            baikeValue: "",
            length: this.state.tabLength[parseInt(key)],
        });
        this.flashData(1, this.state.tabLength[parseInt(key)], key);
    }
    baikeTypeChange(value) {
        this.setState({
            baikeValue: value
        });
    }
    baikeAddChange(value) {
        console.log(value);
        let baikeAddArr = value.split("-")
        if (value.length > 1) {
            this.state.secAddType = baikeAddArr[1];
        } else {
            this.state.secAddType = "";
        }
        this.state.mainAddType = baikeAddArr[0];
        this.setState({
            mainAddType: this.state.mainAddType,
            secAddType: this.state.secAddType,
            baikeAddValue: value
        });
    }
    searchNews() {
        let baikeValueArr = this.state.baikeValue.split("-");
        if (baikeValueArr.length > 1) {
            this.state.secType = baikeValueArr[1];
        } else {
            this.state.secType = "";
        }
        this.state.mainType = baikeValueArr[0];
        this.state.current = 1;
        this.setState({
            mainType: this.state.mainType,
            secType: this.state.secType,
        })
        this.flashData(this.state.current, this.state.length, this.state.newsKey);
    }
    delData(key, index) {
        let url = "";
        if (this.state.newsKey === "0") {
            url = URI + "/news/delete";
        } else {
            url = URI + "/baike/delete";
        }
        postJSON(url, { adminId: sessionStorage.getItem("userId"), id: key }, (response) => {
            if (response.data.msg === "OK") {
                message.success("删除成功!");
                this.setState((prevState) => {
                    prevState.newsArr.splice(index, 1);
                    prevState.newsidArr.splice(index, 1);
                    return {
                        newsArr: prevState.newsArr,
                        newsidArr: prevState.newsidArr
                    }
                })
            } else {
                message.error("删除失败!")
            }
        })
    }
    updateData(key, index, type) {
        this.setState({
            visible: true,
            number: this.state.number++
        })
        let url = "";
        if (this.state.newsKey === "0") {
            url = URI + "/news/details";
        } else {
            url = URI + "/baike/details";
        }
        let newsData = {
            // "token": sessionStorage.getItem("token"),
            "id": key
        }
        getAJAX(url, newsData, (res) => {
            let that = this;
            console.log("传递内容", res.data.content);
            this.setState({
                title: res.data.title,
                text: res.data.content,
                radioValue: res.data.newType + "",
                newsId: key,
                saveState: 1,
                uploadValue: "",
                baikeAddValue: res.data.secType !== "" ? res.data.mainType + "-" + res.data.secType : res.data.mainType,
                secAddType: res.data.secType,
                mainAddType: res.data.mainType,
                fileState: false
            })
        });
    }
    //修改状态 
    updateStatus(key, index) {
        this.setState({
            newsVisible: true,
            newsId: key
        })
    }
    changeStatus(type) {
        let url = "";
        if (this.state.newsKey === "0") {
            url = URI + "/news/set";
        } else {
            url = URI + "/baike/set";
        }
        postJSON(url, { id: this.state.newsId, isPublish: type }, (response) => {
            if (response.data.msg === "OK") {
                message.success("修改状态成功!");
                this.setState({
                    newsVisible: false
                })
                this.flashData(this.state.current, this.state.length,this.state.newsKey);
            } else {
                message.error("修改状态失败!")
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

    saveNews(text) {
        if (text) {
            this.state.text = text;
        }
        // // /news/add
        this.setState({
            text: text
        })
        if (this.state.title === "") {
            message.error("请输入标题");
            return;
        }
        if (this.state.text === "") {
            message.error("请输入内容");
            return;
        }
        if (this.state.newsKey !== "0") {
            if (this.state.baikeAddValue === "") {
                message.error("请选择类型");
                return;
            }
        }
        let type = parseInt(this.state.radioValue) == "2" ? 2 : 1
        // if (this.state.validwordArr.some((item, index) => {
        //     if (this.state.title.indexOf(item) != -1) {

        //         message.error("标题中第" + (this.state.title.indexOf(item) + 1) + "个字到第" + (this.state.title.indexOf(item) + item.length) + "个字为敏感词--" + item + ",请修改")
        //         return true;
        //     }
        //     let str = this.state.text.replace(/<\/?.+?\/?>/g, "").replace(/\s+/g, "");
        //     if (str.indexOf(item) != -1) {
        //         message.error("内容中第" + (str.indexOf(item) + 1) + "个字到第" + (str.indexOf(item) + item.length) + "个字为敏感词--" + item + ",请修改")
        //         return true;
        //     }
        // })) {
        //     return;
        // }
        //arr1保存其他内容,arr2保存图片类型,arr3保存base64内容
        let [arr1, arr2, arr3, arr4] = [[], [], [], []];
        arr1 = this.state.text.match(/(data:image\/){1}(jpeg|gif){1}(;){1}.*?\"/g);
        if (arr1) {
            arr1 = arr1.map((item, index) => {
                arr2.push("." + item.replace("data:image/", "").split(";")[0]);
                return item.replace("\"", "");
            })
            let url = URI + "/upload/base64";
            let data = {
                base64String: arr1,
                expendName: arr2
            }
            postJSON(url, data, (response) => {
                if (response.data.msg === "OK") {
                    let filePath = response.data.filePath;
                    for (let i = 0; i < filePath.length; i++) {
                        this.state.text = this.state.text.replace(/(data:image\/){1}(jpeg|gif){1}(;){1}.*?\"/, "http://192.168.1.101:8082/gtService/upload?fileName=" + filePath[i] + "\"");
                    }

                } else {
                    message.error("上传图片失败!")
                }
            })
        }
        if (this.state.saveState === 0) {
            let url = "";
            let addParams = {
                adminId: sessionStorage.getItem("userId"),
                title: this.state.title,
                content: this.state.urlText + this.state.text,
            }
            if (this.state.newsKey === "0") {
                url = URI + "/news/add";
                addParams.type = type;
                addParams.newType = parseInt(this.state.radioValue);
            } else {
                url = URI + "/baike/add";
                addParams.secType = this.state.secAddType;
                addParams.mainType = this.state.mainAddType;
            }
            postJSON(url, addParams, (response) => {
                if (response.data.msg === "OK") {
                    message.success("新增成功!");
                    this.setState({
                        visible: false,
                        title: "",
                        // text: "",
                        newsId: 2,
                        current: 1,
                        uploadValue: "",
                        secAddType: "",
                        mainAddType: "",
                        fileState: false
                    })
                    this.flashData(1, this.state.length, this.state.newsKey);
                } else {
                    message.error("新增失败!")
                }
            })
        } else {
            let url = "";
            let addParams = {
                adminId: sessionStorage.getItem("userId"),
                id: this.state.newsId,
                title: this.state.title,
                content: this.state.urlText + this.state.text,
            }
            if (this.state.newsKey === "0") {
                url = URI + "/news/update";
                addParams.type = type;
                addParams.newType = parseInt(this.state.radioValue);
            } else {
                url = URI + "/baike/update";
                addParams.secType = this.state.secAddType;
                addParams.mainType = this.state.mainAddType;
            }
            postJSON(url, addParams, (response) => {
                if (response.data.msg === "OK") {
                    message.success("更新成功!");
                    this.setState({
                        visible: false,
                        saveState: 0,
                        title: "",
                        // text: "",
                        newsId: 0,
                        uploadValue: "",
                        secAddType: "",
                        mainAddType: "",
                        uploadValue: "",
                        fileState: false
                    })
                    this.flashData(this.state.current, this.state.length, this.state.newsKey);
                } else {
                    message.error("更新失败!")
                }
            })
        }
    }

    //分页修改page条数
    changeNum(length, page) {
        this.setState({
            length: length,
            current: page
        })
    }
    editorInputChange(content) {
        this.setState({
            text: content
        })
    }


    hideModal() {
        this.setState({
            visible: false,
            text: "",
            title: ""
        })
    }
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }
    uploadfile(e) {
        this.setState({
            loading: true
        })
        let that = this;
        var form = new FormData(document.getElementById("test"));
        //form.append("avatar", file);
        var req = new XMLHttpRequest();
        req.open("post", "http://192.168.1.101:8082/upload/html");
        //req.setRequestHeader("Content-type", "multipart/form-data");
        req.send(form);
        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status == 200) {
                if (JSON.parse(req.responseText).msg === "OK") {
                    let arr = JSON.parse(req.responseText).url;
                    let str1 = "";
                    arr.map((item, index) => {
                        str1 += "<a href='http://192.168.1.101:8082/" + item + "'>http://192.168.1.101:8082/" + item + "</a><br/>"
                    })
                    message.success("上传网站成功");
                    that.setState({
                        urlText: str1,
                        loading: false
                    })
                } else {
                    message.error(JSON.parse(req.responseText).msg);
                    that.setState({
                        loading: false
                    })
                }
            }
        }
    }
    changeUpload(e) {
        let obj = e.target
        if (obj.files.length === 0) {
            return;
        }
        let file = obj.files[0];
        //文件类型
        let arr = file.name.split(".");
        let fileType = arr[arr.length - 1];
        if (fileType === "zip") {
            this.setState({
                uploadValue: e.target.value,
                fileState: true
            })
        } else {
            message.error("请上传包含html文件的正确的zip包")
        }
    }
    render() {
        return (
            <div>
                <Home chooseIndex="5" />
                <div className="right-container">
                    <div className="admin-container">
                        <div className="admin-title">新闻展览管理</div>
                        <div className="admin-div">
                            <Tabs activeKey={this.state.newsKey} onChange={(key) => { this.changeTab(key) }}>
                                {this.state.newsTabArr.map((item, index) => {
                                    return (
                                        <TabPane tab={item} key={index + ""} style={{ width: "100%", overflow: "auto" }}>
                                            <div style={{ display: "flex", lineHeight: "32px", textalign: "center" }}>
                                                <Button style={{ width: "90px", height: "32px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.setState({ visible: true, title: "", text: "", radioValue: "0", newsId: 1, baikeAddValue: "" }); }}>新建{this.state.newsKey === "0" ? "新闻" : "百科"}</Button>
                                                <Input type="text" autoComplete="off" placeholder="请输入要搜索的标题" style={{ width: "200px", height: "32px", marginLeft: "10px" }} name="keyword" value={this.state.keyword} onChange={(e) => { this.inputChange(e) }} />
                                                {this.state.newsKey === "1"
                                                    ? <TreeSelect
                                                        style={{ width: "300px", height: "32px", marginLeft: "10px" }}
                                                        value={this.state.baikeValue}
                                                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                                        treeData={treeData}
                                                        placeholder="请选择类别"
                                                        treeDefaultExpandAll
                                                        onChange={(value) => { this.baikeTypeChange(value) }}
                                                    ></TreeSelect>
                                                    : null
                                                }
                                                <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.searchNews() }}>搜索</Button>
                                                <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.state.current = 1; this.state.keyword = ""; this.state.baikeValue = ""; this.state.mainType = ""; this.state.secType = "", this.flashData(1, this.state.length, this.state.newsKey) }}>显示全部</Button>
                                            </div>
                                            <Table arr={this.state.newsArr} arrName={this.state.newsNameArr} id={this.state.newsidArr} delData={this.delData} updateData={this.updateData} updateStatus={this.updateStatus} parentType="5" lockArr={this.state.lockArr} />
                                            <Page page={this.state.current} totalNum={this.state.totalNum} pageNum={this.state.pageNum} flashData={this.flashData} changeNum={this.changeNum} />
                                        </TabPane>
                                    )
                                })}
                            </Tabs>
                        </div>

                    </div>
                </div>
                {/* bodyStyle={{ height: "250px" }} */}
                <Modal maskClosable={false} title={(this.state.newsKey === "0" ? "新闻" : "百科") + "界面"} footer={null} visible={this.state.visible} onOk={() => { this.saveNews() }} onCancel={() => { this.setState({ visible: false, saveState: 0, newsId: 0, uploadValue: "", fileState: false, text: "" }) }}
                    width="850px" bodyStyle={{ height: "770px" }} okText="提交" cancelText="取消">
                    {this.state.loading ? <div style={{ display: "flex", justifyContent: "center", position: "absolute", top: "20px", width: "100%", zIndex: "2" }}>
                        <Spin spinning={this.state.loading} size="large" style={{ color: "#fff" }} />
                    </div> : null}
                    <div style={{ marginTop: "10px", display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                        标题:<Input placeholder="请输入标题" name="title" value={this.state.title} onChange={(e) => { this.inputChange(e) }} style={{ width: "90%" }} autoComplete="off" />
                    </div>
                    <div style={{ marginTop: "10px", display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                        类型:
                        {this.state.newsKey === "0" ?
                            <RadioGroup value={this.state.radioValue} style={{ width: "90%" }} onChange={(e) => { this.setState({ radioValue: e.target.value }) }}>
                                <Radio value="0">新闻</Radio>
                                <Radio value="1">展览</Radio>
                            </RadioGroup>
                            :
                            <TreeSelect
                                style={{ width: "90%", height: "32px" }}
                                value={this.state.baikeAddValue}
                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                treeData={treeData}
                                placeholder="请选择类别"
                                treeDefaultExpandAll
                                onChange={(value) => { this.baikeAddChange(value) }}
                            ></TreeSelect>
                        }
                    </div>
                    {this.state.newsKey === "0" ? <form id="test" style={{ marginTop: "20px" }}>
                        {/* <Button style={{ height: "32px", backgroundColor: "#E0745B", color: "#fff" }}><Icon type="upload" /> */}
                        上传网站zip:
                            <input type="file" name="avatar" value={this.state.uploadValue} style={{ marginLeft: "10px" }} onChange={(e) => { this.changeUpload(e) }} />
                        {/* </Button> */}
                        {this.state.fileState ? <Button style={{ height: "32px", backgroundColor: "#7A6FBE", color: "#fff", marginLeft: "10px" }} type="submit" onClick={() => { this.uploadfile() }}>上传文件</Button> : null}
                    </form> : null}
                    {/* <TextArea rows={8} value={this.state.text} onChange={(e) => { this.inputChange(e) }} style={{ marginTop: "20px" }} name="text" /> */}
                    {/* <BraftEditor {...editorProps} initialContent={this.state.text} contentId={this.state.newsId} /> */}
                    <Editor id="editor" content={this.state.text} save={this.saveNews} hideModal={this.hideModal} style={{ position: "relative" }} />
                </Modal>

                <Modal maskClosable={false} title="修改状态" footer={null} visible={this.state.newsVisible} onCancel={() => { this.setState({ newsVisible: false }) }}>
                    <Button style={{ height: "32px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.changeStatus(0) }}>待发布</Button>
                    <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.changeStatus(1) }}>发布</Button>
                    <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#22BAA0", color: "#fff" }} onClick={() => { this.changeStatus(-1) }}>冻结</Button>
                </Modal>
            </div>
        )
    }
}
export default News