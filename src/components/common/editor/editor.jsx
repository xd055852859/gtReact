import React, { Component } from 'react';
import { Button } from 'antd';
import './editor.css';
import jQuery from "jquery";
const $ = window.jQuery = jQuery;
var E = require('wangeditor')
class Editor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            str: "",
            moveState: false
        }
    }
    render() {
        return (
            <div >
                {/* onMouseEnter={(e) => { this.changeNode(e) }} */}
                <div id="eidtor" style={{ width: '100%', height: '500px', marginTop: '20px' }}></div>
                <Button style={{ width: "90px", height: "32px", backgroundColor: "#7A6FBE", color: "#fff" }} onClick={() => { this.props.save(this.editor.txt.html()) }}>提交</Button>
                <Button style={{ marginLeft: "10px", width: "90px", height: "32px", backgroundColor: "#658EAF", color: "#fff" }} onClick={() => { this.props.hideModal() }}>取消</Button>
            </div>
        );
    }
    componentDidMount() {
        var that = this
        var id = this.props.id;
        this.editor = new E("#eidtor");
        this.editor.customConfig.uploadImgShowBase64 = true;
        this.editor.create();
        // 初始化内容
        this.editor.txt.html(this.props.content);
        this.setState({
            str: this.props.content
        })

    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.content !== this.props.content ) {
            this.editor.txt.html(nextProps.content);
            this.state.moveState = false;
        }
    }
    // changeNode(e) {
    //     if (this.editor.txt.html() != this.state.str) {
    //         this.changeImg("img");
    //         this.changeImg("video");
    //     }
    // }
    // changeImg(node) {
    //     let that = this
    //     let editor = document.getElementById("editor");
    //     let nodes = editor.getElementsByTagName(node);
    //     if (nodes.length > 0) {
    //         for (let i = 0; i < nodes.length; i++) {
    //             nodes[i].onmousedown = function (e) {
    //                 that.state.flag = true
    //                 let offsetClientx = e.clientX;
    //                 let offsetClienty = e.clientY;
    //                 let width = nodes[i].offsetWidth;
    //                 let height = nodes[i].offsetHeight;
    //                 editor.onmousemove = (event) => {
    //                     if (that.state.flag) {
    //                         nodes[i].style.width = width + event.clientX - offsetClientx + "px";
    //                         nodes[i].style.height = height + event.clientY - offsetClienty + "px";
    //                     }
    //                 }
    //             }
    //             editor.onmouseup = function (e) {
    //                 that.state.flag = false
    //             }
    //         }
    //     }
    // }
}
export default Editor