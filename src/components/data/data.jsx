import React, { Component } from 'react';
import { Input, Button, Tabs, message, Modal, Select, Icon, Spin, Upload, AutoComplete } from 'antd';

import { Link } from 'react-router-dom';
import { postJSON, getAJAX } from '../ADS.js';
import { URI } from '../../data/data.js';
import { socketConnect } from 'socket.io-react';
import xtjson from '../../data/xml2json.js'
import Page from '../common/page/page';
import Table from '../common/table/table';
import XLSX from 'xlsx';
import Home from '../home/home';
import './data.css';
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const { TextArea } = Input;
class Data extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataArr: [],
            dataNameArr: [],
            visible: false,
            dataidArr: [],
            length: 10,
            pageNum: 0,
            totalNum: 0,
            tableKey: sessionStorage.getItem("tableId") ? sessionStorage.getItem("tableId") : "0",
            keyword1: "",
            keyword2: "",
            searchState: false,
            dataTabArr: ["方志", "家谱", "名人", "著述", "姓氏", "家谱目录", "置标数据", "姓氏源流", "谱系数据", "家谱影像"],
            updateArr: [],
            updateOriArr: [],
            key: 0,
            index: 0,
            keywordArr: ["请输入要搜索的地名", "请输入要搜索的地名", "请输入要搜索的姓", "请输入要搜索的地名", "请输入要搜索的地名"],
            current: 1,
            batchidArr: [],
            batchID: "",
            helpVisible: false,
            keywordArr: [],
            keywordNameArr: [],
            sortField: "_key",
            sortType: "asc",
            sortArr: [],
            loading: true,
            fileValue: "",
            title: "",
            summary: "",
            originsVisible: false,
            connectVisible: false,
            connectObj: {},
            connectNameArr: ["相关家谱", "相关方志"],
            autoArr: [],
            connectKey: "0",
            autoValue: "",
            connectValue: "",
            autoKey: 0,
            connectArr: [],
            batchKeyArr: [],
            batchKey: 0,
            tabLength: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
            catalogMark: "",
            catalogMarkVisible: false,
            catalogMarkState: 0
        }
        this.delData = this.delData.bind(this);
        this.updateData = this.updateData.bind(this);
        this.flashData = this.flashData.bind(this);
        this.changeNum = this.changeNum.bind(this);
        this.changeSort = this.changeSort.bind(this);
        this.connectUpdate = this.connectUpdate.bind(this);
    }
    componentDidMount() {

        let searchUrl = URI + "/data/searchField"
        getAJAX(searchUrl, {}, (res) => {
            let arr1 = []; let arr2 = [];
            res.data.map((item, index) => {
                arr1.push({ name: item.fieldName, value: "" });
                arr2.push(item.displayName)
            })
            this.setState({
                keywordArr: arr1,
                keywordNameArr: arr2
            })
            let batchUrl = URI + "/data/batchID";
            let batchData = {
                table: this.state.dataTabArr[this.state.tableKey]
            }
            getAJAX(batchUrl, batchData, (res) => {
                if (res.msg === "OK") {
                    this.setState({
                        batchidArr: res.result
                    })
                    this.flashData(this.state.current, this.state.length, this.state.tableKey);
                }
            })
        })

    }
    flashData(page, limit, type) {
        sessionStorage.setItem("tableId", type);
        let [url, data] = ["", {
            "page": page,
            "limit": limit,
            "batchID": this.state.batchID
        }]
        switch (type) {
            case "0":
                url = URI + "/localRecord/list";
                data.place = this.state.keyword1;
                break;
            case "1":
                let obj = {};
                url = URI + "/data/catalogList";
                this.state.keywordArr.map((item, index) => {
                    obj[item.name] = item.value
                })
                obj['batchID'] = this.state.batchID;
                data = {
                    "curPage": page,
                    "perPage": limit,
                    "displayPlace": 0,
                    "keyWordObj": JSON.stringify(obj),
                    "sortField": this.state.sortField,
                    "sortType": this.state.sortType
                }
                break;
            case "2":
                url = URI + "/celebrity/list";
                data.surname = this.state.keyword1;
                data.name = this.state.keyword2;
                data.displayPlace = 0;
                break;
            case "3":
                url = URI + "/gArticles/list";
                data.theme = this.state.keyword1;
                break;
            case "4":
                url = URI + "/surname/list";
                data.surname = this.state.keyword1;
                break;
            case "5":
                url = URI + "/catalogue";
                data = {
                    "curPage": page,
                    "perPage": limit,
                    "batchID": this.state.batchID,
                    "bookId": this.state.keyword1
                }
                break;
            case "6":
                url = URI + "/catalogMark";
                data = {
                    "curPage": page,
                    "perPage": limit,
                    "keyWord": this.state.keyword1,
                    "batchID": this.state.batchID,
                }
                break;
            case "7":
                url = URI + "/surname/originList";
                data = {
                    "curPage": page,
                    "perPage": limit,
                    "keyWord": this.state.keyword1
                }
                break;
            case "8":
                url = URI + "/pedigree/list";
                data = {
                    "curPage": page,
                    "perPage": limit,
                    "batchID": this.state.keyword1
                }
                break;
            case "9":
                url = URI + "/objectData/list";
                data = {
                    "curPage": page,
                    "perPage": limit,
                    "batchID": this.state.batchID,
                }
            default: null
        }
        getAJAX(url, data, this.getData.bind(this));
    }
    getData(res) {
        if (res.msg === "OK") {
            //this.state.adminArr=[];
            let [arr1, arr2, arr3, arr4, arr5, arr6, arr7] = [[], [], [], [], [], [], []];
            res.showFiled.map((item, index) => {
                //if (item.displayName !== "来源") {
                if (item.sortField) {
                    arr7.push({ name: item.fieldName, value: item.sortField, state: false });
                }
                arr2.push(item.displayName);
                arr4.push(item.fieldName);
                //batchID，GID，hasContent，openImage
                if (item.fieldName !== "TitleGuid" && item.fieldName !== "PersonGuid" && item.fieldName !== "AID" && item.fieldName !== "_key" && item.fieldName !== "batchID" && item.fieldName !== "GID" && item.fieldName !== "hasContent" && item.fieldName !== "hasImage" && item.fieldName !== "openImage") {
                    arr5.push({ name: item.fieldName, displayName: item.displayName, value: "" })
                }
                //}
            })
            res.data.map((item, index) => {
                var obj = {};
                arr4.map((value, key) => {
                    //Array.isArray()
                    obj[value] =
                        value === "hasImage" ? { value: item[value] === 1 ? "有" : "无", visible: true }
                            : value === "hasContent" ? { value: item[value] === 1 ? "有" : "无", visible: true }
                                : value === "openImage" ? { value: item[value] === 1 ? "是" : "否", visible: true }
                                    : value === "biography" ? { value: item["url"], visible: true, linkState: true, name: item["biography"] }
                                        : value === "page_prop" ? { value: item[value] === "1" ? "是" : "", visible: true }
                                            : value === "status" ? { value: item[value] === 1 ? "已入库" : "", visible: true }
                                                : value === "sex" ? { value: parseInt(item[value]) === 0 ? "男" : parseInt(item[value]) === 0 ? "女" : "", visible: true }
                                                    : { value: item[value], visible: true };
                })
                arr3.push(item["_key"]);
                obj.state = { visible: true }
                arr1.push(obj);
            })
            arr2.push("操作");
            if (this.state.tableKey === "1") {
                arr7.push({ name: "", value: "0" });
            }
            if (this.state.sortArr.length === 0) {
                this.setState({
                    sortArr: arr7
                })
            }
            this.setState({
                dataArr: arr1,
                dataNameArr: arr2,
                dataidArr: arr3,
                updateArr: arr5,
                pageNum: res.pages,
                totalNum: res.totals,
                length: this.state.length,
                current: this.state.current,
                loading: false
            });
        }
    }

    delData(key, index) {
        let [url, data] = ["", {
            id: key
        }]
        switch (this.state.tableKey) {
            case "0":
                url = URI + "/localRecord/delete";
                break;
            case "1":
                url = URI + "/data/catalog/delete";
                break;
            case "2":
                url = URI + "/celebrity/delete";
                break;
            case "3":
                url = URI + "/gArticles/delete";
                break;
            case "4":
                url = URI + "/surname/delete";
                break;
            case "5":
                url = URI + "/catalogue/delete";
                break;
            case "6":
                url = URI + "/catalogMark/delete";
                break;
            case "7":
                url = URI + "/surname/origin/delete";
                break;
            case "8":
                url = URI + "/data/batch";
                data = { batchKey: key }
                break;
            case "9":
                url = URI + "/objectData/delete";
                break;
            default: null
        }
        postJSON(url, data, (response) => {
            if (response.data.msg === "OK") {
                message.success("删除成功!");
                this.flashData(this.state.current, this.state.length, this.state.tableKey);
            } else {
                message.error("删除失败!")
            }
        })
    }
    updateData(key, index) {
        if (this.state.tableKey === "7") {
            let arr = [];
            let url = URI + "/surname/originDetail";
            let userData = {
                //"token": sessionStorage.getItem("token"),
                "originKey": key
            }
            getAJAX(url, userData, (res) => {
                if (res.msg === "OK") {
                    this.state.updateArr.map((item, index) => {
                        item.value = res.data[0][item.name];
                    })
                    this.state.updateArr.splice(2, 1);
                    this.state.updateArr.push({ name: "detail", displayName: "详情", value: JSON.stringify(res.data[0]["detail"]) })
                    this.setState({
                        visible: true,
                        key: key,
                        index: index,
                        updateArr: this.state.updateArr
                    })
                }
            });
        }
        else {
            this.state.updateArr.map((item, i) => {
                item.value = this.state.dataArr[index][item.name].value;
            })
            this.setState({
                visible: true,
                key: key,
                index: index,
                updateArr: this.state.updateArr
            })
        }
    }
    //分页修改page条数
    changeNum(length, page) {
        this.state.tabLength[parseInt(this.state.tableKey)] = parseInt(length)
        this.setState({
            length: length,
            current: page,
            tabLength: this.state.tabLength
        })
    }
    changeTab(key) {
        this.setState({
            tableKey: key,
            keyword1: "",
            keyword2: "",
            batchID: "",
            loading: true,
            pageNum: 0,
            totalNum: 0,
            length: this.state.tabLength[parseInt(key)],
            sortArr: []
        });
        let batchUrl = URI + "/data/batchID";
        let batchData = {
            table: this.state.dataTabArr[key]
        }
        getAJAX(batchUrl, batchData, (res) => {
            this.setState({
                batchidArr: res.result,
                current: 1,
                dataArr: [],
                dataNameArr: []
            })
            this.flashData(1, this.state.tabLength[parseInt(key)], key);
        })
    }
    inputChange(e) {
        const { name, value } = e.target;
        this.setState((prevState) => {
            prevState[name] = value;
            return prevState
        })
    }
    inputChangeArr(e, index) {
        const { name, value } = e.target;
        this.state.keywordArr[index].value = value;
        this.setState({
            keywordArr: this.state.keywordArr
        })
    }
    inputUpdateChange(e, index) {
        const { name, value } = e.target;
        this.state.updateArr.map((item, index) => {
            if (name === item.name) {
                item.value = value;
            }
        })
        this.setState({
            updateArr: this.state.updateArr
        })
    }
    saveUpdate() {
        let [url, data, dataObj] = ["", {}, {}]
        if (this.state.updateArr.some((item, index) => {
            return item.displayName.indexOf("是否") !== -1 && item.value !== "0" && item.value !== "1"
        })) {
            message.error("标题名有是否内容的,输入内容必须是0(否)或1(是)");
            return;
        }
        if (this.state.updateArr.some((item, index) => {
            return item.displayName.indexOf("已入库") !== -1 && item.value !== "0" && item.value !== "1"
        })) {
            message.error("已入库,输入内容必须是0(否)或1(是)");
            return;
        }
        if (this.state.updateArr.some((item, index) => {
            return item.displayName.indexOf("性别") !== -1 && item.value !== "0" && item.value !== "1"
        })) {
            message.error("性别,输入内容必须是0(男)或1(女)");
            return;
        }
        this.state.updateArr.map((item, index) => {
            dataObj[item.name] = item.value;
        })
        switch (this.state.tableKey) {
            case "0":
                url = URI + "/localRecord/edit";
                data = dataObj;
                data.id = this.state.key;
                break;
            case "1":
                url = URI + "/data/catalog/update";
                data = { data: dataObj, catalogKey: this.state.key }
                break;
            case "2":
                url = URI + "/celebrity/edit";
                data = dataObj;
                data.id = this.state.key;
                break;
            case "3":
                url = URI + "/gArticles/edit";
                data = dataObj;
                data.id = this.state.key;
                break;
            case "4":
                url = URI + "/surname/edit";
                data = dataObj;
                data.id = this.state.key;
                break;
            case "5":
                url = URI + "/catalogue/update";
                data = { data: dataObj, catalogueKey: this.state.key }
                break;
            case "6":
                url = URI + "/catalogue/update";
                data = { data: dataObj, catalogueKey: this.state.key }
                break;
            case "7":
                url = URI + "/surname/origin/edit";
                dataObj.originKey = this.state.key;
                data = dataObj
                break;
            case "9":
                url = URI + "/objectData/edit";
                dataObj.objectKey = this.state.key;
                data = dataObj
                break;
            default: null
        }
        postJSON(url, data, (response) => {
            if (response.data.msg === "OK" || response.data.msg === "更新数据成功") {
                message.success("更新成功!");
                this.setState({
                    visible: false
                })
                this.flashData(this.state.current, this.state.length, this.state.tableKey);
            } else {
                message.error("更新失败!")
            }
        })
    }
    //去重并取数字
    getArrNum(arr) {
        let obj = {};
        arr.map((item, index) => {
            if (obj[item]) {
                obj[item] = ++obj[item];
            } else {
                obj[item] = 1
            }
        })
        return Object.keys(obj)
    }
    changeSort(index) {
        this.state.sortArr.map((value, key) => {
            if (key === index) {
                this.state.sortArr[index].state = this.state.sortArr[index].state ? false : true
            } else {
                value.state = false
            }
        })
        this.setState({
            sortField: this.state.sortArr[index].name,
            sortType: this.state.sortArr[index].state ? "asc" : "desc",
        }, () => { this.flashData(this.state.current, this.state.length, this.state.tableKey); })
    }
    uploadfile(e, index) {
        this.setState({
            loading: true
        })
        let file = e.target.files[0];
        let arr = file.name.split(".");
        let fileType = arr[arr.length - 1];
        if (fileType === "mdb" || fileType === "json") {
            let url = "";
            let data = {};
            let that = this;
            var form = new FormData();
            form.append("file", file);
            var req = new XMLHttpRequest();
            req.open("post", URI + "/upload");
            req.setRequestHeader("Content-type", "multipart/form-data");
            req.send(form);
            req.onreadystatechange = function () {
                if (req.readyState == 4 && req.status == 200) {
                    url = URI + "/surname/origins";
                    data = {
                        filePath: JSON.parse(req.responseText).filePath,
                        title: that.state.title,
                        summary: that.state.summary,
                    }
                    postJSON(url, data, (response) => {
                        if (response.data.msg === "OK") {
                            message.success("上传姓氏源流文件成功!");
                            that.setState({
                                title: "",
                                summary: "",
                                loading: false
                            })
                            that.flashData(1, that.state.length, that.state.tableKey);
                        } else {
                            message.error("上传姓氏源流文件失败!");
                            that.setState({
                                loading: false
                            })
                        }
                    })
                }
            }
        } else {
            message.error("请上传正确的文件格式");
            this.setState({
                loading: false
            })
            return;
        }
    }
    // uploadImg(info) {
    //     if (info.file.status === 'done') {
    //         console.log("xxx", info.fileList);
    //         console.log(info.file.response);
    //     } else if (info.file.status === 'error') {
    //         message.error("上传失败!");
    //     }
    // }
    xmlUpload(e) {
        this.setState({
            loading: true
        })
        let file = e.target.files[0];
        let arr = file.name.split(".");
        let fileType = arr[arr.length - 1];
        if (fileType === "xml") {
            let that = this;
            const reader = new FileReader()
            reader.onload = function (e) {
                var result = e.target.result.replace(/\r\n/g, "");
                var xtj = new xtjson();
                var content = xtj.xml_str2json(result);
                let url = URI + "/pedigree";
                postJSON(url, {
                    "token": sessionStorage.getItem("token"),
                    "adminId": sessionStorage.getItem("userId"),
                    "fileName": file.name.split(".")[0],
                    "patchData": { "fileContent": content },
                }, (response) => {
                    if (response.data.msg === "OK") {
                        message.success("上传成功!");
                        that.flashData(1, that.state.length, that.state.tableKey);
                        that.setState({
                            loading: false
                        })
                    } else {
                        message.error(response.data.msg);
                        that.setState({
                            loading: false
                        })
                    }
                })
            }
            reader.readAsText(file)
        } else {
            message.error("请上传正确的文件格式");
            this.setState({
                loading: false
            })
            return;
        }
    }
    //关联家谱
    connectUpdate(key, index) {
        this.setState({
            connectVisible: true,
            key: key
        })
        let connectUrl = URI + "/data/catalog";
        let connectData = {
            catalogKey: key,
            displayPlace: 0
        }
        getAJAX(connectUrl, connectData, (res) => {
            if (res.msg === "OK") {
                this.setState({
                    connectObj: res.resultList,
                })
                this.flashConnect(key)
            }
        })
    }
    inputConnectChange(e) {
        let value = e.target.value
        if (value !== "") {
            this.setState({
                connectValue: value,
                connectState: true
            })
            let url = URI + "/catalogRelate/search";
            let data = {
                keyWord: value,
                type: parseInt(this.state.connectKey)
            }
            // }
            getAJAX(url, data, (res) => {
                let arr = [];
                if (res.msg === "OK") {
                    if (this.state.connectKey === "0") {
                        res.result.map((item, index) => {
                            arr.push({
                                title: "家谱",
                                genealogyName: item.genealogyName ? item.genealogyName : "",
                                surname: item.surname ? item.surname : "",
                                hall: item.hall ? item.hall : "",
                                place: item.place ? item.place : "",
                                _key: item._key
                            })
                        })

                    } else {
                        res.result.map((item, index) => {
                            arr.push({
                                title: "方志",
                                theme: item.theme ? item.theme : "",
                                place: item.place ? item.place : "",
                                _key: item._key
                            })
                        })
                    }
                    this.setState({
                        autoArr: arr
                    })
                }
            })
        } else {
            this.setState({
                connectValue: value,
                connectState: false
            })
        }
    }
    addConnect() {
        if (this.state.autoKey === 0) {
            message.error("请选中正确的族谱或方志名");
        }
        let url = URI + "/catalogRelate/relate";
        let data = {
            catalogKey: this.state.key,
            linkArr: [this.state.autoKey],
            type: parseInt(this.state.connectKey)
        }
        postJSON(url, data, (response) => {
            if (response.data.msg === "OK") {
                message.success("关联成功");
                this.setState({
                    autoKey: 0
                })
                this.flashConnect(this.state.key)
            } else {
                message.error(response.data.msg)
            }
        })
    }
    delConnect(key) {
        let url = URI + "/catalogRelate/delete";
        let data = {
            id: key
        }
        postJSON(url, data, (response) => {
            if (response.data.msg === "OK") {
                message.success("解除成功");
                this.flashConnect(this.state.key)
            } else {
                message.error(response.data.msg)
            }
        })
    }

    flashConnect(key) {
        let arr = []
        let url = URI + "/catalogRelate/list";
        let data = {
            catalogKey: key,
            type: parseInt(this.state.connectKey)
        }
        getAJAX(url, data, (res) => {
            if (res.msg === "OK") {
                if (this.state.connectKey === "0") {
                    res.data.map((item, index) => {
                        arr.push({
                            genealogyName: item.genealogyName,
                            _key: item._key
                        })
                    })
                } else {
                    res.data.map((item, index) => {
                        arr.push({
                            theme: item.theme,
                            _key: item._key
                        })
                    })
                }
                this.setState({
                    connectArr: arr
                })
            }
        })
    }
    saveCatalogMark(state) {
        this.setState({
            loading: true
        })
        let sourceArr = this.state.catalogMark.split("/");
        let url="";
        if(state){
            url = "http://192.168.1.101:8082/csv2Arango";
        }else{
            url = "http://192.168.1.101:8082/access2Arango";
        }
      
        let data = {
            filePath: this.state.catalogMark,
            source: this.state.catalogMark,
            adminId: sessionStorage.getItem("userId"),
            table: this.state.dataTabArr[this.state.tableKey],
            socketId: this.props.socket.id
        }
        postJSON(url, data, (response) => {
            if (response.data.msg === "OK") {
                message.success("上传数据开始!");
                this.flashData(this.state.current, this.state.length, this.state.tableKey);
                this.setState({
                    loading: false,
                    catalogMarkVisible: false
                })
            } else {
                this.setState({
                    loading: false,
                    catalogMarkVisible: false
                })
                message.error(response.data.msg);
            }
        })
    }
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    //TODO
    uploadExcelData(e) {
        this.setState({
            loading: true
        })
        let file = e.target.files[0];
        let arr = file.name.split(".");
        let fileType = arr[arr.length - 1];
        if (fileType === "xls" || fileType === "xlsx") {
            let [that, url, postData, wb, rABS, reader, arr] = [this, "", {}, "", false, new FileReader, arr];
            //postData 请求参数 wb 读取完成的数据 rABS 是否将文件读取为二进制字符串
            reader.onload = function (e) {
                var data = e.target.result;
                if (rABS) {
                    wb = XLSX.read(btoa(this.fixdata(data)), {//手动转化
                        type: 'base64'
                    });
                } else {
                    wb = XLSX.read(data, {
                        type: 'binary'
                    });
                }
                let excelJson = [];
                let catalogs = [];
                excelJson = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                url = URI + "/objectData/import";
                postData = {
                    source: file.name,
                    data: JSON.stringify(excelJson),
                    adminId: sessionStorage.getItem("userId")
                }
                postJSON(url, postData, (response) => {
                    if (response.data.msg === "OK") {
                        message.success("上传数据成功");
                        that.setState({
                            uploadValue1: "",
                            uploadValue2: "",
                            loading: false
                        })
                        that.flashData(1, that.state.length, that.state.tableKey);
                    } else {
                        message.error("上传失败!");
                        that.setState({
                            uploadValue1: "",
                            uploadValue2: "",
                            loading: false
                        })
                    }
                })
            }
            if (rABS) {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsBinaryString(file);
            }
        }
        else {
            message.error("请上传正确的文件格式");
            this.setState({
                loading: false
            })
            return;
        }
    }
    //上传uploadAccess
    uploadAccess(info) {
        if (info.file.name.split(".")[1] === "mdb") {
            this.setState({
                loading: true
            })
            if (info.file.status === 'done') {
                let url = "http://192.168.1.101:8082/bookTableMdb";
                let postData = {
                    "source": info.file.name,
                    "adminId": sessionStorage.getItem("userId"),
                    "filePath": info.file.response.fullPath
                }
                postJSON(url, postData, (response) => {
                    if (response.data.msg === "OK") {
                        message.success("上传mdb文件成功");
                    }
                    this.setState({
                        loading: false
                    })
                })
            } else if (info.file.status === 'error') {
                message.error("上传失败!");
                this.setState({
                    loading: false
                })
            }
        } else {
            message.error("请上传正确的文件格式");
        }

    }
    render() {
        const prop = {
            name: 'file',
            action: URI + "/upload/originImage",
            headers: {
                authorization: 'authorization-text',
            }
        };
        const accessProp = {
            name: 'file',
            action: URI + "/upload",
            headers: {
                authorization: 'authorization-text',
            }
        };
        const csvProp = {
            name: 'file',
            action: URI + "/csv2Arango",
            headers: {
                authorization: 'authorization-text',
            }
        };
        return (

            <div>
                <Home chooseIndex="3" />
                <div className="right-container">
                    <div className="admin-container">
                        {/* <input type="file" onChange={(e) => { this.test(e) }} /> */}
                        <div className="admin-title" style={{ display: "flex", justifyContent: "space-between" }}>家谱资源中心
                            <div style={{ marginRight: "20px" }}>

                                <Button style={{ height: "32px", backgroundColor: "#22BAA0", color: "#fff", marginLeft: "10px", border: "0" }}>
                                    <Link to={{ pathname: '/dataTable', query: { id: "0" } }}><Icon type="file-excel" />元数据定义</Link>
                                </Button>
                                <Button style={{ height: "32px", backgroundColor: "#22BAA0", color: "#fff", marginLeft: "10px", border: "0" }}>
                                    <Link to={{ pathname: '/dataTable', query: { id: "1" } }}><Icon type="file-excel" />数据模板</Link>
                                </Button>
                                <Button style={{ height: "32px", backgroundColor: "#3B5998", color: "#fff", marginLeft: "10px", border: "0" }} onClick={() => { this.setState({ helpVisible: true }) }}>
                                    <Icon type="question" />帮助
                                </Button>
                            </div>
                        </div>
                        <div className="admin-div">
                            <Tabs activeKey={this.state.tableKey} onChange={(key) => { this.changeTab(key) }}>
                                {this.state.dataTabArr.map((item, index) => {
                                    return (
                                        <TabPane tab={item} key={index + ""} style={{ width: "100%", overflow: "auto" }}>
                                            <div style={{ display: "flex", lineHeight: "32px", textalign: "center", justifyContent: "space-between" }}>
                                                <div style={{ display: "flex" }}>
                                                    {this.state.tableKey !== "8" && this.state.tableKey !== "7" ? <Select placeholder="请选择批次号" style={{ minWidth: "200px" }} value={this.state.batchID === "" ? "请选择批次号" : this.state.batchID} onChange={(value) => { console.log(value); this.setState({ batchID: value }); }}>
                                                        {this.state.batchidArr.length > 0 ?
                                                            this.state.batchidArr.map((value, key) => {
                                                                return (<Option value={value} key={key}>{value}</Option>)
                                                            }) : null
                                                        }
                                                    </Select> : null}
                                                    <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.state.current = 1; this.flashData(this.state.current, this.state.length, this.state.tableKey) }}>搜索</Button>
                                                    <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.state.current = 1; this.state.batchID = ""; this.state.keyword1 = ""; this.state.keyword2 = ""; this.state.keywordArr.map((item, index) => { item.value = "" }); this.flashData(1, this.state.length, this.state.tableKey) }}>显示全部</Button>
                                                    {
                                                        index === 0 ?
                                                            <Input type="text" autoComplete="off" placeholder="请输入要搜索的地名" style={{ width: "200px", height: "32px", marginLeft: "10px" }} name="keyword1" value={this.state.keyword1} onChange={(e) => { this.inputChange(e) }} />
                                                            : index === 2 ?
                                                                <div>
                                                                    <Input type="text" autoComplete="off" placeholder="请输入要搜索的姓" style={{ width: "200px", height: "32px", marginLeft: "10px" }} name="keyword1" value={this.state.keyword1} onChange={(e) => { this.inputChange(e) }} />
                                                                    <Input type="text" autoComplete="off" placeholder="请输入要搜索的名" style={{ width: "200px", height: "32px", marginLeft: "10px" }} name="keyword2" value={this.state.keyword2} onChange={(e) => { this.inputChange(e) }} />
                                                                </div>
                                                                : index === 3 ? <Input type="text" autoComplete="off" placeholder="请输入要搜索的作品" style={{ width: "200px", height: "32px", marginLeft: "10px" }} name="keyword1" value={this.state.keyword1} onChange={(e) => { this.inputChange(e) }} />
                                                                    : index === 4 ? <Input type="text" autoComplete="off" placeholder="请输入要搜索的姓氏" style={{ width: "200px", height: "32px", marginLeft: "10px" }} name="keyword1" value={this.state.keyword1} onChange={(e) => { this.inputChange(e) }} />
                                                                        : index === 5 ? <Input type="text" autoComplete="off" placeholder="请输入要搜索的谱目影像ID" style={{ width: "200px", height: "32px", marginLeft: "10px" }} name="keyword1" value={this.state.keyword1} onChange={(e) => { this.inputChange(e) }} />
                                                                            : index === 6 ? <Input type="text" autoComplete="off" placeholder="请输入要搜索的名或字" style={{ width: "200px", height: "32px", marginLeft: "10px" }} name="keyword1" value={this.state.keyword1} onChange={(e) => { this.inputChange(e) }} />
                                                                                : index === 7 ? <Input type="text" autoComplete="off" placeholder="请输入要搜索的标题" style={{ width: "200px", height: "32px", marginLeft: "10px" }} name="keyword1" value={this.state.keyword1} onChange={(e) => { this.inputChange(e) }} />
                                                                                    : index === 8 ? <Input type="text" autoComplete="off" placeholder="请输入要搜索的批次号" style={{ width: "200px", height: "32px", marginLeft: "10px" }} name="keyword1" value={this.state.keyword1} onChange={(e) => { this.inputChange(e) }} />
                                                                                        : null
                                                    }

                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", marginRight: "5px" }}>
                                                    <Button style={{ height: "32px", backgroundColor: "#3B5998", color: "#fff", marginLeft: "10px" }}>
                                                        <Link to="/batchHistory">批次管理</Link>
                                                    </Button>
                                                    {index === 7 ?
                                                        <Button style={{ height: "32px", backgroundColor: "#E0745B", color: "#fff", marginLeft: "10px" }} onClick={() => { this.setState({ originsVisible: true }) }}>
                                                            批量导入
                                                             </Button>
                                                        : index == 6 ?
                                                            <React.Fragment>
                                                                <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#E0745B", color: "#fff" }} onClick={(e) => { this.setState({ catalogMarkVisible: true, catalogMarkState: 0 }) }}>批量导入置标数据mdb</Button>
                                                                <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#E0745B", color: "#fff" }} onClick={(e) => { this.setState({ catalogMarkVisible: true, catalogMarkState: 1 }) }}>批量导入置标数据csv</Button>
                                                            </React.Fragment>
                                                            : index == 8 ? <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#E0745B", color: "#fff" }}>批量导入谱系数据xml <input type="file" value={this.state.fileValue} className="file-button" onChange={(e) => { this.xmlUpload(e) }} /></Button>
                                                                : index == 9 ?
                                                                    <React.Fragment>
                                                                        <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#E0745B", color: "#fff" }}>批量导入影像文件excel
                                                                                 <input type="file" value={this.state.uploadValue1} className="file-button" onChange={(e) => { this.uploadExcelData(e) }} /></Button>

                                                                        <Upload {...accessProp} onChange={(info) => { this.uploadAccess(info) }} showUploadList={false}>
                                                                            <Button style={{ height: "32px", backgroundColor: "#E0745B", color: "#fff" }}>
                                                                                批量导入access文件mdb
                                                                         </Button>
                                                                        </Upload>
                                                                    </React.Fragment>
                                                                    : <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#E0745B", color: "#fff" }}><Link to="/importData">批量导入</Link></Button>}
                                                </div>
                                            </div>
                                            {index === 1 ?
                                                <div style={{ marginTop: "10px" }}>
                                                    {this.state.keywordArr.map((item, index) => {
                                                        return <Input key={index} type="text" autoComplete="off" placeholder={"请输入要搜索的" + this.state.keywordNameArr[index]} style={{ width: "200px", height: "32px", marginRight: "10px", marginTop: "10px" }} name={item.name} value={item.value} onChange={(e) => { this.inputChangeArr(e, index) }} />
                                                    })}
                                                </div> : null}
                                            {this.state.loading ? <div style={{ display: "flex", justifyContent: "center", position: "absolute", top: "20px", width: "100%", zIndex: "2" }}>
                                                <Spin spinning={this.state.loading} size="large" style={{ color: "#fff" }} />
                                            </div> : null}
                                            <Table style={{ width: "100%" }} sortArr={this.state.sortArr} arr={this.state.dataArr} arrName={this.state.dataNameArr} id={this.state.dataidArr} delData={this.delData} updateData={this.updateData} connectUpdate={this.connectUpdate} changeSort={this.changeSort} parentType="2" tableKey={this.state.tableKey} />
                                            <Page length={this.state.length} page={this.state.current} totalNum={this.state.totalNum} pageNum={this.state.pageNum} flashData={this.flashData} changeNum={this.changeNum} type={this.state.tableKey} />
                                        </TabPane>)
                                })
                                }
                            </Tabs>
                        </div>
                    </div>
                </div>
                <Modal maskClosable={false} title="编辑数据" visible={this.state.visible} onOk={() => { this.saveUpdate() }} onCancel={() => { this.setState({ visible: false }) }}
                    okText="确定" cancelText="取消">

                    {this.state.updateArr.map((item, index) => {
                        //  (<div key={index}>{item.name} {item.fieldName} {index}</div>)
                        return (<div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }} key={index}>
                            {item.displayName}:
                        {item.name !== "detail"
                                ? <Input style={{ width: "80%" }} placeholder={"请输入" + item.displayName} name={item.name} value={item.value} onChange={(e) => { this.inputUpdateChange(e, index) }} autoComplete="off" />
                                : <TextArea rows={10} style={{ width: "80%" }} name={item.name} value={item.value} onChange={(e) => { this.inputUpdateChange(e, index) }} autoComplete="off" />}
                        </div>)
                    })}
                </Modal>
                <Modal maskClosable={false} title="功能指示" footer={null} visible={this.state.helpVisible} onCancel={() => { this.setState({ helpVisible: false }) }} bodyStyle={{ height: "800px" }} width="800px">
                    <img src="./images/help.png" alt="map" useMap="#map" style={{ border: "1px solid black" }} />
                    <map name="map">
                        <area shape="rect" coords="60,292,158,333" onClick={() => { this.props.history.push({ pathname: '/dataTable', query: { id: "0" } }) }} />
                        <area shape="rect" coords="190,292,283,333" onClick={() => { this.props.history.push({ pathname: '/dataTable', query: { id: "1" } }) }} />
                        <area shape="rect" coords="362,245,458,290" onClick={() => { this.setState({ helpVisible: false }) }} />
                        <area shape="rect" coords="580,188,680,230" onClick={() => { this.props.history.push('/importData') }} />
                        <area shape="rect" coords="580,263,680,308" onClick={() => { this.props.history.push('/batchHistory') }} />
                        <area shape="rect" coords="580,376,680,419" onClick={() => { this.props.history.push('/batchHistory') }} />
                    </map>
                </Modal>
                <Modal maskClosable={false} title="导入姓氏源流" footer={null} visible={this.state.originsVisible} onCancel={() => { this.setState({ originsVisible: false }) }} bodyStyle={{ height: "650px" }} width="500px">
                    <Input type="text" autoComplete="off" placeholder="请输入标题" style={{ width: "100%", height: "32px", marginTop: "20px" }} name="title" value={this.state.title} onChange={(e) => { this.inputChange(e) }} />
                    <Input type="text" autoComplete="off" placeholder="请输入摘要" style={{ width: "100%", height: "32px", marginTop: "20px" }} name="summary" value={this.state.summary} onChange={(e) => { this.inputChange(e) }} />
                    <div style={{ marginTop: "20px" }}>
                        <Button style={{ height: "32px", backgroundColor: "#7A6FBE", color: "#fff" }}>
                            <Icon type="upload" />上传姓氏源流文件
                        <input type="file" value={this.state.fileValue} className="file-button" onChange={(e) => { this.uploadfile(e, "1") }} />
                        </Button>
                    </div>
                    <Upload {...prop} multiple>
                        <Button style={{ height: "32px", backgroundColor: "#E0745B", color: "#fff", marginTop: "20px" }}>
                            <Icon type="upload" />上传姓氏源流图片
                         </Button>
                    </Upload>
                </Modal>

                <Modal maskClosable={false} okText="确定" cancelText="取消" title="导入置标数据" visible={this.state.catalogMarkVisible} onOk={() => { this.saveCatalogMark(this.state.catalogMarkState) }} onCancel={() => { this.setState({ catalogMarkVisible: false }) }} >
                    <Input type="text" autoComplete="off" placeholder="请输入置标数据路径" style={{ width: "100%", height: "32px", marginTop: "20px" }} name="catalogMark" value={this.state.catalogMark} onChange={(e) => { this.inputChange(e) }} />
                </Modal>

                <Modal maskClosable={false} title="设置关联" footer={null} visible={this.state.connectVisible} onCancel={() => { this.setState({ connectVisible: false, connectState: false, autoArr: [], connectArr: [], connectKey: "0", connectValue: "" }) }} bodyStyle={{ height: "800px" }} width="500px">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ width: "50%" }}>
                            <img style={{ width: "200px", height: "250px" }} src={this.state.connectObj.cover ? this.state.connectObj.cover : "./images/cover.jpg"} />
                        </div>
                        <div style={{ width: "50%", textAlign: "left" }}>
                            <div style={{ fontSize: "18px", fontWeight: "bold" }}>{this.state.connectObj.genealogyName}</div>
                            <div style={{ marginTop: "30px" }}>姓氏:{this.state.connectObj.surname ? this.state.connectObj.surname : ""}</div>
                            <div style={{ marginTop: "30px" }}>堂号:{this.state.connectObj.hall ? this.state.connectObj.hall : ""}</div>
                            <div style={{ marginTop: "30px" }}>谱籍地:{this.state.connectObj.place ? this.state.connectObj.place : ""}</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginTop: "20px" }}>
                        <Input style={{ width: "80%" }} placeholder="请输入关键词" value={this.state.connectValue} onChange={(e) => { this.inputConnectChange(e) }} autoComplete="off" />
                        <div className="connectDiv" style={{ display: this.state.connectState ? "block" : "none" }}>
                            {this.state.autoArr.map((item, index) => {
                                return (
                                    this.state.connectKey === "0" ?
                                        <div key={item._key} style={{ marginTop: "2px", borderBottom: "1px dotted #7E7E76" }} onClick={(e) => { this.setState({ connectValue: item.genealogyName, connectState: false, autoKey: item._key, }) }}>
                                            <div style={{ fontWeight: "bold" }}>{item.genealogyName}</div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1px" }}>
                                                {item.surname !== "" ? <span>姓氏:{item.surname}</span> : null}
                                                {item.hall !== "" ? <span>堂号:{item.hall}</span> : null}
                                            </div>
                                            {item.place !== "" ? <div>谱籍地:{item.place}</div> : null}

                                        </div>
                                        : this.state.connectKey === "1" ? <div key={item._key + ""} style={{ marginTop: "2px", borderBottom: "1px dotted #7E7E76" }} onClick={(e) => { this.setState({ connectValue: item.theme, connectState: false, autoKey: item._key }) }}>
                                            <div style={{ fontWeight: "bold" }}>{item.theme}</div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1px" }}>
                                                {item.place !== "" ? <span>地方:{item.place}</span> : null}
                                            </div>
                                        </div> : null
                                )
                            })}
                        </div>
                        <Button style={{ marginLeft: "10px", backgroundColor: "#395998", color: "#fff" }} onClick={() => { this.addConnect() }}>确定关联</Button>
                    </div>

                    <Tabs activeKey={this.state.connectKey} onChange={(key) => { this.state.connectKey = key; this.state.connectValue = ""; this.flashConnect(this.state.key) }}>
                        {this.state.connectNameArr.map((item, index) => {
                            return (<TabPane tab={item} key={index + ""} style={{ height: "380px", width: "100%", overflow: "auto" }}>
                                {this.state.connectArr.map((item, index) => {
                                    return (
                                        <div key={index} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                                            <span>{item.genealogyName ? item.genealogyName : item.theme}</span>
                                            <span onClick={() => { this.delConnect(item._key) }}><a href="javascript:;" style={{ textDecoration: "underline" }}>解除关联</a></span>
                                        </div>)
                                })}
                            </TabPane>)
                        })}

                    </Tabs>
                </Modal>
            </div >
        )
    }
}
export default socketConnect(Data);