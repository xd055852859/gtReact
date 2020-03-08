import React, { Component } from 'react';
import { Icon, Button, Select, Upload, message, Table, Spin, Modal } from 'antd';
import { postJSON, getAJAX } from '../ADS.js';
import { Link } from 'react-router-dom';
import { URI } from '../../data/data.js';
import Home from '../home/home';
import xtjson from '../../data/xml2json.js'
import './importData.css';
import XLSX from 'xlsx';
const Option = Select.Option;



class ImportData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: [{
                title: '源文件列名',
                dataIndex: 'columnName',
                key: 'columnName',
                width: "13%"
            }, {
                title: '前台显示',
                dataIndex: 'displayFrontEnd',
                key: 'displayFrontEnd',
                width: "13%"
            }, {
                title: '前台显示名',
                dataIndex: 'displayName',
                key: 'displayName',
                width: "13%"
            },
            {
                title: '数据字段名',
                dataIndex: 'field',
                key: 'field',
                width: "13%"
            },
            {
                title: '类似字段名',
                dataIndex: 'referenceName',
                key: 'referenceName',
                width: "13%"
            },
            {
                title: '样本文件',
                dataIndex: 'sample',
                key: 'sample',
                width: "13%"
            },
            {
                title: '参考数据',
                dataIndex: 'sampleData',
                key: 'sampleData',
                width: "13%"
            }],

            num: 0,
            tableData: [],
            dictTypeArr: [],
            value: "",
            tableArr: ["方志", "家谱", "名人", "著述", "姓氏", "家谱目录", "置标数据"],
            loading: false,
            tableObj: {},
            tableNum: 0,
            table: "方志",
            genealogyName: "",
            GID: "",
            marcArr: [],
            marcState: false,
            visible: false,
            updateValue: "",
            errorContent: ""
        }
    }
    componentDidMount() {
        if (sessionStorage.getItem("tableId")) {
            this.state.table = this.state.tableArr[parseInt(sessionStorage.getItem("tableId"), 10)];
        }
        //this.state.table = "家谱";       
        this.getList(this.state.table);
    }
    getList(table) {
        let url = URI + "/dict/list";
        let importData = {
            //"token": sessionStorage.getItem("token"),
            "dictType": "数据模板",
            "table": table,
        }
        getAJAX(url, importData, (res) => {
            if (res.result && res.result.length > 0) {
                this.changeTable(res.result[0]);
                this.setState({
                    dictTypeArr: res.result,
                    value: res.result[0]
                })
            }
        });
    }
    uploadData(e, num) {
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
            this.excelUpload(file, num)
        }
        //如果是xml文件
        else if (fileType === "xml") {
            this.xmlUpload(file)
        } else {
            message.error("请上传正确的文件格式");
            return;
        }
    }
    excelUpload(file, num) {
        let [that, url, postData, wb, rABS, reader] = [this, "", {}, "", false, new FileReader];
        //postData 请求参数 wb 读取完成的数据 rABS 是否将文件读取为二进制字符串
        that.setState({
            loading: true
        })
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
            //解码方式1 纵向和横向混杂
            if (that.state.table === "姓氏" && num === 0) {
                wb.SheetNames.map((item, index) => {
                    let [newKey, newValue, newObj, newArr, innerArr] = ["", "", {}, [], []];
                    let sheetArrIndex = 0;
                    var sheetArr = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[index]]);
                    sheetArr.forEach((obj, i) => {
                        if (obj["姓氏名称"] == "来源编号") {
                            sheetArrIndex = i
                        }
                    });
                    sheetArr.map((obj, i) => {
                        if (i < sheetArrIndex) {
                            for (var key in obj) {
                                if (key === "姓氏名称") {
                                    newKey = obj[key] ? obj[key] : "";
                                }
                                if (key !== "姓氏名称" && key.indexOf("__") === -1) {
                                    newValue = obj[key];
                                    newObj["姓氏名称"] = key;
                                } else {
                                    newValue = "";
                                }
                                newObj[newKey] = newValue;
                            }
                        } else if (i > sheetArrIndex) {
                            var innerObj = {};
                            for (var key in sheetArr[sheetArrIndex]) {
                                innerObj[sheetArr[sheetArrIndex][key]] = obj[key] ? obj[key] : ""
                            }
                            innerArr.push(innerObj);
                        }
                    })
                    newObj["来源"] = innerArr;
                    excelJson.push(newObj);
                    catalogs = excelJson;
                })
            } else {
                excelJson = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                if (that.state.table === "家谱") {
                    message.success("若无GID,则无法绑定影像文件");
                    if (Object.keys(excelJson[0]).indexOf(that.state.genealogyName) === -1) {
                        message.error("请检测上传数据中的genealogyName与数据模板是否对应");
                        return;
                    }
                    if (Object.keys(excelJson[0]).indexOf(that.state.GID) === -1) {
                        message.error("请检测上传数据中的GID与数据模板是否对应");
                        return;
                    }
                }
                excelJson.map((item, index) => {
                    catalogs[index] = {};
                    for (let strKey in item) {
                        catalogs[index][strKey] = item[strKey].replace(/\r\r\n/g, ",")
                    }
                })
            }
            url = URI + "/data";
            postData = {
                "source": file.name,
                "adminId": sessionStorage.getItem("userId"),
                "templateName": that.state.value,
                "data": { "catalogs": JSON.stringify(catalogs) },
                "table": that.state.table
            }
            postJSON(url, postData, (response) => {
                if (response.data.msg === "OK") {
                    message.success("上传" + that.state.table + "数据成功");
                } else {
                    if (response.data.statusCode === "701") {
                        message.error("所有数据均重复");
                    } else {
                        message.error(response.data.msg);
                    }
                }
                that.setState({
                    loading: false,
                    updateValue: ""
                })
            })
        }
        if (rABS) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsBinaryString(file);
        }
    }
    xmlUpload(file) {
        let that = this;

        const reader = new FileReader()
        reader.onload = function (e) {
            var result = e.target.result.replace(/\r\n/g, "");
            var xtj = new xtjson();
            var content = xtj.xml_str2json(result);
            let catalogs = [];
            for (let i in content) {
                for (let j in content[i]) {
                    catalogs = content[i][j]
                }
            }
            let url = URI + "/data";
            postJSON(url, {
                "source": file.name,
                "adminId": sessionStorage.getItem("userId"),
                "templateName": that.state.value,
                "data": { "catalogs": JSON.stringify(catalogs) },
                "table": that.state.table
            }, (response) => {
                if (response.data.msg === "OK") {
                    message.success("上传成功!")
                } else {
                    if (response.data.statusCode === "701") {
                        message.error("上传失败,所有数据均重复");
                    } else {
                        message.error(response.data.msg);
                    }
                    message.error(response.data.msg);
                }
            })
        }
        reader.readAsText(file)

    }
    fixdata(data) { //文件流转BinaryString
        var o = "",
            l = 0,
            w = 10240;
        for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
        return o;
    }

    changeTable(value) {
        this.state.value = value;
        this.setState({
            value: this.state.value
        })
        let url = URI + "/dict/templateDetail";
        let dictypeData = {
            //"token": sessionStorage.getItem("token"),
            "templateName": this.state.value
        }
        getAJAX(url, dictypeData, this.getData.bind(this))
    }

    getData(res) {
        this.state.marcArr = []
        this.state.tableData = [];
        this.state.GID = "";
        this.state.genealogyName = "";
        res.result.map((item, index) => {
            item.displayFrontEnd = item.displayFrontEnd === "0" ? "不显示" : "显示";
            item.field === "GID" ? this.state.GID = item.columnName : null;
            item.field === "genealogyName" ? this.state.genealogyName = item.columnName : null
            item.columnName.indexOf("$") !== -1 ? this.state.marcArr.push(true) : this.state.marcArr.push(false);
            this.state.tableData[index] = item;
            this.state.tableData[index].width = "13%";
            this.state.tableData[index].key = index;
        })

        this.state.marcState = this.state.marcArr.indexOf(true) !== -1 ? true : false
        this.setState({
            columns: this.state.columns,
            tableData: this.state.tableData,
            tableNum: 2,
            loading: false,
            GID: this.state.GID,
            genealogyName: this.state.genealogyName,
            marcState: this.state.marcState
        })
    }
    uploadFile(info) {
        if (info.file.name.split(".")[1] === "iso" || info.file.name.split(".")[1] === "mdb") {
            this.setState({
                loading: true
            })
            if (info.file.status === 'done') {
                let url = URI + "/data";
                let postData = {
                    "source": info.file.name,
                    "adminId": sessionStorage.getItem("userId"),
                    "templateName": this.state.value,
                    "data": info.file.response.filePath,
                    "table": this.state.table
                }
                postJSON(url, postData, (response) => {
                    if (response.data.msg === "OK") {
                        message.success("上传用户数据成功");
                        this.setState({
                            loading: false
                        })

                    } else {
                        if (response.data.statusCode === "701") {
                            message.error("所有数据均重复");
                        } else {
                            message.error(response.data.msg);
                        }
                        this.setState({
                            loading: false
                        })
                    }
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
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }
    render() {
        const prop = {
            name: 'file',
            action: URI + "/upload",
            headers: {
                authorization: 'authorization-text',
            }
        };
        return (
            <div>
                <Home chooseIndex="3" />
                <div className="right-container">
                    <div className="admin-container">
                        <div className="admin-title">数据批量导入</div>
                        {this.state.loading ? <div style={{ display: "flex", justifyContent: "center", position: "absolute", top: "20px", width: "100%", zIndex: "2" }}>
                            <Spin spinning={this.state.loading} size="large" />
                        </div> : null}
                        <div className="admin-div">
                            {/* <div style={{ display: "flex", lineHeight: "32px", textalign: "center", marginBottom: "30px" }}>
                               
                            </div> */}
                            <div>
                                {this.state.dictTypeArr.length > 0 ?
                                    <div className="file-box">
                                        <div style={{ display: "flex", justifyContent: "space-between", overflow: "auto" }}>
                                            <div>
                                                <Select style={{ marginBottom: "20px", minWidth: "200px" }} value={this.state.table} placeholder="请选择" onChange={(value) => { this.setState({ table: value }); this.getList(value) }}>
                                                    {
                                                        this.state.tableArr.map((item, index) => {
                                                            return (<Option value={item} key={index}>{item}</Option>)
                                                        })
                                                    }
                                                </Select>

                                                <Select style={{ marginLeft: "10px", marginBottom: "20px", minWidth: "200px" }} value={this.state.value} placeholder="请选择" onChange={(value) => { this.changeTable(value) }}>
                                                    {
                                                        this.state.dictTypeArr.map((item, index) => {
                                                            return (<Option value={item} key={index}>{item}</Option>)
                                                        })
                                                    }
                                                </Select>
                                                {this.state.table === "姓氏" ?
                                                    <React.Fragment>
                                                        <Button style={{ height: "32px", backgroundColor: "#E0745B", color: "#fff", marginLeft: "10px" }}><Icon type="upload" />上传竖版excel或xml数据
                                                            <input type="file" className="file-button" value={this.state.updateValue} onChange={(e) => { this.uploadData(e, 0) }} />
                                                        </Button>
                                                        <Button style={{ height: "32px", backgroundColor: "#E0745B", color: "#fff", marginLeft: "10px" }}><Icon type="upload" />上传横版excel或xml数据
                                                            <input type="file" className="file-button" value={this.state.updateValue} onChange={(e) => { this.uploadData(e, 1) }} />
                                                        </Button>
                                                    </React.Fragment> :
                                                    <Button style={{ height: "32px", backgroundColor: "#E0745B", color: "#fff", marginLeft: "10px" }}><Icon type="upload" />上传excel或xml数据
                                                        <input type="file" className="file-button" value={this.state.updateValue} onChange={(e) => { this.uploadData(e) }} />
                                                    </Button>
                                                }


                                                {this.state.table === "家谱" && this.state.marcState ?
                                                    <Upload {...prop} onChange={(info) => { this.uploadFile(info) }} showUploadList={false}>
                                                        <Button style={{ height: "32px", backgroundColor: "#E0745B", color: "#fff", marginLeft: "10px" }}>
                                                            <Icon type="upload" /> 上传marc数据
                                                    </Button>
                                                    </Upload> : null}
                                                {this.state.table === "家谱目录" ?
                                                    <Upload {...prop} onChange={(info) => { this.uploadFile(info) }} showUploadList={false}>
                                                        <Button style={{ height: "32px", backgroundColor: "#E0745B", color: "#fff", marginLeft: "10px" }}>
                                                            <Icon type="upload" /> 上传mdb数据
                                                    </Button>
                                                    </Upload> : null}
                                            </div>
                                            <Button style={{ height: "32px", backgroundColor: "#3B5998", color: "#fff", marginLeft: "10px" }}>
                                                <Link to="/batchHistory">批次管理</Link>
                                            </Button>
                                        </div>
                                        <Table dataSource={this.state.tableData} pagination={false} scroll={{ y: 820 }} columns={this.state.columns} style={{ width: "100%" }} />
                                    </div>
                                    : ""}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default ImportData