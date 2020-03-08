import React, { Component } from 'react';
import { Icon, Checkbox, Modal } from 'antd';
import { URI } from '../../../data/data.js';
import './table.css';

class Table extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "",
            type: 0,
            visible: false,
            id: 0,
            caret: true
        }
    }
    hideModal() {
        this.setState({
            visible: false
        })
    }
    showModal(type, key, index) {
        this.setState({
            visible: false
        })
        switch (type) {
            case 1:
                this.props.updateData(key, index, "password")
                break;
            case 2:
                this.props.delData(key, index);
                break;
            case 3:
                this.props.updateData(key, index, "status")
                break;

            default:
        }
    }
    render() {
        const { arr, arrName, id, parentType, checkboxState, checkArr, checkAll, updateStatus, type, tableArr, lockArr, imgArr, sortArr, tableKey, realName } = this.props;
        // const { getFieldDecorator } = this.props.form;

        let arrs = arr.map((item, index) => {
            let items = [];
            if (checkboxState) {
                items.push(<td key={"check" + id[index]} style={{ width: "20px" }}><Checkbox checked={this.props.checkArr[index]} onChange={() => this.props.checkItem(1, id[index], index)}></Checkbox></td>)
            }
            for (let i in item) {
                if (item[i].visible) {
                    if (i !== "state" & i !== "avatar") {
                        if (item[i].linkState) {
                            items.push(<td key={i} style={{ minWidth: "120px" }}>
                                <a href={item[i].value} target="view_window">{item[i].name}</a>
                            </td>)
                            // }
                            // else if (item[i].bindState) {
                            //     items.push(<td key={i} style={{minWidth: "120px", maxWidth: 100 / Object.keys(item).length + "%" }}>
                            //         {item[i].bindState === "1" ?<Icon type="check" />:null}
                            //     </td>)
                        } else if (item[i].imgState) {
                            items.push(<td key={i} style={{ minWidth: "120px" }}>
                                <img src={item[i].value} style={{ height: "60px", marginTop: "5px", marginBottom: "5px" }} />
                            </td>)
                        } else if (item[i].fileState) {
                            let str = "";
                            items.push(<td key={i} style={{ minWidth: "120px", minheight: "80px" }}>
                                {item[i].value.split(',').map((fileValue, fileIndex) => {
                                    {
                                        str = realName[index] !== ""
                                            ? <a key={fileIndex} href={URI + "/upload?fileName=" + fileValue} style={{ minWidth: "120px" }} download={realName[index].split(',')[fileIndex]}>{realName[index].split(',')[fileIndex] + " "}</a>
                                            : <a key={fileIndex} href={URI + "/upload?fileName=" + fileValue} style={{ minWidth: "120px" }} download={fileValue}>{fileValue}</a>
                                    }
                                    return str
                                })}
                            </td>)
                        } else if (item[i].errorState) {
                            items.push(<td key={i} style={{ minWidth: "120px", minheight: "80px" }} onClick={() => { this.props.errLogList(id[index], index, 1) }}>
                                {item[i].value}</td>)
                        }
                        else if (item[i].imageState) {
                            items.push(<td key={i} style={{ minWidth: "200px", minheight: "80px" }} onClick={() => { this.props.bindList(id[index], index, 1, 0) }}>
                                {item[i].value}</td>)
                        }
                        else if (item[i].contentState) {
                            items.push(<td key={i} style={{ minWidth: "200px", minheight: "80px" }} onClick={() => { this.props.bindList(id[index], index, 1, 1) }}>
                                {item[i].value}</td>)
                        }
                        else {
                            if (item[i] && typeof item[i].value === "string" && item[i].value.indexOf("<") != -1) {
                                items.push(<td key={i} style={{ minWidth: "120px" }} dangerouslySetInnerHTML={{ __html: item[i].value }}></td>)
                            } else {
                                items.push(<td key={i} style={{ minWidth: "120px" }} >{item[i].value}</td>)
                            }

                        }

                    } else if (i !== "avatar") {
                        items.push(
                            parentType === "1" ?
                                (
                                    <td key={"td" + index} style={{ minWidth: "120px" }}>
                                        <Icon type="edit" style={{ color: "#337CBB", fontSize: "20px" }} onClick={() => { this.props.updatePasswordData(id[index], index) }} />
                                        <Icon type={lockArr[index] ? "unlock" : "lock"} style={{ marginLeft: "10px", color: "#337CBB", fontSize: "20px" }} onClick={() => { this.setState({ type: 3, visible: true, str: "是否修改冻结状态", title: "冻结用户", id: index }) }} />
                                        <Icon type="delete" style={{ marginLeft: "10px", color: "#F26E6C", fontSize: "20px" }} onClick={() => { this.setState({ type: 2, visible: true, str: "是否删除该管理员", title: "删除管理员", id: index }) }} />

                                    </td>)
                                : parentType === "2" ? (
                                    <td key={"td" + index} style={{ minWidth: "120px" }}>
                                        {tableKey != "8" ? <Icon type="edit" style={{ color: "#337CBB", fontSize: "20px" }} onClick={() => { this.props.updateData(id[index], index) }} /> : null}
                                        {tableKey == "1" ? <Icon type="profile" style={{ marginLeft: "10px", color: "#337CBB", fontSize: "20px" }} onClick={() => { this.props.connectUpdate(id[index], index) }} /> : null}
                                        <Icon type="delete" style={{ marginLeft: "10px", color: "#F26E6C", fontSize: "20px" }} onClick={() => { this.setState({ type: 2, visible: true, str: "是否删除该数据", title: "删除数据", id: index }) }} />
                                    </td>
                                )
                                    : parentType === "3" ? (
                                        item.state ?
                                            <td key={"td" + index} style={{ minWidth: "120px" }} align="left">
                                                <Icon type={lockArr[index] ? "lock" : "unlock"} style={{ marginLeft: "30%", color: "#337CBB", fontSize: "20px" }} onClick={() => { this.setState({ type: 3, visible: true, str: "是否修改冻结状态", title: "冻结用户", id: index }) }} />
                                                <Icon type="profile" style={{ marginLeft: "10px", color: "#337CBB", fontSize: "20px" }} onClick={() => { this.props.userLogList(id[index], index, 1) }} />
                                                {item["avatar"].value.length !== 0 ? <Icon type="picture" style={{ color: "#337CBB", fontSize: "20px", marginLeft: "10px" }} onClick={() => { this.props.showAvatar(id[index], item["avatar"].value, index) }} /> : ""}
                                            </td>
                                            : null
                                    ) : parentType === "4" ? (
                                        <td key={"td" + index} style={{ minWidth: "120px" }}>
                                            <img src="./images/check.png" style={{ height: "30px", width: "50px" }} alt="logo" className="user-avatar" onClick={() => { this.props.updateData(id[index], index) }} />
                                        </td>
                                    ) : parentType === "5" ? (
                                        <td key={"td" + index} style={{ minWidth: "120px" }}>
                                            <Icon type="edit" style={{ color: "#337CBB", fontSize: "20px" }} onClick={() => { this.props.updateData(id[index], index) }} />
                                            <Icon type="delete" style={{ marginLeft: "10px", color: "#F26E6C", fontSize: "20px" }} onClick={() => { this.setState({ type: 2, visible: true, str: "是否删除", title: "删除数据", id: index }) }} />
                                            <Icon type={lockArr[index] ? "lock" : "unlock"} style={{ marginLeft: "10px", color: "#337CBB", fontSize: "20px" }} onClick={() => { this.props.updateStatus(id[index], index) }} />
                                        </td>
                                    ) : parentType === "6" ? (
                                        <td key={"td" + index} style={{ minWidth: "120px" }}>
                                            <Icon type="delete" style={{ color: "#F26E6C", fontSize: "20px" }} onClick={() => { this.setState({ type: 2, visible: true, str: "是否删除该影像资料", title: "删除影像资料", id: index }) }} />
                                        </td>
                                    ) : parentType === "7" ? (
                                        <td key={"td" + index} style={{ minWidth: "120px" }}>
                                            <img src="./images/check.png" style={{ height: "30px", width: "50px" }} alt="logo" className="user-avatar" onClick={() => { this.props.updateData(id[index], index) }} />
                                        </td>)
                                                        : parentType === "8" ? (
                                                            <td key={"td" + index} style={{ minWidth: "140px" }} align="right">
                                                                {tableArr[index] ? 
                                                                <React.Fragment><Icon type="picture" style={{ color: "#337CBB", fontSize: "20px" }} onClick={() => { this.props.updateData(id[index], index, "photo") }} /> 
                                                                <Icon type="file-pdf" style={{ marginLeft: "10px", color: "#337CBB", fontSize: "20px" }} onClick={() => { this.props.updateData(id[index], index, "pdf") }} /></React.Fragment>: null}
                                                                <Icon type="edit" style={{ marginLeft: "10px", color: "#337CBB", fontSize: "20px" }} onClick={() => { this.props.updateData(id[index], index, "status") }} />
                                                                <Icon type="delete" style={{ marginLeft: "10px", color: "#F26E6C", fontSize: "20px", marginRight: "20%" }} onClick={() => { this.setState({ type: 2, visible: true, str: "是否删除该批次数据", title: "删除批次", id: index }) }} />
                                                            </td>
                                                        ) : null

                        )
                    }
                }
            }
            return (<tr key={index} className={index % 2 === 0 ? "admin-table-even" : ""} >
                {items}
            </tr>)
        })
        return (
            <table className="admin-table" cellSpacing="0" cellPadding="0">
                <tbody>
                    <tr className="admin-th">
                        {checkboxState ? <td><Checkbox checked={this.props.checkAll} onChange={() => this.props.checkItem(2)}></Checkbox></td> : null}
                        {
                            arrName.map((item, index) => {
                                return (<td key={"arr" + index} style={{ minWidth: "120px" }} onClick={sortArr && sortArr.length > 0 ? () => { this.setState({ caret: !this.state.caret }); this.props.changeSort(index) } : null}>{item}{
                                    sortArr && sortArr.length > 0 && sortArr[index] && sortArr[index].value === "1" ? <Icon type={sortArr[index].state ? "caret-up" : "caret-down"} style={{ marginLeft: "5px" }} /> : null}</td>)
                            })
                        }
                    </tr>
                    {arrs}
                </tbody>
                <Modal maskClosable={false}
                    title={this.state.title}
                    visible={this.state.visible}
                    onOk={() => { this.showModal(this.state.type, id[this.state.id], this.state.id) }}
                    onCancel={() => { this.hideModal() }}
                    okText="确认"
                    cancelText="取消"
                >
                    <p>{this.state.str}</p>
                </Modal>

            </table>
        )
    }
}
export default Table