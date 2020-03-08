import React, { Component } from 'react';
import { Input, Button, DatePicker, message, Modal, Select, Icon } from 'antd';
import { postJSON, patchJSON, getAJAX } from '../ADS.js';
import { URI } from '../../data/data.js';
import Table from '../common/table/table';
import Home from '../home/home';
import './dataTable.css';
import XLSX from 'xlsx';
const Option = Select.Option;
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            table: "方志",
            tableArr: ["方志", "家谱", "名人", "著述", "姓氏", "家谱目录"],
            dataTableNameArr: [],
            dataTableArr: [],
            type: "数据模板",
            filePath: "",
            tableObj: {},
            updateValue: ""
        }
    }
    componentDidMount() {
        if (this.props.location.query && this.props.location.query.id) {
            this.state.type = this.props.location.query.id == 0 ? "数据资源" : "数据模板";
            sessionStorage.setItem("type", this.state.type);
        } else {
            this.state.type = sessionStorage.getItem("type");
        }
        this.flashData(this.state.table, this.state.type);
    }
    flashData(table, type) {
        this.setState({
            table: table
        })
        let url = "";
        if (this.state.type === "数据资源") {
            url = URI + "/dict/list";
        } else {
            url = URI + "/dict/tableTemplate"
        }
        let importData = {
            //"token": sessionStorage.getItem("token"),
            "dictType": this.state.type,
            "table": table,
        }
        getAJAX(url, importData, this.getData.bind(this))
    }
    getData(res) {
        if (res.msg === "OK") {
            //this.state.adminArr=[];
            let arr1 = [];
            let arr2 = [];
            if (this.state.type === "数据资源") {
                // arr1.push({
                //     dictType: { value: "dictType", visible: true },
                //     table: { value: "table", visible: true },
                //     fieldName: { value: "fieldName", visible: true },
                //     displayFrontEnd: { value: "displayFrontEnd", visible: true },
                //     displayName: { value: "displayName", visible: true },
                //     referenceName: { value: "referenceName", visible: true },
                //     sampleData: { value: "sampleData", visible: true },
                //     firstAppear: { value: "firstAppear", visible: true }
                // });
                res.result.map((item, index) => {
                    arr1.push({
                        dictType: { value: item.dictType, visible: true },
                        table: { value: item.table, visible: true },
                        fieldName: { value: item.fieldName, visible: true },
                        displayFrontEnd: { value: item.displayFrontEnd, visible: true },
                        displayName: { value: item.displayName, visible: true },
                        referenceName: { value: item.referenceName, visible: true },
                        sampleData: { value: item.sampleData, visible: true },
                        firstAppear: { value: item.firstAppear, visible: true },
                    })
                    if (this.state.table == "家谱") {
                        arr1[index].sortField = { value: item.sortField, visible: true };
                        arr1[index].searchField = { value: item.searchField, visible: true };
                    }
                    arr1[index].duplicate = { value: item.duplicate, visible: true };
                })
                if (this.state.table == "家谱") {
                    arr2 = ["类型", "数据表", "数据字段名", "前台显示", "前台显示名", "类似字段名", "样本数据", "首次发现", "是否支持排序", "是否支持检索", "是否作为查重字段"]
                } else {
                    arr2 = ["类型", "数据表", "数据字段名", "前台显示", "前台显示名", "类似字段名", "样本数据", "首次发现", "是否作为查重字段"]
                }
            } else {
                // arr1.push({
                //     dictType: { value: "dictType", visible: true },
                //     sample: { value: "sample", visible: true },
                //     columnName: { value: "columnName", visible: true },
                //     field: { value: "field", visible: true },
                //     table: { value: "table", visible: true },
                // });
                res.result.map((item, index) => {
                    arr1.push({
                        dictType: { value: item.dictType, visible: true },
                        sample: { value: item.sample, visible: true },
                        columnName: { value: item.columnName, visible: true },
                        field: { value: item.field, visible: true },
                        table: { value: item.table, visible: true },
                    })
                })
                arr2 = ["类型", "样本文件", "源文件列名", "对应数据字段", "对应数据表"]
            }
            this.setState({
                dataTableArr: arr1,
                dataTableNameArr: arr2,
                updateValue: ""
            });
        }
    }
    downloadFile() {
        let url = "http://192.168.1.101:8082/data/excel"
        let dataTable = {
            //"token": sessionStorage.getItem("token"),
            "dictType": this.state.type
        }
        getAJAX(url, dataTable, (res) => {
            if (res.msg === "导出成功") {
                this.setState({
                    filePath: "http://192.168.1.101:8082/" + res.filePath
                })
            }
        })
    }
    uploadData(e, type) {

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
            this.excelUpload(file, type)
        }
        //如果是xml文件
        else if (fileType === "xml") {
            this.xmlUpload(file)
        }
    }
    excelUpload(file, type) {
        let [that, url, postData, wb, rABS, reader] = [this, "", {}, "", false, new FileReader];
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
            let excelJson = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);;
            let catalogs = []
            //解析数据模板
            if (type === "数据模板") {
                excelJson.splice(0, 1);
                url = URI + "/dict/template";
                let arr1 = [];
                let arr2 = [];
                let num1 = 0;
                let num2 = 0;
                if (excelJson.some((item, index) => { return item["类别"] !== "数据模板" })) {
                    message.error("请上传正确的数据模板文件");
                    return;
                }
                if (excelJson.some((item, index) => { return !item["类别"] || !item["样本文件"] || !item["源文件列名"] || !item["对应数据字段"] || !item["对应数据表"] })) {
                    message.error("请检查是否存在空数据");
                    return;
                }

                // if (excelJson.some((item, index) => {
                //     if (Object.keys(that.state.tableObj).indexOf(item["对应数据表"]) === -1) {
                //         message.error("请检查数据表与数据资源中匹配" + item["对应数据表"]);
                //         return true
                //     };
                // })) {
                //     //message.error("请检查数据表与数据资源中匹配");
                //     return;
                // }

                // if (excelJson.some((item, index) => {
                //     if (that.state.tableObj[item["对应数据表"]].indexOf(item["对应数据字段"]) === -1) {
                //         message.error("请检查数据字段与数据资源中匹配" + item["对应数据字段"]);
                //         return true
                //     };
                // })) {
                //     return;
                // }
                excelJson.map((item, index) => {
                    //判断上传的文件是否正确
                    if (item["对应数据表"] === "家谱") {
                        arr1.push(item["样本文件"]);
                    }
                    if (item["对应数据表"] === "家谱" && item["对应数据字段"] === "GID") {
                        num1++
                    }
                    if (item["对应数据表"] === "家谱" && item["对应数据字段"] === "genealogyName") {
                        num2++
                    }

                    arr2.push(item["对应数据表"])
                    catalogs.push(
                        {
                            dictType: item["类别"],
                            sample: item["样本文件"],
                            columnName: item["源文件列名"],
                            field: item["对应数据字段"],
                            table: item["对应数据表"]
                        }
                    )
                })
                if (num1 !== that.getArrNum(arr1).length) {
                    message.error("家谱模板中若无GID则无法绑定影像文件");
                }
                if (num2 !== that.getArrNum(arr1).length) {
                    message.error("模板存在错误,家谱模板中genealogyName必须存在");
                    return;
                }
                postData = { "data": JSON.stringify(catalogs) }
                //解析数据资源
            } else {
                excelJson.splice(0, 1);
                url = URI + "/dict/fieldDict";
                if (excelJson.some((item, index) => { return item["类别"] !== "数据资源" })) {
                    message.error("请上传正确的数据资源文件");
                    return;
                }
                if (excelJson.some((item, index) => { return !item["类别"] || !item["数据表"] || !item["数据字段名"] || !item["前台显示名"] })) {
                    message.error("请检查是否存在空数据");
                    return;
                }
                if (excelJson.some((item, index) => {
                    return item["数据表"] == "家谱" && isNaN(parseInt(item["是否支持排序"])) || item["数据表"] == "家谱" && isNaN(parseInt(item["是否支持检索"]))
                })) {
                    message.error("家谱中必须规定排序和检索");
                    return;
                }
                //dictType	table	fieldName	displayFrontEnd	displayName

                excelJson.map((item, index) => {
                    catalogs.push(
                        {
                            dictType: item["类别"],
                            table: item["数据表"],
                            fieldName: item["数据字段名"],
                            displayFrontEnd: item["前台显示"] === "1" ? item["前台显示"] : "0",
                            displayName: item["前台显示名"],
                            referenceName: item["类似字段名"] ? item["类似字段名"] : "",
                            sampleData: item["样本数据"] ? item["样本数据"] : "",
                            firstAppear: item["首次发现"] ? item["首次发现"] : "",
                            sortField: item["是否支持排序"] ? item["是否支持排序"] : "",
                            searchField: item["是否支持检索"] ? item["是否支持检索"] : "",
                            duplicate: item["是否作为查重字段"] ? item["是否作为查重字段"] : "",
                        }
                    )
                })
                postData = { "data": JSON.stringify(catalogs) }
            }
            postJSON(url, postData, (response) => {
                if (response.data.msg === "OK") {
                    if (type === "数据资源") {
                        message.success("上传数据资源成功!");
                    } else {
                        message.success("上传数据模板成功!");
                    }
                    that.flashData(that.state.table, type);
                } else {
                    message.error("上传失败!");

                }
            })
        };
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
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }
    render() {
        return (
            <div>
                <Home chooseIndex="3" />
                <div className="right-container">
                    <div className="admin-container">
                        <div className="admin-title" style={{ display: "flex", justifyContent: "space-between" }}>
                            {this.state.table} {this.state.type === "数据资源" ? "元数据定义" : "数据模板"}
                            <div style={{ marginRight: "20px" }}>
                                <Button style={{ marginLeft: "10px", height: "32px", backgroundColor: "#6a5fac", color: "#fff", border: "0" }} onClick={() => { this.downloadFile() }}><Icon type="file-excel" />下载全部{this.state.type === "数据资源" ? "元数据定义" : "数据模板"}</Button>
                                {this.state.filePath !== "" ? <a href={this.state.filePath} style={{ marginLeft: "10px", marginRight: "10px", color: "#fff" }}>{this.state.type === "数据资源" ? "元数据定义" : "数据模板"}.xlsx</a> : null}

                                <Button style={{ height: "32px", backgroundColor: "#E0745B", color: "#fff", marginLeft: "10px", border: "0" }}><Icon type="file-excel" />上传更新
                                    <input type="file" value={this.state.updateValue} className="file-button" onChange={(e) => { this.uploadData(e, this.state.type) }} />
                                </Button>
                            </div>
                        </div>
                        <div className="admin-div">
                            <Select value={this.state.table} style={{ minWidth: "200px" }} onChange={(value) => { this.flashData(value) }}>
                                {this.state.tableArr.map((item, index) => {
                                    return (<Option value={item} key={index}>{item}</Option>)
                                })
                                }
                            </Select>
                            <Table arr={this.state.dataTableArr} arrName={this.state.dataTableNameArr} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default DataTable