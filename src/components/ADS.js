import axios from 'axios';
import jQuery from "jquery";
const $ = window.jQuery = jQuery;
var getLocalTime = function (nS, symbol, index) {
    var date = new Date(nS),
        Y, M, D, h, m, s;
    Y = date.getFullYear() + symbol;
    M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + symbol;
    D = date.getDate() + ' ';
    h = date.getHours() + ':';
    m = date.getMinutes() + ':';
    s = date.getSeconds();
    switch (index) {
        case 1:
            return (Y + M + D);          
        case 2:
            return (Y + M);     
        case 3:
            return (M + D);   
        case 4:
            return (h + m + s);
        default:return;
    }
};
var getCharLength = function (str) {
    return str.replace(/[\u0391-\uFFE5]/g, "aa").length;
};
var substrAndReplaceToEllipsis = function (str, num) {
    var l = getCharLength(str),
        chars = '';
    if (l >= num) {
        chars = (str.substring(0, num) + '...');
    } else {
        chars = str;
    }
    return chars;
};
var getAJAX = function (url, body, callback) {
    $.ajax({
        type: "GET",
        url: url,
        data: body,
        success: function (res) {
            callback(res);
        }
    });
};
var getJSON = function (url, callback) {
    axios.get(url)
        .then(function (response) {
            callback(response);
        })
        .catch(function (error) {
            console.log(error);
        });
};
var postJSON = function (url, body, callback) {
    axios.post(url, body)
        .then(function (response) {
            //console.log(response);
            callback(response);
        })
        .catch(function (error) {
            console.log(error);
        });
}
var patchJSON = function (url, body, callback) {
    axios.patch(url, body)
        .then(function (response) {
            //console.log(response);
            callback(response);
        })
        .catch(function (error) {
            console.log(error);
        });
}
var deleteJSON = function (url, body, callback) {
    axios.delete(url, body)
        .then(function (response) {
            //console.log(response);
            callback(response);
        })
        .catch(function (error) {
            console.log(error);
        });
}
var deleteUrl = function (url, callback) {
    axios.delete(url)
        .then(function (response) {
            //console.log(response);
            callback(response);
        })
        .catch(function (error) {
            console.log(error);
        });
}
var GetRandomNum = function (Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.floor(Rand * Range));
};
var updateMap = function (data, map, infoWindow, AMap) {
    map.clearMap();
    var datas = data,
        marker, markers = [],
        cluster;
    for (var i = 0; i < datas.length; i++) {
        datas[i].location[0] = datas[i].location[0] + GetRandomNum(1, 9999) * 0.00001;
        datas[i].location[1] = datas[i].location[1] + GetRandomNum(1, 9999) * 0.00001;
    }

    //循环获取所有点的值
    for (var f = 0; f < datas.length; f++) {
        //添加点
        marker = new AMap.Marker({
            icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
            position: datas[f].location,
            title: datas[f].title
        });
        //给marker绑定事件
        var div = "<a href='./genealogySummary.html?" + datas[f]._id + "' style='overflow:hidden,display:block,position:relative' target='_blank'><img src='./images/cover.jpg' style='width:100px;height:150px;float:left' /><div class='gtitleBox'>" + (datas[f].title ? datas[f].title : '不详') + "</div><div style='float:left;width:180px;height:150px;color:#777;padding-left:10px'><p style='font-size:16px;color:#333;margin-bottom:10px'>" + (datas[f].title ? datas[f].title : '不详') + "</p><span>责任者：" + (datas[f].author ? datas[f].author : '不详') + "</span><span style='display:block;overflow:hidden'>版本：" + (datas[f].version ? datas[f].version : '不详') + "</span><span style='display:block'>谱籍地：" + (datas[f].place ? datas[f].place : '不详') + "</span><span>堂号：" + (datas[f].tanghao ? datas[f].tanghao : '不详') + "</span></div></a>";

        marker.content = div;
        marker.on('click', function (e) {
            infoWindow.setContent(e.target.content);
            infoWindow.open(map, e.target.getPosition());
        });
        // marker.setMap(map);

        markers.push(marker);
    }

    //点聚合
    if (cluster) {
        cluster.setMap(null);
    }
    cluster = new AMap.MarkerClusterer(map, markers, {
        gridSize: 80
    });
};

function switchType(type) {
    switch (type) {
        case '家谱':
            return 'red';
        case '寻根':
            return 'gold';
        case '委托查询':
            return 'green';
        case '文献复制':
            return 'cyan';
        case '阅读服务':
            return 'purple';
        default:
            return;
    }
}
export {
    getLocalTime,
    getCharLength,
    substrAndReplaceToEllipsis,
    getJSON,
    postJSON,
    deleteJSON,
    GetRandomNum,
    updateMap,
    switchType,
    patchJSON,
    deleteUrl,
    getAJAX
};