import React, { Component } from 'react';
import { Input, Button, DatePicker, message, Modal, Select, Spin, Radio, Table, Checkbox } from 'antd';
import { postJSON, patchJSON, getAJAX } from '../ADS.js';
import { socketConnect } from 'socket.io-react';
import { URI } from '../../data/data.js';
import { Link } from 'react-router-dom';
import Page from '../common/page/page';
import Tables from '../common/table/table';
import Home from '../home/home';
import XLSX from 'xlsx';
import './batchHistory.css';
const { RangePicker } = DatePicker;
const Option = Select.Option;
const RadioGroup = Radio.Group;
class BatchHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            batchNameArr: ["批次", "上传时间", "操作人", "文件名称", "对应模板", "上传记录", "数据类型", "状态", "关联影像文件", "关联全文内容", "操作"],
            batchArr: [],
            totalNum: 0,
            pageNum: 0,
            visible: false,
            length: 10,
            batchidArr: [],
            key: 0,
            index: 0,
            statusState: false,
            sourceDir: "",
            batchID: "",
            status: "",
            current: 1,
            textDir: "",
            pedigreeDir: "",
            tableArr: [],
            table: "",
            tableNameArr: ["方志", "家谱", "名人", "著述", "姓氏", "家谱目录","置标数据","家谱影像"],
            bindState: "",
            bindType: 0,
            uploadValue1: "",
            uploadValue2: "",
            errorBatchArr: [],
            errorArr: [],
            errorNameArr: [
                { title: '列数', dataIndex: 'key', key: 'key' },
                { title: '属性名', dataIndex: 'duplicateField', key: 'duplicateField' },
                { title: '属性值', dataIndex: 'value', key: 'value' },
            ],
            bindArr: [],
            bindNameArr: [
                { title: '成功', dataIndex: 'key', key: 'key' },
                { title: '缺少影像文件', dataIndex: 'lackFilekey', key: 'lackFilekey' },
                { title: '缺少谱目', dataIndex: 'lackCatalogkey', key: 'lackCatalogkey' },
            ],
            errorVisible: false,
            pdfVisible: false,
            pdfType: "0",
            bindStateName: "",
            imageState: false,
            contentState: false,
            bindStateType: 0
        }
        this.delData = this.delData.bind(this);
        this.updateData = this.updateData.bind(this);
        this.flashData = this.flashData.bind(this);
        this.changeNum = this.changeNum.bind(this);
        this.errLogList = this.errLogList.bind(this);
        this.bindList = this.bindList.bind(this);
    }
    componentDidMount() {
        this.flashData(1, this.state.length);
    }

    flashData(page, limit) {
        let url = URI + "/data/batchList";
        let bitchData = {
            //"token": sessionStorage.getItem("token"),
            "curPage": page,
            "perPage": limit,
            "batchID": this.state.batchID,
            "table": this.state.table
        }
        // if (this.state.batchID != "") {
        //     bitchData.batchID = this.state.batchID;
        // }
        if (this.state.status != "") {
            bitchData.status = parseInt(this.state.status);
        }
        // if (this.state.table != "") {
        //     bitchData.table = this.state.table;
        // }
        getAJAX(url, bitchData, this.getData.bind(this));
    }
    getData(res) {
        if (res.msg === "OK") {
            //this.state.adminArr=[];
            let arr1 = [];
            let arr2 = [];
            let arr3 = [];
            let arr4 = [];
            let arr5 = [];
            res.data.map((item, index) => {
                arr1.push({
                    batchID: { value: item.batchID, visible: true },
                    uploadTime: { value: new Date(item.uploadTime).toLocaleString(), visible: true },
                    admin: { value: item.admin, visible: true },
                    source: { value: item.source, visible: true },
                    template: { value: item.template, visible: true },
                    report: { value: item.report, visible: true, errorState: true },
                    table: { value: item.table, visible: true },
                    status: { value: item.status === 1 ? "已归档" : "未归档", visible: true },
                    imagePages: { value: item.imagePages, visible: true, imageState: true },
                    contentPages: { value: item.contentPages, visible: true, contentState: true },
                    //, bindState: item.contentBinded === 1 ? "1" : "2" },
                    state: { visible: true }
                })
                arr2.push(item.batchID);
                arr3.push(item.table === "家谱" || item.table === "家谱影像" ? true : false);
                arr4.push(item.errorArr);
                arr5.push(item._key);
            })
            this.setState({
                batchArr: arr1,
                batchidArr: arr2,
                batchKeyArr: arr5,
                pageNum: res.pages,
                totalNum: res.totals,
                tableArr: arr3,
                length: this.state.length,
                current: this.state.current,
                errorBatchArr: arr4
            });
        }
    }

    updateData(key, index, type) {
        this.setState({
            key: key,
            index: index
        })
        if (type === "status") {
            this.setState({
                statusState: true
            })
        } else if (type === "photo") {
            this.setState({
                visible: true,
                bindStateName: this.state.batchArr[index].table.value
            })
        } else if (type === "pdf") {
            this.setState({
                pdfVisible: true
            })
        }
    }
    updateStatus(type) {
        let url = URI + "/data/batch";
        patchJSON(url, { batchID: this.state.key, status: type }, (response) => {
            if (response.data.msg === "OK") {
                message.success("更新状态成功");
                this.setState({
                    statusState: false,
                })
                this.flashData(this.state.current, this.state.length);
            } else {
                message.error("更新状态失败!")
            }
        })
    }
    //保存路径
    saveSourceDir() {
        let url = "";
        let bitchData = {};
        let msg = "";
        this.setState({
            loading: true
        })
        if (this.state.sourceDir !== "") {
            bitchData = {
                //"token": sessionStorage.getItem("token"),
                "iBatch": this.state.key,
                "sourceDir": this.state.sourceDir,
                "socketId": this.props.socket.id
            }
            if (this.state.bindStateName === "家谱") {
                bitchData.bindType = this.state.bindType;
                url = "http://192.168.1.101:8082/bindImage";
            } else {
                url = "http://192.168.1.101:8082/bindImageByBook";
            }
            // }
            getAJAX(url, bitchData, (res) => {
                if (res.msg === "OK") {
                    message.success("绑定影像文件开始");
                    this.setState({
                        visible: false,
                        sourceDir: "",
                        textDir: "",
                        loading: false,
                        current: 1,
                    });
                    this.flashData(this.state.current, this.state.length);
                } else {
                    message.error("绑定影像文件失败");
                    this.setState({
                        loading: false
                    });
                }
            })
        }
        if (this.state.textDir !== "") {
            bitchData = {
                //"token": sessionStorage.getItem("token"),
                "iBatch": this.state.key,
                "sourceDir": this.state.textDir,
                "socketId": this.props.socket.id
            }
            if (this.state.bindStateName === "家谱") {
                bitchData.bindType = this.state.bindType;
                url = "http://192.168.1.101:8082/bindDoc";
            } else {
                url = "http://192.168.1.101:8082/bindDocByBook";
            }
            getAJAX(url, bitchData, (res) => {
                if (res.msg === "OK") {
                    message.success("绑定全文开始");
                    this.setState({
                        visible: false,
                        sourceDir: "",
                        textDir: "",
                        loading: false,
                        current: 1
                    });
                    this.flashData(this.state.current, this.state.length);
                } else {
                    message.error("绑定全文失败");
                    this.setState({
                        loading: false
                    });
                }
            })
        }
        if (this.state.pedigreeDir !== "") {
            bitchData = {
                //"token": sessionStorage.getItem("token"),
                "iBatch": this.state.key,
                "sourceDir": this.state.pedigreeDir,
            }
            if (this.state.bindStateName === "家谱") {
                bitchData.socketId = this.props.socket.id;
                url = "http://192.168.1.101:8082/importPedigreeByCatalog";
            } else {
                url = "http://192.168.1.101:8082/importPedigree";
            }
            getAJAX(url, bitchData, (res) => {
                if (res.msg === "OK") {
                    if (this.state.bindStateName !== "家谱") {
                        message.success("上传谱系数据成功");
                    }else{
                        message.success("上传谱系数据开始");
                    }
                    this.setState({
                        visible: false,
                        sourceDir: "",
                        textDir: "",
                        pedigreeDir: "",
                        loading: false,
                        current: 1
                    });
                    this.flashData(this.state.current, this.state.length);
                } else {
                    message.error("上传谱系数据失败");
                    this.setState({
                        loading: false
                    });
                }
            })
        }
        // else if (this.state.sourceDir !== "" && this.state.textDir !== "") {
        //     bitchData = {
        //         //"token": sessionStorage.getItem("token"),
        //         "iBatch": this.state.key,
        //         "sourceDir": this.state.sourceDir,
        //         "socketId": this.props.socket.id
        //     }
        //     if (this.state.bindStateName === "家谱") {
        //         bitchData.bindType = this.state.bindType,
        //             url = "http://192.168.1.101:8082/bindImage";
        //     } else {
        //         url = "http://192.168.1.101:8082/bindImageByBook";
        //     }
        //     // }
        //     getAJAX(url, bitchData, (res) => {
        //         if (res.msg === "OK") {
        //             message.success("绑定影像文件开始");
        //             let docUrl = "http://192.168.1.101:8082/bindDoc";
        //             bitchData = {
        //                 //"token": sessionStorage.getItem("token"),
        //                 "iBatch": this.state.key,
        //                 "sourceDir": this.state.textDir,
        //                 "bindType": this.state.bindType,
        //                 "socketId": this.props.socket.id
        //             }
        //             // }
        //             getAJAX(docUrl, bitchData, (res) => {
        //                 if (res.msg === "OK") {
        //                     message.success("绑定全文开始");
        //                     this.setState({
        //                         visible: false,
        //                         sourceDir: "",
        //                         textDir: "",
        //                         pedigreeDir:"",
        //                         loading: false,
        //                         current: 1,
        //                     });
        //                     this.flashData(1, this.state.length);
        //                 } else {
        //                     message.error("绑定全文失败!");
        //                     this.setState({
        //                         loading: false,
        //                     });
        //                 }
        //             })
        //         } else {
        //             message.error("绑定影像文件失败");
        //             this.setState({
        //                 loading: false
        //             });
        //         }
        //     });
        // }

    }
    //搜索
    delData(key, index) {
        this.setState({
            key: key
        })
        let url = URI + "/data/batch";
        postJSON(url, { batchKey: this.state.batchKeyArr[index] }, (response) => {
            if (response.data.msg === "OK") {
                message.success("删除成功");
                this.setState({
                    statusState: false
                })
                this.flashData(this.state.current, this.state.length);
            } else {
                message.error("删除失败!")
            }
        })
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
    updateBind(type) {
        if (type === "image") {
            let url = URI + "/data/image/delBatch";
            postJSON(url, { batchID: this.state.key }, (response) => {
                if (response.data.msg === "OK") {
                    message.success("解除影像文件绑定成功");
                    this.setState({
                        visible: false,
                        sourceDir: "",
                        textDir: "",
                        pedigreeDir: "",
                        current: 1
                    });
                    this.flashData(1, this.state.length);
                } else {
                    message.error("解除影像文件绑定失败!")
                }
            })
        } else {
            let url = URI + "/data/content/delBatch";
            postJSON(url, { batchID: this.state.key }, (response) => {
                if (response.data.msg === "OK") {
                    message.success("解除全文绑定成功");
                    this.flashData(1, this.state.length);
                } else {
                    message.error("解除全文绑定失败!")
                }
            })
        }
    }
    uploadExcelData(e, bindState) {
        let obj = e.target
        if (obj.files.length === 0) {
            return;
        }
        let file = obj.files[0];
        //文件类型
        let arr = file.name.split(".");
        let fileType = arr[arr.length - 1];
        //如果是excel文件
        if (fileType === "xls" || fileType === "xlsx") {
            this.excelUpload(file, bindState)
        } else {
            message.error("请上传正确的文件格式");
        }
    }
    excelUpload(file, bindState) {
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
            url = URI + "/data/dataObject";
            postData = {
                "data": JSON.stringify(excelJson),
                "type": bindState,
                "batchID": that.state.key
            }
            // that.setState({
            //     loading: true
            // })
            postJSON(url, postData, (response) => {
                if (response.data.msg === "OK") {
                    message.success("上传" + bindState + "数据成功");
                    that.setState({
                        uploadValue1: "",
                        uploadValue2: ""
                    })
                } else {
                    message.error("上传失败!");
                    that.setState({
                        uploadValue1: "",
                        uploadValue2: ""
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
    fixdata(data) { //文件流转BinaryString
        var o = "",
            l = 0,
            w = 10240;
        for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
        return o;
    }
    //用户详情列表
    errLogList(key, index, current) {
        this.setState({
            errorVisible: true,
            key: key,
            index: index
        })
        let url = URI + "/data/errorList";
        let data = {
            //token: sessionStorage.getItem("token"),
            curPage: current,
            perPage: 10,
            batchID: key
        }
        getAJAX(url, data, (res) => {
            if (res.msg === "OK") {

                let arr = []
                if (res.data !== "") {
                    res.data.map((item, index) => {
                        arr.push({
                            key: item.id,
                            duplicateField: item.duplicateField,
                            value: item.value
                        })
                    })
                    this.setState({
                        errorArr: arr,
                        totals: res.totals,
                        pages: res.pages
                    })
                } else {
                    this.setState({
                        errorArr: [],
                        totals: 0,
                        pages: 0
                    })
                }
            }
        });
        //pdf转换
    }
    //用户详情列表
    bindList(key, index, current, type) {
        this.setState({
            bindVisible: true,
            key: key,
            index: index,
            bindStateType: type
        })
        let url = "";
        let data = {
            //token: sessionStorage.getItem("token"),
            curPage: current,
            perPage: 10,
            batchID: key
        }
        if (type === 0) {
            url = URI + "/data/imageErrorList";
        } else {
            url = URI + "/data/docErrorList";
        }
        getAJAX(url, data, (res) => {
            let arr = []
            if (res.msg === "OK" && JSON.stringify(res.data) !== "{}") {
                let maxNum = Math.max(res.data.successList.length, res.data.lackFileList.length, res.data.lackCatalogList.length);
                let maxArr = res.data.successList.length === maxNum
                    ? res.data.successList
                    : res.data.lackFileList.length === maxNum
                        ? res.data.lackFileList : res.data.lackCatalogList;

                maxArr.map((item, index) => {

                    arr.push({
                        key: res.data.successList[index] ? res.data.successList[index] : "",
                        lackFilekey: res.data.lackFileList[index] ? res.data.lackFileList[index] : "",
                        lackCatalogkey: res.data.lackCatalogList[index] ? res.data.lackCatalogList[index] : "",
                    })
                })
                this.setState({
                    bindArr: arr,
                    totals: res.totals,
                    pages: res.pages
                })
            } else {
                this.setState({
                    bindArr: [],
                    totals: 0,
                    pages: 0
                })
            }
        });


        //pdf转换
    }
    batchPdf2Png() {
        let { key, pdfType } = this.state;
        let pdfData = {
            iBatch: key,
            socketId: this.props.socket.id,
            fileType: this.state.pdfType
        }
        let url = "http://192.168.1.101:8082/batchPdf2Png";
        getAJAX(url, pdfData, (res) => {
            if (res.msg === "OK") {
                message.success("转换文件开始");
                this.setState({
                    pdfVisible: false,
                    pdfType: 0
                });
            } else {
                message.error(res.msg);
            }
        })
    }
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }
    render() {
        const that = this;
        return (
            <div>
                {this.props.type ? null : <Home chooseIndex="3" />}
                <div className={this.props.type ? null : "right-container"}>
                    <div className={this.props.type ? null : "admin-container"}>
                        <div className="admin-title">历史文件批次</div>
                        <div className="admin-div">
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>
                                    <Select style={{ minWidth: "200px" }} value={this.state.batchID === "" ? "请选择批次号" : this.state.batchID} onChange={(value) => { this.setState({ batchID: this.state.batchidArr[value] }); }}>
                                        {this.state.batchidArr.map((item, index) => {
                                            return (<Option value={index} key={index}>{item}</Option>)
                                        })
                                        }
                                    </Select>

                                    <Select style={{ marginLeft: "20px", minWidth: "200px" }} value={this.state.status === "" ? "请选择批次状态" : this.state.status} onChange={(value) => { this.setState({ status: value }); }}>
                                        <Option value="1">已归档</Option>
                                        <Option value="0">未归档</Option>
                                    </Select>
                                    <Select style={{ marginLeft: "10px", marginBottom: "20px", minWidth: "200px" }} value={this.state.table === "" ? "请选择类型" : this.state.table} placeholder="请选择" onChange={(value) => { this.setState({ table: value }) }}>
                                        {
                                            this.state.tableNameArr.map((item, index) => {
                                                return (<Option value={item} key={index}>{item}</Option>)
                                            })
                                        }
                                    </Select>
                                    <Button style={{ marginLeft: "10px", height: "32px", backgroundColor: "#6a5fac", color: "#fff" }} onClick={() => { this.state.current = 1; this.flashData(1, this.state.length) }}>搜索</Button>
                                    <Button style={{ marginLeft: "10px", height: "32px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.state.current = 1; this.state.batchID = ""; this.state.status = ""; this.flashData(1, this.state.length) }}>重置</Button>
                                </div>
                                <div>
                                    {/* <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#E0745B", color: "#fff" }}><Link to="/audios">影像文件</Link></Button> */}
                                </div>
                            </div>
                            <Tables arr={this.state.batchArr} clickItem={this.clickItem} tableArr={this.state.tableArr} arrName={this.state.batchNameArr} id={this.state.batchidArr} delData={this.delData} errLogList={this.errLogList} bindList={this.bindList} updateData={this.updateData} parentType="8" />
                            <Page page={this.state.current} totalNum={this.state.totalNum} pageNum={this.state.pageNum} flashData={this.flashData} changeNum={this.changeNum} />
                        </div>

                    </div>
                </div>


                <Modal maskClosable={false} title="关联影像" visible={this.state.visible} onOk={() => { this.saveSourceDir() }} onCancel={() => { this.setState({ visible: false, sourceDir: "", textDir: "", pedigreeDir: "", loading: false, bindType: 0 }) }}
                    bodyStyle={{ height: "330px" }} okText="确定" cancelText="取消">
                    <div>
                        {this.state.loading ? <div style={{ display: "flex", justifyContent: "center", position: "absolute", top: "20px", width: "100%", zIndex: "2" }}>
                            <Spin spinning={this.state.loading} size="large" />
                        </div> : null}
                        <div style={{ marginTop: "30px", display: "flex", justifyContent: "space-between" }}>
                            <Input disabled value={this.state.key} autoComplete="off" />
                        </div>

                        {/* <div style={{ marginTop: "20px" }}>
                            <Button style={{ height: "32px", backgroundColor: "#7A6FBE", color: "#fff" }}><Icon type="upload" />上传影像文件对应关系
                                    <input type="file" value={this.state.uploadValue1} className="file-button" onChange={(e) => { this.uploadExcelData(e, "影像") }} /></Button>
                            <Button style={{ height: "32px", backgroundColor: "#7A6FBE", color: "#fff", marginLeft: "10px" }}><Icon type="upload" />上传全文文件对应关系
                                    <input type="file" value={this.state.uploadValue2} className="file-button" onChange={(e) => { this.uploadExcelData(e, "全文") }} />   </Button>
                        </div> */}
                        <div style={{ marginTop: "20px" }}>
                            <Checkbox style={{ display: "flex", alignItems: "center", marginBottom: "10px" }} onChange={(e) => { this.setState({ bindType: e.target.checked ? 1 : 0 }) }}>是否有对应关系</Checkbox>
                        </div>
                        <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
                            <Input placeholder="请输入影像文件路径" value={this.state.sourceDir} name="sourceDir" onChange={(e) => { this.inputChange(e) }} autoComplete="off" />
                        </div>

                        <div style={{ marginTop: "30px", display: "flex", justifyContent: "space-between" }}>
                            <Input placeholder="请输入全文路径" value={this.state.textDir} name="textDir" onChange={(e) => { this.inputChange(e) }} autoComplete="off" />
                        </div>
                        <div style={{ marginTop: "30px", display: "flex", justifyContent: "space-between" }}>
                            <Input placeholder="请输入谱系数据路径" value={this.state.pedigreeDir} name="pedigreeDir" onChange={(e) => { this.inputChange(e) }} autoComplete="off" />
                        </div>
                    </div>
                </Modal>

                <Modal maskClosable={false} title="修改状态" footer={null} visible={this.state.statusState} onCancel={() => { this.setState({ statusState: false }) }}
                    bodyStyle={{ height: "100px" }} okText="确定" cancelText="取消">
                    <Button style={{ height: "32px", backgroundColor: "#6a5fac", color: "#fff" }} onClick={() => { this.updateStatus(0) }}>未归档</Button>
                    <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#22BAA0", color: "#fff" }} onClick={() => { this.updateStatus(1) }}>已归档</Button>
                    {this.state.tableArr[this.state.index] ? <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#12AFCB", color: "#fff" }} onClick={() => { this.updateBind("image") }}>解除影像文件绑定</Button> : null}
                    {this.state.tableArr[this.state.index] ? <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#E0745B", color: "#fff" }} onClick={() => { this.updateBind("content") }}>解除全文绑定</Button> : null}
                </Modal>

                <Modal maskClosable={false} title="错误日志" footer={null} visible={this.state.errorVisible} onCancel={() => { this.setState({ errorVisible: false }) }}
                >
                    <Table dataSource={that.state.errorArr} columns={that.state.errorNameArr}
                        pagination={{  //分页
                            total: that.state.totals, //数据总数量
                            defaultPageSize: 10, //默认显示几条一页                                 
                            onChange(current) {  //点击改变页数的选项时调用函数，current:将要跳转的页数
                                that.errLogList(that.state.key, that.state.index, current);
                            },
                            showTotal: function () {  //设置显示一共几条数据                                     
                                return '共 ' + that.state.totals + ' 条数据';
                            }
                        }}
                    />
                </Modal>
                <Modal maskClosable={false} title="绑定日志" footer={null} visible={this.state.bindVisible} onCancel={() => { this.setState({ bindVisible: false }) }}
                >
                    <Table dataSource={that.state.bindArr} columns={that.state.bindNameArr}
                        pagination={{  //分页
                            total: that.state.totals, //数据总数量
                            defaultPageSize: 10, //默认显示几条一页                                 
                            onChange(current) {  //点击改变页数的选项时调用函数，current:将要跳转的页数
                                that.bindList(that.state.key, that.state.index, current, that.state.bindStateType);
                            },
                            showTotal: function () {  //设置显示一共几条数据                                     
                                return '共 ' + that.state.totals + ' 条数据';
                            }
                        }}
                    />
                </Modal>
                <Modal maskClosable={false} title="修改状态" footer={null} visible={this.state.statusState} onCancel={() => { this.setState({ statusState: false }) }}
                    bodyStyle={{ height: "100px" }} okText="确定" cancelText="取消">
                    <Button style={{ height: "32px", backgroundColor: "#6a5fac", color: "#fff" }} onClick={() => { this.updateStatus(0) }}>未归档</Button>
                    <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#22BAA0", color: "#fff" }} onClick={() => { this.updateStatus(1) }}>已归档</Button>
                    {this.state.tableArr[this.state.index] ? <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#12AFCB", color: "#fff" }} onClick={() => { this.updateBind("image") }}>解除影像文件绑定</Button> : null}
                    {this.state.tableArr[this.state.index] ? <Button style={{ height: "32px", marginLeft: "10px", backgroundColor: "#E0745B", color: "#fff" }} onClick={() => { this.updateBind("content") }}>解除全文绑定</Button> : null}
                </Modal>

                <Modal maskClosable={false} title="pdf转换" visible={this.state.pdfVisible} onOk={() => { this.batchPdf2Png() }} onCancel={() => { this.setState({ pdfVisible: false }) }}
                >
                    <RadioGroup onChange={(e) => { this.setState({ pdfType: e.target.value }) }} value={this.state.pdfType}>
                        <Radio value="0">转换影像pdf</Radio>
                        <Radio value="1">转换全文pdf</Radio>
                    </RadioGroup>
                </Modal>
            </div>
        )
    }
}
export default socketConnect(BatchHistory)