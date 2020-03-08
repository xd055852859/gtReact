import React, { Component } from 'react';
import { Icon, Button, DatePicker, Row, Col, Tooltip, Tabs, Select, Input, Cascader } from 'antd';
import { Map, Marker, Markers } from 'react-amap';
import { Link } from 'react-router-dom';
import { ChartCard, Field, MiniArea, Bar, } from 'ant-design-pro/lib/Charts';
import { getAJAX } from '../ADS.js';
import { URI } from '../../data/data.js';
import { citys } from '../../data/city.js';
import NumberInfo from 'ant-design-pro/lib/NumberInfo';
import Page from '../common/page/page';
import Table from '../common/table/table';
import Home from '../home/home';
import BatchHistory from '../batchHistory/batchHistory';
import numeral from 'numeral';
import moment from 'moment';
import './report.css';
const { RangePicker } = DatePicker;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
let cityArr = [];
for (let i = 0; i < citys.length; i++) {
    cityArr[i] = {}
    cityArr[i].value = citys[i].provinceName.replace("省", "");
    cityArr[i].label = citys[i].provinceName;
    cityArr[i].children = [];
    for (let j = 0; j < citys[i].children.length; j++) {
        cityArr[i].children.push({
            value: citys[i].children[j].citysName.replace("市", ""),
            label: citys[i].children[j].citysName,
        })
    }
}
const markerStyle = {
    padding: '5px',
    border: '1px solid #ddd',
    background: '#fff',
};
class Report extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginArray: [],
            logArray: [],
            searchArray: [],
            loginNum: 0,
            logNum: 0,
            searchNum: 0,
            num: 0,//今日访问量
            num1: 0,
            num2: 0,//今日登录量
            startTime: new Date().setHours(0, 0, 0, 0) - 86400 * 1000 * 8,
            endTime: new Date().setHours(0, 0, 0, 0) + 86400 * 1000 * 2,
            keyword: "",
            tableKey: "0",
            resource: [
                { resourceId: "3", resourceName: "姓氏" },
                { resourceId: "4", resourceName: "名人" },
                { resourceId: "5", resourceName: "家谱" },
                { resourceId: "6", resourceName: "方志" },
                { resourceId: "7", resourceName: "著述" },
                { resourceId: "8", resourceName: "新闻" },
                { resourceId: "9", resourceName: "百科" },
                { resourceId: "10", resourceName: "咨询" },
            ],
            resourceName: "",
            resourceNameArr: ["序号", "资源名称", "资源类型", "访问数量", "阅读总页数"],
            resourceArr: [],
            resourceidArr: [],
            totalPageNum: 0,
            totalReadNum: 0,
            keyword: "",
            tableArr: [, "全部", "方志", "家谱", "名人", "著述", "姓氏", "家谱目录", "置标数据", "谱系数据", "家谱影像"],
            table: "全部",
            reportArr: [],
            reportNum: 0,
            reportAllNum: 0,
            userIpArr: [],
            current: 1,
            region: "",
            city: ""
        }
        this.flashData = this.flashData.bind(this);
        this.changeNum = this.changeNum.bind(this);
    }
    componentDidMount() {
        this.flashData(1, this.state.tableKey);
        //新的一天 86400
    }
    flashData(page, type) {
        let url = ""; let reportData = {};
        if (isNaN(this.state.startTime)) {
            this.state.startTime = "";
        }
        if (isNaN(this.state.endTime)) {
            this.state.endTime = "";
        }
        if (type === "1") {
            url = URI + "/account/uploadData/Num";
            if (this.state.table === "全部") {
                this.state.table = ""
            }
            reportData = {
                startTime: this.state.startTime,
                endTime: this.state.endTime,
                table: this.state.table
            }
        }
        else if (type === "3") {

            url = URI + "/account/userMap";
            reportData = {
                startTime: this.state.startTime,
                endTime: this.state.endTime,
                region: this.state.region,
                city: this.state.city

            }
        }
        else {
            url = URI + "/account/logList";
            reportData = {
                pageType: type,
                type: this.state.resourceName,
                startTime: this.state.startTime,
                endTime: this.state.endTime,
                keyWord: this.state.keyword
            }
        }
        getAJAX(url, reportData, this.getData.bind(this));
    }
    getData(res) {
        let that = this;
        if (res.msg === "OK") {
            let [arr1, arr2, arr3, num1, num2, num3, num4, num5, num6] = [[], [], [], 0, 0, 0, 0, 0, 0];
            if (this.state.tableKey === "0") {
                res.data.map((item, index) => {
                    // if()
                    arr1.push(
                        moment(new Date(item.createTime)).format('YYYY-MM-DD')
                    );
                    if (item.type === "登录") {
                        num2++;
                        arr2.push(
                            moment(new Date(item.createTime)).format('YYYY-MM-DD'),
                        );
                        //今日登录量
                        if (item.createTime > new Date().setHours(0, 0, 0, 0) - 1 && item.createTime <= (new Date().setHours(0, 0, 0, 0) + 86400 * 1000)) {
                            num4++;
                        }
                        //昨日登录量
                        if (item.createTime > (new Date().setHours(0, 0, 0, 0) - 86401 * 1000) && item.createTime <= (new Date().setHours(0, 0, 0, 0) - 1)) {
                            num5++;
                        }
                    } else if (item.type === "家谱检索") {
                        num6++
                        arr3.push(
                            moment(new Date(item.createTime)).format('YYYY-MM-DD'),
                        );
                    }
                    //今日访问量
                    if (item.createTime > new Date().setHours(0, 0, 0, 0) - 1 && item.createTime <= (new Date().setHours(0, 0, 0, 0) + 86400 * 1000)) {
                        num1++;
                    }
                    //昨日访问量
                    if (item.createTime > (new Date().setHours(0, 0, 0, 0) - 86401 * 1000) && item.createTime <= (new Date().setHours(0, 0, 0, 0) - 1)) {
                        num3++;
                    }
                })
                this.setState({
                    logArray: this.getArrNum(arr1),
                    loginArray: this.getArrNum(arr2),
                    logNum: res.data.length,
                    loginNum: num2,
                    searchArray: this.getArrNum(arr3),
                    searchNum: num6,
                    num: num1,
                    num1: num1 - num3,
                    num2: num4
                });
            } else if (this.state.tableKey === "1") {
                res.data.map((item, index) => {
                    arr1.push(
                        { x: moment(new Date(item.uploadTime)).format('YYYY-MM-DD'), y: item.uploadNum }
                    );
                    if (item.uploadTime > new Date().setHours(0, 0, 0, 0) - 1 && item.uploadTime <= (new Date().setHours(0, 0, 0, 0) + 86400 * 1000)) {
                        num2 = num2 + (item.uploadNum ? item.uploadNum : 0)
                    }
                })
                if (this.state.table === "") {
                    this.state.table = "全部";
                }
                this.setState({
                    reportArr: this.getArrNum(arr1, 1),
                    reportAllNum: res.total,
                    reportNum: num2,
                    table: this.state.table
                });
            } else if (this.state.tableKey === "2") {
                res.data.map((item, index) => {
                    arr1.push({
                        id: { value: index + 1, visible: true },
                        hallName: { value: item.hallName, visible: true },
                        type: { value: item.type, visible: true },
                        num: { value: item.num, visible: true },
                    })
                    arr2.push(item._key);
                    this.state.totalReadNum = this.state.totalReadNum + item.num;
                })
                let url = URI + "/account/logList";
                let reportData = {
                    pageType: 4,
                    type: this.state.resourceName,
                    startTime: 1542077307872,
                    endTime: this.state.endTime,
                    keyWord: this.state.keyword
                }
                getAJAX(url, reportData, function (res) {
                    arr1.map((item, index) => {
                        let arr1Index = res.data.findIndex((value, key, arr) => {
                            return value.hallName === item.hallName.value
                        })
                        if (arr1Index !== -1) {
                            item.pageNum = { value: res.data[arr1Index].num, visible: true };
                            that.state.totalPageNum = that.state.totalPageNum + res.data[arr1Index].num;
                        } else {
                            item.pageNum = { value: "", visible: true }
                        }
                    })
                    that.setState({
                        resourceArr: arr1,
                        resourceidArr: arr2,
                        totalPageNum: that.state.totalPageNum,
                        totalReadNum: that.state.totalReadNum,
                    });
                });

            } else {
                let arr = [];
                res.data.map((item, index) => {
                    if (item && item !== "") {
                        arr.push({
                            position: { longitude: item[0], latitude: item[1] },
                            //myIndex: index
                        })
                    }
                })
                this.setState({
                    userIpArr: arr,
                    userNum: res.totals
                });
            }
        }
    }
    changeTab(key) {
        this.state.tableKey = key;
        if (key !== "1" && key !== "3") {
            this.state.startTime = new Date().setHours(0, 0, 0, 0) - 86400 * 1000 * 9;
            this.state.endTime = new Date().setHours(0, 0, 0, 0) + 86400 * 1000;
        } else {
            this.state.startTime = "";
            this.state.endTime = "";
        }

        this.state.resourceName = "";
        this.state.current = 1;
        this.state.userIpArr = [];
        this.state.table = "全部"
        this.flashData(1, key);
    }
    inputChange(e) {
        const { name, value } = e.target;
        this.setState((prevState) => {
            prevState[name] = value;
            return prevState
        })
    }
    //去重并取数字
    getArrNum(arr, num) {
        let obj = {};
        let newArr = [];
        arr.map((item, index) => {
            if (num === 1) {
                if (obj[item.x]) {
                    obj[item.x] = obj[item.x] + item.y;
                } else {
                    obj[item.x] = item.y
                }
            } else {
                if (obj[item]) {
                    obj[item] = ++obj[item];
                } else {
                    obj[item] = 1
                }
            }
        })
        for (let key in obj) {
            newArr.push({ "x": key, "y": obj[key] });
        }
        return newArr
    }
    changeNum(length, page) {
        this.setState({
            length: length,
            current: page
        })
    }
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    // renderMarkerFn = (extData) => (
    //     <div style={markerStyle}>{extData.myIndex}</div>
    // );
    render() {

        return (
            <div>
                <Home chooseIndex="9" />
                <div className="right-container">
                    <div className="admin-container">
                        <Tabs activeKey={this.state.tableKey} onChange={(key) => { this.changeTab(key) }}>
                            <TabPane tab="网站访问统计" key="0" style={{ width: "100%" }}>
                                <div className="admin-div">
                                    <div style={{ display: "flex", lineHeight: "32px", textalign: "center" }}>
                                        <RangePicker onChange={(date, dateString) => { this.setState({ startTime: Date.parse(date[0]) - 86400 * 1000, endTime: Date.parse(date[1]) }) }} style={{ width: "400px", height: "32px" }} allowClear="true" />
                                        <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.flashData(1, this.state.tableKey); }}>查询</Button>
                                    </div>

                                    <Row style={{ overflow: "auto" }}>
                                        {/* <Col span={24} style={{ marginTop: 24 }}>
                                            <ChartCard
                                                title="用户访问量"
                                                total={this.state.logNum}
                                                contentHeight={250}
                                            >
                                                {<NumberInfo
                                                    subTitle={<span>本日访问</span>}
                                                    total={this.state.num}
                                                    status={this.state.num1 > 0 ? "up" : "down"}
                                                    subTotal={Math.abs(this.state.num1)}
                                                />}
                                                <MiniArea
                                                    line
                                                    height={45}
                                                    data={this.state.logArray}
                                                />
                                            </ChartCard>
                                        </Col> */}
                                        <Col span={24} style={{ marginTop: 24 }}>
                                            <ChartCard
                                                title="用户访问量"
                                                action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
                                                total={this.state.logNum}
                                                contentHeight={250}
                                            >
                                                <Bar
                                                    height={200}
                                                    title="访问趋势"
                                                    data={this.state.logArray}
                                                />
                                            </ChartCard>
                                        </Col>
                                        {/* <Col span={24} style={{ marginTop: 24 }}>
                                            <ChartCard
                                                title="用户搜索量"
                                                total={this.state.searchNum}
                                                contentHeight={250}
                                            >
                                                <MiniArea
                                                    line
                                                    height={45}
                                                    data={this.state.searchArray}
                                                />
                                            </ChartCard>
                                        </Col> */}
                                        <Col span={24} style={{ marginTop: 24 }}>
                                            <ChartCard
                                                title="用户搜索量"
                                                action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
                                                total={this.state.searchNum}
                                                contentHeight={250}
                                            >
                                                <Bar
                                                    height={200}
                                                    title="搜索趋势"
                                                    data={this.state.searchArray}
                                                />
                                            </ChartCard>
                                        </Col>
                                        <Col span={24} style={{ marginTop: 24 }}>
                                            <ChartCard
                                                title="用户登录量"
                                                action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
                                                total={this.state.loginNum}
                                                footer={<Field label="日登录量" value={this.state.num2} />}
                                                contentHeight={250}
                                            >
                                                <Bar
                                                    height={200}
                                                    title="登录趋势"
                                                    data={this.state.loginArray}
                                                />
                                            </ChartCard>
                                        </Col>
                                    </Row>
                                </div>

                            </TabPane>
                            <TabPane tab="资源发布统计" key="1" style={{ width: "100%", overflow: "auto" }}>
                                <div className="admin-div">
                                    <div style={{ display: "flex", lineHeight: "32px", textalign: "center" }}>
                                        <RangePicker onChange={(date, dateString) => { this.setState({ startTime: Date.parse(date[0]) - 86400 * 1000, endTime: Date.parse(date[1]) }) }} style={{ width: "400px", height: "32px" }} allowClear="true" />
                                        <Select style={{ marginLeft: "10px", marginBottom: "20px", minWidth: "200px" }} value={this.state.table} onChange={(value) => { this.setState({ table: value }) }}>
                                            {
                                                this.state.tableArr.map((item, index) => {
                                                    return (<Option value={item} key={index}>{item}</Option>)
                                                })
                                            }
                                        </Select>
                                        <Button style={{ width: "90px", height: "32px", marginLeft: "10px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.flashData(1, this.state.tableKey); }}>查询</Button>
                                        <Button style={{ height: "32px", backgroundColor: "#3B5998", color: "#fff", marginLeft: "10px" }}>
                                            <Link to="/batchHistory">详情查询</Link>
                                        </Button>
                                    </div>
                                    <Row style={{ overflow: "auto" }}>
                                        <Col span={24} style={{ marginTop: 24 }}>
                                            <ChartCard
                                                title={"元数据"}
                                                action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
                                                total={"上传总量: " + this.state.reportAllNum}
                                                footer={<Field label="日上传量" value={this.state.reportNum} />}
                                                contentHeight={550}
                                            >
                                                <Bar
                                                    height={500}
                                                    title="上传趋势"
                                                    data={this.state.reportArr}
                                                />
                                            </ChartCard>
                                        </Col>
                                    </Row>
                                </div>
                            </TabPane>
                            <TabPane tab="资源使用统计" key="2" style={{ width: "100%", overflow: "auto" }}>
                                <div className="admin-div">
                                    <RangePicker onChange={(date, dateString) => { this.setState({ startTime: Date.parse(date[0]) - 86400 * 1000, endTime: Date.parse(date[1]) }) }} style={{ width: "400px", height: "32px" }} allowClear="true" />
                                    <Select value={this.state.resourceName} style={{ marginLeft: "10px", width: "80px" }} placeholder="请选择" onChange={(value) => { this.setState({ resourceName: value }) }}>
                                        {this.state.resource.map((item, index) => {
                                            return (<Option value={item.resourceName} key={index}>{item.resourceName}</Option>)
                                        })
                                        }
                                    </Select>
                                    <Input type="text" autoComplete="off" placeholder="搜索" style={{ width: "190px", height: "32px", marginLeft: "10px" }} name="keyword" value={this.state.keyword} onChange={(e) => { this.inputChange(e) }} />
                                    <Button style={{ marginLeft: "10px", height: "32px", backgroundColor: "#6a5fac", color: "#fff" }} onClick={() => { this.flashData(1, this.state.tableKey); }}>搜索</Button>
                                    <Button style={{ marginLeft: "10px", height: "32px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.state.keyword = ""; this.state.startTime = ""; this.state.endTime = ""; this.state.resourceName = ""; this.flashData(1, this.state.tableKey); }}>重置</Button>
                                    <div style={{ fontSize: "18px", float: "right", height: "32px", lineHeight: "32px" }} >访问总数: {this.state.totalReadNum} , 阅读总页数: {this.state.totalPageNum}</div>
                                    <Table arr={this.state.resourceArr} arrName={this.state.resourceNameArr} id={this.state.resourceidArr} />
                                    {/* <Page page={this.state.current} totalNum={this.state.totalNum} pageNum={this.state.pageNum} flashData={this.flashData} changeNum={this.changeNum} /> */}
                                </div>

                            </TabPane>
                            <TabPane tab="用户ip地图" key="3" style={{ width: "100%" }}>
                                <div className="admin-div">
                                    <RangePicker onChange={(date, dateString) => { this.setState({ startTime: Date.parse(date[0]) - 86400 * 1000, endTime: Date.parse(date[1]) }) }} style={{ width: "400px", height: "32px", marginBottom: "20px" }} allowClear="true" />
                                    <Cascader options={cityArr} onChange={(value) => { this.setState({ region: value[0], city: value[1] }) }} style={{ marginLeft: "20px", marginBottom: "20px" }} placeholder="请选择省市" />
                                    <Button style={{ marginLeft: "10px", height: "32px", backgroundColor: "#6a5fac", color: "#fff" }} onClick={() => { this.flashData(1, this.state.tableKey); }}>搜索</Button>
                                    <Button style={{ marginLeft: "10px", height: "32px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.state.startTime = ""; this.state.endTime = ""; this.state.region = ""; this.state.city = ""; this.flashData(1, this.state.tableKey); }}>重置</Button>

                                    {/* <Button style={{ height: "32px", backgroundColor: "#6a5fac", color: "#fff", marginBottom: "10px" }} onClick={() => { if (this.state.userNum > this.state.current * 10) { this.setState({ current: this.state.current + 1 }); this.flashData(this.state.current + 1, this.state.tableKey); } }}>增加显示用户</Button>
                                &nbsp;&nbsp;当前显示{this.state.current * 10}个用户,共{this.state.userNum}个用户 */}

                                    <div style={{ width: '100%', height: 800 }}>
                                        <Map plugins={['ToolBar']} zoom={5}>
                                            <Markers
                                                markers={this.state.userIpArr}
                                                useCluster={true}
                                            // render={(extData) => { this.renderMarkerFn(extData) }}
                                            />
                                        </Map>
                                    </div>
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
            </div >
        )
    }
}
export default Report