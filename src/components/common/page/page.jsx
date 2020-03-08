import React, { Component } from 'react';
import { Pagination, Select } from 'antd';
import './page.css';
const Option = Select.Option;
class Page extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 1,
            length: 10
        }
    }
   
    changePage(page) {
        this.setState({
            current: page
        });
        this.props.flashData(page, this.state.length, this.props.type);
        this.props.changeNum(this.state.length, page);
    }
    numChange(value) {
        this.setState({
            length: parseInt(value)
        });
        this.props.flashData(this.state.current, parseInt(value), this.props.type);
        this.props.changeNum(value, this.state.current);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.page != this.props.page) {
            this.setState({
                current: nextProps.page,
                totalNum: nextProps.totalNum,
                pageNum: nextProps.pageNum
            })
        }
    }
    render() {
        return (
            <div className="admin-page">
                <div>显示第 {(this.state.current - 1) * this.state.length + 1} 到第 {this.state.current * this.state.length} 条记录，总共 {this.props.totalNum} 条记录 每页显示
                <Select value={this.state.length} placeholder="请选择" onChange={(value) => { this.numChange(value) }}>
                        <Option value="10">10</Option>
                        <Option value="30">30</Option>
                        <Option value="50">50</Option>
                        <Option value="100">100</Option>
                    </Select>条记录</div>
                <Pagination defaultCurrent={1} current={this.state.current} total={this.props.pageNum * 10} onChange={(page) => { this.changePage(page) }} />
            </div>
        )
    }
}
export default Page