import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { LocaleProvider, Progress, message, Modal, Input } from 'antd';
import io from 'socket.io-client';
import { SocketProvider } from 'socket.io-react'
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn'
import Login from './components/login/login';
import Admin from './components/admin/admin';
import User from './components/user/user';
import Role from './components/role/role';
import Data from './components/data/data';
import DataCheck from './components/datacheck/datacheck';
import News from './components/news/news';
import Given from './components/given/given';
import Home from './components/home/home';
import Audios from './components/audios/audios';
import Advice from './components/advice/advice';
import Reply from './components/reply/reply';
import Validword from './components/validword/validword';
import Report from './components/report/report';
import ImportData from './components/importData/importData';
import BatchHistory from './components/batchHistory/batchHistory';
import DataTable from './components/dataTable/dataTable';
import './App.css';
const socket = io.connect('http://192.168.1.101:8082');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ok: "active",
      titleProcess: 0,
      title: "",
      titleOk: "active",
      personProcess: 0,
      person: "",
      personOk: "active",
      state: false,
      allProcess: 0,
      allTitle: "",
      progressVisible: false,
      imageProcess: 0,
      image: "",
      imageOk: "active",
      docOk: "active",
      docProcess: 0,
      doc: "",
      importOk: "active",
      importProcess: 0,
      import: "",
      docVisible: false,
      pdfState:false,
      pdfProcess:0,
      pdfOk:"active"
    }
  }
  componentDidMount() {
    socket.on('connect', () => {
      console.log('已连接...', socket.id);
    })
    socket.on('disconnect', () => {
      console.log('已断开连接...', socket.id);
    })
    socket.on('mdbSaveOk', (msg) => {
      console.log('结束', msg);
      this.setState({
        ok: "success",
      })
      message.success("上传结束" + msg);
    })
    socket.on('mdbSaveINPROCESSTitle', (msg) => {
      console.log('进度', msg);
      this.setState({
        state: true,
        ok: "active",
        titleOk:"active",
        titleProcess: parseInt(msg),
        allProcess: parseInt(msg)
        // title: msg.split(":")[0]
      })
    })

    socket.on('mdbSaveINPROCESSPerson', (msg) => {
      console.log('进度', msg);
      this.setState({
        state: true,
        ok: "active",
        personOk:"active",
        personProcess: parseInt(msg),
        allProcess: parseInt(msg)
        // person: msg.split(":")[0]
      })
    })


    socket.on('bindImageOk', (msg) => {
      console.log('结束', msg);
      this.setState({
        imageOk: "success",
        ok:"success"
      })
      message.success("影像上传结束" + msg);
    })
    socket.on('bindImageINPROCESS', (msg) => {
      console.log('进度', msg);
      this.setState({
        state: true,
        imageOk: "active",
        ok: "active",
        imageProcess: parseInt(msg),
        allProcess: parseInt(msg)
        // title: msg.split(":")[0]
      })
    })

    socket.on('bindDocOk', (msg) => {
      console.log('结束', msg);
      this.setState({
        docOk: "success",
        ok:"success"
      })
      message.success("全文上传结束" + msg);
    })

    socket.on('bindDocINPROCESS', (msg) => {
      console.log('进度', msg);
      this.setState({
        state: true,
        docOk: "active",
        ok: "active",
        docProcess: parseInt(msg),
        allProcess: parseInt(msg)
        // person: msg.split(":")[0]
      })
    })
    socket.on('importOk', (msg) => {
      console.log('结束', msg);
      this.setState({
        importOk: "success",
        ok:"success"
      })
      message.success("谱系数据上传结束" + msg);
    })
    socket.on('importINPROCESS', (msg) => {
      console.log('进度', msg);
      this.setState({
        state: true,
        importOk: "active",
        ok: "active",
        importProcess: parseInt(msg),
        allProcess: parseInt(msg)
        // title: msg.split(":")[0]
      })
    })
    socket.on('pdf2PngINPROCESS', (msg) => {
      console.log('进度', msg);
      this.setState({
        pdfState: true,
        pdfOk: "active",
        pdfProcess: parseInt(msg)
        // person: msg.split(":")[0]
      })
    })
    
    socket.on('pdf2PngOk ', (msg) => {
      console.log('结束', msg);
      this.setState({
        pdfState: false,
        pdfOk: "success",
      })
      message.success("pdf转换结束" + msg);
    })
  }

  render() {

    return (
      <SocketProvider socket={socket} >
        <LocaleProvider locale={zh_CN}>
          <div style={{ height: "100%", width: "100%" }}>
            {this.state.state ?
              <Progress type="circle" style={{ position: "fixed", bottom: "70px", right: "36px", zIndex: "5" }} percent={this.state.allProcess} width={80} status={this.state.ok} onClick={() => { this.setState({ progressVisible: true }) }} />
              : null
            }
            {this.state.pdfState ?
              <Progress type="circle" style={{ position: "fixed", bottom: "70px", right: "36px", zIndex: "5" }} percent={this.state.pdfProcess} width={80} status={this.state.pdfOk} />
              : null
            }
            <Modal maskClosable={false} okText="关闭弹窗" cancelText="关闭进度圈" title="上传信息" visible={this.state.progressVisible}
              bodyStyle={{ height: "300px" }}
              onOk={() => { this.setState({ progressVisible: false }) }}
              onCancel={() => { this.setState({ progressVisible: false, state: false, titleProcess: 0, personProcess: 0, allProcess: 0,importProcess:0, ok: "active", imageProcess: 0, docProcess: 0, imageOk: "active", docOk: "active" ,importOk:"active"}) }} >
              <div style={{ marginbottom: "40px" }}>title :<Progress percent={this.state.titleProcess} size="small" status={this.state.titleOk} style={{ width: "80%" }} /></div>
              <div style={{ marginbottom: "40px" }}>person:<Progress percent={this.state.personProcess} size="small" status={this.state.personOk} style={{ width: "80%" }} /></div>
              <div style={{ marginbottom: "40px" }}>image :<Progress percent={this.state.imageProcess} size="small" status={this.state.imageOk} style={{ width: "80%" }} /></div>
              <div style={{ marginbottom: "40px" }}>doc&nbsp; :<Progress percent={this.state.docProcess} size="small" status={this.state.docOk} style={{ width: "80%" }} /></div>
              <div style={{ marginbottom: "40px" }}>import:<Progress percent={this.state.importProcess} size="small" status={this.state.importOk} style={{ width: "80%" }} /></div>
            </Modal>
            <BrowserRouter>
              <div style={{ height: "100%", width: "100%" }}>
                <Route exact path="/" component={Login} />
                <Route path="/home" component={Home} />
                <Route path="/admin" component={Admin} />
                <Route path="/user" component={User} />
                <Route path="/role" component={Role} />
                <Route path="/data" component={Data} />
                <Route path="/datacheck" component={DataCheck} />
                <Route path="/news" component={News} />
                <Route path="/advice" component={Advice} />
                <Route path="/reply" component={Reply} />
                <Route path="/validword" component={Validword} />
                <Route path="/report" component={Report} />
                <Route path="/given" component={Given} />
                <Route path="/audios" component={Audios} />
                <Route path="/importData" component={ImportData} />
                <Route path="/batchHistory" component={BatchHistory} />
                <Route path="/dataTable" component={DataTable} />
              </div>
            </BrowserRouter>
          </div>
        </LocaleProvider>
      </SocketProvider >
    );
  }
}

export default App;
